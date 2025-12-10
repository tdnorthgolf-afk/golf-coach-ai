'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function StudentRegister() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [studentName, setStudentName] = useState('')
  const [validating, setValidating] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get('code')

  useEffect(() => {
    if (inviteCode) {
      validateInvite()
    } else {
      setError('No invite code provided')
      setValidating(false)
    }
  }, [inviteCode])

  const validateInvite = async () => {
    try {
      const response = await fetch(`/api/invite?code=${inviteCode}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid invite')
      }

      setStudentName(data.invite.student?.name || 'Student')
      if (data.invite.student?.email) {
        setEmail(data.invite.student.email)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/student-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Store student session
      localStorage.setItem('studentId', data.studentId)
      localStorage.setItem('studentName', data.studentName)

      alert('Account created successfully!')
      router.push('/student-portal/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Validating invite...</div>
      </div>
    )
  }

  if (error && !studentName) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md border border-slate-700 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Invalid Invite</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link href="/student-portal" className="text-emerald-400 hover:underline">
            Go to login page
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-400 mb-2">⛳ Create Account</h1>
          <p className="text-slate-400">Welcome, {studentName}!</p>
          <p className="text-slate-500 text-sm">Set up your student portal access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Create Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/student-portal" className="text-slate-400 text-sm hover:text-white">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
