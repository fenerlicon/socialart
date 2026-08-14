'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#09090b]">
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        <span>Yönlendiriliyor...</span>
      </div>
    </div>
  )
}

