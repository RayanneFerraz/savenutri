"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, User, Share2, Bookmark, Star, BookOpen, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useLanguage } from "@/context/languageContext"
import articlesData, { type Article } from "@/lib/articles-data"
import { useContentTranslation } from "@/hooks/useContentTranslation"

export default function ArticleDetailPage({ params }: { params: { id: string } }) {
  const { t, language } = useLanguage()
  const article: Article | undefined = articlesData[params.id]
  const router = useRouter()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const { translateContent } = useContentTranslation()

  if (!article) {
    notFound()
  }

  // Get translated content
  const translatedTitle = translateContent(article.title)
  const translatedDescription = translateContent(article.description)
  const translatedContent = translateContent(article.content)

  useEffect(() => {
    if (typeof window !== "undefined") {
      let bookmarks: number[] = []
      const storedBookmarks = localStorage.getItem("bookmarkedArticles")

      if (storedBookmarks && storedBookmarks !== "undefined") {
        try {
          bookmarks = JSON.parse(storedBookmarks)
        } catch (error) {
          console.error("Error parsing bookmarks:", error)
          bookmarks = []
        }
      }

      setIsBookmarked(bookmarks.includes(Number(params.id)))
    }
  }, [params.id])

  const toggleBookmark = () => {
    if (typeof window !== "undefined") {
      let bookmarks: number[] = []
      const storedBookmarks = localStorage.getItem("bookmarkedArticles")

      if (storedBookmarks && storedBookmarks !== "undefined") {
        try {
          bookmarks = JSON.parse(storedBookmarks)
        } catch (error) {
          console.error("Error parsing bookmarks:", error)
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
        title: translatedTitle,
        text: translatedDescription,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success(t("linkCopiedToClipboard"))
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
              <h1 className="text-3xl font-bold text-[#F24E29]">{translatedTitle}</h1>
              <p className="text-gray-600">{translatedDescription}</p>
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
            <span className="text-[#F24E29]">{translatedTitle}</span>
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
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{translatedContent}</div>
              </div>
            </CardContent>
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
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-[#F24E29]">{t("relatedArticles")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(articlesData)
                  .filter((a) => a.id !== article.id && a.category === article.category)
                  .slice(0, 2)
                  .map((relatedArticle) => (
                    <Card
                      key={relatedArticle.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                      onClick={() => router.push(`/learn/${relatedArticle.id}`)}
                    >
                      <div className="aspect-video bg-gradient-to-br from-[#F2AEE7] to-[#F2C12E] flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-[#F24E29] mb-2 line-clamp-2">
                          {translateContent(relatedArticle.title)}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {translateContent(relatedArticle.description)}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {relatedArticle.category}
                          </Badge>
                          <span className="text-xs text-gray-500">{relatedArticle.readTime}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
