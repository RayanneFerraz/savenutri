"use client"

import type React from "react"

import { useEffect } from "react"
import { analytics } from "@/lib/analytics"

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inicializar analytics apenas se não estivermos na área admin
    if (!window.location.pathname.startsWith("/admin")) {
      analytics.initializeSession()
    }

    // Track page views
    const handleRouteChange = () => {
      analytics.trackPageView(window.location.pathname)
    }

    // Listen for route changes
    window.addEventListener("popstate", handleRouteChange)

    return () => {
      window.removeEventListener("popstate", handleRouteChange)
    }
  }, [])

  return <>{children}</>
}
