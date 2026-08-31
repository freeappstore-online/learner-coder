import { useState } from 'react'
import { ConfirmDialog } from '@freeappstore/sdk/ui'
import type { Course, Profile, ProgressMap } from '../types'
import { totalCoursesCompleted, totalLessonsCompleted } from '../lib/progress'

export function ProfileView({
  profile,
  courses,
  progress,
  onBack,
  onRename,
  onReset,
}: {
  profile: Profile
  courses: Course[]
  progress: ProgressMap
  onBack: () => void
  onRename: (name: string) => void
  onReset: () => void
}) {
  const [name, setName] = useState(profile.name)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <button onClick={onBack} className="text-sm text-[var(--muted)]">
        ← Back
      </button>

      <h1 className="display-font mt-3 text-2xl font-bold text-[var(--ink)]">Profile</h1>

      <div
        className="mt-4 rounded-2xl border p-5"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Name</label>
        <div className="mt-2 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--paper)', color: 'var(--ink)' }}
          />
          <button
            onClick={() => name.trim() && onRename(name.trim())}
            disabled={!name.trim() || name.trim() === profile.name}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: 'var(--accent)' }}
          >
            Save
          </button>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Learning since {new Date(profile.joinedAt).toLocaleDateString()}
        </p>
      </div>

      <div
        className="mt-4 rounded-2xl border p-5"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Stats</div>
        <div className="mt-3 flex gap-6">
          <div>
            <div className="text-2xl font-bold text-[var(--ink)]">{totalLessonsCompleted(progress)}</div>
            <div className="text-xs text-[var(--muted)]">Lessons done</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--ink)]">{totalCoursesCompleted(progress, courses)}</div>
            <div className="text-xs text-[var(--muted)]">Courses finished</div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border p-5" style={{ borderColor: 'var(--error)' }}>
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--error)' }}>
          Danger zone
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Erase your name and all course progress stored on this device. This cannot be undone.
        </p>
        <button
          onClick={() => setConfirmOpen(true)}
          className="mt-3 rounded-xl border px-4 py-2 text-sm font-semibold"
          style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
        >
          Reset all progress
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          onReset()
        }}
        title="Reset all progress?"
        message="This deletes your name and every course's progress from this browser. This cannot be undone."
        confirmLabel="Reset everything"
        variant="danger"
      />

      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        Free, MIT-licensed, no tracking — part of{' '}
        <a href="https://freeappstore.online" className="underline">
          FreeAppStore
        </a>
      </p>
    </div>
  )
}
