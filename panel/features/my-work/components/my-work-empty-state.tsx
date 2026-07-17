'use client'

import { Briefcase } from 'lucide-react'

interface EmptyStateProps {
  message?: string
}

export function MyWorkEmptyState({ message = 'Bugün sana atanmış aktif iş bulunmuyor.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-neutral-850 bg-neutral-950/[0.04] space-y-4 max-w-md mx-auto my-8 animate-in fade-in duration-300">
      <div className="rounded-full bg-neutral-900/60 p-4 border border-neutral-800 shadow-inner">
        <Briefcase className="h-7 w-7 text-neutral-500" />
      </div>
      <div className="space-y-1.5">
        <h4 className="text-sm font-bold text-foreground">İş Akışı Adımı Bulunmadı</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  )
}
