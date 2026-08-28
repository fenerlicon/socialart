'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type {
  Brand,
  Employee,
  BrandOperationCycle,
  WorkflowInstance,
  WorkflowStepInstance,
  WorkflowHistory,
  WorkflowHandoff,
  Notification,
} from '@/types/domain'
import { getStoredBrands } from '@/lib/storage/local-brand-store'
import { getStoredEmployees, getActiveEmployeeId, setActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { usePrincipal } from '@/lib/permissions/panel-authority'
import { getStoredCycles } from '@/lib/storage/local-cycle-store'
import { getStoredHandoffs } from '@/lib/storage/local-handoff-store'
import { getStoredNotifications } from '@/lib/storage/local-notification-store'
import {
  getWorkflowInstancesByCycleId,
  getWorkflowStepInstances,
  getStoredWorkflowHistory,
  getStoredWorkflowInstances,
} from '@/lib/storage/local-workflow-instance-store'
import { MyWorkStatCard } from './my-work-stat-card'
import { MyWorkFilters } from './my-work-filters'
import { MyWorkCard } from './my-work-card'
import { HandoffRequestCard } from './handoff-request-card'
import { MyWorkEmptyState } from './my-work-empty-state'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Briefcase,
  Play,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  Users,
  ArrowRightLeft,
  Bell,
  AlertTriangle,
} from 'lucide-react'

