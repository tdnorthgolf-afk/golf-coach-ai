'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Round = {
  id: string
  course_name: string
  round_date: string
  total_score: number
  total_putts: number
  fairways_hit: number
  fairways_total: number
  greens_in_regulation: number
  greens_total: number
  sg_off_tee: number
  sg_approach: number
  sg_around_green: number
  sg_putting: number
  sg_total: number
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
    loadRounds(id)
  }, [])

  const loadRounds = async (id: string) => {
    try {
      const response = await fetch(`/api/rounds?studentId=${id}`)
      const data = await response.json()
      setRounds(data.rounds || [])
    } catch (error) {
      console.error('Error loading rounds:', error)
    } finally {
      setLoading(false)
    }
  }

  const avgScore = rounds.length > 0 
    ? (rounds.reduce((sum, r) => sum + (r.total_score || 0), 0) / rounds.length).toFixed(1)
    : '-'
  
  const avgPutts = rounds.length > 0
    ? (rounds.reduce((sum, r) => sum + (r.total_putts || 0), 0) / rounds.length).toFixed(1)
    : '-'

  const avgSgTotal = rounds.length > 0
    ? (rounds.reduce((sum, r) => sum + (r.sg_total || 0), 0) / rounds.length).toFixed(2)
    : '-'

  const avgSgOffTee = rounds.length > 0
    ? (rounds.reduce((sum, r) => sum + (r.sg_off_tee || 0), 0) / rounds.length).toFixed(2)
    : '-'

  const avgSgApproach = rounds.length > 0
    ? (rounds.reduce((sum, r) => sum + (r.sg_approach || 0), 0) / rounds.length).toFixed(2)
    : '-'

  const avgSgAroundGreen = rounds.length > 0
    ? (rounds.reduce((sum, r) => sum + (r.sg_around_green || 0), 0) / rounds.length).toFixed(2)
    : '-'

  const avgSgPutting = rounds.length > 0
    ? (rounds.reduce((sum, r) => sum + (r.sg_putting || 0), 0) / rounds.length).toFixed(2)
    : '-'

  const formatSg = (value: number | string) => {
    if (typeof value === 'string') return value
    const num = Number(value)
    if (num > 0) return `+${num.toFixed(2)}`
    return num.toFixed(2)
  }

  const getSgColor = (value: number | string) => {
    if (typeof value === 'string') return 'text-slate-400'
    const num = Number(value)
    if (num > 0.5) return 'text-emerald-400'
    if (num > 0) return 'text-emerald-300'
    if (num > -0.5) return 'text-yellow-400'
    return 'text-red-400'
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
            <h1 className="text-2xl font-bold text-emerald-400">📊 My Statistics</h1>
            <p className="text-slate-400">Strokes Gained Analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
  <Link 
    href="/student-portal/stats/add-round" 
    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
  >
    + Add Round
  </Link>
  <Link 
    href="/student-portal/stats/shot-tracker" 
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
  >
    🎯 Shot Tracker
  </Link>
</div>
            <Link 
              href="/student-portal/dashboard" 
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              ← Back
            </Link>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Avg Score</p>
            <p className="text-2xl font-bold text-white">{avgScore}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Avg Putts</p>
            <p className="text-2xl font-bold text-white">{avgPutts}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Rounds</p>
            <p className="text-2xl font-bold text-white">{rounds.length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">SG Total</p>
            <p className={`text-2xl font-bold ${getSgColor(avgSgTotal)}`}>
              {formatSg(avgSgTotal)}
            </p>
          </div>
        </div>

        {/* Strokes Gained Breakdown */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <h2 className="text-lg text-white mb-4">⛳ Strokes Gained Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Off the Tee</p>
              <p className={`text-xl font-bold ${getSgColor(avgSgOffTee)}`}>
                {formatSg(avgSgOffTee)}
              </p>
            </div>
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Approach</p>
              <p className={`text-xl font-bold ${getSgColor(avgSgApproach)}`}>
                {formatSg(avgSgApproach)}
              </p>
            </div>
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Around Green</p>
              <p className={`text-xl font-bold ${getSgColor(avgSgAroundGreen)}`}>
                {formatSg(avgSgAroundGreen)}
              </p>
            </div>
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Putting</p>
              <p className={`text-xl font-bold ${getSgColor(avgSgPutting)}`}>
                {formatSg(avgSgPutting)}
              </p>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-4 text-center">
            Compared to PGA Tour average. Positive = better than tour average.
          </p>
        </div>

        {/* Round History */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg text-white mb-4">🏌️ Round History</h2>
          
          {rounds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">No rounds recorded yet</p>
              <Link 
                href="/student-portal/stats/add-round"
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Add Your First Round
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {rounds.map(round => (
                <div 
                  key={round.id} 
                  className="bg-slate-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-semibold">{round.course_name}</p>
                    <p className="text-slate-400 text-sm">
                      {new Date(round.round_date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Score</p>
                      <p className="text-white font-bold">{round.total_score}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Putts</p>
                      <p className="text-white font-bold">{round.total_putts}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">SG Total</p>
                      <p className={`font-bold ${getSgColor(round.sg_total)}`}>
                        {formatSg(round.sg_total)}
                      </p>
                    </div>
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