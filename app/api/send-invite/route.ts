import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { studentId, studentEmail, studentName } = body

    if (!studentId || !studentEmail) {
      return NextResponse.json({ error: 'Student ID and email required' }, { status: 400 })
    }

    // Generate unique invite code
    const inviteCode = crypto.randomBytes(16).toString('hex')

    // Create invite in database
    const { error: inviteError } = await supabase
      .from('student_invites')
      .insert({
        student_id: studentId,
        invite_code: inviteCode,
        email: studentEmail,
      })

    if (inviteError) {
      console.error('Error creating invite:', inviteError)
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student-portal/register?code=${inviteCode}`

    // Get coach name
    const coachName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Your Coach'

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: 'Golf Coach AI <onboarding@resend.dev>',
      to: studentEmail,
      subject: `${coachName} invited you to Golf Coach AI`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0d9488; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⛳ Golf Coach AI</h1>
            </div>
            <div class="content">
              <h2>Hi ${studentName}!</h2>
              <p><strong>${coachName}</strong> has invited you to access your golf training portal.</p>
              <p>With your student portal, you can:</p>
              <ul>
                <li>📝 View all your lesson notes</li>
                <li>📅 Book upcoming lessons</li>
                <li>📊 Track your progress</li>
              </ul>
              <p style="text-align: center;">
                <a href="${inviteLink}" class="button">Create Your Account</a>
              </p>
              <p style="color: #666; font-size: 14px;">This invite link expires in 7 days.</p>
              <p style="color: #666; font-size: 12px;">If the button doesn't work, copy this link:<br>${inviteLink}</p>
            </div>
            <div class="footer">
              <p>Golf Coach AI - Professional Golf Instruction</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      return NextResponse.json({ error: 'Failed to send email', details: emailError }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Invite sent successfully' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}