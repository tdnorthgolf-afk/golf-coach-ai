import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import BookingCalendar from '@/components/booking-calendar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function CalendarPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const { data: coach } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', user.id)
    .single()

  if (!coach) redirect('/dashboard')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, students(name), lesson_types(name, price, duration)')
    .eq('coach_id', coach.id)
    .order('booking_date', { ascending: true })

  const { data: lessonTypes } = await supabase
    .from('lesson_types')
    .select('*')
    .eq('coach_id', coach.id)

  return (
    <div className="min-h-screen bg-[#0A1A20]">
      {/* Header */}
      <header className="border-b border-[#D6C8B4]/10 bg-[#002D40] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-[#5F9EA0] hover:text-[#E8E3DC] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-[#D6C8B4]/20"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#E65722]">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Calendar</h1>
                  <p className="text-xs text-[#5F9EA0]">Manage your schedule</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl p-5 bg-[#D6C8B4]">
            <p className="text-xs font-medium uppercase tracking-widest text-[#5F9EA0]">Today</p>
            <p className="text-3xl font-bold mt-1 text-[#0B2D38]">
              {bookings?.filter(b => b.booking_date === new Date().toISOString().split('T')[0]).length || 0}
            </p>
            <p className="text-sm text-[#5F9EA0] mt-1">sessions</p>
          </div>
          <div className="rounded-xl p-5 bg-[#D6C8B4]">
            <p className="text-xs font-medium uppercase tracking-widest text-[#5F9EA0]">This Week</p>
            <p className="text-3xl font-bold mt-1 text-[#0B2D38]">
              {bookings?.filter(b => {
                const bookingDate = new Date(b.booking_date)
                const today = new Date()
                const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                return bookingDate >= today && bookingDate <= weekEnd
              }).length || 0}
            </p>
            <p className="text-sm text-[#5F9EA0] mt-1">sessions</p>
          </div>
          <div className="rounded-xl p-5 bg-[#D6C8B4]">
            <p className="text-xs font-medium uppercase tracking-widest text-[#5F9EA0]">Pending</p>
            <p className="text-3xl font-bold mt-1 text-[#E65722]">
              {bookings?.filter(b => b.status === 'pending').length || 0}
            </p>
            <p className="text-sm text-[#5F9EA0] mt-1">to confirm</p>
          </div>
        </div>

        {/* Calendar Component */}
        <div className="rounded-xl p-6 bg-[#002D40]">
          <BookingCalendar bookings={bookings || []} lessonTypes={lessonTypes || []} />
        </div>
      </main>
    </div>
  )
}