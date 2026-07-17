'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredBrands } from '@/lib/storage/local-brand-store'
import { getStoredEmployees } from '@/lib/storage/local-employee-store'
import { getStoredWorkflowInstances, getWorkflowStepInstances } from '@/lib/storage/local-workflow-instance-store'
import type { Brand, Employee, WorkflowInstance, WorkflowStepInstance } from '@/types/domain'
import { StatCard } from './stat-card'
import { ProgressCard } from './progress-card'
import { BrandProgressList } from './brand-progress-list'
import { EmployeeWorkloadList } from './employee-workload-list'
import { RecentItemsCard } from './recent-items-card'
import { QuickActionsCard } from './quick-actions-card'
import { Button } from '@/components/ui/button'
import {
  Folder,
  Users,
  Activity,
  UserCheck,
  Calendar,
  Layers,
  Plus,
} from 'lucide-react'

export function OperationDashboard() {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [instances, setInstances] = useState<WorkflowInstance[]>([])
  const [steps, setSteps] = useState<WorkflowStepInstance[]>([])

  useEffect(() => {
    async function loadData() {
      const storedBrands = await getStoredBrands()
      setBrands(storedBrands)
      const storedEmps = await getStoredEmployees()
      setEmployees(storedEmps)
      const storedInstances = await getStoredWorkflowInstances()
      setInstances(storedInstances)
      const storedSteps = await getWorkflowStepInstances()
      setSteps(storedSteps)
    }
    loadData()
  }, [])

  const isEmpty = brands.length === 0 && employees.length === 0

  // Stat metrics
  const stats = useMemo(() => {
    const totalBrands = brands.length
    const activeBrands = brands.filter((b) => b.status === 'active').length

    const totalEmployees = employees.length
    const activeEmployees = employees.filter((e) => e.employeeStatus === 'active').length

    // Operations progress - based on actual workflow steps
    const activeInstances = instances.filter(i => i.status !== 'cancelled')
    const activeInstanceIds = new Set(activeInstances.map(i => i.id))
    const relevantSteps = steps.filter(s => activeInstanceIds.has(s.workflowInstanceId))
    
    const totalTarget = relevantSteps.length
    const totalCompleted = relevantSteps.filter(s => s.status === 'completed' || s.status === 'skipped').length

    return {
      totalBrands,
      activeBrands,
      totalEmployees,
      activeEmployees,
      totalTarget,
      totalCompleted,
    }
  }, [brands, employees, instances, steps])

  // Get current date string in Turkish format
  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [])

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20 text-center rounded-2xl border border-dashed border-neutral-800 bg-card/25 backdrop-blur-md animate-in fade-in duration-300 max-w-xl mx-auto space-y-6">
        <div className="p-4 bg-blue-600/10 text-blue-500 rounded-full shrink-0">
          <Layers className="h-10 w-10 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">
            Henüz Operasyon Verisi Yok
          </h3>
          <p className="text-xs text-muted-foreground leading-normal max-w-sm">
            İlk çalışanınızı ve ilk markanızı oluşturarak ajans operasyon panelini aktif hale getirin.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => router.push('/employees/new')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-10 px-5 flex items-center gap-1.5 shadow"
          >
            <Plus className="h-4 w-4" /> Yeni Çalışan Ekle
          </Button>
          <Button
            onClick={() => router.push('/brands/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 px-5 flex items-center gap-1.5 shadow"
          >
            <Plus className="h-4 w-4" /> Yeni Marka Ekle
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bugünün Tarihi Banner */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/10 border p-3 rounded-xl max-w-max">
        <Calendar className="h-4 w-4 text-blue-500" />
        <span>Bugün: <strong>{todayStr}</strong></span>
      </div>

      {/* İstatistik Metrik Kartları */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Marka"
          value={stats.totalBrands}
          icon={Folder}
          iconColorClass="text-blue-500"
          description="Sistemdeki tüm kayıtlı markalar"
          onClick={() => router.push('/brands')}
        />
        <StatCard
          title="Aktif Markalar"
          value={stats.activeBrands}
          icon={Activity}
          iconColorClass="text-emerald-500"
          description="Aktif olarak yönetilen markalar"
          onClick={() => router.push('/brands')}
        />
        <StatCard
          title="Toplam Çalışan"
          value={stats.totalEmployees}
          icon={Users}
          iconColorClass="text-purple-500"
          description="Sistemdeki tüm kayıtlı çalışanlar"
          onClick={() => router.push('/employees')}
        />
        <StatCard
          title="Aktif Çalışanlar"
          value={stats.activeEmployees}
          icon={UserCheck}
          iconColorClass="text-teal-500"
          description="Ekiplerde görev almaya hazır çalışanlar"
          onClick={() => router.push('/employees')}
        />
      </div>

      {/* İlerleme ve Hızlı Erişim */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <ProgressCard
            totalTarget={stats.totalTarget}
            totalCompleted={stats.totalCompleted}
          />
        </div>
        <div className="md:col-span-2 flex flex-col justify-between">
          <QuickActionsCard />
          <div className="bg-muted/5 border rounded-2xl p-4 text-[11px] text-muted-foreground leading-normal mt-4 md:mt-0">
            <strong>Operasyon Yönetimi İpucu:</strong> Her pazartesi gün başlangıcında markaların operasyon kalemi durumlarını, gerçekleşen adetlerini ve ekip dağılımlarını takip sayfalarından güncellemeyi unutmayın.
          </div>
        </div>
      </div>

      {/* İlerleme Sıralamaları */}
      <BrandProgressList brands={brands} employees={employees} />

      {/* İş Yükü ve Rol Dağılımları */}
      <EmployeeWorkloadList employees={employees} brands={brands} />

      {/* Son Eklenen Marka ve Çalışanlar */}
      <RecentItemsCard brands={brands} employees={employees} />
    </div>
  )
}
