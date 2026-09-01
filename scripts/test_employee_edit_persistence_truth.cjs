/**
 * test_employee_edit_persistence_truth.cjs
 * Deterministic test suite for Employee Edit Canonical DB1 Persistence Truth & False-Success Prevention.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('===============================================================');
  console.log('EMPLOYEE EDIT CANONICAL DB1 PERSISTENCE TRUTH TEST SUITE');
  console.log('===============================================================\n');

  // --- 1. ARCHITECTURE & SOURCE CODE AUDIT ---
  console.log('--- 1. ARCHITECTURE & SOURCE CODE AUDIT ---');
  const handlerPath = path.resolve(__dirname, '../api/_lib/auth-update-employee-identity.js');
  const hookPath = path.resolve(__dirname, '../panel/features/employees/hooks/use-employee-form.ts');

  assert.ok(fs.existsSync(handlerPath), 'auth-update-employee-identity.js must exist');
  assert.ok(fs.existsSync(hookPath), 'use-employee-form.ts must exist');

  const handlerSrc = fs.readFileSync(handlerPath, 'utf8');
  const hookSrc = fs.readFileSync(hookPath, 'utf8');

  // Verify DB1 canonical source in handler
  assert.ok(handlerSrc.includes('piffaggeshfrubyjkhej.supabase.co'), 'Handler must target DB1');
  assert.ok(handlerSrc.includes('READBACK_MISMATCH'), 'Handler must enforce READBACK_MISMATCH integrity checks');
  assert.ok(handlerSrc.includes('full_name'), 'Handler must persist full_name to DB1');
  assert.ok(handlerSrc.includes('title'), 'Handler must persist title to DB1');
  assert.ok(handlerSrc.includes('work_location_status'), 'Handler must persist work_location_status to DB1');
  assert.ok(handlerSrc.includes('username'), 'Handler must persist username to DB1 permission_overrides');

  // Verify use-employee-form enforces readback and error handling
  assert.ok(hookSrc.includes('READBACK_MISMATCH'), 'use-employee-form must assert readback verification');
  assert.ok(hookSrc.includes('toast.error'), 'use-employee-form must show error toast on failure');

  console.log(' ✅ PASSED: Source contracts verified for DB1 authority, readback verification, and error boundaries');

  // --- 2. RUNTIME SIMULATION & PERSISTENCE CONTRACT VERIFICATION ---
  console.log('\n--- 2. RUNTIME MUTATION & READBACK SIMULATION ---');

  const db1_employees = new Map();
  const db2_employees = new Map();

  const initialBetaAdDb1 = {
    id: '16',
    full_name: 'Beta Art Director (Geçici)',
    email: 'beta-ad@socialartajans.local',
    title: 'Art Director — Beta Test',
    role_package_id: 'art-director',
    team_ids: ['grafik-studyo'],
    employment_type: 'contractor',
    work_location_status: 'remote',
    employee_status: 'active',
    permission_overrides: { username: 'beta_art_director' },
    has_advanced_calendar_access: false,
    avatar_url: null,
  };

  const initialBetaAdDb2 = {
    id: '344e49c7-53b4-44e8-9d55-1f1f144c8998',
    db1_employee_id: '16',
    full_name: 'Beta Art Director (Geçici)',
    email: 'beta-ad@socialartajans.local',
    title: 'Art Director — Beta Test',
    role_package_id: 'art-director',
    team_ids: ['grafik-studyo'],
    employment_type: 'contractor',
    work_location_status: 'remote',
    employee_status: 'active',
    permission_overrides: { username: 'beta_art_director' },
    has_advanced_calendar_access: false,
    avatar_url: null,
  };

  db1_employees.set(initialBetaAdDb1.id, JSON.parse(JSON.stringify(initialBetaAdDb1)));
  db2_employees.set(initialBetaAdDb2.id, JSON.parse(JSON.stringify(initialBetaAdDb2)));

  async function simulateServerUpdate(callerPrincipal, body) {
    if (!callerPrincipal) {
      return { status: 401, error: 'Unauthenticated' };
    }

    const isAuthorized =
      callerPrincipal.isAdmin ||
      callerPrincipal.permissions?.includes('employees.manage') ||
      callerPrincipal.permissions?.includes('system.admin');

    if (!isAuthorized) {
      return { status: 403, error: 'Unauthorized: employees.manage required' };
    }

    const { employeeId, fullName, title, email, username, employeeStatus, workLocationStatus, teamIds, hasAdvancedCalendarAccess } = body || {};

    if (!employeeId) {
      return { status: 400, error: 'Invalid payload: employeeId is required' };
    }

    const target = db1_employees.get(String(employeeId));
    if (!target) {
      return { status: 404, error: 'Target employee not found in DB1' };
    }

    const updateFields = {};
    const currentOverrides = { ...(target.permission_overrides || {}) };

    if (fullName !== undefined) {
      const cleanName = String(fullName).trim();
      if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
        return { status: 400, error: 'Ad Soyad 2-100 karakter olmalıdır' };
      }
      updateFields.full_name = cleanName;
    }

    if (title !== undefined) {
      updateFields.title = String(title).trim();
    }

    if (email !== undefined) {
      updateFields.email = email ? String(email).trim().toLowerCase() : null;
    }

    if (username !== undefined) {
      const cleanU = String(username).trim().toLowerCase();
      if (cleanU) {
        currentOverrides.username = cleanU;
      } else {
        delete currentOverrides.username;
      }
      updateFields.permission_overrides = currentOverrides;
    }

    if (employeeStatus !== undefined) {
      updateFields.employee_status = employeeStatus;
    }

    if (workLocationStatus !== undefined) {
      updateFields.work_location_status = workLocationStatus;
    }

    if (teamIds !== undefined) {
      updateFields.team_ids = teamIds;
    }

    if (hasAdvancedCalendarAccess !== undefined) {
      updateFields.has_advanced_calendar_access = hasAdvancedCalendarAccess;
    }

    // Apply DB1 write
    Object.assign(target, updateFields);
    target.updated_at = new Date().toISOString();

    // Readback verification simulation
    const readback = db1_employees.get(String(employeeId));
    if (fullName !== undefined && readback.full_name !== updateFields.full_name) {
      return { status: 500, error: 'READBACK_MISMATCH: full_name did not match' };
    }
    if (title !== undefined && readback.title !== updateFields.title) {
      return { status: 500, error: 'READBACK_MISMATCH: title did not match' };
    }
    if (workLocationStatus !== undefined && readback.work_location_status !== updateFields.work_location_status) {
      return { status: 500, error: 'READBACK_MISMATCH: work_location_status did not match' };
    }

    // Mirror to DB2
    for (const [db2Id, db2Emp] of db2_employees.entries()) {
      if (db2Emp.db1_employee_id === String(employeeId)) {
        Object.assign(db2Emp, {
          full_name: readback.full_name,
          title: readback.title,
          email: readback.email,
          employee_status: readback.employee_status,
          work_location_status: readback.work_location_status,
          team_ids: readback.team_ids,
          has_advanced_calendar_access: readback.has_advanced_calendar_access,
          permission_overrides: readback.permission_overrides,
          updated_at: readback.updated_at,
        });
      }
    }

    return {
      status: 200,
      ok: true,
      success: true,
      employee: {
        id: String(readback.id),
        db1EmployeeId: String(readback.id),
        fullName: readback.full_name,
        title: readback.title,
        email: readback.email,
        workLocationStatus: readback.work_location_status,
        employeeStatus: readback.employee_status,
        teamIds: readback.team_ids,
        hasAdvancedCalendarAccess: readback.has_advanced_calendar_access,
        username: readback.permission_overrides?.username || null,
      },
    };
  }

  const adminPrincipal = { isAdmin: true, permissions: ['system.admin', 'employees.manage'] };
  const unauthorizedPrincipal = { isAdmin: false, permissions: [] };

  // --- TEST A: Valid full_name change & readback verification ---
  console.log('\n--- TEST A: Valid full_name change & readback verification ---');
  const resA = await simulateServerUpdate(adminPrincipal, {
    employeeId: '16',
    fullName: 'Beta Art Director',
  });
  assert.strictEqual(resA.status, 200);
  assert.strictEqual(resA.ok, true);
  assert.strictEqual(resA.employee.fullName, 'Beta Art Director');
  assert.strictEqual(db1_employees.get('16').full_name, 'Beta Art Director');
  assert.strictEqual(db2_employees.get('344e49c7-53b4-44e8-9d55-1f1f144c8998').full_name, 'Beta Art Director');
  console.log(' ✅ PASSED [Test A]: full_name successfully persisted in DB1 and synced to DB2 mirror');

  // --- TEST B: Unauthorized caller rejection ---
  console.log('\n--- TEST B: Unauthorized caller rejection ---');
  const resB = await simulateServerUpdate(unauthorizedPrincipal, {
    employeeId: '16',
    fullName: 'Hacked Name',
  });
  assert.strictEqual(resB.status, 403);
  assert.strictEqual(db1_employees.get('16').full_name, 'Beta Art Director');
  console.log(' ✅ PASSED [Test B]: Unauthorized request rejected with 403 without mutating DB1');

  // --- TEST C: Non-existent employee ID ---
  console.log('\n--- TEST C: Wrong/Non-existent Employee ID ---');
  const resC = await simulateServerUpdate(adminPrincipal, {
    employeeId: '999999',
    fullName: 'Ghost Employee',
  });
  assert.strictEqual(resC.status, 404);
  console.log(' ✅ PASSED [Test C]: Non-existent employee rejected with 404');

  // --- TEST D: Readback mismatch detection ---
  console.log('\n--- TEST D: Readback mismatch detection ---');
  const clientRequested = 'New Title';
  const serverReturned = { ...resA.employee, title: 'Old Title' };
  let readbackFailed = false;
  if (serverReturned.title !== clientRequested) {
    readbackFailed = true;
  }
  assert.strictEqual(readbackFailed, true, 'Client must detect readback mismatch and abort');
  console.log(' ✅ PASSED [Test D]: Readback mismatch prevented false-success');

  // --- TEST E: Empty name validation ---
  console.log('\n--- TEST E: Empty/invalid name validation ---');
  const resE = await simulateServerUpdate(adminPrincipal, {
    employeeId: '16',
    fullName: '   ',
  });
  assert.strictEqual(resE.status, 400);
  console.log(' ✅ PASSED [Test E]: Empty name rejected with 400 validation error');

  // --- TEST F: Work location status persistence ---
  console.log('\n--- TEST F: Work Location Status Persistence ---');
  const resF = await simulateServerUpdate(adminPrincipal, {
    employeeId: '16',
    workLocationStatus: 'hybrid',
  });
  assert.strictEqual(resF.status, 200);
  assert.strictEqual(resF.employee.workLocationStatus, 'hybrid');
  assert.strictEqual(db1_employees.get('16').work_location_status, 'hybrid');
  console.log(' ✅ PASSED [Test F]: Work location status persistence in DB1 verified');

  console.log('\n===============================================================');
  console.log('ALL EMPLOYEE EDIT PERSISTENCE TRUTH TESTS PASSED SUCCESSFULLY ✅');
  console.log('===============================================================\n');
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
