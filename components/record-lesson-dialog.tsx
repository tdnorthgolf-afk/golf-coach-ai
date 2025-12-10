'use client'

import { useState, useRef } from 'react'
import { Mic, Upload, StopCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

export default function RecordLessonDialog({ 
  studentId, 
  studentName 
}: { 
  studentId: string
  studentName: string 
}) {
  const [open, setOpen] = useState(false)
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
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
      setRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to start recording. Please check microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async () => {
    if (!audioBlob) {
      alert('Please record audio first')
      return
    }

    setProcessing(true)

    try {
      // First, transcribe the audio and create lesson
      const formData = new FormData()
      formData.append('audio', audioBlob, 'lesson-audio.webm')
      formData.append('studentId', studentId)
      formData.append('studentName', studentName)

      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!transcribeResponse.ok) {
        throw new Error('Failed to process lesson')
      }

      const { lesson } = await transcribeResponse.json()

      // Upload any media files attached to this lesson
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const mediaFormData = new FormData()
          mediaFormData.append('file', file)
          mediaFormData.append('studentId', studentId)
          mediaFormData.append('lessonId', lesson.id)

          await fetch('/api/upload', {
            method: 'POST',
            body: mediaFormData,
          })
        }
      }

      setOpen(false)
      setAudioBlob(null)
      setSelectedFiles([])
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save lesson')
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    if (recording) {
      stopRecording()
    }
    setOpen(false)
    setAudioBlob(null)
    setSelectedFiles([])
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogTrigger asChild>
        <Button>
          <Mic className="mr-2 h-4 w-4" />
          Record Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Lesson</DialogTitle>
          <DialogDescription>
            Record audio notes and optionally attach photos/videos from this lesson.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Audio Recording */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Audio Recording</h4>
            <div className="flex items-center gap-3">
              {!audioBlob ? (
                <Button
                  type="button"
                  variant={recording ? 'destructive' : 'default'}
                  onClick={recording ? stopRecording : startRecording}
                  disabled={processing}
                  className="flex-1"
                >
                  {recording ? (
                    <>
                      <StopCircle className="mr-2 h-4 w-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">Recording saved</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAudioBlob(null)
                      chunksRef.current = []
                    }}
                    disabled={processing}
                  >
                    Re-record
                  </Button>
                </div>
              )}
            </div>
            {recording && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                Recording in progress...
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Attach Media (Optional)</h4>
            <div>
              <label htmlFor="media-upload" className="block">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload photos or videos
                  </p>
                </div>
              </label>
              <input
                id="media-upload"
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={processing}
              />
            </div>
            {selectedFiles.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">{selectedFiles.length} file(s) selected:</p>
                {selectedFiles.map((file, index) => (
                  <p key={index} className="text-sm text-muted-foreground truncate">
                    {file.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={processing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!audioBlob || processing}
            className="flex-1"
          >
            {processing ? 'Processing...' : 'Save Lesson'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
