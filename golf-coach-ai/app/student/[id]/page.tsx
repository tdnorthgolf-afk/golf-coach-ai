import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'
import { ArrowLeft, Upload, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { format } from 'date-fns'
import RecordLessonDialog from '@/components/record-lesson-dialog'
import UploadMediaDialog from '@/components/upload-media-dialog'
import ReactMarkdown from 'react-markdown'

async function getStudentData(studentId: string, userId: string) {
  const supabase = createServerClient()
  
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userData) return null

  // Get student
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .eq('coach_id', userData.id)
    .single()

  if (!student) return null

  // Get lessons with media
  const { data: lessons } = await supabase
    .from('lessons')
    .select(`
      *,
      media (*)
    `)
    .eq('student_id', studentId)
    .order('lesson_date', { ascending: false })

  // Get standalone media (not attached to lessons)
  const { data: standaloneMedia } = await supabase
    .from('media')
    .select('*')
    .eq('student_id', studentId)
    .is('lesson_id', null)
    .order('created_at', { ascending: false })

  return { student, lessons: lessons || [], standaloneMedia: standaloneMedia || [] }
}

export default async function StudentPage({ params }: { params: { id: string } }) {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  const data = await getStudentData(params.id, user.id)

  if (!data) {
    redirect('/dashboard')
  }

  const { student, lessons, standaloneMedia } = data
  
  const initials = student.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Combine lessons and standalone media into chronological feed
  const feedItems = [
    ...lessons.map((lesson: any) => ({
      type: 'lesson',
      date: new Date(lesson.lesson_date || lesson.created_at),
      data: lesson,
    })),
    ...standaloneMedia.map((media: any) => ({
      type: 'media',
      date: new Date(media.created_at),
      data: media,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex gap-2">
              <UploadMediaDialog studentId={student.id} studentName={student.name} />
              <RecordLessonDialog studentId={student.id} studentName={student.name} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarImage src={student.thumbnail_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{student.name}</h1>
              <p className="text-sm text-muted-foreground">
                {student.email && student.email}
                {student.email && student.phone && ' • '}
                {student.phone && student.phone}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Training Feed */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {feedItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="rounded-full bg-primary/10 p-4 mb-4 inline-block">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No lessons yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
              Start by recording a lesson or uploading training materials
            </p>
            <div className="flex gap-2 justify-center">
              <UploadMediaDialog studentId={student.id} studentName={student.name} />
              <RecordLessonDialog studentId={student.id} studentName={student.name} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {feedItems.map((item: any, index: number) => {
              if (item.type === 'lesson') {
                const lesson = item.data
                return (
                  <div key={`lesson-${lesson.id}`} className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <h3 className="font-semibold text-lg">Lesson Notes</h3>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(lesson.lesson_date || lesson.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown>{lesson.notes}</ReactMarkdown>
                    </div>

                    {lesson.audio_url && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <audio controls className="w-full">
                          <source src={lesson.audio_url} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}

                    {lesson.media && lesson.media.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h4 className="text-sm font-medium mb-3">Lesson Media</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {lesson.media.map((media: any) => (
                            <div key={media.id} className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
                              {media.file_type === 'image' && (
                                <img 
                                  src={media.file_url} 
                                  alt={media.file_name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                              {media.file_type === 'video' && (
                                <video 
                                  src={media.file_url} 
                                  controls
                                  className="w-full h-full object-cover"
                                />
                              )}
                              {media.file_type === 'document' && (
                                <div className="flex items-center justify-center h-full">
                                  <Upload className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              } else {
                const media = item.data
                return (
                  <div key={`media-${media.id}`} className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Training Material</h3>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(media.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    {media.caption && (
                      <p className="text-sm text-muted-foreground mb-4">{media.caption}</p>
                    )}

                    <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
                      {media.file_type === 'image' && (
                        <img 
                          src={media.file_url} 
                          alt={media.file_name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {media.file_type === 'video' && (
                        <video 
                          src={media.file_url} 
                          controls
                          className="w-full h-full object-cover"
                        />
                      )}
                      {media.file_type === 'document' && (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                          <a 
                            href={media.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            {media.file_name}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }
            })}
          </div>
        )}
      </main>
    </div>
  )
}
