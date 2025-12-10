import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const studentId = formData.get('studentId') as string
    const lessonId = formData.get('lessonId') as string | null
    const caption = formData.get('caption') as string || ''

    if (!file || !studentId) {
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

    // Determine file type
    const fileType = file.type.startsWith('image/') 
      ? 'image' 
      : file.type.startsWith('video/') 
      ? 'video' 
      : 'document'

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${studentId}/${timestamp}-${file.name}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('golf-coach-media')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('golf-coach-media')
      .getPublicUrl(fileName)

    // Save media record to database (with optional lesson_id)
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .insert({
        student_id: studentId,
        lesson_id: lessonId || null,
        coach_id: coach.id,
        file_url: publicUrl,
        file_type: fileType,
        file_name: file.name,
        caption: caption,
      })
      .select()
      .single()

    if (mediaError) {
      console.error('Media record error:', mediaError)
      return NextResponse.json({ error: 'Failed to save media record' }, { status: 500 })
    }

    return NextResponse.json({ success: true, media, url: publicUrl })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}