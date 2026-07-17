'use client'

import { useState, useMemo, useEffect } from 'react'
import type { WorkflowInstance, WorkflowStepInstance } from '@/types/domain'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { progressWorkflowStep } from '@/lib/workflows/progress-workflow'
import { getWorkflowHistoryByInstanceId, incrementInstanceProgress, cancelWorkflowInstance, deleteWorkflowInstance, updateWorkflowStepInstance } from '@/lib/storage/local-workflow-instance-store'
import { getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { TaskDeliveryModal } from '@/components/shared/task-delivery-modal'
import { WorkflowStepList } from './workflow-step-list'
import { WorkflowHistoryList } from './workflow-history-list'
import {
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  ListTodo,
  Plus,
  Minus,
  TrendingUp,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface InstanceCardProps {
  instance: WorkflowInstance
  steps: WorkflowStepInstance[]
  onProgress: () => void
}

export function WorkflowInstanceCard({ instance, steps, onProgress }: InstanceCardProps) {
  const [showSteps, setShowSteps] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [incrementBy, setIncrementBy] = useState(1)
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'delete' | null>(null)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)

  // Sayaçlı singleton mi?
  const isCounterMode = instance.targetCount != null && instance.targetCount > 1

  // 1. Calculate step metrics
  const completedSteps = useMemo(() => {
    return steps.filter((s) => s.status === 'completed' || s.status === 'skipped').length
  }, [steps])

  const totalSteps = steps.length

  // Sayaç modunda ilerleme oranı hedef üzerinden hesaplanır
  const progressPct = isCounterMode
    ? Math.round(((instance.progressCount ?? 0) / instance.targetCount!) * 100)
    : totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  // 2. Find active step
  const activeStep = useMemo(() => {
    return steps.find((s) => s.status === 'active')
  }, [steps])

  // 3. Resolve status badge colors
  const statusConfig = {
    completed: {
      label: 'Tamamlandı',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    },
    in_progress: {
      label: 'Devam Ediyor',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
      icon: <Play className="h-4 w-4 text-blue-500 animate-pulse" />,
    },
    waiting_approval: {
      label: 'Onay Bekliyor',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      icon: <Clock className="h-4 w-4 text-amber-500" />,
    },
    cancelled: {
      label: 'İptal Edildi',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
      icon: <XCircle className="h-4 w-4 text-rose-500" />,
    },
    pending: {
      label: 'Beklemede',
      badge: 'bg-neutral-500/10 text-neutral-400 border-neutral-800',
      icon: <Clock className="h-4 w-4 text-neutral-500" />,
    },
  }

  const currentStatus = statusConfig[instance.status] || statusConfig.pending

  // 4. Handle progression action
  const handleAction = async (action: 'complete' | 'skip' | 'cancel') => {
    if (!activeStep) return
    if (action === 'complete') {
      setShowDeliveryModal(true)
    } else {
      setIsSubmitting(true)
      try {
        await progressWorkflowStep({
          workflowInstanceId: instance.id,
          stepInstanceId: activeStep.id,
          action,
          actorEmployeeId: getActiveEmployeeId() || 'system',
        })

        const actionLabels = {
          complete: 'tamamlandı',
          skip: 'geçildi',
          cancel: 'iptal edildi',
        }

        toast.success(`Adım başarıyla ${actionLabels[action]}.`, {
          description: `"${activeStep.title}" adımı güncellendi.`,
        })

        // Trigger re-render in parent container
        onProgress()
      } catch (err: any) {
        toast.error('Adım ilerletilemedi', {
          description: err.message,
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleDeliveryConfirm = async (deliveryNote: string, links: string[], files: string[]) => {
    if (!activeStep) return
    setShowDeliveryModal(false)
    setIsSubmitting(true)
    try {
      const formattedNote = `\n\n[Teslim Açıklaması]: ${deliveryNote}` +
        (links.length > 0 ? `\n[Fotoğraf/Görsel Bağlantıları]: ${links.join(', ')}` : '') +
        (files.length > 0 ? `\n[Dosya Bağlantıları]: ${files.join(', ')}` : '')

      const updatedStep = {
        ...activeStep,
        description: `${activeStep.description}${formattedNote}`
      }
      await updateWorkflowStepInstance(updatedStep)

      await progressWorkflowStep({
        workflowInstanceId: instance.id,
        stepInstanceId: activeStep.id,
        action: 'complete',
        actorEmployeeId: getActiveEmployeeId() || 'system',
      })

      toast.success('Görev teslim edildi ve tamamlandı.', {
        description: `"${activeStep.title}" adımı güncellendi.`,
      })

      onProgress()
    } catch (err: any) {
      toast.error('Görev tamamlanamadı', {
        description: err.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const [historyLogs, setHistoryLogs] = useState<any[]>([])

  useEffect(() => {
    if (!showHistory) return
    async function loadHistory() {
      const logs = await getWorkflowHistoryByInstanceId(instance.id)
      logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setHistoryLogs(logs)
    }
    loadHistory()
  }, [showHistory, instance.id])

  // 6. Sayaç artırma handler
  const handleIncrement = async () => {
    if (isSubmitting || instance.status === 'completed') return
    setIsSubmitting(true)
    try {
      const result = await incrementInstanceProgress(instance.id, incrementBy)
      if (!result) return
      if (result.completed) {
        toast.success('Görev tamamlandı! Hedefe ulaşıldı.', {
          description: `Toplam ${result.newCount} paylaşım gerçekleştirildi.`,
        })
      } else {
        toast.success(`+${incrementBy} eklendi`, {
          description: `${result.newCount} / ${instance.targetCount} paylaşım tamamlandı.`,
        })
      }
      onProgress()
    } catch (err: any) {
      toast.error('Sayaç güncellenemedi', { description: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelInstance = async () => {
    try {
      await cancelWorkflowInstance(instance.id)
      toast.success('İş akışı iptal edildi.', {
        description: `"${instance.title}" akışı ve tüm bekleyen adımları iptal edildi.`,
      })
      setConfirmAction(null)
      onProgress()
    } catch (err: any) {
      toast.error('İptal işlemi başarısız', { description: err.message })
    }
  }

  const handleDeleteInstance = async () => {
    try {
      await deleteWorkflowInstance(instance.id)
      toast.success('İş akışı silindi.', {
        description: `"${instance.title}" akışı kalıcı olarak silindi.`,
      })
      setConfirmAction(null)
      onProgress()
    } catch (err: any) {
      toast.error('Silme işlemi başarısız', { description: err.message })
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
    <div
      className={cn(
        'rounded-xl border bg-neutral-900/10 hover:bg-neutral-900/15 border-neutral-800 p-4 space-y-4 transition-all duration-300 backdrop-blur-sm',
        instance.status === 'completed' && 'border-emerald-500/20 bg-emerald-500/[0.01]'
      )}
    >
      {/* Üst Kısım: Başlık, Durum, İlerleme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/60">
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            {currentStatus.icon}
            {instance.title}
          </h4>
          <span className="text-[10px] text-muted-foreground block">
            ID: {instance.id.slice(0, 8)}... | Şablon ID: {instance.workflowTemplateId}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="outline" className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider', currentStatus.badge)}>
            {currentStatus.label}
          </Badge>

          <span className="text-xs font-bold text-muted-foreground bg-muted/20 px-2 py-0.5 rounded shrink-0">
            {completedSteps} / {totalSteps} Adım
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-1.5 w-full bg-neutral-800/80 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              instance.status === 'completed'
                ? 'bg-emerald-500'
                : progressPct > 0
                ? 'bg-blue-500'
                : 'bg-neutral-700'
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Aktif Adım ve Aksiyonlar */}
      {isCounterMode ? (
        // --- SAYAÇ MODU ---
        instance.status === 'completed' ? (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center text-xs text-emerald-400 font-medium">
            ✅ Hedef tamamlandı — {instance.progressCount} / {instance.targetCount} paylaşım
          </div>
        ) : (
          <div className="bg-neutral-950/20 border border-neutral-800/50 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block">Paylaşım Sayacı (Takip)</span>
                <span className="text-lg font-black text-foreground">
                  {instance.progressCount ?? 0}
                  <span className="text-xs text-muted-foreground font-normal"> / {instance.targetCount}</span>
                </span>
              </div>
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>

            {/* Mini progress bar */}
            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )
      ) : instance.status !== 'completed' && activeStep ? (
        <div className="bg-neutral-950/20 border border-neutral-800/50 rounded-xl p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/40 pb-2">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-0.5">Aktif Adım</span>
              <span className="text-xs font-bold text-foreground block">
                {activeStep.title}
              </span>
            </div>
            {activeStep.responsibilityRole && (
              <Badge variant="secondary" className="text-[10px] font-normal text-muted-foreground px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 self-start sm:self-auto">
                Sorumluluk: {roleLabels[activeStep.responsibilityRole] || activeStep.responsibilityRole}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleAction('skip')}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 font-semibold text-xs h-8 px-3 rounded-lg"
            >
              Geç
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => handleAction('cancel')}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-semibold text-xs h-8 px-3 rounded-lg"
            >
              İptal Et
            </Button>
          </div>
        </div>
      ) : instance.status === 'completed' ? (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center text-xs text-emerald-400 font-medium">
          İş akışı başarıyla tamamlandı.
        </div>
      ) : (
        <div className="bg-neutral-950/20 border border-neutral-850 rounded-xl p-3 text-center text-xs text-muted-foreground italic">
          Aktif adım bulunamadı.
        </div>
      )}

      {/* Accordion Kontrolleri */}
      <div className="flex items-center gap-1 text-xs pt-1 border-t border-neutral-900 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowSteps(!showSteps)}
          className="text-muted-foreground hover:text-foreground text-[11px] h-8 px-2 flex items-center gap-1.5"
        >
          <ListTodo className="h-3.5 w-3.5" />
          {showSteps ? 'Adımları Gizle' : 'Tüm Adımları Göster'}
          {showSteps ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className="text-muted-foreground hover:text-foreground text-[11px] h-8 px-2 flex items-center gap-1.5"
        >
          <History className="h-3.5 w-3.5" />
          {showHistory ? 'Geçmişi Gizle' : 'Aktivite Geçmişi'}
          {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>

        {/* Ayırıcı + İptal / Sil */}
        {instance.status !== 'completed' && instance.status !== 'cancelled' && (
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmAction(confirmAction === 'cancel' ? null : 'cancel')}
              className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 text-[11px] h-8 px-2 flex items-center gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              Akışı İptal Et
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmAction(confirmAction === 'delete' ? null : 'delete')}
              className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 text-[11px] h-8 px-2 flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Sil
            </Button>
          </div>
        )}

        {/* İptal edilmiş akış için sadece sil */}
        {instance.status === 'cancelled' && (
          <div className="ml-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmAction(confirmAction === 'delete' ? null : 'delete')}
              className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 text-[11px] h-8 px-2 flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Kalıcı Sil
            </Button>
          </div>
        )}
      </div>

      {/* Onay Paneli */}
      {confirmAction && (
        <div className="animate-in slide-in-from-top-2 duration-150 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-3.5 space-y-2.5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">
                {confirmAction === 'cancel'
                  ? 'Bu iş akışını iptal etmek istediğine emin misin?'
                  : 'Bu iş akışını kalıcı olarak silmek istediğine emin misin?'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {confirmAction === 'cancel'
                  ? 'Akış ve tüm bekleyen adımları "İptal Edildi" olarak işaretlenir. Geçmiş loglar korunur.'
                  : 'Akış, tüm adımları ve geçmiş logları kalıcı olarak silinir. Bu işlem geri alınamaz.'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmAction(null)}
              className="h-7 text-[11px] border-neutral-800"
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={confirmAction === 'cancel' ? handleCancelInstance : handleDeleteInstance}
              className={cn(
                'h-7 text-[11px] text-white font-bold',
                confirmAction === 'cancel'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              )}
            >
              {confirmAction === 'cancel' ? 'Evet, İptal Et' : 'Evet, Kalıcı Sil'}
            </Button>
          </div>
        </div>
      )}

      {/* Adımlar Listesi Panel */}
      {showSteps && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          <WorkflowStepList steps={steps} />
        </div>
      )}

      {/* Aktivite Geçmişi Panel */}
      {showHistory && (
        <div className="animate-in slide-in-from-top-2 duration-200 pt-1 border-t border-neutral-900/60">
          <WorkflowHistoryList historyLogs={historyLogs} />
        </div>
      )}
      {/* Görev Teslim Modalı */}
      {showDeliveryModal && activeStep && (
        <TaskDeliveryModal
          isOpen={showDeliveryModal}
          onClose={() => setShowDeliveryModal(false)}
          onConfirm={handleDeliveryConfirm}
          taskTitle={activeStep.title}
        />
      )}
    </div>
  )
}

