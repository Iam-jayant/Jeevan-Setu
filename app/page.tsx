"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { HomePage } from "@/components/home/home-page"
import { LanguageProvider } from "@/contexts/language-context"

export default function Home() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect authenticated users to their respective dashboards
    if (!loading && user && profile) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        if (!profile.profile_completed) {
          router.replace("/onboarding")
        } else {
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
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user, profile, loading, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading Jeevan Setu...</p>
          </div>
        </div>
      </LanguageProvider>
    )
  }

  // If user is not authenticated or still loading, show home page
  return (
    <LanguageProvider>
      <HomePage />
    </LanguageProvider>
  )
}
