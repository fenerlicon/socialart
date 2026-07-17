'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Employee } from '@/types/domain'
import { getStoredEmployees, getActiveEmployeeId, updateEmployee } from '@/lib/storage/local-employee-store'
import { getStoredWorkflowInstances, getWorkflowStepInstances } from '@/lib/storage/local-workflow-instance-store'
import { getStoredNotifications } from '@/lib/storage/local-notification-store'
import { ROLE_PACKAGES_BY_ID } from '@/features/role-packages/data/role-package-seeds'
import { PERMISSIONS } from '@/config/permissions'
import { MODULES } from '@/config/modules'
import { EMPLOYEE_STATUS_LABELS, WORK_LOCATION_STATUS_LABELS } from '@/types/domain'
import { resolveEffectivePermissions } from '@/lib/permissions/resolve-permissions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Briefcase,
  CheckCircle2,
  Clock,
  Bell,
  Shield,
  Edit2,
  Save,
  X,
  Sparkles,
  MapPin,
  Calendar,
  Building2,
  Package,
  Lock,
  ChevronRight,
  Database,
} from 'lucide-react'

export function ProfilePage() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [completedSteps, setCompletedSteps] = useState(0)
  const [activeSteps, setActiveSteps] = useState(0)
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'permissions'>('overview')

  const [migrating, setMigrating] = useState(false)

  const loadData = async () => {
    const activeId = getActiveEmployeeId()
    const emps = await getStoredEmployees()
    const me = emps.find((e) => e.id === activeId) ?? emps[0]
    if (!me) return

    setEmployee(me)
    setEditTitle(me.title)
    setEditAvatarUrl(me.avatarUrl ?? '')

    const steps = await getWorkflowStepInstances()
    setCompletedSteps(steps.filter((s) => s.assignedEmployeeId === me.id && s.status === 'completed').length)
    setActiveSteps(steps.filter((s) => s.assignedEmployeeId === me.id && s.status === 'active').length)

    const notifs = await getStoredNotifications()
    setUnreadNotifs(notifs.filter((n) => n.recipientEmployeeId === me.id && !n.isRead).length)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleMigrate = async () => {
    setMigrating(true)
    const toastId = toast.loading('Veriler veritabanına taşınıyor, lütfen bekleyin...')
    try {
      const { runManualMigration } = await import('@/lib/supabase/migration')
      const result = await runManualMigration()
      if (result.success) {
        toast.success(result.message, { id: toastId })
        await loadData()
      } else {
        toast.error(result.message, { id: toastId })
      }
    } catch (err: any) {
      toast.error(`Beklenmeyen bir hata oluştu: ${err.message || err}`, { id: toastId })
    } finally {
      setMigrating(false)
    }
  }

  const rolePackage = useMemo(() => {
    if (!employee) return null
    return ROLE_PACKAGES_BY_ID[employee.rolePackageId] ?? null
  }, [employee])

  const effectivePermissions = useMemo(() => {
    if (!employee) return null
    return resolveEffectivePermissions({
      rolePackageId: employee.rolePackageId,
      teamIds: employee.teamIds,
      permissionOverrides: employee.permissionOverrides,
    })
  }, [employee])

  const permissionsByModule = useMemo(() => {
    if (!effectivePermissions) return {}
    const result: Record<string, { name: string; keys: string[] }> = {}
    for (const perm of effectivePermissions.permissions) {
      if (!perm.granted) continue
      const mod = MODULES[perm.moduleId]
      if (!result[perm.moduleId]) {
        result[perm.moduleId] = { name: mod?.name ?? perm.moduleId, keys: [] }
      }
      const def = PERMISSIONS[perm.key]
      result[perm.moduleId].keys.push(def?.label ?? perm.key)
    }
    return result
  }, [effectivePermissions])

  const handleSave = async () => {
    if (!employee) return
    setIsSaving(true)
    try {
      await updateEmployee(employee.id, {
        title: editTitle.trim() || employee.title,
        avatarUrl: editAvatarUrl.trim() || undefined,
      })
      toast.success('Profil güncellendi.')
      setIsEditing(false)
      await loadData()
    } catch {
      toast.error('Güncelleme başarısız.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (!employee) return
    setEditTitle(employee.title)
    setEditAvatarUrl(employee.avatarUrl ?? '')
    setIsEditing(false)
  }

  const joinedDate = employee
    ? new Date(employee.createdAt).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  if (!employee) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Profil yükleniyor...
      </div>
    )
  }

  const initials = employee.fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    inactive: 'bg-red-500/10 text-red-400 border-red-500/20',
    probation: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    intern: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    part_time: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    freelance: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  }

  const locationIcons: Record<string, string> = {
    office: '🏢',
    remote: '🏠',
    field: '🌍',
    hybrid: '🔄',
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Hero Kartı */}
      <div className="relative rounded-2xl border border-purple-500/10 bg-gradient-to-br from-purple-500/[0.04] via-transparent to-blue-500/[0.04] p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            {employee.avatarUrl ? (
              <img
                src={employee.avatarUrl}
                alt={employee.fullName}
                className="w-16 h-16 rounded-2xl object-cover border border-purple-500/20 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-purple-500/20">
                {initials}
              </div>
            )}
          </div>

          {/* Bilgiler */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  {employee.fullName}
                </h1>
                {isEditing ? (
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-7 text-xs bg-neutral-900/50 border-neutral-800 w-48"
                      placeholder="Unvan..."
                    />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">{employee.title}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Kaydet
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      className="h-7 text-[10px] border-neutral-800"
                    >
                      <X className="h-3 w-3 mr-1" />
                      İptal
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="h-7 text-[10px] border-neutral-800 hover:border-purple-500/40"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Düzenle
                  </Button>
                )}
              </div>
            </div>

            {/* Badge'ler */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  statusColors[employee.employeeStatus] ?? 'bg-neutral-900 text-neutral-400 border-neutral-800'
                }`}
              >
                {EMPLOYEE_STATUS_LABELS[employee.employeeStatus]}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-neutral-800 bg-neutral-900/50 text-muted-foreground">
                {locationIcons[employee.workLocationStatus]}{' '}
                {WORK_LOCATION_STATUS_LABELS[employee.workLocationStatus]}
              </span>
              {employee.hasAdvancedCalendarAccess && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400">
                  📅 Gelişmiş Takvim
                </span>
              )}
            </div>

            {/* Meta Bilgiler */}
            <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {employee.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {joinedDate} tarihinde katıldı
              </span>
            </div>

            {/* Avatar URL düzenleme */}
            {isEditing && (
              <div className="pt-1">
                <Label className="text-[10px] text-muted-foreground">Avatar URL (opsiyonel)</Label>
                <Input
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  className="h-7 text-xs bg-neutral-900/50 border-neutral-800 mt-1 w-72"
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-900 bg-card/30 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Aktif İşler</span>
            <Clock className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-foreground">{activeSteps}</div>
          <p className="text-[9px] text-muted-foreground">Şu an devam eden iş adımı</p>
        </div>

        <div className="rounded-2xl border border-neutral-900 bg-card/30 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tamamlanan</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-foreground">{completedSteps}</div>
          <p className="text-[9px] text-muted-foreground">Toplam bitirilen iş adımı</p>
        </div>

        <div className="rounded-2xl border border-neutral-900 bg-card/30 p-4 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bildirimler</span>
            <Bell className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-foreground">{unreadNotifs}</div>
          <p className="text-[9px] text-muted-foreground">Okunmamış bildirim</p>
        </div>
      </div>

      {/* Tab'lar */}
      <div className="flex gap-1 border-b border-neutral-900">
        {(['overview', 'permissions'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all -mb-px ${
              activeTab === tab
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'overview' ? 'Genel Bilgiler' : 'Yetkiler'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Rol Paketi */}
          <Card className="rounded-2xl border-neutral-900 bg-card/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-purple-400" />
                Rol Paketi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm font-black text-foreground">{rolePackage?.name ?? employee.rolePackageId}</div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {rolePackage?.description ?? '—'}
              </p>
            </CardContent>
          </Card>

          {/* Takım Üyelikleri */}
          <Card className="rounded-2xl border-neutral-900 bg-card/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-blue-400" />
                Takım Üyelikleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employee.teamIds.length === 0 ? (
                <p className="text-[10px] text-muted-foreground">Henüz bir takıma dahil değilsiniz.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {employee.teamIds.map((tid) => (
                    <span
                      key={tid}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-neutral-800 bg-neutral-900/50 text-muted-foreground"
                    >
                      {tid}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Çalışan ID */}
          <Card className="rounded-2xl border-neutral-900 bg-card/30 sm:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-neutral-400" />
                Hesap Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">Çalışan ID</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{employee.id}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">Son Güncelleme</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(employee.updatedAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Migration Panel */}
          <Card className="rounded-2xl border-purple-500/20 bg-purple-500/[0.02] sm:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-purple-400" />
                Supabase Veritabanı Yönetimi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Uygulama verilerini tarayıcı belleğinden (localStorage) kalıcı Supabase veritabanına taşımak için tek seferlik göç işlemini başlatabilirsiniz. 
                Bu işlem mevcut yerel verilerinizi korur ve veritabanı boşsa örnek tohum verileri de yükler.
              </p>
              <Button 
                onClick={handleMigrate}
                disabled={migrating}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-md"
              >
                {migrating ? 'Taşınıyor...' : 'Verileri Veritabanına Taşı (Migrate)'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-900 bg-neutral-950/[0.02] p-3 flex items-start gap-2">
            <Lock className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Aşağıdaki yetkiler rol paketiniz, takım üyelikleriniz ve yönetici tarafından yapılan manuel override'lardan hesaplanmaktadır.
            </p>
          </div>

          {Object.entries(permissionsByModule).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-900 p-8 text-center text-xs text-muted-foreground">
              Aktif yetkiniz bulunmuyor.
            </div>
          ) : (
            <div className="grid gap-3">
              {Object.entries(permissionsByModule).map(([moduleId, { name, keys }]) => (
                <div key={moduleId} className="rounded-2xl border border-neutral-900 bg-card/20 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-xs font-bold text-foreground">{name}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{keys.length} yetki</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {keys.map((k) => (
                      <span
                        key={k}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/[0.07] border border-purple-500/15 text-purple-300"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
