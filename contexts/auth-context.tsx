"use client"
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { getCurrentUser, signOut, UserProfile } from "@/lib/auth-utils"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      const { user, profile } = await getCurrentUser()
      setUser(user)
      setProfile(profile)
      setLoading(false)
    }
    fetchUser()

    // Listen to Supabase auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      fetchUser()
    })
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await signOut()
    setUser(null)
    setProfile(null)
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
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