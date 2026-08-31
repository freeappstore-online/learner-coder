import { Card, ProgressBar, EmptyState, Badge } from '@freeappstore/sdk/ui'
import type { Course, ProgressMap } from '../types'
import {
  courseCompletionPct,
  isCourseComplete,
  isEnrolled,
  totalCoursesCompleted,
  totalLessonsCompleted,
} from '../lib/progress'

export function Home({
  name,
  courses,
  progress,
  onOpenCourse,
  onBrowse,
}: {
  name: string
  courses: Course[]
  progress: ProgressMap
  onOpenCourse: (courseId: string) => void
  onBrowse: () => void
}) {
  const enrolledCourses = courses.filter((c) => isEnrolled(progress, c.id))
  const inProgress = enrolledCourses.filter((c) => !isCourseComplete(progress, c))
  const completed = enrolledCourses.filter((c) => isCourseComplete(progress, c))

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <h1 className="display-font text-2xl font-bold text-[var(--ink)]">Welcome back, {name} 👋</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Let's keep the momentum going.</p>

      <div className="mt-4 flex gap-2">
        <Badge variant="accent">{totalLessonsCompleted(progress)} lessons completed</Badge>
        <Badge variant="success">{totalCoursesCompleted(progress, courses)} courses finished</Badge>
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Continue learning</h2>

      {inProgress.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            icon="📚"
            title="No courses in progress"
            message="Browse the catalog and enroll in your first course to get started."
            action={
              <button
                onClick={onBrowse}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ background: 'var(--accent)' }}
              >
                Browse courses
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {inProgress.map((course) => (
            <Card key={course.id} onClick={() => onOpenCourse(course.id)} style={{ cursor: 'pointer' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{course.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[var(--ink)]">{course.title}</div>
                  <div className="mt-2">
                    <ProgressBar value={courseCompletionPct(progress, course)} label={`${courseCompletionPct(progress, course)}%`} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <>
          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Completed</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {completed.map((course) => (
              <Card key={course.id} onClick={() => onOpenCourse(course.id)} style={{ cursor: 'pointer' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{course.icon}</span>
                  <div className="flex-1 font-semibold text-[var(--ink)]">{course.title}</div>
                  <Badge variant="success">Done</Badge>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
