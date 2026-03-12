export type UserRole = 'Administrador' | 'Editor'

export interface AuthState {
  isAuthenticated: boolean
  username: string | null
  role: UserRole | null
}
