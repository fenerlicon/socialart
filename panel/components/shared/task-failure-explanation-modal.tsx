'use client'

import { useState } from 'react'
import type { WorkflowStepInstance } from '@/types/domain'
import { updateWorkflowStepInstance, saveWorkflowHistory } from '@/lib/storage/local-workflow-instance-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, X, FileText, Send, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

interface TaskFailureExplanationModalProps {
  isOpen: boolean
  onClose: () => void
  step: WorkflowStepInstance
  brandName: string
  workflowTitle: string
  currentEmployeeId: string
  onSuccess: () => void
}

export function TaskFailureExplanationModal({
  isOpen,
  onClose,
  step,
  brandName,
  workflowTitle,
  currentEmployeeId,
  onSuccess,
}: TaskFailureExplanationModalProps) {
  const [reasonText, setReasonText] = useState(step.failureReason || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen || typeof document === 'undefined') return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = reasonText.trim()
    if (!trimmed || trimmed.length < 10) {
      setErrorMsg('Lütfen en az 10 karakterlik açıklayıcı bir gecikme sebebi yazınız.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const nowIso = new Date().toISOString()
      const updatedStep: WorkflowStepInstance = {
        ...step,
        failureReason: trimmed,
        failureExplanationAt: nowIso,
      }

      await updateWorkflowStepInstance(updatedStep)

      // Audit history
      await saveWorkflowHistory({
        id: uuidv4(),
        workflowInstanceId: step.workflowInstanceId,
        workflowStepInstanceId: step.id,
        actorEmployeeId: currentEmployeeId,
        action: 'failure_explanation_submitted',
        fromStatus: step.status,
        toStatus: step.status,
        note: `[Gecikme Açıklaması]: ${trimmed}`,
        createdAt: nowIso,
      })

      toast.success('Açıklama Başarıyla Kaydedildi! ✅', {
        description: 'Gecikme gerekçeniz yöneticinizin Operasyonlar paneline iletildi.',
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Save failure explanation error:', err)
      toast.error('Açıklama kaydedilemedi: ' + (err?.message || 'Bilinmeyen hata'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-red-500/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl shadow-red-500/10 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-red-400 font-extrabold text-sm">
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <span>Vaktinde Tamamlanamama Açıklaması</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Task Info Summary */}
        <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-200">{brandName}</span>
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30">
              Vakti Geçti
            </span>
          </div>
          <p className="text-neutral-400 font-medium">{workflowTitle} • <strong className="text-white">{step.title}</strong></p>
          {step.dueDate && (
            <p className="text-[11px] text-neutral-500">
              Teslim Tarihi: {new Date(step.dueDate).toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-300">
              Gecikme / Tamamlanamama Nedeni <span className="text-red-400">*</span>
            </label>
            <Textarea
              rows={4}
              required
              value={reasonText}
              onChange={(e) => {
                setReasonText(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              placeholder="İşin neden vaktinde tamamlanamadığını detaylıca açıklayınız (Örn: Müşteriden ham görsel geç iletildi / Revize süreci uzadı / Teknik aksaklık yaşandı...)"
              className="bg-neutral-950 border-neutral-800 text-white text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none leading-relaxed"
            />
            {errorMsg && (
              <p className="text-xs font-semibold text-red-400">{errorMsg}</p>
            )}
          </div>

          <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-850 text-[11px] text-neutral-400 leading-relaxed">
            💡 <strong>Bilgi:</strong> Açıklamanızı kaydettiğinizde sistemdeki yeni iş tamamlama engeliniz kaldırılır ve açıklamanız bağlı olduğunuz yöneticinin <strong>Operasyonlar</strong> panelinde <strong>&ldquo;Tamamlanmayan İşler&rdquo;</strong> sekmesinde görüntülenir.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !reasonText.trim()}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-red-500/20"
            >
              <Send className="h-3.5 w-3.5" />
              {isSubmitting ? 'Kaydediliyor...' : 'Açıklamayı İlet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
