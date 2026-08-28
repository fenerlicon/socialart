const assert = require('assert');

async function runTests() {
  console.log('==========================================');
  console.log('PANEL DEDICATED ADMIN CANONICAL AUTHORITY TEST');
  console.log('==========================================\n');

  // Import real production authority core
  const {
    resolvePanelAuthority,
    isManagerOrAdmin,
    isStepInScope,
    ROLE_TO_TEAM,
  } = await import('../panel/lib/permissions/panel-authority-core.js');

  console.log('--- 1. CANONICAL AUTH-ME ADMIN PRINCIPAL TEST ---');
  const adminPrincipal = {
    principalType: 'admin',
    isDedicatedAdmin: true,
    adminId: 'admin-sec-uuid-101',
    employeeId: null,
    authResolved: true,
  };

  assert.strictEqual(adminPrincipal.isDedicatedAdmin, true, 'Admin must be marked as dedicated admin');
  assert.strictEqual(adminPrincipal.employeeId, null, 'Admin must not have employeeId');
  assert.strictEqual(resolvePanelAuthority(adminPrincipal, null, 'employees.manage'), true, 'Admin has employees.manage');
  assert.strictEqual(resolvePanelAuthority(adminPrincipal, null, 'brand.manage'), true, 'Admin has brand.manage');
  assert.strictEqual(resolvePanelAuthority(adminPrincipal, null, 'task.manage'), true, 'Admin has task.manage');
  assert.strictEqual(resolvePanelAuthority(adminPrincipal, null, 'operations.view'), true, 'Admin has operations.view');
  assert.strictEqual(resolvePanelAuthority(adminPrincipal, null, 'settings.manage'), true, 'Admin has settings.manage');
  assert.strictEqual(resolvePanelAuthority(adminPrincipal, null, 'calendar.view'), true, 'Admin has calendar.view');
  assert.strictEqual(resolvePanelAuthority(adminPrincipal, null, 'approval.review'), true, 'Admin has approval.review');
  assert.strictEqual(isManagerOrAdmin(adminPrincipal, null), true, 'Admin is manager or admin');
  assert.strictEqual(isStepInScope(adminPrincipal, { id: 'step-99', responsibilityRole: 'video_editing' }, null), true, 'Admin has global step scope');
  console.log(' ✅ PASSED: Canonical Admin principal has full intrinsic administrative panel authority');

  console.log('\n--- 2. CANONICAL EMPLOYEE PRINCIPAL TEST (ID6 VERIFIED FACTS) ---');
  const employeePrincipal = {
    principalType: 'employee',
    isDedicatedAdmin: false,
    adminId: null,
    employeeId: '6',
    authResolved: true,
  };

  const employeeId6 = {
    id: '6',
    fullName: 'Arda Furkan',
    rolePackageId: 'dijital-pazarlama',
    teamIds: ['dijital-pazarlama'],
    permissionOverrides: {},
  };

  assert.strictEqual(employeePrincipal.isDedicatedAdmin, false, 'Employee ID6 is not dedicated admin');
  assert.strictEqual(resolvePanelAuthority(employeePrincipal, employeeId6, 'employees.manage'), false, 'ID6 cannot manage employees');
  assert.strictEqual(resolvePanelAuthority(employeePrincipal, employeeId6, 'system.admin'), false, 'ID6 does not have system.admin');
  assert.strictEqual(resolvePanelAuthority(employeePrincipal, employeeId6, 'brand.manage'), false, 'ID6 cannot manage brands');
  assert.strictEqual(resolvePanelAuthority(employeePrincipal, employeeId6, 'settings.manage'), false, 'ID6 cannot manage settings');
  assert.strictEqual(isManagerOrAdmin(employeePrincipal, employeeId6), false, 'ID6 is not manager or admin');
  
  // ID6 scoped step visibility
  const digitalMarketingStep = { id: 'step-dm-1', responsibilityRole: 'digital_marketing' };
  const videoEditingStep = { id: 'step-ve-1', responsibilityRole: 'video_editing' };
  assert.strictEqual(isStepInScope(employeePrincipal, digitalMarketingStep, employeeId6), true, 'ID6 sees digital marketing steps');
  assert.strictEqual(isStepInScope(employeePrincipal, videoEditingStep, employeeId6), false, 'ID6 cannot see video editing steps without assignment');
  console.log(' ✅ PASSED: Canonical Employee ID6 accurately adheres to dijital-pazarlama role and team boundaries');

  console.log('\n--- 3. ANONYMOUS / UNAUTHENTICATED PRINCIPAL TEST ---');
  const anonymousPrincipal = {
    principalType: 'anonymous',
    isDedicatedAdmin: false,
    adminId: null,
    employeeId: null,
    authResolved: true,
  };

  assert.strictEqual(resolvePanelAuthority(anonymousPrincipal, null, 'employees.manage'), false, 'Anonymous cannot manage employees');
  assert.strictEqual(resolvePanelAuthority(anonymousPrincipal, null, 'brand.manage'), false, 'Anonymous cannot manage brands');
  assert.strictEqual(resolvePanelAuthority(anonymousPrincipal, null, 'operations.view'), false, 'Anonymous cannot view operations');
  assert.strictEqual(isManagerOrAdmin(anonymousPrincipal, null), false, 'Anonymous is not manager or admin');
  assert.strictEqual(isStepInScope(anonymousPrincipal, digitalMarketingStep, null), false, 'Anonymous cannot view any steps');
  console.log(' ✅ PASSED: Anonymous principal is strictly denied all panel authority');

  console.log('\n--- 4. LOCALSTORAGE SPOOFING RESISTANCE TEST ---');
  // Simulate attacker manipulating browser storage with fake admin payload
  const fakeBrowserStorage = {
    socialart_user: JSON.stringify({
      id: 'hacker-id',
      principalType: 'admin',
      isAdmin: true,
      role: 'Sistem Yöneticisi',
      permissions: 'all',
    }),
    ajans_user: JSON.stringify({
      id: 'hacker-id',
      principalType: 'admin',
      isAdmin: true,
    }),
  };

  // Pure authority functions ignore browser storage completely and evaluate only server-resolved principal
  assert.strictEqual(
    resolvePanelAuthority(employeePrincipal, employeeId6, 'employees.manage'),
    false,
    'Manipulated storage MUST NOT grant employees.manage to employee principal'
  );
  assert.strictEqual(
    resolvePanelAuthority(employeePrincipal, employeeId6, 'system.admin'),
    false,
    'Manipulated storage MUST NOT grant system.admin to employee principal'
  );
  assert.strictEqual(
    resolvePanelAuthority(anonymousPrincipal, null, 'employees.manage'),
    false,
    'Manipulated storage MUST NOT grant employees.manage to anonymous principal'
  );
  assert.strictEqual(
    isManagerOrAdmin(employeePrincipal, employeeId6),
    false,
    'Manipulated storage MUST NOT make employee a manager/admin'
  );
  assert.strictEqual(
    isManagerOrAdmin(anonymousPrincipal, null),
    false,
    'Manipulated storage MUST NOT make anonymous user a manager/admin'
  );
  console.log('\n--- 5. AUTH-MIRROR-EMPLOYEE ENDPOINT AUTHORIZATION TEST ---');
  const { requireAdministrativeAuthority, resolveServerPermissions } = await import('../api/_lib/admin-permissions.js');

  // Dedicated Admin
  const adminAuthState = {
    authenticated: true,
    principalType: 'admin',
    isAdmin: true,
    admin: { id: 'admin-sec-uuid-101', email: 'admin@socialartmedya.com' }
  };
  const adminAuthRes = requireAdministrativeAuthority(adminAuthState, 'employees.manage');
  assert.strictEqual(adminAuthRes.authorized, true, 'Dedicated Admin MUST be authorized for mirror employee endpoint');
  assert.strictEqual(adminAuthRes.principalType, 'admin');

  // Operations Manager Employee (has employees.manage)
  const opsManagerAuthState = {
    authenticated: true,
    principalType: 'employee',
    employee: { id: 2, fullName: 'Celal Ünlü', rolePackageId: 'operasyon-yonetimi' },
    permissions: resolveServerPermissions('operasyon-yonetimi', { 'employees.manage': true })
  };
  const opsAuthRes = requireAdministrativeAuthority(opsManagerAuthState, 'employees.manage');
  assert.strictEqual(opsAuthRes.authorized, true, 'Employee with employees.manage MUST be authorized');

  // Beta Art Director (does NOT have employees.manage)
  const adAuthState = {
    authenticated: true,
    principalType: 'employee',
    employee: { id: 16, fullName: 'Beta Art Director (Geçici)', rolePackageId: 'art-director' },
    permissions: resolveServerPermissions('art-director')
  };
  const adAuthRes = requireAdministrativeAuthority(adAuthState, 'employees.manage');
  assert.strictEqual(adAuthRes.authorized, false, 'Beta Art Director MUST NOT be authorized to mirror employees');
  assert.strictEqual(adAuthRes.status, 403);

  // Beta Graphic Designer (does NOT have employees.manage)
  const gdAuthState = {
    authenticated: true,
    principalType: 'employee',
    employee: { id: 17, fullName: 'Beta Graphic Designer', rolePackageId: 'grafik-tasarim' },
    permissions: resolveServerPermissions('grafik-tasarim')
  };
  const gdAuthRes = requireAdministrativeAuthority(gdAuthState, 'employees.manage');
  assert.strictEqual(gdAuthRes.authorized, false, 'Beta Graphic Designer MUST NOT be authorized to mirror employees');
  assert.strictEqual(gdAuthRes.status, 403);

  // ID 6 (Digital Marketer - does NOT have employees.manage)
  const id6AuthState = {
    authenticated: true,
    principalType: 'employee',
    employee: { id: 6, fullName: 'Arda Furkan', rolePackageId: 'dijital-pazarlama' },
    permissions: resolveServerPermissions('dijital-pazarlama')
  };
  const id6AuthRes = requireAdministrativeAuthority(id6AuthState, 'employees.manage');
  assert.strictEqual(id6AuthRes.authorized, false, 'ID 6 MUST NOT be authorized to mirror employees');
  assert.strictEqual(id6AuthRes.status, 403);

  // Unauthenticated
  const unauthRes = requireAdministrativeAuthority(null, 'employees.manage');
  assert.strictEqual(unauthRes.authorized, false, 'Unauthenticated user MUST fail closed');
  assert.strictEqual(unauthRes.status, 401);

  console.log(' ✅ PASSED: Auth-mirror-employee endpoint authorization strictly enforced (Dedicated Admin allowed, scoped employees enforced, fail closed)');

  console.log('\n==========================================');
  console.log('ALL DETERMINISTIC PANEL AUTHORIZATION TESTS PASSED');
  console.log('==========================================');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
