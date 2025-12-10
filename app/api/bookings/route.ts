import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// GET - Fetch bookings and lesson types
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    if (type === 'lesson-types') {
      const { data, error } = await supabase
        .from('lesson_types')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true })

      if (error) throw error
      return NextResponse.json({ lessonTypes: data })
    }

    // Get bookings
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: coach } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 })
    }

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        student:students(id, name, email),
        lesson_type:lesson_types(name, duration_minutes, price_cents)
      `)
      .eq('coach_id', coach.id)
      .order('booking_date', { ascending: true })

    if (error) throw error
    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new booking
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { studentId, lessonTypeId, date, startTime, notes } = body

    // Get coach
    const { data: coach } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 })
    }

    // Get lesson type details
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

    // Create booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        student_id: studentId,
        coach_id: coach.id,
        lesson_type_id: lessonTypeId,
        booking_date: date,
        start_time: startTime,
        end_time: endTime,
        amount_cents: lessonType.price_cents,
        notes: notes || null,
        status: 'confirmed',
        payment_status: 'unpaid',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Cancel a booking
export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const bookingId = searchParams.get('id')

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}