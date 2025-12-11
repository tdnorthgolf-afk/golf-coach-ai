'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, X } from 'lucide-react'

export default function AddStudentDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      })

      if (!response.ok) {
        throw new Error('Failed to add student')
      }

      setName('')
      setEmail('')
      setPhone('')
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error adding student:', error)
      alert('Failed to add student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
        style={{ backgroundColor: '#E65722', color: '#FFFFFF' }}
      >
        <UserPlus className="w-4 h-4" />
        Add Student
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(10, 26, 32, 0.8)' }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div 
            className="relative w-full max-w-md mx-4 rounded-xl p-6 shadow-2xl"
            style={{ backgroundColor: '#002D40' }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 transition-colors"
              style={{ color: '#5F9EA0' }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold" style={{ color: '#E8E3DC' }}>Add New Student</h2>
              <div 
                className="h-1 w-12 mt-2 rounded-full"
                style={{ backgroundColor: '#E65722' }}
              />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5F9EA0' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter student name"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors"
                  style={{ 
                    backgroundColor: '#0A1A20',
                    borderColor: 'rgba(214, 200, 180, 0.2)',
                    color: '#E8E3DC'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#E65722'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(214, 200, 180, 0.2)'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5F9EA0' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@email.com"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors"
                  style={{ 
                    backgroundColor: '#0A1A20',
                    borderColor: 'rgba(214, 200, 180, 0.2)',
                    color: '#E8E3DC'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#E65722'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(214, 200, 180, 0.2)'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5F9EA0' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors"
                  style={{ 
                    backgroundColor: '#0A1A20',
                    borderColor: 'rgba(214, 200, 180, 0.2)',
                    color: '#E8E3DC'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#E65722'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(214, 200, 180, 0.2)'}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-3 rounded-lg border font-medium transition-colors"
                  style={{ 
                    borderColor: 'rgba(214, 200, 180, 0.2)',
                    color: '#E8E3DC'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !name}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#E65722', color: '#FFFFFF' }}
                >
                  {loading ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}