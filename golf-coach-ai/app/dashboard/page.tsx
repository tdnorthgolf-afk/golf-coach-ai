import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import AddStudentDialog from '@/components/add-student-dialog'

export default async function DashboardPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400">Golf Coach AI</h1>
            <p className="text-sm text-slate-400">Welcome, {user.firstName || 'Coach'}!</p>
          </div>
          <AddStudentDialog />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="rounded-full bg-emerald-500/10 p-4 mb-4 inline-block">
            <Plus className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No students yet</h3>
          <p className="text-slate-400 mb-4 max-w-sm mx-auto">
            Get started by adding your first student to begin tracking their progress
          </p>
          <AddStudentDialog />
        </div>
      </main>
    </div>
  )
}