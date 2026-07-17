'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import type { Brand, BrandOperationCycle, WorkflowInstance, WorkflowStepInstance } from '@/types/domain'
import { OPERATION_PLAN_ITEM_TYPE_LABELS } from '@/types/domain'
import { getCyclesByBrandId, saveOperationCycle, deleteOperationCycle } from '@/lib/storage/local-cycle-store'
import { createOperationCycle } from '@/lib/operations/create-operation-cycle'
import {
  getWorkflowInstancesByCycleId,
  getWorkflowStepInstances,
  saveWorkflowInstances,
  deleteWorkflowInstancesByCycleId,
} from '@/lib/storage/local-workflow-instance-store'
import { generateWorkflowInstancesForCycle } from '@/lib/workflows/generate-workflow-instances'
import { OPERATION_TEMPLATES } from '@/features/workflows/data/operation-template-seeds'
import { WORKFLOW_TEMPLATES } from '@/features/workflows/data/workflow-template-seeds'
import { createStepActivatedNotification } from '@/lib/workflows/notification-helper'
import { WorkflowInstanceCard } from './workflow-instance-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Activity, Plus, Play, Calendar, Info, Layers, AlertTriangle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface BrandWorkflowSectionProps {
  brand: Brand
  onProgress?: () => void // Parent page refresh callback
  onRequestCancelCycle?: (confirmFn: () => Promise<void>) => void // Lift modal to parent
}

