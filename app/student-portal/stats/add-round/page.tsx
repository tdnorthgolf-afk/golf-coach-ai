'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type HoleData = {
  number: number
  par: number
  score: number
  putts: number
  fairwayHit: boolean | null
  greenInRegulation: boolean
  shots: ShotData[]
}

type ShotData = {
  shotNumber: number
  category: 'tee' | 'approach' | 'around_green' | 'putt'
  startLie: string
  endLie: string
  startDistance: number
  endDistance: number
  club: string
  result: string
}

const defaultHoles: HoleData[] = Array.from({ length: 18 }, (_, i) => ({
  number: i + 1,
  par: 4,
  score: 4,
  putts: 2,
  fairwayHit: null,
  greenInRegulation: false,
  shots: [],
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

      if (!response.ok) {
        throw new Error('Failed to save round')
      }

      alert('Round saved successfully!')
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
      <div className="min-h-screen bg-slate-900">
        <header className="border-b border-slate-700 bg-slate-800 p-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold text-emerald-400">+ Add Round</h1>
            <Link href="/student-portal/stats" className="text-slate-400 hover:text-white">
              ✕ Cancel
            </Link>
          </div>
        </header>

        <main className="p-8 max-w-2xl mx-auto">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg text-white mb-4">Round Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Course Name *</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Enter course name"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Tee Color</label>
                  <select
                    value={teeColor}
                    onChange={(e) => setTeeColor(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                  >
                    <option value="black">Black</option>
                    <option value="blue">Blue</option>
                    <option value="white">White</option>
                    <option value="gold">Gold</option>
                    <option value="red">Red</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Date</label>
                  <input
                    type="date"
                    value={roundDate}
                    onChange={(e) => setRoundDate(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                  />
                </div>
              </div>

              <button
                onClick={() => courseName && setStep('holes')}
                disabled={!courseName}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white py-3 rounded-lg font-medium mt-4"
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
      <div className="min-h-screen bg-slate-900">
        <header className="border-b border-slate-700 bg-slate-800 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold text-emerald-400">{courseName}</h1>
              <div className="text-white">
                <span className="text-slate-400">Score:</span> {totalScore} ({totalScore - totalPar >= 0 ? '+' : ''}{totalScore - totalPar})
              </div>
            </div>
            
            {/* Hole selector */}
            <div className="flex gap-1 overflow-x-auto pb-2">
              {holes.map(hole => (
                <button
                  key={hole.number}
                  onClick={() => setCurrentHole(hole.number)}
                  className={`w-8 h-8 rounded-full text-sm font-medium flex-shrink-0 ${
                    currentHole === hole.number 
                      ? 'bg-emerald-600 text-white' 
                      : hole.score > 0 
                        ? 'bg-slate-600 text-white'
                        : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {hole.number}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="p-4 max-w-4xl mx-auto">
          {/* Current Hole Entry */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-white">Hole {currentHole}</h2>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Par</label>
                  <div className="flex gap-1">
                    {[3, 4, 5].map(p => (
                      <button
                        key={p}
                        onClick={() => updateHole(currentHole, { par: p })}
                        className={`w-10 h-10 rounded-lg font-medium ${
                          currentHoleData.par === p 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="mb-4">
              <label className="block text-slate-400 text-sm mb-2">Score</label>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                  <button
                    key={s}
                    onClick={() => updateHole(currentHole, { score: s })}
                    className={`w-12 h-12 rounded-lg font-bold text-lg ${
                      currentHoleData.score === s 
                        ? s < currentHoleData.par ? 'bg-red-500 text-white'
                          : s === currentHoleData.par ? 'bg-emerald-600 text-white'
                          : s === currentHoleData.par + 1 ? 'bg-blue-600 text-white'
                          : 'bg-yellow-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Putts */}
            <div className="mb-4">
              <label className="block text-slate-400 text-sm mb-2">Putts</label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map(p => (
                  <button
                    key={p}
                    onClick={() => updateHole(currentHole, { putts: p })}
                    className={`w-12 h-12 rounded-lg font-bold text-lg ${
                      currentHoleData.putts === p 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Fairway Hit (only for par 4 and 5) */}
            {currentHoleData.par > 3 && (
              <div className="mb-4">
                <label className="block text-slate-400 text-sm mb-2">Fairway</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateHole(currentHole, { fairwayHit: true })}
                    className={`px-6 py-3 rounded-lg font-medium ${
                      currentHoleData.fairwayHit === true 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    ✓ Hit
                  </button>
                  <button
                    onClick={() => updateHole(currentHole, { fairwayHit: false })}
                    className={`px-6 py-3 rounded-lg font-medium ${
                      currentHoleData.fairwayHit === false 
                        ? 'bg-red-600 text-white' 
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    ✗ Missed
                  </button>
                </div>
              </div>
            )}

            {/* GIR */}
            <div className="mb-4">
              <label className="block text-slate-400 text-sm mb-2">Green in Regulation</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateHole(currentHole, { greenInRegulation: true })}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    currentHoleData.greenInRegulation 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  ✓ Yes
                </button>
                <button
                  onClick={() => updateHole(currentHole, { greenInRegulation: false })}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    !currentHoleData.greenInRegulation 
                      ? 'bg-red-600 text-white' 
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  ✗ No
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentHole > 1 && (
              <button
                onClick={() => setCurrentHole(currentHole - 1)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium"
              >
                ← Previous Hole
              </button>
            )}
            {currentHole < 18 ? (
              <button
                onClick={() => setCurrentHole(currentHole + 1)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium"
              >
                Next Hole →
              </button>
            ) : (
              <button
                onClick={() => setStep('review')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium"
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
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700 bg-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-400">Review Round</h1>
          <button 
            onClick={() => setStep('holes')}
            className="text-slate-400 hover:text-white"
          >
            ← Edit
          </button>
        </div>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        {/* Summary */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
          <h2 className="text-lg text-white mb-4">{courseName}</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-slate-400 text-sm">Score</p>
              <p className="text-3xl font-bold text-white">{totalScore}</p>
              <p className="text-slate-400 text-sm">
                ({totalScore - totalPar >= 0 ? '+' : ''}{totalScore - totalPar})
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Putts</p>
              <p className="text-3xl font-bold text-white">{totalPutts}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">FIR / GIR</p>
              <p className="text-3xl font-bold text-white">
                {holes.filter(h => h.fairwayHit).length}/{holes.filter(h => h.par > 3).length}
                {' / '}
                {holes.filter(h => h.greenInRegulation).length}/18
              </p>
            </div>
          </div>
        </div>

        {/* Scorecard */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6 overflow-x-auto">
          <h2 className="text-lg text-white mb-4">Scorecard</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="px-2 py-1">Hole</th>
                {holes.slice(0, 9).map(h => (
                  <th key={h.number} className="px-2 py-1">{h.number}</th>
                ))}
                <th className="px-2 py-1 bg-slate-700">Out</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-slate-300">
                <td className="px-2 py-1">Par</td>
                {holes.slice(0, 9).map(h => (
                  <td key={h.number} className="px-2 py-1 text-center">{h.par}</td>
                ))}
                <td className="px-2 py-1 text-center bg-slate-700">
                  {holes.slice(0, 9).reduce((s, h) => s + h.par, 0)}
                </td>
              </tr>
              <tr className="text-white font-medium">
                <td className="px-2 py-1">Score</td>
                {holes.slice(0, 9).map(h => (
                  <td key={h.number} className={`px-2 py-1 text-center ${
                    h.score < h.par ? 'text-red-400' :
                    h.score === h.par ? 'text-emerald-400' :
                    h.score === h.par + 1 ? 'text-blue-400' : 'text-yellow-400'
                  }`}>{h.score}</td>
                ))}
                <td className="px-2 py-1 text-center bg-slate-700">
                  {holes.slice(0, 9).reduce((s, h) => s + h.score, 0)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Back 9 */}
          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="text-slate-400">
                <th className="px-2 py-1">Hole</th>
                {holes.slice(9, 18).map(h => (
                  <th key={h.number} className="px-2 py-1">{h.number}</th>
                ))}
                <th className="px-2 py-1 bg-slate-700">In</th>
                <th className="px-2 py-1 bg-emerald-700">Tot</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-slate-300">
                <td className="px-2 py-1">Par</td>
                {holes.slice(9, 18).map(h => (
                  <td key={h.number} className="px-2 py-1 text-center">{h.par}</td>
                ))}
                <td className="px-2 py-1 text-center bg-slate-700">
                  {holes.slice(9, 18).reduce((s, h) => s + h.par, 0)}
                </td>
                <td className="px-2 py-1 text-center bg-emerald-700">{totalPar}</td>
              </tr>
              <tr className="text-white font-medium">
                <td className="px-2 py-1">Score</td>
                {holes.slice(9, 18).map(h => (
                  <td key={h.number} className={`px-2 py-1 text-center ${
                    h.score < h.par ? 'text-red-400' :
                    h.score === h.par ? 'text-emerald-400' :
                    h.score === h.par + 1 ? 'text-blue-400' : 'text-yellow-400'
                  }`}>{h.score}</td>
                ))}
                <td className="px-2 py-1 text-center bg-slate-700">
                  {holes.slice(9, 18).reduce((s, h) => s + h.score, 0)}
                </td>
                <td className="px-2 py-1 text-center bg-emerald-700 font-bold">{totalScore}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white py-4 rounded-lg font-semibold text-lg"
        >
          {saving ? 'Saving...' : 'Save Round'}
        </button>
      </main>
    </div>
  )
}