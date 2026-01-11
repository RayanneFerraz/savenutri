"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Droplets, Scale, Smile, TrendingDown, TrendingUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/context/languageContext"
import { useDatabase } from "@/hooks/use-database"
import type { HydrationSettings } from "@/types"

export default function QuickActions() {
  const { t } = useLanguage()
  const {
    weightHistory,
    addWeight,
    dailyData,
    updateDailyData,
    hydrationSettings: dbHydrationSettings,
    updateHydrationSettings: updateDbHydrationSettings,
    isLoading,
  } = useDatabase()

  const [waterIntake, setWaterIntake] = useState(0)
  const [weight, setWeight] = useState("")
  const [mood, setMood] = useState("")
  const [lastWeight, setLastWeight] = useState<number | null>(null)
  const [hydrationSettings, setHydrationSettings] = useState<HydrationSettings>({
    useWeightBased: true,
    activityLevel: "moderate",
    climate: "normal",
  })
  const [showHydrationSettings, setShowHydrationSettings] = useState(false)
  const [userWeight, setUserWeight] = useState<number | null>(null)

  useEffect(() => {
    if (dailyData) {
      setWaterIntake(dailyData.water || 0)
      setMood(dailyData.mood || "")
    }
  }, [dailyData])

  useEffect(() => {
    if (weightHistory.length > 0) {
      setLastWeight(weightHistory[weightHistory.length - 1].weight)
    }
  }, [weightHistory])

  useEffect(() => {
    if (dbHydrationSettings) {
      setHydrationSettings((prev) => ({ ...prev, ...dbHydrationSettings }))
    }
  }, [dbHydrationSettings])

  // Load user weight from profile (still uses localStorage for profile)
  useEffect(() => {
    const savedProfile = localStorage.getItem("fastingProfile")
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        if (profile.weight) {
          setUserWeight(Number.parseFloat(profile.weight))
        }
      } catch (error) {
        console.log("Error loading profile weight:", error)
      }
    }
  }, [])

  const addWater = async (amount: number) => {
    const newWaterIntake = waterIntake + amount
    setWaterIntake(newWaterIntake)
    await updateDailyData({ water: newWaterIntake })
    toast({
      title: t("waterLogged"),
      description: t("waterAdded", { amount: amount.toString(), total: newWaterIntake.toString() }),
    })
  }

  const logWeight = async () => {
    if (weight) {
      const weightValue = Number.parseFloat(weight)

      await addWeight(weightValue)
      await updateDailyData({ weight: weightValue })

      // Update profile weight (still localStorage)
      const savedProfile = localStorage.getItem("fastingProfile")
      let profile = savedProfile ? JSON.parse(savedProfile) : {}
      profile = { ...profile, weight: weightValue.toString() }
      localStorage.setItem("fastingProfile", JSON.stringify(profile))
      window.dispatchEvent(new CustomEvent("localStorageChange", { detail: { key: "fastingProfile" } }))

      let message = t("weightRegisteredSuccessfully", { weight: weightValue.toString() })
      if (lastWeight !== null) {
        const difference = weightValue - lastWeight
        if (difference !== 0) {
          message += ` ${t("weightTrendMessage", { trend: difference > 0 ? "+" : "", difference: difference.toFixed(1) })}`
        } else {
          message += ` ${t("sameWeightMessage")}`
        }
      }
      setLastWeight(weightValue)
      toast({
        title: t("weightLogged"),
        description: message,
      })
      setWeight("")
    }
  }

  const logMood = async (selectedMood: string) => {
    setMood(selectedMood)
    await updateDailyData({ mood: selectedMood })
    toast({
      title: t("moodLogged"),
      description: t("moodSelectedMessage", { mood: t(selectedMood) }),
    })
  }

  const saveHydrationSettings = async () => {
    await updateDbHydrationSettings(hydrationSettings)
    localStorage.setItem("hydrationSettings", JSON.stringify(hydrationSettings))
    setShowHydrationSettings(false)
    toast({
      title: t("settingsSaved"),
      description: t("hydrationSettingsUpdated"),
    })
  }

  const calculateDailyWaterGoal = () => {
    if (hydrationSettings.customGoal) {
      return hydrationSettings.customGoal
    }

    if (hydrationSettings.useWeightBased && userWeight) {
      let baseGoal = Math.round(userWeight * 35)

      if (hydrationSettings.activityLevel === "active") {
        baseGoal *= 1.2
      } else if (hydrationSettings.activityLevel === "very_active") {
        baseGoal *= 1.4
      }

      if (hydrationSettings.climate === "hot") {
        baseGoal *= 1.2
      }

      return Math.round(baseGoal / 250)
    }

    return 8
  }

  const dailyWaterGoal = calculateDailyWaterGoal()
  const waterProgress = Math.min((waterIntake / dailyWaterGoal) * 100, 100)

  const getWeightTrend = () => {
    if (weightHistory.length < 2) return null
    const recent = weightHistory.slice(-7)
    if (recent.length < 2) return null
    const first = recent[0].weight
    const last = recent[recent.length - 1].weight
    return last - first
  }

  const weightTrend = getWeightTrend()

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle>{t("quickActions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{t("quickActions")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Water Tracking */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              {t("waterIntake")}
            </Label>
            <Button variant="ghost" size="sm" onClick={() => setShowHydrationSettings(!showHydrationSettings)}>
              {t("settings")}
            </Button>
          </div>

          {showHydrationSettings && (
            <div className="p-3 border rounded-lg space-y-3 bg-muted/50">
              <div className="flex items-center justify-between">
                <Label htmlFor="weight-based">{t("weightBasedGoal")}</Label>
                <Switch
                  id="weight-based"
                  checked={hydrationSettings.useWeightBased}
                  onCheckedChange={(checked) => setHydrationSettings({ ...hydrationSettings, useWeightBased: checked })}
                />
              </div>

              {!hydrationSettings.useWeightBased && (
                <div className="space-y-1">
                  <Label htmlFor="custom-goal">{t("customDailyGoal")}</Label>
                  <Input
                    id="custom-goal"
                    type="number"
                    placeholder="8"
                    value={hydrationSettings.customGoal || ""}
                    onChange={(e) =>
                      setHydrationSettings({
                        ...hydrationSettings,
                        customGoal: Number.parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
              )}

              {hydrationSettings.useWeightBased && (
                <>
                  <div className="space-y-1">
                    <Label>{t("activityLevel")}</Label>
                    <Select
                      value={hydrationSettings.activityLevel}
                      onValueChange={(value) =>
                        setHydrationSettings({
                          ...hydrationSettings,
                          activityLevel: value as HydrationSettings["activityLevel"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">{t("sedentary")}</SelectItem>
                        <SelectItem value="light">{t("light")}</SelectItem>
                        <SelectItem value="moderate">{t("moderate")}</SelectItem>
                        <SelectItem value="active">{t("active")}</SelectItem>
                        <SelectItem value="very_active">{t("veryActive")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>{t("climate")}</Label>
                    <Select
                      value={hydrationSettings.climate}
                      onValueChange={(value) =>
                        setHydrationSettings({ ...hydrationSettings, climate: value as HydrationSettings["climate"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">{t("normal")}</SelectItem>
                        <SelectItem value="hot">{t("hot")}</SelectItem>
                        <SelectItem value="cold">{t("cold")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button onClick={saveHydrationSettings} className="w-full" size="sm">
                {t("saveSettings")}
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {waterIntake} / {dailyWaterGoal} {t("glasses")}
              </span>
              <span>{Math.round(waterProgress)}%</span>
            </div>
            <Progress value={waterProgress} className="h-2" />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => addWater(1)} variant="outline" size="sm" className="flex-1">
              +1 {t("glass")}
            </Button>
            <Button onClick={() => addWater(2)} variant="outline" size="sm" className="flex-1">
              +2 {t("glasses")}
            </Button>
            <Button
              onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              -1
            </Button>
          </div>
        </div>

        {/* Weight Tracking */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-green-500" />
            {t("logWeight")}
            {weightTrend !== null && (
              <span className={`text-xs flex items-center ${weightTrend < 0 ? "text-green-500" : "text-red-500"}`}>
                {weightTrend < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {Math.abs(weightTrend).toFixed(1)} kg
              </span>
            )}
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={t("weightPlaceholder")}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              step="0.1"
            />
            <Button onClick={logWeight}>{t("log")}</Button>
          </div>
          {lastWeight && (
            <p className="text-xs text-muted-foreground">
              {t("lastWeight")}: {lastWeight} kg
            </p>
          )}
        </div>

        {/* Mood Tracking */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Smile className="h-4 w-4 text-yellow-500" />
            {t("howAreYouFeeling")}
          </Label>
          <div className="flex gap-2 flex-wrap">
            {["great", "good", "okay", "bad", "terrible"].map((m) => (
              <Button
                key={m}
                onClick={() => logMood(m)}
                variant={mood === m ? "default" : "outline"}
                size="sm"
                className="flex-1 min-w-[60px]"
              >
                {t(m)}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
