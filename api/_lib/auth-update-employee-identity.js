import { getAdminSupabase, getSecondaryAdminSupabase } from './admin-db.js';
import { requireAdminSession } from './auth-me.js';
import { validateOrigin } from './admin-auth.js';
import { requireAdministrativeAuthority } from './admin-permissions.js';

// Canonical DB1 Authority: piffaggeshfrubyjkhej.supabase.co
const VALID_STATUSES = new Set(['active', 'inactive', 'probation', 'intern', 'part_time', 'freelance']);
const VALID_WORK_LOCATIONS = new Set(['office', 'hybrid', 'remote']);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      ok: false,
      error: 'Method Not Allowed',
      metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'HTTP_METHOD', target: 'API', operation: 'ROUTE' }
    });
  }

  if (!validateOrigin(req)) {
    return res.status(403).json({
      ok: false,
      error: 'Forbidden Origin',
      metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'ORIGIN_VALIDATION', target: 'API', operation: 'AUTH' }
    });
  }

  // 1. Authenticate operator session (mustChangePassword sessions fail-closed by default)
  const authState = await requireAdminSession(req);
  if (!authState) {
    return res.status(401).json({
      ok: false,
      error: 'Unauthenticated',
      metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'SESSION_AUTHENTICATION', target: 'AUTH', operation: 'AUTH' }
    });
  }

  // 2. Authorize operator with canonical administrative authority guard
  const authCheck = requireAdministrativeAuthority(authState, 'employees.manage');
  if (!authCheck.authorized) {
    return res.status(authCheck.status || 403).json({
      ok: false,
      error: authCheck.error || 'Unauthorized',
      metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'AUTHORIZATION_GUARD', target: 'AUTH', operation: 'AUTH' }
    });
  }

  // 3. Validate request payload
  const {
    employeeId,
    fullName,
    title,
    workLocationStatus,
    email,
    username,
    employeeStatus,
    teamIds,
    hasAdvancedCalendarAccess,
  } = req.body || {};

  if (!employeeId || (typeof employeeId !== 'string' && typeof employeeId !== 'number')) {
    return res.status(400).json({
      ok: false,
      error: 'Invalid payload: employeeId is required',
      metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'PAYLOAD_VALIDATION', target: 'API', operation: 'VALIDATE' }
    });
  }

  const cleanEmployeeId = String(employeeId).trim();

  // Get lazy DB1 admin client
  let supabaseAdmin;
  try {
    supabaseAdmin = getAdminSupabase();
  } catch (db1Err) {
    return res.status(500).json({
      ok: false,
      error: 'Primary database authority unavailable',
      metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'DB1_AUTHORITY_INIT', target: 'DB1', operation: 'CONNECT' }
    });
  }

  // 4. Fetch target employee from DB1 (canonical authority)
  let { data: targetEmp, error: fetchErr } = await supabaseAdmin
    .from('employees')
    .select('id, full_name, email, title, role_package_id, team_ids, employment_type, work_location_status, permission_overrides, employee_status')
    .eq('id', cleanEmployeeId)
    .maybeSingle();

  // If cleanEmployeeId might be a DB2 UUID, look up DB2 mirror to resolve db1_employee_id
  if (!targetEmp && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanEmployeeId)) {
    try {
      const db2 = getSecondaryAdminSupabase();
      if (db2) {
        const { data: db2Emp } = await db2
          .from('employees')
          .select('db1_employee_id')
          .eq('id', cleanEmployeeId)
          .maybeSingle();

        if (db2Emp?.db1_employee_id) {
          const { data: resolvedDb1 } = await supabaseAdmin
            .from('employees')
            .select('id, full_name, email, title, role_package_id, team_ids, employment_type, work_location_status, permission_overrides, employee_status')
            .eq('id', db2Emp.db1_employee_id)
            .maybeSingle();

          if (resolvedDb1) {
            targetEmp = resolvedDb1;
            fetchErr = null;
          }
        }
      }
    } catch (_) {}
  }

  if (!targetEmp) {
    return res.status(404).json({
      ok: false,
      error: 'Target employee not found',
      metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'DB1_EMPLOYEE_LOOKUP', target: 'DB1', operation: 'SELECT', postgresCode: fetchErr?.code || 'NOT_FOUND' }
    });
  }

  const updateFields = {};
  const currentOverrides = { ...(targetEmp.permission_overrides || {}) };
  let overridesModified = false;

  // 5. Validate and prepare full_name if provided and dirty
  if (fullName !== undefined) {
    const cleanFullName = String(fullName).trim();
    if (!cleanFullName || cleanFullName.length < 2 || cleanFullName.length > 100) {
      return res.status(400).json({
        ok: false,
        error: 'Ad Soyad 2 ile 100 karakter arasında olmalıdır.',
        metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'DB1_FULL_NAME_VALIDATION', target: 'DB1', operation: 'VALIDATE' }
      });
    }
    if (cleanFullName !== (targetEmp.full_name || '')) {
      updateFields.full_name = cleanFullName;
    }
  }

  // 6. Validate and prepare title if provided and dirty
  if (title !== undefined) {
    const cleanTitle = String(title).trim();
    if (cleanTitle !== (targetEmp.title || '')) {
      updateFields.title = cleanTitle;
    }
  }

  // 7. Validate and prepare workLocationStatus if provided and dirty
  if (workLocationStatus !== undefined) {
    const cleanLocation = String(workLocationStatus).trim().toLowerCase();
    if (!VALID_WORK_LOCATIONS.has(cleanLocation)) {
      return res.status(400).json({
        ok: false,
        error: `Geçersiz çalışma konumu: [${Array.from(VALID_WORK_LOCATIONS).join(', ')}] değerlerinden biri olmalıdır.`,
        metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'DB1_WORK_LOCATION_VALIDATION', target: 'DB1', operation: 'VALIDATE' }
      });
    }
    if (cleanLocation !== (targetEmp.work_location_status || 'office')) {
      updateFields.work_location_status = cleanLocation;
    }
  }

  // 8. Validate and prepare email if provided and dirty
  if (email !== undefined) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (cleanEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({
          ok: false,
          error: 'Invalid email address format',
          metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'DB1_EMAIL_VALIDATION', target: 'DB1', operation: 'VALIDATE' }
        });
      }
      if (cleanEmail !== (targetEmp.email || '').toLowerCase()) {
        // Collision check against other employees
        const { data: existingEmail, error: emailCheckErr } = await supabaseAdmin
          .from('employees')
          .select('id')
          .eq('email', cleanEmail)
          .neq('id', targetEmp.id)
          .limit(1);

        if (emailCheckErr) {
          return res.status(500).json({
            ok: false,
            error: 'Database check failed for email',
            metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'DB1_EMAIL_COLLISION_CHECK', target: 'DB1', operation: 'SELECT', postgresCode: emailCheckErr.code }
          });
        }
        if (existingEmail && existingEmail.length > 0) {
          return res.status(409).json({
            ok: false,
            error: 'Email is already in use by another employee',
            metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'DB1_EMAIL_COLLISION', target: 'DB1', operation: 'VALIDATE' }
          });
        }
        updateFields.email = cleanEmail;
      }
    } else if (targetEmp.email) {
      updateFields.email = null;
    }
  }

  // 9. Validate and prepare username if provided and dirty
  if (username !== undefined) {
    const cleanUsername = String(username).trim().toLowerCase();
    const currentUsername = (currentOverrides.username || '').trim().toLowerCase();
    if (cleanUsername) {
      if (!/^[a-z0-9._-]{3,30}$/.test(cleanUsername)) {
        return res.status(400).json({
          ok: false,
          error: 'Username must be 3-30 characters containing lowercase letters, numbers, dots, underscores, or hyphens',
          metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'DB1_USERNAME_VALIDATION', target: 'DB1', operation: 'VALIDATE' }
        });
      }
      if (cleanUsername !== currentUsername) {
        // Collision check against other employees' username override
        const { data: allEmps, error: userCheckErr } = await supabaseAdmin
          .from('employees')
          .select('id, permission_overrides')
          .neq('id', targetEmp.id);

        if (userCheckErr) {
          return res.status(500).json({
            ok: false,
            error: 'Database check failed for username',
            metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'DB1_USERNAME_COLLISION_CHECK', target: 'DB1', operation: 'SELECT', postgresCode: userCheckErr.code }
          });
        }

        const collision = (allEmps || []).some((emp) => {
          const u = (emp.permission_overrides?.username || '').trim().toLowerCase();
          return u === cleanUsername;
        });

        if (collision) {
          return res.status(409).json({
            ok: false,
            error: 'Username is already in use by another employee',
            metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'DB1_USERNAME_COLLISION', target: 'DB1', operation: 'VALIDATE' }
          });
        }

        currentOverrides.username = cleanUsername;
        overridesModified = true;
      }
    } else if (currentUsername) {
      delete currentOverrides.username;
      overridesModified = true;
    }
  }

  // 10. Validate and prepare employeeStatus if provided and dirty
  if (employeeStatus !== undefined) {
    const cleanStatus = String(employeeStatus).trim().toLowerCase();
    if (!VALID_STATUSES.has(cleanStatus)) {
      return res.status(400).json({
        ok: false,
        error: `Invalid employeeStatus: must be one of [${Array.from(VALID_STATUSES).join(', ')}]`,
        metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'DB1_STATUS_VALIDATION', target: 'DB1', operation: 'VALIDATE' }
      });
    }
    if (cleanStatus !== (targetEmp.employee_status || 'active')) {
      updateFields.employee_status = cleanStatus;
    }
  }

  // 11. Validate and prepare teamIds if provided and dirty
  if (teamIds !== undefined) {
    if (!Array.isArray(teamIds) || !teamIds.every(t => typeof t === 'string')) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid teamIds: must be an array of strings',
        metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'DB1_TEAMS_VALIDATION', target: 'DB1', operation: 'VALIDATE' }
      });
    }
    const currentTeamsJson = JSON.stringify(targetEmp.team_ids || []);
    const newTeamsJson = JSON.stringify(teamIds);
    if (currentTeamsJson !== newTeamsJson) {
      updateFields.team_ids = teamIds;
    }
  }

  // 12. Validate and prepare hasAdvancedCalendarAccess if provided and dirty
  if (hasAdvancedCalendarAccess !== undefined) {
    if (typeof hasAdvancedCalendarAccess !== 'boolean') {
      return res.status(400).json({
        ok: false,
        error: 'Invalid hasAdvancedCalendarAccess: must be a boolean',
        metadata: { code: 'EMPLOYEE_SAVE_FAILED', stage: 'DB1_CALENDAR_VALIDATION', target: 'DB1', operation: 'VALIDATE' }
      });
    }
    const currentCalendarAccess = Boolean(currentOverrides['calendar.manage'] || currentOverrides['calendar.view']);
    if (hasAdvancedCalendarAccess !== currentCalendarAccess) {
      if (hasAdvancedCalendarAccess) {
        currentOverrides['calendar.manage'] = true;
        currentOverrides['calendar.view'] = true;
      } else {
        delete currentOverrides['calendar.manage'];
        delete currentOverrides['calendar.view'];
      }
      overridesModified = true;
    }
  }

  if (overridesModified) {
    updateFields.permission_overrides = currentOverrides;
  }

  // If no dirty fields, return clean no-op
  if (Object.keys(updateFields).length === 0) {
    return res.status(200).json({
      ok: true,
      success: true,
      employeeId: String(targetEmp.id),
      employee: {
        id: String(targetEmp.id),
        db1EmployeeId: String(targetEmp.id),
        fullName: targetEmp.full_name,
        title: targetEmp.title || '',
        email: targetEmp.email || '',
        username: currentOverrides.username || null,
        employeeStatus: targetEmp.employee_status,
        workLocationStatus: targetEmp.work_location_status || 'office',
        teamIds: targetEmp.team_ids || [],
        hasAdvancedCalendarAccess: Boolean(currentOverrides['calendar.manage'] || currentOverrides['calendar.view']),
      },
      message: 'No changes requested',
    });
  }

  updateFields.updated_at = new Date().toISOString();

  // 13. CANONICAL DB1 UPDATE
  const { data: updatedDb1, error: updateErr } = await supabaseAdmin
    .from('employees')
    .update(updateFields)
    .eq('id', targetEmp.id)
    .select('id, full_name, email, title, role_package_id, team_ids, employment_type, work_location_status, permission_overrides, employee_status')
    .maybeSingle();

  if (updateErr || !updatedDb1) {
    console.error('Failed to update employee identity fields in DB1:', updateErr);
    return res.status(500).json({
      ok: false,
      error: 'CANONICAL_WRITE_FAILED: Veritabanı güncellemesi başarısız oldu',
      metadata: {
        code: 'EMPLOYEE_SAVE_FAILED',
        stage: 'DB1_IDENTITY_UPDATE',
        target: 'DB1',
        operation: 'UPDATE',
        postgresCode: updateErr?.code || 'UNKNOWN',
      }
    });
  }

  // 14. CANONICAL READBACK INTEGRITY CHECK
  if (updateFields.full_name !== undefined && updatedDb1.full_name !== updateFields.full_name) {
    return res.status(500).json({
      ok: false,
      error: 'READBACK_MISMATCH: Kaydedilen isim ile talep edilen eşleşmiyor.',
      metadata: {
        code: 'EMPLOYEE_SAVE_FAILED',
        stage: 'DB1_READBACK',
        target: 'DB1',
        operation: 'SELECT',
        postgresCode: 'READBACK_MISMATCH'
      }
    });
  }
  if (updateFields.title !== undefined && updatedDb1.title !== updateFields.title) {
    return res.status(500).json({
      ok: false,
      error: 'READBACK_MISMATCH: Kaydedilen unvan ile talep edilen eşleşmiyor.',
      metadata: {
        code: 'EMPLOYEE_SAVE_FAILED',
        stage: 'DB1_READBACK',
        target: 'DB1',
        operation: 'SELECT',
        postgresCode: 'READBACK_MISMATCH'
      }
    });
  }
  if (updateFields.work_location_status !== undefined && updatedDb1.work_location_status !== updateFields.work_location_status) {
    return res.status(500).json({
      ok: false,
      error: 'READBACK_MISMATCH: Kaydedilen çalışma konumu ile talep edilen eşleşmiyor.',
      metadata: {
        code: 'EMPLOYEE_SAVE_FAILED',
        stage: 'DB1_READBACK',
        target: 'DB1',
        operation: 'SELECT',
        postgresCode: 'READBACK_MISMATCH'
      }
    });
  }

  // 15. DB2 MIRROR SYNC (Server-authoritative secondary sync)
  let mirrorWarning = null;
  let mirrorMetadata = null;

  try {
    const db2 = getSecondaryAdminSupabase();
    if (db2) {
      const { data: db2Rows, error: db2SelectErr } = await db2
        .from('employees')
        .select('id')
        .eq('db1_employee_id', String(targetEmp.id));

      if (db2SelectErr) {
        mirrorWarning = 'PARTIAL_SYNC';
        mirrorMetadata = {
          code: 'MIRROR_FAILED',
          stage: 'DB2_MIRROR_LOOKUP',
          target: 'DB2',
          operation: 'SELECT',
          postgresCode: db2SelectErr.code || 'UNKNOWN',
        };
      } else if (db2Rows && db2Rows.length === 1) {
        const db2Id = db2Rows[0].id;
        const { error: db2UpdateErr } = await db2
          .from('employees')
          .update({
            full_name: updatedDb1.full_name,
            title: updatedDb1.title,
            email: updatedDb1.email,
            work_location_status: updatedDb1.work_location_status,
            employee_status: updatedDb1.employee_status,
            team_ids: updatedDb1.team_ids,
            permission_overrides: updatedDb1.permission_overrides,
            updated_at: new Date().toISOString(),
          })
          .eq('id', db2Id);

        if (db2UpdateErr) {
          mirrorWarning = 'PARTIAL_SYNC';
          mirrorMetadata = {
            code: 'MIRROR_FAILED',
            stage: 'DB2_MIRROR_UPDATE',
            target: 'DB2',
            operation: 'UPDATE',
            postgresCode: db2UpdateErr.code || 'UNKNOWN',
          };
        }
      } else if (!db2Rows || db2Rows.length === 0) {
        const { mirrorEmployeeToDb2 } = await import('./auth-mirror-employee.js');
        const mirrorRes = await mirrorEmployeeToDb2({
          db1EmployeeId: targetEmp.id,
          db1: supabaseAdmin,
          db2,
        });
        if (!mirrorRes.success) {
          mirrorWarning = 'PARTIAL_SYNC';
          mirrorMetadata = {
            code: 'MIRROR_FAILED',
            stage: 'DB2_MIRROR_CREATE',
            target: 'DB2',
            operation: 'INSERT',
            postgresCode: mirrorRes.status || 'UNKNOWN',
          };
        }
      }
    }
  } catch (db2Err) {
    mirrorWarning = 'PARTIAL_SYNC';
    mirrorMetadata = {
      code: 'MIRROR_FAILED',
      stage: 'DB2_MIRROR_EXCEPTION',
      target: 'DB2',
      operation: 'SYNC',
      postgresCode: db2Err.message || 'UNKNOWN',
    };
  }

  // 16. RETURN VERIFIED CANONICAL RESPONSE (with partial sync notification if mirror failed)
  const responsePayload = {
    ok: true,
    success: true,
    employeeId: String(updatedDb1.id),
    employee: {
      id: String(updatedDb1.id),
      db1EmployeeId: String(updatedDb1.id),
      fullName: updatedDb1.full_name,
      title: updatedDb1.title || '',
      email: updatedDb1.email || '',
      username: currentOverrides.username || null,
      employeeStatus: updatedDb1.employee_status,
      workLocationStatus: updatedDb1.work_location_status || 'office',
      teamIds: updatedDb1.team_ids || [],
      hasAdvancedCalendarAccess: Boolean(updatedDb1.permission_overrides?.['calendar.manage'] || updatedDb1.permission_overrides?.['calendar.view']),
    },
  };

  if (mirrorWarning) {
    responsePayload.warning = mirrorWarning;
    responsePayload.metadata = mirrorMetadata;
    responsePayload.message = 'Kanonik çalışan bilgisi kaydedildi ancak operasyon aynası güncellenemedi.';
  }

  return res.status(200).json(responsePayload);
}
