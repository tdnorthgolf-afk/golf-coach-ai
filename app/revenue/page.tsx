import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import SignOutButton from '@/components/sign-out-button'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function RevenuePage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  const { data: coach } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', user.id)
    .single()

  if (!coach) {
    redirect('/dashboard')
  }

  const { data: allBookings } = await supabase
    .from('bookings')
    .select('*, student:students(name), lesson_type:lesson_types(name, category)')
    .eq('coach_id', coach.id)
    .order('booking_date', { ascending: false })

  const bookings = allBookings || []

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

  const thisMonthBookings = bookings.filter(b => {
    const date = new Date(b.booking_date)
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear
  })

  const lastMonthBookings = bookings.filter(b => {
    const date = new Date(b.booking_date)
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
  })

  const thisYearBookings = bookings.filter(b => {
    const date = new Date(b.booking_date)
    return date.getFullYear() === thisYear
  })

  const paidThisMonth = thisMonthBookings
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + b.amount_cents, 0)

  const unpaidThisMonth = thisMonthBookings
    .filter(b => b.payment_status !== 'paid')
    .reduce((sum, b) => sum + b.amount_cents, 0)

  const paidLastMonth = lastMonthBookings
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + b.amount_cents, 0)

  const paidThisYear = thisYearBookings
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + b.amount_cents, 0)

  const lessonsThisMonth = thisMonthBookings.length
  const lessonsLastMonth = lastMonthBookings.length
  const lessonsThisYear = thisYearBookings.length

  const adultRevenue = bookings
    .filter(b => b.lesson_type?.category === 'adult')
    .reduce((sum, b) => sum + b.amount_cents, 0)

  const juniorRevenue = bookings
    .filter(b => b.lesson_type?.category === 'junior')
    .reduce((sum, b) => sum + b.amount_cents, 0)

  const playingRevenue = bookings
    .filter(b => b.lesson_type?.category === 'playing')
    .reduce((sum, b) => sum + b.amount_cents, 0)

  const formatMoney = (cents: number) => `$${(cents / 100).toLocaleString()}`

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December']

  const recentBookings = bookings.slice(0, 10)

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700 bg-slate-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400">💰 Revenue Dashboard</h1>
            <p className="text-slate-400">Track your earnings and lesson statistics</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium">
              ← Dashboard
            </Link>
            <Link href="/calendar" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
              📅 Calendar
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">{monthNames[thisMonth]} Revenue</p>
            <p className="text-3xl font-bold text-emerald-400">{formatMoney(paidThisMonth)}</p>
            {unpaidThisMonth > 0 && (
              <p className="text-yellow-400 text-sm mt-1">+ {formatMoney(unpaidThisMonth)} unpaid</p>
            )}
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">{monthNames[lastMonth]} Revenue</p>
            <p className="text-3xl font-bold text-white">{formatMoney(paidLastMonth)}</p>
            <p className="text-slate-400 text-sm mt-1">{lessonsLastMonth} lessons</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">{thisYear} Total</p>
            <p className="text-3xl font-bold text-white">{formatMoney(paidThisYear)}</p>
            <p className="text-slate-400 text-sm mt-1">{lessonsThisYear} lessons</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Lessons This Month</p>
            <p className="text-3xl font-bold text-blue-400">{lessonsThisMonth}</p>
            <p className="text-slate-400 text-sm mt-1">
              {lessonsThisMonth > lessonsLastMonth ? '↑' : lessonsThisMonth < lessonsLastMonth ? '↓' : '='} vs last month
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">👨 Adult Lessons</p>
            <p className="text-2xl font-bold text-white">{formatMoney(adultRevenue)}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">👦 Junior Lessons</p>
            <p className="text-2xl font-bold text-white">{formatMoney(juniorRevenue)}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">⛳ Playing Lessons</p>
            <p className="text-2xl font-bold text-white">{formatMoney(playingRevenue)}</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl text-white mb-4">📋 Recent Bookings</h3>
          
          {recentBookings.length === 0 ? (
            <p className="text-slate-400">No bookings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-700">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Lesson Type</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking: any) => (
                    <tr key={booking.id} className="border-b border-slate-700/50">
                      <td className="py-3 text-white">
                        {new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3 text-white">{booking.student?.name || 'Unknown'}</td>
                      <td className="py-3 text-slate-300">{booking.lesson_type?.name || 'Lesson'}</td>
                      <td className="py-3 text-white">{formatMoney(booking.amount_cents)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          booking.payment_status === 'paid' 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-yellow-600 text-white'
                        }`}>
                          {booking.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}