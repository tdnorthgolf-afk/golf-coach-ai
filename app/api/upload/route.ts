import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'

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
    const caption = formData.get('caption') as string | null

    if (!file || !studentId) {
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

    // Determine file type
    const fileType = file.type.startsWith('image/') 
      ? 'image' 
      : file.type.startsWith('video/') 
      ? 'video' 
      : 'document'

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${studentId}/${timestamp}-${file.name}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('golf-coach-media')
      .upload(fileName, file, {
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

    // Save media record to database
    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .insert({
        student_id: studentId,
        lesson_id: lessonId,
        coach_id: userData.id,
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

    // Update student thumbnail if this is the first image
    if (fileType === 'image') {
      const { data: existingStudent } = await supabase
        .from('students')
        .select('thumbnail_url')
        .eq('id', studentId)
        .single()

      if (existingStudent && !existingStudent.thumbnail_url) {
        await supabase
          .from('students')
          .update({ thumbnail_url: publicUrl })
          .eq('id', studentId)
      }
    }

    return NextResponse.json({ 
      success: true, 
      media: mediaData,
      url: publicUrl 
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
