'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import {
  createBrandSchema,
  defaultBrandFormValues,
  type CreateBrandFormValues,
} from '@/features/brands/schemas/create-brand-schema'
import { BRAND_PACKAGES } from '@/features/brands/data/package-seeds'
import type { OperationPlanItem, OperationPlanItemType } from '@/types/domain'
import { createAndStoreBrand } from '@/lib/storage/local-brand-store'
import { resolveOperationWorkflow } from '@/lib/workflows/resolve-operation-workflow'
import { OPERATION_TEMPLATES } from '@/features/workflows/data/operation-template-seeds'

export function useBrandForm() {
  const router = useRouter()
  const [values, setValues] = useState<CreateBrandFormValues>({
    ...defaultBrandFormValues,
    operationPlan: [], // Initialize empty, will populate in useEffect
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track if the plan was modified by the user
  const [isPlanModified, setIsPlanModified] = useState(false)

  // Package switch confirmation states
  const [showPackageConfirm, setShowPackageConfirm] = useState(false)
  const [pendingPackageId, setPendingPackageId] = useState<'eko' | 'business' | 'booster' | null>(null)

  // Helper to generate plan from package seed
  const generatePlanFromPackage = useCallback((packageId: 'eko' | 'business' | 'booster'): OperationPlanItem[] => {
    const pkg = BRAND_PACKAGES.find((p) => p.id === packageId)
    if (!pkg) return []
    return pkg.items.map((item) => {
      const template = OPERATION_TEMPLATES.find((t) => t.id === item.operationTemplateId)
      return {
        id: uuidv4(),
        title: template ? template.title : 'Bilinmeyen Kalem',
        type: (template && template.type ? template.type : 'custom') as OperationPlanItemType,
        target: item.targetCount,
        completed: 0,
        status: 'pending',
        workflowTemplateId: template ? template.workflowTemplateId : undefined,
        operationTemplateId: item.operationTemplateId,
      }
    })
  }, [])

  // Initial load
  useEffect(() => {
    setValues((prev) => ({
      ...prev,
      operationPlan: generatePlanFromPackage('eko'),
    }))
  }, [generatePlanFromPackage])

  const updateField = useCallback(
    <K extends keyof CreateBrandFormValues>(
      key: K,
      value: CreateBrandFormValues[K],
    ) => {
      setValues((prev) => ({ ...prev, [key]: value }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key as string]
        return next
      })
    },
    [],
  )

  // Toggling or changing package
  const changePackage = useCallback(
    (packageId: 'eko' | 'business' | 'booster') => {
      if (packageId === values.selectedPackageId) return

      if (isPlanModified) {
        // If modified, show confirmation modal
        setPendingPackageId(packageId)
        setShowPackageConfirm(true)
      } else {
        // If not modified, switch immediately
        setValues((prev) => ({
          ...prev,
          selectedPackageId: packageId,
          operationPlan: generatePlanFromPackage(packageId),
        }))
      }
    },
    [values.selectedPackageId, isPlanModified, generatePlanFromPackage],
  )

  const confirmPackageChange = useCallback(() => {
    if (!pendingPackageId) return
    setValues((prev) => ({
      ...prev,
      selectedPackageId: pendingPackageId,
      operationPlan: generatePlanFromPackage(pendingPackageId),
    }))
    setIsPlanModified(false)
    setShowPackageConfirm(false)
    setPendingPackageId(null)
    toast.success('Paket değiştirildi', {
      description: 'Yeni paket şablonu yüklendi.',
    })
  }, [pendingPackageId, generatePlanFromPackage])

  const cancelPackageChange = useCallback(() => {
    setShowPackageConfirm(false)
    setPendingPackageId(null)
  }, [])

  // Operation Plan Editing Methods
  const addPlanItem = useCallback((item: { title: string; type: OperationPlanItemType; target: number }) => {
    const matchedTemplate = OPERATION_TEMPLATES.find(
      (t) => t.title.toLowerCase() === item.title.trim().toLowerCase()
    )

    const newItem: OperationPlanItem = {
      id: uuidv4(),
      title: item.title.trim(),
      type: item.type,
      target: item.target,
      completed: 0,
      status: 'pending',
      workflowTemplateId: resolveOperationWorkflow({ title: item.title.trim(), type: item.type }),
      operationTemplateId: matchedTemplate?.id,
    }
    setValues((prev) => ({
      ...prev,
      operationPlan: [...prev.operationPlan, newItem],
    }))
    setIsPlanModified(true)
    toast.success('Yeni kalem eklendi', {
      description: `"${newItem.title}" operasyon planına eklendi.`,
    })
  }, [])

  const deletePlanItem = useCallback((id: string) => {
    setValues((prev) => {
      const targetItem = prev.operationPlan.find((item) => item.id === id)
      if (targetItem) {
        toast.info('Kalem silindi', {
          description: `"${targetItem.title}" plandan çıkarıldı.`,
        })
      }
      return {
        ...prev,
        operationPlan: prev.operationPlan.filter((item) => item.id !== id),
      }
    })
    setIsPlanModified(true)
  }, [])

  const updatePlanItem = useCallback((id: string, updatedFields: Partial<Omit<OperationPlanItem, 'id'>>) => {
    setValues((prev) => ({
      ...prev,
      operationPlan: prev.operationPlan.map((item) =>
        item.id === id ? { ...item, ...updatedFields } : item
      ),
    }))
    setIsPlanModified(true)
  }, [])

  const submit = useCallback(async () => {
    setIsSubmitting(true)
    setErrors({})

    const parsed = createBrandSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const path = issue.path.join('.')
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message
        }
      }
      setErrors(fieldErrors)
      setIsSubmitting(false)
      toast.error('Formda hatalı alanlar var', {
        description: 'Lütfen işaretli alanları kontrol edin.',
      })
      return
    }

    try {
      // Save to localStorage or mock backend representation
      const brandData = await createAndStoreBrand(parsed.data)

      toast.success('Marka oluşturuldu', {
        description: `"${brandData.name}" markası ve operasyon planı başarıyla oluşturuldu.`,
      })

      // Reset Form
      setValues({
        ...defaultBrandFormValues,
        operationPlan: generatePlanFromPackage('eko'),
      })
      setIsPlanModified(false)
      // Redirect to brand tracking page
      router.push(`/brands/${brandData.id}`)
    } catch (err: any) {
      console.error('Error saving brand:', err)
      toast.error('Marka oluşturulamadı', {
        description: err.message || 'Veritabanı bağlantı hatası oluştu.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [values, generatePlanFromPackage, router])

  const apiState = useMemo(
    () => ({
      values,
      errors,
      isSubmitting,
      showPackageConfirm,
      pendingPackageId,
      isPlanModified,
    }),
    [values, errors, isSubmitting, showPackageConfirm, pendingPackageId, isPlanModified]
  )

  return {
    ...apiState,
    updateField,
    changePackage,
    confirmPackageChange,
    cancelPackageChange,
    addPlanItem,
    deletePlanItem,
    updatePlanItem,
    submit,
  }
}

export type BrandFormApi = ReturnType<typeof useBrandForm>
