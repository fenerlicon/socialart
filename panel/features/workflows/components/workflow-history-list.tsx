'use client'

import type { WorkflowHistory } from '@/types/domain'
import { Calendar, User, Activity } from 'lucide-react'

interface HistoryListProps {
  historyLogs: WorkflowHistory[]
}

export function WorkflowHistoryList({ historyLogs }: HistoryListProps) {
  if (historyLogs.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic py-2">
        Henüz bir aktivite kaydı bulunmuyor.
      </p>
    )
  }

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return ''
    }
  }

  // Durum etiket haritası
  const statusLabels: Record<string, string> = {
    pending: 'Bekliyor',
    active: 'Aktif',
    completed: 'Tamamlandı',
    skipped: 'Geçildi',
    cancelled: 'İptal Edildi',
    in_progress: 'Yapılıyor',
  }

  const actionLabels: Record<string, string> = {
    complete: 'Tamamladı',
    skip: 'Geçti',
    cancel: 'İptal Etti',
    activate: 'Aktifleştirildi',
    start: 'Başlatıldı',
  }

  return (
    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
      {historyLogs.map((log) => (
        <div
          key={log.id}
          className="flex items-start gap-2.5 p-2 rounded-lg bg-neutral-900/35 border border-neutral-800/40 text-[11px]"
        >
          <Activity className="h-3.5 w-3.5 text-neutral-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <User className="h-3 w-3 text-neutral-400" />
                {log.actorEmployeeId === 'system' ? 'Sistem' : log.actorEmployeeId || 'Kullanıcı'}
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Calendar className="h-3 w-3" />
                {formatDate(log.createdAt)} {formatTime(log.createdAt)}
              </span>
            </div>
            <p className="text-muted-foreground text-xs leading-normal">
              Adımı <span className="font-medium text-foreground">{actionLabels[log.action] || log.action}</span>.{' '}
              Durum Değişimi:{' '}
              <span className="line-through text-muted-foreground/60">{statusLabels[log.fromStatus] || log.fromStatus}</span>
              {' '}→{' '}
              <span className="text-foreground font-semibold bg-neutral-800 px-1 py-0.5 rounded text-[10px]">
                {statusLabels[log.toStatus] || log.toStatus}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
