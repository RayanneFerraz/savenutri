const CACHE_NAME = "fasttrack-v1.0.0"
const STATIC_CACHE = "fasttrack-static-v1.0.0"
const DYNAMIC_CACHE = "fasttrack-dynamic-v1.0.0"
const IMAGE_CACHE = "fasttrack-images-v1.0.0"
const API_CACHE = "fasttrack-api-v1.0.0"

// Arquivos essenciais para cache
const STATIC_FILES = [
  "/",
  "/timer",
  "/recipes",
  "/progress",
  "/profile",
  "/learn",
  "/settings",
  "/auth",
  "/manifest.json",
  "/offline.html",
]

// Padrões de arquivos para cache
const CACHE_PATTERNS = {
  // JavaScript e CSS bundles do Next.js
  static: /\/_next\/static\/.+\.(js|css)$/,
  // Imagens e assets
  images: /\.(png|jpg|jpeg|gif|svg|webp|ico)$/,
  // Fonts
  fonts: /\.(woff|woff2|ttf|eot)$/,
  // API routes
  api: /\/api\/.+/,
  // Placeholder images com query parameters
  placeholder: /\/placeholder\.svg\?/,
}

// Instalar Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")
  event.waitUntil(
    Promise.all([
      // Cache arquivos estáticos essenciais
      caches
        .open(STATIC_CACHE)
        .then((cache) => {
          console.log("Service Worker: Caching static files")
          return cache.addAll(STATIC_FILES)
        }),
      // Pre-cache algumas imagens placeholder comuns
      caches
        .open(IMAGE_CACHE)
        .then((cache) => {
          const commonPlaceholders = [
            "/placeholder.svg?height=400&width=600&text=Recipe",
            "/placeholder.svg?height=200&width=200&text=Profile",
            "/placeholder.svg?height=192&width=192&text=FT",
            "/placeholder.svg?height=128&width=128&text=📱",
            "/placeholder.svg?height=128&width=128&text=❌",
          ]
          return cache.addAll(commonPlaceholders).catch((err) => {
            console.log("Some placeholder images failed to cache:", err)
          })
        }),
    ])
      .then(() => {
        console.log("Service Worker: Installed successfully")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("Service Worker: Installation failed", error)
      }),
  )
})

// Ativar Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE].includes(cacheName)) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Activated successfully")
        return self.clients.claim()
      }),
  )
})

// Estratégias de cache por tipo de recurso
const cacheStrategies = {
  // Cache First para assets estáticos (JS, CSS, fonts)
  cacheFirst: async (request) => {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    try {
      const response = await fetch(request)
      if (response.status === 200) {
        const cache = await caches.open(getCacheNameForRequest(request))
        cache.put(request, response.clone())
      }
      return response
    } catch (error) {
      console.log("Cache First failed:", error)
      throw error
    }
  },

  // Network First para conteúdo dinâmico (páginas, API)
  networkFirst: async (request) => {
    try {
      const response = await fetch(request)
      if (response.status === 200) {
        const cache = await caches.open(getCacheNameForRequest(request))
        cache.put(request, response.clone())
      }
      return response
    } catch (error) {
      console.log("Network failed, trying cache:", error)
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
      throw error
    }
  },

  // Stale While Revalidate para imagens
  staleWhileRevalidate: async (request) => {
    const cachedResponse = await caches.match(request)

    const fetchPromise = fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const cache = caches.open(IMAGE_CACHE)
          cache.then((c) => c.put(request, response.clone()))
        }
        return response
      })
      .catch((err) => {
        console.log("Fetch failed for image:", err)
        return cachedResponse
      })

    return cachedResponse || fetchPromise
  },
}

// Determinar qual cache usar baseado no tipo de request
function getCacheNameForRequest(request) {
  const url = request.url

  if (CACHE_PATTERNS.static.test(url)) return STATIC_CACHE
  if (CACHE_PATTERNS.images.test(url) || CACHE_PATTERNS.placeholder.test(url)) return IMAGE_CACHE
  if (CACHE_PATTERNS.fonts.test(url)) return STATIC_CACHE
  if (CACHE_PATTERNS.api.test(url)) return API_CACHE

  return DYNAMIC_CACHE
}

