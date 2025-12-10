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

// Create a payment intent
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { bookingId } = body

    // Get booking details
    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        *,
        student:students(name, email),
        lesson_type:lesson_types(name)
      `)
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.amount_cents,
      currency: 'usd',
      metadata: {
        booking_id: bookingId,
        student_name: booking.student?.name || 'Unknown',
        lesson_type: booking.lesson_type?.name || 'Lesson',
      },
      description: `${booking.lesson_type?.name} for ${booking.student?.name}`,
    })

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      amount: booking.amount_cents,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update payment status after successful payment
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { bookingId, paymentIntentId } = body

    const { error } = await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        stripe_payment_id: paymentIntentId,
      })
      .eq('id', bookingId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}