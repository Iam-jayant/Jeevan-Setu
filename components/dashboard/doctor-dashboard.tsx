"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Heart, FileText, CheckCircle, X, Eye, Filter, Paperclip } from "lucide-react"
import { MatchingPanel } from "@/components/dashboard/doctor-match-panel"

interface Profile {
  id: string
  user_id: string
  organ_type: string
  blood_group: string
  age: number
  city: string
  state: string
  status: string
  created_at: string
  users?: {
    full_name: string
    email: string
    phone: string
  }
  documents?: Array<{
    id: string
    file_name: string
    file_path: string
    document_type: string
    uploaded_at: string
  }>
}

interface DonorProfile extends Profile {
  medical_history: string
  emergency_contact_name: string
  emergency_contact_phone: string
}

interface RecipientProfile extends Profile {
  urgency_level: string
  medical_condition: string
  hospital_name: string
  doctor_name: string
  doctor_contact: string
}

export function DoctorDashboard({ user }: { user: any }) {
  const [donorProfiles, setDonorProfiles] = useState<DonorProfile[]>([])
  const [recipientProfiles, setRecipientProfiles] = useState<RecipientProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState("")
  const [verificationAction, setVerificationAction] = useState<"approve" | "reject">("approve")
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    organ_type: "all",
    blood_group: "all",
    urgency_level: "all",
    status: "pending",
  })
  const [showDocumentsModal, setShowDocumentsModal] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    fetchProfiles()
  }, [filters])

  const fetchProfiles = async () => {
    setLoading(true)
    try {
      // Fetch donor profiles (without documents join)
      let donorQuery = supabase
        .from("donor_profiles")
        .select(`
          *,
          users:user_id (
            full_name,
            email,
            phone
          )
        `)

      if (filters.status && filters.status !== 'all') donorQuery = donorQuery.eq("status", filters.status)
      if (filters.organ_type && filters.organ_type !== 'all') donorQuery = donorQuery.eq("organ_type", filters.organ_type)
      if (filters.blood_group && filters.blood_group !== 'all') donorQuery = donorQuery.eq("blood_group", filters.blood_group)

      const { data: donors, error: donorError } = await donorQuery

      if (donorError) {
        console.error("Donor query error:", donorError)
        throw donorError
      }

      // Fetch recipient profiles (without documents join)
      let recipientQuery = supabase
        .from("recipient_profiles")
        .select(`
          *,
          users:user_id (
            full_name,
            email,
            phone
          )
        `)

      if (filters.status && filters.status !== 'all') recipientQuery = recipientQuery.eq("status", filters.status)
      if (filters.organ_type && filters.organ_type !== 'all') recipientQuery = recipientQuery.eq("organ_type", filters.organ_type)
      if (filters.blood_group && filters.blood_group !== 'all') recipientQuery = recipientQuery.eq("blood_group", filters.blood_group)
      if (filters.urgency_level && filters.urgency_level !== 'all') recipientQuery = recipientQuery.eq("urgency_level", filters.urgency_level)

      const { data: recipients, error: recipientError } = await recipientQuery

      if (recipientError) throw recipientError

      // Fetch all documents
      const { data: allDocuments, error: docError } = await supabase
        .from("documents")
        .select("id, user_id, file_name, file_path, document_type, uploaded_at")
      if (docError) throw docError

      // Attach documents to donor profiles
      const donorsWithDocs = (donors || []).map((profile) => ({
        ...profile,
        documents: allDocuments.filter((doc) => doc.user_id === profile.user_id),
      }))
      // Attach documents to recipient profiles
      const recipientsWithDocs = (recipients || []).map((profile) => ({
        ...profile,
        documents: allDocuments.filter((doc) => doc.user_id === profile.user_id),
      }))

      setDonorProfiles(donorsWithDocs)
      setRecipientProfiles(recipientsWithDocs)
    } catch (error: any) {
      console.error("Error fetching profiles:", error.message || error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async () => {
    if (!selectedProfile || !selectedProfile.id) {
      console.error("No profile selected or missing id", { selectedProfile })
      return
    }
    try {
      const table = selectedProfile.urgency_level ? "recipient_profiles" : "donor_profiles"
      const newStatus = verificationAction === "approve" ? "verified" : "rejected"
      const updatePayload = {
        status: newStatus,
        verification_notes: verificationNotes,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
      }
      // Log user and payload for debugging
      console.log("Attempting profile update", { user, table, updatePayload, selectedProfile })
      const { data, error, status, statusText } = await supabase
        .from(table)
        .update(updatePayload)
        .eq("id", selectedProfile.id)
        .select()
      if (error || !data || data.length === 0) {
        console.error("Error updating profile (detailed):", { error, data, status, statusText, table, updatePayload, selectedProfile, user })
        alert("Update failed: " + (error?.message || JSON.stringify(error) || "No rows updated"))
        throw error || new Error("No rows updated")
      }

      // Insert notification for the user whose profile was verified/rejected
      const notificationTitle = verificationAction === "approve" ? "Profile Verified" : "Profile Rejected"
      const notificationMessage = verificationAction === "approve"
        ? "Your profile has been verified by a doctor."
        : "Your profile has been rejected by a doctor. Please review the notes and update your information."
      const notifPayload = {
        user_id: selectedProfile.user_id,
        type: "verification", // must match enum value
        title: notificationTitle,
        message: notificationMessage + (verificationNotes ? ` Notes: ${verificationNotes}` : ""),
      }
      console.log("Attempting notification insert", { notifPayload, user })
      const { error: notifError } = await supabase
        .from("notifications")
        .insert([notifPayload])
      if (notifError) {
        console.error("Error inserting notification:", notifError, { notifPayload, user })
        alert("Notification insert failed: " + (notifError.message || JSON.stringify(notifError)))
        // Optionally, do not throw here so the main flow continues
      }

      setShowVerificationModal(false)
      setSelectedProfile(null)
      setVerificationNotes("")
      fetchProfiles()
    } catch (error) {
      console.error("Error updating profile (catch):", error)
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

  // Remove signed URL logic, use public URLs
  const getPublicUrl = (file_path: string) => {
    // Replace 'documents' with your actual bucket name if different
    const { data } = supabase.storage.from('user-uploads').getPublicUrl(file_path)
    return data?.publicUrl || ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
          <p className="text-gray-600">Review and verify donor and recipient profiles</p>
        </div>

        {/* Matching Panel */}
        <div className="mb-10">
          <MatchingPanel doctorId={user.id} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Donors</CardTitle>
              <Heart className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{donorProfiles.filter((p) => p.status === "pending").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Recipients</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recipientProfiles.filter((p) => p.status === "pending").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Profiles</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[...donorProfiles, ...recipientProfiles].filter((p) => p.status === "verified").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
              <FileText className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recipientProfiles.filter((p) => p.urgency_level === "critical").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.organ_type}
                onValueChange={(value) => setFilters({ ...filters, organ_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Organ Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organs</SelectItem>
                  <SelectItem value="kidney">Kidney</SelectItem>
                  <SelectItem value="liver">Liver</SelectItem>
                  <SelectItem value="heart">Heart</SelectItem>
                  <SelectItem value="lung">Lung</SelectItem>
                  <SelectItem value="pancreas">Pancreas</SelectItem>
                  <SelectItem value="cornea">Cornea</SelectItem>
                  <SelectItem value="bone_marrow">Bone Marrow</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.blood_group}
                onValueChange={(value) => setFilters({ ...filters, blood_group: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blood Groups</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.urgency_level}
                onValueChange={(value) => setFilters({ ...filters, urgency_level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() =>
                  setFilters({ organ_type: "all", blood_group: "all", urgency_level: "all", status: "pending" })
                }
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Lists */}
        <Tabs defaultValue="donors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="donors">Donor Profiles ({donorProfiles.length})</TabsTrigger>
            <TabsTrigger value="recipients">Recipient Profiles ({recipientProfiles.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="donors">
            <div className="grid gap-4">
              {donorProfiles.map((profile) => (
                <Card key={profile.id} className="shadow-lg rounded-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <p className="font-medium">{profile.users?.full_name}</p>
                          <p className="text-sm text-gray-600">{profile.users?.email}</p>
                          <p className="text-sm text-gray-600">{profile.users?.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Organ & Blood</p>
                          <p className="text-sm">
                            {profile.organ_type} • {profile.blood_group}
                          </p>
                          <p className="text-sm text-gray-600">Age: {profile.age}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Location</p>
                          <p className="text-sm">
                            {profile.city}, {profile.state}
                          </p>
                        </div>
                        <div>
                          <Badge className={getStatusColor(profile.status)}>{profile.status}</Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProfile(profile)
                            setShowProfileModal(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {profile.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedProfile(profile)
                              setShowVerificationModal(true)
                            }}
                          >
                            Review
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDocuments(profile.documents || [])
                            setShowDocumentsModal(true)
                          }}
                          title="View Documents"
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recipients">
            <div className="grid gap-4">
              {recipientProfiles.map((profile) => (
                <Card key={profile.id} className="shadow-lg rounded-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                        <div>
                          <p className="font-medium">{profile.users?.full_name}</p>
                          <p className="text-sm text-gray-600">{profile.users?.email}</p>
                          <p className="text-sm text-gray-600">{profile.users?.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Organ & Blood</p>
                          <p className="text-sm">
                            {profile.organ_type} • {profile.blood_group}
                          </p>
                          <p className="text-sm text-gray-600">Age: {profile.age}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Location</p>
                          <p className="text-sm">
                            {profile.city}, {profile.state}
                          </p>
                        </div>
                        <div>
                          <Badge className={getUrgencyColor(profile.urgency_level)}>{profile.urgency_level}</Badge>
                          <Badge className={getStatusColor(profile.status)} variant="outline">
                            {profile.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{new Date(profile.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProfile(profile)
                            setShowProfileModal(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {profile.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedProfile(profile)
                              setShowVerificationModal(true)
                            }}
                          >
                            Review
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDocuments(profile.documents || [])
                            setShowDocumentsModal(true)
                          }}
                          title="View Documents"
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Profile Detail Modal */}
        {showProfileModal && selectedProfile && (
          <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedProfile.urgency_level ? "Recipient" : "Donor"} Profile Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p>{selectedProfile.users?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{selectedProfile.users?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p>{selectedProfile.users?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Age</p>
                    <p>{selectedProfile.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Organ Type</p>
                    <p>{selectedProfile.organ_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Blood Group</p>
                    <p>{selectedProfile.blood_group}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p>
                      {selectedProfile.city}, {selectedProfile.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <Badge className={getStatusColor(selectedProfile.status)}>{selectedProfile.status}</Badge>
                  </div>
                </div>

                {selectedProfile.urgency_level && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Urgency Level</p>
                      <Badge className={getUrgencyColor(selectedProfile.urgency_level)}>
                        {selectedProfile.urgency_level}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Medical Condition</p>
                      <p className="text-sm">{selectedProfile.medical_condition}</p>
                    </div>
                    {selectedProfile.hospital_name && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Hospital</p>
                        <p className="text-sm">{selectedProfile.hospital_name}</p>
                      </div>
                    )}
                  </>
                )}

                {selectedProfile.medical_history && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Medical History</p>
                    <p className="text-sm">{selectedProfile.medical_history}</p>
                  </div>
                )}

                {selectedProfile.documents && selectedProfile.documents.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Uploaded Documents</p>
                    <ul className="space-y-1">
                      {selectedProfile.documents.map((doc: any) => (
                        <li key={doc.id} className="flex items-center gap-2">
                          <a
                            href={getPublicUrl(doc.file_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline font-medium hover:text-blue-800 transition-colors"
                          >
                            {doc.file_name}
                          </a>
                          <span className="text-xs text-gray-500">({doc.document_type})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Verification Modal */}
        {showVerificationModal && selectedProfile && (
          <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify Profile</DialogTitle>
                <DialogDescription>
                  Review and approve or reject this {selectedProfile.urgency_level ? "recipient" : "donor"} profile
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    variant={verificationAction === "approve" ? "default" : "outline"}
                    onClick={() => setVerificationAction("approve")}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant={verificationAction === "reject" ? "destructive" : "outline"}
                    onClick={() => setVerificationAction("reject")}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add verification notes..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowVerificationModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleVerification} className="flex-1">
                    {verificationAction === "approve" ? "Approve Profile" : "Reject Profile"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Documents Modal */}
        {showDocumentsModal && (
          <Dialog open={showDocumentsModal} onOpenChange={setShowDocumentsModal}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Uploaded Documents</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                {documents.length > 0 ? (
                  <ul className="space-y-1">
                    {documents.map((doc) => (
                      <li key={doc.id} className="flex items-center gap-2">
                        <a
                          href={getPublicUrl(doc.file_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline font-medium hover:text-blue-800 transition-colors"
                        >
                          {doc.file_name}
                        </a>
                        <span className="text-xs text-gray-500">({doc.document_type})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No documents uploaded.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
