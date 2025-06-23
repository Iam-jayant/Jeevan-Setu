"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft, Shield } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface LoginFormProps {
  onBack: () => void
  onSuccess: () => void
}

export function LoginForm({ onBack, onSuccess }: LoginFormProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Check if user profile exists
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)

        if (profileError) {
          console.error("Error checking user profile:", profileError)
          throw new Error("Failed to load user profile")
        }

        if (!userProfile || userProfile.length === 0) {
          throw new Error("User profile not found. Please contact support.")
        }

        onSuccess()
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button onClick={onBack} variant="ghost" className="mb-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.back")}
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
                  className="rounded-lg h-12"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-12 text-lg font-medium"
              >
                {loading ? t("common.loading") : t("auth.signin")}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Medical Professional?</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Doctor and Admin accounts are created by our team. Contact support for access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
