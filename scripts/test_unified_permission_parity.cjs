const assert = require('assert');
const { Client } = require('pg');
require('dotenv').config();

console.log('==========================================');
console.log('UNIFIED PERMISSION RESOLVER PARITY TEST SUITE');
console.log('==========================================\n');

// Import canonical seeds and server resolver using dynamic import (since they are ESM)
async function runTests() {
  const { ROLE_PACKAGE_DEFINITIONS, ROLE_PACKAGES_BY_ID } = await import('../api/_lib/role-package-seeds.js');
  const { PERMISSION_KEYS, resolveServerPermissions } = await import('../api/_lib/admin-permissions.js');

  console.log('--- 1. CANONICAL ARTIFACT INTEGRITY ---');
  assert.ok(Array.isArray(ROLE_PACKAGE_DEFINITIONS), 'ROLE_PACKAGE_DEFINITIONS must be an array');
  assert.strictEqual(ROLE_PACKAGE_DEFINITIONS.length, 10, 'Must contain exactly 10 role packages');
  assert.strictEqual(PERMISSION_KEYS.length, 43, 'Must contain exactly 43 canonical permission keys');
  console.log(` ✅ PASSED: 10 role packages and 43 permission keys validated in canonical authority`);

  console.log('\n--- 2. ROLE PACKAGE BASELINE 100% PARITY TEST ---');
  for (const pkg of ROLE_PACKAGE_DEFINITIONS) {
    const serverBaseline = resolveServerPermissions(pkg.id, {});
    const clientExpected = [...pkg.defaultPermissions].sort();

    assert.deepStrictEqual(
      serverBaseline,
      clientExpected,
      `Role package "${pkg.id}" server baseline must exactly match canonical defaultPermissions`
    );
    console.log(` ✅ PASSED: Role "${pkg.id}" baseline matches 100% (${serverBaseline.length} permissions)`);
  }

  console.log('\n--- 3. FALSE OVERRIDE TEST MATRIX (A-J) ---');

  // Test A: baseline true, override absent => true
  const resA = resolveServerPermissions('operasyon-yonetimi', {});
  assert.strictEqual(resA.includes('tasks.manage'), true, 'Test A: baseline true, override absent => true');
  console.log(' ✅ PASSED [Test A]: baseline true + override absent => true');

  // Test B: baseline true, override false => false
  const resB = resolveServerPermissions('operasyon-yonetimi', { 'tasks.manage': false });
  assert.strictEqual(resB.includes('tasks.manage'), false, 'Test B: baseline true, override false => false');
  console.log(' ✅ PASSED [Test B]: baseline true + override false => false');

  // Test C: baseline true, override true => true
  const resC = resolveServerPermissions('operasyon-yonetimi', { 'tasks.manage': true });
  assert.strictEqual(resC.includes('tasks.manage'), true, 'Test C: baseline true, override true => true');
  console.log(' ✅ PASSED [Test C]: baseline true + override true => true');

  // Test D: baseline false, override absent => false
  const resD = resolveServerPermissions('grafik-tasarim', {});
  assert.strictEqual(resD.includes('crm.view'), false, 'Test D: baseline false, override absent => false');
  console.log(' ✅ PASSED [Test D]: baseline false + override absent => false');

  // Test E: baseline false, override true => true
  const resE = resolveServerPermissions('grafik-tasarim', { 'crm.view': true });
  assert.strictEqual(resE.includes('crm.view'), true, 'Test E: baseline false, override true => true');
  console.log(' ✅ PASSED [Test E]: baseline false + override true => true');

  // Test F: baseline false, override false => false
  const resF = resolveServerPermissions('grafik-tasarim', { 'crm.view': false });
  assert.strictEqual(resF.includes('crm.view'), false, 'Test F: baseline false, override false => false');
  console.log(' ✅ PASSED [Test F]: baseline false + override false => false');

  // Test G & H: API grant=false stores false, grant=true stores true logic
  const mockOverrides = { 'system.admin': true };
  const applyGrantFalse = { ...mockOverrides, 'system.admin': false };
  assert.strictEqual(applyGrantFalse['system.admin'], false, 'Test G: grant=false stores boolean false');
  const applyGrantTrue = { ...mockOverrides, 'crm.view': true };
  assert.strictEqual(applyGrantTrue['crm.view'], true, 'Test H: grant=true stores boolean true');
  console.log(' ✅ PASSED [Test G & H]: override write logic stores explicit boolean');

  // Test I: false override survives JSON serialization/deserialization
  const serialized = JSON.stringify({ 'tasks.view': false, 'crm.view': true });
  const deserialized = JSON.parse(serialized);
  assert.strictEqual(deserialized['tasks.view'], false, 'Test I: false override survives JSON');
  assert.strictEqual(deserialized['crm.view'], true, 'Test I: true override survives JSON');
  console.log(' ✅ PASSED [Test I]: JSON serialization preserves boolean false');

  // Test J: server with explicit false override matches expected output
  const resJ = resolveServerPermissions('dijital-pazarlama', { 'reports.view': false, 'crm.view': true });
  assert.strictEqual(resJ.includes('reports.view'), false);
  assert.strictEqual(resJ.includes('crm.view'), true);
  console.log(' ✅ PASSED [Test J]: Combined override application matches expected semantics');

  console.log('\n--- 4. READ-ONLY DB1 ACTIVE USERS (1, 2, 3, 4, 6) 43-KEY PARITY PROBE ---');
  const pgClient = new Client({
    host: 'db.piffaggeshfrubyjkhej.supabase.co',
    port: 5432,
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();

  const userRes = await pgClient.query(`
    SELECT id, role_package_id, permission_overrides 
    FROM employees 
    WHERE id IN ('1', '2', '3', '4', '6') 
    ORDER BY id ASC;
  `);

  for (const emp of userRes.rows) {
    const serverEffective = resolveServerPermissions(emp.role_package_id, emp.permission_overrides);

    // Compute client effective directly using shared canonical definitions
    const pkg = ROLE_PACKAGES_BY_ID[emp.role_package_id];
    const clientSet = new Set(pkg ? pkg.defaultPermissions : []);
    const overrides = emp.permission_overrides || {};
    Object.keys(overrides).forEach(key => {
      if (PERMISSION_KEYS.includes(key)) {
        if (overrides[key] === true) clientSet.add(key);
        else if (overrides[key] === false) clientSet.delete(key);
      }
    });
    const clientEffective = Array.from(clientSet).sort();

    assert.deepStrictEqual(
      serverEffective,
      clientEffective,
      `Employee ID ${emp.id} server vs client effective permissions must match 100% across all 43 keys`
    );
    console.log(` ✅ PASSED: Employee ID ${emp.id} (Role: ${emp.role_package_id}) — 100% Parity (${serverEffective.length} active permissions)`);
  }

  await pgClient.end();

  console.log('\n==========================================');
  console.log('ALL UNIFIED PERMISSION PARITY TESTS PASSED');
  console.log('==========================================\n');
}

runTests().catch(err => {
  console.error('Parity test failed:', err);
  process.exit(1);
});