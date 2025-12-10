import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getFileType } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const studentId = formData.get("studentId") as string;
    const caption = formData.get("caption") as string | null;
    const lessonId = formData.get("lessonId") as string | null;

    if (!file || !studentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get coach ID
    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    // Upload file to Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filePath = `${coach.id}/${studentId}/${Date.now()}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl: fileUrl } } = supabase.storage
      .from("media")
      .getPublicUrl(filePath);

    // Create media record
    const fileType = getFileType(file.name);
    const { data: media, error: mediaError } = await supabase
      .from("media")
      .insert({
        student_id: studentId,
        coach_id: coach.id,
        lesson_id: lessonId,
        file_url: fileUrl,
        file_type: fileType,
        file_name: file.name,
        file_size: file.size,
        caption: caption,
        thumbnail_url: fileType === 'photo' ? fileUrl : null,
      })
      .select()
      .single();

    if (mediaError) throw mediaError;

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    );
  }
}
