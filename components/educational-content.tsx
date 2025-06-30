"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Lightbulb, Users, ChefHat, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage, type TranslationKey } from "@/context/languageContext" // Import TranslationKey

// Componente para renderizar texto com markdown simples
const MarkdownText = ({ children }: { children: string }) => {
  const { t } = useLanguage() // Access t function for potential internal translations if needed

  const renderText = (text: string) => {
    const lines = text.split("\n")
    return lines.map((line, lineIndex) => {
      if (!line.trim()) return <br key={lineIndex} />
      const parts = []
      let currentText = line
      let partIndex = 0
      while (currentText.includes("**")) {
        const startBold = currentText.indexOf("**")
        const endBold = currentText.indexOf("**", startBold + 2)
        if (endBold === -1) break
        if (startBold > 0)
          parts.push(<span key={`${lineIndex}-${partIndex++}`}>{currentText.substring(0, startBold)}</span>)
        const boldText = currentText.substring(startBold + 2, endBold)
        parts.push(
          <strong key={`${lineIndex}-${partIndex++}`} className="font-bold text-[#F24E29]">
            {boldText}
          </strong>,
        )
        currentText = currentText.substring(endBold + 2)
      }
      if (currentText) parts.push(<span key={`${lineIndex}-${partIndex++}`}>{currentText}</span>)
      return (
        <div key={lineIndex} className="mb-1">
          {parts.length > 0 ? parts : line}
        </div>
      )
    })
  }
  return <div>{renderText(children)}</div>
}

interface Tip {
  titleKey: TranslationKey
  shortTextKey: TranslationKey
  fullTextKey: TranslationKey
  categoryKey: TranslationKey // Assuming category is also translatable
  readTimeKey: TranslationKey // Assuming read time string is translatable
}

