import { ROLE_PACKAGES_BY_ID } from './role-package-seeds.js';

export const PERMISSION_KEYS = [
  'tasks.view', 'tasks.create', 'tasks.assign', 'tasks.transfer', 'tasks.manage',
  'workflow.view', 'workflow.edit', 'workflow.manage',
  'brands.view', 'brands.edit', 'brands.manage',
  'crm.view', 'crm.leads', 'crm.proposals', 'crm.manage',
  'kpi.view', 'kpi.evaluate', 'kpi.manage',
  'workload.view', 'workload.analyze', 'workload.manage',
  'ideas.view', 'ideas.create', 'ideas.manage',
  'reports.view', 'reports.submit', 'reports.manage',
  'employees.view', 'employees.create', 'employees.manage',
  'client_portal.view', 'client_portal.manage',
  'system.admin', 'system.permissions', 'system.settings',
  'calendar.view', 'calendar.manage',
  'operations.view', 'task.manage', 'brand.manage', 'team.manage', 'approval.review', 'settings.manage'
];

const VALID_PERMISSION_SET = new Set(PERMISSION_KEYS);

export function resolveServerPermissions(rolePackageId, permissionOverrides = {}) {
  const granted = new Set();

  // Load baseline permissions from canonical role package definitions
  if (rolePackageId && ROLE_PACKAGES_BY_ID[rolePackageId]) {
    const pkg = ROLE_PACKAGES_BY_ID[rolePackageId];
    for (const key of pkg.defaultPermissions) {
      if (VALID_PERMISSION_SET.has(key)) {
        granted.add(key);
      }
    }
  }

  // Apply permission_overrides while strictly filtering out non-permission keys (password, username, etc.)
  if (permissionOverrides && typeof permissionOverrides === 'object') {
    Object.keys(permissionOverrides).forEach(key => {
      if (VALID_PERMISSION_SET.has(key)) {
        if (permissionOverrides[key] === true) {
          granted.add(key);
        } else if (permissionOverrides[key] === false) {
          granted.delete(key);
        }
      }
    });
  }

  return Array.from(granted).sort();
}

/**
 * Canonical Server-Side Administrative Authority Guard
 * Evaluates both dedicated Admin principals and authorized Employee principals.
 *
 * @param {object} authState - The session state resolved by requireAdminSession
 * @param {string} requiredPermission - The permission key required if an employee principal is operating
 * @returns {{ authorized: boolean, principalType?: 'admin'|'employee', actorType?: 'admin'|'employee', actorAdminId?: string|null, actorEmployeeId?: string|null, status?: number, error?: string }}
 */
export function requireAdministrativeAuthority(authState, requiredPermission = 'employees.manage') {
  if (!authState) {
    return { authorized: false, status: 401, error: 'Unauthenticated' };
  }

  // 1. Dedicated Admin Principal (Intrinsic administrative authority)
  if (authState.principalType === 'admin' || authState.isAdmin === true || (Array.isArray(authState.permissions) && authState.permissions.includes('*'))) {
    return {
      authorized: true,
      principalType: 'admin',
      actorType: 'admin',
      actorAdminId: authState.admin?.id || authState.adminId || null,
      actorEmployeeId: null,
    };
  }

  // 2. Employee Principal (Scoped permission authority)
  if (authState.principalType === 'employee' || authState.employee) {
    const permissions = authState.permissions || [];
    const hasPermission = permissions.includes(requiredPermission) || permissions.includes('system.admin');

    if (!hasPermission) {
      return {
        authorized: false,
        status: 403,
        error: `Unauthorized: ${requiredPermission} or system.admin permission required`,
      };
    }

    return {
      authorized: true,
      principalType: 'employee',
      actorType: 'employee',
      actorEmployeeId: String(authState.employee.id),
      actorAdminId: null,
    };
  }

  return { authorized: false, status: 403, error: 'Unauthorized: Unknown principal type' };
}

