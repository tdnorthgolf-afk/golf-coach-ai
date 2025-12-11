import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch rounds for a student
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const roundId = searchParams.get('roundId')

    if (roundId) {
      const { data: round } = await supabase
        .from('rounds')
        .select('*')
        .eq('id', roundId)
        .single()

      const { data: shots } = await supabase
        .from('shots')
        .select('*')
        .eq('round_id', roundId)
        .order('hole_number', { ascending: true })
        .order('shot_number', { ascending: true })

      return NextResponse.json({ round, shots })
    }

    if (studentId) {
      const { data: rounds } = await supabase
        .from('rounds')
        .select('*')
        .eq('student_id', studentId)
        .order('round_date', { ascending: false })

      return NextResponse.json({ rounds })
    }

    return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new round
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentId, courseName, teeColor, roundDate, holes, notes } = body

    if (!studentId || !courseName || !roundDate || !holes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate totals
    let totalScore = 0
    let totalPutts = 0
    let fairwaysHit = 0
    let fairwaysTotal = 0
    let gir = 0

    holes.forEach((hole: any) => {
      totalScore += hole.score || 0
      totalPutts += hole.putts || 0
      
      if (hole.par > 3) {
        fairwaysTotal++
        if (hole.fairwayHit) fairwaysHit++
      }
      
      if (hole.greenInRegulation) gir++
    })

    // Create round
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .insert({
        student_id: studentId,
        course_name: courseName,
        tee_color: teeColor,
        round_date: roundDate,
        total_score: totalScore,
        total_putts: totalPutts,
        fairways_hit: fairwaysHit,
        fairways_total: fairwaysTotal,
        greens_in_regulation: gir,
        greens_total: 18,
        sg_off_tee: 0,
        sg_approach: 0,
        sg_around_green: 0,
        sg_putting: 0,
        sg_total: 0,
        notes: notes || null,
      })
      .select()
      .single()

    if (roundError) {
      console.error('Round error:', roundError)
      return NextResponse.json({ error: 'Failed to create round' }, { status: 500 })
    }

    return NextResponse.json({ success: true, round })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a round
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const roundId = searchParams.get('id')

    if (!roundId) {
      return NextResponse.json({ error: 'Round ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('rounds')
      .delete()
      .eq('id', roundId)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete round' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}