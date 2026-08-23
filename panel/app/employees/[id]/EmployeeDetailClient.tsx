'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getEmployeeById, getStoredEmployees } from '@/lib/storage/local-employee-store'
import { getStoredBrands } from '@/lib/storage/local-brand-store'
import { WorkflowRepository } from '@/lib/repositories/WorkflowRepository'
import type { Employee, Brand } from '@/types/domain'
import {
  EMPLOYEE_STATUS_LABELS,
  WORK_LOCATION_STATUS_LABELS,
} from '@/types/domain'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Mail,
  Briefcase,
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  Building,
  Loader2,
} from 'lucide-react'

const ROLE_PACKAGE_LABELS: Record<string, string> = {
  'operasyon-yonetimi': 'Operasyon Yönetimi',
  'strateji-musteri-yonetimi': 'Strateji & Müşteri Yönetimi',
  'dijital-pazarlama': 'Dijital Pazarlama',
  'sosyal-medya-yonetimi': 'Sosyal Medya Yönetimi',
  'kreatif-yonetim': 'Kreatif Yönetim',
  'kreatif-direktor': 'Kreatif Direktör',
  'grafik-tasarim': 'Grafik Tasarım',
  'video-kurgu': 'Video Kurgu',
  'fotograf-uretimi': 'Fotoğraf Üretimi',
  'video-uretimi': 'Video Üretimi',
}

const TEAM_LABELS: Record<string, string> = {
  'merkezi-operasyon': 'Merkezi Operasyon Takımı',
  'strateji-musteri': 'Strateji & Müşteri İlişkileri',
  'dijital-pazarlama': 'Dijital Pazarlama Takımı',
  'sosyal-medya': 'Sosyal Medya Takımı',
  'kreatif-koordinasyon': 'Kreatif Koordinasyon',
  'grafik-studyo': 'Grafik Tasarım Stüdyosu',
  'post-produksiyon': 'Post-Prodüksiyon (Kurgu/Animasyon)',
  'fotograf-studyo': 'Fotoğraf Stüdyosu',
  'video-produksiyon': 'Video Prodüksiyon Takımı',
  'crm-satis': 'CRM & Satış Takımı',
}

import { getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { resolveEffectivePermissions } from '@/lib/permissions/resolve-permissions'
import { AccessDenied } from '@/components/shared/access-denied'

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])

  // Auth states
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isOffboardOpen, setIsOffboardOpen] = useState(false)
  const [activeTasks, setActiveTasks] = useState<any[]>([])
  const [allActiveEmployees, setAllActiveEmployees] = useState<Employee[]>([])
  const [bulkTargetAssignee, setBulkTargetAssignee] = useState<string>('')
  const [taskAssignments, setTaskAssignments] = useState<Record<string, string>>({})
  const [isOffboarding, setIsOffboarding] = useState(false)

  useEffect(() => {
    if (!isOffboardOpen || !id) return
    async function loadOffboardData() {
      try {
        const [steps, emps] = await Promise.all([
          WorkflowRepository.getAllSteps(),
          getStoredEmployees()
        ])
        const activeSteps = steps.filter(s => 
          s.assignedEmployeeId === id && 
          s.status !== 'completed' && 
          s.status !== 'skipped'
        )
        setActiveTasks(activeSteps)
        
        const others = emps.filter(e => e.id !== id && e.employeeStatus === 'active')
        setAllActiveEmployees(others)

        const initialMap: Record<string, string> = {}
        activeSteps.forEach(s => {
          initialMap[s.id] = ''
        })
        setTaskAssignments(initialMap)
      } catch (err) {
        console.error('Error loading offboard data:', err)
      }
    }
    loadOffboardData()
  }, [isOffboardOpen, id])

  useEffect(() => {
    if (!id) return
    async function loadData() {
      setIsLoadingAuth(true)
      const emp = await getEmployeeById(id)
      if (emp) {
        setEmployee(emp)
      }
      
      const storedEmps = await getStoredEmployees()
      const activeId = getActiveEmployeeId()
      const current = storedEmps.find((e) => e.id === activeId)
      if (current) {
        setActiveEmployee(current)
      }
      setIsLoadingAuth(false)

      const storedBrands = await getStoredBrands()
      setBrands(storedBrands)
    }
    loadData()
  }, [id])

  // Resolve permission guard
  const hasPermission = useMemo(() => {
    if (!activeEmployee) return false
    const effective = resolveEffectivePermissions({
      rolePackageId: activeEmployee.rolePackageId,
      teamIds: activeEmployee.teamIds,
      permissionOverrides: activeEmployee.permissionOverrides || {},
    })
    return (
      effective.grantedKeys.has('employees.manage') ||
      effective.grantedKeys.has('employees.view') ||
      effective.grantedKeys.has('system.admin') ||
      effective.grantedKeys.has('team.manage') ||
      effective.grantedKeys.has('task.manage')
    )
  }, [activeEmployee])

  // Check if they share teams
  const canViewDetail = useMemo(() => {
    if (!activeEmployee || !employee) return false
    const isManagerExposed = activeEmployee.teamIds.includes('merkezi-operasyon') || activeEmployee.rolePackageId === 'operasyon-yonetimi'
    if (isManagerExposed) return true
    if (activeEmployee.id === employee.id) return true
    return employee.teamIds.some((tId) => activeEmployee.teamIds.includes(tId))
  }, [activeEmployee, employee])

  // Get brands where employee is assigned
  const assignedBrands = useMemo(() => {
    return brands.filter((brand) =>
      brand.brandAssignments?.some((a) => a.employeeId === id)
    )
  }, [brands, id])

  const handleOffboard = async () => {
    const unassignedTasks = activeTasks.filter(t => !taskAssignments[t.id])
    if (unassignedTasks.length > 0 && allActiveEmployees.length > 0) {
      alert('Lütfen tüm aktif görevler için yeni bir sorumlu seçin veya havuza atayın.')
      return
    }

    setIsOffboarding(true)
    try {
      const updatedSteps = activeTasks.map(t => {
        const targetVal = taskAssignments[t.id]
        const targetId = targetVal === 'unassigned' ? '' : targetVal
        return {
          ...t,
          assignedEmployeeId: targetId || undefined,
          assigneeEmployeeId: targetId || undefined,
          assignedAt: targetId ? new Date().toISOString() : undefined,
          previousAssigneeEmployeeId: id
        }
      })

      if (updatedSteps.length > 0) {
        await WorkflowRepository.saveWorkflowSteps(updatedSteps)
      }

      const { updateEmployee } = await import('@/lib/storage/local-employee-store')
      const updatedEmp = await updateEmployee(id, { employeeStatus: 'inactive' })
      if (updatedEmp) {
        setEmployee(updatedEmp)
      }
      setIsOffboardOpen(false)
      alert('Çalışan başarıyla işten çıkarıldı ve aktif görevleri devredildi!')
    } catch (err) {
      console.error('Failed to offboard employee:', err)
      alert('İşlem sırasında bir hata oluştu.')
    } finally {
      setIsOffboarding(false)
    }
  }

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!hasPermission || !canViewDetail) {
    return <AccessDenied />
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-muted-foreground text-sm">Çalışan bulunamadı veya yükleniyor...</p>
        <Button onClick={() => router.push('/employees')} variant="outline" size="sm">
          Çalışan Listesine Dön
        </Button>
      </div>
    )
  }

  // Count overrides
  const overrides = Object.entries(employee.permissionOverrides || {})

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-6 animate-in fade-in duration-300">
      {/* Üst Gezinme & Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/employees"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Çalışan Listesine Dön
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {employee.fullName}
            </h1>
            <Badge
              variant={employee.employeeStatus === 'active' ? 'default' : 'secondary'}
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            >
              {EMPLOYEE_STATUS_LABELS[employee.employeeStatus]}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{employee.title || 'Ünvansız'}</p>
        </div>
        {employee.employeeStatus === 'active' && (
          <Button
            onClick={() => setIsOffboardOpen(true)}
            className="rounded-xl font-bold text-xs gap-1.5 h-9 px-4 shrink-0 bg-red-650 hover:bg-red-750 text-white"
          >
            🚪 İşten Çıkar & Görevleri Devret
          </Button>
        )}
      </div>

      {/* Kartlar - Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Sol Sütun - Çalışan Bilgileri */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card/40 p-6 space-y-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 border-b pb-3 border-neutral-800">
              <Briefcase className="h-5 w-5 text-blue-500" />
              <h3 className="text-base font-semibold">Çalışan Bilgileri</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-xl border">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="space-y-0.5">
                  <span className="block text-xs text-muted-foreground font-medium">E-posta Adresi</span>
                  <span className="font-semibold text-foreground truncate block max-w-[200px]">{employee.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-xl border">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="space-y-0.5">
                  <span className="block text-xs text-muted-foreground font-medium">Çalışma Konumu</span>
                  <span className="font-semibold text-foreground">{WORK_LOCATION_STATUS_LABELS[employee.workLocationStatus]}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-xl border">
                <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="space-y-0.5">
                  <span className="block text-xs text-muted-foreground font-medium">Başlangıç Rol Paketi</span>
                  <span className="font-semibold text-foreground">
                    {ROLE_PACKAGE_LABELS[employee.rolePackageId] || employee.rolePackageId}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-xl border">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="space-y-0.5">
                  <span className="block text-xs text-muted-foreground font-medium">Sisteme Giriş</span>
                  <span className="font-semibold text-foreground">
                    {new Date(employee.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sorumluluk Alanları (Takımlar) */}
          <div className="rounded-2xl border bg-card/40 p-6 space-y-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 border-b pb-3 border-neutral-800">
              <Users className="h-5 w-5 text-purple-500" />
              <h3 className="text-base font-semibold">Sorumluluk Alanları (Takımlar)</h3>
            </div>
            {employee.teamIds && employee.teamIds.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {employee.teamIds.map((teamId) => (
                  <div key={teamId} className="flex items-center gap-2 p-3 bg-muted/10 border rounded-xl">
                    <div className="h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                    <span className="text-xs font-semibold text-foreground">
                      {TEAM_LABELS[teamId] || teamId}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">
                Bu çalışana atanmış herhangi bir takım sorumluluğu bulunmamaktadır.
              </p>
            )}
          </div>
        </div>

        {/* Sağ Sütun - Marka Atamaları ve Override Raporu */}
        <div className="space-y-6">
          {/* Marka Atamaları */}
          <div className="rounded-2xl border bg-card/40 p-6 space-y-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 border-b pb-3 border-neutral-800">
              <Building className="h-5 w-5 text-emerald-500" />
              <h3 className="text-base font-semibold">Aktif Marka Atamaları</h3>
            </div>

            {assignedBrands.length > 0 ? (
              <div className="space-y-3">
                {assignedBrands.map((brand) => {
                  const assignment = brand.brandAssignments?.find((a) => a.employeeId === id)
                  return (
                    <Link
                      key={brand.id}
                      href={`/brands/${brand.id}`}
                      className="block p-3 rounded-xl border bg-muted/5 hover:bg-muted/10 hover:border-neutral-700 transition-all space-y-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-foreground">{brand.name}</span>
                        <Badge variant="outline" className="text-[9px] px-1.5 bg-neutral-800 text-neutral-400 border-neutral-850">
                          {brand.selectedPackageId.toUpperCase()}
                        </Badge>
                      </div>
                      {assignment && (
                        <div className="text-[10px] text-muted-foreground flex gap-1">
                          Sorumluluk: <span className="font-semibold text-blue-400">{assignment.responsibility}</span>
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Bu çalışan henüz herhangi bir markanın ekibine atanmamıştır.
              </p>
            )}
          </div>

          {/* Özel Yetki Override'ları */}
          <div className="rounded-2xl border bg-card/40 p-6 space-y-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 border-b pb-3 border-neutral-800">
              <Shield className="h-5 w-5 text-amber-500" />
              <h3 className="text-base font-semibold">Özel Yetki Override Raporu</h3>
            </div>

            {overrides.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {overrides.map(([key, granted]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/10 text-xs"
                  >
                    <span className="font-medium text-foreground truncate max-w-[160px]" title={key}>
                      {key}
                    </span>
                    <div className="flex items-center gap-1.5 font-semibold">
                      {granted ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-emerald-400 text-[10px]">AÇIK</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-rose-500" />
                          <span className="text-rose-400 text-[10px]">KAPALI</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Bu çalışanda manuel yetki override&apos;ı (özelleştirilmiş yetki) bulunmamaktadır. Yetkiler başlangıç rol paketine göre otomatik yönetilir.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Offboarding Modal */}
      {isOffboardOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-neutral-850 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-neutral-900">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                🚪 İşten Çıkarma & Görev Devir Sihirbazı
              </h2>
              <p className="text-[10px] text-neutral-500 mt-1">
                <strong>{employee.fullName}</strong> isimli çalışanı işten çıkarıyorsunuz. Aktif projelerin durmaması için görevlerin devredilmesi gerekir.
              </p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {/* Toplu Atama */}
              {activeTasks.length > 0 && allActiveEmployees.length > 0 && (
                <div className="bg-neutral-900/30 border border-neutral-900 rounded-xl p-3.5 space-y-2 text-left">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block font-mono">
                    TOPLU GÖREV ATAMA (Hepsini Şuna Ata)
                  </label>
                  <select
                    value={bulkTargetAssignee}
                    onChange={(e) => {
                      const val = e.target.value
                      setBulkTargetAssignee(val)
                      const updated: Record<string, string> = {}
                      activeTasks.forEach(t => {
                        updated[t.id] = val
                      })
                      setTaskAssignments(updated)
                    }}
                    className="w-full bg-neutral-950 border border-neutral-900 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-purple-500 font-mono"
                  >
                    <option value="">-- Sorumlu Seç --</option>
                    {allActiveEmployees.map(e => (
                      <option key={e.id} value={e.id}>{e.fullName} ({e.title})</option>
                    ))}
                    <option value="unassigned">Ortak Havuz (Sorumsuz)</option>
                  </select>
                </div>
              )}

              {/* Aktif Görev Listesi */}
              <div className="space-y-2.5 text-left">
                <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest font-mono">
                  DEVREDİLECEK AKTİF GÖREVLER ({activeTasks.length})
                </div>
                
                {activeTasks.length === 0 ? (
                  <div className="text-xs text-emerald-400 py-4 text-center border border-dashed border-neutral-900 rounded-xl">
                    ✓ Bu çalışanın üzerinde aktif/devam eden hiçbir görev bulunmuyor.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                    {activeTasks.map(task => (
                      <div key={task.id} className="bg-neutral-950 border border-neutral-900 rounded-xl p-3 space-y-2 text-left">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[11px] font-bold text-neutral-300 leading-tight">
                            {task.title}
                          </span>
                          <span className="text-[8px] px-1.5 py-0.5 bg-neutral-900 text-neutral-500 rounded border border-neutral-850 font-mono font-bold uppercase shrink-0">
                            {task.responsibilityRole || 'Genel'}
                          </span>
                        </div>
                        
                        {allActiveEmployees.length > 0 ? (
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-neutral-600 uppercase font-mono block">YENİ SORUMLU</label>
                            <select
                              value={taskAssignments[task.id] || ''}
                              onChange={(e) => {
                                setTaskAssignments(prev => ({
                                  ...prev,
                                  [task.id]: e.target.value
                                }))
                              }}
                              className="w-full bg-neutral-950 border border-neutral-900 rounded-lg p-1.5 text-[10px] text-foreground focus:outline-none focus:border-purple-500 font-mono"
                            >
                              <option value="">-- Seçiniz --</option>
                              {allActiveEmployees.map(e => (
                                <option key={e.id} value={e.id}>{e.fullName}</option>
                              ))}
                              <option value="unassigned">Ortak Havuz (Sorumsuz)</option>
                            </select>
                          </div>
                        ) : (
                          <div className="text-[9px] text-amber-400/80 italic font-medium">
                            Diğer aktif çalışan bulunamadığı için bu görev otomatik olarak Ortak Havuz&apos;a (Sorumsuz) devredilecektir.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-900 flex items-center justify-end gap-3 bg-neutral-950">
              <Button
                onClick={() => setIsOffboardOpen(false)}
                variant="outline"
                className="rounded-xl h-8 text-[10px] px-4 font-bold border-neutral-850 text-neutral-450"
              >
                Vazgeç
              </Button>
              <Button
                onClick={handleOffboard}
                disabled={isOffboarding}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-8 text-[10px] px-4 font-bold gap-1.5"
              >
                {isOffboarding ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Görevleri Devret ve İşten Çıkar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
