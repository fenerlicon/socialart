import crypto from 'crypto';
import { hashPassword, validateOrigin } from './admin-auth.js';
import { getAdminSupabase } from './admin-db.js';
import { requireAdminSession } from './auth-me.js';
import { requireAdministrativeAuthority } from './admin-permissions.js';

/**
 * /api/auth-provision-credential
 * GET: Reads non-secret credential enrollment status
 * POST: Provisions a new one-time temporary credential for an employee
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (req.method === 'POST' && !validateOrigin(req)) {
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
    return res.status(authCheck.status || 403).json({
      error: authCheck.error || 'Unauthorized: employees.manage permission required',
    });
  }

  const supabase = getAdminSupabase();

  // --------------------------------------------------
  // GET: Check credential enrollment status
  // --------------------------------------------------
  if (req.method === 'GET') {
    let employeeId = null;
    try {
      const parsedUrl = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
      employeeId = parsedUrl.searchParams.get('employeeId');
    } catch (e) {}

    if (!employeeId && req.query?.employeeId) {
      employeeId = req.query.employeeId;
    }

    if (!employeeId || typeof employeeId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(employeeId.trim())) {
      return res.status(400).json({ error: 'Valid employeeId is required' });
    }

    const cleanId = employeeId.trim();

    const { data: cred, error: credErr } = await supabase
      .from('employee_auth_credentials')
      .select('employee_id, must_change_password')
      .eq('employee_id', cleanId)
      .maybeSingle();

    if (credErr) {
      return res.status(500).json({ error: 'Database error querying credential status' });
    }

    return res.status(200).json({
      credentialPresent: !!cred,
      mustChangePassword: cred ? cred.must_change_password === true : null
    });
  }

  // --------------------------------------------------
  // POST: Provision new one-time temporary credential
  // --------------------------------------------------
  if (req.method === 'POST') {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      return res.status(400).json({ error: 'Content-Type must be application/json' });
    }

    const { employeeId } = req.body || {};
    const rawId = (typeof employeeId === 'number' || typeof employeeId === 'string') ? String(employeeId).trim() : '';
    if (!rawId || !/^[a-zA-Z0-9_-]+$/.test(rawId)) {
      return res.status(400).json({ error: 'Valid employeeId is required' });
    }

    const cleanId = rawId;

    // Fetch target employee
    const { data: targetEmp, error: empErr } = await supabase
      .from('employees')
      .select('id, full_name, email, permission_overrides, employee_status')
      .eq('id', cleanId)
      .maybeSingle();

    if (empErr || !targetEmp) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (targetEmp.employee_status !== 'active') {
      return res.status(400).json({ error: 'Cannot provision panel access for inactive employee' });
    }

    // Determine human-friendly login identifier
    const overrides = targetEmp.permission_overrides || {};
    const username = (overrides.username || '').trim().toLowerCase();
    const email = (targetEmp.email || '').trim().toLowerCase();
    const resolvedIdentifier = username || email;

    if (!resolvedIdentifier) {
      return res.status(400).json({ error: 'Employee requires a valid username or email before panel access can be provisioned' });
    }

    // Check if credential already exists (FAIL-CLOSED: NO OVERWRITE)
    const { data: existingCred, error: checkErr } = await supabase
      .from('employee_auth_credentials')
      .select('employee_id')
      .eq('employee_id', cleanId)
      .maybeSingle();

    if (checkErr) {
      return res.status(500).json({ error: 'Database error checking existing credentials' });
    }

    if (existingCred) {
      return res.status(409).json({ error: 'Credential already exists for this employee. Overwriting is strictly forbidden.' });
    }

    // Generate 24-character cryptographically secure temporary password
    const rawTempPassword = crypto.randomBytes(18).toString('base64url');
    const passwordHash = hashPassword(rawTempPassword);

    const { error: insertErr } = await supabase
      .from('employee_auth_credentials')
      .insert({
        employee_id: String(targetEmp.id),
        password_hash: passwordHash,
        must_change_password: true,
        password_version: 1,
        password_updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (insertErr) {
      return res.status(500).json({ error: 'Failed to create employee auth credential record' });
    }

    return res.status(200).json({
      ok: true,
      employee: {
        id: String(targetEmp.id),
        fullName: targetEmp.full_name,
        identifier: resolvedIdentifier
      },
      temporaryPassword: rawTempPassword,
      mustChangePassword: true
    });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
