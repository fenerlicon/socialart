'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Brand } from '@/types/domain'
import { BRAND_STATUS_LABELS } from '@/types/domain'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  Users,
  Activity,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BrandCardProps {
  brand: Brand
  managerName: string
  onEdit: () => void
  onDelete: () => void
}

export function BrandCard({ brand, managerName, onEdit, onDelete }: BrandCardProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  // Calculated overall metrics (excluding cancelled items)
  const stats = useMemo(() => {
    const plan = brand.operationPlan || []
    if (!plan.length) return { totalProgress: 0, activeItemsCount: 0 }
    
    let totalTarget = 0
    let totalCompleted = 0
    let activeItemsCount = 0
    
    plan.forEach((item) => {
      if (item.status !== 'cancelled') {
        totalTarget += item.target
        totalCompleted += Math.min(item.target, item.completed)
        activeItemsCount++
      }
    })

    const totalProgress = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0
    return { totalProgress, activeItemsCount }
  }, [brand.operationPlan])

  const teamCount = brand.brandAssignments?.length || 0

  const handleCardClick = () => {
    router.push(`/brands/${brand.id}`)
  }

  // Helper to map package key to label
  const packageLabels: Record<string, string> = {
    eko: 'Eko Paket',
    business: 'Business Paket',
    booster: 'Booster Paket',
  }

  const packageColors: Record<string, string> = {
    eko: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    business: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    booster: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  }

  return (
    <div
      onClick={handleCardClick}
      className="relative rounded-2xl border bg-card/40 p-5 space-y-4 shadow-sm hover:border-neutral-700 transition-all duration-300 cursor-pointer group backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground group-hover:text-blue-400 transition-colors leading-tight">
            {brand.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <Badge
              variant="outline"
              className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', packageColors[brand.selectedPackageId])}
            >
              {packageLabels[brand.selectedPackageId] || brand.selectedPackageId}
            </Badge>
            <Badge
              variant={brand.status === 'active' ? 'default' : 'secondary'}
              className={cn(
                'text-[9px] font-semibold px-1.5 py-0.5 rounded-full border',
                brand.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
              )}
            >
              {BRAND_STATUS_LABELS[brand.status]}
            </Badge>
          </div>
        </div>

        {/* Action Dropdown Menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-neutral-800/40 rounded-full"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-36 rounded-xl border bg-card/95 shadow-lg p-1.5 z-10 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-lg">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  router.push(`/brands/${brand.id}`)
                }}
                className="w-full text-left text-[11px] font-semibold px-2.5 py-2 hover:bg-muted/60 hover:text-foreground text-muted-foreground rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Markayı Aç
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onEdit()
                }}
                className="w-full text-left text-[11px] font-semibold px-2.5 py-2 hover:bg-muted/60 hover:text-foreground text-muted-foreground rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5 text-blue-500" /> Düzenle
              </button>
              <div className="h-px bg-neutral-800 my-1" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onDelete()
                }}
                className="w-full text-left text-[11px] font-semibold px-2.5 py-2 hover:bg-rose-500/10 hover:text-rose-500 text-rose-500 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Sil
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Rows */}
      <div className="space-y-2 border-y border-neutral-800/40 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          <span className="truncate">
            Yönetici: <strong className="text-foreground">{managerName}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          <span>Başlangıç: {brand.startDate}</span>
        </div>
      </div>

      {/* Stats Badges */}
      <div className="flex items-center gap-3 text-xs font-semibold text-foreground">
        <div className="flex items-center gap-1 bg-muted/10 px-2 py-1 rounded-lg border border-neutral-800/30">
          <Activity className="h-3 w-3 text-blue-500" />
          <span>{stats.activeItemsCount} Kalem</span>
        </div>
        <div className="flex items-center gap-1 bg-muted/10 px-2 py-1 rounded-lg border border-neutral-800/30">
          <Users className="h-3 w-3 text-purple-500" />
          <span>{teamCount} Çalışan</span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-muted-foreground font-medium">Genel İlerleme</span>
          <span className="text-foreground">%{stats.totalProgress}</span>
        </div>
        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
            style={{ width: `${stats.totalProgress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
