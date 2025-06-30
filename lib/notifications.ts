interface NotificationToken {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  userId?: string
  createdAt: number
}

interface ScheduledNotification {
  id: string
  title: string
  body: string
  scheduledFor: number
  type: "timer" | "reminder" | "achievement" | "tip"
  data?: any
}

class NotificationManager {
  private static instance: NotificationManager
  private vapidPublicKey = "BEl62iUYgUivxIkv69yViEuiBIa40HcCWLrUjHLjdMorGDlLVW6SCDhHxiHSNOHIS03v7VdHoTxKryaHXr6tmlA" // Exemplo - em produção usar chaves reais

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      console.log("Notificações não suportadas")
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      })

      // Salvar token no localStorage (em produção, enviar para servidor)
      const token: NotificationToken = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))),
        },
        createdAt: Date.now(),
      }

      localStorage.setItem("pushToken", JSON.stringify(token))
      console.log("Push subscription criada:", token)

      return subscription
    } catch (error) {
      console.error("Erro ao criar push subscription:", error)
      return null
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Notificação local imediata
  showLocalNotification(title: string, body: string, options?: NotificationOptions) {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/placeholder.svg?height=192&width=192&text=FT",
        badge: "/placeholder.svg?height=72&width=72&text=FT",
        tag: "fasttrack-notification",
        ...options,
      })
    }
  }

  // Agendar notificação local
  scheduleLocalNotification(notification: Omit<ScheduledNotification, "id">) {
    const id = Date.now().toString()
    const scheduledNotification: ScheduledNotification = { ...notification, id }

    const scheduled = this.getScheduledNotifications()
    scheduled.push(scheduledNotification)
    localStorage.setItem("scheduledNotifications", JSON.stringify(scheduled))

    // Configurar timeout
    const delay = notification.scheduledFor - Date.now()
    if (delay > 0) {
      setTimeout(() => {
        this.showLocalNotification(notification.title, notification.body, {
          data: notification.data,
          tag: notification.type,
        })
        this.removeScheduledNotification(id)
      }, delay)
    }

    return id
  }

  getScheduledNotifications(): ScheduledNotification[] {
    const stored = localStorage.getItem("scheduledNotifications")
    return stored ? JSON.parse(stored) : []
  }

  removeScheduledNotification(id: string) {
    const scheduled = this.getScheduledNotifications()
    const filtered = scheduled.filter((n) => n.id !== id)
    localStorage.setItem("scheduledNotifications", JSON.stringify(filtered))
  }

  // Notificações específicas do jejum
  scheduleTimerNotification(duration: number, type: "start" | "end") {
    const now = Date.now()
    const scheduledFor = now + duration

    if (type === "start") {
      this.scheduleLocalNotification({
        title: "Jejum Iniciado! 🚀",
        body: "Seu período de jejum começou. Boa sorte!",
        scheduledFor: now + 1000, // 1 segundo depois
        type: "timer",
        data: { timerType: "start" },
      })
    } else {
      this.scheduleLocalNotification({
        title: "Jejum Concluído! 🎉",
        body: "Parabéns! Você completou seu jejum com sucesso.",
        scheduledFor,
        type: "timer",
        data: { timerType: "end" },
      })
    }
  }

  scheduleDailyReminder(hour: number, minute: number) {
    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(hour, minute, 0, 0)

    // Se já passou da hora hoje, agendar para amanhã
    if (scheduledTime.getTime() <= now.getTime()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    this.scheduleLocalNotification({
      title: "Hora do Jejum! ⏰",
      body: "Que tal começar seu jejum agora?",
      scheduledFor: scheduledTime.getTime(),
      type: "reminder",
    })
  }

  // Enviar push notification via API
  async sendPushNotification(title: string, body: string, data?: any) {
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          body,
          data,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao enviar notificação")
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao enviar push notification:", error)
      // Fallback para notificação local
      this.showLocalNotification(title, body, { data })
    }
  }
}

export const notificationManager = NotificationManager.getInstance()
