import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { transcribeAudio, generateLessonNotes } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const studentId = formData.get("studentId") as string;
    const studentName = formData.get("studentName") as string;

    if (!audioFile || !studentId || !studentName) {
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

    // Upload audio to Supabase Storage
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const audioPath = `${coach.id}/${studentId}/${Date.now()}-${audioFile.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from("lesson-audio")
      .upload(audioPath, audioBuffer, {
        contentType: audioFile.type,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl: audioUrl } } = supabase.storage
      .from("lesson-audio")
      .getPublicUrl(audioPath);

    // Create lesson record with processing status
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .insert({
        student_id: studentId,
        coach_id: coach.id,
        audio_url: audioUrl,
        status: "processing",
      })
      .select()
      .single();

    if (lessonError) throw lessonError;

    // Transcribe and generate notes asynchronously
    try {
      const transcription = await transcribeAudio(audioBuffer);
      const aiNotes = await generateLessonNotes(transcription, studentName);

      // Update lesson with notes
      await supabase
        .from("lessons")
        .update({
          ai_notes: aiNotes,
          status: "completed",
        })
        .eq("id", lesson.id);

      return NextResponse.json({ 
        lesson: { ...lesson, ai_notes: aiNotes, status: "completed" }
      });
    } catch (aiError) {
      console.error("AI processing error:", aiError);
      
      await supabase
        .from("lessons")
        .update({ status: "failed" })
        .eq("id", lesson.id);

      return NextResponse.json({
        lesson: { ...lesson, status: "failed" },
        error: "Failed to process audio",
      });
    }
  } catch (error) {
    console.error("Lesson upload error:", error);
    return NextResponse.json(
      { error: "Failed to process lesson" },
      { status: 500 }
    );
  }
}
