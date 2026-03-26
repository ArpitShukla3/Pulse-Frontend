import { ArrowRight, Boxes, Palette, Route } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useUiStore } from '@/store/ui-store'

const features = [
  {
    title: 'Tailwind CSS',
    description: 'Utility-first styling is active through the Vite plugin pipeline.',
    icon: Palette,
  },
  {
    title: 'shadcn/ui baseline',
    description: 'Reusable UI primitives follow the shadcn structure and aliasing.',
    icon: Boxes,
  },
  {
    title: 'React Router',
    description: 'Route composition is set up with a dedicated not-found experience.',
    icon: Route,
  },
]

export function HomePage() {
  const notes = useUiStore((state) => state.notes)

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-border/60 bg-background/85 p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
          Starter status
        </p>
        <h2 className="mt-2 max-w-2xl font-heading text-3xl tracking-tight sm:text-4xl">
          The foundation is in place for a routed, theme-aware frontend.
        </h2>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Build features on top of a shared app shell instead of the default Vite
          starter. Routing, state, and UI primitives are already connected.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/settings">
              Open settings
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a href="https://ui.shadcn.com/docs" target="_blank" rel="noreferrer">
              shadcn docs
            </a>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="rounded-[1.5rem] border border-border/60 bg-muted/35 p-5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/12 text-accent">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-[1.75rem] border border-border/60 bg-background/85 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Zustand store snapshot</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Shared state is available across pages without additional boilerplate.
            </p>
          </div>
          <div className="rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground">
            {notes.length} items
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-2xl border border-border/60 bg-card px-4 py-3"
            >
              <div className="font-medium">{note.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {note.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
