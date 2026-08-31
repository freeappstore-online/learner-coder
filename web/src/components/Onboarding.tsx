import { useState } from 'react'

export function Onboarding({ onComplete }: { onComplete: (name: string) => void }) {
  const [name, setName] = useState('')

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onComplete(trimmed)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 pb-[12vh]">
      <div
        className="w-full max-w-sm rounded-2xl border p-8 text-center"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow)' }}
      >
        <div className="text-4xl">👋</div>
        <h1 className="display-font mt-3 text-2xl font-bold text-[var(--ink)]">Welcome to learner-coder</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Free, self-paced coding courses that live entirely on this device. What should we call you?
        </p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Your name"
          className="mt-5 w-full rounded-xl border px-4 py-2.5 text-center text-sm outline-none"
          style={{ borderColor: 'var(--border)', background: 'var(--paper)', color: 'var(--ink)' }}
        />
        <button
          onClick={submit}
          disabled={!name.trim()}
          className="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: 'var(--accent)' }}
        >
          Start learning
        </button>
        <p className="mt-4 text-xs text-[var(--muted)]">
          No account needed — your name and progress are saved only in this browser.
        </p>
      </div>
    </div>
  )
}
