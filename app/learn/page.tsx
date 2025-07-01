"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Lightbulb,
  Heart,
  Clock,
  Users,
  Star,
  Search,
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

export default function LearnPage() {
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [activeTab, setActiveTab] = useState("artigos")

  const articles = useMemo(
    () =>
      Object.values(articlesData).map((article, index) => ({
        ...article,
        id: article.id,
        excerpt: article.description,
        views: article.reviews * 17,
        author: {
          name: article.author,
          avatar: article.author
            .split(" ")
            .map((n) => n[0])
            .join(""),
          bio: "Especialista em Jejum Intermitente",
        },
        featured: index < 2,
        trending: index < 5,
        type: "article",
      })),
    [],
  )

  const categories = useMemo(() => {
    const categoryColors: { [key: string]: string } = {
      Ciência: "bg-blue-100 text-blue-800",
      Fundamentos: "bg-gray-100 text-gray-800",
      Benefícios: "bg-green-100 text-green-800",
      Mitos: "bg-red-100 text-red-800",
      Preparação: "bg-yellow-100 text-yellow-800",
      Protocolos: "bg-indigo-100 text-indigo-800",
      Alimentação: "bg-orange-100 text-orange-800",
      Desafios: "bg-purple-100 text-purple-800",
      Potencializadores: "bg-pink-100 text-pink-800",
      "Estilo de Vida": "bg-teal-100 text-teal-800",
      Monitoramento: "bg-cyan-100 text-cyan-800",
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
  }, [articles])

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
    {
      id: 102,
      title: "5 Erros que Cometi no Meu Primeiro Mês de Jejum",
      description: "Aprenda com os meus erros para ter uma jornada mais suave",
      excerpt:
        "No início, cometi alguns erros básicos que atrapalharam meus resultados. Compartilho aqui os principais para que você não passe pelo mesmo! 😅",
      category: "experiences" as TranslationKey,
      readTime: "4 min",
      views: 1420,
      likes: 89,
      comments: 31,
      publishDate: "2025-06-16",
      author: {
        name: "Carlos Mendes",
        avatar: "CM",
        bio: "Iniciante no jejum intermitente",
        isVerified: false,
      },
      image: "/placeholder.svg?height=200&width=300",
      tags: ["Erros Comuns", "Iniciante", "Dicas"],
      type: "blog",
    },
    {
      id: 103,
      title: "Receita: Smoothie Perfeito para Quebrar o Jejum",
      description: "Uma receita nutritiva e deliciosa para sua primeira refeição",
      excerpt:
        "Depois de testar várias combinações, encontrei a receita perfeita! Rico em nutrientes e super saboroso. Vou ensinar o passo a passo! 🥤",
      category: "recipes" as TranslationKey,
      readTime: "3 min",
      views: 980,
      likes: 67,
      comments: 15,
      publishDate: "2025-06-14",
      author: {
        name: "Chef Ana Paula",
        avatar: "AP",
        bio: "Culinarista especializada em alimentação saudável",
        isVerified: true,
      },
      image: "/placeholder.svg?height=200&width=300",
      tags: ["Receita", "Smoothie", "Quebra-Jejum"],
      type: "blog",
    },
    {
      id: 104,
      title: "Como Manter a Motivação nos Dias Difíceis",
      description: "Estratégias para não desistir quando a vontade de comer bater forte",
      excerpt:
        "Todos temos aqueles dias em que a fome parece insuportável. Aqui estão minhas estratégias favoritas para manter o foco! 💪",
      category: "motivation" as TranslationKey,
      readTime: "4 min",
      views: 1230,
      likes: 95,
      comments: 28,
      publishDate: "2025-06-12",
      author: {
        name: "Psicóloga Laura Dias",
        avatar: "LD",
        bio: "Especialista em mudança de hábitos",
        isVerified: true,
      },
      image: "/placeholder.svg?height=200&width=300",
      tags: ["Motivação", "Mindset", "Persistência"],
      trending: true,
      type: "blog",
    },
    {
      id: 105,
      title: "Dica Rápida: Como Lidar com a Fome Social",
      description: "O que fazer quando todos estão comendo e você está em jejum",
      excerpt:
        "Aquele momento constrangedor quando você está em jejum e todos estão comendo... Tenho algumas dicas que funcionam! 🤝",
      category: "quickTips" as TranslationKey,
      readTime: "2 min",
      views: 890,
      likes: 52,
      comments: 19,
      publishDate: "2025-06-10",
      author: {
        name: "Roberto Silva",
        avatar: "RS",
        bio: "Praticante de jejum há 3 anos",
        isVerified: false,
      },
      image: "/placeholder.svg?height=200&width=300",
      tags: ["Dica Rápida", "Social", "Estratégia"],
      type: "blog",
    },
    {
      id: 106,
      title: "Por Que Quase Desisti (E Como Não Desisti)",
      description: "Minha crise de motivação na terceira semana e como superei",
      excerpt:
        "Na terceira semana, pensei seriamente em desistir. A balança não se mexia e eu estava frustrada. Mas algo mudou... ✨",
      category: "motivation" as TranslationKey,
      readTime: "6 min",
      views: 1560,
      likes: 118,
      comments: 42,
      publishDate: "2025-06-08",
      author: {
        name: "Juliana Costa",
        avatar: "JC",
        bio: "Transformação em andamento",
        isVerified: false,
      },
      image: "/placeholder.svg?height=200&width=300",
      tags: ["Superação", "Motivação", "Persistência"],
      type: "blog",
    },
    {
      id: 107,
      title: "Jejum no Trabalho: Minhas Estratégias",
      description: "Como manter o jejum mesmo com a rotina corrida do escritório",
      excerpt:
        "Trabalhar 8h por dia e manter o jejum pode ser desafiador. Compartilho minhas estratégias que realmente funcionam! 💼",
      category: "quickTips" as TranslationKey,
      readTime: "4 min",
      views: 1340,
      likes: 78,
      comments: 25,
      publishDate: "2025-06-06",
      author: {
        name: "Pedro Oliveira",
        avatar: "PO",
        bio: "Executivo e praticante de jejum",
        isVerified: false,
      },
      image: "/placeholder.svg?height=200&width=300",
      tags: ["Trabalho", "Rotina", "Estratégia"],
      type: "blog",
    },
    {
      id: 108,
      title: "Celebrando Meus Primeiros 10kg Perdidos! 🎉",
      description: "Um marco importante na minha jornada de emagrecimento",
      excerpt:
        "Hoje completei 4 meses de jejum e perdi 10kg! Quero compartilhar essa alegria e algumas reflexões sobre o processo. 🎊",
      category: "experiences" as TranslationKey,
      readTime: "5 min",
      views: 2100,
      likes: 156,
      comments: 38,
      publishDate: "2025-06-04",
      author: {
        name: "Fernanda Lima",
        avatar: "FL",
        bio: "Em transformação há 4 meses",
        isVerified: false,
      },
      image: "/placeholder.svg?height=200&width=300",
      tags: ["Conquista", "Emagrecimento", "Celebração"],
      featured: true,
      type: "blog",
    },
  ]

  const blogCategories = [
    { nameKey: "all" as TranslationKey, count: 8, color: "bg-gray-100 text-gray-800" },
    { nameKey: "experiences" as TranslationKey, count: 3, color: "bg-blue-100 text-blue-800" },
    { nameKey: "quickTips" as TranslationKey, count: 2, color: "bg-green-100 text-green-800" },
    { nameKey: "motivation" as TranslationKey, count: 2, color: "bg-purple-100 text-purple-800" },
    { nameKey: "recipes" as TranslationKey, count: 1, color: "bg-orange-100 text-orange-800" },
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
    {
      title: "Quanto tempo leva para ver resultados com jejum intermitente?",
      answer:
        "Muitas pessoas começam a sentir benefícios como maior energia e clareza mental na primeira semana. Para perda de peso visível, geralmente leva 2-4 semanas de prática consistente. Resultados significativos na composição corporal podem ser observados após 8-12 semanas de jejum intermitente regular.",
    },
    {
      title: "Posso beber café e chá durante o jejum?",
      answer:
        "Sim! Café preto, chá verde, chá preto e outras bebidas sem calorias são permitidos durante o jejum. Eles podem até ajudar a suprimir o apetite e fornecer energia. Evite adicionar açúcar, leite ou adoçantes que contenham calorias, pois isso quebraria o jejum.",
    },
    {
      title: "O jejum intermitente causa perda de músculo?",
      answer:
        "Não, quando feito corretamente com ingestão adequada de proteína e exercício de resistência, o jejum intermitente preserva a massa muscular. Na verdade, o aumento do hormônio do crescimento durante o jejum pode ajudar a proteger o tecido muscular. A chave é consumir proteína suficiente durante a janela alimentar.",
    },
    {
      title: "Qual é o melhor protocolo de jejum para iniciantes?",
      answer:
        "O protocolo 16:8 é ideal para iniciantes - jejuar por 16 horas e comer durante uma janela de 8 horas. Por exemplo, comer das 12h às 20h e jejuar das 20h às 12h do dia seguinte. É fácil de seguir e permite adaptação gradual ao jejum intermitente.",
    },
    {
      title: "Posso fazer exercício durante o jejum?",
      answer:
        "Sim, exercício durante o jejum pode ser muito eficaz para queima de gordura. Comece com atividades leves como caminhada e progrida gradualmente. Exercícios de baixa a moderada intensidade funcionam melhor em jejum. Mantenha-se bem hidratado e pare se sentir tonturas ou mal-estar.",
    },
    {
      title: "O que fazer se sentir muita fome durante o jejum?",
      answer:
        "A fome vem em ondas e geralmente passa em 15-20 minutos. Beba água, chá de ervas ou café preto. Mantenha-se ocupado com atividades. Se a fome for extrema, considere reduzir o período de jejum gradualmente até se adaptar. A fome diminui significativamente após 1-2 semanas de prática.",
    },
    {
      title: "Jejum intermitente funciona para mulheres?",
      answer:
        "Sim, mas mulheres podem precisar de uma abordagem mais gentil devido a diferenças hormonais. Comece com jejuns mais curtos (14:10 ou 16:8) e monitore o ciclo menstrual. Se houver irregularidades, considere reduzir a frequência ou duração do jejum. Mulheres grávidas ou amamentando não devem fazer jejum.",
    },
    {
      title: "Posso tomar suplementos durante o jejum?",
      answer:
        "Suplementos sem calorias como vitaminas, minerais e eletrólitos geralmente são permitidos durante o jejum. Suplementos em cápsulas são preferíveis aos em pó ou líquidos adoçados. Ômega-3, vitamina D e magnésio são seguros. Evite suplementos com açúcar, maltodextrina ou outros ingredientes calóricos.",
    },
    {
      title: "Como quebrar o jejum da forma correta?",
      answer:
        "Comece com alimentos leves e fáceis de digerir: frutas, iogurte, ovos ou smoothie. Evite alimentos muito processados, açucarados ou gordurosos na primeira refeição. Coma devagar e mastigue bem. Para jejuns mais longos (24+ horas), seja ainda mais cauteloso e comece com líquidos antes de alimentos sólidos.",
    },
  ]

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSelectedCategory("all")
    setSearchQuery("")
  }

  const faqBorderColors = [
    "border-l-[#F2AEE7]", // Rosa
    "border-l-[#F2C12E]", // Amarelo
    "border-l-[#F27D16]", // Laranja
    "border-l-[#F24E29]", // Vermelho
  ]

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
                  {featuredContent
                    .filter((item) => item.type === "article")
                    .slice(0, 2)
                    .map((article: any) => (
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
                              {article.rating}
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-[#F24E29] mb-3 group-hover:text-[#F27D16] transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#F24E29] rounded-full flex items-center justify-center text-white text-sm font-medium">
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
                  {featuredContent
                    .filter((item) => item.type === "blog")
                    .slice(0, 2)
                    .map((post: any) => (
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
                          <h3 className="text-xl font-bold text-[#F24E29] mb-3 group-hover:text-[#F27D16] transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#F27D16] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {post.author.avatar}
                              </div>
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-medium text-gray-900">{post.author.name}</span>
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

          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <CardTitle className="text-[#F24E29] flex items-center gap-2">
                  {activeTab === "artigos" ? (
                    <>
                      <BookOpen className="w-6 h-6" />
                      {t("articleLibrary")}
                    </>
                  ) : (
                    <>
                      <Coffee className="w-6 h-6" />
                      {t("communityPosts")}
                    </>
                  )}
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder={t(activeTab === "artigos" ? "searchArticles" : "searchPosts")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#F24E29]"
                  >
                    <option value="recent">{t("mostRecent")}</option>
                    <option value="popular">{t("mostPopular")}</option>
                    <option value="rating">{activeTab === "artigos" ? t("bestRated") : t("mostLiked")}</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2 mb-8">
                {currentCategories.map((category: any) => (
                  <Button
                    key={category.name || category.nameKey}
                    variant={selectedCategory === (category.name || category.nameKey) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.name || category.nameKey)}
                    className={
                      selectedCategory === (category.name || category.nameKey) ? "bg-[#F24E29] hover:bg-[#F27D16]" : ""
                    }
                  >
                    {category.name === "all" || category.nameKey === "all"
                      ? t("all")
                      : category.name || t(category.nameKey)}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>

              {trendingContent.length > 0 && selectedCategory === "all" && !searchQuery && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#F24E29]" />
                    <h3 className="text-lg font-semibold text-[#F24E29]">
                      {t("trending")} {t(activeTab === "artigos" ? "scientificArticles" : "communityBlog")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trendingContent.map((item: any) => (
                      <Card key={`trending-${item.id}`} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#F2AEE7] to-[#F2C12E] rounded-lg flex items-center justify-center flex-shrink-0">
                              {activeTab === "artigos" ? (
                                <BookOpen className="w-8 h-8 text-white" />
                              ) : (
                                <Coffee className="w-8 h-8 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <Badge className="bg-red-100 text-red-800 mb-2">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {t("trending")}
                              </Badge>
                              <h4 className="font-semibold text-[#F24E29] mb-1 line-clamp-2">{item.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>
                                  {item.views} {t("views")}
                                </span>
                                <span>•</span>
                                <span>{item.readTime}</span>
                                {activeTab === "blog" && item.type === "blog" && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      {item.likes} {t("likes")}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((item: any) => (
                  <Card
                    key={item.id}
                    className="hover:shadow-lg transition-shadow group flex flex-col bg-white dark:bg-slate-800"
                  >
                    <div className="aspect-video bg-gradient-to-br from-[#F2AEE7] to-[#F2C12E] rounded-t-lg flex items-center justify-center relative">
                      {activeTab === "artigos" ? (
                        <BookOpen className="w-12 h-12 text-white" />
                      ) : (
                        <Coffee className="w-12 h-12 text-white" />
                      )}
                      {item.trending && (
                        <Badge className="absolute top-3 right-3 bg-red-500 text-white text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {t("trending")}
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-6 bg-red-100 border-4 border-red-500">
                      <div className="text-red-600 font-bold text-xl mb-4">
                        🔴 TESTE - SE VOCÊ VÊ ISSO, A MUDANÇA FUNCIONOU!
                      </div>

                      <div className="mb-3">
                        <span className="text-xs font-semibold text-[#F24E29] uppercase tracking-wide bg-yellow-200 px-2 py-1">
                          {activeTab === "artigos" ? item.category : t(item.category as TranslationKey)}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">{item.title}</h3>

                      <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">{item.description}</p>

                      <div className="text-xs text-gray-500 flex items-center space-x-2">
                        <span className="font-medium">{item.author.name}</span>
                        <span>•</span>
                        <span>{item.readTime}</span>
                        <span>•</span>
                        <span className="text-[#F24E29] font-medium">
                          {activeTab === "artigos" ? `${item.rating}★` : `${item.likes}👍`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredContent.length === 0 && (
                <div className="text-center py-12">
                  {activeTab === "artigos" ? (
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  ) : (
                    <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    {t(activeTab === "artigos" ? "noArticlesFound" : "noPostsFound")}
                  </h3>
                  <p className="text-gray-500 mb-4">{t("tryAdjustingFilters")}</p>
                  <Button
                    onClick={() => {
                      setSelectedCategory("all")
                      setSearchQuery("")
                    }}
                    variant="outline"
                  >
                    {t("clearFilters")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {activeTab === "artigos" && (
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
                        className={`mb-2 rounded-md border border-l-4 ${faqBorderColors[index % faqBorderColors.length]} border-t-transparent border-r-transparent border-b-transparent focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2`}
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
          )}
        </div>
      </div>
    </div>
  )
}
