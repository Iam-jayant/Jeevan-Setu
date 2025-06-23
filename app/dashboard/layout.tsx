"use client"

import { UserHeader } from "@/components/layout/user-header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <UserHeader />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
