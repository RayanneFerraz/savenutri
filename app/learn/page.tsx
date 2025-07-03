"use client"

import { useTranslations } from "next-intl"
import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { articles } from "@/data/articles"

export const metadata: Metadata = {
  title: "Learn",
  description: "Learn about our products and services.",
}

export default function LearnPage() {
  const t = useTranslations("Learn")

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <p className="text-gray-700 mb-8">{t("description")}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <CardTitle>{article.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4" href={`/learn/${article.id}`} linkText={t("readMore")}>
              <p className="text-sm text-gray-600 mb-4">{article.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
