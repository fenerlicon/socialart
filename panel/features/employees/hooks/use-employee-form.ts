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

      const isDb1PlainId = (id?: string | null) => {
        if (!id) return false
        if (id.startsWith('emp-')) return false
        // Exclude UUID format (which is DB2 employee ID)
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return false
        return true
      }

      const canonicalDb1Id =
        initialEmployee?.db1EmployeeId ||
        (isDb1PlainId(initialEmployee?.id) ? String(initialEmployee?.id) : null)

      let updatedEmployee: Employee | null = null
      let createdEmployee: Employee | null = null

      if (initialEmployee) {
        updatedEmployee = await updateEmployee(initialEmployee.id, input)
        console.log('Güncellenen çalışan:', updatedEmployee)
      } else {
        createdEmployee = await createAndStoreEmployee(input)
        console.log('Kaydedilen çalışan:', createdEmployee)
        setValues(defaultEmployeeFormValues)
      }

      const syncErrors: string[] = []

      // Orchestrate protected server updates for authorization-sensitive fields:
      const targetSyncId = canonicalDb1Id || (createdEmployee?.id && !createdEmployee.id.startsWith('emp-') ? String(createdEmployee.id) : null)

      // 1. Role Package Update (only if role was explicitly changed to a new valid role)
      const initialRole = initialEmployee?.rolePackageId || null
      const newRole = values.rolePackageId || null
      const roleChanged = Boolean(newRole && newRole !== initialRole)

      if (roleChanged) {
        if (!targetSyncId) {
          syncErrors.push('Rol güncellemesi için geçerli DB1 çalışan kimliği bulunamadı.')
        } else {
          try {
            const roleRes = await fetch('/api/auth-update-employee-role', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ employeeId: targetSyncId, rolePackageId: newRole }),
            })
            if (!roleRes.ok) {
              const rData = await roleRes.json().catch(() => ({}))
              syncErrors.push(rData.error || 'Rol güncellemesi sunucuda uygulanamadı.')
            }
          } catch (e: any) {
            syncErrors.push(`Rol sunucu bağlantı hatası: ${e.message}`)
          }
        }
      }

      // 2. Identity & Status & Auth-Metadata Update (fullName, title, email, username, employeeStatus, workLocationStatus, teamIds, hasAdvancedCalendarAccess)
      const initialFullName = (initialEmployee?.fullName || '').trim()
      const newFullName = (values.fullName || '').trim()
      const initialTitle = (initialEmployee?.title || '').trim()
      const newTitle = (values.title || '').trim()
      const initialLocation = initialEmployee?.workLocationStatus || 'office'
      const newLocation = values.workLocationStatus || 'office'
      const initialEmail = (initialEmployee?.email || '').trim().toLowerCase()
      const newEmail = (values.email || '').trim().toLowerCase()
      const initialStatus = initialEmployee?.employeeStatus || 'active'
      const newStatus = values.employeeStatus || 'active'
      const initialTeams = JSON.stringify(initialEmployee?.teamIds || [])
      const newTeams = JSON.stringify(values.teamIds || [])
      const initialCalendar = Boolean(initialEmployee?.hasAdvancedCalendarAccess)
      const newCalendar = Boolean(values.hasAdvancedCalendarAccess)

      const identityChanged =
        !initialEmployee ||
        newFullName !== initialFullName ||
        newTitle !== initialTitle ||
        newLocation !== initialLocation ||
        (newEmail && newEmail !== initialEmail) ||
        newStatus !== initialStatus ||
        newTeams !== initialTeams ||
        newCalendar !== initialCalendar

      if (identityChanged && initialEmployee) {
        if (!targetSyncId) {
          syncErrors.push('Kimlik/durum güncellemesi için geçerli DB1 çalışan kimliği bulunamadı.')
        } else {
          try {
            const payload: any = {
              employeeId: targetSyncId,
              fullName: newFullName,
              title: newTitle,
              workLocationStatus: newLocation,
              employeeStatus: newStatus,
              teamIds: values.teamIds,
              hasAdvancedCalendarAccess: newCalendar,
            }
            if (newEmail) payload.email = newEmail

            const idRes = await fetch('/api/auth-update-employee-identity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'same-origin',
              body: JSON.stringify(payload),
            })
            const idData = await idRes.json().catch(() => ({}))
            if (!idRes.ok || !idData.ok) {
              syncErrors.push(idData.error || 'Kimlik/yetki bilgileri sunucuda güncellenemedi.')
            } else if (idData.employee) {
              // Canonical readback assertion
              if (idData.employee.fullName && idData.employee.fullName !== newFullName) {
                syncErrors.push(`READBACK_MISMATCH: Kaydedilen isim ("${idData.employee.fullName}") ile talep edilen ("${newFullName}") eşleşmedi.`)
              }
              if (idData.employee.title !== undefined && idData.employee.title !== newTitle) {
                syncErrors.push(`READBACK_MISMATCH: Kaydedilen unvan ("${idData.employee.title}") ile talep edilen ("${newTitle}") eşleşmedi.`)
              }
            }
          } catch (e: any) {
            syncErrors.push(`Kimlik sunucu bağlantı hatası: ${e.message}`)
          }
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
          if (!targetSyncId) {
            syncErrors.push(`"${key}" yetkisi için geçerli DB1 çalışan kimliği bulunamadı.`)
          } else {
            try {
              const permRes = await fetch('/api/auth-update-permission-override', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId: targetSyncId, permissionKey: key, grant: newVal }),
              })
              if (!permRes.ok) {
                const pData = await permRes.json().catch(() => ({}))
                syncErrors.push(pData.error || `"${key}" yetkisi sunucuda güncellenemedi.`)
              }
            } catch (e: any) {
              syncErrors.push(`"${key}" sunucu bağlantı hatası: ${e.message}`)
            }
          }
        }
      }

      if (syncErrors.length > 0) {
        toast.error('Çalışan kaydedilemedi', {
          description: syncErrors.join(' • '),
        })
        return
      }

      if (initialEmployee) {
        toast.success('Çalışan güncellendi', {
          description: `"${values.fullName}" başarıyla güncellendi.`,
        })
        router.push('/employees')
      } else {
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
