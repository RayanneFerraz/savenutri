"use client"

import { Suspense } from "react"
import FastingTimer from "@/components/fasting-timer"
import ProgressOverview from "@/components/progress-overview"
import QuickActions from "@/components/quick-actions"
import EducationalContent from "@/components/educational-content"
import { useLanguage } from "@/context/languageContext"

function HomeContent() {
  const { t, isLoading } = useLanguage()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#F24E29] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#F24E29] mb-2">{t("homeTitle")}</h1>
          <p className="text-gray-600">{t("homeSubtitle")}</p>
        </header>

        <div className="space-y-6">
          {/* Timer Principal */}
          <Suspense fallback={<div className="h-64 bg-white rounded-lg animate-pulse" />}>
            <FastingTimer />
          </Suspense>

          {/* Visao Geral do Progresso */}
          <Suspense fallback={<div className="h-48 bg-white rounded-lg animate-pulse" />}>
            <ProgressOverview />
          </Suspense>

          {/* Grid para Acoes Rapidas e Conteudo Educacional */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Acoes Rapidas */}
            <Suspense fallback={<div className="h-64 bg-white rounded-lg animate-pulse" />}>
              <QuickActions />
            </Suspense>

            {/* Conteudo Educacional */}
            <Suspense fallback={<div className="h-64 bg-white rounded-lg animate-pulse" />}>
              <EducationalContent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#F24E29] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Loading SaveNutri...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}
