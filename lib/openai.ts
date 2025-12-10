import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    // Create a File object from the buffer
    const file = new File([audioBuffer], 'audio.m4a', { type: 'audio/m4a' })
    
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
    })
    
    return transcription.text
  } catch (error) {
    console.error('Transcription error:', error)
    throw new Error('Failed to transcribe audio')
  }
}

export async function generateLessonNotes(
  transcription: string,
  studentName: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional golf instructor's assistant. Convert lesson transcriptions into structured, professional coaching notes.

Format the notes EXACTLY as follows with proper markdown:

## TECHNICAL GOALS
• [Bullet points of technical objectives discussed]
• [Be specific and actionable]

## DRILLS
1. **[Drill Name]** – [X minutes]
   • [Step-by-step instructions]
   • [Reps or sets if mentioned]
   • Focus: [Key focus points]

2. **[Next Drill Name]** – [X minutes]
   • [Instructions]
   • Focus: [Focus points]

## NOTES
• [Key observations from the lesson]
• [Important points discussed]
• [Student feedback or concerns]

## NEXT SESSION
[1-2 sentences about what to work on next or areas to address in the upcoming lesson]

Keep the tone professional but warm. Use the student's name naturally. Be specific about technical details.`,
        },
        {
          role: 'user',
          content: `Student: ${studentName}\n\nTranscription:\n${transcription}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    return completion.choices[0].message.content || 'Failed to generate notes'
  } catch (error) {
    console.error('Note generation error:', error)
    throw new Error('Failed to generate lesson notes')
  }
}
