'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PracticePlanPage() {
  const [studentId, setStudentId] = useState<string | null>(null)
  const [studentName, setStudentName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [practicePlan, setPracticePlan] = useState<string | null>(null)
  const [availableTime, setAvailableTime] = useState('60')
  const [focusArea, setFocusArea] = useState('')
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
  }, [])

  const generatePlan = async () => {
    if (!studentId) return
    
    setLoading(true)
    setPracticePlan(null)

    try {
      const response = await fetch('/api/practice-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          availableTime: parseInt(availableTime),
          focusArea: focusArea || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan')
      }

      setPracticePlan(data.practicePlan)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate practice plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatPlan = (plan: string) => {
    return plan.split('\n').map((line, index) => {
      // Headers
      if (line.startsWith('##')) {
        return <h3 key={index} className="text-lg font-bold text-emerald-400 mt-4 mb-2">{line.replace(/^##\s*/, '')}</h3>
      }
      if (line.startsWith('#')) {
        return <h2 key={index} className="text-xl font-bold text-white mt-4 mb-2">{line.replace(/^#\s*/, '')}</h2>
      }
      // Bold text
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-bold text-white mt-3">{line.replace(/\*\*/g, '')}</p>
      }
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <p key={index} className="text-slate-300 ml-4 my-1">• {line.substring(2)}</p>
      }
      // Numbered items
      if (/^\d+\./.test(line)) {
        return <p key={index} className="text-slate-300 ml-4 my-1">{line}</p>
      }
      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2" />
      }
      // Regular text
      return <p key={index} className="text-slate-300 my-1">{line}</p>
    })
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700 bg-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400">🎯 AI Practice Plan</h1>
            <p className="text-slate-400">Personalized training based on your stats</p>
          </div>
          <Link 
            href="/student-portal/dashboard" 
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            ← Back
          </Link>
        </div>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        {/* Configuration */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
          <h2 className="text-lg text-white mb-4">⚙️ Configure Your Practice Session</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Available Time</label>
              <select
                value={availableTime}
                onChange={(e) => setAvailableTime(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="180">3 hours</option>
              </select>
            </div>
            
            <div>
              <label className="block text-slate-400 text-sm mb-2">Focus Area (Optional)</label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
              >
                <option value="">Auto-detect from stats</option>
                <option value="driving">Driving / Off the Tee</option>
                <option value="irons">Iron Play / Approach</option>
                <option value="short-game">Short Game / Around Green</option>
                <option value="putting">Putting</option>
                <option value="course-management">Course Management</option>
                <option value="mental-game">Mental Game</option>
              </select>
            </div>
          </div>

          <button
            onClick={generatePlan}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white py-3 rounded-lg font-semibold text-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating Your Plan...
              </>
            ) : (
              <>
                🤖 Generate Practice Plan
              </>
            )}
          </button>
        </div>

        {/* Practice Plan Display */}
        {practicePlan && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-white">📋 Your Practice Plan</h2>
              <span className="text-slate-400 text-sm">{availableTime} min session</span>
            </div>
            
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-600">
              {formatPlan(practicePlan)}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={generatePlan}
                disabled={loading}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium"
              >
                🔄 Generate New Plan
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(practicePlan)
                  alert('Practice plan copied to clipboard!')
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium"
              >
                📋 Copy to Clipboard
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        {!practicePlan && !loading && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg text-white mb-4">💡 How It Works</h2>
            <div className="space-y-3 text-slate-300">
              <p>• The AI analyzes your round statistics to identify areas for improvement</p>
              <p>• It considers your recent lesson notes from your coach</p>
              <p>• Practice plans are customized to fit your available time</p>
              <p>• Each drill includes specific instructions and goals</p>
              <p>• Add more rounds in <Link href="/student-portal/stats" className="text-emerald-400 underline">My Stats</Link> for better personalization!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}