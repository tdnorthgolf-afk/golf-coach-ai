import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

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

    const body = await req.json()
    const { name, email, phone } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data: existingCoach } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single()

    let coachId: string

    if (existingCoach) {
      coachId = existingCoach.id
    } else {
      const { data: newCoach, error: coachError } = await supabase
        .from('users')
        .insert({
          clerk_id: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        })
        .select('id')
        .single()

      if (coachError || !newCoach) {
        return NextResponse.json({ error: 'Failed to create coach' }, { status: 500 })
      }
      coachId = newCoach.id
    }

    // Create student first
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        coach_id: coachId,
        name,
        email: email || null,
        phone: phone || null,
      })
      .select()
      .single()

    if (studentError) {
      console.error('Student creation error:', studentError)
      return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
    }

    // Try to send invite email if student has email
    let inviteSent = false
    if (email) {
      try {
        // Generate invite code
        const inviteCode = crypto.randomBytes(16).toString('hex')

        // Create invite in database
        await supabase
          .from('student_invites')
          .insert({
            student_id: student.id,
            invite_code: inviteCode,
            email: email,
          })

        // Try to send email using Resend
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student-portal/register?code=${inviteCode}`
        const coachName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Your Coach'

        const { error: emailError } = await resend.emails.send({
          from: 'Golf Coach AI <onboarding@resend.dev>',
          to: email,
          subject: `${coachName} invited you to Golf Coach AI`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0d9488; color: white; padding: 20px; text-align: center;">
                <h1>⛳ Golf Coach AI</h1>
              </div>
              <div style="background: #f8fafc; padding: 30px;">
                <h2>Hi ${name}!</h2>
                <p><strong>${coachName}</strong> has invited you to access your golf training portal.</p>
                <p>With your student portal, you can:</p>
                <ul>
                  <li>📝 View all your lesson notes</li>
                  <li>📅 Book upcoming lessons</li>
                  <li>📊 Track your progress</li>
                </ul>
                <p style="text-align: center;">
                  <a href="${inviteLink}" style="display: inline-block; background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Create Your Account</a>
                </p>
                <p style="color: #666; font-size: 14px;">This invite link expires in 7 days.</p>
              </div>
            </div>
          `,
        })

        if (!emailError) {
          inviteSent = true
        } else {
          console.log('Email send error (non-fatal):', emailError)
        }
      } catch (emailError) {
        console.log('Failed to send invite email (non-fatal):', emailError)
        // Don't fail - student was created successfully
      }
    }

    return NextResponse.json({ 
      success: true, 
      student,
      inviteSent,
      message: inviteSent ? 'Student created and invite email sent!' : 'Student created successfully!'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('id')

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
    }

    await supabase.from('media').delete().eq('student_id', studentId)
    await supabase.from('lessons').delete().eq('student_id', studentId)
    await supabase.from('student_invites').delete().eq('student_id', studentId)
    await supabase.from('student_accounts').delete().eq('student_id', studentId)
    await supabase.from('bookings').delete().eq('student_id', studentId)
    
    const { error: deleteError } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, name, email, phone } = body

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 })
    }

    const { data: student, error: updateError } = await supabase
      .from('students')
      .update({
        name,
        email: email || null,
        phone: phone || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
    }

    return NextResponse.json({ success: true, student })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}