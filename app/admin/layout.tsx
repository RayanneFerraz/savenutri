"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Shield, AlertTriangle } from "lucide-react"

interface AdminSession {
  userId: number
  username: string
  name: string
  role: "admin" | "editor"
  loginTime: string
}

const checkAdminSession = (): AdminSession | null => {
  try {
    const session = localStorage.getItem("adminSession")
    if (!session) return null

    const adminSession: AdminSession = JSON.parse(session)

    // Verificar se a sessão não expirou (24 horas)
    const loginTime = new Date(adminSession.loginTime)
    const now = new Date()
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

    if (hoursDiff > 24) {
      localStorage.removeItem("adminSession")
      return null
    }

    return adminSession
  } catch {
    return null
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const verifyAccess = async () => {
      // Permitir acesso à página de login sem verificação
      if (pathname === "/admin/login") {
        setIsLoading(false)
        return
      }

      try {
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simular verificação

        const session = checkAdminSession()
        if (!session) {
          router.push("/admin/login")
          return
        }

        setAdminSession(session)
      } catch (error) {
        router.push("/admin/login")
      } finally {
        setIsLoading(false)
      }
    }

    verifyAccess()
  }, [router, pathname])

  // Página de login não precisa de verificação
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
            <h2 className="text-xl font-semibold text-[#F24E29] mb-2">Verificando Acesso</h2>
            <p className="text-gray-600">Validando sua sessão administrativa...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!adminSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Sessão Expirada</h2>
            <p className="text-gray-600 mb-4">
              Sua sessão administrativa expirou. Faça login novamente para continuar.
            </p>
            <button
              onClick={() => router.push("/admin/login")}
              className="px-4 py-2 bg-[#F24E29] text-white rounded-lg hover:bg-[#F24E29]/90 transition-colors"
            >
              Fazer Login
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
