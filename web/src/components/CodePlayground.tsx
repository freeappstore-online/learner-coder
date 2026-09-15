import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { CheckOutcome, Exercise, RunResult } from '../types'
import { runJsCode, runPythonCode } from '../lib/sandbox'
import type { EditorLanguage } from './CodeEditor'
import { FloatingPreviewWindow } from './FloatingPreviewWindow'

// Monaco is a multi-MB dependency — load it only once a lesson's coding exercise actually
// renders, not as part of the app's initial bundle.
const CodeEditor = lazy(() => import('./CodeEditor'))

interface PendingCssCheck {
  code: string
  html: string
}

const FILE_NAME: Record<Exercise['type'], string> = {
  html: 'index.html',
  css: 'style.css',
  js: 'script.js',
  python: 'main.py',
}

const EDITOR_LANGUAGE: Record<Exercise['type'], EditorLanguage> = {
  html: 'html',
  css: 'css',
  js: 'javascript',
  python: 'python',
}

const RESET_POPOVER_WIDTH = 256
const RESET_POPOVER_VIEWPORT_MARGIN = 12
const RESET_POPOVER_ARROW_SIZE = 12

// The app's own surface/border/ink tokens, not the dark Monokai IDE palette — so the popover reads
// as a brighter card against the dark toolbar, in whichever light/dark theme the user has chosen.
const RESET_POPOVER = {
  bg: 'var(--surface)',
  border: 'var(--border)',
  text: 'var(--ink)',
}

// Monokai palette — the IDE pane always looks like this, independent of the app's own light/dark theme.
const MONOKAI = {
  bg: '#272822',
  bgRaised: '#1e1f1c',
  border: '#3e3d32',
  text: '#f8f8f2',
  muted: '#8b8a85',
  green: '#a6e22e',
  pink: '#f92672',
}

