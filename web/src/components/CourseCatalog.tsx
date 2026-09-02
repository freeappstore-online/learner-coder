import { useState } from 'react'
import { Card, SearchInput, Badge, ProgressBar } from '@freeappstore/sdk/ui'
import type { Course, ProgressMap } from '../types'
import { courseCompletionPct, isCourseComplete, isEnrolled } from '../lib/progress'
import { LanguageIcon } from './LanguageIcon'

export function CourseCatalog({
  courses,
  progress,
  onOpenCourse,
}: {
  courses: Course[]
  progress: ProgressMap
  onOpenCourse: (courseId: string) => void
}) {
  const [query, setQuery] = useState('')
  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <h1 className="display-font text-2xl font-bold text-[var(--ink)]">Courses</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Pick a course and start learning at your own pace.</p>

      <div className="mt-4">
        <SearchInput value={query} onChange={setQuery} placeholder="Search courses..." />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {filtered.map((course) => {
          const enrolled = isEnrolled(progress, course.id)
          const complete = isCourseComplete(progress, course)
          return (
            <Card key={course.id} onClick={() => onOpenCourse(course.id)} style={{ cursor: 'pointer' }}>
              <div className="flex items-start gap-3">
                <LanguageIcon id={course.icon} className="h-7 w-7 shrink-0 rounded" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--ink)]">{course.title}</span>
                    {complete ? (
                      <Badge variant="success">Completed</Badge>
                    ) : enrolled ? (
                      <Badge variant="accent">Enrolled</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{course.description}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{course.lessons.length} lessons</p>
                  {enrolled && !complete && (
                    <div className="mt-2 max-w-xs">
                      <ProgressBar value={courseCompletionPct(progress, course)} />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <p className="mt-6 text-center text-sm text-[var(--muted)]">No courses match "{query}".</p>
        )}
      </div>
    </div>
  )
}
