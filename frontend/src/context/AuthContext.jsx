import React, { createContext, useContext, useEffect, useState } from 'react'
import { getProfileApi, loginApi, logoutApi, registerApi } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const profile = await getProfileApi()
          setUser(profile)
        } catch (err) {
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.removeItem('token')
            setToken(null)
            setUser(null)
          }
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email, password) => {
    const data = await loginApi({ email, password })
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
    return data
  }

  const register = async (userData) => {
    const data = await registerApi(userData)
    return data
  }

  const logout = async () => {
    await logoutApi()
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
