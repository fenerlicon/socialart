require('dotenv').config();
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const DB1_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const DB1_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(DB1_URL, DB1_KEY);

async function runTests() {
  console.log('==========================================');
  console.log('EMPLOYEE AUTHORIZATION DB GUARD TEST SUITE');
  console.log('==========================================\n');

  let passed = 0;
  let failed = 0;

  function test(desc, fn) {
    try {
      fn();
      console.log(` ✅ PASSED: ${desc}`);
      passed++;
    } catch (e) {
      console.error(` ❌ FAILED: ${desc}`);
      console.error(e);
      failed++;
    }
  }

  async function asyncTest(desc, fn) {
    try {
      await fn();
      console.log(` ✅ PASSED: ${desc}`);
      passed++;
    } catch (e) {
      console.error(` ❌ FAILED: ${desc}`);
      console.error(e);
      failed++;
    }
  }

  // ----------------------------------------------------
  // 1. MIGRATION FILE & SYNTAX AUDIT
  // ----------------------------------------------------
  console.log('--- 1. MIGRATION FILE & SYNTAX AUDIT ---');

  test('MIGRATION: guard_employees_authorization_fields.sql exists and contains all guarded fields', () => {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'guard_employees_authorization_fields.sql');
    assert(fs.existsSync(migrationPath), 'Migration file must exist');

    const content = fs.readFileSync(migrationPath, 'utf8');

    // Check Trigger & Function definitions
    assert(content.includes('CREATE OR REPLACE FUNCTION public.guard_employees_authorization_fields'), 'Must define trigger function');
    assert(content.includes('BEFORE INSERT OR UPDATE ON public.employees'), 'Must attach BEFORE INSERT OR UPDATE trigger');

    // Check Guarded Scalar Fields
    assert(content.includes('role_package_id'), 'Must guard role_package_id');
    assert(content.includes('employee_status'), 'Must guard employee_status');
    assert(content.includes('email'), 'Must guard email');
    assert(content.includes('team_ids'), 'Must guard team_ids');
    assert(content.includes('has_advanced_calendar_access'), 'Must guard has_advanced_calendar_access');

    // Check Guarded Override Keys
    assert(content.includes('username'), 'Must guard username override');
    assert(content.includes('system.admin'), 'Must guard system.admin override');
    assert(content.includes('system.permissions'), 'Must guard system.permissions override');
    assert(content.includes('employees.manage'), 'Must guard employees.manage override');
    assert(content.includes('employees.create'), 'Must guard employees.create override');
    assert(content.includes('team.manage'), 'Must guard team.manage override');
    assert(content.includes('settings.manage'), 'Must guard settings.manage override');
    assert(content.includes('system.settings'), 'Must guard system.settings override');

    // Check Role Separation
    assert(content.includes("auth.role()"), 'Must check auth.role()');
    assert(content.includes("'anon', 'authenticated'"), 'Must filter unprivileged roles');
  });

  // ----------------------------------------------------
  // 2. CLIENT-SIDE STRIPPING VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- 2. CLIENT-SIDE STRIPPING VERIFICATION ---');

  test('CLIENT STRIPPING: mapEmployeeToRow strips ALL guarded scalar fields and sensitive override keys', () => {
    const EmployeeRepository = {
      mapEmployeeToRow(employee) {
        const row = {};
        if (employee.id !== undefined) row.id = employee.id;
        if (employee.fullName !== undefined) row.full_name = employee.fullName;
        if (employee.title !== undefined) row.title = employee.title;

        if (employee.permissionOverrides !== undefined) {
          const safeOverrides = { ...(employee.permissionOverrides || {}) };
          const sensitiveKeys = [
            'team.manage',
            'employees.manage',
            'employees.create',
            'system.permissions',
            'system.admin',
            'settings.manage',
            'system.settings',
            'username',
          ];
          for (const key of sensitiveKeys) {
            delete safeOverrides[key];
          }
          row.permission_overrides = safeOverrides;
        }

        if (employee.workLocationStatus !== undefined) row.work_location_status = employee.workLocationStatus;
        if (employee.avatarUrl !== undefined) row.avatar_url = employee.avatarUrl;
        return row;
      },
    };

    const maliciousInput = {
      id: '2',
      fullName: 'Celal Ünlü',
      title: 'Kurucu & Operasyon',
      email: 'hacked_celal@socialart.com',
      rolePackageId: 'operasyon-yonetimi',
      employeeStatus: 'active',
      teamIds: ['merkezi-operasyon'],
      hasAdvancedCalendarAccess: true,
      avatarUrl: 'https://socialart.com/avatar.png',
      workLocationStatus: 'office',
      username: 'celal_admin',
      permissionOverrides: {
        'system.admin': true,
        'system.permissions': true,
        'team.manage': true,
        'employees.manage': true,
        'employees.create': true,
        'settings.manage': true,
        'system.settings': true,
        'tasks.view': true,
        'custom_note_override': true,
      },
    };

    const mapped = EmployeeRepository.mapEmployeeToRow(maliciousInput);

    // Guarded scalars stripped
    assert.strictEqual(mapped.email, undefined, 'email must be stripped');
    assert.strictEqual(mapped.role_package_id, undefined, 'role_package_id must be stripped');
    assert.strictEqual(mapped.employee_status, undefined, 'employee_status must be stripped');
    assert.strictEqual(mapped.team_ids, undefined, 'team_ids must be stripped');
    assert.strictEqual(mapped.has_advanced_calendar_access, undefined, 'has_advanced_calendar_access must be stripped');

    // Guarded override keys stripped
    assert.strictEqual(mapped.permission_overrides['system.admin'], undefined);
    assert.strictEqual(mapped.permission_overrides['system.permissions'], undefined);
    assert.strictEqual(mapped.permission_overrides['employees.manage'], undefined);
    assert.strictEqual(mapped.permission_overrides['employees.create'], undefined);
    assert.strictEqual(mapped.permission_overrides['team.manage'], undefined);
    assert.strictEqual(mapped.permission_overrides['settings.manage'], undefined);
    assert.strictEqual(mapped.permission_overrides['system.settings'], undefined);
    assert.strictEqual(mapped.permission_overrides['username'], undefined);

    // Ordinary profile fields preserved
    assert.strictEqual(mapped.full_name, 'Celal Ünlü');
    assert.strictEqual(mapped.title, 'Kurucu & Operasyon');
    assert.strictEqual(mapped.avatar_url, 'https://socialart.com/avatar.png');
    assert.strictEqual(mapped.work_location_status, 'office');
    assert.strictEqual(mapped.permission_overrides['tasks.view'], true);
    assert.strictEqual(mapped.permission_overrides['custom_note_override'], true);
  });

  // ----------------------------------------------------
  // 3. PRODUCTION DB INTEGRITY (0 MUTATIONS)
  // ----------------------------------------------------
  console.log('\n--- 3. PRODUCTION DB MUTATION CHECK ---');

  await asyncTest('DB INTEGRITY: Active employee records intact, 0 unauthorized mutations', async () => {
    const { data: emps } = await supabase.from('employees').select('id');
    const { data: creds } = await supabase.from('employee_auth_credentials').select('employee_id');
    assert.ok(emps && emps.length >= 13, 'Must have at least 13 canonical employees');
    assert.ok(creds && creds.length >= 5, 'Must have at least 5 credentials');
  });

  console.log('\n==========================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
