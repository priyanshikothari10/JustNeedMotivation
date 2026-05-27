"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  syncData: async () => {}
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.isAuthenticated) {
            setUser(data.user)
            setIsAuthenticated(true)
          } else {
            setUser(null)
            setIsAuthenticated(false)
          }
        }
      } catch (err) {
        console.error('Error loading current user:', err)
      } finally {
        setLoading(false)
      }
    }
    loadMe()
  }, [])

  async function login(email, password) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }
      setUser(data.user)
      setIsAuthenticated(true)
      router.push('/')
      return { success: true }
    } catch (err) {
      console.error(err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  async function signup(name, email, password) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed')
      }
      setUser(data.user)
      setIsAuthenticated(true)
      router.push('/')
      return { success: true }
    } catch (err) {
      console.error(err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setIsAuthenticated(false)
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function syncData(updatedFields) {
    if (!isAuthenticated) return
    try {
      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setUser(data.user)
        }
      }
    } catch (err) {
      console.error('Error syncing user data:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, signup, logout, syncData }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
