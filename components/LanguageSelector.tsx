"use client"

import { useLanguage, type LANGUAGE_CONFIG } from "@/context/languageContext"
import type { Language } from "@/lib/translations"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface LanguageSelectorProps {
  variant?: "dropdown" | "select" | "buttons"
  showFlags?: boolean
  showNativeName?: boolean
  className?: string
}

export default function LanguageSelector({
  variant = "dropdown",
  showFlags = true,
  showNativeName = true,
  className = "",
}: LanguageSelectorProps) {
  const { language, setLanguage, availableLanguages, isLoading } = useLanguage()

  if (isLoading) {
    return <div className={`animate-pulse bg-gray-200 rounded h-9 w-24 ${className}`} />
  }

  const languages = Object.entries(availableLanguages) as [Language, (typeof LANGUAGE_CONFIG)[Language]][]
  const currentLang = availableLanguages[language]

  // Dropdown variant (default)
  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`gap-2 ${className}`}>
            {showFlags && <span className="text-base">{currentLang.flag}</span>}
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{showNativeName ? currentLang.nativeName : currentLang.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {languages.map(([code, config]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => setLanguage(code)}
              className={`cursor-pointer gap-3 ${language === code ? "bg-accent font-medium" : ""}`}
            >
              {showFlags && <span className="text-lg">{config.flag}</span>}
              <div className="flex flex-col">
                <span>{showNativeName ? config.nativeName : config.name}</span>
                {showNativeName && <span className="text-xs text-muted-foreground">{config.name}</span>}
              </div>
              {language === code && <span className="ml-auto text-xs text-primary">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Select variant
  if (variant === "select") {
    return (
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className={`px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
      >
        {languages.map(([code, config]) => (
          <option key={code} value={code}>
            {showFlags ? `${config.flag} ` : ""}
            {showNativeName ? config.nativeName : config.name}
          </option>
        ))}
      </select>
    )
  }

  // Buttons variant
  return (
    <div className={`flex gap-1 ${className}`}>
      {languages.map(([code, config]) => (
        <Button
          key={code}
          variant={language === code ? "default" : "outline"}
          size="sm"
          onClick={() => setLanguage(code)}
          className="gap-1"
        >
          {showFlags && <span>{config.flag}</span>}
          <span className="hidden sm:inline">{code.toUpperCase()}</span>
        </Button>
      ))}
    </div>
  )
}
