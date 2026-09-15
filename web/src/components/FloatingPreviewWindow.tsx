import { useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { createPortal } from 'react-dom'

const WINDOW_BG = '#1e1f1c'
const TITLEBAR_BG = '#272822'
const BORDER = '#3e3d32'
const TEXT_MUTED = '#8b8a85'
const TEXT = '#f8f8f2'

/** Gap kept between the window and the viewport edge — also what "Full" maxes out to. */
const WINDOW_MARGIN = 12

interface Size {
  width: number
  height: number
}
interface Pos {
  x: number
  y: number
}

function clampToViewport(pos: Pos, size: Size): Pos {
  const margin = WINDOW_MARGIN
  return {
    x: Math.min(Math.max(margin, pos.x), Math.max(margin, window.innerWidth - size.width - margin)),
    y: Math.min(Math.max(margin, pos.y), Math.max(margin, window.innerHeight - size.height - margin)),
  }
}

interface ResizeEdges {
  n?: boolean
  s?: boolean
  e?: boolean
  w?: boolean
}

interface SizePreset {
  key: string
  label: string
  width: number
  height: number
}

/** Sizes are fractions of the *current* viewport, not fixed device pixel dimensions — they scale with whatever screen this is running on. */
function computeSizePresets(): SizePreset[] {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const base = Math.min(vw, vh)

  const full = { width: Math.round(vw - WINDOW_MARGIN * 2), height: Math.round(vh - WINDOW_MARGIN * 2) }

  const mobileHeight = base * 0.7
  const mobile = { width: Math.round(mobileHeight * (9 / 19.5)), height: Math.round(mobileHeight) }

  const tabletPortraitHeight = base * 0.85
  const tabletPortrait = { width: Math.round(tabletPortraitHeight * (3 / 4)), height: Math.round(tabletPortraitHeight) }

  const tabletLandscapeWidth = base * 0.85
  const tabletLandscape = { width: Math.round(tabletLandscapeWidth), height: Math.round(tabletLandscapeWidth * (3 / 4)) }

  return [
    { key: 'full', label: 'Full', ...full },
    { key: 'tablet-portrait', label: 'Tablet Portrait', ...tabletPortrait },
    { key: 'tablet-landscape', label: 'Tablet Landscape', ...tabletLandscape },
    { key: 'mobile', label: 'Mobile', ...mobile },
  ]
}

export function FloatingPreviewWindow({
  visible,
  srcDoc,
  runToken,
  onClose,
  onIframeLoad,
  iframeRef,
}: {
  visible: boolean
  srcDoc: string
  runToken: number
  onClose: () => void
  onIframeLoad: () => void
  iframeRef: React.RefObject<HTMLIFrameElement | null>
}) {
  const [pos, setPos] = useState<Pos>({ x: 96, y: 96 })
  const [size, setSize] = useState<Size>({ width: 480, height: 360 })
  const [interacting, setInteracting] = useState(false)
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false)
  const [sizePresets, setSizePresets] = useState<SizePreset[]>([])
  const hasPositionedRef = useRef(false)

  // The first time the window opens, place it centered on the middle third of the screen's width,
  // full height — not tied to the IDE pane's own layout.
  useEffect(() => {
    if (!visible || hasPositionedRef.current) return
    hasPositionedRef.current = true

    const width = Math.max(280, Math.round(window.innerWidth / 3))
    const height = Math.max(200, window.innerHeight - WINDOW_MARGIN * 2)
    const x = Math.round((window.innerWidth - width) / 2)
    const y = WINDOW_MARGIN

    setSize({ width, height })
    setPos(clampToViewport({ x, y }, { width, height }))
  }, [visible])

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; origW: number; origH: number } | null>(
    null,
  )
  const resizeRef = useRef<{
    startX: number
    startY: number
    origX: number
    origY: number
    origW: number
    origH: number
    edges: ResizeEdges
  } | null>(null)
  const sizeMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sizeMenuOpen) return
    function onDocMouseDown(e: globalThis.MouseEvent) {
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(e.target as Node)) {
        setSizeMenuOpen(false)
      }
    }
    // A click inside the preview iframe fires in a different document, so it never reaches this
    // document's mousedown listener. But clicking into an iframe does shift focus into it, which
    // fires `blur` on the parent window and leaves the <iframe> as document.activeElement — that's
    // the standard way to detect "something outside was clicked" across a frame boundary.
    function onWindowBlur() {
      if (document.activeElement === iframeRef.current) {
        setSizeMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    window.addEventListener('blur', onWindowBlur)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      window.removeEventListener('blur', onWindowBlur)
    }
  }, [sizeMenuOpen, iframeRef])

  useEffect(() => {
    const margin = WINDOW_MARGIN
    function onMouseMove(e: globalThis.MouseEvent) {
      if (dragRef.current) {
        const d = dragRef.current
        const minWidth = 280
        const minHeight = 200
        const leftBound = margin
        const rightBound = window.innerWidth - margin
        const topBound = margin
        const bottomBound = window.innerHeight - margin

        const rawX = d.origX + (e.clientX - d.startX)
        const rawY = d.origY + (e.clientY - d.startY)

        // Normal drag just moves the window. But once an edge is already pinned against the
        // viewport border, continuing to push the titlebar further into that border has nowhere
        // left to go — so instead of stopping dead, the push squeezes the window narrower/shorter
        // from that side, like pressing it against a wall. Works whether this is a fresh drag that
        // starts already pinned, or a drag that runs into the wall mid-gesture.
        // A buffer means the squeeze doesn't engage the instant you touch the wall — you have to
        // keep pushing past it first, so bumping into a border doesn't accidentally shrink things.
        const squeezeBuffer = 40

        let x = rawX
        let width = d.origW
        if (rawX < leftBound) {
          const overflow = leftBound - rawX
          x = leftBound
          if (overflow > squeezeBuffer) {
            width = Math.max(minWidth, d.origW - (overflow - squeezeBuffer))
          }
        } else if (rawX + d.origW > rightBound) {
          const overflow = rawX + d.origW - rightBound
          if (overflow > squeezeBuffer) {
            width = Math.max(minWidth, d.origW - (overflow - squeezeBuffer))
          }
          x = rightBound - width
        }

        let y = rawY
        let height = d.origH
        if (rawY < topBound) {
          // The top border is a hard stop, not a squeeze — the titlebar has to stay reachable.
          y = topBound
        } else if (rawY + d.origH > bottomBound) {
          const overflow = rawY + d.origH - bottomBound
          if (overflow > squeezeBuffer) {
            height = Math.max(minHeight, d.origH - (overflow - squeezeBuffer))
          }
          y = bottomBound - height
        }

        setPos({ x, y })
        setSize({ width, height })
      } else if (resizeRef.current) {
        const r = resizeRef.current
        const dx = e.clientX - r.startX
        const dy = e.clientY - r.startY
        const minWidth = 280
        const minHeight = 200

        let width = r.origW
        let x = r.origX
        if (r.edges.e) {
          // The viewport edge is a hard ceiling — never inflate it past what's actually there,
          // even if that's below minWidth (a window pinned in a tight corner just can't grow).
          const maxWidth = window.innerWidth - r.origX - margin
          width = Math.min(maxWidth, Math.max(minWidth, r.origW + dx))
        } else if (r.edges.w) {
          const rightEdge = r.origX + r.origW
          const maxWidth = rightEdge - margin
          width = Math.min(maxWidth, Math.max(minWidth, r.origW - dx))
          x = rightEdge - width
        }

        let height = r.origH
        let y = r.origY
        if (r.edges.s) {
          const maxHeight = window.innerHeight - r.origY - margin
          height = Math.min(maxHeight, Math.max(minHeight, r.origH + dy))
        } else if (r.edges.n) {
          const bottomEdge = r.origY + r.origH
          const maxHeight = bottomEdge - margin
          height = Math.min(maxHeight, Math.max(minHeight, r.origH - dy))
          y = bottomEdge - height
        }

        setSize({ width, height })
        setPos({ x, y })
      }
    }
    function onMouseUp() {
      dragRef.current = null
      resizeRef.current = null
      setInteracting(false)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const startDrag = (e: ReactMouseEvent) => {
    e.preventDefault()
    setInteracting(true)
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, origW: size.width, origH: size.height }
  }

  const startResize = (edges: ResizeEdges) => (e: ReactMouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setInteracting(true)
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      origW: size.width,
      origH: size.height,
      edges,
    }
  }

  const applyPreset = (width: number, height: number) => {
    const clampedSize = {
      width: Math.min(width, window.innerWidth - WINDOW_MARGIN * 2),
      height: Math.min(height, window.innerHeight - WINDOW_MARGIN * 2),
    }
    setSize(clampedSize)
    setPos((p) => clampToViewport(p, clampedSize))
  }

  if (!visible) return null

  return createPortal(
    <div
      className="fixed z-[1000] flex select-none flex-col overflow-hidden rounded-xl shadow-2xl"
      style={{ left: pos.x, top: pos.y, width: size.width, height: size.height, background: WINDOW_BG, border: `1px solid ${BORDER}` }}
    >
      <div
        onMouseDown={startDrag}
        className="flex shrink-0 cursor-move items-center justify-between gap-2 px-3 py-2"
        style={{ background: TITLEBAR_BG, borderBottom: `1px solid ${BORDER}` }}
      >
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          title="Close"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={{ background: '#f92672', color: TITLEBAR_BG }}
        >
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
            <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span className="flex-1 truncate text-center font-mono text-[11px]" style={{ color: TEXT_MUTED }}>
          Preview
        </span>
        <div className="relative shrink-0" ref={sizeMenuRef}>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              setSizePresets(computeSizePresets())
              setSizeMenuOpen((o) => !o)
            }}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors"
            style={{ background: sizeMenuOpen ? '#4d4c40' : BORDER, color: TEXT }}
          >
            Size
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className="relative top-[0.5px] transition-transform"
              style={{ transform: sizeMenuOpen ? 'rotate(180deg)' : undefined }}
            >
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {sizeMenuOpen && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute right-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-lg shadow-xl"
              style={{ background: WINDOW_BG, border: `1px solid ${BORDER}` }}
            >
              {sizePresets.map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => {
                    applyPreset(preset.width, preset.height)
                    setSizeMenuOpen(false)
                  }}
                  className="block w-full px-3 py-2 text-left text-[11px] font-medium transition-colors hover:bg-[#3e3d32]"
                  style={{ color: TEXT }}
                >
                  {preset.label}
                  <span className="ml-1" style={{ color: TEXT_MUTED }}>
                    ({preset.width} × {preset.height})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <iframe
          key={runToken}
          ref={iframeRef}
          title="preview"
          srcDoc={srcDoc}
          onLoad={onIframeLoad}
          sandbox="allow-same-origin"
          className="h-full w-full bg-white"
        />
        {/* Captures the mouse while dragging/resizing so the iframe never steals events. */}
        {interacting && <div className="absolute inset-0" />}
      </div>

      {/* Edges */}
      <div onMouseDown={startResize({ n: true })} className="absolute inset-x-3 top-0 h-1.5 cursor-ns-resize" />
      <div onMouseDown={startResize({ s: true })} className="absolute inset-x-3 bottom-0 h-1.5 cursor-ns-resize" />
      <div onMouseDown={startResize({ w: true })} className="absolute inset-y-3 left-0 w-1.5 cursor-ew-resize" />
      <div onMouseDown={startResize({ e: true })} className="absolute inset-y-3 right-0 w-1.5 cursor-ew-resize" />
      {/* Corners */}
      <div onMouseDown={startResize({ n: true, w: true })} className="absolute left-0 top-0 h-3 w-3 cursor-nwse-resize" />
      <div onMouseDown={startResize({ n: true, e: true })} className="absolute right-0 top-0 h-3 w-3 cursor-nesw-resize" />
      <div onMouseDown={startResize({ s: true, w: true })} className="absolute bottom-0 left-0 h-3 w-3 cursor-nesw-resize" />
      <div onMouseDown={startResize({ s: true, e: true })} className="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize" />
    </div>,
    document.body,
  )
}
