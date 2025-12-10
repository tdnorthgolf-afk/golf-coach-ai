import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
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

    // Get coach
    const { data: coach } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 })
    }

    // Transcribe audio with OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    })

    const transcribedText = transcription.text

    // Generate structured notes with GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional golf instructor's assistant. Convert lesson audio transcriptions into structured, professional lesson notes in markdown format.

Use this EXACT format:

## TECHNICAL GOALS
- [Goal 1]
- [Goal 2]
- [Goal 3]

## DRILLS
1. **[Drill Name]** – [X] minutes
   • Step-by-step instructions
   • Key focus points
   • Reps/sets if applicable

2. **[Drill Name]** – [X] minutes
   • Instructions
   • Focus points

## NOTES
- Key observations from the lesson
- Progress updates
- Important reminders

Be concise, professional, and actionable. Focus on what matters most for improvement. If the transcription is brief, create appropriate notes based on what was mentioned. Do NOT include a "Next Session" section.`
        },
        {
          role: 'user',
          content: `Student: ${studentName}\n\nLesson Transcription:\n${transcribedText}`
        }
      ],
      temperature: 0.7,
    })

    const lessonNotes = completion.choices[0].message.content || ''

    // Save lesson to database
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        student_id: studentId,
        coach_id: coach.id,
        notes: lessonNotes,
        lesson_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (lessonError) {
      console.error('Lesson error:', lessonError)
      return NextResponse.json({ error: 'Failed to save lesson' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      lesson,
      transcription: transcribedText,
      notes: lessonNotes
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to process lesson' }, { status: 500 })
  }
}