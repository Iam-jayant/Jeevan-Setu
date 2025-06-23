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
import { Stethoscope, MapPin, User, Clock } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const SPECIALIZATIONS = [
  "Nephrology",
  "Cardiology",
  "Hepatology",
  "Pulmonology",
  "Transplant Surgery",
  "Anesthesiology",
  "Critical Care",
  "General Medicine",
  "Emergency Medicine",
  "Other",
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

interface DoctorProfileFormProps {
  userId: string
  onComplete: () => void
}

export function DoctorProfileForm({ userId, onComplete }: DoctorProfileFormProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    medical_license_number: "",
    specialization: "",
    hospital_name: "",
    hospital_address: "",
    years_of_experience: "",
    qualification: "",
    department: "",
    contact_hours: "",
    emergency_contact: false,
  })
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreeToTerms) {
      setError("Please agree to the medical professional terms and conditions")
      return
    }

    setLoading(true)
    setError("")

    try {
      const profileData = {
        user_id: userId,
        ...formData,
        years_of_experience: Number.parseInt(formData.years_of_experience) || 0,
        status: "pending" as const,
      }

      const { error: profileError } = await supabase.from("doctor_profiles").insert(profileData)
      if (profileError) throw profileError

      // Update user profile completion status
      const { error: userError } = await supabase.from("users").update({ profile_completed: true }).eq("id", userId)

      if (userError) throw userError

      // Create welcome notification
      await supabase.rpc("create_notification", {
        p_user_id: userId,
        p_type: "profile_update",
        p_title: "Doctor Profile Created Successfully!",
        p_message: "Your doctor profile has been created and is now under review by our admin team.",
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Stethoscope className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Profile</h1>
          <p className="text-gray-600">Complete your medical professional profile to access the platform</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Medical Professional Information
            </CardTitle>
            <CardDescription>Please provide your medical credentials and practice details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Medical Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medical_license_number">Medical License Number *</Label>
                  <Input
                    id="medical_license_number"
                    type="text"
                    value={formData.medical_license_number}
                    onChange={(e) => setFormData({ ...formData, medical_license_number: e.target.value })}
                    required
                    className="h-12"
                    placeholder="Enter your medical license number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Select
                    value={formData.specialization}
                    onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIZATIONS.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification *</Label>
                  <Input
                    id="qualification"
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    required
                    className="h-12"
                    placeholder="e.g., MBBS, MD, MS"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years_of_experience">Years of Experience *</Label>
                  <Input
                    id="years_of_experience"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                    required
                    className="h-12"
                    placeholder="Enter years of experience"
                  />
                </div>
              </div>

              {/* Hospital Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-medium">Hospital & Practice Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospital_name">Hospital/Clinic Name *</Label>
                    <Input
                      id="hospital_name"
                      type="text"
                      value={formData.hospital_name}
                      onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                      required
                      className="h-12"
                      placeholder="Enter hospital or clinic name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="h-12"
                      placeholder="e.g., Nephrology Department"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hospital_address">Hospital Address *</Label>
                  <Textarea
                    id="hospital_address"
                    value={formData.hospital_address}
                    onChange={(e) => setFormData({ ...formData, hospital_address: e.target.value })}
                    required
                    className="min-h-[80px]"
                    placeholder="Enter complete hospital address"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-medium">Contact & Availability</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_hours">Contact Hours</Label>
                  <Input
                    id="contact_hours"
                    type="text"
                    value={formData.contact_hours}
                    onChange={(e) => setFormData({ ...formData, contact_hours: e.target.value })}
                    className="h-12"
                    placeholder="e.g., Mon-Fri 9AM-5PM"
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="emergency_contact"
                    checked={formData.emergency_contact}
                    onCheckedChange={(checked) => setFormData({ ...formData, emergency_contact: checked as boolean })}
                  />
                  <Label htmlFor="emergency_contact" className="text-sm text-gray-600 leading-relaxed">
                    I am available for emergency consultations and urgent organ transplant cases
                  </Label>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    medical professional terms
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    code of conduct
                  </a>
                  . I certify that all information provided is accurate and I am a licensed medical professional.
                </Label>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>
              )}

              <Button
                type="submit"
                disabled={loading || !agreeToTerms}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg font-medium"
              >
                {loading ? "Creating Profile..." : "Create Doctor Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
