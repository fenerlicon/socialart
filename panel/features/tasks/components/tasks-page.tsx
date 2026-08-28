'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Employee, WorkflowStepInstance, WorkflowInstance, Brand, ResponsibilityRole, BrandOperationCycle } from '@/types/domain'
import { isCreativeProductionResponsibility } from '@/types/domain'
import { getStoredEmployees, getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { getWorkflowStepInstances, updateWorkflowStepInstance, getStoredWorkflowInstances, saveWorkflowInstances, saveWorkflowSteps, saveWorkflowHistory } from '@/lib/storage/local-workflow-instance-store'
import { getStoredBrands } from '@/lib/storage/local-brand-store'
import { getStoredCycles } from '@/lib/storage/local-cycle-store'
import { supabase } from '@/lib/supabase/client'
import { resolvePanelAuthority, isManagerOrAdmin, isStepInScope, usePrincipal, ROLE_TO_TEAM } from '@/lib/permissions/panel-authority'
import { AccessDenied } from '@/components/shared/access-denied'
import { TaskDetailDrawer } from '@/features/my-work/components/task-detail-drawer'
import { CustomTaskModal } from '@/components/shared/custom-task-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle2,
  Clock,
  User,
  Users,
  Building,
  Plus,
  Calendar,
  ShieldCheck,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowRightLeft,
  Sparkles,
  X,
  Send,
  Flame,
  Paperclip,
  Link as LinkIcon,
  Layers,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const parseStepDetails = (description: string) => {
  if (!description) {
    return {
      note: '',
      links: [],
      files: [],
      cleanDesc: '',
      priority: null,
      customDetail: '',
      refLinks: [],
      attachments: [],
      isGeneral: false,
      dueTime: ''
    }
  }

  const priorityMatch = description.match(/\[Öncelik\]:\s*(.*?)(?=\n\[|$)/)
  const dueTimeMatch = description.match(/\[Teslim Saati\]:\s*(.*?)(?=\n\[|$)/)
  const categoryMatch = description.match(/\[Kategori\]:\s*(.*?)(?=\n\[|$)/)
  const customDetailMatch = description.match(/\[Özel Görev Detayı\]:\s*([\s\S]*?)(?=\n\[|$)/)
  const refLinksMatch = description.match(/\[Referans Bağlantılar\]:\s*([\s\S]*?)(?=\n\[|$)/)
  const filesJsonMatch = description.match(/\[Ekli Dosyalar \/ Görseller\]:\s*([\s\S]*?)(?=\n\[|$)/)
  const deliveryNoteMatch = description.match(/\[Teslim Açıklaması\]:\s*([\s\S]*?)(?=\n\[|$)/)
  const photoLinksMatch = description.match(/\[Fotoğraf\/Görsel Bağlantıları\]:\s*(.*?)(?=\n\[|$)/)
  const fileLinksMatch = description.match(/\[Dosya Bağlantıları\]:\s*(.*?)(?=\n\[|$)/)

  let attachments: any[] = []
  if (filesJsonMatch) {
    try {
      attachments = JSON.parse(filesJsonMatch[1].trim())
    } catch {}
  }

  let refLinks: { title: string; url: string }[] = []
  if (refLinksMatch) {
    refLinks = refLinksMatch[1].split('\n').filter(Boolean).map(line => {
      const trimmed = line.replace(/^-\s*/, '').trim()
      const parts = trimmed.split(': ')
      if (parts.length > 1 && parts[1].startsWith('http')) {
        return { title: parts[0], url: parts.slice(1).join(': ') }
      }
      return { title: 'Bağlantı', url: trimmed }
    })
  }

  const priority = priorityMatch ? priorityMatch[1].trim() : null
  const dueTime = dueTimeMatch ? dueTimeMatch[1].trim() : ''
  const isGeneral = categoryMatch ? categoryMatch[1].includes('Genel') : false
  const customDetail = customDetailMatch ? customDetailMatch[1].trim() : ''
  const note = deliveryNoteMatch ? deliveryNoteMatch[1].trim() : ''
  const photoLinks = photoLinksMatch ? photoLinksMatch[1].split(',').map(l => l.trim()).filter(Boolean) : []
  const fileLinks = fileLinksMatch ? fileLinksMatch[1].split(',').map(f => f.trim()).filter(Boolean) : []

  const cleanDesc = customDetail || description
    .replace(/\n\n\[[\s\S]*$/, '')
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

  return {
    priority,
    dueTime,
    isGeneral,
    customDetail,
    refLinks,
    attachments,
    note,
    photoLinks,
    fileLinks,
    cleanDesc
  }
}

export function TasksPage() {
  const router = useRouter()
  const { principal } = usePrincipal()

  // Auth states
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // Data States
  const [employees, setEmployees] = useState<Employee[]>([])
  const [steps, setSteps] = useState<WorkflowStepInstance[]>([])
  const [instances, setInstances] = useState<WorkflowInstance[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [cycles, setCycles] = useState<BrandOperationCycle[]>([])

  // Detail Drawer States
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [detailStep, setDetailStep] = useState<WorkflowStepInstance | null>(null)

  // UI / Modal States
  const [selectedStep, setSelectedStep] = useState<WorkflowStepInstance | null>(null)
  const [activeModal, setActiveModal] = useState<'assign' | 'deadline' | 'reviewer' | 'support' | 'create' | null>(null)
  const [showDeleteStepConfirm, setShowDeleteStepConfirm] = useState(false)
  const [stepToDelete, setStepToDelete] = useState<WorkflowStepInstance | null>(null)
  const [showBulkAssign, setShowBulkAssign] = useState(false)

  // Form Fields
  const [assigneeId, setAssigneeId] = useState('')
  const [assigneeCreativeCount, setAssigneeCreativeCount] = useState<number | null>(null)
  const [dueDateText, setDueDateText] = useState('')
  const [dueTimeText, setDueTimeText] = useState('')
  const [reviewerId, setReviewerId] = useState('')
  const [selectedSupportIds, setSelectedSupportIds] = useState<string[]>([])
  const [supportRole, setSupportRole] = useState('')

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [brandFilter, setBrandFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [teamFilter, setTeamFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [approvalFilter, setApprovalFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('deadline_asc')

  // Bulk Operations State
  const [bulkBrandId, setBulkBrandId] = useState('')
  const [bulkRoleFilter, setBulkRoleFilter] = useState('all')
  const [bulkEmployeeId, setBulkEmployeeId] = useState('')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  // Bulk Selection State
  const [selectedStepIds, setSelectedStepIds] = useState<string[]>([])

  const loadData = async () => {
    setIsLoadingAuth(true)
    const storedEmps = await getStoredEmployees()
    setEmployees(storedEmps)

    const activeId = getActiveEmployeeId()
    const current = storedEmps.find((e) => e.id === activeId)
    if (current) {
      setActiveEmployee(current)
    }
    setIsLoadingAuth(false)

    const storedSteps = await getWorkflowStepInstances()
    setSteps(storedSteps)

    const storedInstances = await getStoredWorkflowInstances()
    setInstances(storedInstances)

    const storedBrands = await getStoredBrands()
    setBrands(storedBrands)

    const storedCycles = await getStoredCycles()
    setCycles(storedCycles)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Resolve permission guard
  const hasPermission = useMemo(() => {
    return resolvePanelAuthority(principal, activeEmployee, 'task.manage')
  }, [principal, activeEmployee])

  // Central Operations or full admin check
  const isManagerExposed = useMemo(() => {
    return isManagerOrAdmin(principal, activeEmployee)
  }, [principal, activeEmployee])

  // Can pass/reassign tasks to others (tasks.assign permission)
  const canPassTask = useMemo(() => {
    return resolvePanelAuthority(principal, activeEmployee, 'tasks.assign')
  }, [principal, activeEmployee])

  const isStepInManagerTeams = (step: WorkflowStepInstance) => {
    return isStepInScope(principal, step, activeEmployee, employees)
  }

  // Filter lists based on manager's teams
  const manageableEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (isManagerExposed) return true
      if (!activeEmployee) return false
      if (activeEmployee.rolePackageId === 'art-director' || activeEmployee.teamIds?.includes('grafik-studyo')) {
        return emp.teamIds?.includes('grafik-studyo') || emp.rolePackageId === 'grafik-tasarim' || emp.teamIds?.some(tId => activeEmployee.teamIds?.includes(tId))
      }
      return emp.teamIds?.some(tId => activeEmployee.teamIds?.includes(tId))
    })
  }, [employees, isManagerExposed, activeEmployee])

  const unassignedCount = useMemo(() => {
    return steps.filter(s => s.status === 'active' && !s.assignedEmployeeId).length
  }, [steps])

  const filteredSteps = useMemo(() => {
    return steps.filter((step) => {
      if (!isStepInManagerTeams(step)) return false

      const details = parseStepDetails(step.description)
      const instance = instances.find((i) => i.id === step.workflowInstanceId)

      // Brand Filter
      if (brandFilter !== 'all') {
        if (brandFilter === 'general') {
          if (!details.isGeneral && instance?.brandId !== 'general-brand' && instance?.id !== 'inst-general-agency-tasks') {
            return false
          }
        } else if (instance?.brandId !== brandFilter) {
          return false
        }
      }

      // Priority Filter
      if (priorityFilter !== 'all') {
        const p = (details.priority || '').toLowerCase()
        if (priorityFilter === 'urgent' && !p.includes('acil') && !p.includes('kritik')) return false
        if (priorityFilter === 'high' && !p.includes('yüksek')) return false
        if (priorityFilter === 'medium' && !p.includes('normal') && !p.includes('orta')) return false
        if (priorityFilter === 'low' && !p.includes('düşük')) return false
      }

      // Assignee Filter
      if (assigneeFilter !== 'all') {
        if (assigneeFilter === 'unassigned') {
          if (step.assignedEmployeeId) return false
        } else if (step.assignedEmployeeId !== assigneeFilter) {
          return false
        }
      }

      // Status Filter
      if (statusFilter !== 'all' && step.status !== statusFilter) return false

      // Team Filter
      if (teamFilter !== 'all') {
        const teamIdOfStep = step.responsibilityRole ? (ROLE_TO_TEAM as Record<string, string>)[step.responsibilityRole] : undefined
        if (teamIdOfStep !== teamFilter) return false
      }

      // Search Query
      if (searchQuery) {
        const titleMatch = step.title.toLowerCase().includes(searchQuery.toLowerCase())
        const instMatch = instance?.title.toLowerCase().includes(searchQuery.toLowerCase())
        const detailMatch = details.cleanDesc.toLowerCase().includes(searchQuery.toLowerCase())
        if (!titleMatch && !instMatch && !detailMatch) return false
      }

      return true
    })
  }, [steps, brandFilter, priorityFilter, assigneeFilter, statusFilter, teamFilter, searchQuery, instances, activeEmployee])

  // Get brand name helper
  const getBrandNameOfInstance = (instanceId: string) => {
    const inst = instances.find((i) => i.id === instanceId)
    if (!inst) return 'Genel Ajans İşi'
    if (inst.id === 'inst-general-agency-tasks' || inst.brandId === 'general-brand' || inst.title.includes('Genel')) {
      return '🏢 Genel Ajans İşi'
    }
    return brands.find((b) => b.id === inst.brandId)?.name || 'Marka'
  }

  const getInstanceTitle = (instanceId: string) => {
    return instances.find((i) => i.id === instanceId)?.title || 'İş Akışı'
  }

  const getEmployeeName = (id?: string) => {
    if (!id) return 'Atanmamış'
    return employees.find((e) => e.id === id)?.fullName || 'Bilinmeyen Çalışan'
  }

  // Modals opening handlers
  const openAssignModal = (step: WorkflowStepInstance) => {
    setSelectedStep(step)
    setAssigneeId(step.assignedEmployeeId || '')
    setAssigneeCreativeCount(step.creativeCount ?? null)
    setActiveModal('assign')
  }

  const openDeadlineModal = (step: WorkflowStepInstance) => {
    setSelectedStep(step)
    setDueDateText(step.dueDate ? step.dueDate.split('T')[0] : '')
    setActiveModal('deadline')
  }

  const openReviewerModal = (step: WorkflowStepInstance) => {
    setSelectedStep(step)
    setReviewerId(step.reviewerEmployeeId || '')
    setActiveModal('reviewer')
  }

  const openSupportModal = (step: WorkflowStepInstance) => {
    setSelectedStep(step)
    setSelectedSupportIds(step.supportEmployeeIds || [])
    setActiveModal('support')
  }

  const handleSaveAssignment = async () => {
    if (!selectedStep) return

    let updatedCreativeCount = selectedStep.creativeCount ?? null
    const isCreative = isCreativeProductionResponsibility(selectedStep.responsibilityRole)

    if (isCreative && assigneeCreativeCount !== null && assigneeCreativeCount !== undefined) {
      if (!Number.isInteger(assigneeCreativeCount) || assigneeCreativeCount < 1) {
        toast.error('Kreatif adedi en az 1 tam sayı olmalıdır.')
        return
      }
      if (selectedStep.creativeCount !== assigneeCreativeCount) {
        updatedCreativeCount = assigneeCreativeCount
        const currentEmployeeId = activeEmployee?.id || 'system'
        await saveWorkflowHistory({
          id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          workflowInstanceId: selectedStep.workflowInstanceId,
          workflowStepInstanceId: selectedStep.id,
          actorEmployeeId: currentEmployeeId,
          action: 'creative_count_updated',
          fromStatus: selectedStep.status,
          toStatus: selectedStep.status,
          note: `Kreatif adedi güncellendi: ${selectedStep.creativeCount || 'Belirtilmemiş'} ➔ ${assigneeCreativeCount}`,
          createdAt: new Date().toISOString(),
        })
      }
    }

    const updated: WorkflowStepInstance = {
      ...selectedStep,
      assignedEmployeeId: assigneeId || undefined,
      creativeCount: updatedCreativeCount,
    }
    await updateWorkflowStepInstance(updated)
    toast.success('Görev Atandı', {
      description: 'Görev başarıyla ' + getEmployeeName(assigneeId) + ' kullanıcısına atandı.',
    })
    setActiveModal(null)
    loadData()
  }

  const handleSaveDeadline = async () => {
    if (!selectedStep) return
    const updated: WorkflowStepInstance = {
      ...selectedStep,
      dueDate: dueDateText ? dueDateText + 'T18:00:00.000Z' : undefined,
    }
    await updateWorkflowStepInstance(updated)
    toast.success('Deadline Güncellendi', {
      description: 'Görevin son teslim tarihi güncellendi.',
    })
    setActiveModal(null)
    loadData()
  }

  const handleDeleteStep = (targetStep: WorkflowStepInstance) => {
    setStepToDelete(targetStep)
    setShowDeleteStepConfirm(true)
  }

  const handleConfirmDeleteStep = async () => {
    if (!stepToDelete) return
    const targetId = stepToDelete.id
    setShowDeleteStepConfirm(false)
    setStepToDelete(null)
    try {
      const { error } = await supabase
        .from('workflow_step_instances')
        .delete()
        .eq('id', targetId)
      if (error) throw error
      
      toast.success('Görev başarıyla silindi!')
      loadData()
    } catch (err: any) {
      toast.error('Görev silinirken hata oluştu: ' + err.message)
    }
  }

  const handleSaveReviewer = async () => {
    if (!selectedStep) return
    const updated: WorkflowStepInstance = {
      ...selectedStep,
      reviewerEmployeeId: reviewerId || undefined,
    }
    await updateWorkflowStepInstance(updated)
    toast.success('Onaylayıcı Değiştirildi', {
      description: 'Görev onaylayıcısı ' + getEmployeeName(reviewerId) + ' olarak güncellendi.',
    })
    setActiveModal(null)
    loadData()
  }

  const handleSaveSupport = async () => {
    if (!selectedStep) return
    const updated: WorkflowStepInstance = {
      ...selectedStep,
      supportEmployeeIds: selectedSupportIds,
    }
    await updateWorkflowStepInstance(updated)
    toast.success('Destek Ekip Güncellendi', {
      description: 'Destek veren ekip üyeleri başarıyla kaydedildi.',
    })
    setActiveModal(null)
    loadData()
  }

  const handleBulkAssign = async () => {
    try {
      if (!bulkBrandId || !bulkEmployeeId) {
        toast.error('Lütfen bir marka ve sorumlu çalışan seçin.')
        return
      }

      const brandInstances = instances.filter((inst) => inst.brandId === bulkBrandId)
      const brandInstanceIds = brandInstances.map((inst) => inst.id)

      if (brandInstanceIds.length === 0) {
        toast.info('Bu markaya ait aktif bir iş akışı bulunamadı.')
        return
      }

      const targetEmployeeId = bulkEmployeeId === 'unassigned' ? undefined : bulkEmployeeId
      const modifiedSteps: WorkflowStepInstance[] = []

      steps.forEach((step) => {
        const belongsToBrand = brandInstanceIds.includes(step.workflowInstanceId)
        if (!belongsToBrand) return

        if (bulkRoleFilter !== 'all' && step.responsibilityRole !== bulkRoleFilter) {
          return
        }

        if (step.assignedEmployeeId === targetEmployeeId) {
          return
        }

        modifiedSteps.push({
          ...step,
          assignedEmployeeId: targetEmployeeId,
        })
      })

      if (modifiedSteps.length === 0) {
        toast.info('Atama koşullarına uygun veya güncellenecek yeni bir görev bulunamadı.')
        return
      }

      await saveWorkflowSteps(modifiedSteps)

      toast.success('Toplu Atama Başarılı', {
        description: modifiedSteps.length + ' görev başarıyla ' + (bulkEmployeeId === 'unassigned' ? 'ataması kaldırılarak' : getEmployeeName(bulkEmployeeId) + ' kullanıcısına') + ' atandı.',
      })

      setBulkEmployeeId('')
      setShowBulkAssign(false)
      loadData()
    } catch (err: any) {
      console.error('Bulk assign failed:', err)
      toast.error('Toplu atama sırasında bir hata oluştu: ' + (err.message || err))
    }
  }

  const toggleSupportId = (id: string) => {
    setSelectedSupportIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const getPriorityBadge = (p?: string | null) => {
    if (!p) return null
    const lower = p.toLowerCase()
    if (lower.includes('acil') || lower.includes('kritik') || lower.includes('urgent')) {
      return (
        <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/40 text-[9px] font-black animate-pulse flex items-center gap-1">
          <Flame className="h-2.5 w-2.5" /> Acil / Kritik
        </Badge>
      )
    }
    if (lower.includes('yüksek') || lower.includes('high')) {
      return (
        <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[9px] font-bold">
          ⚡ Yüksek
        </Badge>
      )
    }
    if (lower.includes('orta') || lower.includes('normal') || lower.includes('medium')) {
      return (
        <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[9px] font-medium">
          🔵 Normal
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[9px] font-medium">
        🟢 Düşük
      </Badge>
    )
  }

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!hasPermission) {
    return <AccessDenied />
  }

  return (
    <div className="space-y-6">
      {/* Üst Kısım: Başlık & Ekle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-900/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldCheck className="h-5.5 w-5.5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Görev Yönetim Merkezi</h1>
          </div>
          <p className="text-muted-foreground text-xs mt-0.5">
            Ekibinizin görevlerini listeleyin, serbest/özel görevler tanımlayın, Word formatlı detayları, 5MB dosyaları ve öncelikleri yönetin.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => {
              setBulkBrandId(brands[0]?.id || '')
              setShowBulkAssign(!showBulkAssign)
            }}
            variant="outline"
            className="h-10 px-4 text-xs font-semibold rounded-xl flex items-center gap-1.5 border-neutral-850 hover:bg-neutral-900"
          >
            <ArrowRightLeft className="h-4 w-4" /> Toplu Görev Ata
          </Button>
          <Button
            onClick={() => setActiveModal('create')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs h-10 px-5 flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 rounded-xl transition-all"
          >
            <Plus className="h-4 w-4" /> + Özel Görev Ata (Çoklu)
          </Button>
        </div>
      </div>

      {/* Filtre Kontrolleri */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-6 bg-neutral-950/40 border border-neutral-850 p-4 rounded-2xl backdrop-blur-md">
        {/* Arama */}
        <div className="space-y-1 sm:col-span-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-0.5">Arama</label>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Görev, marka veya talimat ara..."
            className="h-9 text-xs bg-muted/5 border-neutral-850 font-semibold"
          />
        </div>

        {/* Marka Filtresi */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-0.5">Marka</label>
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="h-9 text-xs bg-muted/5 border-neutral-850">
              <SelectValue placeholder="Seçin..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Markalar</SelectItem>
              <SelectItem value="general" className="text-xs font-bold text-purple-400">🏢 Genel Ajans İşleri</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id} className="text-xs">
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Öncelik Filtresi */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-0.5">Önem Sırası</label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 text-xs bg-muted/5 border-neutral-850">
              <SelectValue placeholder="Tüm Öncelikler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Öncelikler</SelectItem>
              <SelectItem value="urgent" className="text-xs font-bold text-red-400">🔴 Acil / Kritik</SelectItem>
              <SelectItem value="high" className="text-xs font-bold text-amber-400">🟠 Yüksek Öncelik</SelectItem>
              <SelectItem value="medium" className="text-xs text-blue-400">🔵 Normal Öncelik</SelectItem>
              <SelectItem value="low" className="text-xs text-emerald-400">🟢 Düşük Öncelik</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Çalışan Filtresi */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-0.5">Çalışan</label>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="h-9 text-xs bg-muted/5 border-neutral-850">
              <SelectValue placeholder="Seçin..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Ekip</SelectItem>
              <SelectItem value="unassigned" className="text-xs font-bold text-red-400">⚠️ Atanmayanlar</SelectItem>
              {manageableEmployees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id} className="text-xs">
                  {emp.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Durum Filtresi */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-0.5">Durum</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs bg-muted/5 border-neutral-850">
              <SelectValue placeholder="Seçin..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="active" className="text-xs">Aktif</SelectItem>
              <SelectItem value="pending" className="text-xs">Beklemede</SelectItem>
              <SelectItem value="waiting_approval" className="text-xs">Onay Bekliyor</SelectItem>
              <SelectItem value="completed" className="text-xs">Tamamlandı</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Toplu Atama Paneli */}
      {showBulkAssign && (
        <Card className="p-5 border border-blue-500/20 bg-blue-500/[0.02] rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-blue-500/10 pb-3">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm font-extrabold text-foreground">Toplu Görev Atama Sihirbazı</h3>
            </div>
            <Button onClick={() => setShowBulkAssign(false)} variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">1. Hedef Marka</label>
              <Select value={bulkBrandId} onValueChange={setBulkBrandId}>
                <SelectTrigger className="h-10 text-xs bg-muted/5 border-neutral-850">
                  <SelectValue placeholder="Marka Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id} className="text-xs">
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">2. Görev Rol Filtresi</label>
              <Select value={bulkRoleFilter} onValueChange={setBulkRoleFilter}>
                <SelectTrigger className="h-10 text-xs bg-muted/5 border-neutral-850">
                  <SelectValue placeholder="Seçin..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Görevler (Tümü)</SelectItem>
                  <SelectItem value="graphic_design" className="text-xs">Grafik Tasarım</SelectItem>
                  <SelectItem value="video_editing" className="text-xs">Video Kurgu</SelectItem>
                  <SelectItem value="photography" className="text-xs">Fotoğraf Üretimi</SelectItem>
                  <SelectItem value="videography" className="text-xs">Video Üretimi</SelectItem>
                  <SelectItem value="social_media" className="text-xs">Sosyal Medya</SelectItem>
                  <SelectItem value="digital_marketing" className="text-xs">Dijital Pazarlama</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">3. Atanacak Sorumlu Çalışan</label>
              <Select value={bulkEmployeeId} onValueChange={setBulkEmployeeId}>
                <SelectTrigger className="h-10 text-xs bg-muted/5 border-neutral-850">
                  <SelectValue placeholder="Çalışan Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned" className="text-xs text-red-400 font-semibold">Atamaları Kaldır (Boş Bırak)</SelectItem>
                  {manageableEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id} className="text-xs">
                      {emp.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleBulkAssign}
              disabled={!bulkBrandId || !bulkEmployeeId}
              className="bg-blue-650 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              Toplu Atamayı Uygula
            </Button>
          </div>
        </Card>
      )}

      {/* Görevler Listesi */}
      <div className="space-y-3">
        {unassignedCount > 0 && (
          <div className="rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/[0.05] to-amber-500/[0.05] p-4 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse shadow-lg ring-1 ring-red-500/10">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/15 border border-red-500/25 p-2 rounded-xl text-red-400 shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-extrabold text-red-400 block uppercase tracking-wider">⚠️ DİKKAT: ATAMA BEKLEYEN AKTİF GÖREVLER VAR</span>
                <span className="text-neutral-300 block text-[11px]">
                  Şu anda sistemde herhangi bir çalışana atanmamış <strong>{unassignedCount} adet aktif görev</strong> bulunuyor.
                </span>
              </div>
            </div>
            <Button
              onClick={() => setAssigneeFilter('unassigned')}
              className="bg-red-650 hover:bg-red-700 text-white font-bold text-[10px] h-8 px-4 rounded-xl shrink-0 shadow-md"
            >
              Atanmayanları Göster
            </Button>
          </div>
        )}

        {filteredSteps.length > 0 ? (
          filteredSteps.map((step) => {
            const isCompleted = step.status === 'completed'
            const isOverdue = step.dueDate && new Date(step.dueDate) < new Date() && !isCompleted
            const details = parseStepDetails(step.description)

            return (
              <Card
                key={step.id}
                className={cn(
                  'border bg-card/25 backdrop-blur-md rounded-2xl transition-all duration-200 hover:border-neutral-750 overflow-hidden relative group',
                  isOverdue && 'border-red-500/20'
                )}
              >
                {/* Sol durum vurgu çizgisi */}
                <div
                  className={cn(
                    'absolute top-0 left-0 bottom-0 w-1.5',
                    step.status === 'completed' && 'bg-emerald-500',
                    step.status === 'active' && 'bg-blue-500',
                    step.status === 'waiting_approval' && 'bg-purple-500',
                    step.status === 'pending' && 'bg-neutral-600',
                    isOverdue && 'bg-red-500'
                  )}
                />

                <CardContent className="p-4 sm:p-5 pl-6 sm:pl-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Bilgiler */}
                  <div className="space-y-2 max-w-2xl min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1 font-bold text-neutral-300">
                        <Building className="h-3 w-3 text-neutral-500" />
                        {getBrandNameOfInstance(step.workflowInstanceId)}
                      </span>
                      <span>•</span>
                      <span>{getInstanceTitle(step.workflowInstanceId)}</span>
                      {getPriorityBadge(details.priority)}
                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-foreground tracking-tight">{step.title}</h3>
                    </div>

                    {details.cleanDesc && (
                      <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2">
                        {details.cleanDesc}
                      </p>
                    )}

                    {/* Rozetler: Dosya, Link ve Teslimat Bilgileri */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {details.attachments.length > 0 && (
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-[9px] font-bold flex items-center gap-1">
                          <Paperclip className="h-2.5 w-2.5" />
                          {details.attachments.length} Dosya / Görsel (5MB)
                        </Badge>
                      )}
                      {details.refLinks.length > 0 && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-[9px] font-bold flex items-center gap-1">
                          <LinkIcon className="h-2.5 w-2.5" />
                          {details.refLinks.length} Link
                        </Badge>
                      )}
                      {details.dueTime && (
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30 text-[9px] font-semibold flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          Saat: {details.dueTime}
                        </Badge>
                      )}
                      {step.creativeCount !== undefined && step.creativeCount !== null && (
                        <Badge variant="outline" className="bg-purple-950/40 text-purple-300 border-purple-700/50 text-[9px] font-bold flex items-center gap-1">
                          🎨 {step.creativeCount} Kreatif
                        </Badge>
                      )}
                    </div>

                    {/* Sorumlu, Onaylayıcı ve Destekler */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <User className={cn("h-3.5 w-3.5", !step.assignedEmployeeId ? "text-red-500/80 animate-pulse" : "text-neutral-500")} />
                        <span className="text-[11px]">
                          Sorumlu:{' '}
                          <strong>
                            {!step.assignedEmployeeId ? (
                              <span className="text-red-400 font-black bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider animate-pulse inline-flex items-center gap-1">
                                ⚠️ Atama Yapılmadı
                              </span>
                            ) : (
                              <>
                                {getEmployeeName(step.assignedEmployeeId)}
                                {(() => {
                                  const assignedEmp = employees.find(e => e.id === step.assignedEmployeeId)
                                  if (!assignedEmp) return null
                                  return assignedEmp.employmentType === 'freelance' ? (
                                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[9px] font-bold px-1.5 py-0 ml-1">
                                      Freelance
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[9px] font-bold px-1.5 py-0 ml-1">
                                      Tam Zamanlı
                                    </Badge>
                                  )
                                })()}
                              </>
                            )}
                          </strong>
                        </span>
                      </div>
                      {step.reviewerEmployeeId && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-neutral-500" />
                          <span className="text-[11px]">Onaylayan: <strong>{getEmployeeName(step.reviewerEmployeeId)}</strong></span>
                        </div>
                      )}
                      {step.supportEmployeeIds && step.supportEmployeeIds.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-neutral-500" />
                          <span className="text-[11px]">Destek ({step.supportEmployeeIds.length})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deadline & Aksiyonlar */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                    {/* Son Teslim Tarihi */}
                    <div className="flex items-center gap-2 bg-muted/10 px-3 py-1.5 rounded-xl border border-neutral-900/60 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                      <div>
                        <span className="block text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Teslim Tarihi</span>
                        <span className={cn(
                          'font-semibold',
                          isOverdue ? 'text-red-400' : 'text-neutral-300'
                        )}>
                          {step.dueDate ? new Date(step.dueDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                        </span>
                      </div>
                    </div>

                    {/* Yönetim Butonları */}
                    <div className="flex items-center gap-1">
                      {canPassTask && (
                        <Button
                          onClick={() => openAssignModal(step)}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 rounded-lg text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20 font-semibold"
                          title="Bu görevi başka bir çalışana pasla"
                        >
                          <Send className="h-3 w-3" /> Pasla
                        </Button>
                      )}

                      <Button
                        onClick={() => {
                          setDetailStep(step)
                          setDetailDrawerOpen(true)
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 rounded-lg text-xs flex items-center gap-1 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20 font-bold"
                      >
                        <Sparkles className="h-3 w-3" /> Detay
                      </Button>

                      <Button
                        onClick={() => openAssignModal(step)}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 rounded-lg text-xs flex items-center gap-1 hover:bg-muted/10 hover:text-white"
                        title="Atamayı Güncelle"
                      >
                        <User className="h-3 w-3" /> Ata
                      </Button>

                      <Button
                        onClick={() => openDeadlineModal(step)}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 rounded-lg text-xs flex items-center gap-1 hover:bg-muted/10 hover:text-white"
                        title="Deadline Güncelle"
                      >
                        <Calendar className="h-3 w-3" /> Tarih
                      </Button>

                      <Button
                        onClick={() => handleDeleteStep(step)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-lg text-red-400 hover:text-red-300 hover:bg-rose-500/10 p-0 flex items-center justify-center shrink-0"
                        title="Görevi Sil"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-12 border border-dashed rounded-3xl bg-neutral-950/5">
            <AlertTriangle className="h-10 w-10 text-neutral-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-400">Aranan kriterlere uygun görev bulunamadı.</p>
            <p className="text-xs text-neutral-500 mt-1">Filtre ayarlarınızı değiştirmeyi deneyebilir veya yeni özel görev oluşturabilirsiniz.</p>
          </div>
        )}
      </div>

      {/* 1. ATAMA / PASLAMA MODALI */}
      {activeModal === 'assign' && selectedStep && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-900 w-full max-w-md p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-purple-400" />
              <h3 className="text-base font-extrabold text-white">
                {selectedStep.assignedEmployeeId ? 'Görevi Başkasına Pasla' : 'Görevi Çalışana Ata'}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-neutral-300">"{selectedStep.title}"</span> görevini atamak istediğiniz ekip üyesini seçin.
            </p>
            {selectedStep.assignedEmployeeId && (
              <div className="flex items-center gap-2 bg-neutral-900/60 border border-neutral-800 rounded-xl px-3 py-2">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Mevcut Sorumlu:</span>
                <span className="text-xs font-semibold text-purple-300">{getEmployeeName(selectedStep.assignedEmployeeId)}</span>
                <ArrowRightLeft className="h-3 w-3 text-neutral-500 ml-auto" />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Yeni Sorumlu Seçimi</label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="h-10 text-xs bg-muted/10 border-neutral-850">
                  <SelectValue placeholder="Seçin..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Atamayı Kaldır</SelectItem>
                  {manageableEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id} className="text-xs">
                      {emp.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isCreativeProductionResponsibility(selectedStep.responsibilityRole) && (
              <div className="space-y-1.5 bg-purple-950/20 border border-purple-800/40 rounded-xl p-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Kreatif Adedi</span>
                </div>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Örn: 8"
                  value={assigneeCreativeCount ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : null
                    setAssigneeCreativeCount(val)
                  }}
                  className="h-9 text-xs bg-muted/10 border-purple-700/50 font-bold text-purple-200"
                />
                <p className="text-[9px] text-purple-400/80">Bu kreatif üretim görevinin kapsadığı adet miktarı.</p>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={() => setActiveModal(null)} variant="outline" className="h-9 text-xs rounded-xl">İptal</Button>
              <Button onClick={handleSaveAssignment} className="h-9 text-xs bg-blue-650 hover:bg-blue-700 text-white rounded-xl">Atamayı Kaydet</Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEADLINE MODALI */}
      {activeModal === 'deadline' && selectedStep && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-900 w-full max-w-md p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white">Deadline Ayarla</h3>
            <p className="text-xs text-muted-foreground">"{selectedStep.title}" görevi için yeni teslim tarihi girin.</p>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Teslim Tarihi</label>
              <Input
                type="date"
                value={dueDateText}
                onChange={(e) => setDueDateText(e.target.value)}
                className="h-10 text-xs bg-muted/5 border-neutral-850"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={() => setActiveModal(null)} variant="outline" className="h-9 text-xs rounded-xl">İptal</Button>
              <Button onClick={handleSaveDeadline} className="h-9 text-xs bg-blue-650 hover:bg-blue-700 text-white rounded-xl">Tarihi Kaydet</Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ONAYLAYICI MODALI */}
      {activeModal === 'reviewer' && selectedStep && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-900 w-full max-w-md p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white">Onaylayıcı Değiştir</h3>
            <p className="text-xs text-muted-foreground">"{selectedStep.title}" görevini onaylayacak yetkili kişiyi seçin.</p>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Onaylayıcı</label>
              <Select value={reviewerId} onValueChange={setReviewerId}>
                <SelectTrigger className="h-10 text-xs bg-muted/10 border-neutral-850">
                  <SelectValue placeholder="Seçin..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Onaylayıcıyı Kaldır</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id} className="text-xs">
                      {emp.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={() => setActiveModal(null)} variant="outline" className="h-9 text-xs rounded-xl">İptal</Button>
              <Button onClick={handleSaveReviewer} className="h-9 text-xs bg-blue-650 hover:bg-blue-700 text-white rounded-xl">Onaylayıcıyı Kaydet</Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DESTEK EKİP MODALI */}
      {activeModal === 'support' && selectedStep && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-900 w-full max-w-md p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white">Destek Ekip Üyeleri Ekle</h3>
            <p className="text-xs text-muted-foreground">"{selectedStep.title}" görevine destek verecek kişileri işaretleyin.</p>
            <div className="max-h-60 overflow-y-auto space-y-2 border border-neutral-850 p-3 rounded-xl bg-card/10">
              {employees.map((emp) => {
                const isSelected = selectedSupportIds.includes(emp.id)
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => toggleSupportId(emp.id)}
                    className={cn(
                      'w-full flex items-center justify-between p-2 text-xs rounded-lg transition-colors border',
                      isSelected ? 'bg-blue-500/10 border-blue-500/30 text-white' : 'border-transparent text-muted-foreground hover:bg-muted/10'
                    )}
                  >
                    <span>{emp.fullName}</span>
                    {isSelected && <span className="text-[10px] font-bold text-blue-400">Seçildi</span>}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={() => setActiveModal(null)} variant="outline" className="h-9 text-xs rounded-xl">İptal</Button>
              <Button onClick={handleSaveSupport} className="h-9 text-xs bg-blue-650 hover:bg-blue-700 text-white rounded-xl">Destekleri Kaydet</Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. YENİ GELİŞMİŞ ÇOKLU ÖZEL GÖREV MODALI */}
      {activeModal === 'create' && (
        <CustomTaskModal
          isOpen={activeModal === 'create'}
          onClose={() => setActiveModal(null)}
          employees={manageableEmployees.length > 0 ? manageableEmployees : employees}
          brands={brands}
          instances={instances}
          onSuccess={loadData}
        />
      )}

      {/* Görev Silme Onay Modalı */}
      {showDeleteStepConfirm && stepToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </span>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white">Görevi Sil?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bu görevi sistemden kalıcı olarak silmek istediğinize emin misiniz?
                  <br />
                  <strong className="text-red-400 mt-1 block">Bu işlem geri alınamaz!</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 text-xs rounded-xl"
                onClick={() => { setShowDeleteStepConfirm(false); setStepToDelete(null) }}
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDeleteStep}
                className="h-9 text-xs bg-red-600 hover:bg-red-750 text-white rounded-xl font-bold"
              >
                Evet, Kalıcı Olarak Sil
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Görev Detay Drawer */}
      {detailDrawerOpen && detailStep && (() => {
        const inst = instances.find(i => i.id === detailStep.workflowInstanceId) || {
          id: detailStep.workflowInstanceId,
          brandId: 'general-brand',
          cycleId: 'general-cycle',
          operationPlanItemId: 'op-general',
          operationTemplateId: 'general-op',
          workflowTemplateId: 'general-wf',
          title: 'Genel Görevler',
          status: 'in_progress' as const,
          currentStepId: detailStep.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const brandName = getBrandNameOfInstance(detailStep.workflowInstanceId)
        const siblingSteps = steps.filter(s => s.workflowInstanceId === detailStep.workflowInstanceId)
        const cycle = cycles.find(c => c.brandId === inst.brandId && c.id === inst.cycleId)
        const months = [
          'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
          'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ]
        const cycleLabel = cycle ? (months[cycle.month - 1] + ' ' + cycle.year) : 'Genel Dönem'

        return (
          <TaskDetailDrawer
            isOpen={detailDrawerOpen}
            onClose={() => {
              setDetailDrawerOpen(false)
              setDetailStep(null)
            }}
            step={detailStep}
            instance={inst}
            brandName={brandName}
            cycleLabel={cycleLabel}
            siblingSteps={siblingSteps}
            employees={employees}
            currentEmployeeId={activeEmployee?.id || ''}
          />
        )
      })()}
    </div>
  )
}
