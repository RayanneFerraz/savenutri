"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChefHat, Users, Search, Heart, Leaf, Droplets, Eye, CakeSlice, Clock, Star, Flame } from "lucide-react"
import { recipesDatabase } from "@/lib/recipes-data"
import { useLanguage } from "@/context/languageContext"
import type { TranslationKey } from "@/lib/translations"

export default function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [favorites, setFavorites] = useState<number[]>([])
  const { t } = useLanguage()

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("recipe-favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  const categories = [
    { id: "all", nameKey: "all" as TranslationKey, icon: <ChefHat className="w-4 h-4" /> },
    { id: "Almoço/Jantar", nameKey: "lunchDinner" as TranslationKey, icon: <Users className="w-4 h-4" /> },
    { id: "Lanches", nameKey: "snacks" as TranslationKey, icon: <Heart className="w-4 h-4" /> },
    { id: "Bebidas", nameKey: "drinks" as TranslationKey, icon: <Droplets className="w-4 h-4" /> },
    { id: "Saladas", nameKey: "salads" as TranslationKey, icon: <Leaf className="w-4 h-4" /> },
    { id: "Sobremesas", nameKey: "desserts" as TranslationKey, icon: <CakeSlice className="w-4 h-4" /> },
  ]

  const filteredRecipes = recipesDatabase.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || recipe.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil":
        return "bg-green-500"
      case "Médio":
        return "bg-yellow-500"
      case "Difícil":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const toggleFavorite = (recipeId: number) => {
    const newFavorites = favorites.includes(recipeId)
      ? favorites.filter((id) => id !== recipeId)
      : [...favorites, recipeId]

    setFavorites(newFavorites)
    localStorage.setItem("recipe-favorites", JSON.stringify(newFavorites))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#F24E29] mb-2">{t("healthyRecipes")}</h1>
            <p className="text-gray-600">{t("recipesPageSubtitle")}</p>
          </div>

          {/* Search and Filter */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={t("searchRecipes")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 whitespace-nowrap ${
                        selectedCategory === category.id ? "bg-[#F24E29]" : ""
                      }`}
                    >
                      {category.icon}
                      {t(category.nameKey)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="aspect-video bg-gradient-to-br from-[#F2AEE7] to-[#F2C12E] rounded-t-lg flex items-center justify-center">
                  <ChefHat className="w-12 h-12 text-white" />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getDifficultyColor(recipe.difficulty)} text-white text-xs`}>
                        {t(recipe.difficulty.toLowerCase() as TranslationKey)}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        {recipe.rating}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => toggleFavorite(recipe.id)}
                    >
                      <Heart
                        className={`w-4 h-4 ${favorites.includes(recipe.id) ? "fill-red-500 text-red-500" : ""}`}
                      />
                    </Button>
                  </div>

                  <h3 className="font-semibold text-[#F24E29] mb-2 line-clamp-1">{recipe.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recipe.totalTime}min
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {recipe.servings} {t("servings")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {recipe.calories} {t("calories")}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {recipe.tags.slice(0, 2).map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {recipe.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{recipe.tags.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Macros */}
                  <div className="bg-[#F2EAE4] p-3 rounded-lg mb-3">
                    <div className="text-xs font-medium text-[#F24E29] mb-1">{t("macronutrients")}</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold">{recipe.nutrition.perServing.protein}g</div>
                        <div className="text-gray-600">{t("protein")}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{recipe.nutrition.perServing.carbs}g</div>
                        <div className="text-gray-600">{t("carbohydrate")}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{recipe.nutrition.perServing.fat}g</div>
                        <div className="text-gray-600">{t("fat")}</div>
                      </div>
                    </div>
                  </div>

                  <Link href={`/recipes/${recipe.id}`}>
                    <Button className="w-full bg-gradient-to-r from-[#F27D16] to-[#F24E29] hover:from-[#F27D16]/90 hover:to-[#F24E29]/90 text-white group-hover:shadow-md transition-shadow">
                      <Eye className="w-4 h-4 mr-2" />
                      {t("viewFullRecipe")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRecipes.length === 0 && (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">{t("noRecipesFound")}</h3>
              <p className="text-gray-400">Tente ajustar os filtros ou termo de busca</p>
            </div>
          )}

          {/* Tips Section */}
          <Card className="mt-8">
            <CardHeader className="bg-gradient-to-r from-[#F2AEE7] to-[#F2C12E] text-white">
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-6 h-6" />
                {t("tipsForBreakingFast")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-[#F24E29] mb-2">{t("startSlow")}</h4>
                  <p className="text-sm text-gray-600 mb-4">{t("startSlowDesc")}</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {(t("startSlowItems") as string[]).map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-[#F24E29] mb-2">{t("hydrationIsKey")}</h4>
                  <p className="text-sm text-gray-600 mb-4">{t("hydrationIsKeyDesc")}</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {(t("hydrationIsKeyItems") as string[]).map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