export function BrandWorkflowSection({ brand, onProgress, onRequestCancelCycle }: BrandWorkflowSectionProps) {
  const [cycles, setCycles] = useState<BrandOperationCycle[]>([])
  const [selectedCycleId, setSelectedCycleId] = useState<string>('')
  
  // Workflow states
  const [instances, setInstances] = useState<WorkflowInstance[]>([])
  const [steps, setSteps] = useState<WorkflowStepInstance[]>([])

  // Cycle creation states
  const [showCreateCycle, setShowCreateCycle] = useState(false)
  const [newMonth, setNewMonth] = useState<string>(new Date().getMonth() + 1 + '')
  const [newYear, setNewYear] = useState<string>(new Date().getFullYear() + '')
  const [newNotes, setNewNotes] = useState<string>('')
  const [showDeleteCycleConfirm, setShowDeleteCycleConfirm] = useState(false)
  const [cycleToDelete, setCycleToDelete] = useState<BrandOperationCycle | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [draftPlan, setDraftPlan] = useState<any[]>([])
  const [newDraftTitle, setNewDraftTitle] = useState('')
  const [newDraftType, setNewDraftType] = useState<any>('content')
  const [newDraftTarget, setNewDraftTarget] = useState(1)

  useEffect(() => {
    if (showCreateCycle && brand) {
      setDraftPlan(JSON.parse(JSON.stringify(brand.operationPlan || [])))
    }
  }, [showCreateCycle, brand])

  const updateDraftItemTarget = (itemId: string, newTarget: number) => {
    setDraftPlan((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, target: newTarget } : item))
    )
  }

  const handleDeleteDraftItem = (itemId: string) => {
    setDraftPlan((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleAddDraftItem = () => {
    if (!newDraftTitle.trim()) {
      toast.error('Lütfen kalem başlığı girin')
      return
    }
    const newItem = {
      id: crypto.randomUUID(),
      title: newDraftTitle.trim(),
      type: newDraftType,
      target: newDraftTarget,
      completed: 0,
      status: 'pending' as const,
    }
    setDraftPlan((prev) => [...prev, newItem])
    setNewDraftTitle('')
    setNewDraftTarget(1)
  }

  // showCancelConfirm is now managed by parent via onRequestCancelCycle

  // 1. Load cycles for this brand
  const loadCycles = useCallback(async () => {
    const list = await getCyclesByBrandId(brand.id)
    // Sort cycles by year desc, month desc
    list.sort((a, b) => b.year - a.year || b.month - a.month)
    setCycles(list)

    if (list.length > 0) {
      // If none selected or selected is not in the list, default to first (latest)
      if (!selectedCycleId || !list.some((c) => c.id === selectedCycleId)) {
        setSelectedCycleId(list[0].id)
      }
    } else {
      setSelectedCycleId('')
    }
  }, [brand.id, selectedCycleId])

  useEffect(() => {
    loadCycles()
  }, [loadCycles])

  // Find active selected cycle object
  const selectedCycle = useMemo(() => {
    return cycles.find((c) => c.id === selectedCycleId)
  }, [cycles, selectedCycleId])

  // 2. Load workflows and steps for the selected cycle
  const loadWorkflows = useCallback(async () => {
    if (!selectedCycleId) {
      setInstances([])
      setSteps([])
      return
    }

    const instList = await getWorkflowInstancesByCycleId(selectedCycleId)
    const stepList = await getWorkflowStepInstances()

    setInstances(instList)
    setSteps(stepList)
  }, [selectedCycleId])

  useEffect(() => {
    loadWorkflows()
  }, [loadWorkflows])

  // 3. Callback on step progress
  const handleWorkflowProgress = async () => {
    await loadWorkflows()
    await loadCycles() // Reload cycles to catch updated OperationPlanItem status!
    if (onProgress) {
      onProgress() // Trigger parent refresh (for brand template metrics, if any)
    }
  }

  // 4. Create new operation cycle
  const handleCreateCycle = async () => {
    const m = parseInt(newMonth)
    const y = parseInt(newYear)

    if (isNaN(m) || m < 1 || m > 12) {
      toast.error('Geçersiz ay', { description: 'Ay değeri 1-12 arasında olmalıdır.' })
      return
    }
    if (isNaN(y) || y < 2020 || y > 2035) {
      toast.error('Geçersiz yıl', { description: 'Geçersiz yıl değeri.' })
      return
    }

    try {
      const cycle = await createOperationCycle({
        brand,
        month: m,
        year: y,
        notes: newNotes.trim() || undefined,
        customPlan: draftPlan.length > 0 ? draftPlan : undefined,
      })

      await saveOperationCycle(cycle)
      toast.success('Operasyon dönemi başarıyla oluşturuldu.', {
        description: `${y} Yılı ${m}. Ay dönemi planlama aşamasında başladı.`,
      })

      // Reset and reload
      setShowCreateCycle(false)
      setNewNotes('')
      
      // We trigger reload and set the select to the newly created cycle
      const updatedList = await getCyclesByBrandId(brand.id)
      updatedList.sort((a, b) => b.year - a.year || b.month - a.month)
      setCycles(updatedList)
      
      const newCreated = updatedList.find((c) => c.month === m && c.year === y)
      if (newCreated) {
        setSelectedCycleId(newCreated.id)
      }
    } catch (err: any) {
      toast.error('Operasyon dönemi oluşturulamadı', {
        description: err.message,
      })
    }
  }

  // Cancel cycle and cancel all workflows/steps inside it
  const handleCancelCycle = async () => {
    if (!selectedCycle) return
    try {
      const updatedCycle: BrandOperationCycle = {
        ...selectedCycle,
        status: 'cancelled',
      }
      await saveOperationCycle(updatedCycle)

      const cycleInstances = await getWorkflowInstancesByCycleId(selectedCycle.id)
      const updatedInstances = cycleInstances.map(i => ({ ...i, status: 'cancelled' as const }))

      const allSteps = await getWorkflowStepInstances()
      const instanceIds = new Set(cycleInstances.map(i => i.id))
      const updatedSteps = allSteps.map(s => {
        if (instanceIds.has(s.workflowInstanceId)) {
          return { ...s, status: 'cancelled' as const }
        }
        return s
      })

      await saveWorkflowInstances(updatedInstances, updatedSteps)

      toast.success('Operasyon dönemi iptal edildi', {
        description: 'Dönem ve altındaki tüm iş akışı görevleri iptal durumuna getirildi.',
      })

      await loadCycles()
      await loadWorkflows()
      if (onProgress) {
        onProgress()
      }
    } catch (err: any) {
      toast.error('İptal işlemi gerçekleştirilemedi', {
        description: err.message,
      })
    }
  }

  // 5. Generate workflow instances for selected cycle
  const handleGenerateWorkflows = async () => {
    if (!selectedCycle) return
    setIsGenerating(true)

    try {
      // If cycle is cancelled, reactivate it to 'planning' so new instances can be created
      let activeCycle = selectedCycle
      if (selectedCycle.status === 'cancelled') {
        activeCycle = { ...selectedCycle, status: 'planning' }
        await saveOperationCycle(activeCycle)
        await loadCycles()
      }
      const { instances: generatedInsts, steps: generatedSteps } = await generateWorkflowInstancesForCycle({
        cycle: activeCycle,
        operationTemplates: OPERATION_TEMPLATES,
        workflowTemplates: WORKFLOW_TEMPLATES,
      })

      if (generatedInsts.length === 0) {
        toast.warning('Oluşturulacak İş Akışı Bulunamadı', {
          description: 'Lütfen operasyon döneminde aktif plan kalemleri olduğundan emin olun.',
        })
        setIsGenerating(false)
        return
      }

      await saveWorkflowInstances(generatedInsts, generatedSteps)

      // Dönemi aktif hale getir ve plan kalemlerini 'in_progress' yap
      const updatedCycle: BrandOperationCycle = {
        ...activeCycle,
        status: 'active',
        operationPlan: activeCycle.operationPlan.map((item) => {
          if (item.status === 'pending') {
            return { ...item, status: 'in_progress' }
          }
          return item
        }),
      }
      await saveOperationCycle(updatedCycle)
      await loadCycles()
      
      // İlk aktif adımlar için bildirimleri üret
      for (const step of generatedSteps) {
        if (step.status === 'active' && step.assignedEmployeeId) {
          const instance = generatedInsts.find((i) => i.id === step.workflowInstanceId)
          if (instance) {
            await createStepActivatedNotification(instance, step)
          }
        }
      }

      toast.success('İş akışı örnekleri oluşturuldu.', {
        description: `${generatedInsts.length} adet iş akışı ve bağlı adımlar türetildi.`,
      })

      // Reload
      await loadWorkflows()
    } catch (err: any) {
      toast.error('İş akışları oluşturulamadı', {
        description: err.message,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Seçili operasyon dönemini (planını) silmek için modalı açar
  const handleDeleteCycle = () => {
    if (!selectedCycleId) return
    const currentCycle = cycles.find((c) => c.id === selectedCycleId)
    if (!currentCycle) return
    setCycleToDelete(currentCycle)
    setShowDeleteCycleConfirm(true)
  }

  const handleConfirmDeleteCycle = async () => {
    if (!cycleToDelete) return
    const targetCycleId = cycleToDelete.id
    setShowDeleteCycleConfirm(false)
    setCycleToDelete(null)

    try {
      await deleteWorkflowInstancesByCycleId(targetCycleId)
      await deleteOperationCycle(targetCycleId)

      toast.success('Operasyon dönemi başarıyla silindi!')

      const updatedList = await getCyclesByBrandId(brand.id)
      updatedList.sort((a, b) => b.year - a.year || b.month - a.month)
      setCycles(updatedList)

      if (updatedList.length > 0) {
        setSelectedCycleId(updatedList[0].id)
      } else {
        setSelectedCycleId('')
      }

      if (onProgress) {
        onProgress()
      }
    } catch (err: any) {
      toast.error('Dönem silinirken hata oluştu: ' + err.message)
    }
  }

  const months = [
    { value: '1', label: 'Ocak' },
    { value: '2', label: 'Şubat' },
    { value: '3', label: 'Mart' },
    { value: '4', label: 'Nisan' },
    { value: '5', label: 'Mayıs' },
    { value: '6', label: 'Haziran' },
    { value: '7', label: 'Temmuz' },
    { value: '8', label: 'Ağustos' },
    { value: '9', label: 'Eylül' },
    { value: '10', label: 'Ekim' },
    { value: '11', label: 'Kasım' },
    { value: '12', label: 'Aralık' },
  ]

  const cycleStatusLabels: Record<BrandOperationCycle['status'], string> = {
    planning: 'Planlama',
    active: 'Aktif',
    completed: 'Tamamlandı',
    archived: 'Arşivlendi',
    cancelled: 'İptal Edildi',
  }

  const cycleStatusColors: Record<BrandOperationCycle['status'], string> = {
    planning: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
    active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    archived: 'bg-neutral-800 text-neutral-500 border-neutral-800',
    cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }

  return (
    <div className="rounded-2xl border overflow-hidden bg-card/30 backdrop-blur-md shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            Canlı İş Akışları
          </h3>
          <p className="text-xs text-muted-foreground">
            Bu markaya ait aylık operasyon dönemlerinden üretilen iş akışlarını takip edin ve yönetin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cycle Dropdown */}
          {cycles.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-44">
                <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
                  <SelectTrigger className="h-9 text-xs bg-muted/10 border-neutral-700">
                    <SelectValue placeholder="Dönem seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cycles.map((c) => {
                      const mName = months.find((m) => m.value === c.month + '')?.label || c.month
                      return (
                        <SelectItem key={c.id} value={c.id} className="text-xs">
                          {mName} {c.year}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleDeleteCycle}
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg text-red-400 hover:text-red-300 hover:bg-rose-500/10 border border-neutral-800"
                title="Seçili Dönemi (Planı) Sil"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button
            type="button"
            onClick={() => setShowCreateCycle(!showCreateCycle)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-4 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {showCreateCycle ? 'Kapat' : 'Yeni Dönem Başlat'}
          </Button>
        </div>
      </div>

      {/* Yeni Dönem Oluşturma Formu Panel */}
      {showCreateCycle && (
        <div className="bg-muted/10 border border-neutral-800 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800/60">
            <Calendar className="h-4 w-4 text-blue-500" />
            <h4 className="text-sm font-bold text-foreground">Yeni Aylık Operasyon Dönemi</h4>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Dönem Ayı</label>
              <Select value={newMonth} onValueChange={setNewMonth}>
                <SelectTrigger className="h-10 text-xs bg-muted/15 border-neutral-700">
                  <SelectValue placeholder="Ay seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-xs">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Dönem Yılı</label>
              <Input
                type="number"
                min="2020"
                max="2035"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                className="h-10 text-xs bg-muted/15 border-neutral-700 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Notlar (Opsiyonel)</label>
              <Input
                placeholder="Örn. Yıl sonu kampanyası, indirim dönemi..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="h-10 text-xs bg-muted/15 border-neutral-700 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bu Ayın Planını Özelleştir (Opsiyonel) */}
          <div className="border-t border-neutral-850 pt-4 space-y-3">
            <div>
              <h5 className="text-xs font-bold text-foreground">Bu Dönemin Planını Özelleştir (Opsiyonel)</h5>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Bu aya özel olarak hedefleri değiştirebilir, yeni hedefler ekleyebilir veya çıkarabilirsiniz. Şablon etkilenmez.
              </p>
            </div>

            {draftPlan.length > 0 ? (
              <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950/20 max-h-60 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b bg-muted/10 text-muted-foreground font-semibold">
                      <th className="p-2.5">Hedef Kalemi</th>
                      <th className="p-2.5 w-24">Tip</th>
                      <th className="p-2.5 w-24 text-center">Hedef Adet</th>
                      <th className="p-2.5 w-16 text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {draftPlan.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/5">
                        <td className="p-2.5 font-medium text-foreground">{item.title}</td>
                        <td className="p-2.5">
                          <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0.5 rounded">
                            {OPERATION_PLAN_ITEM_TYPE_LABELS[item.type as keyof typeof OPERATION_PLAN_ITEM_TYPE_LABELS] || item.type}
                          </Badge>
                        </td>
                        <td className="p-2.5">
                          <div className="flex justify-center">
                            <Input
                              type="number"
                              min="1"
                              value={item.target}
                              onChange={(e) => updateDraftItemTarget(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                              className="h-7 w-16 text-center text-xs bg-muted/20 border-neutral-700 focus:ring-1 focus:ring-blue-500 font-bold"
                            />
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDraftItem(item.id)}
                            className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-rose-500/10 rounded"
                            title="Bu Ayın Planından Çıkar"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-muted-foreground italic border border-dashed border-neutral-800 rounded-lg">
                Planda hiç kalem bulunmuyor. Aşağıdan yeni ekleyebilirsiniz.
              </div>
            )}

            {/* Yeni Kalem Ekleme Satırı (Bu aya özel) */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-muted/5 border border-neutral-850 rounded-lg text-xs">
              <div className="flex-1 min-w-[150px]">
                <Input
                  placeholder="Aya özel yeni hedef..."
                  value={newDraftTitle}
                  onChange={(e) => setNewDraftTitle(e.target.value)}
                  className="h-8 text-xs bg-muted/10 border-neutral-700"
                />
              </div>
              <div className="w-32">
                <Select value={newDraftType} onValueChange={(val) => setNewDraftType(val as any)}>
                  <SelectTrigger className="h-8 text-xs bg-muted/10 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(OPERATION_PLAN_ITEM_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value} className="text-xs">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-20">
                <Input
                  type="number"
                  min="1"
                  value={newDraftTarget}
                  onChange={(e) => setNewDraftTarget(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-8 text-center text-xs bg-muted/10 border-neutral-700"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddDraftItem}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-3 rounded-lg"
              >
                <Plus className="h-3 w-3 mr-1" /> Ekle
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateCycle(false)}
              className="text-xs h-9 px-4 border"
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              onClick={handleCreateCycle}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-4"
            >
              Oluştur
            </Button>
          </div>
        </div>
      )}

      {/* Selected Cycle Content */}
      {selectedCycle ? (
        <div className="space-y-5">
          {/* Cycle Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-neutral-900/10 border border-neutral-800 rounded-xl">
            <div className="flex items-center gap-3">
              <Layers className="h-4.5 w-4.5 text-neutral-400" />
              <div>
                <span className="text-xs text-muted-foreground">Seçili Dönem Durumu</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider', cycleStatusColors[selectedCycle.status])}>
                    {cycleStatusLabels[selectedCycle.status]}
                  </Badge>
                  {selectedCycle.notes && (
                    <span className="text-xs text-muted-foreground italic border-l border-neutral-800 pl-2">
                      &quot;{selectedCycle.notes}&quot;
                    </span>
                  )}
                </div>
              </div>
            </div>

            {selectedCycle.status !== 'completed' && selectedCycle.status !== 'cancelled' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onRequestCancelCycle?.(handleCancelCycle)}
                className="h-8 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold px-3 rounded-lg transition-all"
              >
                Dönemi İptal Et
              </Button>
            )}

            {/* Dönem iptal edildi ama instance'lar hâlâ aktif → yetim kayıt temizleyici */}
            {selectedCycle.status === 'cancelled' &&
              instances.some((i) => i.status !== 'cancelled') && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelCycle}
                className="h-8 text-xs border-orange-500/30 text-orange-400 hover:bg-orange-500/10 font-bold px-3 rounded-lg transition-all"
              >
                ⚠ İş Akışlarını Temizle
              </Button>
            )}
          </div>

          {/* İptal Onay Modalı artık parent (operations-page) seviyesinde render edilmektedir */}

          {/* Workflow Instances Section */}
          {/* allCancelled: tüm instance'lar iptal → yeniden oluşturulabilir */}
          {(() => {
            const allCancelled = instances.length > 0 && instances.every((i) => i.status === 'cancelled')
            const showEmpty = instances.length === 0 || allCancelled
            return showEmpty ? (
              <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-neutral-800 bg-neutral-950/5 space-y-4">
                <div className="rounded-full bg-neutral-900/60 p-3 border border-neutral-800">
                  <Info className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">
                    {allCancelled ? 'İş Akışları İptal Edildi' : 'İş Akışları Oluşturulmamış'}
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    {allCancelled
                      ? 'Bu dönemin tüm iş akışları iptal edildi. Yeniden oluşturabilirsiniz.'
                      : 'Bu operasyon dönemine ait iş akışı örnekleri henüz üretilmemiştir. Kalemlerin takibine başlamak için aşağıdan üretin.'}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleGenerateWorkflows}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 flex items-center gap-1.5 shadow"
                >
                  <Play className="h-3.5 w-3.5" />
                  {allCancelled ? 'Yeniden Oluştur' : 'İş Akışlarını Oluştur'}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {instances.filter((i) => i.status !== 'cancelled').map((instance) => {
                  const instanceSteps = steps.filter((s) => s.workflowInstanceId === instance.id)
                  return (
                    <WorkflowInstanceCard
                      key={instance.id}
                      instance={instance}
                      steps={instanceSteps}
                      onProgress={handleWorkflowProgress}
                    />
                  )
                })}
              </div>
            )
          })()}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground text-xs bg-muted/5 rounded-xl border border-dashed border-neutral-800 flex flex-col items-center justify-center space-y-2">
          <Calendar className="h-7 w-7 text-neutral-600" />
          <span>Bu marka için henüz aktif veya planlanan bir operasyon dönemi oluşturulmamış.</span>
          <span className="text-[10px] text-muted-foreground/60">Yukarıdaki &quot;Yeni Dönem Başlat&quot; butonuna basarak ilk aylık dönemi başlatabilirsiniz.</span>
        </div>
      )}

      {/* Dönem Silme Onay Modalı */}
      {showDeleteCycleConfirm && cycleToDelete && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </span>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white">Operasyon Dönemini Sil?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  &quot;{months.find((m) => m.value === cycleToDelete.month + '')?.label || cycleToDelete.month} {cycleToDelete.year}&quot; operasyon dönemini ve bu döneme ait tüm canlı iş akışlarını silmek istediğinize emin misiniz?
                  <br />
                  <strong className="text-red-400 mt-1 block">Bu işlem kalıcıdır ve geri alınamaz!</strong>
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowDeleteCycleConfirm(false); setCycleToDelete(null) }}
                className="h-9 text-xs border border-neutral-850"
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDeleteCycle}
                className="h-9 text-xs bg-red-650 hover:bg-red-750 text-white font-bold"
              >
                Evet, Kalıcı Olarak Sil
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* İş Akışı Üretim Loading Ekranı */}
      {isGenerating && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 max-w-sm w-full flex flex-col items-center text-center space-y-4 shadow-2xl">
            <div className="relative flex items-center justify-center">
              {/* Spinner */}
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-500"></div>
              {/* Icon */}
              <div className="absolute animate-pulse text-blue-400">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">İş Akışları Oluşturuluyor...</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Plan kalemleri çözümleniyor, ekip üyeleri görevlere atanıyor ve canlı akışlar başlatılıyor. Lütfen bekleyin.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
