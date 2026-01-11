const CACHE_NAME = "fasttrack-v1.1.0"
const STATIC_CACHE = "fasttrack-static-v1.1.0"
const DYNAMIC_CACHE = "fasttrack-dynamic-v1.1.0"

// Essential files to cache
const STATIC_FILES = [
  "/",
  "/timer",
  "/recipes",
  "/progress",
  "/profile",
  "/learn",
  "/settings",
  "/manifest.json",
  "/offline.html",
]

// Install Service Worker
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

// Activate Service Worker
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

// Intercept requests - Network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Ignore non-GET requests and admin routes
  if (event.request.method !== "GET" || event.request.url.includes("/admin")) {
    return
  }

  // Ignore API routes
  if (event.request.url.includes("/api/")) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response for caching
        if (response && response.status === 200) {
          const responseToCache = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // If no cache and it's a document request, show offline page
          if (event.request.destination === "document") {
            return caches.match("/offline.html")
          }
          return new Response("Offline", { status: 503 })
        })
      }),
  )
})

// Push Notifications
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push received", event)

  let notificationData = {
    title: "FastTrack",
    body: "Nova notificacao do FastTrack!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: { url: "/" },
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = { ...notificationData, ...data }
    } catch (error) {
      console.error("Error parsing push data:", error)
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
      { action: "open", title: "Abrir" },
      { action: "close", title: "Fechar" },
    ],
    requireInteraction: false,
    tag: notificationData.tag || "fasttrack-notification",
  }

  event.waitUntil(self.registration.showNotification(notificationData.title, options))
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked", event)
  event.notification.close()

  if (event.action === "close") {
    return
  }

  const urlToOpen = event.notification.data?.url || "/"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(urlToOpen)
          return client.focus()
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    }),
  )
})

// Background Sync
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event.tag)

  if (event.tag === "sync-data") {
    event.waitUntil(syncOfflineData())
  }
})

// Sync offline data function
async function syncOfflineData() {
  try {
    console.log("Syncing offline data...")

    // Get all clients and notify them to sync
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({ type: "SYNC_REQUESTED" })
    })

    console.log("Sync complete")
  } catch (error) {
    console.error("Sync error:", error)
  }
}

// Message handler for communication with main app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
