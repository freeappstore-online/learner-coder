import { useMemo, useRef } from 'react'
import type { KeyboardEvent, UIEvent } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-python'
import 'prismjs/themes/prism-okaidia.css'

export type EditorLanguage = 'markup' | 'css' | 'javascript' | 'python'

export function CodeEditor({
  value,
  onChange,
  language,
  fill = false,
  rows = 8,
}: {
  value: string
  onChange: (value: string) => void
  language: EditorLanguage
  /** Fill the parent flex container's height instead of sizing to `rows`. */
  fill?: boolean
  rows?: number
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)

  const highlighted = useMemo(() => {
    const grammar = Prism.languages[language] ?? Prism.languages.markup
    // Trailing newline keeps the last line from being clipped by the highlighter.
    return Prism.highlight(value + '\n', grammar, language)
  }, [value, language])

  const syncScroll = (e: UIEvent<HTMLTextAreaElement>) => {
    if (!preRef.current) return
    preRef.current.scrollTop = e.currentTarget.scrollTop
    preRef.current.scrollLeft = e.currentTarget.scrollLeft
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return
    e.preventDefault()
    const el = e.currentTarget
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = value.slice(0, start) + '  ' + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + 2
    })
  }

  const baseTextStyle = {
    fontFamily:
      "ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace",
    fontSize: 13,
    lineHeight: 1.625,
    tabSize: 2,
  } as const

  return (
    <div
      className={`code-editor-monokai relative ${fill ? 'h-full w-full' : 'w-full'}`}
      style={{ background: '#272822', ...(fill ? {} : { height: rows * 21 + 24 }) }}
    >
      <pre
        ref={preRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre-wrap break-words px-4 py-3"
        style={{ ...baseTextStyle, color: '#f8f8f2' }}
      >
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
      <textarea
        ref={textareaRef}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={syncScroll}
        className="absolute inset-0 resize-none whitespace-pre-wrap break-words bg-transparent px-4 py-3 caret-white outline-none"
        style={{ ...baseTextStyle, color: 'transparent' }}
      />
    </div>
  )
}
