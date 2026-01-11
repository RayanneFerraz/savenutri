"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Trophy, Lock } from "lucide-react"
import { useLanguage } from "@/context/languageContext"
import { useAuth } from "@/context/authContext"
import { achievementService, ACHIEVEMENTS, type AchievementDefinition } from "@/lib/achievements"

export function AchievementsDisplay() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [unlocked, setUnlocked] = useState<(AchievementDefinition & { unlockedAt: string })[]>([])
  const [locked, setLocked] = useState<AchievementDefinition[]>([])
  const [progress, setProgress] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    if (user) {
      loadAchievements()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const loadAchievements = async () => {
    if (!user) return

    try {
      const data = await achievementService.getUserAchievements(user.id)
      setUnlocked(data.unlocked)
      setLocked(data.locked)
      setProgress(data.progress)
    } catch (error) {
      console.error("Failed to load achievements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = ["fasting", "streak", "hydration", "weight", "milestone"] as const
  const categoryLabels: Record<string, string> = {
    fasting: t("achievements.fasting") || "Fasting",
    streak: t("achievements.streak") || "Streaks",
    hydration: t("achievements.hydration") || "Hydration",
    weight: t("achievements.weight") || "Weight",
    milestone: t("achievements.milestone") || "Milestones",
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#F24E29]" />
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t("achievements.loginRequired") || "Sign in to track your achievements"}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-gradient-to-r from-[#F24E29] to-[#F27D16] text-white">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                {unlocked.length} / {ACHIEVEMENTS.length}
              </h3>
              <p className="text-white/80">{t("achievements.unlocked") || "Achievements Unlocked"}</p>
            </div>
            <Trophy className="w-12 h-12 opacity-80" />
          </div>
          <Progress value={(unlocked.length / ACHIEVEMENTS.length) * 100} className="mt-4 bg-white/20" />
        </CardContent>
      </Card>

      {/* By Category */}
      {categories.map((category) => {
        const categoryAchievements = ACHIEVEMENTS.filter((a) => a.category === category)
        const unlockedInCategory = unlocked.filter((a) => a.category === category)

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{categoryLabels[category]}</span>
                <span className="text-sm font-normal text-gray-500">
                  {unlockedInCategory.length}/{categoryAchievements.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryAchievements.map((achievement) => {
                  const isUnlocked = unlocked.some((u) => u.id === achievement.id)
                  const currentProgress = progress.get(achievement.id) || 0

                  return (
                    <div
                      key={achievement.id}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        isUnlocked
                          ? "bg-gradient-to-br from-[#F2AEE7]/20 to-[#F2EAE4] border-[#F24E29]"
                          : "bg-gray-50 border-gray-200 opacity-60"
                      }`}
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <h4 className="font-semibold text-sm">{achievement.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>

                      {!isUnlocked && (
                        <>
                          <div className="absolute top-2 right-2">
                            <Lock className="w-4 h-4 text-gray-400" />
                          </div>
                          <Progress value={(currentProgress / achievement.target) * 100} className="mt-2 h-1" />
                          <p className="text-xs text-gray-400 mt-1">
                            {currentProgress}/{achievement.target}
                          </p>
                        </>
                      )}

                      {isUnlocked && (
                        <div className="absolute top-2 right-2">
                          <div className="w-5 h-5 bg-[#F24E29] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
