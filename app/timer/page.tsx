"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, Pause, RotateCcw, Settings, User } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/context/languageContext" // Import useLanguage

export default function TimerPage() {
  const { t } = useLanguage() // Use the t function

  const [selectedPlan, setSelectedPlan] = useState("16:8")
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(16 * 60 * 60) // 16 horas em segundos
  const [totalTime, setTotalTime] = useState(16 * 60 * 60)
  const [fastingStage, setFastingStageInternal] = useState(t("preparation")) // Use t for initial state
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [customSettings, setCustomSettings] = useState({
    fastHours: 16,
    startTime: "20:00",
    endTime: "12:00",
    days: [1, 2, 3, 4, 5],
  })

  const fastingPlans = {
    "16:8": { fast: 16, eat: 8, description: `16h ${t("fasting").toLowerCase()}, 8h ${t("eating").toLowerCase()}` },
    "18:6": { fast: 18, eat: 6, description: `18h ${t("fasting").toLowerCase()}, 6h ${t("eating").toLowerCase()}` },
    "20:4": { fast: 20, eat: 4, description: `20h ${t("fasting").toLowerCase()}, 4h ${t("eating").toLowerCase()}` },
    OMAD: { fast: 23, eat: 1, description: t("OMADDescription") || "Uma refeição por dia" }, // Add OMADDescription to translations
    "5:2": { fast: 24, eat: 0, description: t("fiveTwoDescription") || "2 dias de jejum por semana" }, // Add fiveTwoDescription
    Personalizado: {
      fast: customSettings.fastHours,
      eat: 24 - customSettings.fastHours,
      description: `${customSettings.fastHours}h ${t("customFasting").toLowerCase()}`,
    },
  }
  // Update fastingStage with translated value when language changes
  useEffect(() => {
    setFastingStageInternal(t("preparation"))
  }, [t])

  // Carregar estado do timer e configurações
  useEffect(() => {
    const savedTimerState = localStorage.getItem("fastingTimerState")
    const savedProfile = localStorage.getItem("fastingProfile")

    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        if (profile.customFastHours) {
          setCustomSettings({
            fastHours: Number.parseInt(profile.customFastHours) || 16,
            startTime: profile.fastStartTime || "20:00",
            endTime: profile.fastEndTime || "12:00",
            days: profile.customDays || [1, 2, 3, 4, 5],
          })
        }
        if (profile.fastingPlan === "custom") {
          setSelectedPlan("Personalizado")
        } else if (profile.fastingPlan) {
          setSelectedPlan(profile.fastingPlan)
        }
      } catch (error) {
        console.log("Erro ao carregar configurações:", error)
      }
    }

    if (savedTimerState) {
      try {
        const timerState = JSON.parse(savedTimerState)
        setIsActive(timerState.isActive)
        setStartTime(timerState.startTime ? new Date(timerState.startTime) : null)
        setTotalTime(timerState.totalTime)
        if (timerState.isActive && timerState.startTime) {
          const now = new Date().getTime()
          const startTimeMs = new Date(timerState.startTime).getTime()
          const elapsedSeconds = Math.floor((now - startTimeMs) / 1000)
          const newTimeLeft = Math.max(0, timerState.totalTime - elapsedSeconds)
          setTimeLeft(newTimeLeft)
          // Update stage based on loaded time
          updateFastingStage(timerState.totalTime - newTimeLeft)
        } else {
          setTimeLeft(timerState.timeLeft || timerState.totalTime)
          // If not active, set to preparation or based on timeLeft if it's not full
          if (timerState.timeLeft < timerState.totalTime && timerState.timeLeft > 0) {
            updateFastingStage(timerState.totalTime - timerState.timeLeft)
          } else {
            setFastingStageInternal(t("preparation"))
          }
        }
      } catch (error) {
        console.log("Erro ao carregar estado do timer:", error)
      }
    }
  }, []) // Removed `t` from dependencies here as it might cause loop with setFastingStageInternal

  useEffect(() => {
    const timerState = {
      isActive,
      timeLeft,
      totalTime,
      startTime: startTime?.toISOString() || null,
    }
    localStorage.setItem("fastingTimerState", JSON.stringify(timerState))
  }, [isActive, timeLeft, totalTime, startTime])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "fastingTimerState" && e.newValue) {
        try {
          const timerState = JSON.parse(e.newValue)
          setIsActive(timerState.isActive)
          setStartTime(timerState.startTime ? new Date(timerState.startTime) : null)
          setTotalTime(timerState.totalTime)
          if (timerState.isActive && timerState.startTime) {
            const now = new Date().getTime()
            const startTimeMs = new Date(timerState.startTime).getTime()
            const elapsedSeconds = Math.floor((now - startTimeMs) / 1000)
            const newTimeLeft = Math.max(0, timerState.totalTime - elapsedSeconds)
            setTimeLeft(newTimeLeft)
            updateFastingStage(timerState.totalTime - newTimeLeft)
          } else {
            setTimeLeft(timerState.timeLeft)
            if (timerState.timeLeft < timerState.totalTime && timerState.timeLeft > 0) {
              updateFastingStage(timerState.totalTime - timerState.timeLeft)
            } else {
              setFastingStageInternal(t("preparation"))
            }
          }
        } catch (error) {
          console.log("Erro ao sincronizar timer:", error)
        }
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [t]) // Added t here for stage update on sync

  useEffect(() => {
    const handleFocus = () => {
      const savedProfile = localStorage.getItem("fastingProfile")
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile)
          if (profile.customFastHours) {
            setCustomSettings({
              fastHours: Number.parseInt(profile.customFastHours) || 16,
              startTime: profile.fastStartTime || "20:00",
              endTime: profile.fastEndTime || "12:00",
              days: profile.customDays || [1, 2, 3, 4, 5],
            })
          }
        } catch (error) {
          console.log("Erro ao recarregar configurações:", error)
        }
      }
    }
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  useEffect(() => {
    let plan = fastingPlans[selectedPlan as keyof typeof fastingPlans]
    if (selectedPlan === "Personalizado") {
      plan = {
        fast: customSettings.fastHours,
        eat: 24 - customSettings.fastHours,
        description: `${customSettings.fastHours}h ${t("customFasting").toLowerCase()}`,
      }
    }
    const newTotalTime = plan.fast * 60 * 60
    setTotalTime(newTotalTime)
    if (!isActive) {
      setTimeLeft(newTotalTime)
      setFastingStageInternal(t("preparation"))
    }
  }, [selectedPlan, customSettings, isActive, t])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((currentLeft) => {
          const newTime = currentLeft - 1
          updateFastingStage(totalTime - newTime)
          return newTime
        })
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      setFastingStageInternal(t("fastCompleted"))
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, totalTime, t])

  const updateFastingStage = (elapsedTime: number) => {
    const hours = elapsedTime / 3600
    if (hours < 2) setFastingStageInternal(t("digestionStarted"))
    else if (hours < 4) setFastingStageInternal(t("insulinStabilizing"))
    else if (hours < 8) setFastingStageInternal(t("fatBurningStarted"))
    else if (hours < 12) setFastingStageInternal(t("metabolismBoost"))
    else if (hours < 16) setFastingStageInternal(t("ketosisInitial"))
    else if (hours < 18) setFastingStageInternal(t("autophagyActivated"))
    else if (hours < 20) setFastingStageInternal(t("mentalClarity"))
    else setFastingStageInternal(t("peakEfficiency"))
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0
  const elapsedSeconds = totalTime - timeLeft
  const elapsedHours = elapsedSeconds / 3600

  const startTimer = () => {
    setIsActive(true)
    setStartTime(new Date())
    setTimeLeft(totalTime) // Reset time left to full duration
    updateFastingStage(0) // Set stage to initial
  }

  const pauseTimer = () => {
    setIsActive(false)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(totalTime)
    setFastingStageInternal(t("preparation"))
    setStartTime(null)
  }

  const getStageColor = () => {
    if (progress < 25) return "from-[#F2AEE7] to-[#F2C12E]"
    if (progress < 50) return "from-[#F2C12E] to-[#F27D16]"
    if (progress < 75) return "from-[#F27D16] to-[#F24E29]"
    return "from-[#F24E29] to-purple-600"
  }

  const getCurrentPlanInfo = () => {
    if (selectedPlan === "Personalizado") {
      return {
        fast: customSettings.fastHours,
        eat: 24 - customSettings.fastHours,
        description: `${customSettings.fastHours}h ${t("customFasting").toLowerCase()}`,
      }
    }
    return fastingPlans[selectedPlan as keyof typeof fastingPlans]
  }

  const getActiveBenefits = () => {
    const benefits = []
    if (!isActive && timeLeft === totalTime) {
      // Only show "Ready to start" if timer hasn't started or was reset
      return [
        {
          icon: "🏁",
          text: t("readyToStart"),
          color: "bg-gray-100",
          description: t("readyToStartDesc"),
        },
      ]
    }

    const currentElapsedHours = (totalTime - timeLeft) / 3600

    if (currentElapsedHours >= 0.5)
      benefits.push({
        icon: "🍽️",
        text: t("digestionStarted"),
        color: "bg-[#F2AEE7]",
        description: t("digestionStartedDesc"),
      })
    if (currentElapsedHours >= 3)
      benefits.push({
        icon: "📉",
        text: t("insulinStabilizing"),
        color: "bg-[#F2C12E]",
        description: t("insulinStabilizingDesc"),
      })
    if (currentElapsedHours >= 6)
      benefits.push({
        icon: "🔥",
        text: t("fatBurningStarted"),
        color: "bg-[#F27D16]",
        description: t("fatBurningStartedDesc"),
      })
    if (currentElapsedHours >= 8)
      benefits.push({
        icon: "⚡",
        text: t("metabolismBoost"),
        color: "bg-[#F27D16]",
        description: t("metabolismBoostDesc"),
      })
    if (currentElapsedHours >= 12)
      benefits.push({
        icon: "🧬",
        text: t("ketosisInitial"),
        color: "bg-[#F24E29]",
        description: t("ketosisInitialDesc"),
      })
    if (currentElapsedHours >= 16)
      benefits.push({
        icon: "🔬",
        text: t("autophagyActivated"),
        color: "bg-purple-600",
        description: t("autophagyActivatedDesc"),
      })
    if (currentElapsedHours >= 18)
      benefits.push({
        icon: "🧠",
        text: t("mentalClarity"),
        color: "bg-purple-600",
        description: t("mentalClarityDesc"),
      })
    if (currentElapsedHours >= 20)
      benefits.push({
        icon: "💪",
        text: t("peakEfficiency"),
        color: "bg-purple-700",
        description: t("peakEfficiencyDesc"),
      })

    if (benefits.length === 0 && isActive) {
      // If active but no major benefits yet
      return [{ icon: "⏰", text: t("fastingInitiated"), color: "bg-blue-100", description: t("fastingInitiatedDesc") }]
    }
    if (benefits.length === 0 && !isActive && timeLeft < totalTime) {
      // If paused and some time has passed
      return [
        {
          icon: "⏳",
          text: t("fastingStage"),
          color: "bg-yellow-100",
          description: `${t("paused")} - ${fastingStage}`,
        },
      ] // Add a "paused" key
    }

    return benefits
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#F24E29] mb-2">{t("timerTitle")}</h1>
            <p className="text-gray-600">{t("timerSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className={`bg-gradient-to-br ${getStageColor()} border-none shadow-xl`}>
                <CardHeader className="text-center">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {selectedPlan === "Personalizado" ? t("customFasting") : selectedPlan}
                    </Badge>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2 mt-4">
                    <Clock className="w-8 h-8" />
                    {fastingStage}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-7xl font-mono font-bold text-white mb-4">{formatTime(timeLeft)}</div>
                    <p className="text-white/90 text-xl mb-2">{timeLeft === 0 ? t("fastCompleted") : t("timeLeft")}</p>
                    {startTime && (
                      <p className="text-white/70 text-sm">
                        {t("fastStart")} {startTime.toLocaleTimeString()}
                      </p>
                    )}
                    {isActive && (
                      <p className="text-white/70 text-sm">
                        {t("fastingFor")} {Math.floor(elapsedHours)}h {Math.floor((elapsedSeconds % 3600) / 60)}min
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Progress value={progress} className="h-4 bg-white/20" />
                    <div className="flex justify-between text-sm text-white/80">
                      <span>
                        {t("progressLabel")}: {Math.round(progress)}%
                      </span>
                      <span>
                        {t("goal")}: {getCurrentPlanInfo().fast}h
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    {!isActive ? (
                      <Button
                        onClick={startTimer}
                        className="bg-[#F24E29] text-white hover:bg-[#F24E29]/90 px-8 py-3 rounded-full text-base"
                        disabled={timeLeft === 0 && totalTime > 0} // Disable if fast is completed but not reset
                      >
                        <Play className="w-5 h-5 mr-2" />
                        {timeLeft < totalTime && timeLeft > 0 ? t("resume") : t("startFasting")}{" "}
                        {/* Add "resume" key */}
                      </Button>
                    ) : (
                      <Button
                        onClick={pauseTimer}
                        className="bg-[#F24E29] text-white hover:bg-[#F24E29]/90 px-8 py-3 rounded-full text-base"
                      >
                        <Pause className="w-5 h-5 mr-2" />
                        {t("pause")}
                      </Button>
                    )}
                    <Button
                      onClick={resetTimer}
                      variant="outline"
                      className="border-white text-[#F24E29] hover:bg-white hover:text-[#F24E29] px-8 py-3 rounded-full"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      {t("reset")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#F24E29]">{t("fastingPlan")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedPlan} onValueChange={setSelectedPlan} disabled={isActive}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(fastingPlans).map(([key, plan]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <div className="font-medium">{key === "Personalizado" ? t("customFasting") : key}</div>
                            <div className="text-sm text-gray-500">{plan.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPlan === "Personalizado" && (
                    <div className="bg-[#F2EAE4] p-4 rounded-lg space-y-2">
                      <h4 className="font-semibold text-[#F24E29] text-sm">{t("currentSettings")}:</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>
                          • {t("fasting")}: {customSettings.fastHours} {t("hours")}
                        </p>
                        <p>
                          • {t("eatingWindow")}: {24 - customSettings.fastHours} {t("hours")}
                        </p>
                        <p>
                          • {t("schedule")}: {customSettings.startTime} - {customSettings.endTime}
                        </p>
                        <p>
                          • {t("weekDays")}: {customSettings.days.length} {t("daysPerWeek")}
                        </p>
                      </div>
                      <Link href="/profile">
                        <Button size="sm" className="w-full mt-2 bg-[#F24E29] hover:bg-[#F24E29]/90">
                          <User className="w-4 h-4 mr-2" />
                          {t("editInProfile")}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[#F24E29]">{t("currentBenefits")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getActiveBenefits().map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="text-lg">{benefit.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 ${benefit.color} rounded-full`}></div>
                            <span className="text-sm font-medium">{benefit.text}</span>
                          </div>
                          <p className="text-xs text-gray-600">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[#F24E29]">{t("today")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">{t("waterConsumed")}:</span>
                    <span className="font-medium">1.2L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t("fastsThisWeekFull")}:</span>
                    <span className="font-medium">4/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t("currentStreak")}:</span>
                    <span className="font-medium">3 {t("days")}</span>
                  </div>
                  {isActive && (
                    <div className="flex justify-between">
                      <span className="text-sm">{t("timeFasting")}:</span>
                      <span className="font-medium text-[#F24E29]">
                        {Math.floor(elapsedHours)}h {Math.floor((elapsedSeconds % 3600) / 60)}min
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
