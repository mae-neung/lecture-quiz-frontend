import { createContext } from 'react'

export type AuthContextValue = {
  isLoggedIn: boolean
  userId: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
