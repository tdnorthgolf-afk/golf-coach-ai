import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
    }

    // Get lessons
    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    // Get upcoming bookings
    const today = new Date().toISOString().split('T')[0]
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, lesson_type:lesson_types(name, duration_minutes, price_cents)')
      .eq('student_id', studentId)
      .gte('booking_date', today)
      .order('booking_date', { ascending: true })

    return NextResponse.json({ lessons: lessons || [], bookings: bookings || [] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}