import type { ReactNode } from 'react'
import { ThemeToggle, TextSizeToggle } from '@freeappstore/sdk/ui'

export function AppShell({
  name,
  onProfileClick,
  children,
}: {
  name: string
  onProfileClick: () => void
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header
        className="sticky top-0 z-50 flex items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex items-center gap-2">
          <span className="display-font text-lg font-bold text-[var(--ink)]">learner-coder</span>
        </div>
        <div className="flex items-center gap-2">
          <TextSizeToggle />
          <ThemeToggle />
          <button
            onClick={onProfileClick}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: 'var(--accent)' }}
            title={name}
          >
            {name.slice(0, 1).toUpperCase()}
          </button>
        </div>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
