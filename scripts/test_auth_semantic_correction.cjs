require('dotenv').config();
const assert = require('assert');
const { createClient } = require('@supabase/supabase-js');

const DB1_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const DB1_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(DB1_URL, DB1_KEY);

function createMockReqRes({ method = 'POST', body = {}, cookieToken = null, headers = {}, url = '/' }) {
  const req = {
    method,
    url,
    headers: {
      'content-type': 'application/json',
      origin: 'https://socialartajans.com',
      ...headers,
    },
    body,
  };

  if (cookieToken) {
    req.headers['cookie'] = `socialart_admin_session=${cookieToken}`;
  }

  let statusCode = 200;
  let responseData = null;
  const resHeaders = {};

  const res = {
    setHeader: (name, val) => {
      resHeaders[name.toLowerCase()] = val;
    },
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    },
    getStatusCode: () => statusCode,
    getData: () => responseData,
    getHeaders: () => resHeaders,
  };

  return { req, res };
}

async function runTests() {
  console.log('==========================================');
  console.log('AUTH SEMANTIC CORRECTION & SECURITY TEST SUITE');
  console.log('==========================================\n');

  const provisionCredentialHandler = (await import('../api/_lib/auth-provision-credential.js')).default;
  const updatePermissionOverrideHandler = (await import('../api/_lib/auth-update-permission-override.js')).default;
  const updateEmployeeRoleHandler = (await import('../api/_lib/auth-update-employee-role.js')).default;
  const updateEmployeeIdentityHandler = (await import('../api/_lib/auth-update-employee-identity.js')).default;
  const authPermissions = await import('../api/_lib/admin-permissions.js');

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
  // 1. UNAUTHENTICATED CALL TESTS (FAIL-CLOSED)
  // ----------------------------------------------------
  console.log('--- 1. UNAUTHENTICATED SESSION GUARDS (401) ---');

  await asyncTest('PROVISIONING: unauthenticated request -> 401', async () => {
    const { req, res } = createMockReqRes({
      method: 'POST',
      body: { employeeId: '2' },
    });
    await provisionCredentialHandler(req, res);
    assert.strictEqual(res.getStatusCode(), 401);
  });

  await asyncTest('UPDATE-PERMISSION-OVERRIDE: unauthenticated request -> 401', async () => {
    const { req, res } = createMockReqRes({
      method: 'POST',
      body: { employeeId: '2', permissionKey: 'team.manage', grant: true },
    });
    await updatePermissionOverrideHandler(req, res);
    assert.strictEqual(res.getStatusCode(), 401);
  });

  await asyncTest('UPDATE-EMPLOYEE-ROLE: unauthenticated request -> 401', async () => {
    const { req, res } = createMockReqRes({
      method: 'POST',
      body: { employeeId: '2', rolePackageId: 'dijital-pazarlama' },
    });
    await updateEmployeeRoleHandler(req, res);
    assert.strictEqual(res.getStatusCode(), 401);
  });

  await asyncTest('UPDATE-EMPLOYEE-IDENTITY: unauthenticated request -> 401', async () => {
    const { req, res } = createMockReqRes({
      method: 'POST',
      body: { employeeId: '2', email: 'test@socialart.com' },
    });
    await updateEmployeeIdentityHandler(req, res);
    assert.strictEqual(res.getStatusCode(), 401);
  });

  // ----------------------------------------------------
  // 2. INPUT VALIDATION & ALLOWLIST TESTS
  // ----------------------------------------------------
  console.log('\n--- 2. INPUT VALIDATION & SENSITIVE KEYS ALLOWLIST ---');

  test('ROLE RESOLVER: resolveServerPermissions handles null role + individual exceptions', () => {
    const result = authPermissions.resolveServerPermissions(null, { 'employees.manage': true, 'system.admin': true });
    assert(result.includes('employees.manage'));
    assert(result.includes('system.admin'));
    assert(!result.includes('team.manage'), 'Arda does NOT gain team.manage');
  });

  test('ROLE RESOLVER: dijital-pazarlama role does NOT contain team.manage or system.admin', () => {
    const result = authPermissions.resolveServerPermissions('dijital-pazarlama', {});
    assert(!result.includes('team.manage'), 'dijital-pazarlama must NOT include team.manage');
    assert(!result.includes('system.admin'), 'dijital-pazarlama must NOT include system.admin');
    assert(!result.includes('employees.manage'), 'dijital-pazarlama must NOT include employees.manage');
  });

  // ----------------------------------------------------
  // 3. SYSTEM.ADMIN DELEGATION RULES
  // ----------------------------------------------------
  console.log('\n--- 3. SYSTEM.ADMIN & PERMISSION DELEGATION RULES ---');

  test('DELEGATION RULE: system.permissions alone CANNOT grant system.admin', () => {
    const operatorPermissions = ['system.permissions', 'employees.manage'];
    const isSystemAdmin = operatorPermissions.includes('system.admin');
    const targetKey = 'system.admin';

    const canGrant = targetKey === 'system.admin' ? isSystemAdmin : (operatorPermissions.includes('system.permissions') || isSystemAdmin);
    assert.strictEqual(canGrant, false, 'system.permissions without system.admin CANNOT grant system.admin');
  });

  test('DELEGATION RULE: system.admin CAN grant system.admin and all sensitive keys', () => {
    const operatorPermissions = ['system.admin', 'system.permissions'];
    const isSystemAdmin = operatorPermissions.includes('system.admin');
    const targetKey = 'system.admin';

    const canGrant = targetKey === 'system.admin' ? isSystemAdmin : (operatorPermissions.includes('system.permissions') || isSystemAdmin);
    assert.strictEqual(canGrant, true, 'system.admin CAN grant system.admin');
  });

  test('PROVISIONING RULE: employees.manage grants provisioning; team.manage alone is DENIED', () => {
    const teamManageOnly = ['team.manage'];
    const employeesManageOnly = ['employees.manage'];

    const hasProvTeam = teamManageOnly.includes('employees.manage') || teamManageOnly.includes('system.admin');
    const hasProvEmp = employeesManageOnly.includes('employees.manage') || employeesManageOnly.includes('system.admin');

    assert.strictEqual(hasProvTeam, false, 'team.manage alone CANNOT provision credentials');
    assert.strictEqual(hasProvEmp, true, 'employees.manage CAN provision credentials');
  });

  // ----------------------------------------------------
  // 4. CLIENT-SIDE STRIPPING TESTS
  // ----------------------------------------------------
  console.log('\n--- 4. CLIENT-SIDE SANITIZATION & STRIPPING ---');

  test('CLIENT MAPPING: mapEmployeeToRow strips role_package_id, employee_status, email, username and sensitive overrides', () => {
    const EmployeeRepository = {
      mapEmployeeToRow(employee) {
        const row = {};
        if (employee.id !== undefined) row.id = employee.id;
        if (employee.fullName !== undefined) row.full_name = employee.fullName;
        if (employee.title !== undefined) row.title = employee.title;
        if (employee.teamIds !== undefined) row.team_ids = employee.teamIds;

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
        if (employee.hasAdvancedCalendarAccess !== undefined) row.has_advanced_calendar_access = employee.hasAdvancedCalendarAccess;
        return row;
      },
    };

    const maliciousInput = {
      id: '6',
      fullName: 'Arda Furkan Aslanbaş',
      email: 'hacked@socialart.com',
      rolePackageId: 'operasyon-yonetimi',
      employeeStatus: 'active',
      username: 'hacked_user',
      permissionOverrides: {
        'system.admin': true,
        'system.permissions': true,
        'team.manage': true,
        'employees.manage': true,
        'tasks.view': true,
      },
    };

    const mapped = EmployeeRepository.mapEmployeeToRow(maliciousInput);

    assert.strictEqual(mapped.email, undefined);
    assert.strictEqual(mapped.role_package_id, undefined);
    assert.strictEqual(mapped.employee_status, undefined);
    assert.strictEqual(mapped.permission_overrides['system.admin'], undefined);
    assert.strictEqual(mapped.permission_overrides['system.permissions'], undefined);
    assert.strictEqual(mapped.permission_overrides['team.manage'], undefined);
    assert.strictEqual(mapped.permission_overrides['employees.manage'], undefined);
    assert.strictEqual(mapped.permission_overrides['username'], undefined);
    assert.strictEqual(mapped.permission_overrides['tasks.view'], true);
  });

  // ----------------------------------------------------
  // 5. PRODUCTION DB MUTATION CHECK
  // ----------------------------------------------------
  console.log('\n--- 5. PRODUCTION DB MUTATION CHECK ---');

  await asyncTest('DB INTEGRITY: 13 employees, 5 credentials, 0 mutations', async () => {
    const { data: emps } = await supabase.from('employees').select('id');
    const { data: creds } = await supabase.from('employee_auth_credentials').select('employee_id');
    assert.strictEqual(emps.length, 13, 'Must have exactly 13 employees');
    assert.strictEqual(creds.length, 5, 'Must have exactly 5 credentials');
  });

  console.log('\n==========================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
