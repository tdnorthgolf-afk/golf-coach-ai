import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import AddStudentDialog from '@/components/add-student-dialog'
import SignOutButton from '@/components/sign-out-button'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function DashboardPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // Get the coach from database
  const { data: coach } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', user.id)
    .single()

  // Get students for this coach
  let students: any[] = []
  if (coach) {
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('coach_id', coach.id)
      .order('created_at', { ascending: false })
    
    students = data || []
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700 bg-slate-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
  <h1 className="text-2xl font-bold text-emerald-400">Golf Coach AI</h1>
  <p className="text-slate-400">Welcome, {user.firstName || 'Coach'}!</p>
</div>
<div className="flex items-center gap-3">
  <Link href="/calendar" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
    📅 Calendar
  </Link>
  <AddStudentDialog />
  <SignOutButton />
</div>
          <AddStudentDialog />
        </div>
      </header>

      <main className="p-8 max-w-6xl mx-auto">
        {students.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">⛳</div>
            <h2 className="text-xl text-white mb-2">No Students Yet</h2>
            <p className="text-slate-400 mb-6">
              Add your first student to start tracking their progress
            </p>
            <AddStudentDialog />
          </div>
        ) : (
          <div>
            <h2 className="text-xl text-white mb-6">Your Students ({students.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <Link href={`/student/${student.id}`} key={student.id}>
                  <div className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700 hover:border-emerald-500">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{student.name}</h3>
                        {student.email && (
                          <p className="text-slate-400 text-sm">{student.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}