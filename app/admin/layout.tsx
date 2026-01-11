"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Shield, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AdminSession {
  userId: string
  email: string
  name: string
  role: "admin" | "editor"
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const verifyAccess = async () => {
      // Allow access to login page without verification
      if (pathname === "/admin/login") {
        setIsLoading(false)
        return
      }

      try {
        const supabase = createClient()

        // Check if user is authenticated
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push("/admin/login")
          return
        }

        // Check user role in profiles table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("name, email, role")
          .eq("id", user.id)
          .single()

        if (profileError || !profile) {
          setError("Profile not found")
          router.push("/admin/login")
          return
        }

        // Verify admin or editor role
        if (profile.role !== "admin" && profile.role !== "editor") {
          setError("Access denied. Admin privileges required.")
          setIsLoading(false)
          return
        }

        setAdminSession({
          userId: user.id,
          email: profile.email || user.email || "",
          name: profile.name || "Admin",
          role: profile.role as "admin" | "editor",
        })
      } catch (err) {
        console.error("Admin verification error:", err)
        router.push("/admin/login")
      } finally {
        setIsLoading(false)
      }
    }

    verifyAccess()
  }, [router, pathname])

  // Login page doesn't need verification
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-[#F2AEE7] rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#F24E29]" />
            </div>
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4 text-[#F24E29]" />
            <h2 className="text-xl font-semibold text-[#F24E29] mb-2">Verifying Access</h2>
            <p className="text-gray-600">Validating your admin session...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !adminSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">{error || "You don't have permission to access this area."}</p>
            <button
              onClick={() => router.push("/admin/login")}
              className="px-4 py-2 bg-[#F24E29] text-white rounded-lg hover:bg-[#F24E29]/90 transition-colors"
            >
              Go to Login
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
