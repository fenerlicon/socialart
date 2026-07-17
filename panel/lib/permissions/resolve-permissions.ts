import {
  PERMISSIONS,
  PERMISSION_KEYS,
  type PermissionKey,
} from '@/config/permissions'
import { getModuleIdFromPermissionKey } from '@/config/modules'
import { getRolePackageById } from '@/features/role-packages/data/role-package-seeds'
import { getTeamsByIds } from '@/features/teams/data/team-seeds'
import type {
  EffectivePermissions,
  PermissionOverrideMap,
  PermissionSource,
  ResolvedPermission,
  RolePackageId,
  TeamId,
} from '@/types/domain'

function uniqueKeys(keys: PermissionKey[]): PermissionKey[] {
  return [...new Set(keys)]
}

/**
 * Rol paketi varsayılan yetki kümesi.
 * Takımlar ve Override uygulanmaz.
 */
export function buildDefaultPermissionSet(input: {
  rolePackageId: RolePackageId
  teamIds?: TeamId[]
}): Map<PermissionKey, PermissionSource[]> {
  const rolePackage = getRolePackageById(input.rolePackageId)

  const map = new Map<PermissionKey, PermissionSource[]>()

  for (const key of rolePackage.defaultPermissions) {
    map.set(key, ['role_package'])
  }

  return map
}

/**
 * Nihai yetki seti: rol paketi + kullanıcı override.
 * Takım yetkileri otomatik dahil edilmez, sadece öneri olarak kalır.
 */
export function resolveEffectivePermissions(input: {
  rolePackageId: RolePackageId
  teamIds?: TeamId[]
  permissionOverrides: PermissionOverrideMap
}): EffectivePermissions {
  const defaults = buildDefaultPermissionSet({
    rolePackageId: input.rolePackageId,
  })

  const allCandidateKeys = uniqueKeys([
    ...PERMISSION_KEYS,
    ...defaults.keys(),
    ...(Object.keys(input.permissionOverrides) as PermissionKey[]),
  ])

  const permissions: ResolvedPermission[] = allCandidateKeys.map((key) => {
    const hasOverride = Object.prototype.hasOwnProperty.call(
      input.permissionOverrides,
      key,
    )

    if (hasOverride) {
      const granted = input.permissionOverrides[key] === true
      return {
        key,
        moduleId: getModuleIdFromPermissionKey(key),
        granted,
        sources: ['override'],
      }
    }

    const sources = defaults.get(key) ?? []
    return {
      key,
      moduleId: getModuleIdFromPermissionKey(key),
      granted: sources.length > 0,
      sources,
    }
  })

  const grantedKeys = new Set(
    permissions.filter((p) => p.granted).map((p) => p.key),
  )

  // Force KPI permissions: managers get evaluation, employees get view
  if (input.rolePackageId === 'operasyon-yonetimi' || input.rolePackageId === 'kreatif-yonetim') {
    grantedKeys.add('kpi.evaluate')
    grantedKeys.add('kpi.manage')
  } else {
    grantedKeys.add('kpi.view')
  }

  return { permissions, grantedKeys }
}

export function canAccess(
  effective: EffectivePermissions,
  key: PermissionKey,
): boolean {
  return effective.grantedKeys.has(key)
}

export function getGrantedPermissionsForModule(
  effective: EffectivePermissions,
  moduleId: string,
): ResolvedPermission[] {
  return effective.permissions.filter(
    (p) => p.moduleId === moduleId && p.granted,
  )
}

export function getPermissionLabel(key: PermissionKey): string {
  return PERMISSIONS[key].label
}