export default function EducationalContent() {
  const { t } = useLanguage()
  const [expandedTip, setExpandedTip] = useState<number | null>(null)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)

  const handleArticleClick = (titleKey: TranslationKey) => {
    if (titleKey === "benefits168") {
      window.location.href = "/learn"
    } else if (titleKey === "recipesToBreakFast") {
      window.location.href = "/recipes"
    } else if (titleKey === "fastTrackCommunity") {
      alert(t("comingSoon") || "Em breve! Funcionalidade da comunidade será lançada.") // Add comingSoon key
    }
  }

  // Banco de dicas rotativas - using keys now
  const dailyTips: Tip[] = [
    {
      titleKey: "tipHydrationTitle",
      shortTextKey: "tipHydrationShort",
      fullTextKey: "tipHydrationFull",
      categoryKey: "categoryHydration",
      readTimeKey: "readTime2min",
    },
    {
      titleKey: "tipBreakFastTimeTitle",
      shortTextKey: "tipBreakFastTimeShort",
      fullTextKey: "tipBreakFastTimeFull",
      categoryKey: "categoryTiming",
      readTimeKey: "readTime3min",
    },
    {
      titleKey: "tipIdealFoodsToBreakFast",
      shortTextKey: "tipIdealFoodsToBreakFastShort",
      fullTextKey: "tipIdealFoodsToBreakFastFull",
      categoryKey: "categoryNutrition",
      readTimeKey: "readTime4min",
    },
    {
      titleKey: "tipSignsJejumWorking",
      shortTextKey: "tipSignsJejumWorkingShort",
      fullTextKey: "tipSignsJejumWorkingFull",
      categoryKey: "categoryHealth",
      readTimeKey: "readTime3min",
    },
    {
      titleKey: "tipCombiningJejumExercises",
      shortTextKey: "tipCombiningJejumExercisesShort",
      fullTextKey: "tipCombiningJejumExercisesFull",
      categoryKey: "categoryExercises",
      readTimeKey: "readTime4min",
    },
  ]

  // Fallback if dailyTips is empty or currentTipIndex is out of bounds
  const currentTip =
    dailyTips.length > 0
      ? dailyTips[currentTipIndex % dailyTips.length]
      : {
          titleKey: "tipOfTheDay" as TranslationKey,
          shortTextKey: "noTipAvailableShort" as TranslationKey, // Add these keys
          fullTextKey: "noTipAvailableFull" as TranslationKey, // Add these keys
          categoryKey: "categoryGeneral" as TranslationKey, // Add this key
          readTimeKey: "readTime1min" as TranslationKey, // Add this key
        }

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % (dailyTips.length || 1))
    setExpandedTip(null)
  }

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + (dailyTips.length || 1)) % (dailyTips.length || 1))
    setExpandedTip(null)
  }

  const toggleTipExpansion = () => {
    setExpandedTip(expandedTip === currentTipIndex ? null : currentTipIndex)
  }

  const articles = [
    {
      titleKey: "benefits168" as const,
      descKey: "benefits168Desc" as const,
      icon: <Lightbulb className="w-4 h-4" />,
      color: "from-[#F2AEE7] to-[#F2C12E]",
    },
    {
      titleKey: "recipesToBreakFast" as const,
      descKey: "recipesToBreakFastDesc" as const,
      icon: <ChefHat className="w-4 h-4" />,
      color: "from-[#F27D16] to-[#F24E29]",
    },
    {
      titleKey: "fastTrackCommunity" as const,
      descKey: "fastTrackCommunityDesc" as const,
      icon: <Users className="w-4 h-4" />,
      color: "from-[#F2C12E] to-[#F27D16]",
    },
  ]

  const fastingStageItems = [
    { labelKey: "stageDigestion" as const, color: "bg-[#F2AEE7]" },
    { labelKey: "stageTransition" as const, color: "bg-[#F2C12E]" },
    { labelKey: "stageFatBurning" as const, color: "bg-[#F27D16]" },
    { labelKey: "stageKetosis" as const, color: "bg-[#F24E29]" },
  ]

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-[#F24E29] flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          {t("educationalContentTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {articles.map((article, index) => (
          <div
            key={index}
            className={`bg-gradient-to-r ${article.color} p-4 rounded-lg text-white cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => handleArticleClick(article.titleKey)}
          >
            <div className="flex items-start gap-3">
              {article.icon}
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{t(article.titleKey)}</h4>
                <p className="text-xs text-white/80">{t(article.descKey)}</p>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-[#F2EAE4] rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-[#F24E29] flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> {t("tipOfTheDay")}
              </h4>
              {dailyTips.length > 0 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevTip}
                    className="h-6 w-6 p-0 text-[#F24E29] hover:bg-[#F24E29]/10"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  <span className="text-xs text-gray-500 mx-2">
                    {currentTipIndex + 1}/{dailyTips.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextTip}
                    className="h-6 w-6 p-0 text-[#F24E29] hover:bg-[#F24E29]/10"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="font-medium text-[#F24E29]">{t(currentTip.titleKey)}</h5>
                <span className="text-xs bg-[#F24E29] text-white px-2 py-0.5 rounded">{t(currentTip.categoryKey)}</span>
              </div>
              <div className="text-sm text-gray-700 mb-3">
                {expandedTip === currentTipIndex ? (
                  <MarkdownText>{t(currentTip.fullTextKey)}</MarkdownText>
                ) : (
                  t(currentTip.shortTextKey)
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">⏱️ {t(currentTip.readTimeKey)}</span>
              <Button
                size="sm"
                onClick={toggleTipExpansion}
                className="bg-[#F27D16] hover:bg-[#F27D16]/90 text-white text-xs px-3 py-1"
              >
                {expandedTip === currentTipIndex ? (
                  <>
                    <X className="w-3 h-3 mr-1" />
                    {t("close")}
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3 h-3 mr-1" />
                    {t("readMore")}
                  </>
                )}
              </Button>
            </div>
          </div>
          {dailyTips.length > 0 && (
            <div className="bg-[#F24E29]/10 px-4 py-2">
              <div className="flex justify-center gap-1">
                {dailyTips.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentTipIndex(index)
                      setExpandedTip(null)
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${index === currentTipIndex ? "bg-[#F24E29]" : "bg-gray-300"}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-[#F24E29] text-sm">{t("fastingStages")}</h4>
          <div className="space-y-2 text-xs">
            {fastingStageItems.map((item) => (
              <div key={item.labelKey} className="flex justify-between">
                <span>{t(item.labelKey)}</span>
                <div className={`w-16 h-2 ${item.color} rounded`}></div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
