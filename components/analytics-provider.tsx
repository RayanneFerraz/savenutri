"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { AnalyticsService } from "@/lib/analytics"

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Nao rastrear paginas de admin
    if (pathname?.startsWith("/admin")) {
      return
    }

    // Inicializar sessao apenas uma vez
    AnalyticsService.initializeSession()
  }, [])

  useEffect(() => {
    // Rastrear mudancas de pagina
    if (pathname && !pathname.startsWith("/admin")) {
      AnalyticsService.pageView(pathname)
    }
  }, [pathname])

  return <>{children}</>
}
