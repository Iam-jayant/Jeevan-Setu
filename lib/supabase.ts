import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: "donor" | "recipient" | "doctor" | "admin"
          full_name: string | null
          phone: string | null
          preferred_language: string
          profile_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: "donor" | "recipient" | "doctor" | "admin"
          full_name?: string | null
          phone?: string | null
          preferred_language?: string
          profile_completed?: boolean
        }
        Update: {
          full_name?: string | null
          phone?: string | null
          preferred_language?: string
          profile_completed?: boolean
        }
      }
      donor_profiles: {
        Row: {
          id: string
          user_id: string
          organ_type: string
          blood_group: string
          age: number
          age_group: "pediatric" | "adult"
          city: string
          state: string
          pincode: string | null
          address: string | null
          medical_history: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          status: "incomplete" | "pending" | "verified" | "matched" | "rejected"
          verification_notes: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
      }
      recipient_profiles: {
        Row: {
          id: string
          user_id: string
          organ_type: string
          blood_group: string
          age: number
          age_group: "pediatric" | "adult"
          city: string
          state: string
          pincode: string | null
          address: string | null
          urgency_level: "critical" | "high" | "medium"
          medical_condition: string
          hospital_name: string | null
          doctor_name: string | null
          doctor_contact: string | null
          insurance_details: string | null
          status: "incomplete" | "pending" | "verified" | "matched" | "rejected"
          verification_notes: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          metadata: any
          created_at: string
        }
      }
    }
  }
}
