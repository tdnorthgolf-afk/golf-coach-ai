'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Flag, Check } from 'lucide-react'

type HoleData = {
  number: number
  par: number
  score: number
  putts: number
  fairwayHit: boolean | null
  greenInRegulation: boolean
}

const defaultHoles: HoleData[] = Array.from({ length: 18 }, (_, i) => ({
  number: i + 1,
  par: 4,
  score: 4,
  putts: 2,
  fairwayHit: null,
  greenInRegulation: false,
}))

export default function AddRoundPage() {
  const [studentId, setStudentId] = useState<string | null>(null)
  const [step, setStep] = useState<'info' | 'holes' | 'review'>('info')
  const [courseName, setCourseName] = useState('')
  const [teeColor, setTeeColor] = useState('white')
  const [roundDate, setRoundDate] = useState(new Date().toISOString().split('T')[0])
  const [holes, setHoles] = useState<HoleData[]>(defaultHoles)
  const [currentHole, setCurrentHole] = useState(1)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const id = localStorage.getItem('studentId')
    if (!id) {
      router.push('/student-portal')
      return
    }
    setStudentId(id)
  }, [])

  const updateHole = (holeNumber: number, updates: Partial<HoleData>) => {
    setHoles(holes.map(h => 
      h.number === holeNumber ? { ...h, ...updates } : h
    ))
  }

  const currentHoleData = holes.find(h => h.number === currentHole)!

  const handleSubmit = async () => {
    if (!studentId || !courseName) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          courseName,
          teeColor,
          roundDate,
          holes,
          notes: '',
        }),
      })

      if (!response.ok) throw new Error('Failed to save round')

      router.push('/student-portal/stats')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save round')
    } finally {
      setSaving(false)
    }
  }

  const totalScore = holes.reduce((sum, h) => sum + h.score, 0)
  const totalPutts = holes.reduce((sum, h) => sum + h.putts, 0)
  const totalPar = holes.reduce((sum, h) => sum + h.par, 0)

  // Step 1: Round Info
  if (step === 'info') {
    return (
      <div className="min-h-screen bg-[#0A1A20]">
        <header className="border-b border-[#D6C8B4]/10 bg-[#002D40] sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/student-portal/stats" className="text-[#5F9EA0] hover:text-[#E8E3DC]">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-lg font-bold text-white">Add Round</h1>
            </div>
            <span className="text-sm text-[#5F9EA0]">Step 1 of 3</span>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-8">
          <div className="rounded-xl p-6 bg-[#002D40]">
            <h2 className="text-lg font-semibold text-[#E8E3DC] mb-6">Round Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#5F9EA0]">Course Name *</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Enter course name"
                  className="w-full px-4 py-3 rounded-xl border border-[#D6C8B4]/20 bg-[#0A1A20] text-[#E8E3DC] placeholder-[#5F9EA0] focus:outline-none focus:border-[#E65722] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#5F9EA0]">Tee Color</label>
                  <select
                    value={teeColor}
                    onChange={(e) => setTeeColor(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#D6C8B4]/20 bg-[#0A1A20] text-[#E8E3DC] focus:outline-none focus:border-[#E65722] transition-colors"
                  >
                    <option value="black">Black</option>
                    <option value="blue">Blue</option>
                    <option value="white">White</option>
                    <option value="gold">Gold</option>
                    <option value="red">Red</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#5F9EA0]">Date</label>
                  <input
                    type="date"
                    value={roundDate}
                    onChange={(e) => setRoundDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#D6C8B4]/20 bg-[#0A1A20] text-[#E8E3DC] focus:outline-none focus:border-[#E65722] transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={() => courseName && setStep('holes')}
                disabled={!courseName}
                className="w-full py-4 rounded-xl font-semibold transition-all bg-[#E65722] text-white hover:bg-[#E65722]/90 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                Continue to Scorecard →
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Step 2: Hole-by-hole entry
  if (step === 'holes') {
    return (
      <div className="min-h-screen bg-[#0A1A20]">
        <header className="border-b border-[#D6C8B4]/10 bg-[#002D40] sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <button onClick={() => setStep('info')} className="text-[#5F9EA0] hover:text-[#E8E3DC]">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-bold text-white">{courseName}</h1>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{totalScore}</p>
                <p className="text-sm text-[#5F9EA0]">
                  {totalScore - totalPar >= 0 ? '+' : ''}{totalScore - totalPar}
                </p>
              </div>
            </div>
            
            {/* Hole selector */}
            <div className="flex gap-1 overflow-x-auto pb-2">
              {holes.map(hole => (
                <button
                  key={hole.number}
                  onClick={() => setCurrentHole(hole.number)}
                  className={`w-8 h-8 rounded-full text-sm font-medium flex-shrink-0 transition-all ${
                    currentHole === hole.number 
                      ? 'bg-[#E65722] text-white' 
                      : hole.score > 0 
                        ? 'bg-[#D6C8B4] text-[#0B2D38]'
                        : 'bg-[#0A1A20] text-[#5F9EA0] border border-[#D6C8B4]/20'
                  }`}
                >
                  {hole.number}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-6">
          <div className="rounded-xl p-6 bg-[#002D40] mb-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Hole {currentHole}</h2>
              <div>
                <p className="text-xs text-[#5F9EA0] mb-1">Par</p>
                <div className="flex gap-1">
                  {[3, 4, 5].map(p => (
                    <button
                      key={p}
                      onClick={() => updateHole(currentHole, { par: p })}
                      className={`w-10 h-10 rounded-lg font-bold transition-all ${
                        currentHoleData.par === p 
                          ? 'bg-[#E65722] text-white' 
                          : 'bg-[#0A1A20] text-[#E8E3DC] border border-[#D6C8B4]/20 hover:border-[#E65722]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#5F9EA0] mb-3">Score</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => {
                  let bgColor = 'bg-[#0A1A20] border border-[#D6C8B4]/20'
                  if (currentHoleData.score === s) {
                    if (s < currentHoleData.par) bgColor = 'bg-[#E65722]'
                    else if (s === currentHoleData.par) bgColor = 'bg-[#5F9EA0]'
                    else if (s === currentHoleData.par + 1) bgColor = 'bg-[#002D40] border-2 border-[#D6C8B4]'
                    else bgColor = 'bg-[#D94F3A]'
                  }
                  return (
                    <button
                      key={s}
                      onClick={() => updateHole(currentHole, { score: s })}
                      className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${bgColor} ${currentHoleData.score === s ? 'text-white' : 'text-[#E8E3DC] hover:border-[#E65722]'}`}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Putts */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#5F9EA0] mb-3">Putts</p>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map(p => (
                  <button
                    key={p}
                    onClick={() => updateHole(currentHole, { putts: p })}
                    className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${
                      currentHoleData.putts === p 
                        ? 'bg-[#E65722] text-white' 
                        : 'bg-[#0A1A20] text-[#E8E3DC] border border-[#D6C8B4]/20 hover:border-[#E65722]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Fairway (par 4/5 only) */}
            {currentHoleData.par > 3 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-[#5F9EA0] mb-3">Fairway</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateHole(currentHole, { fairwayHit: true })}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      currentHoleData.fairwayHit === true 
                        ? 'bg-[#E65722] text-white' 
                        : 'bg-[#0A1A20] text-[#E8E3DC] border border-[#D6C8B4]/20 hover:border-[#E65722]'
                    }`}
                  >
                    <Check className="w-4 h-4" /> Hit
                  </button>
                  <button
                    onClick={() => updateHole(currentHole, { fairwayHit: false })}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      currentHoleData.fairwayHit === false 
                        ? 'bg-[#D94F3A] text-white' 
                        : 'bg-[#0A1A20] text-[#E8E3DC] border border-[#D6C8B4]/20 hover:border-[#E65722]'
                    }`}
                  >
                    Missed
                  </button>
                </div>
              </div>
            )}

            {/* GIR */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#5F9EA0] mb-3">Green in Regulation</p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateHole(currentHole, { greenInRegulation: true })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    currentHoleData.greenInRegulation 
                      ? 'bg-[#E65722] text-white' 
                      : 'bg-[#0A1A20] text-[#E8E3DC] border border-[#D6C8B4]/20 hover:border-[#E65722]'
                  }`}
                >
                  <Check className="w-4 h-4" /> Yes
                </button>
                <button
                  onClick={() => updateHole(currentHole, { greenInRegulation: false })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    !currentHoleData.greenInRegulation 
                      ? 'bg-[#D94F3A] text-white' 
                      : 'bg-[#0A1A20] text-[#E8E3DC] border border-[#D6C8B4]/20 hover:border-[#E65722]'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentHole > 1 && (
              <button
                onClick={() => setCurrentHole(currentHole - 1)}
                className="flex-1 py-4 rounded-xl font-medium bg-[#002D40] text-[#E8E3DC] border border-[#D6C8B4]/20 hover:border-[#E65722] transition-all"
              >
                ← Previous
              </button>
            )}
            {currentHole < 18 ? (
              <button
                onClick={() => setCurrentHole(currentHole + 1)}
                className="flex-1 py-4 rounded-xl font-semibold bg-[#E65722] text-white hover:bg-[#E65722]/90 transition-all"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => setStep('review')}
                className="flex-1 py-4 rounded-xl font-semibold bg-[#E65722] text-white hover:bg-[#E65722]/90 transition-all"
              >
                Review Round →
              </button>
            )}
          </div>
        </main>
      </div>
    )
  }

  // Step 3: Review
  return (
    <div className="min-h-screen bg-[#0A1A20]">
      <header className="border-b border-[#D6C8B4]/10 bg-[#002D40] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setStep('holes')} className="text-[#5F9EA0] hover:text-[#E8E3DC]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white">Review Round</h1>
          </div>
          <span className="text-sm text-[#5F9EA0]">Step 3 of 3</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Summary Card */}
        <div className="rounded-xl p-6 bg-[#D6C8B4] mb-6">
          <h2 className="text-lg font-bold text-[#0B2D38] mb-4">{courseName}</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-4xl font-bold text-[#0B2D38]">{totalScore}</p>
              <p className="text-sm text-[#5F9EA0]">
                ({totalScore - totalPar >= 0 ? '+' : ''}{totalScore - totalPar})
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#0B2D38]">{totalPutts}</p>
              <p className="text-sm text-[#5F9EA0]">Putts</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#0B2D38]">
                {holes.filter(h => h.greenInRegulation).length}/18
              </p>
              <p className="text-sm text-[#5F9EA0]">GIR</p>
            </div>
          </div>
        </div>

        {/* Scorecard */}
        <div className="rounded-xl p-6 bg-[#002D40] mb-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-[#E8E3DC] mb-4">Scorecard</h3>
          
          {/* Front 9 */}
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-[#5F9EA0]">
                <th className="px-2 py-1 text-left">Hole</th>
                {holes.slice(0, 9).map(h => (
                  <th key={h.number} className="px-2 py-1 w-8">{h.number}</th>
                ))}
                <th className="px-2 py-1 bg-[#0A1A20] rounded">Out</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-[#E8E3DC]">
                <td className="px-2 py-1 text-[#5F9EA0]">Par</td>
                {holes.slice(0, 9).map(h => (
                  <td key={h.number} className="px-2 py-1 text-center">{h.par}</td>
                ))}
                <td className="px-2 py-1 text-center bg-[#0A1A20] rounded font-bold">
                  {holes.slice(0, 9).reduce((s, h) => s + h.par, 0)}
                </td>
              </tr>
              <tr className="text-white font-bold">
                <td className="px-2 py-1 text-[#5F9EA0] font-normal">Score</td>
                {holes.slice(0, 9).map(h => (
                  <td key={h.number} className={`px-2 py-1 text-center ${
                    h.score < h.par ? 'text-[#E65722]' :
                    h.score === h.par ? 'text-[#5F9EA0]' :
                    h.score === h.par + 1 ? 'text-[#87CEEB]' : 'text-[#D94F3A]'
                  }`}>{h.score}</td>
                ))}
                <td className="px-2 py-1 text-center bg-[#0A1A20] rounded">
                  {holes.slice(0, 9).reduce((s, h) => s + h.score, 0)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Back 9 */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#5F9EA0]">
                <th className="px-2 py-1 text-left">Hole</th>
                {holes.slice(9, 18).map(h => (
                  <th key={h.number} className="px-2 py-1 w-8">{h.number}</th>
                ))}
                <th className="px-2 py-1 bg-[#0A1A20] rounded">In</th>
                <th className="px-2 py-1 bg-[#E65722] rounded text-white">Tot</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-[#E8E3DC]">
                <td className="px-2 py-1 text-[#5F9EA0]">Par</td>
                {holes.slice(9, 18).map(h => (
                  <td key={h.number} className="px-2 py-1 text-center">{h.par}</td>
                ))}
                <td className="px-2 py-1 text-center bg-[#0A1A20] rounded font-bold">
                  {holes.slice(9, 18).reduce((s, h) => s + h.par, 0)}
                </td>
                <td className="px-2 py-1 text-center bg-[#E65722] rounded font-bold text-white">{totalPar}</td>
              </tr>
              <tr className="text-white font-bold">
                <td className="px-2 py-1 text-[#5F9EA0] font-normal">Score</td>
                {holes.slice(9, 18).map(h => (
                  <td key={h.number} className={`px-2 py-1 text-center ${
                    h.score < h.par ? 'text-[#E65722]' :
                    h.score === h.par ? 'text-[#5F9EA0]' :
                    h.score === h.par + 1 ? 'text-[#87CEEB]' : 'text-[#D94F3A]'
                  }`}>{h.score}</td>
                ))}
                <td className="px-2 py-1 text-center bg-[#0A1A20] rounded">
                  {holes.slice(9, 18).reduce((s, h) => s + h.score, 0)}
                </td>
                <td className="px-2 py-1 text-center bg-[#E65722] rounded text-white">{totalScore}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-4 rounded-xl font-semibold text-lg transition-all bg-[#E65722] text-white hover:bg-[#E65722]/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? 'Saving...' : (
            <>
              <Flag className="w-5 h-5" />
              Save Round
            </>
          )}
        </button>
      </main>
    </div>
  )
}