'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Next.js Client Exception:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] p-6 text-neutral-100">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Sayfa Yüklenirken Bir Sorun Oluştu</h2>
          <p className="text-xs text-neutral-400">
            {error?.message || 'Tarayıcı önbelleği veya oturum durumu yenileniyor. Lütfen tekrar deneyin.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2 rounded-xl flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Yeniden Dene</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/admin/dashboard'
              }
            }}
            className="w-full sm:w-auto border-neutral-800 hover:bg-neutral-800 text-neutral-300 font-semibold text-xs px-5 py-2 rounded-xl flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            <span>Ana Panele Dön</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
