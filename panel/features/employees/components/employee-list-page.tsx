'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredEmployees, getActiveEmployeeId, deleteEmployee, updateEmployee } from '@/lib/storage/local-employee-store'
import { getStoredBrands } from '@/lib/storage/local-brand-store'
import { resolveEffectivePermissions } from '@/lib/permissions/resolve-permissions'
import { AccessDenied } from '@/components/shared/access-denied'
import type { Employee, Brand } from '@/types/domain'
import { EmployeeCard } from './employee-card'
import { EmployeeFilters } from './employee-filters'
import { EmployeeEmptyState } from './employee-empty-state'
import { EmployeeDeleteDialog } from './employee-delete-dialog'
import { EmployeeOrgChart } from './employee-org-chart'
import { Button } from '@/components/ui/button'
import { Plus, Grid, GitBranch } from 'lucide-react'
import { toast } from 'sonner'

export function EmployeeListPage() {
  const router = useRouter()

  // Auth states
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // Storage states
  const [employees, setEmployees] = useState<Employee[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [packageFilter, setPackageFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'list' | 'org'>('org')

  // Delete dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteEmp, setDeleteEmp] = useState<Employee | null>(null)
  const [assignedBrandsCount, setAssignedBrandsCount] = useState(0)

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoadingAuth(true)
      const storedEmps = await getStoredEmployees()
      
      const activeId = getActiveEmployeeId()
      const current = storedEmps.find((e) => e.id === activeId)
      if (current) {
        setActiveEmployee(current)
      }
      setIsLoadingAuth(false)

      const storedBrands = await getStoredBrands()
      setBrands(storedBrands)
      setEmployees(storedEmps)
    }
    loadData()
  }, [])

  // Resolve permission guard
  const hasPermission = useMemo(() => {
    if (!activeEmployee) return false
    const effective = resolveEffectivePermissions({
      rolePackageId: activeEmployee.rolePackageId,
      teamIds: activeEmployee.teamIds,
      permissionOverrides: activeEmployee.permissionOverrides || {},
    })
    return effective.grantedKeys.has('team.manage') || effective.grantedKeys.has('task.manage')
  }, [activeEmployee])

  // Central Operations or full admin
  const isManagerExposed = useMemo(() => {
    if (!activeEmployee) return false
    return activeEmployee.teamIds.includes('merkezi-operasyon') || activeEmployee.rolePackageId === 'operasyon-yonetimi'
  }, [activeEmployee])

  // Filter employees list by team overlap
  const manageableEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (isManagerExposed) return true
      if (!activeEmployee) return false
      // Self is always visible
      if (emp.id === activeEmployee.id) return true
      // Overlap of teamIds
      return emp.teamIds.some(tId => activeEmployee.teamIds.includes(tId))
    })
  }, [employees, isManagerExposed, activeEmployee])

  // Helper to count brand assignments for an employee ID
  const getBrandAssignmentCount = (empId: string) => {
    let count = 0
    brands.forEach((brand) => {
      if (brand.brandAssignments) {
        brand.brandAssignments.forEach((assignment) => {
          if (assignment.employeeId === empId) {
            count++
          }
        })
      }
    })
    return count
  }

  // Deactivate handler (Pasife Al)
  const handleDeactivate = async (empId: string) => {
    const updated = await updateEmployee(empId, { employeeStatus: 'inactive' })
    if (updated) {
      const storedEmps = await getStoredEmployees()
      setEmployees(storedEmps)
      toast.success('Çalışan pasife alındı', {
        description: `"${updated.fullName}" durumu başarıyla Pasif olarak güncellendi.`,
      })
    } else {
      toast.error('Çalışan güncellenemedi')
    }
  }

  // Delete Click handler
  const handleDeleteClick = (emp: Employee) => {
    const count = getBrandAssignmentCount(emp.id)
    setDeleteEmp(emp)
    setAssignedBrandsCount(count)
    setShowDeleteDialog(true)
  }

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deleteEmp) return
    const updated = await deleteEmployee(deleteEmp.id)
    setEmployees(updated)
    toast.success('Çalışan silindi', {
      description: `"${deleteEmp.fullName}" sistemden başarıyla kaldırıldı.`,
    })
    setShowDeleteDialog(false)
    setDeleteEmp(null)
  }

  // Reset filters handler
  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setLocationFilter('all')
    setPackageFilter('all')
    setSortBy('newest')
  }

  // Filtered and Sorted Employees
  const filteredAndSortedEmployees = useMemo(() => {
    return manageableEmployees
      .filter((emp) => {
        // Name & Email Search
        const nameMatch = emp.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        const emailMatch = emp.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesQuery = nameMatch || emailMatch

        // Status Match
        const statusMatch = statusFilter === 'all' ? true : emp.employeeStatus === statusFilter

        // Location Match
        const locationMatch = locationFilter === 'all' ? true : emp.workLocationStatus === locationFilter

        // Package Match
        const packageMatch = packageFilter === 'all' ? true : emp.rolePackageId === packageFilter

        return matchesQuery && statusMatch && locationMatch && packageMatch
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        }
        if (sortBy === 'alphabetical') {
          return a.fullName.localeCompare(b.fullName)
        }
        if (sortBy === 'alphabetical-desc') {
          return b.fullName.localeCompare(a.fullName)
        }
        return 0
      })
  }, [manageableEmployees, searchQuery, statusFilter, locationFilter, packageFilter, sortBy])

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
      {/* Sayfa Başlığı */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800/40 pb-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Social Art Base</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Çalışanlar
          </h1>
          <p className="text-muted-foreground text-sm">
            Ajans bünyesindeki çalışanları, rollerini, durumlarını ve sorumluluklarını görüntüleyin.
          </p>
        </div>
        <Button
          onClick={() => router.push('/employees/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 px-5 flex items-center gap-1.5 shadow self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Yeni Çalışan
        </Button>
      </div>

      {/* Görünüm Sekmeleri */}
      <div className="flex border-b border-neutral-900 gap-1.5 pb-px overflow-x-auto">
        <button
          onClick={() => setViewMode('list')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            viewMode === 'list'
              ? 'border-blue-500 text-blue-450'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Grid className="h-4 w-4" />
          Liste Görünümü
        </button>
        <button
          onClick={() => setViewMode('org')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
            viewMode === 'org'
              ? 'border-blue-500 text-blue-450'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <GitBranch className="h-4 w-4" />
          Organizasyon Şeması
        </button>
      </div>

      {viewMode === 'org' ? (
        <EmployeeOrgChart employees={employees} />
      ) : manageableEmployees.length > 0 ? (
        <>
          {/* Üst Filtreler */}
          <EmployeeFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            packageFilter={packageFilter}
            setPackageFilter={setPackageFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {/* Kart Listesi */}
          {filteredAndSortedEmployees.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedEmployees.map((emp) => (
                <EmployeeCard
                  key={emp.id}
                  employee={emp}
                  brandAssignmentCount={getBrandAssignmentCount(emp.id)}
                  onDeactivate={() => handleDeactivate(emp.id)}
                  onDelete={() => handleDeleteClick(emp)}
                />
              ))}
            </div>
          ) : (
            <EmployeeEmptyState mode="no-results" onResetFilters={handleResetFilters} />
          )}
        </>
      ) : (
        <EmployeeEmptyState mode="empty" />
      )}

      {/* Silme Onay/Engel Modalı */}
      <EmployeeDeleteDialog
        isOpen={showDeleteDialog}
        employeeName={deleteEmp?.fullName || ''}
        isAssignedToBrands={assignedBrandsCount > 0}
        assignedBrandsCount={assignedBrandsCount}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeleteEmp(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
