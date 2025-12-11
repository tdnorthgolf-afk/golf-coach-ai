'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, Mic, Square } from 'lucide-react'

interface RecordLessonDialogProps {
  studentId: string
  isOpen: boolean
  onClose: () => void
}

export default function RecordLessonDialog({ studentId, isOpen, onClose }: RecordLessonDialogProps) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (!isOpen) return null

  const handleSave = async () => {
    if (!notes.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, notes }),
      })

      if (!response.ok) throw new Error('Failed to save')

      setNotes('')
      onClose()
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save lesson')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg mx-4 rounded-xl p-6 bg-[#002D40] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5F9EA0] hover:text-[#E8E3DC]"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-[#E8E3DC] mb-2">Record Lesson</h2>
        <div className="h-1 w-12 rounded-full bg-[#E65722] mb-6" />

        <div className="mb-6">
          <label className="block text-sm font-medium text-[#5F9EA0] mb-2">
            Lesson Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
            placeholder="Enter lesson notes, observations, drills practiced, and recommendations..."
            className="w-full px-4 py-3 rounded-xl border border-[#D6C8B4]/20 bg-[#0A1A20] text-[#E8E3DC] placeholder-[#5F9EA0] focus:outline-none focus:border-[#E65722] transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-[#D6C8B4]/20 text-[#E8E3DC] font-medium hover:bg-[#D6C8B4]/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !notes.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-[#E65722] text-white hover:bg-[#E65722]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
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
  )
}