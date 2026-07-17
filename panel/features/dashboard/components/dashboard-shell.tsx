'use client'

import type { ReactNode } from 'react'

interface DashboardShellProps {
  title: string
  description: string
  children: ReactNode
  headerRight?: ReactNode
}

export function DashboardShell({
  title,
  description,
  children,
  headerRight,
}: DashboardShellProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Sayfa Başlığı */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-900/40 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">{description}</p>
        </div>
        {headerRight && <div className="shrink-0">{headerRight}</div>}
      </div>

      {/* İçerik */}
      <div className="space-y-6">{children}</div>
    </div>
  )
}
