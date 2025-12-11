'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, Square, Loader2, X } from 'lucide-react'

interface RecordLessonButtonProps {
  studentId: string
}

export default function RecordLessonButton({ studentId }: RecordLessonButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [notes, setNotes] = useState('')
  const router = useRouter()

  const handleSave = async () => {
    if (!notes.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, notes }),
      })

      if (!response.ok) throw new Error('Failed to save lesson')

      setNotes('')
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error saving lesson:', error)
      alert('Failed to save lesson')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-[#E65722] text-white hover:bg-[#E65722]/90 transition-colors"
      >
        <Mic className="w-4 h-4" />
        Record Lesson
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-lg mx-4 rounded-xl p-6 bg-[#002D40] shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-[#5F9EA0] hover:text-[#E8E3DC]"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-[#E8E3DC] mb-2">Record Lesson</h2>
            <div className="h-1 w-12 rounded-full bg-[#E65722] mb-6" />

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#5F9EA0] mb-2">
                Lesson Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                placeholder="Enter lesson notes, observations, and recommendations..."
                className="w-full px-4 py-3 rounded-xl border border-[#D6C8B4]/20 bg-[#0A1A20] text-[#E8E3DC] placeholder-[#5F9EA0] focus:outline-none focus:border-[#E65722] transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-[#D6C8B4]/20 text-[#E8E3DC] font-medium hover:bg-[#D6C8B4]/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing || !notes.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-[#E65722] text-white hover:bg-[#E65722]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Lesson'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}