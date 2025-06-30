"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Bell, BellOff, Clock, Trophy, Lightbulb, Timer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { notificationManager } from "@/lib/notifications"
import { useLanguage } from "@/context/languageContext"

interface NotificationSettings {
  timerNotifications: boolean
  dailyReminders: boolean
  achievements: boolean
  tips: boolean
  reminderTime: string
}

export default function NotificationManager() {
  const { t } = useLanguage()
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)
  const [isPushEnabled, setIsPushEnabled] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    timerNotifications: true,
    dailyReminders: true,
    achievements: true,
    tips: true,
    reminderTime: "09:00",
  })
  const { toast } = useToast()

  useEffect(() => {
    // Verificar suporte
    setIsSupported("Notification" in window && "serviceWorker" in navigator)

    if ("Notification" in window) {
      setPermission(Notification.permission)
    }

    // Carregar configurações salvas
    const savedSettings = localStorage.getItem("notificationSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Verificar se push está habilitado
    checkPushSubscription()
  }, [])

  const checkPushSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsPushEnabled(!!subscription)
    } catch (error) {
      console.error("Erro ao verificar push subscription:", error)
    }
  }

  const enableNotifications = async () => {
    try {
      const hasPermission = await notificationManager.requestPermission()

      if (hasPermission) {
        setPermission("granted")

        // Tentar habilitar push notifications
        const subscription = await notificationManager.subscribeToPush()
        if (subscription) {
          setIsPushEnabled(true)

          // Registrar no servidor
          await fetch("/api/notifications/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              endpoint: subscription.endpoint,
              keys: {
                p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))),
                auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))),
              },
            }),
          })
        }

        toast({
          title: "Notificações ativadas! 🔔",
          description: "Você receberá lembretes sobre seus jejuns.",
        })

        // Mostrar notificação de teste
        setTimeout(() => {
          notificationManager.showLocalNotification(
            "FastTrack ativado! 🚀",
            "Suas notificações estão funcionando perfeitamente!",
          )
        }, 2000)
      } else {
        toast({
          title: "Permissão negada",
          description: "Ative nas configurações do navegador para receber notificações.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao ativar notificações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível ativar as notificações.",
        variant: "destructive",
      })
    }
  }

  const updateSettings = (key: keyof NotificationSettings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem("notificationSettings", JSON.stringify(newSettings))

    // Aplicar configurações
    if (key === "dailyReminders" && value) {
      const [hour, minute] = newSettings.reminderTime.split(":").map(Number)
      notificationManager.scheduleDailyReminder(hour, minute)
    }

    toast({
      title: "Configurações salvas",
      description: "Suas preferências de notificação foram atualizadas.",
    })
  }

  const testNotification = () => {
    if (permission === "granted") {
      notificationManager.showLocalNotification(
        "Teste de Notificação 🧪",
        "Esta é uma notificação de teste do FastTrack!",
      )
    }
  }

  const sendPushTest = async () => {
    try {
      await notificationManager.sendPushNotification(
        "Push Notification Teste 🚀",
        "Esta é uma push notification de teste!",
      )
      toast({
        title: "Push enviada!",
        description: "Verifique se recebeu a notificação.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar push notification.",
        variant: "destructive",
      })
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificações não suportadas
          </CardTitle>
          <CardDescription>Seu navegador não suporta notificações push.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Notificação
          </CardTitle>
          <CardDescription>Gerencie como e quando você quer receber notificações.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {permission === "default" && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Bell className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="font-semibold mb-2">Ativar Notificações</h3>
              <p className="text-sm text-gray-600 mb-4">Receba lembretes sobre seus jejuns e conquistas.</p>
              <Button onClick={enableNotifications} className="w-full">
                Ativar Notificações
              </Button>
            </div>
          )}

          {permission === "granted" && (
            <>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Notificações Ativas</p>
                    <p className="text-sm text-green-600">Push: {isPushEnabled ? "✅ Ativo" : "❌ Inativo"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={testNotification} variant="outline" size="sm">
                    Testar Local
                  </Button>
                  <Button onClick={sendPushTest} variant="outline" size="sm">
                    Testar Push
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Timer className="h-5 w-5 text-blue-500" />
                    <div>
                      <Label htmlFor="timer-notifications">Notificações do Timer</Label>
                      <p className="text-sm text-gray-500">Avisos de início e fim do jejum</p>
                    </div>
                  </div>
                  <Switch
                    id="timer-notifications"
                    checked={settings.timerNotifications}
                    onCheckedChange={(checked) => updateSettings("timerNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <div>
                      <Label htmlFor="daily-reminders">Lembretes Diários</Label>
                      <p className="text-sm text-gray-500">Lembrete para iniciar o jejum</p>
                    </div>
                  </div>
                  <Switch
                    id="daily-reminders"
                    checked={settings.dailyReminders}
                    onCheckedChange={(checked) => updateSettings("dailyReminders", checked)}
                  />
                </div>

                {settings.dailyReminders && (
                  <div className="ml-8 flex items-center gap-3">
                    <Label htmlFor="reminder-time">Horário:</Label>
                    <Input
                      id="reminder-time"
                      type="time"
                      value={settings.reminderTime}
                      onChange={(e) => updateSettings("reminderTime", e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <div>
                      <Label htmlFor="achievements">Conquistas</Label>
                      <p className="text-sm text-gray-500">Notificações de marcos e objetivos</p>
                    </div>
                  </div>
                  <Switch
                    id="achievements"
                    checked={settings.achievements}
                    onCheckedChange={(checked) => updateSettings("achievements", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="h-5 w-5 text-orange-500" />
                    <div>
                      <Label htmlFor="tips">Dicas e Conteúdo</Label>
                      <p className="text-sm text-gray-500">Dicas sobre jejum e saúde</p>
                    </div>
                  </div>
                  <Switch
                    id="tips"
                    checked={settings.tips}
                    onCheckedChange={(checked) => updateSettings("tips", checked)}
                  />
                </div>
              </div>
            </>
          )}

          {permission === "denied" && (
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <BellOff className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="font-semibold mb-2 text-red-800">Notificações Bloqueadas</h3>
              <p className="text-sm text-red-600 mb-4">
                Para ativar, vá nas configurações do navegador e permita notificações para este site.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
