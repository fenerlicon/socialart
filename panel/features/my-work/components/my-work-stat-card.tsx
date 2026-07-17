'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number
  icon: ReactNode
  description?: string
  colorClass?: string
}

export function MyWorkStatCard({
  title,
  value,
  icon,
  description,
  colorClass = 'text-blue-500 bg-blue-500/10 border-blue-500/25',
}: StatCardProps) {
  return (
    <div className="relative rounded-2xl border bg-card/45 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-neutral-700 hover:shadow-md flex items-center justify-between overflow-hidden group">
      {/* Background radial highlight */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-neutral-800/10 rounded-full group-hover:scale-125 transition-transform duration-500" />
      
      <div className="space-y-1.5 z-10">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-foreground tracking-tight">
            {value}
          </span>
        </div>
        {description && (
          <span className="text-[10px] text-muted-foreground block font-medium leading-normal">
            {description}
          </span>
        )}
      </div>

      <div className={cn('p-3 rounded-xl border shrink-0 z-10 shadow-sm transition-transform duration-300 group-hover:scale-105', colorClass)}>
        {icon}
      </div>
    </div>
  )
}
