'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  BarChart3, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Calendar,
  Flag
} from 'lucide-react'

interface Round {
  id: string
  course_name: string
  round_date: string
  total_score: number
  total_putts: number
  fairways_hit: number
  fairways_total: number
  greens_in_regulation: number
  sg_total: number
  sg_off_tee: number
  sg_approach: number
  sg_around_green: number
  sg_putting: number
}

export default function StatsPage() {
  const [studentId, setStudentId] = useState<string | null>(null)
  const [rounds, setRounds] = useState<Round[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const id = localStorage.getItem('studentId')
    if (!id) {
      router.push('/student-portal')
      return
    }
    setStudentId(id)
    fetchRounds(id)
  }, [])

  const fetchRounds = async (id: string) => {
    try {
      const response = await fetch(`/api/rounds?studentId=${id}`)
      const data = await response.json()
      setRounds(data.rounds || [])
    } catch (error) {
      console.error('Error fetching rounds:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate averages
  const avgScore = rounds.length > 0 
    ? (rounds.reduce((sum, r) => sum + (r.total_score || 0), 0) / rounds.length).toFixed(1)
    : '--'
  const avgPutts = rounds.length > 0
    ? (rounds.reduce((sum, r) => sum + (r.total_putts || 0), 0) / rounds.length).toFixed(1)
    : '--'
  const avgSgTotal = rounds.length > 0
    ? (rounds.reduce((sum, r) => sum + (r.sg_total || 0), 0) / rounds.length).toFixed(2)
    : '--'

  const sgCategories = [
    { 
      name: 'Off the Tee', 
      key: 'sg_off_tee',
      value: rounds.length > 0 ? (rounds.reduce((sum, r) => sum + (r.sg_off_tee || 0), 0) / rounds.length) : 0
    },
    { 
      name: 'Approach', 
      key: 'sg_approach',
      value: rounds.length > 0 ? (rounds.reduce((sum, r) => sum + (r.sg_approach || 0), 0) / rounds.length) : 0
    },
    { 
      name: 'Around Green', 
      key: 'sg_around_green',
      value: rounds.length > 0 ? (rounds.reduce((sum, r) => sum + (r.sg_around_green || 0), 0) / rounds.length) : 0
    },
    { 
      name: 'Putting', 
      key: 'sg_putting',
      value: rounds.length > 0 ? (rounds.reduce((sum, r) => sum + (r.sg_putting || 0), 0) / rounds.length) : 0
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1A20] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#E65722] border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-[#5F9EA0]">Loading stats...</p>
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
              <Link
                href="/student-portal/dashboard"
                className="flex items-center gap-2 text-[#5F9EA0] hover:text-[#E8E3DC] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-[#D6C8B4]/20"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#E65722]">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">My Stats</h1>
                  <p className="text-xs text-[#5F9EA0]">Performance Analytics</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href="/student-portal/stats/shot-tracker"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-[#002D40] border border-[#D6C8B4]/20 text-[#E8E3DC] hover:border-[#E65722]"
              >
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Shot Tracker</span>
              </Link>
              <Link
                href="/student-portal/stats/add-round"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-[#E65722] text-white hover:bg-[#E65722]/90"
              >
                <Plus className="w-4 h-4" />
                Add Round
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl p-6 bg-[#D6C8B4] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#002D40]/10 translate-x-[30%] -translate-y-[30%]" />
            <div className="relative z-10">
              <p className="text-xs font-medium uppercase tracking-widest text-[#5F9EA0]">Avg Score</p>
              <p className="text-4xl font-bold mt-2 text-[#0B2D38]">{avgScore}</p>
              <p className="text-sm text-[#5F9EA0] mt-2">{rounds.length} rounds</p>
            </div>
          </div>

          <div className="rounded-xl p-6 bg-[#D6C8B4] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#E65722]/20 translate-x-[30%] -translate-y-[30%]" />
            <div className="relative z-10">
              <p className="text-xs font-medium uppercase tracking-widest text-[#5F9EA0]">Avg Putts</p>
              <p className="text-4xl font-bold mt-2 text-[#0B2D38]">{avgPutts}</p>
              <p className="text-sm text-[#5F9EA0] mt-2">per round</p>
            </div>
          </div>

          <div className="rounded-xl p-6 bg-[#D6C8B4] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#87CEEB]/30 translate-x-[30%] -translate-y-[30%]" />
            <div className="relative z-10">
              <p className="text-xs font-medium uppercase tracking-widest text-[#5F9EA0]">Total SG</p>
              <p className={`text-4xl font-bold mt-2 ${Number(avgSgTotal) >= 0 ? 'text-[#E65722]' : 'text-[#D94F3A]'}`}>
                {avgSgTotal !== '--' ? (Number(avgSgTotal) >= 0 ? '+' : '') + avgSgTotal : '--'}
              </p>
              <p className="text-sm text-[#5F9EA0] mt-2">vs PGA Tour</p>
            </div>
          </div>
        </div>

        {/* Strokes Gained Breakdown */}
        <div className="rounded-xl p-6 bg-[#002D40] mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#E8E3DC]">Strokes Gained Breakdown</h3>
            <div className="h-1 w-12 mt-2 rounded-full bg-[#E65722]" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sgCategories.map((cat) => (
              <div 
                key={cat.key}
                className="p-4 rounded-xl border border-[#D6C8B4]/10 bg-[#D6C8B4]/5 text-center"
              >
                <p className="text-sm text-[#5F9EA0] mb-2">{cat.name}</p>
                <p className={`text-2xl font-bold ${cat.value >= 0 ? 'text-[#E65722]' : 'text-[#D94F3A]'}`}>
                  {cat.value >= 0 ? '+' : ''}{cat.value.toFixed(2)}
                </p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {cat.value >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-[#E65722]" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-[#D94F3A]" />
                  )}
                  <span className="text-xs text-[#5F9EA0]">
                    {cat.value >= 0 ? 'Gaining' : 'Losing'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Round History */}
        <div className="rounded-xl p-6 bg-[#002D40]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#E8E3DC]">Round History</h3>
            <div className="h-1 w-12 mt-2 rounded-full bg-[#E65722]" />
          </div>

          {rounds.length > 0 ? (
            <div className="space-y-3">
              {rounds.map((round) => (
                <div
                  key={round.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-[#D6C8B4]/10 bg-[#D6C8B4]/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#D6C8B4]">
                      <Flag className="w-6 h-6 text-[#0B2D38]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#E8E3DC]">{round.course_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-[#5F9EA0]" />
                        <p className="text-sm text-[#5F9EA0]">
                          {new Date(round.round_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#E8E3DC]">{round.total_score}</p>
                      <p className="text-xs text-[#5F9EA0]">Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-[#E8E3DC]">{round.total_putts}</p>
                      <p className="text-xs text-[#5F9EA0]">Putts</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-lg font-bold ${(round.sg_total || 0) >= 0 ? 'text-[#E65722]' : 'text-[#D94F3A]'}`}>
                        {(round.sg_total || 0) >= 0 ? '+' : ''}{(round.sg_total || 0).toFixed(1)}
                      </p>
                      <p className="text-xs text-[#5F9EA0]">SG</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#D6C8B4]">
                <BarChart3 className="w-8 h-8 text-[#0B2D38]" />
              </div>
              <p className="text-[#E8E3DC] mb-2">No rounds recorded</p>
              <p className="text-sm text-[#5F9EA0] mb-4">Add your first round to start tracking</p>
              <Link
                href="/student-portal/stats/add-round"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-[#E65722] text-white hover:bg-[#E65722]/90 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add First Round
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}