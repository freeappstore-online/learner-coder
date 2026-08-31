import { useState } from 'react'
import type { Course, Lesson } from '../types'
import { CodePlayground } from './CodePlayground'

export function LessonView({
  course,
  lesson,
  isNextLesson,
  alreadyCompleted,
  onBack,
  onComplete,
  onNext,
}: {
  course: Course
  lesson: Lesson
  isNextLesson: boolean
  alreadyCompleted: boolean
  onBack: () => void
  onComplete: (lessonId: string) => void
  onNext: () => void
}) {
  const [passed, setPassed] = useState(alreadyCompleted)

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      {/* Left: reading pane */}
      <div className="w-full overflow-y-auto border-b px-4 py-6 md:w-1/2 md:border-b-0 md:border-r" style={{ borderColor: 'var(--border)' }}>
        <button onClick={onBack} className="text-sm text-[var(--muted)]">
          ← {course.title}
        </button>

        <h1 className="display-font mt-3 text-2xl font-bold text-[var(--ink)]">{lesson.title}</h1>
        <p className="mt-1 text-xs text-[var(--muted)]">{lesson.minutes} min</p>

        <div className="mt-5 flex flex-col gap-4">
          {lesson.content.map((paragraph, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-[var(--ink)]">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Challenge</div>
          <p className="mt-2 text-[15px] text-[var(--ink)]">{lesson.exercise.prompt}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">Write your code in the editor on the right, then hit Run.</p>
        </div>

        {passed && (
          <div className="mt-6">
            {isNextLesson ? (
              <button
                onClick={onNext}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ background: 'var(--accent)' }}
              >
                Next lesson →
              </button>
            ) : (
              <button
                onClick={onBack}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ background: 'var(--accent)' }}
              >
                Back to course
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right: IDE pane */}
      <div className="flex min-h-[70vh] w-full flex-col md:min-h-0 md:w-1/2">
        <CodePlayground
          key={lesson.id}
          exercise={lesson.exercise}
          alreadyPassed={alreadyCompleted}
          onPass={() => {
            setPassed(true)
            onComplete(lesson.id)
          }}
        />
      </div>
    </div>
  )
}
