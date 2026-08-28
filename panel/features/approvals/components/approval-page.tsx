'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Employee, WorkflowApproval, WorkflowInstance, WorkflowStepInstance, Brand, WorkflowHandoff, BrandOperationCycle } from '@/types/domain'
import { getStoredEmployees, getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { resolvePanelAuthority, isManagerOrAdmin, isStepInScope, usePrincipal, resolveVisibleBrandIds } from '@/lib/permissions/panel-authority'
import { AccessDenied } from '@/components/shared/access-denied'
import { getStoredApprovals } from '@/lib/storage/local-approval-store'
import { getStoredBrands } from '@/lib/storage/local-brand-store'
import { getStoredWorkflowInstances, getWorkflowStepInstances } from '@/lib/storage/local-workflow-instance-store'
import { getStoredHandoffs } from '@/lib/storage/local-handoff-store'
import { getStoredCycles } from '@/lib/storage/local-cycle-store'
import { acceptHandoff, rejectHandoff } from '@/lib/workflows/handoff-workflow'
import { approveApproval, requestRevision, rejectApproval, requestApproval } from '@/lib/workflows/approval-workflow'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Check,
  RotateCcw,
  XCircle,
  User,
  Building,
  Layers,
  Sparkles,
  ClipboardList,
  MessageSquare,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  ArrowRightLeft,
  FileText,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { HandoffRequestCard } from '@/features/my-work/components/handoff-request-card'

export function ApprovalPage() {
  const router = useRouter()
  const { principal, activeEmployee: contextActiveEmployee } = usePrincipal()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('')
  const [approvals, setApprovals] = useState<WorkflowApproval[]>([])
  const [steps, setSteps] = useState<WorkflowStepInstance[]>([])
  const [instances, setInstances] = useState<WorkflowInstance[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [cycles, setCycles] = useState<BrandOperationCycle[]>([])
  const [handoffs, setHandoffs] = useState<WorkflowHandoff[]>([])
  const [activeSubTab, setActiveSubTab] = useState<'approvals' | 'reports' | 'handoffs'>('approvals')

  // Modal / Input states for Revision and Rejection
  const [actioningApprovalId, setActioningApprovalId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'revision' | 'reject' | null>(null)
  const [noteText, setNoteText] = useState('')

  // Step detail modal
  const [selectedStepDetail, setSelectedStepDetail] = useState<WorkflowStepInstance | null>(null)

  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoadingAuth(true)
    const employeeList = await getStoredEmployees()
    setEmployees(employeeList)

    if (contextActiveEmployee) {
      setCurrentEmployeeId(contextActiveEmployee.id)
    } else {
      const savedId = getActiveEmployeeId()
      if (savedId && employeeList.some((e) => e.id === savedId)) {
        if (currentEmployeeId !== savedId) {
          setCurrentEmployeeId(savedId)
        }
      } else if (employeeList.length > 0 && !currentEmployeeId) {
        setCurrentEmployeeId(employeeList[0].id)
      }
    }

    const storedApprovals = await getStoredApprovals()
    const storedSteps = await getWorkflowStepInstances()
    const storedInstances = await getStoredWorkflowInstances()
    const storedBrands = await getStoredBrands()
    const storedHandoffs = await getStoredHandoffs()
    const storedCycles = await getStoredCycles()

    // RETROACTIVE REPAIR: requiresApproval olup active status'te kalmış adımları otomatik onaya gönder (revize veya red aşamasında olmayanlar)
    const stuckActiveApprovalSteps = storedSteps.filter(s => 
      s.status === 'active' && 
      s.requiresApproval && 
      s.approvalStatus !== 'revision_requested' && 
      s.approvalStatus !== 'rejected'
    )
    if (stuckActiveApprovalSteps.length > 0) {
      let repairDone = false
      for (const step of stuckActiveApprovalSteps) {
        try {
          const hasPending = storedApprovals.some(a => a.workflowStepInstanceId === step.id && a.status === 'pending')
          if (!hasPending) {
            const inst = storedInstances.find(i => i.id === step.workflowInstanceId)
            const requesterId = step.assignedEmployeeId || 'system'
            await requestApproval({
              workflowInstanceId: step.workflowInstanceId,
              stepInstanceId: step.id,
              requestedByEmployeeId: requesterId,
              note: 'Süreç bu adıma geldiği için otomatik onay talebi oluşturuldu.'
            })
            repairDone = true
          }
        } catch (e) {
          console.error('[Retroactive Repair] Hata:', e)
        }
      }

      if (repairDone) {
        // Yeniden yükle
        const updatedApprovals = await getStoredApprovals()
        setApprovals(updatedApprovals)
        const updatedSteps = await getWorkflowStepInstances()
        setSteps(updatedSteps)
      } else {
        setApprovals(storedApprovals)
        setSteps(storedSteps)
      }
    } else {
      setApprovals(storedApprovals)
      setSteps(storedSteps)
    }

    setInstances(storedInstances)
    setBrands(storedBrands)
    setCycles(storedCycles)
    setHandoffs(storedHandoffs)
    setIsLoadingAuth(false)
  }, [currentEmployeeId, contextActiveEmployee])

  useEffect(() => {
    loadData()
  }, [loadData])

  const currentEmployee = useMemo(() => {
    if (contextActiveEmployee) return contextActiveEmployee
    return employees.find((e) => e.id === currentEmployeeId)
  }, [contextActiveEmployee, employees, currentEmployeeId])

  // Resolve permission guard
  const hasPermission = useMemo(() => {
    return resolvePanelAuthority(principal, currentEmployee, ['approval.review', 'tasks.assign', 'task.manage'])
  }, [principal, currentEmployee])

  const hasReviewPermission = useMemo(() => {
    return resolvePanelAuthority(principal, currentEmployee, 'approval.review')
  }, [principal, currentEmployee])

  // Set default tab for regular employees
  useEffect(() => {
    if (currentEmployee && !hasReviewPermission) {
      setActiveSubTab('handoffs')
    }
  }, [currentEmployee, hasReviewPermission])

  // Central operations or full admin
  const isManagerExposed = useMemo(() => {
    return isManagerOrAdmin(principal, currentEmployee)
  }, [principal, currentEmployee])

  // Visible brand scope
  const visibleBrandIds = useMemo(() => {
    return resolveVisibleBrandIds(principal, currentEmployee, brands, instances)
  }, [principal, currentEmployee, brands, instances])

  // Check if step maps to manager's teams
  const isStepInManagerTeams = (step: WorkflowStepInstance) => {
    return isStepInScope(principal, step, currentEmployee, employees)
  }

  // Filtreleme Kuralları:
  // 1. Durumu pending olan tüm onaylar
  // 2. Marka Art Director/Çalışan görünürlük alanında olmalıdır
  // 3. Art Director için: Yalnızca kreatif / grafik stüdyo teslimleri veya doğrudan onay atanmış talepler
  const allReviewableApprovals = useMemo(() => {
    return approvals.filter((a) => {
      if (a.status !== 'pending') return false

      const step = steps.find(s => s.id === a.workflowStepInstanceId)
      const instance = instances.find(i => i.id === a.workflowInstanceId)

      // Brand Scope Filter: instance must belong to a visible brand
      if (instance && instance.brandId && !visibleBrandIds.has(String(instance.brandId))) {
        return false
      }

      if (a.approvalType === 'client') {
        if (!instance || visibleBrandIds.has(String(instance.brandId))) {
          return true // Müşteri onayları kendi markalarında simülasyon amacıyla listelenir
        }
        return false
      }

      if (a.approverEmployeeId === currentEmployeeId) {
        return true
      }

      // Art Director scope: only Graphic Design / Creative studio submissions
      if (currentEmployee?.rolePackageId === 'art-director') {
        if (!step) return false
        const requester = employees.find(e => e.id === a.requestedByEmployeeId || (step.assignedEmployeeId && e.id === step.assignedEmployeeId))
        const isGraphicDesignStep = step.responsibilityRole === 'graphic_design' || step.responsibilityRole === 'video_editing' || step.teamId === 'grafik-studyo'
        const isGraphicDesignerRequester = requester?.rolePackageId === 'grafik-tasarim' || requester?.teamIds?.includes('grafik-studyo')

        return isGraphicDesignStep || isGraphicDesignerRequester
      }

      if (a.approvalType === 'internal' && (isManagerExposed || (step && isStepInManagerTeams(step)))) {
        return true
      }

      return false
    })
  }, [approvals, steps, instances, currentEmployee, currentEmployeeId, isManagerExposed, visibleBrandIds, isStepInManagerTeams, employees])

  // 1. Raporlar - Sunumlar Onayları
  const reportApprovals = useMemo(() => {
    // Art Director does not receive report/presentation approvals from unrelated departments
    if (currentEmployee?.rolePackageId === 'art-director') return []

    return allReviewableApprovals.filter((a) => {
      const step = steps.find(s => s.id === a.workflowStepInstanceId)
      const instance = instances.find(i => i.id === a.workflowInstanceId)
      const textToSearch = `${step?.title || ''} ${instance?.title || ''}`.toLowerCase()
      return textToSearch.includes('rapor') || textToSearch.includes('sunum') || textToSearch.includes('report') || textToSearch.includes('presentation')
    })
  }, [allReviewableApprovals, steps, instances, currentEmployee])

  // 2. Genel Süreç Onayları (Rapor ve Sunum olmayanlar)
  const processApprovals = useMemo(() => {
    return allReviewableApprovals.filter((a) => {
      const step = steps.find(s => s.id === a.workflowStepInstanceId)
      const instance = instances.find(i => i.id === a.workflowInstanceId)
      const textToSearch = `${step?.title || ''} ${instance?.title || ''}`.toLowerCase()
      const isReportOrPresentation = textToSearch.includes('rapor') || textToSearch.includes('sunum') || textToSearch.includes('report') || textToSearch.includes('presentation')
      return !isReportOrPresentation
    })
  }, [allReviewableApprovals, steps, instances])

  // 3. Paslama Talepleri (Handoffs)
  const pendingHandoffs = useMemo(() => {
    return handoffs.filter((h) => {
      if (h.status !== 'pending') return false

      const step = steps.find(s => s.id === h.workflowStepInstanceId)
      const instance = instances.find(i => i.id === step?.workflowInstanceId)

      // Brand must be in scope
      if (instance && instance.brandId && !visibleBrandIds.has(String(instance.brandId))) {
        return false
      }

      // Direct handoff to current employee
      if (h.toEmployeeId === currentEmployeeId) return true

      // Art Director scope for handoffs
      if (currentEmployee?.rolePackageId === 'art-director') {
        if (!step) return false
        return isStepInManagerTeams(step)
      }

      // Central management
      if (hasReviewPermission && isManagerExposed) return true

      return false
    })
  }, [handoffs, steps, instances, visibleBrandIds, currentEmployee, currentEmployeeId, hasReviewPermission, isManagerExposed, isStepInManagerTeams])

  const visibleList = useMemo(() => {
    if (activeSubTab === 'approvals') return processApprovals
    if (activeSubTab === 'reports') return reportApprovals
    return []
  }, [activeSubTab, processApprovals, reportApprovals])

  const totalPendingCount = useMemo(() => {
    return processApprovals.length + reportApprovals.length + pendingHandoffs.length
  }, [processApprovals, reportApprovals, pendingHandoffs])

  // Helper names
  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id)
    return emp ? emp.fullName : 'Bilinmeyen Çalışan'
  }

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  // ACTIONS
  const handleApprove = async (approvalId: string) => {
    try {
      await approveApproval(approvalId, currentEmployeeId)
      toast.success('Onay işlemi gerçekleştirildi.')
      await loadData()
    } catch (err: any) {
      toast.error('Onaylanırken hata oluştu', {
        description: err.message,
      })
    }
  }

  const handleOpenActionModal = (approvalId: string, type: 'revision' | 'reject') => {
    setActioningApprovalId(approvalId)
    setActionType(type)
    setNoteText('')
  }

  const handleCloseActionModal = () => {
    setActioningApprovalId(null)
    setActionType(null)
    setNoteText('')
  }

  const handleConfirmAction = async () => {
    if (!actioningApprovalId || !actionType) return

    if (actionType === 'revision' && !noteText.trim()) {
      toast.error('Revize açıklaması yazılması zorunludur!')
      return
    }

    try {
      if (actionType === 'revision') {
        await requestRevision(actioningApprovalId, currentEmployeeId, noteText)
        toast.success('Revize talebi gönderildi.')
      } else {
        await rejectApproval(actioningApprovalId, currentEmployeeId, noteText || undefined)
        toast.success('Onay talebi reddedildi.')
      }
      await loadData()
      handleCloseActionModal()
    } catch (err: any) {
      toast.error('İşlem başarısız', {
        description: err.message,
      })
    }
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
      {/* Üst Bar: Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-neutral-900/40">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5.5 w-5.5 text-purple-500" />
            Onay Merkezi
            {totalPendingCount > 0 && (
              <Badge className="bg-purple-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                {totalPendingCount} Bekleyen
              </Badge>
            )}
          </h2>
          <p className="text-xs text-muted-foreground">
            Onayınızı bekleyen ajans içi ve müşteri onay süreçlerini buradan yönetin.
          </p>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="border-b border-neutral-900 pb-px">
        <div className="flex flex-wrap gap-1">
          {hasReviewPermission && (
            <>
              <button
                type="button"
                onClick={() => setActiveSubTab('approvals')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all duration-200 focus:outline-none',
                  activeSubTab === 'approvals'
                    ? 'border-purple-500 text-purple-400 bg-purple-500/[0.02]'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-neutral-805'
                )}
              >
                <ClipboardList className="h-4 w-4 shrink-0" />
                <span>Süreç Onayları</span>
                <Badge
                  variant="outline"
                  className={cn(
                    'px-1.5 py-0 rounded-full text-[9px] font-extrabold ml-1 border',
                    activeSubTab === 'approvals' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' : 'bg-muted/30 text-muted-foreground border-neutral-800'
                  )}
                >
                  {processApprovals.length}
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('reports')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all duration-200 focus:outline-none',
                  activeSubTab === 'reports'
                    ? 'border-blue-500 text-blue-400 bg-blue-500/[0.02]'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-neutral-805'
                )}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span>Raporlar & Sunumlar</span>
                <Badge
                  variant="outline"
                  className={cn(
                    'px-1.5 py-0 rounded-full text-[9px] font-extrabold ml-1 border',
                    activeSubTab === 'reports' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'bg-muted/30 text-muted-foreground border-neutral-800'
                  )}
                >
                  {reportApprovals.length}
                </Badge>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setActiveSubTab('handoffs')}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all duration-200 focus:outline-none',
              activeSubTab === 'handoffs'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/[0.02]'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-neutral-805'
            )}
          >
            <ArrowRightLeft className="h-4 w-4 shrink-0" />
            <span>Paslama Talepleri</span>
            <Badge
              variant="outline"
              className={cn(
                'px-1.5 py-0 rounded-full text-[9px] font-extrabold ml-1 border',
                activeSubTab === 'handoffs' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-muted/30 text-muted-foreground border-neutral-800'
              )}
            >
              {pendingHandoffs.length}
            </Badge>
          </button>
        </div>
      </div>

      {/* Kartlar Grid Listesi */}
      {activeSubTab === 'handoffs' ? (
        pendingHandoffs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingHandoffs.map((handoff) => {
              const step = steps.find((s) => s.id === handoff.workflowStepInstanceId)
              const instance = instances.find((i) => i.id === handoff.workflowInstanceId)
              if (!step || !instance) return null

              const brand = brands.find((b) => b.id === instance.brandId)
              const brandName = brand ? brand.name : 'Bilinmeyen Marka'

              const cycle = brand ? cycles.find((c) => c.brandId === brand.id && c.id === instance.cycleId) : null
              const months = [
                'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
              ]
              const cycleLabel = cycle
                ? `${months[cycle.month - 1]} ${cycle.year}`
                : 'Genel Dönem'

              return (
                <HandoffRequestCard
                  key={handoff.id}
                  handoff={handoff}
                  step={step}
                  instance={instance}
                  brandName={brandName}
                  cycleLabel={cycleLabel}
                  employees={employees}
                  currentEmployeeId={currentEmployeeId}
                  onActionSuccess={loadData}
                />
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-neutral-850 bg-neutral-950/[0.04] space-y-4 max-w-md mx-auto my-8 animate-in fade-in duration-300">
            <div className="rounded-full bg-neutral-900/60 p-4 border border-neutral-800 shadow-inner">
              <ArrowRightLeft className="h-7 w-7 text-neutral-500" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-foreground">Bekleyen Paslama Talebi Yok</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Şu anda karar vermenizi veya kabul etmenizi bekleyen herhangi bir paslama (görev devir) talebi bulunmamaktadır.
              </p>
            </div>
          </div>
        )
      ) : visibleList.length > 0 ? (
        <div className="grid gap-4">
          {visibleList.map((app) => {
            const step = steps.find((s) => s.id === app.workflowStepInstanceId)
            const instance = instances.find((i) => i.id === app.workflowInstanceId)
            const brand = instance ? brands.find((b) => b.id === instance.brandId) : null
            const requesterName = getEmployeeName(app.requestedByEmployeeId)

            return (
              <Card
                key={app.id}
                className="border bg-card/25 shadow-sm backdrop-blur-md hover:border-neutral-850 transition-colors overflow-hidden rounded-2xl relative"
              >
                {/* Onay Tipi Sol Çizgi Vurgusu */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                    app.approvalType === 'client' ? 'bg-amber-500' : 'bg-purple-500'
                  }`}
                />

                <CardContent className="p-5 pl-7 space-y-4">
                  {/* Üst Kısım: Marka, İş Akışı, Onay Tipi */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-neutral-900 pb-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold flex-wrap">
                        <Building className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                        <span>{brand ? brand.name : 'Bilinmeyen Marka'}</span>
                        <span className="text-neutral-700">•</span>
                        <Layers className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                        <span className="truncate">{instance ? instance.title : 'Bilinmeyen İş Akışı'}</span>
                      </div>
                      <h4 className="text-sm font-black text-foreground flex items-center gap-2 mt-1">
                        <Sparkles className="h-4 w-4 text-neutral-500 shrink-0" />
                        {step ? step.title : 'Onay Adımı'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          app.approvalType === 'client'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/25'
                        }`}
                      >
                        {app.approvalType === 'client' ? 'Müşteri Onayı' : 'Ajans İçi Onay'}
                      </Badge>
                    </div>
                  </div>

                  {/* DETAY GRID: Kim istedi, ne zaman, hangi adımda */}
                  <div className="grid gap-3 sm:grid-cols-4 bg-neutral-950/30 rounded-xl p-3 border border-neutral-900/60 text-xs">
                    <div className="space-y-0.5">
                      <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Talep Eden (Tasarımcı)</span>
                      <div className="flex items-center gap-1.5 font-semibold text-foreground flex-wrap">
                        <User className="h-3 w-3 text-neutral-500" />
                        <span>{requesterName}</span>
                        {(() => {
                          const reqEmp = employees.find(e => e.id === app.requestedByEmployeeId)
                          if (!reqEmp) return null
                          return reqEmp.employmentType === 'freelance' ? (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[9px] font-bold px-1.5 py-0">
                              Freelance
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[9px] font-bold px-1.5 py-0">
                              Tam Zamanlı
                            </Badge>
                          )
                        })()}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Gönderilme Tarihi</span>
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 text-neutral-500" />
                        {formatTime(app.createdAt)}
                      </span>
                    </div>
                    {step && (
                      <div className="space-y-0.5">
                        <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Sorumluluk</span>
                        <span className="font-semibold text-foreground">
                          {step.responsibilityRole
                            ? ({ operation:'Operasyon', social_media:'Sosyal Medya', graphic_design:'Grafik Tasarım',
                                video_editing:'Video Kurgu', photography:'Fotoğraf', videography:'Video',
                                digital_marketing:'Dijital Pazarlama', strategy:'Strateji',
                                reporting:'Raporlama', custom:'Özel' } as Record<string,string>)[step.responsibilityRole] || step.responsibilityRole
                            : 'Operasyon'}
                        </span>
                      </div>
                    )}
                    {step && step.creativeCount !== undefined && step.creativeCount !== null && (
                      <div className="space-y-0.5">
                        <span className="block text-[9px] uppercase tracking-wider text-purple-400 font-bold">Kreatif Adedi</span>
                        <Badge variant="outline" className="bg-purple-950/40 text-purple-300 border-purple-700/50 text-[10px] font-extrabold px-2 py-0.5">
                          🎨 {step.creativeCount} Adet
                        </Badge>
                      </div>
                    )}
                  </div>

                  {app.note && (
                    <div className="bg-muted/10 rounded-xl p-3 border border-neutral-900 text-xs flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold block text-[9px] uppercase text-muted-foreground">Talep Notu</span>
                        <span className="text-muted-foreground">{app.note}</span>
                      </div>
                    </div>
                  )}

                  {/* Adım İçeriği: Teslim Açıklaması, Brief, Linkler */}
                  {step && (() => {
                    const desc = step.description || ''
                    const deliveryMarker = '[Teslim Açıklaması]:'
                    const briefMarker = '[Brief Detayları]:'
                    const photoMarker = '[Fotoğraf/Görsel Bağlantıları]:'
                    const fileMarker = '[Dosya Bağlantıları]:'

                    const deliveryIdx = desc.indexOf(deliveryMarker)
                    const briefIdx = desc.indexOf(briefMarker)
                    const photoIdx = desc.indexOf(photoMarker)
                    const fileIdx = desc.indexOf(fileMarker)

                    const deliveryText = deliveryIdx !== -1
                      ? desc.substring(deliveryIdx + deliveryMarker.length).split('\n[')[0].trim() : ''
                    const briefText = briefIdx !== -1
                      ? desc.substring(briefIdx + briefMarker.length).split('\n[')[0].trim() : ''
                    const photoLinks = photoIdx !== -1
                      ? desc.substring(photoIdx + photoMarker.length).split('\n[')[0].trim().split(',').map(l => l.trim()).filter(Boolean) : []
                    const fileLinks = fileIdx !== -1
                      ? desc.substring(fileIdx + fileMarker.length).split('\n[')[0].trim().split(',').map(l => l.trim()).filter(Boolean) : []

                    if (!deliveryText && !briefText && !photoLinks.length && !fileLinks.length) return null

                    return (
                      <div className="space-y-3">
                        {deliveryText && (
                          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/[0.15] p-3.5 space-y-1.5">
                            <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-black flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3" /> Teslim Açıklaması
                            </span>
                            <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">{deliveryText}</p>
                          </div>
                        )}
                        {briefText && (
                          <div className="rounded-xl border border-blue-500/20 bg-blue-950/[0.15] p-3.5 space-y-1.5">
                            <span className="text-[9px] uppercase tracking-wider text-blue-400 font-black flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3" /> İş Akışı Briefi
                            </span>
                            <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">{briefText}</p>
                          </div>
                        )}
                        {photoLinks.length > 0 && (
                          <div className="rounded-xl border border-purple-500/20 bg-purple-950/[0.15] p-3.5 space-y-2">
                            <span className="text-[9px] uppercase tracking-wider text-purple-400 font-black flex items-center gap-1.5">
                              <ExternalLink className="h-3 w-3" /> Teslim Edilen Görsel / Dosya Linkleri
                            </span>
                            <div className="space-y-1.5">
                              {photoLinks.map((link, idx) => (
                                <a key={idx} href={link} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-[11px] text-purple-300 hover:text-purple-100 hover:underline break-all group">
                                  <ExternalLink className="h-3 w-3 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                  {link}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        {fileLinks.length > 0 && (
                          <div className="rounded-xl border border-amber-500/20 bg-amber-950/[0.15] p-3.5 space-y-2">
                            <span className="text-[9px] uppercase tracking-wider text-amber-400 font-black flex items-center gap-1.5">
                              <ExternalLink className="h-3 w-3" /> Dosya Linkleri
                            </span>
                            <div className="space-y-1.5">
                              {fileLinks.map((link, idx) => (
                                <a key={idx} href={link} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-[11px] text-amber-300 hover:text-amber-100 hover:underline break-all group">
                                  <ExternalLink className="h-3 w-3 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                  {link}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* İş Akışı Mini-Timeline */}
                  {instance && (() => {
                    const instSteps = steps.filter(s => s.workflowInstanceId === instance.id).sort((a, b) => a.order - b.order)
                    if (instSteps.length <= 1) return null
                    return (
                      <div className="space-y-2 pt-1">
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-black flex items-center gap-1">
                          <Layers className="h-3 w-3" /> İş Akışı Adımları
                        </span>
                        <div className="flex items-center gap-0.5 flex-wrap">
                          {instSteps.map((s, idx) => {
                            const isCurrent = s.id === step?.id
                            const isCompleted = s.status === 'completed' || s.status === 'skipped'
                            const isWaiting = s.status === 'waiting_approval'
                            const isClickable = isCompleted
                            return (
                              <div key={s.id} className="flex items-center">
                                <div
                                  onClick={isClickable ? () => setSelectedStepDetail(s) : undefined}
                                  title={isClickable ? `${s.title} — detayları gör` : undefined}
                                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                                    isCurrent ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' :
                                    isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-pointer hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:scale-105' :
                                    isWaiting ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                    'bg-neutral-900/30 border-neutral-800 text-neutral-600'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 inline-block ${
                                    isCurrent ? 'bg-purple-400 animate-pulse' : isCompleted ? 'bg-emerald-400' : isWaiting ? 'bg-amber-400' : 'bg-neutral-600'
                                  }`} />
                                  {s.title}
                                  {isCompleted && <span className="text-emerald-500/60 ml-0.5">↗</span>}
                                </div>
                                {idx < instSteps.length - 1 && (
                                  <span className="text-neutral-700 text-[9px] mx-0.5">→</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Alt Kısım: Aksiyon Butonları */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-900">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {app.approvalType === 'client'
                        ? 'Simülasyon: Müşteri yerine onaylayabilir / revize isteyebilirsiniz.'
                        : 'Yetkili ajans kullanıcısı olarak karar verin.'}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => handleApprove(app.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 px-4 rounded-lg flex items-center gap-1 shadow"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Onayla
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenActionModal(app.id, 'revision')}
                        className="border-neutral-800 text-neutral-300 hover:bg-neutral-800 font-semibold text-xs h-8 px-3 rounded-lg flex items-center gap-1"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                        Revize İste
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleOpenActionModal(app.id, 'reject')}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-semibold text-xs h-8 px-3 rounded-lg flex items-center gap-1"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reddet
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-neutral-850 bg-neutral-950/[0.04] space-y-4 max-w-md mx-auto my-8 animate-in fade-in duration-300">
          <div className="rounded-full bg-neutral-900/60 p-4 border border-neutral-800 shadow-inner">
            <ClipboardList className="h-7 w-7 text-neutral-500" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-foreground">Bekleyen Onay Yok</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Bu sekme altında şu anda onaylamanız gereken herhangi bir onay talebi bulunmamaktadır.
            </p>
          </div>
        </div>
      )}

      {/* Inline Form / Revision Modal Mockup */}
      {actioningApprovalId && actionType && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-neutral-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                {actionType === 'revision' ? (
                  <>
                    <RotateCcw className="h-4.5 w-4.5 text-amber-500" />
                    Revize İsteği Oluştur
                  </>
                ) : (
                  <>
                    <XCircle className="h-4.5 w-4.5 text-rose-500" />
                    Onay Talebini Reddet
                  </>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">
                {actionType === 'revision'
                  ? 'İçeriğin düzeltilmesi için lütfen revize notlarını zorunlu olarak girin.'
                  : 'Onay talebini reddetmek için isteğe bağlı gerekçe notunuzu girin.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Gerekçe / Açıklama Notu {actionType === 'revision' && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                placeholder={actionType === 'revision' ? 'Örn: Logo boyutu büyütülsün ve renkler canlı yapılsın...' : 'Örn: Bu görsel marka kimliğiyle uyuşmuyor...'}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-muted/10 border border-neutral-800 text-xs rounded-xl p-3 min-h-[90px] text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCloseActionModal}
                className="text-xs h-8 px-3.5 rounded-lg border border-neutral-800 text-muted-foreground hover:text-foreground"
              >
                İptal
              </Button>
              <Button
                type="button"
                onClick={handleConfirmAction}
                className={`text-white font-semibold text-xs h-8 px-4 rounded-lg shadow ${
                  actionType === 'revision' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Gerekçeyi Kaydet ve Gönder
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Adım Detay Modalı (Tamamlanan adıma tıklanınca) */}
      {selectedStepDetail && (() => {
        const s = selectedStepDetail
        const desc = s.description || ''
        const deliveryIdx = desc.indexOf('[Teslim Açıklaması]:')
        const briefIdx = desc.indexOf('[Brief Detayları]:')
        const photoIdx = desc.indexOf('[Fotoğraf/Görsel Bağlantıları]:')
        const fileIdx = desc.indexOf('[Dosya Bağlantıları]:')

        const deliveryText = deliveryIdx !== -1 ? desc.substring(deliveryIdx + '[Teslim Açıklaması]:'.length).split('\n[')[0].trim() : ''
        const briefText = briefIdx !== -1 ? desc.substring(briefIdx + '[Brief Detayları]:'.length).split('\n[')[0].trim() : ''
        const photoLinks = photoIdx !== -1 ? desc.substring(photoIdx + '[Fotoğraf/Görsel Bağlantıları]:'.length).split('\n[')[0].trim().split(',').map(l => l.trim()).filter(Boolean) : []
        const fileLinks = fileIdx !== -1 ? desc.substring(fileIdx + '[Dosya Bağlantıları]:'.length).split('\n[')[0].trim().split(',').map(l => l.trim()).filter(Boolean) : []
        const baseDesc = (briefIdx !== -1 ? desc.substring(0, briefIdx) : deliveryIdx !== -1 ? desc.substring(0, deliveryIdx) : desc).trim()

        const assignee = employees.find(e => e.id === s.assignedEmployeeId)

        const formatDt = (iso?: string) => {
          if (!iso) return '-'
          try { return new Date(iso).toLocaleString('tr-TR', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }) } catch { return '-' }
        }

        return (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedStepDetail(null) }}
          >
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
              {/* Header */}
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-black">Tamamlanan Adım Detayı</span>
                    </div>
                    <h3 className="text-base font-black text-foreground">{s.title}</h3>
                    {assignee && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> {assignee.fullName}
                        {s.completedAt && <span className="ml-1 text-emerald-500/70">• {formatDt(s.completedAt)}'de tamamlandı</span>}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedStepDetail(null)}
                    className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors shrink-0"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {/* Teslim Açıklaması */}
                  {deliveryText ? (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/[0.15] p-3.5 space-y-1.5">
                      <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-black flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3" /> Teslim Açıklaması
                      </span>
                      <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">{deliveryText}</p>
                    </div>
                  ) : baseDesc ? (
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/20 p-3.5 space-y-1.5">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-black">Adım Açıklaması</span>
                      <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">{baseDesc}</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/20 p-4 text-center">
                      <p className="text-xs text-muted-foreground">Bu adım için teslim açıklaması girilmemiş.</p>
                    </div>
                  )}

                  {/* Brief */}
                  {briefText && (
                    <div className="rounded-xl border border-blue-500/20 bg-blue-950/[0.15] p-3.5 space-y-1.5">
                      <span className="text-[9px] uppercase tracking-wider text-blue-400 font-black flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" /> İş Akışı Briefi
                      </span>
                      <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">{briefText}</p>
                    </div>
                  )}

                  {/* Görsel / Dosya Linkleri */}
                  {photoLinks.length > 0 && (
                    <div className="rounded-xl border border-purple-500/20 bg-purple-950/[0.15] p-3.5 space-y-2">
                      <span className="text-[9px] uppercase tracking-wider text-purple-400 font-black flex items-center gap-1.5">
                        <ExternalLink className="h-3 w-3" /> Teslim Edilen Görsel / Dosya Linkleri
                      </span>
                      <div className="space-y-1.5">
                        {photoLinks.map((link, idx) => (
                          <a key={idx} href={link} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-100 hover:underline break-all group">
                            <ExternalLink className="h-3 w-3 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {fileLinks.length > 0 && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-950/[0.15] p-3.5 space-y-2">
                      <span className="text-[9px] uppercase tracking-wider text-amber-400 font-black flex items-center gap-1.5">
                        <ExternalLink className="h-3 w-3" /> Dosya Linkleri
                      </span>
                      <div className="space-y-1.5">
                        {fileLinks.map((link, idx) => (
                          <a key={idx} href={link} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-100 hover:underline break-all group">
                            <ExternalLink className="h-3 w-3 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-1 border-t border-neutral-900">
                  <Button
                    type="button"
                    onClick={() => setSelectedStepDetail(null)}
                    className="h-8 text-xs px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold"
                  >
                    Kapat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
