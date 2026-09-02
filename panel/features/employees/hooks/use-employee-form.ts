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

const DRAFT_STORAGE_KEY = 'employee-create-draft-v1'

function getSavedCreateDraft(): Partial<CreateEmployeeFormValues> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      return {
        fullName: typeof parsed.fullName === 'string' ? parsed.fullName : '',
        email: typeof parsed.email === 'string' ? parsed.email : '',
        username: typeof parsed.username === 'string' ? parsed.username : '',
        title: typeof parsed.title === 'string' ? parsed.title : '',
        avatarUrl: typeof parsed.avatarUrl === 'string' ? parsed.avatarUrl : '',
        employeeStatus: parsed.employeeStatus === 'passive' ? 'passive' : 'active',
        workLocationStatus: ['office', 'remote', 'hybrid'].includes(parsed.workLocationStatus) ? parsed.workLocationStatus : 'office',
        rolePackageId: typeof parsed.rolePackageId === 'string' ? parsed.rolePackageId : null,
        teamIds: Array.isArray(parsed.teamIds) ? parsed.teamIds : [],
        permissionOverrides: parsed.permissionOverrides && typeof parsed.permissionOverrides === 'object' ? parsed.permissionOverrides : {},
        hasAdvancedCalendarAccess: Boolean(parsed.hasAdvancedCalendarAccess),
      }
    }
  } catch (_) {}
  return null
}

function saveCreateDraft(values: CreateEmployeeFormValues) {
  if (typeof window === 'undefined') return
  try {
    const safeDraft = {
      fullName: values.fullName,
      email: values.email,
      username: values.username,
      title: values.title,
      avatarUrl: values.avatarUrl,
      employeeStatus: values.employeeStatus,
      workLocationStatus: values.workLocationStatus,
      rolePackageId: values.rolePackageId,
      teamIds: values.teamIds,
      permissionOverrides: values.permissionOverrides,
      hasAdvancedCalendarAccess: values.hasAdvancedCalendarAccess,
    }
    window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(safeDraft))
  } catch (_) {}
}

function clearCreateDraft() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(DRAFT_STORAGE_KEY)
  } catch (_) {}
}