export function CodePlayground({
  exercise,
  alreadyPassed,
  onPass,
}: {
  exercise: Exercise
  alreadyPassed: boolean
  onPass: () => void
}) {
  const [code, setCode] = useState(exercise.starterCode)
  const [result, setResult] = useState<RunResult | null>(null)
  const [outcome, setOutcome] = useState<CheckOutcome | null>(
    alreadyPassed ? { pass: true, message: 'Already completed — feel free to keep tinkering.' } : null,
  )
  const [previewDoc, setPreviewDoc] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [runToken, setRunToken] = useState(0)
  const [pyLoading, setPyLoading] = useState(false)
  const [confirmResetOpen, setConfirmResetOpen] = useState(false)
  const [resetPopoverPos, setResetPopoverPos] = useState({ top: 0, left: 0, arrowLeft: 0 })

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const pendingCssCheck = useRef<PendingCssCheck | null>(null)
  const resetPopoverRef = useRef<HTMLDivElement>(null)
  const resetBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!confirmResetOpen) return
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target as Node
      // The Reset button toggles the popover itself on click — if this listener also closed it on
      // the button's mousedown, the click's own toggle would immediately reopen it right after.
      if (resetBtnRef.current?.contains(target)) return
      if (resetPopoverRef.current && !resetPopoverRef.current.contains(target)) {
        setConfirmResetOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [confirmResetOpen])

  const finalize = (next: CheckOutcome) => {
    setOutcome(next)
    if (next.pass) onPass()
  }

  const handleRun = async () => {
    setOutcome(null)

    if (exercise.type === 'js') {
      const res = runJsCode(code)
      setResult(res)
      finalize(exercise.check({ code, result: res }))
      return
    }

    if (exercise.type === 'python') {
      setPyLoading(true)
      const res = await runPythonCode(code)
      setPyLoading(false)
      setResult(res)
      finalize(exercise.check({ code, result: res }))
      return
    }

    if (exercise.type === 'html') {
      const res: RunResult = { html: code }
      setResult(res)
      setPreviewDoc(code)
      setPreviewOpen(true)
      setRunToken((t) => t + 1)
      finalize(exercise.check({ code, result: res }))
      return
    }

    // css: needs the live DOM to read computed styles, so defer the check to iframe onLoad.
    const html = `<style>${code}</style>\n${exercise.previewMarkup ?? ''}`
    pendingCssCheck.current = { code, html }
    setResult({ html })
    setPreviewDoc(html)
    setPreviewOpen(true)
    setRunToken((t) => t + 1)
  }

  const handleIframeLoad = () => {
    const pending = pendingCssCheck.current
    if (!pending) return
    pendingCssCheck.current = null
    finalize(exercise.check({ code, result: { html: pending.html }, iframe: iframeRef.current }))
  }

  const reset = () => {
    setCode(exercise.starterCode)
    setOutcome(null)
    setResult(null)
    setPreviewDoc(null)
    setPreviewOpen(false)
  }

  const isPreview = exercise.type === 'html' || exercise.type === 'css'

  const openResetPopover = () => {
    const btn = resetBtnRef.current
    if (!btn) return
    const r = btn.getBoundingClientRect()
    const btnCenter = r.left + r.width / 2

    // Center under the button by default, but slide inward if that would push either edge past
    // the viewport — then re-point the arrow at the button's true center from wherever the box
    // actually landed.
    const idealLeft = btnCenter - RESET_POPOVER_WIDTH / 2
    const maxLeft = window.innerWidth - RESET_POPOVER_WIDTH - RESET_POPOVER_VIEWPORT_MARGIN
    const left = Math.min(Math.max(idealLeft, RESET_POPOVER_VIEWPORT_MARGIN), Math.max(RESET_POPOVER_VIEWPORT_MARGIN, maxLeft))
    const top = r.bottom + 12

    const arrowInset = RESET_POPOVER_ARROW_SIZE
    const arrowLeft = Math.min(
      Math.max(btnCenter - left - RESET_POPOVER_ARROW_SIZE / 2, arrowInset),
      RESET_POPOVER_WIDTH - RESET_POPOVER_ARROW_SIZE - arrowInset,
    )

    setResetPopoverPos({ top, left, arrowLeft })
    setConfirmResetOpen((o) => !o)
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col" style={{ background: MONOKAI.bg }}>
      {/* Toolbar */}
      <div
        className="flex shrink-0 items-center justify-between border-b px-4 py-2"
        style={{ borderColor: MONOKAI.border, background: MONOKAI.bgRaised }}
      >
        <span className="font-mono text-xs" style={{ color: MONOKAI.muted }}>
          {FILE_NAME[exercise.type]}
        </span>
        <div className="flex gap-2">
          <div className="relative">
            <button
              ref={resetBtnRef}
              onClick={openResetPopover}
              className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: MONOKAI.border, color: MONOKAI.text }}
            >
              Reset
            </button>
            {confirmResetOpen && (
              // Fixed-positioned in viewport pixels (computed in openResetPopover) rather than
              // CSS-centered under the button, so it can slide inward when centering would push
              // it past the screen edge — the arrow re-points at the button either way.
              <div
                ref={resetPopoverRef}
                className="fixed z-20"
                style={{ top: resetPopoverPos.top, left: resetPopoverPos.left, width: RESET_POPOVER_WIDTH }}
              >
                <div className="relative rounded-lg p-3 shadow-xl" style={{ background: RESET_POPOVER.bg, border: `1px solid ${RESET_POPOVER.border}` }}>
                  <p className="text-xs leading-relaxed" style={{ color: RESET_POPOVER.text }}>
                    Are you sure? This will remove your code and reset to template code.
                  </p>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => setConfirmResetOpen(false)}
                      className="rounded-md px-2.5 py-1 text-xs font-semibold"
                      style={{ color: RESET_POPOVER.text }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setConfirmResetOpen(false)
                        reset()
                      }}
                      className="rounded-md px-2.5 py-1 text-xs font-semibold"
                      style={{ background: MONOKAI.pink, color: '#ffffff' }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
                {/* Rendered after the box so it paints on top, covering the segment of the box's
                    own top border directly beneath it — otherwise that border draws a seam line
                    right across the arrow where it meets the box. */}
                <div
                  className="absolute -top-1.5 rotate-45"
                  style={{
                    left: resetPopoverPos.arrowLeft,
                    height: RESET_POPOVER_ARROW_SIZE,
                    width: RESET_POPOVER_ARROW_SIZE,
                    background: RESET_POPOVER.bg,
                    borderLeft: `1px solid ${RESET_POPOVER.border}`,
                    borderTop: `1px solid ${RESET_POPOVER.border}`,
                  }}
                />
              </div>
            )}
          </div>
          <button
            onClick={handleRun}
            disabled={pyLoading}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
            style={{ background: MONOKAI.green, color: MONOKAI.bgRaised }}
          >
            {pyLoading ? 'Starting Python…' : '▶ Run'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="min-h-0 flex-1">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center text-xs" style={{ color: MONOKAI.muted }}>
              Loading editor…
            </div>
          }
        >
          <CodeEditor value={code} onChange={setCode} language={EDITOR_LANGUAGE[exercise.type]} />
        </Suspense>
      </div>

      {pyLoading && (
        <p className="shrink-0 border-t px-4 py-2 text-xs" style={{ borderColor: MONOKAI.border, color: MONOKAI.muted, background: MONOKAI.bg }}>
          Downloading the Python runtime for the first time — this only happens once per session.
        </p>
      )}

      {/* Preview renders in a floating, draggable/resizable window instead of docked inline. */}
      {isPreview && (
        <FloatingPreviewWindow
          visible={previewOpen && previewDoc !== null}
          srcDoc={previewDoc ?? ''}
          runToken={runToken}
          onClose={() => setPreviewOpen(false)}
          onIframeLoad={handleIframeLoad}
          iframeRef={iframeRef}
        />
      )}

      {exercise.type === 'js' && result && (
        <div className="max-h-40 shrink-0 overflow-y-auto border-t" style={{ borderColor: MONOKAI.border }}>
          <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide" style={{ background: MONOKAI.bgRaised, color: MONOKAI.muted }}>
            Console
          </div>
          <pre className="whitespace-pre-wrap px-4 py-2 font-mono text-[13px]" style={{ color: MONOKAI.text }}>
            {result.logs && result.logs.length > 0 ? result.logs.join('\n') : '(no output)'}
          </pre>
          {result.error && (
            <p className="px-4 pb-2 text-sm font-medium" style={{ color: MONOKAI.pink }}>
              {result.error}
            </p>
          )}
        </div>
      )}

      {exercise.type === 'python' && result && (
        <div className="max-h-40 shrink-0 overflow-y-auto border-t" style={{ borderColor: MONOKAI.border }}>
          <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide" style={{ background: MONOKAI.bgRaised, color: MONOKAI.muted }}>
            Output
          </div>
          <pre className="whitespace-pre-wrap px-4 py-2 font-mono text-[13px]" style={{ color: MONOKAI.text }}>
            {result.stdout && result.stdout.length > 0 ? result.stdout : '(no output)'}
          </pre>
          {result.error && (
            <p className="px-4 pb-2 text-sm font-medium" style={{ color: MONOKAI.pink }}>
              {result.error}
            </p>
          )}
        </div>
      )}

      {outcome && (
        <div
          className="shrink-0 border-t px-4 py-3 text-sm font-medium"
          style={{
            borderColor: MONOKAI.border,
            color: outcome.pass ? MONOKAI.green : MONOKAI.pink,
            background: MONOKAI.bgRaised,
          }}
        >
          {outcome.pass ? '✓ ' : ''}
          {outcome.message}
        </div>
      )}
    </div>
  )
}
