'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Employee } from '@/types/domain'
import {
  EMPLOYEE_STATUS_LABELS,
  WORK_LOCATION_STATUS_LABELS,
} from '@/types/domain'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Lock,
  Mail,
  MapPin,
  Shield,
  Briefcase,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmployeeCardProps {
  employee: Employee
  brandAssignmentCount: number
  onDeactivate: () => void
  onDelete: () => void
}

const ROLE_PACKAGE_LABELS: Record<string, string> = {
  'operasyon-yonetimi': 'Operasyon Yönetimi',
  'strateji-musteri-yonetimi': 'Strateji & Müşteri Yönetimi',
  'dijital-pazarlama': 'Dijital Pazarlama',
  'sosyal-medya-yonetimi': 'Sosyal Medya Yönetimi',
  'kreatif-yonetim': 'Kreatif Yönetim',
  'kreatif-direktor': 'Kreatif Direktör',
  'grafik-tasarim': 'Grafik Tasarım',
  'video-kurgu': 'Video Kurgu',
  'fotograf-uretimi': 'Fotoğraf Üretimi',
  'video-uretimi': 'Video Üretimi',
}

export function EmployeeCard({
  employee,
  brandAssignmentCount,
  onDeactivate,
  onDelete,
}: EmployeeCardProps) {
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

  const handleCardClick = () => {
    router.push(`/employees/${employee.id}`)
  }

  // Count overrides
  const overrideCount = useMemo(() => {
    if (!employee.permissionOverrides) return 0
    return Object.keys(employee.permissionOverrides).length
  }, [employee.permissionOverrides])

  // Count teams/responsibilities
  const teamCount = employee.teamIds?.length || 0

  // Status badges color styling
  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    probation: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    intern: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    part_time: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    freelance: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    inactive: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  }

  const locationColors: Record<string, string> = {
    office: 'bg-neutral-800 text-neutral-300 border-neutral-700',
    remote: 'bg-blue-950 text-blue-300 border-blue-900',
    field: 'bg-amber-950 text-amber-300 border-amber-900',
    hybrid: 'bg-purple-950 text-purple-300 border-purple-900',
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
            {employee.fullName}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">{employee.title || 'Ünvansız'}</p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Badge
              variant="outline"
              className={cn(
                'text-[9px] font-semibold px-2 py-0.5 rounded-full border',
                statusColors[employee.employeeStatus] || 'bg-neutral-500/10 text-neutral-400'
              )}
            >
              {EMPLOYEE_STATUS_LABELS[employee.employeeStatus] || employee.employeeStatus}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'text-[9px] font-semibold px-2 py-0.5 rounded-full border',
                locationColors[employee.workLocationStatus] || 'bg-neutral-500/10 text-neutral-400'
              )}
            >
              {WORK_LOCATION_STATUS_LABELS[employee.workLocationStatus] || employee.workLocationStatus}
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
                  router.push(`/employees/${employee.id}`)
                }}
                className="w-full text-left text-[11px] font-semibold px-2.5 py-2 hover:bg-muted/60 hover:text-foreground text-muted-foreground rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Çalışanı Aç
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  router.push(`/employees/${employee.id}/edit`)
                }}
                className="w-full text-left text-[11px] font-semibold px-2.5 py-2 hover:bg-muted/60 hover:text-foreground text-muted-foreground rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" /> Düzenle
              </button>
              {employee.employeeStatus !== 'inactive' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    onDeactivate()
                  }}
                  className="w-full text-left text-[11px] font-semibold px-2.5 py-2 hover:bg-amber-500/10 hover:text-amber-500 text-amber-500 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Lock className="h-3.5 w-3.5" /> Pasife Al
                </button>
              )}
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
          <Mail className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          <span className="truncate">{employee.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          <span className="truncate">
            Rol: <strong className="text-foreground">{ROLE_PACKAGE_LABELS[employee.rolePackageId] || employee.rolePackageId}</strong>
          </span>
        </div>
      </div>

      {/* Bottom Stats Grid */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
        <div className="bg-muted/10 p-2 rounded-xl border border-neutral-800/30 space-y-0.5">
          <span className="block text-[9px] uppercase font-bold text-muted-foreground">Sorumluluk</span>
          <span className="text-sm font-bold text-foreground">{teamCount} Alan</span>
        </div>
        <div className="bg-muted/10 p-2 rounded-xl border border-neutral-800/30 space-y-0.5">
          <span className="block text-[9px] uppercase font-bold text-muted-foreground">Override</span>
          <span className="text-sm font-bold text-foreground">{overrideCount} Yetki</span>
        </div>
        <div className="bg-muted/10 p-2 rounded-xl border border-neutral-800/30 space-y-0.5">
          <span className="block text-[9px] uppercase font-bold text-muted-foreground">Marka</span>
          <span className="text-sm font-bold text-foreground">{brandAssignmentCount} Atama</span>
        </div>
      </div>
    </div>
  )
}
