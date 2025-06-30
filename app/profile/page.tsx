"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Shell } from "@/components/shell"
import { useAuth } from "@/context/authContext"
import { useLanguage } from "@/context/languageContext"
import { useTranslation } from "@/lib/translations"
import { User, Settings, Bell, Download, Trash2 } from "lucide-react"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { language, setLanguage } = useLanguage()
  const t = useTranslation(language)

  // Profile state
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [currentWeight, setCurrentWeight] = useState("70")
  const [targetWeight, setTargetWeight] = useState("65")
  const [height, setHeight] = useState("170")
  const [age, setAge] = useState("30")
  const [gender, setGender] = useState("prefer-not-to-say")

  // Fasting preferences
  const [defaultGoal, setDefaultGoal] = useState("16")
  const [reminderTime, setReminderTime] = useState("08:00")

  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(true)
  const [monthlyReport, setMonthlyReport] = useState(true)
  const [achievementNotifications, setAchievementNotifications] = useState(true)
  const [tipNotifications, setTipNotifications] = useState(false)

  // App settings
  const [theme, setTheme] = useState("system")
  const [units, setUnits] = useState("metric")

  const handleSave = () => {
    // Save profile data
    console.log("Saving profile data...")
  }

  const handleExportData = () => {
    // Export user data
    console.log("Exporting data...")
  }

  const handleDeleteAccount = () => {
    // Delete account with confirmation
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.log("Deleting account...")
    }
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("profileTitle")}</h1>
          <p className="text-muted-foreground">{t("manageInfo")}</p>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("personalInfo")}
            </CardTitle>
            <CardDescription>{t("manageInfo")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentWeight">{t("currentWeight")} (kg)</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetWeight">{t("targetWeight")} (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">{t("height")} (cm)</Label>
                <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">{t("age")}</Label>
                <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">{t("gender")}</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("male")}</SelectItem>
                    <SelectItem value="female">{t("female")}</SelectItem>
                    <SelectItem value="other">{t("other")}</SelectItem>
                    <SelectItem value="prefer-not-to-say">{t("preferNotToSay")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fasting Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>{t("fastingPrefs")}</CardTitle>
            <CardDescription>{t("fastingPrefs")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultGoal">{t("defaultFastingGoal")}</Label>
                <Select value={defaultGoal} onValueChange={setDefaultGoal}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 {t("hours")}</SelectItem>
                    <SelectItem value="16">16 {t("hours")}</SelectItem>
                    <SelectItem value="18">18 {t("hours")}</SelectItem>
                    <SelectItem value="24">24 {t("hours")}</SelectItem>
                    <SelectItem value="36">36 {t("hours")}</SelectItem>
                    <SelectItem value="48">48 {t("hours")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminderTime">{t("reminderTime")}</Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("notifications")}
            </CardTitle>
            <CardDescription>{t("manageInfo")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">{t("fastingReminders")}</Label>
                <p className="text-sm text-muted-foreground">{t("fastingRemindersDesc")}</p>
              </div>
              <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="sound">{t("soundEnabled")}</Label>
              <Switch
                id="sound"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
                disabled={!notificationsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="vibration">{t("vibrationEnabled")}</Label>
              <Switch
                id="vibration"
                checked={vibrationEnabled}
                onCheckedChange={setVibrationEnabled}
                disabled={!notificationsEnabled}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="weeklyReport">{t("weeklyReport")}</Label>
              <Switch
                id="weeklyReport"
                checked={weeklyReport}
                onCheckedChange={setWeeklyReport}
                disabled={!notificationsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="monthlyReport">{t("monthlyReport")}</Label>
              <Switch
                id="monthlyReport"
                checked={monthlyReport}
                onCheckedChange={setMonthlyReport}
                disabled={!notificationsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="achievements">{t("achievementNotifications")}</Label>
              <Switch
                id="achievements"
                checked={achievementNotifications}
                onCheckedChange={setAchievementNotifications}
                disabled={!notificationsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="tips">{t("educational")}</Label>
              <Switch
                id="tips"
                checked={tipNotifications}
                onCheckedChange={setTipNotifications}
                disabled={!notificationsEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("settings")}
            </CardTitle>
            <CardDescription>{t("manageInfo")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">{t("language")}</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="units">Units</Label>
                <Select value={units} onValueChange={setUnits}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric</SelectItem>
                    <SelectItem value="imperial">Imperial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("accountSettings")}</CardTitle>
            <CardDescription>{t("manageInfo")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleSave} className="flex-1">
                {t("saveChanges")}
              </Button>
              <Button variant="outline" onClick={handleExportData} className="flex-1 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                {t("dataExport")}
              </Button>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={logout} className="flex-1 bg-transparent">
                {t("logOut")}
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount} className="flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                {t("deleteAccount")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}
