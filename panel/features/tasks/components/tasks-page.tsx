'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import type { Employee, WorkflowStepInstance, WorkflowInstance, Brand, ResponsibilityRole, BrandOperationCycle } from '@/types/domain'
import { getStoredEmployees, getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { getWorkflowStepInstances, updateWorkflowStepInstance, getStoredWorkflowInstances, saveWorkflowInstances, saveWorkflowSteps } from '@/lib/storage/local-workflow-instance-store'
import { getStoredBrands } from '@/lib/storage/local-brand-store'
import { getStoredCycles } from '@/lib/storage/local-cycle-store'
import { supabase } from '@/lib/supabase/client'
import { resolveEffectivePermissions } from '@/lib/permissions/resolve-permissions'
import { AccessDenied } from '@/components/shared/access-denied'
import { TaskDetailDrawer } from '@/features/my-work/components/task-detail-drawer'
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
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const parseStepDelivery = (description: string) => {
  if (!description) return { note: '', links: [], files: [], cleanDesc: '' }

  const deliveryNoteMatch = description.match(/\[Teslim Açıklaması\]:\s*([\s\S]*?)(?=\n\[|$)/)
  const linksMatch = description.match(/\[Fotoğraf\/Görsel Bağlantıları\]:\s*(.*?)(?=\n\[|$)/)
  const filesMatch = description.match(/\[Dosya Bağlantıları\]:\s*(.*?)(?=\n\[|$)/)

  const note = deliveryNoteMatch ? deliveryNoteMatch[1].trim() : ''
  const links = linksMatch 
    ? linksMatch[1].split(',').map(l => l.trim()).filter(Boolean)
    : []
  const files = filesMatch 
    ? filesMatch[1].split(',').map(f => f.trim()).filter(Boolean)
    : []

  const cleanDesc = description
    .replace(/\n\n\[Teslim Açıklaması\]:[\s\S]*$/, '')
    .replace(/\n\[Teslim Açıklaması\]:[\s\S]*$/, '')
    .replace(/\n\[Fotoğraf\/Görsel Bağlantıları\]:[\s\S]*$/, '')
    .replace(/\n\[Dosya Bağlantıları\]:[\s\S]*$/, '')
    .trim()

  return { note, links, files, cleanDesc }
}

export function TasksPage() {
  const router = useRouter()

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

  // Form Fields
  const [assigneeId, setAssigneeId] = useState('')
  const [dueDateText, setDueDateText] = useState('')
  const [reviewerId, setReviewerId] = useState('')
  const [selectedSupportIds, setSelectedSupportIds] = useState<string[]>([])

  // Create Custom Task Fields
  const [createBrandId, setCreateBrandId] = useState('')
  const [createInstanceId, setCreateInstanceId] = useState('')
  const [createTitle, setCreateTitle] = useState('')
  const [createRole, setCreateRole] = useState<ResponsibilityRole>('custom')
  const [createAssigneeId, setCreateAssigneeId] = useState('')
  const [createDueDate, setCreateDueDate] = useState('')

  // Bulk Assign States
  const [showBulkAssign, setShowBulkAssign] = useState(false)
  const [bulkBrandId, setBulkBrandId] = useState('')
  const [bulkRoleFilter, setBulkRoleFilter] = useState('all')
  const [bulkEmployeeId, setBulkEmployeeId] = useState('')

  // Filter States
  const [brandFilter, setBrandFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [teamFilter, setTeamFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadData = async () => {
    const employeeList = await getStoredEmployees()
    setEmployees(employeeList)

    const activeId = getActiveEmployeeId()
    const current = employeeList.find((e) => e.id === activeId)
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
    if (!activeEmployee) return false
    const effective = resolveEffectivePermissions({
      rolePackageId: activeEmployee.rolePackageId,
      teamIds: activeEmployee.teamIds,
      permissionOverrides: activeEmployee.permissionOverrides || {},
    })
    return effective.grantedKeys.has('task.manage')
  }, [activeEmployee])

  // Central Operations or full admin check
  const isManagerExposed = useMemo(() => {
    if (!activeEmployee) return false
    return activeEmployee.teamIds.includes('merkezi-operasyon') || activeEmployee.rolePackageId === 'operasyon-yonetimi'
  }, [activeEmployee])

  // Can pass/reassign tasks to others (tasks.assign permission)
  const canPassTask = useMemo(() => {
    if (!activeEmployee) return false
    const effective = resolveEffectivePermissions({
      rolePackageId: activeEmployee.rolePackageId,
      teamIds: activeEmployee.teamIds,
      permissionOverrides: activeEmployee.permissionOverrides || {},
    })
    return effective.grantedKeys.has('tasks.assign')
  }, [activeEmployee])

  // Map step responsibility to team
  const ROLE_TO_TEAM: Record<string, string> = {
    social_media: 'sosyal-medya',
    graphic_design: 'grafik-studyo',
    video_editing: 'post-produksiyon',
    photography: 'fotograf-studyo',
    videography: 'video-produksiyon',
    digital_marketing: 'dijital-pazarlama',
    strategy: 'strateji-musteri',
    operation: 'merkezi-operasyon'
  }

  const isStepInManagerTeams = (step: WorkflowStepInstance) => {
    if (isManagerExposed) return true
    if (!activeEmployee) return false

    // Check responsibility role
    if (step.responsibilityRole) {
      const teamId = ROLE_TO_TEAM[step.responsibilityRole]
      if (teamId && activeEmployee.teamIds.includes(teamId as any)) {
        return true
      }
    }

    // Check assignee
    if (step.assignedEmployeeId) {
      const assignee = employees.find(e => e.id === step.assignedEmployeeId)
      if (assignee && assignee.teamIds.some(tId => activeEmployee.teamIds.includes(tId))) {
        return true
      }
    }

    return false
  }

  // Filter lists based on manager's teams
  const manageableEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (isManagerExposed) return true
      if (!activeEmployee) return false
      return emp.teamIds.some(tId => activeEmployee.teamIds.includes(tId))
    })
  }, [employees, isManagerExposed, activeEmployee])

  const unassignedCount = useMemo(() => {
    return steps.filter(s => s.status === 'active' && !s.assignedEmployeeId).length
  }, [steps])

  const filteredSteps = useMemo(() => {
    return steps.filter((step) => {
      if (!isStepInManagerTeams(step)) return false

      // Brand Filter
      const instance = instances.find((i) => i.id === step.workflowInstanceId)
      if (brandFilter !== 'all' && instance?.brandId !== brandFilter) return false

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
        const teamIdOfStep = step.responsibilityRole ? ROLE_TO_TEAM[step.responsibilityRole] : undefined
        if (teamIdOfStep !== teamFilter) return false
      }

      // Search Query
      if (searchQuery) {
        const titleMatch = step.title.toLowerCase().includes(searchQuery.toLowerCase())
        const instMatch = instance?.title.toLowerCase().includes(searchQuery.toLowerCase())
        if (!titleMatch && !instMatch) return false
      }

      return true
    })
  }, [steps, brandFilter, assigneeFilter, statusFilter, teamFilter, searchQuery, instances, activeEmployee])

  // Get brand name helper
  const getBrandNameOfInstance = (instanceId: string) => {
    const inst = instances.find((i) => i.id === instanceId)
    if (!inst) return 'Bilinmeyen Marka'
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
    const updated: WorkflowStepInstance = {
      ...selectedStep,
      assignedEmployeeId: assigneeId || undefined,
    }
    await updateWorkflowStepInstance(updated)
    toast.success('Görev Atandı', {
      description: `Görev başarıyla ${getEmployeeName(assigneeId)} kullanıcısına atandı.`,
    })
    setActiveModal(null)
    loadData()
  }

  const handleSaveDeadline = async () => {
    if (!selectedStep) return
    const updated: WorkflowStepInstance = {
      ...selectedStep,
      dueDate: dueDateText ? `${dueDateText}T18:00:00.000Z` : undefined,
    }
    await updateWorkflowStepInstance(updated)
    toast.success('Deadline Güncellendi', {
      description: `Görevin son teslim tarihi güncellendi.`,
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
      description: `Görev onaylayıcısı ${getEmployeeName(reviewerId)} olarak güncellendi.`,
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
      description: `Destek veren ekip üyeleri başarıyla kaydedildi.`,
    })
    setActiveModal(null)
    loadData()
  }

  const handleCreateCustomTask = async () => {
    if (!createInstanceId || !createTitle) {
      toast.error('Lütfen en azından bir iş akışı ve başlık belirleyin.')
      return
    }

    const newStep: WorkflowStepInstance = {
      id: `step-${Date.now()}`,
      workflowInstanceId: createInstanceId,
      workflowStepTemplateId: 'custom-step-template',
      description: '',
      order: steps.filter(s => s.workflowInstanceId === createInstanceId).length + 1,
      title: createTitle,
      responsibilityRole: createRole,
      assignedEmployeeId: createAssigneeId || undefined,
      status: 'active',
      requiresApproval: false,
      isFinalStep: false,
      dueDate: createDueDate ? `${createDueDate}T18:00:00.000Z` : undefined,
    }

    // Save step
    await saveWorkflowSteps([newStep])

    toast.success('Özel Görev Oluşturuldu', {
      description: `"${createTitle}" görevi başarıyla oluşturuldu ve iş akışına eklendi.`,
    })

    // Reset Form
    setCreateTitle('')
    setCreateAssigneeId('')
    setCreateDueDate('')
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

        // Only update if the assignment actually changed
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
        description: `${modifiedSteps.length} görev başarıyla ${
          bulkEmployeeId === 'unassigned' ? 'ataması kaldırılarak' : getEmployeeName(bulkEmployeeId) + ' kullanıcısına'
        } atandı.`,
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

  // Filter instances by selected brand
  const brandInstances = useMemo(() => {
    if (!createBrandId) return []
    return instances.filter((i) => i.brandId === createBrandId)
  }, [createBrandId, instances])

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
            Ekibinizin görevlerini listeleyin, yeni görevler oluşturun, atamaları ve deadline tarihlerini yönetin.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => {
              setBulkBrandId(brands[0]?.id || '')
              setShowBulkAssign(!showBulkAssign)
            }}
            variant="outline"
            className="h-10 px-5 text-xs font-semibold rounded-xl flex items-center gap-1.5 border-neutral-850 hover:bg-neutral-900"
          >
            <ArrowRightLeft className="h-4 w-4" /> Toplu Görev Ata
          </Button>
          <Button
            onClick={() => {
              setCreateBrandId(brands[0]?.id || '')
              setActiveModal('create')
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 px-5 flex items-center gap-1.5 shadow rounded-xl transition-all"
          >
            <Plus className="h-4 w-4" /> Özel Görev Ekle
          </Button>
        </div>
      </div>

      {/* Filtre Kontrolleri */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 bg-neutral-950/20 border p-4 rounded-2xl backdrop-blur-md">
        {/* Arama */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Arama</label>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Görev veya iş akışı başlığı..."
            className="h-9 text-xs bg-muted/5 border-neutral-850"
          />
        </div>

        {/* Marka Filtresi */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Marka</label>
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="h-9 text-xs bg-muted/5 border-neutral-850">
              <SelectValue placeholder="Seçin..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Markalar</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id} className="text-xs">
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Çalışan Filtresi */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Çalışan</label>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="h-9 text-xs bg-muted/5 border-neutral-850">
              <SelectValue placeholder="Seçin..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Ekip</SelectItem>
              <SelectItem value="unassigned" className="text-xs font-bold text-red-400">⚠️ Atama Yapılmayanlar</SelectItem>
              {manageableEmployees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id} className="text-xs">
                  {emp.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Durum Filtresi */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Durum</label>
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

      {/* Toplu Görev Atama Kartı */}
      {showBulkAssign && (
        <Card className="border border-blue-500/10 bg-blue-500/[0.01] backdrop-blur-md rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-blue-500/5 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
                <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                Hızlı / Toplu Görev Atama Şablonu
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Bir markanın kurgu, grafik veya tüm görevlerini tek bir çalışana toplu olarak atayabilirsiniz.
              </p>
            </div>
            <Button
              onClick={() => setShowBulkAssign(false)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Marka Seçimi */}
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

            {/* Departman / Rol Seçimi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">2. Departman / Rol (Filtre)</label>
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

            {/* Çalışan Atama Seçimi */}
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
      <div className="space-y-4">
        {unassignedCount > 0 && (
          <div className="rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/[0.05] to-amber-500/[0.05] p-5 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse shadow-lg ring-1 ring-red-500/10">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/15 border border-red-500/25 p-2.5 rounded-xl text-red-400 shrink-0">
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-0.5">
                <span className="font-extrabold text-red-400 block uppercase tracking-wider">⚠️ DİKKAT: ATAMA BEKLEYEN AKTİF GÖREVLER VAR</span>
                <span className="text-neutral-300 block">
                  Şu anda sistemde herhangi bir çalışana atanmamış <strong>{unassignedCount} adet aktif görev</strong> bulunuyor. İş akışının aksamaması için lütfen sorumlu atamalarını tamamlayın.
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

            return (
              <Card
                key={step.id}
                className={cn(
                  'border bg-card/15 backdrop-blur-md rounded-2xl transition-all duration-200 hover:border-neutral-800 overflow-hidden relative',
                  isOverdue && 'border-red-500/10'
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

                <CardContent className="p-5 pl-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  {/* Bilgiler */}
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center flex-wrap gap-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {getBrandNameOfInstance(step.workflowInstanceId)}
                      </span>
                      <span>•</span>
                      <span>{getInstanceTitle(step.workflowInstanceId)}</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-foreground tracking-tight">{step.title}</h3>

                    {step.description && (
                      <p className="text-[11px] text-neutral-450 leading-relaxed mt-1">
                        {parseStepDelivery(step.description).cleanDesc}
                      </p>
                    )}

                    {step.status === 'completed' && (() => {
                      const { note, links, files } = parseStepDelivery(step.description)
                      if (!note && links.length === 0 && files.length === 0 && !step.completedAt) return null
                      return (
                        <div className="mt-2.5 bg-neutral-950/40 border border-neutral-900 rounded-xl p-3 space-y-1.5 text-[10px] leading-relaxed max-w-lg">
                          <div className="flex justify-between items-center border-b border-neutral-900 pb-1">
                            <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest font-mono">
                              TESLİM BİLGİLERİ VE DOSYALAR
                            </span>
                            {step.completedAt && (
                              <span className="text-[8px] text-neutral-550 font-mono">
                                Tamamlama: {new Date(step.completedAt).toLocaleString('tr-TR')}
                              </span>
                            )}
                          </div>
                          {note && (
                            <p className="text-neutral-350 italic font-mono">&quot;{note}&quot;</p>
                          )}
                          {(links.length > 0 || files.length > 0) && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {links.map((link, lidx) => (
                                <a
                                  key={lidx}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 hover:border-neutral-700 text-neutral-300 hover:text-white px-2 py-0.5 rounded text-[8px] font-bold font-mono transition-all"
                                >
                                  🔗 LİNK {lidx + 1}
                                </a>
                              ))}
                              {files.map((file, fidx) => (
                                <a
                                  key={fidx}
                                  href={file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 hover:border-neutral-700 text-neutral-300 hover:text-white px-2 py-0.5 rounded text-[8px] font-bold font-mono transition-all"
                                >
                                  📁 DOSYA {fidx + 1}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })()}

                    {/* Sorumlu, Onaylayıcı ve Destekler */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-1">
                        <User className={cn("h-3.5 w-3.5", !step.assignedEmployeeId ? "text-red-500/80 animate-pulse" : "text-neutral-500")} />
                        <span className="text-[11px]">
                          Sorumlu:{' '}
                          <strong>
                            {!step.assignedEmployeeId ? (
                              <span className="text-red-400 font-black bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider animate-pulse inline-flex items-center gap-1">
                                ⚠️ Atama Yapılmadı
                              </span>
                            ) : (
                              getEmployeeName(step.assignedEmployeeId)
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
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
                      {/* Başkasına Pasla — sadece tasks.assign yetkisi olanlara görünür */}
                      {canPassTask && (
                        <Button
                          onClick={() => openAssignModal(step)}
                          variant="ghost"
                          size="sm"
                          className="h-9 px-3 rounded-lg text-xs flex items-center gap-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20 font-semibold"
                          title="Bu görevi başka bir çalışana pasla"
                        >
                          <Send className="h-3.5 w-3.5" /> Pasla
                        </Button>
                      )}

                      {/* Detayları Görüntüle */}
                      <Button
                        onClick={() => {
                          setDetailStep(step)
                          setDetailDrawerOpen(true)
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 rounded-lg text-xs flex items-center gap-1 hover:bg-muted/10 hover:text-white text-blue-400 hover:text-blue-300"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Detay
                      </Button>

                      {/* Atama Değiştir */}
                      <Button
                        onClick={() => openAssignModal(step)}
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 rounded-lg text-xs flex items-center gap-1 hover:bg-muted/10 hover:text-white"
                      >
                        <User className="h-3.5 w-3.5" /> Ata
                      </Button>

                      {/* Deadline Değiştir */}
                      <Button
                        onClick={() => openDeadlineModal(step)}
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 rounded-lg text-xs flex items-center gap-1 hover:bg-muted/10 hover:text-white"
                      >
                        <Calendar className="h-3.5 w-3.5" /> Tarih
                      </Button>

                      {/* Reviewer Değiştir */}
                      <Button
                        onClick={() => openReviewerModal(step)}
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 rounded-lg text-xs flex items-center gap-1 hover:bg-muted/10 hover:text-white"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Onaylayıcı
                      </Button>

                      {/* Destek Ekle */}
                      <Button
                        onClick={() => openSupportModal(step)}
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 rounded-lg text-xs flex items-center gap-1 hover:bg-muted/10 hover:text-white"
                      >
                        <Users className="h-3.5 w-3.5" /> Destek
                      </Button>

                      {/* Geçici Sil Yetkisi (Test aşamasında herkes silebilir) */}
                      <Button
                        onClick={() => handleDeleteStep(step)}
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 rounded-lg text-red-400 hover:text-red-300 hover:bg-rose-500/10 p-0 flex items-center justify-center shrink-0"
                        title="Görevi Sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
            <p className="text-xs text-neutral-500 mt-1">Filtre ayarlarınızı değiştirmeyi deneyebilirsiniz.</p>
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

      {/* 5. GÖREV OLUŞTURMA MODALI */}
      {activeModal === 'create' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-900 w-full max-w-lg p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Özel Görev Oluştur
            </h3>
            <p className="text-xs text-muted-foreground">Herhangi bir markanın aktif dönem iş akışına özel bir görev (adım) enjekte edin.</p>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Marka Seçimi */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Marka</label>
                <Select value={createBrandId} onValueChange={(val) => {
                  setCreateBrandId(val)
                  setCreateInstanceId('')
                }}>
                  <SelectTrigger className="h-9 text-xs bg-muted/10 border-neutral-850">
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

              {/* Kampanya / İş Akışı Seçimi */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">İş Akışı (Kampanya)</label>
                <Select value={createInstanceId} onValueChange={setCreateInstanceId} disabled={!createBrandId}>
                  <SelectTrigger className="h-9 text-xs bg-muted/10 border-neutral-850">
                    <SelectValue placeholder={brandInstances.length > 0 ? 'İş Akışı Seçin' : 'Aktif İş Akışı Bulunamadı'} />
                  </SelectTrigger>
                  <SelectContent>
                    {brandInstances.map((i) => (
                      <SelectItem key={i.id} value={i.id} className="text-xs">
                        {i.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Görev Başlığı */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Görev Başlığı</label>
                <Input
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Örn: Instagram Reels video kurgusunun tamamlanması"
                  className="h-9 text-xs bg-muted/5 border-neutral-850"
                />
              </div>

              {/* Sorumlu Departman / Rol */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Sorumlu Rol / Departman</label>
                <Select value={createRole} onValueChange={(val) => setCreateRole(val as ResponsibilityRole)}>
                  <SelectTrigger className="h-9 text-xs bg-muted/10 border-neutral-850">
                    <SelectValue placeholder="Seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom" className="text-xs">Özel / Operasyon</SelectItem>
                    <SelectItem value="graphic_design" className="text-xs">Grafik Tasarım</SelectItem>
                    <SelectItem value="video_editing" className="text-xs">Video Kurgu</SelectItem>
                    <SelectItem value="photography" className="text-xs">Fotoğraf Üretimi</SelectItem>
                    <SelectItem value="videography" className="text-xs">Video Üretimi</SelectItem>
                    <SelectItem value="social_media" className="text-xs">Sosyal Medya</SelectItem>
                    <SelectItem value="digital_marketing" className="text-xs">Dijital Pazarlama</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sorumlu Atama */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Görev Sorumlusu (Çalışan)</label>
                <Select value={createAssigneeId} onValueChange={setCreateAssigneeId}>
                  <SelectTrigger className="h-9 text-xs bg-muted/10 border-neutral-850">
                    <SelectValue placeholder="İsteğe Bağlı Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Atama Yok (Boş)</SelectItem>
                    {manageableEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id} className="text-xs">
                        {emp.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Deadline */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Son Teslim Tarihi (Deadline)</label>
                <Input
                  type="date"
                  value={createDueDate}
                  onChange={(e) => setCreateDueDate(e.target.value)}
                  className="h-9 text-xs bg-muted/5 border-neutral-850"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={() => setActiveModal(null)} variant="outline" className="h-9 text-xs rounded-xl">İptal</Button>
              <Button onClick={handleCreateCustomTask} className="h-9 text-xs bg-blue-650 hover:bg-blue-700 text-white rounded-xl">Görev Oluştur</Button>
            </div>
          </div>
        </div>
      )}

      {/* Görev Silme Onay Modalı */}
      {showDeleteStepConfirm && stepToDelete && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </span>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white">Görevi Sil?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bu görevi (iş adımını) sistemden kalıcı olarak silmek istediğinize emin misiniz?
                  <br />
                  <strong className="text-red-400 mt-1 block">Bu geçici test yetkisidir. Bu işlem geri alınamaz!</strong>
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
        </div>,
        document.body
      )}
      {/* Görev Detay Drawer */}
      {detailDrawerOpen && detailStep && (() => {
        const inst = instances.find(i => i.id === detailStep.workflowInstanceId)
        if (!inst) return null

        const brandName = getBrandNameOfInstance(detailStep.workflowInstanceId)
        const siblingSteps = steps.filter(s => s.workflowInstanceId === detailStep.workflowInstanceId)
        const cycle = cycles.find(c => c.brandId === inst.brandId && c.id === inst.cycleId)
        const months = [
          'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
          'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ]
        const cycleLabel = cycle ? `${months[cycle.month - 1]} ${cycle.year}` : 'Genel Dönem'

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
