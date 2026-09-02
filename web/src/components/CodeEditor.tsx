import { useEffect } from 'react'
import Editor, { loader, type BeforeMount, type Monaco, type OnMount } from '@monaco-editor/react'
import monacoApi from '../lib/monacoCore'
import type { editor as MonacoEditorNs, Position as MonacoPosition } from 'monaco-editor'
import { getPythonCompletions, prefetchPythonIntelliSense } from '../lib/sandbox'
import { CSS_PROPERTIES, HTML_TAGS, JS_KEYWORDS, JS_MEMBERS } from '../lib/staticCompletions'

// See lib/monacoCore.ts for the full story: this app's CSP blocks the Web Worker Monaco's rich
// HTML/CSS/JS/TS language services need, so we bundle a custom Monaco that never loads them —
// core editor + generic editing UI (suggest widget, hover, etc.) + Monarch-only syntax
// highlighting, with zero worker dependency. HTML/CSS/JS get their own static, worker-free
// completion providers below in place of those services' real semantic ones.
loader.config({ monaco: monacoApi })

export type EditorLanguage = 'html' | 'css' | 'javascript' | 'python'

const THEME_NAME = 'monokai-learner'

function defineMonokaiTheme(monaco: Monaco) {
  monaco.editor.defineTheme(THEME_NAME, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'string.value', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'keyword', foreground: '66d9ef' },
      { token: 'keyword.control', foreground: 'f92672' },
      { token: 'operator', foreground: 'f92672' },
      { token: 'delimiter', foreground: 'f8f8f2' },
      { token: 'type', foreground: '66d9ef' },
      { token: 'type.identifier', foreground: 'a6e22e' },
      { token: 'identifier', foreground: 'f8f8f2' },
      { token: 'variable', foreground: 'f8f8f2' },
      { token: 'variable.predefined', foreground: 'f8f8f2' },
      { token: 'tag', foreground: 'f92672' },
      { token: 'metatag', foreground: 'f92672' },
      { token: 'attribute.name', foreground: 'a6e22e' },
      { token: 'attribute.value', foreground: 'e6db74' },
      { token: 'annotation', foreground: 'a6e22e' },
      { token: 'predefined', foreground: '66d9ef' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editorLineNumber.foreground': '#75715e',
      'editorLineNumber.activeForeground': '#f8f8f2',
      'editor.selectionBackground': '#49483e',
      'editorCursor.foreground': '#f8f8f2',
      'editorIndentGuide.background': '#3e3d32',
      'editorIndentGuide.activeBackground': '#75715e',
      'editorWhitespace.foreground': '#3e3d32',
      'editorSuggestWidget.background': '#272822',
      'editorSuggestWidget.border': '#3e3d32',
      'editorSuggestWidget.foreground': '#f8f8f2',
      'editorSuggestWidget.selectedBackground': '#3e3d32',
      'editorSuggestWidget.highlightForeground': '#a6e22e',
      'editorHoverWidget.background': '#272822',
      'editorHoverWidget.border': '#3e3d32',
      'editorWidget.background': '#1e1f1c',
      'editorWidget.border': '#3e3d32',
      'scrollbarSlider.background': '#3e3d3299',
      'scrollbarSlider.hoverBackground': '#4d4c40cc',
    },
  })
}

// Maps Jedi's completion categories to Monaco's icon set for the suggestion list.
// https://jedi.readthedocs.io/en/latest/docs/api-classes.html
function jediKindToMonaco(monaco: Monaco, kind: string) {
  const K = monaco.languages.CompletionItemKind
  switch (kind) {
    case 'module':
      return K.Module
    case 'class':
      return K.Class
    case 'instance':
      return K.Variable
    case 'function':
      return K.Function
    case 'param':
      return K.Variable
    case 'path':
      return K.File
    case 'keyword':
      return K.Keyword
    case 'property':
      return K.Property
    case 'statement':
      return K.Text
    default:
      return K.Text
  }
}

let pythonProviderRegistered = false

/** Real Jedi-backed completions for Python — see lib/sandbox.ts. Registered once globally the
 * first time a Python editor mounts, since Monaco's language providers are global, not per-instance. */
function registerPythonIntelliSense(monaco: Monaco) {
  if (pythonProviderRegistered) return
  pythonProviderRegistered = true

  monaco.languages.registerCompletionItemProvider('python', {
    triggerCharacters: ['.'],
    provideCompletionItems: async (model: MonacoEditorNs.ITextModel, position: MonacoPosition) => {
      const completions = await getPythonCompletions(model.getValue(), position.lineNumber, position.column - 1)
      const range = rangeForWord(model, position)
      return {
        suggestions: completions.map((c) => ({
          label: c.label,
          kind: jediKindToMonaco(monaco, c.kind),
          insertText: c.insertText,
          detail: c.detail,
          range,
          // Dunder/private names (__add__, _fwalk, ...) are real completions but rarely what a
          // beginner wants first — sort them after everything else instead of alphabetically first.
          sortText: (c.label.startsWith('_') ? '1' : '0') + c.label,
        })),
      }
    },
  })
}

