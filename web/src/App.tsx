import { useEffect, useState } from 'react'
import { Tabs, BuildInfo } from '@freeappstore/sdk/ui'
import { AppShell } from './components/AppShell'
import { Onboarding } from './components/Onboarding'
import { Home } from './components/Home'
import { CourseCatalog } from './components/CourseCatalog'
import { CourseView } from './components/CourseView'
import { LessonView } from './components/LessonView'
import { ProfileView } from './components/ProfileView'
import { courses, findCourse, findLesson } from './lib/curriculum'
import { loadProfile, saveProfile, loadProgress, saveProgress, clearAllData } from './lib/storage'
import { completeLesson, enroll } from './lib/progress'
import type { Profile, ProgressMap } from './types'

type Screen =
  | { view: 'home' }
  | { view: 'catalog' }
  | { view: 'course'; courseId: string }
  | { view: 'lesson'; courseId: string; lessonId: string }
  | { view: 'profile' }

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile())
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress())
  const [screen, setScreen] = useState<Screen>({ view: 'home' })

  useEffect(() => {
    if (profile) saveProfile(profile)
  }, [profile])

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  if (!profile) {
    return (
      <Onboarding
        onComplete={(name) => setProfile({ name, joinedAt: new Date().toISOString() })}
      />
    )
  }

  const activeTab: 'home' | 'catalog' | 'other' =
    screen.view === 'home' ? 'home' : screen.view === 'catalog' ? 'catalog' : 'other'

  return (
    <AppShell name={profile.name} onProfileClick={() => setScreen({ view: 'profile' })}>
      {activeTab !== 'other' && (
        <div className="mx-auto w-full max-w-2xl px-4 pt-4">
          <Tabs
            tabs={[
              { key: 'home', label: 'Home' },
              { key: 'catalog', label: 'Courses' },
            ]}
            active={activeTab}
            onChange={(key) => setScreen({ view: key as 'home' | 'catalog' })}
          />
        </div>
      )}

      {screen.view === 'home' && (
        <Home
          name={profile.name}
          courses={courses}
          progress={progress}
          onOpenCourse={(courseId) => setScreen({ view: 'course', courseId })}
          onBrowse={() => setScreen({ view: 'catalog' })}
        />
      )}

      {screen.view === 'catalog' && (
        <CourseCatalog
          courses={courses}
          progress={progress}
          onOpenCourse={(courseId) => setScreen({ view: 'course', courseId })}
        />
      )}

      {screen.view === 'course' &&
        (() => {
          const course = findCourse(screen.courseId)
          if (!course) return null
          return (
            <CourseView
              course={course}
              progress={progress}
              onBack={() => setScreen({ view: 'catalog' })}
              onEnroll={(courseId) => setProgress((p) => enroll(p, courseId))}
              onOpenLesson={(lessonId) => setScreen({ view: 'lesson', courseId: course.id, lessonId })}
            />
          )
        })()}

      {screen.view === 'lesson' &&
        (() => {
          const course = findCourse(screen.courseId)
          const lesson = findLesson(screen.courseId, screen.lessonId)
          if (!course || !lesson) return null
          const lessonIndex = course.lessons.findIndex((l) => l.id === lesson.id)
          const nextLesson = course.lessons[lessonIndex + 1]
          const completedLessons = progress[course.id]?.completedLessons ?? []
          return (
            <LessonView
              course={course}
              lesson={lesson}
              alreadyCompleted={completedLessons.includes(lesson.id)}
              isNextLesson={Boolean(nextLesson)}
              onBack={() => setScreen({ view: 'course', courseId: course.id })}
              onComplete={(lessonId) => setProgress((p) => completeLesson(p, course.id, lessonId))}
              onNext={() => nextLesson && setScreen({ view: 'lesson', courseId: course.id, lessonId: nextLesson.id })}
            />
          )
        })()}

      {screen.view === 'profile' && (
        <ProfileView
          profile={profile}
          courses={courses}
          progress={progress}
          onBack={() => setScreen({ view: 'home' })}
          onRename={(name) => setProfile({ ...profile, name })}
          onReset={() => {
            clearAllData()
            setProfile(null)
            setProgress({})
            setScreen({ view: 'home' })
          }}
        />
      )}

      <BuildInfo />
    </AppShell>
  )
}
