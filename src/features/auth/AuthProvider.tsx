import { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext'

const SESSION_KEY = 'lecture-quiz-demo-session'

function readSession() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === 'active'
  } catch {
    return false
  }
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(readSession)

  function login(username: string, password: string) {
    if (username !== 'test1234' || password !== 'test1234') return false

    try {
      window.sessionStorage.setItem(SESSION_KEY, 'active')
      setIsLoggedIn(true)
      return true
    } catch {
      return false
    }
  }

  function logout() {
    try {
      window.sessionStorage.removeItem(SESSION_KEY)
    } finally {
      setIsLoggedIn(false)
    }
  }

  return <AuthContext.Provider value={{ isLoggedIn, login, logout }}>{children}</AuthContext.Provider>
}

export default AuthProvider
