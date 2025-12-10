import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import SignOutButton from '@/components/sign-out-button'
import BookingCalendar from '@/components/booking-calendar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function CalendarPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // Get coach
  const { data: coach } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', user.id)
    .single()

  // Get students for dropdown
  let students: any[] = []
  if (coach) {
    const { data } = await supabase
      .from('students')
      .select('id, name')
      .eq('coach_id', coach.id)
      .order('name', { ascending: true })
    students = data || []
  }

  // Get lesson types
  const { data: lessonTypes } = await supabase
    .from('lesson_types')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })

  // Get bookings
  let bookings: any[] = []
  if (coach) {
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        student:students(id, name),
        lesson_type:lesson_types(name, duration_minutes, price_cents, category)
      `)
      .eq('coach_id', coach.id)
      .gte('booking_date', new Date().toISOString().split('T')[0])
      .order('booking_date', { ascending: true })
    bookings = data || []
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700 bg-slate-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400">Calendar & Bookings</h1>
            <p className="text-slate-400">Manage your lesson schedule</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium">
              ← Dashboard
            </Link>
            <Link href="/revenue" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium">
              💰 Revenue
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="p-8 max-w-6xl mx-auto">
        <BookingCalendar 
          students={students} 
          lessonTypes={lessonTypes || []} 
          initialBookings={bookings}
        />
      </main>
    </div>
  )
}