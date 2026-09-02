import { useEffect } from 'react'
import Editor, { type BeforeMount, type Monaco, type OnMount } from '@monaco-editor/react'
import type { editor as MonacoEditorNs, Position as MonacoPosition } from 'monaco-editor'
import { getPythonCompletions, prefetchPythonIntelliSense } from '../lib/sandbox'

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
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }
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

const beforeMount: BeforeMount = (monaco) => {
  defineMonokaiTheme(monaco)
  registerPythonIntelliSense(monaco)
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
