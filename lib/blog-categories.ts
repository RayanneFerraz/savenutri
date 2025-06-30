import type { TranslationKey } from "@/lib/translations"

export interface BlogCategory {
  nameKey: TranslationKey
  color: string
  count: number
}

const blogCategories: BlogCategory[] = [
  { nameKey: "all", color: "bg-gray-100 text-gray-800", count: 0 },
  { nameKey: "beginner", color: "bg-blue-100 text-blue-800", count: 0 },
  { nameKey: "science", color: "bg-purple-100 text-purple-800", count: 0 },
  { nameKey: "nutrition", color: "bg-green-100 text-green-800", count: 0 },
  { nameKey: "fitness", color: "bg-orange-100 text-orange-800", count: 0 },
  { nameKey: "femaleHealth", color: "bg-pink-100 text-pink-800", count: 0 },
  { nameKey: "experiences", color: "bg-indigo-100 text-indigo-800", count: 0 },
  { nameKey: "quickTips", color: "bg-yellow-100 text-yellow-800", count: 0 },
  { nameKey: "motivation", color: "bg-red-100 text-red-800", count: 0 },
]

export default blogCategories
