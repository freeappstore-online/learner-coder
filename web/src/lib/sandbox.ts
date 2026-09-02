import type { RunResult } from '../types'

/** Runs JS in a throwaway Function scope with a fake console — never touches the real page console or window. */
export function runJsCode(code: string): RunResult {
  const logs: string[] = []
  const fakeConsole = {
    log: (...args: unknown[]) => {
      logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '))
    },
  }
  try {
    const fn = new Function('console', code)
    fn(fakeConsole)
    return { logs }
  } catch (err) {
    return { logs, error: err instanceof Error ? err.message : String(err) }
  }
}

let pyodidePromise: Promise<PyodideInterface> | null = null

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>
  setStdout: (opts: { batched: (s: string) => void }) => void
  loadPackage: (name: string) => Promise<void>
  pyimport: (name: string) => { install: (pkg: string) => Promise<void> }
  globals: { set: (name: string, value: unknown) => void }
}

function loadScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load the Python runtime. Check your internet connection.'))
    document.head.appendChild(script)
  })
}

/** Lazily loads Pyodide (Python-in-WASM) from a CDN, once per session, only when a Python lesson is actually run. */
async function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      const w = window as unknown as { loadPyodide?: () => Promise<PyodideInterface> }
      if (!w.loadPyodide) {
        await loadScriptOnce('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js')
      }
      const ready = window as unknown as { loadPyodide: () => Promise<PyodideInterface> }
      return ready.loadPyodide()
    })()
  }
  return pyodidePromise
}

export async function runPythonCode(code: string): Promise<RunResult> {
  try {
    const pyodide = await getPyodide()
    let stdout = ''
    pyodide.setStdout({
      batched: (s: string) => {
        stdout += s + '\n'
      },
    })
    await pyodide.runPythonAsync(code)
    return { stdout: stdout.replace(/\n$/, '') }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

let jediReadyPromise: Promise<void> | null = null

/** Installs Jedi — Python's own autocompletion engine — into the Pyodide runtime via micropip.
 * Both jedi and its one dependency (parso) ship as pure-Python wheels, so they install straight
 * from PyPI with no native build step. */
async function ensureJedi(): Promise<void> {
  if (!jediReadyPromise) {
    jediReadyPromise = (async () => {
      const pyodide = await getPyodide()
      await pyodide.loadPackage('micropip')
      const micropip = pyodide.pyimport('micropip')
      await micropip.install('jedi')
    })()
  }
  return jediReadyPromise
}

/**
 * Warms up the Python runtime and Jedi ahead of time so the first real completion request
 * doesn't stall on a multi-second download. Safe to call speculatively — failures (e.g. offline)
 * are swallowed, since completions just degrade to Monaco's built-in word matching without it.
 */
export function prefetchPythonIntelliSense(): void {
  ensureJedi().catch(() => {})
}

export interface PyCompletion {
  label: string
  insertText: string
  /** Jedi's completion category — see https://jedi.readthedocs.io/en/latest/docs/api-classes.html */
  kind: string
  detail: string
}

/**
 * Real semantic completions from Jedi, running inside the same in-browser interpreter used to
 * execute the lesson's code — not a canned keyword list. `line` is 1-indexed; `column` is
 * 0-indexed, matching Jedi's convention (callers translate from their own editor's coordinates).
 */
export async function getPythonCompletions(code: string, line: number, column: number): Promise<PyCompletion[]> {
  try {
    const pyodide = await getPyodide()
    await ensureJedi()
    pyodide.globals.set('__ls_code', code)
    pyodide.globals.set('__ls_line', line)
    pyodide.globals.set('__ls_col', column)
    const raw = await pyodide.runPythonAsync(`
import jedi, json as __json
__script = jedi.Script(__ls_code)
__json.dumps([
    {"label": c.name, "insertText": c.name, "kind": c.type, "detail": (c.description or "")[:80]}
    for c in __script.complete(__ls_line, __ls_col)
])
`)
    return JSON.parse(raw as string)
  } catch {
    return []
  }
}
