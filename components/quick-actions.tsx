"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Droplets, Scale, Moon, Smile, TrendingDown, TrendingUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/context/languageContext"

interface HydrationSettings {
  customGoal?: number
  useWeightBased: boolean
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active"
  climate: "normal" | "hot" | "cold"
}

interface WeightEntry {
  date: string
  weight: number
  timestamp: number
}

interface DailyData {
  date: string
  water: number
  mood: string
  sleep: string
  weight?: number
}

export default function QuickActions() {
  const { t } = useLanguage()
  const [waterIntake, setWaterIntake] = useState(0)
  const [weight, setWeight] = useState("")
  const [mood, setMood] = useState("")
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([])
  const [lastWeight, setLastWeight] = useState<number | null>(null)
  const [hydrationSettings, setHydrationSettings] = useState<HydrationSettings>({
    useWeightBased: true,
    activityLevel: "moderate",
    climate: "normal",
  })
  const [showHydrationSettings, setShowHydrationSettings] = useState(false)
  const [userWeight, setUserWeight] = useState<number | null>(null)

  useEffect(() => {
    const savedData = localStorage.getItem("dailyData")
    const savedWeightHistory = localStorage.getItem("weightHistory")

    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        const today = new Date().toDateString()
        const todayData = data[today]
        if (todayData) {
          setWaterIntake(todayData.water || 0)
          setMood(todayData.mood || "")
        }
      } catch (error) {
        console.log("Erro ao carregar dados diários:", error)
      }
    }

    if (savedWeightHistory) {
      try {
        const history = JSON.parse(savedWeightHistory)
        setWeightHistory(history)
        if (history.length > 0) {
          setLastWeight(history[history.length - 1].weight)
        }
      } catch (error) {
        console.log("Erro ao carregar histórico de peso:", error)
      }
    }

    const savedHydrationSettings = localStorage.getItem("hydrationSettings")
    const savedProfile = localStorage.getItem("fastingProfile")

    if (savedHydrationSettings) {
      try {
        const settings = JSON.parse(savedHydrationSettings)
        setHydrationSettings(settings)
      } catch (error) {
        console.log("Erro ao carregar configurações de hidratação:", error)
      }
    }

    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        if (profile.weight) {
          setUserWeight(Number.parseFloat(profile.weight))
        }
      } catch (error) {
        console.log("Erro ao carregar peso do perfil:", error)
      }
    }
  }, [])

  const saveDailyData = (updates: Partial<DailyData>) => {
    const today = new Date().toDateString()
    const savedData = localStorage.getItem("dailyData")
    let allData: Record<string, DailyData> = {}

    if (savedData) {
      try {
        allData = JSON.parse(savedData)
      } catch (error) {
        console.log("Erro ao carregar dados:", error)
      }
    }

    const todayData = { ...(allData[today] || {}), ...updates, date: today } as DailyData
    allData[today] = todayData

    localStorage.setItem("dailyData", JSON.stringify(allData))
    window.dispatchEvent(new CustomEvent("localStorageChange", { detail: { key: "dailyData" } }))
  }

  const addWater = (amount: number) => {
    const newWaterIntake = waterIntake + amount
    setWaterIntake(newWaterIntake)
    saveDailyData({ water: newWaterIntake })
    toast({
      title: t("waterLogged"),
      description: t("waterAdded", { amount: amount.toString(), total: newWaterIntake.toString() }),
    })
  }

  const logWeight = () => {
    if (weight) {
      const weightValue = Number.parseFloat(weight)
      const newEntry: WeightEntry = {
        date: new Date().toLocaleDateString(),
        weight: weightValue,
        timestamp: Date.now(),
      }
      const updatedHistory = [...weightHistory, newEntry]
      setWeightHistory(updatedHistory)
      localStorage.setItem("weightHistory", JSON.stringify(updatedHistory))
      saveDailyData({ weight: weightValue })

      // Update profile weight
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

  const logMood = (selectedMood: string) => {
    setMood(selectedMood)
    saveDailyData({ mood: selectedMood })
    toast({
      title: t("moodLogged"),
      description: t("moodIs", { mood: selectedMood }),
    })
  }

  const logSleep = (sleepQuality: string) => {
    saveDailyData({ sleep: sleepQuality })
    toast({
      title: t("sleepLogged"),
      description: t("qualityIs", { quality: sleepQuality }),
    })
  }

  const getWeightTrend = () => {
    if (weightHistory.length < 2) return null
    const recent = weightHistory.slice(-2)
    const difference = recent[1].weight - recent[0].weight
    return {
      difference: difference.toFixed(1),
      isPositive: difference > 0,
      isNegative: difference < 0,
    }
  }

  const weightTrend = getWeightTrend()

  const calculateWaterGoal = (): number => {
    if (hydrationSettings.customGoal) return hydrationSettings.customGoal
    if (!hydrationSettings.useWeightBased || !userWeight) return 2000
    let baseGoal = userWeight * 35
    const activityMultipliers = { sedentary: 1.0, light: 1.1, moderate: 1.2, active: 1.3, very_active: 1.4 }
    baseGoal *= activityMultipliers[hydrationSettings.activityLevel]
    const climateMultipliers = { cold: 0.9, normal: 1.0, hot: 1.2 }
    baseGoal *= climateMultipliers[hydrationSettings.climate]
    return Math.round(baseGoal)
  }

  const saveHydrationSettings = (newSettings: HydrationSettings) => {
    setHydrationSettings(newSettings)
    localStorage.setItem("hydrationSettings", JSON.stringify(newSettings))
    window.dispatchEvent(new CustomEvent("localStorageChange", { detail: { key: "hydrationSettings" } }))
    toast({
      title: t("saveSettings"),
      description: `${t("currentGoal")} ${calculateWaterGoal()}ml`,
    })
  }

  const moodOptions = [
    { value: "😊 Ótimo", labelKey: "moodGreat" as const },
    { value: "😐 Normal", labelKey: "moodNormal" as const },
    { value: "😔 Cansado", labelKey: "moodTired" as const },
    { value: "🤗 Energizado", labelKey: "moodEnergized" as const },
  ]

  const sleepOptions = [
    { value: "Ruim", labelKey: "sleepBad" as const },
    { value: "Bom", labelKey: "sleepGood" as const },
    { value: "Ótimo", labelKey: "sleepGreat" as const },
  ]

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-[#F24E29] flex items-center gap-2">
          <Droplets className="w-5 h-5" />
          {t("quickActionsTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{t("waterIntake")}</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHydrationSettings(!showHydrationSettings)}
              className="text-xs text-[#F24E29] hover:bg-[#F2AEE7]/20"
            >
              ⚙️ {t("configure")}
            </Button>
          </div>

          {showHydrationSettings && (
            <Card className="border-2 border-[#F2AEE7] bg-[#F2EAE4]/50">
              <CardContent className="p-4 space-y-4">
                <h4 className="font-semibold text-[#F24E29] text-sm">{t("hydrationSettings")}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{t("weightBasedGoal")}</Label>
                    <Switch
                      checked={hydrationSettings.useWeightBased}
                      onCheckedChange={(checked) =>
                        setHydrationSettings((prev) => ({ ...prev, useWeightBased: checked }))
                      }
                    />
                  </div>
                  {hydrationSettings.useWeightBased && (
                    <div className="bg-blue-50 p-3 rounded-lg text-xs">
                      <p className="text-blue-800 mb-2">
                        <strong>{t("autoCalculation")}</strong> 35ml × {t("weight").toLowerCase()}
                      </p>
                      {userWeight ? (
                        <p className="text-blue-700">
                          {t("yourWeight")} {userWeight}kg = {Math.round(userWeight * 35)}ml {t("baseGoal")}
                        </p>
                      ) : (
                        <p className="text-blue-700">{t("configureWeightInProfile")}</p>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-xs">{t("activityLevel")}</Label>
                    <Select
                      value={hydrationSettings.activityLevel}
                      onValueChange={(value: any) =>
                        setHydrationSettings((prev) => ({ ...prev, activityLevel: value }))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">{t("sedentary")} (+0%)</SelectItem>
                        <SelectItem value="light">{t("light")} (+10%)</SelectItem>
                        <SelectItem value="moderate">{t("moderate")} (+20%)</SelectItem>
                        <SelectItem value="active">{t("active")} (+30%)</SelectItem>
                        <SelectItem value="very_active">{t("veryActive")} (+40%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t("climate")}</Label>
                    <Select
                      value={hydrationSettings.climate}
                      onValueChange={(value: any) => setHydrationSettings((prev) => ({ ...prev, climate: value }))}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cold">{t("cold")} (-10%)</SelectItem>
                        <SelectItem value="normal">{t("normal")}</SelectItem>
                        <SelectItem value="hot">{t("hot")} (+20%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t("customGoalMl")}</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 2500"
                      value={hydrationSettings.customGoal || ""}
                      onChange={(e) =>
                        setHydrationSettings((prev) => ({
                          ...prev,
                          customGoal: e.target.value ? Number.parseInt(e.target.value) : undefined,
                        }))
                      }
                      className="h-8 text-xs"
                      min="500"
                      max="5000"
                    />
                    <p className="text-xs text-gray-500">{t("leaveEmptyForAuto")}</p>
                  </div>
                  <div className="bg-gradient-to-r from-[#F2AEE7] to-[#F2C12E] p-3 rounded-lg text-white">
                    <div className="text-xs">
                      <strong>
                        {t("currentGoal")} {calculateWaterGoal()}ml
                      </strong>
                    </div>
                    <div className="text-xs opacity-90 mt-1">
                      {hydrationSettings.customGoal
                        ? t("customGoalLabel")
                        : hydrationSettings.useWeightBased && userWeight
                          ? t("basedOnYourWeight", { userWeight: userWeight.toString() })
                          : t("defaultGoalLabel")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveHydrationSettings(hydrationSettings)}
                      className="flex-1 bg-[#F24E29] hover:bg-[#F24E29]/90 text-white text-xs"
                    >
                      {t("save")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowHydrationSettings(false)}
                      className="text-xs"
                    >
                      {t("close")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-lg font-semibold">{waterIntake}ml</span>
            <div className="text-xs text-gray-500">
              {waterIntake >= calculateWaterGoal()
                ? t("goalReached")
                : t("remainingForGoal", { amount: (calculateWaterGoal() - waterIntake).toString() })}
            </div>
          </div>
          <div className="space-y-1">
            <Progress
              value={(waterIntake / calculateWaterGoal()) * 100}
              className="h-2 bg-blue-100 [&>*]:bg-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{waterIntake}ml</span>
              <span>
                {t("goal")}: {calculateWaterGoal()}ml
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => addWater(250)}
              variant="outline"
              className="text-xs border-[#F2C12E] text-[#F27D16] hover:bg-[#F2C12E]/10"
            >
              +250ml
            </Button>
            <Button
              onClick={() => addWater(500)}
              variant="outline"
              className="text-xs border-[#F2C12E] text-[#F27D16] hover:bg-[#F2C12E]/10"
            >
              +500ml
            </Button>
            <Button
              onClick={() => addWater(1000)}
              variant="outline"
              className="text-xs border-[#F2C12E] text-[#F27D16] hover:bg-[#F2C12E]/10"
            >
              +1L
            </Button>
          </div>
          {waterIntake < calculateWaterGoal() * 0.3 && (
            <div className="bg-red-50 border border-red-200 p-2 rounded-lg">
              <p className="text-xs text-red-700">{t("hydrationTipLow")}</p>
            </div>
          )}
          {waterIntake >= calculateWaterGoal() * 0.7 && waterIntake < calculateWaterGoal() && (
            <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-lg">
              <p className="text-xs text-yellow-700">
                {t("hydrationTipMedium", { amount: (calculateWaterGoal() - waterIntake).toString() })}
              </p>
            </div>
          )}
          {waterIntake >= calculateWaterGoal() && (
            <div className="bg-green-50 border border-green-200 p-2 rounded-lg">
              <p className="text-xs text-green-700">{t("hydrationTipHigh")}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Scale className="w-4 h-4" /> {t("registerWeight")}
          </Label>
          {lastWeight && (
            <div className="bg-[#F2EAE4] p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">{t("lastWeightRegistered")}</div>
                  <div className="font-semibold text-[#F24E29]">{lastWeight}kg</div>
                </div>
                {weightTrend && (
                  <div className="flex items-center gap-1">
                    {weightTrend.isPositive && <TrendingUp className="w-4 h-4 text-red-500" />}
                    {weightTrend.isNegative && <TrendingDown className="w-4 h-4 text-green-500" />}
                    <span
                      className={`text-sm font-medium ${weightTrend.isPositive ? "text-red-500" : weightTrend.isNegative ? "text-green-500" : "text-gray-500"}`}
                    >
                      {weightTrend.isPositive ? "+" : ""}
                      {weightTrend.difference}kg
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Ex: 70.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1"
              step="0.1"
              min="30"
              max="300"
            />
            <Button onClick={logWeight} className="bg-[#F27D16] hover:bg-[#F27D16]/90 text-white" disabled={!weight}>
              {t("save")}
            </Button>
          </div>
          {weightHistory.length > 0 && (
            <div className="text-xs text-gray-500">{t("recordsSaved", { count: weightHistory.length.toString() })}</div>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Smile className="w-4 h-4" /> {t("moodHowAreYouFeeling")}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {moodOptions.map((moodOption) => (
              <Button
                key={moodOption.value}
                onClick={() => logMood(t(moodOption.labelKey))}
                variant={mood === t(moodOption.labelKey) ? "default" : "outline"}
                className={`text-xs ${mood === t(moodOption.labelKey) ? "bg-[#F2AEE7] text-[#F24E29]" : "border-[#F2AEE7] text-[#F24E29] hover:bg-[#F2AEE7]/10"}`}
              >
                {t(moodOption.labelKey)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Moon className="w-4 h-4" /> {t("sleepQuality")}
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {sleepOptions.map((sleepOpt) => (
              <Button
                key={sleepOpt.value}
                onClick={() => logSleep(t(sleepOpt.labelKey))}
                variant="outline"
                className="text-xs border-[#F2AEE7] text-[#F24E29] hover:bg-[#F2AEE7]/10"
              >
                {t(sleepOpt.labelKey)}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <h4 className="font-semibold text-blue-800 text-sm mb-1">{t("aboutYourEntries")}</h4>
          <p className="text-xs text-blue-700">{t("aboutYourEntriesDesc")}</p>
        </div>
      </CardContent>
    </Card>
  )
}
