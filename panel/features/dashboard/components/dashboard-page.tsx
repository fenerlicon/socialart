'use client'

import { useState, useEffect, useMemo } from 'react'
import { DashboardShell } from './dashboard-shell'
import { OperationDashboard } from './operation-dashboard'
import { EmployeeDashboard } from './employee-dashboard'
import { getStoredEmployees, getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { usePrincipal } from '@/lib/permissions/panel-authority'
import type { Employee } from '@/types/domain'
import { AlertCircle } from 'lucide-react'

export function DashboardPage() {
  const { principal, activeEmployee: contextActiveEmployee, isLoadingAuth } = usePrincipal()
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    async function loadData() {
      const list = await getStoredEmployees()
      setEmployees(list)
    }
    loadData()
  }, [])

  const currentEmployee = useMemo(() => {
    if (contextActiveEmployee) return contextActiveEmployee
    const activeId = getActiveEmployeeId()
    return employees.find((e) => e.id === activeId) || employees[0] || null
  }, [contextActiveEmployee, employees])

  // Role-Based Routing
  const renderDashboard = () => {
    if (principal.isDedicatedAdmin) {
      return <OperationDashboard />
    }

    if (!currentEmployee) {
      if (isLoadingAuth) {
        return (
          <div className="flex items-center gap-3 p-4 rounded-xl border bg-neutral-900/40 text-neutral-400 text-xs font-semibold">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
            <span>Çalışma alanı yükleniyor...</span>
          </div>
        )
      }
      return (
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-amber-500/10 text-amber-500 text-xs font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Lütfen işlem yapmak için aktif bir çalışan profili seçin.</span>
        </div>
      )
    }

    if (currentEmployee.rolePackageId === 'operasyon-yonetimi') {
      return <OperationDashboard />
    }

    // Default to personalized employee dashboard for any other role
    return <EmployeeDashboard employee={currentEmployee} />
  }

  const isOps = principal.isDedicatedAdmin || currentEmployee?.rolePackageId === 'operasyon-yonetimi'

  return (
    <DashboardShell
      title={isOps ? 'Operasyon Paneli' : 'Çalışma Alanım'}
      description={
        isOps
          ? 'Ajans operasyonunun genel durumunu tek ekrandan takip edin.'
          : 'Kişisel iş akışı ve görev takip kontrol merkeziniz.'
      }
    >
      {renderDashboard()}
    </DashboardShell>
  )
}
