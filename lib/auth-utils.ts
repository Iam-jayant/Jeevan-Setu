import { supabase } from "@/lib/supabase"

export interface UserProfile {
  id: string
  email: string
  role: "donor" | "recipient" | "doctor" | "admin"
  full_name: string | null
  phone: string | null
  profile_completed: boolean
  created_at: string
  updated_at: string
}

export async function getCurrentUser() {
  try {
    // First get the session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return { user: null, profile: null, error: sessionError }
    }

    // If no session, user is not logged in (this is normal, not an error)
    if (!session || !session.user) {
      return { user: null, profile: null, error: null }
    }

    const user = session.user

    // Fetch user profile from database
    const { data: profiles, error: profileError } = await supabase.from("users").select("*").eq("id", user.id)

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return { user, profile: null, error: profileError }
    }

    if (!profiles || profiles.length === 0) {
      console.log("No user profile found in database")
      return { user, profile: null, error: null }
    }

    if (profiles.length > 1) {
      console.warn("Multiple user profiles found, using the first one")
    }

    const profile = profiles[0] as UserProfile

    return { user, profile, error: null }
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return { user: null, profile: null, error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error("Error signing out:", error)
    return { error }
  }
}

export function getRedirectPath(profile: UserProfile | null): string {
  if (!profile) return "/login"

  if (!profile.profile_completed) {
    return "/onboarding"
  }

  switch (profile.role) {
    case "donor":
      return "/dashboard/donor"
    case "recipient":
      return "/dashboard/recipient"
    case "doctor":
    case "admin":
  return "/dashboard/doctor"
    default:
      return "/dashboard"
  }
}

export function canAccessRole(userRole: string, requiredRole: string | string[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole)
  }
  return userRole === requiredRole
}
