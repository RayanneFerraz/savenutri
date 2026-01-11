"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, Clock } from "lucide-react"
import { useLanguage } from "@/context/languageContext"

export default function FastingTimer() {
  const { t } = useLanguage()
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(16 * 60 * 60)
  const [totalTime, setTotalTime] = useState(16 * 60 * 60)
  const [fastingStageKey, setFastingStageKey] = useState<string>("fastingInitiated")
  const [startTime, setStartTime] = useState<Date | null>(null)

  const fastingStages = {
    digestionStarted: "digestionStarted",
    insulinStabilizing: "insulinStabilizing",
    fatBurningStarted: "fatBurningStarted",
    ketosisInitial: "ketosisInitial",
    fastCompleted: "fastCompleted",
    fastingInitiated: "fastingInitiated",
  }

  useEffect(() => {
    const savedTimerState = localStorage.getItem("fastingTimerState")
    const savedProfile = localStorage.getItem("fastingProfile")

    if (savedTimerState) {
      try {
        const timerState = JSON.parse(savedTimerState)
        setIsActive(timerState.isActive)
        setStartTime(timerState.startTime ? new Date(timerState.startTime) : null)

        if (timerState.isActive && timerState.startTime) {
          const now = new Date().getTime()
          const startTimeMs = new Date(timerState.startTime).getTime()
          const elapsedSeconds = Math.floor((now - startTimeMs) / 1000)
          const newTimeLeft = Math.max(0, timerState.totalTime - elapsedSeconds)
          setTimeLeft(newTimeLeft)
          setTotalTime(timerState.totalTime)
        } else {
          setTimeLeft(timerState.timeLeft || 16 * 60 * 60)
          setTotalTime(timerState.totalTime || 16 * 60 * 60)
        }
      } catch (error) {
        console.log("Error loading timer state:", error)
      }
    }

    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        let fastHours = 16

        if (profile.fastingPlan === "custom" && profile.customFastHours) {
          fastHours = Number.parseInt(profile.customFastHours)
        } else if (profile.fastingPlan === "18:6") {
          fastHours = 18
        } else if (profile.fastingPlan === "20:4") {
          fastHours = 20
        } else if (profile.fastingPlan === "omad") {
          fastHours = 23
        }

        const newTotalTime = fastHours * 60 * 60
        if (!savedTimerState || !JSON.parse(savedTimerState).isActive) {
          setTotalTime(newTotalTime)
          setTimeLeft(newTotalTime)
        }
      } catch (error) {
        console.log("Error loading profile:", error)
      }
    }
  }, [])

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

          if (timerState.isActive && timerState.startTime) {
            const now = new Date().getTime()
            const startTimeMs = new Date(timerState.startTime).getTime()
            const elapsedSeconds = Math.floor((now - startTimeMs) / 1000)
            const newTimeLeft = Math.max(0, timerState.totalTime - elapsedSeconds)
            setTimeLeft(newTimeLeft)
          } else {
            setTimeLeft(timerState.timeLeft)
          }
          setTotalTime(timerState.totalTime)
        } catch (error) {
          console.log("Error syncing timer:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => {
          const newTime = timeLeft - 1
          updateFastingStage(totalTime - newTime)
          return newTime
        })
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, totalTime])

  const updateFastingStage = (elapsedTime: number) => {
    const hours = elapsedTime / 3600
    if (hours < 4) {
      setFastingStageKey("digestionStarted")
    } else if (hours < 8) {
      setFastingStageKey("insulinStabilizing")
    } else if (hours < 12) {
      setFastingStageKey("fatBurningStarted")
    } else if (hours < 16) {
      setFastingStageKey("ketosisInitial")
    } else {
      setFastingStageKey("fastCompleted")
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  const toggleTimer = () => {
    if (!isActive) {
      setStartTime(new Date())
    }
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(totalTime)
    setFastingStageKey("fastingInitiated")
    setStartTime(null)
  }

  return (
    <Card className="bg-gradient-to-br from-[#F2AEE7] to-[#F2C12E] border-none shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Clock className="w-6 h-6" />
          {t("fasting")} {Math.floor(totalTime / 3600)}:
          {Math.floor((totalTime % 3600) / 60)
            .toString()
            .padStart(2, "0")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-white mb-2">{formatTime(timeLeft)}</div>
          <p className="text-white/80 text-lg">{t(fastingStageKey as any)}</p>
          {startTime && isActive && (
            <p className="text-white/70 text-sm mt-1">
              {t("startFasting")} {startTime.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3 bg-white/20 [&>*]:bg-[#F24E29]" />
          <div className="flex justify-between text-sm text-white/80">
            <span>
              {t("progressLabel")}: {Math.round(progress)}%
            </span>
            <span>
              {t("goal")}: {Math.floor(totalTime / 3600)}h
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={toggleTimer}
            className="bg-[#F24E29] hover:bg-[#F24E29]/90 text-white px-8 py-3 rounded-full"
          >
            {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            {isActive ? t("pause") : t("startFasting")}
          </Button>
          <Button
            onClick={resetTimer}
            variant="outline"
            className="border-white hover:bg-white hover:text-[#F24E29] px-8 py-3 rounded-full text-[#F24E29] bg-transparent"
          >
            <Square className="w-5 h-5 mr-2" />
            {t("reset")}
          </Button>
        </div>

        {/* Fasting Benefits */}
        <div className="bg-white/10 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">{t("currentBenefits")}:</h4>
          <ul className="text-sm text-white/90 space-y-1">
            {progress > 25 && <li>• {t("insulinStabilizingDesc")}</li>}
            {progress > 50 && <li>• {t("fatBurningStartedDesc")}</li>}
            {progress > 75 && <li>• {t("ketosisInitialDesc")}</li>}
            {progress > 90 && <li>• {t("autophagyActivatedDesc")}</li>}
            {progress === 0 && !isActive && <li className="text-white/70 italic">• {t("readyToStartDesc")}</li>}
            {isActive && progress < 25 && <li>• {t("digestionStartedDesc")}</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
