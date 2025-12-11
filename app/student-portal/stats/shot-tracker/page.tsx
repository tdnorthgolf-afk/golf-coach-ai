'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ShotTracker from '@/components/shot-tracker'
import { ShotData } from '@/lib/strokes-gained'

export default function ShotTrackerPage() {
  const [studentId, setStudentId] = useState<string | null>(null)
  const [step, setStep] = useState<'setup' | 'track'>('setup')
  const [courseName, setCourseName] = useState('')
  const [holeNumber, setHoleNumber] = useState(1)
  const [par, setPar] = useState(4)
  const [yardage, setYardage] = useState(400)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    const id = localStorage.getItem('studentId')
    if (!id) {
      router.push('/student-portal')
      return
    }
    setStudentId(id)
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const url = URL.createObjectURL(file)
      setImageUrl(url)
    }
  }

  const handleSaveShots = async (shots: ShotData[], summary: any) => {
    try {
      // For now, just show the summary
      alert(`Hole ${holeNumber} Complete!\n\nTotal Strokes Gained: ${summary.total.toFixed(2)}\n\nOff the Tee: ${summary.byCategory.tee.toFixed(2)}\nApproach: ${summary.byCategory.approach.toFixed(2)}\nAround Green: ${summary.byCategory.around_green.toFixed(2)}\nPutting: ${summary.byCategory.putting.toFixed(2)}`)
      
      // TODO: Save to database
      console.log('Shots:', shots)
      console.log('Summary:', summary)
      
    } catch (error) {
      console.error('Error saving shots:', error)
      alert('Failed to save shots')
    }
  }

  // Step 1: Setup
  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-slate-900">
        <header className="border-b border-slate-700 bg-slate-800 p-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-emerald-400">🎯 Shot Tracker</h1>
              <p className="text-slate-400">Visual strokes gained analysis</p>
            </div>
            <Link 
              href="/student-portal/stats" 
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              ← Back
            </Link>
          </div>
        </header>

        <main className="p-8 max-w-2xl mx-auto">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg text-white mb-4">Hole Setup</h2>
            
            <div className="space-y-4">
              {/* Course Name */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">Course Name</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Enter course name"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                />
              </div>

              {/* Hole Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Hole #</label>
                  <select
                    value={holeNumber}
                    onChange={(e) => setHoleNumber(parseInt(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                  >
                    {Array.from({ length: 18 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Par</label>
                  <select
                    value={par}
                    onChange={(e) => setPar(parseInt(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                  >
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Yardage</label>
                  <input
                    type="number"
                    value={yardage}
                    onChange={(e) => setYardage(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  Satellite/Drone Image of Hole
                </label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                  {imageUrl ? (
                    <div>
                      <img 
                        src={imageUrl} 
                        alt="Hole preview" 
                        className="max-h-48 mx-auto rounded mb-3"
                      />
                      <button
                        onClick={() => {
                          setImageUrl(null)
                          setImageFile(null)
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-400 mb-3">
                        Upload a satellite or drone image of the hole
                      </p>
                      <label className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg cursor-pointer">
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-slate-500 text-xs mt-2">
                  Tip: Use Google Earth to get a satellite view of the hole
                </p>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => setStep('track')}
                disabled={!imageUrl || !courseName || yardage <= 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium mt-4"
              >
                Start Tracking Shots →
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mt-6">
            <h3 className="text-white font-medium mb-3">📖 How It Works</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm">
              <li>Upload a satellite/drone image of the hole</li>
              <li>Click to mark the tee box and pin positions</li>
              <li>For each shot, click the start position then end position</li>
              <li>Select the club used and lie type for accuracy</li>
              <li>See your strokes gained breakdown in real-time!</li>
            </ol>
          </div>
        </main>
      </div>
    )
  }

  // Step 2: Track shots
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700 bg-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-emerald-400">{courseName}</h1>
            <p className="text-slate-400 text-sm">Hole {holeNumber} • Par {par} • {yardage} yards</p>
          </div>
          <button
            onClick={() => setStep('setup')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            ← Back to Setup
          </button>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {imageUrl && (
          <ShotTracker
            imageUrl={imageUrl}
            holeNumber={holeNumber}
            par={par}
            yardage={yardage}
            onSave={handleSaveShots}
          />
        )}

        {/* Legend */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mt-4">
          <h3 className="text-white font-medium mb-3">🎨 Shot Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500"></span>
              <span className="text-slate-300 text-sm">Off the Tee</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500"></span>
              <span className="text-slate-300 text-sm">Approach</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-orange-500"></span>
              <span className="text-slate-300 text-sm">Around Green</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-500"></span>
              <span className="text-slate-300 text-sm">Putting</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}