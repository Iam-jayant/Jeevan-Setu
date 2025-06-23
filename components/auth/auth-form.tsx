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
import { Heart, Users, Shield } from "lucide-react"

interface AuthFormProps {
  mode: "login" | "signup"
  onToggleMode: () => void
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<"donor" | "recipient">("donor")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (mode === "signup" && !agreeToTerms) {
      setError("Please agree to the privacy policy and medical terms")
      setLoading(false)
      return
    }

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error

        if (data.user) {
          // Insert user profile
          const { error: profileError } = await supabase.from("users").insert({
            id: data.user.id,
            email,
            role,
            full_name: fullName,
            phone,
          })

          if (profileError) throw profileError
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {mode === "login" ? "Welcome Back" : "Join Jeevan Setu"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {mode === "login"
              ? "Sign in to your account to continue your journey of giving life"
              : "Create your account to start saving lives through organ donation"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">I want to be a</Label>
                  <Select value={role} onValueChange={(value: "donor" | "recipient") => setRole(value)}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donor">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-green-600" />
                          Organ Donor
                        </div>
                      </SelectItem>
                      <SelectItem value="recipient">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          Organ Recipient
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-lg"
              />
            </div>

            {mode === "signup" && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    privacy policy
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    medical terms
                  </a>
                </Label>
              </div>
            )}

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

            <Button
              type="submit"
              disabled={loading || (mode === "signup" && !agreeToTerms)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-12"
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={onToggleMode} className="text-blue-600 hover:underline text-sm">
              {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          {mode === "login" && (
            <div className="mt-4 p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Medical Professional?</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Doctor and Admin accounts are created by our team. Contact support for access.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
