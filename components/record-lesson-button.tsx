'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function RecordLessonButton({ studentId, studentName }: { studentId: string, studentName: string }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const router = useRouter()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please allow microphone access.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const submitRecording = async () => {
    if (!audioBlob) return

    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('studentId', studentId)
      formData.append('studentName', studentName)

      const response = await fetch('/api/lessons', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process lesson')
      }

      alert('Lesson saved successfully!')
      setAudioBlob(null)
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save lesson. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const cancelRecording = () => {
    setAudioBlob(null)
  }

  // Show recording controls
  if (isRecording) {
    return (
      <button
        onClick={stopRecording}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium animate-pulse"
      >
        ⏹️ Stop Recording
      </button>
    )
  }

  // Show processing state
  if (isProcessing) {
    return (
      <button
        disabled
        className="bg-slate-600 text-white px-4 py-2 rounded-lg font-medium"
      >
        🔄 Processing with AI...
      </button>
    )
  }

  // Show review controls after recording
  if (audioBlob) {
    return (
      <div className="flex gap-2">
        <button
          onClick={submitRecording}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          ✅ Save Lesson
        </button>
        <button
          onClick={cancelRecording}
          className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          ❌ Cancel
        </button>
      </div>
    )
  }

  // Default state - show record button
  return (
    <button
      onClick={startRecording}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
    >
      🎤 Record Lesson
    </button>
  )
}