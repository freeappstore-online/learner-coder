import { lazy, Suspense, useRef, useState } from 'react'
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

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const paneRef = useRef<HTMLDivElement>(null)
  const pendingCssCheck = useRef<PendingCssCheck | null>(null)

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

  return (
    <div ref={paneRef} className="flex h-full min-h-0 flex-1 flex-col" style={{ background: MONOKAI.bg }}>
      {/* Toolbar */}
      <div
        className="flex shrink-0 items-center justify-between border-b px-4 py-2"
        style={{ borderColor: MONOKAI.border, background: MONOKAI.bgRaised }}
      >
        <span className="font-mono text-xs" style={{ color: MONOKAI.muted }}>
          {FILE_NAME[exercise.type]}
        </span>
        <div className="flex gap-2">
          {isPreview && previewDoc !== null && !previewOpen && (
            <button
              onClick={() => setPreviewOpen(true)}
              className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: MONOKAI.border, color: MONOKAI.text }}
            >
              Show preview
            </button>
          )}
          <button
            onClick={reset}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: MONOKAI.border, color: MONOKAI.text }}
          >
            Reset
          </button>
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
          paneRef={paneRef}
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
