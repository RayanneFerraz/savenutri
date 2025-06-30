"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Users, FileText, ChefHat, Plus, Edit, Trash2, Eye, Save, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Download } from "lucide-react"
import { recipesDatabase } from "@/lib/recipes-data"

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

// Adicionar interfaces para usuários no topo do arquivo, após as interfaces existentes:
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
  const [articles, setArticles] = useState<Article[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [showNewArticle, setShowNewArticle] = useState(false)
  const [showNewRecipe, setShowNewRecipe] = useState(false)

  // Adicionar estados para usuários e configurações no componente principal, após os estados existentes:
  const [users, setUsers] = useState<User[]>([])
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

  // Carregar dados iniciais
  // Chamar loadUsers e loadSystemSettings no useEffect:
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
      // Artigos iniciais
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
      ingredients: r.ingredients, // ← keep
      instructions: r.instructions, // ← keep
      category: r.category,
      cookTime: r.cookTime,
      servings: r.servings,
      createdAt: new Date().toISOString(),
    }))
    setRecipes(formatted)
  }

  // Adicionar função loadUsers no useEffect, após loadRecipes():
  const loadUsers = () => {
    const stored = localStorage.getItem("adminUsers")
    if (stored) {
      setUsers(JSON.parse(stored))
    } else {
      // Usuários iniciais
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

  // Adicionar funções de gerenciamento de usuários após as funções de receitas:
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
    // Simular reset de senha
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
      users: users.map((u) => ({ ...u, password: undefined })), // Remove senhas
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#F24E29] mb-2">Painel Administrativo</h1>
            <p className="text-gray-600 text-lg">Gerencie conteúdos, usuários e configurações</p>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#F2AEE7] rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-[#F24E29]" />
                </div>
                <div className="text-2xl font-bold text-[#F24E29]">{articles.length}</div>
                <div className="text-sm text-gray-600">Artigos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#F2C12E] rounded-full flex items-center justify-center mx-auto mb-3">
                  <ChefHat className="w-6 h-6 text-[#F24E29]" />
                </div>
                <div className="text-2xl font-bold text-[#F24E29]">{recipesDatabase.length}</div>
                <div className="text-sm text-gray-600">Receitas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#F27D16] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                {/* Atualizar a estatística de usuários para mostrar o número real: */}
                <div className="text-2xl font-bold text-[#F24E29]">{users.length}</div>
                <div className="text-sm text-gray-600">Usuários</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#F24E29] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-[#F24E29]">5,678</div>
                <div className="text-sm text-gray-600">Visualizações</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="articles" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="articles">Artigos</TabsTrigger>
              <TabsTrigger value="recipes">Receitas</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            {/* Gerenciamento de Artigos */}
            <TabsContent value="articles">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-[#F24E29]">Gerenciar Artigos</CardTitle>
                  <Button onClick={() => setShowNewArticle(true)} className="bg-[#F24E29] hover:bg-[#F24E29]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Artigo
                  </Button>
                </CardHeader>
                <CardContent>
                  {showNewArticle && <NewArticleForm onSave={saveArticle} onCancel={() => setShowNewArticle(false)} />}

                  {editingArticle && (
                    <EditArticleForm
                      article={editingArticle}
                      onSave={updateArticle}
                      onCancel={() => setEditingArticle(null)}
                    />
                  )}

                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div key={article.id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#F24E29]">{article.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {article.category} • {article.author}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={article.published ? "default" : "secondary"}>
                            {article.published ? "Publicado" : "Rascunho"}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => setEditingArticle(article)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteArticle(article.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gerenciamento de Receitas */}
            <TabsContent value="recipes">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-[#F24E29]">Gerenciar Receitas</CardTitle>
                  <div className="flex">
                    <Button onClick={syncRecipesFromDatabase} className="bg-green-600 hover:bg-green-700 mr-2">
                      <Download className="w-4 h-4 mr-2" />
                      Sincronizar 50 Receitas
                    </Button>
                    <Button onClick={() => setShowNewRecipe(true)} className="bg-[#F24E29] hover:bg-[#F24E29]/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Receita
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showNewRecipe && <NewRecipeForm onSave={saveRecipe} onCancel={() => setShowNewRecipe(false)} />}

                  {editingRecipe && (
                    <EditRecipeForm
                      recipe={editingRecipe}
                      onSave={updateRecipe}
                      onCancel={() => setEditingRecipe(null)}
                    />
                  )}

                  <div className="space-y-4">
                    {recipes.map((recipe) => (
                      <div key={recipe.id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#F24E29]">{recipe.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {recipe.category} • {recipe.cookTime} • {recipe.servings} porções
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(recipe.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingRecipe(recipe)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteRecipe(recipe.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gerenciamento de Usuários */}
            {/* Substituir o TabsContent de "users" por: */}
            <TabsContent value="users">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-[#F24E29]">Gerenciar Usuários</CardTitle>
                  <Button onClick={() => setShowNewUser(true)} className="bg-[#F24E29] hover:bg-[#F24E29]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </Button>
                </CardHeader>
                <CardContent>
                  {showNewUser && <NewUserForm onSave={saveUser} onCancel={() => setShowNewUser(false)} />}

                  {editingUser && (
                    <EditUserForm user={editingUser} onSave={updateUser} onCancel={() => setEditingUser(null)} />
                  )}

                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-[#F24E29]">{user.name}</h3>
                              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                {user.role === "admin" ? "Admin" : "Usuário"}
                              </Badge>
                              <Badge
                                variant={
                                  user.status === "active"
                                    ? "default"
                                    : user.status === "suspended"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {user.status === "active"
                                  ? "Ativo"
                                  : user.status === "suspended"
                                    ? "Suspenso"
                                    : "Inativo"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Plano: {user.fastingPlan} • Criado: {new Date(user.createdAt).toLocaleDateString()} •
                              Último login: {new Date(user.lastLogin).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resetUserPassword(user.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Reset Senha
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingUser(user)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            {user.role !== "admin" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteUser(user.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações */}
            {/* Substituir o TabsContent de "settings" por: */}
            <TabsContent value="settings">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29]">Configurações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SystemSettingsForm settings={systemSettings} onSave={saveSystemSettings} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29]">Backup e Dados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Exportar Dados</h4>
                        <p className="text-sm text-gray-600">Baixar backup completo do sistema</p>
                      </div>
                      <Button onClick={exportData} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Limpar Cache</h4>
                        <p className="text-sm text-gray-600">Limpar dados temporários do sistema</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          localStorage.removeItem("analytics")
                          toast({ title: "Cache limpo com sucesso!" })
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Limpar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29]">Estatísticas do Sistema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-[#F24E29]">
                          {users.filter((u) => u.status === "active").length}
                        </div>
                        <div className="text-sm text-gray-600">Usuários Ativos</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-[#F24E29]">
                          {articles.filter((a) => a.published).length}
                        </div>
                        <div className="text-sm text-gray-600">Artigos Publicados</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-[#F24E29]">{recipes.length}</div>
                        <div className="text-sm text-gray-600">Receitas Ativas</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-[#F24E29]">
                          {Math.round((localStorage.getItem("adminArticles")?.length || 0) / 1024)}KB
                        </div>
                        <div className="text-sm text-gray-600">Dados Armazenados</div>
                      </div>
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

// Componente para criar novo artigo
function NewArticleForm({
  onSave,
  onCancel,
}: {
  onSave: (article: Omit<Article, "id" | "createdAt">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    author: "Admin",
    published: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-[#F24E29]">Novo Artigo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            />
            <Label htmlFor="published">Publicar imediatamente</Label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-[#F24E29] hover:bg-[#F24E29]/90">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Componente para editar artigo
function EditArticleForm({
  article,
  onSave,
  onCancel,
}: {
  article: Article
  onSave: (article: Article) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(article)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-[#F24E29]">Editar Artigo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            />
            <Label htmlFor="published">Publicado</Label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-[#F24E29] hover:bg-[#F24E29]/90">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Componente para criar nova receita
function NewRecipeForm({
  onSave,
  onCancel,
}: {
  onSave: (recipe: Omit<Recipe, "id" | "createdAt">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: [""],
    instructions: [""],
    category: "",
    cookTime: "",
    servings: 1,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      ingredients: formData.ingredients.filter((i) => i.trim()),
      instructions: formData.instructions.filter((i) => i.trim()),
    })
  }

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, ""] })
  }

  const addInstruction = () => {
    setFormData({ ...formData, instructions: [...formData.instructions, ""] })
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-[#F24E29]">Nova Receita</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Ingredientes</Label>
            {formData.ingredients.map((ingredient, index) => (
              <Input
                key={index}
                value={ingredient}
                onChange={(e) => {
                  const newIngredients = [...formData.ingredients]
                  newIngredients[index] = e.target.value
                  setFormData({ ...formData, ingredients: newIngredients })
                }}
                placeholder={`Ingrediente ${index + 1}`}
                className="mb-2"
              />
            ))}
            <Button type="button" variant="outline" onClick={addIngredient}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Ingrediente
            </Button>
          </div>
          <div>
            <Label>Instruções</Label>
            {formData.instructions.map((instruction, index) => (
              <Textarea
                key={index}
                value={instruction}
                onChange={(e) => {
                  const newInstructions = [...formData.instructions]
                  newInstructions[index] = e.target.value
                  setFormData({ ...formData, instructions: newInstructions })
                }}
                placeholder={`Passo ${index + 1}`}
                className="mb-2"
                rows={2}
              />
            ))}
            <Button type="button" variant="outline" onClick={addInstruction}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Passo
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="cookTime">Tempo de Preparo</Label>
              <Input
                id="cookTime"
                value={formData.cookTime}
                onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                placeholder="ex: 30 min"
                required
              />
            </div>
            <div>
              <Label htmlFor="servings">Porções</Label>
              <Input
                id="servings"
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: Number.parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-[#F24E29] hover:bg-[#F24E29]/90">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Componente para editar receita
function EditRecipeForm({
  recipe,
  onSave,
  onCancel,
}: {
  recipe: Recipe
  onSave: (recipe: Recipe) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Recipe>({
    ...recipe,
    ingredients: recipe.ingredients ?? [""],
    instructions: recipe.instructions ?? [""],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      ingredients: formData.ingredients.filter((i) => i.trim()),
      instructions: formData.instructions.filter((i) => i.trim()),
    })
  }

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, ""] })
  }

  const addInstruction = () => {
    setFormData({ ...formData, instructions: [...formData.instructions, ""] })
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-[#F24E29]">Editar Receita</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Ingredientes</Label>
            {formData.ingredients.map((ingredient, index) => (
              <Input
                key={index}
                value={ingredient}
                onChange={(e) => {
                  const newIngredients = [...formData.ingredients]
                  newIngredients[index] = e.target.value
                  setFormData({ ...formData, ingredients: newIngredients })
                }}
                placeholder={`Ingrediente ${index + 1}`}
                className="mb-2"
              />
            ))}
            <Button type="button" variant="outline" onClick={addIngredient}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Ingrediente
            </Button>
          </div>
          <div>
            <Label>Instruções</Label>
            {formData.instructions.map((instruction, index) => (
              <Textarea
                key={index}
                value={instruction}
                onChange={(e) => {
                  const newInstructions = [...formData.instructions]
                  newInstructions[index] = e.target.value
                  setFormData({ ...formData, instructions: newInstructions })
                }}
                placeholder={`Passo ${index + 1}`}
                className="mb-2"
                rows={2}
              />
            ))}
            <Button type="button" variant="outline" onClick={addInstruction}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Passo
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="cookTime">Tempo de Preparo</Label>
              <Input
                id="cookTime"
                value={formData.cookTime}
                onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                placeholder="ex: 30 min"
                required
              />
            </div>
            <div>
              <Label htmlFor="servings">Porções</Label>
              <Input
                id="servings"
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: Number.parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-[#F24E29] hover:bg-[#F24E29]/90">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Componente para criar novo usuário
function NewUserForm({
  onSave,
  onCancel,
}: {
  onSave: (user: Omit<User, "id" | "createdAt">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    status: "active",
    fastingPlan: "16:8",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-[#F24E29]">Novo Usuário</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "user" })}
              className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-[#F24E29] focus:outline-none focus:ring-0"
            >
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "suspended" })
              }
              className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-[#F24E29] focus:outline-none focus:ring-0"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="suspended">Suspenso</option>
            </select>
          </div>
          <div>
            <Label htmlFor="fastingPlan">Plano de Jejum</Label>
            <Input
              id="fastingPlan"
              value={formData.fastingPlan}
              onChange={(e) => setFormData({ ...formData, fastingPlan: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-[#F24E29] hover:bg-[#F24E29]/90">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Componente para editar usuário
function EditUserForm({
  user,
  onSave,
  onCancel,
}: {
  user: User
  onSave: (user: User) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(user)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-[#F24E29]">Editar Usuário</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "user" })}
              className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-[#F24E29] focus:outline-none focus:ring-0"
            >
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "suspended" })
              }
              className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-[#F24E29] focus:outline-none focus:ring-0"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="suspended">Suspenso</option>
            </select>
          </div>
          <div>
            <Label htmlFor="fastingPlan">Plano de Jejum</Label>
            <Input
              id="fastingPlan"
              value={formData.fastingPlan}
              onChange={(e) => setFormData({ ...formData, fastingPlan: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-[#F24E29] hover:bg-[#F24E29]/90">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Componente para configurações do sistema
function SystemSettingsForm({
  settings,
  onSave,
}: {
  settings: SystemSettings
  onSave: (settings: SystemSettings) => void
}) {
  const [formData, setFormData] = useState(settings)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="siteName">Nome do Site</Label>
        <Input
          id="siteName"
          value={formData.siteName}
          onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="siteDescription">Descrição do Site</Label>
        <Textarea
          id="siteDescription"
          value={formData.siteDescription}
          onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={formData.maintenanceMode}
          onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
        />
        <Label htmlFor="maintenanceMode">Modo de Manutenção</Label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="registrationEnabled"
          checked={formData.registrationEnabled}
          onChange={(e) => setFormData({ ...formData, registrationEnabled: e.target.checked })}
        />
        <Label htmlFor="registrationEnabled">Registro de Usuários Ativado</Label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="emailNotifications"
          checked={formData.emailNotifications}
          onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
        />
        <Label htmlFor="emailNotifications">Notificações por Email</Label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="pushNotifications"
          checked={formData.pushNotifications}
          onChange={(e) => setFormData({ ...formData, pushNotifications: e.target.checked })}
        />
        <Label htmlFor="pushNotifications">Notificações Push</Label>
      </div>
      <div>
        <Label htmlFor="dataRetentionDays">Retenção de Dados (dias)</Label>
        <Input
          id="dataRetentionDays"
          type="number"
          value={formData.dataRetentionDays}
          onChange={(e) => setFormData({ ...formData, dataRetentionDays: Number.parseInt(e.target.value) })}
          min="30"
          required
        />
      </div>
      <div>
        <Label htmlFor="maxUsersPerPlan">Máximo de Usuários por Plano</Label>
        <Input
          id="maxUsersPerPlan"
          type="number"
          value={formData.maxUsersPerPlan}
          onChange={(e) => setFormData({ ...formData, maxUsersPerPlan: Number.parseInt(e.target.value) })}
          min="10"
          required
        />
      </div>
      <Button type="submit" className="bg-[#F24E29] hover:bg-[#F24E29]/90">
        <Save className="w-4 h-4 mr-2" />
        Salvar Configurações
      </Button>
    </form>
  )
}
