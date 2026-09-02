import { getAdminSupabase, getSecondaryAdminSupabase } from './admin-db.js';
import { requireAdminSession } from './auth-me.js';
import { requireAdministrativeAuthority } from './admin-permissions.js';
import { validateOrigin, hashPassword } from './admin-auth.js';
import { ROLE_PACKAGE_DEFINITIONS } from './role-package-seeds.js';

const VALID_ROLE_PACKAGES = new Set(ROLE_PACKAGE_DEFINITIONS.map((pkg) => pkg.id));
const VALID_STATUSES = new Set(['active', 'inactive', 'passive', 'probation', 'intern', 'part_time', 'freelance']);
const VALID_WORK_LOCATIONS = new Set(['office', 'remote', 'hybrid']);
const VALID_EMPLOYMENT_TYPES = new Set(['full_time', 'freelance', 'contractor', 'part_time']);

/**
 * POST /api/auth-create-employee
 * Server-authoritative new employee creation in DB1 canonical source of truth
 * followed by server-side DB2 mirror synchronization.
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

  // 1. Authenticate operator session
  const authState = await requireAdminSession(req);
  if (!authState) {
    return res.status(401).json({
      ok: false,
      error: 'Unauthenticated',
      metadata: { code: 'EMPLOYEE_CREATE_FAILED', stage: 'SESSION_AUTHENTICATION', target: 'AUTH', operation: 'AUTH' }
    });
  }

  // 2. Authorize operator with canonical administrative authority guard
  const authCheck = requireAdministrativeAuthority(authState, 'employees.manage');
  if (!authCheck.authorized) {
    return res.status(authCheck.status || 403).json({
      ok: false,
      error: authCheck.error || 'Unauthorized: employees.manage permission required',
      metadata: { code: 'EMPLOYEE_CREATE_FAILED', stage: 'AUTHORIZATION_GUARD', target: 'AUTH', operation: 'AUTH' }
    });
  }

  // 3. Validate request payload
  const {
    fullName,
    title,
    email,
    username,
    password,
    rolePackageId,
    teamIds,
    employmentType,
    workLocationStatus,
    employeeStatus,
    permissionOverrides,
    hasAdvancedCalendarAccess,
  } = req.body || {};

  // 3.1. Validate full_name
  if (!fullName || typeof fullName !== 'string') {
    return res.status(400).json({
      ok: false,
      error: 'Ad Soyad alanı zorunludur.',
      metadata: { code: 'EMPLOYEE_CREATE_FAILED', stage: 'PAYLOAD_VALIDATION', target: 'API', operation: 'VALIDATE' }
    });
  }
  const cleanFullName = fullName.trim();
  if (cleanFullName.length < 2 || cleanFullName.length > 100) {
    return res.status(400).json({
      ok: false,
      error: 'Ad Soyad 2 ile 100 karakter arasında olmalıdır.',
      metadata: { code: 'EMPLOYEE_CREATE_FAILED', stage: 'PAYLOAD_VALIDATION', target: 'API', operation: 'VALIDATE' }
    });
  }

  // 3.2. Validate title
  const cleanTitle = title && typeof title === 'string' ? title.trim() : 'Ekip Üyesi';

  // 3.3. Validate email
  let cleanEmail = null;
  if (email && typeof email === 'string') {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail.length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return res.status(400).json({
          ok: false,
          error: 'Geçerli bir e-posta adresi giriniz.',
          metadata: { code: 'EMPLOYEE_CREATE_FAILED', stage: 'PAYLOAD_VALIDATION', target: 'API', operation: 'VALIDATE' }
        });
      }
      cleanEmail = trimmedEmail;
    }
  }

  // 3.4. Validate rolePackageId
  let cleanRole = null;
  if (rolePackageId !== undefined && rolePackageId !== null && rolePackageId !== '') {
    const r = String(rolePackageId).trim();
    if (!VALID_ROLE_PACKAGES.has(r)) {
      return res.status(400).json({
        ok: false,
        error: 'Geçersiz rol paketi.',
        metadata: { code: 'EMPLOYEE_CREATE_FAILED', stage: 'PAYLOAD_VALIDATION', target: 'API', operation: 'VALIDATE' }
      });
    }
    cleanRole = r;
  }

  // 3.5. Validate teamIds
  let cleanTeamIds = [];
  if (teamIds !== undefined && teamIds !== null) {
    if (!Array.isArray(teamIds) || !teamIds.every(t => typeof t === 'string')) {
      return res.status(400).json({
        ok: false,
        error: 'Geçersiz takım listesi.',
        metadata: { code: 'EMPLOYEE_CREATE_FAILED', stage: 'PAYLOAD_VALIDATION', target: 'API', operation: 'VALIDATE' }
      });
    }
    cleanTeamIds = teamIds;
  }

  // 3.6. Validate employmentType
  let cleanEmploymentType = null;
  if (employmentType !== undefined && employmentType !== null && employmentType !== '') {
    const empType = String(employmentType).trim();
    if (!VALID_EMPLOYMENT_TYPES.has(empType)) {
      return res.status(400).json({
        ok: false,
        error: 'Geçersiz istihdam türü.',
        metadata: { code: 'EMPLOYEE_CREATE_FAILED', stage: 'PAYLOAD_VALIDATION', target: 'API', operation: 'VALIDATE' }
      });
    }
    cleanEmploymentType = empType;
  }

  // 3.7. Validate workLocationStatus
  let cleanWorkLocationStatus = 'office';
  if (workLocationStatus !== undefined && workLocationStatus !== null) {
    const loc = String(workLocationStatus).trim().toLowerCase();
    if (!VALID_WORK_LOCATIONS.has(loc)) {
      return res.status(400).json({
        ok: false,
        error: 'Geçersiz çalışma konumu.',
        metadata: { code: 'EMPLOYEE_CREATE_FAILED', stage: 'PAYLOAD_VALIDATION', target: 'API', operation: 'VALIDATE' }
      });
    }
    cleanWorkLocationStatus = loc;
  }

  // 3.8. Validate employeeStatus
  let cleanEmployeeStatus = 'active';
  if (employeeStatus !== undefined && employeeStatus !== null) {
    let st = String(employeeStatus).trim().toLowerCase();
    if (st === 'passive') st = 'inactive';
    if (!VALID_STATUSES.has(st)) {
      return res.status(400).json({
        ok: false,
        error: 'Geçersiz çalışan durumu.',
        metadata: { code: 'EMPLOYEE_CREATE_FAILED', stage: 'PAYLOAD_VALIDATION', target: 'API', operation: 'VALIDATE' }
      });
    }
    cleanEmployeeStatus = st;
  }

  // 3.9. Prepare permission_overrides
  const cleanOverrides = { ...(permissionOverrides && typeof permissionOverrides === 'object' ? permissionOverrides : {}) };
  if (username && typeof username === 'string' && username.trim().length > 0) {
    cleanOverrides.username = username.trim().toLowerCase();
  }
  if (hasAdvancedCalendarAccess === true) {
    cleanOverrides['calendar.manage'] = true;
    cleanOverrides['calendar.view'] = true;
  } else if (hasAdvancedCalendarAccess === false) {
    delete cleanOverrides['calendar.manage'];
    delete cleanOverrides['calendar.view'];
  }

  // 4. Initialize DB1 Admin client
  let supabaseAdmin;
  try {
    supabaseAdmin = getAdminSupabase();
  } catch (db1Err) {
    return res.status(500).json({
      ok: false,
      error: 'Primary database authority unavailable',
      metadata: { code: 'EMPLOYEE_CREATE_FAILED', stage: 'DB1_AUTHORITY_INIT', target: 'DB1', operation: 'CONNECT' }
    });
  }

  // 5. CANONICAL DB1 INSERT
  const insertPayload = {
    full_name: cleanFullName,
    title: cleanTitle,
    email: cleanEmail,
    role_package_id: cleanRole,
    team_ids: cleanTeamIds,
    employment_type: cleanEmploymentType,
    work_location_status: cleanWorkLocationStatus,
    employee_status: cleanEmployeeStatus,
    permission_overrides: cleanOverrides,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: createdDb1, error: createErr } = await supabaseAdmin
    .from('employees')
    .insert(insertPayload)
    .select('id, full_name, email, title, role_package_id, team_ids, employment_type, work_location_status, employee_status, permission_overrides, created_at, updated_at')
    .single();

  if (createErr || !createdDb1) {
    console.error('Failed to insert new employee in DB1:', createErr);
    return res.status(500).json({
      ok: false,
      error: 'CANONICAL_CREATE_FAILED: Çalışan kaydı oluşturulamadı.',
      metadata: {
        code: 'EMPLOYEE_CREATE_FAILED',
        stage: 'DB1_CREATE',
        target: 'DB1',
        operation: 'INSERT',
        postgresCode: createErr?.code || 'UNKNOWN',
      }
    });
  }

  // 6. CANONICAL READBACK INTEGRITY VERIFICATION
  if (!createdDb1.id || createdDb1.full_name !== cleanFullName) {
    return res.status(500).json({
      ok: false,
      error: 'READBACK_MISMATCH: Oluşturulan çalışan doğrulanamadı.',
      metadata: {
        code: 'EMPLOYEE_CREATE_FAILED',
        stage: 'DB1_READBACK',
        target: 'DB1',
        operation: 'SELECT',
        postgresCode: 'READBACK_MISMATCH'
      }
    });
  }

  const newEmployeeId = String(createdDb1.id);

  // 7. CREDENTIAL PROVISIONING (if password provided)
  if (password && typeof password === 'string' && password.trim().length >= 6) {
    try {
      const passwordHash = hashPassword(password.trim());
      await supabaseAdmin
        .from('employee_auth_credentials')
        .upsert({
          employee_id: newEmployeeId,
          password_hash: passwordHash,
          must_change_password: true,
          updated_at: new Date().toISOString(),
        });
    } catch (credErr) {
      console.warn('Notice creating credentials for new employee:', credErr.message);
    }
  }

  // 8. DB2 MIRROR SYNC (Server-authoritative secondary sync)
  let mirrorWarning = null;
  let mirrorMetadata = null;

  try {
    const db2 = getSecondaryAdminSupabase();
    if (db2) {
      const { mirrorEmployeeToDb2 } = await import('./auth-mirror-employee.js');
      const mirrorRes = await mirrorEmployeeToDb2({
        db1EmployeeId: newEmployeeId,
        db1: supabaseAdmin,
        db2,
      });

      if (!mirrorRes.success) {
        mirrorWarning = 'PARTIAL_CREATE';
        mirrorMetadata = {
          code: 'MIRROR_FAILED',
          stage: 'DB2_MIRROR_CREATE',
          target: 'DB2',
          operation: 'INSERT',
          postgresCode: mirrorRes.status || 'UNKNOWN',
        };
      }
    }
  } catch (db2Err) {
    mirrorWarning = 'PARTIAL_CREATE';
    mirrorMetadata = {
      code: 'MIRROR_FAILED',
      stage: 'DB2_MIRROR_EXCEPTION',
      target: 'DB2',
      operation: 'SYNC',
      postgresCode: db2Err.message || 'UNKNOWN',
    };
  }

  // 9. RETURN VERIFIED CANONICAL RESPONSE
  const responsePayload = {
    ok: true,
    success: true,
    employeeId: newEmployeeId,
    employee: {
      id: newEmployeeId,
      db1EmployeeId: newEmployeeId,
      fullName: createdDb1.full_name,
      title: createdDb1.title || '',
      email: createdDb1.email || '',
      username: cleanOverrides.username || null,
      employeeStatus: createdDb1.employee_status,
      workLocationStatus: createdDb1.work_location_status || 'office',
      teamIds: createdDb1.team_ids || [],
      rolePackageId: createdDb1.role_package_id || null,
      employmentType: createdDb1.employment_type || null,
      permissionOverrides: cleanOverrides,
      hasAdvancedCalendarAccess: Boolean(cleanOverrides['calendar.manage'] || cleanOverrides['calendar.view']),
      createdAt: createdDb1.created_at,
      updatedAt: createdDb1.updated_at,
    },
  };

  if (mirrorWarning) {
    responsePayload.warning = mirrorWarning;
    responsePayload.metadata = mirrorMetadata;
    responsePayload.message = 'Kanonik çalışan oluşturuldu ancak operasyon aynası senkronize edilemedi.';
  }

  return res.status(201).json(responsePayload);
}
