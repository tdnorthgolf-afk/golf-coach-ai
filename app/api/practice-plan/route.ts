import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentId, availableTime, focusArea } = body

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
    }

    // Get student info
    const { data: student } = await supabase
      .from('students')
      .select('name')
      .eq('id', studentId)
      .single()

    // Get recent rounds for stats
    const { data: rounds } = await supabase
      .from('rounds')
      .select('*')
      .eq('student_id', studentId)
      .order('round_date', { ascending: false })
      .limit(10)

    // Get recent lessons for context
    const { data: lessons } = await supabase
      .from('lessons')
      .select('notes, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Calculate averages from rounds
    let statsContext = "No round data available yet."
    
    if (rounds && rounds.length > 0) {
      const avgScore = (rounds.reduce((sum, r) => sum + (r.total_score || 0), 0) / rounds.length).toFixed(1)
      const avgPutts = (rounds.reduce((sum, r) => sum + (r.total_putts || 0), 0) / rounds.length).toFixed(1)
      const avgFairways = rounds.filter(r => r.fairways_total > 0).length > 0
        ? ((rounds.reduce((sum, r) => sum + (r.fairways_hit || 0), 0) / rounds.reduce((sum, r) => sum + (r.fairways_total || 0), 0)) * 100).toFixed(0)
        : 'N/A'
      const avgGIR = ((rounds.reduce((sum, r) => sum + (r.greens_in_regulation || 0), 0) / rounds.length / 18) * 100).toFixed(0)
      
      const avgSgOffTee = (rounds.reduce((sum, r) => sum + (r.sg_off_tee || 0), 0) / rounds.length).toFixed(2)
      const avgSgApproach = (rounds.reduce((sum, r) => sum + (r.sg_approach || 0), 0) / rounds.length).toFixed(2)
      const avgSgAroundGreen = (rounds.reduce((sum, r) => sum + (r.sg_around_green || 0), 0) / rounds.length).toFixed(2)
      const avgSgPutting = (rounds.reduce((sum, r) => sum + (r.sg_putting || 0), 0) / rounds.length).toFixed(2)

      statsContext = `
Player Statistics (last ${rounds.length} rounds):
- Average Score: ${avgScore}
- Average Putts: ${avgPutts}
- Fairways Hit: ${avgFairways}%
- Greens in Regulation: ${avgGIR}%
- Strokes Gained Off Tee: ${avgSgOffTee}
- Strokes Gained Approach: ${avgSgApproach}
- Strokes Gained Around Green: ${avgSgAroundGreen}
- Strokes Gained Putting: ${avgSgPutting}
`
    }

    // Build lesson context
    let lessonContext = ""
    if (lessons && lessons.length > 0) {
      lessonContext = "\n\nRecent Lesson Notes:\n" + lessons.map(l => `- ${l.notes}`).join('\n')
    }

    // Build the prompt
    const prompt = `You are an expert golf coach creating a personalized practice plan.

Student: ${student?.name || 'Student'}
Available Practice Time: ${availableTime || 60} minutes
${focusArea ? `Requested Focus Area: ${focusArea}` : ''}

${statsContext}
${lessonContext}

Based on this information, create a structured practice plan that:
1. Addresses the player's weakest areas (lowest strokes gained categories)
2. Fits within their available time
3. Includes specific drills with clear instructions
4. Has measurable goals for each drill
5. Balances technical work with game-like practice

Format the plan as a structured routine with time allocations for each section.
Include warm-up, main practice blocks, and cool-down.
Be specific with drill names and how to perform them.
Keep instructions concise but actionable.`

    // Generate practice plan with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert golf instructor who creates personalized, effective practice plans. Your plans are specific, actionable, and based on data-driven insights about the player\'s game.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const practicePlan = completion.choices[0]?.message?.content || 'Unable to generate practice plan.'

    return NextResponse.json({ 
      success: true, 
      practicePlan,
      stats: rounds && rounds.length > 0 ? {
        roundCount: rounds.length,
        avgScore: (rounds.reduce((sum, r) => sum + (r.total_score || 0), 0) / rounds.length).toFixed(1),
        avgPutts: (rounds.reduce((sum, r) => sum + (r.total_putts || 0), 0) / rounds.length).toFixed(1),
      } : null
    })
  } catch (error) {
    console.error('Error generating practice plan:', error)
    return NextResponse.json({ error: 'Failed to generate practice plan' }, { status: 500 })
  }
}