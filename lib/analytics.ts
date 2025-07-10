interface AnalyticsEvent {
  id: string
  timestamp: number
  type: "page_view" | "user_action" | "session_start" | "session_end"
  data: Record<string, any>
  sessionId: string
  userId?: string
  ip?: string
  userAgent: string
  location?: {
    country?: string
    city?: string
    region?: string
  }
}

interface AnalyticsSession {
  id: string
  startTime: number
  endTime?: number
  userId?: string
  events: AnalyticsEvent[]
  ip?: string
  userAgent: string
  location?: {
    country?: string
    city?: string
    region?: string
  }
}

// Helper function for safe fetch with timeout
async function safeFetchJson(url: string, options: RequestInit = {}, timeoutMs = 5000): Promise<any> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.warn(`Safe fetch failed for ${url}:`, error)
    return null
  }
}

class AnalyticsService {
  private currentSession: AnalyticsSession | null = null
  private isInitialized = false

  async initializeSession(): Promise<void> {
    if (typeof window === "undefined") return

    try {
      // Get user IP and location with graceful fallback
      let ip = "Unknown"
      let location = undefined

      const ipData = await safeFetchJson("https://api.ipify.org?format=json")
      if (ipData?.ip) {
        ip = ipData.ip

        // Try to get location data
        const locationData = await safeFetchJson(`https://ipapi.co/${ip}/json/`)
        if (locationData && !locationData.error) {
          location = {
            country: locationData.country_name || "Unknown",
            city: locationData.city || "Unknown",
            region: locationData.region || "Unknown",
          }
        }
      }

      const sessionId = this.generateSessionId()
      const userAgent = navigator.userAgent

      this.currentSession = {
        id: sessionId,
        startTime: Date.now(),
        events: [],
        ip,
        userAgent,
        location,
      }

      // Track session start
      this.trackEvent("session_start", {
        sessionId,
        timestamp: Date.now(),
        userAgent,
        ip,
        location,
      })

      this.isInitialized = true
      console.log("Analytics initialized successfully")
    } catch (error) {
      console.warn("Analytics initialization failed gracefully:", error)
      // Create a minimal session even if external services fail
      this.currentSession = {
        id: this.generateSessionId(),
        startTime: Date.now(),
        events: [],
        ip: "Unknown",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      }
      this.isInitialized = true
    }
  }

  trackEvent(type: AnalyticsEvent["type"], data: Record<string, any>): void {
    if (typeof window === "undefined" || !this.currentSession) return

    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      type,
      data,
      sessionId: this.currentSession.id,
      userId: this.currentSession.userId,
      ip: this.currentSession.ip,
      userAgent: this.currentSession.userAgent,
      location: this.currentSession.location,
    }

    this.currentSession.events.push(event)
    this.saveToStorage()
  }

  trackPageView(path: string, title?: string): void {
    this.trackEvent("page_view", {
      path,
      title: title || document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
    })
  }

  trackUserAction(action: string, details?: Record<string, any>): void {
    this.trackEvent("user_action", {
      action,
      ...details,
      timestamp: Date.now(),
    })
  }

  setUserId(userId: string): void {
    if (this.currentSession) {
      this.currentSession.userId = userId
      this.saveToStorage()
    }
  }

  endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now()
      this.trackEvent("session_end", {
        sessionId: this.currentSession.id,
        duration: this.currentSession.endTime - this.currentSession.startTime,
        eventCount: this.currentSession.events.length,
      })
      this.saveToStorage()
    }
  }

  getAnalyticsData(): AnalyticsSession[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem("analyticsData")
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error reading analytics data:", error)
      return []
    }
  }

  clearAnalyticsData(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("analyticsData")
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private saveToStorage(): void {
    if (typeof window === "undefined" || !this.currentSession) return

    try {
      const existingData = this.getAnalyticsData()
      const sessionIndex = existingData.findIndex((s) => s.id === this.currentSession!.id)

      if (sessionIndex >= 0) {
        existingData[sessionIndex] = this.currentSession
      } else {
        existingData.push(this.currentSession)
      }

      // Keep only last 100 sessions to prevent storage bloat
      const recentSessions = existingData.slice(-100)
      localStorage.setItem("analyticsData", JSON.stringify(recentSessions))
    } catch (error) {
      console.error("Error saving analytics data:", error)
    }
  }

  // Analytics summary methods
  getSessionSummary(): {
    totalSessions: number
    totalEvents: number
    averageSessionDuration: number
    topPages: Array<{ path: string; views: number }>
    topActions: Array<{ action: string; count: number }>
  } {
    const sessions = this.getAnalyticsData()
    const totalSessions = sessions.length
    const totalEvents = sessions.reduce((sum, session) => sum + session.events.length, 0)

    const completedSessions = sessions.filter((s) => s.endTime)
    const averageSessionDuration =
      completedSessions.length > 0
        ? completedSessions.reduce((sum, session) => sum + (session.endTime! - session.startTime), 0) /
          completedSessions.length
        : 0

    // Top pages
    const pageViews: Record<string, number> = {}
    const userActions: Record<string, number> = {}

    sessions.forEach((session) => {
      session.events.forEach((event) => {
        if (event.type === "page_view" && event.data.path) {
          pageViews[event.data.path] = (pageViews[event.data.path] || 0) + 1
        }
        if (event.type === "user_action" && event.data.action) {
          userActions[event.data.action] = (userActions[event.data.action] || 0) + 1
        }
      })
    })

    const topPages = Object.entries(pageViews)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    const topActions = Object.entries(userActions)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalSessions,
      totalEvents,
      averageSessionDuration,
      topPages,
      topActions,
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsService()

// Auto-initialize when imported (client-side only)
if (typeof window !== "undefined") {
  analytics.initializeSession().catch((error) => {
    console.warn("Analytics auto-initialization failed:", error)
  })
}
