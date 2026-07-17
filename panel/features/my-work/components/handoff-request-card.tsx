'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { WorkflowHandoff, WorkflowStepInstance, WorkflowInstance, Employee } from '@/types/domain'
import { acceptHandoff, rejectHandoff } from '@/lib/workflows/handoff-workflow'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, User, ArrowRightLeft, Sparkles, Building, Layers } from 'lucide-react'
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const senderName = employees.find((e) => e.id === handoff.fromEmployeeId)?.fullName || 'Bilinmeyen Çalışan'

  const handleAccept = async () => {
    setIsSubmitting(true)
    try {
      await acceptHandoff(handoff.id, currentEmployeeId)
      toast.success('Paslama talebi kabul edildi', {
        description: `"${step.title}" adımı başarıyla üzerinize atandı ve Aktif İşlerinize eklendi.`,
      })
      onActionSuccess()
    } catch (err: any) {
      toast.error('İş kabul edilemedi', {
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
        description: `Devir talebini reddettiniz. İş önceki çalışanda kalmaya devam edecek.`,
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
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <Building className="h-3.5 w-3.5 text-neutral-500" />
            <span>{brandName}</span>
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
            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border-amber-500/25 animate-pulse"
          >
            Sana Paslanıyor
          </Badge>
        </div>
      </div>

      {/* Devreden Bilgileri */}
      <div className="grid gap-3 sm:grid-cols-2 bg-neutral-950/20 rounded-xl p-3 border border-neutral-900/60 text-xs">
        <div>
          <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Gönderen</span>
          <span className="font-bold text-foreground flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-neutral-400" />
            {senderName}
          </span>
        </div>

        <div>
          <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Paslama Nedeni</span>
          <span className="font-semibold text-foreground text-amber-400">
            {handoff.reason}
          </span>
        </div>
      </div>

      {/* Devredilen Adım detayları */}
      <div className="text-xs space-y-1">
        <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Devralınacak Adım</span>
        <span className="font-bold text-foreground">{step.title}</span>
        {handoff.note && (
          <div className="mt-2 text-xs p-2.5 rounded bg-muted/10 border border-neutral-900 italic text-muted-foreground leading-normal">
            &quot;{handoff.note}&quot;
          </div>
        )}
      </div>

      {/* Kabul / Red Butonları */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-900">
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={handleAccept}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 px-4 rounded-lg flex items-center gap-1 shadow"
        >
          <Check className="h-4 w-4" />
          Kabul Et
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => setShowRejectModal(true)}
          className="border-neutral-800 text-rose-400 hover:bg-rose-500/10 font-semibold text-xs h-8 px-4 rounded-lg flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Reddet
        </Button>
      </div>

      {/* İtiraz (Red) Giriş Modalı */}
      {mounted && showRejectModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-900 w-full max-w-md p-6 rounded-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <X className="h-4 w-4 text-rose-500" />
                Paslanan Göreve İtiraz Et (Reddet)
              </h3>
              <p className="text-xs text-muted-foreground">
                Görevi reddetme / itiraz etme gerekçenizi yazın. Bu not işi size paslayan kişiye bildirim olarak gidecektir.
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Örn: Bugün sahada çekimdeyim, bu tarihe yetiştiremem..."
                className="w-full min-h-[100px] bg-neutral-900 border border-neutral-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500/50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                variant="outline"
                className="h-9 text-xs rounded-xl"
              >
                Vazgeç
              </Button>
              <Button
                onClick={async () => {
                  setShowRejectModal(false)
                  await handleReject(rejectReason.trim() || undefined)
                  setRejectReason('')
                }}
                className="h-9 text-xs bg-rose-650 hover:bg-rose-700 text-white rounded-xl font-bold"
              >
                Görevi Reddet (İtiraz Et)
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
