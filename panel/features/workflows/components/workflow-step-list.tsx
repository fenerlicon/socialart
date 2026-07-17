'use client'

import type { WorkflowStepInstance } from '@/types/domain'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Check, Play, Square, AlertTriangle } from 'lucide-react'

interface StepListProps {
  steps: WorkflowStepInstance[]
}

export function WorkflowStepList({ steps }: StepListProps) {
  const formatTime = (isoString?: string) => {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
    } catch {
      return ''
    }
  }

  const getStatusStyle = (status: WorkflowStepInstance['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: <Check className="h-3.5 w-3.5 text-emerald-500" />,
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
          label: 'Tamamlandı',
          bgColor: 'bg-emerald-500/[0.01]',
        }
      case 'active':
        return {
          icon: <Play className="h-3.5 w-3.5 text-blue-500 animate-pulse" />,
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
          label: 'Aktif',
          bgColor: 'bg-blue-500/[0.02]',
        }
      case 'skipped':
        return {
          icon: <Square className="h-3.5 w-3.5 text-amber-500" />,
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
          label: 'Geçildi',
          bgColor: 'bg-amber-500/[0.01]',
        }
      case 'cancelled':
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />,
          badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
          label: 'İptal',
          bgColor: 'bg-rose-500/[0.01]',
        }
      case 'pending':
      default:
        return {
          icon: <Square className="h-3.5 w-3.5 text-neutral-500" />,
          badgeColor: 'bg-neutral-500/10 text-neutral-400 border-neutral-800',
          label: 'Bekliyor',
          bgColor: '',
        }
    }
  }

  const roleLabels: Record<string, string> = {
    operation: 'Operasyon',
    strategy: 'Strateji',
    digital_marketing: 'Dijital Pazarlama',
    social_media: 'Sosyal Medya',
    creative_management: 'Kreatif Yönetim',
    creative_director: 'Kreatif Direktör',
    graphic_design: 'Grafik Tasarım',
    video_editing: 'Video Kurgu',
    photography: 'Fotoğraf',
    videography: 'Video',
    reporting: 'Raporlama',
    custom: 'Özel Sorumluluk',
  }

  return (
    <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950/20">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-800/80 bg-neutral-900/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <th className="p-2.5 w-12 text-center">Sıra</th>
              <th className="p-2.5">Adım Adı</th>
              <th className="p-2.5 w-28">Sorumluluk</th>
              <th className="p-2.5 w-24">Durum</th>
              <th className="p-2.5 w-24 text-center">Başlangıç</th>
              <th className="p-2.5 w-24 text-center">Bitiş</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900/60">
            {steps.map((step) => {
              const styles = getStatusStyle(step.status)
              return (
                <tr
                  key={step.id}
                  className={cn(
                    'transition-colors hover:bg-neutral-900/20',
                    styles.bgColor
                  )}
                >
                  {/* Sıra */}
                  <td className="p-2.5 text-center font-bold text-muted-foreground">
                    {step.order}
                  </td>

                  {/* Başlık & Açıklama */}
                  <td className="p-2.5">
                    <div className="flex items-center gap-2">
                      {styles.icon}
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground text-xs block">
                          {step.title}
                        </span>
                        {step.description && (
                          <span className="text-[10px] text-muted-foreground block truncate max-w-[200px]" title={step.description}>
                            {step.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Sorumluluk */}
                  <td className="p-2.5 text-muted-foreground font-medium">
                    {step.responsibilityRole ? roleLabels[step.responsibilityRole] || step.responsibilityRole : '-'}
                  </td>

                  {/* Durum */}
                  <td className="p-2.5">
                    <Badge variant="outline" className={cn('px-1.5 py-0 rounded text-[9px] font-medium uppercase shrink-0', styles.badgeColor)}>
                      {styles.label}
                    </Badge>
                  </td>

                  {/* Başlangıç */}
                  <td className="p-2.5 text-center text-muted-foreground whitespace-nowrap">
                    {step.startedAt ? (
                      <>
                        <span className="block">{formatDate(step.startedAt)}</span>
                        <span className="text-[9px] opacity-75">{formatTime(step.startedAt)}</span>
                      </>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* Bitiş */}
                  <td className="p-2.5 text-center text-muted-foreground whitespace-nowrap">
                    {step.completedAt ? (
                      <>
                        <span className="block">{formatDate(step.completedAt)}</span>
                        <span className="text-[9px] opacity-75">{formatTime(step.completedAt)}</span>
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
