import type { PermissionKey } from '@/config/permissions'
import type {
  PermissionOverrideMap,
  PermissionSource,
  RolePackageId,
  TeamId,
} from '@/types/domain'
import { buildDefaultPermissionSet } from '@/lib/permissions/resolve-permissions'
import { getTeamsByIds } from '@/features/teams/data/team-seeds'

export interface PermissionRowState {
  key: PermissionKey
  granted: boolean
  defaultGranted: boolean
  displaySources: PermissionSource[]
  isOverridden: boolean
}

export function getPermissionRowStates(input: {
  rolePackageId?: RolePackageId | null
  teamIds?: TeamId[] | null
  permissionOverrides?: PermissionOverrideMap | null
  permissionKeys: PermissionKey[]
}): PermissionRowState[] {
  const defaults = buildDefaultPermissionSet({
    rolePackageId: input.rolePackageId,
  })

  const teams = getTeamsByIds(input.teamIds || [])
  const recommendedKeys = new Set<PermissionKey>()
  for (const team of teams) {
    for (const key of team.teamPermissions) {
      recommendedKeys.add(key)
    }
  }

  const overrides = input.permissionOverrides || {}

  return input.permissionKeys.map((key) => {
    const defaultGranted = defaults.has(key)
    const isRecommendedByTeam = recommendedKeys.has(key)
    const isOverridden = Object.prototype.hasOwnProperty.call(
      overrides,
      key,
    )
    const granted = isOverridden
      ? overrides[key] === true
      : defaultGranted

    const displaySources: PermissionSource[] = []
    if (isOverridden) {
      displaySources.push('override')
    } else if (defaultGranted) {
      displaySources.push('role_package')
    } else if (isRecommendedByTeam) {
      displaySources.push('team_suggestion')
    }

    return {
      key,
      granted,
      defaultGranted,
      displaySources,
      isOverridden,
    }
  })
}

export function setPermissionOverride(
  overrides: PermissionOverrideMap,
  key: PermissionKey,
  nextGranted: boolean,
  defaultGranted: boolean,
): PermissionOverrideMap {
  const next = { ...overrides }

  if (nextGranted === defaultGranted) {
    delete next[key]
    return next
  }

  next[key] = nextGranted
  return next
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
