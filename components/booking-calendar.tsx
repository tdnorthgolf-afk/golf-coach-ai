'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Clock } from 'lucide-react'

interface Booking {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
  payment_status: string
  students: { name: string } | null
  lesson_types: { name: string; price: number; duration: number } | null
}

interface LessonType {
  id: string
  name: string
  price: number
  duration: number
}

interface BookingCalendarProps {
  bookings: Booking[]
  lessonTypes: LessonType[]
}

export default function BookingCalendar({ bookings, lessonTypes }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getBookingsForDate = (date: string) => {
    return (bookings || []).filter(b => b.booking_date === date)
  }

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 md:h-32" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(day)
    const dayBookings = getBookingsForDate(dateStr)
    const isPast = new Date(dateStr) < new Date(new Date().toDateString())

    days.push(
      <div
        key={day}
        onClick={() => !isPast && setSelectedDate(dateStr)}
        className={`h-24 md:h-32 border border-[#D6C8B4]/10 rounded-lg p-2 cursor-pointer transition-all ${
          isToday(day) ? 'bg-[#E65722]/10 border-[#E65722]/30' : 'bg-[#002D40]/50 hover:bg-[#002D40]'
        } ${isPast ? 'opacity-50 cursor-not-allowed' : ''} ${selectedDate === dateStr ? 'ring-2 ring-[#E65722]' : ''}`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-medium ${isToday(day) ? 'text-[#E65722]' : 'text-[#E8E3DC]'}`}>
            {day}
          </span>
          {dayBookings.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#E65722] text-white">
              {dayBookings.length}
            </span>
          )}
        </div>
        <div className="space-y-1 overflow-hidden">
          {dayBookings.slice(0, 2).map((booking) => (
            <div
              key={booking.id}
              className={`text-xs px-1.5 py-1 rounded truncate ${
                booking.payment_status === 'paid'
                  ? 'bg-[#E65722]/20 text-[#E65722]'
                  : 'bg-[#5F9EA0]/20 text-[#5F9EA0]'
              }`}
            >
              {booking.start_time?.slice(0, 5)} {booking.students?.name?.split(' ')[0]}
            </div>
          ))}
          {dayBookings.length > 2 && (
            <p className="text-xs text-[#5F9EA0]">+{dayBookings.length - 2} more</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg border border-[#D6C8B4]/20 text-[#E8E3DC] hover:bg-[#D6C8B4]/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-[#E8E3DC]">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg border border-[#D6C8B4]/20 text-[#E8E3DC] hover:bg-[#D6C8B4]/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-[#E65722] text-white hover:bg-[#E65722]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-[#5F9EA0] py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="mt-6 p-4 rounded-xl bg-[#0A1A20] border border-[#D6C8B4]/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#E8E3DC]">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="p-1 text-[#5F9EA0] hover:text-[#E8E3DC]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {getBookingsForDate(selectedDate).length > 0 ? (
            <div className="space-y-3">
              {getBookingsForDate(selectedDate).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#002D40] border border-[#D6C8B4]/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#D6C8B4]">
                      <Clock className="w-5 h-5 text-[#0B2D38]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#E8E3DC]">{booking.students?.name}</p>
                      <p className="text-sm text-[#5F9EA0]">
                        {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)} • {booking.lesson_types?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        booking.payment_status === 'paid'
                          ? 'bg-[#E65722]/15 text-[#E65722]'
                          : 'bg-[#D94F3A]/15 text-[#D94F3A]'
                      }`}
                    >
                      {booking.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                    <p className="text-sm font-medium text-[#E8E3DC] mt-1">
                      ${booking.lesson_types?.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#5F9EA0] text-center py-4">No bookings for this date</p>
          )}
        </div>
      )}
    </div>
  )
}