'use client'

import { useEffect, useState, useMemo } from 'react'
import { getStoredEmployees, getActiveEmployeeId, getEmployeeById } from '@/lib/storage/local-employee-store'
import { resolveEffectivePermissions } from '@/lib/permissions/resolve-permissions'
import { AccessDenied } from '@/components/shared/access-denied'
import type { Employee } from '@/types/domain'
import { useEmployeeForm } from '@/features/employees/hooks/use-employee-form'
import { EmployeeBasicInfoSection } from '@/features/employees/components/employee-basic-info-section'
import { EmployeeStatusSection } from '@/features/employees/components/employee-status-section'
import { RolePackageSection } from '@/features/employees/components/role-package-section'
import { TeamAssignmentSection } from '@/features/employees/components/team-assignment-section'
import { EmployeeFormActions } from '@/features/employees/components/employee-form-actions'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { KeyRound, ShieldCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  CredentialProvisionDialog,
  type ProvisionedCredentialData,
} from '@/features/employees/components/credential-provision-dialog'

interface EmployeeEditPageProps {
  id: string
}

export function EmployeeEditPage({ id }: EmployeeEditPageProps) {
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null)
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(true)

  // Auth states
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // Credential states
  const [credentialLoading, setCredentialLoading] = useState(true)
  const [credentialPresent, setCredentialPresent] = useState<boolean | null>(null)
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [provisionedData, setProvisionedData] = useState<ProvisionedCredentialData | null>(null)
  const [showProvisionDialog, setShowProvisionDialog] = useState(false)

  const form = useEmployeeForm(employeeToEdit || undefined)

  const loadCredentialStatus = async (empId: string) => {
    setCredentialLoading(true)
    try {
      const res = await fetch(`/api/auth-provision-credential?employeeId=${empId}`)
      if (res.ok) {
        const data = await res.json()
        setCredentialPresent(data.credentialPresent === true)
      }
    } catch (e) {
      console.warn('Failed to load credential status', e)
    } finally {
      setCredentialLoading(false)
    }
  }

  useEffect(() => {
    async function loadData() {
      setIsLoadingAuth(true)
      setIsLoadingEmployee(true)
      
      const storedEmps = await getStoredEmployees()
      const activeId = getActiveEmployeeId()
      const current = storedEmps.find((e) => e.id === activeId)
      if (current) {
        setActiveEmployee(current)
      }
      setIsLoadingAuth(false)

      const emp = await getEmployeeById(id)
      if (emp) {
        setEmployeeToEdit(emp)
        await loadCredentialStatus(emp.id)
      }
      setIsLoadingEmployee(false)
    }
    loadData()
  }, [id])

  const handleCreatePanelAccess = async () => {
    if (!employeeToEdit) return
    setIsProvisioning(true)

    try {
      const res = await fetch('/api/auth-provision-credential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employeeToEdit.id }),
      })

      const data = await res.json()

      if (res.ok && data.ok) {
        setProvisionedData({
          id: data.employee.id,
          fullName: data.employee.fullName,
          identifier: data.employee.identifier,
          temporaryPassword: data.temporaryPassword,
        })
        setCredentialPresent(true)
        setShowProvisionDialog(true)
        toast.success('Panel erişimi başarıyla oluşturuldu')
      } else {
        toast.error('Panel erişimi oluşturulamadı', {
          description: data.error || 'Lütfen bilgileri kontrol edip tekrar deneyin.',
        })
      }
    } catch (err: any) {
      toast.error('Bağlantı hatası', {
        description: err.message || 'Sunucuya bağlanılamadı.',
      })
    } finally {
      setIsProvisioning(false)
    }
  }

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
      effective.grantedKeys.has('system.admin') ||
      effective.grantedKeys.has('team.manage')
    )
  }, [activeEmployee])

  if (isLoadingAuth || isLoadingEmployee) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!hasPermission) {
    return <AccessDenied />
  }

  if (!employeeToEdit) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Düzenlenecek çalışan bulunamadı.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Social Art Base</p>
        <h1 className="text-3xl font-semibold tracking-tight">Çalışanı Düzenle</h1>
        <p className="text-muted-foreground text-sm">
          {employeeToEdit.fullName} çalışanının bilgilerini, rol paketini ve yetkilerini güncelleyin.
        </p>
      </header>

      <div className="space-y-6">
        {/* Panel Giriş Erişimi Durumu ve Aksiyonu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
              credentialPresent 
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
            }`}>
              {credentialPresent ? <ShieldCheck className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-foreground">Panel Giriş Erişimi</span>
                {credentialLoading ? (
                  <Badge variant="outline" className="text-[11px] font-normal border-neutral-700 text-neutral-400 gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Kontrol ediliyor
                  </Badge>
                ) : credentialPresent ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[11px] font-medium hover:bg-emerald-500/20">
                    Aktif
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[11px] font-medium bg-amber-500/10">
                    Tanımlanmamış
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {credentialPresent 
                  ? 'Bu çalışanın sisteme giriş kimliği mevcuttur.'
                  : 'Çalışan henüz sisteme giriş yapamaz. Panel erişimi oluşturarak geçici şifre atayabilirsiniz.'}
              </p>
            </div>
          </div>

          {!credentialLoading && !credentialPresent && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-medium"
              onClick={handleCreatePanelAccess}
              disabled={isProvisioning}
            >
              {isProvisioning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Panel Erişimi Oluştur
                </>
              )}
            </Button>
          )}
        </div>
        <Accordion
          type="single"
          collapsible
          defaultValue="basic-info"
          className="space-y-4 border-none"
        >
          {/* 1. Temel Bilgiler */}
          <AccordionItem
            value="basic-info"
            className="border rounded-xl bg-card px-6 shadow-sm overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="text-left space-y-1">
                <h3 className="text-base font-semibold tracking-tight text-foreground">1. Temel Bilgiler</h3>
                <p className="text-xs text-muted-foreground font-normal">
                  Kişisel bilgiler, e-posta ve görünen unvan ayarları.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 pt-2">
              <EmployeeBasicInfoSection form={form} />
            </AccordionContent>
          </AccordionItem>

          {/* 2. Durum Bilgileri */}
          <AccordionItem
            value="status-info"
            className="border rounded-xl bg-card px-6 shadow-sm overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="text-left space-y-1">
                <h3 className="text-base font-semibold tracking-tight text-foreground">2. Durum Bilgileri</h3>
                <p className="text-xs text-muted-foreground font-normal">
                  Çalışan aktiflik statüsü ve anlık çalışma konumu.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 pt-2">
              <EmployeeStatusSection form={form} />
            </AccordionContent>
          </AccordionItem>

          {/* 3. Rol Paketi & Yetkiler */}
          <AccordionItem
            value="role-permissions"
            className="border rounded-xl bg-card px-6 shadow-sm overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="text-left space-y-1">
                <h3 className="text-base font-semibold tracking-tight text-foreground">3. Rol Paketi & Yetkiler</h3>
                <p className="text-xs text-muted-foreground font-normal">
                  Başlangıç yetki paketi seçimi ve kullanıcı bazlı yetki özelleştirmesi.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 pt-2">
              <RolePackageSection form={form} />
            </AccordionContent>
          </AccordionItem>

          {/* 4. Takımlar / Sorumluluk Alanları */}
          <AccordionItem
            value="teams"
            className="border rounded-xl bg-card px-6 shadow-sm overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="text-left space-y-1">
                <h3 className="text-base font-semibold tracking-tight text-foreground">4. Takımlar / Sorumluluk Alanları</h3>
                <p className="text-xs text-muted-foreground font-normal">
                  Dahil olduğu çalışma grupları ve takımlardan kazandığı yetkiler.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 pt-2">
              <TeamAssignmentSection form={form} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Form Aksiyonları */}
        <EmployeeFormActions form={form} isEdit={true} />
      </div>

      {/* Tek Seferlik Geçici Şifre Modalı */}
      <CredentialProvisionDialog
        open={showProvisionDialog}
        data={provisionedData}
        onClose={() => {
          setShowProvisionDialog(false)
          setProvisionedData(null)
        }}
      />
    </div>
  )
}
