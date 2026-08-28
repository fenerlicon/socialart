'use client'

import { useState, useEffect } from 'react'
import type { WorkflowInstance, WorkflowStepInstance, Employee } from '@/types/domain'
import { isCreativeProductionResponsibility } from '@/types/domain'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { progressWorkflowStep } from '@/lib/workflows/progress-workflow'
import { requestApproval, requestDeadlineExtension } from '@/lib/workflows/approval-workflow'
import { HandoffModal } from './handoff-modal'
import { TaskDetailDrawer } from './task-detail-drawer'
import { TaskDeliveryModal } from '@/components/shared/task-delivery-modal'
import { TaskFailureExplanationModal } from '@/components/shared/task-failure-explanation-modal'
import { getWorkflowStepInstances, updateWorkflowStepInstance, incrementInstanceProgress } from '@/lib/storage/local-workflow-instance-store'
import { getStoredApprovals } from '@/lib/storage/local-approval-store'
import { supabase } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import {
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRightLeft,
  Building,
  Layers,
  Sparkles,
  Plus,
  Minus,
  TrendingUp,
  Loader2,
  Eye,
  FileText,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CardProps {
  step: WorkflowStepInstance
  instance: WorkflowInstance
  brandName: string
  cycleLabel: string
  currentEmployeeId: string
  employees: Employee[]
  hasUnexplainedOverdue?: boolean
  onActionSuccess: () => void
}

export function MyWorkCard({
  step,
  instance,
  brandName,
  cycleLabel,
  currentEmployeeId,
  employees,
  hasUnexplainedOverdue = false,
  onActionSuccess,
}: CardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [incrementBy, setIncrementBy] = useState(1)
  const [showFailureModal, setShowFailureModal] = useState(false)

  const isOverdue = !['completed', 'skipped', 'cancelled'].includes(step.status) && (
    step.status === 'failed' || (step.dueDate ? new Date(step.dueDate).getTime() < Date.now() : false)
  )

  const handleIncrement = async () => {
    if (isSubmitting || instance.status === 'completed') return
    if (!isOverdue && hasUnexplainedOverdue) {
      toast.error('⚠️ Yeni İş Tamamlanamaz!', {
        description: 'Açıklaması yazılmamış tamamlanamayan işiniz bulunmaktadır. Lütfen önce geciken işinize açıklama yazınız.',
        duration: 6000,
      })
      return
    }
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
      onActionSuccess()
    } catch (err: any) {
      toast.error('Sayaç güncellenemedi', { description: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }
  const [showHandoffModal, setShowHandoffModal] = useState(false)
  const [siblingSteps, setSiblingSteps] = useState<WorkflowStepInstance[]>([])
  const [mounted, setMounted] = useState(false)
  const [showBriefModal, setShowBriefModal] = useState(false)
  const [briefInput, setBriefInput] = useState('')
  const [confirmWithoutBrief, setConfirmWithoutBrief] = useState(false)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [showExtensionModal, setShowExtensionModal] = useState(false)
  const [showDetailDrawer, setShowDetailDrawer] = useState(false)
  const [requestedDate, setRequestedDate] = useState('')
  const [extensionReason, setExtensionReason] = useState('')
  const [isSubmittingExtension, setIsSubmittingExtension] = useState(false)

  const [latestRevisionNote, setLatestRevisionNote] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    async function loadSiblingsAndRevision() {
      try {
        const allSteps = await getWorkflowStepInstances()
        const siblings = allSteps.filter(s => s.workflowInstanceId === instance.id)
        setSiblingSteps(siblings)

        if (step.approvalStatus === 'revision_requested') {
          const allApprovals = await getStoredApprovals()
          const revApproval = allApprovals
            .filter(a => a.workflowStepInstanceId === step.id && a.revisionNote)
            .sort((a, b) => new Date(b.revisedAt || b.createdAt).getTime() - new Date(a.revisedAt || a.createdAt).getTime())[0]
          if (revApproval && revApproval.revisionNote) {
            setLatestRevisionNote(revApproval.revisionNote)
          }
        }
      } catch (err) {
        console.error('Failed to load sibling steps:', err)
      }
    }
    loadSiblingsAndRevision()
  }, [instance.id, step.id, step.approvalStatus])

  const currentEmployee = employees.find(e => e.id === currentEmployeeId)
  const isManager = currentEmployee?.rolePackageId === 'operasyon-yonetimi' || currentEmployee?.rolePackageId === 'kreatif-yonetim' || currentEmployee?.teamIds.includes('merkezi-operasyon')

  const isBriefStep = step.title.toLowerCase().includes('brief') || 
                      step.workflowStepTemplateId.includes('brief') || 
                      step.title.toLowerCase().includes('toplantı')

  const briefStep = siblingSteps.find(s => 
    s.status === 'completed' && 
    (s.title.toLowerCase().includes('brief') || s.workflowStepTemplateId.includes('brief') || s.title.toLowerCase().includes('toplantı'))
  )
  
  const getBriefDetails = (desc: string) => {
    const briefMarker = '[Brief Detayları]:'
    const briefIndex = desc.indexOf(briefMarker)
    if (briefIndex !== -1) {
      return desc.substring(briefIndex + briefMarker.length).trim()
    }
    
    const deliveryMarker = '[Teslim Açıklaması]:'
    const deliveryIndex = desc.indexOf(deliveryMarker)
    if (deliveryIndex !== -1) {
      const content = desc.substring(deliveryIndex + deliveryMarker.length)
      const nextSectionIndex = content.indexOf('\n[')
      if (nextSectionIndex !== -1) {
        return content.substring(0, nextSectionIndex).trim()
      }
      return content.trim()
    }
    
    return null
  }
  
  const briefDetails = briefStep ? getBriefDetails(briefStep.description) : null

  // 1. Durum stil eşleştirmeleri
  const getStatusStyles = (status: WorkflowStepInstance['status']) => {
    if (step.approvalStatus === 'revision_requested') {
      return {
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        label: 'REVİZYON TALEP EDİLDİ',
        icon: <RotateCcw className="h-3.5 w-3.5 text-amber-400 animate-spin" />,
      }
    }

    switch (status) {
      case 'completed':
        return {
          badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          label: step.approvalPurpose === 'final_creative' ? 'FINAL ONAYLI' : 'Tamamlandı',
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
        }
      case 'active':
        return {
          badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          label: step.assignedEmployeeId ? 'ÜRETİMDE' : 'ATANMIŞ',
          icon: <Play className="h-3.5 w-3.5 text-blue-400 animate-pulse" />,
        }
      case 'waiting_approval':
        return {
          badge: 'bg-purple-500/15 text-purple-300 border-purple-500/35',
          label: 'REVIEW BEKLİYOR',
          icon: <Clock className="h-3.5 w-3.5 text-purple-400 animate-pulse" />,
        }
      case 'skipped':
        return {
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
          label: 'Geçildi',
          icon: <Clock className="h-3.5 w-3.5 text-amber-500" />,
        }
      case 'cancelled':
        return {
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
          label: 'İptal Edildi',
          icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />,
        }
      case 'failed':
        return {
          badge: 'bg-red-500/20 text-red-400 border-red-500/40',
          label: 'Tamamlanamadı / Gecikti',
          icon: <AlertTriangle className="h-3.5 w-3.5 text-red-500" />,
        }
      case 'pending':
      default:
        return {
          badge: 'bg-neutral-500/10 text-neutral-400 border-neutral-800',
          label: 'Önceki Adım Bekleniyor',
          icon: <Clock className="h-3.5 w-3.5 text-neutral-500" />,
        }
    }
  }

  const currentStatus = getStatusStyles(step.status)

  // 2. Sorumluluk Türkçe Etiketleri
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

  // 3. Aksiyon Metotları
  const handleAction = async (action: 'complete' | 'skip' | 'cancel', forcedBriefText?: string) => {
    setIsSubmitting(true)
    try {
      if (isBriefStep && action === 'complete' && forcedBriefText) {
        const updatedStep = {
          ...step,
          description: `${step.description}\n\n[Brief Detayları]:\n${forcedBriefText}`
        }
        await updateWorkflowStepInstance(updatedStep)
      }

      await progressWorkflowStep({
        workflowInstanceId: instance.id,
        stepInstanceId: step.id,
        action,
        actorEmployeeId: currentEmployeeId,
      })

      const actionText = {
        complete: 'tamamlandı',
        skip: 'geçildi',
        cancel: 'iptal edildi',
      }[action]

      toast.success(`İş adımı başarıyla ${actionText}.`, {
        description: `"${brandName}" markasının "${instance.title}" iş akışındaki "${step.title}" adımı güncellendi.`,
      })

      onActionSuccess()
    } catch (err: any) {
      toast.error('İş adımı güncellenemedi', {
        description: err.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeliveryConfirm = async (deliveryNote: string, links: string[], files: string[]) => {
    setShowDeliveryModal(false)
    setIsSubmitting(true)
    try {
      const formattedNote = `\n\n[Teslim Açıklaması]: ${deliveryNote}` +
        (links.length > 0 ? `\n[Fotoğraf/Görsel Bağlantıları]: ${links.join(', ')}` : '') +
        (files.length > 0 ? `\n[Dosya Bağlantıları]: ${files.join(', ')}` : '')

      const isCreative = isCreativeProductionResponsibility(step.responsibilityRole) || step.responsibilityRole === 'graphic_design' || step.responsibilityRole === 'video_editing'
      const shouldRequestApproval = step.requiresApproval || isCreative || step.approvalPurpose === 'final_creative'

      const updatedStep = {
        ...step,
        description: `${step.description}${formattedNote}`,
        requiresApproval: shouldRequestApproval ? true : step.requiresApproval,
        approvalPurpose: shouldRequestApproval ? (step.approvalPurpose || 'final_creative') : step.approvalPurpose,
        creativeCount: isCreative ? (step.creativeCount && step.creativeCount >= 1 ? step.creativeCount : 1) : step.creativeCount,
      }
      await updateWorkflowStepInstance(updatedStep)

      if (shouldRequestApproval) {
        await requestApproval({
          workflowInstanceId: instance.id,
          stepInstanceId: step.id,
          requestedByEmployeeId: currentEmployeeId,
          note: deliveryNote || 'Kreatif teslim edildi, onay talep ediliyor.',
          deliveryLinks: [...links, ...files],
        })

        toast.success('Görev teslim edildi ve Art Director onayına gönderildi.', {
          description: `"${brandName}" markasının "${instance.title}" iş akışındaki "${step.title}" adımı onaya sunuldu.`,
        })
      } else {
        await progressWorkflowStep({
          workflowInstanceId: instance.id,
          stepInstanceId: step.id,
          action: 'complete',
          actorEmployeeId: currentEmployeeId,
        })

        toast.success('Görev teslim edildi ve tamamlandı.', {
          description: `"${brandName}" markasının "${instance.title}" iş akışındaki "${step.title}" adımı güncellendi.`,
        })
      }

      onActionSuccess()
    } catch (err: any) {
      toast.error('Görev teslim edilemedi', { description: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteClick = () => {
    if (!isOverdue && hasUnexplainedOverdue) {
      toast.error('⚠️ Yeni İş Tamamlanamaz!', {
        description: 'Açıklaması yazılmamış tamamlanamayan işiniz bulunmaktadır. Lütfen önce geciken işinize açıklama yazınız.',
        duration: 6000,
      })
      return
    }
    setShowDeliveryModal(true)
  }

  const handleSendToApproval = async () => {
    handleCompleteClick()
  }

  const handlePasla = () => {
    setShowHandoffModal(true)
  }

  const handleRequestExtensionSubmit = async () => {
    if (!requestedDate) {
      toast.error('Lütfen talep edilen yeni tarihi seçiniz.')
      return
    }
    if (!extensionReason.trim()) {
      toast.error('Lütfen süre uzatma gerekçenizi belirtiniz.')
      return
    }

    setIsSubmittingExtension(true)
    try {
      await requestDeadlineExtension({
        workflowInstanceId: instance.id,
        stepInstanceId: step.id,
        requestedByEmployeeId: currentEmployeeId,
        requestedDate: requestedDate,
        reason: extensionReason.trim(),
      })

      toast.success('Süre uzatımı talebiniz yöneticinize iletildi.', {
        description: `Talep edilen yeni tarih: ${formatDateTime(requestedDate)}`,
      })
      setShowExtensionModal(false)
      setRequestedDate('')
      setExtensionReason('')
      onActionSuccess()
    } catch (err: any) {
      toast.error('Süre uzatımı talebi iletilemedi', {
        description: err.message,
      })
    } finally {
      setIsSubmittingExtension(false)
    }
  }

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 shadow-sm backdrop-blur-md transition-all duration-300 space-y-4 relative overflow-hidden group',
        isOverdue
          ? 'border-red-500/50 bg-red-950/15 ring-1 ring-red-500/20 shadow-lg shadow-red-950/20'
          : step.status === 'active'
          ? 'border-blue-500/20 bg-blue-500/[0.005]'
          : step.status === 'completed'
          ? 'border-emerald-500/20 bg-emerald-500/[0.003]'
          : 'border-neutral-900/80 bg-card/25 hover:border-neutral-700'
      )}
    >
      {/* Background soft glow */}
      {isOverdue ? (
        <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      ) : step.status === 'active' ? (
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      ) : null}

      {/* Üst Satır: Marka, Dönem ve İş Akışı */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-neutral-900">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <Building className="h-3.5 w-3.5 text-neutral-500" />
            <span>{brandName}</span>
            <span className="text-neutral-700">•</span>
            <Layers className="h-3.5 w-3.5 text-neutral-500" />
            <span>{cycleLabel}</span>
          </div>
          <h4
            className="text-sm font-black text-foreground flex items-center gap-2 mt-1 cursor-pointer hover:text-blue-400 transition-colors"
            onClick={() => setShowDetailDrawer(true)}
            title="Detayları görüntüle"
          >
            <Sparkles className="h-4 w-4 text-neutral-500 shrink-0" />
            {instance.title}
          </h4>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {(() => {
            const priorityMatch = step.description ? step.description.match(/\[Öncelik\]:\s*(.*?)(?=\n\[|$)/) : null
            const priorityText = priorityMatch ? priorityMatch[1].trim() : null
            if (!priorityText) return null
            const isUrgent = priorityText.toLowerCase().includes('acil') || priorityText.toLowerCase().includes('kritik')
            const isHigh = priorityText.toLowerCase().includes('yüksek')
            const isMed = priorityText.toLowerCase().includes('normal') || priorityText.toLowerCase().includes('orta')
            return (
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded uppercase tracking-wider',
                  isUrgent ? 'bg-red-500/20 text-red-400 border-red-500/40 font-black animate-pulse' :
                  isHigh ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' :
                  isMed ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-medium' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-medium'
                )}
              >
                {isUrgent ? '🔥 Acil' : isHigh ? '⚡ Yüksek' : isMed ? 'Normal' : 'Düşük'}
              </Badge>
            )
          })()}
          {isOverdue ? (
            <Badge
              variant="outline"
              className="bg-red-500/20 text-red-400 border-red-500/40 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1"
            >
              <AlertTriangle className="h-3 w-3" />
              VAKTİ GEÇTİ / TAMAMLANAMADI
            </Badge>
          ) : (
            <>
              {step.creativeCount !== undefined && step.creativeCount !== null && (
                <Badge variant="outline" className="bg-purple-950/40 text-purple-300 border-purple-700/50 text-[10px] font-bold">
                  🎨 {step.creativeCount} Kreatif
                </Badge>
              )}
              {currentEmployee && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[9px] font-bold px-1.5 py-0',
                    currentEmployee.employmentType === 'freelance'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  )}
                >
                  {currentEmployee.employmentType === 'freelance' ? 'Freelance' : 'Tam Zamanlı'}
                </Badge>
              )}
              {step.handoffStatus === 'pending' && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-400 border-amber-500/25 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse"
                >
                  Paslama Bekliyor
                </Badge>
              )}
              <Badge
                variant="outline"
                className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider', currentStatus.badge)}
              >
                {currentStatus.label}
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Orta Satır: Aktif Adım ve Sorumluluk */}
      <div className="grid gap-3 sm:grid-cols-2 bg-neutral-950/20 rounded-xl p-3 border border-neutral-900/60 text-xs">
        <div>
          <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">İş Adımı</span>
          <span className="font-bold text-foreground flex items-center gap-1.5">
            {isOverdue ? <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> : currentStatus.icon}
            {step.title}
          </span>
          {step.description && (
            <span className="text-[10px] text-muted-foreground block mt-0.5 truncate max-w-[200px]" title={step.description}>
              {step.description}
            </span>
          )}
        </div>

        <div>
          <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Sorumluluk Rolü</span>
          <span className="font-semibold text-foreground">
            {step.responsibilityRole ? roleLabels[step.responsibilityRole] || step.responsibilityRole : 'Operasyon'}
          </span>
        </div>
      </div>

      {/* Art Director Revizyon Notu Bannerı */}
      {step.approvalStatus === 'revision_requested' && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3.5 text-xs space-y-1.5 animate-in fade-in duration-300">
          <div className="flex items-center gap-1.5 text-amber-300 font-extrabold">
            <RotateCcw className="h-4 w-4 text-amber-400" />
            <span>ART DIRECTOR REVİZYON NOTU</span>
          </div>
          <p className="text-amber-200/90 whitespace-pre-wrap leading-relaxed bg-neutral-950/50 p-2.5 rounded-lg border border-amber-900/40">
            {latestRevisionNote || 'Revizyon talep edildi. Lütfen güncellemeleri tamamlayıp tekrar onaya gönderiniz.'}
          </p>
        </div>
      )}

      {/* Vaktinde Tamamlanamama / Gecikme Açıklama Alanı */}
      {isOverdue && (
        <div
          className={cn(
            "rounded-xl border p-3.5 text-xs space-y-2 animate-in fade-in duration-300",
            step.failureReason
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/30 border-red-500/40 text-red-300"
          )}
        >
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              {step.failureReason ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Gecikme Açıklaması İletildi</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
                  <span className="text-red-400">Bu iş vaktinde tamamlanamadı (Açıklama Zorunludur)</span>
                </>
              )}
            </span>
            {step.failureExplanationAt && (
              <span className="text-[10px] text-muted-foreground font-normal">
                {formatDateTime(step.failureExplanationAt)}
              </span>
            )}
          </div>

          {step.failureReason ? (
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-xs bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-850">
              &ldquo;{step.failureReason}&rdquo;
            </p>
          ) : (
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Bu iş adımı teslim süresi içinde tamamlanamamıştır. Sistem kuralları gereği yeni bir iş tamamlayabilmek için gecikme nedenini açıklamanız gerekmektedir.
            </p>
          )}
        </div>
      )}

      {/* Sayaç / Hedef Sayaç Gösterimi (Eğer Sayaç Modundaysa) */}
      {!isOverdue && instance.targetCount && instance.targetCount > 1 && (
        <div className="bg-purple-950/10 border border-purple-900/30 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block">Paylaşım Sayacı</span>
              <span className="text-lg font-black text-foreground">
                {instance.progressCount ?? 0}
                <span className="text-xs text-muted-foreground font-normal"> / {instance.targetCount}</span>
              </span>
            </div>
            <TrendingUp className="h-4.5 w-4.5 text-purple-400" />
          </div>

          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round(((instance.progressCount ?? 0) / instance.targetCount) * 100))}%` }}
            />
          </div>

          {step.status === 'active' && (
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setIncrementBy(Math.max(1, incrementBy - 1))}
                disabled={incrementBy <= 1}
                className="w-7 h-7 rounded-lg border border-neutral-800 bg-neutral-900 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
              <Input
                type="number"
                min={1}
                max={instance.targetCount - (instance.progressCount ?? 0)}
                value={incrementBy}
                onChange={(e) => setIncrementBy(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-7 w-14 text-center text-xs bg-neutral-900/50 border-neutral-800 focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setIncrementBy(Math.min(incrementBy + 1, instance.targetCount! - (instance.progressCount ?? 0)))}
                className="w-7 h-7 rounded-lg border border-neutral-800 bg-neutral-900 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>

              <Button
                type="button"
                disabled={isSubmitting || step.handoffStatus === 'pending'}
                onClick={handleIncrement}
                className="flex-1 h-7 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow"
              >
                <Plus className="h-3.5 w-3.5" />
                {incrementBy} Paylaşıldı
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Onay Bekliyor Durum Uyarısı */}
      {!isOverdue && step.status === 'waiting_approval' && (
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.02] p-3 text-[11px] text-purple-400 flex items-start gap-2 animate-in fade-in duration-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-purple-400 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <span className="font-bold block">Onay Değerlendirmesi Bekleniyor</span>
            <span className="text-muted-foreground block leading-relaxed">
              Bu iş adımı onaya gönderilmiştir. Yetkili onay verene veya revize isteyene kadar diğer tüm işlemler (Tamamlama, Paslama vb.) kilitlenmiştir.
            </span>
          </div>
        </div>
      )}

      {/* Zaman Bilgileri */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground font-medium">
        {step.startedAt && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Başlangıç: {formatDateTime(step.startedAt)}
          </span>
        )}
        {step.completedAt && (
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500/80" />
            Bitiş: {formatDateTime(step.completedAt)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className={cn("h-3 w-3", isOverdue ? "text-red-400" : step.dueDate ? "text-blue-500/80" : "text-neutral-500")} />
          {step.dueDate ? `Teslim: ${formatDateTime(step.dueDate)}` : 'Teslim Tarihi Belirtilmedi'}
        </span>
      </div>

      {/* Sibling Brief Gösterimi */}
      {briefDetails && (
        <div
          className="rounded-xl border border-blue-500/20 bg-blue-500/[0.02] p-3.5 text-xs space-y-1.5 animate-in fade-in duration-300 cursor-pointer hover:border-blue-500/40 transition-colors"
          onClick={() => setShowDetailDrawer(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-blue-400 font-extrabold">
              <Sparkles className="h-4 w-4" />
              <span>İŞ AKIŞI BRİEFİ</span>
            </div>
            <span className="text-[9px] text-blue-500/60 font-bold uppercase tracking-wider">Detay için tıkla →</span>
          </div>
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-3">
            {briefDetails}
          </p>
        </div>
      )}

      {/* Detay Butonu */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowDetailDrawer(true)}
          className="flex items-center gap-1.5 text-[10px] text-neutral-500 hover:text-blue-400 font-bold uppercase tracking-wider transition-colors"
        >
          <Eye className="h-3 w-3" />
          Detayları Görüntüle
        </button>
      </div>

      {/* Aksiyon Butonları */}
      {isOverdue ? (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-900">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setShowFailureModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs h-8 px-4 rounded-lg flex items-center gap-1.5 shadow-md shadow-red-500/20"
            >
              <FileText className="h-3.5 w-3.5" />
              {step.failureReason ? 'Açıklamayı Düzenle' : '✍️ Açıklama Yaz (Zorunlu)'}
            </Button>
            {isManager && (
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmitting}
                onClick={() => handleAction('cancel')}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 font-semibold text-xs h-8 px-3 rounded-lg"
              >
                İptal Et
              </Button>
            )}
          </div>
          <span className="text-[11px] font-bold text-red-400">
            {step.failureReason ? '✅ Açıklama İletildi' : '❌ Açıklama Bekleniyor'}
          </span>
        </div>
      ) : step.status === 'active' ? (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-900">
          <div className="flex flex-wrap gap-2">
            {!(instance.targetCount && instance.targetCount > 1) && (
              step.requiresApproval ? (
                <Button
                  type="button"
                  disabled={isSubmitting || step.handoffStatus === 'pending'}
                  onClick={handleSendToApproval}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-8 px-4 rounded-lg flex items-center gap-1 shadow"
                >
                  {step.approvalStatus === 'revision_requested' ? 'Tekrar Onaya Gönder' : 'Onaya Gönder'}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isSubmitting || step.handoffStatus === 'pending'}
                  onClick={handleCompleteClick}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 px-4 rounded-lg"
                >
                  Tamamla
                </Button>
              )
            )}
            {isManager && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting || step.handoffStatus === 'pending'}
                  onClick={() => handleAction('skip')}
                  className="border-neutral-800 text-neutral-300 hover:bg-neutral-800 font-semibold text-xs h-8 px-3 rounded-lg"
                >
                  Geç
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting || step.handoffStatus === 'pending'}
                  onClick={() => handleAction('cancel')}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-semibold text-xs h-8 px-3 rounded-lg animate-in fade-in duration-100"
                >
                  İptal Et
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting || step.handoffStatus === 'pending'}
              onClick={() => setShowExtensionModal(true)}
              className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 font-semibold text-xs h-8 px-3 rounded-lg flex items-center gap-1 animate-in fade-in duration-100"
            >
              📅 Süre Uzatımı İste
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            disabled={step.handoffStatus === 'pending'}
            onClick={handlePasla}
            className="text-neutral-400 hover:text-foreground hover:bg-neutral-800 font-semibold text-xs h-8 px-3 rounded-lg flex items-center gap-1 disabled:opacity-50"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Pasla
          </Button>
        </div>
      ) : null}

      {/* Vaktinde Tamamlanamama Açıklama Modalı */}
      {mounted && showFailureModal && (
        <TaskFailureExplanationModal
          isOpen={showFailureModal}
          onClose={() => setShowFailureModal(false)}
          step={step}
          brandName={brandName}
          workflowTitle={instance.title}
          currentEmployeeId={currentEmployeeId}
          onSuccess={onActionSuccess}
        />
      )}

      {/* Paslama Modalı */}
      {mounted && showHandoffModal && (
        <HandoffModal
          step={step}
          instance={instance}
          brandName={brandName}
          currentEmployeeId={currentEmployeeId}
          employees={employees}
          onClose={() => setShowHandoffModal(false)}
          onSuccess={onActionSuccess}
        />
      )}

      {/* Brief Detayları Giriş Modalı */}
      {mounted && showBriefModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-900 w-full max-w-lg p-6 rounded-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Brief Detaylarını Girin
              </h3>
              <p className="text-xs text-muted-foreground">
                Görevi tamamlamadan önce bu marka için brief bilgilerini girmeniz gerekmektedir. Çekim ve tasarım ekibi bu briefi görecektir.
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                value={briefInput}
                onChange={(e) => {
                  setBriefInput(e.target.value)
                  setConfirmWithoutBrief(false)
                }}
                placeholder="Örn: Bu Reel videosunda yeni menü tanıtılacak. Gurme Bahçeşehir markası için kırmızı renk tonları ve şık yemek görselleri kullanılmalı..."
                className="w-full min-h-[140px] bg-neutral-900 border border-neutral-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>

            {confirmWithoutBrief && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.02] p-3 text-[11px] text-red-400 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5 animate-pulse" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Brief Girilmedi!</span>
                  <span className="text-muted-foreground block leading-relaxed">
                    Brief içeriği girmediniz. Emin misiniz? (Tasarım/Çekim ekibi brief göremeyecektir ve yönetici paneline uyarı düşecektir).
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                onClick={() => {
                  setShowBriefModal(false)
                  setBriefInput('')
                  setConfirmWithoutBrief(false)
                }}
                variant="outline"
                className="h-9 text-xs rounded-xl"
              >
                İptal
              </Button>
              <Button
                onClick={async () => {
                  if (!briefInput.trim()) {
                    if (!confirmWithoutBrief) {
                      setConfirmWithoutBrief(true)
                      return
                    }
                    setShowBriefModal(false)
                    await handleAction('complete')
                  } else {
                    setShowBriefModal(false)
                    await handleAction('complete', briefInput.trim())
                  }
                }}
                className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
              >
                {briefInput.trim() ? 'Kaydet ve Görevi Tamamla' : 'Brief Olmadan Tamamla (Eminim)'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Görev Teslim Modalı */}
      {showDeliveryModal && mounted && (
        <TaskDeliveryModal
          isOpen={showDeliveryModal}
          onClose={() => setShowDeliveryModal(false)}
          onConfirm={handleDeliveryConfirm}
          taskTitle={step.title}
          stepTitle={step.title}
          stepTemplateId={step.workflowStepTemplateId}
          requiresApproval={step.requiresApproval || step.approvalPurpose === 'final_creative' || isCreativeProductionResponsibility(step.responsibilityRole) || step.responsibilityRole === 'graphic_design' || step.responsibilityRole === 'video_editing'}
        />
      )}

      {/* Süre Uzatım Modalı */}
      {showExtensionModal && mounted && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                📅 Süre Uzatımı Talebi
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Görevin son teslim tarihini (deadline) uzatmak için yöneticinize talep gönderin.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block font-mono">
                  Mevcut Teslim Tarihi
                </label>
                <div className="bg-neutral-900 border border-neutral-850 p-2.5 rounded-xl text-xs text-neutral-450 font-mono">
                  {step.dueDate ? new Date(step.dueDate).toLocaleString('tr-TR') : 'Belirtilmemiş'}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block font-mono">
                  Yeni İstenen Teslim Tarihi
                </label>
                <input
                  type="datetime-local"
                  required
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-850 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block font-mono">
                  Uzatma Gerekçesi
                </label>
                <textarea
                  required
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  placeholder="Görevin neden uzatılması gerektiğini açıklayın..."
                  className="w-full min-h-[80px] bg-neutral-900 border border-neutral-850 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-8 text-[10px] px-4 rounded-xl border-neutral-850 text-neutral-450 font-bold"
                onClick={() => {
                  setShowExtensionModal(false)
                  setRequestedDate('')
                  setExtensionReason('')
                }}
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                disabled={isSubmittingExtension}
                onClick={handleRequestExtensionSubmit}
                className="h-8 text-[10px] px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                {isSubmittingExtension && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Talep Gönder
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detay Drawer */}
      {mounted && (
        <TaskDetailDrawer
          isOpen={showDetailDrawer}
          onClose={() => setShowDetailDrawer(false)}
          step={step}
          instance={instance}
          brandName={brandName}
          cycleLabel={cycleLabel}
          siblingSteps={siblingSteps}
          employees={employees}
          currentEmployeeId={currentEmployeeId}
        />
      )}
    </div>
  )
}
