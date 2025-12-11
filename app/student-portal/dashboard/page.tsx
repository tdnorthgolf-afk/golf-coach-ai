'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LogOut, 
  Calendar, 
  BarChart3, 
  Target, 
  FileText, 
  Clock,
  ChevronRight,
  User
} from 'lucide-react'

interface Lesson {
  id: string
  notes: string
  created_at: string
  video_url?: string
  audio_url?: string
}

export default function StudentDashboard() {
  const [studentId, setStudentId] = useState<string | null>(null)
  const [studentName, setStudentName] = useState<string | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
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
    fetchLessons(id)
  }, [])

  const fetchLessons = async (id: string) => {
    try {
      const response = await fetch(`/api/lessons?studentId=${id}`)
      const data = await response.json()
      setLessons(data.lessons || [])
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('studentId')
    localStorage.removeItem('studentName')
    router.push('/student-portal')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1A20] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#E65722] border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-[#5F9EA0]">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A1A20]">
      {/* Header */}
      <header className="border-b border-[#D6C8B4]/10 bg-[#002D40] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-serif text-2xl font-bold italic bg-[#E65722] text-white shadow-lg shadow-[#E65722]/40">
                G
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Golf Coach</h1>
                <p className="text-xs font-medium tracking-widest text-[#E65722]">STUDENT PORTAL</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-[#E8E3DC]">{studentName}</p>
                <p className="text-xs text-[#5F9EA0]">Student</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-[#D94F3A] hover:bg-[#D94F3A]/10"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#E8E3DC]">
            Welcome, {studentName?.split(' ')[0] || 'Player'}
          </h2>
          <p className="mt-1 text-[#5F9EA0]">Track your progress and book lessons</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/student-portal/book"
            className="flex items-center gap-4 p-5 rounded-xl bg-[#D6C8B4] hover:shadow-lg hover:shadow-[#D6C8B4]/20 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#002D40]/10">
              <Calendar className="w-6 h-6 text-[#002D40]" />
            </div>
            <div>
              <p className="font-semibold text-[#0B2D38] group-hover:text-[#E65722] transition-colors">Book Lesson</p>
              <p className="text-sm text-[#5F9EA0]">Schedule your next session</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5F9EA0] ml-auto" />
          </Link>

          <Link
            href="/student-portal/stats"
            className="flex items-center gap-4 p-5 rounded-xl bg-[#D6C8B4] hover:shadow-lg hover:shadow-[#D6C8B4]/20 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#E65722]/15">
              <BarChart3 className="w-6 h-6 text-[#E65722]" />
            </div>
            <div>
              <p className="font-semibold text-[#0B2D38] group-hover:text-[#E65722] transition-colors">My Stats</p>
              <p className="text-sm text-[#5F9EA0]">View performance data</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5F9EA0] ml-auto" />
          </Link>

          <Link
            href="/student-portal/practice"
            className="flex items-center gap-4 p-5 rounded-xl bg-[#D6C8B4] hover:shadow-lg hover:shadow-[#D6C8B4]/20 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#002D40]/10">
              <Target className="w-6 h-6 text-[#002D40]" />
            </div>
            <div>
              <p className="font-semibold text-[#0B2D38] group-hover:text-[#E65722] transition-colors">Practice Plan</p>
              <p className="text-sm text-[#5F9EA0]">AI-generated drills</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5F9EA0] ml-auto" />
          </Link>
        </div>

        {/* Lesson History */}
        <div className="rounded-xl p-6 bg-[#002D40]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#E8E3DC]">Lesson History</h3>
            <div className="h-1 w-12 mt-2 rounded-full bg-[#E65722]" />
          </div>

          {lessons.length > 0 ? (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-4 rounded-xl border border-[#D6C8B4]/10 bg-[#D6C8B4]/5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#D6C8B4]">
                        <FileText className="w-5 h-5 text-[#0B2D38]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#E8E3DC]">
                          {new Date(lesson.created_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-[#5F9EA0]" />
                          <p className="text-sm text-[#5F9EA0]">
                            {new Date(lesson.created_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    {(lesson.video_url || lesson.audio_url) && (
                      <span className="text-xs px-2 py-1 rounded-full bg-[#E65722]/15 text-[#E65722]">
                        Media
                      </span>
                    )}
                  </div>
                  {lesson.notes && (
                    <p className="text-sm text-[#E8E3DC]/80 mt-3 pl-13 line-clamp-2">
                      {lesson.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#D6C8B4]">
                <FileText className="w-8 h-8 text-[#0B2D38]" />
              </div>
              <p className="text-[#E8E3DC] mb-2">No lessons yet</p>
              <p className="text-sm text-[#5F9EA0]">Your lesson notes will appear here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}