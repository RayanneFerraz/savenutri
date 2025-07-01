"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChefHat,
  Clock,
  Users,
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Flame,
  Scale,
  CheckCircle,
  Timer,
  Utensils,
  AlertCircle,
  Lightbulb,
  Target,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getRecipeById } from "@/lib/recipes-data"
import { translateRecipe } from "@/lib/auto-translate"
import { useLanguage } from "@/context/languageContext"
import type { TranslationKey } from "@/lib/translations"

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [servings, setServings] = useState(2)

  const { t, language } = useLanguage()
  const baseRecipe = getRecipeById(Number(params.id))
  const [recipe, setRecipe] = useState(baseRecipe)

  useEffect(() => {
    if (!baseRecipe) return
    async function load() {
      if (language === "pt") {
        setRecipe(baseRecipe)
      } else if ((baseRecipe as any).translations?.[language]) {
        setRecipe(getRecipeById(Number(params.id), language)!)
      } else {
        const tr = await translateRecipe(baseRecipe, language)
        setRecipe(tr)
      }
    }
    load()
  }, [language, params.id, baseRecipe])

  if (!baseRecipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">{t("recipeNotFound")}</h2>
          <Button onClick={() => router.push("/recipes")} className="bg-[#F24E29]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("goBack")}
          </Button>
        </div>
      </div>
    )
  }

  const toggleStepComplete = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter((i) => i !== stepIndex))
    } else {
      setCompletedSteps([...completedSteps, stepIndex])
    }
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast({
      title: t(isFavorite ? "removedFromFavorites" : "addedToFavorites"),
      description: isFavorite ? "Receita removida da sua lista" : "Receita salva na sua lista de favoritos",
    })
  }

  const shareRecipe = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: t("linkCopied"),
        description: "Link da receita copiado para a área de transferência",
      })
    }
  }

  const adjustedNutrition = {
    ...recipe.nutrition.perServing,
    calories: Math.round((recipe.nutrition.perServing.calories * servings) / recipe.servings),
    protein: Math.round((recipe.nutrition.perServing.protein * servings) / recipe.servings),
    carbs: Math.round((recipe.nutrition.perServing.carbs * servings) / recipe.servings),
    fat: Math.round((recipe.nutrition.perServing.fat * servings) / recipe.servings),
  }

  // Calculate macro distribution if it doesn't exist on the recipe
  const macroPercentages =
    recipe.nutrition.macroPercentages ??
    (() => {
      const { protein, carbs, fat } = recipe.nutrition.perServing
      const totalMacros = protein + carbs + fat || 1
      return {
        protein: Math.round((protein / totalMacros) * 100),
        carbs: Math.round((carbs / totalMacros) * 100),
        fat: Math.round((fat / totalMacros) * 100),
      }
    })()

  // Criar instruções detalhadas baseadas no título da receita
  const createDetailedInstructions = (title: string) => {
    const baseInstructions = [
      {
        step: 1,
        titleKey: "prepareIngredients" as TranslationKey,
        descriptionKey: "prepareIngredientsDesc" as TranslationKey,
        tipKey: "prepareIngredientsTip" as TranslationKey,
        time: 5,
      },
      {
        step: 2,
        titleKey: "startPreparation" as TranslationKey,
        descriptionKey: "startPreparationDesc" as TranslationKey,
        tipKey: "startPreparationTip" as TranslationKey,
        time: 3,
      },
      {
        step: 3,
        titleKey: "combineIngredients" as TranslationKey,
        descriptionKey: "combineIngredientsDesc" as TranslationKey,
        tipKey: "combineIngredientsTip" as TranslationKey,
        time: 5,
      },
      {
        step: 4,
        titleKey: "finalizePreparation" as TranslationKey,
        descriptionKey: "finalizePreparationDesc" as TranslationKey,
        tipKey: "finalizePreparationTip" as TranslationKey,
        time: 7,
      },
      {
        step: 5,
        titleKey: "presentAndServe" as TranslationKey,
        descriptionKey: "presentAndServeDesc" as TranslationKey,
        tipKey: "presentAndServeTip" as TranslationKey,
        time: 2,
      },
    ]

    return baseInstructions
  }

  const detailedInstructions = createDetailedInstructions(recipe.title)

  // Criar dicas baseadas no tipo de receita
  const createTips = (title: string, tags: string[]) => {
    const baseTips = [
      "recipeTipPrepBefore" as TranslationKey,
      "recipeTipTemp" as TranslationKey,
      "recipeTipSeason" as TranslationKey,
      "recipeTipServeHot" as TranslationKey,
    ]
    return baseTips
  }

  const tips = createTips(recipe.title, recipe.tags)

  // Criar variações baseadas no tipo de receita
  const createVariations = (title: string) => {
    const baseVariations = [
      {
        nameKey: "variationLightName" as TranslationKey,
        changesKey: "variationLightDesc" as TranslationKey,
      },
      {
        nameKey: "variationVeganName" as TranslationKey,
        changesKey: "variationVeganDesc" as TranslationKey,
      },
      {
        nameKey: "variationGlutenFreeName" as TranslationKey,
        changesKey: "variationGlutenFreeDesc" as TranslationKey,
      },
    ]
    return baseVariations
  }

  const variations = createVariations(recipe.title)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => router.push("/recipes")} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#F24E29]">{recipe.title}</h1>
              <p className="text-gray-600 mt-1">{recipe.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={toggleFavorite}>
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={shareRecipe}>
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Recipe Image and Quick Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="aspect-video bg-gradient-to-br from-[#F2AEE7] to-[#F2C12E] rounded-lg flex items-center justify-center mb-4">
                <ChefHat className="w-16 h-16 text-white" />
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t("ratingLabel")}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{recipe.rating}</span>
                      <span className="text-sm text-gray-500">({recipe.reviews})</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#F24E29]" />
                      <div>
                        <div className="font-medium">{recipe.totalTime}min</div>
                        <div className="text-gray-500">{t("totalTime")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#F24E29]" />
                      <div>
                        <div className="font-medium">{recipe.servings} porções</div>
                        <div className="text-gray-500">{t("yields")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#F24E29]" />
                      <div>
                        <div className="font-medium">{recipe.calories} cal</div>
                        <div className="text-gray-500">{t("perServing")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#F24E29]" />
                      <div>
                        <div className="font-medium">{recipe.difficulty}</div>
                        <div className="text-gray-500">{t("difficulty")}</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="ingredients" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ingredients">{t("ingredients")}</TabsTrigger>
              <TabsTrigger value="instructions">{t("preparationMethod")}</TabsTrigger>
              <TabsTrigger value="nutrition">{t("nutrition")}</TabsTrigger>
              <TabsTrigger value="tips">Dicas</TabsTrigger>
            </TabsList>

            <TabsContent value="ingredients" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <Utensils className="w-5 h-5" />
                      {t("ingredients")}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{t("adjustServings")}:</span>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => setServings(Math.max(1, servings - 1))}>
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">{servings}</span>
                        <Button variant="outline" size="sm" onClick={() => setServings(servings + 1)}>
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#F2EAE4] rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{ingredient.item}</div>
                          <div className="text-sm text-gray-600">{ingredient.amount}</div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.round((ingredient.calories * servings) / recipe.servings)} cal
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-[#F2AEE7] to-[#F2C12E] rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t("totalCalories")}:</span>
                      <span className="text-xl font-bold">
                        {Math.round(
                          (recipe.ingredients.reduce((sum, ing) => sum + ing.calories, 0) * servings) / recipe.servings,
                        )}{" "}
                        cal
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#F24E29] flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    {t("preparationMethod")}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {t("prepTime")}: {recipe.prepTime}min
                    </div>
                    {recipe.cookTime > 0 && (
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        {t("cookTime")}: {recipe.cookTime}min
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {detailedInstructions.map((instruction, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => toggleStepComplete(index)}
                            className="w-8 h-8 rounded-full border-2 border-[#F24E29] flex items-center justify-center transition-colors"
                            style={{
                              backgroundColor: completedSteps.includes(index) ? "#F24E29" : "transparent",
                              color: completedSteps.includes(index) ? "white" : "#F24E29",
                            }}
                          >
                            {completedSteps.includes(index) ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <span className="font-bold">{instruction.step}</span>
                            )}
                          </button>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-[#F24E29]">{t(instruction.titleKey)}</h4>
                            <Badge variant="outline" className="text-xs">
                              {instruction.time}min
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-2">{t(instruction.descriptionKey)}</p>
                          {instruction.tipKey && (
                            <div className="flex items-start gap-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                              <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-yellow-800">{t(instruction.tipKey)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">{t("progressLabel")}</span>
                    </div>
                    <Progress
                      value={(completedSteps.length / detailedInstructions.length) * 100}
                      className="h-2 mb-2"
                    />
                    <p className="text-sm text-green-700">
                      {t("stepsCompleted", {
                        completedCount: completedSteps.length,
                        totalCount: detailedInstructions.length,
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nutrition" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <Scale className="w-5 h-5" />
                      {t("nutritionalInformation")}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{t("perServing", { count: servings })}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-[#F2AEE7] to-[#F2C12E] rounded-lg text-white">
                          <div className="text-2xl font-bold">{adjustedNutrition.calories}</div>
                          <div className="text-sm opacity-90">Calorias</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Proteína</span>
                            <span className="font-medium">{adjustedNutrition.protein}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Carboidratos</span>
                            <span className="font-medium">{adjustedNutrition.carbs}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Gorduras</span>
                            <span className="font-medium">{adjustedNutrition.fat}g</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h4 className="font-medium text-[#F24E29]">Detalhes Nutricionais</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span>Fibras</span>
                            <span>
                              {recipe.nutrition.perServing.fiber == null
                                ? "-"
                                : `${Math.round((recipe.nutrition.perServing.fiber * servings) / recipe.servings)}g`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Açúcares</span>
                            <span>
                              {recipe.nutrition.perServing.sugar == null
                                ? "-"
                                : `${Math.round((recipe.nutrition.perServing.sugar * servings) / recipe.servings)}g`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sódio</span>
                            <span>
                              {recipe.nutrition.perServing.sodium == null
                                ? "-"
                                : `${Math.round((recipe.nutrition.perServing.sodium * servings) / recipe.servings)}mg`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Colesterol</span>
                            <span>
                              {recipe.nutrition.perServing.cholesterol == null
                                ? "-"
                                : `${Math.round((recipe.nutrition.perServing.cholesterol * servings) / recipe.servings)}mg`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29]">{t("macroDistribution")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Proteína</span>
                          <span className="text-sm font-medium">{macroPercentages.protein}%</span>
                        </div>
                        <Progress value={macroPercentages.protein} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Carboidratos</span>
                          <span className="text-sm font-medium">{macroPercentages.carbs}%</span>
                        </div>
                        <Progress value={macroPercentages.carbs} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Gorduras</span>
                          <span className="text-sm font-medium">{macroPercentages.fat}%</span>
                        </div>
                        <Progress value={macroPercentages.fat} className="h-2" />
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-[#F2EAE4] rounded-lg">
                      <h4 className="font-medium text-[#F24E29] mb-2">{t("nutritionalBenefits")}</h4>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-[#F24E29] rounded-full mt-2 flex-shrink-0"></div>
                          <span>{t("benefitCompleteProtein")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-[#F24E29] rounded-full mt-2 flex-shrink-0"></div>
                          <span>{t("benefitOmega3")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-[#F24E29] rounded-full mt-2 flex-shrink-0"></div>
                          <span>{t("benefitAntioxidants")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-[#F24E29] rounded-full mt-2 flex-shrink-0"></div>
                          <span>{t("benefitLowGlycemicCarbs")}</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      {t("chefTips")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tips.map((tip, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded"
                        >
                          <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-yellow-800">{t(tip)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <ChefHat className="w-5 h-5" />
                      {t("variations")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {variations.map((variation, index) => (
                        <div key={index} className="p-4 border border-[#F2AEE7] rounded-lg">
                          <h4 className="font-medium text-[#F24E29] mb-2">{t(variation.nameKey)}</h4>
                          <p className="text-sm text-gray-700">{t(variation.changesKey)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[#F24E29] flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {t("importantInformation")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">{t("storage")}</h4>
                      <p className="text-sm text-blue-700">{t("storageInfo")}</p>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">{t("intermittentFastingConsideration")}</h4>
                      <p className="text-sm text-green-700">
                        Esta receita pode ser uma ótima opção para sua janela de alimentação. Lembre-se de ajustar as
                        porções às suas necessidades calóricas e nutricionais. Consulte um profissional de saúde para
                        orientações personalizadas sobre jejum intermitente.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
