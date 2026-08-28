'use client'

import React, { useState } from 'react'
import type { Employee, Brand, WorkflowInstance, WorkflowStepInstance, ResponsibilityRole } from '@/types/domain'
import { isCreativeProductionResponsibility } from '@/types/domain'
import { saveWorkflowSteps, saveWorkflowInstances, getStoredWorkflowInstances } from '@/lib/storage/local-workflow-instance-store'
import { getStoredCycles } from '@/lib/storage/local-cycle-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sparkles,
  Plus,
  Trash2,
  Paperclip,
  Link as LinkIcon,
  Calendar,
  Clock,
  AlertTriangle,
  User,
  Building,
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  FileText,
  Copy,
  Upload,
  X,
  ExternalLink,
  ImageIcon,
  Eye,
  Info,
  Flame,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface TaskFileAttachment {
  id: string
  name: string
  size: number
  type: string
  base64: string
}

export interface TaskRefLink {
  id: string
  title: string
  url: string
}

export interface TaskDraft {
  id: string
  title: string
  brandId: string // 'general' or specific brand ID
  priority: TaskPriority
  dueDate: string // YYYY-MM-DD
  dueTime: string // HH:MM
  responsibilityRole: ResponsibilityRole
  creativeCount?: number | null
  detail: string
  links: TaskRefLink[]
  files: TaskFileAttachment[]
}

