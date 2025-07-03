"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Clock,
  User,
  Share2,
  Bookmark,
  Star,
  BookOpen,
  Lightbulb,
  CheckCircle,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useLanguage } from "@/context/languageContext"
import articlesData, { type Article, type ContentSection } from "@/lib/articles-data"
import { translateArticle } from "@/lib/auto-translate"

// Function to find related articles with improved logic
function findRelatedArticles(currentArticle: Article, allArticles: Article[], limit = 2): Article[] {
  const related: { article: Article; score: number }[] = []

  Object.values(allArticles).forEach((article) => {
    if (article.id === currentArticle.id) return

    let score = 0

    // Same category gets highest score
    if (article.category === currentArticle.category) {
      score += 10
    }

    // Shared tags increase score
    const sharedTags = article.tags.filter((tag) =>
      currentArticle.tags.some(
        (currentTag) =>
          currentTag.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(currentTag.toLowerCase()),
      ),
    )
    score += sharedTags.length * 3

    // Similar keywords in title/description
    const currentWords = (currentArticle.title + " " + currentArticle.description).toLowerCase().split(" ")
    const articleWords = (article.title + " " + article.description).toLowerCase().split(" ")
    const commonWords = currentWords.filter((word) => word.length > 3 && articleWords.includes(word))
    score += commonWords.length * 2

    // Similar reading time (closer = better)
    const currentTime = Number.parseInt(currentArticle.readTime) || 0
    const articleTime = Number.parseInt(article.readTime) || 0
    const timeDiff = Math.abs(currentTime - articleTime)
    if (timeDiff <= 2) score += 2
    else if (timeDiff <= 5) score += 1

    // Higher rated articles get slight boost
    if (article.rating >= 4.8) score += 1

    if (score > 0) {
      related.push({ article, score })
    }
  })

  // Sort by score and return top articles
  return related
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.article)
}

export default function ArticleDetailPage({ params }: { params: { id: string } }) {
  const { t, language } = useLanguage()
  const original: Article | undefined = articlesData[params.id]
  const [article, setArticle] = useState<Article | undefined>(original)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const router = useRouter()
  const [isBookmarked, setIsBookmarked] = useState(false)

  if (!article) {
    notFound()
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      let bookmarks: number[] = []
      const storedBookmarks = localStorage.getItem("bookmarkedArticles")

      if (storedBookmarks && storedBookmarks !== "undefined") {
        try {
          bookmarks = JSON.parse(storedBookmarks)
        } catch (error) {
          console.error("Erro ao fazer parse de bookmarks:", error)
          bookmarks = []
        }
      }

      setIsBookmarked(bookmarks.includes(Number(params.id)))
    }
  }, [params.id])

  // translate article when language changes
  useEffect(() => {
    let active = true
    async function run() {
      if (!original) return

      if (language === "pt") {
        setArticle(original)
        // Find related articles for original
        const related = findRelatedArticles(original, Object.values(articlesData), 3)
        setRelatedArticles(related)
      } else {
        const translated = await translateArticle(original, language)
        if (active) {
          setArticle(translated)
          // Find related articles and translate them too
          const related = findRelatedArticles(original, Object.values(articlesData), 3)
          const translatedRelated = await Promise.all(
            related.map((relatedArticle) => translateArticle(relatedArticle, language)),
          )
          if (active) {
            setRelatedArticles(translatedRelated)
          }
        }
      }
    }
    run()
    return () => {
      active = false
    }
  }, [language, original])

  const toggleBookmark = () => {
    if (typeof window !== "undefined") {
      let bookmarks: number[] = []
      const storedBookmarks = localStorage.getItem("bookmarkedArticles")

      if (storedBookmarks && storedBookmarks !== "undefined") {
        try {
          bookmarks = JSON.parse(storedBookmarks)
        } catch (error) {
          console.error("Erro ao fazer parse de bookmarks:", error)
          bookmarks = []
        }
      }

      let updated = [...bookmarks]

      if (isBookmarked) {
        updated = updated.filter((articleId) => articleId !== Number(params.id))
        toast.success(t("removedFromBookmarks"))
      } else {
        updated.push(Number(params.id))
        toast.success(t("articleBookmarked"))
      }

      localStorage.setItem("bookmarkedArticles", JSON.stringify(updated))
      setIsBookmarked(!isBookmarked)
    }
  }

  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success(t("linkCopiedToClipboard"))
    }
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
              {section.items?.map((tip, tipIndex) => (
                <li key={tipIndex}>{tip}</li>
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
    <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => router.push("/learn")} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-[#F2AEE7] text-[#F24E29]">{article.category}</Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {article.readTime}
                </div>
                <div className="flex items-center gap-1 text-sm text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  {article.rating} ({article.reviews} {t("reviewsSuffix")})
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#F24E29] mb-2">{article.title}</h1>
              <p className="text-gray-600">{article.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={toggleBookmark}>
                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-[#F24E29] text-[#F24E29]" : ""}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={shareArticle}>
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/learn" className="hover:text-[#F24E29] transition-colors">
              {t("learn")}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#F24E29]">{article.title}</span>
          </div>

          {/* Article Meta */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F2AEE7] to-[#F2C12E] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-[#F24E29]">{article.author}</div>
                    <div className="text-sm text-gray-500">{article.publishDate}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {article.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Article Image */}
          <div className="aspect-video bg-gradient-to-br from-[#F2AEE7] to-[#F2C12E] rounded-lg flex items-center justify-center mb-8">
            <BookOpen className="w-16 h-16 text-white" />
          </div>

          {/* Article Content */}
          <Card>
            <CardContent className="p-6 space-y-8">{article.content.map(renderContentSection)}</CardContent>
          </Card>

          {/* Article Footer */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#F24E29] mb-2">{t("likedThisArticle")}</h3>
                  <p className="text-sm text-gray-600">{t("shareWithFriends")}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={shareArticle}>
                    <Share2 className="w-4 h-4 mr-2" />
                    {t("share")}
                  </Button>
                  <Button onClick={toggleBookmark} className="bg-[#F24E29]">
                    <Bookmark className="w-4 h-4 mr-2" />
                    {t(isBookmarked ? "bookmarked" : "bookmark")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-[#F24E29]">{t("relatedArticles")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedArticles.map((relatedArticle) => (
                    <Card
                      key={relatedArticle.id}
                      className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                    >
                      <div className="aspect-video bg-gradient-to-br from-[#F2AEE7] to-[#F2C12E] flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white" />
                      </div>
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-[#F2AEE7] text-[#F24E29] text-xs">{relatedArticle.category}</Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {relatedArticle.readTime}
                          </div>
                        </div>
                        <CardTitle className="text-md font-semibold h-12 overflow-hidden group-hover:text-[#F27D16] transition-colors">
                          {relatedArticle.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{relatedArticle.description}</p>
                        <Link href={`/learn/${relatedArticle.id}`} className="block">
                          <Button className="w-full bg-[#F24E29] hover:bg-[#F27D16] text-white">{t("readMore")}</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
