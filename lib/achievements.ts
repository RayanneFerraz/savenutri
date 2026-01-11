// Achievement system for gamification
import { createClient } from "@/lib/supabase/client"

export interface AchievementDefinition {
  id: string
  type: string
  name: string
  description: string
  icon: string
  target: number
  category: "fasting" | "hydration" | "weight" | "streak" | "milestone"
}

// All available achievements
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Fasting achievements
  {
    id: "first_fast",
    type: "fasting",
    name: "First Step",
    description: "Complete your first fast",
    icon: "🌅",
    target: 1,
    category: "fasting",
  },
  {
    id: "fast_5",
    type: "fasting",
    name: "Getting Started",
    description: "Complete 5 fasts",
    icon: "⭐",
    target: 5,
    category: "fasting",
  },
  {
    id: "fast_25",
    type: "fasting",
    name: "Fasting Enthusiast",
    description: "Complete 25 fasts",
    icon: "🏅",
    target: 25,
    category: "fasting",
  },
  {
    id: "fast_50",
    type: "fasting",
    name: "Fasting Expert",
    description: "Complete 50 fasts",
    icon: "🏆",
    target: 50,
    category: "fasting",
  },
  {
    id: "fast_100",
    type: "fasting",
    name: "Fasting Master",
    description: "Complete 100 fasts",
    icon: "👑",
    target: 100,
    category: "fasting",
  },

  // Streak achievements
  {
    id: "streak_3",
    type: "streak",
    name: "3 Day Streak",
    description: "Fast for 3 consecutive days",
    icon: "🔥",
    target: 3,
    category: "streak",
  },
  {
    id: "streak_7",
    type: "streak",
    name: "Week Warrior",
    description: "Fast for 7 consecutive days",
    icon: "💪",
    target: 7,
    category: "streak",
  },
  {
    id: "streak_14",
    type: "streak",
    name: "Two Week Champion",
    description: "Fast for 14 consecutive days",
    icon: "🎯",
    target: 14,
    category: "streak",
  },
  {
    id: "streak_30",
    type: "streak",
    name: "Monthly Master",
    description: "Fast for 30 consecutive days",
    icon: "🌟",
    target: 30,
    category: "streak",
  },

  // Hydration achievements
  {
    id: "water_goal_1",
    type: "hydration",
    name: "Hydrated",
    description: "Reach your water goal for the first time",
    icon: "💧",
    target: 1,
    category: "hydration",
  },
  {
    id: "water_goal_7",
    type: "hydration",
    name: "Hydration Habit",
    description: "Reach water goal 7 days",
    icon: "🌊",
    target: 7,
    category: "hydration",
  },
  {
    id: "water_goal_30",
    type: "hydration",
    name: "Hydration Hero",
    description: "Reach water goal 30 days",
    icon: "🏊",
    target: 30,
    category: "hydration",
  },
  {
    id: "water_100",
    type: "hydration",
    name: "100 Glasses",
    description: "Drink 100 glasses of water total",
    icon: "💯",
    target: 100,
    category: "hydration",
  },

  // Weight achievements
  {
    id: "weight_first",
    type: "weight",
    name: "First Weigh-in",
    description: "Record your first weight",
    icon: "⚖️",
    target: 1,
    category: "weight",
  },
  {
    id: "weight_loss_1",
    type: "weight",
    name: "First Kilo Down",
    description: "Lose 1 kg from starting weight",
    icon: "📉",
    target: 1,
    category: "weight",
  },
  {
    id: "weight_loss_5",
    type: "weight",
    name: "5 Kilos Down",
    description: "Lose 5 kg from starting weight",
    icon: "🎉",
    target: 5,
    category: "weight",
  },
  {
    id: "weight_loss_10",
    type: "weight",
    name: "10 Kilos Down",
    description: "Lose 10 kg from starting weight",
    icon: "🚀",
    target: 10,
    category: "weight",
  },

  // Milestone achievements
  {
    id: "profile_complete",
    type: "milestone",
    name: "Profile Complete",
    description: "Fill out your complete profile",
    icon: "📝",
    target: 1,
    category: "milestone",
  },
  {
    id: "first_photo",
    type: "milestone",
    name: "Picture Perfect",
    description: "Upload your first progress photo",
    icon: "📸",
    target: 1,
    category: "milestone",
  },
  {
    id: "app_week",
    type: "milestone",
    name: "One Week In",
    description: "Use the app for one week",
    icon: "📅",
    target: 7,
    category: "milestone",
  },
  {
    id: "app_month",
    type: "milestone",
    name: "Monthly User",
    description: "Use the app for one month",
    icon: "🗓️",
    target: 30,
    category: "milestone",
  },
]

