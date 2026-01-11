"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, BellOff, BellRing, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { notificationManager } from "@/lib/notifications"
import { useLanguage } from "@/context/languageContext"

interface NotificationSettings {
  fastingReminders: boolean
  waterReminders: boolean
  achievements: boolean
  dailyTips: boolean
}

export default function PWANotifications() {
  const { t } = useLanguage()
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    fastingReminders: true,
    waterReminders: true,
    achievements: true,
    dailyTips: false,
  })
  const { toast } = useToast()

  useEffect(() => {
    const checkSupport = async () => {
      const supported = await notificationManager.isSupported()
      setIsSupported(supported)

      if (supported) {
        const perm = await notificationManager.getPermission()
        setPermission(perm)

        // Check if already subscribed
        const token = localStorage.getItem("pushToken")
        setIsSubscribed(!!token && perm === "granted")

        // Restore scheduled notifications
        notificationManager.restoreScheduledNotifications()
      }

      // Load saved settings
      const savedSettings = localStorage.getItem("notificationSettings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    }

    checkSupport()
  }, [])

  const enableNotifications = async () => {
    if (!isSupported) {
      toast({
        title: t("notSupported"),
        description: t("browserNotSupported"),
        variant: "destructive",
      })
      return
    }

    try {
      const granted = await notificationManager.requestPermission()

      if (granted) {
        setPermission("granted")

        // Subscribe to push
        const subscription = await notificationManager.subscribeToPush()
        setIsSubscribed(!!subscription)

        toast({
          title: t("notificationsEnabled"),
          description: t("notificationsEnabledDesc"),
        })
      } else {
        setPermission("denied")
        toast({
          title: t("notificationsDenied"),
          description: t("notificationsDeniedDesc"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error enabling notifications:", error)
      toast({
        title: t("error"),
        description: t("notificationsError"),
        variant: "destructive",
      })
    }
  }

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem("notificationSettings", JSON.stringify(newSettings))

    toast({
      title: t("settingsSaved"),
      description: value ? t("notificationTypeEnabled") : t("notificationTypeDisabled"),
    })
  }

  const sendTestNotification = () => {
    if (permission === "granted") {
      notificationManager.showLocalNotification("FastTrack - Teste", t("testNotificationBody"), {
        tag: "test-notification",
      })

      toast({
        title: t("testSent"),
        description: t("checkNotification"),
      })
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#F24E29]">
          <Bell className="h-5 w-5" />
          {t("notifications")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {permission === "granted" ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : permission === "denied" ? (
              <BellOff className="h-5 w-5 text-red-500" />
            ) : (
              <BellRing className="h-5 w-5 text-yellow-500" />
            )}
            <div>
              <p className="font-medium">
                {permission === "granted"
                  ? t("notificationsActive")
                  : permission === "denied"
                    ? t("notificationsBlocked")
                    : t("notificationsNotConfigured")}
              </p>
              <p className="text-sm text-gray-500">
                {permission === "granted"
                  ? t("notificationsActiveDesc")
                  : permission === "denied"
                    ? t("notificationsBlockedDesc")
                    : t("notificationsNotConfiguredDesc")}
              </p>
            </div>
          </div>

          {permission !== "granted" && (
            <Button
              onClick={enableNotifications}
              className="bg-[#F24E29] hover:bg-[#F24E29]/90 text-white"
              disabled={permission === "denied"}
            >
              {t("enable")}
            </Button>
          )}
        </div>

        {/* Settings - only show if notifications are enabled */}
        {permission === "granted" && (
          <>
            <div className="space-y-4">
              <h4 className="font-medium">{t("notificationTypes")}</h4>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="fasting-reminders">{t("fastingReminders")}</Label>
                  <p className="text-sm text-gray-500">{t("fastingRemindersDesc")}</p>
                </div>
                <Switch
                  id="fasting-reminders"
                  checked={settings.fastingReminders}
                  onCheckedChange={(value) => updateSetting("fastingReminders", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="water-reminders">{t("waterReminders")}</Label>
                  <p className="text-sm text-gray-500">{t("waterRemindersDesc")}</p>
                </div>
                <Switch
                  id="water-reminders"
                  checked={settings.waterReminders}
                  onCheckedChange={(value) => updateSetting("waterReminders", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="achievements">{t("achievementNotifications")}</Label>
                  <p className="text-sm text-gray-500">{t("achievementNotificationsDesc")}</p>
                </div>
                <Switch
                  id="achievements"
                  checked={settings.achievements}
                  onCheckedChange={(value) => updateSetting("achievements", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="daily-tips">{t("dailyTips")}</Label>
                  <p className="text-sm text-gray-500">{t("dailyTipsDesc")}</p>
                </div>
                <Switch
                  id="daily-tips"
                  checked={settings.dailyTips}
                  onCheckedChange={(value) => updateSetting("dailyTips", value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button onClick={sendTestNotification} variant="outline" className="w-full bg-transparent">
                <Bell className="h-4 w-4 mr-2" />
                {t("sendTestNotification")}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
