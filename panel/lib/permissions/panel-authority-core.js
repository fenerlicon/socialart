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
 * Pure brand scope resolver.
 * Evaluates whether a brand is assigned to the employee or accessible to admin.
 *
 * @param {object|null} principal
 * @param {object|null} employee
 * @param {object|null} brand
 * @param {object[]} [workflowInstances]
 * @returns {boolean}
 */
export function isBrandInScope(principal, employee, brand, workflowInstances = []) {
  if (isManagerOrAdmin(principal, employee)) {
    return true;
  }

  if (!principal || principal.principalType !== 'employee' || !employee || !brand) {
    return false;
  }

  const empId = String(employee.id || '');
  const db1Id = employee.db1EmployeeId ? String(employee.db1EmployeeId) : null;

  // 1. Direct operationManagerId match
  if (brand.operationManagerId && (String(brand.operationManagerId) === empId || (db1Id && String(brand.operationManagerId) === db1Id))) {
    return true;
  }

  // 2. Canonical brandAssignments match
  if (Array.isArray(brand.brandAssignments)) {
    const isAssigned = brand.brandAssignments.some((a) => {
      const aEmpId = String(a.employeeId || '');
      return aEmpId === empId || (db1Id && aEmpId === db1Id);
    });
    if (isAssigned) return true;
  }

  // 3. Workflow instance steps assignment match (if workflows provided)
  if (Array.isArray(workflowInstances) && workflowInstances.length > 0) {
    const hasAssignedStep = workflowInstances.some((wf) => {
      if (String(wf.brandId) !== String(brand.id)) return false;
      const steps = wf.steps || wf.stepInstances || [];
      return steps.some((s) => {
        const stepEmpId = String(s.assignedEmployeeId || s.assigneeEmployeeId || '');
        return stepEmpId === empId || (db1Id && stepEmpId === db1Id);
      });
    });
    if (hasAssignedStep) return true;
  }

  return false;
}

/**
 * Filters an array of brands to only those visible to the principal & employee.
 *
 * @param {object|null} principal
 * @param {object|null} employee
 * @param {object[]} brands
 * @param {object[]} [workflowInstances]
 * @returns {object[]}
 */
export function resolveVisibleBrands(principal, employee, brands = [], workflowInstances = []) {
  if (!Array.isArray(brands)) return [];
  if (isManagerOrAdmin(principal, employee)) return brands;
  return brands.filter((b) => isBrandInScope(principal, employee, b, workflowInstances));
}

/**
 * Returns a Set of visible brand IDs.
 *
 * @param {object|null} principal
 * @param {object|null} employee
 * @param {object[]} brands
 * @param {object[]} [workflowInstances]
 * @returns {Set<string>}
 */
export function resolveVisibleBrandIds(principal, employee, brands = [], workflowInstances = []) {
  const visibleBrands = resolveVisibleBrands(principal, employee, brands, workflowInstances);
  return new Set(visibleBrands.map((b) => String(b.id)));
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

  if (!principal || principal.principalType !== 'employee' || !employee || !step) {
    return false;
  }

  const empId = String(employee.id || '');
  const db1Id = employee.db1EmployeeId ? String(employee.db1EmployeeId) : null;
  const stepAssignedId = String(step.assignedEmployeeId || step.assigneeEmployeeId || '');

  // Direct assignment to this employee is always in scope for own work
  if (stepAssignedId && (stepAssignedId === empId || (db1Id && stepAssignedId === db1Id))) {
    return true;
  }

  // Graphic Designer is strictly OWN-WORK ONLY
  if (employee.rolePackageId === 'grafik-tasarim') {
    return false;
  }

  const employeeTeams = employee.teamIds || [];

  // Art Director: Creative studio scope only
  if (employee.rolePackageId === 'art-director') {
    if (step.responsibilityRole === 'graphic_design' || step.responsibilityRole === 'video_editing' || step.teamId === 'grafik-studyo') {
      return true;
    }
    // If step assigned to a designer in creative studio
    if (stepAssignedId) {
      const assignee = allEmployees.find((e) => String(e.id) === stepAssignedId || (e.db1EmployeeId && String(e.db1EmployeeId) === stepAssignedId));
      if (assignee && (assignee.rolePackageId === 'grafik-tasarim' || assignee.teamIds?.includes('grafik-studyo'))) {
        return true;
      }
    }
    return false;
  }

  if (step.responsibilityRole) {
    const teamId = ROLE_TO_TEAM[step.responsibilityRole];
    if (teamId && employeeTeams.includes(teamId)) {
      return true;
    }
  }

  if (stepAssignedId) {
    const assignee = allEmployees.find((e) => String(e.id) === stepAssignedId || (e.db1EmployeeId && String(e.db1EmployeeId) === stepAssignedId));
    if (assignee && assignee.teamIds?.some((tId) => employeeTeams.includes(tId))) {
      return true;
    }
  }

  return false;
}
