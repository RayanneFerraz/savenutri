"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/context/authContext"
import { DatabaseService } from "@/lib/database"
import type { WeightEntry, FastingEntry, DailyData, HydrationSettings } from "@/types"

interface UseDatabaseReturn {
  // State
  isLoading: boolean
  isAuthenticated: boolean
  userId: string | null

  // Weight operations
  weightHistory: WeightEntry[]
  addWeight: (weight: number, date?: string) => Promise<void>
  refreshWeightHistory: () => Promise<void>

  // Fasting operations
  fastingHistory: FastingEntry[]
  activeFasting: { id: string; startTime: Date; targetHours: number } | null
  startFast: (targetHours: number, type: string) => Promise<string | null>
  endFast: (completed?: boolean) => Promise<void>
  refreshFastingHistory: () => Promise<void>

  // Daily data operations
  dailyData: DailyData | null
  updateDailyData: (updates: Partial<DailyData>) => Promise<void>
  refreshDailyData: () => Promise<void>

  // Hydration
  hydrationSettings: HydrationSettings | null
  updateHydrationSettings: (settings: Partial<HydrationSettings>) => Promise<void>

  // Sync
  syncFromLocalStorage: () => Promise<void>
}

// Helper to get/set localStorage with fallback
function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent("localStorageChange", { detail: { key } }))
  } catch {
    // Ignore
  }
}

