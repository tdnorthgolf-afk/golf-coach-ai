'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, X, Loader2, AlertTriangle } from 'lucide-react'

interface DeleteStudentButtonProps {
  studentId: string
  studentName: string
}

export default function DeleteStudentButton({ studentId, studentName }: DeleteStudentButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete student')

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to delete student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#D94F3A] hover:bg-[#D94F3A]/10 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">Delete</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md mx-4 rounded-xl p-6 bg-[#002D40] shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-[#5F9EA0] hover:text-[#E8E3DC]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#D94F3A]/15 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[#D94F3A]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#E8E3DC]">Delete Student</h2>
                <p className="text-sm text-[#5F9EA0]">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-[#E8E3DC] mb-6">
              Are you sure you want to delete <span className="font-semibold text-[#E65722]">{studentName}</span>? 
              All their lessons, media, and data will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-[#D6C8B4]/20 text-[#E8E3DC] font-medium hover:bg-[#D6C8B4]/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-[#D94F3A] text-white hover:bg-[#D94F3A]/90 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}