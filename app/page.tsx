"use client" // Ensure this is a client component if using hooks directly

import FastingTimer from "@/components/fasting-timer"
import ProgressOverview from "@/components/progress-overview"
import QuickActions from "@/components/quick-actions"
import EducationalContent from "@/components/educational-content"
import { useLanguage } from "@/context/languageContext"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#F24E29] mb-2">{t("homeTitle")}</h1>
          <p className="text-gray-600">{t("homeSubtitle")}</p>
        </header>

        <div className="space-y-6">
          {/* Timer Principal */}
          <div>
            <FastingTimer />
          </div>

          {/* Visão Geral do Progresso */}
          <div>
            <ProgressOverview />
          </div>

          {/* Grid para Ações Rápidas e Conteúdo Educacional */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ações Rápidas */}
            <div>
              <QuickActions />
            </div>

            {/* Conteúdo Educacional */}
            <div>
              <EducationalContent />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
