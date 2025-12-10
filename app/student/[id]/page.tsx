import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import RecordLessonButton from '@/components/record-lesson-button'
import UploadMediaButton from '@/components/upload-media-button'
import DeleteStudentButton from '@/components/delete-student-button'
import EditStudentButton from '@/components/edit-student-button'
import InviteStudentButton from '@/components/invite-student-button'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Function to format lesson notes with proper styling
function formatLessonNotes(notes: string) {
  if (!notes) return null
  
  const lines = notes.split('\n')
  
  return lines.map((line, index) => {
    const trimmedLine = line.trim()
    
    if (trimmedLine.startsWith('## ')) {
      return (
        <h3 key={index} className="text-emerald-400 font-bold text-lg mt-6 mb-3 first:mt-0">
          {trimmedLine.replace('## ', '')}
        </h3>
      )
    }
    
    if (/^\d+\./.test(trimmedLine)) {
      const text = trimmedLine.replace(/\*\*/g, '')
      return (
        <p key={index} className="text-white font-semibold mt-4 mb-2">
          {text}
        </p>
      )
    }
    
    if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
      const text = trimmedLine.replace(/^[•\-\*]\s*/, '')
      return (
        <p key={index} className="text-slate-300 ml-4 mb-1">
          • {text}
        </p>
      )
    }
    
    if (trimmedLine) {
      return (
        <p key={index} className="text-slate-300 mb-2">
          {trimmedLine}
        </p>
      )
    }
    
    return <div key={index} className="h-2" />
  })
}

export default async function StudentPage({ params }: { params: { id: string } }) {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // Get the student
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!student) {
    redirect('/dashboard')
  }

  // Get lessons for this student
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('student_id', params.id)
    .order('created_at', { ascending: false })

  // Get ALL media for this student (we'll filter by lesson)
  const { data: allMedia } = await supabase
    .from('media')
    .select('*')
    .eq('student_id', params.id)
    .order('created_at', { ascending: false })

  // Separate media: those attached to lessons vs standalone
  const standaloneMedia = allMedia?.filter(m => !m.lesson_id) || []

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700 bg-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
  <h1 className="text-2xl font-bold text-white">{student.name}</h1>
  {student.email && <p className="text-slate-400">{student.email}</p>}
  {student.phone && <p className="text-slate-400">{student.phone}</p>}
</div><div className="flex gap-2">
  <EditStudentButton 
    studentId={student.id} 
    currentName={student.name}
    currentEmail={student.email}
    currentPhone={student.phone}
  />
  <DeleteStudentButton studentId={student.id} studentName={student.name} />
</div>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
  <RecordLessonButton studentId={student.id} studentName={student.name} />
  <UploadMediaButton studentId={student.id} />
  <InviteStudentButton studentId={student.id} studentName={student.name} />
</div>

        {/* Standalone Media Gallery (not attached to lessons) */}
        {standaloneMedia.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl text-white mb-4">📷 General Media ({standaloneMedia.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {standaloneMedia.map((item: any) => (
                <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 border border-slate-700 hover:border-emerald-500 transition-colors">
                  {item.file_type === 'image' ? (
                    <img 
                      src={item.file_url} 
                      alt={item.file_name}
                      className="w-full h-full object-cover"
                    />
                  ) : item.file_type === 'video' ? (
                    <video 
                      src={item.file_url} 
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      📄 {item.file_name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lessons with attached media */}
        <div>
          <h2 className="text-xl text-white mb-4">📝 Lessons ({lessons?.length || 0})</h2>
          
          {(!lessons || lessons.length === 0) ? (
            <div className="bg-slate-800 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">🎤</div>
              <h3 className="text-xl text-white mb-2">No Lessons Yet</h3>
              <p className="text-slate-400 mb-6">
                Record your first lesson to start tracking progress
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {lessons.map((lesson: any) => {
                // Get media attached to this specific lesson
                const lessonMedia = allMedia?.filter(m => m.lesson_id === lesson.id) || []
                
                return (
                  <div key={lesson.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    {/* Lesson Date Header */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📅</span>
                        <h3 className="text-white font-semibold text-lg">
                          {new Date(lesson.created_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                      </div>
                      <UploadMediaButton studentId={student.id} lessonId={lesson.id} />
                    </div>
                    
                    {/* Media attached to this lesson */}
                    {lessonMedia.length > 0 && (
                      <div className="mb-4 pb-4 border-b border-slate-700">
                        <p className="text-slate-400 text-sm mb-2">📷 Lesson Media ({lessonMedia.length})</p>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                          {lessonMedia.map((item: any) => (
                            <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-700">
                              {item.file_type === 'image' ? (
                                <img 
                                  src={item.file_url} 
                                  alt={item.file_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : item.file_type === 'video' ? (
                                <video 
                                  src={item.file_url} 
                                  controls
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                                  📄
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Formatted Lesson Notes */}
                    <div className="lesson-content">
                      {formatLessonNotes(lesson.notes)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}