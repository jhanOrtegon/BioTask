import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, UserRole } from './types'

const VALID_CREDENTIALS = [
  { username: 'admin', password: 'admin**', role: 'Administrador' as UserRole },
  { username: 'editor', password: 'editor', role: 'Editor' as UserRole },
]

interface AuthStore extends AuthState {
  login: (username: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      role: null,
      login: (username: string, password: string) => {
        const match = VALID_CREDENTIALS.find(
          (c) => c.username === username && c.password === password
        )
        if (match) {
          set({
            isAuthenticated: true,
            username: match.username,
            role: match.role
          })
          return true
        }
        return false
      },
      logout: () => set({
        isAuthenticated: false,
        username: null,
        role: null
      }),
    }),
    {
      name: 'biotask-auth-storage',
    }
  )
)
