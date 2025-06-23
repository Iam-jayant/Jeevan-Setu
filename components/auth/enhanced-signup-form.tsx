"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Users, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface EnhancedSignupFormProps {
  onBack: () => void
  onSuccess: (userId: string, role: "donor" | "recipient") => void
}

export function EnhancedSignupForm({ onBack, onSuccess }: EnhancedSignupFormProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<"donor" | "recipient">("donor")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const validateForm = () => {
    if (!fullName.trim()) {
      setError("Full name is required")
      return false
    }

    if (!phone.trim()) {
      setError("Phone number is required")
      return false
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    if (!agreeToTerms) {
      setError("Please agree to the privacy policy and medical terms")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase.from("users").select("email").eq("email", email).single()

      if (existingUser) {
        throw new Error("An account with this email already exists. Please try logging in instead.")
      }

      // Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: role,
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (!data.user) {
        throw new Error("Signup failed - no user created")
      }

      // Wait a moment for the auth user to be fully created
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if email confirmation is required
      if (!data.session) {
        setError("A verification email has been sent. Please check your email, confirm your account, and then log in to complete your profile.")
        setLoading(false)
        return
      }

      // Create user profile in our users table
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        role,
        full_name: fullName,
        phone,
        profile_completed: false,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        // If it's a duplicate key error, that might be okay
        if (!profileError.message.includes("duplicate key")) {
          throw new Error("Failed to create user profile. Please try again.")
        }
      }

      // Success - proceed to onboarding
      onSuccess(data.user.id, role)
    } catch (error: any) {
      console.error("Signup error:", error)

      if (error.message?.includes("User already registered")) {
        setError("An account with this email already exists. Please try logging in instead.")
      } else if (error.message?.includes("Password should be at least 6 characters")) {
        setError("Password must be at least 6 characters long.")
      } else if (error.message?.includes("Invalid email")) {
        setError("Please enter a valid email address.")
      } else {
        setError(error.message || "An error occurred during signup. Please try again.")
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
              <div className="bg-green-100 p-3 rounded-full">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">{t("auth.signup.title")}</CardTitle>
            <CardDescription className="text-gray-600">{t("auth.signup.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="rounded-lg h-12"
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="rounded-lg h-12"
                  placeholder="+91 98765 43210"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t("auth.role")}</Label>
                <Select
                  value={role}
                  onValueChange={(value: "donor" | "recipient") => setRole(value)}
                  disabled={loading}
                >
                  <SelectTrigger className="rounded-lg h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donor">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-green-600" />
                        {t("auth.role.donor")}
                      </div>
                    </SelectItem>
                    <SelectItem value="recipient">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        {t("auth.role.recipient")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                    minLength={6}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  disabled={loading}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  {t("auth.terms")}{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    privacy policy
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    medical terms
                  </a>
                </Label>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading || !agreeToTerms}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg h-12 text-lg font-medium"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  t("auth.signup")
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={() => onBack()} className="text-blue-600 hover:underline text-sm">
                Already have an account? Sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
