export interface Profile {
  name: string
  joinedAt: string
}

export interface RunResult {
  /** Rendered HTML for an iframe preview (html/css exercises). */
  html?: string
  /** Captured console.log lines (js exercises). */
  logs?: string[]
  /** Captured stdout (python exercises). */
  stdout?: string
  /** Error message, if the code threw or failed to run. */
  error?: string
}

export interface CheckContext {
  code: string
  result: RunResult
  /** Live iframe element, for html/css exercises that need to inspect the rendered DOM. */
  iframe?: HTMLIFrameElement | null
}

export interface CheckOutcome {
  pass: boolean
  message: string
}

export interface Exercise {
  type: 'html' | 'css' | 'js' | 'python'
  /** What the learner is asked to build. */
  prompt: string
  starterCode: string
  /** For css exercises: the fixed HTML markup the learner's CSS is applied to. */
  previewMarkup?: string
  check: (ctx: CheckContext) => CheckOutcome
}

export interface Lesson {
  id: string
  title: string
  minutes: number
  content: string[]
  exercise: Exercise
  /** Groups lessons into numbered sub-sections (1.1, 1.2, 2.1, ...) within a course. Lessons
   * sharing the same `number` must be contiguous in the course's `lessons` array — the sub-number
   * is just their position within that run. Omit entirely for a flat, un-grouped course. */
  part?: { number: number; title: string }
}

export type CourseIconId = 'html5' | 'css3' | 'javascript' | 'python'

export interface Course {
  id: string
  title: string
  description: string
  icon: CourseIconId
  lessons: Lesson[]
}

export interface CourseProgress {
  enrolledAt: string
  completedLessons: string[]
  lastLessonId?: string
}

export type ProgressMap = Record<string, CourseProgress>
