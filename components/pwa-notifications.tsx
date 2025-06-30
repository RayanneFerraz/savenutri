"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PWANotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Verificar suporte a notificações
    setIsSupported("Notification" in window && "serviceWorker" in navigator)

    if ("Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta notificações push.",
        variant: "destructive",
      })
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission === "granted") {
        toast({
          title: "Notificações ativadas!",
          description: "Você receberá lembretes sobre seus jejuns.",
        })

        // Registrar para push notifications se service worker estiver disponível
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready

          // Aqui você pode registrar para push notifications
          // Em produção, você precisaria de um servidor VAPID
          console.log("Service Worker pronto para push notifications", registration)
        }
      } else {
        toast({
          title: "Notificações negadas",
          description: "Você pode ativar nas configurações do navegador.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error)
      toast({
        title: "Erro",
        description: "Não foi possível ativar as notificações.",
        variant: "destructive",
      })
    }
  }

  const sendTestNotification = () => {
    if (permission === "granted") {
      new Notification("FastTrack - Teste", {
        body: "As notificações estão funcionando perfeitamente!",
        icon: "/placeholder.svg?height=192&width=192&text=FT",
        badge: "/placeholder.svg?height=72&width=72&text=FT",
        tag: "test-notification",
      })
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {permission === "default" && (
        <Button onClick={requestPermission} variant="outline" size="sm" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Ativar Notificações
        </Button>
      )}

      {permission === "granted" && (
        <Button
          onClick={sendTestNotification}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-green-600 border-green-200"
        >
          <Bell className="h-4 w-4" />
          Testar Notificação
        </Button>
      )}

      {permission === "denied" && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <BellOff className="h-4 w-4" />
          Notificações desativadas
        </div>
      )}
    </div>
  )
}
