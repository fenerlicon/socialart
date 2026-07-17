'use client'

import { useState, useEffect, useMemo } from 'react'
import { DashboardShell } from './dashboard-shell'
import { OperationDashboard } from './operation-dashboard'
import { EmployeeDashboard } from './employee-dashboard'
import { getStoredEmployees, getActiveEmployeeId, setActiveEmployeeId } from '@/lib/storage/local-employee-store'
import type { Employee } from '@/types/domain'
import { User, AlertCircle } from 'lucide-react'

export function DashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('')

  useEffect(() => {
    async function loadData() {
      const list = await getStoredEmployees()
      setEmployees(list)

      const savedId = getActiveEmployeeId()
      if (savedId && list.some((e) => e.id === savedId)) {
        setCurrentEmployeeId(savedId)
      } else if (list.length > 0) {
        setCurrentEmployeeId(list[0].id)
        setActiveEmployeeId(list[0].id)
      }
    }
    loadData()
  }, [])

  const currentEmployee = useMemo(() => {
    return employees.find((e) => e.id === currentEmployeeId)
  }, [employees, currentEmployeeId])


  // Role-Based Routing
  const renderDashboard = () => {
    if (!currentEmployee) {
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

  return (
    <DashboardShell
      title={currentEmployee?.rolePackageId === 'operasyon-yonetimi' ? 'Operasyon Paneli' : 'Çalışma Alanım'}
      description={
        currentEmployee?.rolePackageId === 'operasyon-yonetimi'
          ? 'Ajans operasyonunun genel durumunu tek ekrandan takip edin.'
          : 'Kişisel iş akışı ve görev takip kontrol merkeziniz.'
      }
    >
      {renderDashboard()}
    </DashboardShell>
  )
}
