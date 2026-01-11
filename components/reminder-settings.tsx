"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Bell, Droplets, Timer, Sun, Clock, Plus, Trash2 } from "lucide-react"
import { useLanguage } from "@/context/languageContext"
import { notificationManager } from "@/lib/notifications"
import { useToast } from "@/hooks/use-toast"

interface ReminderSchedule {
  id: string
  type: "water" | "fasting" | "daily"
  enabled: boolean
  time: string
  days: number[]
  message?: string
}

const defaultReminders: ReminderSchedule[] = [
  {
    id: "water-morning",
    type: "water",
    enabled: true,
    time: "08:00",
    days: [0, 1, 2, 3, 4, 5, 6],
    message: "Good morning! Start your day hydrated.",
  },
  {
    id: "water-afternoon",
    type: "water",
    enabled: true,
    time: "14:00",
    days: [0, 1, 2, 3, 4, 5, 6],
    message: "Afternoon hydration check!",
  },
  {
    id: "fasting-start",
    type: "fasting",
    enabled: true,
    time: "20:00",
    days: [0, 1, 2, 3, 4, 5, 6],
    message: "Time to start your fasting window.",
  },
  {
    id: "fasting-end",
    type: "fasting",
    enabled: true,
    time: "12:00",
    days: [0, 1, 2, 3, 4, 5, 6],
    message: "Fasting window complete! Time to eat.",
  },
]

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function ReminderSettings() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [reminders, setReminders] = useState<ReminderSchedule[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    loadSettings()
    checkPermission()
  }, [])

  const loadSettings = () => {
    const saved = localStorage.getItem("reminderSettings")
    if (saved) {
      setReminders(JSON.parse(saved))
    } else {
      setReminders(defaultReminders)
    }

    const notifEnabled = localStorage.getItem("notificationsEnabled")
    setNotificationsEnabled(notifEnabled === "true")
  }

  const checkPermission = async () => {
    const perm = await notificationManager.getPermission()
    setPermission(perm)
    if (perm === "granted") {
      setNotificationsEnabled(true)
    }
  }

  const saveSettings = (newReminders: ReminderSchedule[]) => {
    localStorage.setItem("reminderSettings", JSON.stringify(newReminders))
    setReminders(newReminders)
    scheduleReminders(newReminders)
  }

  const scheduleReminders = (reminderList: ReminderSchedule[]) => {
    // Clear existing scheduled notifications
    notificationManager.clearAllScheduledNotifications()

    if (!notificationsEnabled) return

    reminderList.forEach((reminder) => {
      if (!reminder.enabled) return

      const [hours, minutes] = reminder.time.split(":").map(Number)
      const now = new Date()
      const today = now.getDay()

      // Schedule for each enabled day
      reminder.days.forEach((day) => {
        let daysUntil = day - today
        if (daysUntil < 0) daysUntil += 7
        if (daysUntil === 0) {
          const scheduledTime = new Date()
          scheduledTime.setHours(hours, minutes, 0, 0)
          if (scheduledTime.getTime() <= now.getTime()) {
            daysUntil = 7 // Already passed today, schedule for next week
          }
        }

        const scheduledDate = new Date(now)
        scheduledDate.setDate(now.getDate() + daysUntil)
        scheduledDate.setHours(hours, minutes, 0, 0)

        const title =
          reminder.type === "water"
            ? t("waterReminder")
            : reminder.type === "fasting"
              ? t("fastingReminder")
              : t("dailyReminder")

        notificationManager.scheduleLocalNotification({
          title,
          body: reminder.message || t("reminderDefaultMessage"),
          scheduledFor: scheduledDate.getTime(),
          type: reminder.type === "water" ? "water" : reminder.type === "fasting" ? "timer" : "reminder",
          data: { reminderId: reminder.id },
        })
      })
    })
  }

  const handleEnableNotifications = async () => {
    const granted = await notificationManager.requestPermission()
    if (granted) {
      setNotificationsEnabled(true)
      localStorage.setItem("notificationsEnabled", "true")
      setPermission("granted")
      scheduleReminders(reminders)
      toast({
        title: t("notificationsEnabled"),
        description: t("notificationsEnabledDesc"),
      })
    } else {
      toast({
        title: t("notificationsDenied"),
        description: t("notificationsDeniedDesc"),
        variant: "destructive",
      })
    }
  }

  const toggleReminder = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    saveSettings(updated)
  }

  const updateReminderTime = (id: string, time: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, time } : r))
    saveSettings(updated)
  }

  const toggleDay = (id: string, day: number) => {
    const updated = reminders.map((r) => {
      if (r.id !== id) return r
      const days = r.days.includes(day) ? r.days.filter((d) => d !== day) : [...r.days, day].sort()
      return { ...r, days }
    })
    saveSettings(updated)
  }

  const addReminder = (type: "water" | "fasting" | "daily") => {
    const newReminder: ReminderSchedule = {
      id: `${type}-${Date.now()}`,
      type,
      enabled: true,
      time: type === "water" ? "10:00" : type === "fasting" ? "20:00" : "09:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      message: "",
    }
    saveSettings([...reminders, newReminder])
  }

  const deleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id)
    saveSettings(updated)
  }

  const ReminderCard = ({ reminder }: { reminder: ReminderSchedule }) => (
    <Card className={`transition-all ${!reminder.enabled ? "opacity-60" : ""}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                reminder.type === "water"
                  ? "bg-blue-100"
                  : reminder.type === "fasting"
                    ? "bg-orange-100"
                    : "bg-purple-100"
              }`}
            >
              {reminder.type === "water" ? (
                <Droplets className="w-4 h-4 text-blue-600" />
              ) : reminder.type === "fasting" ? (
                <Timer className="w-4 h-4 text-orange-600" />
              ) : (
                <Sun className="w-4 h-4 text-purple-600" />
              )}
            </div>
            <div>
              <p className="font-medium capitalize">{t(reminder.type + "Reminder")}</p>
              <p className="text-xs text-muted-foreground">{reminder.message || t("reminderDefaultMessage")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={reminder.enabled} onCheckedChange={() => toggleReminder(reminder.id)} />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700"
              onClick={() => deleteReminder(reminder.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {reminder.enabled && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Input
                type="time"
                value={reminder.time}
                onChange={(e) => updateReminderTime(reminder.id, e.target.value)}
                className="w-32"
              />
            </div>

            <div className="flex gap-1">
              {dayNames.map((name, index) => (
                <button
                  key={index}
                  onClick={() => toggleDay(reminder.id, index)}
                  className={`w-9 h-9 rounded-full text-xs font-medium transition-colors ${
                    reminder.days.includes(index)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {name.charAt(0)}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Permission Card */}
      {permission !== "granted" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Bell className="w-8 h-8 text-orange-500" />
              <div className="flex-1">
                <h3 className="font-medium">{t("enableNotifications")}</h3>
                <p className="text-sm text-muted-foreground">{t("enableNotificationsDesc")}</p>
              </div>
              <Button onClick={handleEnableNotifications}>{t("enable")}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Water Reminders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            {t("waterReminders")}
          </h3>
          <Button variant="outline" size="sm" onClick={() => addReminder("water")}>
            <Plus className="w-4 h-4 mr-1" />
            {t("add")}
          </Button>
        </div>
        <div className="space-y-3">
          {reminders
            .filter((r) => r.type === "water")
            .map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
        </div>
      </div>

      {/* Fasting Reminders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Timer className="w-5 h-5 text-orange-500" />
            {t("fastingReminders")}
          </h3>
          <Button variant="outline" size="sm" onClick={() => addReminder("fasting")}>
            <Plus className="w-4 h-4 mr-1" />
            {t("add")}
          </Button>
        </div>
        <div className="space-y-3">
          {reminders
            .filter((r) => r.type === "fasting")
            .map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
        </div>
      </div>

      {/* Daily Reminders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Sun className="w-5 h-5 text-purple-500" />
            {t("dailyReminders")}
          </h3>
          <Button variant="outline" size="sm" onClick={() => addReminder("daily")}>
            <Plus className="w-4 h-4 mr-1" />
            {t("add")}
          </Button>
        </div>
        <div className="space-y-3">
          {reminders
            .filter((r) => r.type === "daily")
            .map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
        </div>
      </div>
    </div>
  )
}
