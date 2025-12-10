'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

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
      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium"
    >
      🚪 Sign Out
    </button>
  )
}