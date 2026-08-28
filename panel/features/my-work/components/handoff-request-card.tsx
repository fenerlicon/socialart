'use client'

import { useState, useEffect, useMemo } from 'react'
import type { WorkflowHandoff, WorkflowStepInstance, WorkflowInstance, Employee } from '@/types/domain'
import { acceptHandoff, rejectHandoff } from '@/lib/workflows/handoff-workflow'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, X, User, ArrowRightLeft, Sparkles, Building, Layers, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface HandoffRequestCardProps {
  handoff: WorkflowHandoff
  step: WorkflowStepInstance
  instance: WorkflowInstance
  brandName: string
  cycleLabel: string
  employees: Employee[]
  currentEmployeeId: string
  onActionSuccess: () => void
}

export function HandoffRequestCard({
  handoff,
  step,
  instance,
  brandName,
  cycleLabel,
  employees,
  currentEmployeeId,
  onActionSuccess,
}: HandoffRequestCardProps) {
  const [selectedDestinationId, setSelectedDestinationId] = useState(handoff.toEmployeeId || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const senderName = employees.find((e) => e.id === handoff.fromEmployeeId)?.fullName || 'Bilinmeyen Çalışan'

  const isGeneral = instance.id === 'inst-general-agency-tasks' || instance.brandId === 'general' || instance.brandId === 'general-agency' || instance.brandId === 'general-brand' || !instance.brandId || instance.title.includes('Genel Ajans')
  const displayBrand = isGeneral ? 'Genel Ajans' : brandName

  // Eligible destination employees for Creative handoffs
  const eligibleDestinationEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (emp.employeeStatus !== 'active') return false
      if (emp.id === handoff.fromEmployeeId) return false
      // Scoped to graphic design / video editing creative producers (including freelance)
      const isCreativeRole = emp.rolePackageId === 'grafik-tasarim' || emp.rolePackageId === 'video-kurgu' || emp.teamIds?.includes('grafik-studyo')
      return isCreativeRole
    })
  }, [employees, handoff.fromEmployeeId])

  const handleAccept = async () => {
    const targetId = selectedDestinationId || handoff.toEmployeeId
    if (!targetId) {
      toast.error('Lütfen devredilecek hedef çalışanı seçin!')
      return
    }

    setIsSubmitting(true)
    try {
      await acceptHandoff(handoff.id, currentEmployeeId, targetId)
      const targetEmp = employees.find(e => e.id === targetId)
      toast.success('Paslama talebi onaylandı', {
        description: `"${step.title}" adımı "${targetEmp?.fullName || 'çalışana'}" başarıyla devredildi.`,
      })
      onActionSuccess()
    } catch (err: any) {
      toast.error('İş devredilemedi', {
        description: err.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async (reasonText?: string) => {
    setIsSubmitting(true)
    try {
      await rejectHandoff(handoff.id, currentEmployeeId, reasonText)
      toast.info('Paslama talebi reddedildi', {
        description: `Devir talebini reddettiniz. İş mevcut çalışanda kalmaya devam edecek.`,
      })
      onActionSuccess()
    } catch (err: any) {
      toast.error('İş reddedilemedi', {
        description: err.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border bg-card/25 p-5 shadow-sm border-amber-500/10 bg-amber-500/[0.005] hover:border-neutral-700 transition-all duration-300 space-y-4 relative overflow-hidden group">
      {/* Visual pending highlight glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-neutral-900">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold flex-wrap">
            <Building className="h-3.5 w-3.5 text-neutral-500" />
            <span>{displayBrand}</span>
            <span className="text-neutral-700">•</span>
            <Layers className="h-3.5 w-3.5 text-neutral-500" />
            <span>{cycleLabel}</span>
          </div>
          <h4 className="text-sm font-black text-foreground flex items-center gap-2 mt-1">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            {instance.title}
          </h4>
        </div>

        <div>
          <Badge
            variant="outline"
            className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse"
          >
            PASLAMA TALEBİ
          </Badge>
        </div>
      </div>

      {/* Devreden Bilgileri & Detaylar */}
      <div className="grid gap-3 sm:grid-cols-3 bg-neutral-950/20 rounded-xl p-3 border border-neutral-900/60 text-xs">
        <div>
          <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Talep Eden (Mevcut Sorumlu)</span>
          <span className="font-bold text-foreground flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-neutral-400" />
            {senderName}
          </span>
        </div>

        <div>
          <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Paslama Nedeni</span>
          <span className="font-semibold text-amber-400">
            {handoff.reason}
          </span>
        </div>

        {step.creativeCount !== undefined && step.creativeCount !== null && (
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-purple-400 font-bold mb-0.5">Kreatif Adedi</span>
            <span className="font-bold text-purple-300">
              🎨 {step.creativeCount} Adet
            </span>
          </div>
        )}
      </div>

      {/* Devredilen Adım detayları */}
      <div className="text-xs space-y-1.5">
        <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Devredilecek İş Adımı</span>
        <span className="font-bold text-foreground block">{step.title}</span>
        {handoff.note && (
          <div className="text-xs p-2.5 rounded-xl bg-muted/10 border border-neutral-900 italic text-muted-foreground leading-normal">
            &quot;{handoff.note}&quot;
          </div>
        )}
      </div>

      {/* Hedef Çalışan Seçimi (Yönetici İçin) */}
      <div className="space-y-1.5 bg-neutral-900/40 p-3 rounded-xl border border-neutral-800">
        <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block">
          Yeni Atanacak Çalışan (Hedef Sorumlu) <span className="text-rose-400">*</span>
        </label>
        <Select value={selectedDestinationId} onValueChange={setSelectedDestinationId}>
          <SelectTrigger className="w-full text-xs h-9 border bg-neutral-900 border-neutral-700">
            <SelectValue placeholder="Devredilecek çalışanı seçin..." />
          </SelectTrigger>
          <SelectContent className="z-[99999]">
            {eligibleDestinationEmployees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id} className="text-xs">
                {emp.fullName} {emp.employmentType === 'freelance' ? '(Freelance)' : '(Tam Zamanlı)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kabul / Red Butonları */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-900">
        <span className="text-[10px] text-muted-foreground">
          Yönetici onayı ile yeni çalışana atanacaktır.
        </span>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => setShowRejectModal(true)}
            className="border-neutral-800 text-rose-400 hover:bg-rose-500/10 font-semibold text-xs h-8 px-3 rounded-lg flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Reddet
          </Button>

          <Button
            type="button"
            disabled={isSubmitting || !selectedDestinationId}
            onClick={handleAccept}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 px-4 rounded-lg flex items-center gap-1 shadow"
          >
            <Check className="h-3.5 w-3.5" />
            Onayla ve Pasla
          </Button>
        </div>
      </div>

      {/* İtiraz (Red) Giriş Modalı */}
      {mounted && showRejectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-850 w-full max-w-md p-6 rounded-2xl space-y-4 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <X className="h-4 w-4 text-rose-500" />
                Paslama Talebini Reddet
              </h3>
              <p className="text-xs text-muted-foreground">
                Paslama talebini reddetme gerekçenizi yazın. Görev mevcut çalışanda kalmaya devam edecektir.
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Örn: Bu iş mevcut teslim takviminiz dahilinde tamamlanmalıdır..."
                className="w-full min-h-[100px] bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500/50 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                variant="outline"
                className="h-9 text-xs rounded-xl border-neutral-800"
              >
                Vazgeç
              </Button>
              <Button
                onClick={async () => {
                  setShowRejectModal(false)
                  await handleReject(rejectReason.trim() || undefined)
                  setRejectReason('')
                }}
                className="h-9 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
              >
                Talebi Reddet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
