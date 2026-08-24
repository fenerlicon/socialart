const assert = require('assert');
require('dotenv').config();

console.log('==========================================');
console.log('ORGANIZATION ROLE FOUNDATION TEST SUITE');
console.log('==========================================\n');

async function runTests() {
  const { ROLE_PACKAGE_DEFINITIONS, ROLE_PACKAGES_BY_ID } = await import('../api/_lib/role-package-seeds.js');
  const { resolveServerPermissions } = await import('../api/_lib/admin-permissions.js');

  // Baseline definitions of original 10 roles
  const ORIGINAL_10_BASELINES = {
    'operasyon-yonetimi': [
      'tasks.view', 'tasks.create', 'tasks.assign', 'tasks.transfer', 'tasks.manage',
      'workflow.view', 'workflow.edit', 'workflow.manage',
      'brands.view', 'brands.edit', 'brands.manage',
      'reports.view', 'reports.submit', 'reports.manage',
      'employees.view', 'operations.view', 'task.manage', 'brand.manage',
      'team.manage', 'approval.review', 'settings.manage',
      'calendar.view', 'calendar.manage', 'kpi.view', 'kpi.evaluate', 'kpi.manage'
    ],
    'strateji-musteri-yonetimi': [
      'tasks.view', 'tasks.create', 'brands.view', 'brands.edit', 'brands.manage',
      'crm.view', 'crm.leads', 'crm.proposals',
      'reports.view', 'reports.submit', 'calendar.view', 'kpi.view'
    ],
    'dijital-pazarlama': [
      'tasks.view', 'tasks.create', 'workflow.view', 'brands.view', 'brands.edit',
      'reports.view', 'reports.submit', 'calendar.view', 'kpi.view'
    ],
    'sosyal-medya-yonetimi': [
      'tasks.view', 'tasks.create', 'workflow.view', 'brands.view',
      'reports.view', 'reports.submit', 'calendar.view', 'kpi.view'
    ],
    'kreatif-yonetim': [
      'tasks.view', 'tasks.create', 'tasks.assign', 'tasks.transfer',
      'workflow.view', 'workflow.edit', 'brands.view', 'brands.edit',
      'reports.view', 'reports.submit', 'reports.manage', 'operations.view',
      'task.manage', 'team.manage', 'approval.review',
      'calendar.view', 'calendar.manage', 'kpi.view', 'kpi.evaluate', 'kpi.manage'
    ],
    'kreatif-direktor': [
      'tasks.view', 'tasks.create', 'tasks.assign', 'tasks.transfer',
      'workflow.view', 'workflow.edit', 'brands.view',
      'reports.view', 'reports.submit', 'approval.review',
      'calendar.view', 'calendar.manage', 'kpi.view'
    ],
    'grafik-tasarim': [
      'tasks.view', 'tasks.create', 'brands.view', 'reports.view', 'reports.submit', 'kpi.view'
    ],
    'video-kurgu': [
      'tasks.view', 'tasks.create', 'brands.view', 'reports.view', 'reports.submit', 'kpi.view'
    ],
    'fotograf-uretimi': [
      'tasks.view', 'tasks.create', 'brands.view', 'reports.view', 'reports.submit', 'kpi.view'
    ],
    'video-uretimi': [
      'tasks.view', 'tasks.create', 'brands.view', 'reports.view', 'reports.submit', 'kpi.view'
    ]
  };

  console.log('--- 1. ROLE COUNT & EXISTENCE (A, B, C, D, P) ---');
  // B: Role count after = 12
  assert.strictEqual(ROLE_PACKAGE_DEFINITIONS.length, 12, 'Test B: Must contain exactly 12 role packages');
  console.log(' ✅ PASSED [Test B]: Exactly 12 role packages found in canonical registry');

  // C: coso exists
  const cosoPkg = ROLE_PACKAGES_BY_ID['coso'];
  assert.ok(cosoPkg, 'Test C: coso role package must exist');
  assert.strictEqual(cosoPkg.id, 'coso');
  console.log(' ✅ PASSED [Test C]: coso role package exists in registry');

  // D: art-director exists
  const adPkg = ROLE_PACKAGES_BY_ID['art-director'];
  assert.ok(adPkg, 'Test D: art-director role package must exist');
  assert.strictEqual(adPkg.id, 'art-director');
  console.log(' ✅ PASSED [Test D]: art-director role package exists in registry');

  // P: kreatif-yonetim remains present
  assert.ok(ROLE_PACKAGES_BY_ID['kreatif-yonetim'], 'Test P: kreatif-yonetim must remain present');
  console.log(' ✅ PASSED [Test P]: kreatif-yonetim legacy package remains present');

  console.log('\n--- 2. PRESERVATION OF EXISTING 10 ROLE BASELINES (E, N, O) ---');
  for (const [roleId, expectedPerms] of Object.entries(ORIGINAL_10_BASELINES)) {
    const pkg = ROLE_PACKAGES_BY_ID[roleId];
    assert.ok(pkg, `Role package ${roleId} must exist`);
    const actualSorted = Array.from(new Set(pkg.defaultPermissions)).sort();
    const expectedSorted = Array.from(new Set(expectedPerms)).sort();
    assert.deepStrictEqual(actualSorted, expectedSorted, `Role ${roleId} baseline must be unchanged`);
    console.log(` ✅ PASSED [Test E]: Role "${roleId}" baseline is 100% identical (${actualSorted.length} perms)`);
  }

  // N: grafik-tasarim unchanged
  const grafikPerms = Array.from(new Set(ROLE_PACKAGES_BY_ID['grafik-tasarim'].defaultPermissions)).sort();
  assert.deepStrictEqual(grafikPerms, ORIGINAL_10_BASELINES['grafik-tasarim'].sort());
  console.log(' ✅ PASSED [Test N]: grafik-tasarim baseline remains unchanged');

  // O: kreatif-direktor unchanged
  const kdPerms = Array.from(new Set(ROLE_PACKAGES_BY_ID['kreatif-direktor'].defaultPermissions)).sort();
  assert.deepStrictEqual(kdPerms, ORIGINAL_10_BASELINES['kreatif-direktor'].sort());
  console.log(' ✅ PASSED [Test O]: kreatif-direktor baseline remains unchanged');

  console.log('\n--- 3. SECURITY BOUNDARY CHECKS (F, G, H, I, J, K) ---');
  // F & G: coso does not have system.admin or system.permissions
  const cosoPerms = resolveServerPermissions('coso', {});
  assert.strictEqual(cosoPerms.includes('system.admin'), false, 'Test F: coso must not have system.admin');
  assert.strictEqual(cosoPerms.includes('system.permissions'), false, 'Test G: coso must not have system.permissions');
  assert.strictEqual(cosoPerms.includes('employees.manage'), false, 'coso must not have employees.manage');
  assert.strictEqual(cosoPerms.includes('employees.create'), false, 'coso must not have employees.create');
  console.log(' ✅ PASSED [Test F & G]: coso has zero system administration / employee security privileges');

  // H, I, J, K: art-director security checks
  const adPerms = resolveServerPermissions('art-director', {});
  assert.strictEqual(adPerms.includes('system.admin'), false, 'Test H: art-director must not have system.admin');
  assert.strictEqual(adPerms.includes('system.permissions'), false, 'Test I: art-director must not have system.permissions');
  assert.strictEqual(adPerms.includes('employees.manage'), false, 'Test J: art-director must not have employees.manage');
  assert.strictEqual(adPerms.includes('employees.create'), false, 'Test K: art-director must not have employees.create');
  assert.strictEqual(adPerms.includes('team.manage'), false, 'art-director must not have team.manage');
  console.log(' ✅ PASSED [Test H, I, J, K]: art-director strictly scoped to creative traffic/review (no admin/employee manage)');

  console.log('\n--- 4. CLIENT / SERVER PARITY & OVERRIDE SEMANTICS (L, M) ---');
  // L: Server resolver on coso and art-director matches defaultPermissions
  assert.deepStrictEqual(
    resolveServerPermissions('coso', {}),
    [...cosoPkg.defaultPermissions].sort(),
    'Test L: coso server resolver matches defaultPermissions'
  );
  assert.deepStrictEqual(
    resolveServerPermissions('art-director', {}),
    [...adPkg.defaultPermissions].sort(),
    'Test L: art-director server resolver matches defaultPermissions'
  );
  console.log(' ✅ PASSED [Test L]: Server/client resolver produces 100% parity for new roles');

  // M: Explicit false override semantics on new roles
  const cosoFalse = resolveServerPermissions('coso', { 'tasks.assign': false, 'crm.view': true });
  assert.strictEqual(cosoFalse.includes('tasks.assign'), false, 'Explicit false removes baseline perm');
  assert.strictEqual(cosoFalse.includes('crm.view'), true, 'Explicit true adds non-baseline perm');

  const adFalse = resolveServerPermissions('art-director', { 'approval.review': false });
  assert.strictEqual(adFalse.includes('approval.review'), false, 'Explicit false removes approval.review');
  console.log(' ✅ PASSED [Test M]: Explicit boolean overrides work accurately on new roles');

  console.log('\n==========================================');
  console.log('ALL ORGANIZATION ROLE FOUNDATION CHECKS PASSED');
  console.log('==========================================\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});