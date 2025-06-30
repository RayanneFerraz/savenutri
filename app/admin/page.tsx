"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, FileText, ChefHat, TrendingUp, Plus, Edit, Trash2, Eye } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { recipesDatabase } from "@/lib/recipes-data"
import { articlesDatabase } from "@/lib/articles-data"
import { useLanguage } from "@/context/languageContext"

interface Article {
  id: number
  title: string
  content: string
  category: string
  author: string
  createdAt: string
  published: boolean
}

interface Recipe {
  id: number
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  category: string
  cookTime: string
  servings: number
  createdAt: string
}

interface User {
  id: number
  name: string
  email: string
  role: "admin" | "user"
  status: "active" | "inactive" | "suspended"
  createdAt: string
  lastLogin: string
  fastingPlan: string
}

interface SystemSettings {
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  dataRetentionDays: number
  maxUsersPerPlan: number
}

export default function AdminPage() {
  const { t } = useLanguage()
  const [users, setUsers] = useState([])
  const [recipes, setRecipes] = useState(recipesDatabase)
  const [articles, setArticles] = useState(articlesDatabase)
  const [analytics, setAnalytics] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    totalFasts: 3456,
    avgFastDuration: 16.2,
  })
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [showNewArticle, setShowNewArticle] = useState(false)
  const [showNewRecipe, setShowNewRecipe] = useState(false)

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: "FastTrack",
    siteDescription: "Transforme sua saúde com jejum intermitente",
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    pushNotifications: true,
    dataRetentionDays: 365,
    maxUsersPerPlan: 1000,
  })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showNewUser, setShowNewUser] = useState(false)

  useEffect(() => {
    loadArticles()
    loadRecipes()
    loadUsers()
    loadSystemSettings()
  }, [])

  const loadArticles = () => {
    const stored = localStorage.getItem("adminArticles")
    if (stored) {
      setArticles(JSON.parse(stored))
    } else {
      const initialArticles: Article[] = [
        {
          id: 1,
          title: "Benefícios do Jejum Intermitente",
          content: "O jejum intermitente oferece diversos benefícios para a saúde...",
          category: "Saúde",
          author: "Admin",
          createdAt: new Date().toISOString(),
          published: true,
        },
        {
          id: 2,
          title: "Como Começar o Jejum 16:8",
          content: "O método 16:8 é uma das formas mais populares de jejum...",
          category: "Guias",
          author: "Admin",
          createdAt: new Date().toISOString(),
          published: true,
        },
      ]
      setArticles(initialArticles)
      localStorage.setItem("adminArticles", JSON.stringify(initialArticles))
    }
  }

  const loadRecipes = () => {
    const formatted = recipesDatabase.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      ingredients: r.ingredients,
      instructions: r.instructions,
      category: r.category,
      cookTime: r.cookTime,
      servings: r.servings,
      createdAt: new Date().toISOString(),
    }))
    setRecipes(formatted)
  }

  const loadUsers = () => {
    const stored = localStorage.getItem("adminUsers")
    if (stored) {
      setUsers(JSON.parse(stored))
    } else {
      const initialUsers: User[] = [
        {
          id: 1,
          name: "Admin Principal",
          email: "admin@fasttrack.com",
          role: "admin",
          status: "active",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          fastingPlan: "16:8",
        },
        {
          id: 2,
          name: "João Silva",
          email: "joao@email.com",
          role: "user",
          status: "active",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          fastingPlan: "16:8",
        },
        {
          id: 3,
          name: "Maria Santos",
          email: "maria@email.com",
          role: "user",
          status: "active",
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          fastingPlan: "18:6",
        },
      ]
      setUsers(initialUsers)
      localStorage.setItem("adminUsers", JSON.stringify(initialUsers))
    }
  }

  const loadSystemSettings = () => {
    const stored = localStorage.getItem("systemSettings")
    if (stored) {
      setSystemSettings(JSON.parse(stored))
    }
  }

  const saveArticle = (article: Omit<Article, "id" | "createdAt">) => {
    const newArticle: Article = {
      ...article,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    }
    const updatedArticles = [...articles, newArticle]
    setArticles(updatedArticles)
    localStorage.setItem("adminArticles", JSON.stringify(updatedArticles))
    setShowNewArticle(false)
    toast({ title: "Artigo criado com sucesso!" })
  }

  const updateArticle = (updatedArticle: Article) => {
    const updatedArticles = articles.map((a) => (a.id === updatedArticle.id ? updatedArticle : a))
    setArticles(updatedArticles)
    localStorage.setItem("adminArticles", JSON.stringify(updatedArticles))
    setEditingArticle(null)
    toast({ title: "Artigo atualizado com sucesso!" })
  }

  const deleteArticle = (id: number) => {
    const updatedArticles = articles.filter((a) => a.id !== id)
    setArticles(updatedArticles)
    localStorage.setItem("adminArticles", JSON.stringify(updatedArticles))
    toast({ title: "Artigo excluído com sucesso!" })
  }

  const saveRecipe = (recipe: Omit<Recipe, "id" | "createdAt">) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    }
    const updatedRecipes = [...recipes, newRecipe]
    setRecipes(updatedRecipes)
    localStorage.setItem("adminRecipes", JSON.stringify(updatedRecipes))
    setShowNewRecipe(false)
    toast({ title: "Receita criada com sucesso!" })
  }

  const updateRecipe = (updatedRecipe: Recipe) => {
    const updatedRecipes = recipes.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r))
    setRecipes(updatedRecipes)
    localStorage.setItem("adminRecipes", JSON.stringify(updatedRecipes))
    setEditingRecipe(null)
    toast({ title: "Receita atualizada com sucesso!" })
  }

  const deleteRecipe = (id: number) => {
    const updatedRecipes = recipes.filter((r) => r.id !== id)
    setRecipes(updatedRecipes)
    localStorage.setItem("adminRecipes", JSON.stringify(updatedRecipes))
    toast({ title: "Receita excluída com sucesso!" })
  }

  const saveUser = (user: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...user,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    }
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem("adminUsers", JSON.stringify(updatedUsers))
    setShowNewUser(false)
    toast({ title: "Usuário criado com sucesso!" })
  }

  const updateUser = (updatedUser: User) => {
    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    setUsers(updatedUsers)
    localStorage.setItem("adminUsers", JSON.stringify(updatedUsers))
    setEditingUser(null)
    toast({ title: "Usuário atualizado com sucesso!" })
  }

  const deleteUser = (id: number) => {
    const updatedUsers = users.filter((u) => u.id !== id)
    setUsers(updatedUsers)
    localStorage.setItem("adminUsers", JSON.stringify(updatedUsers))
    toast({ title: "Usuário excluído com sucesso!" })
  }

  const resetUserPassword = (userId: number) => {
    toast({
      title: "Senha resetada!",
      description: "Nova senha temporária enviada por email.",
    })
  }

  const saveSystemSettings = (settings: SystemSettings) => {
    setSystemSettings(settings)
    localStorage.setItem("systemSettings", JSON.stringify(settings))
    toast({ title: "Configurações salvas com sucesso!" })
  }

  const exportData = () => {
    const data = {
      articles,
      recipes,
      users: users.map((u) => ({ ...u, password: undefined })),
      settings: systemSettings,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `fasttrack-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({ title: "Backup exportado com sucesso!" })
  }

  const syncRecipesFromDatabase = () => {
    const formatted = recipesDatabase.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      ingredients: r.ingredients,
      instructions: r.instructions,
      category: r.category,
      cookTime: r.cookTime,
      servings: r.servings,
      createdAt: new Date().toISOString(),
    }))
    setRecipes(formatted)
    localStorage.setItem("adminRecipes", JSON.stringify(formatted))
    toast({ title: "50 receitas sincronizadas com sucesso!" })
  }

  useEffect(() => {
    setUsers([
      { id: 1, name: "João Silva", email: "joao@email.com", status: "active", joinDate: "2024-01-15" },
      { id: 2, name: "Maria Santos", email: "maria@email.com", status: "active", joinDate: "2024-01-20" },
      { id: 3, name: "Pedro Costa", email: "pedro@email.com", status: "inactive", joinDate: "2024-02-01" },
    ])
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#F24E29] mb-2">{t("adminTitle")}</h1>
            <p className="text-gray-600">{t("systemStats")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("totalUsers")}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% {t("month")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("activeUsers")}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+8% {t("week")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("totalRecipes")}</CardTitle>
                <ChefHat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recipes.length}</div>
                <p className="text-xs text-muted-foreground">+3 {t("week")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("totalArticles")}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{articles.length}</div>
                <p className="text-xs text-muted-foreground">+2 {t("week")}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">{t("users")}</TabsTrigger>
              <TabsTrigger value="recipes">{t("recipes")}</TabsTrigger>
              <TabsTrigger value="articles">{t("articles")}</TabsTrigger>
              <TabsTrigger value="analytics">{t("analytics")}</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t("userManagement")}</CardTitle>
                  <Button className="bg-[#F24E29] hover:bg-[#F24E29]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("add")} {t("users")}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-[#F2AEE7] rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-[#F24E29]" />
                          </div>
                          <div>
                            <h3 className="font-medium">{user.name}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">
                              {t("joinDate")}: {user.joinDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={user.status === "active" ? "default" : "secondary"}>{t(user.status)}</Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recipes" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {t("contentManagement")} - {t("recipes")}
                  </CardTitle>
                  <Button className="bg-[#F24E29] hover:bg-[#F24E29]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("add")} {t("recipes")}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recipes.slice(0, 6).map((recipe) => (
                      <div key={recipe.id} className="border rounded-lg p-4 space-y-3">
                        <img
                          src={recipe.image || "/placeholder.svg"}
                          alt={recipe.title.en}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <div>
                          <h3 className="font-medium">{recipe.title.en}</h3>
                          <p className="text-sm text-gray-500">{recipe.category}</p>
                          <p className="text-xs text-gray-400">
                            {recipe.cookingTime} • {recipe.difficulty}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="articles" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {t("contentManagement")} - {t("articles")}
                  </CardTitle>
                  <Button className="bg-[#F24E29] hover:bg-[#F24E29]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("add")} {t("articles")}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {articles.slice(0, 5).map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={article.image || "/placeholder.svg"}
                            alt={article.title.en}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div>
                            <h3 className="font-medium">{article.title.en}</h3>
                            <p className="text-sm text-gray-500">{article.category}</p>
                            <p className="text-xs text-gray-400">
                              {article.readTime} {t("readTime")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge>{article.category}</Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("userManagement")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>{t("totalUsers")}:</span>
                      <span className="font-medium">{analytics.totalUsers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("activeUsers")}:</span>
                      <span className="font-medium">{analytics.activeUsers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Atividade:</span>
                      <span className="font-medium">
                        {Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas de Jejum</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total de Jejuns:</span>
                      <span className="font-medium">{analytics.totalFasts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duração Média:</span>
                      <span className="font-medium">{analytics.avgFastDuration}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jejuns Hoje:</span>
                      <span className="font-medium">127</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
