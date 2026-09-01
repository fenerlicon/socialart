import { createClient } from '@supabase/supabase-js';
import { requireAdminSession } from './auth-me.js';
import { validateOrigin } from './admin-auth.js';
import { ROLE_PACKAGE_DEFINITIONS } from './role-package-seeds.js';

const DB1_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const DB1_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(DB1_URL, DB1_SERVICE_ROLE);

const VALID_ROLE_PACKAGES = new Set(ROLE_PACKAGE_DEFINITIONS.map((pkg) => pkg.id));


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

  // 2. Authorize operator with employees.manage or system.admin
  const operatorPermissions = authState.permissions || [];
  const hasPermission = operatorPermissions.includes('employees.manage') || operatorPermissions.includes('system.admin');

  if (!hasPermission) {
    return res.status(403).json({ error: 'Unauthorized: employees.manage or system.admin permission required' });
  }

  // 3. Validate request payload
  const { employeeId, rolePackageId } = req.body || {};
  if (!employeeId || typeof employeeId !== 'string') {
    return res.status(400).json({ error: 'Invalid payload: employeeId (string) is required' });
  }

  const cleanRole = rolePackageId === null || rolePackageId === undefined || rolePackageId === '' ? null : String(rolePackageId).trim();
  if (cleanRole !== null && !VALID_ROLE_PACKAGES.has(cleanRole)) {
    return res.status(400).json({ error: 'Invalid rolePackageId' });
  }

  // 4. Fetch target employee from DB1
  const { data: targetEmp, error: fetchErr } = await supabaseAdmin
    .from('employees')
    .select('id, full_name, role_package_id')
    .eq('id', String(employeeId).trim())
    .maybeSingle();

  if (fetchErr || !targetEmp) {
    return res.status(404).json({ error: 'Target employee not found' });
  }

  // 5. Update target employee role_package_id in DB1
  const { error: updateErr } = await supabaseAdmin
    .from('employees')
    .update({ role_package_id: cleanRole })
    .eq('id', targetEmp.id);

  if (updateErr) {
    console.error('Failed to update employee role package:', updateErr);
    return res.status(500).json({ error: 'Database update failed' });
  }

  // 5.5. DB2 MIRROR SYNC (Role Package)
  try {
    const { getSecondaryAdminSupabase } = await import('./admin-db.js');
    const db2 = getSecondaryAdminSupabase();
    if (db2) {
      await db2
        .from('employees')
        .update({
          role_package_id: cleanRole || '',
          updated_at: new Date().toISOString(),
        })
        .eq('db1_employee_id', String(targetEmp.id));
    }
  } catch (db2Err) {
    console.warn('[DB2 Role Mirror Sync Warning]:', db2Err.message);
  }

  return res.status(200).json({
    ok: true,
    employeeId: targetEmp.id,
    fullName: targetEmp.full_name,
    rolePackageId: cleanRole,
  });
}
