"use client"

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
  type: "timer" | "reminder" | "achievement" | "tip" | "water"
  data?: Record<string, unknown>
}

class NotificationManager {
  private static instance: NotificationManager
  private scheduledTimeouts: Map<string, NodeJS.Timeout> = new Map()

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  async isSupported(): Promise<boolean> {
    return "Notification" in window && "serviceWorker" in navigator
  }

  async getPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) return "denied"
    return Notification.permission
  }

  async requestPermission(): Promise<boolean> {
    if (!(await this.isSupported())) {
      console.log("Notificacoes nao suportadas neste navegador")
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!vapidPublicKey) {
        console.warn("VAPID public key not configured")
        return null
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      })

      // Save token to server
      const p256dh = subscription.getKey("p256dh")
      const auth = subscription.getKey("auth")

      if (p256dh && auth) {
        const token: NotificationToken = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dh))),
            auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
          },
          createdAt: Date.now(),
        }

        await this.registerToken(token)
        localStorage.setItem("pushToken", JSON.stringify(token))
      }

      return subscription
    } catch (error) {
      console.error("Erro ao criar push subscription:", error)
      return null
    }
  }

  private async registerToken(token: NotificationToken): Promise<void> {
    try {
      await fetch("/api/notifications/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token),
      })
    } catch (error) {
      console.error("Failed to register push token:", error)
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

  // Show local notification immediately
  showLocalNotification(title: string, body: string, options?: NotificationOptions) {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        tag: "fasttrack-notification",
        requireInteraction: false,
        ...options,
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      return notification
    }
    return null
  }

  // Schedule a local notification
  scheduleLocalNotification(notification: Omit<ScheduledNotification, "id">): string {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const scheduledNotification: ScheduledNotification = { ...notification, id }

    const scheduled = this.getScheduledNotifications()
    scheduled.push(scheduledNotification)
    localStorage.setItem("scheduledNotifications", JSON.stringify(scheduled))

    // Set timeout
    const delay = notification.scheduledFor - Date.now()
    if (delay > 0) {
      const timeout = setTimeout(() => {
        this.showLocalNotification(notification.title, notification.body, {
          data: notification.data,
          tag: notification.type,
        })
        this.removeScheduledNotification(id)
      }, delay)

      this.scheduledTimeouts.set(id, timeout)
    }

    return id
  }

  getScheduledNotifications(): ScheduledNotification[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("scheduledNotifications")
    return stored ? JSON.parse(stored) : []
  }

  removeScheduledNotification(id: string) {
    // Clear timeout if exists
    const timeout = this.scheduledTimeouts.get(id)
    if (timeout) {
      clearTimeout(timeout)
      this.scheduledTimeouts.delete(id)
    }

    // Remove from storage
    const scheduled = this.getScheduledNotifications()
    const filtered = scheduled.filter((n) => n.id !== id)
    localStorage.setItem("scheduledNotifications", JSON.stringify(filtered))
  }

  clearAllScheduledNotifications() {
    // Clear all timeouts
    this.scheduledTimeouts.forEach((timeout) => clearTimeout(timeout))
    this.scheduledTimeouts.clear()

    // Clear storage
    localStorage.removeItem("scheduledNotifications")
  }

  // Fasting timer notifications
  scheduleTimerStartNotification() {
    return this.scheduleLocalNotification({
      title: "Jejum Iniciado!",
      body: "Seu periodo de jejum comecou. Boa sorte!",
      scheduledFor: Date.now() + 1000,
      type: "timer",
      data: { action: "timer_start" },
    })
  }

  scheduleTimerEndNotification(durationMs: number) {
    return this.scheduleLocalNotification({
      title: "Jejum Concluido!",
      body: "Parabens! Voce completou seu jejum com sucesso.",
      scheduledFor: Date.now() + durationMs,
      type: "timer",
      data: { action: "timer_end" },
    })
  }

  scheduleTimerHalfwayNotification(durationMs: number) {
    return this.scheduleLocalNotification({
      title: "Metade do Jejum!",
      body: "Voce ja completou metade do seu jejum. Continue assim!",
      scheduledFor: Date.now() + durationMs / 2,
      type: "timer",
      data: { action: "timer_halfway" },
    })
  }

  // Water reminder notifications
  scheduleWaterReminder(intervalMinutes = 60) {
    return this.scheduleLocalNotification({
      title: "Hora de Hidratar!",
      body: "Lembre-se de beber agua para manter a hidratacao.",
      scheduledFor: Date.now() + intervalMinutes * 60 * 1000,
      type: "water",
      data: { action: "water_reminder" },
    })
  }

  // Daily reminder
  scheduleDailyReminder(hour: number, minute: number, message?: string) {
    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(hour, minute, 0, 0)

    // If time has passed today, schedule for tomorrow
    if (scheduledTime.getTime() <= now.getTime()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    return this.scheduleLocalNotification({
      title: "Lembrete FastTrack",
      body: message || "Hora de comecar seu jejum!",
      scheduledFor: scheduledTime.getTime(),
      type: "reminder",
      data: { action: "daily_reminder" },
    })
  }

  // Achievement notification
  showAchievementNotification(achievementName: string) {
    this.showLocalNotification("Conquista Desbloqueada!", `Parabens! Voce conquistou: ${achievementName}`, {
      tag: "achievement",
      data: { action: "achievement", achievementName },
    })
  }

  // Tip notification
  showTipNotification(tip: string) {
    this.showLocalNotification("Dica do Dia", tip, {
      tag: "tip",
      data: { action: "tip" },
    })
  }

  // Restore scheduled notifications on page load
  restoreScheduledNotifications() {
    const scheduled = this.getScheduledNotifications()
    const now = Date.now()

    scheduled.forEach((notification) => {
      const delay = notification.scheduledFor - now

      if (delay > 0) {
        const timeout = setTimeout(() => {
          this.showLocalNotification(notification.title, notification.body, {
            data: notification.data,
            tag: notification.type,
          })
          this.removeScheduledNotification(notification.id)
        }, delay)

        this.scheduledTimeouts.set(notification.id, timeout)
      } else {
        // Remove expired notifications
        this.removeScheduledNotification(notification.id)
      }
    })
  }
}

export const notificationManager = NotificationManager.getInstance()