export function useDatabase(): UseDatabaseReturn {
  const { user } = useAuth()
  const userId = user?.id || null
  const isAuthenticated = !!user

  const [isLoading, setIsLoading] = useState(true)
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([])
  const [fastingHistory, setFastingHistory] = useState<FastingEntry[]>([])
  const [activeFasting, setActiveFasting] = useState<{ id: string; startTime: Date; targetHours: number } | null>(null)
  const [dailyData, setDailyData] = useState<DailyData | null>(null)
  const [hydrationSettings, setHydrationSettings] = useState<HydrationSettings | null>(null)

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)

      if (isAuthenticated && userId) {
        // Load from Supabase
        try {
          const [weights, fasts, daily, hydration, active] = await Promise.all([
            DatabaseService.getWeightEntries(userId),
            DatabaseService.getFastingEntries(userId),
            DatabaseService.getDailyData(userId),
            DatabaseService.getHydrationSettings(userId),
            DatabaseService.getActiveFasting(userId),
          ])

          setWeightHistory(weights)
          setFastingHistory(fasts)
          setDailyData(daily)
          setHydrationSettings(hydration)

          if (active) {
            setActiveFasting({
              id: active.id,
              startTime: new Date(active.start_time),
              targetHours: active.target_hours,
            })
          }
        } catch (error) {
          console.error("Error loading data from Supabase:", error)
          // Fallback to localStorage
          loadFromLocalStorage()
        }
      } else {
        // Load from localStorage for non-authenticated users
        loadFromLocalStorage()
      }

      setIsLoading(false)
    }

    function loadFromLocalStorage() {
      setWeightHistory(getLocalStorage<WeightEntry[]>("weightHistory", []))
      setFastingHistory(getLocalStorage<FastingEntry[]>("fastingHistory", []))

      const savedDailyData = getLocalStorage<Record<string, DailyData>>("dailyData", {})
      const today = new Date().toDateString()
      setDailyData(savedDailyData[today] || null)

      setHydrationSettings(getLocalStorage<HydrationSettings | null>("hydrationSettings", null))

      // Check for active fasting in localStorage
      const timerState = getLocalStorage<{ isActive: boolean; startTime: string; totalTime: number } | null>(
        "fastingTimerState",
        null,
      )
      if (timerState?.isActive && timerState.startTime) {
        setActiveFasting({
          id: "local",
          startTime: new Date(timerState.startTime),
          targetHours: timerState.totalTime / 3600,
        })
      }
    }

    loadData()
  }, [isAuthenticated, userId])

  // Weight operations
  const addWeight = useCallback(
    async (weight: number, date?: string) => {
      const entry: WeightEntry = {
        date: date || new Date().toLocaleDateString(),
        weight,
        timestamp: Date.now(),
      }

      if (isAuthenticated && userId) {
        await DatabaseService.addWeightEntry(userId, weight, date)
      }

      // Always update localStorage and state
      const updated = [...weightHistory, entry]
      setWeightHistory(updated)
      setLocalStorage("weightHistory", updated)
    },
    [isAuthenticated, userId, weightHistory],
  )

  const refreshWeightHistory = useCallback(async () => {
    if (isAuthenticated && userId) {
      const weights = await DatabaseService.getWeightEntries(userId)
      setWeightHistory(weights)
    }
  }, [isAuthenticated, userId])

  // Fasting operations
  const startFast = useCallback(
    async (targetHours: number, type: string): Promise<string | null> => {
      const startTime = new Date()

      if (isAuthenticated && userId) {
        const result = await DatabaseService.startFasting(userId, targetHours, type)
        setActiveFasting({
          id: result.id,
          startTime: new Date(result.start_time),
          targetHours: result.target_hours,
        })
        return result.id
      }

      // localStorage fallback
      setActiveFasting({
        id: "local",
        startTime,
        targetHours,
      })

      setLocalStorage("fastingTimerState", {
        isActive: true,
        startTime: startTime.toISOString(),
        totalTime: targetHours * 3600,
        timeLeft: targetHours * 3600,
      })

      return "local"
    },
    [isAuthenticated, userId],
  )

  const endFast = useCallback(
    async (completed = true) => {
      if (!activeFasting) return

      const entry: FastingEntry = {
        date: activeFasting.startTime.toLocaleDateString(),
        duration: (Date.now() - activeFasting.startTime.getTime()) / (1000 * 60 * 60),
        completed,
        type: "16:8",
        timestamp: activeFasting.startTime.getTime(),
      }

      if (isAuthenticated && userId && activeFasting.id !== "local") {
        await DatabaseService.endFasting(activeFasting.id, completed ? "completed" : "cancelled")
      }

      // Update history
      const updated = [entry, ...fastingHistory]
      setFastingHistory(updated)
      setLocalStorage("fastingHistory", updated)

      // Clear active fasting
      setActiveFasting(null)
      setLocalStorage("fastingTimerState", {
        isActive: false,
        startTime: null,
        totalTime: activeFasting.targetHours * 3600,
        timeLeft: activeFasting.targetHours * 3600,
      })
    },
    [activeFasting, isAuthenticated, userId, fastingHistory],
  )

  const refreshFastingHistory = useCallback(async () => {
    if (isAuthenticated && userId) {
      const fasts = await DatabaseService.getFastingEntries(userId)
      setFastingHistory(fasts)
    }
  }, [isAuthenticated, userId])

  // Daily data operations
  const updateDailyData = useCallback(
    async (updates: Partial<DailyData>) => {
      const today = new Date().toDateString()
      const newData = { ...dailyData, ...updates, date: today } as DailyData

      if (isAuthenticated && userId) {
        await DatabaseService.updateDailyData(userId, updates)
      }

      // Update localStorage
      const allDailyData = getLocalStorage<Record<string, DailyData>>("dailyData", {})
      allDailyData[today] = newData
      setLocalStorage("dailyData", allDailyData)

      setDailyData(newData)
    },
    [dailyData, isAuthenticated, userId],
  )

  const refreshDailyData = useCallback(async () => {
    if (isAuthenticated && userId) {
      const daily = await DatabaseService.getDailyData(userId)
      setDailyData(daily)
    }
  }, [isAuthenticated, userId])

  // Hydration settings
  const updateHydrationSettings = useCallback(
    async (settings: Partial<HydrationSettings>) => {
      const newSettings = { ...hydrationSettings, ...settings } as HydrationSettings

      if (isAuthenticated && userId) {
        await DatabaseService.updateHydrationSettings(userId, settings)
      }

      setLocalStorage("hydrationSettings", newSettings)
      setHydrationSettings(newSettings)
    },
    [hydrationSettings, isAuthenticated, userId],
  )

  // Sync from localStorage to database
  const syncFromLocalStorage = useCallback(async () => {
    if (isAuthenticated && userId) {
      const result = await DatabaseService.syncFromLocalStorage(userId)
      if (result.success) {
        // Refresh all data after sync
        await Promise.all([refreshWeightHistory(), refreshFastingHistory(), refreshDailyData()])
      }
    }
  }, [isAuthenticated, userId, refreshWeightHistory, refreshFastingHistory, refreshDailyData])

  return {
    isLoading,
    isAuthenticated,
    userId,
    weightHistory,
    addWeight,
    refreshWeightHistory,
    fastingHistory,
    activeFasting,
    startFast,
    endFast,
    refreshFastingHistory,
    dailyData,
    updateDailyData,
    refreshDailyData,
    hydrationSettings,
    updateHydrationSettings,
    syncFromLocalStorage,
  }
}
