import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState } from './types'

const VALID_CREDENTIALS = [
  { username: 'admin', password: 'admin**', role: 'Administrador' },
]

interface AuthStore extends AuthState {
  username: string | null
  role: string | null
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
          set({ isAuthenticated: true, username: match.username, role: match.role })
          return true
        }
        return false
      },
      logout: () => set({ isAuthenticated: false, username: null, role: null }),
    }),
    {
      name: 'biotask-auth-storage',
    }
  )
)
