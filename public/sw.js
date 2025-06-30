const CACHE_NAME = "fasttrack-v1.0.0"
const STATIC_CACHE = "fasttrack-static-v1.0.0"
const DYNAMIC_CACHE = "fasttrack-dynamic-v1.0.0"

// Arquivos essenciais para cache
const STATIC_FILES = ["/", "/timer", "/recipes", "/progress", "/profile", "/learn", "/manifest.json", "/offline.html"]

// Instalar Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Service Worker: Caching static files")
        return cache.addAll(STATIC_FILES)
      })
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
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
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

// Interceptar requisições
self.addEventListener("fetch", (event) => {
  // Ignorar requisições não-GET e requisições para admin
  if (event.request.method !== "GET" || event.request.url.includes("/admin")) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Se encontrou no cache, retorna
      if (cachedResponse) {
        return cachedResponse
      }

      // Se não encontrou, busca na rede
      return fetch(event.request)
        .then((response) => {
          // Se a resposta não é válida, retorna ela
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clona a resposta para cache
          const responseToCache = response.clone()

          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Se falhou, tenta retornar página offline
          if (event.request.destination === "document") {
            return caches.match("/offline.html")
          }
        })
    }),
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
    requireInteraction: true, // Mantém a notificação até o usuário interagir
    tag: "fasttrack-notification", // Substitui notificações anteriores
  }

  event.waitUntil(self.registration.showNotification(notificationData.title, options))
})

// Clique em notificação - MELHORADO
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked", event)
  event.notification.close()

  if (event.action === "open" || !event.action) {
    // Abrir ou focar na janela do app
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // Se já tem uma janela aberta, focar nela
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus()
          }
        }
        // Se não tem janela aberta, abrir uma nova
        if (clients.openWindow) {
          return clients.openWindow("/")
        }
      }),
    )
  }
  // Se action === "close", apenas fecha (já fechou acima)
})

// Background Sync para quando voltar online - MELHORADO
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event.tag)

  if (event.tag === "background-sync") {
    event.waitUntil(syncOfflineData())
  }
})

// Função para sincronizar dados offline
async function syncOfflineData() {
  try {
    console.log("Sincronizando dados offline...")

    // Aqui você pode sincronizar dados que foram salvos offline
    // Por exemplo, progresso do jejum, configurações, etc.

    // Exemplo: enviar dados pendentes para o servidor
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

// Funções auxiliares para dados offline
async function getOfflineData() {
  // Implementar lógica para buscar dados offline
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
