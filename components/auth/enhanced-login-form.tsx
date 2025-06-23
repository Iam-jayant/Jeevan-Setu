"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { getRedirectPath } from "@/lib/auth-utils"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, ArrowLeft, Shield, Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface EnhancedLoginFormProps {
  onBack: () => void
  onSuccess: (profile: any) => void
}

export function EnhancedLoginForm({ onBack, onSuccess }: EnhancedLoginFormProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      if (!data.user || !data.session) {
        throw new Error("Login failed - no session created")
      }

      // Get current user and profile
      const { user, profile, error: profileError } = await getCurrentUser()

      if (profileError) {
        console.error("Profile fetch error:", profileError)
        throw new Error("Failed to load user profile. Please try again or contact support.")
      }

      // If no profile, redirect to onboarding to fill info
      if (!profile) {
        router.replace("/onboarding")
        return
      }

      // Success - call onSuccess with profile
      onSuccess(profile)
      // Redirect to onboarding or dashboard
      if (!profile.profile_completed) {
        router.replace("/onboarding")
      } else {
        router.replace(getRedirectPath(profile))
      }
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle specific error types
      if (error.message?.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please check your credentials and try again.")
      } else if (error.message?.includes("Email not confirmed")) {
        setError("Please check your email and click the confirmation link before logging in.")
      } else if (error.message?.includes("Too many requests")) {
        setError("Too many login attempts. Please wait a few minutes before trying again.")
      } else if (error.message?.includes("profile not found")) {
        setError("Account setup incomplete. Please contact support or try signing up again.")
      } else {
        setError(error.message || "Login failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button onClick={onBack} variant="ghost" className="mb-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">{t("auth.login.title")}</CardTitle>
            <CardDescription className="text-gray-600">{t("auth.login.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-lg h-12"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-lg h-12 pr-10"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-12 text-lg font-medium"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  t("auth.signin")
                )}
              </Button>
            </form>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-800">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Medical Professional?</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Doctor and Admin accounts are created by our team. Contact support for access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}