interface CustomTaskModalProps {
  isOpen: boolean
  onClose: () => void
  employees: Employee[]
  brands: Brand[]
  instances: WorkflowInstance[]
  onSuccess: () => void
  defaultAssigneeId?: string
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export function CustomTaskModal({
  isOpen,
  onClose,
  employees,
  brands,
  instances,
  onSuccess,
  defaultAssigneeId = '',
}: CustomTaskModalProps) {
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>(defaultAssigneeId || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  function createEmptyTaskDraft(): TaskDraft {
    const today = new Date().toISOString().split('T')[0]
    return {
      id: 'draft-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      title: '',
      brandId: 'general',
      priority: 'medium',
      dueDate: today,
      dueTime: '18:00',
      responsibilityRole: 'custom',
      creativeCount: null,
      detail: '',
      links: [],
      files: [],
    }
  }

  // Multi-task drafts list
  const [tasks, setTasks] = useState<TaskDraft[]>([
    createEmptyTaskDraft()
  ])

  if (!isOpen) return null

  const handleAddTaskDraft = () => {
    setTasks(prev => [...prev, createEmptyTaskDraft()])
    toast.success('Yeni görev formu eklendi', {
      description: 'Aynı personele atanacak bir görev daha eklendi.'
    })
  }

  const handleDuplicateTaskDraft = (index: number) => {
    const source = tasks[index]
    const cloned: TaskDraft = {
      ...source,
      id: 'draft-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      title: source.title ? source.title + ' (Kopya)' : 'Kopya Görev',
      links: [...source.links.map(l => ({ ...l, id: 'link-' + Date.now() + '-' + Math.random() }))],
      files: [...source.files.map(f => ({ ...f, id: 'file-' + Date.now() + '-' + Math.random() }))]
    }
    setTasks(prev => [...prev.slice(0, index + 1), cloned, ...prev.slice(index + 1)])
    toast.info('Görev kopyalandı')
  }

  const handleRemoveTaskDraft = (index: number) => {
    if (tasks.length === 1) {
      toast.error('En az bir görev bulunmalıdır.')
      return
    }
    setTasks(prev => prev.filter((_, i) => i !== index))
  }

  const updateTask = (index: number, updates: Partial<TaskDraft>) => {
    setTasks(prev => prev.map((t, i) => i === index ? { ...t, ...updates } : t))
  }

  // Formatting Toolbar Helper
  const insertFormatting = (taskIndex: number, tagType: string) => {
    const textarea = document.getElementById('task-detail-' + taskIndex) as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentText = tasks[taskIndex].detail
    const selectedText = currentText.substring(start, end)

    let replacement = ''

    switch (tagType) {
      case 'bold':
        replacement = selectedText ? '**' + selectedText + '**' : '**Kalın Metin**'
        break
      case 'italic':
        replacement = selectedText ? '*' + selectedText + '*' : '*İtalik Metin*'
        break
      case 'h1':
        replacement = '\n# ' + (selectedText || 'Büyük Başlık') + '\n'
        break
      case 'h2':
        replacement = '\n## ' + (selectedText || 'Alt Başlık') + '\n'
        break
      case 'bullet':
        if (selectedText.includes('\n')) {
          replacement = selectedText.split('\n').map(l => '• ' + l).join('\n')
        } else {
          replacement = '\n• ' + (selectedText || 'Madde 1') + '\n• Madde 2\n'
        }
        break
      case 'numbered':
        if (selectedText.includes('\n')) {
          replacement = selectedText.split('\n').map((l, idx) => (idx + 1) + '. ' + l).join('\n')
        } else {
          replacement = '\n1. ' + (selectedText || 'Birinci Adım') + '\n2. İkinci Adım\n'
        }
        break
      case 'checklist':
        replacement = '\n[ ] ' + (selectedText || 'Yapılacak Madde 1') + '\n[ ] Yapılacak Madde 2\n'
        break
      case 'callout':
        replacement = '\n> 💡 **Önemli Not:** ' + (selectedText || 'Lütfen bu detaya dikkat ediniz.') + '\n'
        break
      default:
        break
    }

    const newText = currentText.substring(0, start) + replacement + currentText.substring(end)
    updateTask(taskIndex, { detail: newText })

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + replacement.length, start + replacement.length)
    }, 50)
  }

  // Links management
  const handleAddLink = (taskIndex: number) => {
    const task = tasks[taskIndex]
    const newLink: TaskRefLink = {
      id: 'link-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: '',
      url: ''
    }
    updateTask(taskIndex, { links: [...task.links, newLink] })
  }

  const handleUpdateLink = (taskIndex: number, linkId: string, field: 'title' | 'url', value: string) => {
    const task = tasks[taskIndex]
    const updated = task.links.map(l => l.id === linkId ? { ...l, [field]: value } : l)
    updateTask(taskIndex, { links: updated })
  }

  const handleRemoveLink = (taskIndex: number, linkId: string) => {
    const task = tasks[taskIndex]
    updateTask(taskIndex, { links: task.links.filter(l => l.id !== linkId) })
  }

  // File Attachments Management with 5MB validation and extension whitelist
  const ALLOWED_TASK_FILE_EXTS = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv',
    'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'heic',
    'mp4', 'mov', 'avi', 'mkv', 'mp3', 'wav',
    'zip', 'rar', '7z', 'psd', 'ai', 'prproj', 'aep'
  ]
  const DANGEROUS_EXTS = ['exe', 'bat', 'cmd', 'sh', 'vbs', 'js', 'mjs', 'html', 'htm', 'php', 'phtml', 'jar', 'apk']

  const handleFileUpload = (taskIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    let rejectedCount = 0
    let invalidExtCount = 0

    Array.from(files).forEach((file) => {
      const ext = (file.name.split('.').pop() || '').toLowerCase()

      if (DANGEROUS_EXTS.includes(ext) || !ALLOWED_TASK_FILE_EXTS.includes(ext)) {
        invalidExtCount++
        return
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        rejectedCount++
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        const attachment: TaskFileAttachment = {
          id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
          name: file.name,
          size: file.size,
          type: file.type,
          base64: base64
        }
        setTasks(prev => prev.map((t, idx) => idx === taskIndex ? { ...t, files: [...t.files, attachment] } : t))
      }
      reader.readAsDataURL(file)
    })

    if (invalidExtCount > 0) {
      toast.error('Güvenlik Uyarısı', {
        description: `${invalidExtCount} dosya geçersiz veya riskli dosya formatı nedeniyle engellendi.`
      })
    } else if (rejectedCount > 0) {
      toast.error('Dosya Boyut Sınırı', {
        description: `${rejectedCount} dosya 5MB sınırını aştığı için yüklenemedi.`
      })
    } else {
      toast.success('Dosyalar başarıyla eklendi.')
    }

    e.target.value = ''
  }

  const handleRemoveFile = (taskIndex: number, fileId: string) => {
    const task = tasks[taskIndex]
    updateTask(taskIndex, { files: task.files.filter(f => f.id !== fileId) })
  }

  // Submit all tasks in batch
  const handleSaveAllTasks = async () => {
    if (!targetEmployeeId || targetEmployeeId === 'unassigned') {
      toast.error('Lütfen görevlerin atanacağı ekip üyesini (çalışanı) seçin.')
      return
    }

    for (let i = 0; i < tasks.length; i++) {
      if (!tasks[i].title.trim()) {
        toast.error('Görev #' + (i + 1) + ' için lütfen bir başlık giriniz.')
        return
      }
      if (isCreativeProductionResponsibility(tasks[i].responsibilityRole)) {
        const count = tasks[i].creativeCount
        if (count === undefined || count === null || !Number.isInteger(count) || count < 1) {
          toast.error(`Görev #${i + 1} için lütfen geçerli bir kreatif adedi (en az 1 tam sayı) giriniz.`)
          return
        }
      }
    }

    setIsSubmitting(true)
    try {
      const allStoredInstances = await getStoredWorkflowInstances()
      const allCycles = await getStoredCycles()
      const newStepsToSave: WorkflowStepInstance[] = []
      const newInstancesToSave: WorkflowInstance[] = []

      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i]
        let instanceId = ''

        if (task.brandId === 'general' || !task.brandId) {
          let generalInst = allStoredInstances.find(inst => inst.id === 'inst-general-agency-tasks' || inst.title === 'Genel Ajans İşleri')
          if (!generalInst) {
            generalInst = {
              id: 'inst-general-agency-tasks',
              brandId: brands[0]?.id || 'general-brand',
              cycleId: undefined,
              operationPlanItemId: 'op-general-tasks',
              operationTemplateId: 'general-operation',
              workflowTemplateId: 'general-workflow',
              title: 'Genel Ajans & Özel Görevler',
              status: 'in_progress',
              currentStepId: 'step-' + Date.now() + '-' + i,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            newInstancesToSave.push(generalInst)
          }
          instanceId = generalInst.id
        } else {
          let brandInst = allStoredInstances.find(inst => inst.brandId === task.brandId && inst.status !== 'completed' && inst.status !== 'cancelled')
          if (!brandInst) {
            const selectedBrand = brands.find(b => b.id === task.brandId)
            const brandCycle = allCycles.find(c => c.brandId === task.brandId && c.status === 'active') || allCycles.find(c => c.brandId === task.brandId)
            brandInst = {
              id: 'inst-custom-' + task.brandId + '-' + Date.now() + '-' + i,
              brandId: task.brandId,
              cycleId: brandCycle ? brandCycle.id : undefined,
              operationPlanItemId: 'op-custom',
              operationTemplateId: 'custom-operation',
              workflowTemplateId: 'custom-workflow',
              title: (selectedBrand?.name || 'Marka') + ' Özel Görevleri',
              status: 'in_progress',
              currentStepId: 'step-' + Date.now() + '-' + i,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            newInstancesToSave.push(brandInst)
          }
          instanceId = brandInst.id
        }

        const priorityLabels: Record<TaskPriority, string> = {
          low: 'Düşük',
          medium: 'Normal / Orta',
          high: 'Yüksek',
          urgent: 'Acil / Kritik'
        }

        let structuredDescription = ''
        structuredDescription += '[Öncelik]: ' + (priorityLabels[task.priority] || 'Normal / Orta') + '\n'

        if (task.dueTime) {
          structuredDescription += '[Teslim Saati]: ' + task.dueTime + '\n'
        }

        if (task.brandId === 'general') {
          structuredDescription += '[Kategori]: Genel / Markadan Bağımsız Ajans İşi\n'
        }

        if (task.detail.trim()) {
          structuredDescription += '\n[Özel Görev Detayı]:\n' + task.detail.trim() + '\n'
        }

        if (task.links.length > 0) {
          const linksText = task.links
            .filter(l => l.url.trim())
            .map(l => '- ' + (l.title.trim() ? l.title.trim() + ': ' : '') + l.url.trim())
            .join('\n')
          if (linksText) {
            structuredDescription += '\n[Referans Bağlantılar]:\n' + linksText + '\n'
          }
        }

        if (task.files.length > 0) {
          try {
            const filesJson = JSON.stringify(task.files.map(f => ({
              id: f.id,
              name: f.name,
              size: f.size,
              type: f.type,
              base64: f.base64
            })))
            structuredDescription += '\n[Ekli Dosyalar / Görseller]:\n' + filesJson + '\n'
          } catch (e) {
            console.error('File serialization error:', e)
          }
        }

        const dueDateTime = task.dueDate ? task.dueDate + 'T' + (task.dueTime || '18:00') + ':00.000Z' : undefined

        const newStep: WorkflowStepInstance = {
          id: 'step-custom-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substr(2, 4),
          workflowInstanceId: instanceId,
          workflowStepTemplateId: 'custom-step-template',
          title: task.title.trim(),
          description: structuredDescription.trim(),
          order: 99 + i,
          status: 'active',
          requiresApproval: false,
          isFinalStep: false,
          responsibilityRole: task.responsibilityRole,
          creativeCount: isCreativeProductionResponsibility(task.responsibilityRole) ? task.creativeCount : null,
          assignedEmployeeId: targetEmployeeId,
          dueDate: dueDateTime,
          assignedAt: new Date().toISOString(),
          startedAt: new Date().toISOString()
        }

        newStepsToSave.push(newStep)
      }

      if (newInstancesToSave.length > 0) {
        await saveWorkflowInstances(newInstancesToSave, [])
      }

      await saveWorkflowSteps(newStepsToSave)

      const targetEmp = employees.find(e => e.id === targetEmployeeId)
      toast.success('Görevler Başarıyla Atandı!', {
        description: newStepsToSave.length + ' adet görev ' + (targetEmp?.fullName || 'çalışana') + ' başarıyla atandı.'
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Task batch creation error:', err)
      toast.error('Görevler atanırken bir hata oluştu: ' + (err.message || err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityBadgeClass = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/40 font-black animate-pulse'
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
      case 'medium':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-medium'
      case 'low':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-medium'
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:px-6 border-b border-neutral-850 flex items-center justify-between bg-neutral-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Özel Görev Ata & Çoklu Görev Kuyruğu
                <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-300 border-indigo-500/30 font-bold">
                  {tasks.length} Görev
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Markadan bağımsız veya markalı, zengin detaylı, 5MB dosya ve sınırsız linkli görevleri tek ekrandan atayın.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* MODAL BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* 1. ÇALIŞAN SEÇİMİ (Ana Hedef Kişi) */}
          <div className="bg-gradient-to-r from-neutral-900/90 to-neutral-900/40 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <label className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-4 w-4 text-indigo-400" />
                  Görevlerin Atanacağı Ekip Üyesi (Çalışan) *
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Aşağıda tanımlayacağınız tüm görevler bu seçtiğiniz kişiye tek seferde atanacaktır.
                </p>
              </div>

              <div className="w-full sm:w-72">
                <Select value={targetEmployeeId || undefined} onValueChange={setTargetEmployeeId}>
                  <SelectTrigger className="h-10 text-xs bg-neutral-950 border-neutral-800 focus:border-indigo-500 font-bold text-white">
                    <SelectValue placeholder="👤 Çalışan Seçin..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 z-[99999]">
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id} className="text-xs font-semibold">
                        {emp.fullName} ({emp.title || 'Personel'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 2. GÖREV KARTLARI LİSTESİ */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-400" />
                Tanımlanan Görevler ({tasks.length})
              </h3>
              <Button
                type="button"
                onClick={handleAddTaskDraft}
                className="h-8 text-xs px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow"
              >
                <Plus className="h-3.5 w-3.5" /> + Bir Görev Daha Ekle
              </Button>
            </div>

            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4 relative group transition-all hover:border-neutral-700"
              >
                {/* Kart Üst Başlık & Aksiyonlar */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm font-black text-white">
                      {task.title || ('Görev #' + (index + 1))}
                    </span>
                    <Badge variant="outline" className={cn('text-[10px] uppercase tracking-wider', getPriorityBadgeClass(task.priority))}>
                      {task.priority === 'urgent' ? '🔥 Acil' : task.priority === 'high' ? '⚡ Yüksek' : task.priority === 'medium' ? 'Normal' : 'Düşük'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicateTaskDraft(index)}
                      className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                      title="Görevi Kopyala"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTaskDraft(index)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Görevi Kaldır"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid Kontroller: Başlık, Marka, Öncelik, Rol */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Görev Başlığı */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Görev Başlığı *</label>
                    <Input
                      value={task.title}
                      onChange={(e) => updateTask(index, { title: e.target.value })}
                      placeholder="Örn: 5x Instagram Reels montajlarının teslimi"
                      className="h-9 text-xs bg-neutral-950 border-neutral-800 focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  {/* Marka Seçimi (Genel Ajans İşi Destekli) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Marka / Proje</label>
                    <Select value={task.brandId || 'general'} onValueChange={(val) => updateTask(index, { brandId: val })}>
                      <SelectTrigger className="h-9 text-xs bg-neutral-950 border-neutral-800 font-semibold text-white">
                        <SelectValue placeholder="Marka Seçin" />
                      </SelectTrigger>
                      <SelectContent className="z-[99999]">
                        <SelectItem value="general" className="text-xs font-bold text-purple-400">
                          🏢 Genel Ajans İşi (Markasız)
                        </SelectItem>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id} className="text-xs">
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Öncelik Sırası */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Önem Sırası</label>
                    <Select value={task.priority || 'medium'} onValueChange={(val) => updateTask(index, { priority: val as TaskPriority })}>
                      <SelectTrigger className="h-9 text-xs bg-neutral-950 border-neutral-800 font-bold text-white">
                        <SelectValue placeholder="Öncelik Seçin" />
                      </SelectTrigger>
                      <SelectContent className="z-[99999]">
                        <SelectItem value="low" className="text-xs text-emerald-400 font-medium">🟢 Düşük Öncelik</SelectItem>
                        <SelectItem value="medium" className="text-xs text-blue-400 font-semibold">🔵 Normal / Orta</SelectItem>
                        <SelectItem value="high" className="text-xs text-amber-400 font-bold">🟠 Yüksek Öncelik</SelectItem>
                        <SelectItem value="urgent" className="text-xs text-red-400 font-black">🔴 Acil / Kritik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Departman / Sorumluluk Rolü */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Sorumlu Rol / Alan</label>
                    <Select value={task.responsibilityRole || 'custom'} onValueChange={(val) => updateTask(index, { responsibilityRole: val as ResponsibilityRole })}>
                      <SelectTrigger className="h-9 text-xs bg-neutral-950 border-neutral-800 font-semibold text-white">
                        <SelectValue placeholder="Rol Seçin" />
                      </SelectTrigger>
                      <SelectContent className="z-[99999]">
                        <SelectItem value="custom" className="text-xs font-bold">Özel Görev / Operasyon</SelectItem>
                        <SelectItem value="video_editing" className="text-xs">Video Kurgu & Montaj</SelectItem>
                        <SelectItem value="graphic_design" className="text-xs">Grafik Tasarım</SelectItem>
                        <SelectItem value="social_media" className="text-xs">Sosyal Medya Yönetimi</SelectItem>
                        <SelectItem value="digital_marketing" className="text-xs">Dijital Pazarlama & Meta Ads</SelectItem>
                        <SelectItem value="photography" className="text-xs">Fotoğraf Prodüksiyonu</SelectItem>
                        <SelectItem value="videography" className="text-xs">Video Çekim & Prodüksiyon</SelectItem>
                        <SelectItem value="strategy" className="text-xs">Strateji & Müşteri Yönetimi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Kreatif Adedi (Kreatif Üretim Sorumlulukları İçin) */}
                  {isCreativeProductionResponsibility(task.responsibilityRole) && (
                    <div className="space-y-1 sm:col-span-2 bg-purple-950/20 border border-purple-800/40 rounded-xl p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Zap className="h-3.5 w-3.5 text-purple-400" />
                        <label className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Kreatif Adedi (Zorunlu)</label>
                      </div>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Örn: 8"
                        value={task.creativeCount ?? ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value, 10) : null
                          updateTask(index, { creativeCount: val })
                        }}
                        className="h-9 text-xs bg-neutral-950 border-purple-700/50 font-bold text-purple-200"
                      />
                      <p className="text-[9px] text-purple-400/80 mt-1">Bu kreatif üretim görevinin kapsadığı adet miktarını girin.</p>
                    </div>
                  )}

                  {/* Son Teslim Tarihi (Deadline) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Teslim Tarihi</label>
                    <Input
                      type="date"
                      value={task.dueDate}
                      onChange={(e) => updateTask(index, { dueDate: e.target.value })}
                      className="h-9 text-xs bg-neutral-950 border-neutral-800"
                    />
                  </div>

                  {/* Son Teslim Saati */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Teslim Saati</label>
                    <Input
                      type="time"
                      value={task.dueTime}
                      onChange={(e) => updateTask(index, { dueTime: e.target.value })}
                      className="h-9 text-xs bg-neutral-950 border-neutral-800"
                    />
                  </div>
                </div>

                {/* 3. WORD BENZERİ ZENGİN GÖREV DETAY EDİTÖRÜ */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-indigo-400" />
                      Görev Detayı & Talimatlar (Word Formatında Başlık ve Maddeler)
                    </label>

                    {/* Biçimlendirme Araç Çubuğu */}
                    <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => insertFormatting(index, 'bold')}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
                        title="Kalın Yazı (Bold)"
                      >
                        <Bold className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(index, 'italic')}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
                        title="İtalik Yazı"
                      >
                        <Italic className="h-3 w-3" />
                      </button>
                      <div className="h-3 w-px bg-neutral-800" />
                      <button
                        type="button"
                        onClick={() => insertFormatting(index, 'h1')}
                        className="px-1.5 py-0.5 rounded text-[10px] font-black text-neutral-400 hover:text-white hover:bg-neutral-800"
                        title="Büyük Başlık"
                      >
                        H1
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(index, 'h2')}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-neutral-400 hover:text-white hover:bg-neutral-800"
                        title="Alt Başlık"
                      >
                        H2
                      </button>
                      <div className="h-3 w-px bg-neutral-800" />
                      <button
                        type="button"
                        onClick={() => insertFormatting(index, 'bullet')}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
                        title="Madde Madde Liste"
                      >
                        <List className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(index, 'numbered')}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
                        title="Numaralı Liste"
                      >
                        <ListOrdered className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(index, 'checklist')}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
                        title="Kontrol Listesi"
                      >
                        <CheckSquare className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting(index, 'callout')}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400 hover:bg-neutral-800"
                        title="Önemli Not Kutusu"
                      >
                        💡 Not
                      </button>
                    </div>
                  </div>

                  <textarea
                    id={'task-detail-' + index}
                    rows={4}
                    value={task.detail}
                    onChange={(e) => updateTask(index, { detail: e.target.value })}
                    placeholder="Örn:
