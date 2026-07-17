'use client'

import { useRouter } from 'next/navigation'
import type { Notification } from '@/types/domain'
import { markNotificationAsRead } from '@/lib/storage/local-notification-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  Check,
  ExternalLink,
  Clock,
  Play,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Building,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface CardProps {
  notification: Notification
  onMarkReadSuccess: () => void
}

export function NotificationCard({ notification, onMarkReadSuccess }: CardProps) {
  const router = useRouter()

  // Durum/tip simgeleri
  const getTypeConfig = (type: Notification['type']) => {
    switch (type) {
      case 'workflow_assigned':
      case 'step_activated':
        return {
          icon: <Play className="h-4 w-4 text-blue-400" />,
          colorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
          label: 'İş Akışı',
        }
      case 'handoff_requested':
        return {
          icon: <ArrowRightLeft className="h-4 w-4 text-amber-400 animate-pulse" />,
          colorClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          label: 'Paslama',
        }
      case 'handoff_accepted':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
          colorClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          label: 'Devir Kabul',
        }
      case 'handoff_rejected':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-rose-400" />,
          colorClass: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          label: 'Devir Red',
        }
      case 'workflow_completed':
      case 'cycle_completed':
      case 'operation_completed':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
          colorClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          label: 'Tamamlandı',
        }
      case 'approval_required':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-purple-400" />,
          colorClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
          label: 'Onay',
        }
      case 'system':
      default:
        return {
          icon: <Bell className="h-4 w-4 text-neutral-400" />,
          colorClass: 'bg-neutral-500/10 border-neutral-800 text-neutral-400',
          label: 'Sistem',
        }
    }
  }

  const config = getTypeConfig(notification.type)

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await markNotificationAsRead(notification.id)
    onMarkReadSuccess()
    toast.success('Bildirim okundu olarak işaretlendi.')
  }

  const handleAction = async () => {
    // 1. Mark as read on click
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id)
      onMarkReadSuccess()
    }

    // 2. Resolve link and navigate
    let path = '/dashboard'
    if (
      notification.relatedEntityType === 'workflow_step_instance' ||
      notification.relatedEntityType === 'handoff' ||
      notification.relatedEntityType === 'operation_plan_item'
    ) {
      path = '/my-work'
    } else if (notification.relatedEntityType === 'brand') {
      path = `/brands/${notification.relatedEntityId}`
    } else if (notification.relatedEntityType === 'operation_cycle') {
      path = '/brands'
    }

    router.push(path)
  }

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  return (
    <div
      onClick={handleAction}
      className={cn(
        'rounded-2xl border bg-card/25 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-neutral-700 cursor-pointer flex gap-4 items-start relative overflow-hidden group',
        !notification.isRead && 'border-blue-500/20 bg-blue-500/[0.005]'
      )}
    >
      {/* Okunmamış Parlama Efekti */}
      {!notification.isRead && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.03] rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Sol İkon */}
      <div className={cn('p-2.5 rounded-xl border shrink-0 z-10', config.colorClass)}>
        {config.icon}
      </div>

      {/* Orta Metin */}
      <div className="space-y-1.5 flex-1 z-10">
        <div className="flex items-center flex-wrap gap-2">
          <Badge
            variant="outline"
            className={cn('px-1.5 py-0 rounded text-[9px] font-bold uppercase tracking-wider', config.colorClass)}
          >
            {config.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(notification.createdAt)}
          </span>
          {!notification.isRead && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping inline-block" title="Okunmamış" />
          )}
        </div>

        <h4 className={cn('text-xs font-bold text-foreground', !notification.isRead && 'text-blue-400')}>
          {notification.title}
        </h4>
        <p className="text-[11px] text-muted-foreground leading-normal">
          {notification.message}
        </p>
      </div>

      {/* Sağ Aksiyon Butonları */}
      <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0 z-10 self-center">
        {!notification.isRead && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleMarkAsRead}
            className="h-8 w-8 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10 shrink-0"
            title="Okundu İşaretle"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-neutral-400 hover:text-foreground hover:bg-neutral-800 shrink-0"
          title="Aç"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
