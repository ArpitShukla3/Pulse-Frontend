import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { useUiStore } from '@/store/ui-store'

const themes = [
  { value: 'light', label: 'Light mode', icon: Sun },
  { value: 'dark', label: 'Dark mode', icon: Moon },
  { value: 'system', label: 'System mode', icon: Monitor },
] as const

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const notes = useUiStore((state) => state.notes)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
          Settings
        </p>
        <h2 className="mt-2 font-heading text-3xl tracking-tight">Appearance</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Theme preference is persisted in local storage. You can also keep the app
          aligned with the operating system.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {themes.map(({ value, label, icon: Icon }) => {
          const active = theme === value

          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={[
                'rounded-[1.5rem] border p-5 text-left transition',
                active
                  ? 'border-accent/60 bg-accent/10 shadow-sm'
                  : 'border-border/60 bg-background/70 hover:border-border hover:bg-muted/35',
              ].join(' ')}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-base font-medium">{label}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {active ? 'Currently selected' : 'Click to apply this theme'}
              </p>
            </button>
          )
        })}
      </div>

      <div className="rounded-[1.75rem] border border-border/60 bg-background/85 p-6">
        <h3 className="text-lg font-semibold">Shared store check</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          This route reads the same Zustand state used on the workspace page.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="rounded-full border border-border/70 px-4 py-2 text-sm">
            {notes.length} records in memory
          </div>
          <Button variant="secondary" onClick={() => setTheme('dark')}>
            Preview dark mode
          </Button>
        </div>
      </div>
    </div>
  )
}
