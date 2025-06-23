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
import { Heart, Users, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"

interface SignupFormProps {
  onBack: () => void
  onSuccess: (userId: string, role: "donor" | "recipient") => void
}

export function SignupForm({ onBack, onSuccess }: SignupFormProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<"donor" | "recipient">("donor")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!agreeToTerms) {
      setError("Please agree to the privacy policy and medical terms")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
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

      if (error) throw error

      if (data.user) {
        // Insert into users table
        await supabase.from("users").insert({
          id: data.user.id,
          email,
          role,
          full_name: fullName,
          phone,
          profile_completed: false,
        })
        // Show confirmation message
        setShowConfirmation(true)
      }
    } catch (error: any) {
      setError(error.message || "Signup failed.")
    } finally {
      setLoading(false)
    }
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {t("auth.signup.thankYouTitle")}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t("auth.signup.thankYouSubtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-gray-700 mb-4">
                  {t("auth.signup.checkEmail")}
                </p>
                <Button
                  onClick={() => router.push("/auth/signin")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg h-12 text-lg font-medium"
                >
                  {t("auth.signin")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t("auth.role")}</Label>
                <Select value={role} onValueChange={(value: "donor" | "recipient") => setRole(value)}>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="rounded-lg h-12"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
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
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>
              )}

              <Button
                type="submit"
                disabled={loading || !agreeToTerms}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg h-12 text-lg font-medium"
              >
                {loading ? t("common.loading") : t("auth.signup")}
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
