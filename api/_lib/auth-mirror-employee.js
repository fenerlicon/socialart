import crypto from 'crypto';
import { getAdminSupabase, getSecondaryAdminSupabase } from './admin-db.js';
import { requireAdminSession } from './auth-me.js';
import { validateOrigin } from './admin-auth.js';
import { requireAdministrativeAuthority } from './admin-permissions.js';

/**
 * Core engine for mirroring an existing DB1 worker to DB2.
 * 
 * Invariants:
 * 1. DB1 is the source of truth for worker identity.
 * 2. Source worker MUST be identified by DB1 employees.id (never by name or email).
 * 3. DB2 mirror is created with exact db1_employee_id bridge.
 * 4. Idempotent: If an exact mirror already exists on DB2, returns safe no-op.
 * 5. Fail-closed: If DB1 employee missing or duplicate DB2 bridge exists, rejects without mutating.
 * 6. Zero login/credential impact: Never touches employee_auth_credentials.
 * 7. Zero Finance impact: Never touches finance tables.
 * 8. Zero DB1 mutation: DB1 is strictly read-only during this operation.
 */
export async function mirrorEmployeeToDb2({
  db1EmployeeId,
  db1 = getAdminSupabase(),
  db2 = getSecondaryAdminSupabase(),
}) {
  if (!db1EmployeeId || (typeof db1EmployeeId !== 'string' && typeof db1EmployeeId !== 'number')) {
    return {
      success: false,
      status: 400,
      error: 'Invalid payload: db1EmployeeId is required (string or number)',
    };
  }

  const cleanEmployeeId = String(db1EmployeeId).trim();
  if (!cleanEmployeeId) {
    return {
      success: false,
      status: 400,
      error: 'Invalid payload: db1EmployeeId cannot be empty',
    };
  }

  // 1. Fetch source employee from DB1 (source of truth)
  const { data: db1Emp, error: db1Err } = await db1
    .from('employees')
    .select('id, full_name, display_name, email, title, role_package_id, team_ids, employee_status, employment_type, permission_overrides, work_location_status')
    .eq('id', cleanEmployeeId)
    .maybeSingle();

  if (db1Err) {
    return {
      success: false,
      status: 500,
      error: `Database error querying DB1 employee: ${db1Err.message}`,
    };
  }

  if (!db1Emp) {
    return {
      success: false,
      status: 404,
      error: `Mapped DB1 employee not found for ID: ${cleanEmployeeId}`,
    };
  }

  // 2. Query DB2 mirror via exact db1_employee_id bridge
  const { data: db2Rows, error: db2QueryErr } = await db2
    .from('employees')
    .select('id, db1_employee_id, full_name, employment_type, role_package_id, team_ids, employee_status')
    .eq('db1_employee_id', String(db1Emp.id));

  if (db2QueryErr) {
    return {
      success: false,
      status: 500,
      error: `Database error querying DB2 employee mirror: ${db2QueryErr.message}`,
    };
  }

  // Idempotency: If exact mirror already exists
  if (Array.isArray(db2Rows) && db2Rows.length === 1) {
    const existing = db2Rows[0];
    return {
      success: true,
      status: 200,
      created: false,
      existing: true,
      db1EmployeeId: String(db1Emp.id),
      db2EmployeeId: existing.id,
      full_name: existing.full_name,
      employeeStatus: existing.employee_status,
      employmentType: existing.employment_type,
      rolePackageId: existing.role_package_id,
      teamIds: existing.team_ids,
    };
  }

  // Conflict: Ambiguous / duplicate bridge on DB2
  if (Array.isArray(db2Rows) && db2Rows.length > 1) {
    return {
      success: false,
      status: 409,
      error: `Ambiguous / duplicate DB2 employee mirror rows found for db1_employee_id: ${db1Emp.id}`,
    };
  }

  // 3. Create DB2 mirror row from DB1 source attributes
  const now = new Date().toISOString();
  const newDb2Payload = {
    id: crypto.randomUUID(),
    db1_employee_id: String(db1Emp.id),
    full_name: db1Emp.full_name || db1Emp.display_name || 'Personel',
    email: db1Emp.email ? db1Emp.email.trim().toLowerCase() : `worker-${db1Emp.id}@socialartajans.local`,
    title: db1Emp.title || 'Ekip Üyesi',
    role_package_id: db1Emp.role_package_id || '',
    team_ids: Array.isArray(db1Emp.team_ids) ? db1Emp.team_ids : [],
    employee_status: db1Emp.employee_status || 'active',
    employment_type: db1Emp.employment_type || null,
    permission_overrides: db1Emp.permission_overrides || {},
    work_location_status: db1Emp.work_location_status || 'office',
    created_at: now,
    updated_at: now,
  };

  const { data: insertedRows, error: insertErr } = await db2
    .from('employees')
    .insert([newDb2Payload])
    .select('id, db1_employee_id, full_name, employment_type, role_package_id, team_ids, employee_status');

  if (insertErr || !insertedRows || insertedRows.length === 0) {
    return {
      success: false,
      status: 500,
      error: `Failed to insert DB2 employee mirror: ${insertErr?.message || 'Unknown insertion failure'}`,
    };
  }

  // 4. Readback verification from DB2
  const { data: verifyRows, error: verifyErr } = await db2
    .from('employees')
    .select('id, db1_employee_id, full_name, employment_type, role_package_id, team_ids, employee_status')
    .eq('db1_employee_id', String(db1Emp.id));

  if (verifyErr || !verifyRows || verifyRows.length !== 1) {
    return {
      success: false,
      status: 500,
      error: 'DB2 mirror inserted but readback verification failed',
    };
  }

  const verified = verifyRows[0];

  return {
    success: true,
    status: 200,
    created: true,
    existing: false,
    db1EmployeeId: String(db1Emp.id),
    db2EmployeeId: verified.id,
    full_name: verified.full_name,
    employeeStatus: verified.employee_status,
    employmentType: verified.employment_type,
    rolePackageId: verified.role_package_id,
    teamIds: verified.team_ids,
  };
}

/**
 * POST /api/auth-mirror-employee
 * Authenticated Serverless Handler
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden Origin' });
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  // 1. Authenticate operator session
  const authState = await requireAdminSession(req);
  if (!authState) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  // 2. Authorize operator with Dedicated Admin or employees.manage / system.admin authority
  const authCheck = requireAdministrativeAuthority(authState, 'employees.manage');
  if (!authCheck.authorized) {
    return res.status(authCheck.status || 403).json({
      error: authCheck.error || 'Unauthorized: employees.manage permission required to mirror employees',
    });
  }

  const { db1EmployeeId } = req.body || {};

  try {
    const result = await mirrorEmployeeToDb2({
      db1EmployeeId,
      db1: getAdminSupabase(),
      db2: getSecondaryAdminSupabase(),
    });

    if (!result.success) {
      return res.status(result.status || 500).json({
        ok: false,
        error: result.error,
      });
    }

    return res.status(200).json({
      ok: true,
      created: result.created,
      existing: result.existing,
      db1EmployeeId: result.db1EmployeeId,
      db2EmployeeId: result.db2EmployeeId,
      full_name: result.full_name,
      employeeStatus: result.employeeStatus,
      employmentType: result.employmentType,
      rolePackageId: result.rolePackageId,
      teamIds: result.teamIds,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message || 'Internal Server Error during employee mirroring',
    });
  }
}