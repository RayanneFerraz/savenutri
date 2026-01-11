import { type NextRequest, NextResponse } from "next/server"

// Preparado para futura integracao com Supabase

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Por enquanto, apenas confirmar recebimento do evento
    // Futuramente, salvar no Supabase
    return NextResponse.json({
      success: true,
      message: "Event received",
      event: body.event,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process analytics event" }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  try {
    // Endpoint para obter estatisticas (usado pelo admin)
    // Por enquanto retorna dados mockados, futuramente buscar do Supabase
    return NextResponse.json({
      success: true,
      message: "Analytics data stored locally in browser",
      note: "Use AnalyticsService.getSessionStats() on client side",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