export function MyWorkPage() {
  const router = useRouter()
  const { principal, activeEmployee: contextActiveEmployee } = usePrincipal()
  
  // 1. Data States
  const [brands, setBrands] = useState<Brand[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [cycles, setCycles] = useState<BrandOperationCycle[]>([])
  const [instances, setInstances] = useState<WorkflowInstance[]>([])
  const [steps, setSteps] = useState<WorkflowStepInstance[]>([])
  const [history, setHistory] = useState<WorkflowHistory[]>([])
  const [handoffs, setHandoffs] = useState<WorkflowHandoff[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  // 2. Active Employee & Tab Selection
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'today' | 'active' | 'uncompleted' | 'pending' | 'handoffs' | 'completed'>('active')

  // 3. Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrandId, setSelectedBrandId] = useState('all')
  const [selectedCycleId, setSelectedCycleId] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedResponsibility, setSelectedResponsibility] = useState('all')

  // 4. Load all storage data
  const loadData = useCallback(async () => {
    const brandList = await getStoredBrands()
    const employeeList = await getStoredEmployees()
    const cycleList = await getStoredCycles()
    const instanceList = await getStoredWorkflowInstances()
    const stepList = await getWorkflowStepInstances()
    const historyList = await getStoredWorkflowHistory()
    const handoffList = await getStoredHandoffs()
    const notificationList = await getStoredNotifications()

    setBrands(brandList)
    setEmployees(employeeList)
    setCycles(cycleList)
    setInstances(instanceList)
    setSteps(stepList)
    setHistory(historyList)
    setHandoffs(handoffList)
    setNotifications(notificationList)

    // Set default selected employee if not set
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
        setActiveEmployeeId(employeeList[0].id)
      }
    }
  }, [currentEmployeeId, contextActiveEmployee])

  const handleEmployeeChange = (id: string) => {
    setCurrentEmployeeId(id)
    setActiveEmployeeId(id)
  }

  const unreadNotificationsCount = useMemo(() => {
    if (!currentEmployeeId) return 0
    return notifications.filter((n) => n.recipientEmployeeId === currentEmployeeId && !n.isRead).length
  }, [currentEmployeeId, notifications])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Get current active employee object
  const currentEmployee = useMemo(() => {
    if (contextActiveEmployee) return contextActiveEmployee
    return employees.find((e) => e.id === currentEmployeeId)
  }, [contextActiveEmployee, employees, currentEmployeeId])

  // 5. Dynamic filter lists
  const brandsList = useMemo(() => {
    return brands.map((b) => ({ id: b.id, name: b.name }))
  }, [brands])

  const cyclesList = useMemo(() => {
    return cycles.map((c) => {
      const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
      ]
      const mLabel = months[c.month - 1] || c.month
      return { id: c.id, label: `${mLabel} ${c.year} (${c.notes || 'Dönem'})` }
    })
  }, [cycles])

  const typesList = useMemo(() => {
    // Extract first word of workflow instance titles as type
    const types = instances.map((i) => i.title.split(' ')[0])
    return Array.from(new Set(types)).filter(Boolean)
  }, [instances])

  const responsibilitiesList = useMemo(() => {
    const roles = steps.map((s) => s.responsibilityRole).filter(Boolean)
    return Array.from(new Set(roles)) as string[]
  }, [steps])

  // Helper to check if step is overdue/failed
  const isStepOverdue = (s: WorkflowStepInstance) => {
    if (['completed', 'skipped', 'cancelled'].includes(s.status)) return false
    if (s.status === 'failed') return true
    if (!s.dueDate) return false
    return new Date(s.dueDate).getTime() < Date.now()
  }

  // 6. Tab based filtration & metrics for the selected employee
  const employeeSteps = useMemo(() => {
    if (!currentEmployeeId && !currentEmployee) return { today: [], active: [], uncompleted: [], pending: [], completed: [] }

    const isAssignedToMe = (s: WorkflowStepInstance) => {
      if (!currentEmployee) return s.assignedEmployeeId === currentEmployeeId
      const targetIds = new Set<string>()
      if (currentEmployee.id) targetIds.add(String(currentEmployee.id))
      if (currentEmployee.db1EmployeeId) targetIds.add(String(currentEmployee.db1EmployeeId))
      if (currentEmployeeId) targetIds.add(String(currentEmployeeId))
      return s.assignedEmployeeId ? targetIds.has(String(s.assignedEmployeeId)) : false
    }

    const isActorMe = (actorId?: string | null) => {
      if (!actorId || !currentEmployee) return actorId === currentEmployeeId
      const targetIds = new Set<string>()
      if (currentEmployee.id) targetIds.add(String(currentEmployee.id))
      if (currentEmployee.db1EmployeeId) targetIds.add(String(currentEmployee.db1EmployeeId))
      if (currentEmployeeId) targetIds.add(String(currentEmployeeId))
      return targetIds.has(String(actorId))
    }

    // Tamamlanmayan / Geciken İşler: overdue or failed
    const uncompleted = steps.filter(
      (s) => isAssignedToMe(s) && isStepOverdue(s)
    )

    // Bugünkü İşler: active and assigned to employee (no due date or due today/past)
    const today = steps.filter((s) => {
      const isTodayOrPast = !s.dueDate || new Date(s.dueDate).toDateString() === new Date().toDateString()
      return s.status === 'active' && isAssignedToMe(s) && isTodayOrPast
    })

    // Aktif İşler: active and assigned to employee
    const active = steps.filter(
      (s) => s.status === 'active' && isAssignedToMe(s)
    )

    // Bekleyenler: pending and assigned to employee
    const pending = steps.filter(
      (s) => s.status === 'pending' && isAssignedToMe(s)
    )

    // Tamamlananlar: bizzat aksiyon aldığı işler
    const completedStepIds = new Set(
      history
        .filter(
          (h) =>
            isActorMe(h.actorEmployeeId) &&
            ['complete', 'skip', 'cancel'].includes(h.action)
        )
        .map((h) => h.workflowStepInstanceId)
    )
    const completed = steps.filter((s) => completedStepIds.has(s.id))

    return { today, active, uncompleted, pending, completed }
  }, [steps, history, currentEmployeeId, currentEmployee])

  const hasUnexplainedOverdue = useMemo(() => {
    return employeeSteps.uncompleted.some((s) => !s.failureReason?.trim())
  }, [employeeSteps.uncompleted])

  const unexplainedCount = useMemo(() => {
    return employeeSteps.uncompleted.filter((s) => !s.failureReason?.trim()).length
  }, [employeeSteps.uncompleted])

  const pendingHandoffsForMe = useMemo(() => {
    if (!currentEmployeeId) return []
    return handoffs.filter((h) => h.toEmployeeId === currentEmployeeId && h.status === 'pending')
  }, [handoffs, currentEmployeeId])

  const filteredHandoffs = useMemo(() => {
    return pendingHandoffsForMe.filter((handoff) => {
      // Find instance
      const instance = instances.find((i) => i.id === handoff.workflowInstanceId)
      if (!instance) return false

      // Find step
      const step = steps.find((s) => s.id === handoff.workflowStepInstanceId)
      if (!step) return false

      // Find brand
      const isGeneral = instance.id === 'inst-general-agency-tasks' || instance.brandId === 'general' || instance.brandId === 'general-agency' || instance.brandId === 'general-brand' || !instance.brandId || instance.title.includes('Genel Ajans')
      const brand = isGeneral ? null : brands.find((b) => b.id === instance.brandId)
      const brandName = isGeneral ? 'Genel Ajans' : (brand ? brand.name : 'Genel Ajans')

      // 1. Search Query Match (Brand name or workflow title or step title)
      const query = searchQuery.toLowerCase().trim()
      if (query) {
        const matchesBrand = brandName.toLowerCase().includes(query)
        const matchesWorkflow = instance.title.toLowerCase().includes(query)
        const matchesStep = step.title.toLowerCase().includes(query)
        if (!matchesBrand && !matchesWorkflow && !matchesStep) {
          return false
        }
      }

      // 2. Selected Brand Match
      if (selectedBrandId !== 'all' && instance.brandId !== selectedBrandId) {
        return false
      }

      // 3. Selected Cycle Match
      if (selectedCycleId !== 'all' && instance.cycleId !== selectedCycleId) {
        return false
      }

      // 4. Selected Type Match
      if (selectedType !== 'all') {
        const workflowType = instance.title.split(' ')[0]
        if (workflowType !== selectedType) {
          return false
        }
      }

      // 5. Selected Responsibility Match
      if (selectedResponsibility !== 'all' && step.responsibilityRole !== selectedResponsibility) {
        return false
      }

      return true
    })
  }, [
    pendingHandoffsForMe,
    instances,
    steps,
    brands,
    searchQuery,
    selectedBrandId,
    selectedCycleId,
    selectedType,
    selectedResponsibility,
  ])

  // 7. Apply search and select filters on current active tab items
  const filteredItems = useMemo(() => {
    const items = employeeSteps[activeTab]

    return items.filter((step) => {
      // Find instance
      const instance = instances.find((i) => i.id === step.workflowInstanceId)
      if (!instance) return false

      // Find brand
      const isGeneral = instance.id === 'inst-general-agency-tasks' || instance.brandId === 'general' || instance.brandId === 'general-agency' || instance.brandId === 'general-brand' || !instance.brandId || instance.title.includes('Genel Ajans')
      const brand = isGeneral ? null : brands.find((b) => b.id === instance.brandId)
      const brandName = isGeneral ? 'Genel Ajans' : (brand ? brand.name : 'Genel Ajans')

      // 1. Search Query Match (Brand name or workflow title)
      const query = searchQuery.toLowerCase().trim()
      if (query) {
        const matchesBrand = brandName.toLowerCase().includes(query)
        const matchesWorkflow = instance.title.toLowerCase().includes(query)
        const matchesStep = step.title.toLowerCase().includes(query)
        if (!matchesBrand && !matchesWorkflow && !matchesStep) {
          return false
        }
      }

      // 2. Selected Brand Match
      if (selectedBrandId !== 'all' && instance.brandId !== selectedBrandId) {
        return false
      }

      // 3. Selected Cycle Match
      if (selectedCycleId !== 'all' && instance.cycleId !== selectedCycleId) {
        return false
      }

      // 4. Selected Type Match
      if (selectedType !== 'all') {
        const workflowType = instance.title.split(' ')[0]
        if (workflowType !== selectedType) {
          return false
        }
      }

      // 5. Selected Responsibility Match
      if (selectedResponsibility !== 'all' && step.responsibilityRole !== selectedResponsibility) {
        return false
      }

      return true
    })
  }, [
    employeeSteps,
    activeTab,
    instances,
    brands,
    searchQuery,
    selectedBrandId,
    selectedCycleId,
    selectedType,
    selectedResponsibility,
  ])

  // 8. Action success handler
  const handleActionSuccess = () => {
    loadData() // Refresh steps and history to trigger immediate screen updates!
  }

  // Tab labels
  const tabConfigs = [
    { id: 'today', label: 'Bugünkü İşler', count: employeeSteps.today.length, icon: <Calendar className="h-4 w-4" /> },
    { id: 'active', label: 'Aktif İşler', count: employeeSteps.active.length, icon: <Play className="h-4 w-4" /> },
    { id: 'uncompleted', label: 'Tamamlanmayan İşler', count: employeeSteps.uncompleted.length, icon: <AlertTriangle className="h-4 w-4 text-red-400" /> },
    { id: 'pending', label: 'Bekleyenler', count: employeeSteps.pending.length, icon: <Clock className="h-4 w-4" /> },
    { id: 'completed', label: 'Tamamlananlar', count: employeeSteps.completed.length, icon: <CheckCircle2 className="h-4 w-4" /> },
  ] as const

  return (
    <div className="space-y-6">
      {/* Üst Kısım: Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-neutral-900/40">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-500" />
            Benim İşlerim
          </h2>
          <p className="text-xs text-muted-foreground">
            Size atanmış canlı operasyon adımlarını takip edin ve yönetin.
          </p>
        </div>
      </div>

      {/* Açıklaması Yazılmamış Geciken İş Uyarısı */}
      {hasUnexplainedOverdue && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 px-5 rounded-2xl border border-red-500/40 bg-red-950/40 backdrop-blur-md shadow-lg shadow-red-950/30 gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-red-300 flex items-center gap-2">
                ⚠️ Açıklaması Yazılmamış Geciken İşiniz Var ({unexplainedCount} Adet)
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                Vaktinde teslim edilemeyen iş adımlarınız bulunmaktadır. Sistem kuralları gereği, yeni bir işi tamamlayabilmek için geciken işlerinize açıklama yazmanız zorunludur.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setActiveTab('uncompleted')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 px-4 rounded-xl shrink-0 shadow-md shadow-red-500/20"
          >
            Geciken İşlere Açıklama Yaz →
          </Button>
        </div>
      )}

      {/* Okunmamış Bildirim Özeti */}
      {unreadNotificationsCount > 0 && (
        <div className="flex items-center justify-between p-3.5 px-5 rounded-2xl border border-blue-500/15 bg-blue-500/[0.02] backdrop-blur-md shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
              <Bell className="h-4 w-4 animate-bounce" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-foreground">Okunmamış Bildirimleriniz Var</h4>
              <p className="text-[10px] text-muted-foreground leading-normal">
                Süreçte sizinle ilgili {unreadNotificationsCount} yeni olay gerçekleşti.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => router.push('/notifications')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] h-8 px-3.5 rounded-lg flex items-center gap-1 shadow"
          >
            Bildirimleri Gör
          </Button>
        </div>
      )}

      {/* İstatistik Kartları */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MyWorkStatCard
          title="Aktif İşler"
          value={employeeSteps.active.length}
          icon={<Play className="h-4.5 w-4.5" />}
          description="Size atanmış yayındaki aktif adımlar"
          colorClass="text-blue-500 bg-blue-500/10 border-blue-500/20"
        />
        <MyWorkStatCard
          title="Tamamlanmayanlar"
          value={employeeSteps.uncompleted.length}
          icon={<AlertTriangle className="h-4.5 w-4.5" />}
          description="Vakti geçmiş veya geciken işler"
          colorClass="text-red-500 bg-red-500/10 border-red-500/20"
        />
        <MyWorkStatCard
          title="Bugün Teslim"
          value={employeeSteps.today.length}
          icon={<Calendar className="h-4.5 w-4.5" />}
          description="Bugün teslim edilmesi gereken işler"
          colorClass="text-amber-500 bg-amber-500/10 border-amber-500/20"
        />
        <MyWorkStatCard
          title="Bekleyenler"
          value={employeeSteps.pending.length}
          icon={<Clock className="h-4.5 w-4.5" />}
          description="Ön onay/adımları bekleyen işleriniz"
          colorClass="text-neutral-400 bg-neutral-500/10 border-neutral-800"
        />
        <MyWorkStatCard
          title="Tamamlananlar"
          value={employeeSteps.completed.length}
          icon={<CheckCircle2 className="h-4.5 w-4.5" />}
          description="Bizzat aksiyon alıp tamamladığınız işler"
          colorClass="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
        />
      </div>

      {/* Filtreler */}
      <MyWorkFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedBrandId={selectedBrandId}
        setSelectedBrandId={setSelectedBrandId}
        selectedCycleId={selectedCycleId}
        setSelectedCycleId={setSelectedCycleId}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedResponsibility={selectedResponsibility}
        setSelectedResponsibility={setSelectedResponsibility}
        brandsList={brandsList}
        cyclesList={cyclesList}
        typesList={typesList}
        responsibilitiesList={responsibilitiesList}
      />

      {/* Sekmeler */}
      <div className="border-b border-neutral-900">
        <div className="flex flex-wrap -mb-px gap-1">
          {tabConfigs.map((tab) => {
            const isActive = activeTab === tab.id
            const isUncompletedTab = tab.id === 'uncompleted'
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all duration-200 focus:outline-none',
                  isActive
                    ? isUncompletedTab
                      ? 'border-red-500 text-red-400 bg-red-500/[0.02]'
                      : 'border-blue-500 text-blue-400 bg-blue-500/[0.02]'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-neutral-800'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    'px-1.5 py-0 rounded-full text-[9px] font-extrabold ml-1 border',
                    isActive
                      ? isUncompletedTab
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      : isUncompletedTab && tab.count > 0
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-muted/30 text-muted-foreground border-neutral-800'
                  )}
                >
                  {tab.count}
                </Badge>
              </button>
            )
          })}
        </div>
      </div>

      {/* Liste */}
      {filteredItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredItems.map((step) => {
            // Find parent workflow instance
            const instance = instances.find((i) => i.id === step.workflowInstanceId)!
            
            // Resolve Brand name
            const isGeneral = instance.id === 'inst-general-agency-tasks' || instance.brandId === 'general' || instance.brandId === 'general-agency' || instance.brandId === 'general-brand' || !instance.brandId || instance.title.includes('Genel Ajans')
            const brand = isGeneral ? null : brands.find((b) => b.id === instance.brandId)
            const brandName = isGeneral ? 'Genel Ajans' : (brand ? brand.name : 'Genel Ajans')

            // Resolve Cycle name
            const cycle = cycles.find((c) => c.id === instance.cycleId)
            const months = [
              'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
              'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
            ]
            const cycleLabel = cycle
              ? `${months[cycle.month - 1]} ${cycle.year}`
              : 'Genel Dönem'

            return (
              <MyWorkCard
                key={step.id}
                step={step}
                instance={instance}
                brandName={brandName}
                cycleLabel={cycleLabel}
                currentEmployeeId={currentEmployeeId}
                employees={employees}
                hasUnexplainedOverdue={hasUnexplainedOverdue}
                onActionSuccess={handleActionSuccess}
              />
            )
          })}
        </div>
      ) : (
        <MyWorkEmptyState
          message={
            searchQuery ||
            selectedBrandId !== 'all' ||
            selectedCycleId !== 'all' ||
            selectedType !== 'all' ||
            selectedResponsibility !== 'all'
              ? 'Filtrelerinizle eşleşen bir iş adımı bulunamadı. Lütfen filtreleri sıfırlamayı veya aramayı değiştirmeyi deneyin.'
              : activeTab === 'today'
              ? 'Bugün teslim edilecek veya size atanmış yayında aktif bir iş bulunmuyor.'
              : activeTab === 'active'
              ? 'Size atanmış yayında aktif bir iş adımı bulunmuyor.'
              : activeTab === 'uncompleted'
              ? 'Harika! Şu anda vaktinde tamamlanmayan gecikmiş hiçbir işiniz bulunmuyor.'
              : activeTab === 'pending'
              ? 'Öncelikli adımların tamamlanmasını bekleyen bir işiniz bulunmuyor.'
              : 'Daha önce bizzat tamamladığınız veya aksiyon aldığınız bir iş adımı kaydı bulunmuyor.'
          }
        />
      )}
    </div>
  )
}
