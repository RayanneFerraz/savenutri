import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { endpoint, keys, userId } = await request.json()

    const supabase = await createClient()

    // Get current user if not provided
    let actualUserId = userId
    if (!actualUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      actualUserId = user?.id
    }

    // Store push token in database
    if (actualUserId) {
      const { error } = await supabase.from("push_tokens").upsert(
        {
          user_id: actualUserId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,endpoint",
        },
      )

      if (error) {
        console.error("Error storing push token:", error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Token registered successfully",
    })
  } catch (error) {
    console.error("Error registering token:", error)
    return NextResponse.json({ success: false, error: "Failed to register token" }, { status: 500 })
  }
}