export interface UserAchievement {
  id: string
  achievementId: string
  unlockedAt: string
  progress: number
  target: number
}

class AchievementService {
  // Check and unlock achievements based on user stats
  async checkAndUnlockAchievements(
    userId: string,
    stats: {
      totalFasts?: number
      currentStreak?: number
      totalWaterGlasses?: number
      daysWaterGoalMet?: number
      totalWeightLoss?: number
      weightEntries?: number
      hasPhoto?: boolean
      profileComplete?: boolean
      daysUsingApp?: number
    },
  ): Promise<AchievementDefinition[]> {
    const supabase = createClient()
    const newlyUnlocked: AchievementDefinition[] = []

    // Get user's current achievements
    const { data: existingAchievements } = await supabase
      .from("achievements")
      .select("achievement_type")
      .eq("user_id", userId)

    const unlockedTypes = new Set(existingAchievements?.map((a) => a.achievement_type) || [])

    // Check each achievement
    for (const achievement of ACHIEVEMENTS) {
      if (unlockedTypes.has(achievement.id)) continue

      let shouldUnlock = false
      let progress = 0

      switch (achievement.id) {
        // Fasting achievements
        case "first_fast":
          progress = stats.totalFasts || 0
          shouldUnlock = progress >= 1
          break
        case "fast_5":
          progress = stats.totalFasts || 0
          shouldUnlock = progress >= 5
          break
        case "fast_25":
          progress = stats.totalFasts || 0
          shouldUnlock = progress >= 25
          break
        case "fast_50":
          progress = stats.totalFasts || 0
          shouldUnlock = progress >= 50
          break
        case "fast_100":
          progress = stats.totalFasts || 0
          shouldUnlock = progress >= 100
          break

        // Streak achievements
        case "streak_3":
          progress = stats.currentStreak || 0
          shouldUnlock = progress >= 3
          break
        case "streak_7":
          progress = stats.currentStreak || 0
          shouldUnlock = progress >= 7
          break
        case "streak_14":
          progress = stats.currentStreak || 0
          shouldUnlock = progress >= 14
          break
        case "streak_30":
          progress = stats.currentStreak || 0
          shouldUnlock = progress >= 30
          break

        // Hydration achievements
        case "water_goal_1":
          progress = stats.daysWaterGoalMet || 0
          shouldUnlock = progress >= 1
          break
        case "water_goal_7":
          progress = stats.daysWaterGoalMet || 0
          shouldUnlock = progress >= 7
          break
        case "water_goal_30":
          progress = stats.daysWaterGoalMet || 0
          shouldUnlock = progress >= 30
          break
        case "water_100":
          progress = stats.totalWaterGlasses || 0
          shouldUnlock = progress >= 100
          break

        // Weight achievements
        case "weight_first":
          progress = stats.weightEntries || 0
          shouldUnlock = progress >= 1
          break
        case "weight_loss_1":
          progress = stats.totalWeightLoss || 0
          shouldUnlock = progress >= 1
          break
        case "weight_loss_5":
          progress = stats.totalWeightLoss || 0
          shouldUnlock = progress >= 5
          break
        case "weight_loss_10":
          progress = stats.totalWeightLoss || 0
          shouldUnlock = progress >= 10
          break

        // Milestone achievements
        case "profile_complete":
          shouldUnlock = stats.profileComplete || false
          progress = shouldUnlock ? 1 : 0
          break
        case "first_photo":
          shouldUnlock = stats.hasPhoto || false
          progress = shouldUnlock ? 1 : 0
          break
        case "app_week":
          progress = stats.daysUsingApp || 0
          shouldUnlock = progress >= 7
          break
        case "app_month":
          progress = stats.daysUsingApp || 0
          shouldUnlock = progress >= 30
          break
      }

      if (shouldUnlock) {
        // Insert the achievement
        const { error } = await supabase.from("achievements").insert({
          user_id: userId,
          achievement_type: achievement.id,
          achievement_name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          progress: progress,
          target: achievement.target,
        })

        if (!error) {
          newlyUnlocked.push(achievement)
        }
      }
    }

    return newlyUnlocked
  }

