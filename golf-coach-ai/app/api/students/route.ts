import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, phone, notes } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
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

    // Create student
    const { data: student, error } = await supabase
      .from('students')
      .insert({
        coach_id: userData.id,
        name,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating student:', error)
      return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
    }

    return NextResponse.json({ success: true, student })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
