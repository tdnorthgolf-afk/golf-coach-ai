import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Generate invite link for a student
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { studentId } = body

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
    }

    // Get student details
    const { data: student } = await supabase
      .from('students')
      .select('id, email')
      .eq('id', studentId)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Generate unique invite code
    const inviteCode = crypto.randomBytes(16).toString('hex')

    // Create invite
    const { data: invite, error } = await supabase
      .from('student_invites')
      .insert({
        student_id: studentId,
        invite_code: inviteCode,
        email: student.email,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating invite:', error)
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student-portal/register?code=${inviteCode}`

    return NextResponse.json({ success: true, inviteLink, inviteCode })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get invite details by code
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Invite code required' }, { status: 400 })
    }

    const { data: invite } = await supabase
      .from('student_invites')
      .select('*, student:students(id, name, email)')
      .eq('invite_code', code)
      .eq('is_used', false)
      .single()

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 })
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 })
    }

    return NextResponse.json({ invite })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}