import type { RolePackage } from '@/types/domain'
// Shared Canonical Role Package Baseline Definitions
import {
  ROLE_PACKAGE_DEFINITIONS,
  ROLE_PACKAGES_BY_ID as CANONICAL_ROLE_PACKAGES_BY_ID
} from '../../../../api/_lib/role-package-seeds.js'

export const ROLE_PACKAGE_SEEDS: RolePackage[] = ROLE_PACKAGE_DEFINITIONS as unknown as RolePackage[]
export const ROLE_PACKAGES_BY_ID = CANONICAL_ROLE_PACKAGES_BY_ID as unknown as Record<RolePackage['id'], RolePackage>

export function getRolePackageById(id: RolePackage['id']): RolePackage {
  const pkg = ROLE_PACKAGES_BY_ID[id]
  if (!pkg) {
    throw new Error(`Rol paketi bulunamadı: ${id}`)
  }
  return pkg
}

