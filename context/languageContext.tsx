"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { translations, type Language, type TranslationKey } from "@/lib/translations"

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string // Allow optional variables
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt")

  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem("app_language")
    if (saved && saved !== "undefined") {
      try {
        const parsedLang = JSON.parse(saved) as Language
        if (translations[parsedLang]) {
          setLanguageState(parsedLang)
        }
      } catch {
        localStorage.removeItem("app_language")
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("app_language", JSON.stringify(lang))
  }

  const t = (key: TranslationKey, variables?: Record<string, string | number>): string => {
    let translation = translations[language]?.[key] || translations.en?.[key] || String(key)

    if (variables) {
      Object.keys(variables).forEach((variableKey) => {
        const regex = new RegExp(`{${variableKey}}`, "g")
        translation = translation.replace(regex, String(variables[variableKey]))
      })
    }
    return translation
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
