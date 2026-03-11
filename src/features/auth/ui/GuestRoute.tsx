import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'

// Redirects already-authenticated users away from /login
export function GuestRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}