function rangeForWord(model: MonacoEditorNs.ITextModel, position: MonacoPosition) {
  const word = model.getWordUntilPosition(position)
  return {
    startLineNumber: position.lineNumber,
    endLineNumber: position.lineNumber,
    startColumn: word.startColumn,
    endColumn: word.endColumn,
  }
}

let htmlProviderRegistered = false

/** Worker-free tag-name completion for HTML — see the top-of-file note on why the rich, worker-
 * backed one isn't loaded at all. */
function registerHtmlFallback(monaco: Monaco) {
  if (htmlProviderRegistered) return
  htmlProviderRegistered = true

  monaco.languages.registerCompletionItemProvider('html', {
    triggerCharacters: ['<'],
    provideCompletionItems: (model: MonacoEditorNs.ITextModel, position: MonacoPosition) => {
      const beforeCursor = model.getLineContent(position.lineNumber).slice(0, position.column - 1)
      if (!/<[a-zA-Z]*$/.test(beforeCursor)) return { suggestions: [] }
      const range = rangeForWord(model, position)
      return {
        suggestions: HTML_TAGS.map((tag) => ({
          label: tag,
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: tag,
          range,
        })),
      }
    },
  })
}

let cssProviderRegistered = false

/** Worker-free property-name completion for CSS — see the top-of-file note. */
function registerCssFallback(monaco: Monaco) {
  if (cssProviderRegistered) return
  cssProviderRegistered = true

  monaco.languages.registerCompletionItemProvider('css', {
    provideCompletionItems: (model: MonacoEditorNs.ITextModel, position: MonacoPosition) => {
      const beforeCursor = model.getLineContent(position.lineNumber).slice(0, position.column - 1)
      // Skip once we're past a ':' on this declaration — that means typing a value, not a property.
      if (/:[^;{}]*$/.test(beforeCursor)) return { suggestions: [] }
      const range = rangeForWord(model, position)
      return {
        suggestions: CSS_PROPERTIES.map((prop) => ({
          label: prop,
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: prop,
          range,
        })),
      }
    },
  })
}

let jsProviderRegistered = false

/** Worker-free keyword/member completion for JavaScript — see the top-of-file note. */
function registerJsFallback(monaco: Monaco) {
  if (jsProviderRegistered) return
  jsProviderRegistered = true

  monaco.languages.registerCompletionItemProvider('javascript', {
    triggerCharacters: ['.'],
    provideCompletionItems: (model: MonacoEditorNs.ITextModel, position: MonacoPosition) => {
      const beforeCursor = model.getLineContent(position.lineNumber).slice(0, position.column - 1)
      const isMemberAccess = /\.\s*[A-Za-z_$]*$/.test(beforeCursor)
      const range = rangeForWord(model, position)
      const K = monaco.languages.CompletionItemKind
      return {
        suggestions: (isMemberAccess ? JS_MEMBERS : JS_KEYWORDS).map((label) => ({
          label,
          kind: isMemberAccess ? K.Method : K.Keyword,
          insertText: label,
          range,
        })),
      }
    },
  })
}

const beforeMount: BeforeMount = (monaco) => {
  defineMonokaiTheme(monaco)
  registerPythonIntelliSense(monaco)
  registerHtmlFallback(monaco)
  registerCssFallback(monaco)
  registerJsFallback(monaco)
}

export function CodeEditor({
  value,
  onChange,
  language,
}: {
  value: string
  onChange: (value: string) => void
  language: EditorLanguage
}) {
  useEffect(() => {
    if (language === 'python') prefetchPythonIntelliSense()
  }, [language])

  const handleMount: OnMount = (editor) => {
    editor.updateOptions({ suggestOnTriggerCharacters: true, quickSuggestions: true })
  }

  return (
    <Editor
      height="100%"
      width="100%"
      language={language}
      value={value}
      onChange={(next) => onChange(next ?? '')}
      beforeMount={beforeMount}
      onMount={handleMount}
      theme={THEME_NAME}
      loading={<div className="flex h-full w-full items-center justify-center text-xs text-[#8b8a85]">Loading editor…</div>}
      options={{
        fontSize: 13,
        fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        renderLineHighlight: 'none',
        padding: { top: 12, bottom: 12 },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
      }}
    />
  )
}

// Default export so this (and the multi-MB Monaco bundle it pulls in) can be React.lazy()-loaded
// — see CodePlayground.tsx. Home/the catalog/etc. shouldn't pay for Monaco upfront.
export default CodeEditor
