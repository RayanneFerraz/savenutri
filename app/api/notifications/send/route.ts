import { type NextRequest, NextResponse } from "next/server"

// Em produção, essas chaves devem estar em variáveis de ambiente
const VAPID_PUBLIC_KEY = "BEl62iUYgUivxIkv69yViEuiBIa40HcCWLrUjHLjdMorGDlLVW6SCDhHxiHSNOHIS03v7VdHoTxKryaHXr6tmlA"
const VAPID_PRIVATE_KEY = "your-vapid-private-key-here"

export async function POST(request: NextRequest) {
  try {
    const { title, body, data } = await request.json()

    // Em produção, você buscaria os tokens do banco de dados
    // Por enquanto, vamos simular o envio
    const notification = {
      title,
      body,
      icon: "/placeholder.svg?height=192&width=192&text=FT",
      badge: "/placeholder.svg?height=72&width=72&text=FT",
      data,
      actions: [
        {
          action: "open",
          title: "Abrir App",
        },
        {
          action: "close",
          title: "Fechar",
        },
      ],
    }

    // Aqui você enviaria para todos os tokens registrados
    // usando uma biblioteca como web-push
    console.log("Enviando notificação:", notification)

    return NextResponse.json({
      success: true,
      message: "Notificação enviada com sucesso",
    })
  } catch (error) {
    console.error("Erro ao enviar notificação:", error)
    return NextResponse.json({ success: false, error: "Falha ao enviar notificação" }, { status: 500 })
  }
}
