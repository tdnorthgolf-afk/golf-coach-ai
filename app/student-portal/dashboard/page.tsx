'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function StudentDashboard() {
  const [studentId, setStudentId] = useState<string | null>(null)
  const [studentName, setStudentName] = useState<string | null>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
    loadData(id)
  }, [])

  const loadData = async (id: string) => {
    try {
      const response = await fetch(`/api/student-data?studentId=${id}`)
      const data = await response.json()

      if (response.ok) {
        setLessons(data.lessons || [])
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('studentId')
    localStorage.removeItem('studentName')
    router.push('/student-portal')
  }

  const formatLessonNotes = (notes: string) => {
    if (!notes) return null
    
    const lines = notes.split('\n')
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim()
      
      if (trimmedLine.startsWith('## ')) {
        return (
          <h3 key={index} className="text-emerald-400 font-bold text-lg mt-6 mb-3 first:mt-0">
            {trimmedLine.replace('## ', '')}
          </h3>
        )
      }
      
      if (/^\d+\./.test(trimmedLine)) {
        const text = trimmedLine.replace(/\*\*/g, '')
        return (
          <p key={index} className="text-white font-semibold mt-4 mb-2">
            {text}
          </p>
        )
      }
      
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        const text = trimmedLine.replace(/^[•\-\*]\s*/, '')
        return (
          <p key={index} className="text-slate-300 ml-4 mb-1">
            • {text}
          </p>
        )
      }
      
      if (trimmedLine) {
        return (
          <p key={index} className="text-slate-300 mb-2">
            {trimmedLine}
          </p>
        )
      }
      
      return <div key={index} className="h-2" />
    })
  }

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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400">⛳ My Golf Training</h1>
            <p className="text-slate-400">Welcome back, {studentName}!</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/student-portal/book" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              📅 Book Lesson
              <Link 
  href="/student-portal/book" 
  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
>
  📅 Book Lesson
</Link>
<Link 
  href="/student-portal/book" 
  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
>
  📅 Book Lesson
</Link>
<Link 
  href="/student-portal/stats" 
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
>
  📊 My Stats
</Link>
            </Link>
            <button
              onClick={handleSignOut}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              Sign Out
            </button>
            
          </div>
        </div>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        {/* Upcoming Bookings */}
        {bookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl text-white mb-4">📅 Upcoming Lessons</h2>
            <div className="space-y-3">
              {bookings.map((booking: any) => (
                <div key={booking.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">
                        {new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-slate-400">{booking.lesson_type?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-semibold">
                        {booking.start_time.slice(0, 5)}
                      </p>
                      <span className={`text-sm px-2 py-1 rounded ${
                        booking.payment_status === 'paid' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-yellow-600 text-white'
                      }`}>
                        {booking.payment_status === 'paid' ? 'Paid' : 'Payment Due'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lesson History */}
        <div>
          <h2 className="text-xl text-white mb-4">📝 Lesson History ({lessons.length})</h2>
          
          {lessons.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
              <p className="text-slate-400">No lessons recorded yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {lessons.map((lesson: any) => (
                <div key={lesson.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700">
                    <span className="text-2xl">📅</span>
                    <h3 className="text-white font-semibold text-lg">
                      {new Date(lesson.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                  </div>
                  
                  <div className="lesson-content">
                    {formatLessonNotes(lesson.notes)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}