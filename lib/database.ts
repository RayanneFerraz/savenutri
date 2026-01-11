import { createClient } from "@/lib/supabase/client"
import type { WeightEntry, FastingEntry, DailyData, HydrationSettings, Achievement } from "@/types"

// Database service for Supabase operations
export class DatabaseService {
  // Profile operations
  static async getProfile(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  static async updateProfile(userId: string, updates: Record<string, unknown>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Weight entries operations
  static async getWeightEntries(userId: string, limit = 100): Promise<WeightEntry[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("weight_entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []).map((entry) => ({
      date: entry.date,
      weight: Number(entry.weight),
      timestamp: new Date(entry.created_at).getTime(),
    }))
  }

  static async addWeightEntry(userId: string, weight: number, date?: string, notes?: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("weight_entries")
      .insert({
        user_id: userId,
        weight,
        date: date || new Date().toISOString().split("T")[0],
        notes,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Fasting entries operations
  static async getFastingEntries(userId: string, limit = 100): Promise<FastingEntry[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("fasting_entries")
      .select("*")
      .eq("user_id", userId)
      .order("start_time", { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []).map((entry) => ({
      date: new Date(entry.start_time).toLocaleDateString(),
      duration: Number(entry.actual_hours) || 0,
      completed: entry.status === "completed",
      type: entry.fasting_type,
      timestamp: new Date(entry.start_time).getTime(),
    }))
  }

  static async getActiveFasting(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("fasting_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .order("start_time", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  static async startFasting(userId: string, targetHours: number, fastingType: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("fasting_entries")
      .insert({
        user_id: userId,
        start_time: new Date().toISOString(),
        target_hours: targetHours,
        fasting_type: fastingType,
        status: "in_progress",
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async endFasting(entryId: string, status: "completed" | "cancelled" = "completed") {
    const supabase = createClient()
    const { data: entry } = await supabase.from("fasting_entries").select("start_time").eq("id", entryId).single()

    if (!entry) throw new Error("Fasting entry not found")

    const endTime = new Date()
    const startTime = new Date(entry.start_time)
    const actualHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

    const { data, error } = await supabase
      .from("fasting_entries")
      .update({
        end_time: endTime.toISOString(),
        actual_hours: actualHours,
        status,
      })
      .eq("id", entryId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Daily data operations
  static async getDailyData(userId: string, date?: string): Promise<DailyData | null> {
    const supabase = createClient()
    const targetDate = date || new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("daily_data")
      .select("*")
      .eq("user_id", userId)
      .eq("date", targetDate)
      .single()

    if (error && error.code !== "PGRST116") throw error

    return data
      ? {
          date: data.date,
          water: data.water_glasses || 0,
          mood: data.mood || "",
          sleep: data.sleep_hours ? String(data.sleep_hours) : "",
          weight: data.water_goal,
        }
      : null
  }

  static async updateDailyData(userId: string, updates: Partial<DailyData>, date?: string) {
    const supabase = createClient()
    const targetDate = date || new Date().toISOString().split("T")[0]

    const upsertData: Record<string, unknown> = {
      user_id: userId,
      date: targetDate,
      updated_at: new Date().toISOString(),
    }

    if (updates.water !== undefined) upsertData.water_glasses = updates.water
    if (updates.mood !== undefined) upsertData.mood = updates.mood
    if (updates.sleep !== undefined) upsertData.sleep_hours = Number.parseFloat(updates.sleep) || null

    const { data, error } = await supabase.from("daily_data").upsert(upsertData).select().single()

    if (error) throw error
    return data
  }

  // Hydration settings operations
  static async getHydrationSettings(userId: string): Promise<HydrationSettings | null> {
    const supabase = createClient()
    const { data, error } = await supabase.from("hydration_settings").select("*").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") throw error

    return data
      ? {
          customGoal: data.daily_goal,
          glassSize: data.glass_size,
          reminderEnabled: data.reminder_enabled,
          reminderInterval: data.reminder_interval,
        }
      : null
  }

  static async updateHydrationSettings(userId: string, settings: Partial<HydrationSettings>) {
    const supabase = createClient()

    const upsertData: Record<string, unknown> = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    }

    if (settings.customGoal !== undefined) upsertData.daily_goal = settings.customGoal
    if (settings.glassSize !== undefined) upsertData.glass_size = settings.glassSize
    if (settings.reminderEnabled !== undefined) upsertData.reminder_enabled = settings.reminderEnabled
    if (settings.reminderInterval !== undefined) upsertData.reminder_interval = settings.reminderInterval

    const { data, error } = await supabase.from("hydration_settings").upsert(upsertData).select().single()

    if (error) throw error
    return data
  }

  // Achievements operations
  static async getAchievements(userId: string): Promise<Achievement[]> {
    const supabase = createClient()
    const { data, error } = await supabase.from("achievements").select("*").eq("user_id", userId)

    if (error) throw error
    return (data || []).map((ach) => ({
      id: ach.id,
      type: ach.achievement_type,
      name: ach.achievement_name,
      description: ach.description,
      icon: ach.icon,
      unlockedAt: ach.unlocked_at,
      progress: ach.progress,
      target: ach.target,
    }))
  }

  static async unlockAchievement(
    userId: string,
    achievementType: string,
    achievementName: string,
    description: string,
    icon?: string,
  ) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("achievements")
      .insert({
        user_id: userId,
        achievement_type: achievementType,
        achievement_name: achievementName,
        description,
        icon,
        progress: 1,
        target: 1,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Progress photos operations
  static async getProgressPhotos(userId: string, limit = 50) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("progress_photos")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  static async addProgressPhoto(
    userId: string,
    photoUrl: string,
    options?: { weight?: number; notes?: string; category?: string },
  ) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("progress_photos")
      .insert({
        user_id: userId,
        photo_url: photoUrl,
        weight: options?.weight,
        notes: options?.notes,
        category: options?.category || "progress",
        date: new Date().toISOString().split("T")[0],
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteProgressPhoto(photoId: string) {
    const supabase = createClient()
    const { error } = await supabase.from("progress_photos").delete().eq("id", photoId)

    if (error) throw error
  }

  // Sync localStorage to database (for migration)
  static async syncFromLocalStorage(userId: string): Promise<{ success: boolean; synced: string[] }> {
    const synced: string[] = []

    try {
      // Sync weight history
      const localWeightHistory = localStorage.getItem("weightHistory")
      if (localWeightHistory) {
        const entries = JSON.parse(localWeightHistory) as WeightEntry[]
        for (const entry of entries) {
          try {
            await this.addWeightEntry(userId, entry.weight, entry.date)
          } catch {
            // Ignore duplicates
          }
        }
        synced.push("weightHistory")
      }

      // Sync fasting history
      const localFastingHistory = localStorage.getItem("fastingHistory")
      if (localFastingHistory) {
        const entries = JSON.parse(localFastingHistory) as FastingEntry[]
        const supabase = createClient()
        for (const entry of entries) {
          try {
            await supabase.from("fasting_entries").insert({
              user_id: userId,
              start_time: new Date(entry.timestamp).toISOString(),
              end_time: new Date(entry.timestamp + entry.duration * 60 * 60 * 1000).toISOString(),
              target_hours: Math.round(entry.duration),
              actual_hours: entry.duration,
              fasting_type: entry.type || "16:8",
              status: entry.completed ? "completed" : "cancelled",
            })
          } catch {
            // Ignore duplicates
          }
        }
        synced.push("fastingHistory")
      }

      // Sync daily data
      const localDailyData = localStorage.getItem("dailyData")
      if (localDailyData) {
        const data = JSON.parse(localDailyData) as Record<string, DailyData>
        for (const [dateKey, dayData] of Object.entries(data)) {
          try {
            const dateStr = new Date(dateKey).toISOString().split("T")[0]
            await this.updateDailyData(userId, dayData, dateStr)
          } catch {
            // Ignore errors
          }
        }
        synced.push("dailyData")
      }

      // Sync hydration settings
      const localHydrationSettings = localStorage.getItem("hydrationSettings")
      if (localHydrationSettings) {
        const settings = JSON.parse(localHydrationSettings) as HydrationSettings
        try {
          await this.updateHydrationSettings(userId, settings)
          synced.push("hydrationSettings")
        } catch {
          // Ignore errors
        }
      }

      // Sync profile
      const localProfile = localStorage.getItem("fastingProfile")
      if (localProfile) {
        const profile = JSON.parse(localProfile)
        try {
          await this.updateProfile(userId, {
            name: profile.name,
            age: profile.age ? Number.parseInt(profile.age) : null,
            weight: profile.weight ? Number.parseFloat(profile.weight) : null,
            height: profile.height ? Number.parseFloat(profile.height) : null,
            goal: profile.goal,
            fasting_plan: profile.fastingPlan,
            custom_fast_hours: profile.customFastHours ? Number.parseInt(profile.customFastHours) : null,
          })
          synced.push("fastingProfile")
        } catch {
          // Ignore errors
        }
      }

      return { success: true, synced }
    } catch (error) {
      console.error("Error syncing from localStorage:", error)
      return { success: false, synced }
    }
  }
}
