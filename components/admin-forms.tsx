"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Save, X } from "lucide-react"

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

// Componente para criar novo usuário
export function NewUserForm({
  onSave,
  onCancel,
}: {
  onSave: (user: Omit<User, "id" | "createdAt">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as "admin" | "user",
    status: "active" as "active" | "inactive" | "suspended",
    lastLogin: new Date().toISOString(),
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="role">Função</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive" | "suspended") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fastingPlan">Plano de Jejum</Label>
              <Select
                value={formData.fastingPlan}
                onValueChange={(value) => setFormData({ ...formData, fastingPlan: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:8">16:8</SelectItem>
                  <SelectItem value="18:6">18:6</SelectItem>
                  <SelectItem value="20:4">20:4</SelectItem>
                  <SelectItem value="24:0">24:0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-[#F24E29] hover:bg-[#F24E29]/90">
              <Save className="w-4 h-4 mr-2" />
              Criar Usuário
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
export function EditUserForm({
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="role">Função</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive" | "suspended") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fastingPlan">Plano de Jejum</Label>
              <Select
                value={formData.fastingPlan}
                onValueChange={(value) => setFormData({ ...formData, fastingPlan: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:8">16:8</SelectItem>
                  <SelectItem value="18:6">18:6</SelectItem>
                  <SelectItem value="20:4">20:4</SelectItem>
                  <SelectItem value="24:0">24:0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-[#F24E29] hover:bg-[#F24E29]/90">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
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
export function SystemSettingsForm({
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#F24E29]">Informações Básicas</h3>
        <div className="grid grid-cols-2 gap-4">
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
            <Label htmlFor="siteDescription">Descrição</Label>
            <Input
              id="siteDescription"
              value={formData.siteDescription}
              onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#F24E29]">Configurações de Acesso</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="maintenanceMode" className="text-base font-medium">
                Modo Manutenção
              </Label>
              <p className="text-sm text-gray-600">Desabilita o acesso público ao site</p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={formData.maintenanceMode}
              onCheckedChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="registrationEnabled" className="text-base font-medium">
                Registro de Novos Usuários
              </Label>
              <p className="text-sm text-gray-600">Permite que novos usuários se cadastrem</p>
            </div>
            <Switch
              id="registrationEnabled"
              checked={formData.registrationEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, registrationEnabled: checked })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#F24E29]">Notificações</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="emailNotifications" className="text-base font-medium">
                Notificações por E-mail
              </Label>
              <p className="text-sm text-gray-600">Enviar notificações por e-mail aos usuários</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="pushNotifications" className="text-base font-medium">
                Notificações Push
              </Label>
              <p className="text-sm text-gray-600">Enviar notificações push aos usuários</p>
            </div>
            <Switch
              id="pushNotifications"
              checked={formData.pushNotifications}
              onCheckedChange={(checked) => setFormData({ ...formData, pushNotifications: checked })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#F24E29]">Limites e Retenção</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dataRetentionDays">Retenção de Dados (dias)</Label>
            <Input
              id="dataRetentionDays"
              type="number"
              value={formData.dataRetentionDays}
              onChange={(e) => setFormData({ ...formData, dataRetentionDays: Number.parseInt(e.target.value) })}
              min="1"
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
              min="1"
              required
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="bg-[#F24E29] hover:bg-[#F24E29]/90">
        <Save className="w-4 h-4 mr-2" />
        Salvar Configurações
      </Button>
    </form>
  )
}
