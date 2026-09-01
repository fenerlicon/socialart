import { createClient } from '@supabase/supabase-js';
import { requireAdminSession } from './auth-me.js';
import { validateOrigin } from './admin-auth.js';
import { requireAdministrativeAuthority } from './admin-permissions.js';

const DB1_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const DB1_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(DB1_URL, DB1_SERVICE_ROLE);

const VALID_STATUSES = new Set(['active', 'inactive', 'probation', 'intern', 'part_time', 'freelance']);
const VALID_WORK_LOCATIONS = new Set(['office', 'hybrid', 'remote']);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden Origin' });
  }

  // 1. Authenticate operator session (mustChangePassword sessions fail-closed by default)
  const authState = await requireAdminSession(req);
  if (!authState) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  // 2. Authorize operator with canonical administrative authority guard
  const authCheck = requireAdministrativeAuthority(authState, 'employees.manage');
  if (!authCheck.authorized) {
    return res.status(authCheck.status || 403).json({ error: authCheck.error || 'Unauthorized' });
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
    return res.status(400).json({ error: 'Invalid payload: employeeId is required' });
  }

  const cleanEmployeeId = String(employeeId).trim();

  // 4. Fetch target employee from DB1 (canonical authority)
  let { data: targetEmp, error: fetchErr } = await supabaseAdmin
    .from('employees')
    .select('id, full_name, email, title, permission_overrides, employee_status, team_ids, has_advanced_calendar_access, work_location_status')
    .eq('id', cleanEmployeeId)
    .maybeSingle();

  // If cleanEmployeeId might be a DB2 UUID, look up DB2 mirror to resolve db1_employee_id
  if (!targetEmp && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanEmployeeId)) {
    try {
      const { getSecondaryAdminSupabase } = await import('./admin-db.js');
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
            .select('id, full_name, email, title, permission_overrides, employee_status, team_ids, has_advanced_calendar_access, work_location_status')
            .eq('id', db2Emp.db1_employee_id)
            .maybeSingle();

          if (resolvedDb1) {
            targetEmp = resolvedDb1;
          }
        }
      }
    } catch (_) {}
  }

  if (fetchErr || !targetEmp) {
    return res.status(404).json({ error: 'Target employee not found' });
  }

  const updateFields = {};
  const currentOverrides = { ...(targetEmp.permission_overrides || {}) };
  let overridesModified = false;

  // 5. Validate and prepare full_name if provided
  if (fullName !== undefined) {
    const cleanFullName = String(fullName).trim();
    if (!cleanFullName || cleanFullName.length < 2 || cleanFullName.length > 100) {
      return res.status(400).json({ error: 'Ad Soyad 2 ile 100 karakter arasında olmalıdır.' });
    }
    updateFields.full_name = cleanFullName;
  }

  // 6. Validate and prepare title if provided
  if (title !== undefined) {
    const cleanTitle = String(title).trim();
    updateFields.title = cleanTitle;
  }

  // 7. Validate and prepare workLocationStatus if provided
  if (workLocationStatus !== undefined) {
    const cleanLocation = String(workLocationStatus).trim().toLowerCase();
    if (!VALID_WORK_LOCATIONS.has(cleanLocation)) {
      return res.status(400).json({
        error: `Geçersiz çalışma konumu: [${Array.from(VALID_WORK_LOCATIONS).join(', ')}] değerlerinden biri olmalıdır.`,
      });
    }
    updateFields.work_location_status = cleanLocation;
  }

  // 8. Validate and prepare email if provided
  if (email !== undefined) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (cleanEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ error: 'Invalid email address format' });
      }
      // Collision check against other employees
      const { data: existingEmail, error: emailCheckErr } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('email', cleanEmail)
        .neq('id', targetEmp.id)
        .limit(1);

      if (emailCheckErr) {
        return res.status(500).json({ error: 'Database check failed for email' });
      }
      if (existingEmail && existingEmail.length > 0) {
        return res.status(409).json({ error: 'Email is already in use by another employee' });
      }
      updateFields.email = cleanEmail;
    } else {
      updateFields.email = null;
    }
  }

  // 9. Validate and prepare username if provided
  if (username !== undefined) {
    const cleanUsername = String(username).trim().toLowerCase();
    if (cleanUsername) {
      if (!/^[a-z0-9._-]{3,30}$/.test(cleanUsername)) {
        return res.status(400).json({
          error: 'Username must be 3-30 characters containing lowercase letters, numbers, dots, underscores, or hyphens',
        });
      }
      // Collision check against other employees' username override
      const { data: allEmps, error: userCheckErr } = await supabaseAdmin
        .from('employees')
        .select('id, permission_overrides')
        .neq('id', targetEmp.id);

      if (userCheckErr) {
        return res.status(500).json({ error: 'Database check failed for username' });
      }

      const collision = (allEmps || []).some((emp) => {
        const u = (emp.permission_overrides?.username || '').trim().toLowerCase();
        return u === cleanUsername;
      });

      if (collision) {
        return res.status(409).json({ error: 'Username is already in use by another employee' });
      }

      currentOverrides.username = cleanUsername;
      overridesModified = true;
    } else {
      // Remove username override if explicitly passed as empty string
      delete currentOverrides.username;
      overridesModified = true;
    }
  }

  // 10. Validate and prepare employeeStatus if provided
  if (employeeStatus !== undefined) {
    const cleanStatus = String(employeeStatus).trim().toLowerCase();
    if (!VALID_STATUSES.has(cleanStatus)) {
      return res.status(400).json({ error: `Invalid employeeStatus: must be one of [${Array.from(VALID_STATUSES).join(', ')}]` });
    }
    updateFields.employee_status = cleanStatus;
  }

  // 11. Validate and prepare teamIds if provided
  if (teamIds !== undefined) {
    if (!Array.isArray(teamIds) || !teamIds.every(t => typeof t === 'string')) {
      return res.status(400).json({ error: 'Invalid teamIds: must be an array of strings' });
    }
    updateFields.team_ids = teamIds;
  }

  // 12. Validate and prepare hasAdvancedCalendarAccess if provided
  if (hasAdvancedCalendarAccess !== undefined) {
    if (typeof hasAdvancedCalendarAccess !== 'boolean') {
      return res.status(400).json({ error: 'Invalid hasAdvancedCalendarAccess: must be a boolean' });
    }
    updateFields.has_advanced_calendar_access = hasAdvancedCalendarAccess;
  }

  if (overridesModified) {
    updateFields.permission_overrides = currentOverrides;
  }

  if (Object.keys(updateFields).length === 0) {
    return res.status(200).json({
      ok: true,
      success: true,
      employeeId: targetEmp.id,
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
        hasAdvancedCalendarAccess: Boolean(targetEmp.has_advanced_calendar_access),
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
    .select('id, full_name, email, title, permission_overrides, employee_status, team_ids, has_advanced_calendar_access, work_location_status')
    .maybeSingle();

  if (updateErr || !updatedDb1) {
    console.error('Failed to update employee identity fields in DB1:', updateErr);
    return res.status(500).json({ error: 'CANONICAL_WRITE_FAILED: Veritabanı güncellemesi başarısız oldu' });
  }

  // 14. CANONICAL READBACK INTEGRITY CHECK
  if (updateFields.full_name !== undefined && updatedDb1.full_name !== updateFields.full_name) {
    return res.status(500).json({ error: 'READBACK_MISMATCH: Kaydedilen isim ile talep edilen eşleşmiyor.' });
  }
  if (updateFields.title !== undefined && updatedDb1.title !== updateFields.title) {
    return res.status(500).json({ error: 'READBACK_MISMATCH: Kaydedilen unvan ile talep edilen eşleşmiyor.' });
  }
  if (updateFields.work_location_status !== undefined && updatedDb1.work_location_status !== updateFields.work_location_status) {
    return res.status(500).json({ error: 'READBACK_MISMATCH: Kaydedilen çalışma konumu ile talep edilen eşleşmiyor.' });
  }

  // 15. DB2 MIRROR SYNC (Non-blocking secondary sync)
  try {
    const { getSecondaryAdminSupabase } = await import('./admin-db.js');
    const db2 = getSecondaryAdminSupabase();
    if (db2) {
      await db2
        .from('employees')
        .update({
          full_name: updatedDb1.full_name,
          title: updatedDb1.title,
          email: updatedDb1.email,
          work_location_status: updatedDb1.work_location_status,
          employee_status: updatedDb1.employee_status,
          team_ids: updatedDb1.team_ids,
          has_advanced_calendar_access: updatedDb1.has_advanced_calendar_access,
          permission_overrides: updatedDb1.permission_overrides,
        })
        .eq('db1_employee_id', String(targetEmp.id));
    }
  } catch (db2Err) {
    console.warn('[DB2 Mirror Sync Warning]:', db2Err.message);
  }

  // 16. RETURN VERIFIED CANONICAL RESPONSE
  return res.status(200).json({
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
      hasAdvancedCalendarAccess: Boolean(updatedDb1.has_advanced_calendar_access),
    },
  });
}
