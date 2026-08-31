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
}

export interface Course {
  id: string
  title: string
  description: string
  icon: string
  lessons: Lesson[]
}

export interface CourseProgress {
  enrolledAt: string
  completedLessons: string[]
  lastLessonId?: string
}

export type ProgressMap = Record<string, CourseProgress>
