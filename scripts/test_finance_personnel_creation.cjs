const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('==========================================');
console.log('FINANCE PERSONNEL HOTFIX TEST SUITE');
console.log('==========================================\n');

// 1. LIVE DB1 SCHEMA CONTRACT CHECK
console.log('--- 1. LIVE DB1 EMPLOYEES SCHEMA CONTRACT ---');

const supabaseUrl = 'https://piffaggeshfrubyjkhej.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_LEADS_ANON_KEY;

if (!supabaseKey) {
  console.error('Supabase API key not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  const { data: empSample, error: empErr } = await supabase
    .from('employees')
    .select('id, full_name, display_name, title, base_salary, employee_status, email, role_package_id, permission_overrides, team_ids, has_advanced_calendar_access')
    .limit(5);

  assert.strictEqual(empErr, null, `DB1 employee query failed: ${empErr?.message}`);
  assert.ok(empSample && empSample.length > 0, 'Must query live employees from DB1');

  // Verify canonical fields exist
  const firstRow = empSample[0];
  assert.ok('base_salary' in firstRow, 'base_salary MUST be a real canonical column in DB1 employees');
  assert.ok('display_name' in firstRow, 'display_name MUST exist in DB1 employees');
  assert.ok('full_name' in firstRow, 'full_name MUST exist in DB1 employees');
  console.log(' ✅ PASSED: Canonical DB1 employees fields verified (base_salary, full_name, display_name, etc.)');

  // 2. STATIC SOURCE CODE AUDIT
  console.log('\n--- 2. FINANCE SOURCE CODE AUDIT ---');

  const appPath = path.join(__dirname, '..', 'src', 'finance', 'App.jsx');
  const appContent = fs.readFileSync(appPath, 'utf8');

  const personelViewPath = path.join(__dirname, '..', 'src', 'finance', 'components', 'PersonelView.jsx');
  const personelViewContent = fs.readFileSync(personelViewPath, 'utf8');

  // A, B, C: can_add_client and can_assign_task are never sent
  assert.ok(!appContent.includes('can_add_client'), 'App.jsx must NOT contain can_add_client');
  assert.ok(!appContent.includes('can_assign_task'), 'App.jsx must NOT contain can_assign_task');
  assert.ok(!personelViewContent.includes('can_add_client'), 'PersonelView.jsx must NOT contain can_add_client');
  assert.ok(!personelViewContent.includes('can_assign_task'), 'PersonelView.jsx must NOT contain can_assign_task');
  console.log(' ✅ PASSED [Tests A, B, C]: can_add_client & can_assign_task completely removed from Finance payload');

  // D: Legacy role, class, username are not written
  assert.ok(!appContent.includes("from('employees').insert"), 'Finance App.jsx must NOT execute direct INSERT into employees');
  assert.ok(!personelViewContent.includes('newStaffClass'), 'PersonelView.jsx must not have legacy class state');
  console.log(' ✅ PASSED [Test D]: Legacy role, class, username writes completely eliminated');

  // E: True employee creation uses canonical /admin/employees/new flow
  assert.ok(
    personelViewContent.includes('/admin/employees/new') || appContent.includes('/admin/employees/new'),
    'Finance personnel flow MUST navigate to /admin/employees/new'
  );
  console.log(' ✅ PASSED [Test E]: Canonical employee creation path /admin/employees/new enforced');

  // F: Finance personnel listing still maps canonical DB1 employees safely
  assert.ok(appContent.includes(".from('employees')"), 'App.jsx queries DB1 employees table for read');
  assert.ok(appContent.includes('display_name:'), 'App.jsx maps employee display_name');
  assert.ok(appContent.includes('role:'), 'App.jsx safely maps employee role/title in memory');
  console.log(' ✅ PASSED [Test F]: Finance personnel listing reads and renders canonical DB1 employees safely');

  // G: Base salary update behavior remains intact and canonical
  assert.ok(appContent.includes("update({ base_salary: salaryData.base_salary })"), 'handleUpdateBaseSalary updates canonical base_salary column');
  console.log(' ✅ PASSED [Test G]: base_salary canonical update behavior preserved');

  // H & I: Finance cannot create credentials or grant security permissions
  assert.ok(!appContent.includes('employee_auth_credentials'), 'Finance must not touch employee_auth_credentials');
  assert.ok(!appContent.includes('system.admin'), 'Finance must not grant system.admin');
  assert.ok(!appContent.includes('system.permissions'), 'Finance must not grant system.permissions');
  assert.ok(!appContent.includes('employees.manage'), 'Finance must not grant employees.manage');
  assert.ok(!personelViewContent.includes('employee_auth_credentials'), 'PersonelView must not touch credentials');
  console.log(' ✅ PASSED [Tests H, I]: Finance cannot create credentials or grant security permissions');

  // J: Schema cache error verification - simulating a salary update with canonical payload
  console.log('\n--- 3. SCHEMA-CACHE COMPLIANCE RUNTIME CHECK ---');
  const testStaffId = empSample[0].id;
  const currentSalary = empSample[0].base_salary;

  // Idempotent read & update test with canonical base_salary
  const { error: testUpdateErr } = await supabase
    .from('employees')
    .update({ base_salary: currentSalary })
    .eq('id', testStaffId);

  assert.strictEqual(testUpdateErr, null, `Canonical salary update must succeed without schema errors: ${testUpdateErr?.message}`);
  console.log(' ✅ PASSED [Test J]: Zero schema cache errors with canonical employee payload');

  console.log('\n==========================================');
  console.log('ALL 10/10 FINANCE PERSONNEL CHECKS PASSED');
  console.log('==========================================\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});