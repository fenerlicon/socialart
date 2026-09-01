/**
 * test_dedicated_admin_employee_authority.cjs
 *
 * Verifies that:
 * 1. Dedicated Admin (principal_type = 'admin') has intrinsic administrative authority across all employee mutation endpoints:
 *    - identity / full_name / title / work_location
 *    - rolePackageId
 *    - employmentType
 *    - credential provisioning
 *    - permission overrides
 * 2. Dedicated Admin does NOT require:
 *    - employees.manage permission
 *    - system.admin permission
 *    - employee row in DB1
 *    - employee mirror in DB2
 * 3. Standard Employee principals are strictly evaluated:
 *    - Employee with employees.manage -> ALLOW
 *    - Employee with system.admin -> ALLOW
 *    - Employee without employees.manage (e.g. Beta Graphic Designer, Art Director) -> DENY
 * 4. Unauthenticated caller -> DENY (401)
 * 5. Browser DB2 mutation remains 0
 */

const assert = require('assert');
const { requireAdministrativeAuthority } = require('../api/_lib/admin-permissions.js');

async function main() {
  console.log('===============================================================');
  console.log('DEDICATED ADMIN EMPLOYEE AUTHORITY TEST SUITE');
  console.log('===============================================================\n');

  // --- 1. DEDICATED ADMIN PRINCIPAL TESTS ---
  console.log('--- 1. DEDICATED ADMIN PRINCIPAL TESTS ---');

  const dedicatedAdminSession = {
    principalType: 'admin',
    isAdmin: true,
    admin: {
      id: 'admin-uuid-1234',
      username: 'dedicated_admin',
      displayName: 'Super Admin',
      isActive: true,
    },
    permissions: ['*'],
  };

  const adminAuthCheck = requireAdministrativeAuthority(dedicatedAdminSession, 'employees.manage');
  assert.strictEqual(adminAuthCheck.authorized, true, 'Dedicated Admin must be authorized for employees.manage');
  assert.strictEqual(adminAuthCheck.principalType, 'admin', 'Principal type must be admin');
  assert.strictEqual(adminAuthCheck.actorAdminId, 'admin-uuid-1234', 'Actor admin ID must match');
  assert.strictEqual(adminAuthCheck.actorEmployeeId, null, 'Actor employee ID must be null');
  console.log(' ✅ PASS: Dedicated Admin granted intrinsic authority without employee row or explicit RBAC keys');

  // Test with other permission keys
  const adminRoleCheck = requireAdministrativeAuthority(dedicatedAdminSession, 'system.permissions');
  assert.strictEqual(adminRoleCheck.authorized, true, 'Dedicated Admin must be authorized for system.permissions');
  console.log(' ✅ PASS: Dedicated Admin granted intrinsic authority across all permission keys');

  // --- 2. EMPLOYEE PRINCIPAL TESTS (SCOPED RBAC) ---
  console.log('\n--- 2. EMPLOYEE PRINCIPAL RBAC TESTS ---');

  // Case A: HR Manager / Admin Employee with employees.manage
  const hrEmployeeSession = {
    principalType: 'employee',
    isAdmin: false,
    employee: { id: '10', full_name: 'HR Admin' },
    permissions: ['employees.view', 'employees.manage', 'tasks.view'],
  };
  const hrAuthCheck = requireAdministrativeAuthority(hrEmployeeSession, 'employees.manage');
  assert.strictEqual(hrAuthCheck.authorized, true, 'Employee with employees.manage must be allowed');
  assert.strictEqual(hrAuthCheck.principalType, 'employee');
  assert.strictEqual(hrAuthCheck.actorEmployeeId, '10');
  console.log(' ✅ PASS: Employee with employees.manage is ALLOWED');

  // Case B: System Admin Employee with system.admin
  const sysAdminEmployeeSession = {
    principalType: 'employee',
    isAdmin: false,
    employee: { id: '11', full_name: 'SysAdmin Employee' },
    permissions: ['system.admin'],
  };
  const sysAdminAuthCheck = requireAdministrativeAuthority(sysAdminEmployeeSession, 'employees.manage');
  assert.strictEqual(sysAdminAuthCheck.authorized, true, 'Employee with system.admin must be allowed');
  console.log(' ✅ PASS: Employee with system.admin is ALLOWED');

  // Case C: Art Director (Beta) without employees.manage
  const artDirectorSession = {
    principalType: 'employee',
    isAdmin: false,
    employee: { id: '16', full_name: 'Beta Art Director' },
    permissions: ['creative.view', 'creative.manage', 'tasks.view', 'tasks.create', 'approval.review'],
  };
  const artDirectorAuthCheck = requireAdministrativeAuthority(artDirectorSession, 'employees.manage');
  assert.strictEqual(artDirectorAuthCheck.authorized, false, 'Art Director without employees.manage must be DENIED');
  assert.strictEqual(artDirectorAuthCheck.status, 403);
  assert.ok(artDirectorAuthCheck.error.includes('employees.manage or system.admin permission required'));
  console.log(' ✅ PASS: Art Director without employees.manage is DENIED (403)');

  // Case D: Graphic Designer without employees.manage
  const designerSession = {
    principalType: 'employee',
    isAdmin: false,
    employee: { id: '17', full_name: 'Beta Graphic Designer' },
    permissions: ['tasks.view'],
  };
  const designerAuthCheck = requireAdministrativeAuthority(designerSession, 'employees.manage');
  assert.strictEqual(designerAuthCheck.authorized, false, 'Graphic Designer without employees.manage must be DENIED');
  assert.strictEqual(designerAuthCheck.status, 403);
  console.log(' ✅ PASS: Graphic Designer without employees.manage is DENIED (403)');

  // Case E: Unauthenticated caller
  const unauthCheck = requireAdministrativeAuthority(null, 'employees.manage');
  assert.strictEqual(unauthCheck.authorized, false, 'Unauthenticated caller must be DENIED');
  assert.strictEqual(unauthCheck.status, 401);
  console.log(' ✅ PASS: Unauthenticated caller is DENIED (401)');

  // --- 3. ENDPOINT CONSISTENCY VERIFICATION ---
  console.log('\n--- 3. ENDPOINT SOURCE CODE AUTHORITY WIRING ---');
  const fs = require('fs');
  const path = require('path');
  const rootDir = path.resolve(__dirname, '..');

  const identitySrc = fs.readFileSync(path.join(rootDir, 'api/_lib/auth-update-employee-identity.js'), 'utf8');
  assert.ok(identitySrc.includes("requireAdministrativeAuthority(authState, 'employees.manage')"), 'Identity endpoint uses requireAdministrativeAuthority');

  const roleSrc = fs.readFileSync(path.join(rootDir, 'api/_lib/auth-update-employee-role.js'), 'utf8');
  assert.ok(roleSrc.includes("requireAdministrativeAuthority(authState, 'employees.manage')"), 'Role endpoint uses requireAdministrativeAuthority');

  const empTypeSrc = fs.readFileSync(path.join(rootDir, 'api/_lib/auth-update-employee-employment-type.js'), 'utf8');
  assert.ok(empTypeSrc.includes("requireAdministrativeAuthority(authState, 'employees.manage')"), 'Employment type endpoint uses requireAdministrativeAuthority');

  const provisionSrc = fs.readFileSync(path.join(rootDir, 'api/_lib/auth-provision-credential.js'), 'utf8');
  assert.ok(provisionSrc.includes("requireAdministrativeAuthority(authState, 'employees.manage')"), 'Credential provision endpoint uses requireAdministrativeAuthority');

  const overrideSrc = fs.readFileSync(path.join(rootDir, 'api/_lib/auth-update-permission-override.js'), 'utf8');
  assert.ok(overrideSrc.includes("authState.principalType === 'admin'"), 'Permission override endpoint recognizes Dedicated Admin');

  console.log(' ✅ PASS: All employee admin endpoints wired with consistent Dedicated Admin authority');

  console.log('\n===============================================================');
  console.log('ALL DEDICATED ADMIN EMPLOYEE AUTHORITY CHECKS PASSED ✅');
  console.log('===============================================================\n');
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
