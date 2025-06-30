import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { endpoint, keys, userId } = await request.json()

    // Em produção, salvar no banco de dados
    const token = {
      endpoint,
      keys,
      userId,
      createdAt: new Date().toISOString(),
    }

    console.log("Token registrado:", token)

    // Simular salvamento no banco
    // await db.pushTokens.create({ data: token })

    return NextResponse.json({
      success: true,
      message: "Token registrado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao registrar token:", error)
    return NextResponse.json({ success: false, error: "Falha ao registrar token" }, { status: 500 })
  }
}
