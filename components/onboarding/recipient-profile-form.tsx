"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, MapPin, Heart, Hospital } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const ORGAN_TYPES = ["kidney", "liver", "heart", "lung", "pancreas", "cornea", "bone_marrow"]
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const URGENCY_LEVELS = [
  { value: "critical", label: "Critical - Immediate need (within days)" },
  { value: "high", label: "High - Within weeks" },
  { value: "medium", label: "Medium - Within months" },
]
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
]

interface RecipientProfileFormProps {
  userId: string
  onComplete: () => void
}

export function RecipientProfileForm({ userId, onComplete }: RecipientProfileFormProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    organ_type: "",
    blood_group: "",
    age: "",
    city: "",
    state: "",
    pincode: "",
    address: "",
    urgency_level: "",
    medical_condition: "",
    hospital_name: "",
    doctor_name: "",
    doctor_contact: "",
    insurance_details: "",
  })
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreeToTerms) {
      setError("Please agree to the privacy policy and medical terms")
      return
    }

    setLoading(true)
    setError("")

    try {
      const ageGroup = Number.parseInt(formData.age) < 18 ? "pediatric" : "adult"

      // Ensure user exists in users table
      const { data: existingUser, error: userFetchError } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .single()
      if (userFetchError && userFetchError.code !== "PGRST116") throw userFetchError
      if (!existingUser) {
        // Try to get user info from auth
        const { data: authUser } = await supabase.auth.getUser()
        const email = authUser?.user?.email || ""
        const role = authUser?.user?.user_metadata?.role || "recipient"
        const { error: insertUserError } = await supabase.from("users").insert({
          id: userId,
          email,
          role,
          profile_completed: false,
        })
        if (insertUserError) throw insertUserError
      }

      const profileData = {
        user_id: userId,
        ...formData,
        age: Number.parseInt(formData.age),
        age_group: ageGroup,
        status: "pending" as const,
      }

      const { error: profileError } = await supabase.from("recipient_profiles").insert(profileData)
      if (profileError) throw profileError

      // Update user profile completion status
      const { error: userError } = await supabase.from("users").update({ profile_completed: true }).eq("id", userId)

      if (userError) throw userError

      // Create welcome notification
      await supabase.rpc("create_notification", {
        p_user_id: userId,
        p_type: "profile_update",
        p_title: "Profile Created Successfully!",
        p_message: "Your recipient profile has been created and is now under review by our medical team.",
      })

      onComplete()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("profile.title.recipient")}</h1>
          <p className="text-gray-600">Help us create your recipient profile to find compatible donors</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Medical Information
            </CardTitle>
            <CardDescription>Please provide accurate information for donor matching</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Medical Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organ_type">{t("profile.organ")} *</Label>
                  <Select
                    value={formData.organ_type}
                    onValueChange={(value) => setFormData({ ...formData, organ_type: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select organ needed" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGAN_TYPES.map((organ) => (
                        <SelectItem key={organ} value={organ}>
                          {organ.charAt(0).toUpperCase() + organ.slice(1).replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blood_group">{t("profile.blood")} *</Label>
                  <Select
                    value={formData.blood_group}
                    onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">{t("profile.age")} *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                    className="h-12"
                    placeholder="Enter your age"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency_level">{t("profile.urgency")} *</Label>
                  <Select
                    value={formData.urgency_level}
                    onValueChange={(value) => setFormData({ ...formData, urgency_level: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      {URGENCY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Medical Condition */}
              <div className="space-y-2">
                <Label htmlFor="medical_condition">{t("profile.condition")} *</Label>
                <Textarea
                  id="medical_condition"
                  value={formData.medical_condition}
                  onChange={(e) => setFormData({ ...formData, medical_condition: e.target.value })}
                  required
                  placeholder="Describe your medical condition requiring organ transplant..."
                  rows={3}
                />
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-medium">Location Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">{t("profile.city")} *</Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="h-12"
                      placeholder="Enter your city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">{t("profile.state")} *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => setFormData({ ...formData, state: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">{t("profile.pincode")} *</Label>
                    <Input
                      id="pincode"
                      type="text"
                      pattern="[0-9]{6}"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      required
                      className="h-12"
                      placeholder="123456"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t("profile.address")} *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="min-h-[80px]"
                    placeholder="Enter your complete address"
                  />
                </div>
              </div>

              {/* Hospital Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Hospital className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-medium">Hospital & Doctor Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospital_name">{t("profile.hospital")}</Label>
                    <Input
                      id="hospital_name"
                      type="text"
                      value={formData.hospital_name}
                      onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                      className="h-12"
                      placeholder="Hospital where you're receiving treatment"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor_name">Doctor Name</Label>
                    <Input
                      id="doctor_name"
                      type="text"
                      value={formData.doctor_name}
                      onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                      className="h-12"
                      placeholder="Your treating physician"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor_contact">Doctor Contact</Label>
                    <Input
                      id="doctor_contact"
                      type="text"
                      value={formData.doctor_contact}
                      onChange={(e) => setFormData({ ...formData, doctor_contact: e.target.value })}
                      className="h-12"
                      placeholder="Doctor's phone number or email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insurance_details">Insurance Details</Label>
                    <Input
                      id="insurance_details"
                      type="text"
                      value={formData.insurance_details}
                      onChange={(e) => setFormData({ ...formData, insurance_details: e.target.value })}
                      className="h-12"
                      placeholder="Insurance provider and policy number"
                    />
                  </div>
                </div>
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
                  . I understand that this information will be used for organ matching purposes.
                </Label>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>
              )}

              <Button
                type="submit"
                disabled={loading || !agreeToTerms}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-medium"
              >
                {loading ? t("common.loading") : t("profile.save")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
