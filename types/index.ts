// Centralized type definitions for the application

// Weight tracking
export interface WeightEntry {
  date: string
  weight: number
  timestamp: number
}

// Fasting tracking
export interface FastingEntry {
  date: string
  duration: number // in hours
  completed: boolean
  type: string
  timestamp: number
}

// Wellness tracking
export interface WellnessEntry {
  date: string
  value: string
}

// Daily data tracking
export interface DailyData {
  date: string
  water: number
  mood: string
  sleep: string
  weight?: number
}

// Hydration settings
export interface HydrationSettings {
  customGoal?: number
  useWeightBased: boolean
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active"
  climate: "normal" | "hot" | "cold"
}

// User profile
export interface UserProfile {
  name: string
  email: string
  age: string
  weight: string
  height: string
  goal: string
  fastingPlan: string
  customFastHours: string
  fastStartTime: string
  fastEndTime: string
  customDays: number[]
  notifications: NotificationSettings
  privacy: PrivacySettings
}

export interface NotificationSettings {
  fastingReminders: boolean
  waterReminders: boolean
  progressUpdates: boolean
  educational: boolean
}

export interface PrivacySettings {
  shareProgress: boolean
  anonymousAnalytics: boolean
}

// Photo progress
export interface ProgressPhoto {
  id: string
  date: string
  photoUrl: string
  weight?: number
  notes?: string
}

// Recipe types
export interface Recipe {
  id: number
  title: string
  description: string
  category: string
  difficulty: string
  prepTime: string
  calories: number
  protein: number
  image: string
  ingredients?: Ingredient[]
  steps?: string[]
  notes?: string[]
  tags?: string[]
  cuisine?: string
  servings?: number
  variations?: Record<string, RecipeVariation>
}

export interface Ingredient {
  name: string
  amount: number | string
  unit: string
  notes?: string
}

export interface RecipeVariation {
  name: string
  description: string
}

// Article types
export interface Article {
  id: number
  title: string
  description: string
  category: string
  readTime: string
  image: string
  content?: string
  author?: string
  date?: string
  tags?: string[]
}

// Analytics types
export interface AnalyticsEvent {
  event: string
  timestamp: number
  data?: Record<string, unknown>
}
