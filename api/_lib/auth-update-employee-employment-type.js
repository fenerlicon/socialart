import { getAdminSupabase, getSecondaryAdminSupabase } from './admin-db.js';
import { requireAdminSession } from './auth-me.js';
import { validateOrigin } from './admin-auth.js';

export const VALID_EMPLOYMENT_TYPES = new Set(['full_time', 'freelance', 'contractor', 'part_time']);

/**
 * Core engine for mutating DB1 employment_type (source-of-truth) and mirroring to DB2.
 * 
 * Invariants:
 * 1. DB1 is the canonical HR authority.
 * 2. DB2 is the Operations mirror.
 * 3. Atomic two-phase write: DB1 written and verified first; then DB2 written and verified.
 * 4. If DB2 write/verification fails, DB1 is rolled back to its exact prior snapshot.
 * 5. Returns explicit critical error if rollback verification fails.
 */
export async function syncEmployeeEmploymentType({
  employeeId,
  employmentType,
  db1 = getAdminSupabase(),
  db2 = getSecondaryAdminSupabase(),
  actorEmployeeId = null,
}) {
  if (!employeeId || (typeof employeeId !== 'string' && typeof employeeId !== 'number')) {
    return {
      success: false,
      status: 400,
      error: 'Invalid payload: employeeId is required (string or number)',
    };
  }

  const cleanEmployeeId = String(employeeId).trim();
  if (!cleanEmployeeId) {
    return {
      success: false,
      status: 400,
      error: 'Invalid payload: employeeId cannot be empty',
    };
  }

  // Validate employmentType: must be null or in VALID_EMPLOYMENT_TYPES
  const targetEmploymentType = employmentType === undefined || employmentType === null ? null : employmentType;
  if (targetEmploymentType !== null && !VALID_EMPLOYMENT_TYPES.has(targetEmploymentType)) {
    return {
      success: false,
      status: 400,
      error: `Invalid employmentType: must be one of [${Array.from(VALID_EMPLOYMENT_TYPES).join(', ')}] or null`,
    };
  }

  // 1. Resolve DB1 employee (Source of Truth)
  const { data: db1Emp, error: db1FetchErr } = await db1
    .from('employees')
    .select('id, full_name, email, role_package_id, team_ids, employee_status, employment_type')
    .eq('id', cleanEmployeeId)
    .maybeSingle();

  if (db1FetchErr || !db1Emp) {
    return {
      success: false,
      status: 404,
      error: 'Target employee not found in DB1 source of truth',
    };
  }

  // 2. Resolve DB2 mirror employee uniquely via exact db1_employee_id bridge
  const { data: db2Emps, error: db2FetchErr } = await db2
    .from('employees')
    .select('id, db1_employee_id, full_name, employment_type, role_package_id, team_ids, employee_status')
    .eq('db1_employee_id', String(db1Emp.id));

  if (db2FetchErr) {
    return {
      success: false,
      status: 500,
      error: 'Failed to query DB2 employee mirror table: ' + db2FetchErr.message,
    };
  }

  if (!db2Emps || db2Emps.length === 0) {
    return {
      success: false,
      status: 422,
      error: `Mapped DB2 employee mirror row not found for db1_employee_id: ${db1Emp.id}`,
    };
  }

  if (db2Emps.length > 1) {
    return {
      success: false,
      status: 409,
      error: `Ambiguous / duplicate DB2 employee mirror rows found for db1_employee_id: ${db1Emp.id}`,
    };
  }

  const db2Emp = db2Emps[0];

  // 3. Snapshot BEFORE values
  const beforeDB1 = db1Emp.employment_type === undefined ? null : db1Emp.employment_type;
  const beforeDB2 = db2Emp.employment_type === undefined ? null : db2Emp.employment_type;

  // 4. Same-value No-op check (both DB1 and DB2 already equal target)
  if (beforeDB1 === targetEmploymentType && beforeDB2 === targetEmploymentType) {
    return {
      success: true,
      status: 200,
      noop: true,
      employeeId: db1Emp.id,
      db1EmployeeId: String(db1Emp.id),
      db2EmployeeId: db2Emp.id,
      fullName: db1Emp.full_name,
      employmentType: targetEmploymentType,
      mirrored: true,
      message: 'No changes required (already in sync)',
    };
  }

  const now = new Date().toISOString();

  // 5. Phase 1: Write DB1 (Source of Truth)
  const { error: db1UpdateErr } = await db1
    .from('employees')
    .update({
      employment_type: targetEmploymentType,
      updated_at: now,
    })
    .eq('id', db1Emp.id);

  if (db1UpdateErr) {
    return {
      success: false,
      status: 500,
      error: 'Failed to update DB1 source-of-truth: ' + db1UpdateErr.message,
    };
  }

  // Read-back DB1 to verify write
  const { data: db1Verify, error: db1VerifyErr } = await db1
    .from('employees')
    .select('employment_type')
    .eq('id', db1Emp.id)
    .maybeSingle();

  if (db1VerifyErr || !db1Verify || (db1Verify.employment_type ?? null) !== targetEmploymentType) {
    return {
      success: false,
      status: 500,
      error: 'DB1 source-of-truth write verification failed',
    };
  }

  // 6. Phase 2: Write DB2 (Operations Mirror)
  const { error: db2UpdateErr } = await db2
    .from('employees')
    .update({
      employment_type: targetEmploymentType,
      updated_at: now,
    })
    .eq('id', db2Emp.id);

  if (db2UpdateErr) {
    // Attempt rollback on DB1
    const { error: rbErr } = await db1
      .from('employees')
      .update({
        employment_type: beforeDB1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', db1Emp.id);

    const { data: rbVerify } = await db1
      .from('employees')
      .select('employment_type')
      .eq('id', db1Emp.id)
      .maybeSingle();

    if (!rbErr && rbVerify && (rbVerify.employment_type ?? null) === beforeDB1) {
      return {
        success: false,
        status: 500,
        error: `DB2 mirror update failed (${db2UpdateErr.message}). DB1 source-of-truth was rolled back to previous state.`,
        rolledBack: true,
        rollbackSuccess: true,
      };
    } else {
      return {
        success: false,
        status: 500,
        error: `CRITICAL_SYNC_INCONSISTENCY: DB2 mirror failed (${db2UpdateErr.message}) and DB1 rollback could not be verified.`,
        criticalInconsistency: true,
      };
    }
  }

  // Read-back DB2 to verify mirror write
  const { data: db2Verify, error: db2VerifyErr } = await db2
    .from('employees')
    .select('employment_type')
    .eq('id', db2Emp.id)
    .maybeSingle();

  if (db2VerifyErr || !db2Verify || (db2Verify.employment_type ?? null) !== targetEmploymentType) {
    // Attempt rollback on DB1
    const { error: rbErr } = await db1
      .from('employees')
      .update({
        employment_type: beforeDB1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', db1Emp.id);

    const { data: rbVerify } = await db1
      .from('employees')
      .select('employment_type')
      .eq('id', db1Emp.id)
      .maybeSingle();

    if (!rbErr && rbVerify && (rbVerify.employment_type ?? null) === beforeDB1) {
      return {
        success: false,
        status: 500,
        error: 'DB2 mirror verification failed. DB1 source-of-truth was rolled back to previous state.',
        rolledBack: true,
        rollbackSuccess: true,
      };
    } else {
      return {
        success: false,
        status: 500,
        error: 'CRITICAL_SYNC_INCONSISTENCY: DB2 mirror verification failed and DB1 rollback could not be verified.',
        criticalInconsistency: true,
      };
    }
  }

  // 7. Final Verification of Parity
  return {
    success: true,
    status: 200,
    employeeId: db1Emp.id,
    db1EmployeeId: String(db1Emp.id),
    db2EmployeeId: db2Emp.id,
    fullName: db1Emp.full_name,
    employmentType: targetEmploymentType,
    previousEmploymentType: beforeDB1,
    mirrored: true,
    actorEmployeeId: actorEmployeeId || null,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden Origin' });
  }

  // 1. Authenticate operator session
  const authState = await requireAdminSession(req);
  if (!authState) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  // 2. Authorize operator with employees.manage or system.admin
  const operatorPermissions = authState.permissions || [];
  const hasPermission = operatorPermissions.includes('employees.manage') || operatorPermissions.includes('system.admin');

  if (!hasPermission) {
    return res.status(403).json({ error: 'Unauthorized: employees.manage or system.admin permission required' });
  }

  // 3. Extract payload
  const { employeeId, employmentType } = req.body || {};

  // 4. Run sync mutation
  const result = await syncEmployeeEmploymentType({
    employeeId,
    employmentType,
    actorEmployeeId: authState.employeeId || null,
  });

  if (!result.success) {
    return res.status(result.status || 500).json({ error: result.error, ...result });
  }

  return res.status(200).json({
    ok: true,
    ...result,
  });
}