'use client'

import { useState } from 'react'

export default function InviteStudentButton({ studentId, studentName }: { studentId: string, studentName: string }) {
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  const handleGenerateInvite = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate invite')
      }

      setInviteLink(data.inviteLink)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate invite link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      alert('Invite link copied to clipboard!')
    }
  }

  return (
    <div>
      {!inviteLink ? (
        <button
          onClick={handleGenerateInvite}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? '🔄 Generating...' : '🔗 Generate Portal Invite'}
        </button>
      ) : (
        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-white text-sm mb-2">Invite link for {studentName}:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 bg-slate-600 text-white text-sm px-3 py-2 rounded"
            />
            <button
              onClick={copyToClipboard}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              📋 Copy
            </button>
          </div>
          <p className="text-slate-400 text-xs mt-2">Link expires in 7 days</p>
        </div>
      )}
    </div>
  )
}