"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Heart, Upload, User, FileText, CheckCircle, Clock, AlertCircle, X, Edit } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { DocumentUpload } from "./document-upload"
import { DonorProfileForm } from "./donor-profile-form"

interface DonorProfile {
  id: string
  organ_type: string
  blood_group: string
  age: number
  city: string
  state: string
  status: "incomplete" | "pending" | "verified" | "matched" | "rejected"
  verification_notes: string | null
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

interface Match {
  id: string
  hospital_name: string | null
  assigned_doctor: string | null
  match_date: string
  status: string
}

export function EnhancedDonorDashboard({ user }: { user: any }) {
  const { t } = useLanguage()
  const [profile, setProfile] = useState<DonorProfile | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchMatches()
    fetchNotifications()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.from("donor_profiles").select("*").eq("user_id", user.id).single()

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
      const { data, error } = await supabase.from("matches").select("*").eq("donor_id", profile.id)

      if (error) {
        console.error("Error fetching matches:", error)
      } else {
        setMatches(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching notifications:", error)
      } else {
        setNotifications(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
    } catch (error) {
      console.error("Error marking notification as read:", error)
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
      case "incomplete":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const unreadNotifications = notifications.filter((n) => !n.is_read).length

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
        {/* Header with Notifications */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("dashboard.welcome")}, {user.full_name || user.email}
            </h1>
            <p className="text-gray-600">Your journey of giving life continues here</p>
          </div>

          <div className="relative">
            <Button
              onClick={() => setShowNotifications(!showNotifications)}
              variant="outline"
              size="sm"
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Notifications</h3>
                    <Button onClick={() => setShowNotifications(false)} variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No notifications yet</div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                          !notification.is_read ? "bg-blue-50" : ""
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.status")}</CardTitle>
              {profile && getStatusIcon(profile.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile ? (
                  <Badge className={getStatusColor(profile.status)}>{t(`status.${profile.status}`)}</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">Not Created</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {profile ? "Profile created and under review" : "Create your donor profile to get started"}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.matches")}</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matches.length}</div>
              <p className="text-xs text-muted-foreground">Potential recipients matched</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.documents")}</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Required documents to upload</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Donor Profile
                </CardTitle>
                {profile && (
                  <Button
                    onClick={() => setShowProfileForm(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={profile.status === "verified" || profile.status === "matched"}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
              <CardDescription>
                {profile ? "Your donor information" : "Create your donor profile to start helping others"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Organ Type</p>
                      <p className="text-lg capitalize">{profile.organ_type.replace("_", " ")}</p>
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

                  {profile.verification_notes && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">Verification Notes:</p>
                      <p className="text-sm text-blue-700">{profile.verification_notes}</p>
                    </div>
                  )}

                  {profile.status === "rejected" && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <p className="text-sm font-medium text-red-800">Action Required:</p>
                      <p className="text-sm text-red-700">
                        Please review the verification notes and update your profile accordingly.
                      </p>
                      <Button
                        onClick={() => setShowProfileForm(true)}
                        className="mt-2 bg-red-600 hover:bg-red-700"
                        size="sm"
                      >
                        Update Profile
                      </Button>
                    </div>
                  )}

                  {(profile.status === "verified" || profile.status === "matched") && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800">Profile Status:</p>
                      <p className="text-sm text-green-700">
                        Your profile has been verified and is locked for editing. Contact support if you need to make
                        changes.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No profile created yet</p>
                  <Button onClick={() => setShowProfileForm(true)} className="bg-green-600 hover:bg-green-700">
                    Create Donor Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
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
                  {t("dashboard.upload")}
                </Button>
                {!profile && (
                  <p className="text-xs text-gray-500 text-center">Create your profile first to upload documents</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matches Section */}
        {matches.length > 0 && (
          <Card className="mt-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Your Matches
              </CardTitle>
              <CardDescription>Recipients who could benefit from your donation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.id} className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-green-800">Compatible Match Found!</p>
                        <p className="text-sm text-gray-600">
                          Matched on {new Date(match.match_date).toLocaleDateString()}
                        </p>
                        {match.hospital_name && (
                          <p className="text-sm text-gray-600">Hospital: {match.hospital_name}</p>
                        )}
                        <p className="text-xs text-green-600 mt-2">
                          Our medical team will contact you soon with next steps.
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{match.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showDocumentUpload && profile && (
        <DocumentUpload userId={user.id} profileId={profile.id} onClose={() => setShowDocumentUpload(false)} />
      )}

      {showProfileForm && (
        <DonorProfileForm
          user={user}
          profile={profile}
          onClose={() => setShowProfileForm(false)}
          onSave={() => {
            setShowProfileForm(false)
            fetchProfile()
          }}
        />
      )}
    </div>
  )
}
