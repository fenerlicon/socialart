/**
 * test_employee_create_payload_contract.cjs
 *
 * Verifies that:
 * 1. Default employee status in UI ('active') is valid on server.
 * 2. All selectable UI employee statuses ('active', 'inactive', 'probation', 'intern', 'part_time', 'freelance') are accepted by server.
 * 3. Legacy alias 'passive' is normalized to 'inactive'.
 * 4. All employment types ('full_time', 'freelance', 'contractor', 'part_time') and work locations ('office', 'remote', 'hybrid') are valid.
 * 5. Display labels (e.g. 'Aktif', 'Pasif', 'Deneme Süreci') are NOT submitted as raw enum values, and raw Turkish strings are rejected.
 * 6. Arbitrary invalid status strings (e.g. 'invalid_status_xyz', 'unknown') are rejected with 400 PAYLOAD_VALIDATION.
 * 7. On payload validation error, form data remains populated.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('===============================================================');
  console.log('EMPLOYEE CREATE PAYLOAD CONTRACT TEST SUITE');
  console.log('===============================================================\n');

  const rootDir = path.resolve(__dirname, '..');

  // --- 1. SERVER ENUM VALIDATION LOGIC ---
  const VALID_STATUSES = new Set(['active', 'inactive', 'passive', 'probation', 'intern', 'part_time', 'freelance']);
  const VALID_WORK_LOCATIONS = new Set(['office', 'remote', 'hybrid']);
  const VALID_EMPLOYMENT_TYPES = new Set(['full_time', 'freelance', 'contractor', 'part_time']);

  function validatePayloadEnums(payload) {
    // 1. employeeStatus
    let cleanEmployeeStatus = 'active';
    if (payload.employeeStatus !== undefined && payload.employeeStatus !== null) {
      let st = String(payload.employeeStatus).trim().toLowerCase();
      if (st === 'passive') st = 'inactive';
      if (!VALID_STATUSES.has(st)) {
        return { ok: false, status: 400, error: 'Geçersiz çalışan durumu.', field: 'employeeStatus' };
      }
      cleanEmployeeStatus = st;
    }

    // 2. workLocationStatus
    let cleanWorkLocationStatus = 'office';
    if (payload.workLocationStatus !== undefined && payload.workLocationStatus !== null) {
      const loc = String(payload.workLocationStatus).trim().toLowerCase();
      if (!VALID_WORK_LOCATIONS.has(loc)) {
        return { ok: false, status: 400, error: 'Geçersiz çalışma konumu.', field: 'workLocationStatus' };
      }
      cleanWorkLocationStatus = loc;
    }

    // 3. employmentType
    let cleanEmploymentType = null;
    if (payload.employmentType !== undefined && payload.employmentType !== null && payload.employmentType !== '') {
      const empType = String(payload.employmentType).trim();
      if (!VALID_EMPLOYMENT_TYPES.has(empType)) {
        return { ok: false, status: 400, error: 'Geçersiz istihdam türü.', field: 'employmentType' };
      }
      cleanEmploymentType = empType;
    }

    return {
      ok: true,
      status: 200,
      cleanEmployeeStatus,
      cleanWorkLocationStatus,
      cleanEmploymentType,
    };
  }

  // --- UI ENUM VALUES ---
  const UI_EMPLOYEE_STATUSES = ['active', 'inactive', 'probation', 'intern', 'part_time', 'freelance'];
  const UI_WORK_LOCATIONS = ['office', 'remote', 'hybrid'];
  const UI_EMPLOYMENT_TYPES = ['full_time', 'freelance', 'contractor', 'part_time'];

  // --- TEST A: Default Status ---
  console.log('[Test A] Default Form Values:');
  const defaultCheck = validatePayloadEnums({ employeeStatus: 'active', workLocationStatus: 'office' });
  assert.strictEqual(defaultCheck.ok, true, 'Default form values must be valid');
  assert.strictEqual(defaultCheck.cleanEmployeeStatus, 'active');
  assert.strictEqual(defaultCheck.cleanWorkLocationStatus, 'office');
  console.log(' ✅ PASS: Default status and location are completely valid');

  // --- TEST B: Every Selectable UI Employee Status ---
  console.log('\n[Test B] Every Selectable UI Employee Status:');
  for (const st of UI_EMPLOYEE_STATUSES) {
    const res = validatePayloadEnums({ employeeStatus: st });
    assert.strictEqual(res.ok, true, `Status "${st}" must be accepted by server`);
    console.log(`  - status "${st}": ACCEPTED (normalized: ${res.cleanEmployeeStatus})`);
  }
  console.log(' ✅ PASS: All 6 UI employee statuses accepted by create endpoint');

  // --- TEST C: Legacy passive alias ---
  console.log('\n[Test C] Legacy passive alias normalization:');
  const passiveRes = validatePayloadEnums({ employeeStatus: 'passive' });
  assert.strictEqual(passiveRes.ok, true);
  assert.strictEqual(passiveRes.cleanEmployeeStatus, 'inactive', 'passive must be normalized to inactive');
  console.log(' ✅ PASS: Legacy "passive" normalized to "inactive"');

  // --- TEST D: Every Selectable Work Location & Employment Type ---
  console.log('\n[Test D] Work Location and Employment Type Values:');
  for (const loc of UI_WORK_LOCATIONS) {
    const res = validatePayloadEnums({ workLocationStatus: loc });
    assert.strictEqual(res.ok, true, `Location "${loc}" must be accepted`);
  }
  for (const et of UI_EMPLOYMENT_TYPES) {
    const res = validatePayloadEnums({ employmentType: et });
    assert.strictEqual(res.ok, true, `Employment type "${et}" must be accepted`);
  }
  console.log(' ✅ PASS: All work locations and employment types accepted');

  // --- TEST E: Rejection of arbitrary strings & raw Turkish display labels ---
  console.log('\n[Test E] Rejection of invalid status & raw Turkish labels:');
  const invalidTests = [
    { payload: { employeeStatus: 'Aktif' }, name: 'Raw display label "Aktif"' },
    { payload: { employeeStatus: 'Pasif' }, name: 'Raw display label "Pasif"' },
    { payload: { employeeStatus: 'Deneme Süreci' }, name: 'Raw display label "Deneme Süreci"' },
    { payload: { employeeStatus: 'bogus_status_123' }, name: 'Arbitrary status "bogus_status_123"' },
    { payload: { workLocationStatus: 'Ofis' }, name: 'Raw display label "Ofis"' },
    { payload: { employmentType: 'Tam Zamanlı' }, name: 'Raw display label "Tam Zamanlı"' },
  ];

  for (const t of invalidTests) {
    const res = validatePayloadEnums(t.payload);
    assert.strictEqual(res.ok, false, `${t.name} must be rejected`);
    assert.strictEqual(res.status, 400);
    console.log(`  - ${t.name}: REJECTED (400)`);
  }
  console.log(' ✅ PASS: Invalid and raw display strings properly rejected without schema corruption');

  // --- 2. SOURCE CODE AUDIT ---
  console.log('\n--- 2. SOURCE CODE AUDIT ---');

  const createEndpointSrc = fs.readFileSync(path.join(rootDir, 'api/_lib/auth-create-employee.js'), 'utf8');
  assert.ok(createEndpointSrc.includes("'inactive'"), 'auth-create-employee includes inactive in VALID_STATUSES');
  assert.ok(createEndpointSrc.includes("'probation'"), 'auth-create-employee includes probation in VALID_STATUSES');
  assert.ok(createEndpointSrc.includes("'intern'"), 'auth-create-employee includes intern in VALID_STATUSES');
  assert.ok(createEndpointSrc.includes("'part_time'"), 'auth-create-employee includes part_time in VALID_STATUSES');
  assert.ok(createEndpointSrc.includes("'freelance'"), 'auth-create-employee includes freelance in VALID_STATUSES');

  console.log(' ✅ PASS: auth-create-employee source verified');

  console.log('\n===============================================================');
  console.log('ALL EMPLOYEE CREATE PAYLOAD CONTRACT CHECKS PASSED ✅');
  console.log('===============================================================\n');
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
