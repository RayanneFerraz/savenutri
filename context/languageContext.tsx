"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { translations, type Language, type TranslationKey } from "@/lib/translations"

// Language display names for UI
export const LANGUAGE_CONFIG = {
  en: {
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    locale: "en-US",
  },
  pt: {
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇧🇷",
    locale: "pt-BR",
  },
  es: {
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    locale: "es-ES",
  },
} as const

// Default language is ENGLISH
const DEFAULT_LANGUAGE: Language = "en"
const STORAGE_KEY = "app_language"
const COOKIE_NAME = "app_language"
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year in seconds

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string
  isLoading: boolean
  availableLanguages: typeof LANGUAGE_CONFIG
  currentLocale: string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

// Cookie helpers
const setCookie = (name: string, value: string, maxAge: number) => {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`
  }
}

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? match[2] : null
}

// Detect browser language
const detectBrowserLanguage = (): Language => {
  if (typeof navigator === "undefined") return DEFAULT_LANGUAGE

  const browserLang = navigator.language || (navigator as any).userLanguage || ""
  const langCode = browserLang.split("-")[0].toLowerCase()

  // Map browser language to supported languages
  if (langCode === "pt") return "pt"
  if (langCode === "es") return "es"

  // Default to English for any other language
  return DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize language on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false)
      return
    }

    // Priority: 1. URL param > 2. Cookie > 3. localStorage > 4. Browser detection > 5. Default (English)
    let detectedLang: Language = DEFAULT_LANGUAGE

    // 1. Check URL parameter
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get("lang")
    if (urlLang && translations[urlLang as Language]) {
      detectedLang = urlLang as Language
    }
    // 2. Check cookie
    else {
      const cookieLang = getCookie(COOKIE_NAME)
      if (cookieLang && translations[cookieLang as Language]) {
        detectedLang = cookieLang as Language
      }
      // 3. Check localStorage
      else {
        const storedLang = localStorage.getItem(STORAGE_KEY)
        if (storedLang) {
          try {
            const parsed = JSON.parse(storedLang) as Language
            if (translations[parsed]) {
              detectedLang = parsed
            }
          } catch {
            // Try direct string
            if (translations[storedLang as Language]) {
              detectedLang = storedLang as Language
            }
          }
        }
        // 4. Browser detection
        else {
          detectedLang = detectBrowserLanguage()
        }
      }
    }

    setLanguageState(detectedLang)
    setIsLoading(false)
  }, [])

  // Update HTML lang attribute and store preference
  useEffect(() => {
    if (typeof document !== "undefined" && !isLoading) {
      // Update HTML lang attribute
      document.documentElement.lang = LANGUAGE_CONFIG[language].locale

      // Store in both localStorage and cookie
      localStorage.setItem(STORAGE_KEY, JSON.stringify(language))
      setCookie(COOKIE_NAME, language, COOKIE_MAX_AGE)
    }
  }, [language, isLoading])

  const setLanguage = useCallback((lang: Language) => {
    if (!translations[lang]) {
      console.warn(`Language "${lang}" is not supported. Falling back to English.`)
      lang = DEFAULT_LANGUAGE
    }
    setLanguageState(lang)
  }, [])

  const t = useCallback(
    (key: TranslationKey, variables?: Record<string, string | number>): string => {
      // Get translation with fallback to English, then to key itself
      let translation = translations[language]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || String(key)

      // Replace variables if provided
      if (variables) {
        Object.entries(variables).forEach(([varKey, value]) => {
          translation = translation.replace(new RegExp(`\\{${varKey}\\}`, "g"), String(value))
        })
      }

      return translation
    },
    [language],
  )

  const value: LanguageContextValue = {
    language,
    setLanguage,
    t,
    isLoading,
    availableLanguages: LANGUAGE_CONFIG,
    currentLocale: LANGUAGE_CONFIG[language].locale,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}

// Export for external use
export { DEFAULT_LANGUAGE }
