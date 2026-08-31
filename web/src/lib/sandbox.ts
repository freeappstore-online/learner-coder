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
