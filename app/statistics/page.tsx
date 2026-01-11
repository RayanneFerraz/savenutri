"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/context/languageContext"
import { useDatabase } from "@/hooks/use-database"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { TrendingUp, TrendingDown, Calendar, Droplets, Scale, Timer, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ChartData {
  date: string
  value: number
  label?: string
}

const chartConfig = {
  fasting: { label: "Fasting Hours", color: "#F24E29" },
  water: { label: "Water (ml)", color: "#3B82F6" },
  weight: { label: "Weight (kg)", color: "#10B981" },
}

export default function StatisticsPage() {
  const { t } = useLanguage()
  const { getDailyData, getWeightHistory, getFastingHistory, isAuthenticated } = useDatabase()

  const [period, setPeriod] = useState<"7" | "14" | "30" | "90">("7")
  const [fastingData, setFastingData] = useState<ChartData[]>([])
  const [waterData, setWaterData] = useState<ChartData[]>([])
  const [weightData, setWeightData] = useState<ChartData[]>([])
  const [stats, setStats] = useState({
    avgFastingHours: 0,
    totalFasts: 0,
    completedFasts: 0,
    avgWaterIntake: 0,
    weightChange: 0,
    currentStreak: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [period, isAuthenticated])

  const loadStatistics = async () => {
    setLoading(true)
    const days = Number.parseInt(period)
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    try {
      // Load fasting history
      const fastingHistory = await getFastingHistory()
      const filteredFasts = fastingHistory.filter((f) => new Date(f.startTime) >= startDate)

      // Process fasting data for chart
      const fastingByDate: Record<string, number[]> = {}
      filteredFasts.forEach((fast) => {
        const date = new Date(fast.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        if (!fastingByDate[date]) fastingByDate[date] = []
        if (fast.actualHours) fastingByDate[date].push(fast.actualHours)
      })

      const fastingChartData = Object.entries(fastingByDate)
        .map(([date, hours]) => ({
          date,
          value: hours.length > 0 ? hours.reduce((a, b) => a + b, 0) / hours.length : 0,
        }))
        .slice(-days)
      setFastingData(fastingChartData)

      // Load daily data for water
      const dailyData = await getDailyData()
      const waterByDate: Record<string, number> = {}

      for (let i = 0; i < days; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateKey = date.toDateString()
        const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

        if (dailyData[dateKey]) {
          waterByDate[dateLabel] = dailyData[dateKey].water || 0
        } else {
          waterByDate[dateLabel] = 0
        }
      }

      const waterChartData = Object.entries(waterByDate)
        .map(([date, value]) => ({ date, value }))
        .reverse()
      setWaterData(waterChartData)

      // Load weight history
      const weightHistory = await getWeightHistory()
      const filteredWeights = weightHistory
        .filter((w) => new Date(w.timestamp) >= startDate)
        .sort((a, b) => a.timestamp - b.timestamp)

      const weightChartData = filteredWeights.map((w) => ({
        date: new Date(w.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: w.weight,
      }))
      setWeightData(weightChartData)

      // Calculate stats
      const completedFasts = filteredFasts.filter((f) => f.status === "completed")
      const avgFastingHours =
        completedFasts.length > 0
          ? completedFasts.reduce((sum, f) => sum + (f.actualHours || 0), 0) / completedFasts.length
          : 0

      const totalWater = Object.values(waterByDate).reduce((a, b) => a + b, 0)
      const daysWithWater = Object.values(waterByDate).filter((v) => v > 0).length
      const avgWater = daysWithWater > 0 ? totalWater / daysWithWater : 0

      const weightChange =
        filteredWeights.length >= 2 ? filteredWeights[filteredWeights.length - 1].weight - filteredWeights[0].weight : 0

      // Calculate streak
      let streak = 0
      const sortedFasts = [...fastingHistory].sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      )
      for (const fast of sortedFasts) {
        if (fast.status === "completed") streak++
        else break
      }

      setStats({
        avgFastingHours,
        totalFasts: filteredFasts.length,
        completedFasts: completedFasts.length,
        avgWaterIntake: avgWater,
        weightChange,
        currentStreak: streak,
      })
    } catch (error) {
      console.error("Error loading statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({
    title,
    value,
    unit,
    icon: Icon,
    trend,
  }: {
    title: string
    value: string | number
    unit: string
    icon: React.ComponentType<{ className?: string }>
    trend?: "up" | "down" | "neutral"
  }) => (
    <Card className="bg-gradient-to-br from-white to-gray-50">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{value}</span>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
          </div>
          <div
            className={`p-3 rounded-full ${
              trend === "up" ? "bg-green-100" : trend === "down" ? "bg-red-100" : "bg-orange-100"
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-orange-600"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 pb-24">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("statistics")}</h1>
            <p className="text-sm text-muted-foreground">{t("trackYourProgress")}</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex justify-end mb-6">
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("selectPeriod")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t("last7Days")}</SelectItem>
              <SelectItem value="14">{t("last14Days")}</SelectItem>
              <SelectItem value="30">{t("last30Days")}</SelectItem>
              <SelectItem value="90">{t("last90Days")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard
            title={t("avgFastingHours")}
            value={stats.avgFastingHours.toFixed(1)}
            unit="h"
            icon={Timer}
            trend="neutral"
          />
          <StatCard
            title={t("completedFasts")}
            value={stats.completedFasts}
            unit={`/${stats.totalFasts}`}
            icon={Calendar}
            trend={stats.completedFasts > stats.totalFasts * 0.7 ? "up" : "neutral"}
          />
          <StatCard
            title={t("avgWaterIntake")}
            value={Math.round(stats.avgWaterIntake)}
            unit="ml"
            icon={Droplets}
            trend={stats.avgWaterIntake >= 2000 ? "up" : "neutral"}
          />
          <StatCard
            title={t("weightChange")}
            value={stats.weightChange > 0 ? `+${stats.weightChange.toFixed(1)}` : stats.weightChange.toFixed(1)}
            unit="kg"
            icon={stats.weightChange <= 0 ? TrendingDown : TrendingUp}
            trend={stats.weightChange <= 0 ? "up" : "down"}
          />
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="fasting" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fasting">{t("fasting")}</TabsTrigger>
            <TabsTrigger value="water">{t("water")}</TabsTrigger>
            <TabsTrigger value="weight">{t("weight")}</TabsTrigger>
          </TabsList>

          <TabsContent value="fasting">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Timer className="w-5 h-5 text-orange-500" />
                  {t("fastingHistory")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fastingData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <AreaChart data={fastingData}>
                      <defs>
                        <linearGradient id="fastingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F24E29" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#F24E29" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#F24E29"
                        strokeWidth={2}
                        fill="url(#fastingGradient)"
                        name="Hours"
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    {t("noDataForPeriod")}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="water">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  {t("waterIntake")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {waterData.some((d) => d.value > 0) ? (
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart data={waterData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} name="ml" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    {t("noDataForPeriod")}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weight">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scale className="w-5 h-5 text-green-500" />
                  {t("weightHistory")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weightData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis domain={["auto", "auto"]} className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ fill: "#10B981", strokeWidth: 2 }}
                        name="kg"
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    {t("noDataForPeriod")}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Current Streak */}
        <Card className="mt-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">{t("currentStreak")}</p>
                <p className="text-4xl font-bold">{stats.currentStreak}</p>
                <p className="text-orange-100 text-sm">{t("consecutiveFasts")}</p>
              </div>
              <div className="text-6xl">🔥</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
