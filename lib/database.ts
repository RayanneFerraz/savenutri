import { createClient } from "@/lib/supabase/client"
import type { WeightEntry, FastingEntry, DailyData, HydrationSettings, Achievement, ProgressPhoto } from "@/types"

// Database service for Supabase operations
export class DatabaseService {
  // Profile operations
  static async getProfile(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) throw error
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

  static async addWeightEntry(userId: string, weight: number, date?: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("weight_entries")
      .insert({
        user_id: userId,
        weight,
        date: date || new Date().toISOString().split("T")[0],
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
      duration: Number(entry.actual_duration) || 0,
      completed: entry.completed,
      type: entry.fasting_type,
      timestamp: new Date(entry.start_time).getTime(),
    }))
  }

  static async startFasting(userId: string, targetDuration: number, fastingType: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("fasting_entries")
      .insert({
        user_id: userId,
        start_time: new Date().toISOString(),
        target_duration: targetDuration,
        fasting_type: fastingType,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async endFasting(entryId: string, completed: boolean) {
    const supabase = createClient()
    const { data: entry } = await supabase.from("fasting_entries").select("start_time").eq("id", entryId).single()

    if (!entry) throw new Error("Fasting entry not found")

    const endTime = new Date()
    const startTime = new Date(entry.start_time)
    const actualDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) // hours

    const { data, error } = await supabase
      .from("fasting_entries")
      .update({
        end_time: endTime.toISOString(),
        actual_duration: actualDuration,
        completed,
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

    if (error && error.code !== "PGRST116") throw error // PGRST116 = no rows found

    return data
      ? {
          date: data.date,
          water: data.water_intake || 0,
          mood: data.mood || "",
          sleep: data.sleep_quality || "",
          weight: data.weight,
        }
      : null
  }

  static async updateDailyData(userId: string, updates: Partial<DailyData>, date?: string) {
    const supabase = createClient()
    const targetDate = date || new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("daily_data")
      .upsert({
        user_id: userId,
        date: targetDate,
        water_intake: updates.water,
        mood: updates.mood,
        sleep_quality: updates.sleep,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

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
          customGoal: data.custom_goal,
          useWeightBased: data.use_weight_based,
          activityLevel: data.activity_level,
          climate: data.climate,
        }
      : null
  }

  static async updateHydrationSettings(userId: string, settings: HydrationSettings) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("hydration_settings")
      .upsert({
        user_id: userId,
        custom_goal: settings.customGoal,
        use_weight_based: settings.useWeightBased,
        activity_level: settings.activityLevel,
        climate: settings.climate,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Achievements operations
  static async getAchievements(userId: string): Promise<Achievement[]> {
    const supabase = createClient()
    const { data, error } = await supabase.from("user_achievements").select("*").eq("user_id", userId)

    if (error) throw error
    return (data || []).map((ach) => ({
      key: ach.achievement_key,
      titleKey: `${ach.achievement_key}Achievement`,
      descKey: `${ach.achievement_key}AchievementDesc`,
      completed: ach.completed,
      date: ach.completed_at ? new Date(ach.completed_at).toLocaleDateString() : null,
      progress: ach.progress,
    }))
  }

  static async updateAchievement(userId: string, achievementKey: string, progress: number, completed?: boolean) {
    const supabase = createClient()
    const updateData: Record<string, unknown> = {
      user_id: userId,
      achievement_key: achievementKey,
      progress,
      updated_at: new Date().toISOString(),
    }

    if (completed) {
      updateData.completed = true
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase.from("user_achievements").upsert(updateData).select().single()

    if (error) throw error
    return data
  }

  // Progress photos operations
  static async getProgressPhotos(userId: string, limit = 50): Promise<ProgressPhoto[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("progress_photos")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []).map((photo) => ({
      id: photo.id,
      date: photo.date,
      photoUrl: photo.photo_url,
      weight: photo.weight,
      notes: photo.notes,
    }))
  }

  static async addProgressPhoto(userId: string, photoUrl: string, weight?: number, notes?: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("progress_photos")
      .insert({
        user_id: userId,
        photo_url: photoUrl,
        weight,
        notes,
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

  // Sync localStorage to database
  static async syncLocalStorageToDatabase(userId: string) {
    try {
      // Sync weight history
      const localWeightHistory = localStorage.getItem("weightHistory")
      if (localWeightHistory) {
        const entries = JSON.parse(localWeightHistory)
        for (const entry of entries) {
          await this.addWeightEntry(userId, entry.weight, entry.date).catch(() => {})
        }
      }

      // Sync fasting history
      const localFastingHistory = localStorage.getItem("fastingHistory")
      if (localFastingHistory) {
        const entries = JSON.parse(localFastingHistory)
        for (const entry of entries) {
          const supabase = createClient()
          await supabase
            .from("fasting_entries")
            .insert({
              user_id: userId,
              start_time: new Date(entry.timestamp).toISOString(),
              end_time: new Date(entry.timestamp + entry.duration * 60 * 60 * 1000).toISOString(),
              target_duration: Math.round(entry.duration),
              actual_duration: entry.duration,
              fasting_type: entry.type,
              completed: entry.completed,
            })
            .catch(() => {})
        }
      }

      // Sync daily data
      const localDailyData = localStorage.getItem("dailyData")
      if (localDailyData) {
        const data = JSON.parse(localDailyData)
        for (const [dateKey, dayData] of Object.entries(data)) {
          const d = dayData as DailyData
          await this.updateDailyData(
            userId,
            {
              water: d.water,
              mood: d.mood,
              sleep: d.sleep,
            },
            new Date(dateKey).toISOString().split("T")[0],
          ).catch(() => {})
        }
      }

      // Clear localStorage after successful sync
      // localStorage.removeItem("weightHistory")
      // localStorage.removeItem("fastingHistory")
      // localStorage.removeItem("dailyData")

      return true
    } catch (error) {
      console.error("Error syncing localStorage to database:", error)
      return false
    }
  }
}
