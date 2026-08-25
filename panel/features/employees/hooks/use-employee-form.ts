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
import { setPermissionOverride } from '@/lib/permissions/permission-form-utils'
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

      let targetEmployeeId: string | null = null

      if (initialEmployee) {
        targetEmployeeId = initialEmployee.id
        const updated = await updateEmployee(initialEmployee.id, input)
        console.log('Güncellenen çalışan:', updated)

        toast.success('Çalışan güncellendi', {
          description: `"${updated?.fullName || values.fullName}" başarıyla güncellendi.`,
        })
      } else {
        const employee = await createAndStoreEmployee(input)
        targetEmployeeId = employee.id
        console.log('Kaydedilen çalışan:', employee)

        toast.success('Çalışan kaydedildi', {
          description: `${employee.fullName} başarıyla oluşturuldu.`,
        })
        setValues(defaultEmployeeFormValues)
      }

      // Orchestrate protected server updates for authorization-sensitive fields:
      if (targetEmployeeId) {
        // 1. Role Package Update
        const initialRole = initialEmployee?.rolePackageId || null
        const newRole = values.rolePackageId || null
        if (newRole && newRole !== initialRole) {
          try {
            const roleRes = await fetch('/api/auth-update-employee-role', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ employeeId: targetEmployeeId, rolePackageId: newRole }),
            })
            if (!roleRes.ok) {
              const rData = await roleRes.json().catch(() => ({}))
              toast.error('Rol paketi sunucuda güncellenemedi', {
                description: rData.error || 'Rol güncellemesi için yönetici yetkisi gereklidir.',
              })
            }
          } catch (e: any) {
            toast.error('Rol paketi sunucu bağlantı hatası', { description: e.message })
          }
        }

        // 2. Identity & Status & Auth-Metadata Update (email, username, employeeStatus, teamIds, hasAdvancedCalendarAccess)
        const initialEmail = (initialEmployee?.email || '').trim().toLowerCase()
        const newEmail = (values.email || '').trim().toLowerCase()
        const initialUsername = (initialEmployee?.username || '').trim().toLowerCase()
        const newUsername = (values.username || '').trim().toLowerCase()
        const initialStatus = initialEmployee?.employeeStatus || 'active'
        const newStatus = values.employeeStatus || 'active'
        const initialTeams = JSON.stringify(initialEmployee?.teamIds || [])
        const newTeams = JSON.stringify(values.teamIds || [])
        const initialCalendar = Boolean(initialEmployee?.hasAdvancedCalendarAccess)
        const newCalendar = Boolean(values.hasAdvancedCalendarAccess)

        const identityChanged =
          !initialEmployee ||
          (newEmail && newEmail !== initialEmail) ||
          (newUsername && newUsername !== initialUsername) ||
          newStatus !== initialStatus ||
          newTeams !== initialTeams ||
          newCalendar !== initialCalendar

        if (identityChanged) {
          try {
            const payload: any = {
              employeeId: targetEmployeeId,
              employeeStatus: newStatus,
              teamIds: values.teamIds,
              hasAdvancedCalendarAccess: newCalendar,
            }
            if (newEmail) payload.email = newEmail
            if (newUsername) payload.username = newUsername

            const idRes = await fetch('/api/auth-update-employee-identity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (!idRes.ok) {
              const idData = await idRes.json().catch(() => ({}))
              toast.error('Kimlik/yetki bilgileri sunucuda güncellenemedi', {
                description: idData.error || 'Kimlik güncellemesi için yetki gereklidir.',
              })
            }
          } catch (e: any) {
            toast.error('Kimlik güncellemesi sunucu bağlantı hatası', { description: e.message })
          }
        }

        // 3. Sensitive Permission Overrides Update
        const sensitiveKeys = [
          'team.manage',
          'employees.manage',
          'employees.create',
          'system.permissions',
          'system.admin',
          'settings.manage',
          'system.settings',
        ]

        for (const key of sensitiveKeys) {
          const initialVal = initialEmployee?.permissionOverrides?.[key] === true
          const newVal = values.permissionOverrides?.[key] === true
          const keySpecified = Object.prototype.hasOwnProperty.call(values.permissionOverrides || {}, key)

          if (keySpecified && newVal !== initialVal) {
            try {
              const permRes = await fetch('/api/auth-update-permission-override', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId: targetEmployeeId, permissionKey: key, grant: newVal }),
              })
              if (!permRes.ok) {
                const pData = await permRes.json().catch(() => ({}))
                toast.error(`"${key}" yetkisi sunucuda güncellenemedi`, {
                  description: pData.error || 'Yetki delegasyonu için system.permissions/admin yetkisi gereklidir.',
                })
              }
            } catch (e: any) {
              toast.error(`"${key}" sunucu bağlantı hatası`, { description: e.message })
            }
          }
        }
      }

      if (initialEmployee) {
        router.push('/employees')
      } else {
        if (options?.onEmployeeCreated) {
          // targetEmployeeId already exists
          const createdEmp = await EmployeeRepository.getById(targetEmployeeId!)
          await options.onEmployeeCreated(createdEmp || ({ ...input, id: targetEmployeeId! } as Employee))
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