  // Get all user achievements
  async getUserAchievements(userId: string): Promise<{
    unlocked: (AchievementDefinition & { unlockedAt: string })[]
    locked: AchievementDefinition[]
    progress: Map<string, number>
  }> {
    const supabase = createClient()

    const { data: userAchievements } = await supabase.from("achievements").select("*").eq("user_id", userId)

    const unlockedMap = new Map(userAchievements?.map((a) => [a.achievement_type, a]) || [])

    const unlocked: (AchievementDefinition & { unlockedAt: string })[] = []
    const locked: AchievementDefinition[] = []
    const progress = new Map<string, number>()

    for (const achievement of ACHIEVEMENTS) {
      const userAchievement = unlockedMap.get(achievement.id)
      if (userAchievement) {
        unlocked.push({
          ...achievement,
          unlockedAt: userAchievement.unlocked_at,
        })
        progress.set(achievement.id, userAchievement.progress)
      } else {
        locked.push(achievement)
        progress.set(achievement.id, 0)
      }
    }

    return { unlocked, locked, progress }
  }

  // Calculate user stats for achievement checking
  async calculateUserStats(userId: string): Promise<{
    totalFasts: number
    currentStreak: number
    totalWaterGlasses: number
    daysWaterGoalMet: number
    totalWeightLoss: number
    weightEntries: number
    hasPhoto: boolean
    profileComplete: boolean
    daysUsingApp: number
  }> {
    const supabase = createClient()

    // Get fasting entries
    const { data: fastingEntries } = await supabase
      .from("fasting_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("start_time", { ascending: false })

    // Get daily data
    const { data: dailyData } = await supabase.from("daily_data").select("*").eq("user_id", userId)

    // Get weight entries
    const { data: weightEntries } = await supabase
      .from("weight_entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true })

    // Get photos
    const { data: photos } = await supabase.from("progress_photos").select("id").eq("user_id", userId).limit(1)

    // Get profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

    // Calculate streak
    let currentStreak = 0
    if (fastingEntries && fastingEntries.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < fastingEntries.length; i++) {
        const entryDate = new Date(fastingEntries[i].start_time)
        entryDate.setHours(0, 0, 0, 0)

        const expectedDate = new Date(today)
        expectedDate.setDate(expectedDate.getDate() - i)

        if (entryDate.getTime() === expectedDate.getTime()) {
          currentStreak++
        } else {
          break
        }
      }
    }

    // Calculate water stats
    const totalWaterGlasses = dailyData?.reduce((sum, d) => sum + (d.water_glasses || 0), 0) || 0
    const daysWaterGoalMet = dailyData?.filter((d) => (d.water_glasses || 0) >= (d.water_goal || 8)).length || 0

    // Calculate weight loss
    let totalWeightLoss = 0
    if (weightEntries && weightEntries.length >= 2) {
      const firstWeight = weightEntries[0].weight
      const lastWeight = weightEntries[weightEntries.length - 1].weight
      totalWeightLoss = Math.max(0, firstWeight - lastWeight)
    }

    // Check profile completeness
    const profileComplete = !!(profile?.name && profile?.age && profile?.weight && profile?.height && profile?.goal)

    // Calculate days using app
    const daysUsingApp = profile?.created_at
      ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return {
      totalFasts: fastingEntries?.length || 0,
      currentStreak,
      totalWaterGlasses,
      daysWaterGoalMet,
      totalWeightLoss,
      weightEntries: weightEntries?.length || 0,
      hasPhoto: (photos?.length || 0) > 0,
      profileComplete,
      daysUsingApp,
    }
  }
}

export const achievementService = new AchievementService()
