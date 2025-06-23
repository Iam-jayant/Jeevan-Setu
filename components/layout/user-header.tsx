"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, LogOut, User, Settings, Bell } from "lucide-react"
import { signOut } from "@/lib/auth-utils"
import type { UserProfile } from "@/lib/auth-utils"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export function UserHeader() {
  const [loading, setLoading] = useState(false)
  const { user, profile, logout } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)

  const fetchNotifications = async () => {
    if (!user?.id) return
    setNotifLoading(true)
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
    if (!error) setNotifications(data || [])
    setNotifLoading(false)
  }

  useEffect(() => {
    if (notifOpen) fetchNotifications()
    // eslint-disable-next-line
  }, [notifOpen, user?.id])

  const unreadCount = notifications.filter((n) => !n.read).length

  // Place utility functions above the return so they're in scope
  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "donor":
        return "bg-green-100 text-green-800"
      case "recipient":
        return "bg-blue-100 text-blue-800"
      case "doctor":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Strict dashboard navigation: if profile is incomplete, always redirect to onboarding
  const handleDashboardClick = () => {
    if (!profile || !profile.profile_completed) {
      router.push("/onboarding")
    } else {
      switch (profile.role) {
        case "donor":
          router.push("/dashboard/donor")
          break
        case "recipient":
          router.push("/dashboard/recipient")
          break
        case "doctor":
        case "admin":
          router.push("/dashboard/doctor")
          break
        default:
          router.push("/dashboard")
      }
    }
  }

  if (loading) return null

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-full mr-3">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Jeevan Setu</h1>
              <p className="text-xs text-gray-500">जीवन सेतु - Bridge of Life</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
                <DropdownMenuLabel className="font-bold">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifLoading ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <DropdownMenuItem key={notif.id} className={notif.read ? "" : "bg-blue-50"}>
                      <div>
                        <div className="font-medium">{notif.title}</div>
                        <div className="text-xs text-gray-600">{notif.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-auto px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                        {getInitials(profile?.full_name ?? null)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                        {profile?.full_name || "User"}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(profile?.role ?? "")}`}
                        >
                          {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name ?? "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{profile?.email ?? ""}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadgeColor(profile?.role ?? "")}`}>
                        {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Unknown"}
                      </span>
                      {profile?.profile_completed && (
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} disabled={loading}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{loading ? "Signing out..." : "Sign out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
