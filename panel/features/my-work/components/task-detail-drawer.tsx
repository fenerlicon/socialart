import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { WorkflowInstance, WorkflowStepInstance, Employee, WorkflowApproval } from '@/types/domain'
import { getStoredApprovals } from '@/lib/storage/local-approval-store'
import { approveApproval, requestRevision } from '@/lib/workflows/approval-workflow'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  X,
  ExternalLink,
  FileText,
  User,
  Info,
  Link as LinkIcon,
  Image as ImageIcon,
  Paperclip,
  Flame,
  Download,
  CheckSquare,
  Square,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  step: WorkflowStepInstance
  instance: WorkflowInstance
  brandName: string
  cycleLabel: string
  siblingSteps: WorkflowStepInstance[]
  employees: Employee[]
  currentEmployeeId: string
  onActionSuccess?: () => void
}

export function TaskDetailDrawer({
  isOpen,
  onClose,
  step,
  instance,
  brandName,
  cycleLabel,
  siblingSteps,
  employees,
  currentEmployeeId,
  onActionSuccess,
}: TaskDetailDrawerProps) {
  const router = useRouter()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [latestRevisionNote, setLatestRevisionNote] = useState<string | null>(null)
  const [pendingApproval, setPendingApproval] = useState<WorkflowApproval | null>(null)
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [showFinalConfirm, setShowFinalConfirm] = useState(false)
  const [revisionInput, setRevisionInput] = useState('')
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const allApprovals = await getStoredApprovals()
        const pending = allApprovals.find(
          (a) => a.workflowStepInstanceId === step.id && a.status === 'pending'
        )
        setPendingApproval(pending || null)

        if (step.approvalStatus === 'revision_requested') {
          const revApproval = allApprovals
            .filter((a) => a.workflowStepInstanceId === step.id && a.revisionNote)
            .sort(
              (a, b) =>
                new Date(b.revisedAt || b.createdAt).getTime() -
                new Date(a.revisedAt || a.createdAt).getTime()
            )[0]
          if (revApproval && revApproval.revisionNote) {
            setLatestRevisionNote(revApproval.revisionNote)
          }
        }
      } catch (err) {
        console.error('Failed to load approval details in drawer:', err)
      }
    }
    loadData()
  }, [step.id, step.status, step.approvalStatus])

  if (!isOpen) return null

  const roleLabels: Record<string, string> = {
    operation: 'Operasyon',
    strategy: 'Strateji & Müşteri',
    digital_marketing: 'Dijital Pazarlama',
    social_media: 'Sosyal Medya',
    creative_management: 'Kreatif Yönetim',
    creative_director: 'Kreatif Direktör',
    graphic_design: 'Grafik Tasarım',
    video_editing: 'Video Kurgu & Montaj',
    photography: 'Fotoğraf',
    videography: 'Video Çekim',
    reporting: 'Raporlama',
    custom: 'Özel Görev / Operasyon',
  }

  const getStatusInfo = (status: WorkflowStepInstance['status']) => {
    if (step.approvalStatus === 'revision_requested') {
      return {
        label: 'Revizyon Talep Edildi',
        color: 'text-amber-400',
        bg: 'bg-amber-500/15 border-amber-500/40',
        icon: <RotateCcw className="h-4 w-4 text-amber-400 animate-spin" />,
      }
    }
    switch (status) {
      case 'completed':
        return { label: 'Tamamlandı', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> }
      case 'active':
        return { label: 'Yayında / Yapılıyor', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/25', icon: <Play className="h-4 w-4 text-blue-500" /> }
      case 'waiting_approval':
        return { label: 'Onay Bekliyor', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/25', icon: <Clock className="h-4 w-4 text-purple-500" /> }
      case 'skipped':
        return { label: 'Geçildi', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25', icon: <Clock className="h-4 w-4 text-amber-500" /> }
      case 'cancelled':
        return { label: 'İptal Edildi', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/25', icon: <AlertTriangle className="h-4 w-4 text-rose-500" /> }
      case 'failed':
        return { label: 'Tamamlanamadı / Gecikti', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/40', icon: <AlertTriangle className="h-4 w-4 text-red-500" /> }
      case 'pending':
      default:
        return { label: 'Bekleniyor', color: 'text-neutral-400', bg: 'bg-neutral-500/10 border-neutral-800', icon: <Clock className="h-4 w-4 text-neutral-500" /> }
    }
  }

  const statusInfo = getStatusInfo(step.status)

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '-'
    try {
      const d = new Date(isoString)
      return d.toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return '-'
    }
  }

  // Parse structured description
  const parseDescription = (desc: string) => {
    const result: {
      baseDescription: string
      priority: string | null
      dueTime: string | null
      customDetail: string | null
      briefDetails: string | null
      deliveryNote: string | null
      photoLinks: string[]
      fileLinks: string[]
      refLinks: { title: string; url: string }[]
      attachments: Array<{ id: string; name: string; size: number; type: string; base64: string }>
    } = {
      baseDescription: '',
      priority: null,
      dueTime: null,
      customDetail: null,
      briefDetails: null,
      deliveryNote: null,
      photoLinks: [],
      fileLinks: [],
      refLinks: [],
      attachments: [],
    }

    if (!desc) return result

    // Priority
    const priorityMatch = desc.match(/\[Öncelik\]:\s*(.*?)(?=\n\[|$)/)
    if (priorityMatch) result.priority = priorityMatch[1].trim()

    // Due Time
    const dueTimeMatch = desc.match(/\[Teslim Saati\]:\s*(.*?)(?=\n\[|$)/)
    if (dueTimeMatch) result.dueTime = dueTimeMatch[1].trim()

    // Custom Rich Detail
    const customDetailMatch = desc.match(/\[Özel Görev Detayı\]:\s*([\s\S]*?)(?=\n\[|$)/)
    if (customDetailMatch) result.customDetail = customDetailMatch[1].trim()

    // Reference Links
    const refLinksMatch = desc.match(/\[Referans Bağlantılar\]:\s*([\s\S]*?)(?=\n\[|$)/)
    if (refLinksMatch) {
      result.refLinks = refLinksMatch[1].split('\n').filter(Boolean).map(line => {
        const trimmed = line.replace(/^-\s*/, '').trim()
        const parts = trimmed.split(': ')
        if (parts.length > 1 && parts[1].startsWith('http')) {
          return { title: parts[0], url: parts.slice(1).join(': ') }
        }
        return { title: 'Harici Bağlantı', url: trimmed }
      })
    }

    // Attachments JSON
    const attachmentsMatch = desc.match(/\[Ekli Dosyalar \/ Görseller\]:\s*([\s\S]*?)(?=\n\[|$)/)
    if (attachmentsMatch) {
      try {
        result.attachments = JSON.parse(attachmentsMatch[1].trim())
      } catch (e) {
        console.error('Failed to parse attachments JSON:', e)
      }
    }

    // Extract brief details
    const briefMarker = '[Brief Detayları]:'
    const briefIdx = desc.indexOf(briefMarker)
    if (briefIdx !== -1) {
      result.briefDetails = desc.substring(briefIdx + briefMarker.length).trim()
    }

    // Extract delivery note
    const deliveryMarker = '[Teslim Açıklaması]:'
    const deliveryIdx = desc.indexOf(deliveryMarker)
    if (deliveryIdx !== -1) {
      const afterDelivery = desc.substring(deliveryIdx + deliveryMarker.length)
      const nextSection = afterDelivery.indexOf('\n[')
      result.deliveryNote = nextSection !== -1
        ? afterDelivery.substring(0, nextSection).trim()
        : afterDelivery.trim()
    }

    // Extract photo links
    const photoMarker = '[Fotoğraf/Görsel Bağlantıları]:'
    const photoIdx = desc.indexOf(photoMarker)
    if (photoIdx !== -1) {
      const afterPhoto = desc.substring(photoIdx + photoMarker.length)
      const nextSection = afterPhoto.indexOf('\n[')
      const linkStr = nextSection !== -1
        ? afterPhoto.substring(0, nextSection).trim()
        : afterPhoto.trim()
      result.photoLinks = linkStr.split(',').map(l => l.trim()).filter(Boolean)
    }

    // Extract file links
    const fileMarker = '[Dosya Bağlantıları]:'
    const fileIdx = desc.indexOf(fileMarker)
    if (fileIdx !== -1) {
      const afterFile = desc.substring(fileIdx + fileMarker.length)
      const nextSection = afterFile.indexOf('\n[')
      const linkStr = nextSection !== -1
        ? afterFile.substring(0, nextSection).trim()
        : afterFile.trim()
      result.fileLinks = linkStr.split(',').map(l => l.trim()).filter(Boolean)
    }

    // Base clean description
    let clean = desc
      .replace(/\[Öncelik\]:[^\n]*/g, '')
      .replace(/\[Teslim Saati\]:[^\n]*/g, '')
      .replace(/\[Kategori\]:[^\n]*/g, '')
      .replace(/\[Özel Görev Detayı\]:[\s\S]*?(?=\n\[|$)/g, '')
      .replace(/\[Referans Bağlantılar\]:[\s\S]*?(?=\n\[|$)/g, '')
      .replace(/\[Ekli Dosyalar \/ Görseller\]:[\s\S]*?(?=\n\[|$)/g, '')
      .replace(/\[Teslim Açıklaması\]:[\s\S]*?(?=\n\[|$)/g, '')
      .replace(/\[Brief Detayları\]:[\s\S]*?(?=\n\[|$)/g, '')
      .replace(/\[Fotoğraf\/Görsel Bağlantıları\]:[^\n]*/g, '')
      .replace(/\[Dosya Bağlantıları\]:[^\n]*/g, '')
      .trim()

    result.baseDescription = clean

    return result
  }

  const parsedDesc = parseDescription(step.description)

  // Find brief from sibling steps
  const briefStep = siblingSteps.find(s =>
    s.status === 'completed' &&
    (s.title.toLowerCase().includes('brief') || s.workflowStepTemplateId.includes('brief') || s.title.toLowerCase().includes('toplantı'))
  )
  const briefFromSibling = briefStep ? parseDescription(briefStep.description) : null

  const assignedEmployee = employees.find(e => e.id === step.assignedEmployeeId)
  const sortedSiblings = [...siblingSteps].sort((a, b) => a.order - b.order)

  // Helper to render Word-like formatted custom text
  const renderFormattedText = (text: string) => {
    if (!text) return null
    const lines = text.split('\n')

    return (
      <div className="space-y-2 text-xs leading-relaxed text-neutral-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim()
          if (!trimmed) return <div key={idx} className="h-1.5" />

          // Headings
          if (trimmed.startsWith('# ')) {
            return (
              <h3 key={idx} className="text-sm font-black text-white pt-2 border-b border-neutral-800 pb-1">
                {trimmed.replace('# ', '')}
              </h3>
            )
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h4 key={idx} className="text-xs font-black text-indigo-300 pt-1.5">
                {trimmed.replace('## ', '')}
              </h4>
            )
          }

          // Callout / Note
          if (trimmed.startsWith('> ')) {
            return (
              <div key={idx} className="bg-amber-950/20 border-l-2 border-amber-500 rounded-r-xl p-3 my-2 text-amber-200 font-medium">
                {trimmed.replace('> ', '')}
              </div>
            )
          }

          // Bullet List
          if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{trimmed.replace(/^[•\-\*]\s*/, '')}</span>
              </div>
            )
          }

          // Checklist
          if (trimmed.startsWith('[ ] ') || trimmed.startsWith('[x] ')) {
            const isChecked = trimmed.startsWith('[x] ')
            return (
              <div key={idx} className="flex items-center gap-2 pl-2 py-0.5">
                {isChecked ? (
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                )}
                <span className={cn(isChecked && 'line-through text-neutral-500')}>
                  {trimmed.replace(/^\[[ x]\]\s*/, '')}
                </span>
              </div>
            )
          }

          // Numbered list
          if (/^\d+\.\s/.test(trimmed)) {
            const num = trimmed.match(/^(\d+)\./)?.[1]
            const textContent = trimmed.replace(/^\d+\.\s*/, '')
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="font-bold text-purple-400 shrink-0">{num}.</span>
                <span>{textContent}</span>
              </div>
            )
          }

          return <p key={idx} className="text-neutral-300">{trimmed}</p>
        })}
      </div>
    )
  }

  const getPriorityBadge = (p?: string | null) => {
    if (!p) return null
    const lower = p.toLowerCase()
    if (lower.includes('acil') || lower.includes('kritik') || lower.includes('urgent')) {
      return (
        <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/40 text-[10px] font-black animate-pulse flex items-center gap-1">
          <Flame className="h-3 w-3" /> Acil / Kritik
        </Badge>
      )
    }
    if (lower.includes('yüksek') || lower.includes('high')) {
      return (
        <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-bold">
          ⚡ Yüksek Öncelik
        </Badge>
      )
    }
    if (lower.includes('orta') || lower.includes('normal') || lower.includes('medium')) {
      return (
        <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[10px] font-medium">
          🔵 Normal Öncelik
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-medium">
        🟢 Düşük Öncelik
      </Badge>
    )
  }

  const isGeneral =
    instance.id === 'inst-general-agency-tasks' ||
    instance.brandId === 'general' ||
    instance.brandId === 'general-agency' ||
    instance.brandId === 'general-brand' ||
    !instance.brandId ||
    instance.title.includes('Genel Ajans')
  const displayBrandName = isGeneral ? 'Genel Ajans' : brandName || 'Marka'

  const currentEmp = employees.find((e) => e.id === currentEmployeeId)
  const isManager =
    currentEmp?.rolePackageId === 'kreatif-yonetim' ||
    currentEmp?.rolePackageId === 'kreatif-direktor' ||
    currentEmp?.rolePackageId === 'art-director' ||
    currentEmp?.rolePackageId === 'operasyon-yonetimi' ||
    currentEmp?.rolePackageId === 'ajans-yonetimi' ||
    currentEmp?.rolePackageId === 'admin'

  const handleFinalApprove = async () => {
    if (!pendingApproval) {
      toast.error('Bu adım için aktif bir onay talebi bulunamadı.')
      setShowFinalConfirm(false)
      return
    }
    setIsSubmittingAction(true)
    try {
      await approveApproval(pendingApproval.id, currentEmployeeId)
      toast.success('Kreatif final olarak onaylandı ve süreç tamamlandı.')
      setShowFinalConfirm(false)
      onActionSuccess?.()
      onClose()
    } catch (err: any) {
      toast.error('Onay işlemi gerçekleştirilemedi', { description: err.message })
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleRequestRevision = async () => {
    if (!pendingApproval) {
      toast.error('Bu adım için aktif bir onay talebi bulunamadı.')
      setShowRevisionModal(false)
      return
    }
    if (!revisionInput.trim()) {
      toast.error('Revize talebi için açıklama notu yazılması zorunludur!')
      return
    }
    setIsSubmittingAction(true)
    try {
      await requestRevision(pendingApproval.id, currentEmployeeId, revisionInput.trim())
      toast.success('Revizyon talebi iletildi ve görev tasarımcıya aktarıldı.')
      setShowRevisionModal(false)
      setRevisionInput('')
      onActionSuccess?.()
      onClose()
    } catch (err: any) {
      toast.error('Revizyon talebi iletilemedi', { description: err.message })
    } finally {
      setIsSubmittingAction(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-end animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl h-full bg-neutral-950 border-l border-neutral-800 shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-800 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <Building className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                <span>{displayBrandName}</span>
                <span className="text-neutral-700">•</span>
                <Layers className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                <span>{cycleLabel}</span>
              </div>
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400 shrink-0" />
                {step.title}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn(
                    'px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                    statusInfo.bg
                  )}
                >
                  {statusInfo.label}
                </Badge>
                {step.creativeCount !== undefined && step.creativeCount !== null && (
                  <Badge
                    variant="outline"
                    className="bg-purple-950/40 text-purple-300 border-purple-700/50 text-[10px] font-bold"
                  >
                    🎨 {step.creativeCount} Kreatif
                  </Badge>
                )}
                {getPriorityBadge(parsedDesc.priority)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 py-5 space-y-6 flex-1">
          {/* Paslama Talebi Bannerı */}
          {step.handoffStatus === 'pending' && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold">
                  <ArrowRightLeft className="h-4 w-4 text-amber-400" />
                  <span>PASLAMA TALEBİ BEKLİYOR</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-bold"
                >
                  Beklemede
                </Badge>
              </div>
              <p className="text-amber-200/90 text-xs leading-relaxed">
                Bu görev için çalışan tarafından paslama talebi iletilmiştir. Kararınızı Onay Merkezinden verebilirsiniz.
              </p>
              <div className="pt-1">
                <Button
                  onClick={() => {
                    onClose()
                    router.push('/approvals?tab=handoffs')
                  }}
                  className="h-8 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Paslama Talebini İncele
                </Button>
              </div>
            </div>
          )}

          {/* Art Director Revizyon Notu Bannerı */}
          {step.approvalStatus === 'revision_requested' && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 text-xs space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-amber-300 font-extrabold">
                <RotateCcw className="h-4 w-4 text-amber-400" />
                <span>ART DIRECTOR REVİZYON NOTU</span>
              </div>
              <p className="text-amber-200/90 whitespace-pre-wrap leading-relaxed bg-neutral-950/50 p-3 rounded-lg border border-amber-900/40">
                {latestRevisionNote || 'Revizyon talep edildi. Lütfen güncellemeleri tamamlayıp tekrar onaya gönderiniz.'}
              </p>
            </div>
          )}

          {/* --- Aktif Görev & Sorumlu Bilgileri --- */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Görev Bilgileri
            </h3>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                {statusInfo.icon}
                <span className="font-bold text-sm text-foreground">{step.title}</span>
              </div>

              {parsedDesc.baseDescription && (
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {parsedDesc.baseDescription}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-0.5">
                    Sorumluluk Rolü
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {step.responsibilityRole ? roleLabels[step.responsibilityRole] || step.responsibilityRole : 'Operasyon'}
                  </span>
                </div>
                {assignedEmployee && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-0.5">
                      Atanan Kişi
                    </span>
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-neutral-500" />
                      {assignedEmployee.fullName}
                      {assignedEmployee.employmentType === 'freelance' ? (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[9px] font-bold px-1.5 py-0">
                          Freelance
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[9px] font-bold px-1.5 py-0">
                          Tam Zamanlı
                        </Badge>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* --- ZENGİN WORD GÖREV DETAYI --- */}
          {parsedDesc.customDetail && (
            <section className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Özel Görev Talimatları & Detaylar
              </h3>
              <div className="bg-gradient-to-br from-indigo-950/20 to-neutral-900/50 border border-indigo-500/20 rounded-xl p-4 shadow-inner">
                {renderFormattedText(parsedDesc.customDetail)}
              </div>
            </section>
          )}

          {/* --- TESLİMAT AÇIKLAMASI --- */}
          {parsedDesc.deliveryNote && (
            <section className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Teslim Açıklaması
              </h3>
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap font-medium">
                  {parsedDesc.deliveryNote}
                </p>
              </div>
            </section>
          )}

          {/* --- TESLİM EDİLEN GÖRSEL VE DOSYA BAĞLANTILARI --- */}
          {(parsedDesc.photoLinks.length > 0 || parsedDesc.fileLinks.length > 0) && (
            <section className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5" />
                Teslim Edilen Bağlantılar ve Dosyalar ({parsedDesc.photoLinks.length + parsedDesc.fileLinks.length})
              </h3>
              <div className="space-y-2">
                {parsedDesc.photoLinks.map((link, idx) => (
                  <a
                    key={`photo-${idx}`}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-emerald-950/20 border border-emerald-500/20 rounded-xl px-4 py-3 text-xs text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ImageIcon className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="font-bold text-white truncate">Görsel / Tasarım Bağlantısı #{idx + 1}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[240px]">({link})</span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform text-emerald-400" />
                  </a>
                ))}
                {parsedDesc.fileLinks.map((link, idx) => (
                  <a
                    key={`file-${idx}`}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-emerald-950/20 border border-emerald-500/20 rounded-xl px-4 py-3 text-xs text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="font-bold text-white truncate">Dosya / Drive / WeTransfer Bağlantısı #{idx + 1}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[240px]">({link})</span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform text-emerald-400" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* --- 5MB EK DOSYALAR & GÖRSEL GALERİSİ --- */}
          {parsedDesc.attachments.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5" />
                Ekli Dosyalar ve Görseller ({parsedDesc.attachments.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {parsedDesc.attachments.map((file) => {
                  const isImg = file.type?.startsWith('image/') || file.base64?.startsWith('data:image/')
                  return (
                    <div
                      key={file.id}
                      className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-2.5 flex flex-col justify-between group hover:border-purple-500/40 transition-colors"
                    >
                      {isImg ? (
                        <div
                          className="relative aspect-video rounded-lg overflow-hidden bg-neutral-950 cursor-pointer mb-2 group-hover:ring-1 group-hover:ring-purple-500"
                          onClick={() => setPreviewImage(file.base64)}
                        >
                          <img src={file.base64} alt={file.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                            Büyüt
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg bg-neutral-950 flex items-center justify-center mb-2 text-purple-400">
                          <FileText className="h-8 w-8" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-white block truncate" title={file.name}>
                          {file.name}
                        </span>
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                          <span>{(file.size / 1024).toFixed(0)} KB</span>
                          <a
                            href={file.base64}
                            download={file.name}
                            className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-0.5"
                          >
                            <Download className="h-2.5 w-2.5" /> İndir
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* --- REFERANS LİNKLERİ --- */}
          {parsedDesc.refLinks.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5" />
                Referans & Proje Bağlantıları ({parsedDesc.refLinks.length})
              </h3>
              <div className="space-y-2">
                {parsedDesc.refLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-blue-950/20 border border-blue-500/20 rounded-xl px-4 py-3 text-xs text-blue-300 hover:bg-blue-500/10 hover:text-blue-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <LinkIcon className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span className="font-bold text-white truncate">{link.title || 'Bağlantı'}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">({link.url})</span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform text-blue-400" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* --- Zaman Bilgileri --- */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Zaman ve Teslim Bilgileri
            </h3>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-0.5">
                    Başlangıç
                  </span>
                  <span className="text-foreground font-medium">{formatDateTime(step.startedAt)}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-0.5">
                    Teslim Tarihi & Saati
                  </span>
                  <span className={cn('font-medium', step.dueDate ? 'text-foreground' : 'text-red-400')}>
                    {step.dueDate ? formatDateTime(step.dueDate) : 'Belirtilmedi'}
                    {parsedDesc.dueTime && <span className="text-indigo-400 font-bold ml-1">({parsedDesc.dueTime})</span>}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-0.5">
                    Tamamlanma
                  </span>
                  <span className="text-foreground font-medium">{formatDateTime(step.completedAt)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* --- Gecikme Açıklaması --- */}
          {step.failureReason && (
            <section className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Gecikme / Tamamlanamama Açıklaması
              </h3>
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 space-y-2">
                <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap font-medium">
                  {step.failureReason}
                </p>
                {step.failureExplanationAt && (
                  <div className="text-[10px] text-muted-foreground border-t border-rose-500/15 pt-2 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-rose-400" />
                    İletilme Tarihi:{' '}
                    <span className="font-semibold text-rose-300">{formatDateTime(step.failureExplanationAt)}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* --- İş Akışı Adımları (Timeline) --- */}
          {sortedSiblings.length > 1 && (
            <section className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Tüm İş Akışı Adımları
              </h3>
              <div className="space-y-0">
                {sortedSiblings.map((s, idx) => {
                  const sStatus = getStatusInfo(s.status)
                  const isCurrentStep = s.id === step.id
                  const sAssigned = employees.find((e) => e.id === s.assignedEmployeeId)
                  return (
                    <div
                      key={s.id}
                      className={cn(
                        'flex items-start gap-3 py-3 border-l-2 pl-4 relative transition-colors',
                        isCurrentStep ? 'border-blue-500 bg-blue-500/[0.03]' : 'border-neutral-800',
                        idx < sortedSiblings.length - 1 && 'border-b border-b-neutral-900/50'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute -left-[5px] top-4 w-2 h-2 rounded-full ring-2 ring-neutral-950',
                          s.status === 'completed'
                            ? 'bg-emerald-500'
                            : s.status === 'active'
                            ? 'bg-blue-500 animate-pulse'
                            : 'bg-neutral-600'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white truncate">{s.title}</span>
                          <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0', sStatus.bg)}>
                            {sStatus.label}
                          </Badge>
                        </div>
                        {sAssigned && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            Sorumlu: {sAssigned.fullName}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        {/* Art Director / Manager Karar & Aksiyon Barı (Sadece waiting_approval adımında) */}
        {step.status === 'waiting_approval' && isManager && pendingApproval && (
          <div className="sticky bottom-0 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800 p-4 px-6 flex items-center justify-between gap-3 z-10">
            <div className="text-xs text-muted-foreground">
              <span className="text-purple-300 font-bold block">Art Director Değerlendirmesi</span>
              <span className="text-[11px]">Teslim edilen kreatifleri inceleyip kararınızı verin.</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowRevisionModal(true)}
                disabled={isSubmittingAction}
                variant="outline"
                className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="h-4 w-4 text-amber-400" />
                Revizyon İste
              </Button>
              <Button
                onClick={() => setShowFinalConfirm(true)}
                disabled={isSubmittingAction}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
              >
                <CheckCircle2 className="h-4 w-4" />
                Final Onayla
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Final Onaylama Onay Modal / Dialog */}
      {showFinalConfirm && (
        <div className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md p-6 rounded-2xl space-y-4 shadow-2xl">
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-white">
                Kreatifi final olarak onaylamak istediğinize emin misiniz?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bu işlem kreatifi tamamlanmış olarak işaretler ve üretim kaydına esas olur.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowFinalConfirm(false)}
                disabled={isSubmittingAction}
                className="h-9 text-xs rounded-xl"
              >
                Vazgeç
              </Button>
              <Button
                onClick={handleFinalApprove}
                disabled={isSubmittingAction}
                className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                {isSubmittingAction ? 'Onaylanıyor...' : 'Evet, Final Onayla'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Revizyon Talep Modalı */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md p-6 rounded-2xl space-y-4 shadow-2xl">
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4 text-amber-400" />
                Revizyon Talebi Gönder
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Grafik tasarımcının yapması gereken düzeltmeleri ve revize notunu girin.
              </p>
            </div>
            <textarea
              value={revisionInput}
              onChange={(e) => setRevisionInput(e.target.value)}
              placeholder="Örn: 2. postun yazı tipi bold olsun, ürün görseli biraz daha merkeze çekilsin..."
              className="w-full min-h-[120px] bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRevisionModal(false)
                  setRevisionInput('')
                }}
                disabled={isSubmittingAction}
                className="h-9 text-xs rounded-xl"
              >
                İptal
              </Button>
              <Button
                onClick={handleRequestRevision}
                disabled={isSubmittingAction}
                className="h-9 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
              >
                {isSubmittingAction ? 'Gönderiliyor...' : 'Revizyon Talebini İlet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Görsel Büyütme Önizleme Modalı */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={previewImage} alt="Görsel Önizleme" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
