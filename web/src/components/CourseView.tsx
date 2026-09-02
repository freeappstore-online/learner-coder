import { Badge, ListRow, ProgressBar } from '@freeappstore/sdk/ui'
import type { Course, ProgressMap } from '../types'
import { courseCompletionPct, isEnrolled, isLessonUnlocked } from '../lib/progress'
import { LanguageIcon } from './LanguageIcon'

export function CourseView({
  course,
  progress,
  onBack,
  onEnroll,
  onOpenLesson,
}: {
  course: Course
  progress: ProgressMap
  onBack: () => void
  onEnroll: (courseId: string) => void
  onOpenLesson: (lessonId: string) => void
}) {
  const enrolled = isEnrolled(progress, course.id)
  const completedLessons = progress[course.id]?.completedLessons ?? []
  const pct = courseCompletionPct(progress, course)

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <button onClick={onBack} className="text-sm text-[var(--muted)]">
        ← Back
      </button>

      <div className="mt-3 flex items-start gap-4">
        <LanguageIcon id={course.icon} className="h-11 w-11 shrink-0 rounded-lg" />
        <div className="flex-1">
          <h1 className="display-font text-2xl font-bold text-[var(--ink)]">{course.title}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{course.description}</p>
        </div>
      </div>

      {enrolled ? (
        <div className="mt-4">
          <ProgressBar value={pct} label={`${pct}% complete`} />
        </div>
      ) : (
        <button
          onClick={() => onEnroll(course.id)}
          className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: 'var(--accent)' }}
        >
          Enroll in this course
        </button>
      )}

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Lessons</h2>
      <div className="mt-2 flex flex-col gap-1">
        {course.lessons.map((lesson, i) => {
          const done = completedLessons.includes(lesson.id)
          const unlocked = enrolled && isLessonUnlocked(progress, course, i)
          return (
            <ListRow
              key={lesson.id}
              icon={done ? '✅' : unlocked ? `${i + 1}` : '🔒'}
              title={lesson.title}
              subtitle={`${lesson.minutes} min`}
              trailing={done ? <Badge variant="success">Done</Badge> : undefined}
              onClick={unlocked ? () => onOpenLesson(lesson.id) : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
