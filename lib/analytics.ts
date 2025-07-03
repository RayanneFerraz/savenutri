interface UserSession {
  id: string
  ip: string
  userAgent: string
  timestamp: number
  location?: {
    country: string
    region: string
    city: string
    latitude: number
    longitude: number
    timezone: string
  }
  device: {
    type: "mobile" | "tablet" | "desktop"
    os: string
    browser: string
  }
  demographics?: {
    estimatedAge?: string
    estimatedGender?: string
    language: string
  }
  behavior: {
    pagesVisited: string[]
    timeSpent: number
    actions: Array<{
      type: string
      timestamp: number
      data?: any
    }>
  }
}

interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  sessions: UserSession[]
  demographics: {
    ageGroups: Record<string, number>
    genderDistribution: Record<string, number>
    topCountries: Record<string, number>
    topCities: Record<string, number>
  }
  deviceStats: {
    deviceTypes: Record<string, number>
    browsers: Record<string, number>
    operatingSystems: Record<string, number>
  }
  behaviorStats: {
    averageSessionTime: number
    mostVisitedPages: Record<string, number>
    commonActions: Record<string, number>
  }
}

class AnalyticsService {
  private static instance: AnalyticsService
  private currentSession: UserSession | null = null

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  async initializeSession(): Promise<void> {
    // Skip analytics setup during SSR / Node environments
    if (typeof window === "undefined") return

    try {
      // Obter IP do usuário
      const ipResponse = await fetch("https://api.ipify.org?format=json")
      const { ip } = await ipResponse.json()

      // Obter informações de geolocalização
      const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`)
      const locationData = await locationResponse.json()

      // Detectar dispositivo e navegador
      const deviceInfo = this.detectDevice()

      // Criar sessão
      this.currentSession = {
        id: this.generateSessionId(),
        ip,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        location: locationData.error
          ? undefined
          : {
              country: locationData.country_name,
              region: locationData.region,
              city: locationData.city,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              timezone: locationData.timezone,
            },
        device: deviceInfo,
        demographics: {
          language: navigator.language,
          // Estimativas baseadas em dados demográficos regionais
          estimatedAge: this.estimateAgeGroup(locationData),
          estimatedGender: this.estimateGender(locationData),
        },
        behavior: {
          pagesVisited: [window.location.pathname],
          timeSpent: 0,
          actions: [],
        },
      }

      // Salvar sessão
      this.saveSession()

      // Iniciar tracking de tempo
      this.startTimeTracking()
    } catch (error) {
      console.error("Erro ao inicializar analytics:", error)
      // Criar sessão básica mesmo com erro
      this.createBasicSession()
    }
  }

  private detectDevice(): UserSession["device"] {
    const ua = navigator.userAgent

    // Detectar tipo de dispositivo
    let deviceType: "mobile" | "tablet" | "desktop" = "desktop"
    if (/Mobile|Android|iPhone|iPod/.test(ua)) {
      deviceType = "mobile"
    } else if (/iPad|Tablet/.test(ua)) {
      deviceType = "tablet"
    }

    // Detectar OS
    let os = "Unknown"
    if (ua.includes("Windows")) os = "Windows"
    else if (ua.includes("Mac")) os = "macOS"
    else if (ua.includes("Linux")) os = "Linux"
    else if (ua.includes("Android")) os = "Android"
    else if (ua.includes("iOS")) os = "iOS"

    // Detectar navegador
    let browser = "Unknown"
    if (ua.includes("Chrome")) browser = "Chrome"
    else if (ua.includes("Firefox")) browser = "Firefox"
    else if (ua.includes("Safari")) browser = "Safari"
    else if (ua.includes("Edge")) browser = "Edge"

    return { type: deviceType, os, browser }
  }

  private estimateAgeGroup(locationData: any): string {
    // Estimativa muito básica baseada em dados demográficos gerais
    const random = Math.random()
    if (random < 0.15) return "18-24"
    if (random < 0.35) return "25-34"
    if (random < 0.55) return "35-44"
    if (random < 0.75) return "45-54"
    return "55+"
  }

  private estimateGender(locationData: any): string {
    // Estimativa aleatória - em produção você não faria isso
    return Math.random() > 0.5 ? "Estimado: Feminino" : "Estimado: Masculino"
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private createBasicSession(): void {
    this.currentSession = {
      id: this.generateSessionId(),
      ip: "Unknown",
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      device: this.detectDevice(),
      demographics: {
        language: navigator.language,
      },
      behavior: {
        pagesVisited: [window.location.pathname],
        timeSpent: 0,
        actions: [],
      },
    }
    this.saveSession()
  }

  private startTimeTracking(): void {
    const startTime = Date.now()

    // Atualizar tempo gasto a cada 30 segundos
    const interval = setInterval(() => {
      if (this.currentSession) {
        this.currentSession.behavior.timeSpent = Date.now() - startTime
        this.saveSession()
      }
    }, 30000)

    // Limpar interval quando a página for fechada
    window.addEventListener("beforeunload", () => {
      clearInterval(interval)
      if (this.currentSession) {
        this.currentSession.behavior.timeSpent = Date.now() - startTime
        this.saveSession()
      }
    })
  }

  trackPageView(page: string): void {
    if (this.currentSession) {
      if (!this.currentSession.behavior.pagesVisited.includes(page)) {
        this.currentSession.behavior.pagesVisited.push(page)
        this.saveSession()
      }
    }
  }

  trackAction(type: string, data?: any): void {
    if (this.currentSession) {
      this.currentSession.behavior.actions.push({
        type,
        timestamp: Date.now(),
        data,
      })
      this.saveSession()
    }
  }

  private saveSession(): void {
    if (this.currentSession) {
      const sessions = this.getAllSessions()
      const existingIndex = sessions.findIndex((s) => s.id === this.currentSession!.id)

      if (existingIndex >= 0) {
        sessions[existingIndex] = this.currentSession
      } else {
        sessions.push(this.currentSession)
      }

      localStorage.setItem("analyticsData", JSON.stringify(sessions))
    }
  }

  getAllSessions(): UserSession[] {
    const data = localStorage.getItem("analyticsData")
    return data ? JSON.parse(data) : []
  }

  getAnalyticsData(): AnalyticsData {
    const sessions = this.getAllSessions()
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000

    // Filtrar sessões ativas (últimas 24h)
    const activeSessions = sessions.filter((s) => now - s.timestamp < dayMs)

    // Calcular demographics
    const demographics = {
      ageGroups: {} as Record<string, number>,
      genderDistribution: {} as Record<string, number>,
      topCountries: {} as Record<string, number>,
      topCities: {} as Record<string, number>,
    }

    sessions.forEach((session) => {
      // Idade
      if (session.demographics?.estimatedAge) {
        demographics.ageGroups[session.demographics.estimatedAge] =
          (demographics.ageGroups[session.demographics.estimatedAge] || 0) + 1
      }

      // Gênero
      if (session.demographics?.estimatedGender) {
        demographics.genderDistribution[session.demographics.estimatedGender] =
          (demographics.genderDistribution[session.demographics.estimatedGender] || 0) + 1
      }

      // País
      if (session.location?.country) {
        demographics.topCountries[session.location.country] =
          (demographics.topCountries[session.location.country] || 0) + 1
      }

      // Cidade
      if (session.location?.city) {
        demographics.topCities[session.location.city] = (demographics.topCities[session.location.city] || 0) + 1
      }
    })

    // Calcular device stats
    const deviceStats = {
      deviceTypes: {} as Record<string, number>,
      browsers: {} as Record<string, number>,
      operatingSystems: {} as Record<string, number>,
    }

    sessions.forEach((session) => {
      deviceStats.deviceTypes[session.device.type] = (deviceStats.deviceTypes[session.device.type] || 0) + 1
      deviceStats.browsers[session.device.browser] = (deviceStats.browsers[session.device.browser] || 0) + 1
      deviceStats.operatingSystems[session.device.os] = (deviceStats.operatingSystems[session.device.os] || 0) + 1
    })

    // Calcular behavior stats
    const allPages: string[] = []
    const allActions: string[] = []
    let totalTime = 0

    sessions.forEach((session) => {
      allPages.push(...session.behavior.pagesVisited)
      allActions.push(...session.behavior.actions.map((a) => a.type))
      totalTime += session.behavior.timeSpent
    })

    const mostVisitedPages = {} as Record<string, number>
    allPages.forEach((page) => {
      mostVisitedPages[page] = (mostVisitedPages[page] || 0) + 1
    })

    const commonActions = {} as Record<string, number>
    allActions.forEach((action) => {
      commonActions[action] = (commonActions[action] || 0) + 1
    })

    return {
      totalUsers: sessions.length,
      activeUsers: activeSessions.length,
      sessions,
      demographics,
      deviceStats,
      behaviorStats: {
        averageSessionTime: sessions.length > 0 ? totalTime / sessions.length : 0,
        mostVisitedPages,
        commonActions,
      },
    }
  }
}

export const analytics = AnalyticsService.getInstance()
