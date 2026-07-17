'use client'

import { createPortal } from 'react-dom'
import type { WorkflowInstance, WorkflowStepInstance, Employee } from '@/types/domain'
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
}: TaskDetailDrawerProps) {
  if (!isOpen) return null

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

  const getStatusInfo = (status: WorkflowStepInstance['status']) => {
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

  // Parse description for structured content
  const parseDescription = (desc: string) => {
    const result: {
      baseDescription: string
      briefDetails: string | null
      deliveryNote: string | null
      photoLinks: string[]
      fileLinks: string[]
    } = {
      baseDescription: '',
      briefDetails: null,
      deliveryNote: null,
      photoLinks: [],
      fileLinks: [],
    }

    if (!desc) return result

    // Extract brief details
    const briefMarker = '[Brief Detayları]:'
    const briefIdx = desc.indexOf(briefMarker)
    if (briefIdx !== -1) {
      result.baseDescription = desc.substring(0, briefIdx).trim()
      result.briefDetails = desc.substring(briefIdx + briefMarker.length).trim()
    }

    // Extract delivery note
    const deliveryMarker = '[Teslim Açıklaması]:'
    const deliveryIdx = desc.indexOf(deliveryMarker)
    if (deliveryIdx !== -1) {
      if (!result.baseDescription) {
        result.baseDescription = desc.substring(0, deliveryIdx).trim()
      }
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

    if (!result.baseDescription && briefIdx === -1 && deliveryIdx === -1) {
      result.baseDescription = desc
    }

    return result
  }

  const parsedDesc = parseDescription(step.description)

  // Find brief from sibling steps
  const briefStep = siblingSteps.find(s =>
    s.status === 'completed' &&
    (s.title.toLowerCase().includes('brief') || s.workflowStepTemplateId.includes('brief') || s.title.toLowerCase().includes('toplantı'))
  )
  const briefFromSibling = briefStep ? parseDescription(briefStep.description) : null

  // Assigned employee
  const assignedEmployee = employees.find(e => e.id === step.assignedEmployeeId)

  // Sort sibling steps by order
  const sortedSiblings = [...siblingSteps].sort((a, b) => a.order - b.order)

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-end animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl h-full bg-neutral-950 border-l border-neutral-800 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-800 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <Building className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                <span>{brandName}</span>
                <span className="text-neutral-700">•</span>
                <Layers className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                <span>{cycleLabel}</span>
              </div>
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-neutral-500 shrink-0" />
                {instance.title}
              </h2>
              <Badge variant="outline" className={cn('px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider', statusInfo.bg)}>
                {statusInfo.label}
              </Badge>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-6">

          {/* --- Mevcut Adım Bilgileri --- */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Aktif İş Adımı
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
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-0.5">Sorumluluk Rolü</span>
                  <span className="text-xs font-semibold text-foreground">
                    {step.responsibilityRole ? roleLabels[step.responsibilityRole] || step.responsibilityRole : 'Operasyon'}
                  </span>
                </div>
                {assignedEmployee && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-0.5">Atanan Kişi</span>
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <User className="h-3 w-3 text-neutral-500" />
                      {assignedEmployee.fullName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* --- Zaman Bilgileri --- */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Zaman Bilgileri
            </h3>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-0.5">Başlangıç</span>
                  <span className="text-foreground font-medium">{formatDateTime(step.startedAt)}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-0.5">Teslim Tarihi</span>
                  <span className={cn("font-medium", step.dueDate ? "text-foreground" : "text-red-400")}>
                    {step.dueDate ? formatDateTime(step.dueDate) : 'Belirtilmedi'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-0.5">Tamamlanma</span>
                  <span className="text-foreground font-medium">{formatDateTime(step.completedAt)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* --- İş Akışı Briefi --- */}
          {(briefFromSibling?.briefDetails || briefFromSibling?.deliveryNote || parsedDesc.briefDetails) && (
            <section className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                İş Akışı Briefi
              </h3>
              <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 space-y-3">
                <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {briefFromSibling?.briefDetails || briefFromSibling?.deliveryNote || parsedDesc.briefDetails}
                </p>
                {briefStep && (
                  <div className="text-[10px] text-muted-foreground border-t border-blue-500/10 pt-2 flex items-center gap-1.5">
                    <FileText className="h-3 w-3" />
                    Kaynak adım: <span className="font-semibold text-blue-400">{briefStep.title}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* --- Teslim Açıklaması --- */}
          {parsedDesc.deliveryNote && (
            <section className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Teslim Açıklaması
              </h3>
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {parsedDesc.deliveryNote}
                </p>
              </div>
            </section>
          )}

          {/* --- Fotoğraf/Görsel Bağlantıları --- */}
          {parsedDesc.photoLinks.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" />
                Fotoğraf / Görsel Bağlantıları
              </h3>
              <div className="space-y-2">
                {parsedDesc.photoLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-purple-950/20 border border-purple-500/20 rounded-xl px-4 py-3 text-xs text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 transition-colors group"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    <span className="truncate">{link}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* --- Dosya Bağlantıları --- */}
          {parsedDesc.fileLinks.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5" />
                Dosya Bağlantıları
              </h3>
              <div className="space-y-2">
                {parsedDesc.fileLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-amber-950/20 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 transition-colors group"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    <span className="truncate">{link}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* --- Sayaç Bilgisi --- */}
          {instance.targetCount && instance.targetCount > 1 && (
            <section className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Paylaşım Sayacı
              </h3>
              <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-foreground">
                    {instance.progressCount ?? 0}
                    <span className="text-sm text-muted-foreground font-normal"> / {instance.targetCount}</span>
                  </span>
                  <span className="text-xs text-muted-foreground font-bold">
                    %{Math.min(100, Math.round(((instance.progressCount ?? 0) / instance.targetCount) * 100))}
                  </span>
                </div>
                <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round(((instance.progressCount ?? 0) / instance.targetCount) * 100))}%` }}
                  />
                </div>
              </div>
            </section>
          )}

          {/* --- İş Akışı Adımları (Timeline) --- */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Tüm İş Akışı Adımları
            </h3>
            <div className="space-y-0">
              {sortedSiblings.map((s, idx) => {
                const sStatus = getStatusInfo(s.status)
                const isCurrentStep = s.id === step.id
                const sAssigned = employees.find(e => e.id === s.assignedEmployeeId)
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "flex items-start gap-3 py-3 border-l-2 pl-4 relative transition-colors",
                      isCurrentStep ? 'border-blue-500 bg-blue-500/[0.03]' : 'border-neutral-800',
                      idx < sortedSiblings.length - 1 && 'border-b border-b-neutral-900/50'
                    )}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute -left-[5px] top-4 w-2 h-2 rounded-full ring-2 ring-neutral-950",
                      s.status === 'completed' ? 'bg-emerald-500' :
                      s.status === 'active' ? 'bg-blue-500 animate-pulse' :
                      s.status === 'cancelled' ? 'bg-rose-500' :
                      'bg-neutral-600'
                    )} />

                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Başlık satırı */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {sStatus.icon}
                        <span className={cn("text-xs font-bold", isCurrentStep ? 'text-blue-300' : 'text-foreground')}>
                          {s.title}
                        </span>
                        <Badge variant="outline" className={cn('px-1.5 py-0 rounded text-[8px] font-bold uppercase', sStatus.bg)}>
                          {sStatus.label}
                        </Badge>
                      </div>

                      {/* Meta bilgiler */}
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{s.responsibilityRole ? roleLabels[s.responsibilityRole] || s.responsibilityRole : '-'}</span>
                        {sAssigned && (
                          <>
                            <span className="text-neutral-700">•</span>
                            <span className="flex items-center gap-1">
                              <User className="h-2.5 w-2.5" />
                              {sAssigned.fullName}
                            </span>
                          </>
                        )}
                        {s.completedAt && (
                          <>
                            <span className="text-neutral-700">•</span>
                            <span className="text-emerald-500/70">{formatDateTime(s.completedAt)}</span>
                          </>
                        )}
                      </div>

                      {/* Tamamlanan adım içeriği */}
                      {(s.status === 'completed' || s.status === 'skipped') && (() => {
                        const d = s.description || ''
                        const delMarker = '[Teslim Açıklaması]:'
                        const briefMarker = '[Brief Detayları]:'
                        const photoMarker = '[Fotoğraf/Görsel Bağlantıları]:'
                        const fileMarker = '[Dosya Bağlantıları]:'

                        const delIdx = d.indexOf(delMarker)
                        const brIdx = d.indexOf(briefMarker)
                        const phIdx = d.indexOf(photoMarker)
                        const fiIdx = d.indexOf(fileMarker)

                        const delText = delIdx !== -1 ? d.substring(delIdx + delMarker.length).split('\n[')[0].trim() : ''
                        const brText = brIdx !== -1 ? d.substring(brIdx + briefMarker.length).split('\n[')[0].trim() : ''
                        const phLinks = phIdx !== -1 ? d.substring(phIdx + photoMarker.length).split('\n[')[0].trim().split(',').map(l => l.trim()).filter(Boolean) : []
                        const fiLinks = fiIdx !== -1 ? d.substring(fiIdx + fileMarker.length).split('\n[')[0].trim().split(',').map(l => l.trim()).filter(Boolean) : []

                        if (!delText && !brText && !phLinks.length && !fiLinks.length) return null

                        return (
                          <div className="space-y-2 mt-1">
                            {/* Teslim Açıklaması */}
                            {delText && (
                              <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/[0.12] px-3 py-2.5 space-y-1">
                                <span className="text-[8px] uppercase tracking-wider text-emerald-400 font-black flex items-center gap-1">
                                  <CheckCircle2 className="h-2.5 w-2.5" /> Teslim Açıklaması
                                </span>
                                <p className="text-[11px] text-neutral-200 leading-relaxed whitespace-pre-wrap">{delText}</p>
                              </div>
                            )}

                            {/* Brief */}
                            {brText && (
                              <div className="rounded-lg border border-blue-500/20 bg-blue-950/[0.10] px-3 py-2.5 space-y-1">
                                <span className="text-[8px] uppercase tracking-wider text-blue-400 font-black flex items-center gap-1">
                                  <Sparkles className="h-2.5 w-2.5" /> Brief
                                </span>
                                <p className="text-[11px] text-neutral-300 leading-relaxed whitespace-pre-wrap">{brText}</p>
                              </div>
                            )}

                            {/* Görsel / Dosya Linkleri */}
                            {(phLinks.length > 0 || fiLinks.length > 0) && (
                              <div className="rounded-lg border border-purple-500/20 bg-purple-950/[0.10] px-3 py-2.5 space-y-1.5">
                                <span className="text-[8px] uppercase tracking-wider text-purple-400 font-black flex items-center gap-1">
                                  <ExternalLink className="h-2.5 w-2.5" /> Teslim Edilen Linkler
                                </span>
                                <div className="space-y-1">
                                  {[...phLinks, ...fiLinks].map((link, li) => (
                                    <a
                                      key={li}
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 text-[11px] text-purple-300 hover:text-purple-100 hover:underline break-all group"
                                    >
                                      <ExternalLink className="h-2.5 w-2.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                      {link}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  )
}
