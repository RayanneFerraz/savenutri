"use client"

import type React from "react"
import type { WeightEntry } from "@/types" // Declare the WeightEntry type here

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Settings,
  Bell,
  Target,
  Clock,
  Camera,
  Upload,
  X,
  Eye,
  Calendar,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Globe,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Slider } from "@/components/ui/slider"
import { savePhotoBlob, getPhotoBlobUrl, deletePhotoBlob } from "@/lib/photo-storage"
import { useLanguage } from "@/context/languageContext"
import type { Language } from "@/lib/translations"

const defaultProfile = {
  name: "",
  email: "",
  age: "",
  weight: "",
  height: "",
  goal: "weight-loss",
  fastingPlan: "16:8",
  customFastHours: "16",
  fastStartTime: "20:00",
  fastEndTime: "12:00",
  customDays: [1, 2, 3, 4, 5], // segunda-a-sexta
  notifications: {
    fastingReminders: true,
    waterReminders: true,
    progressUpdates: true,
    educational: false,
  },
} as const

export default function ProfilePage() {
  const { language, setLanguage, t } = useLanguage()

  const [profile, setProfile] = useState<typeof defaultProfile>(defaultProfile)

  const [photos, setPhotos] = useState<
    Array<{
      id: string
      url: string
      date: string
      timestamp: number
      type: "front" | "side" | "back"
      weight?: number
    }>
  >([])
  const [selectedPhotoType, setSelectedPhotoType] = useState<"front" | "side" | "back">("front")
  const [showPhotoComparison, setShowPhotoComparison] = useState(false)
  const [comparisonSlider, setComparisonSlider] = useState([50])
  const [selectedComparison, setSelectedComparison] = useState<{
    before: any
    after: any
  } | null>(null)

  useEffect(() => {
    const savedProfile = localStorage.getItem("fastingProfile")
    if (savedProfile && savedProfile !== "undefined") {
      try {
        const parsedProfile = JSON.parse(savedProfile)
        setProfile({ ...defaultProfile, ...parsedProfile })
      } catch (error) {
        console.log("Erro ao carregar perfil:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (profile.fastingPlan === "custom") {
      localStorage.setItem("fastingProfile", JSON.stringify(profile))
    }
  }, [profile])

  useEffect(() => {
    const saved = localStorage.getItem("progressPhotos")
    if (!saved || saved === "undefined") return

    try {
      const metas = JSON.parse(saved) as Omit<(typeof photos)[number], "url">[]
      Promise.all(
        metas.map(async (m) => ({
          ...m,
          url: await getPhotoBlobUrl(m.id),
        })),
      ).then(setPhotos)
    } catch (e) {
      console.error("Erro ao reidratar fotos:", e)
    }
  }, [])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const id = Date.now().toString()
    savePhotoBlob(id, file) // ① blob → IndexedDB
      .then(async () => {
        const url = URL.createObjectURL(file) // ② object-URL for immediate preview
        const meta = {
          id,
          date: new Date().toLocaleDateString(),
          timestamp: Date.now(),
          type: selectedPhotoType,
          weight: profile.weight ? Number.parseFloat(profile.weight) : undefined,
        }

        // ③ update local state (keeps url)
        setPhotos((p) => [...p, { ...meta, url }])

        // ④ persist only lightweight meta array
        const existing = JSON.parse(localStorage.getItem("progressPhotos") || "[]")
        localStorage.setItem("progressPhotos", JSON.stringify([...existing, meta]))

        toast({ title: t("photoAdded"), description: `${t("photoSaved")} ${t(selectedPhotoType)}.` })
      })
      .catch(() => toast({ title: "Erro", description: "Não foi possível salvar a foto.", variant: "destructive" }))
  }

  const deletePhoto = (photoId: string) => {
    // remove from UI
    setPhotos((p) => p.filter((ph) => ph.id !== photoId))

    // remove meta
    const existing = JSON.parse(localStorage.getItem("progressPhotos") || "[]")
    localStorage.setItem("progressPhotos", JSON.stringify(existing.filter((m: { id: string }) => m.id !== photoId)))

    deletePhotoBlob(photoId) // remove blob from IndexedDB
    toast({ title: t("photoRemoved"), description: "Foto deletada com sucesso." })
  }

  const getPhotosForComparison = (type: "front" | "side" | "back") => {
    return photos.filter((photo) => photo.type === type).sort((a, b) => a.timestamp - b.timestamp)
  }

  const generateComparison = (type: "front" | "side" | "back") => {
    const typePhotos = getPhotosForComparison(type)
    if (typePhotos.length >= 2) {
      setSelectedComparison({
        before: typePhotos[0],
        after: typePhotos[typePhotos.length - 1],
      })
      setShowPhotoComparison(true)
    }
  }

  const handleSave = () => {
    localStorage.setItem("fastingProfile", JSON.stringify(profile))

    // Add weight to history if it's a new weight
    const weightValue = Number.parseFloat(profile.weight)
    const weightHistory = JSON.parse(localStorage.getItem("weightHistory") || "[]")
    const lastWeightEntry = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null

    if (!lastWeightEntry || lastWeightEntry.weight !== weightValue) {
      const newEntry: WeightEntry = {
        date: new Date().toLocaleDateString(),
        weight: weightValue,
        timestamp: Date.now(),
      }
      localStorage.setItem("weightHistory", JSON.stringify([...weightHistory, newEntry]))
      window.dispatchEvent(new CustomEvent("localStorageChange", { detail: { key: "weightHistory" } }))
    }

    toast({
      title: t("profileUpdated"),
      description: t("infoSaved"),
    })
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setProfile((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#F24E29] mb-2">{t("myProfile")}</h1>
            <p className="text-gray-600">{t("manageInfo")}</p>
          </div>

          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#F2AEE7] to-[#F2C12E] text-white">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t("personalInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("fullName")}</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">{t("age")}</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile((prev) => ({ ...prev, age: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">{t("weight")}</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={profile.weight}
                      onChange={(e) => setProfile((prev) => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">{t("height")}</Label>
                    <Input
                      id="height"
                      type="number"
                      value={profile.height}
                      onChange={(e) => setProfile((prev) => ({ ...prev, height: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal">{t("mainGoal")}</Label>
                    <Select
                      value={profile.goal}
                      onValueChange={(value) => setProfile((prev) => ({ ...prev, goal: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight-loss">{t("weightLoss")}</SelectItem>
                        <SelectItem value="maintenance">{t("maintenance")}</SelectItem>
                        <SelectItem value="health">{t("generalHealth")}</SelectItem>
                        <SelectItem value="muscle-gain">{t("muscleGain")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fasting Preferences */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#F27D16] to-[#F24E29] text-white">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {t("fastingPrefs")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fasting-plan">{t("preferredPlan")}</Label>
                  <Select
                    value={profile.fastingPlan}
                    onValueChange={(value) => setProfile((prev) => ({ ...prev, fastingPlan: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:8">
                        16:8 (16h {t("fasting").toLowerCase()}, 8h {t("eating").toLowerCase()})
                      </SelectItem>
                      <SelectItem value="18:6">
                        18:6 (18h {t("fasting").toLowerCase()}, 6h {t("eating").toLowerCase()})
                      </SelectItem>
                      <SelectItem value="20:4">
                        20:4 (20h {t("fasting").toLowerCase()}, 4h {t("eating").toLowerCase()})
                      </SelectItem>
                      <SelectItem value="omad">OMAD</SelectItem>
                      <SelectItem value="5:2">5:2</SelectItem>
                      <SelectItem value="custom">{t("customFasting")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {profile.fastingPlan === "custom" && (
                  <Card className="mt-4 border-2 border-[#F2AEE7]">
                    <CardHeader className="bg-[#F2EAE4]">
                      <CardTitle className="text-[#F24E29] text-lg">{t("customFasting")}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="custom-fast-hours">{t("fastingHours")}</Label>
                          <Select
                            value={profile.customFastHours || "16"}
                            onValueChange={(value) => setProfile((prev) => ({ ...prev, customFastHours: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="8">8 {t("hours")}</SelectItem>
                              <SelectItem value="10">10 {t("hours")}</SelectItem>
                              <SelectItem value="12">12 {t("hours")}</SelectItem>
                              <SelectItem value="14">14 {t("hours")}</SelectItem>
                              <SelectItem value="16">16 {t("hours")}</SelectItem>
                              <SelectItem value="18">18 {t("hours")}</SelectItem>
                              <SelectItem value="20">20 {t("hours")}</SelectItem>
                              <SelectItem value="22">22 {t("hours")}</SelectItem>
                              <SelectItem value="24">24 {t("hours")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="custom-eat-hours">{t("eatingWindow")}</Label>
                          <Input
                            id="custom-eat-hours"
                            type="number"
                            min="0"
                            max="16"
                            value={24 - Number.parseInt(profile.customFastHours || "16")}
                            disabled
                            className="bg-gray-50"
                          />
                          <p className="text-xs text-gray-500">{t("autoCalculated")}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fast-start">{t("fastStart")}</Label>
                          <Input
                            id="fast-start"
                            type="time"
                            value={profile.fastStartTime || "20:00"}
                            onChange={(e) => setProfile((prev) => ({ ...prev, fastStartTime: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fast-end">{t("fastEnd")}</Label>
                          <Input
                            id="fast-end"
                            type="time"
                            value={profile.fastEndTime || "12:00"}
                            onChange={(e) => setProfile((prev) => ({ ...prev, fastEndTime: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="custom-days">{t("weekDays")}</Label>
                        <div className="grid grid-cols-7 gap-2">
                          {[t("sun"), t("mon"), t("tue"), t("wed"), t("thu"), t("fri"), t("sat")].map((day, index) => (
                            <Button
                              key={day}
                              variant={profile.customDays?.includes(index) ? "default" : "outline"}
                              size="sm"
                              className={`text-xs ${profile.customDays?.includes(index) ? "bg-[#F24E29]" : ""}`}
                              onClick={() => {
                                const currentDays = profile.customDays || [1, 2, 3, 4, 5]
                                const newDays = currentDays.includes(index)
                                  ? currentDays.filter((d) => d !== index)
                                  : [...currentDays, index].sort()
                                setProfile((prev) => ({ ...prev, customDays: newDays }))
                              }}
                            >
                              {day}
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          {t("selected")}: {(profile.customDays || [1, 2, 3, 4, 5]).length} {t("days")}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-[#F2AEE7] to-[#F2C12E] p-4 rounded-lg text-white">
                        <h4 className="font-semibold mb-2">{t("planSummary")}</h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            • {t("fasting")}: {profile.customFastHours || "16"} {t("hours")}
                          </p>
                          <p>
                            • {t("eating")}: {24 - Number.parseInt(profile.customFastHours || "16")} {t("hours")}
                          </p>
                          <p>
                            • {t("schedule")}: {profile.fastStartTime || "20:00"} - {profile.fastEndTime || "12:00"}
                          </p>
                          <p>
                            • {t("frequency")}: {(profile.customDays || [1, 2, 3, 4, 5]).length} {t("daysPerWeek")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
              </Card>

              {/* Language */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {t("language")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language-select">{t("selectLanguage")}</Label>
                    <Select
                      value={language}
                      onValueChange={(val) => setLanguage(val as Language)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#F2C12E] to-[#F27D16] text-white">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {t("notifications")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="fasting-reminders">{t("fastingReminders")}</Label>
                      <p className="text-sm text-gray-600">{t("fastingRemindersDesc")}</p>
                    </div>
                    <Switch
                      id="fasting-reminders"
                      checked={profile.notifications.fastingReminders}
                      onCheckedChange={(checked) => handleNotificationChange("fastingReminders", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="water-reminders">{t("waterReminders")}</Label>
                      <p className="text-sm text-gray-600">{t("waterRemindersDesc")}</p>
                    </div>
                    <Switch
                      id="water-reminders"
                      checked={profile.notifications.waterReminders}
                      onCheckedChange={(checked) => handleNotificationChange("waterReminders", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="progress-updates">{t("progressUpdates")}</Label>
                      <p className="text-sm text-gray-600">{t("progressUpdatesDesc")}</p>
                    </div>
                    <Switch
                      id="progress-updates"
                      checked={profile.notifications.progressUpdates}
                      onCheckedChange={(checked) => handleNotificationChange("progressUpdates", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="educational">{t("educational")}</Label>
                      <p className="text-sm text-gray-600">{t("educationalDesc")}</p>
                    </div>
                    <Switch
                      id="educational"
                      checked={profile.notifications.educational}
                      onCheckedChange={(checked) => handleNotificationChange("educational", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goals */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#F2AEE7] to-[#F2C12E] text-white">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {t("goalsObjectives")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight-goal">{t("weightGoal")}</Label>
                    <Input id="weight-goal" type="number" placeholder="Ex: 70" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weekly-fasts">{t("weeklyFasts")}</Label>
                    <Select defaultValue="5">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 {t("weeklyFasts").toLowerCase()}</SelectItem>
                        <SelectItem value="4">4 {t("weeklyFasts").toLowerCase()}</SelectItem>
                        <SelectItem value="5">5 {t("weeklyFasts").toLowerCase()}</SelectItem>
                        <SelectItem value="6">6 {t("weeklyFasts").toLowerCase()}</SelectItem>
                        <SelectItem value="7">7 {t("weeklyFasts").toLowerCase()}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-[#F2EAE4] p-4 rounded-lg">
                  <h4 className="font-semibold text-[#F24E29] mb-2">{t("currentProgress")}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t("currentWeight")}:</span>
                      <span className="font-medium">{profile.weight}kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IMC:</span>
                      <span className="font-medium">
                        {profile.weight && profile.height && Number.parseFloat(profile.height) > 0
                          ? (
                              Number.parseFloat(profile.weight) / Math.pow(Number.parseFloat(profile.height) / 100, 2)
                            ).toFixed(1)
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("fastsThisWeek")}:</span>
                      <span className="font-medium">5/7</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Photos */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  {t("progressPhotos")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Photo Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label className="text-sm font-medium">{t("photoType")}</Label>
                    <div className="flex gap-2">
                      {(["front", "side", "back"] as const).map((type) => (
                        <Button
                          key={type}
                          variant={selectedPhotoType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedPhotoType(type)}
                          className={selectedPhotoType === type ? "bg-[#F24E29]" : ""}
                        >
                          {t(type)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-[#F2AEE7] rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-[#F24E29] mx-auto mb-2" />
                      <p className="text-[#F24E29] font-medium">{t("clickToAdd")}</p>
                      <p className="text-sm text-gray-500">{t("fileTypes")}</p>
                    </label>
                  </div>
                </div>

                {/* Photo Gallery */}
                <div className="space-y-4">
                  {(["front", "side", "back"] as const).map((type) => {
                    const typePhotos = getPhotosForComparison(type)
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-[#F24E29]">
                            {t(type)} ({typePhotos.length} {t("photos")})
                          </h4>
                          {typePhotos.length >= 2 && (
                            <Button
                              size="sm"
                              onClick={() => generateComparison(type)}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {t("compare")}
                            </Button>
                          )}
                        </div>

                        {typePhotos.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {typePhotos.map((photo) => (
                              <div key={photo.id} className="relative group">
                                <img
                                  src={photo.url || "/placeholder.svg"}
                                  alt={`${t("progressPhotos")} ${t(type)} - ${photo.date}`}
                                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deletePhoto(photo.id)}
                                    className="p-1"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg">
                                  <div>{photo.date}</div>
                                  {photo.weight && <div>{photo.weight}kg</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            {t("noPhotos")} {t(type)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-[#F27D16] to-[#F24E29] hover:from-[#F27D16]/90 hover:to-[#F24E29]/90 text-white px-8 py-3"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t("saveChanges")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Comparison Modal */}
      {showPhotoComparison && selectedComparison && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#F24E29]">
                  {t("progressPhotos")} - {t("compare")}
                </h3>
                <Button variant="ghost" onClick={() => setShowPhotoComparison(false)} className="p-2">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Comparison Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Foto Inicial</h4>
                  <div className="text-sm text-blue-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" />
                      {selectedComparison.before.date}
                    </div>
                    {selectedComparison.before.weight && <div>Peso: {selectedComparison.before.weight}kg</div>}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Foto Atual</h4>
                  <div className="text-sm text-green-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" />
                      {selectedComparison.after.date}
                    </div>
                    {selectedComparison.after.weight && <div>Peso: {selectedComparison.after.weight}kg</div>}
                    {selectedComparison.before.weight && selectedComparison.after.weight && (
                      <div className="font-bold">
                        Diferença: {(selectedComparison.after.weight - selectedComparison.before.weight).toFixed(1)}kg
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Comparison Methods */}
              <div className="space-y-6">
                {/* Side by Side Comparison */}
                <div>
                  <h4 className="font-semibold text-[#F24E29] mb-3">Comparação Lado a Lado</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-blue-600 flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        Antes - {selectedComparison.before.date}
                      </div>
                      <img
                        src={selectedComparison.before.url || "/placeholder.svg"}
                        alt="Foto anterior"
                        className="w-full h-80 md:h-96 object-cover rounded-lg border-2 border-blue-200 shadow-lg"
                      />
                      {selectedComparison.before.weight && (
                        <div className="text-center text-sm text-blue-600 font-medium">
                          Peso: {selectedComparison.before.weight}kg
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-green-600 flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Depois - {selectedComparison.after.date}
                      </div>
                      <img
                        src={selectedComparison.after.url || "/placeholder.svg"}
                        alt="Foto atual"
                        className="w-full h-80 md:h-96 object-cover rounded-lg border-2 border-green-200 shadow-lg"
                      />
                      {selectedComparison.after.weight && (
                        <div className="text-center text-sm text-green-600 font-medium">
                          Peso: {selectedComparison.after.weight}kg
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Slider Comparison */}
                <div>
                  <h4 className="font-semibold text-[#F24E29] mb-3">Comparação com Slider</h4>
                  <div className="relative">
                    <div className="relative w-full h-96 md:h-[500px] overflow-hidden rounded-lg border-2 border-[#F24E29]">
                      {/* Before Image */}
                      <img
                        src={selectedComparison.before.url || "/placeholder.svg"}
                        alt="Foto anterior"
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                      {/* After Image with clip */}
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ clipPath: `inset(0 ${100 - comparisonSlider[0]}% 0 0)` }}
                      >
                        <img
                          src={selectedComparison.after.url || "/placeholder.svg"}
                          alt="Foto atual"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      {/* Divider Line */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-xl z-10"
                        style={{ left: `${comparisonSlider[0]}%` }}
                      >
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-[#F24E29]">
                          <ArrowLeft className="w-4 h-4 text-blue-500" />
                          <ArrowRight className="w-4 h-4 text-green-500" />
                        </div>
                      </div>

                      {/* Labels */}
                      <div className="absolute top-4 left-4 bg-blue-600/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Antes
                      </div>
                      <div className="absolute top-4 right-4 bg-green-600/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Depois
                      </div>
                    </div>

                    {/* Slider Control */}
                    <div className="mt-6 px-4">
                      <Slider
                        value={comparisonSlider}
                        onValueChange={setComparisonSlider}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          Antes ({selectedComparison.before.date})
                        </span>
                        <span className="font-bold text-[#F24E29]">{comparisonSlider[0]}%</span>
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          Depois ({selectedComparison.after.date})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reset Slider Button */}
                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={() => setComparisonSlider([50])}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Resetar Slider
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
