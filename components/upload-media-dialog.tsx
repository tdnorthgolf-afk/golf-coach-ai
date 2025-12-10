'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

export default function UploadMediaDialog({ 
  studentId, 
  studentName 
}: { 
  studentId: string
  studentName: string 
}) {
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [caption, setCaption] = useState('')
  const router = useRouter()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFiles.length === 0) return

    setUploading(true)

    try {
      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('studentId', studentId)
        if (caption) {
          formData.append('caption', caption)
        }

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload file')
        }
      }

      setOpen(false)
      setSelectedFiles([])
      setCaption('')
      router.refresh()
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Add Media
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Add photos, videos, or documents to {studentName}'s training space.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Files *</Label>
              <div>
                <label htmlFor="file-upload" className="block">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Click to select files
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Images, videos, or PDFs
                    </p>
                  </div>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-medium">{selectedFiles.length} file(s) selected:</p>
                  {selectedFiles.map((file, index) => (
                    <p key={index} className="text-sm text-muted-foreground truncate">
                      • {file.name}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption (Optional)</Label>
              <Input
                id="caption"
                placeholder="Add a note about this media..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={uploading}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={uploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={selectedFiles.length === 0 || uploading}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
