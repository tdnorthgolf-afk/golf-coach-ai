'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X, Loader2 } from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string | null
  phone: string | null
}

interface EditStudentButtonProps {
  student: Student
}

export default function EditStudentButton({ student }: EditStudentButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(student.name)
  const [email, setEmail] = useState(student.email || '')
  const [phone, setPhone] = useState(student.phone || '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      })

      if (!response.ok) throw new Error('Failed to update student')

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to update student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-[#D6C8B4]/20 text-[#E8E3DC] hover:bg-[#D6C8B4]/10 transition-colors"
      >
        <Pencil className="w-4 h-4" />
        <span className="hidden sm:inline">Edit</span>
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

            <h2 className="text-xl font-bold text-[#E8E3DC] mb-2">Edit Student</h2>
            <div className="h-1 w-12 rounded-full bg-[#E65722] mb-6" />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5F9EA0] mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#D6C8B4]/20 bg-[#0A1A20] text-[#E8E3DC] focus:outline-none focus:border-[#E65722] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5F9EA0] mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D6C8B4]/20 bg-[#0A1A20] text-[#E8E3DC] focus:outline-none focus:border-[#E65722] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5F9EA0] mb-2">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D6C8B4]/20 bg-[#0A1A20] text-[#E8E3DC] focus:outline-none focus:border-[#E65722] transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-[#D6C8B4]/20 text-[#E8E3DC] font-medium hover:bg-[#D6C8B4]/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !name}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-[#E65722] text-white hover:bg-[#E65722]/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}