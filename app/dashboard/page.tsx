import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import AddStudentDialog from '@/components/add-student-dialog'
import SignOutButton from '@/components/sign-out-button'
import { CalendarDays, BarChart3, Clock, TrendingUp, ChevronRight, Users } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function Dashboard() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
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
    const { data: newCoach } = await supabase
      .from('users')
      .insert({
        clerk_id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      })
      .select('id')
      .single()
    coachId = newCoach?.id
  }

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false })

  const { count: lessonsThisWeek } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { data: upcomingBookings } = await supabase
    .from('bookings')
    .select('*, students(name), lesson_types(name)')
    .gte('booking_date', new Date().toISOString().split('T')[0])
    .order('booking_date', { ascending: true })
    .limit(5)

  return (
    <div className="min-h-screen bg-[#0A1A20]">
      {/* Pebble Beach Header */}
      <header className="border-b border-[#D6C8B4]/10 bg-[#002D40] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-serif text-2xl font-bold italic bg-[#E65722] text-white shadow-lg shadow-[#E65722]/40">
                G
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Golf Coach</h1>
                <p className="text-xs font-medium tracking-widest text-[#E65722]">
                  PEBBLE BEACH
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <Link
                href="/calendar"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-[#E8E3DC] hover:bg-[#D6C8B4]/10"
              >
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">Calendar</span>
              </Link>
              <Link
                href="/revenue"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-[#E8E3DC] hover:bg-[#D6C8B4]/10"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Revenue</span>
              </Link>
              <div className="w-px h-6 mx-2 bg-[#D6C8B4]/20"></div>
              <SignOutButton />
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#E8E3DC]">
            Welcome back, {user.firstName || 'Coach'}
          </h2>
          <p className="mt-1 text-[#5F9EA0]">Here&apos;s your performance overview</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Students */}
          <div className="rounded-xl p-6 relative overflow-hidden bg-[#D6C8B4]">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#002D40]/20 translate-x-[30%] -translate-y-[30%]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-[#5F9EA0]">Students</p>
                  <p className="text-4xl font-bold mt-2 text-[#0B2D38]">{students?.length || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#002D40]/10">
                  <Users className="w-6 h-6 text-[#002D40]" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#002D40]/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#E65722]"></div>
                  <span className="text-sm font-medium text-[#0B2D38]">Active Roster</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lessons This Week */}
          <div className="rounded-xl p-6 relative overflow-hidden bg-[#D6C8B4]">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#E65722]/20 translate-x-[30%] -translate-y-[30%]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-[#5F9EA0]">This Week</p>
                  <p className="text-4xl font-bold mt-2 text-[#0B2D38]">{lessonsThisWeek || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#E65722]/15">
                  <TrendingUp className="w-6 h-6 text-[#E65722]" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#002D40]/10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#E65722]" />
                  <span className="text-sm font-medium text-[#0B2D38]">Lessons Completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="rounded-xl p-6 relative overflow-hidden bg-[#D6C8B4]">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#87CEEB]/20 translate-x-[30%] -translate-y-[30%]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-[#5F9EA0]">Upcoming</p>
                  <p className="text-4xl font-bold mt-2 text-[#0B2D38]">{upcomingBookings?.length || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#002D40]/10">
                  <Clock className="w-6 h-6 text-[#002D40]" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#002D40]/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#002D40]" />
                  <span className="text-sm font-medium text-[#0B2D38]">Sessions Scheduled</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students List */}
          <div className="lg:col-span-2">
            <div className="rounded-xl p-6 bg-[#002D40]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#E8E3DC]">Your Students</h2>
                  <div className="h-1 w-12 mt-2 rounded-full bg-[#E65722]" />
                </div>
                <AddStudentDialog />
              </div>

              {students && students.length > 0 ? (
                <div className="space-y-2">
                  {students.map((student) => (
                    <Link
                      key={student.id}
                      href={`/student/${student.id}`}
                      className="block group"
                    >
                      <div className="flex items-center justify-between p-4 rounded-xl border border-[#D6C8B4]/10 bg-[#D6C8B4]/5 hover:border-[#E65722] hover:bg-[#E65722]/5 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold bg-[#D6C8B4] text-[#0B2D38]">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-[#E8E3DC] group-hover:text-[#E65722] transition-colors">
                              {student.name}
                            </p>
                            <p className="text-sm text-[#5F9EA0]">
                              {student.email || student.phone || 'No contact info'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#5F9EA0] group-hover:text-[#E65722] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold bg-[#D6C8B4] text-[#0B2D38]">
                    +
                  </div>
                  <p className="text-[#E8E3DC] mb-2">No students yet</p>
                  <p className="text-sm text-[#5F9EA0]">Add your first student to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="lg:col-span-1">
            <div className="rounded-xl p-6 bg-[#002D40]">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-[#E8E3DC]">Upcoming Sessions</h2>
                <div className="h-1 w-12 mt-2 rounded-full bg-[#E65722]" />
              </div>

              {upcomingBookings && upcomingBookings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingBookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="p-4 rounded-xl border border-[#D6C8B4]/10 bg-[#D6C8B4]/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-[#E8E3DC]">{booking.students?.name}</p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          booking.payment_status === 'paid' 
                            ? 'bg-[#E65722]/15 text-[#E65722]' 
                            : 'bg-[#D94F3A]/15 text-[#D94F3A]'
                        }`}>
                          {booking.payment_status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-[#5F9EA0]">{booking.lesson_types?.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-[#E65722]" />
                        <p className="text-sm text-[#E65722]">
                          {new Date(booking.booking_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })} at {booking.start_time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 mx-auto mb-3 text-[#5F9EA0]" />
                  <p className="text-[#5F9EA0]">No upcoming sessions</p>
                </div>
              )}

              <Link
                href="/calendar"
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium transition-all bg-[#E65722] text-white hover:bg-[#E65722]/90"
              >
                <CalendarDays className="w-4 h-4" />
                View Full Calendar
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}