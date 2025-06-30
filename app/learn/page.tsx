"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Lightbulb,
  Heart,
  Clock,
  Users,
  Star,
  TrendingUp,
  Award,
  ChevronRight,
  MessageCircle,
  ThumbsUp,
  Coffee,
  Smile,
  Target,
} from "lucide-react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import Link from "next/link"
import { useLanguage } from "@/context/languageContext"
import type { TranslationKey } from "@/lib/translations"
import articlesData from "@/lib/articles-data"
import { useContentTranslation } from "@/hooks/useContentTranslation"
import blogCategories from "@/lib/blog-categories"

export default function LearnPage() {
  const { t, language } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [activeTab, setActiveTab] = useState("artigos")
  const { translateContent } = useContentTranslation()

  const articles = useMemo(
    () =>
      Object.values(articlesData).map((article) => ({
        ...article,
        title: article.title[language as keyof typeof article.title] || article.title.en,
        description: article.description[language as keyof typeof article.description] || article.description.en,
        excerpt: article.description[language as keyof typeof article.description] || article.description.en,
        category: translateContent(article.category),
        views: article.reviews * 17,
        author: {
          name: article.author,
          avatar: article.author
            .split(" ")
            .map((n) => n[0])
            .join(""),
          bio: "Especialista em Jejum Intermitente",
        },
        featured: false,
        trending: false,
        type: "article",
      })),
    [language, translateContent],
  )

  const categories = useMemo(() => {
    const categoryColors: { [key: string]: string } = {
      [translateContent("Ciência")]: "bg-blue-100 text-blue-800",
      [translateContent("Fundamentos")]: "bg-gray-100 text-gray-800",
      [translateContent("Benefícios")]: "bg-green-100 text-green-800",
      [translateContent("Mitos")]: "bg-red-100 text-red-800",
      [translateContent("Preparação")]: "bg-yellow-100 text-yellow-800",
      [translateContent("Protocolos")]: "bg-indigo-100 text-indigo-800",
      [translateContent("Alimentação")]: "bg-orange-100 text-orange-800",
      [translateContent("Desafios")]: "bg-purple-100 text-purple-800",
      [translateContent("Potencializadores")]: "bg-pink-100 text-pink-800",
      [translateContent("Estilo de Vida")]: "bg-teal-100 text-teal-800",
      [translateContent("Monitoramento")]: "bg-cyan-100 text-cyan-800",
      default: "bg-gray-100 text-gray-800",
    }

    const categoryCounts = articles.reduce(
      (acc, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1
        return acc
      },
      {} as { [key: string]: number },
    )

    return [
      { name: "all", count: articles.length, color: "bg-gray-100 text-gray-800" },
      ...Object.keys(categoryCounts).map((category) => ({
        name: category,
        count: categoryCounts[category],
        color: categoryColors[category] || categoryColors.default,
      })),
    ]
  }, [articles, translateContent])

  const blogPosts = [
    {
      id: 101,
      title: "Minha Jornada de 90 Dias com Jejum 16:8",
      description: "Como o jejum intermitente transformou minha vida e rotina diária",
      excerpt:
        "Há 3 meses decidi experimentar o jejum 16:8 e os resultados me surpreenderam! Aqui conto tudo sobre minha experiência, os desafios e as conquistas.",
      category: "experiences" as TranslationKey,
      readTime: "5 min",
      views: 1850,
      likes: 124,
      comments: 23,
      publishDate: "2025-06-18",
      author: {
        name: "Marina Santos",
        avatar: "MS",
        bio: "Praticante de jejum intermitente há 2 anos",
        isVerified: false,
      },
      image: "/placeholder.svg?height=200&width=300",
      tags: ["Experiência Pessoal", "16:8", "Transformação"],
      featured: false,
      trending: true,
      type: "blog",
    },
  ]

  const currentCategories = activeTab === "artigos" ? categories : blogCategories
  const currentContent = activeTab === "artigos" ? articles : blogPosts

  const filteredContent = useMemo(() => {
    const filtered = currentContent.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      return matchesCategory && matchesSearch
    })

    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => (b as any).views - (a as any).views)
        break
      case "rating":
        if (activeTab === "artigos") {
          filtered.sort((a, b) => (b as any).rating - (a as any).rating)
        } else {
          filtered.sort((a, b) => (b as any).likes - (a as any).likes)
        }
        break
      case "recent":
      default:
        filtered.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
        break
    }

    return filtered
  }, [selectedCategory, searchQuery, sortBy, activeTab, currentContent])

  const featuredContent = currentContent.filter((item) => (item as any).featured)
  const trendingContent = currentContent.filter((item) => (item as any).trending)

  const benefits = [
    {
      titleKey: "benefitCardioTitle" as TranslationKey,
      descriptionKey: "benefitCardioDesc" as TranslationKey,
      icon: <Heart className="w-6 h-6" />,
    },
    {
      titleKey: "benefitBrainTitle" as TranslationKey,
      descriptionKey: "benefitBrainDesc" as TranslationKey,
      icon: <Lightbulb className="w-6 h-6" />,
    },
    {
      titleKey: "benefitEnergyTitle" as TranslationKey,
      descriptionKey: "benefitEnergyDesc" as TranslationKey,
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      titleKey: "benefitImmuneTitle" as TranslationKey,
      descriptionKey: "benefitImmuneDesc" as TranslationKey,
      icon: <Users className="w-6 h-6" />,
    },
  ]

  const fastingStages = [
    {
      time: "0-4h",
      titleKey: "stageDigestionTitle" as TranslationKey,
      descriptionKey: "stageDigestionDesc" as TranslationKey,
      color: "from-[#F2AEE7] to-[#F2C12E]",
    },
    {
      time: "4-8h",
      titleKey: "stageTransitionTitle" as TranslationKey,
      descriptionKey: "stageTransitionDesc" as TranslationKey,
      color: "from-[#F2C12E] to-[#F27D16]",
    },
    {
      time: "8-12h",
      titleKey: "stageFatBurningTitle" as TranslationKey,
      descriptionKey: "stageFatBurningDesc" as TranslationKey,
      color: "from-[#F27D16] to-[#F24E29]",
    },
    {
      time: "12-16h",
      titleKey: "stageKetosisTitle" as TranslationKey,
      descriptionKey: "stageKetosisDesc" as TranslationKey,
      color: "from-[#F24E29] to-purple-600",
    },
    {
      time: "16h+",
      titleKey: "stageAutophagyTitle" as TranslationKey,
      descriptionKey: "stageAutophagyDesc" as TranslationKey,
      color: "from-purple-600 to-indigo-600",
    },
  ]

  const faqData = [
    {
      title: "É seguro fazer jejum intermitente todos os dias?",
      answer:
        "Sim, para a maioria das pessoas saudáveis, o jejum intermitente diário é seguro quando feito corretamente. Protocolos como 16:8 são considerados seguros para uso a longo prazo. No entanto, pessoas com condições médicas, mulheres grávidas ou amamentando, e menores de 18 anos devem consultar um médico antes de começar.",
    },
  ]

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSelectedCategory("all")
    setSearchQuery("")
  }

  const faqBorderColors = ["border-l-[#F2AEE7]", "border-l-[#F2C12E]", "border-l-[#F27D16]", "border-l-[#F24E29]"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#F24E29] mb-2">{t("learnPageTitle")}</h1>
            <p className="text-gray-600 text-lg">{t("learnPageSubtitle")}</p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="artigos" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {t("scientificArticles")}
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                {t("communityBlog")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="artigos">
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-6 h-6 text-[#F24E29]" />
                  <h2 className="text-2xl font-bold text-[#F24E29]">{t("featuredArticles")}</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {articles.slice(0, 2).map((article: any) => (
                    <Card key={article.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                      <div className="aspect-video bg-gradient-to-br from-[#F2AEE7] to-[#F2C12E] flex items-center justify-center relative">
                        <BookOpen className="w-16 h-16 text-white" />
                        {article.trending && (
                          <Badge className="absolute top-4 right-4 bg-red-500 text-white">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {t("trending")}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={categories.find((c) => c.name === article.category)?.color}>
                            {article.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            {article.readTime}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-yellow-500">
                            <Star className="w-3 h-3 fill-current" />
                            {article.rating} ({article.reviews} {t("reviewsSuffix")})
                          </div>
                        </div>
                        <h3 className="font-semibold text-[#F24E29] mb-2 line-clamp-2 group-hover:text-[#F27D16] transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{article.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-[#F24E29] rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {article.author.avatar}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{article.author.name}</div>
                              <div className="text-xs text-gray-500">
                                {article.publishDate && !isNaN(new Date(article.publishDate).getTime())
                                  ? new Date(article.publishDate).toLocaleDateString("pt-BR")
                                  : ""}
                              </div>
                            </div>
                          </div>
                          <Link href={`/learn/${article.id}`}>
                            <Button className="bg-[#F24E29] hover:bg-[#F27D16]">
                              {t("readArticle")}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="mb-12">
                <CardHeader className="bg-gradient-to-r from-[#F2AEE7] to-[#F2C12E] text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-6 h-6" />
                    {t("mainBenefitsOfIF")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#F2AEE7] to-[#F2C12E] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                          {benefit.icon}
                        </div>
                        <h3 className="font-semibold text-[#F24E29] mb-2">{t(benefit.titleKey)}</h3>
                        <p className="text-sm text-gray-600">{t(benefit.descriptionKey)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-12">
                <CardHeader className="bg-gradient-to-r from-[#F27D16] to-[#F24E29] text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-6 h-6" />
                    {t("fastingStagesTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {fastingStages.map((stage, index) => (
                      <div key={index} className={`bg-gradient-to-r ${stage.color} p-4 rounded-lg text-white`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-lg">{stage.time}</div>
                            <div className="font-semibold">{t(stage.titleKey)}</div>
                            <div className="text-sm opacity-90">{t(stage.descriptionKey)}</div>
                          </div>
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="blog">
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Smile className="w-6 h-6 text-[#F24E29]" />
                  <h2 className="text-2xl font-bold text-[#F24E29]">{t("featuredPosts")}</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {blogPosts.slice(0, 2).map((post: any) => (
                    <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                      <div className="aspect-video bg-gradient-to-br from-[#F2C12E] to-[#F27D16] flex items-center justify-center relative">
                        <Coffee className="w-16 h-16 text-white" />
                        {post.trending && (
                          <Badge className="absolute top-4 right-4 bg-red-500 text-white">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {t("trending")}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={blogCategories.find((c) => c.nameKey === post.category)?.color}>
                            {t(post.category)}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-red-500">
                            <ThumbsUp className="w-3 h-3" />
                            {post.likes}
                          </div>
                        </div>
                        <h3 className="font-semibold text-[#F24E29] mb-2 line-clamp-2 group-hover:text-[#F27D16] transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-[#F27D16] rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {post.author.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-900">{post.author.name}</span>
                                {post.author.isVerified && (
                                  <Badge variant="secondary" className="text-xs px-1">
                                    ✓
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {post.publishDate && !isNaN(new Date(post.publishDate).getTime())
                                  ? new Date(post.publishDate).toLocaleDateString("pt-BR")
                                  : ""}
                              </div>
                            </div>
                          </div>
                          <Link href={`/learn/blog/${post.id}`}>
                            <Button className="bg-[#F27D16] hover:bg-[#F24E29]">
                              {t("readPost")}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="text-center p-6">
                  <div className="w-12 h-12 bg-[#F2AEE7] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-[#F24E29]" />
                  </div>
                  <div className="text-2xl font-bold text-[#F24E29]">1.2k+</div>
                  <div className="text-sm text-gray-600">{t("activeMembers")}</div>
                </Card>
                <Card className="text-center p-6">
                  <div className="w-12 h-12 bg-[#F2C12E] rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-[#F24E29]" />
                  </div>
                  <div className="text-2xl font-bold text-[#F24E29]">350+</div>
                  <div className="text-sm text-gray-600">{t("postsPublished")}</div>
                </Card>
                <Card className="text-center p-6">
                  <div className="w-12 h-12 bg-[#F27D16] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-[#F24E29]">89%</div>
                  <div className="text-sm text-gray-600">{t("successRateLabel")}</div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <Card className="mt-8">
            <CardHeader className="bg-gradient-to-r from-[#F2C12E] to-[#F27D16] text-white">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                {t("faq")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Accordion type="single" collapsible className="w-full space-y-3 md:col-span-2">
                  {faqData.map((faqItem, index) => (
                    <AccordionItem
                      value={`faq-${index}`}
                      key={index}
                      className={`mb-2 rounded-md border border-l-4 ${
                        faqBorderColors[index % faqBorderColors.length]
                      } border-t-transparent border-r-transparent border-b-transparent focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2 rounded-t-md`}
                    >
                      <AccordionTrigger className="px-4 py-3 text-left hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-md">
                        <h4 className="font-semibold text-[#F24E29] text-base flex-1 text-left mr-2">
                          {faqItem.title}
                        </h4>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3 pt-0">
                        <p className="text-sm text-gray-600">{faqItem.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
