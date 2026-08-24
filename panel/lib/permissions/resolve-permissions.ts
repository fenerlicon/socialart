import {
  PERMISSIONS,
  PERMISSION_KEYS,
  type PermissionKey,
} from '@/config/permissions'
import { getModuleIdFromPermissionKey } from '@/config/modules'
import {
  ROLE_PACKAGES_BY_ID,
  getRolePackageById,
} from '@/features/role-packages/data/role-package-seeds'
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
  rolePackageId?: RolePackageId | null
  teamIds?: TeamId[]
}): Map<PermissionKey, PermissionSource[]> {
  const map = new Map<PermissionKey, PermissionSource[]>()

  if (!input.rolePackageId) {
    return map
  }

  const rolePackage = ROLE_PACKAGES_BY_ID[input.rolePackageId]
  if (!rolePackage) {
    return map
  }

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
  rolePackageId?: RolePackageId | null
  teamIds?: TeamId[]
  permissionOverrides?: PermissionOverrideMap | null
}): EffectivePermissions {
  const overrides = input.permissionOverrides || {}
  const defaults = buildDefaultPermissionSet({
    rolePackageId: input.rolePackageId,
  })

  const allCandidateKeys = uniqueKeys([
    ...PERMISSION_KEYS,
    ...defaults.keys(),
    ...(Object.keys(overrides) as PermissionKey[]),
  ])

  const permissions: ResolvedPermission[] = allCandidateKeys.map((key) => {
    const hasOverride = Object.prototype.hasOwnProperty.call(
      overrides,
      key,
    )

    if (hasOverride) {
      const granted = overrides[key] === true
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
  } else if (input.rolePackageId) {
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
