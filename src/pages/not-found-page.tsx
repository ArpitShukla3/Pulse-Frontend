import { Link, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const location = useLocation()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border/70 bg-background/75 px-6 py-16 text-center">
      <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">
        Fallback page
      </p>
      <h2 className="mt-3 font-heading text-4xl tracking-tight">404</h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        No route matched <span className="font-medium text-foreground">{location.pathname}</span>.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Return home</Link>
      </Button>
    </div>
  )
}
