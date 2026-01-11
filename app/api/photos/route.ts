import { type NextRequest, NextResponse } from "next/server"
import { del } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"

// Get all photos for user
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: photos, error } = await supabase
      .from("progress_photos")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
    }

    return NextResponse.json({ photos })
  } catch (error) {
    console.error("Fetch photos error:", error)
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}

// Delete a photo
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get("id")

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 })
    }

    // Get photo to delete from blob
    const { data: photo, error: fetchError } = await supabase
      .from("progress_photos")
      .select("photo_url")
      .eq("id", photoId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    // Delete from Vercel Blob
    try {
      await del(photo.photo_url)
    } catch (blobError) {
      console.error("Blob delete error:", blobError)
      // Continue with database deletion even if blob fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("progress_photos")
      .delete()
      .eq("id", photoId)
      .eq("user_id", user.id)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete photo error:", error)
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 })
  }
}
