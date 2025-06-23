"use client"

import React, { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, MapPin, User, Phone } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const ORGAN_TYPES = ["kidney", "liver", "heart", "lung", "pancreas", "cornea", "bone_marrow"]
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
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

interface DonorProfileFormProps {
  userId: string
  onComplete: () => void
}

// Add type for formData
interface DonorFormData {
  full_name: string;
  age: string;
  gender: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
  contact_number: string;
  email: string;
  blood_group: string;
  chronic_illnesses: string[];
  under_treatment: boolean;
  treatment_details: string;
  organ_type: string;
  donation_organs: string[];
  donation_type: string;
  informed_family: boolean;
  consent_pledge: boolean;
  consent_privacy: boolean;
  signature: string;
  signature_date: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
}

const FORM_STEPS = [
  "Basic Information",
  "Medical Information",
  "Donation Intent",
  "Consent & Legal",
  "Emergency Contact"
];

export function DonorProfileForm({ userId, onComplete }: DonorProfileFormProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<DonorFormData>({
    full_name: "",
    age: "",
    gender: "",
    city: "",
    state: "",
    pincode: "",
    address: "",
    contact_number: "",
    email: "",
    blood_group: "",
    chronic_illnesses: [],
    under_treatment: false,
    treatment_details: "",
    organ_type: "",
    donation_organs: [],
    donation_type: "",
    informed_family: false,
    consent_pledge: false,
    consent_privacy: false,
    signature: "",
    signature_date: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1);
  const [profileCompleted, setProfileCompleted] = useState(false);

  const handleNext = () => setStep((s) => Math.min(s + 1, FORM_STEPS.length));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate consents
    if (!formData.consent_pledge || !formData.consent_privacy) {
      setError("Please agree to the privacy policy, legal terms, and pledge to donate.");
      return;
    }
    // Validate at least one organ selected
    if (!formData.donation_organs.length) {
      setError("Please select at least one organ to donate.");
      return;
    }
    setLoading(true);
    setError("");
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
        const role = authUser?.user?.user_metadata?.role || "donor"
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
        organ_type: formData.donation_organs[0], // always set to first selected organ
        age: Number.parseInt(formData.age),
        age_group: ageGroup,
        status: "pending" as const,
      }

      const { error: profileError } = await supabase.from("donor_profiles").insert(profileData)
      if (profileError) throw profileError

      // Update user profile completion status
      const { error: userError } = await supabase.from("users").update({ profile_completed: true }).eq("id", userId)

      if (userError) throw userError

      // Create welcome notification
      await supabase.rpc("create_notification", {
        p_user_id: userId,
        p_type: "profile_update",
        p_title: "Profile Created Successfully!",
        p_message: "Your donor profile has been created and is now under review by our medical team.",
      })
      setProfileCompleted(true);
      onComplete();
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  };

  // Redirect to dashboard if profile completed
  React.useEffect(() => {
    if (profileCompleted) {
      window.location.href = "/dashboard/donor";
    }
  }, [profileCompleted]);

  if (profileCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-green-700">Redirecting to your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          {FORM_STEPS.map((label, idx) => (
            <div key={label} className="flex-1 flex flex-col items-center">
              <div className={`rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold ${step === idx + 1 ? "bg-green-600 text-white" : "bg-gray-300 text-gray-700"}`}>{idx + 1}</div>
              <span className={`text-xs mt-1 ${step === idx + 1 ? "text-green-700" : "text-gray-500"}`}>{label}</span>
              {idx < FORM_STEPS.length - 1 && <div className="w-full h-1 bg-gray-200 mt-2 mb-2" />}
            </div>
          ))}
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{FORM_STEPS[step - 1]}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={step === FORM_STEPS.length ? handleFinalSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ...full_name, age, gender, city, state, pincode, address, contact_number, email... */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input id="full_name" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input id="age" type="number" min="18" max="65" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} required className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={value => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={value => setFormData({ ...formData, state: value })}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_number">Contact Number *</Label>
                    <Input id="contact_number" value={formData.contact_number} onChange={e => setFormData({ ...formData, contact_number: e.target.value })} required className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input id="pincode" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} required className="h-12" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea id="address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required className="min-h-[80px]" />
                  </div>
                </div>
              )}
              {/* Step 2: Medical Information */}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="blood_group">Blood Group *</Label>
                    <Select value={formData.blood_group} onValueChange={value => setFormData({ ...formData, blood_group: value })}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select blood group" /></SelectTrigger>
                      <SelectContent>
                        {BLOOD_GROUPS.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chronic_illnesses">Chronic Illnesses *</Label>
                    <Input id="chronic_illnesses" value={formData.chronic_illnesses.join(", ")} onChange={e => setFormData({ ...formData, chronic_illnesses: e.target.value.split(",") })} required className="h-12" placeholder="e.g. Diabetes, Cancer" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="under_treatment">Currently under medical treatment? *</Label>
                    <Select value={formData.under_treatment ? "yes" : "no"} onValueChange={value => setFormData({ ...formData, under_treatment: value === "yes" })}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="treatment_details">Treatment Details *</Label>
                    <Textarea id="treatment_details" value={formData.treatment_details} onChange={e => setFormData({ ...formData, treatment_details: e.target.value })} required className="min-h-[60px]" />
                  </div>
                </div>
              )}
              {/* Step 3: Donation Intent */}
              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="donation_organs">Organs willing to donate *</Label>
                    <div className="flex flex-wrap gap-2">
                      {ORGAN_TYPES.map(organ => (
                        <button
                          type="button"
                          key={organ}
                          className={`px-3 py-1 rounded-full border ${formData.donation_organs.includes(organ) ? "bg-green-600 text-white" : "bg-gray-100"}`}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              donation_organs: formData.donation_organs.includes(organ)
                                ? formData.donation_organs.filter(o => o !== organ)
                                : [...formData.donation_organs, organ],
                            })
                          }}
                        >
                          {organ.charAt(0).toUpperCase() + organ.slice(1).replace("_", " ")}
                        </button>
                      ))}
                    </div>
                    {formData.donation_organs.length === 0 && <div className="text-red-500 text-xs">Select at least one organ</div>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="donation_type">Donation Type *</Label>
                    <Select value={formData.donation_type} onValueChange={value => setFormData({ ...formData, donation_type: value })}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="after_death">After death (brain/cardiac death)</SelectItem>
                        <SelectItem value="living">Living donation (kidney/liver lobe)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="informed_family">Have you informed your family? *</Label>
                    <Select value={formData.informed_family ? "yes" : "no"} onValueChange={value => setFormData({ ...formData, informed_family: value === "yes" })}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {/* Step 4: Consent & Legal */}
              {step === 4 && (
                <div>
                  <div className="space-y-2">
                    <Checkbox id="consent_pledge" checked={formData.consent_pledge} onCheckedChange={checked => setFormData({ ...formData, consent_pledge: checked as boolean })} required />
                    <Label htmlFor="consent_pledge">I hereby pledge to donate my organs and consent to being contacted by Jeevan Setu partnered hospitals. *</Label>
                  </div>
                  <div className="space-y-2">
                    <Checkbox id="consent_privacy" checked={formData.consent_privacy} onCheckedChange={checked => setFormData({ ...formData, consent_privacy: checked as boolean })} required />
                    <Label htmlFor="consent_privacy">I agree to the privacy policy and legal terms. *</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signature">Signature (type full name) *</Label>
                    <Input id="signature" value={formData.signature} onChange={e => setFormData({ ...formData, signature: e.target.value })} required className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signature_date">Date *</Label>
                    <Input id="signature_date" type="date" value={formData.signature_date} onChange={e => setFormData({ ...formData, signature_date: e.target.value })} required className="h-12" />
                  </div>
                </div>
              )}
              {/* Step 5: Emergency Contact */}
              {step === 5 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Contact Name *</Label>
                    <Input id="emergency_contact_name" value={formData.emergency_contact_name} onChange={e => setFormData({ ...formData, emergency_contact_name: e.target.value })} required className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">Contact Phone *</Label>
                    <Input id="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={e => setFormData({ ...formData, emergency_contact_phone: e.target.value })} required className="h-12" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="emergency_contact_relation">Relationship *</Label>
                    <Input id="emergency_contact_relation" value={formData.emergency_contact_relation} onChange={e => setFormData({ ...formData, emergency_contact_relation: e.target.value })} required className="h-12" />
                  </div>
                </div>
              )}
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>
              )}
              <div className="flex justify-between mt-8">
                {step > 1 && <Button type="button" onClick={handleBack} className="bg-gray-300 text-gray-700 hover:bg-gray-400">Back</Button>}
                {step < FORM_STEPS.length && <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Next</Button>}
                {step === FORM_STEPS.length && <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">{loading ? "Saving..." : "Submit"}</Button>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
