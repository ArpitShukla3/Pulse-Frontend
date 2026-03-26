import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { ProtectedRoute } from '@/components/protected-route'
import { SignInPage } from '@/pages/sign-in-page'
import { SignUpPage } from '@/pages/sign-up-page'
import { NotFoundPage } from '@/pages/not-found-page'

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <SignInPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <App />,
      },
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