# Genel Talimatlar
• 4K 9:16 formatında kurgulanacak
• Dinamik alt yazı ve ses miksajı yapılacak

> 💡 **Önemli:** Cuma günü saat 15:00'e kadar ön onay alınmalı."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-y"
                  />
                </div>

                {/* 4. SINIRSIZ REFERANS LİNKLERİ */}
                <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <LinkIcon className="h-3.5 w-3.5 text-blue-400" />
                      Referans / Drive / Figma Bağlantıları (Sınırsız)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddLink(index)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> + Link Ekle
                    </button>
                  </div>

                  {task.links.length === 0 ? (
                    <div className="text-[11px] text-neutral-600 italic px-1">
                      Henüz harici bir bağlantı eklenmedi. (Drive, Figma, YouTube vb. linkler ekleyebilirsiniz)
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {task.links.map((link) => (
                        <div key={link.id} className="flex items-center gap-2">
                          <Input
                            placeholder="Başlık (Örn: Drive Ham Videolar)"
                            value={link.title}
                            onChange={(e) => handleUpdateLink(index, link.id, 'title', e.target.value)}
                            className="h-8 text-xs bg-neutral-950 border-neutral-800 w-1/3"
                          />
                          <Input
                            placeholder="URL (https://drive.google.com/...)"
                            value={link.url}
                            onChange={(e) => handleUpdateLink(index, link.id, 'url', e.target.value)}
                            className="h-8 text-xs bg-neutral-950 border-neutral-800 flex-1 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(index, link.id)}
                            className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. 5MB SINIRLI GÖRSEL & DOSYA YÜKLEME */}
                <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-purple-400" />
                      Dosya & Görseller (Maks. 5MB / Adet)
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      {task.files.length} dosya eklendi
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Dosya Seç Butonu */}
                    <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-950 border border-dashed border-neutral-700 hover:border-purple-500 text-neutral-300 text-xs font-semibold cursor-pointer transition-all hover:bg-purple-950/20">
                      <Upload className="h-4 w-4 text-purple-400" />
                      <span>Görsel / Dosya Seç (Maks 5MB)</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.zip,.psd"
                        onChange={(e) => handleFileUpload(index, e)}
                        className="hidden"
                      />
                    </label>

                    {/* Yüklenen Dosyaların Önizlemeleri */}
                    {task.files.map((file) => {
                      const isImg = file.type.startsWith('image/') || file.base64.startsWith('data:image/')
                      return (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 group"
                        >
                          {isImg ? (
                            <img
                              src={file.base64}
                              alt={file.name}
                              className="w-6 h-6 object-cover rounded-md cursor-pointer hover:opacity-80"
                              onClick={() => setPreviewImage(file.base64)}
                              title="Büyütmek için tıklayın"
                            />
                          ) : (
                            <FileText className="h-4 w-4 text-blue-400" />
                          )}
                          <span className="truncate max-w-[120px]" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            ({(file.size / 1024).toFixed(0)} KB)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index, file.id)}
                            className="text-neutral-500 hover:text-red-400 p-0.5 rounded"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:px-6 border-t border-neutral-850 bg-neutral-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4 text-indigo-400" />
            <span>
              {targetEmployeeId
                ? ((employees.find(e => e.id === targetEmployeeId)?.fullName || 'Çalışan') + ' için ' + tasks.length + ' görev hazırlanıyor.')
                : 'Lütfen yukarıdan görev atanacak ekip üyesini seçin.'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 text-xs rounded-xl flex-1 sm:flex-initial"
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              onClick={handleSaveAllTasks}
              disabled={isSubmitting}
              className="h-10 text-xs px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-lg shadow-indigo-600/30 flex-1 sm:flex-initial flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isSubmitting ? 'Atanıyor...' : ('Tüm Görevleri Ata (' + tasks.length + ' Görev)')}
            </Button>
          </div>
        </div>

      </div>

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
