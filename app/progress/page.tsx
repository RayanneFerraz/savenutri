"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Calendar, Target, Award, Scale, Clock, BarChart3, Smile, Moon } from "lucide-react"
import { useLanguage } from "@/context/languageContext"
import type { Translations } from "@/lib/translations" // Assuming your translations type is exported

// Interfaces for our data structures
interface WeightEntry {
  date: string
  weight: number
  timestamp: number
}

interface WellnessEntry {
  date: string
  value: string
}

interface FastingEntry {
  date: string // Formatted date string
  duration: number // in hours
  completed: boolean
  type: string
  timestamp: number // Original timestamp for sorting/filtering
}

interface HydrationSettings {
  customGoal?: number
  useWeightBased: boolean
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active"
  climate: "normal" | "hot" | "cold"
}

interface Stats {
  completedFasts: number
  totalFasts: number
  averageDuration: number
  waterIntake: number // in Liters
  currentStreak: number
}

// ADD: Interface for Achievement
interface Achievement {
  key: string
  titleKey: keyof Translations["pt"] // Or a more specific type for translation keys
  descKey: keyof Translations["pt"]
  completed: boolean
  date: string | null // Date of completion
  progress: number // 0-100
}

const initialStats: Stats = {
  completedFasts: 0,
  totalFasts: 7,
  averageDuration: 0,
  waterIntake: 0,
  currentStreak: 0,
}

// Helper functions for date calculations
const getDaysInCurrentMonth = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
}

const getFirstDayOfCurrentMonth = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
}

const getLastDayOfCurrentMonth = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
}

// ADD: Initial state for achievements
const initialAchievementsData: Achievement[] = [
  {
    key: "firstWeek",
    titleKey: "firstWeekAchievement",
    descKey: "firstWeekAchievementDesc",
    completed: false,
    date: null,
    progress: 0,
  },
  {
    key: "hydrationMaster",
    titleKey: "hydrationMasterAchievement",
    descKey: "hydrationMasterAchievementDesc",
    completed: false,
    date: null,
    progress: 0,
  },
  {
    key: "ironStreak",
    titleKey: "ironStreakAchievement",
    descKey: "ironStreakAchievementDesc",
    completed: false,
    date: null,
    progress: 0,
  },
  {
    key: "fullMonth",
    titleKey: "fullMonthAchievement",
    descKey: "fullMonthAchievementDesc",
    completed: false,
    date: null,
    progress: 0,
  },
  {
    key: "weightLoss",
    titleKey: "weightLossAchievement",
    descKey: "weightLossAchievementDesc",
    completed: false,
    date: null,
    progress: 0,
  },
]

