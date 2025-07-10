import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Navigation from "@/components/navigation"
import PWAInstall from "@/components/pwa-install"
import { AnalyticsProvider } from "@/components/analytics-provider"
import { Suspense } from "react"
import { AuthProvider } from "@/context/authContext"
import { LanguageProvider } from "@/context/languageContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FastTrack - Aplicativo de Jejum Intermitente",
  description:
    "Transforme sua saúde com jejum intermitente. Interface intuitiva, rastreamento completo e conteúdo científico.",
  keywords: "jejum intermitente, saúde, perda de peso, bem-estar, nutrição",
  authors: [{ name: "FastTrack Team" }],
  manifest: "/manifest.json",
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FastTrack",
  },
  openGraph: {
    title: "FastTrack - Jejum Intermitente",
    description: "Seu companheiro para uma vida mais saudável através do jejum intermitente",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/placeholder.svg?height=32&width=32&text=FT", sizes: "32x32" },
      { url: "/placeholder.svg?height=192&width=192&text=FT", sizes: "192x192" },
    ],
    apple: [{ url: "/placeholder.svg?height=180&width=180&text=FT", sizes: "180x180" }],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="FastTrack" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FastTrack" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/placeholder.svg?height=180&width=180&text=FT" />
        <link rel="apple-touch-icon" sizes="152x152" href="/placeholder.svg?height=152&width=152&text=FT" />
        <link rel="apple-touch-icon" sizes="180x180" href="/placeholder.svg?height=180&width=180&text=FT" />
        <link rel="apple-touch-icon" sizes="167x167" href="/placeholder.svg?height=167&width=167&text=FT" />

        {/* Splash Screens */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <AnalyticsProvider>
                <Navigation />
                <main>{children}</main>
                <PWAInstall />
                <Toaster />
              </AnalyticsProvider>
            </Suspense>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
