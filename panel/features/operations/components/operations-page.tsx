'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Brand, WorkflowInstance, WorkflowStepInstance, WorkflowApproval, WorkflowHandoff, Employee } from '@/types/domain'
import { getStoredBrands } from '@/lib/storage/local-brand-store'
import { getStoredWorkflowInstances, getWorkflowStepInstances } from '@/lib/storage/local-workflow-instance-store'
import { getStoredApprovals } from '@/lib/storage/local-approval-store'
import { getStoredHandoffs } from '@/lib/storage/local-handoff-store'
import { getStoredEmployees, getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { resolvePanelAuthority, isManagerOrAdmin, isStepInScope, usePrincipal } from '@/lib/permissions/panel-authority'
import { AccessDenied } from '@/components/shared/access-denied'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Zap,
  AlertTriangle,
  ShieldCheck,
  ArrowRightLeft,
  Calendar,
  Play,
  ArrowRight,
  Clock,
  Sparkles,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  X,
  CheckCircle2,
  FileText,
  ExternalLink,
  Download,
  User,
  Building,
  Eye,
} from 'lucide-react'

export function OperationsPage() {
  const router = useRouter()
  const { principal } = usePrincipal()
  
  // Auth states
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // Data States
  const [brands, setBrands] = useState<Brand[]>([])
  const [instances, setInstances] = useState<WorkflowInstance[]>([])
  const [steps, setSteps] = useState<WorkflowStepInstance[]>([])
  const [approvals, setApprovals] = useState<WorkflowApproval[]>([])
  const [handoffs, setHandoffs] = useState<WorkflowHandoff[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const [activeTab, setActiveTab] = useState<'instances' | 'delayed' | 'uncompleted' | 'approvals' | 'handoffs' | 'today'>('instances')
  const [selectedDetailInstanceId, setSelectedDetailInstanceId] = useState<string | null>(null)

  // Canlı iş akışı detay modalı için türetilmiş veriler ve parser
  const selectedInstance = useMemo(() => {
    if (!selectedDetailInstanceId) return null
    return instances.find((i) => i.id === selectedDetailInstanceId)
  }, [selectedDetailInstanceId, instances])

  const selectedInstanceSteps = useMemo(() => {
    if (!selectedDetailInstanceId) return []
    return steps
      .filter((s) => s.workflowInstanceId === selectedDetailInstanceId)
      .sort((a, b) => a.order - b.order)
  }, [selectedDetailInstanceId, steps])

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

  // Filter States
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all')
  const [selectedProcessStage, setSelectedProcessStage] = useState<string>('all')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  // Collapse/Expand state for brand cards
  const [expandedBrandIds, setExpandedBrandIds] = useState<string[]>([])

  // Auto-expand when brand filter is selected
  useEffect(() => {
    if (selectedBrandId !== 'all') {
      setExpandedBrandIds([selectedBrandId])
    }
  }, [selectedBrandId])

  useEffect(() => {
    async function loadData() {
      setIsLoadingAuth(true)
      const storedEmps = await getStoredEmployees()
      setEmployees(storedEmps)

      const activeId = getActiveEmployeeId()
      const current = storedEmps.find((e) => e.id === activeId)
      if (current) {
        setActiveEmployee(current)
      }
      setIsLoadingAuth(false)

      const storedBrands = await getStoredBrands()
      setBrands(storedBrands)
      const storedInstances = await getStoredWorkflowInstances()
      setInstances(storedInstances)
      const storedSteps = await getWorkflowStepInstances()
      setSteps(storedSteps)
      const storedApprovals = await getStoredApprovals()
      setApprovals(storedApprovals)
      const storedHandoffs = await getStoredHandoffs()
      setHandoffs(storedHandoffs)
    }
    loadData()
  }, [])

  // Resolve permissions
  const hasPermission = useMemo(() => {
    return resolvePanelAuthority(principal, activeEmployee, 'operations.view')
  }, [principal, activeEmployee])

  const isManagerExposed = useMemo(() => {
    return isManagerOrAdmin(principal, activeEmployee)
  }, [principal, activeEmployee])

  // Team-based visibility filter helper
  const isStepInManagerTeams = (step: WorkflowStepInstance) => {
    return isStepInScope(principal, step, activeEmployee, employees)
  }

  // Filter lists based on manager's teams
  const filteredSteps = useMemo(() => {
    return steps.filter(isStepInManagerTeams)
  }, [steps, isManagerExposed, activeEmployee, employees])

  const filteredInstances = useMemo(() => {
    return instances.filter(i => {
      // İptal edilen instance'lar hiçbir zaman gösterilmez
      if (i.status === 'cancelled') return false
      if (isManagerExposed) return true
      return steps.some(s => s.workflowInstanceId === i.id && isStepInManagerTeams(s))
    })
  }, [instances, steps, isManagerExposed, activeEmployee, employees])

  const filteredApprovals = useMemo(() => {
    return approvals.filter(a => {
      if (isManagerExposed) return true
      const step = steps.find(s => s.id === a.workflowStepInstanceId)
      return step ? isStepInManagerTeams(step) : false
    })
  }, [approvals, steps, isManagerExposed, activeEmployee, employees])

  const filteredHandoffs = useMemo(() => {
    return handoffs.filter(h => {
      if (isManagerExposed) return true
      const step = steps.find(s => s.id === h.workflowStepInstanceId)
      return step ? isStepInManagerTeams(step) : false
    })
  }, [handoffs, steps, isManagerExposed, activeEmployee, employees])

  // Helper getters
  const getBrandName = (brandId: string) => {
    return brands.find((b) => b.id === brandId)?.name || 'Marka'
  }

  const getEmployeeName = (empId?: string) => {
    if (!empId) return 'Atanmamış'
    return employees.find((e) => e.id === empId)?.fullName || 'Bilinmeyen Çalışan'
  }

  // Derived states from filtered lists
  const activeInstances = useMemo(() => {
    return filteredInstances.filter((inst) => {
      // 1. Filter by Brand
      if (selectedBrandId !== 'all' && inst.brandId !== selectedBrandId) {
        return false
      }
      
      const instSteps = steps.filter((s) => s.workflowInstanceId === inst.id)
      const activeStep = instSteps.find((s) => s.status === 'active' || s.status === 'waiting_approval')

      // 2. Filter by Process Stage (Brief, Tasarım, Kurgu, Onay, Paylaşım)
      if (selectedProcessStage !== 'all') {
        if (!activeStep) return false
        const stepTitleClean = activeStep.title.toLowerCase()
        const stepRoleClean = activeStep.responsibilityRole || ''
        
        if (selectedProcessStage === 'brief') {
          if (!stepTitleClean.includes('brief') && !stepTitleClean.includes('toplantı') && stepRoleClean !== 'strategy') {
            return false
          }
        } else if (selectedProcessStage === 'design') {
          if (!stepTitleClean.includes('tasarım') && !stepTitleClean.includes('görsel') && stepRoleClean !== 'graphic_design') {
            return false
          }
        } else if (selectedProcessStage === 'edit') {
          if (!stepTitleClean.includes('kurgu') && !stepTitleClean.includes('montaj') && stepRoleClean !== 'video_editing') {
            return false
          }
        } else if (selectedProcessStage === 'approval') {
          if (!stepTitleClean.includes('onay') && activeStep.status !== 'waiting_approval') {
            return false
          }
        } else if (selectedProcessStage === 'post') {
          if (!stepTitleClean.includes('paylaşım') && !stepTitleClean.includes('yayın') && stepRoleClean !== 'social_media') {
            return false
          }
        }
      }

      // 3. Filter by Employee
      if (selectedEmployeeId !== 'all') {
        if (!activeStep || activeStep.assignedEmployeeId !== selectedEmployeeId) {
          return false
        }
      }

      // 4. Search Query
      if (searchQuery) {
        const titleMatch = inst.title.toLowerCase().includes(searchQuery.toLowerCase())
        const brandMatch = getBrandName(inst.brandId).toLowerCase().includes(searchQuery.toLowerCase())
        const activeStepMatch = activeStep?.title.toLowerCase().includes(searchQuery.toLowerCase())
        if (!titleMatch && !brandMatch && !activeStepMatch) {
          return false
        }
      }

      return inst.status === 'in_progress' || inst.status === 'waiting_approval'
    })
  }, [filteredInstances, selectedBrandId, selectedProcessStage, selectedEmployeeId, searchQuery, steps, brands])

  const delayedSteps = useMemo(() => {
    const now = new Date()
    return filteredSteps.filter((s) => {
      if (s.status !== 'active') return false
      if (!s.dueDate) return false
      
      const inst = instances.find((i) => i.id === s.workflowInstanceId)
      if (!inst) return false

      if (selectedBrandId !== 'all' && inst.brandId !== selectedBrandId) return false
      if (selectedEmployeeId !== 'all' && s.assignedEmployeeId !== selectedEmployeeId) return false

      if (searchQuery) {
        const titleMatch = s.title.toLowerCase().includes(searchQuery.toLowerCase())
        const brandMatch = getBrandName(inst.brandId).toLowerCase().includes(searchQuery.toLowerCase())
        if (!titleMatch && !brandMatch) return false
      }

      return new Date(s.dueDate) < now
    })
  }, [filteredSteps, instances, selectedBrandId, selectedEmployeeId, searchQuery])

  const uncompletedSteps = useMemo(() => {
    const now = new Date()
    return filteredSteps.filter((s) => {
      if (['completed', 'skipped', 'cancelled'].includes(s.status)) return false
      const isOverdue = s.status === 'failed' || (s.dueDate && new Date(s.dueDate) < now)
      if (!isOverdue) return false

      const inst = instances.find((i) => i.id === s.workflowInstanceId)
      if (!inst) return false

      if (selectedBrandId !== 'all' && inst.brandId !== selectedBrandId) return false
      if (selectedEmployeeId !== 'all' && s.assignedEmployeeId !== selectedEmployeeId) return false

      if (searchQuery) {
        const titleMatch = s.title.toLowerCase().includes(searchQuery.toLowerCase())
        const brandMatch = getBrandName(inst.brandId).toLowerCase().includes(searchQuery.toLowerCase())
        if (!titleMatch && !brandMatch) return false
      }

      return true
    })
  }, [filteredSteps, instances, selectedBrandId, selectedEmployeeId, searchQuery, brands])

  const pendingApprovals = useMemo(() => {
    return filteredApprovals.filter((a) => {
      if (a.status !== 'pending') return false

      const inst = instances.find((i) => i.id === a.workflowInstanceId)
      if (!inst) return false

      const step = steps.find((s) => s.id === a.workflowStepInstanceId)

      if (selectedBrandId !== 'all' && inst.brandId !== selectedBrandId) return false
      if (selectedEmployeeId !== 'all' && step?.assignedEmployeeId !== selectedEmployeeId) return false

      if (searchQuery) {
        const titleMatch = step?.title.toLowerCase().includes(searchQuery.toLowerCase())
        const brandMatch = getBrandName(inst.brandId).toLowerCase().includes(searchQuery.toLowerCase())
        if (!titleMatch && !brandMatch) return false
      }

      return true
    })
  }, [filteredApprovals, instances, steps, selectedBrandId, selectedEmployeeId, searchQuery])

  const pendingHandoffs = useMemo(() => {
    return filteredHandoffs.filter((h) => {
      if (h.status !== 'pending') return false

      const inst = instances.find((i) => i.id === h.workflowInstanceId)
      if (!inst) return false

      const step = steps.find((s) => s.id === h.workflowStepInstanceId)

      if (selectedBrandId !== 'all' && inst.brandId !== selectedBrandId) return false
      if (selectedEmployeeId !== 'all' && (h.fromEmployeeId === selectedEmployeeId || h.toEmployeeId === selectedEmployeeId)) return false

      if (searchQuery) {
        const brandMatch = getBrandName(inst.brandId).toLowerCase().includes(searchQuery.toLowerCase())
        const stepMatch = step?.title.toLowerCase().includes(searchQuery.toLowerCase())
        if (!brandMatch && !stepMatch) return false
      }

      return true
    })
  }, [filteredHandoffs, instances, steps, selectedBrandId, selectedEmployeeId, searchQuery])

  const todayDeliveries = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return filteredSteps.filter((s) => {
      if (s.status !== 'active') return false
      if (!s.dueDate || !s.dueDate.startsWith(todayStr)) return false

      const inst = instances.find((i) => i.id === s.workflowInstanceId)
      if (!inst) return false

      if (selectedBrandId !== 'all' && inst.brandId !== selectedBrandId) return false
      if (selectedEmployeeId !== 'all' && s.assignedEmployeeId !== selectedEmployeeId) return false

      if (searchQuery) {
        const titleMatch = s.title.toLowerCase().includes(searchQuery.toLowerCase())
        const brandMatch = getBrandName(inst.brandId).toLowerCase().includes(searchQuery.toLowerCase())
        if (!titleMatch && !brandMatch) return false
      }

      return true
    })
  }, [filteredSteps, instances, selectedBrandId, selectedEmployeeId, searchQuery])

  const groupedByBrand = useMemo(() => {
    const groups: Record<string, { brand: Brand; instances: WorkflowInstance[] }> = {}
    
    brands.forEach((b) => {
      groups[b.id] = { brand: b, instances: [] }
    })
    
    activeInstances.forEach((inst) => {
      if (groups[inst.brandId]) {
        groups[inst.brandId].instances.push(inst)
      } else {
        groups[inst.brandId] = {
          brand: { id: inst.brandId, name: 'Bilinmeyen Marka' } as Brand,
          instances: [inst]
        }
      }
    })
    
    return Object.values(groups).filter(g => g.instances.length > 0)
  }, [activeInstances, brands])

  const renderPipeline = (instanceId: string) => {
    const instSteps = [...steps.filter(s => s.workflowInstanceId === instanceId)].sort((a, b) => a.order - b.order)
    return (
      <div className="flex flex-wrap gap-1.5 items-center mt-2.5 pt-2 border-t border-neutral-900/30">
        {instSteps.map((s, idx) => {
          let badgeClass = "bg-neutral-900/60 text-neutral-500 border-neutral-850"
          if (s.status === 'completed') {
            badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          } else if (s.status === 'active' || s.status === 'waiting_approval') {
            badgeClass = "bg-purple-500/15 text-purple-400 border-purple-500/30 animate-pulse font-bold"
          }
          return (
            <div key={s.id} className="flex items-center gap-1">
              <Badge variant="outline" className={cn("text-[9px] py-0.5 px-2 rounded-lg font-normal", badgeClass)}>
                {s.title}
              </Badge>
              {idx < instSteps.length - 1 && (
                <span className="text-[10px] text-neutral-700 shrink-0">→</span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Get active step info for an instance
  const getInstanceActiveStep = (instanceId: string) => {
    const instSteps = steps.filter((s) => s.workflowInstanceId === instanceId)
    const active = instSteps.find((s) => s.status === 'active' || s.status === 'waiting_approval')
    if (active) return active
    
    // Fallback to last step if completed
    const sorted = [...instSteps].sort((a, b) => b.order - a.order)
    return sorted[0]
  };

  // Calculate step progress percentage
  const getInstanceProgress = (instanceId: string) => {
    const instSteps = steps.filter((s) => s.workflowInstanceId === instanceId)
    if (instSteps.length === 0) return { percent: 0, label: '0 / 0' }
    const completed = instSteps.filter((s) => s.status === 'completed' || s.status === 'skipped').length
    const percent = Math.round((completed / instSteps.length) * 100)
    return { percent, label: `${completed} / ${instSteps.length}` }
  }

  // Check if an instance is at risk
  const isInstanceAtRisk = (instanceId: string) => {
    const instSteps = steps.filter((s) => s.workflowInstanceId === instanceId && s.status === 'active')
    const now = new Date()
    return instSteps.some((s) => s.dueDate && new Date(s.dueDate) < now)
  }

  // Check if brief text was omitted when brief step completed
  const isBriefMissingForInstance = (instanceId: string) => {
    const instSteps = steps.filter((s) => s.workflowInstanceId === instanceId)
    const briefStep = instSteps.find((s) =>
      s.status === 'completed' &&
      (s.title.toLowerCase().includes('brief') || s.workflowStepTemplateId.includes('brief') || s.title.toLowerCase().includes('toplantı'))
    )
    if (briefStep) {
      const desc = briefStep.description || ''
      const briefDetailsMatch = desc.match(/\[Brief Detayları\]:\s*([\s\S]*?)(?=\n\[|$)/)
      const deliveryNoteMatch = desc.match(/\[Teslim Açıklaması\]:\s*([\s\S]*?)(?=\n\[|$)/)
      
      const briefText = briefDetailsMatch ? briefDetailsMatch[1].trim() : ''
      const deliveryText = deliveryNoteMatch ? deliveryNoteMatch[1].trim() : ''
      
      const hasContent = briefText.length > 0 || deliveryText.length > 0
      return !hasContent
    }
    return false
  }

  // Calculate time overdue in hours
  const getOverdueHours = (dueDateStr?: string) => {
    if (!dueDateStr) return ''
    const diff = new Date().getTime() - new Date(dueDateStr).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `${hours} saat gecikti`
    const days = Math.floor(hours / 24)
    return `${days} gün gecikti`
  }

  // Format Date and Time
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '-'
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return '-'
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
      {/* Sayfa Başlığı ve Açıklama */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-900/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Canlı Operasyonlar</h1>
          </div>
          <p className="text-muted-foreground text-xs mt-0.5">
            Ajansta yayındaki tüm iş akışlarını, gecikmeleri, onay kuyruklarını ve teslimleri anlık izleyin.
          </p>
        </div>
      </div>

      {/* KPI Kartları */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card
          onClick={() => setActiveTab('instances')}
          className={cn(
            "rounded-2xl border bg-card/45 shadow-sm backdrop-blur-md hover:border-neutral-850 transition-all cursor-pointer select-none",
            activeTab === 'instances'
              ? "border-purple-500 bg-purple-500/[0.03] ring-1 ring-purple-500/20"
              : "border-transparent"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Aktif Akışlar</span>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInstances.length}</div>
            <p className="text-[9px] text-muted-foreground mt-1">Yayındaki canlı kampanya ve iş akışı</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab('uncompleted')}
          className={cn(
            "rounded-2xl border bg-card/45 shadow-sm backdrop-blur-md hover:border-neutral-850 transition-all cursor-pointer select-none",
            activeTab === 'uncompleted'
              ? "border-rose-500 bg-rose-500/[0.03] ring-1 ring-rose-500/20"
              : "border-transparent border-rose-500/10"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tamamlanmayan</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-400">{uncompletedSteps.length}</div>
            <p className="text-[9px] text-muted-foreground mt-1">Vaktinde teslim edilmeyen işler</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab('delayed')}
          className={cn(
            "rounded-2xl border bg-card/45 shadow-sm backdrop-blur-md hover:border-neutral-850 transition-all cursor-pointer select-none",
            activeTab === 'delayed'
              ? "border-red-500 bg-red-500/[0.03] ring-1 ring-red-500/20"
              : "border-transparent border-red-500/10"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Geciken Adımlar</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{delayedSteps.length}</div>
            <p className="text-[9px] text-muted-foreground mt-1">Süresi geçmiş aktif adımlar</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab('approvals')}
          className={cn(
            "rounded-2xl border bg-card/45 shadow-sm backdrop-blur-md hover:border-neutral-850 transition-all cursor-pointer select-none",
            activeTab === 'approvals'
              ? "border-purple-500 bg-purple-500/[0.03] ring-1 ring-purple-500/20"
              : "border-transparent"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bekleyen Onaylar</span>
            <ShieldCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{pendingApprovals.length}</div>
            <p className="text-[9px] text-muted-foreground mt-1">Onay bekleyen içerik/tasarım</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab('handoffs')}
          className={cn(
            "rounded-2xl border bg-card/45 shadow-sm backdrop-blur-md hover:border-neutral-850 transition-all cursor-pointer select-none",
            activeTab === 'handoffs'
              ? "border-emerald-500 bg-emerald-500/[0.03] ring-1 ring-emerald-500/20"
              : "border-transparent"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Paslama Talepleri</span>
            <ArrowRightLeft className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{pendingHandoffs.length}</div>
            <p className="text-[9px] text-muted-foreground mt-1">Ekipler arası aktif devirler</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab('today')}
          className={cn(
            "rounded-2xl border bg-card/45 shadow-sm backdrop-blur-md hover:border-neutral-850 transition-all cursor-pointer select-none",
            activeTab === 'today'
              ? "border-blue-500 bg-blue-500/[0.03] ring-1 ring-blue-500/20"
              : "border-transparent"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bugünün Teslimleri</span>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{todayDeliveries.length}</div>
            <p className="text-[9px] text-muted-foreground mt-1">Bugün teslim edilecek işler</p>
          </CardContent>
        </Card>
      </div>

      {/* Gelişmiş Filtreleme Paneli */}
      <div className="bg-neutral-950/20 border border-neutral-900 rounded-2xl p-4 space-y-4 backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-neutral-900/60 pb-2">
          <SlidersHorizontal className="h-4 w-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Gelişmiş Filtreler</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {/* Marka Seçimi */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Müşteri / Marka</label>
            <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
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

          {/* Süreç Aşaması */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Süreç Aşaması</label>
            <Select value={selectedProcessStage} onValueChange={setSelectedProcessStage}>
              <SelectTrigger className="h-9 text-xs bg-muted/5 border-neutral-850">
                <SelectValue placeholder="Seçin..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Süreçler (Tümü)</SelectItem>
                <SelectItem value="brief" className="text-xs">Brief / Toplantı Aşaması</SelectItem>
                <SelectItem value="design" className="text-xs">Tasarım Aşaması</SelectItem>
                <SelectItem value="edit" className="text-xs">Kurgu Aşaması</SelectItem>
                <SelectItem value="approval" className="text-xs">Onay Aşaması (İç/Müşteri)</SelectItem>
                <SelectItem value="post" className="text-xs">Paylaşım Aşaması</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sorumlu Filtresi */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Sorumlu Çalışan</label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="h-9 text-xs bg-muted/5 border-neutral-850">
                <SelectValue placeholder="Seçin..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Ekip</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id} className="text-xs">
                    {emp.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Metin Arama */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-0.5">Metin Arama</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Görev veya marka ara..."
                className="h-9 pl-9 text-xs bg-muted/5 border-neutral-850"
              />
            </div>
          </div>
        </div>

        {/* Filtreleri Sıfırla */}
        {(selectedBrandId !== 'all' || selectedProcessStage !== 'all' || selectedEmployeeId !== 'all' || searchQuery) && (
          <div className="flex justify-end pt-1">
            <Button
              onClick={() => {
                setSelectedBrandId('all')
                setSelectedProcessStage('all')
                setSelectedEmployeeId('all')
                setSearchQuery('')
              }}
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
            >
              Filtreleri Temizle
            </Button>
          </div>
        )}
      </div>

      {/* Boş Veri Durumu Kontrolü */}
      {instances.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-850 p-12 text-center bg-card/10 backdrop-blur-md max-w-xl mx-auto space-y-4 mt-8">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-850 flex items-center justify-center mx-auto text-neutral-500">
            <Layers className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Henüz canlı operasyon bulunmuyor.</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Marka detayından operasyon dönemi oluşturup iş akışlarını başlattığınızda burada görünecek.
            </p>
          </div>
          <Button
            onClick={() => router.push('/brands')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-md"
          >
            Markalara Git <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sekmeli Filtre Menüsü */}
          <div className="flex border-b border-neutral-900 gap-1.5 pb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('instances')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                activeTab === 'instances'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Activity className="h-4 w-4" />
              Aktif İş Akışları ({activeInstances.length})
            </button>
            <button
              onClick={() => setActiveTab('uncompleted')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                activeTab === 'uncompleted'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              Tamamlanmayan İşler ({uncompletedSteps.length})
            </button>
            <button
              onClick={() => setActiveTab('delayed')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                activeTab === 'delayed'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              Geciken Adımlar ({delayedSteps.length})
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                activeTab === 'approvals'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Onay Bekleyenler ({pendingApprovals.length})
            </button>
            <button
              onClick={() => setActiveTab('handoffs')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                activeTab === 'handoffs'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ArrowRightLeft className="h-4 w-4" />
              Paslama Talepleri ({pendingHandoffs.length})
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                activeTab === 'today'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Bugünün Teslimleri ({todayDeliveries.length})
            </button>
          </div>

          {/* Sekme İçerikleri */}
          <div className="space-y-4">
            {/* 1. AKTİF İŞ AKIŞLARI SEKMESİ */}
            {activeTab === 'instances' && (
              <div className="space-y-6">
                {/* Genişlet/Daralt Kontrolleri */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Aktif Marka Sayısı: {groupedByBrand.length}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setExpandedBrandIds(groupedByBrand.map(g => g.brand.id))}
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px] border-neutral-850 rounded-lg hover:bg-neutral-900"
                    >
                      Tümünü Aç
                    </Button>
                    <Button
                      onClick={() => setExpandedBrandIds([])}
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px] border-neutral-850 rounded-lg hover:bg-neutral-900"
                    >
                      Tümünü Kapat
                    </Button>
                  </div>
                </div>

                {groupedByBrand.length > 0 ? (
                  <div className="space-y-4">
                    {groupedByBrand.map(({ brand, instances: brandInsts }) => {
                      const isExpanded = expandedBrandIds.includes(brand.id)
                      return (
                        <Card
                          key={brand.id}
                          className="border border-neutral-900 bg-card/25 backdrop-blur-sm rounded-2xl overflow-hidden transition-all hover:border-neutral-850"
                        >
                          {/* Marka Kart Başlığı (Collapsible Trigger) */}
                          <div
                            onClick={() => {
                              setExpandedBrandIds(prev =>
                                prev.includes(brand.id)
                                  ? prev.filter(id => id !== brand.id)
                                  : [...prev, brand.id]
                              )
                            }}
                            className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-muted/5 transition-colors"
                          >
                            <div className="space-y-1">
                              <h3 className="text-base font-black text-foreground tracking-tight">
                                {brand.name}
                              </h3>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                                <span>Temsilci: <strong>{getEmployeeName(brand.operationManagerId)}</strong></span>
                                <span>•</span>
                                <span>Aktif Süreçler: <strong>{brandInsts.length}</strong></span>
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold rounded-lg shadow-none py-1 px-2.5">
                                {brandInsts.length} İş
                              </Badge>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-neutral-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-neutral-400" />
                              )}
                            </div>
                          </div>

                          {/* Genişleyen İçerik: Görevler Listesi */}
                          {isExpanded && (
                            <CardContent className="p-5 pt-0 border-t border-neutral-900/60 bg-neutral-950/10 space-y-4">
                              <div className="grid gap-4 sm:grid-cols-2 pt-5">
                                {brandInsts.map((inst) => {
                                  const activeStep = getInstanceActiveStep(inst.id)
                                  const progress = getInstanceProgress(inst.id)
                                  const atRisk = isInstanceAtRisk(inst.id)

                                  return (
                                    <div
                                      key={inst.id}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedDetailInstanceId(inst.id)
                                      }}
                                      className={`rounded-xl border bg-card/15 p-4 hover:border-neutral-700 hover:bg-card/30 transition-all cursor-pointer space-y-3 relative overflow-hidden group ${
                                        atRisk ? 'border-red-500/15' : 'border-neutral-850'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-4">
                                        <h4 className="text-xs font-extrabold text-foreground group-hover:text-purple-400 transition-colors leading-tight">
                                          {inst.title}
                                        </h4>
                                        <div className="flex items-center gap-1 shrink-0">
                                          {isBriefMissingForInstance(inst.id) && (
                                            <Badge className="bg-amber-950/20 border border-amber-500/25 text-amber-400 text-[8px] font-bold py-0.5 rounded shadow-none">
                                              Brief Eksik
                                            </Badge>
                                          )}
                                          {atRisk && (
                                            <Badge className="bg-red-950/20 border border-red-500/25 text-red-400 text-[8px] font-bold py-0.5 rounded shadow-none">
                                              Riskli
                                            </Badge>
                                          )}
                                        </div>
                                      </div>

                                      {/* İlerleme Çubuğu */}
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[8px] font-bold text-neutral-500">
                                          <span>İLERLEME</span>
                                          <span>{progress.label} ({progress.percent}%)</span>
                                        </div>
                                        <div className="w-full bg-neutral-950 border border-neutral-900 rounded-full h-1.5 overflow-hidden">
                                          <div
                                            className={`h-full rounded-full transition-all duration-300 ${
                                              atRisk ? 'bg-red-500' : 'bg-purple-500'
                                            }`}
                                            style={{ width: `${progress.percent}%` }}
                                          />
                                        </div>
                                      </div>

                                      {/* Mevcut Aktif Adım */}
                                      {activeStep && (
                                        <div className="border-t border-neutral-900/40 pt-2 flex items-center justify-between gap-2 text-[9px]">
                                          <div className="leading-tight">
                                            <span className="text-neutral-500 block text-[8px] font-semibold">MEVCUT ADIM</span>
                                            <span className="font-bold text-foreground flex items-center gap-0.5 mt-0.5">
                                              <Play className="h-2.5 w-2.5 text-purple-400 shrink-0" />
                                              {activeStep.title}
                                            </span>
                                          </div>
                                          <div className="text-right leading-tight">
                                            <span className="text-neutral-500 block text-[8px] font-semibold">ATANAN</span>
                                            <span className="font-bold text-neutral-300 mt-0.5 block">
                                              {getEmployeeName(activeStep.assignedEmployeeId)}
                                            </span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Pipeline Görsel Akışı */}
                                      {renderPipeline(inst.id)}
                                    </div>
                                  )
                                })}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-neutral-900 p-8 text-center text-xs text-muted-foreground bg-neutral-950/[0.02]">
                    Filtrelere uygun aktif iş akışı bulunamadı.
                  </div>
                )}
              </div>
            )}

            {/* 2. TAMAMLANMAYAN İŞLER SEKMESİ */}
            {activeTab === 'uncompleted' && (
              <div className="space-y-4">
                {uncompletedSteps.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {uncompletedSteps.map((step) => {
                      const inst = instances.find((i) => i.id === step.workflowInstanceId)
                      if (!inst) return null
                      const brandName = getBrandName(inst.brandId)
                      const assignedEmp = employees.find((e) => e.id === step.assignedEmployeeId)

                      const now = new Date()
                      const due = step.dueDate ? new Date(step.dueDate) : now
                      const diffMs = Math.max(0, now.getTime() - due.getTime())
                      const diffDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)))

                      return (
                        <div
                          key={step.id}
                          className="rounded-2xl border border-rose-500/30 bg-rose-950/15 p-5 shadow-lg shadow-rose-950/20 backdrop-blur-md space-y-4 relative overflow-hidden"
                        >
                          {/* Glow effect */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                          {/* Top row */}
                          <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-850">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                                <Building className="h-3.5 w-3.5 text-neutral-400" />
                                <span className="text-white font-bold">{brandName}</span>
                              </div>
                              <h4 className="text-sm font-extrabold text-neutral-100 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
                                {inst.title}
                              </h4>
                            </div>

                            <Badge
                              variant="outline"
                              className="bg-rose-500/20 text-rose-400 border-rose-500/40 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider animate-pulse shrink-0"
                            >
                              🔴 {diffDays} Gündür Tamamlanmadı
                            </Badge>
                          </div>

                          {/* Step & Employee details */}
                          <div className="grid gap-3 sm:grid-cols-2 bg-neutral-950/60 rounded-xl p-3.5 border border-neutral-850 text-xs">
                            <div className="space-y-1">
                              <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Tamamlanmayan Adım</span>
                              <span className="font-extrabold text-foreground flex items-center gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                                {step.title}
                              </span>
                              {step.dueDate && (
                                <span className="text-[10px] text-muted-foreground block">
                                  Son Teslim: {formatDateTime(step.dueDate)}
                                </span>
                              )}
                            </div>

                            <div className="space-y-1">
                              <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Sorumlu Kişi</span>
                              {assignedEmp ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-bold text-white uppercase overflow-hidden">
                                    {assignedEmp.avatarUrl ? (
                                      <img src={assignedEmp.avatarUrl} alt={assignedEmp.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                      assignedEmp.fullName.slice(0, 2)
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-bold text-white block text-xs">{assignedEmp.fullName}</span>
                                    <span className="text-[10px] text-neutral-400 block">{assignedEmp.email}</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-neutral-500 font-semibold">Atanmamış</span>
                              )}
                            </div>
                          </div>

                          {/* Explanation Status Box */}
                          <div
                            className={cn(
                              "rounded-xl border p-3.5 text-xs space-y-2",
                              step.failureReason
                                ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                                : "bg-red-950/40 border-red-500/50 text-red-300"
                            )}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5">
                                {step.failureReason ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    <span className="text-emerald-400">Çalışan Açıklaması Alındı</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="h-4 w-4 text-red-400" />
                                    <span className="text-red-400">Açıklama Bekleniyor (Kullanıcı Kilitlendi)</span>
                                  </>
                                )}
                              </span>
                              {step.failureExplanationAt && (
                                <span className="text-[10px] text-muted-foreground font-normal">
                                  {formatDateTime(step.failureExplanationAt)}
                                </span>
                              )}
                            </div>

                            {step.failureReason ? (
                              <p className="text-neutral-200 whitespace-pre-wrap leading-relaxed text-xs bg-neutral-950/50 p-2.5 rounded-lg border border-neutral-800">
                                &ldquo;{step.failureReason}&rdquo;
                              </p>
                            ) : (
                              <p className="text-muted-foreground text-[11px] leading-relaxed">
                                Çalışan henüz bu gecikmeyle ilgili bir açıklama girmedi. Sistem, çalışan bu işe açıklama yazana kadar yeni bir iş tamamlamasını otomatik olarak engellemektedir.
                              </p>
                            )}
                          </div>

                          {/* Footer Action */}
                          <div className="flex items-center justify-between pt-1 border-t border-neutral-850">
                            <span className="text-[10px] text-muted-foreground">
                              {step.responsibilityRole ? `Rol: ${step.responsibilityRole}` : ''}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedDetailInstanceId(inst.id)}
                              className="text-xs h-7 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 font-bold flex items-center gap-1"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Tüm Süreci İncele →
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-neutral-850 p-12 text-center bg-card/10 backdrop-blur-md max-w-xl mx-auto space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-foreground">Vaktinde tamamlanmayan iş bulunmuyor</h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                        Tüm ekipler iş adımlarını belirlenen teslim tarihleri içerisinde başarıyla ilerletmektedir.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. GECİKEN İŞ ADIMLARI SEKMESİ */}
            {activeTab === 'delayed' && (
              <div className="grid gap-3">
                {delayedSteps.length > 0 ? (
                  delayedSteps.map((step) => {
                    const inst = instances.find((i) => i.id === step.workflowInstanceId)
                    return (
                      <div
                        key={step.id}
                        onClick={() => inst && setSelectedDetailInstanceId(inst.id)}
                        className="rounded-2xl border border-red-500/10 bg-red-500/[0.01] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:bg-red-500/[0.03] hover:border-red-500/20 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-semibold">
                            <span>{getBrandName(inst?.brandId || '')}</span>
                            <span>•</span>
                            <span>{inst?.title}</span>
                          </div>
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                            {step.title}
                          </h4>
                          <p className="text-[10px] text-muted-foreground">{step.description}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-left sm:text-right leading-tight text-[10px]">
                            <span className="text-neutral-500 block text-[9px] font-semibold font-mono">SORUMLU</span>
                            <span className="font-bold text-neutral-300">{getEmployeeName(step.assignedEmployeeId)}</span>
                          </div>
                          <div className="px-3 py-1.5 rounded-xl bg-red-950/20 border border-red-500/25 text-red-400 font-bold text-[9px] shrink-0 font-mono">
                            {getOverdueHours(step.dueDate)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-2xl border border-neutral-900 p-8 text-center text-xs text-muted-foreground bg-neutral-950/[0.02]">
                    Filtrelere uygun geciken aktif iş adımı bulunmuyor.
                  </div>
                )}
              </div>
            )}

            {/* 3. ONAY BEKLEYENLER SEKMESİ */}
            {activeTab === 'approvals' && (
              <div className="space-y-3">
                {pendingApprovals.length > 0 ? (
                  <div className="grid gap-3">
                    {pendingApprovals.map((app) => {
                      const inst = instances.find((i) => i.id === app.workflowInstanceId)
                      const step = steps.find((s) => s.id === app.workflowStepInstanceId)
                      return (
                        <div
                          key={app.id}
                          className="rounded-2xl border border-neutral-900 bg-card/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-semibold">
                              <span>{getBrandName(inst?.brandId || '')}</span>
                              <span>•</span>
                              <span>{inst?.title}</span>
                            </div>
                            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0" />
                              {step?.title || 'Onay Talebi'}
                            </h4>
                            {app.note && <p className="text-[10px] text-muted-foreground font-mono">Talep Notu: {app.note}</p>}
                          </div>
                          <Button
                            onClick={() => router.push('/approvals')}
                            className="bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 font-bold text-[9px] h-7 px-3 rounded-lg shrink-0"
                          >
                            Onay Merkezine Git <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-neutral-900 p-8 text-center text-xs text-muted-foreground bg-neutral-950/[0.02]">
                    Filtrelere uygun onay bekleyen içerik veya tasarım bulunmamaktadır.
                  </div>
                )}
              </div>
            )}

            {/* 4. PASLAMA TALEPLERİ SEKMESİ */}
            {activeTab === 'handoffs' && (
              <div className="space-y-3">
                {pendingHandoffs.length > 0 ? (
                  <div className="grid gap-3">
                    {pendingHandoffs.map((h) => {
                      const inst = instances.find((i) => i.id === h.workflowInstanceId)
                      const step = steps.find((s) => s.id === h.workflowStepInstanceId)
                      return (
                        <div
                          key={h.id}
                          className="rounded-2xl border border-neutral-900 bg-card/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-semibold">
                              <span>İş Akışı: {inst?.title}</span>
                            </div>
                            <h4 className="text-xs font-bold text-foreground">
                              {step?.title} adımı devir isteği
                            </h4>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                              Sorumluyu <span className="font-bold text-neutral-300">{getEmployeeName(h.fromEmployeeId)}</span> kullanıcısından <span className="font-bold text-neutral-300">{getEmployeeName(h.toEmployeeId)}</span> kullanıcısına paslama talebi.
                            </p>
                          </div>
                          <Button
                            onClick={() => router.push('/my-work')}
                            className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 font-bold text-[9px] h-7 px-3 rounded-lg shrink-0"
                          >
                            Benim İşlerime Git <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-neutral-900 p-8 text-center text-xs text-muted-foreground bg-neutral-950/[0.02]">
                    Filtrelere uygun aktif paslama veya devir talebi bulunmuyor.
                  </div>
                )}
              </div>
            )}

            {/* 5. BUGÜNÜN TESLİMLERİ SEKMESİ */}
            {activeTab === 'today' && (
              <div className="space-y-3">
                {todayDeliveries.length > 0 ? (
                  <div className="grid gap-3">
                    {todayDeliveries.map((step) => {
                      const inst = instances.find((i) => i.id === step.workflowInstanceId)
                      return (
                        <div
                          key={step.id}
                          onClick={() => inst && setSelectedDetailInstanceId(inst.id)}
                          className="rounded-2xl border border-neutral-900 bg-card/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:bg-card/20 hover:border-neutral-850 transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-semibold">
                              <span>{getBrandName(inst?.brandId || '')}</span>
                              <span>•</span>
                              <span>{inst?.title}</span>
                            </div>
                            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              {step.title}
                            </h4>
                            <p className="text-[10px] text-muted-foreground">{step.description}</p>
                          </div>
                          <div className="text-left sm:text-right leading-tight text-[10px] shrink-0">
                            <span className="text-neutral-500 block text-[9px] font-semibold">BUGÜN TESLİM ALACAK</span>
                            <span className="font-bold text-neutral-300">{getEmployeeName(step.assignedEmployeeId)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-neutral-900 p-8 text-center text-xs text-muted-foreground bg-neutral-950/[0.02]">
                    Bugün teslim edilmesi planlanan aktif iş bulunmamaktadır.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detay Modalı (Afilli / Premium Görev Detayı) */}
      {selectedInstance && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 md:p-8 animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-neutral-850 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-neutral-900 bg-neutral-950/50 flex items-start justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
                  <span>{getBrandName(selectedInstance.brandId)}</span>
                  <span className="text-neutral-600">•</span>
                  <span className="text-purple-400">Canlı İş Akışı Detayı</span>
                </div>
                <h2 className="text-lg font-black text-white leading-tight">
                  {selectedInstance.title}
                </h2>
                {/* Progress bar */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-32 bg-neutral-900 border border-neutral-800 rounded-full h-2 overflow-hidden shrink-0">
                    <div
                      className="h-full rounded-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${getInstanceProgress(selectedInstance.id).percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-500 font-mono">
                    {getInstanceProgress(selectedInstance.id).label} ({getInstanceProgress(selectedInstance.id).percent}%)
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDetailInstanceId(null)}
                className="h-9 w-9 rounded-xl border border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-all shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Scrollable Timeline */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              <div className="relative border-l border-neutral-900 pl-6 ml-3 space-y-8">
                {selectedInstanceSteps.map((step, idx) => {
                  const { note, links, files, cleanDesc } = parseStepDelivery(step.description)
                  const isActive = step.status === 'active' || step.status === 'waiting_approval'
                  const isCompleted = step.status === 'completed'
                  const stepApproval = approvals.find((a) => a.workflowStepInstanceId === step.id)
                  const stepHandoff = handoffs.find((h) => h.workflowStepInstanceId === step.id && h.status !== 'cancelled')

                  return (
                    <div key={step.id} className="relative group/step">
                      {/* Circle indicator */}
                      <span className={cn(
                        "absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full border text-[9px] font-bold transition-all shadow-md",
                        isCompleted
                          ? "bg-purple-950/80 border-purple-500 text-purple-400"
                          : isActive
                          ? "bg-emerald-950 border-emerald-500 text-emerald-400 animate-pulse"
                          : "bg-neutral-950 border-neutral-900 text-neutral-500"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          idx + 1
                        )}
                      </span>

                      {/* Content Card */}
                      <div className={cn(
                        "rounded-xl border p-4 space-y-3 transition-all",
                        isActive
                          ? "bg-emerald-500/[0.01] border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.02)]"
                          : isCompleted
                          ? "bg-neutral-950/20 border-neutral-900"
                          : "bg-neutral-950/5 border-neutral-900/60 opacity-60"
                      )}>
                        {/* Step title & metadata */}
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-foreground">
                              {step.title}
                            </h4>
                            <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider block font-mono">
                              Sorumluluk: {step.responsibilityRole || 'Operasyon'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isCompleted && (
                              <Badge className="bg-purple-950/30 border border-purple-500/20 text-purple-400 text-[8px] font-bold rounded-lg px-2">
                                Tamamlandı
                              </Badge>
                            )}
                            {isActive && (
                              <Badge className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold rounded-lg px-2 animate-pulse">
                                Aktif Adım
                              </Badge>
                            )}
                            {step.status === 'pending' && (
                              <Badge className="bg-neutral-900 border border-neutral-850 text-neutral-500 text-[8px] font-bold rounded-lg px-2">
                                Beklemede
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Clean Description */}
                        {cleanDesc && (
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            {cleanDesc}
                          </p>
                        )}

                        {/* Assignee Card */}
                        <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-900/60 rounded-xl p-2.5 w-fit">
                          <div className="w-6 h-6 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400 font-mono">
                            {getEmployeeName(step.assignedEmployeeId).split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="leading-none">
                            <span className="text-[9px] text-neutral-500 block font-semibold uppercase tracking-wider font-mono">Görevli</span>
                            <span className="text-[10px] font-bold text-neutral-300 block mt-0.5">
                              {getEmployeeName(step.assignedEmployeeId)}
                            </span>
                          </div>
                        </div>

                        {/* Handoff Log */}
                        {stepHandoff && (
                          <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-xl p-3 text-[10px] space-y-1">
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <ArrowRightLeft className="h-3.5 w-3.5" />
                              Görev Paslama / Devir Kaydı
                            </span>
                            <p className="text-muted-foreground leading-normal">
                              Sorumluluk <span className="text-neutral-300 font-semibold">{getEmployeeName(stepHandoff.fromEmployeeId)}</span> kullanıcısından <span className="text-neutral-300 font-semibold">{getEmployeeName(stepHandoff.toEmployeeId)}</span> kullanıcısına devredilmiş.
                            </p>
                            {stepHandoff.reason && (
                              <p className="text-neutral-400 italic">
                                &quot;{stepHandoff.reason}&quot; {stepHandoff.note ? `(${stepHandoff.note})` : ''}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Deliverables display */}
                        {(note || links.length > 0 || files.length > 0) && (
                          <div className="bg-neutral-950/60 border border-neutral-900 rounded-xl p-3.5 space-y-3">
                            <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                              <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block font-mono">
                                TESLİM BİLGİLERİ VE DOSYALAR
                              </span>
                              {step.completedAt && (
                                <span className="text-[9px] text-neutral-500 font-mono">
                                  Tamamlama: {new Date(step.completedAt).toLocaleString('tr-TR')}
                                </span>
                              )}
                            </div>

                            {note && (
                              <div className="text-[10px] text-muted-foreground bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-850 italic">
                                &quot;{note}&quot;
                              </div>
                            )}

                            {(links.length > 0 || files.length > 0) && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {links.map((link, lidx) => (
                                  <a
                                    key={lidx}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 hover:border-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-all text-[9px] font-bold font-mono"
                                  >
                                    <ExternalLink className="h-3 w-3 text-purple-400 shrink-0" />
                                    GÖRSEL {lidx + 1}
                                  </a>
                                ))}
                                {files.map((file, fidx) => (
                                  <a
                                    key={fidx}
                                    href={file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 hover:border-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-all text-[9px] font-bold font-mono"
                                  >
                                    <Download className="h-3 w-3 text-purple-400 shrink-0" />
                                    DOSYA {fidx + 1}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Approval Log */}
                        {stepApproval && (
                          <div className={cn(
                            "border rounded-xl p-3 text-[10px] space-y-1",
                            stepApproval.status === 'approved'
                              ? "bg-purple-950/10 border-purple-500/10 text-purple-300"
                              : "bg-amber-950/10 border-amber-500/10 text-amber-300"
                          )}>
                            <span className="font-bold flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {stepApproval.status === 'approved' ? 'İç Onay Başarılı' : 'Revizeli / Reddedildi'}
                            </span>
                            <p className="text-muted-foreground leading-normal">
                              Bu adım <span className="font-semibold text-neutral-300">{getEmployeeName(stepApproval.approverEmployeeId)}</span> tarafından onaylandı.
                            </p>
                            {stepApproval.note && (
                              <p className="text-neutral-400 font-mono">Not: {stepApproval.note}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer / Info */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-900 flex justify-between items-center text-[10px] text-muted-foreground px-6 font-mono">
              <span>İŞ ID: {selectedInstance.id.slice(0, 8)}</span>
              <span>DÖNEM: {selectedInstance.cycleId.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
