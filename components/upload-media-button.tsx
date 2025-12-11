'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2, Video, Mic } from 'lucide-react'

interface UploadMediaButtonProps {
  studentId: string
}

export default function UploadMediaButton({ studentId }: UploadMediaButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('studentId', studentId)

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload')

      setSelectedFile(null)
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error uploading:', error)
      alert('Failed to upload media')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium border border-[#D6C8B4]/20 text-[#E8E3DC] hover:bg-[#D6C8B4]/10 transition-colors"
      >
        <Upload className="w-4 h-4" />
        Upload Media
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

            <h2 className="text-xl font-bold text-[#E8E3DC] mb-2">Upload Media</h2>
            <div className="h-1 w-12 rounded-full bg-[#E65722] mb-6" />

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="video/*,audio/*"
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D6C8B4]/30 rounded-xl p-8 text-center cursor-pointer hover:border-[#E65722]/50 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-[#D6C8B4]/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-[#5F9EA0]" />
                </div>
                <p className="text-[#E8E3DC] font-medium mb-1">Click to upload</p>
                <p className="text-sm text-[#5F9EA0]">Video or audio files</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#0A1A20] border border-[#D6C8B4]/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#E65722]/15 flex items-center justify-center">
                    {selectedFile.type.startsWith('video') ? (
                      <Video className="w-6 h-6 text-[#E65722]" />
                    ) : (
                      <Mic className="w-6 h-6 text-[#E65722]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#E8E3DC] font-medium truncate">{selectedFile.name}</p>
                    <p className="text-sm text-[#5F9EA0]">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1 text-[#5F9EA0] hover:text-[#D94F3A]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-[#D6C8B4]/20 text-[#E8E3DC] font-medium hover:bg-[#D6C8B4]/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-[#E65722] text-white hover:bg-[#E65722]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}