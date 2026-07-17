'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { FormSection } from '@/components/shared/form-section'
import { PermissionSourceBadges } from '@/components/shared/permission-source-badge'
import { MODULES, PROTOTYPE_MODULES } from '@/config/modules'
import {
  getPermissionsByModule,
  PERMISSIONS,
  PROTOTYPE_PERMISSION_KEYS,
} from '@/config/permissions'
import { getPermissionRowStates } from '@/lib/permissions/permission-form-utils'
import type { EmployeeFormApi } from '@/features/employees/hooks/use-employee-form'
import type { RolePackageId, TeamId } from '@/types/domain'

export function PermissionOverridesSection({
  form,
}: {
  form: EmployeeFormApi
}) {
  const { values, togglePermission, resetOverrides } = form

  const permissionsByModule = useMemo(
    () => getPermissionsByModule([...PROTOTYPE_MODULES]),
    [],
  )

  const rowStates = useMemo(
    () =>
      getPermissionRowStates({
        rolePackageId: values.rolePackageId as RolePackageId,
        teamIds: values.teamIds as TeamId[],
        permissionOverrides: values.permissionOverrides,
        permissionKeys: [...PROTOTYPE_PERMISSION_KEYS],
      }),
    [values.rolePackageId, values.teamIds, values.permissionOverrides],
  )

  const rowStateByKey = useMemo(
    () => new Map(rowStates.map((row) => [row.key, row])),
    [rowStates],
  )

  return (
    <FormSection
      title="Yetki Özelleştirme"
      description="Modül bazında yetkileri açıp kapatabilirsiniz. Değişiklikler kullanıcı override olarak kaydedilir."
    >
      <div className="mb-4 flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={resetOverrides}>
          Override&apos;ları sıfırla
        </Button>
      </div>

      <div className="space-y-6">
        {PROTOTYPE_MODULES.map((moduleId) => {
          const modulePermissions = permissionsByModule[moduleId]
          if (!modulePermissions?.length) return null

          return (
            <div key={moduleId} className="rounded-lg border p-4">
              <div className="mb-4">
                <h3 className="font-medium">{MODULES[moduleId].name}</h3>
                <p className="text-sm text-muted-foreground">
                  {MODULES[moduleId].description}
                </p>
              </div>

              <div className="space-y-3">
                {modulePermissions.map((permission) => {
                  const row = rowStateByKey.get(permission.key)
                  if (!row) return null

                  return (
                    <div
                      key={permission.key}
                      className="flex items-center justify-between gap-4 rounded-md border bg-background px-3 py-3"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">
                            {PERMISSIONS[permission.key].label}
                          </p>
                          <PermissionSourceBadges sources={row.displaySources} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {PERMISSIONS[permission.key].description}
                        </p>
                      </div>
                      <Switch
                        checked={row.granted}
                        onCheckedChange={(checked) =>
                          togglePermission(permission.key, checked)
                        }
                        aria-label={PERMISSIONS[permission.key].label}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </FormSection>
  )
}
