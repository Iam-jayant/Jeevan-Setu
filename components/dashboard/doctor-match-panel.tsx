"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import emailjs from "@emailjs/browser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle } from "lucide-react"

const EMAILJS_SERVICE_ID = "service_kv1g1yw"
const EMAILJS_TEMPLATE_ID = "template_rcgsesv"

// Rename and re-export the panel for clarity
export type RecipientUrgency = "critical" | "high" | "medium" | "low";

interface Recipient {
  id: string;
  organ_type: string;
  blood_group: string;
  city: string;
  urgency_level: RecipientUrgency;
  verified_at: string;
  email: string;
  status: string;
  hospital_name: string | null;
  medical_condition: string;
  // Add these fields for display
  full_name: string;
  phone: string;
}

const urgencyOrder: Record<RecipientUrgency, number> = { critical: 1, high: 2, medium: 3, low: 4 };

const MAHARASHTRA_DISTRICTS = [
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur",
  "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City",
  "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani",
  "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha",
  "Washim", "Yavatmal"
];

export function MatchingPanel({ doctorId, doctorName, doctorEmail }: { doctorId: string, doctorName: string, doctorEmail: string }) {
  const [filters, setFilters] = useState({
    organ_type: "",
    blood_group: "",
    city: ""
  })
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Fetch recipients when all filters are filled
  useEffect(() => {
    const fetchRecipients = async () => {
      setError("")
      setRecipients([])
      if (!filters.organ_type || !filters.blood_group || !filters.city) return
      setLoading(true)
      // Fetch recipients directly by doctor filters, only show active and verified
      const { data, error } = await supabase
        .from("recipient_profiles")
        .select(`id, organ_type, blood_group, city, urgency_level, verified_at, status, hospital_name, medical_condition, user_id, users:users!recipient_profiles_user_id_fkey(email, full_name, phone)`)
        // .eq("status", "complete")
        .not("verified_at", "is", null)
        .eq("organ_type", filters.organ_type)
        .eq("blood_group", filters.blood_group)
        .eq("city", filters.city)
      if (error) setError(error.message)
      else if (data) {
        // Map user fields into recipient object
        const recipientsWithUser = data.map((rec: any) => ({
          ...rec,
          email: rec.users?.email || "",
          full_name: rec.users?.full_name || "",
          phone: rec.users?.phone || ""
        }))
        // Sort by urgency: critical > high > medium
        const urgencyRank = { critical: 1, high: 2, medium: 3 }
        const sorted = recipientsWithUser.sort((a: any, b: any) => {
          const rankA = urgencyRank[a.urgency_level as keyof typeof urgencyRank] || 99
          const rankB = urgencyRank[b.urgency_level as keyof typeof urgencyRank] || 99
          if (rankA !== rankB) return rankA - rankB
          return new Date(a.verified_at).getTime() - new Date(b.verified_at).getTime()
        })
        setRecipients(sorted)
      }
      setLoading(false)
    }
    fetchRecipients()
  }, [filters])

  // Assign recipient and log match
  const assignRecipient = async (recipient: Recipient) => {
    setLoading(true)
    setError("")
    try {
      const { error: matchError } = await supabase.from("matches").insert({
        recipient_id: recipient.id,
        assigned_doctor: doctorId,
        doctor_email: doctorEmail,
        hospital_name: recipient.hospital_name || null,
        status: "approved",
      })
      if (matchError) throw matchError

      // Send email via EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: recipient.email,
          organ_type: recipient.organ_type,
          city: recipient.city,
        }
      )
      // Remove matched recipient from panel
      setRecipients(prev => prev.filter(r => r.id !== recipient.id))
      alert("Recipient assigned and notified!")
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="mb-10">
      <Card className="shadow-lg border border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Matching Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Organ Type Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Organ Type</label>
              <select
                className="border rounded px-3 py-2 min-w-[120px]"
                value={filters.organ_type}
                onChange={e => setFilters(f => ({ ...f, organ_type: e.target.value }))}
              >
                <option value="">Select</option>
                <option value="kidney">Kidney</option>
                <option value="liver">Liver</option>
                <option value="heart">Heart</option>
                <option value="lung">Lung</option>
                <option value="pancreas">Pancreas</option>
                <option value="cornea">Cornea</option>
                <option value="bone_marrow">Bone Marrow</option>
              </select>
            </div>
            {/* Blood Group Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Blood Group</label>
              <select
                className="border rounded px-3 py-2 min-w-[120px]"
                value={filters.blood_group}
                onChange={e => setFilters(f => ({ ...f, blood_group: e.target.value }))}
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">City (Maharashtra District)</label>
              <select
                className="border rounded px-3 py-2 min-w-[160px]"
                value={filters.city}
                onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
              >
                <option value="">Select</option>
                {MAHARASHTRA_DISTRICTS.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="text-red-600 mb-2 font-medium">{error}</div>}
          {loading && (
            <div className="flex items-center gap-2 text-blue-600 mb-4">
              <Loader2 className="animate-spin h-5 w-5" />
              Loading recipients...
            </div>
          )}
          <div className="space-y-8">
            {filters.organ_type && filters.blood_group && filters.city && (
              recipients.length === 0 ? (
                <div className="text-gray-500">No matching recipients found.</div>
              ) : (
                <ul className="space-y-4">
                  {recipients.map((rec) => (
                    <Card key={rec.id} className="border border-blue-100 shadow-md bg-blue-50">
                      <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6">
                        <div className="mb-2 md:mb-0 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          <div>
                            <div className="font-semibold text-lg text-blue-900">{rec.full_name}</div>
                            <div className="text-sm text-gray-700"><b>Email:</b> {rec.email}</div>
                            <div className="text-sm text-gray-700"><b>Phone:</b> {rec.phone}</div>
                            <div className="text-sm text-gray-700"><b>Hospital:</b> {rec.hospital_name}</div>
                            <div className="text-sm text-gray-700"><b>Medical Condition:</b> {rec.medical_condition}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-700"><b>Urgency:</b> <Badge className={`ml-1 ${rec.urgency_level === 'critical' ? 'bg-red-100 text-red-800' : rec.urgency_level === 'high' ? 'bg-orange-100 text-orange-800' : rec.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{rec.urgency_level}</Badge></div>
                            <div className="text-sm text-gray-700"><b>Verified At:</b> {new Date(rec.verified_at).toLocaleString()}</div>
                            <div className="text-sm text-gray-700"><b>Organ:</b> {rec.organ_type}</div>
                            <div className="text-sm text-gray-700"><b>Blood Group:</b> {rec.blood_group}</div>
                            <div className="text-sm text-gray-700"><b>City:</b> {rec.city}</div>
                          </div>
                        </div>
                        <Button
                          onClick={() => assignRecipient(rec)}
                          disabled={loading}
                          className="ml-0 md:ml-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold px-6 py-2 rounded shadow hover:from-blue-600 hover:to-green-600 transition-all duration-150"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" />Matching...</span>
                          ) : (
                            <span>Match & Notify</span>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </ul>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}