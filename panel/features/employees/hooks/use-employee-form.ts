import { useCallback, useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  createEmployeeSchema,
  defaultEmployeeFormValues,
  type CreateEmployeeFormValues,
} from '@/features/employees/schemas/create-employee-schema'
import {
  createAndStoreEmployee,
  mapFormToCreateInput,
  updateEmployee,
} from '@/lib/storage/local-employee-store'
import { type PermissionKey, PERMISSIONS } from '@/config/permissions'
import type { RolePackageId, TeamId, Employee } from '@/types/domain'
import { buildDefaultPermissionSet } from '@/lib/permissions/resolve-permissions'

export function useEmployeeForm(
  initialEmployee?: Employee,
  options?: { onEmployeeCreated?: (employee: Employee) => Promise<void> | void }
) {
  const router = useRouter()
  const [values, setValues] = useState<CreateEmployeeFormValues>(
    defaultEmployeeFormValues,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialEmployee) {
      setValues({
        fullName: initialEmployee.fullName,
        email: initialEmployee.email,
        username: initialEmployee.username || '',
        title: initialEmployee.title,
        avatarUrl: initialEmployee.avatarUrl || '',
        employeeStatus: initialEmployee.employeeStatus,
        workLocationStatus: initialEmployee.workLocationStatus,
        rolePackageId: initialEmployee.rolePackageId,
        teamIds: initialEmployee.teamIds,
        permissionOverrides: initialEmployee.permissionOverrides || {},
        hasAdvancedCalendarAccess: initialEmployee.hasAdvancedCalendarAccess || false,
      })
    }
  }, [initialEmployee])

  const updateField = useCallback(
    <K extends keyof CreateEmployeeFormValues>(
      key: K,
      value: CreateEmployeeFormValues[K],
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

  const toggleTeam = useCallback((teamId: TeamId) => {
    setValues((prev) => {
      const exists = prev.teamIds.includes(teamId)
      const teamIds = exists
        ? prev.teamIds.filter((id) => id !== teamId)
        : [...prev.teamIds, teamId]

      return { ...prev, teamIds }
    })
  }, [])

  const togglePermission = useCallback(
    (key: PermissionKey, nextGranted: boolean) => {
      setValues((prev) => {
        const defaults = buildDefaultPermissionSet({
          rolePackageId: prev.rolePackageId as RolePackageId,
          teamIds: prev.teamIds as TeamId[],
        })

        const overrides = { ...prev.permissionOverrides }

        const applyOverride = (k: PermissionKey, val: boolean) => {
          const defVal = defaults.has(k)
          if (val === defVal) {
            delete overrides[k]
          } else {
            overrides[k] = val
          }
        }

        // Apply primary toggle
        applyOverride(key, nextGranted)

        // Cascading Logic: module.action format
        const parts = key.split('.')
        if (parts.length === 2) {
          const [moduleName, action] = parts
          if (nextGranted) {
            // Enabling a manage/edit permission auto-enables view
            if (action !== 'view') {
              const viewKey = `${moduleName}.view` as PermissionKey
              if (Object.keys(PERMISSIONS).includes(viewKey)) {
                applyOverride(viewKey, true)
              }
            }
          } else {
            // Disabling view permission auto-disables all other actions in the same module
            if (action === 'view') {
              const siblingKeys = (Object.keys(PERMISSIONS) as PermissionKey[]).filter(
                (k) => k.startsWith(`${moduleName}.`) && k !== key
              )
              siblingKeys.forEach((siblingKey) => {
                applyOverride(siblingKey, false)
              })
            }
          }
        }

        return {
          ...prev,
          permissionOverrides: overrides,
        }
      })
    },
    [],
  )

  const resetOverrides = useCallback(() => {
    setValues((prev) => ({ ...prev, permissionOverrides: {} }))
  }, [])

  const submit = useCallback(async () => {
    setIsSubmitting(true)
    setErrors({})

    const parsed = createEmployeeSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      const fieldErrorDescriptions: string[] = []
      for (const issue of parsed.error.issues) {
        const path = issue.path.join('.')
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message
          fieldErrorDescriptions.push(`${issue.message}`)
        }
      }
      setErrors(fieldErrors)
      setIsSubmitting(false)
      toast.error('Formda hatalı alanlar var', {
        description: fieldErrorDescriptions.join(' • ') || 'Lütfen işaretli alanları kontrol edin.',
      })
      return
    }

    try {
      const input = mapFormToCreateInput(parsed.data)

      let updatedEmployee: Employee | null = null
      let createdEmployee: Employee | null = null

      if (initialEmployee) {
        // Target DB1 identifier: prefer canonical db1EmployeeId if present, else employee id
        const targetId = initialEmployee.db1EmployeeId || initialEmployee.id
        updatedEmployee = await updateEmployee(targetId, input)
        
        if (!updatedEmployee) {
          throw new Error('CANONICAL_WRITE_FAILED: Çalışan güncellenemedi veya sunucudan yanıt alınamadı.')
        }

        // STRICT READBACK VERIFICATION
        if (updatedEmployee.fullName !== values.fullName.trim()) {
          throw new Error(`READBACK_MISMATCH: Kaydedilen isim ("${updatedEmployee.fullName}") ile talep edilen ("${values.fullName}") uyuşmuyor.`)
        }
        if (updatedEmployee.title !== values.title.trim()) {
          throw new Error(`READBACK_MISMATCH: Kaydedilen unvan ("${updatedEmployee.title}") ile talep edilen ("${values.title}") uyuşmuyor.`)
        }

        toast.success('Çalışan güncellendi', {
          description: `"${updatedEmployee.fullName}" başarıyla güncellendi.`,
        })

        router.push('/employees')
      } else {
        createdEmployee = await createAndStoreEmployee(input)
        setValues(defaultEmployeeFormValues)

        toast.success('Çalışan kaydedildi', {
          description: `${createdEmployee?.fullName || values.fullName} başarıyla oluşturuldu.`,
        })

        if (options?.onEmployeeCreated && createdEmployee) {
          await options.onEmployeeCreated(createdEmployee)
        } else {
          router.push('/employees')
        }
      }
    } catch (err: any) {
      console.error('Error saving employee:', err)
      toast.error('Çalışan kaydedilemedi', {
        description: err.message || 'Veritabanı bağlantı hatası oluştu.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [values, router, initialEmployee, options])

  const formState = useMemo(
    () => ({
      values,
      errors,
      isSubmitting,
    }),
    [values, errors, isSubmitting],
  )

  return {
    ...formState,
    updateField,
    toggleTeam,
    togglePermission,
    resetOverrides,
    submit,
  }
}

export type EmployeeFormApi = ReturnType<typeof useEmployeeForm>
