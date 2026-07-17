'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredBrands, deleteBrand, saveBrand } from '@/lib/storage/local-brand-store'
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
import { resolveEffectivePermissions } from '@/lib/permissions/resolve-permissions'
import { AccessDenied } from '@/components/shared/access-denied'

export function BrandListPage() {
  const router = useRouter()

  // Auth states
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // Storage data
  const [brands, setBrands] = useState<Brand[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

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

      const activeId = getActiveEmployeeId()
      const current = storedEmps.find((e) => e.id === activeId)
      if (current) {
        setActiveEmployee(current)
      }
      setIsLoadingAuth(false)

      const storedBrands = await getStoredBrands()
      setBrands(storedBrands)
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
    return effective.grantedKeys.has('brand.manage')
  }, [activeEmployee])

  // Helper to compute progress for a brand (used for sorting)
  const getBrandProgress = (b: Brand) => {
    const plan = b.operationPlan || []
    if (!plan.length) return 0
    let totalTarget = 0
    let totalCompleted = 0
    plan.forEach((item) => {
      if (item.status !== 'cancelled') {
        totalTarget += item.target
        totalCompleted += Math.min(item.target, item.completed)
      }
    })
    return totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0
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

  // Filtered and Sorted Brands
  const filteredAndSortedBrands = useMemo(() => {
    return brands
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
