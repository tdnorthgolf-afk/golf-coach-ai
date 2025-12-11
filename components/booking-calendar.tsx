'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Student = { id: string; name: string }
type LessonType = { 
  id: string
  name: string
  duration_minutes: number
  price_cents: number
  category: string
}
type Booking = {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
  payment_status: string
  amount_cents: number
  student: { id: string; name: string } | null
  lesson_type: { name: string; duration_minutes: number; price_cents: number; category: string } | null
}

export default function BookingCalendar({ 
  students, 
  lessonTypes,
  initialBookings
}: { 
  students: Student[]
  lessonTypes: LessonType[]
  initialBookings: Booking[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [formData, setFormData] = useState({
    studentId: '',
    lessonTypeId: '',
    date: '',
    startTime: '09:00',
    notes: '',
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create booking')
      }

      alert('Booking created successfully!')
      setShowForm(false)
      setFormData({ studentId: '', lessonTypeId: '', date: '', startTime: '09:00', notes: '' })
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')
      
      alert('Booking cancelled')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to cancel booking')
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const selectedLessonType = lessonTypes.find(lt => lt.id === formData.lessonTypeId)

  // Group bookings by date
const groupedBookings: { [date: string]: Booking[] } = {}
;(bookings || []).forEach(booking => {
    const date = booking.booking_date
    if (!groupedBookings[date]) groupedBookings[date] = []
    groupedBookings[date].push(booking)
  })

  return (
    <div>
      {/* New Booking Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          {showForm ? '✕ Cancel' : '+ New Booking'}
        </button>
      </div>

      {/* Booking Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
          <h3 className="text-xl text-white mb-4">Create New Booking</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Student *</label>
              <select
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2"
              >
                <option value="">Select a student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Lesson Type *</label>
              <select
                required
                value={formData.lessonTypeId}
                onChange={(e) => setFormData({ ...formData, lessonTypeId: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2"
              >
                <option value="">Select lesson type</option>
                <optgroup label="Adult Lessons">
                  {lessonTypes.filter(lt => lt.category === 'adult').map(lt => (
                    <option key={lt.id} value={lt.id}>{lt.name} - {formatPrice(lt.price_cents)}</option>
                  ))}
                </optgroup>
                <optgroup label="Junior Lessons">
                  {lessonTypes.filter(lt => lt.category === 'junior').map(lt => (
                    <option key={lt.id} value={lt.id}>{lt.name} - {formatPrice(lt.price_cents)}</option>
                  ))}
                </optgroup>
                <optgroup label="Playing Lessons">
                  {lessonTypes.filter(lt => lt.category === 'playing').map(lt => (
                    <option key={lt.id} value={lt.id}>{lt.name} - {formatPrice(lt.price_cents)}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Start Time *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white mb-2">Notes (optional)</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Working on driver, etc."
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2"
              />
            </div>

            {selectedLessonType && (
              <div className="md:col-span-2 bg-slate-700 rounded-lg p-4">
                <p className="text-emerald-400 font-semibold">
                  {selectedLessonType.name}
                </p>
                <p className="text-slate-300">
                  Duration: {selectedLessonType.duration_minutes} minutes | 
                  Price: {formatPrice(selectedLessonType.price_cents)}
                </p>
              </div>
            )}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Booking'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upcoming Bookings */}
      <div>
        <h3 className="text-xl text-white mb-4">📅 Upcoming Bookings</h3>
        
        {Object.keys(groupedBookings).length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <p className="text-slate-400">No upcoming bookings</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedBookings).map(([date, dateBookings]) => (
              <div key={date}>
                <h4 className="text-lg text-emerald-400 mb-3">
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h4>
                <div className="space-y-3">
                  {dateBookings.map(booking => (
                    <div 
                      key={booking.id} 
                      className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center bg-slate-700 rounded-lg px-3 py-2">
                          <p className="text-white font-bold">{formatTime(booking.start_time)}</p>
                          <p className="text-slate-400 text-sm">{formatTime(booking.end_time)}</p>
                        </div>
                        <div>
                          <p className="text-white font-semibold">{booking.student?.name || 'Unknown'}</p>
                          <p className="text-slate-400 text-sm">{booking.lesson_type?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          booking.payment_status === 'paid' 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-yellow-600 text-white'
                        }`}>
                          {booking.payment_status === 'paid' ? '✓ Paid' : `Unpaid - ${formatPrice(booking.amount_cents)}`}
                        </span>
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}