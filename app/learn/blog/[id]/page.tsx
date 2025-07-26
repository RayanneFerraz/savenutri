"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/context/languageContext"
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Star,
  User,
  Calendar,
  Tag,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
} from "lucide-react"
import articlesData, { type Article, type ContentSection } from "@/lib/articles-data"
import Link from "next/link"
import { notFound } from "next/navigation"

export default function ArticlePage({ params }: { params: { id: string } }) {
  const { t } = useLanguage()
  const article: Article | undefined = articlesData[params.id]

  if (!article) {
    notFound()
  }

  const renderContentSection = (section: ContentSection, index: number) => {
    switch (section.type) {
      case "intro":
        return (
          <section key={index} className="mb-8 p-6 bg-blue-50 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-blue-700 mb-3">{section.title}</h2>
            <p className="text-gray-700 leading-relaxed">{section.content}</p>
          </section>
        )
      case "section":
        return (
          <section key={index} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
              {section.title}
            </h2>
            {section.content && <p className="text-gray-700 leading-relaxed mb-4">{section.content}</p>}
            {section.subsections &&
              section.subsections.map((subsection, subIndex) => (
                <div key={subIndex} className="mb-4 ml-4 p-4 border-l-4 border-blue-500 bg-gray-50 rounded">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">{subsection.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{subsection.content}</p>
                </div>
              ))}
          </section>
        )
      case "benefits":
        return (
          <section key={index} className="mb-8 p-6 bg-green-50 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-green-700 mb-3 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2" />
              {section.title}
            </h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {section.items?.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          </section>
        )
      case "tips":
        return (
          <section key={index} className="mb-8 p-6 bg-yellow-50 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-yellow-700 mb-3 flex items-center">
              <Lightbulb className="w-6 h-6 mr-2" />
              {section.title}
            </h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {section.items?.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          </section>
        )
      case "warning":
        return (
          <section key={index} className="mb-8 p-6 bg-red-50 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-red-700 mb-3 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2" />
              {section.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">{section.content}</p>
          </section>
        )
      default:
        return null
    }
  }

  return (
    <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/learn" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t("backToArticles")}
        </Link>

        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{article.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{article.description}</p>
            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-2">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" /> {article.author}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" /> {article.publishDate}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" /> {article.readTime}
              </span>
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" /> {article.category}
              </span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Star className="w-4 h-4 mr-1 text-yellow-400" /> {article.rating} ({article.reviews} {t("reviews")})
            </div>
            <div className="mt-3">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2"
                >
                  <Tag className="w-3 h-3 mr-1 inline-block" />
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <img
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            className="w-full h-auto max-h-96 object-cover rounded-lg shadow-lg mb-8"
          />

          {article.content.map(renderContentSection)}
        </article>

        <section className="mt-12 py-8 border-t border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">{t("relatedArticles")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(articlesData)
              .filter((a) => a.id !== article.id && a.category === article.category)
              .slice(0, 2)
              .map((relatedArticle) => (
                <Card
                  key={relatedArticle.id}
                  className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <img
                    src={relatedArticle.image || "/placeholder.svg"}
                    alt={relatedArticle.title}
                    className="w-full h-40 object-cover"
                  />
                  <CardHeader className="p-4">
                    <CardTitle className="text-md font-semibold h-12 overflow-hidden">{relatedArticle.title}</CardTitle>
                  </CardHeader>
                  <CardContent
                    className="p-4"
                    href={`/learn/blog/${relatedArticle.id}`}
                    linkText={t("readMore")}
                  />
                </Card>
              ))}
          </div>
        </section>

        <section className="mt-12 py-8 border-t border-gray-200">
          <Card className="bg-gray-50 p-6 rounded-lg shadow">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">{t("shareArticle")}</CardTitle>
            </CardHeader>
            <CardContent className="flex space-x-3">
              <Button variant="outline">{t("shareFacebook")}</Button>
              <Button variant="outline">{t("shareTwitter")}</Button>
              <Button variant="outline">{t("shareLinkedIn")}</Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
