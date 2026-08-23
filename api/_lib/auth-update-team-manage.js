import { createClient } from '@supabase/supabase-js';
import { requireAdminSession } from './auth-me.js';

const DB1_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const DB1_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(DB1_URL, DB1_SERVICE_ROLE);

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

  // 2. Authorize operator with server-verified team.manage permission
  const hasPermission = authState.permissions && (
    authState.permissions.includes('team.manage') ||
    authState.permissions.includes('system.admin')
  );

  if (!hasPermission) {
    return res.status(403).json({ error: 'Unauthorized: team.manage permission required' });
  }

  // 3. Validate request payload
  const { employeeId, grant } = req.body || {};
  if (!employeeId || typeof grant !== 'boolean') {
    return res.status(400).json({ error: 'Invalid payload: employeeId (string) and grant (boolean) are required' });
  }

  // 4. Fetch target employee from DB1
  const { data: targetEmp, error: fetchErr } = await supabaseAdmin
    .from('employees')
    .select('id, full_name, role_package_id, permission_overrides')
    .eq('id', String(employeeId))
    .maybeSingle();

  if (fetchErr || !targetEmp) {
    return res.status(404).json({ error: 'Target employee not found' });
  }

  // 5. Compute updated permission_overrides without modifying other fields
  const currentOverrides = { ...(targetEmp.permission_overrides || {}) };

  if (grant) {
    currentOverrides['team.manage'] = true;
  } else {
    delete currentOverrides['team.manage'];
  }

  // 6. Update target employee permission_overrides in DB1
  const { error: updateErr } = await supabaseAdmin
    .from('employees')
    .update({ permission_overrides: currentOverrides })
    .eq('id', targetEmp.id);

  if (updateErr) {
    console.error('Failed to update team.manage permission override:', updateErr);
    return res.status(500).json({ error: 'Database update failed' });
  }

  return res.status(200).json({
    ok: true,
    employeeId: targetEmp.id,
    fullName: targetEmp.full_name,
    teamManage: grant,
  });
}
