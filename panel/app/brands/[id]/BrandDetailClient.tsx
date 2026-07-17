'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBrandById, saveBrand } from '@/lib/storage/local-brand-store'
import { getStoredEmployees } from '@/lib/storage/local-employee-store'
import { getCyclesByBrandId, saveOperationCycle, deleteOperationCycle } from '@/lib/storage/local-cycle-store'
import type { Brand, Employee, OperationPlanItem, BrandAssignment, BrandOperationCycle } from '@/types/domain'
import {
  OPERATION_PLAN_ITEM_TYPE_LABELS,
  OPERATION_PLAN_ITEM_STATUS_LABELS,
  BRAND_STATUS_LABELS,
  EMPLOYEE_STATUS_LABELS,
} from '@/types/domain'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Save,
  Globe,
  Instagram,
  User,
  Calendar,
  Activity,
  CheckCircle2,
  TrendingUp,
  XCircle,
  Play,
  Plus,
  Trash2,
  Users,
  X,
  AlertTriangle,
  Ban,
  RotateCcw,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { BrandWorkflowSection } from '@/features/workflows/components/brand-workflow-section'

import { getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { resolveEffectivePermissions } from '@/lib/permissions/resolve-permissions'
import { AccessDenied } from '@/components/shared/access-denied'
import { supabase } from '@/lib/supabase/client'
import { deleteWorkflowInstancesByCycleId, getWorkflowInstancesByCycleId, updateWorkflowInstance } from '@/lib/storage/local-workflow-instance-store'

export default function BrandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [brand, setBrand] = useState<Brand | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [localPlan, setLocalPlan] = useState<OperationPlanItem[]>([])
  const [localAssignments, setLocalAssignments] = useState<BrandAssignment[]>([])
  const [isModified, setIsModified] = useState(false)
  
  // Versioning & Cycle states
  const [cycles, setCycles] = useState<BrandOperationCycle[]>([])
  const [selectedPlanSource, setSelectedPlanSource] = useState<string>('template') // 'template' or cycleId
  const [saveTarget, setSaveTarget] = useState<'cycle_only' | 'cycle_and_template'>('cycle_only')

  // Auth states
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // Assign modal state
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [responsibility, setResponsibility] = useState('')
  const [customResponsibility, setCustomResponsibility] = useState('')
  const [assignmentNote, setAssignmentNote] = useState('')

  // Cancel/Delete cycle confirm modal states
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelConfirmFn, setCancelConfirmFn] = useState<(() => Promise<void>) | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeletePlanItemConfirm, setShowDeletePlanItemConfirm] = useState(false)
  const [planItemToDeleteId, setPlanItemToDeleteId] = useState<string | null>(null)
  const [isPlanOpen, setIsPlanOpen] = useState(true)

  const handleRequestCancelCycle = useCallback((confirmFn: () => Promise<void>) => {
    setCancelConfirmFn(() => confirmFn)
    setShowCancelConfirm(true)
  }, [])

  const handleConfirmCancel = useCallback(async () => {
    if (cancelConfirmFn) {
      await cancelConfirmFn()
    }
    setShowCancelConfirm(false)
    setCancelConfirmFn(null)
  }, [cancelConfirmFn])

  // Suggested responsibilities
  const SUGGESTED_RESPONSIBILITIES = [
    'Operasyon Sorumlusu',
    'Dijital Pazarlama',
    'Sosyal Medya Yönetimi',
    'Kreatif Direktör',
    'Grafik Tasarım',
    'Video Kurgu',
    'Fotoğraf Üretimi',
    'Video Üretimi',
    'Strateji & Müşteri İletişimi',
  ]

  const handleDeleteCycle = () => {
    if (selectedPlanSource === 'template') return
    setShowDeleteConfirm(true)
  }

  const handleConfirmDeleteCycle = async () => {
    setShowDeleteConfirm(false)
    try {
      await deleteWorkflowInstancesByCycleId(selectedPlanSource)
      await deleteOperationCycle(selectedPlanSource)

      toast.success('Dönem başarıyla silindi!')

      const brandCycles = await getCyclesByBrandId(id)
      brandCycles.sort((a, b) => b.year - a.year || b.month - a.month)
      setCycles(brandCycles)

      if (brandCycles.length > 0) {
        setSelectedPlanSource(brandCycles[0].id)
        setLocalPlan(brandCycles[0].operationPlan)
      } else {
        setSelectedPlanSource('template')
        setLocalPlan(brand?.operationPlan || [])
      }
    } catch (err: any) {
      toast.error('Dönem silinirken bir hata oluştu: ' + err.message)
    }
  }

  // Load Brand, Employees, and Cycles on Mount
  useEffect(() => {
    if (!id) return
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

      const storedBrand = await getBrandById(id)
      if (storedBrand) {
        setBrand(storedBrand)
        setLocalAssignments(storedBrand.brandAssignments || [])
        
        const brandCycles = await getCyclesByBrandId(id)
        brandCycles.sort((a, b) => b.year - a.year || b.month - a.month)
        setCycles(brandCycles)

        if (brandCycles.length > 0) {
          setSelectedPlanSource(brandCycles[0].id)
          setLocalPlan(brandCycles[0].operationPlan)
        } else {
          setSelectedPlanSource('template')
          setLocalPlan(storedBrand.operationPlan)
        }
      }
    }
    loadData()
  }, [id])

  // Get operation manager name
  const managerName = useMemo(() => {
    if (!brand) return 'Yükleniyor...'
    if (!brand.operationManagerId) return 'Atanmamış'
    const manager = employees.find((e) => e.id === brand.operationManagerId)
    return manager ? manager.fullName : 'Atanmamış'
  }, [brand, employees])

  // Calculated overall metrics
  const stats = useMemo(() => {
    if (!localPlan.length) return { totalProgress: 0, completedCount: 0, totalTarget: 0 }
    
    let totalTarget = 0
    let totalCompleted = 0
    
    localPlan.forEach((item) => {
      if (item.status !== 'cancelled') {
        totalTarget += item.target
        totalCompleted += Math.min(item.target, item.completed)
      }
    })

    const totalProgress = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0
    return { totalProgress, completedCount: totalCompleted, totalTarget }
  }, [localPlan])

  const handleUpdateItem = (itemId: string, updates: Partial<Omit<OperationPlanItem, 'id'>>) => {
    setLocalPlan((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    )
    setIsModified(true)
  }

  // Yeni plan kalemi ekleme/silme fonksiyonları
  const [newPlanItemTitle, setNewPlanItemTitle] = useState('')
  const [newPlanItemType, setNewPlanItemType] = useState<OperationPlanItem['type']>('content')
  const [newPlanItemTarget, setNewPlanItemTarget] = useState(1)

  const handleDeletePlanItem = (itemId: string) => {
    setPlanItemToDeleteId(itemId)
    setShowDeletePlanItemConfirm(true)
  }

  const handleConfirmDeletePlanItem = () => {
    if (!planItemToDeleteId) return
    setLocalPlan((prev) => prev.filter((item) => item.id !== planItemToDeleteId))
    setIsModified(true)
    setShowDeletePlanItemConfirm(false)
    setPlanItemToDeleteId(null)
  }

  const handleAddPlanItem = (title: string, type: OperationPlanItem['type'], target: number) => {
    const newItem: OperationPlanItem = {
      id: crypto.randomUUID(),
      title,
      type,
      target,
      completed: 0,
      status: 'pending',
    }
    setLocalPlan((prev) => [...prev, newItem])
    setIsModified(true)
  }

  const handlePlanSourceChange = (source: string) => {
    setSelectedPlanSource(source)
    setIsModified(false)

    if (source === 'template') {
      if (brand) {
        setLocalPlan(brand.operationPlan)
      }
    } else {
      const activeCycle = cycles.find((c) => c.id === source)
      if (activeCycle) {
        setLocalPlan(activeCycle.operationPlan)
      }
    }
  }

  const handleSaveChanges = async () => {
    if (!brand) return
    const now = new Date().toISOString()

    // 1. Şablon düzenleniyorsa
    if (selectedPlanSource === 'template') {
      const nextVersion = (brand.templateVersion || 1) + 1

      const updatedBrand: Brand = {
        ...brand,
        operationPlan: localPlan,
        brandAssignments: localAssignments,
        templateVersion: nextVersion,
        templateUpdatedAt: now,
        updatedAt: now,
      }

      await saveBrand(updatedBrand)
      setBrand(updatedBrand)
      setIsModified(false)

      toast.success('Şablon Değişiklikleri Kaydedildi', {
        description: `Marka şablonu güncellendi ve sürüm v${nextVersion} yapıldı.`,
      })
      return
    }

    // 2. Operasyon dönemi izlenirken sadece ekip atamaları kaydedilebilir
    const updatedBrandBase: Brand = {
      ...brand,
      brandAssignments: localAssignments,
      updatedAt: now,
    }
    await saveBrand(updatedBrandBase)
    setBrand(updatedBrandBase)
    setIsModified(false)

    toast.success('Değişiklikler Kaydedildi', {
      description: 'Ekip atamaları başarıyla güncellendi.',
    })
  }

  const handleProgressRefresh = async () => {
    if (id) {
      const storedBrand = await getBrandById(id)
      if (storedBrand) {
        setBrand(storedBrand)
        
        const brandCycles = await getCyclesByBrandId(id)
        brandCycles.sort((a, b) => b.year - a.year || b.month - a.month)
        setCycles(brandCycles)

        if (selectedPlanSource === 'template') {
          setLocalPlan(storedBrand.operationPlan)
        } else {
          const activeCycle = brandCycles.find((c) => c.id === selectedPlanSource)
          if (activeCycle) {
            setLocalPlan(activeCycle.operationPlan)
          }
        }
      }
    }
  }

  const handleAddAssignment = () => {
    if (!selectedEmpId) {
      toast.error('Lütfen bir çalışan seçin')
      return
    }

    const finalResponsibility = responsibility === 'custom' ? customResponsibility.trim() : responsibility
    if (!finalResponsibility) {
      toast.error('Lütfen sorumluluk tanımını girin veya seçin')
      return
    }

    const employee = employees.find((e) => e.id === selectedEmpId)
    if (!employee) {
      toast.error('Seçilen çalışan bulunamadı')
      return
    }

    // Check if duplicate responsibility for the same employee
    const isDuplicate = localAssignments.some(
      (a) => a.employeeId === selectedEmpId && a.responsibility.trim().toLowerCase() === finalResponsibility.toLowerCase()
    )

    if (isDuplicate) {
      toast.error('Aynı çalışan bu sorumlulukla zaten atanmış', {
        description: `"${employee.fullName}" bu markada zaten "${finalResponsibility}" sorumluluğunu üstleniyor.`,
      })
      return
    }

    const newAssignment: BrandAssignment = {
      id: crypto.randomUUID(),
      employeeId: selectedEmpId,
      responsibility: finalResponsibility,
      roleLabel: employee.title || 'Çalışan',
      permissions: [], 
      // Hazırlık / Yorum: Bu brandAssignments yapısı ileride marka bazlı yetki scope sistemiyle genişletilecek.
      // Örnek: Bu çalışan sadece bu markanın raporlarını görebilir.
      // Örnek: Bu çalışan sadece bu markanın operasyon planını düzenleyebilir.
    }

    setLocalAssignments((prev) => [...prev, newAssignment])
    setIsModified(true)
    setShowAssignModal(false)

    // Reset fields
    setSelectedEmpId('')
    setResponsibility('')
    setCustomResponsibility('')
    setAssignmentNote('')

    toast.success('Ekip ataması eklendi', {
      description: `"${employee.fullName}" - "${finalResponsibility}" olarak listeye eklendi. Değişiklikleri Kaydet butonuna basarak kalıcı hale getirebilirsiniz.`,
    })
  }

  const handleRemoveAssignment = (assignmentId: string) => {
    setLocalAssignments((prev) => prev.filter((a) => a.id !== assignmentId))
    setIsModified(true)
    toast.info('Ekip ataması kaldırıldı', {
      description: 'Değişikliklerin kalıcı olması için Kaydet butonuna basmayı unutmayın.',
    })
  }

  const hasPermission = useMemo(() => {
    if (!activeEmployee) return false
    const effective = resolveEffectivePermissions({
      rolePackageId: activeEmployee.rolePackageId,
      teamIds: activeEmployee.teamIds,
      permissionOverrides: activeEmployee.permissionOverrides || {},
    })
    return effective.grantedKeys.has('brand.manage')
  }, [activeEmployee])

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

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-muted-foreground text-sm">Marka bulunamadı veya yükleniyor...</p>
        <Button onClick={() => router.push('/brands/new')} variant="outline" size="sm">
          Yeni Marka Ekle
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-6 animate-in fade-in duration-300">
      {/* Üst Gezinme & Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/brands"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Markalar Listesine Dön
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {brand.name}
            </h1>
            <Badge
              variant={brand.status === 'active' ? 'default' : 'secondary'}
              className={cn(
                'text-xs font-semibold px-2.5 py-0.5 rounded-full border',
                brand.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
              )}
            >
              {BRAND_STATUS_LABELS[brand.status]}
            </Badge>
          </div>
        </div>

        {/* Kaydetme Butonu */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSaveChanges}
            disabled={!isModified}
            className={cn(
              'h-10 px-5 text-sm font-semibold transition-all duration-200 shadow-md flex items-center gap-2',
              isModified
                ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/10'
                : 'bg-muted/50 text-muted-foreground border'
            )}
          >
            <Save className="h-4 w-4" />
            {isModified ? 'Değişiklikleri Kaydet' : 'Değişiklik Yok'}
          </Button>
        </div>
      </div>

      {/* Kartlar - Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Sol Sütun - Marka Bilgileri */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card/40 p-6 space-y-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 border-b pb-3 border-neutral-800">
              <Activity className="h-5 w-5 text-blue-500" />
              <h3 className="text-base font-semibold">Marka Bilgileri</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-xl border">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="space-y-0.5">
                  <span className="block text-xs text-muted-foreground font-medium">Operasyon Sorumlusu</span>
                  <span className="font-semibold text-foreground">{managerName}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-xl border">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="space-y-0.5">
                  <span className="block text-xs text-muted-foreground font-medium">Başlangıç Tarihi</span>
                  <span className="font-semibold text-foreground">{brand.startDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-xl border">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="space-y-0.5">
                  <span className="block text-xs text-muted-foreground font-medium">Yetkili Kişi</span>
                  <span className="font-semibold text-foreground">{brand.contactPerson}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-xl border">
                <div className="flex flex-col space-y-0.5 w-full">
                  <span className="block text-xs text-muted-foreground font-medium">İletişim Detayları</span>
                  <span className="font-semibold text-foreground">{brand.phone}</span>
                  <span className="text-xs text-muted-foreground font-normal">{brand.email}</span>
                </div>
              </div>
            </div>

            {/* Sosyal Medya ve Web Linkleri */}
            {(brand.instagram || brand.website) && (
              <div className="flex flex-wrap gap-3 pt-2">
                {brand.instagram && (
                  <a
                    href={`https://instagram.com/${brand.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-pink-500 transition-colors bg-muted/20 px-3 py-1.5 rounded-lg border"
                  >
                    <Instagram className="h-3.5 w-3.5" /> @{brand.instagram.replace('@', '')}
                  </a>
                )}
                {brand.website && (
                  <a
                    href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-blue-500 transition-colors bg-muted/20 px-3 py-1.5 rounded-lg border"
                  >
                    <Globe className="h-3.5 w-3.5" /> {brand.website}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sağ Sütun - Genel Operasyonel İlerleme */}
        <div className="rounded-2xl border bg-card/40 p-6 space-y-5 shadow-sm backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b pb-3 border-neutral-800">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <h3 className="text-base font-semibold">Operasyonel İlerleme</h3>
            </div>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground font-medium mb-2">
                <div className="bg-muted/10 p-2 rounded-lg border">
                  <span className="block text-[10px] uppercase text-muted-foreground">Toplam Hedef</span>
                  <span className="text-sm font-bold text-foreground">{stats.totalTarget}</span>
                </div>
                <div className="bg-muted/10 p-2 rounded-lg border">
                  <span className="block text-[10px] uppercase text-muted-foreground">Gerçekleşen</span>
                  <span className="text-sm font-bold text-foreground">{stats.completedCount}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Genel İlerleme</span>
                  <span className="font-bold text-foreground">%{stats.totalProgress}</span>
                </div>
                <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-normal">
            Hesaplama iptal edilmeyen tüm hedeflerin gerçekleşen adetlerinin toplam hedefe oranına göre dinamik olarak güncellenir.
          </p>
        </div>
      </div>

      {/* Marka Ekibi */}
      <div className="rounded-2xl border overflow-hidden bg-card/30 backdrop-blur-md shadow-sm space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Marka Ekibi
            </h3>
            <p className="text-xs text-muted-foreground">
              Bu markada görev alan çalışanları ve marka içi sorumluluklarını yönetin.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setShowAssignModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-4 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Çalışan Ata
          </Button>
        </div>

        {localAssignments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {localAssignments.map((assignment) => {
              const employee = employees.find((e) => e.id === assignment.employeeId)
              const employeeName = employee ? employee.fullName : 'Bilinmeyen Çalışan'
              const employeeTitle = employee ? employee.title : assignment.roleLabel
              const employeeStatus = employee ? employee.employeeStatus : 'active'

              return (
                <div key={assignment.id} className="relative rounded-xl border bg-muted/10 p-4 space-y-3 hover:border-neutral-700 transition-colors group">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground">{employeeName}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-normal">{employeeTitle}</span>
                        {employee && (
                          <Badge variant="outline" className="text-[9px] font-normal px-1.5 py-0.5 rounded bg-neutral-800/40 text-neutral-400 border-neutral-800">
                            {EMPLOYEE_STATUS_LABELS[employeeStatus] || employeeStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAssignment(assignment.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      title="Atamayı Kaldır"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-2.5 border border-neutral-800/40">
                    <span className="block text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Sorumluluk</span>
                    <span className="text-xs font-semibold text-foreground">{assignment.responsibility}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-xs bg-muted/5 rounded-xl border border-dashed border-neutral-800">
            Bu markaya henüz atanmış bir çalışan bulunmamaktadır. Ekip üyesi eklemek için &quot;Çalışan Ata&quot; butonunu kullanabilirsiniz.
          </div>
        )}
      </div>

      {/* Çalışan Ata Modalı */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-neutral-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-muted/20">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Markaya Çalışan Ata
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedEmpId('')
                  setResponsibility('')
                  setCustomResponsibility('')
                }}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              {employees.length > 0 ? (
                <>
                  {/* Çalışan Seç */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Çalışan Seçin</label>
                    <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
                      <SelectTrigger className="w-full text-xs h-10 border bg-muted/10">
                        <SelectValue placeholder="Bir çalışan seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id} className="text-xs">
                            {emp.fullName} ({emp.title || 'Ünvansız'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sorumluluk Seç/Yaz */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Sorumluluk Tanımı</label>
                    <Select value={responsibility} onValueChange={setResponsibility}>
                      <SelectTrigger className="w-full text-xs h-10 border bg-muted/10">
                        <SelectValue placeholder="Bir sorumluluk seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SUGGESTED_RESPONSIBILITIES.map((resp) => (
                          <SelectItem key={resp} value={resp} className="text-xs">
                            {resp === 'custom' ? 'Diğer (Özel Sorumluluk)...' : resp}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom" className="text-xs font-semibold text-blue-500">
                          + Diğer (Kendi Tanımım)...
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Özel Sorumluluk Girişi */}
                  {responsibility === 'custom' && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                      <label className="text-xs font-semibold text-muted-foreground">Özel Sorumluluk Tanımı</label>
                      <Input
                        placeholder="Örn. Web Geliştirme, Sunum & Raporlama..."
                        value={customResponsibility}
                        onChange={(e) => setCustomResponsibility(e.target.value)}
                        className="text-xs h-10 border bg-muted/10"
                      />
                    </div>
                  )}

                  {/* Atama Notu */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                      <span>Atama Notu</span>
                      <span className="text-[10px] text-muted-foreground/60 font-normal">İsteğe Bağlı</span>
                    </label>
                    <textarea
                      placeholder="Atamaya dair not veya detay girin..."
                      value={assignmentNote}
                      onChange={(e) => setAssignmentNote(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border bg-muted/10 border-neutral-700 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[70px] resize-none"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  Sistemde kayıtlı çalışan bulunamadı. Lütfen önce çalışan ekleyin.
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-muted/20 border-t border-neutral-800 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedEmpId('')
                  setResponsibility('')
                  setCustomResponsibility('')
                }}
                className="h-9 text-xs px-4 border"
              >
                Vazgeç
              </Button>
              {employees.length > 0 && (
                <Button
                  type="button"
                  onClick={handleAddAssignment}
                  className="h-9 text-xs px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
                >
                  Atamayı Kaydet
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Operasyon Takip Tablosu */}
      <div className="rounded-2xl border overflow-hidden bg-card/30 backdrop-blur-md shadow-sm">
        <div className="px-5 py-4 bg-muted/40 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div>
              <h4 className="text-base font-bold text-foreground">Operasyon Takip Planı</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Anlaşılan operasyon kalemlerinin gerçekleşen adetlerini ve durumlarını takip edin.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsPlanOpen(!isPlanOpen)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg md:hidden"
            >
              {isPlanOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Plan Kaynağı Seçimi */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Düzenlenen Plan:</span>
              <div className="flex items-center gap-1.5">
                <div className="w-56">
                  <Select value={selectedPlanSource} onValueChange={handlePlanSourceChange}>
                    <SelectTrigger className="h-8 text-xs bg-muted/20 border-neutral-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="template" className="text-xs font-semibold">
                        Marka Şablonu (v{brand?.templateVersion || 1})
                      </SelectItem>
                      {cycles.map((c) => {
                        const months = [
                          'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                          'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
                        ]
                        const mName = months[c.month - 1] || c.month
                        const isCustom = c.isCustomized ? ' (Özelleştirildi)' : ` (v${c.templateVersion || 1})`
                        return (
                          <SelectItem key={c.id} value={c.id} className="text-xs">
                            {mName} {c.year}{isCustom}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                {selectedPlanSource !== 'template' && (
                  <Button
                    onClick={handleDeleteCycle}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-red-400 hover:text-red-300 hover:bg-rose-500/10 border border-neutral-800"
                    title="Bu Dönemi (Planı) Sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>



            {/* Desktop Toggle Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsPlanOpen(!isPlanOpen)}
              className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg border border-neutral-800"
              title={isPlanOpen ? "Tabloyu Gizle" : "Tabloyu Göster"}
            >
              {isPlanOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isPlanOpen && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b bg-muted/20 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="p-4">Kalem Başlığı</th>
                <th className="p-4 w-32">Tip</th>
                <th className="p-4 w-28 text-center">Hedef</th>
                <th className="p-4 w-32">Durum</th>
                <th className="p-4 w-48">İlerleme</th>
                {selectedPlanSource === 'template' && (
                  <th className="p-4 w-20 text-center">İşlem</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {localPlan.map((item) => {
                const progressPct =
                  item.target > 0 ? Math.min(100, Math.round((item.completed / item.target) * 100)) : 0
                
                // Color maps for status
                const statusColors = {
                  pending: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
                  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                }

                const isCancelled = item.status === 'cancelled'

                return (
                  <tr
                    key={item.id}
                    className={cn(
                      'hover:bg-muted/5 transition-colors',
                      isCancelled && 'opacity-60 bg-rose-500/[0.01]'
                    )}
                  >
                    {/* Başlık */}
                    <td className="p-4 font-semibold text-foreground text-sm">{item.title}</td>

                    {/* Tip */}
                    <td className="p-4">
                      <Badge variant="outline" className="font-normal text-xs px-2 py-0.5">
                        {OPERATION_PLAN_ITEM_TYPE_LABELS[item.type] || item.type}
                      </Badge>
                    </td>

                    {/* Hedef */}
                    <td className="p-4 text-center">
                      {selectedPlanSource === 'template' ? (
                        <div className="flex justify-center">
                          <Input
                            type="number"
                            min="1"
                            disabled={isCancelled}
                            value={item.target}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                target: Math.max(1, parseInt(e.target.value) || 1),
                              })
                            }
                            className="h-8 w-20 text-center text-xs font-bold bg-muted/20 border-neutral-700 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      ) : (
                        <span className="font-bold text-muted-foreground text-sm">{item.target}</span>
                      )}
                    </td>

                    {/* Durum */}
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-semibold text-xs px-2.5 py-1 rounded-full border',
                          statusColors[item.status]
                        )}
                      >
                        {OPERATION_PLAN_ITEM_STATUS_LABELS[item.status] || item.status}
                      </Badge>
                    </td>

                    {/* İlerleme */}
                    <td className="p-4">
                      {isCancelled ? (
                        <span className="text-xs text-rose-500 font-medium italic">İptal Edildi</span>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-24 bg-neutral-800 rounded-full overflow-hidden shrink-0">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-300',
                                progressPct >= 100
                                  ? 'bg-emerald-500'
                                  : progressPct > 0
                                  ? 'bg-blue-500'
                                  : 'bg-neutral-700'
                              )}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              'text-xs font-bold shrink-0',
                              progressPct >= 100
                                ? 'text-emerald-400'
                                : progressPct > 0
                                ? 'text-blue-400'
                                : 'text-muted-foreground'
                            )}
                          >
                            {item.completed} / {item.target} (%{progressPct})
                          </span>
                        </div>
                      )}
                    </td>

                    {/* İşlem */}
                    {selectedPlanSource === 'template' && (
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* İptal/Aktif Et Butonu */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleUpdateItem(item.id, {
                                status: item.status === 'cancelled' ? 'pending' : 'cancelled',
                              })
                            }
                            className={cn(
                              'h-7 w-7 rounded-lg',
                              item.status === 'cancelled'
                                ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                            )}
                            title={item.status === 'cancelled' ? 'Geri Al / Aktifleştir' : 'İptal Et'}
                          >
                            {item.status === 'cancelled' ? (
                              <RotateCcw className="h-3.5 w-3.5" />
                            ) : (
                              <Ban className="h-3.5 w-3.5" />
                            )}
                          </Button>

                          {/* Sil Butonu */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePlanItem(item.id)}
                            className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-rose-500/10 rounded-lg"
                            title="Bu Kalemi Sil"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}

              {/* Yeni Kalem Ekleme Satırı */}
              {selectedPlanSource === 'template' && (
                <tr className="bg-muted/5 border-t border-neutral-800/60">
                  {/* Başlık */}
                  <td className="p-4">
                    <Input
                      placeholder="Yeni kalem başlığı..."
                      value={newPlanItemTitle}
                      onChange={(e) => setNewPlanItemTitle(e.target.value)}
                      className="h-8 text-xs bg-muted/20 border-neutral-700 focus:ring-1 focus:ring-blue-500"
                    />
                  </td>

                  {/* Tip */}
                  <td className="p-4">
                    <Select
                      value={newPlanItemType}
                      onValueChange={(val) => setNewPlanItemType(val as any)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-muted/20 border-neutral-700">
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
                  </td>

                  {/* Hedef */}
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <Input
                        type="number"
                        min="1"
                        value={newPlanItemTarget}
                        onChange={(e) => setNewPlanItemTarget(Math.max(1, parseInt(e.target.value) || 1))}
                        className="h-8 w-20 text-center text-xs bg-muted/20 border-neutral-700 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </td>

                  {/* Boş hücreler */}
                  <td className="p-4"></td>
                  <td className="p-4"></td>

                  {/* Ekle Butonu */}
                  <td className="p-4 text-center">
                    <Button
                      type="button"
                      onClick={() => {
                        if (!newPlanItemTitle.trim()) {
                          toast.error('Lütfen bir kalem başlığı girin')
                          return
                        }
                        handleAddPlanItem(newPlanItemTitle.trim(), newPlanItemType, newPlanItemTarget)
                        setNewPlanItemTitle('')
                        setNewPlanItemTarget(1)
                      }}
                      size="icon"
                      className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {/* Canlı İş Akışları (Workflow Runtime Section) */}
      <BrandWorkflowSection
        brand={brand}
        onProgress={handleProgressRefresh}
        onRequestCancelCycle={handleRequestCancelCycle}
      />

      {/* İptal Onay Modalı — document.body'e mount edilmiştir, overflow-hidden container sorununu çözer */}
      {showCancelConfirm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </span>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white">Operasyon Dönemini İptal Et?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bu işlem seçili operasyon dönemini (aylık plan) ve bu döneme ait oluşturulmuş tüm iş akışlarını / görevleri{' '}
                  <strong className="text-white">İPTAL</strong> durumuna getirecektir. Bu işlem geri alınamaz.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-red-400 bg-red-500/[0.04] border border-red-500/20 p-3 rounded-xl font-bold leading-normal">
              Emin misiniz? Çalışanların aktif görev listelerinde bu döneme ait işler artık görünmeyecektir.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 text-xs rounded-xl"
                onClick={() => { setShowCancelConfirm(false); setCancelConfirmFn(null) }}
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                onClick={handleConfirmCancel}
                className="h-9 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
              >
                Evet, Dönemi İptal Et
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Silme Onay Modalı */}
      {showDeleteConfirm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </span>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white">Operasyon Dönemini Sil?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bu işlem seçili operasyon dönemini (aylık plan) ve bu döneme ait oluşturulmuş tüm iş akışlarını / görevleri veritabanından{' '}
                  <strong className="text-red-400">KALICI OLARAK SİLECEKTİR</strong>. Bu işlem geri alınamaz.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-red-400 bg-red-500/[0.04] border border-red-500/20 p-3 rounded-xl font-bold leading-normal">
              Emin misiniz? Bu işlem, ilgili dönem altındaki tüm görev kayıtlarını ve tamamlanmış veya aktif tüm iş adımlarını yok edecektir.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 text-xs rounded-xl"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDeleteCycle}
                className="h-9 text-xs bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
              >
                Evet, Kalıcı Olarak Sil
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Plan Kalemi Silme Onay Modalı */}
      {showDeletePlanItemConfirm && planItemToDeleteId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </span>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white">Plan Kalemini Sil?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bu operasyon kalemini plan listesinden silmek istediğinize emin misiniz?
                  {selectedPlanSource !== 'template' && (
                    <span className="block mt-1 text-amber-400 font-semibold">
                      Uygulama Hedefine göre bu değişiklik sadece bu dönem için veya hem dönem hem şablon için kaydedilecektir.
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 text-xs rounded-xl"
                onClick={() => { setShowDeletePlanItemConfirm(false); setPlanItemToDeleteId(null) }}
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDeletePlanItem}
                className="h-9 text-xs bg-red-600 hover:bg-red-750 text-white rounded-xl font-bold"
              >
                Evet, Sil
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
