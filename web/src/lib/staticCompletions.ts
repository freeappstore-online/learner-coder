// Completions for HTML/CSS/JS, since CodeEditor.tsx deliberately never loads Monaco's rich,
// worker-backed language services (see the note there for why). These static lists stand in for
// them — same philosophy as the Jedi-backed Python provider in sandbox.ts, just without real
// semantic inference.

export const HTML_TAGS = [
  'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'blockquote', 'body',
  'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd',
  'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption',
  'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html',
  'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map',
  'mark', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p',
  'param', 'picture', 'pre', 'progress', 'q', 's', 'script', 'section', 'select', 'small', 'source',
  'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea',
  'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr',
]

export const CSS_PROPERTIES = [
  'align-content', 'align-items', 'align-self', 'animation', 'background', 'background-color',
  'background-image', 'background-position', 'background-repeat', 'background-size', 'border',
  'border-color', 'border-radius', 'border-style', 'border-width', 'bottom', 'box-shadow',
  'box-sizing', 'color', 'content', 'cursor', 'display', 'flex', 'flex-direction', 'flex-wrap',
  'font', 'font-family', 'font-size', 'font-style', 'font-weight', 'gap', 'grid',
  'grid-template-columns', 'grid-template-rows', 'height', 'justify-content', 'left',
  'letter-spacing', 'line-height', 'list-style', 'margin', 'margin-bottom', 'margin-left',
  'margin-right', 'margin-top', 'max-height', 'max-width', 'min-height', 'min-width', 'opacity',
  'overflow', 'overflow-x', 'overflow-y', 'padding', 'padding-bottom', 'padding-left',
  'padding-right', 'padding-top', 'position', 'right', 'text-align', 'text-decoration',
  'text-transform', 'top', 'transform', 'transition', 'vertical-align', 'visibility', 'white-space',
  'width', 'z-index',
]

export const JS_KEYWORDS = [
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case',
  'break', 'continue', 'class', 'extends', 'new', 'this', 'super', 'import', 'export', 'default',
  'async', 'await', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'true', 'false',
  'null', 'undefined',
]

export const JS_MEMBERS = [
  'log', 'error', 'warn', 'info', // console.*
  'floor', 'ceil', 'round', 'random', 'max', 'min', 'abs', 'pow', 'sqrt', // Math.*
  'map', 'filter', 'reduce', 'forEach', 'push', 'pop', 'slice', 'splice', 'includes', 'indexOf',
  'join', 'find', 'some', 'every', // Array.prototype.*
  'trim', 'split', 'toUpperCase', 'toLowerCase', 'replace', 'startsWith', 'endsWith', 'padStart',
  'length', // String.prototype.*
]
