"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Upload, User, FileText, CheckCircle, Clock, AlertCircle, Heart } from "lucide-react"
import { RecipientProfileForm } from "./recipient-profile-form"
import { DocumentUpload } from "./document-upload"

interface RecipientProfile {
  id: string
  organ_type: string
  blood_group: string
  age: number
  city: string
  state: string
  urgency_level: "critical" | "high" | "medium"
  medical_condition: string
  status: "pending" | "verified" | "matched" | "rejected"
  verification_notes: string | null
}

interface Match {
  id: string
  hospital_name: string | null
  assigned_doctor: string | null
  match_date: string
  status: string
}

export function RecipientDashboard({ user }: { user: any }) {
  const [profile, setProfile] = useState<RecipientProfile | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchMatches()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.from("recipient_profiles").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMatches = async () => {
    if (!profile) return

    try {
      const { data, error } = await supabase.from("matches").select("*").eq("recipient_id", profile.id)

      if (error) {
        console.error("Error fetching matches:", error)
      } else {
        setMatches(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "matched":
        return <Heart className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "matched":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.user_metadata?.full_name || user.email}
          </h1>
          <p className="text-gray-600">Your journey to receiving life-saving care starts here</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
              {profile && getStatusIcon(profile.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile ? (
                  <Badge className={getStatusColor(profile.status)}>
                    {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">Not Created</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {profile ? (
                  profile.status === "verified"
                    ? "Profile verified by a medical professional. You are now eligible for matching."
                    : profile.status === "matched"
                    ? "You have been matched! Our team will contact you soon."
                    : profile.status === "rejected"
                    ? "Profile requires additional information. Please check the notes and update."
                    : "Profile created and under review"
                ) : (
                  "Create your recipient profile to get started"
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgency Level</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile ? (
                  <Badge className={getUrgencyColor(profile.urgency_level)}>
                    {profile.urgency_level.charAt(0).toUpperCase() + profile.urgency_level.slice(1)}
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">Not Set</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Medical urgency classification</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potential Matches</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matches.length}</div>
              <p className="text-xs text-muted-foreground">Compatible donors found</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Recipient Profile
              </CardTitle>
              <CardDescription>
                {profile
                  ? "Manage your recipient information"
                  : "Create your recipient profile to find compatible donors"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Organ Needed</p>
                      <p className="text-lg">{profile.organ_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Blood Group</p>
                      <p className="text-lg">{profile.blood_group}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Age</p>
                      <p className="text-lg">{profile.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-lg">
                        {profile.city}, {profile.state}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Medical Condition</p>
                    <p className="text-sm text-gray-700 mt-1">{profile.medical_condition}</p>
                  </div>

                  {profile.verification_notes && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Verification Notes:</p>
                      <p className="text-sm text-blue-700">{profile.verification_notes}</p>
                    </div>
                  )}

                  <Button
                    onClick={() => setShowProfileForm(true)}
                    disabled={profile.status === "verified" || profile.status === "matched"}
                    className="w-full"
                  >
                    {profile.status === "verified" || profile.status === "matched"
                      ? "Profile Locked (Verified)"
                      : "Edit Profile"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No profile created yet</p>
                  <Button onClick={() => setShowProfileForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    Create Recipient Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Required Documents
              </CardTitle>
              <CardDescription>Upload your identification and medical documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Required Documents:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Government ID (Aadhaar/PAN/Passport)</li>
                    <li>• Blood Group Report</li>
                  </ul>
                </div>
                <Button onClick={() => setShowDocumentUpload(true)} className="w-full" disabled={!profile}>
                  Upload Documents
                </Button>
                {!profile && (
                  <p className="text-xs text-gray-500 text-center">Create your profile first to upload documents</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {matches.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Your Matches
              </CardTitle>
              <CardDescription>Compatible donors who could help save your life</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Compatible Donor Found</p>
                        <p className="text-sm text-gray-600">
                          Matched on {new Date(match.match_date).toLocaleDateString()}
                        </p>
                        {match.hospital_name && (
                          <p className="text-sm text-gray-600">Hospital: {match.hospital_name}</p>
                        )}
                      </div>
                      <Badge className={getStatusColor(match.status)}>{match.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showProfileForm && (
        <RecipientProfileForm
          user={user}
          profile={profile}
          onClose={() => setShowProfileForm(false)}
          onSave={() => {
            setShowProfileForm(false)
            fetchProfile()
          }}
        />
      )}

      {showDocumentUpload && profile && (
        <DocumentUpload userId={user.id} profileId={profile.id} onClose={() => setShowDocumentUpload(false)} />
      )}
    </div>
  )
}
