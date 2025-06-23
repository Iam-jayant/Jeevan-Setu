"use client"
import { UserDebug } from "@/components/debug/user-debug"

export default function ClientDebugWrapper() {
  if (process.env.NODE_ENV !== "development") return null
  return <UserDebug />
}
