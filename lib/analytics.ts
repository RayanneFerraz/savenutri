"use client"

// Usa localStorage para armazenar eventos e prepara para futura integracao com Supabase

export interface AnalyticsEvent {
  id: string
  event: string
  timestamp: string
  sessionId: string
  path: string
  referrer: string
  userAgent: string
  screenSize: string
  language: string
  data?: Record<string, any>
}

export interface AnalyticsSession {
  id: string
  startTime: string
  lastActivity: string
  pageViews: number
  events: number
}

const STORAGE_KEY = "fasttrack_analytics"
const SESSION_KEY = "fasttrack_session"
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutos

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveEvents(events: AnalyticsEvent[]): void {
  if (typeof window === "undefined") return
  try {
    // Manter apenas os ultimos 500 eventos para nao sobrecarregar localStorage
    const trimmed = events.slice(-500)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.warn("Analytics: Failed to save events", error)
  }
}

function getOrCreateSession(): AnalyticsSession {
  if (typeof window === "undefined") {
    return {
      id: "server",
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      pageViews: 0,
      events: 0,
    }
  }

  try {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
      const session: AnalyticsSession = JSON.parse(stored)
      const lastActivity = new Date(session.lastActivity).getTime()
      const now = Date.now()

      // Se a sessao ainda e valida, atualizar lastActivity
      if (now - lastActivity < SESSION_TIMEOUT) {
        session.lastActivity = new Date().toISOString()
        localStorage.setItem(SESSION_KEY, JSON.stringify(session))
        return session
      }
    }
  } catch {
    // Ignorar erros de parsing
  }

  // Criar nova sessao
  const newSession: AnalyticsSession = {
    id: generateId(),
    startTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    pageViews: 0,
    events: 0,
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
  return newSession
}

function updateSession(updates: Partial<AnalyticsSession>): void {
  if (typeof window === "undefined") return
  try {
    const session = getOrCreateSession()
    const updated = { ...session, ...updates, lastActivity: new Date().toISOString() }
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated))
  } catch {
    // Ignorar erros
  }
}

export class AnalyticsService {
  private static initialized = false

  static async initializeSession(): Promise<void> {
    if (typeof window === "undefined") {
      return
    }

    if (this.initialized) {
      return
    }

    try {
      const session = getOrCreateSession()

      // Registrar evento de inicio de sessao
      this.track("session_start", {
        isNewSession: session.pageViews === 0,
      })

      this.initialized = true
    } catch (error) {
      console.warn("Analytics: Failed to initialize session", error)
    }
  }

  static track(event: string, data?: Record<string, any>): void {
    if (typeof window === "undefined") return

    try {
      const session = getOrCreateSession()

      const analyticsEvent: AnalyticsEvent = {
        id: generateId(),
        event,
        timestamp: new Date().toISOString(),
        sessionId: session.id,
        path: window.location.pathname,
        referrer: document.referrer || "direct",
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        data,
      }

      const events = getStoredEvents()
      events.push(analyticsEvent)
      saveEvents(events)

      // Atualizar contadores da sessao
      if (event === "page_view") {
        updateSession({ pageViews: session.pageViews + 1 })
      } else {
        updateSession({ events: session.events + 1 })
      }
    } catch (error) {
      console.warn("Analytics: Failed to track event", error)
    }
  }

  static pageView(pageName?: string): void {
    this.track("page_view", { pageName: pageName || document.title })
  }

  static buttonClick(buttonName: string, context?: string): void {
    this.track("button_click", { buttonName, context })
  }

  static featureUsed(featureName: string, details?: Record<string, any>): void {
    this.track("feature_used", { featureName, ...details })
  }

  static timerAction(action: "start" | "pause" | "complete" | "cancel", duration?: number): void {
    this.track("timer_action", { action, duration })
  }

  static recipeViewed(recipeId: number, recipeName: string): void {
    this.track("recipe_viewed", { recipeId, recipeName })
  }

  static articleViewed(articleId: number, articleTitle: string): void {
    this.track("article_viewed", { articleId, articleTitle })
  }

  static languageChanged(from: string, to: string): void {
    this.track("language_changed", { from, to })
  }

  static error(errorType: string, errorMessage: string, context?: string): void {
    this.track("error", { errorType, errorMessage, context })
  }

  // Metodos para obter dados de analytics (para admin)
  static getEvents(limit = 100): AnalyticsEvent[] {
    const events = getStoredEvents()
    return events.slice(-limit).reverse()
  }

  static getEventsByType(eventType: string): AnalyticsEvent[] {
    const events = getStoredEvents()
    return events.filter((e) => e.event === eventType).reverse()
  }

  static getSessionStats(): {
    totalSessions: number
    totalPageViews: number
    totalEvents: number
    uniquePaths: string[]
    topEvents: { event: string; count: number }[]
  } {
    const events = getStoredEvents()
    const sessions = new Set(events.map((e) => e.sessionId))
    const paths = new Set(events.map((e) => e.path))
    const pageViews = events.filter((e) => e.event === "page_view").length

    // Contar eventos por tipo
    const eventCounts: Record<string, number> = {}
    events.forEach((e) => {
      eventCounts[e.event] = (eventCounts[e.event] || 0) + 1
    })

    const topEvents = Object.entries(eventCounts)
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalSessions: sessions.size,
      totalPageViews: pageViews,
      totalEvents: events.length,
      uniquePaths: Array.from(paths),
      topEvents,
    }
  }

  static clearEvents(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEY)
  }

  static getCurrentSession(): AnalyticsSession | null {
    if (typeof window === "undefined") return null
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }
}
