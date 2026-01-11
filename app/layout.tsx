import type React from "react"
import type { Metadata, Viewport } from "next"
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
  title: "SaveNutri - Intermittent Fasting App",
  description:
    "Transform your health with intermittent fasting. Intuitive interface, complete tracking, and scientific content.",
  keywords: "intermittent fasting, health, weight loss, wellness, nutrition, fasting timer, meal planning",
  authors: [{ name: "SaveNutri Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SaveNutri",
  },
  openGraph: {
    title: "SaveNutri - Intermittent Fasting",
    description: "Your companion for a healthier life through intermittent fasting",
    type: "website",
    locale: "en_US",
    alternateLocale: ["pt_BR", "es_ES"],
    siteName: "SaveNutri",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaveNutri - Intermittent Fasting",
    description: "Your companion for a healthier life through intermittent fasting",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32x32.jpg", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" }],
  },
  generator: "v0.dev",
}

export const viewport: Viewport = {
  themeColor: "#F24E29",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#F24E29] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Loading SaveNutri...</p>
      </div>
    </div>
  )
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
        <meta name="application-name" content="SaveNutri" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SaveNutri" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#F24E29" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png" />

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
            <Suspense fallback={<LoadingFallback />}>
              <AnalyticsProvider>
                <Navigation />
                <main className="pb-20 md:pb-0">{children}</main>
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
