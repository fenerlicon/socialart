import { resolveServerPermissions } from '../../../api/_lib/admin-permissions.js';

export const ROLE_TO_TEAM = {
  social_media: 'sosyal-medya',
  graphic_design: 'grafik-studyo',
  video_editing: 'post-produksiyon',
  photography: 'fotograf-studyo',
  videography: 'video-produksiyon',
  digital_marketing: 'dijital-pazarlama',
  strategy: 'strateji-musteri',
  operation: 'merkezi-operasyon',
};

/**
 * Pure panel authority resolver.
 * Evaluates canonical server-resolved principal and employee permissions.
 * NEVER reads browser storage.
 *
 * @param {object|null} principal - { principalType: 'admin'|'employee'|'anonymous', isDedicatedAdmin?: boolean }
 * @param {object|null} employee - { rolePackageId, teamIds, permissionOverrides }
 * @param {string|string[]} requiredPermissionOrPermissions - required permission key(s)
 * @returns {boolean}
 */
export function resolvePanelAuthority(principal, employee, requiredPermissionOrPermissions) {
  if (principal && (principal.isDedicatedAdmin === true || principal.principalType === 'admin')) {
    return true;
  }

  if (!principal || principal.principalType !== 'employee' || !employee) {
    return false;
  }

  const permissions = resolveServerPermissions(
    employee.rolePackageId,
    employee.permissionOverrides || {}
  );
  const permissionSet = new Set(permissions);

  const reqs = Array.isArray(requiredPermissionOrPermissions)
    ? requiredPermissionOrPermissions
    : [requiredPermissionOrPermissions];

  return reqs.some((key) => permissionSet.has(key));
}

/**
 * Pure manager/admin authority checker.
 * NEVER reads browser storage.
 *
 * @param {object|null} principal
 * @param {object|null} employee
 * @returns {boolean}
 */
export function isManagerOrAdmin(principal, employee) {
  if (principal && (principal.isDedicatedAdmin === true || principal.principalType === 'admin')) {
    return true;
  }

  if (!principal || principal.principalType !== 'employee' || !employee) {
    return false;
  }

  const teamIds = employee.teamIds || [];
  return (
    teamIds.includes('merkezi-operasyon') ||
    employee.rolePackageId === 'operasyon-yonetimi' ||
    employee.permissionOverrides?.['system.admin'] === true
  );
}

/**
 * Pure step-in-scope checker for Tasks / Operations.
 * NEVER reads browser storage.
 *
 * @param {object|null} principal
 * @param {object} step
 * @param {object|null} employee
 * @param {object[]} allEmployees
 * @returns {boolean}
 */
export function isStepInScope(principal, step, employee, allEmployees = []) {
  if (isManagerOrAdmin(principal, employee)) {
    return true;
  }

  if (!principal || principal.principalType !== 'employee' || !employee) {
    return false;
  }

  const employeeTeams = employee.teamIds || [];

  if (employee.rolePackageId === 'art-director') {
    if (step.responsibilityRole === 'graphic_design' || employeeTeams.includes('grafik-studyo')) {
      return true;
    }
  }

  if (step.responsibilityRole) {
    const teamId = ROLE_TO_TEAM[step.responsibilityRole];
    if (teamId && employeeTeams.includes(teamId)) {
      return true;
    }
  }

  if (step.assignedEmployeeId) {
    const assignee = allEmployees.find((e) => e.id === step.assignedEmployeeId);
    if (assignee && assignee.teamIds?.some((tId) => employeeTeams.includes(tId))) {
      return true;
    }
  }

  return false;
}
