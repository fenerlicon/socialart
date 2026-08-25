'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Employee, RolePackageId, TeamId, PermissionOverrideMap } from '@/types/domain'
import { getStoredEmployees, getActiveEmployeeId, updateEmployee } from '@/lib/storage/local-employee-store'
import { resolvePanelAuthority, usePrincipal } from '@/lib/permissions/panel-authority'
import { AccessDenied } from '@/components/shared/access-denied'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { getPermissionRowStates, getInitials } from '@/lib/permissions/permission-form-utils'
import { MODULES, PROTOTYPE_MODULES } from '@/config/modules'
import { getPermissionsByModule, PERMISSIONS, PROTOTYPE_PERMISSION_KEYS, type PermissionKey } from '@/config/permissions'
import { PermissionSourceBadges } from '@/components/shared/permission-source-badge'
import { toast } from 'sonner'
import { Shield, Search, X, Edit, Check, Settings, ShieldAlert, Wand2, RefreshCw } from 'lucide-react'

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

export default function SettingsPage() {
  const router = useRouter()
  const { principal } = usePrincipal()

  // Auth states
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // System states
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Modal / Editing states
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [localOverrides, setLocalOverrides] = useState<PermissionOverrideMap>({})
  const [isSaving, setIsSaving] = useState(false)

  const loadData = async () => {
    const list = await getStoredEmployees()
    setEmployees(list)

    const activeId = getActiveEmployeeId()
    const current = list.find((e) => e.id === activeId)
    if (current) {
      setActiveEmployee(current)
    }
    setIsLoadingAuth(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Resolve permission guard
  const hasPermission = useMemo(() => {
    return resolvePanelAuthority(principal, activeEmployee, 'settings.manage')
  }, [principal, activeEmployee])

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const query = searchQuery.toLowerCase().trim()
      if (!query) return emp.employeeStatus === 'active'
      return (
        emp.fullName.toLowerCase().includes(query) ||
        (emp.title || '').toLowerCase().includes(query) ||
        (ROLE_PACKAGE_LABELS[emp.rolePackageId] || '').toLowerCase().includes(query)
      )
    })
  }, [employees, searchQuery])

  // Open edit modal
  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp)
    setLocalOverrides(emp.permissionOverrides || {})
  }

  // Close modal
  const closeEditModal = () => {
    setEditingEmployee(null)
    setLocalOverrides({})
  }

  // Toggle override permission
  const handleTogglePermission = (key: PermissionKey, checked: boolean, defaultGranted: boolean) => {
    setLocalOverrides((prev) => {
      const next = { ...prev }
      if (checked === defaultGranted) {
        delete next[key]
      } else {
        next[key] = checked
      }
      return next
    })
  }

  // Reset all overrides for current editing employee
  const handleResetOverrides = () => {
    setLocalOverrides({})
    toast.success('Kullanıcıya özel yetki kuralı sıfırlandı. Varsayılan rol paketine dönüldü.')
  }

  // Save overrides
  const handleSaveOverrides = async () => {
    if (!editingEmployee) return
    setIsSaving(true)
    try {
      const updated = await updateEmployee(editingEmployee.id, {
        permissionOverrides: localOverrides,
      })
      if (updated) {
        toast.success(`"${editingEmployee.fullName}" yetki ayarları başarıyla güncellendi!`)
        await loadData()
        closeEditModal()
      } else {
        toast.error('Yetki ayarları kaydedilemedi')
      }
    } catch (err: any) {
      toast.error('Bir hata oluştu: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Permission structures for current editing employee
  const permissionsByModule = useMemo(() => getPermissionsByModule([...PROTOTYPE_MODULES]), [])

  const currentEmployeeRowStates = useMemo(() => {
    if (!editingEmployee) return []
    return getPermissionRowStates({
      rolePackageId: editingEmployee.rolePackageId as RolePackageId,
      teamIds: editingEmployee.teamIds as TeamId[],
      permissionOverrides: localOverrides,
      permissionKeys: [...PROTOTYPE_PERMISSION_KEYS],
    })
  }, [editingEmployee, localOverrides])

  const rowStateByKey = useMemo(() => {
    return new Map(currentEmployeeRowStates.map((row) => [row.key, row]))
  }, [currentEmployeeRowStates])

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
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span>Social Art Base</span>
          <span>/</span>
          <span className="text-foreground">Sistem Ayarları</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-7 w-7 text-blue-500" />
          Sistem Ayarları
        </h1>
        <p className="text-muted-foreground text-sm">
          Çalışanların rol paketlerini, özel yetkilerini ve sisteme erişim izinlerini buradan yönetebilirsiniz.
        </p>
      </div>

      {/* Main Settings Panel */}
      <div className="rounded-2xl border bg-card/30 backdrop-blur-md shadow-sm overflow-hidden p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              Çalışan Yetki Yönetimi
            </h3>
            <p className="text-xs text-muted-foreground">
              Her çalışanın sisteme ait modüllerdeki yetki izinlerini ve özel kurallarını (override) düzenleyin.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Çalışan adı, unvan veya rol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs border bg-muted/10"
            />
          </div>
        </div>

        {/* Employees list */}
        {filteredEmployees.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredEmployees.map((emp) => {
              const activeOverrides = emp.permissionOverrides ? Object.keys(emp.permissionOverrides).length : 0
              const initials = getInitials(emp.fullName)

              return (
                <div
                  key={emp.id}
                  className="rounded-xl border bg-muted/5 p-4 space-y-4 hover:border-neutral-700 transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {initials}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">{emp.fullName}</h4>
                      <p className="text-xs text-muted-foreground truncate">{emp.title || 'Ünvansız'}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-t border-neutral-800/40 pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Varsayılan Rol:</span>
                      <span className="font-semibold text-foreground truncate pl-2 max-w-[180px]">
                        {ROLE_PACKAGE_LABELS[emp.rolePackageId] || emp.rolePackageId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Özel Yetkiler:</span>
                      {activeOverrides > 0 ? (
                        <Badge variant="outline" className="text-[10px] font-semibold bg-amber-500/10 text-amber-400 border-amber-500/20">
                          {activeOverrides} Yetki Özelleştirilmiş
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-semibold bg-blue-500/10 text-blue-400 border-blue-500/20">
                          Varsayılan
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => openEditModal(emp)}
                    variant="outline"
                    className="w-full text-xs h-9 font-semibold border-neutral-850 hover:bg-neutral-850 hover:text-white flex items-center gap-1.5 mt-2"
                  >
                    <Edit className="h-3.5 w-3.5" /> Yetkileri Düzenle
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed rounded-2xl bg-neutral-950/5">
            <ShieldAlert className="h-10 w-10 text-neutral-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-400">Aradığınız kriterde aktif çalışan bulunamadı.</p>
          </div>
        )}
      </div>

      {/* YETKİ DÜZENLEME OVERLAY / MODAL */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-neutral-800 rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-muted/20">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5 text-purple-400" />
                  Kullanıcı Yetki Özelleştirme
                </h3>
                <p className="text-xs text-muted-foreground">
                  {editingEmployee.fullName} ({ROLE_PACKAGE_LABELS[editingEmployee.rolePackageId] || editingEmployee.rolePackageId})
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeEditModal}
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-neutral-950/40">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span className="text-xs text-muted-foreground">
                  Aşağıdaki switchler yardımıyla kullanıcının varsayılan rol paketi yetkilerini açıp kapatabilirsiniz.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetOverrides}
                  className="h-8 text-[11px] font-semibold border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Varsayılana Sıfırla
                </Button>
              </div>

              <div className="space-y-6">
                {PROTOTYPE_MODULES.map((moduleId) => {
                  const modulePermissions = permissionsByModule[moduleId]
                  if (!modulePermissions?.length) return null

                  return (
                    <div key={moduleId} className="rounded-xl border border-neutral-900 bg-card/25 p-4 space-y-4">
                      <div className="border-b border-neutral-900 pb-2">
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                          {MODULES[moduleId].name} Modülü
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          {MODULES[moduleId].description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {modulePermissions.map((permission) => {
                          const row = rowStateByKey.get(permission.key)
                          if (!row) return null

                          return (
                            <div
                              key={permission.key}
                              className="flex items-center justify-between gap-4 rounded-lg border border-neutral-900/60 bg-neutral-950/30 px-3 py-2.5"
                            >
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-xs font-bold text-foreground">
                                    {PERMISSIONS[permission.key].label}
                                  </p>
                                  <PermissionSourceBadges sources={row.displaySources} />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                  {PERMISSIONS[permission.key].description}
                                </p>
                              </div>
                              <Switch
                                checked={row.granted}
                                onCheckedChange={(checked) =>
                                  handleTogglePermission(permission.key, checked, row.defaultGranted)
                                }
                                className="scale-90"
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-muted/20 border-t border-neutral-800 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditModal}
                className="h-9 text-xs px-4 border"
                disabled={isSaving}
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                onClick={handleSaveOverrides}
                className="h-9 text-xs px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow flex items-center gap-1.5"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>Kaydediliyor...</>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Değişiklikleri Kaydet
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
