import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentId, lessonTypeId, date, startTime, notes } = body

    if (!studentId || !lessonTypeId || !date || !startTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get student to find coach
    const { data: student } = await supabase
      .from('students')
      .select('id, coach_id, name')
      .eq('id', studentId)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get lesson type
    const { data: lessonType } = await supabase
      .from('lesson_types')
      .select('*')
      .eq('id', lessonTypeId)
      .single()

    if (!lessonType) {
      return NextResponse.json({ error: 'Lesson type not found' }, { status: 404 })
    }

    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    const endDate = new Date(startDate.getTime() + lessonType.duration_minutes * 60000)
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

    // Create booking with 'pending' status (coach needs to confirm)
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        student_id: studentId,
        coach_id: student.coach_id,
        lesson_type_id: lessonTypeId,
        booking_date: date,
        start_time: startTime,
        end_time: endTime,
        amount_cents: lessonType.price_cents,
        notes: notes || null,
        status: 'pending',
        payment_status: 'unpaid',
      })
      .select()
      .single()

    if (error) {
      console.error('Booking error:', error)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}