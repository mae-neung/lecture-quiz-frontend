import { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import { isApiMode, loginApi, logoutApi } from '@/services/api'
import { apiSessionKey } from '@/services/apiStorage'

const SESSION_KEY = 'lecture-quiz-demo-session'

function readSession(): string | null {
  try {
    if (isApiMode) return window.sessionStorage.getItem(apiSessionKey())?.trim() || null
    return window.sessionStorage.getItem(SESSION_KEY) === 'active' ? 'demo' : null
  } catch {
    return null
  }
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState(readSession)

  async function login(username: string, password: string) {
    if (!isApiMode && (username !== 'test1234' || password !== 'test1234')) return false

    try {
      const nextId = isApiMode ? await loginApi(username, password) : 'demo'
      window.sessionStorage.setItem(isApiMode ? apiSessionKey() : SESSION_KEY, isApiMode ? nextId : 'active')
      setUserId(nextId)
      return true
    } catch (error) {
      if (isApiMode && error instanceof Error) throw error
      return false
    }
  }

  function logout() {
    try {
      window.sessionStorage.removeItem(isApiMode ? apiSessionKey() : SESSION_KEY)
    } finally {
      setUserId(null)
      if (isApiMode && userId) void logoutApi(userId).catch(() => undefined)
    }
  }

  return <AuthContext.Provider value={{ isLoggedIn: userId !== null, userId, login, logout }}>{children}</AuthContext.Provider>
}

export default AuthProvider