// Interceptar requisições
self.addEventListener("fetch", (event) => {
  // Ignorar requisições não-GET e requisições para admin
  if (event.request.method !== "GET" || event.request.url.includes("/admin")) {
    return
  }

  const url = event.request.url

  event.respondWith(
    (async () => {
      try {
        // Estratégia baseada no tipo de recurso
        if (CACHE_PATTERNS.static.test(url) || CACHE_PATTERNS.fonts.test(url)) {
          // Cache First para JS, CSS, fonts
          return await cacheStrategies.cacheFirst(event.request)
        }

        if (CACHE_PATTERNS.images.test(url) || CACHE_PATTERNS.placeholder.test(url)) {
          // Stale While Revalidate para imagens
          return await cacheStrategies.staleWhileRevalidate(event.request)
        }

        if (CACHE_PATTERNS.api.test(url)) {
          // Network First para APIs
          return await cacheStrategies.networkFirst(event.request)
        }

        // Network First para páginas e outros recursos
        return await cacheStrategies.networkFirst(event.request)
      } catch (error) {
        console.log("All strategies failed:", error)

        // Fallback para página offline se for uma navegação
        if (event.request.destination === "document") {
          const offlinePage = await caches.match("/offline.html")
          return offlinePage || new Response("Offline", { status: 503 })
        }

        // Para outros recursos, retornar erro
        return new Response("Resource not available offline", {
          status: 503,
          statusText: "Service Unavailable",
        })
      }
    })(),
  )
})

// Notificações Push - MELHORADO
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push received", event)

  let notificationData = {
    title: "FastTrack",
    body: "Nova notificação do FastTrack!",
    icon: "/placeholder.svg?height=192&width=192&text=FT",
    badge: "/placeholder.svg?height=72&width=72&text=FT",
    data: {},
  }

  // Se há dados na notificação
  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = { ...notificationData, ...data }
    } catch (error) {
      console.error("Erro ao parsear dados da notificação:", error)
      notificationData.body = event.data.text()
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [200, 100, 200],
    data: notificationData.data,
    actions: [
      {
        action: "open",
        title: "Abrir App",
        icon: "/placeholder.svg?height=128&width=128&text=📱",
      },
      {
        action: "close",
        title: "Fechar",
        icon: "/placeholder.svg?height=128&width=128&text=❌",
      },
    ],
    requireInteraction: true,
    tag: "fasttrack-notification",
  }

  event.waitUntil(self.registration.showNotification(notificationData.title, options))
})

// Clique em notificação - MELHORADO
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked", event)
  event.notification.close()

  if (event.action === "open" || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow("/")
        }
      }),
    )
  }
})

// Background Sync para quando voltar online - MELHORADO
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event.tag)

  if (event.tag === "background-sync") {
    event.waitUntil(syncOfflineData())
  }
})

// Cache cleanup - limpar caches antigos periodicamente
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAN_CACHE") {
    event.waitUntil(cleanupOldCaches())
  }
})

// Função para sincronizar dados offline
async function syncOfflineData() {
  try {
    console.log("Sincronizando dados offline...")

    const pendingData = await getOfflineData()
    if (pendingData.length > 0) {
      await sendDataToServer(pendingData)
      await clearOfflineData()
    }

    console.log("Sincronização concluída")
  } catch (error) {
    console.error("Erro na sincronização:", error)
  }
}

// Limpeza de caches antigos
async function cleanupOldCaches() {
  try {
    const cacheNames = await caches.keys()
    const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE]

    await Promise.all(
      cacheNames.map((cacheName) => {
        if (!currentCaches.includes(cacheName)) {
          console.log("Cleaning up old cache:", cacheName)
          return caches.delete(cacheName)
        }
      }),
    )

    // Limitar tamanho dos caches dinâmicos
    await limitCacheSize(IMAGE_CACHE, 50) // Máximo 50 imagens
    await limitCacheSize(DYNAMIC_CACHE, 30) // Máximo 30 páginas
    await limitCacheSize(API_CACHE, 20) // Máximo 20 respostas de API
  } catch (error) {
    console.error("Erro na limpeza de cache:", error)
  }
}

// Limitar tamanho do cache
async function limitCacheSize(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()

    if (keys.length > maxItems) {
      // Remove os mais antigos (FIFO)
      const keysToDelete = keys.slice(0, keys.length - maxItems)
      await Promise.all(keysToDelete.map((key) => cache.delete(key)))
      console.log(`Cache ${cacheName} cleaned: removed ${keysToDelete.length} items`)
    }
  } catch (error) {
    console.error(`Erro ao limitar cache ${cacheName}:`, error)
  }
}

// Funções auxiliares para dados offline
async function getOfflineData() {
  // Implementar lógica para buscar dados offline do IndexedDB
  return []
}

async function sendDataToServer(data) {
  // Implementar envio para servidor
  console.log("Enviando dados para servidor:", data)
}

async function clearOfflineData() {
  // Limpar dados offline após sincronização
  console.log("Dados offline limpos")
}
