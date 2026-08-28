'use client'

import { useState } from 'react'
import type { Employee, WorkflowInstance, WorkflowStepInstance } from '@/types/domain'
import { requestHandoff } from '@/lib/workflows/handoff-workflow'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowRightLeft, X } from 'lucide-react'
import { toast } from 'sonner'

interface HandoffModalProps {
  step: WorkflowStepInstance
  instance: WorkflowInstance
  brandName: string
  currentEmployeeId: string
  employees: Employee[]
  onClose: () => void
  onSuccess: () => void
}

export function HandoffModal({
  step,
  instance,
  brandName,
  currentEmployeeId,
  employees,
  onClose,
  onSuccess,
}: HandoffModalProps) {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const REASONS = [
    'Yoğunluk / Fazla İş Yükü',
    'Uzmanlık Gerektiriyor',
    'İzin / Müsait Değil',
    'Hastalık / Acil Durum',
    'Yönetici Yönlendirmesi',
    'Diğer',
  ]

  const displayBrand = instance.id === 'inst-general-agency-tasks' || instance.brandId === 'general' || instance.brandId === 'general-agency' || instance.brandId === 'general-brand' || !instance.brandId || instance.title.includes('Genel Ajans')
    ? 'Genel Ajans'
    : brandName

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) {
      toast.error('Lütfen paslama sebebini seçin')
      return
    }

    setIsSubmitting(true)
    try {
      await requestHandoff({
        workflowInstanceId: instance.id,
        stepInstanceId: step.id,
        fromEmployeeId: currentEmployeeId,
        reason,
        note: note.trim() || undefined,
      })

      toast.success('Paslama talebi iletildi', {
        description: `"${step.title}" iş adımı için paslama talebiniz yöneticinize iletildi.`,
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error('Talep oluşturulamadı', {
        description: err.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <Card className="w-full max-w-md max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl relative overflow-hidden my-auto">
        {/* Top accent */}
        <div className="h-1 w-full shrink-0 bg-gradient-to-r from-amber-500 via-orange-500 to-purple-500" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800/80 flex items-center justify-between shrink-0">
          <h3 className="text-base font-black text-foreground flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-amber-500" />
            Paslama Talebi Gönder
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 shrink-0 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800 space-y-1 text-xs">
              <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-black">Paslanacak İş</span>
              <span className="font-bold text-foreground block">{displayBrand} - {instance.title}</span>
              <span className="text-[10px] text-purple-400 block font-semibold">Adım: {step.title}</span>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">
                Paslama Sebebi <span className="text-rose-400">*</span>
              </label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="w-full text-xs h-10 border bg-neutral-900/80 border-neutral-700">
                  <SelectValue placeholder="Sebep seçin..." />
                </SelectTrigger>
                <SelectContent className="z-[99999]">
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 flex justify-between">
                <span>Açıklama / Not</span>
                <span className="text-[10px] text-muted-foreground font-normal">İsteğe Bağlı</span>
              </label>
              <textarea
                placeholder="Neden devretmek istediğinizi ve görevi devralacak yöneticiye aktarmak istediğiniz notları yazın..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border bg-neutral-900/80 border-neutral-700 text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500 min-h-[90px] resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-neutral-950/90 border-t border-neutral-800/80 flex justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 text-xs rounded-xl font-semibold border-neutral-800 hover:bg-neutral-900"
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 text-xs px-5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md"
            >
              Paslama Talebi Gönder
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
