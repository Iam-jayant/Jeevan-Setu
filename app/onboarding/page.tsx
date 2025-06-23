"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DonorProfileForm } from "@/components/onboarding/donor-profile-form"
import { RecipientProfileForm } from "@/components/onboarding/recipient-profile-form"

export default function OnboardingPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login")
      } else if (profile && profile.profile_completed) {
        switch (profile.role) {
          case "donor":
            router.replace("/dashboard/donor")
            break
          case "recipient":
            router.replace("/dashboard/recipient")
            break
          case "doctor":
          case "admin":
            router.replace("/dashboard/doctor")
            break
          default:
            router.replace("/dashboard")
        }
      }
    }
  }, [user, profile, loading, router])

  const handleProfileComplete = () => {
    // After profile is saved, redirect to dashboard based on role
    const role = profile?.role || user?.user_metadata?.role
    switch (role) {
      case "donor":
        router.replace("/dashboard/donor")
        break
      case "recipient":
        router.replace("/dashboard/recipient")
        break
      case "doctor":
      case "admin":
        router.replace("/dashboard/doctor")
        break
      default:
        router.replace("/dashboard")
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If profile is missing or not completed, let user fill onboarding form
  if (user && (!profile || !profile.profile_completed)) {
    const role = profile?.role || user.user_metadata?.role
    if (role === "donor") {
      return <DonorProfileForm userId={user.id} onComplete={handleProfileComplete} />
    }
    if (role === "recipient") {
      return <RecipientProfileForm userId={user.id} onComplete={handleProfileComplete} />
    }
    // fallback: ask user to contact support or re-login
    return <div className="min-h-screen flex items-center justify-center text-center">Unable to determine your role. Please contact support.</div>
  }

  // If profile is completed, redirect to dashboard
  if (profile) {
    switch (profile.role) {
      case "donor":
        router.replace("/dashboard/donor")
        break
      case "recipient":
        router.replace("/dashboard/recipient")
        break
      case "doctor":
      case "admin":
        router.replace("/dashboard/doctor")
        break
      default:
        router.replace("/dashboard")
    }
  }
  return null
}
