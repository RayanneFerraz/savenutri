"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Smartphone, Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    console.log("PWA Install component mounted")

    // Verificar se já está instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("App já está instalado")
      setIsInstalled(true)
      return
    }

    // Verificar se foi dispensado recentemente
    const dismissedTime = localStorage.getItem("pwa-install-dismissed")
    if (dismissedTime && Date.now() - Number.parseInt(dismissedTime) < 7 * 24 * 60 * 60 * 1000) {
      console.log("Notificação foi dispensada recentemente")
      return
    }

    // Listener para o evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("beforeinstallprompt event fired")
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      console.log("App installed")
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    // Sempre mostrar a notificação após 10 segundos (para teste)
    const timer = setTimeout(() => {
      console.log("Showing install prompt after 10 seconds")
      setShowInstallPrompt(true)
    }, 10000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
      clearTimeout(timer)
    }
  }, [])

  const handleInstallClick = async () => {
    console.log("Install button clicked")

    if (deferredPrompt) {
      // Se temos o prompt nativo, usar ele
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log("Install outcome:", outcome)

      if (outcome === "accepted") {
        console.log("PWA instalado com sucesso")
      }

      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } else {
      // Mostrar instruções manuais
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)

      let instructions = ""
      if (isIOS) {
        instructions = "No Safari: Toque no botão compartilhar e selecione 'Adicionar à Tela Inicial'"
      } else if (isAndroid) {
        instructions = "No Chrome: Menu (⋮) → 'Instalar app' ou 'Adicionar à tela inicial'"
      } else {
        instructions = "No navegador: Menu → 'Instalar FastTrack' ou ícone de instalação na barra de endereço"
      }

      alert(`Para instalar o Save Nutri:\n\n${instructions}`)
      setShowInstallPrompt(false)
    }
  }

  const handleDismiss = () => {
    console.log("Install prompt dismissed")
    setShowInstallPrompt(false)
    localStorage.setItem("pwa-install-dismissed", Date.now().toString())
  }

  // Não mostrar se já está instalado
  if (isInstalled) {
    return null
  }

  // Não mostrar se não deve aparecer
  if (!showInstallPrompt) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="border-green-200 bg-white shadow-lg animate-in slide-in-from-top-2">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <Smartphone className="h-4 w-4 text-green-600" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">📱 Instalar Save Nutri</p>
              <p className="text-xs text-gray-600">Acesso rápido e offline!</p>
            </div>

            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
              >
                <Download className="h-3 w-3 mr-1" />
                Instalar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
