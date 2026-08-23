import { createClient } from '@supabase/supabase-js';
import { requireAdminSession } from './auth-me.js';

const DB1_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const DB1_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(DB1_URL, DB1_SERVICE_ROLE);

const VALID_STATUSES = new Set(['active', 'inactive', 'probation', 'intern', 'part_time', 'freelance']);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Authenticate operator session (mustChangePassword sessions fail-closed by default)
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

  // 3. Validate request payload
  const { employeeId, email, username, employeeStatus } = req.body || {};
  if (!employeeId || typeof employeeId !== 'string') {
    return res.status(400).json({ error: 'Invalid payload: employeeId (string) is required' });
  }

  const cleanEmployeeId = String(employeeId).trim();

  // 4. Fetch target employee from DB1
  const { data: targetEmp, error: fetchErr } = await supabaseAdmin
    .from('employees')
    .select('id, full_name, email, permission_overrides, employee_status')
    .eq('id', cleanEmployeeId)
    .maybeSingle();

  if (fetchErr || !targetEmp) {
    return res.status(404).json({ error: 'Target employee not found' });
  }

  const updateFields = {};
  const currentOverrides = { ...(targetEmp.permission_overrides || {}) };
  let overridesModified = false;

  // 5. Validate and prepare email if provided
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
    }
  }

  // 6. Validate and prepare username if provided
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

  // 7. Validate and prepare employeeStatus if provided
  if (employeeStatus !== undefined) {
    const cleanStatus = String(employeeStatus).trim().toLowerCase();
    if (!VALID_STATUSES.has(cleanStatus)) {
      return res.status(400).json({ error: `Invalid employeeStatus: must be one of [${Array.from(VALID_STATUSES).join(', ')}]` });
    }
    updateFields.employee_status = cleanStatus;
  }

  // 8. Validate and prepare teamIds if provided
  if (teamIds !== undefined) {
    if (!Array.isArray(teamIds) || !teamIds.every(t => typeof t === 'string')) {
      return res.status(400).json({ error: 'Invalid teamIds: must be an array of strings' });
    }
    updateFields.team_ids = teamIds;
  }

  // 9. Validate and prepare hasAdvancedCalendarAccess if provided
  if (hasAdvancedCalendarAccess !== undefined) {
    updateFields.has_advanced_calendar_access = Boolean(hasAdvancedCalendarAccess);
  }

  if (overridesModified) {
    updateFields.permission_overrides = currentOverrides;
  }

  if (Object.keys(updateFields).length === 0) {
    return res.status(200).json({
      ok: true,
      employeeId: targetEmp.id,
      message: 'No changes requested',
    });
  }

  // 8. Execute update in DB1
  const { error: updateErr } = await supabaseAdmin
    .from('employees')
    .update(updateFields)
    .eq('id', targetEmp.id);

  if (updateErr) {
    console.error('Failed to update employee identity fields:', updateErr);
    return res.status(500).json({ error: 'Database update failed' });
  }

  return res.status(200).json({
    ok: true,
    employeeId: targetEmp.id,
    fullName: targetEmp.full_name,
    email: updateFields.email || targetEmp.email,
    username: currentOverrides.username || null,
    employeeStatus: updateFields.employee_status || targetEmp.employee_status,
  });
}
