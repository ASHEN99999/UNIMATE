"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { User, UserRole, ProviderType } from "@/lib/types"
import { authService } from "@/lib/services"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: UserRole, providerType?: ProviderType) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = sessionStorage.getItem("unimate_user")
        const token = sessionStorage.getItem("unimate_token")
        
        if (storedUser && token) {
          // Immediately set user from localStorage
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsLoading(false)
          
          // Verify token in background (optional - don't block UI)
          try {
            const freshUserData = await authService.getProfile()
            setUser(freshUserData)
            sessionStorage.setItem("unimate_user", JSON.stringify(freshUserData))
          } catch (error) {
            // Only clear user if it's a 401 (unauthorized)
            // Don't clear on network errors or if backend is down
            if (error instanceof Error && error.message.includes("401")) {
              sessionStorage.removeItem("unimate_user")
              sessionStorage.removeItem("unimate_token")
              setUser(null)
            }
            // Otherwise keep the cached user
          }
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        // Failed to parse stored user, clear it
        sessionStorage.removeItem("unimate_user")
        sessionStorage.removeItem("unimate_token")
        setUser(null)
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      const response = await authService.login({
        universityEmail: email,
        password,
      })
      
      setUser(response.user)
      sessionStorage.setItem("unimate_user", JSON.stringify(response.user))
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole, providerType?: ProviderType) => {
    setIsLoading(true)
    
    try {
      const response = await authService.register({
        name,
        universityEmail: email,
        password,
        role,
        providerType,
      })
      
      setUser(response.user)
      sessionStorage.setItem("unimate_user", JSON.stringify(response.user))
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    sessionStorage.removeItem("unimate_user")
  }, [])

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) return
    
    setIsLoading(true)
    
    try {
      const updatedUser = await authService.updateProfile(data)
      setUser(updatedUser)
      sessionStorage.setItem("unimate_user", JSON.stringify(updatedUser))
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
