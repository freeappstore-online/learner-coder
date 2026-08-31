import type { Course, ProgressMap } from '../types'

export function isEnrolled(progress: ProgressMap, courseId: string): boolean {
  return Boolean(progress[courseId])
}

export function enroll(progress: ProgressMap, courseId: string): ProgressMap {
  if (progress[courseId]) return progress
  return {
    ...progress,
    [courseId]: { enrolledAt: new Date().toISOString(), completedLessons: [] },
  }
}

export function completeLesson(progress: ProgressMap, courseId: string, lessonId: string): ProgressMap {
  const existing = progress[courseId] ?? { enrolledAt: new Date().toISOString(), completedLessons: [] }
  if (existing.completedLessons.includes(lessonId)) {
    return { ...progress, [courseId]: { ...existing, lastLessonId: lessonId } }
  }
  return {
    ...progress,
    [courseId]: {
      ...existing,
      completedLessons: [...existing.completedLessons, lessonId],
      lastLessonId: lessonId,
    },
  }
}

export function courseCompletionCount(progress: ProgressMap, course: Course): number {
  return progress[course.id]?.completedLessons.length ?? 0
}

export function courseCompletionPct(progress: ProgressMap, course: Course): number {
  const done = courseCompletionCount(progress, course)
  return course.lessons.length === 0 ? 0 : Math.round((done / course.lessons.length) * 100)
}

export function isCourseComplete(progress: ProgressMap, course: Course): boolean {
  return courseCompletionCount(progress, course) === course.lessons.length
}

/** First lesson index is always unlocked; later lessons unlock once the previous one is complete. */
export function isLessonUnlocked(progress: ProgressMap, course: Course, lessonIndex: number): boolean {
  if (lessonIndex === 0) return true
  const completed = progress[course.id]?.completedLessons ?? []
  return completed.includes(course.lessons[lessonIndex - 1].id)
}

export function totalLessonsCompleted(progress: ProgressMap): number {
  return Object.values(progress).reduce((sum, p) => sum + p.completedLessons.length, 0)
}

export function totalCoursesCompleted(progress: ProgressMap, courses: Course[]): number {
  return courses.filter((c) => isCourseComplete(progress, c)).length
}
