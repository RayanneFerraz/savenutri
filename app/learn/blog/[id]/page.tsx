"use client"


import { useLanguage } from "@/context/languageContext"
import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { blogPosts, getBlogPostById, type BlogPost } from "@/lib/blog-data"
import { translateBlogPost } from "@/lib/auto-translate"
import Link from "next/link"
import { notFound } from "next/navigation"

export default function ArticlePage({ params }: { params: { id: string } }) {
  const { t, language } = useLanguage()
  const basePost: BlogPost | undefined = blogPosts.find((p) => p.id === Number(params.id))
  const [post, setPost] = useState<BlogPost | undefined>(getBlogPostById(Number(params.id), language))

  if (!basePost) {
    notFound()
  }

  useEffect(() => {
    if (!basePost) return
    async function load() {
      if (language === "pt") {
        setPost(basePost)
      } else if (basePost.translations?.[language]) {
        setPost(getBlogPostById(Number(params.id), language)!)
      } else {
        const tr = await translateBlogPost(basePost, language)
        setPost(tr as BlogPost)
      }
    }
    load()
  }, [language, params.id, basePost])

  const renderContent = (text: string) => (
    <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">{text}</p>
  )

  return (
    <main className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/learn" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t("backToArticles")}
        </Link>
        {post && (
          <article>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{post.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{post.description}</p>
            <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-auto rounded-lg mb-6" />
            {renderContent(post.content)}
          </article>
        )}
      </div>
    </main>
  )
}
