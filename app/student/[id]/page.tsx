import { createClient } from '@supabase/supabase-js'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, FileText, Video, Mic, Clock, TrendingUp } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const { id } = await params

  const { data: student } = await supabase.from('students').select('*').eq('id', id).single()
  if (!student) redirect('/dashboard')

  const { data: lessons } = await supabase.from('lessons').select('*').eq('student_id', id).order('created_at', { ascending: false })
  const { data: mediaFiles } = await supabase.from('media').select('*').eq('student_id', id).order('created_at', { ascending: false }).limit(6)

  return (
    <div className="min-h-screen bg-[#0A1A20]">
      <header className="border-b border-[#D6C8B4]/10 bg-[#002D40] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-[#5F9EA0] hover:text-[#E8E3DC]">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className="w-px h-6 bg-[#D6C8B4]/20" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-[#D6C8B4] text-[#0B2D38]">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{student.name}</h1>
                <p className="text-xs text-[#5F9EA0]">Student Profile</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl p-6 bg-[#D6C8B4]">
            <h3 className="text-sm font-medium uppercase tracking-widest text-[#5F9EA0] mb-4">Contact</h3>
            {student.email && (
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-[#002D40]" />
                <p className="font-medium text-[#0B2D38]">{student.email}</p>
              </div>
            )}
            {student.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#002D40]" />
                <p className="font-medium text-[#0B2D38]">{student.phone}</p>
              </div>
            )}
            {!student.email && !student.phone && <p className="text-[#5F9EA0]">No contact info</p>}
          </div>

          <div className="rounded-xl p-6 bg-[#D6C8B4]">
            <p className="text-xs font-medium uppercase tracking-widest text-[#5F9EA0]">Total Lessons</p>
            <p className="text-4xl font-bold mt-2 text-[#0B2D38]">{lessons?.length || 0}</p>
            <div className="flex items-center gap-2 mt-3">
              <TrendingUp className="w-4 h-4 text-[#E65722]" />
              <span className="text-sm text-[#0B2D38]">All time</span>
            </div>
          </div>

          <div className="rounded-xl p-6 bg-[#D6C8B4]">
            <p className="text-xs font-medium uppercase tracking-widest text-[#5F9EA0]">Portal Access</p>
            {student.access_code ? (
              <p className="text-2xl font-mono font-bold mt-2 text-[#0B2D38]">{student.access_code}</p>
            ) : (
              <p className="text-sm text-[#5F9EA0] mt-2">Not invited</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-xl p-6 bg-[#002D40]">
            <h3 className="text-lg font-semibold text-[#E8E3DC] mb-4">Lesson Notes</h3>
            <div className="h-1 w-12 mb-6 rounded-full bg-[#E65722]" />
            {lessons && lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((lesson: any) => (
                  <div key={lesson.id} className="p-4 rounded-xl border border-[#D6C8B4]/10 bg-[#D6C8B4]/5">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-[#D6C8B4]" />
                      <p className="font-medium text-[#E8E3DC]">
                        {new Date(lesson.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {lesson.notes && <p className="text-sm text-[#E8E3DC]/80">{lesson.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#5F9EA0] text-center py-8">No lessons recorded yet</p>
            )}
          </div>

          <div className="rounded-xl p-6 bg-[#002D40]">
            <h3 className="text-lg font-semibold text-[#E8E3DC] mb-4">Media Files</h3>
            <div className="h-1 w-12 mb-6 rounded-full bg-[#E65722]" />
            {mediaFiles && mediaFiles.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {mediaFiles.map((media: any) => (
                  <a key={media.id} href={media.url} target="_blank" rel="noopener noreferrer" className="aspect-video rounded-xl border border-[#D6C8B4]/10 bg-[#D6C8B4]/5 flex items-center justify-center hover:border-[#E65722]">
                    {media.type === 'video' ? <Video className="w-8 h-8 text-[#5F9EA0]" /> : <Mic className="w-8 h-8 text-[#5F9EA0]" />}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-[#5F9EA0] text-center py-8">No media files yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}