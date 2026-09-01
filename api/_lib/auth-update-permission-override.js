import { createClient } from '@supabase/supabase-js';
import { requireAdminSession } from './auth-me.js';
import { validateOrigin } from './admin-auth.js';

const DB1_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const DB1_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(DB1_URL, DB1_SERVICE_ROLE);

const ALLOWED_SENSITIVE_OVERRIDE_KEYS = new Set([
  'team.manage',
  'employees.manage',
  'employees.create',
  'system.permissions',
  'system.admin',
  'settings.manage',
  'system.settings',
]);

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

  // 2. Validate request payload
  const { employeeId, permissionKey, grant } = req.body || {};
  if (
    !employeeId ||
    (typeof employeeId !== 'string' && typeof employeeId !== 'number') ||
    !permissionKey ||
    typeof permissionKey !== 'string' ||
    typeof grant !== 'boolean'
  ) {
    return res.status(400).json({
      error: 'Invalid payload: employeeId, permissionKey (string), and grant (boolean) are required',
    });
  }

  const cleanEmployeeId = String(employeeId).trim();

  const cleanKey = permissionKey.trim();
  if (!ALLOWED_SENSITIVE_OVERRIDE_KEYS.has(cleanKey)) {
    return res.status(400).json({
      error: `Invalid permissionKey: must be one of [${Array.from(ALLOWED_SENSITIVE_OVERRIDE_KEYS).join(', ')}]`,
    });
  }

  // 3. Strict Permission Delegation Rules
  const isDedicatedAdmin = authState.principalType === 'admin' || authState.isAdmin === true || (Array.isArray(authState.permissions) && authState.permissions.includes('*'));
  const operatorPermissions = authState.permissions || [];
  const isSystemAdmin = isDedicatedAdmin || operatorPermissions.includes('system.admin');
  const hasPermissionDelegation = isDedicatedAdmin || operatorPermissions.includes('system.permissions') || isSystemAdmin;

  // Rule 1: Normal sensitive delegation requires system.permissions OR system.admin
  if (!hasPermissionDelegation) {
    return res.status(403).json({
      error: 'Unauthorized: system.permissions or system.admin permission required for permission delegation',
    });
  }

  // Rule 2: Granting/revoking system.admin requires operator to already possess system.admin
  if (cleanKey === 'system.admin' && !isSystemAdmin) {
    return res.status(403).json({
      error: 'Unauthorized: only existing system.admin may grant or revoke system.admin',
    });
  }

  // 4. Fetch target employee from DB1
  const { data: targetEmp, error: fetchErr } = await supabaseAdmin
    .from('employees')
    .select('id, full_name, permission_overrides')
    .eq('id', cleanEmployeeId)
    .maybeSingle();

  if (fetchErr || !targetEmp) {
    return res.status(404).json({ error: 'Target employee not found' });
  }

  // 5. Compute updated permission_overrides preserving all other keys
  const currentOverrides = { ...(targetEmp.permission_overrides || {}) };
  currentOverrides[cleanKey] = Boolean(grant);

  // 6. Update target employee permission_overrides in DB1
  const { error: updateErr } = await supabaseAdmin
    .from('employees')
    .update({ permission_overrides: currentOverrides })
    .eq('id', targetEmp.id);

  if (updateErr) {
    console.error('Failed to update permission override:', updateErr);
    return res.status(500).json({ error: 'Database update failed' });
  }

  return res.status(200).json({
    ok: true,
    employeeId: targetEmp.id,
    fullName: targetEmp.full_name,
    permissionKey: cleanKey,
    grant,
  });
}
