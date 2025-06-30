"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/context/languageContext"
import { recipesDatabase } from "@/lib/recipes-data"
import { Search } from "lucide-react"
import Link from "next/link"

export default function RecipesPage() {
  const { t, language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const recipes = useMemo(() => {
    return recipesDatabase.map((recipe) => {
      // -------- translate simple fields --------
      const localizedTitle = recipe.title[language] ?? recipe.title.en
      const localizedDescription = recipe.description[language] ?? recipe.description.en

      // -------- normalize / translate ingredients --------
      type LegacyIngredient = {
        item:
          | string
          | {
              en: string
              pt: string
              es: string
              fr: string
            }
        amount?: string
        calories?: number
      }

      let translatedIngredients: LegacyIngredient[] = []

      if (Array.isArray(recipe.ingredients)) {
        // Old/full format ➜ translate each item
        translatedIngredients = recipe.ingredients.map((ing: LegacyIngredient) => ({
          ...ing,
          item: typeof ing.item === "object" ? (ing.item[language] ?? ing.item.en) : ing.item,
        }))
      } else if (typeof recipe.ingredients === "object" && recipe.ingredients[language]) {
        // New/simple format ➜ convert string list → legacy objects
        translatedIngredients = (recipe.ingredients[language] as string[]).map((str) => ({
          item: str,
        }))
      }

      return {
        ...recipe,
        title: localizedTitle,
        description: localizedDescription,
        ingredients: translatedIngredients,
      }
    })
  }, [language])

  const categories = useMemo(() => {
    const categoryCounts = recipes.reduce(
      (acc, recipe) => {
        acc[recipe.category] = (acc[recipe.category] || 0) + 1
        return acc
      },
      {} as { [key: string]: number },
    )

    return [
      { name: "all", count: recipes.length },
      ...Object.keys(categoryCounts).map((category) => ({
        name: category,
        count: categoryCounts[category],
      })),
    ]
  }, [recipes])

  const filteredRecipes = useMemo(() => {
    let filtered = recipes

    if (selectedCategory !== "all") {
      filtered = filtered.filter((recipe) => recipe.category === selectedCategory)
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(lowerCaseQuery) ||
          recipe.description.toLowerCase().includes(lowerCaseQuery) ||
          recipe.ingredients.some((ingredient) => ingredient.item.toLowerCase().includes(lowerCaseQuery)),
      )
    }

    return filtered
  }, [searchQuery, selectedCategory, recipes])

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">{t("recipeLibrary")}</h1>
          <p className="text-muted-foreground">{t("exploreDeliciousRecipes")}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder={t("searchRecipes")}
              className="pl-10 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ScrollArea type="horizontal" className="w-full">
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.name === "all" ? t("all") : category.name}
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredRecipes.map((recipe) => (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{recipe.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span>{recipe.prepTime + recipe.cookTime} min</span>
                    <Badge variant="secondary">{recipe.difficulty}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">{t("noRecipesFound")}</h3>
            <p className="text-gray-500 mb-4">{t("tryAdjustingFilters")}</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
              variant="outline"
            >
              {t("clearFilters")}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
