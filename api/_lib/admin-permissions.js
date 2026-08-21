/**
 * Server-Side Canonical Permission Resolver Helper
 * Enforces canonical module.action permissions and purges legacy non-permission fields
 * (like permission_overrides.password or username).
 */

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

  // If role_package_id is operasyon-yonetimi, grant all canonical keys
  if (rolePackageId === 'operasyon-yonetimi') {
    VALID_PERMISSION_SET.forEach(key => granted.add(key));
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
