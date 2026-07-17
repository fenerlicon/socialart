'use client'

import { useState } from 'react'
import type { Employee, WorkflowInstance, WorkflowStepInstance } from '@/types/domain'
import { requestHandoff } from '@/lib/workflows/handoff-workflow'
import { Button } from '@/components/ui/button'
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
  const [targetEmployeeId, setTargetEmployeeId] = useState('')
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter out self so employee cannot assign tasks to themselves
  const otherEmployees = employees.filter((e) => e.id !== currentEmployeeId)

  const REASONS = [
    'Yoğunluk',
    'Uzmanlık gerektiriyor',
    'İzin / müsait değil',
    'Revize için geri gönderiliyor',
    'Yönetici yönlendirmesi',
    'Diğer',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetEmployeeId) {
      toast.error('Lütfen devredilecek çalışanı seçin')
      return
    }
    if (!reason) {
      toast.error('Lütfen devretme sebebini seçin')
      return
    }

    setIsSubmitting(true)
    try {
      await requestHandoff({
        workflowInstanceId: instance.id,
        stepInstanceId: step.id,
        fromEmployeeId: currentEmployeeId,
        toEmployeeId: targetEmployeeId,
        reason,
        note: note.trim() || undefined,
      })

      const targetName = employees.find((e) => e.id === targetEmployeeId)?.fullName || 'Çalışan'
      toast.success('Paslama talebi oluşturuldu', {
        description: `"${step.title}" iş adımı "${targetName}" onayına paslandı.`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-neutral-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-muted/20 shrink-0">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-emerald-500" />
            İşi Başka Çalışana Pasla
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="bg-muted/10 p-3 rounded-lg border border-neutral-800 space-y-1 text-xs">
              <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Paslanacak İş</span>
              <span className="font-bold text-foreground">{brandName} - {instance.title}</span>
              <span className="text-[10px] text-muted-foreground block">Adım: {step.title}</span>
            </div>

            {/* Target Employee */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Paslanacak Çalışan</label>
              <Select value={targetEmployeeId} onValueChange={setTargetEmployeeId}>
                <SelectTrigger className="w-full text-xs h-10 border bg-muted/10">
                  <SelectValue placeholder="Bir çalışan seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {otherEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id} className="text-xs">
                      {emp.fullName} ({emp.title || 'Ünvansız'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Paslama Sebebi</label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="w-full text-xs h-10 border bg-muted/10">
                  <SelectValue placeholder="Sebep seçin..." />
                </SelectTrigger>
                <SelectContent>
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
              <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Ek açıklama / Not</span>
                <span className="text-[10px] text-muted-foreground/60 font-normal">İsteğe Bağlı</span>
              </label>
              <textarea
                placeholder="Devretme detayları, yönlendirmeler veya notlarınızı yazın..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border bg-muted/10 border-neutral-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[80px] resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-muted/20 border-t border-neutral-800 flex justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 text-xs px-4 border"
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 text-xs px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow"
            >
              Talebi Gönder (Pasla)
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
