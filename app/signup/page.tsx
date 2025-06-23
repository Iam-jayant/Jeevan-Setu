"use client"

import { EnhancedSignupForm } from "@/components/auth/enhanced-signup-form"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()

  const handleSignupSuccess = (userId: string, role: "donor" | "recipient") => {
    router.replace("/onboarding")
  }

  return (
    <div>
      <EnhancedSignupForm onBack={() => router.push("/")} onSuccess={handleSignupSuccess} />
    </div>
  )
}
