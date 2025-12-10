import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Hash password
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Register student account
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { inviteCode, email, password } = body

    if (!inviteCode || !email || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    // Verify invite
    const { data: invite } = await supabase
      .from('student_invites')
      .select('*, student:students(id, name)')
      .eq('invite_code', inviteCode)
      .eq('is_used', false)
      .single()

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 })
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 })
    }

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from('student_accounts')
      .select('id')
      .eq('student_id', invite.student_id)
      .single()

    if (existingAccount) {
      return NextResponse.json({ error: 'Account already exists' }, { status: 400 })
    }

    // Create account
    const { data: account, error: accountError } = await supabase
      .from('student_accounts')
      .insert({
        student_id: invite.student_id,
        email: email.toLowerCase(),
        password_hash: hashPassword(password),
      })
      .select()
      .single()

    if (accountError) {
      console.error('Error creating account:', accountError)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    // Mark invite as used
    await supabase
      .from('student_invites')
      .update({ is_used: true })
      .eq('id', invite.id)

    // Update student email if different
    if (email.toLowerCase() !== invite.student?.email?.toLowerCase()) {
      await supabase
        .from('students')
        .update({ email: email.toLowerCase() })
        .eq('id', invite.student_id)
    }

    return NextResponse.json({ 
      success: true, 
      studentId: invite.student_id,
      studentName: invite.student?.name
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Login student
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Find account
    const { data: account } = await supabase
      .from('student_accounts')
      .select('*, student:students(id, name)')
      .eq('email', email.toLowerCase())
      .single()

    if (!account) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Verify password
    if (account.password_hash !== hashPassword(password)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Update last login
    await supabase
      .from('student_accounts')
      .update({ last_login: new Date().toISOString() })
      .eq('id', account.id)

    return NextResponse.json({ 
      success: true, 
      studentId: account.student_id,
      studentName: account.student?.name
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}