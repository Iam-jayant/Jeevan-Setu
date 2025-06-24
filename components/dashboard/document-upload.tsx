"use client"

import { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, FileText, CheckCircle, X } from "lucide-react"

interface DocumentUploadProps {
  userId: string
  profileId: string
  onClose: () => void
}

export function DocumentUpload({ userId, profileId, onClose }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: boolean }>({})
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [error, setError] = useState("")
  const nameProofRef = useRef<HTMLInputElement>(null)
  const bloodReportRef = useRef<HTMLInputElement>(null)

  // Fetch uploaded documents on mount
  useEffect(() => {
    fetchUploadedDocs()
  }, [])

  const fetchUploadedDocs = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .eq("profile_id", profileId)

    if (!error && data) {
      const docs: { [key: string]: boolean } = {}
      data.forEach((doc: any) => {
        docs[doc.document_type] = true
      })
      setUploadedDocs(docs)
      setUploadedFiles(data)
    }
  }

  const uploadDocument = async (file: File, documentType: string) => {
    try {
      setUploading(true)
      setError("")

      // Validate file
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) throw new Error("File size must be less than 5MB")
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (!allowedTypes.includes(file.type)) throw new Error("Only PDF, JPG, and PNG files are allowed")

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}/${documentType}_${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage.from("user-uploads").upload(fileName, file)
      if (uploadError) throw uploadError

      // Save document record to database
      const { error: dbError } = await supabase.from("documents").insert({
        user_id: userId,
        profile_id: profileId,
        document_type: documentType,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
      })
      if (dbError) throw dbError

      setUploadedDocs((prev) => ({ ...prev, [documentType]: true }))
      fetchUploadedDocs()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (documentType: string) => {
    const input = documentType === "name_proof" ? nameProofRef.current : bloodReportRef.current
    const file = input?.files?.[0]
    if (file) uploadDocument(file, documentType)
  }

  const allUploaded = uploadedDocs.name_proof && uploadedDocs.blood_group_report

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Required Documents</DialogTitle>
          <DialogDescription>
            Upload your identification and medical documents
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-white flex flex-col items-center shadow-sm">
            <FileText className="h-8 w-8 text-gray-400 mb-2" />
            <div className="font-medium mb-1">Required Documents:</div>
            <ul className="text-sm text-gray-600 mb-4">
              <li>• Government ID (Aadhaar/PAN/Passport)</li>
              <li>• Blood Group Report</li>
            </ul>
            {/* File Inputs for Uploads */}
            <div className="w-full flex flex-col gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Government ID</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  ref={nameProofRef}
                  disabled={!!uploadedDocs.name_proof}
                  onChange={() => handleFileSelect("name_proof")}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploadedDocs.name_proof && (
                  <span className="text-green-600 text-xs ml-2">Uploaded</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group Report</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  ref={bloodReportRef}
                  disabled={!!uploadedDocs.blood_group_report}
                  onChange={() => handleFileSelect("blood_group_report")}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploadedDocs.blood_group_report && (
                  <span className="text-green-600 text-xs ml-2">Uploaded</span>
                )}
              </div>
            </div>
            {/* Modified Button - Changes color based on upload state */}
            {allUploaded ? (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg h-11 text-base shadow flex items-center justify-center gap-2 cursor-default"
                disabled
              >
                <CheckCircle className="h-5 w-5 text-white" />
                Documents Uploaded
              </Button>
            ) : null}
            {error && <div className="text-red-600 text-xs mt-2">{error}</div>}
          </div>
          <div className="bg-amber-50 p-3 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> All documents will be reviewed by our medical team. Please ensure they are clear and readable.
            </p>
          </div>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}