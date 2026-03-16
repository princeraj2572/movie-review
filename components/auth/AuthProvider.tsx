"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react"
import { supabase } from "@/lib/supabase"
import type { AuthUser } from "@/lib/auth"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const debounceTimer = useRef<NodeJS.Timeout>()
  const lastFetchTime = useRef<number>(0)
  const isLoadingRef = useRef(false)

  async function loadUser() {
    // Prevent concurrent requests
    if (isLoadingRef.current) return
    
    // Rate limit: only fetch once per 5 seconds
    const now = Date.now()
    if (now - lastFetchTime.current < 5000) return
    
    isLoadingRef.current = true
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setUser(null)
        setLoading(false)
        lastFetchTime.current = now
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
      setUser(profile || null)
      setLoading(false)
      lastFetchTime.current = now
    } finally {
      isLoadingRef.current = false
    }
  }

  async function debouncedLoadUser() {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    debounceTimer.current = setTimeout(() => {
      loadUser()
    }, 300)
  }

  useEffect(() => {
    loadUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      debouncedLoadUser()
    })
    return () => {
      subscription.unsubscribe()
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refresh: loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
