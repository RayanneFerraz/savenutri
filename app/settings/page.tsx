"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bell, User, Database } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/context/languageContext"
import ReminderSettings from "@/components/reminder-settings"
import NotificationManager from "@/components/notification-manager"

export default function SettingsPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 pb-24">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("settings")}</h1>
            <p className="text-sm text-muted-foreground">{t("customizeExperience")}</p>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">{t("notifications")}</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">{t("reminders")}</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{t("account")}</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">{t("data")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            <NotificationManager />
          </TabsContent>

          <TabsContent value="reminders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  {t("reminderSettings")}
                </CardTitle>
                <CardDescription>{t("reminderSettingsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ReminderSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  {t("accountSettings")}
                </CardTitle>
                <CardDescription>{t("accountSettingsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{t("syncData")}</p>
                      <p className="text-sm text-muted-foreground">{t("syncDataDesc")}</p>
                    </div>
                    <Link href="/auth/login">
                      <Button variant="outline">{t("signIn")}</Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{t("exportData")}</p>
                      <p className="text-sm text-muted-foreground">{t("exportDataDesc")}</p>
                    </div>
                    <Button variant="outline">{t("export")}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-500" />
                  {t("dataManagement")}
                </CardTitle>
                <CardDescription>{t("dataManagementDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{t("clearLocalData")}</p>
                      <p className="text-sm text-muted-foreground">{t("clearLocalDataDesc")}</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      {t("clear")}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{t("deleteAccount")}</p>
                      <p className="text-sm text-muted-foreground">{t("deleteAccountDesc")}</p>
                    </div>
                    <Button variant="destructive" size="sm" disabled>
                      {t("delete")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