export default function ProgressPage() {
  const { t } = useLanguage()
  const [selectedPeriod, setSelectedPeriod] = useState("week")
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([])
  const [fastingHistory, setFastingHistory] = useState<FastingEntry[]>([])
  const [wellnessData, setWellnessData] = useState<{ mood: WellnessEntry[]; sleep: WellnessEntry[] }>({
    mood: [],
    sleep: [],
  })
  const [weeklyStats, setWeeklyStats] = useState<Stats>(initialStats)
  const [monthlyStats, setMonthlyStats] = useState<Stats>({ ...initialStats, totalFasts: getDaysInCurrentMonth() })
  const [weeklyHydrationGoalL, setWeeklyHydrationGoalL] = useState(14)
  const [monthlyHydrationGoalL, setMonthlyHydrationGoalL] = useState((2000 / 1000) * getDaysInCurrentMonth())

  // UPDATE: Use the new Achievement interface and initial data
  const [achievementsData, setAchievementsData] = useState<Achievement[]>(initialAchievementsData)

  // ADD: Function to calculate achievements
  const calculateAchievements = (
    fasts: FastingEntry[],
    weights: WeightEntry[],
    dailyData: Record<string, { water?: number }>,
    dailyHydrationGoalMl: number,
  ): Achievement[] => {
    const updatedAchievements = [...initialAchievementsData].map((ach) => ({ ...ach })) // Deep copy

    // 1. First Week Achievement (7 completed fasts)
    const firstWeekAch = updatedAchievements.find((a) => a.key === "firstWeek")!
    const completedFastsTotal = fasts.filter((f) => f.completed)
    firstWeekAch.progress = Math.min((completedFastsTotal.length / 7) * 100, 100)
    if (completedFastsTotal.length >= 7) {
      firstWeekAch.completed = true
      // Sort completed fasts by timestamp to get the date of the 7th completed fast
      const seventhFastDate = completedFastsTotal.sort((a, b) => a.timestamp - b.timestamp)[6]?.timestamp
      if (seventhFastDate) {
        firstWeekAch.date = new Date(seventhFastDate).toLocaleDateString("pt-BR")
      }
    }

    // 2. Hydration Master (meet daily goal for 7 days)
    const hydrationMasterAch = updatedAchievements.find((a) => a.key === "hydrationMaster")!
    let daysHydrationGoalMet = 0
    const metDates: number[] = []
    Object.values(dailyData).forEach((day) => {
      if (day.water && dailyHydrationGoalMl > 0 && day.water >= dailyHydrationGoalMl) {
        daysHydrationGoalMet++
        // This part for date is tricky without knowing the date key for dailyData, assuming it's part of a larger structure
        // For simplicity, we'll take the date of the 7th time it's met if we had timestamps for dailyData entries
      }
    })
    // To get the date, we'd need to sort the dailyData entries by date if they had timestamps
    const sortedDailyDataWithTimestamps = Object.entries(dailyData)
      .map(([dateStr, data]) => ({ date: new Date(dateStr).getTime(), water: data.water }))
      .filter((entry) => entry.water && dailyHydrationGoalMl > 0 && entry.water >= dailyHydrationGoalMl)
      .sort((a, b) => a.date - b.date)

    hydrationMasterAch.progress = Math.min((sortedDailyDataWithTimestamps.length / 7) * 100, 100)
    if (sortedDailyDataWithTimestamps.length >= 7) {
      hydrationMasterAch.completed = true
      hydrationMasterAch.date = new Date(sortedDailyDataWithTimestamps[6].date).toLocaleDateString("pt-BR")
    }

    // 3. Iron Streak (10 consecutive completed fasts)
    const ironStreakAch = updatedAchievements.find((a) => a.key === "ironStreak")!
    let maxStreak = 0
    let currentStreakInternal = 0
    let dateOf10thInStreak: number | null = null
    const sortedFastsForStreak = [...fasts].sort((a, b) => a.timestamp - b.timestamp)
    for (const fast of sortedFastsForStreak) {
      if (fast.completed) {
        currentStreakInternal++
        if (currentStreakInternal >= 10 && !dateOf10thInStreak) {
          dateOf10thInStreak = fast.timestamp
        }
      } else {
        maxStreak = Math.max(maxStreak, currentStreakInternal)
        currentStreakInternal = 0
      }
    }
    maxStreak = Math.max(maxStreak, currentStreakInternal) // Final check
    ironStreakAch.progress = Math.min((maxStreak / 10) * 100, 100)
    if (maxStreak >= 10) {
      ironStreakAch.completed = true
      if (dateOf10thInStreak) ironStreakAch.date = new Date(dateOf10thInStreak).toLocaleDateString("pt-BR")
    }

    // 4. Full Month Achievement (30 completed fasts in a calendar month)
    // This requires checking fasts within the *current* calendar month or any single calendar month.
    // For simplicity, let's check for *any* month with 30+ completed fasts.
    const fullMonthAch = updatedAchievements.find((a) => a.key === "fullMonth")!
    const fastsByMonth: Record<string, { count: number; lastDate?: number }> = {}
    completedFastsTotal.forEach((f) => {
      const monthYear = new Date(f.timestamp).toLocaleDateString("pt-BR", { year: "numeric", month: "2-digit" })
      fastsByMonth[monthYear] = fastsByMonth[monthYear] || { count: 0 }
      fastsByMonth[monthYear].count++
      if (fastsByMonth[monthYear].count === 30) {
        fastsByMonth[monthYear].lastDate = f.timestamp
      }
    })
    let maxFastsInMonth = 0
    let dateForFullMonthAch: string | null = null
    Object.values(fastsByMonth).forEach((monthData) => {
      if (monthData.count > maxFastsInMonth) {
        maxFastsInMonth = monthData.count
      }
      if (monthData.count >= 30 && monthData.lastDate) {
        fullMonthAch.completed = true
        // Take the earliest month this was achieved if multiple
        const achDate = new Date(monthData.lastDate).toLocaleDateString("pt-BR")
        if (
          !dateForFullMonthAch ||
          new Date(monthData.lastDate) < new Date(dateForFullMonthAch.split("/").reverse().join("-"))
        ) {
          dateForFullMonthAch = achDate
        }
      }
    })
    fullMonthAch.progress = Math.min((maxFastsInMonth / 30) * 100, 100)
    if (fullMonthAch.completed && dateForFullMonthAch) {
      fullMonthAch.date = dateForFullMonthAch
    }

    // 5. Weight Loss Achievement (lose 5kg from starting weight)
    const weightLossAch = updatedAchievements.find((a) => a.key === "weightLoss")!
    if (weights.length >= 1) {
      const sortedWeights = [...weights].sort((a, b) => a.timestamp - b.timestamp)
      const startingWeight = sortedWeights[0].weight
      let dateForWeightLossAch: string | null = null

      for (const entry of sortedWeights) {
        const loss = startingWeight - entry.weight
        if (loss >= 5 && !weightLossAch.completed) {
          weightLossAch.completed = true
          dateForWeightLossAch = new Date(entry.timestamp).toLocaleDateString("pt-BR")
          weightLossAch.date = dateForWeightLossAch // Set date as soon as achieved
        }
        // Update progress based on the maximum loss towards 5kg found so far
        // If already completed, progress is 100. Otherwise, calculate current progress.
        if (!weightLossAch.completed) {
          weightLossAch.progress = Math.min(Math.max(0, (loss / 5) * 100), 100)
        } else {
          weightLossAch.progress = 100 // Ensure progress is 100 if completed
        }
      }
      // If not completed after loop, ensure progress reflects the latest weight
      if (!weightLossAch.completed && sortedWeights.length > 0) {
        const currentWeight = sortedWeights[sortedWeights.length - 1].weight
        const currentLoss = startingWeight - currentWeight
        weightLossAch.progress = Math.min(Math.max(0, (currentLoss / 5) * 100), 100)
      }
    } else {
      weightLossAch.progress = 0
    }

    return updatedAchievements
  }

  // ADD: Function to calculate current streak
  const calculateCurrentFastingStreak = (fasts: FastingEntry[]): number => {
    const sortedFasts = [...fasts].sort((a, b) => b.timestamp - a.timestamp) // Most recent first
    let streak = 0
    for (const fast of sortedFasts) {
      // We need to check if the fast was *supposed* to happen on consecutive days.
      // This simple version just counts consecutive completed fasts from the most recent.
      // A more robust version would check dates.
      if (fast.completed) {
        streak++
      } else {
        break // Streak broken
      }
    }
    return streak
  }

  useEffect(() => {
    const loadAndProcessData = () => {
      const savedWeightHistory = localStorage.getItem("weightHistory")
      const savedDailyData = localStorage.getItem("dailyData")
      const savedFastingHistory = localStorage.getItem("fastingHistory")
      const savedHydrationSettings = localStorage.getItem("hydrationSettings")
      const savedProfile = localStorage.getItem("fastingProfile")

      const weightData: WeightEntry[] = savedWeightHistory ? JSON.parse(savedWeightHistory) : []
      const dailyDataStore: Record<string, { water?: number; mood?: string; sleep?: string }> = savedDailyData
        ? JSON.parse(savedDailyData)
        : {}
      const fastingData: FastingEntry[] = savedFastingHistory ? JSON.parse(savedFastingHistory) : []

      setWeightHistory(weightData)
      // Ensure fasting data is sorted by timestamp for correct streak calculation and recent activity
      const sortedFastingData = fastingData.sort((a, b) => b.timestamp - a.timestamp)
      setFastingHistory(sortedFastingData)

      const moodEntries: WellnessEntry[] = []
      const sleepEntries: WellnessEntry[] = []
      Object.entries(dailyDataStore).forEach(([dateKey, dataItem]) => {
        if (dataItem.mood)
          moodEntries.push({
            date: new Date(dateKey).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            value: dataItem.mood,
          })
        if (dataItem.sleep)
          sleepEntries.push({
            date: new Date(dateKey).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            value: dataItem.sleep,
          })
      })
      setWellnessData({
        mood: moodEntries
          .sort(
            (a, b) =>
              new Date(b.date.split("/").reverse().join("-")).getTime() -
              new Date(a.date.split("/").reverse().join("-")).getTime(),
          )
          .slice(0, 10),
        sleep: sleepEntries
          .sort(
            (a, b) =>
              new Date(b.date.split("/").reverse().join("-")).getTime() -
              new Date(a.date.split("/").reverse().join("-")).getTime(),
          )
          .slice(0, 10),
      })

      let currentDailyGoalMl = 2000
      try {
        const settings: HydrationSettings = savedHydrationSettings
          ? JSON.parse(savedHydrationSettings)
          : { useWeightBased: true, activityLevel: "moderate", climate: "normal", customGoal: undefined }

        if (settings.customGoal && typeof settings.customGoal === "number" && settings.customGoal > 0) {
          currentDailyGoalMl = settings.customGoal
        } else if (settings.useWeightBased) {
          let userWeight: number | null = null
          if (savedProfile) {
            const profile = JSON.parse(savedProfile)
            if (profile.weight) userWeight = Number.parseFloat(profile.weight)
          }
          if (userWeight && userWeight > 0) {
            let baseGoal = userWeight * 35
            const activityMultipliers = { sedentary: 1.0, light: 1.1, moderate: 1.2, active: 1.3, very_active: 1.4 }
            baseGoal *= activityMultipliers[settings.activityLevel || "moderate"]
            const climateMultipliers = { cold: 0.9, normal: 1.0, hot: 1.2 }
            baseGoal *= climateMultipliers[settings.climate || "normal"]
            currentDailyGoalMl = Math.max(500, Math.round(baseGoal))
          } else {
            currentDailyGoalMl = 2000 // Default if no weight for calculation
          }
        } else {
          currentDailyGoalMl = 2000 // Default if not custom and not weight-based
        }
      } catch (e) {
        console.error("Error calculating daily hydration goal:", e)
        currentDailyGoalMl = 2000
      }
      setWeeklyHydrationGoalL((currentDailyGoalMl / 1000) * 7)
      setMonthlyHydrationGoalL((currentDailyGoalMl / 1000) * getDaysInCurrentMonth())

      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const firstDayCurrentMonth = getFirstDayOfCurrentMonth()
      const lastDayCurrentMonth = getLastDayOfCurrentMonth()
      const daysInMonth = getDaysInCurrentMonth()

      const weeklyFasts = sortedFastingData.filter((f) => f.timestamp >= weekAgo.getTime() && f.completed)
      const monthlyFasts = sortedFastingData.filter(
        (f) =>
          f.timestamp >= firstDayCurrentMonth.getTime() && f.timestamp <= lastDayCurrentMonth.getTime() && f.completed,
      )

      const weeklyWater = Object.entries(dailyDataStore)
        .filter(([dateKey]) => new Date(dateKey) >= weekAgo)
        .reduce((sum, [, dataItem]) => sum + (dataItem.water || 0), 0)

      const monthlyWater = Object.entries(dailyDataStore)
        .filter(([dateKey]) => {
          const entryDate = new Date(dateKey)
          return entryDate >= firstDayCurrentMonth && entryDate <= lastDayCurrentMonth
        })
        .reduce((sum, [, dataItem]) => sum + (dataItem.water || 0), 0)

      // UPDATE: Calculate current streak
      const currentFastingStreak = calculateCurrentFastingStreak(sortedFastingData)

      setWeeklyStats({
        completedFasts: weeklyFasts.length,
        totalFasts: 7,
        averageDuration:
          weeklyFasts.length > 0 ? weeklyFasts.reduce((sum, f) => sum + f.duration, 0) / weeklyFasts.length : 0,
        waterIntake: weeklyWater / 1000,
        currentStreak: currentFastingStreak, // Use calculated streak
      })

      setMonthlyStats({
        completedFasts: monthlyFasts.length,
        totalFasts: daysInMonth,
        averageDuration:
          monthlyFasts.length > 0 ? monthlyFasts.reduce((sum, f) => sum + f.duration, 0) / monthlyFasts.length : 0,
        waterIntake: monthlyWater / 1000,
        currentStreak: currentFastingStreak, // Use calculated streak
      })

      // ADD: Calculate and set achievements
      const dailyDataForAchievements: Record<string, { water?: number }> = {}
      Object.entries(dailyDataStore).forEach(([dateKey, data]) => {
        dailyDataForAchievements[dateKey] = { water: data.water }
      })
      const newAchievements = calculateAchievements(
        sortedFastingData,
        weightData,
        dailyDataForAchievements,
        currentDailyGoalMl,
      )
      setAchievementsData(newAchievements)
    }

    loadAndProcessData()
    // Dispatch a custom event when localStorage changes from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key &&
        ["weightHistory", "dailyData", "fastingHistory", "hydrationSettings", "fastingProfile"].includes(event.key)
      ) {
        loadAndProcessData()
      }
    }
    window.addEventListener("storage", handleStorageChange)
    // Also listen for custom event for changes within the same tab (e.g., from QuickActions)
    window.addEventListener("localStorageChange", loadAndProcessData as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("localStorageChange", loadAndProcessData as EventListener)
    }
  }, []) // Removed 't' from dependencies as it should be stable

  const getWeightStats = () => {
    if (weightHistory.length === 0) return { currentWeight: null, weightChange: 0, trend: "stable" }
    const sortedWeightHistory = [...weightHistory].sort((a, b) => a.timestamp - b.timestamp)
    const currentWeight = sortedWeightHistory[sortedWeightHistory.length - 1].weight
    const firstWeight = sortedWeightHistory[0].weight
    const weightChange = currentWeight - firstWeight
    let trend: "stable" | "up" | "down" = "stable"
    if (sortedWeightHistory.length >= 2) {
      const recentChange =
        sortedWeightHistory[sortedWeightHistory.length - 1].weight -
        sortedWeightHistory[sortedWeightHistory.length - 2].weight
      trend = recentChange > 0 ? "up" : recentChange < 0 ? "down" : "stable"
    }
    return { currentWeight, weightChange, trend }
  }
  const weightStats = getWeightStats()
  const displayedStats = selectedPeriod === "week" ? weeklyStats : monthlyStats

  const getMostFrequent = (arr: WellnessEntry[]) => {
    if (arr.length === 0) return t("noData")
    const frequencyMap = arr.reduce(
      (acc, curr) => {
        acc[curr.value] = (acc[curr.value] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.keys(frequencyMap).reduce((a, b) => (frequencyMap[a] > frequencyMap[b] ? a : b))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#F24E29] mb-2">{t("myProgress")}</h1>
            <p className="text-gray-600">{t("trackYourJourney")}</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-white border border-pink-200">
              {["overview", "weight", "fasting", "wellness", "achievements"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="border-r border-pink-200 last:border-r-0 py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-pink-100 data-[state=active]:text-[#F24E29]"
                >
                  {t(tab as "overview" | "weight" | "fasting" | "wellness" | "achievements")}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="flex justify-center gap-2">
                <Button
                  variant={selectedPeriod === "week" ? "default" : "outline"}
                  onClick={() => setSelectedPeriod("week")}
                  className={
                    selectedPeriod === "week"
                      ? "bg-[#F24E29] hover:bg-[#F24E29]/90 text-white"
                      : "border-[#F24E29] text-[#F24E29] hover:bg-pink-50"
                  }
                >
                  {t("thisWeek")}
                </Button>
                <Button
                  variant={selectedPeriod === "month" ? "default" : "outline"}
                  onClick={() => setSelectedPeriod("month")}
                  className={
                    selectedPeriod === "month"
                      ? "bg-[#F24E29] hover:bg-[#F24E29]/90 text-white"
                      : "border-[#F24E29] text-[#F24E29] hover:bg-pink-50"
                  }
                >
                  {t("thisMonth")}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-[#F2AEE7] to-[#F2C12E]">
                  <CardContent className="p-6 text-center text-white">
                    <Clock className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{displayedStats.completedFasts}</div>
                    <div className="text-sm opacity-90">{t("completedFasts")}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-[#F2C12E] to-[#F27D16]">
                  <CardContent className="p-6 text-center text-white">
                    <Target className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {displayedStats.totalFasts > 0
                        ? `${Math.round((displayedStats.completedFasts / displayedStats.totalFasts) * 100)}%`
                        : "0%"}
                    </div>
                    <div className="text-sm opacity-90">{t("successRate")}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-[#F27D16] to-[#F24E29]">
                  <CardContent className="p-6 text-center text-white">
                    <Scale className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold flex items-center justify-center gap-1">
                      {weightStats.currentWeight ? (
                        <>
                          {weightStats.weightChange > 0 ? "+" : ""}
                          {weightStats.weightChange.toFixed(1)}kg{" "}
                          {weightStats.trend === "down" && <TrendingDown className="w-4 h-4" />}{" "}
                          {weightStats.trend === "up" && <TrendingUp className="w-4 h-4" />}
                        </>
                      ) : (
                        t("noData")
                      )}
                    </div>
                    <div className="text-sm opacity-90">{t("weightChange")}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-[#F24E29] to-purple-600">
                  <CardContent className="p-6 text-center text-white">
                    <Award className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{displayedStats.currentStreak}</div>
                    <div className="text-sm opacity-90">{t("currentStreak")}</div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      {selectedPeriod === "week" ? t("weeklyProgress") : t("monthlyProgress")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>{t("completedFasts")}</span>
                        <span className="font-bold">
                          {displayedStats.completedFasts}/{displayedStats.totalFasts}
                        </span>
                      </div>
                      <Progress
                        value={
                          displayedStats.totalFasts > 0
                            ? (displayedStats.completedFasts / displayedStats.totalFasts) * 100
                            : 0
                        }
                        className="h-3 [&>*]:bg-pink-500"
                      />
                      <div className="flex justify-between items-center">
                        <span>{t("hydrationGoal")}</span>
                        <span className="font-bold">
                          {displayedStats.waterIntake.toFixed(1)}L /{" "}
                          {(selectedPeriod === "week" ? weeklyHydrationGoalL : monthlyHydrationGoalL).toFixed(0)}L
                        </span>
                      </div>
                      <Progress
                        value={
                          selectedPeriod === "week"
                            ? weeklyHydrationGoalL > 0
                              ? Math.min((displayedStats.waterIntake / weeklyHydrationGoalL) * 100, 100)
                              : 0
                            : monthlyHydrationGoalL > 0
                              ? Math.min((displayedStats.waterIntake / monthlyHydrationGoalL) * 100, 100)
                              : 0
                        }
                        className="h-3 [&>*]:bg-blue-500"
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {t("recentActivity")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {fastingHistory.slice(0, 5).map((fast, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${fast.completed ? "bg-green-500" : "bg-red-500"}`}
                            ></div>
                            <div>
                              <div className="font-medium">
                                {new Date(fast.timestamp).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </div>
                              <div className="text-sm text-gray-500">{t("planType", { type: fast.type })}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{fast.duration.toFixed(1)}h</div>
                            <Badge
                              variant={fast.completed ? "default" : "destructive"}
                              className={`text-xs ${fast.completed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                              {fast.completed ? t("completed") : t("incomplete")}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {fastingHistory.length === 0 && <p className="text-sm text-gray-500">{t("noFastingHistory")}</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="weight" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#F24E29] flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    {t("weightHistory")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weightHistory.length > 0 ? (
                    <div className="space-y-4">
                      {[...weightHistory] // Create a copy before reversing to avoid mutating state directly
                        .sort((a, b) => b.timestamp - a.timestamp) // Sort by most recent first
                        .map((entry, index, arr) => {
                          const prevEntry = arr[index + 1] // Previous entry in the sorted (reversed) list
                          const change = prevEntry ? entry.weight - prevEntry.weight : 0
                          const trendIcon =
                            change < 0 ? (
                              <TrendingDown className="w-4 h-4 text-green-500" />
                            ) : change > 0 ? (
                              <TrendingUp className="w-4 h-4 text-red-500" />
                            ) : null
                          const changeText = change !== 0 ? `${change > 0 ? "+" : ""}${change.toFixed(1)}kg` : ""
                          const changeColor =
                            change < 0 ? "text-green-500" : change > 0 ? "text-red-500" : "text-gray-500"

                          return (
                            <div
                              key={entry.timestamp}
                              className="flex items-center justify-between p-3 bg-[#F2EAE4] rounded-lg"
                            >
                              <span className="font-medium">{entry.date}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">{entry.weight}kg</span>
                                {prevEntry && (
                                  <div className="flex items-center gap-1">
                                    {trendIcon}
                                    <span className={`text-sm ${changeColor}`}>{changeText}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-500 mb-2">{t("noWeightRegistered")}</h3>
                      <p className="text-gray-400">{t("useQuickActionsToLog")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              {weightStats.currentWeight && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-[#F2AEE7] to-[#F2C12E] text-white">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold">{weightStats.currentWeight}kg</div>
                      <div className="text-sm opacity-90">{t("currentWeightLabel")}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-[#F27D16] to-[#F24E29] text-white">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold">
                        {weightStats.weightChange > 0 ? "+" : ""}
                        {weightStats.weightChange.toFixed(1)}kg
                      </div>
                      <div className="text-sm opacity-90">{t("totalChange")}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-[#F2C12E] to-[#F27D16] text-white">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold">{weightHistory.length}</div>
                      <div className="text-sm opacity-90">{t("records")}</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="fasting" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#F24E29] flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {t("fastingHistory")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {fastingHistory.length > 0 ? (
                    <div className="space-y-3">
                      {fastingHistory.map(
                        (
                          fast, // Already sorted from useEffect
                        ) => (
                          <div key={fast.timestamp} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-4 h-4 rounded-full ${fast.completed ? "bg-green-500" : "bg-red-500"}`}
                              ></div>
                              <div>
                                <div className="font-medium">
                                  {new Date(fast.timestamp).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </div>
                                <div className="text-sm text-gray-500">{t("planType", { type: fast.type })}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{fast.duration.toFixed(1)}h</div>
                              <Badge
                                variant={fast.completed ? "default" : "destructive"}
                                className={`${fast.completed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                              >
                                {fast.completed ? `✓ ${t("completed")}` : t("incomplete")}
                              </Badge>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-500 mb-2">{t("noFastingHistory")}</h3>
                      <p className="text-gray-400">{t("useTimerToLogFasts")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievementsData.map((achievement) => (
                  <Card
                    key={achievement.key}
                    className={achievement.completed ? "border-green-500 bg-green-50" : "border-gray-200"}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.completed ? "bg-green-500" : "bg-gray-200"}`}
                          >
                            <Award className={`w-6 h-6 ${achievement.completed ? "text-white" : "text-gray-400"}`} />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{t(achievement.titleKey)}</h3>
                            <p className="text-sm text-gray-600">{t(achievement.descKey)}</p>
                          </div>
                        </div>
                        {achievement.completed && <Badge className="bg-green-500 text-white">{t("conquered")}</Badge>}
                      </div>
                      {achievement.completed ? (
                        <p className="text-sm text-green-600">
                          {t("conqueredOn", { date: achievement.date || "N/A" })}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{t("progressLabel")}</span>
                            <span>{achievement.progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-2 [&>*]:bg-orange-500" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="wellness" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <Smile className="w-5 h-5" />
                      {t("moodHistory")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {wellnessData.mood.length > 0 ? (
                      <div className="space-y-3">
                        {wellnessData.mood.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-[#F2EAE4] rounded-lg">
                            <span className="text-sm">{entry.date}</span>
                            <span className="text-lg">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Smile className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500 mb-2">{t("noMoodRegistered")}</h3>
                        <p className="text-gray-400">{t("logMoodQuickActions")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <Moon className="w-5 h-5" />
                      {t("sleepQualityHistory")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {wellnessData.sleep.length > 0 ? (
                      <div className="space-y-3">
                        {wellnessData.sleep.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-[#F2EAE4] rounded-lg">
                            <span className="text-sm">{entry.date}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{entry.value}</span>
                              <div
                                className={`w-3 h-3 rounded-full ${entry.value === t("sleepGreat") ? "bg-green-500" : entry.value === t("sleepGood") ? "bg-yellow-500" : "bg-red-500"}`}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Moon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500 mb-2">{t("noSleepRegistered")}</h3>
                        <p className="text-gray-400">{t("logSleepQuickActions")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#F24E29]">{t("wellnessSummary")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <div className="text-3xl mb-2">😊</div>
                      <div className="text-sm text-gray-600">{t("mostFrequentMood")}</div>
                      <div className="font-bold text-[#F24E29]">{getMostFrequent(wellnessData.mood)}</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-3xl mb-2">😴</div>
                      <div className="text-sm text-gray-600">{t("averageSleepQuality")}</div>
                      <div className="font-bold text-[#F24E29]">{getMostFrequent(wellnessData.sleep)}</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-3xl mb-2">🗓️</div>
                      <div className="text-sm text-gray-600">{t("daysRegistered")}</div>
                      <div className="font-bold text-[#F24E29]">
                        {Math.max(wellnessData.mood.length, wellnessData.sleep.length)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
