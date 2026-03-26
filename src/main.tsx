import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ThemeProvider } from '@/components/theme-provider'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { Toaster } from '@/components/ui/sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="pulse-theme">
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  </StrictMode>,
)