export function useEmployeeForm(
  initialEmployee?: Employee,
  options?: { onEmployeeCreated?: (employee: Employee) => Promise<void> | void }
) {
  const router = useRouter()
  const [values, setValues] = useState<CreateEmployeeFormValues>(() => {
    if (!initialEmployee) {
      const draft = getSavedCreateDraft()
      if (draft && (draft.fullName || draft.email || draft.title || draft.username || (draft.teamIds && draft.teamIds.length > 0))) {
        return { ...defaultEmployeeFormValues, ...draft }
      }
    }
    return defaultEmployeeFormValues
  })
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
    } else {
      const draft = getSavedCreateDraft()
      if (draft && (draft.fullName || draft.email || draft.title || draft.username || (draft.teamIds && draft.teamIds.length > 0))) {
        setValues((prev) => ({ ...prev, ...draft }))
      }
    }
  }, [initialEmployee])

  // Automatically save draft on changes in CREATE MODE
  useEffect(() => {
    if (!initialEmployee) {
      const isDirty = Boolean(
        values.fullName.trim() ||
        values.email.trim() ||
        values.username.trim() ||
        values.title.trim() ||
        values.rolePackageId ||
        (values.teamIds && values.teamIds.length > 0) ||
        Object.keys(values.permissionOverrides || {}).length > 0
      )
      if (isDirty) {
        saveCreateDraft(values)
      }
    }
  }, [values, initialEmployee])

  const clearDraftAndForm = useCallback(() => {
    if (!initialEmployee) {
      clearCreateDraft()
      setValues(defaultEmployeeFormValues)
      setErrors({})
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
      // ========================================================
      // 1. CREATE MODE: Server-Authoritative New Employee Creation
      // ========================================================
      if (!initialEmployee) {
        const createRes = await fetch('/api/auth-create-employee', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            fullName: values.fullName,
            title: values.title,
            email: values.email || undefined,
            username: values.username || undefined,
            rolePackageId: values.rolePackageId || undefined,
            teamIds: values.teamIds,
            workLocationStatus: values.workLocationStatus,
            employeeStatus: values.employeeStatus,
            permissionOverrides: values.permissionOverrides,
            hasAdvancedCalendarAccess: values.hasAdvancedCalendarAccess,
          }),
        })

        const createData = await createRes.json().catch(() => ({}))

        if (!createRes.ok || !createData.ok || !createData.employeeId) {
          const stageDesc = createData.metadata?.stage ? ` (${createData.metadata.stage})` : ''
          toast.error('Çalışan kaydedilemedi. Girdiğiniz bilgiler korunmuştur.', {
            description: (createData.error || 'Çalışan oluşturulamadı.') + stageDesc,
          })
          setIsSubmitting(false)
          return
        }

        const newEmp: Employee = createData.employee

        if (createData.warning === 'PARTIAL_CREATE') {
          toast.warning('Kısmi Senkronizasyon', {
            description: createData.message || 'Kanonik çalışan oluşturuldu ancak operasyon aynası senkronize edilemedi.',
          })
        } else {
          toast.success('Çalışan kaydedildi', {
            description: `"${newEmp.fullName}" başarıyla oluşturuldu.`,
          })
        }

        clearCreateDraft()
        setValues(defaultEmployeeFormValues)

        if (options?.onEmployeeCreated) {
          await options.onEmployeeCreated(newEmp)
        } else {
          router.push('/employees')
        }
        return
      }

      // ========================================================
      // 2. EDIT MODE: Canonical DB1 Updates on Dirty Fields
      // ========================================================
      const isDb1PlainId = (id?: string | null) => {
        if (!id) return false
        if (id.startsWith('emp-')) return false
        // Exclude UUID format (which is DB2 employee ID)
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return false
        return true
      }

      const canonicalDb1Id =
        initialEmployee.db1EmployeeId ||
        (isDb1PlainId(initialEmployee.id) ? String(initialEmployee.id) : null)

      const targetSyncId = canonicalDb1Id || initialEmployee.id
      const syncErrors: string[] = []

      // 1. Role Package Update (only if role was explicitly changed to a new valid role)
      const initialRole = initialEmployee.rolePackageId || null
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
              credentials: 'same-origin',
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
      const initialFullName = (initialEmployee.fullName || '').trim()
      const newFullName = (values.fullName || '').trim()
      const initialTitle = (initialEmployee.title || '').trim()
      const newTitle = (values.title || '').trim()
      const initialLocation = initialEmployee.workLocationStatus || 'office'
      const newLocation = values.workLocationStatus || 'office'
      const initialEmail = (initialEmployee.email || '').trim().toLowerCase()
      const newEmail = (values.email || '').trim().toLowerCase()
      const initialStatus = initialEmployee.employeeStatus || 'active'
      const newStatus = values.employeeStatus || 'active'
      const initialTeams = JSON.stringify(initialEmployee.teamIds || [])
      const newTeams = JSON.stringify(values.teamIds || [])
      const initialCalendar = Boolean(initialEmployee.hasAdvancedCalendarAccess)
      const newCalendar = Boolean(values.hasAdvancedCalendarAccess)

      const identityChanged =
        newFullName !== initialFullName ||
        newTitle !== initialTitle ||
        newLocation !== initialLocation ||
        (newEmail && newEmail !== initialEmail) ||
        newStatus !== initialStatus ||
        newTeams !== initialTeams ||
        newCalendar !== initialCalendar

      let partialSyncWarning: string | null = null

      if (identityChanged) {
        if (!targetSyncId) {
          syncErrors.push('Kimlik/durum güncellemesi için geçerli DB1 çalışan kimliği bulunamadı.')
        } else {
          try {
            const payload: any = {
              employeeId: targetSyncId,
            }
            if (newFullName !== initialFullName) payload.fullName = newFullName
            if (newTitle !== initialTitle) payload.title = newTitle
            if (newLocation !== initialLocation) payload.workLocationStatus = newLocation
            if (newStatus !== initialStatus) payload.employeeStatus = newStatus
            if (newTeams !== initialTeams) payload.teamIds = values.teamIds
            if (newCalendar !== initialCalendar) payload.hasAdvancedCalendarAccess = newCalendar
            if (newEmail !== initialEmail) payload.email = newEmail

            const idRes = await fetch('/api/auth-update-employee-identity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'same-origin',
              body: JSON.stringify(payload),
            })
            const idData = await idRes.json().catch(() => ({}))
            if (!idRes.ok || !idData.ok) {
              const stageDesc = idData.metadata?.stage ? ` (${idData.metadata.stage} / ${idData.metadata.operation || 'MUTATION'} / ${idData.metadata.postgresCode || 'ERR'})` : ''
              syncErrors.push((idData.error || 'Kimlik/yetki bilgileri sunucuda güncellenemedi.') + stageDesc)
            } else {
              if (idData.warning === 'PARTIAL_SYNC' || idData.warning === 'MIRROR_FAILED') {
                const stageDesc = idData.metadata?.stage ? ` (${idData.metadata.stage})` : ''
                partialSyncWarning = (idData.message || 'Kanonik çalışan bilgisi kaydedildi ancak operasyon aynası güncellenemedi.') + stageDesc
              }
              if (idData.employee) {
                // Canonical readback assertion
                if (payload.fullName && idData.employee.fullName && idData.employee.fullName !== newFullName) {
                  syncErrors.push(`READBACK_MISMATCH: Kaydedilen isim ("${idData.employee.fullName}") ile talep edilen ("${newFullName}") eşleşmedi.`)
                }
                if (payload.title !== undefined && idData.employee.title !== undefined && idData.employee.title !== newTitle) {
                  syncErrors.push(`READBACK_MISMATCH: Kaydedilen unvan ("${idData.employee.title}") ile talep edilen ("${newTitle}") eşleşmedi.`)
                }
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
        const initialVal = initialEmployee.permissionOverrides?.[key] === true
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
                credentials: 'same-origin',
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
        toast.error('Çalışan kaydedilemedi. Girdiğiniz bilgiler korunmuştur.', {
          description: syncErrors.join(' • '),
        })
        setIsSubmitting(false)
        return
      }

      if (partialSyncWarning) {
        toast.warning('Kısmi Senkronizasyon', {
          description: partialSyncWarning,
        })
      } else {
        toast.success('Çalışan güncellendi', {
          description: `"${values.fullName}" başarıyla güncellendi.`,
        })
      }
      router.push('/employees')
    } catch (err: any) {
      console.error('Error saving employee:', err)
      toast.error('Çalışan kaydedilemedi. Girdiğiniz bilgiler korunmuştur.', {
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
    clearDraftAndForm,
    submit,
  }
}

export type EmployeeFormApi = ReturnType<typeof useEmployeeForm>
