'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type LessonType = {
  id: string
  name: string
  description: string
  duration_minutes: number
  price_cents: number
  category: string
}

export default function StudentBookingPage() {
  const [studentId, setStudentId] = useState<string | null>(null)
  const [studentName, setStudentName] = useState<string | null>(null)
  const [lessonTypes, setLessonTypes] = useState<LessonType[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('09:00')
  const [notes, setNotes] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const id = localStorage.getItem('studentId')
    const name = localStorage.getItem('studentName')
    
    if (!id) {
      router.push('/student-portal')
      return
    }

    setStudentId(id)
    setStudentName(name)
    loadLessonTypes()
  }, [])

  const loadLessonTypes = async () => {
    try {
      const response = await fetch('/api/bookings?type=lesson-types')
      const data = await response.json()
      if (data.lessonTypes) {
        setLessonTypes(data.lessonTypes)
      }
    } catch (error) {
      console.error('Error loading lesson types:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !selectedDate || !selectedTime) {
      alert('Please fill in all fields')
      return
    }

    setBooking(true)

    try {
      const response = await fetch('/api/student-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          lessonTypeId: selectedType,
          date: selectedDate,
          startTime: selectedTime,
          notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book lesson')
      }

      alert('Lesson booked successfully! Your coach will confirm the booking.')
      router.push('/student-portal/dashboard')
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Failed to book lesson')
    } finally {
      setBooking(false)
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  // Generate time slots (7am to 7pm)
  const timeSlots = []
  for (let hour = 7; hour <= 19; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`
    const displayTime = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`
    timeSlots.push({ value: time, label: displayTime })
  }

  const selectedLessonType = lessonTypes.find(lt => lt.id === selectedType)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700 bg-slate-800 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400">📅 Book a Lesson</h1>
            <p className="text-slate-400">Schedule your next training session</p>
          </div>
          <Link 
            href="/student-portal/dashboard" 
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            ← Back
          </Link>
        </div>
      </header>

      <main className="p-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lesson Type Selection */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg text-white mb-4">1. Select Lesson Type</h2>
            
            <div className="space-y-3">
              {/* Adult Lessons */}
              <div>
                <p className="text-emerald-400 text-sm font-semibold mb-2">Adult Lessons</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lessonTypes.filter(lt => lt.category === 'adult').map(lt => (
                    <label 
                      key={lt.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedType === lt.id 
                          ? 'bg-emerald-600 border-emerald-500 text-white' 
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="lessonType"
                          value={lt.id}
                          checked={selectedType === lt.id}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="hidden"
                        />
                        <span className="text-sm">{lt.name.replace('Adult Lesson - ', '')}</span>
                      </div>
                      <span className="font-semibold">{formatPrice(lt.price_cents)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Junior Lessons */}
              <div>
                <p className="text-emerald-400 text-sm font-semibold mb-2">Junior Lessons</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lessonTypes.filter(lt => lt.category === 'junior').map(lt => (
                    <label 
                      key={lt.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedType === lt.id 
                          ? 'bg-emerald-600 border-emerald-500 text-white' 
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="lessonType"
                          value={lt.id}
                          checked={selectedType === lt.id}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="hidden"
                        />
                        <span className="text-sm">{lt.name.replace('Junior Lesson - ', '')}</span>
                      </div>
                      <span className="font-semibold">{formatPrice(lt.price_cents)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Playing Lessons */}
              <div>
                <p className="text-emerald-400 text-sm font-semibold mb-2">Playing Lessons</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lessonTypes.filter(lt => lt.category === 'playing').map(lt => (
                    <label 
                      key={lt.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedType === lt.id 
                          ? 'bg-emerald-600 border-emerald-500 text-white' 
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="lessonType"
                          value={lt.id}
                          checked={selectedType === lt.id}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="hidden"
                        />
                        <span className="text-sm">{lt.name.replace('Playing Lesson - ', '')}</span>
                      </div>
                      <span className="font-semibold">{formatPrice(lt.price_cents)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg text-white mb-4">2. Select Date & Time</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Date</label>
                <input
                  type="date"
                  required
                  min={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                />
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-2">Time</label>
                <select
                  required
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                >
                  {timeSlots.map(slot => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg text-white mb-4">3. Additional Notes (Optional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything you'd like to focus on? Questions for your coach?"
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 resize-none"
            />
          </div>

          {/* Summary */}
          {selectedLessonType && selectedDate && (
            <div className="bg-emerald-900/30 rounded-lg p-6 border border-emerald-700">
              <h2 className="text-lg text-emerald-400 mb-3">📋 Booking Summary</h2>
              <div className="space-y-2 text-white">
                <p><span className="text-slate-400">Lesson:</span> {selectedLessonType.name}</p>
                <p><span className="text-slate-400">Duration:</span> {selectedLessonType.duration_minutes} minutes</p>
                <p><span className="text-slate-400">Date:</span> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <p><span className="text-slate-400">Time:</span> {timeSlots.find(t => t.value === selectedTime)?.label}</p>
                <p className="text-xl font-bold text-emerald-400 pt-2">{formatPrice(selectedLessonType.price_cents)}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={booking || !selectedType || !selectedDate}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            {booking ? 'Booking...' : 'Request Booking'}
          </button>

          <p className="text-slate-400 text-sm text-center">
            Your coach will confirm the booking and send you payment details.
          </p>
        </form>
      </main>
    </div>
  )
}