'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteStudentButton({ studentId, studentName }: { studentId: string, studentName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const confirmed = confirm(`Are you sure you want to delete ${studentName}? This will also delete all their lessons and media. This cannot be undone.`)
    
    if (!confirmed) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/students?id=${studentId}`, {
        method: 'DELETE',
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete')
      }

      alert('Student deleted successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to delete student. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
    >
      {isDeleting ? '🗑️ Deleting...' : '🗑️ Delete Student'}
    </button>
  )
}