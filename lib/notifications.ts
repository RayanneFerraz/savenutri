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
  private vapidPublicKey = "BGVxsToCXmpx4iPM9ecvi0MavKZq0MTDBuRyWdwDB4Jrqn5EkG-GLjbnJd4I6iwd3i8us70ZOZvX1p0v-ZKATdU"

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      console.log("Notifications not supported")
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

      const token: NotificationToken = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))),
        },
        createdAt: Date.now(),
      }

      localStorage.setItem("pushToken", JSON.stringify(token))
      console.log("Push subscription created:", token)

      return subscription
    } catch (error) {
      console.error("Error creating push subscription:", error)
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

  scheduleLocalNotification(notification: Omit<ScheduledNotification, "id">) {
    const id = Date.now().toString()
    const scheduledNotification: ScheduledNotification = { ...notification, id }

    const scheduled = this.getScheduledNotifications()
    scheduled.push(scheduledNotification)
    localStorage.setItem("scheduledNotifications", JSON.stringify(scheduled))

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

  scheduleTimerNotification(duration: number, type: "start" | "end") {
    const now = Date.now()
    const scheduledFor = now + duration

    if (type === "start") {
      this.scheduleLocalNotification({
        title: "Fasting Started! 🚀",
        body: "Your fasting period has begun. Good luck!",
        scheduledFor: now + 1000,
        type: "timer",
        data: { timerType: "start" },
      })
    } else {
      this.scheduleLocalNotification({
        title: "Fasting Complete! 🎉",
        body: "Congratulations! You've successfully completed your fast.",
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

    if (scheduledTime.getTime() <= now.getTime()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    this.scheduleLocalNotification({
      title: "Time to Fast! ⏰",
      body: "How about starting your fast now?",
      scheduledFor: scheduledTime.getTime(),
      type: "reminder",
    })
  }

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
        throw new Error("Failed to send notification")
      }

      return await response.json()
    } catch (error) {
      console.error("Error sending push notification:", error)
      this.showLocalNotification(title, body, { data })
    }
  }
}

export const notificationManager = NotificationManager.getInstance()
