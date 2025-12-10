import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const studentId = formData.get('studentId') as string
    const studentName = formData.get('studentName') as string

    if (!audioFile || !studentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get user ID from Supabase
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Upload audio to Supabase Storage
    const timestamp = Date.now()
    const audioFileName = `${studentId}/audio/${timestamp}-${audioFile.name}`
    
    const { data: audioUpload, error: audioError } = await supabase.storage
      .from('golf-coach-media')
      .upload(audioFileName, audioFile, {
        contentType: audioFile.type,
        upsert: false,
      })

    if (audioError) {
      console.error('Audio upload error:', audioError)
      return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 })
    }

    const { data: { publicUrl: audioUrl } } = supabase.storage
      .from('golf-coach-media')
      .getPublicUrl(audioFileName)

    // Transcribe audio with OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    })

    const transcriptionText = transcription.text

    // Generate structured lesson notes with GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional golf instructor's assistant. Convert lesson audio transcriptions into structured, professional lesson notes in markdown format.

Use this EXACT format:

## TECHNICAL GOALS
• [Goal 1]
• [Goal 2]
• [Goal 3]

## DRILLS
1. **[Drill Name]** – [X] minutes
   • Step-by-step instructions
   • Key focus points
   • Reps/sets if applicable

2. **[Drill Name]** – [X] minutes
   • Instructions
   • Focus points

## NOTES
• Key observations from the lesson
• Progress updates
• Important reminders

## NEXT SESSION
Brief summary of what to work on before next lesson (1-2 sentences).

Be concise, professional, and actionable. Focus on what matters most for improvement.`
        },
        {
          role: 'user',
          content: `Student: ${studentName}\n\nLesson Transcription:\n${transcriptionText}`
        }
      ],
      temperature: 0.7,
    })

    const lessonNotes = completion.choices[0].message.content || ''

    // Create lesson record
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        student_id: studentId,
        coach_id: userData.id,
        title: `Lesson with ${studentName}`,
        notes: lessonNotes,
        audio_url: audioUrl,
      })
      .select()
      .single()

    if (lessonError) {
      console.error('Lesson record error:', lessonError)
      return NextResponse.json({ error: 'Failed to save lesson' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      lesson: lessonData,
      transcription: transcriptionText,
      notes: lessonNotes
    })
  } catch (error) {
    console.error('Error processing audio:', error)
    return NextResponse.json({ 
      error: 'Failed to process audio', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
