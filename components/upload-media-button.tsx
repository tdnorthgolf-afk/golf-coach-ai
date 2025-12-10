'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadMediaButton({ 
  studentId, 
  lessonId 
}: { 
  studentId: string
  lessonId?: string 
}) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('studentId', studentId)
      if (lessonId) {
        formData.append('lessonId', lessonId)
      }

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload')
      }

      alert('Media uploaded successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to upload media. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={isUploading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
      >
        {isUploading ? '📤 Uploading...' : '📷 Add Media'}
      </button>
    </>
  )
}