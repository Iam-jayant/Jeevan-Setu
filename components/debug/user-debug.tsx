"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function UserDebug() {
  const [authUser, setAuthUser] = useState<any>(null)
  const [dbUser, setDbUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkUserState = async () => {
    setLoading(true)
    try {
      // Check session first
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession()

      setSession(currentSession)

      if (sessionError) {
        console.error("Session error:", sessionError)
        setAuthUser(null)
        setDbUser(null)
        return
      }

      // If no session, clear everything
      if (!currentSession || !currentSession.user) {
        setAuthUser(null)
        setDbUser(null)
        return
      }

      // Set auth user from session
      setAuthUser(currentSession.user)

      // Check database user
      const { data: dbUsers, error } = await supabase.from("users").select("*").eq("id", currentSession.user.id)

      if (error) {
        console.error("DB query error:", error)
        setDbUser(null)
      } else {
        setDbUser(dbUsers)
      }
    } catch (error) {
      console.error("Debug error:", error)
      setSession(null)
      setAuthUser(null)
      setDbUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkUserState()
  }, [])

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-sm">Debug: Auth State</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-xs font-medium">Session:</p>
          <p className="text-xs text-gray-600">{session ? "Active" : "None"}</p>
        </div>
        <div>
          <p className="text-xs font-medium">Auth User:</p>
          <p className="text-xs text-gray-600">{authUser ? `ID: ${authUser.id.slice(0, 8)}...` : "None"}</p>
        </div>
        <div>
          <p className="text-xs font-medium">DB Users Found:</p>
          <p className="text-xs text-gray-600">{dbUser ? `${dbUser.length} records` : "None"}</p>
        </div>
        {dbUser && dbUser.length > 0 && (
          <div>
            <p className="text-xs font-medium">Profile Completed:</p>
            <p className="text-xs text-gray-600">{dbUser[0].profile_completed ? "Yes" : "No"}</p>
            <p className="text-xs font-medium">Role:</p>
            <p className="text-xs text-gray-600">{dbUser[0].role}</p>
          </div>
        )}
        <Button onClick={checkUserState} size="sm" disabled={loading}>
          {loading ? "Checking..." : "Refresh"}
        </Button>
      </CardContent>
    </Card>
  )
}