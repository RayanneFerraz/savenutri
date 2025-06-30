interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
}

interface SessionData {
  sessionId: string
  userId?: string
  startTime: number
  lastActivity: number
  pageViews: number
  events: AnalyticsEvent[]
  userAgent: string
  referrer: string
  location?: {
    country?: string
    city?: string
    timezone?: string
  }
}

class AnalyticsService {
  private sessionData: SessionData | null = null
  private isInitialized = false

  async initializeSession(userId?: string): Promise<void> {
    if (this.isInitialized) return

    try {
      const sessionId = this.generateSessionId()
      const now = Date.now()

      // Try to get location data with fallback
      let location = undefined
      try {
        const response = await fetch("https://ipapi.co/json/", {
          signal: AbortSignal.timeout(3000), // 3 second timeout
        })
        if (response.ok) {
          const data = await response.json()
          location = {
            country: data.country_name,
            city: data.city,
            timezone: data.timezone,
          }
        }
      } catch (error) {
        // Silently fail - location is optional
        console.warn("Could not fetch location data:", error)
      }

      this.sessionData = {
        sessionId,
        userId,
        startTime: now,
        lastActivity: now,
        pageViews: 0,
        events: [],
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
        referrer: typeof window !== "undefined" ? document.referrer : "",
        location,
      }

      this.isInitialized = true
      this.trackEvent("session_start")
    } catch (error) {
      console.warn("Analytics initialization failed:", error)
      // Create minimal session data as fallback
      this.sessionData = {
        sessionId: this.generateSessionId(),
        userId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        pageViews: 0,
        events: [],
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
        referrer: typeof window !== "undefined" ? document.referrer : "",
      }
      this.isInitialized = true
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  trackEvent(name: string, properties?: Record<string, any>): void {
    if (!this.sessionData) return

    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        timestamp: Date.now(),
        sessionId: this.sessionData.sessionId,
      },
    }

    this.sessionData.events.push(event)
    this.sessionData.lastActivity = Date.now()

    // In a real app, you would send this to your analytics service
    console.log("Analytics Event:", event)
  }

  trackPageView(path: string): void {
    if (!this.sessionData) return

    this.sessionData.pageViews++
    this.trackEvent("page_view", { path })
  }

  getSessionData(): SessionData | null {
    return this.sessionData
  }

  endSession(): void {
    if (this.sessionData) {
      this.trackEvent("session_end", {
        duration: Date.now() - this.sessionData.startTime,
        pageViews: this.sessionData.pageViews,
        eventCount: this.sessionData.events.length,
      })
    }
  }
}

export const analytics = new AnalyticsService()
export type { AnalyticsEvent, SessionData }
