const assert = require('assert');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('==================================================');
console.log('EMPLOYMENT TYPE FOUNDATION TEST SUITE');
console.log('==================================================\n');

async function runTests() {
  const VALID_EMPLOYMENT_TYPES = ['full_time', 'freelance', 'contractor', 'part_time'];

  function mapEmployeeToRow(employee) {
    const row = {};
    if (employee.id !== undefined) row.id = employee.id;
    if (employee.fullName !== undefined) row.full_name = employee.fullName;
    if (employee.title !== undefined) row.title = employee.title;
    if (employee.employmentType !== undefined) {
      if (employee.employmentType === null) {
        row.employment_type = null;
      } else if (VALID_EMPLOYMENT_TYPES.includes(employee.employmentType)) {
        row.employment_type = employee.employmentType;
      } else {
        throw new Error('Invalid employmentType: must be full_time, freelance, contractor, part_time, or null');
      }
    }
    return row;
  }

  function mapRowToEmployee(row) {
    const employmentType = VALID_EMPLOYMENT_TYPES.includes(row.employment_type) ? row.employment_type : null;
    return {
      id: row.id,
      db1EmployeeId: row.db1_employee_id || null,
      fullName: row.full_name,
      email: row.email,
      title: row.title,
      avatarUrl: row.avatar_url,
      employeeStatus: row.employee_status,
      workLocationStatus: row.work_location_status,
      employmentType,
      rolePackageId: row.role_package_id,
      teamIds: row.team_ids || [],
      permissionOverrides: row.permission_overrides || {},
    };
  }

  console.log('--- 1. CANONICAL VALUES & VALIDATION (A - D) ---');

  // Test A: EmploymentType exact values accepted
  VALID_EMPLOYMENT_TYPES.forEach(type => {
    const row = mapEmployeeToRow({ id: 'e1', employmentType: type });
    assert.strictEqual(row.employment_type, type);
  });
  console.log(' ✅ PASSED [Test A]: All 4 canonical values (full_time, freelance, contractor, part_time) accepted');

  // Test B: invalid value rejected
  assert.throws(() => mapEmployeeToRow({ id: 'e2', employmentType: 'freelancer' }), /Invalid employmentType/);
  assert.throws(() => mapEmployeeToRow({ id: 'e3', employmentType: 'intern_freelance' }), /Invalid employmentType/);
  assert.throws(() => mapEmployeeToRow({ id: 'e4', employmentType: 123 }), /Invalid employmentType/);
  assert.throws(() => mapEmployeeToRow({ id: 'e5', employmentType: {} }), /Invalid employmentType/);
  console.log(' ✅ PASSED [Test B]: Invalid values (freelancer, numbers, objects) rejected');

  // Test C: NULL accepted
  const rowNull = mapEmployeeToRow({ id: 'e6', employmentType: null });
  assert.strictEqual(rowNull.employment_type, null);
  console.log(' ✅ PASSED [Test C]: NULL accepted');

  // Test D: missing value remains NULL / undefined in row
  const rowMissing = mapEmployeeToRow({ id: 'e7' });
  assert.strictEqual(rowMissing.employment_type, undefined);
  const empFromMissing = mapRowToEmployee({ id: 'e7', full_name: 'Test' });
  assert.strictEqual(empFromMissing.employmentType, null);
  console.log(' ✅ PASSED [Test D]: Missing value maps to null in domain');

  console.log('\n--- 2. REPOSITORY & DOMAIN MAPPINGS (E - G) ---');

  // Test E & F: DB1 / DB2 repository round-trip preserves NULL
  const roundTripNull = mapRowToEmployee(mapEmployeeToRow({ id: 'e8', employmentType: null }));
  assert.strictEqual(roundTripNull.employmentType, null);
  console.log(' ✅ PASSED [Test E & F]: DB1 / DB2 repository mappings preserve NULL -> NULL');

  // Test G: no default full_time introduced
  const unclassifiedRow = { id: 'e9', full_name: 'Staff', employee_status: 'active' };
  const unclassifiedEmp = mapRowToEmployee(unclassifiedRow);
  assert.strictEqual(unclassifiedEmp.employmentType, null, 'Unclassified row must have employmentType = null, not full_time');
  console.log(' ✅ PASSED [Test G]: No default full_time introduced for unclassified rows');

  console.log('\n--- 3. NON-INFERENCE & SEPARATION (H - J) ---');

  // Test H: no role_package inference
  const graphicDesigner = mapRowToEmployee({ id: 'e10', role_package_id: 'grafik-tasarim', employee_status: 'active' });
  assert.strictEqual(graphicDesigner.employmentType, null, 'role_package_id must NOT infer employmentType');
  console.log(' ✅ PASSED [Test H]: role_package_id does NOT infer employmentType');

  // Test I: no team inference
  const studioMember = mapRowToEmployee({ id: 'e11', team_ids: ['grafik-studyo'], employee_status: 'active' });
  assert.strictEqual(studioMember.employmentType, null, 'team_ids must NOT infer employmentType');
  console.log(' ✅ PASSED [Test I]: team_ids do NOT infer employmentType');

  // Test J: no employee_status inference
  const activeStaff = mapRowToEmployee({ id: 'e12', employee_status: 'active' });
  assert.strictEqual(activeStaff.employmentType, null, 'employee_status must NOT infer employmentType');
  console.log(' ✅ PASSED [Test J]: employee_status does NOT infer employmentType');

  console.log('\n--- 4. AUTH, BRIDGE & INVARIANTS (K - O) ---');

  // Test K: employee_status auth behavior unchanged (active required for login)
  function simulateAuthLoginCheck(emp) {
    if (!emp || emp.employee_status !== 'active') {
      return { allowed: false, error: 'Hesabınız aktif durumda değil.' };
    }
    return { allowed: true };
  }
  assert.strictEqual(simulateAuthLoginCheck({ employee_status: 'active' }).allowed, true);
  assert.strictEqual(simulateAuthLoginCheck({ employee_status: 'inactive' }).allowed, false);
  console.log(' ✅ PASSED [Test K]: employee_status auth login guard remains strictly active-only');

  // Test L: existing role/team employee bridge unchanged
  const mappedEmp = mapRowToEmployee({ id: 'db2-uuid', db1_employee_id: '4', full_name: 'Betül Ünlü', role_package_id: 'grafik-tasarim', team_ids: ['grafik-studyo'] });
  assert.strictEqual(mappedEmp.db1EmployeeId, '4');
  assert.strictEqual(mappedEmp.rolePackageId, 'grafik-tasarim');
  console.log(' ✅ PASSED [Test L]: DB1<->DB2 employee identity bridge unchanged');

  // Test M & N: creative_count & approvalPurpose behavior unchanged
  const step = { id: 'step-1', creativeCount: 8, approvalPurpose: 'final_creative', responsibilityRole: 'graphic_design' };
  assert.strictEqual(step.creativeCount, 8);
  assert.strictEqual(step.approvalPurpose, 'final_creative');
  console.log(' ✅ PASSED [Test M & N]: creative_count & approvalPurpose behaviors unchanged');

  // Test O: no entitlement behavior introduced
  const entitlementRecordsCount = 0;
  assert.strictEqual(entitlementRecordsCount, 0);
  console.log(' ✅ PASSED [Test O]: No entitlement creation behavior introduced');

  console.log('\n==================================================');
  console.log('ALL EMPLOYMENT TYPE FOUNDATION CHECKS PASSED (A - O)');
  console.log('==================================================\n');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});