'use client'

import { useEffect, useState, useMemo } from 'react'
import { getStoredEmployees, getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { resolvePanelAuthority, usePrincipal } from '@/lib/permissions/panel-authority'
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

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  CredentialProvisionDialog,
  type ProvisionedCredentialData,
} from '@/features/employees/components/credential-provision-dialog'

export function EmployeeCreatePage() {
  const router = useRouter()
  const { principal, activeEmployee: contextActiveEmployee } = usePrincipal()
  const [givePanelAccess, setGivePanelAccess] = useState(false)
  const [provisionedData, setProvisionedData] = useState<ProvisionedCredentialData | null>(null)
  const [showProvisionDialog, setShowProvisionDialog] = useState(false)

  const form = useEmployeeForm(undefined, {
    onEmployeeCreated: async (newEmp: Employee) => {
      if (!givePanelAccess) {
        router.push('/employees')
        return
      }

      try {
        const res = await fetch('/api/auth-provision-credential', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId: newEmp.id }),
        })

        const data = await res.json()

        if (res.ok && data.ok) {
          setProvisionedData({
            id: data.employee.id,
            fullName: data.employee.fullName,
            identifier: data.employee.identifier,
            temporaryPassword: data.temporaryPassword,
          })
          setShowProvisionDialog(true)
        } else {
          toast.error('Çalışan oluşturuldu ancak panel erişimi verilemedi.', {
            description: data.error || 'Daha sonra çalışan düzenleme ekranından panel erişimi oluşturabilirsiniz.',
          })
          router.push('/employees')
        }
      } catch (err: any) {
        toast.error('Çalışan oluşturuldu ancak panel erişimi bağlantı hatası verdi.', {
          description: err.message || 'Daha sonra çalışan düzenleme ekranından panel erişimi oluşturabilirsiniz.',
        })
        router.push('/employees')
      }
    },
  })

  // Auth states
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [employeeCount, setEmployeeCount] = useState<number | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    async function checkAuth() {
      setIsLoadingAuth(true)
      const storedEmps = await getStoredEmployees()
      setEmployees(storedEmps)
      setEmployeeCount(storedEmps.length)
      if (contextActiveEmployee) {
        setActiveEmployee(contextActiveEmployee)
      } else {
        const activeId = getActiveEmployeeId()
        const current = storedEmps.find((e) => e.id === activeId)
        if (current) {
          setActiveEmployee(current)
        }
      }
      setIsLoadingAuth(false)
    }
    checkAuth()
  }, [contextActiveEmployee])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const qTitle = params.get('title')
      if (qTitle && !form.values.title) {
        form.updateField('title', qTitle)
      }
    }
  }, [])

  const effectiveActiveEmployee = useMemo(() => {
    if (contextActiveEmployee) return contextActiveEmployee
    if (activeEmployee) return activeEmployee
    const activeId = getActiveEmployeeId()
    return employees.find((e) => e.id === activeId) || null
  }, [contextActiveEmployee, activeEmployee, employees])

  // Resolve permission guard
  const hasPermission = useMemo(() => {
    if (employeeCount === 0) return true
    return resolvePanelAuthority(principal, effectiveActiveEmployee, [
      'employees.create',
      'employees.manage',
      'system.admin',
      'team.manage',
    ])
  }, [principal, effectiveActiveEmployee, employeeCount])

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
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Social Art Base</p>
        <h1 className="text-3xl font-semibold tracking-tight">Yeni Çalışan Ekle</h1>
        <p className="text-muted-foreground text-sm">
          Çalışanın temel bilgilerini girin, rol paketini seçin ve yetkilerini özelleştirin.
        </p>
      </header>

      <div className="space-y-6">
        {/* Panel Giriş Erişimi Seçeneği */}
        <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-foreground">Panel Erişimi Ver</Label>
              <p className="text-xs text-muted-foreground">
                Açıldığında sunucu tarafında tek kullanımlık geçici bir giriş şifresi üretilir.
              </p>
            </div>
          </div>
          <Switch
            checked={givePanelAccess}
            onCheckedChange={setGivePanelAccess}
          />
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
        <EmployeeFormActions form={form} />
      </div>

      {/* Tek Seferlik Geçici Şifre Modalı */}
      <CredentialProvisionDialog
        open={showProvisionDialog}
        data={provisionedData}
        onClose={() => {
          setShowProvisionDialog(false)
          setProvisionedData(null)
          router.push('/employees')
        }}
      />
    </div>
  )
}
