import type { Course, Lesson } from '../types'

function normColor(s: string): string {
  return s.replace(/\s+/g, '')
}

/** Every HTML exercise's starter code includes an instructional comment that often names the very
 * tag it's asking for (e.g. "<!-- add an <img> ... -->"). Checks must not match against that decoy
 * — strip comments before testing so only the learner's real markup counts. */
function stripHtmlComments(code: string): string {
  return code.replace(/<!--[\s\S]*?-->/g, '')
}

function computedStyleFor(iframe: HTMLIFrameElement | null | undefined, selector: string): CSSStyleDeclaration | null {
  const doc = iframe?.contentDocument
  const win = iframe?.contentWindow
  if (!doc || !win) return null
  const el = doc.querySelector(selector)
  if (!el) return null
  return win.getComputedStyle(el)
}

export const courses: Course[] = [
  {
    id: 'html-foundations',
    title: 'HTML Foundations',
    description: 'Learn the building blocks of every web page: tags, elements, and structure.',
    icon: 'html5',
    lessons: [
      {
        id: 'the-doctype',
        title: 'The Doctype',
        minutes: 2,
        part: { number: 1, title: 'Getting Started' },
        content: [
          'Every HTML page starts with a doctype: <!DOCTYPE html>, on its own line, before anything else.',
          'It is not a tag and it does not describe content — it just tells the browser "treat this as modern HTML," so your page renders consistently instead of falling back to old quirks-mode behavior from the early web.',
          'Skip it, and the page still renders — the browser will not refuse to show it or throw an error. But without it, some older browsers fall back to "quirks mode," a legacy rendering mode kept around for pages from the 1990s, where sizing and spacing can behave inconsistently. That is why the doctype goes on every real page out of habit, even though skipping it will not immediately break anything.',
        ],
        exercise: {
          type: 'html',
          prompt: 'Run this page as-is, then try deleting the <!DOCTYPE html> line and running again — you will need to add it back to pass.',
          starterCode:
            '<!-- try deleting the doctype line below, then run again -->\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <h1>With &lt;!DOCTYPE html&gt;</h1>\n  </body>\n</html>\n',
          check: ({ code }) => {
            const hasDoctype = /<!doctype\s+html\s*>/i.test(stripHtmlComments(code))
            if (!hasDoctype) return { pass: false, message: 'Add <!DOCTYPE html> to the page.' }
            return { pass: true, message: 'You just wrote every real HTML page\'s first line.' }
          },
        },
      },
      {
        id: 'what-is-html',
        title: 'What is HTML?',
        minutes: 4,
        part: { number: 1, title: 'Getting Started' },
        content: [
          'HTML (HyperText Markup Language) is the language browsers use to understand the structure of a web page. It describes what content is on the page — headings, paragraphs, images, links — not how it looks.',
          'An HTML document is made of elements. Most elements have an opening tag, some content, and a closing tag, like <p>Hello</p>. The browser reads these tags and renders them as a page.',
        ],
        exercise: {
          type: 'html',
          prompt: 'Write a paragraph element that says "Hello, World!"',
          starterCode:
            '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <!-- write a paragraph that says "Hello, World!" -->\n    \n  </body>\n</html>\n',
          check: ({ code }) => {
            const cleanCode = stripHtmlComments(code)
            const hasParagraph = /<p[^>]*>[\s\S]*?<\/p>/i.test(cleanCode)
            const hasText = /hello,?\s*world!?/i.test(cleanCode)
            if (!hasParagraph) return { pass: false, message: 'Add a <p>...</p> element.' }
            if (!hasText) return { pass: false, message: 'Your paragraph should say "Hello, World!"' }
            return { pass: true, message: 'Your first HTML element is live.' }
          },
        },
      },
      {
        id: 'attributes',
        title: 'Attributes',
        minutes: 4,
        part: { number: 1, title: 'Getting Started' },
        content: [
          'Attributes add extra information to a tag. They go inside the opening tag as name="value" pairs, like <a href="https://example.com">link</a>.',
          'Common attributes include href (for links), src (for images), and class or id (used for styling and identifying elements). You will use them constantly once we get into the tags themselves.',
        ],
        exercise: {
          type: 'html',
          prompt: 'Create a link to https://freeappstore.online with the visible text "Visit".',
          starterCode:
            '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <!-- write a link to https://freeappstore.online that says "Visit" -->\n    \n  </body>\n</html>\n',
          check: ({ code }) => {
            const linkMatch = stripHtmlComments(code).match(/<a\b[^>]*>[\s\S]*?<\/a>/i)
            if (!linkMatch) return { pass: false, message: 'Add an <a>...</a> link.' }
            const tag = linkMatch[0]
            const hasHref = /href=["']https:\/\/freeappstore\.online\/?["']/i.test(tag)
            const hasText = /visit/i.test(tag)
            if (!hasHref) return { pass: false, message: 'The href should point to https://freeappstore.online' }
            if (!hasText) return { pass: false, message: 'The link text should say "Visit".' }
            return { pass: true, message: 'A working link, properly attributed.' }
          },
        },
      },
      {
        id: 'structuring-a-page',
        title: 'Structuring a Page',
        minutes: 5,
        part: { number: 1, title: 'Getting Started' },
        content: [
          'Every HTML document starts with <!DOCTYPE html>, then an <html> element containing a <head> and a <body>.',
          'The <head> holds metadata like the page title and linked stylesheets — nothing in it is visible on the page itself. The <body> holds everything the visitor actually sees.',
          'From here on, every exercise starts you off with this same skeleton — because every real page has one. Next up: a whole tour of the tags that go inside that <body>.',
        ],
        exercise: {
          type: 'html',
          prompt: 'Build a mini page: one <h1> heading and at least two <p> paragraphs.',
          starterCode:
            '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <!-- add one <h1> heading and at least two <p> paragraphs -->\n    \n  </body>\n</html>\n',
          check: ({ code }) => {
            const cleanCode = stripHtmlComments(code)
            const hasH1 = /<h1[^>]*>[\s\S]*?<\/h1>/i.test(cleanCode)
            const paragraphCount = (cleanCode.match(/<p[^>]*>/gi) ?? []).length
            if (!hasH1) return { pass: false, message: 'Add one <h1> heading.' }
            if (paragraphCount < 2) return { pass: false, message: `Found ${paragraphCount} paragraph(s) — add at least 2.` }
            return { pass: true, message: 'A heading with supporting paragraphs — real page structure.' }
          },
        },
      },
      {
        id: 'tag-headings',
        title: 'Headings',
        minutes: 4,
        part: { number: 2, title: 'HTML Tags' },
        content: [
          'HTML has six levels of headings, <h1> through <h6>, from most to least important. Use <h1> once per page for the main title, then step down through <h2>, <h3>, and so on for subheadings — like an outline.',
          'Headings are not just for looking big and bold: screen readers and search engines rely on them to understand a page\'s structure, so skipping levels (jumping from <h1> straight to <h4>) is bad practice even if it "looks" fine visually.',
        ],
        exercise: {
          type: 'html',
          prompt: 'Write an <h1> main title, then an <h2> subheading below it — any text you like.',
          starterCode:
            '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <!-- add an <h1> title and an <h2> subheading -->\n    \n  </body>\n</html>\n',
          check: ({ code }) => {
            const cleanCode = stripHtmlComments(code)
            const hasH1 = /<h1[^>]*>[\s\S]*?<\/h1>/i.test(cleanCode)
            const hasH2 = /<h2[^>]*>[\s\S]*?<\/h2>/i.test(cleanCode)
            if (!hasH1) return { pass: false, message: 'Add an <h1> heading.' }
            if (!hasH2) return { pass: false, message: 'Add an <h2> subheading below it.' }
            return { pass: true, message: 'A clear heading hierarchy — exactly how outlines work.' }
          },
        },
      },
      {
        id: 'tag-lists',
        title: 'Lists',
        minutes: 4,
        part: { number: 2, title: 'HTML Tags' },
        content: [
          'Unordered lists (<ul>) show bullet points; ordered lists (<ol>) show numbers. Both hold one or more <li> (list item) elements — one per item.',
          '<ul><li>Tea</li><li>Coffee</li></ul> renders as a bulleted list of two items. Swap <ul> for <ol> and the exact same items render as "1. Tea" and "2. Coffee" instead.',
        ],
        exercise: {
          type: 'html',
          prompt: 'Build a <ul> unordered list with at least 3 <li> items.',
          starterCode:
            '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <!-- add a <ul> with at least 3 <li> items -->\n    \n  </body>\n</html>\n',
          check: ({ code }) => {
            const ulMatch = stripHtmlComments(code).match(/<ul[^>]*>[\s\S]*?<\/ul>/i)
            if (!ulMatch) return { pass: false, message: 'Add a <ul>...</ul> list.' }
            const itemCount = (ulMatch[0].match(/<li[^>]*>/gi) ?? []).length
            if (itemCount < 3) return { pass: false, message: `Found ${itemCount} <li> item(s) — add at least 3.` }
            return { pass: true, message: 'A proper bulleted list.' }
          },
        },
      },
      {
        id: 'tag-links',
        title: 'Links',
        minutes: 4,
        part: { number: 2, title: 'HTML Tags' },
        content: [
          'The <a> (anchor) tag creates a hyperlink. Its href attribute is the destination: <a href="https://example.com">Visit</a>.',
          'By default a link opens in the same tab. Add target="_blank" to make it open in a new tab instead.',
        ],
        exercise: {
          type: 'html',
          prompt: 'Create a link to https://developer.mozilla.org with the visible text "MDN Docs".',
          starterCode:
            '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <!-- add a link to https://developer.mozilla.org that says "MDN Docs" -->\n    \n  </body>\n</html>\n',
          check: ({ code }) => {
            const linkMatch = stripHtmlComments(code).match(/<a\b[^>]*>[\s\S]*?<\/a>/i)
            if (!linkMatch) return { pass: false, message: 'Add an <a>...</a> link.' }
            const tag = linkMatch[0]
            const hasHref = /href=["']https:\/\/developer\.mozilla\.org\/?["']/i.test(tag)
            const hasText = /mdn docs/i.test(tag)
            if (!hasHref) return { pass: false, message: 'The href should point to https://developer.mozilla.org' }
            if (!hasText) return { pass: false, message: 'The link text should say "MDN Docs".' }
            return { pass: true, message: 'Another working link — you have got the pattern down.' }
          },
        },
      },
      {
        id: 'tag-images',
        title: 'Images',
        minutes: 4,
        part: { number: 2, title: 'HTML Tags' },
        content: [
          'Images use the <img> tag with a src attribute for the file path and an alt attribute describing the image for accessibility and for when it fails to load.',
          '<img> is a "void" element — it never has a closing tag or content, just attributes: <img src="cat.jpg" alt="A sleeping cat" />.',
        ],
        exercise: {
          type: 'html',
          prompt: 'Add an <img> tag with a src and a descriptive alt attribute.',
          starterCode:
            '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <!-- add an <img> with a src and a descriptive alt -->\n    \n  </body>\n</html>\n',
          check: ({ code }) => {
            const imgMatch = stripHtmlComments(code).match(/<img\b[^>]*>/i)
            if (!imgMatch) return { pass: false, message: 'Add an <img> tag.' }
            const tag = imgMatch[0]
            const hasSrc = /\bsrc=["'][^"']+["']/i.test(tag)
            const hasAlt = /\balt=["'][^"']+["']/i.test(tag)
            if (!hasSrc) return { pass: false, message: 'Give the <img> a src attribute.' }
            if (!hasAlt) return { pass: false, message: 'Give the <img> a non-empty alt attribute.' }
            return { pass: true, message: 'An accessible image, properly described.' }
          },
        },
      },
      {
        id: 'tag-tables',
        title: 'Tables',
        minutes: 5,
        part: { number: 2, title: 'HTML Tags' },
        content: [
          'Tables are built from <table>, with rows as <tr>. Header cells use <th>, regular data cells use <td>.',
          'A tiny table: <table><tr><th>Name</th></tr><tr><td>Ada</td></tr></table> — one header row, one data row. Tables are for tabular data, not for laying out a whole page.',
        ],
        exercise: {
          type: 'html',
          prompt: 'Build a <table> with one <tr> header row (using <th>) and at least one <tr> data row (using <td>).',
          starterCode:
            '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <!-- add a <table> with a <th> header row and a <td> data row -->\n    \n  </body>\n</html>\n',
          check: ({ code }) => {
            const cleanCode = stripHtmlComments(code)
            const hasTable = /<table[^>]*>[\s\S]*?<\/table>/i.test(cleanCode)
            const hasHeader = /<th[^>]*>[\s\S]*?<\/th>/i.test(cleanCode)
            const hasData = /<td[^>]*>[\s\S]*?<\/td>/i.test(cleanCode)
            if (!hasTable) return { pass: false, message: 'Add a <table>...</table>.' }
            if (!hasHeader) return { pass: false, message: 'Add a header cell with <th>.' }
            if (!hasData) return { pass: false, message: 'Add a data cell with <td>.' }
            return { pass: true, message: 'A real table — headers and data, properly marked up.' }
          },
        },
      },
      {
        id: 'tag-forms',
        title: 'Forms',
        minutes: 5,
        part: { number: 2, title: 'HTML Tags' },
        content: [
          'Forms collect input with <form>, wrapping fields like <input> — a text box, checkbox, or more, depending on its type attribute — and a <button> to submit it.',
          '<label for="name">Name</label><input type="text" id="name" /> ties a label to its input by matching for to id. Clicking the label then focuses the input, which also helps screen readers announce what the field is for.',
        ],
        exercise: {
          type: 'html',
          prompt: 'Build a form with a text <input> and a <button>.',
          starterCode:
            '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <!-- add a <form> with a text <input> and a <button> -->\n    \n  </body>\n</html>\n',
          check: ({ code }) => {
            const cleanCode = stripHtmlComments(code)
            const hasForm = /<form[^>]*>[\s\S]*?<\/form>/i.test(cleanCode)
            const hasInput = /<input\b[^>]*>/i.test(cleanCode)
            const hasButton = /<button[^>]*>[\s\S]*?<\/button>/i.test(cleanCode)
            if (!hasForm) return { pass: false, message: 'Wrap your fields in a <form>...</form>.' }
            if (!hasInput) return { pass: false, message: 'Add a text <input>.' }
            if (!hasButton) return { pass: false, message: 'Add a <button> to submit the form.' }
            return { pass: true, message: 'A working form — inputs and all.' }
          },
        },
      },
    ],
  },
  {
    id: 'css-styling',
    title: 'CSS Styling',
    description: 'Turn plain HTML into a styled, laid-out page using selectors and the box model.',
    icon: 'css3',
    lessons: [
      {
        id: 'what-is-css',
        title: 'What is CSS?',
        minutes: 4,
        content: [
          'CSS (Cascading Style Sheets) controls how HTML elements look — colors, fonts, spacing, layout — separate from the content itself.',
          'A CSS rule has a selector (which elements it targets) and a declaration block with property: value; pairs, like p { color: blue; }.',
        ],
        exercise: {
          type: 'css',
          prompt: 'Make the text of #target red.',
          starterCode: '#target {\n  \n}',
          previewMarkup: '<p id="target">Style me!</p>',
          check: ({ iframe }) => {
            const style = computedStyleFor(iframe, '#target')
            if (!style) return { pass: false, message: 'Could not find #target — try Run again.' }
            const pass = normColor(style.color) === 'rgb(255,0,0)'
            return {
              pass,
              message: pass ? '#target is red.' : `Currently ${style.color} — try color: red;`,
            }
          },
        },
      },
      {
        id: 'selectors',
        title: 'Selectors',
        minutes: 5,
        content: [
          'Element selectors target a tag directly, like p { }. Class selectors start with a dot and target any element with that class, like .card { }. ID selectors start with a hash and target one specific element, like #header { }.',
          'Selectors can be combined — .card p targets <p> elements inside anything with class "card".',
        ],
        exercise: {
          type: 'css',
          prompt: 'Give every element with class "card" a lightblue background using a class selector.',
          starterCode: '.card {\n  \n}',
          previewMarkup: '<div class="card">Card content</div>',
          check: ({ iframe }) => {
            const style = computedStyleFor(iframe, '.card')
            if (!style) return { pass: false, message: 'Could not find .card — try Run again.' }
            const pass = normColor(style.backgroundColor) === 'rgb(173,216,230)'
            return {
              pass,
              message: pass ? '.card now has its lightblue background.' : `Currently ${style.backgroundColor} — try background-color: lightblue;`,
            }
          },
        },
      },
      {
        id: 'box-model',
        title: 'The Box Model',
        minutes: 5,
        content: [
          'Every HTML element is a rectangular box made of four layers: content, padding, border, and margin — in that order from the inside out.',
          'Padding adds space inside the border, around the content. Margin adds space outside the border, between this element and its neighbors.',
        ],
        exercise: {
          type: 'css',
          prompt: 'Give #box 20px of padding on every side.',
          starterCode: '#box {\n  \n}',
          previewMarkup: '<div id="box">Box</div>',
          check: ({ iframe }) => {
            const style = computedStyleFor(iframe, '#box')
            if (!style) return { pass: false, message: 'Could not find #box — try Run again.' }
            const sides = [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft]
            const pass = sides.every((s) => s === '20px')
            return { pass, message: pass ? '#box now has 20px of padding all around.' : 'Try padding: 20px;' }
          },
        },
      },
      {
        id: 'flexbox-basics',
        title: 'Flexbox Basics',
        minutes: 5,
        content: [
          'Flexbox is a layout system for arranging items in a row or column. Set display: flex on a container to turn its direct children into flex items.',
          'justify-content controls spacing along the main axis (e.g. horizontally in a row), while align-items controls alignment on the cross axis (e.g. vertically in a row).',
        ],
        exercise: {
          type: 'css',
          prompt: 'Make #container a flex container and center its children horizontally with justify-content.',
          starterCode: '#container {\n  \n}',
          previewMarkup: '<div id="container"><div>A</div><div>B</div></div>',
          check: ({ iframe }) => {
            const style = computedStyleFor(iframe, '#container')
            if (!style) return { pass: false, message: 'Could not find #container — try Run again.' }
            const isFlex = style.display === 'flex'
            const isCentered = style.justifyContent === 'center'
            if (!isFlex) return { pass: false, message: 'Add display: flex;' }
            if (!isCentered) return { pass: false, message: 'Add justify-content: center;' }
            return { pass: true, message: '#container is a centered flex row.' }
          },
        },
      },
      {
        id: 'colors-and-typography',
        title: 'Colors & Typography',
        minutes: 4,
        content: [
          'Colors can be written as names (red), hex codes (#ff0000), or functions like rgb(255, 0, 0). Hex and rgb give precise control over shade.',
          'Typography properties like font-family, font-size, and font-weight control how text looks. font-family accepts a fallback list in case the first choice isn’t available.',
        ],
        exercise: {
          type: 'css',
          prompt: 'Make the text of #target bold.',
          starterCode: '#target {\n  \n}',
          previewMarkup: '<p id="target">Read me</p>',
          check: ({ iframe }) => {
            const style = computedStyleFor(iframe, '#target')
            if (!style) return { pass: false, message: 'Could not find #target — try Run again.' }
            const pass = style.fontWeight === '700' || style.fontWeight === 'bold'
            return { pass, message: pass ? '#target is bold now.' : 'Try font-weight: bold;' }
          },
        },
      },
    ],
  },
  {
    id: 'javascript-basics',
    title: 'JavaScript Basics',
    description: 'Start programming for the web: variables, functions, conditionals, and loops.',
    icon: 'javascript',
    lessons: [
      {
        id: 'variables',
        title: 'Variables',
        minutes: 5,
        content: [
          'Variables store values so you can use them later. Declare one with let (can change) or const (cannot be reassigned): let score = 0; const name = "Ada";',
          'Prefer const by default, and only use let when you know the value needs to change.',
        ],
        exercise: {
          type: 'js',
          prompt: 'Declare a const named score with the value 10, then console.log(score).',
          starterCode: '// your code here\n',
          check: ({ result }) => {
            const pass = (result.logs ?? []).some((l) => l.trim() === '10')
            return { pass, message: pass ? 'Logged 10 — nicely declared.' : 'Expected the console to log 10.' }
          },
        },
      },
      {
        id: 'data-types',
        title: 'Data Types',
        minutes: 5,
        content: [
          'JavaScript’s core types include string ("hello"), number (42), boolean (true/false), and more complex types like arrays ([1, 2, 3]) and objects ({ key: "value" }).',
          'You can check a value’s type at runtime with the typeof operator, e.g. typeof 42 returns "number".',
        ],
        exercise: {
          type: 'js',
          prompt: "Console.log typeof 'hello' and typeof 42 (one console.log for each, or combined).",
          starterCode: '// your code here\n',
          check: ({ result }) => {
            const joined = (result.logs ?? []).join(' ')
            const pass = joined.includes('string') && joined.includes('number')
            return { pass, message: pass ? 'Both types identified correctly.' : 'Expected the output to include "string" and "number".' }
          },
        },
      },
      {
        id: 'functions',
        title: 'Functions',
        minutes: 5,
        content: [
          'Functions bundle reusable logic. A function declaration looks like: function add(a, b) { return a + b; }. Call it with add(2, 3), which evaluates to 5.',
          'Arrow functions are a shorter syntax: const add = (a, b) => a + b;. Both forms are common in modern JavaScript.',
        ],
        exercise: {
          type: 'js',
          prompt: 'Write a function add(a, b) that returns a + b, then console.log(add(2, 3)).',
          starterCode: '// your code here\n',
          check: ({ result }) => {
            const pass = (result.logs ?? []).some((l) => l.trim() === '5')
            return { pass, message: pass ? 'add(2, 3) returned 5.' : 'Expected the console to log 5.' }
          },
        },
      },
      {
        id: 'conditionals',
        title: 'Conditionals',
        minutes: 4,
        content: [
          'if statements run code only when a condition is true: if (score > 10) { console.log("High score!"); }.',
          'Use else if for additional conditions and else as a fallback when none of the conditions match.',
        ],
        exercise: {
          type: 'js',
          prompt: 'Using the given n, console.log "even" if n is even, otherwise "odd".',
          starterCode: 'const n = 8\n// your code here\n',
          check: ({ result }) => {
            const pass = (result.logs ?? []).some((l) => l.trim() === 'even')
            return { pass, message: pass ? '8 correctly identified as even.' : 'Expected the console to log "even" for n = 8.' }
          },
        },
      },
      {
        id: 'loops',
        title: 'Loops',
        minutes: 5,
        content: [
          'Loops repeat code. A for loop is common when you know how many times to repeat: for (let i = 0; i < 5; i++) { console.log(i); } prints 0 through 4.',
          'A while loop repeats as long as a condition stays true, which is useful when you don’t know the exact number of iterations in advance.',
        ],
        exercise: {
          type: 'js',
          prompt: 'Use a for loop to console.log the numbers 1 through 5, one per call.',
          starterCode: '// your code here\n',
          check: ({ result }) => {
            const pass = (result.logs ?? []).join(',') === '1,2,3,4,5'
            return { pass, message: pass ? 'Logged 1 through 5 in order.' : 'Expected five separate console.log calls: 1, 2, 3, 4, 5.' }
          },
        },
      },
    ],
  },
  {
    id: 'python-fundamentals',
    title: 'Python Fundamentals',
    description: 'A gentle introduction to Python: variables, lists, loops, and functions.',
    icon: 'python',
    lessons: [
      {
        id: 'hello-python',
        title: 'Hello, Python',
        minutes: 3,
        content: [
          'Python is known for clean, readable syntax. A full program can be one line: print("Hello, world!").',
          'Unlike some languages, Python uses indentation (spaces) instead of curly braces to group blocks of code.',
        ],
        exercise: {
          type: 'python',
          prompt: 'Use print() to output Hello, world!',
          starterCode: '# your code here\n',
          check: ({ result }) => {
            const pass = (result.stdout ?? '').includes('Hello, world!')
            return { pass, message: pass ? 'Printed exactly right.' : 'Expected the output to include "Hello, world!"' }
          },
        },
      },
      {
        id: 'variables-and-types',
        title: 'Variables & Types',
        minutes: 5,
        content: [
          'Assign a variable with a single equals sign: name = "Ada". Python figures out the type automatically — no need to declare it.',
          'Common types are str (text), int (whole numbers), float (decimals), and bool (True/False).',
        ],
        exercise: {
          type: 'python',
          prompt: 'Create a variable named pi with the value 3.14, then print(pi).',
          starterCode: '# your code here\n',
          check: ({ result }) => {
            const pass = (result.stdout ?? '').includes('3.14')
            return { pass, message: pass ? 'pi printed correctly.' : 'Expected the output to include 3.14.' }
          },
        },
      },
      {
        id: 'lists',
        title: 'Lists',
        minutes: 5,
        content: [
          'A list stores an ordered collection of values: fruits = ["apple", "banana", "cherry"]. Access an item by its index, starting at 0: fruits[0] is "apple".',
          'Lists are mutable — you can add items with fruits.append("date") or change an existing item by index.',
        ],
        exercise: {
          type: 'python',
          prompt: 'Create fruits = ["apple", "banana", "cherry"] and print(fruits[1]).',
          starterCode: '# your code here\n',
          check: ({ result }) => {
            const pass = (result.stdout ?? '').includes('banana')
            return { pass, message: pass ? 'fruits[1] is "banana" — correct.' : 'Expected the output to include "banana".' }
          },
        },
      },
      {
        id: 'loops-python',
        title: 'Loops',
        minutes: 4,
        content: [
          'A for loop can iterate directly over a list: for fruit in fruits: print(fruit) prints each item in turn.',
          'range(n) generates numbers from 0 up to (but not including) n, so for i in range(3): prints 0, 1, 2.',
        ],
        exercise: {
          type: 'python',
          prompt: 'Use a for loop over range(3) to print 0, 1, and 2, each on its own line.',
          starterCode: '# your code here\n',
          check: ({ result }) => {
            const lines = (result.stdout ?? '')
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean)
            const pass = lines.join(',') === '0,1,2'
            return { pass, message: pass ? 'Printed 0, 1, 2 in order.' : 'Expected three lines: 0, 1, 2.' }
          },
        },
      },
      {
        id: 'functions-python',
        title: 'Functions',
        minutes: 5,
        content: [
          'Define a function with def: def greet(name): return f"Hello, {name}!". Call it with greet("Ada").',
          'f-strings (strings prefixed with f) let you embed variables directly inside text using curly braces.',
        ],
        exercise: {
          type: 'python',
          prompt: 'Define greet(name) that returns f"Hello, {name}!" and print(greet("Ada")).',
          starterCode: '# your code here\n',
          check: ({ result }) => {
            const pass = (result.stdout ?? '').includes('Hello, Ada!')
            return { pass, message: pass ? 'greet("Ada") returned the right greeting.' : 'Expected the output to include "Hello, Ada!"' }
          },
        },
      },
    ],
  },
]

export function findCourse(courseId: string): Course | undefined {
  return courses.find((c) => c.id === courseId)
}

export function findLesson(courseId: string, lessonId: string): Lesson | undefined {
  return findCourse(courseId)?.lessons.find((l) => l.id === lessonId)
}
