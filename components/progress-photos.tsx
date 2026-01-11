"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Upload, Trash2, X, Loader2, ImageIcon, Calendar, Scale } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useLanguage } from "@/context/languageContext"
import Image from "next/image"

interface ProgressPhoto {
  id: string
  photo_url: string
  date: string
  category: string
  notes?: string
  weight?: number
}

export function ProgressPhotos() {
  const { t } = useLanguage()
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null)
  const [uploadData, setUploadData] = useState({
    category: "progress",
    notes: "",
    weight: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/photos")
      const data = await response.json()
      if (data.photos) {
        setPhotos(data.photos)
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", uploadData.category)
      formData.append("notes", uploadData.notes)
      if (uploadData.weight) {
        formData.append("weight", uploadData.weight)
      }

      const response = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: t("progress.photoUploaded") || "Photo uploaded!",
          description: t("progress.photoUploadedDesc") || "Your progress photo has been saved.",
        })
        fetchPhotos()
        setShowUploadModal(false)
        setUploadData({ category: "progress", notes: "", weight: "" })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: t("common.error") || "Error",
        description: t("progress.uploadFailed") || "Failed to upload photo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async (photoId: string) => {
    if (!confirm(t("progress.confirmDelete") || "Are you sure you want to delete this photo?")) {
      return
    }

    try {
      const response = await fetch(`/api/photos?id=${photoId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPhotos(photos.filter((p) => p.id !== photoId))
        setSelectedPhoto(null)
        toast({
          title: t("progress.photoDeleted") || "Photo deleted",
          description: t("progress.photoDeletedDesc") || "Your photo has been removed.",
        })
      }
    } catch (error) {
      toast({
        title: t("common.error") || "Error",
        description: t("progress.deleteFailed") || "Failed to delete photo.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#F24E29]" />
          {t("progress.photos") || "Progress Photos"}
        </CardTitle>
        <Button onClick={() => setShowUploadModal(true)} className="bg-[#F24E29] hover:bg-[#F24E29]/90">
          <Upload className="w-4 h-4 mr-2" />
          {t("progress.addPhoto") || "Add Photo"}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#F24E29]" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t("progress.noPhotos") || "No progress photos yet"}</p>
            <p className="text-sm">{t("progress.addFirstPhoto") || "Add your first photo to track your journey"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setSelectedPhoto(photo)}
              >
                <Image
                  src={photo.photo_url || "/placeholder.svg"}
                  alt={`Progress photo from ${photo.date}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 text-white text-sm">{formatDate(photo.date)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("progress.uploadPhoto") || "Upload Photo"}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowUploadModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("progress.category") || "Category"}</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                  >
                    <option value="progress">{t("progress.categoryProgress") || "Progress"}</option>
                    <option value="before">{t("progress.categoryBefore") || "Before"}</option>
                    <option value="after">{t("progress.categoryAfter") || "After"}</option>
                    <option value="milestone">{t("progress.categoryMilestone") || "Milestone"}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    {t("progress.currentWeight") || "Current Weight (optional)"}
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 75.5"
                    value={uploadData.weight}
                    onChange={(e) => setUploadData({ ...uploadData, weight: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("progress.notes") || "Notes (optional)"}</Label>
                  <Textarea
                    placeholder={t("progress.notesPlaceholder") || "How are you feeling today?"}
                    value={uploadData.notes}
                    onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                  />
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

                <Button
                  className="w-full bg-[#F24E29] hover:bg-[#F24E29]/90"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("common.uploading") || "Uploading..."}
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      {t("progress.selectPhoto") || "Select Photo"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Photo Detail Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-12 z-10 bg-red-500/80 text-white hover:bg-red-600"
                onClick={() => handleDelete(selectedPhoto.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Image
                src={selectedPhoto.photo_url || "/placeholder.svg"}
                alt={`Progress photo from ${selectedPhoto.date}`}
                width={800}
                height={600}
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedPhoto.date)}
                  </div>
                  {selectedPhoto.weight && (
                    <div className="flex items-center gap-1">
                      <Scale className="w-4 h-4" />
                      {selectedPhoto.weight} kg
                    </div>
                  )}
                  <span className="px-2 py-1 bg-white/20 rounded text-sm capitalize">{selectedPhoto.category}</span>
                </div>
                {selectedPhoto.notes && <p className="text-white/80 mt-2 text-sm">{selectedPhoto.notes}</p>}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
