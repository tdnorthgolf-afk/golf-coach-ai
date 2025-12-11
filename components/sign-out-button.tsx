'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
      style={{ color: '#D94F3A' }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(217, 79, 58, 0.1)'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Sign Out</span>
    </button>
  )
}