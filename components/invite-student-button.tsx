'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, X, Loader2, Copy, Check } from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string | null
}

interface InviteStudentButtonProps {
  student: Student
}

export default function InviteStudentButton({ student }: InviteStudentButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [accessCode, setAccessCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const handleInvite = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/students/${student.id}/invite`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to generate invite')

      const data = await response.json()
      setAccessCode(data.accessCode)
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate invite')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (accessCode) {
      navigator.clipboard.writeText(accessCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#E65722] text-white hover:bg-[#E65722]/90 transition-colors"
      >
        <Mail className="w-4 h-4" />
        Invite to Portal
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

            <h2 className="text-xl font-bold text-[#E8E3DC] mb-2">Invite to Student Portal</h2>
            <div className="h-1 w-12 rounded-full bg-[#E65722] mb-6" />

            {!accessCode ? (
              <>
                <p className="text-[#E8E3DC] mb-6">
                  Generate an access code for <span className="font-semibold text-[#E65722]">{student.name}</span> to access their student portal.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-[#D6C8B4]/20 text-[#E8E3DC] font-medium hover:bg-[#D6C8B4]/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-[#E65722] text-white hover:bg-[#E65722]/90 disabled:opacity-50 transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Code'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <p className="text-[#5F9EA0] mb-3">Access code generated!</p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="px-6 py-4 rounded-xl bg-[#0A1A20] border border-[#D6C8B4]/20">
                      <p className="text-3xl font-mono font-bold text-[#E65722] tracking-widest">
                        {accessCode}
                      </p>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="p-3 rounded-xl bg-[#D6C8B4] text-[#0B2D38] hover:bg-[#D6C8B4]/80 transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0A1A20] border border-[#D6C8B4]/10 mb-6">
                  <p className="text-sm text-[#5F9EA0]">
                    Share this code with {student.name}. They can use it to log in at:
                  </p>
                  <p className="text-[#E65722] font-medium mt-2">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/student-portal
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-3 rounded-xl font-semibold bg-[#E65722] text-white hover:bg-[#E65722]/90 transition-colors"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}