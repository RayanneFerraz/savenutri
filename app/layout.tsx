import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/authContext"
import { LanguageProvider } from "@/context/languageContext"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { AnalyticsProvider } from "@/components/analytics-provider"
import PWANotifications from "@/components/pwa-notifications"
import PWAInstall from "@/components/pwa-install"
import { ScrollToTop } from "@/components/scroll-to-top"
import Navigation from "@/components/navigation"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SaveNutri - Jejum Intermitente",
  description: "Aplicativo completo para acompanhar seu jejum intermitente",
  manifest: "/manifest.json",
  themeColor: "#F24E29",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SaveNutri",
  },
  icons: {
    apple: "/placeholder.svg?height=180&width=180&text=SN",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F24E29" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SaveNutri" />
        <link rel="apple-touch-icon" href="/placeholder.svg?height=180&width=180&text=SN" />
      </head>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <LanguageProvider>
            <AuthProvider>
              <AnalyticsProvider>
                <div className="min-h-screen bg-gray-50">
                  <Navigation />
                  <main className="pb-16 md:pb-0">{children}</main>
                </div>
                <Toaster />
                <SonnerToaster />
                <PWANotifications />
                <PWAInstall />
                <ScrollToTop />
              </AnalyticsProvider>
            </AuthProvider>
          </LanguageProvider>
        </Suspense>
      </body>
    </html>
  )
}
