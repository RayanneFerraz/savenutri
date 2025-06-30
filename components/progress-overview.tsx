"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, BarChart3, Scale, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/context/languageContext"
import { useEffect, useState } from "react"

interface WeightEntry {
  date: string
  weight: number
  timestamp: number
}

interface HydrationSettings {
  customGoal?: number
  useWeightBased: boolean
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active"
  climate: "normal" | "hot" | "cold"
}

export default function ProgressOverview() {
  const { t } = useLanguage()
  const [currentWeight, setCurrentWeight] = useState<number | null>(null)
  const [weightTrend, setWeightTrend] = useState<{ difference: number; direction: "up" | "down" | "stable" } | null>(
    null,
  )
  // Start with 0 completed fasts. This will be updated once history tracking is implemented.
  const [fastsThisWeek, setFastsThisWeek] = useState({ completed: 0, total: 7 })
  const [hydrationProgress, setHydrationProgress] = useState(0)

  useEffect(() => {
    // Defina a função loadData aqui (conforme descrito no passo 1)
    const loadData = () => {
      // --- Load Weight Data ---
      const savedWeightHistory = localStorage.getItem("weightHistory")
      if (savedWeightHistory) {
        try {
          const history: WeightEntry[] = JSON.parse(savedWeightHistory)
          if (history.length > 0) {
            setCurrentWeight(history[history.length - 1].weight)
            if (history.length > 1) {
              const diff = history[history.length - 1].weight - history[history.length - 2].weight
              setWeightTrend({
                difference: Math.abs(diff),
                direction: diff > 0 ? "up" : diff < 0 ? "down" : "stable",
              })
            } else {
              setWeightTrend(null) // Reset trend if only one entry
            }
          } else {
            setCurrentWeight(null) // No history, no current weight
            setWeightTrend(null)
          }
        } catch (error) {
          console.error("Error loading weight history for overview:", error)
          setCurrentWeight(null)
          setWeightTrend(null)
        }
      } else {
        setCurrentWeight(null)
        setWeightTrend(null)
      }

      // --- Load Hydration Data ---
      const calculateWaterGoalLocal = (settings: HydrationSettings, userWeightVal: number | null): number => {
        if (settings.customGoal && settings.customGoal > 0) return settings.customGoal
        if (!settings.useWeightBased || !userWeightVal) return 2000
        let baseGoal = userWeightVal * 35
        const activityMultipliers = { sedentary: 1.0, light: 1.1, moderate: 1.2, active: 1.3, very_active: 1.4 }
        baseGoal *= activityMultipliers[settings.activityLevel]
        const climateMultipliers = { cold: 0.9, normal: 1.0, hot: 1.2 }
        baseGoal *= climateMultipliers[settings.climate]
        return Math.max(500, Math.round(baseGoal)) // Ensure goal is at least 500ml
      }

      const savedDailyData = localStorage.getItem("dailyData")
      const savedHydrationSettings = localStorage.getItem("hydrationSettings")
      const savedProfile = localStorage.getItem("fastingProfile")

      let waterGoal = 2000
      let currentWaterIntake = 0

      try {
        const settings = savedHydrationSettings
          ? JSON.parse(savedHydrationSettings)
          : { useWeightBased: true, activityLevel: "moderate", climate: "normal", customGoal: undefined }
        const profile = savedProfile ? JSON.parse(savedProfile) : {}
        const userWeightVal = profile.weight ? Number.parseFloat(profile.weight) : null
        waterGoal = calculateWaterGoalLocal(settings, userWeightVal)
      } catch (error) {
        console.error("Error reading settings for water goal in ProgressOverview:", error)
      }

      if (savedDailyData) {
        try {
          const data = JSON.parse(savedDailyData)
          const today = new Date().toDateString()
          const todayData = data[today]
          if (todayData && typeof todayData.water === "number") {
            currentWaterIntake = todayData.water
          }
        } catch (error) {
          console.error("Error loading hydration data for overview:", error)
        }
      }
      const progress = waterGoal > 0 ? Math.min(100, Math.round((currentWaterIntake / waterGoal) * 100)) : 0
      setHydrationProgress(progress)
    }

    loadData() // Carrega os dados na primeira vez

    const handleStorageChange = (event: Event) => {
      if (
        event instanceof CustomEvent &&
        event.detail &&
        (event.detail.key === "dailyData" ||
          event.detail.key === "hydrationSettings" ||
          event.detail.key === "fastingProfile")
      ) {
        loadData() // Recarrega os dados se chaves relevantes mudaram
      }
    }

    window.addEventListener("localStorageChange", handleStorageChange)

    // Limpa o event listener quando o componente é desmontado
    return () => {
      window.removeEventListener("localStorageChange", handleStorageChange)
    }
  }, []) // O array de dependências vazio está correto aqui, pois as atualizações são tratadas pelo event listener.

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[#F24E29] flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          {t("progressOverviewTitle")}
        </CardTitle>
        <Link href="/progress">
          <Button variant="ghost" size="sm" className="text-xs text-[#F24E29] hover:bg-[#F2AEE7]/20">
            {t("viewDetails")} <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fasting Progress */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">{t("fastingThisWeek")}</span>
            <span className="text-sm text-gray-600">
              {fastsThisWeek.completed}/{fastsThisWeek.total} {t("completed")}
            </span>
          </div>
          <Progress
            value={(fastsThisWeek.completed / fastsThisWeek.total) * 100}
            className="h-2 bg-green-100 [&>*]:bg-green-500"
          />
        </div>

        {/* Hydration Progress */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">{t("hydration")}</span>
            <span className="text-sm text-gray-600">
              {hydrationProgress}% {t("goal")}
            </span>
          </div>
          <Progress value={hydrationProgress} className="h-2 bg-blue-100 [&>*]:bg-blue-500" />
        </div>

        {/* Weight Overview */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{t("currentWeight")}:</span>
            <span className="font-semibold text-[#F24E29]">
              {currentWeight !== null ? `${currentWeight}kg` : t("noData")}
            </span>
          </div>
          {weightTrend && weightTrend.direction !== "stable" && (
            <div className="flex items-center gap-1 text-xs">
              {weightTrend.direction === "up" ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500" />
              )}
              <span className={weightTrend.direction === "up" ? "text-red-500" : "text-green-500"}>
                {weightTrend.difference.toFixed(1)}kg
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
