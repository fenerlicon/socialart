'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredBrands, deleteBrand, saveBrand } from '@/lib/storage/local-brand-store'
import { getStoredWorkflowInstances, getStoredWorkflowSteps } from '@/lib/storage/local-workflow-instance-store'
import type { WorkflowInstance, WorkflowStepInstance } from '@/types/domain'
import { getStoredEmployees } from '@/lib/storage/local-employee-store'
import type { Brand, Employee } from '@/types/domain'
import { BrandCard } from './brand-card'
import { BrandFilters } from './brand-filters'
import { BrandEmptyState } from './brand-empty-state'
import { BrandDeleteDialog } from './brand-delete-dialog'
import { BrandEditDialog } from './brand-edit-dialog'
import { Button } from '@/components/ui/button'
import { Plus, Users } from 'lucide-react'
import { toast } from 'sonner'

import { getActiveEmployeeId } from '@/lib/storage/local-employee-store'
import { resolvePanelAuthority, usePrincipal, resolveVisibleBrands } from '@/lib/permissions/panel-authority'
import { AccessDenied } from '@/components/shared/access-denied'

export function BrandListPage() {
  const router = useRouter()
  const { principal, activeEmployee: contextActiveEmployee } = usePrincipal()

  // Auth states
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // Storage data
  const [brands, setBrands] = useState<Brand[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([])
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStepInstance[]>([])

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [packageFilter, setPackageFilter] = useState('all')
  const [managerFilter, setManagerFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Deletion Dialog State
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')

  // Editing Dialog State
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoadingAuth(true)
      const storedEmps = await getStoredEmployees()
      setEmployees(storedEmps)

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

      const storedBrands = await getStoredBrands()
      setBrands(storedBrands)
      const storedWorkflows = await getStoredWorkflowInstances()
      setWorkflows(storedWorkflows)
      const storedSteps = await getStoredWorkflowSteps()
      setWorkflowSteps(storedSteps)
    }
    loadData()
  }, [contextActiveEmployee])

  const effectiveActiveEmployee = useMemo(() => {
    if (contextActiveEmployee) return contextActiveEmployee
    if (activeEmployee) return activeEmployee
    const activeId = getActiveEmployeeId()
    return employees.find((e) => e.id === activeId) || null
  }, [contextActiveEmployee, activeEmployee, employees])

  // Resolve permission guard
  const hasPermission = useMemo(() => {
    return resolvePanelAuthority(principal, effectiveActiveEmployee, 'brand.manage')
  }, [principal, effectiveActiveEmployee])

  // Helper to compute live progress for a brand from workflow steps and operation plan
  const getBrandProgress = (b: Brand) => {
    let wfProgress = 0;
    const brandWfs = workflows.filter(w => w.brandId === b.id && w.status !== 'cancelled');
    if (brandWfs && brandWfs.length > 0) {
      let totalPoints = 0;
      let completedPoints = 0;

      brandWfs.forEach(w => {
        const wSteps = workflowSteps.filter(s => s.workflowInstanceId === w.id);
        if (w.targetCount && w.targetCount > 1) {
          totalPoints += w.targetCount;
          completedPoints += Math.min(w.targetCount, (w.progressCount || (w.status === 'completed' ? w.targetCount : 0)));
        } else if (wSteps.length > 0) {
          totalPoints += wSteps.length;
          completedPoints += wSteps.filter(s => s.status === 'completed' || s.status === 'skipped').length;
        } else {
          totalPoints += 1;
          if (w.status === 'completed') completedPoints += 1;
        }
      });

      if (totalPoints > 0) {
        wfProgress = Math.round((completedPoints / totalPoints) * 100);
      }
    }

    let planProgress = 0;
    const plan = b.operationPlan || [];
    if (plan.length > 0) {
      let totalTarget = 0;
      let totalCompleted = 0;
      plan.forEach((item) => {
        if (item.status !== 'cancelled') {
          totalTarget += item.target;
          totalCompleted += Math.min(item.target, item.completed);
        }
      });
      if (totalTarget > 0) {
        planProgress = Math.round((totalCompleted / totalTarget) * 100);
      }
    }

    return Math.max(wfProgress, planProgress);
  }

  // Handle deletion confirmation
  const handleConfirmDelete = async () => {
    if (!deleteId) return
    const updated = await deleteBrand(deleteId)
    setBrands(updated)
    toast.success('Marka silindi', {
      description: `"${deleteName}" markası sistemden kalıcı olarak silindi.`,
    })
    setDeleteId(null)
    setDeleteName('')
  }

  // Handle editing confirmation
  const handleConfirmEdit = async (updatedBrand: Brand) => {
    try {
      const updatedBrands = await saveBrand(updatedBrand)
      setBrands(updatedBrands)
      toast.success('Marka güncellendi', {
        description: `"${updatedBrand.name}" markası başarıyla güncellendi.`,
      })
      setIsEditOpen(false)
      setEditingBrand(null)
    } catch (err: any) {
      toast.error('Marka güncellenirken hata oluştu: ' + err.message)
    }
  }

  // Visible Brands based on canonical scope
  const visibleBrands = useMemo(() => {
    return resolveVisibleBrands(principal, effectiveActiveEmployee, brands, workflows)
  }, [principal, effectiveActiveEmployee, brands, workflows])

  // Filtered and Sorted Brands
  const filteredAndSortedBrands = useMemo(() => {
    return visibleBrands
      .filter((b) => {
        // Name Search
        const nameMatch = b.name.toLowerCase().includes(searchQuery.toLowerCase())

        // Status Match
        const statusMatch = statusFilter === 'all' ? true : b.status === statusFilter

        // Package Match
        const packageMatch = packageFilter === 'all' ? true : b.selectedPackageId === packageFilter

        // Manager Match
        const managerMatch = managerFilter === 'all' ? true : b.operationManagerId === managerFilter

        return nameMatch && statusMatch && packageMatch && managerMatch
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        }
        if (sortBy === 'alphabetical') {
          return a.name.localeCompare(b.name)
        }
        if (sortBy === 'progress-high') {
          return getBrandProgress(b) - getBrandProgress(a)
        }
        if (sortBy === 'progress-low') {
          return getBrandProgress(a) - getBrandProgress(b)
        }
        return 0
      })
  }, [brands, searchQuery, statusFilter, packageFilter, managerFilter, sortBy])

  // Get employee name helper
  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id)
    return emp ? emp.fullName : 'Atanmamış'
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPackageFilter('all')
    setManagerFilter('all')
    setSortBy('newest')
  }

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
            Markalar
          </h1>
          <p className="text-muted-foreground text-sm">
            Ajans bünyesinde aktif olarak yönetilen tüm markaları görüntüleyin ve yönetin.
          </p>
        </div>
        <Button
          onClick={() => router.push('/brands/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 px-5 flex items-center gap-1.5 shadow self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Yeni Marka
        </Button>
      </div>

      {brands.length > 0 ? (
        <>
          {/* Üst Filtreler */}
          <BrandFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            packageFilter={packageFilter}
            setPackageFilter={setPackageFilter}
            managerFilter={managerFilter}
            setManagerFilter={setManagerFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            employees={employees}
          />

          {/* Kart Listesi */}
          {filteredAndSortedBrands.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedBrands.map((brand) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  managerName={getEmployeeName(brand.operationManagerId)}
                  progressPercentage={getBrandProgress(brand)}
                  onEdit={() => {
                    setEditingBrand(brand)
                    setIsEditOpen(true)
                  }}
                  onDelete={() => {
                    setDeleteId(brand.id)
                    setDeleteName(brand.name)
                  }}
                />
              ))}
            </div>
          ) : (
            <BrandEmptyState mode="no-results" onResetFilters={handleResetFilters} />
          )}
        </>
      ) : (
        <BrandEmptyState mode="empty" />
      )}

      {/* Silme Onay Modalı */}
      <BrandDeleteDialog
        isOpen={deleteId !== null}
        brandName={deleteName}
        onClose={() => {
          setDeleteId(null)
          setDeleteName('')
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Düzenleme Modalı */}
      <BrandEditDialog
        isOpen={isEditOpen}
        brand={editingBrand}
        employees={employees}
        onClose={() => {
          setIsEditOpen(false)
          setEditingBrand(null)
        }}
        onConfirm={handleConfirmEdit}
      />
    </div>
  )
}
