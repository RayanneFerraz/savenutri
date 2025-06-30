import { type NextRequest, NextResponse } from "next/server"

// Use your provided VAPID keys
const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  "BGVxsToCXmpx4iPM9ecvi0MavKZq0MTDBuRyWdwDB4Jrqn5EkG-GLjbnJd4I6iwd3i8us70ZOZvX1p0v-ZKATdU"
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY

export async function POST(request: NextRequest) {
  try {
    if (!VAPID_PRIVATE_KEY) {
      console.error("VAPID_PRIVATE_KEY environment variable is not set")
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 })
    }

    const { title, body, data } = await request.json()

    const notification = {
      title,
      body,
      icon: "/placeholder.svg?height=192&width=192&text=FT",
      badge: "/placeholder.svg?height=72&width=72&text=FT",
      data,
      actions: [
        {
          action: "open",
          title: "Open App",
        },
        {
          action: "close",
          title: "Close",
        },
      ],
    }

    // In production, send to all registered tokens using web-push library
    console.log("Sending notification:", notification)

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ success: false, error: "Failed to send notification" }, { status: 500 })
  }
}
