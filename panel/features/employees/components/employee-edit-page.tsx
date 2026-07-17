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

interface EmployeeEditPageProps {
  id: string
}

export function EmployeeEditPage({ id }: EmployeeEditPageProps) {
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null)
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(true)

  // Auth states
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  const form = useEmployeeForm(employeeToEdit || undefined)

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
      }
      setIsLoadingEmployee(false)
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
    return effective.grantedKeys.has('team.manage')
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
    </div>
  )
}
