'use client'

import { useRouter } from 'next/navigation'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AccessDenied() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="relative w-full max-w-md p-8 rounded-3xl border border-red-500/20 bg-gradient-to-b from-red-500/5 to-transparent backdrop-blur-xl shadow-2xl text-center space-y-6">
        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 bg-red-500/5 rounded-3xl blur-2xl" />

        {/* Icon */}
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Text content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-white">Erişim Yetkiniz Yok</h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Bu yönetim sayfasına erişmek veya bu işlemi gerçekleştirmek için gerekli yetkiye sahip değilsiniz. Lütfen yöneticinizle iletişime geçin.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 rounded-xl py-6 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana Panele Dön
          </Button>
        </div>
      </div>
    </div>
  )
}
