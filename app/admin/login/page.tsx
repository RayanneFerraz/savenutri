"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Lock, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useLanguage } from "@/context/languageContext"

interface AdminUser {
  id: number
  username: string
  password: string
  name: string
  role: "admin" | "editor"
  createdAt: string
  lastLogin?: string
}

// Initial admin users data (in production would be in database)
const getAdminUsers = (): AdminUser[] => {
  const stored = localStorage.getItem("adminUsers")
  if (stored) {
    return JSON.parse(stored)
  }

  const defaultUsers: AdminUser[] = [
    {
      id: 1,
      username: "rayannebferraz",
      password: "153420Tools",
      name: "Rayanne Ferraz",
      role: "admin",
      createdAt: "2025-01-01",
    },
  ]

  localStorage.setItem("adminUsers", JSON.stringify(defaultUsers))
  return defaultUsers
}

export default function AdminLoginPage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate authentication delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const adminUsers = getAdminUsers()
      const user = adminUsers.find((u) => u.username === formData.username && u.password === formData.password)

      if (!user) {
        setError(t("adminLoginError"))
        setIsLoading(false)
        return
      }

      // Update last login
      const updatedUsers = adminUsers.map((u) => (u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u))
      localStorage.setItem("adminUsers", JSON.stringify(updatedUsers))

      // Save admin session
      localStorage.setItem(
        "adminSession",
        JSON.stringify({
          userId: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          loginTime: new Date().toISOString(),
        }),
      )

      toast({
        title: t("loginSuccessful"),
        description: t("welcomeAdmin", { name: user.name }),
      })

      router.push("/admin")
    } catch (error) {
      setError(t("internalError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center bg-gradient-to-r from-[#F24E29] to-[#F27D16] text-white rounded-t-lg">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{t("adminAccess")}</CardTitle>
          <p className="text-white/90 text-sm">{t("enterWithCredentials")}</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder={t("enterUsername")}
                  className="pl-10"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("enterPassword")}
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#F24E29] to-[#F27D16] hover:from-[#F24E29]/90 hover:to-[#F27D16]/90 text-white"
            >
              {isLoading ? t("loading") : t("login")}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>{t("restrictedArea")}</p>
            <p>{t("contactSupport")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
