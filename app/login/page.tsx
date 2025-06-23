"use client"

import { EnhancedLoginForm } from "@/components/auth/enhanced-login-form"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { profile } = useAuth()

  const handleLoginSuccess = (newProfile: any) => {
    if (!newProfile.profile_completed) {
      router.replace("/onboarding")
    } else {
      switch (newProfile.role) {
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

  return (
    <div>
      <EnhancedLoginForm onBack={() => router.push("/")} onSuccess={handleLoginSuccess} />
    </div>
  )
}
