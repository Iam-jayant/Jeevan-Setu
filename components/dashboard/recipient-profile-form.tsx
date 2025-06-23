"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

const ORGAN_TYPES = ["kidney", "liver", "heart", "lung", "pancreas", "cornea", "bone_marrow"]

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

const URGENCY_LEVELS = [
  { value: "critical", label: "Critical - Immediate need" },
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
  user: any
  profile: any
  onClose: () => void
  onSave: () => void
}

export function RecipientProfileForm({ user, profile, onClose, onSave }: RecipientProfileFormProps) {
  const [formData, setFormData] = useState({
    organ_type: profile?.organ_type || "",
    blood_group: profile?.blood_group || "",
    age: profile?.age || "",
    city: profile?.city || "",
    state: profile?.state || "",
    urgency_level: profile?.urgency_level || "",
    medical_condition: profile?.medical_condition || "",
    hospital_name: profile?.hospital_name || "",
    doctor_name: profile?.doctor_name || "",
    doctor_contact: profile?.doctor_contact || "",
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

      const profileData = {
        user_id: user.id,
        ...formData,
        age: Number.parseInt(formData.age),
        age_group: ageGroup,
      }

      if (profile) {
        // Update existing profile
        const { error } = await supabase.from("recipient_profiles").update(profileData).eq("id", profile.id)

        if (error) throw error
      } else {
        // Create new profile
        const { error } = await supabase.from("recipient_profiles").insert(profileData)

        if (error) throw error
      }

      onSave()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{profile ? "Edit Recipient Profile" : "Create Recipient Profile"}</DialogTitle>
          <DialogDescription>
            Please provide accurate information to help us find compatible donors for you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organ_type">Organ Needed *</Label>
              <Select
                value={formData.organ_type}
                onValueChange={(value) => setFormData({ ...formData, organ_type: value })}
              >
                <SelectTrigger>
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
              <Label htmlFor="blood_group">Blood Group *</Label>
              <Select
                value={formData.blood_group}
                onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
              >
                <SelectTrigger>
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
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency_level">Urgency Level *</Label>
              <Select
                value={formData.urgency_level}
                onValueChange={(value) => setFormData({ ...formData, urgency_level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
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

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_condition">Medical Condition *</Label>
            <Textarea
              id="medical_condition"
              value={formData.medical_condition}
              onChange={(e) => setFormData({ ...formData, medical_condition: e.target.value })}
              placeholder="Describe your medical condition requiring organ transplant..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hospital_name">Current Hospital</Label>
              <Input
                id="hospital_name"
                type="text"
                value={formData.hospital_name}
                onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
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
                placeholder="Your treating physician"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor_contact">Doctor Contact</Label>
            <Input
              id="doctor_contact"
              type="text"
              value={formData.doctor_contact}
              onChange={(e) => setFormData({ ...formData, doctor_contact: e.target.value })}
              placeholder="Doctor's phone number or email"
            />
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
                privacy policy
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                medical terms
              </a>
              . I understand that this information will be used for organ matching purposes.
            </Label>
          </div>

          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !agreeToTerms} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {loading ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
