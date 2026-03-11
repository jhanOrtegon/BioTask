import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState } from './types'

interface AuthStore extends AuthState {
  login: () => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'biotask-auth-storage',
    }
  )
)
