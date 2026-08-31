import type { Course, Lesson } from '../types'

function normColor(s: string): string {
  return s.replace(/\s+/g, '')
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
    icon: '🌐',
    lessons: [
      {
        id: 'what-is-html',
        title: 'What is HTML?',
        minutes: 4,
        content: [
          'HTML (HyperText Markup Language) is the language browsers use to understand the structure of a web page. It describes what content is on the page — headings, paragraphs, images, links — not how it looks.',
          'An HTML document is made of elements. Most elements have an opening tag, some content, and a closing tag, like <p>Hello</p>. The browser reads these tags and renders them as a page.',
        ],
        exercise: {
          type: 'html',
          prompt: 'Write a paragraph element that says "Hello, World!"',
          starterCode: '<!-- write your HTML below -->\n',
          check: ({ code }) => {
            const hasParagraph = /<p[^>]*>[\s\S]*?<\/p>/i.test(code)
            const hasText = /hello,?\s*world!?/i.test(code)
            if (!hasParagraph) return { pass: false, message: 'Add a <p>...</p> element.' }
            if (!hasText) return { pass: false, message: 'Your paragraph should say "Hello, World!"' }
            return { pass: true, message: 'Your first HTML element is live.' }
          },
        },
      },
      {
        id: 'tags-and-elements',
        title: 'Tags & Elements',
        minutes: 5,
        content: [
          'Tags are wrapped in angle brackets, like <h1> or <p>. Most come in pairs: an opening tag and a closing tag with a forward slash, e.g. <h1>Title</h1>.',
          'An element is the opening tag, its content, and its closing tag together. Elements can nest inside other elements — a <li> often lives inside a <ul>, for example.',
          'Some tags are "self-closing" because they have no content, like <img /> or <br />.',
        ],
        exercise: {
          type: 'html',
          prompt: 'Add an <h1> heading that says "My First Page", followed by a <p> paragraph with any text you like.',
          starterCode: '<!-- write your HTML below -->\n',
          check: ({ code }) => {
            const hasH1 = /<h1[^>]*>[\s\S]*?<\/h1>/i.test(code)
            const hasTitle = /my first page/i.test(code)
            const hasParagraph = /<p[^>]*>[\s\S]*?<\/p>/i.test(code)
            if (!hasH1 || !hasTitle) return { pass: false, message: 'Add an <h1> that says "My First Page".' }
            if (!hasParagraph) return { pass: false, message: 'Now add a <p> paragraph below the heading.' }
            return { pass: true, message: 'A heading and a paragraph — a real page skeleton.' }
          },
        },
      },
      {
        id: 'attributes',
        title: 'Attributes',
        minutes: 4,
        content: [
          'Attributes add extra information to a tag. They go inside the opening tag as name="value" pairs, like <a href="https://example.com">link</a>.',
          'Common attributes include href (for links), src (for images), and class or id (used for styling and identifying elements).',
        ],
        exercise: {
          type: 'html',
          prompt: 'Create a link to https://freeappstore.online with the visible text "Visit".',
          starterCode: '<!-- write your HTML below -->\n',
          check: ({ code }) => {
            const linkMatch = code.match(/<a\b[^>]*>[\s\S]*?<\/a>/i)
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
        content: [
          'Every HTML document starts with <!DOCTYPE html>, then an <html> element containing a <head> and a <body>.',
          'The <head> holds metadata like the page title and linked stylesheets — nothing in it is visible on the page itself. The <body> holds everything the visitor actually sees.',
          'Headings (<h1> through <h6>) and paragraphs (<p>) are the most common building blocks for readable content.',
        ],
        exercise: {
          type: 'html',
          prompt: 'Build a mini page: one <h1> heading and at least two <p> paragraphs.',
          starterCode: '<!-- write your HTML below -->\n',
          check: ({ code }) => {
            const hasH1 = /<h1[^>]*>[\s\S]*?<\/h1>/i.test(code)
            const paragraphCount = (code.match(/<p[^>]*>/gi) ?? []).length
            if (!hasH1) return { pass: false, message: 'Add one <h1> heading.' }
            if (paragraphCount < 2) return { pass: false, message: `Found ${paragraphCount} paragraph(s) — add at least 2.` }
            return { pass: true, message: 'A heading with supporting paragraphs — real page structure.' }
          },
        },
      },
      {
        id: 'links-and-images',
        title: 'Links & Images',
        minutes: 4,
        content: [
          'Links are created with the <a> tag and an href attribute pointing to a URL: <a href="https://example.com">Visit</a>.',
          'Images use the <img> tag with a src attribute for the file path and an alt attribute describing the image for accessibility and for when it fails to load.',
        ],
        exercise: {
          type: 'html',
          prompt: 'Add an <img> tag with a src and a descriptive alt attribute.',
          starterCode: '<!-- write your HTML below -->\n',
          check: ({ code }) => {
            const imgMatch = code.match(/<img\b[^>]*>/i)
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
    ],
  },
  {
    id: 'css-styling',
    title: 'CSS Styling',
    description: 'Turn plain HTML into a styled, laid-out page using selectors and the box model.',
    icon: '🎨',
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
    icon: '⚡',
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
    icon: '🐍',
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
