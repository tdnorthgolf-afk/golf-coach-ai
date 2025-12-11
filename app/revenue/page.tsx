import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, CreditCard, Calendar } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function RevenuePage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const { data: coach } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', user.id)
    .single()

  if (!coach) redirect('/dashboard')

  // Get all paid bookings
  const { data: paidBookings } = await supabase
    .from('bookings')
    .select('*, lesson_types(name, price)')
    .eq('coach_id', coach.id)
    .eq('payment_status', 'paid')
    .order('booking_date', { ascending: false })

  // Calculate stats
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

  const thisMonthRevenue = paidBookings?.filter(b => {
    const d = new Date(b.booking_date)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  }).reduce((sum, b) => sum + (b.lesson_types?.price || 0), 0) || 0

  const lastMonthRevenue = paidBookings?.filter(b => {
    const d = new Date(b.booking_date)
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
  }).reduce((sum, b) => sum + (b.lesson_types?.price || 0), 0) || 0

  const totalRevenue = paidBookings?.reduce((sum, b) => sum + (b.lesson_types?.price || 0), 0) || 0
  
  const percentChange = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(0)
    : thisMonthRevenue > 0 ? '100' : '0'

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
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Revenue</h1>
                  <p className="text-xs text-[#5F9EA0]">Track your earnings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* This Month */}
          <div className="rounded-xl p-6 bg-[#D6C8B4] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#E65722]/20 translate-x-[30%] -translate-y-[30%]" />
            <div className="relative z-10">
              <p className="text-xs font-medium uppercase tracking-widest text-[#5F9EA0]">This Month</p>
              <p className="text-3xl font-bold mt-2 text-[#0B2D38]">${thisMonthRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-2 mt-3">
                {Number(percentChange) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-[#E65722]" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-[#D94F3A]" />
                )}
                <span className={`text-sm font-medium ${Number(percentChange) >= 0 ? 'text-[#E65722]' : 'text-[#D94F3A]'}`}>
                  {percentChange}% vs last month
                </span>
              </div>
            </div>
          </div>

          {/* Last Month */}
          <div className="rounded-xl p-6 bg-[#D6C8B4] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#002D40]/10 translate-x-[30%] -translate-y-[30%]" />
            <div className="relative z-10">
              <p className="text-xs font-medium uppercase tracking-widest text-[#5F9EA0]">Last Month</p>
              <p className="text-3xl font-bold mt-2 text-[#0B2D38]">${lastMonthRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-2 mt-3">
                <Calendar className="w-4 h-4 text-[#5F9EA0]" />
                <span className="text-sm text-[#5F9EA0]">Previous period</span>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="rounded-xl p-6 bg-[#D6C8B4] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#87CEEB]/30 translate-x-[30%] -translate-y-[30%]" />
            <div className="relative z-10">
              <p className="text-xs font-medium uppercase tracking-widest text-[#5F9EA0]">All Time</p>
              <p className="text-3xl font-bold mt-2 text-[#0B2D38]">${totalRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-2 mt-3">
                <DollarSign className="w-4 h-4 text-[#5F9EA0]" />
                <span className="text-sm text-[#5F9EA0]">Total earned</span>
              </div>
            </div>
          </div>

          {/* Total Sessions */}
          <div className="rounded-xl p-6 bg-[#D6C8B4] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#002D40]/10 translate-x-[30%] -translate-y-[30%]" />
            <div className="relative z-10">
              <p className="text-xs font-medium uppercase tracking-widest text-[#5F9EA0]">Paid Sessions</p>
              <p className="text-3xl font-bold mt-2 text-[#0B2D38]">{paidBookings?.length || 0}</p>
              <div className="flex items-center gap-2 mt-3">
                <CreditCard className="w-4 h-4 text-[#5F9EA0]" />
                <span className="text-sm text-[#5F9EA0]">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl p-6 bg-[#002D40]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#E8E3DC]">Recent Transactions</h3>
            <div className="h-1 w-12 mt-2 rounded-full bg-[#E65722]" />
          </div>

          {paidBookings && paidBookings.length > 0 ? (
            <div className="space-y-3">
              {paidBookings.slice(0, 10).map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-[#D6C8B4]/10 bg-[#D6C8B4]/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#E65722]/15">
                      <DollarSign className="w-5 h-5 text-[#E65722]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#E8E3DC]">{booking.lesson_types?.name}</p>
                      <p className="text-sm text-[#5F9EA0]">
                        {new Date(booking.booking_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-[#E65722]">
                    ${booking.lesson_types?.price || 0}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#D6C8B4]">
                <DollarSign className="w-8 h-8 text-[#0B2D38]" />
              </div>
              <p className="text-[#E8E3DC] mb-2">No transactions yet</p>
              <p className="text-sm text-[#5F9EA0]">Completed paid lessons will appear here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}