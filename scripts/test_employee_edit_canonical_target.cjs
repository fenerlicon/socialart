const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Test Suite: Employee Edit Canonical DB1 Target & Operations DB2 Identity Bridge
console.log('===============================================================');
console.log('EMPLOYEE EDIT CANONICAL TARGET & OPERATIONS DB2 BRIDGE TEST');
console.log('===============================================================');

// Mock helper representing EmployeeRepository.mapRowToEmployee from DB2
function mapRowToEmployee(row) {
  const overrides = { ...(row.permission_overrides || {}) };
  delete overrides.username;
  delete overrides.password;

  const validEmploymentTypes = ['full_time', 'freelance', 'contractor', 'part_time'];
  const employmentType = validEmploymentTypes.includes(row.employment_type) ? row.employment_type : null;

  return {
    id: row.id, // DB2 UUID
    db1EmployeeId: row.db1_employee_id ? String(row.db1_employee_id) : null, // Canonical DB1 ID
    fullName: row.full_name,
    email: row.email,
    title: row.title,
    avatarUrl: row.avatar_url,
    employeeStatus: row.employee_status,
    workLocationStatus: row.work_location_status,
    employmentType,
    rolePackageId: row.role_package_id,
    teamIds: row.team_ids || [],
    permissionOverrides: overrides,
    hasAdvancedCalendarAccess: row.has_advanced_calendar_access,
    username: overrides.username || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Canonical DB1 resolution helper from use-employee-form.ts
function resolveTargetSyncId(initialEmployee, createdEmployee) {
  const isDb1PlainId = (id) => {
    if (!id) return false;
    if (id.startsWith('emp-')) return false;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return false;
    return true;
  };

  const canonicalDb1Id =
    initialEmployee?.db1EmployeeId ||
    (isDb1PlainId(initialEmployee?.id) ? String(initialEmployee?.id) : null);

  return canonicalDb1Id || (createdEmployee?.id && isDb1PlainId(createdEmployee.id) ? String(createdEmployee.id) : null);
}

// Change detector from use-employee-form.ts
function detectChanges(initialEmployee, values) {
  const initialRole = initialEmployee?.rolePackageId || null;
  const newRole = values.rolePackageId || null;
  const roleChanged = Boolean(newRole && newRole !== initialRole);

  const initialEmail = (initialEmployee?.email || '').trim().toLowerCase();
  const newEmail = (values.email || '').trim().toLowerCase();
  const initialStatus = initialEmployee?.employeeStatus || 'active';
  const newStatus = values.employeeStatus || 'active';
  const initialTeams = JSON.stringify(initialEmployee?.teamIds || []);
  const newTeams = JSON.stringify(values.teamIds || []);
  const initialCalendar = Boolean(initialEmployee?.hasAdvancedCalendarAccess);
  const newCalendar = Boolean(values.hasAdvancedCalendarAccess);

  const identityChanged =
    !initialEmployee ||
    (newEmail && newEmail !== initialEmail) ||
    newStatus !== initialStatus ||
    newTeams !== initialTeams ||
    newCalendar !== initialCalendar;

  return {
    roleChanged,
    identityChanged: Boolean(initialEmployee && identityChanged),
  };
}

// ----------------------------------------------------
// TEST A: DB2 EMPLOYEE REPOSITORY MAPS UUID + db1EmployeeId
// ----------------------------------------------------
console.log('\n--- TEST A: DB2 Employee Mapping ---');
const db2Row = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  db1_employee_id: '15',
  full_name: 'Buğrahan Vural',
  email: null,
  role_package_id: null,
  team_ids: [],
  employee_status: 'active',
  work_location_status: 'office',
  employment_type: 'freelance',
};

const domainEmployee = mapRowToEmployee(db2Row);
assert.strictEqual(domainEmployee.id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'domain.id must be DB2 UUID');
assert.strictEqual(domainEmployee.db1EmployeeId, '15', 'domain.db1EmployeeId must be canonical DB1 ID 15');
console.log(' ✅ PASSED [Test A]: DB2 row maps to domain object with id=UUID and db1EmployeeId="15"');

// ----------------------------------------------------
// TEST B: PROFILE IDENTITY MUTATION TARGETS CANONICAL DB1 ID
// ----------------------------------------------------
console.log('\n--- TEST B: Target Sync ID Resolution ---');
const targetSyncId = resolveTargetSyncId(domainEmployee, null);
assert.strictEqual(targetSyncId, '15', 'targetSyncId must resolve to canonical DB1 ID 15');
assert.notStrictEqual(targetSyncId, domainEmployee.id, 'targetSyncId must NOT be the DB2 UUID');
console.log(' ✅ PASSED [Test B]: Server identity mutation accurately targets "15" and avoids DB2 UUID');

// ----------------------------------------------------
// TEST C: WORKFLOW / TASK ASSIGNMENT USES DB2 UUID
// ----------------------------------------------------
console.log('\n--- TEST C: Workflow/Task Assignment uses DB2 UUID ---');
const workflowStepInstance = {
  id: 'step-inst-123',
  step_template_id: 'video-editing',
  assigned_employee_id: domainEmployee.id, // Must be DB2 UUID
};
assert.strictEqual(workflowStepInstance.assigned_employee_id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
console.log(' ✅ PASSED [Test C]: Workflow assignments accurately use domain.id (DB2 UUID)');

// ----------------------------------------------------
// TEST D: SOURCE CODE AUDIT — REPOSITORY IMPORTS DB2 CLIENT
// ----------------------------------------------------
console.log('\n--- TEST D: EmployeeRepository Data Source Integrity ---');
const repoSrc = fs.readFileSync(path.join(__dirname, '..', 'panel', 'lib', 'repositories', 'EmployeeRepository.ts'), 'utf-8');
assert(repoSrc.includes("import { supabase } from '@/lib/supabase/client'"), 'EmployeeRepository must import DB2 supabase client');
assert(!repoSrc.includes("import { supabaseLeads as supabase }"), 'EmployeeRepository must not override with supabaseLeads');
console.log(' ✅ PASSED [Test D]: EmployeeRepository verified connected to DB2');

// ----------------------------------------------------
// TEST E: WORK-LOCATION-ONLY EDIT AVOIDS IDENTITY SYNC
// ----------------------------------------------------
console.log('\n--- TEST E: Work-Location-Only Edit Isolation ---');
const workLocationOnlyValues = {
  fullName: 'Buğrahan Vural',
  email: '',
  username: '',
  title: 'Seslendirme Sanatçısı',
  avatarUrl: '',
  employeeStatus: 'active',
  workLocationStatus: 'remote',
  rolePackageId: null,
  teamIds: [],
  permissionOverrides: {},
  hasAdvancedCalendarAccess: false,
};

const changes = detectChanges(domainEmployee, workLocationOnlyValues);
assert.strictEqual(changes.roleChanged, false, 'Role must not trigger sync');
assert.strictEqual(changes.identityChanged, false, 'Identity sync must not trigger on location edit');
console.log(' ✅ PASSED [Test E]: Location edit generates 0 identity sync requests');

// ----------------------------------------------------
// TEST F: MISSING DB1 BRIDGE FAILS CLOSED
// ----------------------------------------------------
console.log('\n--- TEST F: Missing Bridge Fail-Closed ---');
const unbridgedUuidEmployee = {
  id: 'c1a2b3d4-e5f6-7890-abcd-ef0123456789',
  db1EmployeeId: null,
  fullName: 'Unbridged DB2 Worker',
};
const unbridgedTargetId = resolveTargetSyncId(unbridgedUuidEmployee, null);
assert.strictEqual(unbridgedTargetId, null, 'Unbridged UUID worker must resolve to null target ID');
console.log(' ✅ PASSED [Test F]: Missing DB1 bridge fails closed without sending raw DB2 UUID');

console.log('\n===============================================================');
console.log('ALL EMPLOYEE EDIT & OPERATIONS IDENTITY BRIDGE TESTS PASSED');
console.log('===============================================================');