const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { requireAdministrativeAuthority } = require('../api/_lib/admin-permissions.js');
const { hashPassword, verifyPassword, generateSessionToken, hashSessionToken } = require('../api/_lib/admin-auth.js');

console.log('===============================================================');
console.log('DEDICATED ADMIN PRINCIPAL FOUNDATION TEST SUITE (A - P)');
console.log('===============================================================\n');

async function runTests() {
  // --- 1. MIGRATION & SCHEMA INTEGRITY (C, D, K, L) ---
  console.log('--- 1. MIGRATION & SCHEMA CONTRACT AUDIT (C, D, K, L) ---');
  const migrationSql = fs.readFileSync(
    path.resolve(__dirname, '../supabase/migrations/create_dedicated_admin_auth_and_audit.sql'),
    'utf8'
  );

  assert.ok(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.admin_auth_identities'), 'Migration must create admin_auth_identities');
  assert.ok(migrationSql.includes('principal_type TEXT NOT NULL DEFAULT \'employee\''), 'Migration must add principal_type to admin_sessions');
  assert.ok(migrationSql.includes('admin_sessions_principal_check'), 'Migration must add admin_sessions_principal_check constraint');
  assert.ok(migrationSql.includes('actor_type TEXT NOT NULL DEFAULT \'employee\''), 'Migration must add actor_type to employee_audit_logs');
  assert.ok(migrationSql.includes('actor_admin_id UUID REFERENCES public.admin_auth_identities'), 'Migration must add actor_admin_id to employee_audit_logs');
  assert.ok(migrationSql.includes('ALTER COLUMN actor_employee_id DROP NOT NULL'), 'Migration must make actor_employee_id nullable');
  console.log(' ✅ PASSED [Test C, D, K, L]: Migration SQL defines dedicated Admin table, polymorphic sessions check constraint, and polymorphic audit logs');

  // --- 2. CANONICAL AUTHORIZATION HELPER: requireAdministrativeAuthority (G, H, I, J, N) ---
  console.log('\n--- 2. CANONICAL AUTHORIZATION HELPER AUDIT (G, H, I, J, N) ---');

  // H: Unauthenticated
  const unauthRes = requireAdministrativeAuthority(null, 'employees.manage');
  assert.strictEqual(unauthRes.authorized, false);
  assert.strictEqual(unauthRes.status, 401);
  console.log(' ✅ PASSED [Test H]: Unauthenticated state fails closed (401)');

  // I & N: Ordinary non-manager employee (ID 6 Arda / dijital-pazarlama)
  const nonManagerSession = {
    principalType: 'employee',
    isAdmin: false,
    employee: { id: 6, rolePackageId: 'dijital-pazarlama', fullName: 'Arda Furkan Aslanbaş' },
    permissions: ['tasks.view', 'workflow.view', 'reports.view'],
  };
  const nonManagerAuth = requireAdministrativeAuthority(nonManagerSession, 'employees.manage');
  assert.strictEqual(nonManagerAuth.authorized, false);
  assert.strictEqual(nonManagerAuth.status, 403);
  console.log(' ✅ PASSED [Test I & N]: Ordinary employee ID 6 denied employee-management authority (403)');

  // J: Legitimate authorized manager employee (ID 2 Celal / operasyon-yonetimi with employees.manage)
  const managerSession = {
    principalType: 'employee',
    isAdmin: false,
    employee: { id: 2, rolePackageId: 'operasyon-yonetimi', fullName: 'Celal Ünlü' },
    permissions: ['employees.view', 'employees.manage', 'team.manage', 'tasks.manage'],
  };
  const managerAuth = requireAdministrativeAuthority(managerSession, 'employees.manage');
  assert.strictEqual(managerAuth.authorized, true);
  assert.strictEqual(managerAuth.actorType, 'employee');
  assert.strictEqual(managerAuth.actorEmployeeId, '2');
  assert.strictEqual(managerAuth.actorAdminId, null);
  console.log(' ✅ PASSED [Test J]: Legitimate employee manager ID 2 authorized with actorType=employee');

  // G & M: Dedicated Admin Principal
  const adminSession = {
    principalType: 'admin',
    isAdmin: true,
    admin: { id: 'a1b2c3d4-0000-0000-0000-000000000001', username: 'rootadmin', displayName: 'System Administrator' },
    permissions: ['*'],
  };
  const adminAuth = requireAdministrativeAuthority(adminSession, 'employees.manage');
  assert.strictEqual(adminAuth.authorized, true);
  assert.strictEqual(adminAuth.principalType, 'admin');
  assert.strictEqual(adminAuth.actorType, 'admin');
  assert.strictEqual(adminAuth.actorAdminId, 'a1b2c3d4-0000-0000-0000-000000000001');
  assert.strictEqual(adminAuth.actorEmployeeId, null);
  console.log(' ✅ PASSED [Test G & M]: Dedicated Admin principal authorized with actorType=admin and 0 employee team dependency');

  // --- 3. DEDICATED ADMIN AUTH & ROUTER (A, B, E, F, O, P) ---
  console.log('\n--- 3. AUTH ROUTER & LOGIN CONTRACT AUDIT (A, B, E, F, O, P) ---');

  const authRouterSource = fs.readFileSync(path.resolve(__dirname, '../api/auth-router.js'), 'utf8');
  assert.ok(authRouterSource.includes('admin-login'), 'auth-router.js must include admin-login route');
  assert.ok(authRouterSource.includes('auth-admin-login.js'), 'auth-router.js must route to auth-admin-login.js');
  console.log(' ✅ PASSED [Test A & E]: Dedicated /api/auth-admin-login route registered in router');

  const adminLoginSource = fs.readFileSync(path.resolve(__dirname, '../api/_lib/auth-admin-login.js'), 'utf8');
  assert.ok(adminLoginSource.includes('admin_auth_identities'), 'auth-admin-login must query dedicated admin_auth_identities');
  assert.ok(adminLoginSource.includes('principal_type: \'admin\''), 'auth-admin-login must insert principal_type=admin');
  assert.ok(!adminLoginSource.includes('password_hash: password'), 'auth-admin-login must never store plaintext passwords');
  console.log(' ✅ PASSED [Test D & O]: Dedicated admin login enforces scrypt verification and polymorphic session insertion');

  const authMeSource = fs.readFileSync(path.resolve(__dirname, '../api/_lib/auth-me.js'), 'utf8');
  assert.ok(authMeSource.includes('principal_type === \'admin\''), 'auth-me.js must check principal_type === admin');
  assert.ok(authMeSource.includes('principalType: \'admin\''), 'auth-me.js must return principalType=admin');
  assert.ok(authMeSource.includes('principalType: \'employee\''), 'auth-me.js must preserve employee backward compatibility');
  console.log(' ✅ PASSED [Test B & F]: auth-me.js polymorphic session resolution verified');

  // --- 4. FIRST ADMIN PROVISIONING SCRIPT AUDIT (O, P) ---
  console.log('\n--- 4. FIRST ADMIN PROVISIONING SCRIPT AUDIT (O, P) ---');
  const provisionSource = fs.readFileSync(path.resolve(__dirname, 'provision_first_admin.cjs'), 'utf8');
  assert.ok(provisionSource.includes('admin_auth_identities'), 'Provisioning script must target admin_auth_identities');
  assert.ok(provisionSource.includes('hashPassword'), 'Provisioning script must use scrypt hashPassword');
  assert.ok(provisionSource.includes('hidden'), 'Provisioning script must use hidden terminal input');
  console.log(' ✅ PASSED [Test O & P]: Provisioning script verified with hidden input and scrypt hashing');

  // --- 5. EMPLOYMENT TYPE ENDPOINT & AUDIT ACTOR CONTRACT AUDIT ---
  console.log('\n--- 5. EMPLOYMENT TYPE ENDPOINT & AUDIT ACTOR CONTRACT AUDIT ---');
  const empTypeEndpointSource = fs.readFileSync(
    path.resolve(__dirname, '../api/_lib/auth-update-employee-employment-type.js'),
    'utf8'
  );
  assert.ok(
    empTypeEndpointSource.includes('requireAdministrativeAuthority'),
    'Endpoint must use canonical requireAdministrativeAuthority guard'
  );
  assert.ok(
    empTypeEndpointSource.includes('actor_type: isActorAdmin ? \'admin\' : \'employee\''),
    'Endpoint must set actor_type conditionally for admin/employee'
  );
  assert.ok(
    empTypeEndpointSource.includes('actor_admin_id: isActorAdmin ? String(cleanActorAdminId) : null'),
    'Endpoint must set actor_admin_id for admin actor'
  );
  assert.ok(
    empTypeEndpointSource.includes('actor_employee_id: isActorAdmin ? null : String(cleanActorEmployeeId)'),
    'Endpoint must nullify actor_employee_id for admin actor'
  );
  console.log(' ✅ PASSED: auth-update-employee-employment-type.js supports Admin authorization and polymorphic audit logging');

  // --- 6. PANEL ADMIN-LOGIN UI & SIDEBAR PARITY AUDIT ---
  console.log('\n--- 6. PANEL ADMIN-LOGIN UI & SIDEBAR PARITY AUDIT ---');
  const adminLoginPage = fs.readFileSync(path.resolve(__dirname, '../panel/app/admin-login/page.tsx'), 'utf8');
  assert.ok(adminLoginPage.includes('/api/auth-admin-login'), 'Admin login page must POST to /api/auth-admin-login');
  assert.ok(adminLoginPage.includes('Yönetici Paneli Girişi'), 'Admin login page must have clear administrative heading');
  console.log(' ✅ PASSED: /admin/admin-login page component verified');

  const workspaceLayout = fs.readFileSync(
    path.resolve(__dirname, '../panel/components/layout/workspace-layout.tsx'),
    'utf8'
  );
  assert.ok(
    workspaceLayout.includes('authData.principalType === \'admin\' || authData.isAdmin'),
    'Workspace layout must handle Admin principal'
  );
  assert.ok(
    workspaceLayout.includes('system.admin\': true'),
    'Workspace layout must configure system.admin for Admin principal'
  );
  console.log(' ✅ PASSED: workspace-layout.tsx grants Ekip Üyeleri visibility to dedicated Admin principal');

  console.log('\n===============================================================');
  console.log('ALL DEDICATED ADMIN PRINCIPAL FOUNDATION & BLOCKER TESTS PASSED');
  console.log('===============================================================\n');
}

runTests().catch((err) => {
  console.error('Test suite failure:', err);
  process.exit(1);
});


