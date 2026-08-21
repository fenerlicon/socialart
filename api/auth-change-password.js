import { hashPassword, verifyPassword, validatePasswordPolicy } from './_lib/admin-auth.js';
import { getAdminSupabase } from './_lib/admin-db.js';
import { requireAdminSession } from './auth-me.js';

/**
 * POST /api/auth-change-password
 * Serverless Change Password API Endpoint
 */

function validateOrigin(req) {
  const origin = req.headers.origin || req.headers.referer;
  if (!origin) return true;

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://socialartajans.com'
  ];

  try {
    const parsed = new URL(origin);
    return allowedOrigins.includes(parsed.origin);
  } catch (e) {
    return false;
  }
}

export default async function handler(req, res) {
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

  // 1. Require Authenticated Admin Session (Strictly ignore employee_id in request body)
  const auth = await requireAdminSession(req);
  if (!auth || !auth.employee || !auth.employee.id) {
    return res.status(401).json({ error: 'Unauthorized session' });
  }

  const employeeId = auth.employee.id;

  const { currentPassword, newPassword } = req.body || {};

  // Reject missing fields
  if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }

  // Reject identical passwords
  if (currentPassword === newPassword) {
    return res.status(400).json({ error: 'New password cannot be identical to current password' });
  }

  // 2. Validate New Password Policy
  const policyResult = validatePasswordPolicy(newPassword);
  if (!policyResult.valid) {
    return res.status(400).json({ error: policyResult.error });
  }

  const supabase = getAdminSupabase();

  try {
    // 3. Lookup Live Credential Row for Employee
    const { data: creds, error: credErr } = await supabase
      .from('employee_auth_credentials')
      .select('employee_id, password_hash, password_version, must_change_password')
      .eq('employee_id', employeeId)
      .maybeSingle();

    if (credErr || !creds || !creds.password_hash) {
      return res.status(401).json({ error: 'Credential record not found' });
    }

    // 4. Verify Current Password
    const isCurrentValid = verifyPassword(currentPassword, creds.password_hash);
    if (!isCurrentValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // 5. Generate Canonical Scrypt Hash for New Password
    const newPasswordHash = hashPassword(newPassword);
    const expectedVersion = creds.password_version;

    // 6. Invoke Atomic RPC Function: admin_change_password_commit
    const { data: commitResult, error: rpcErr } = await supabase.rpc('admin_change_password_commit', {
      p_employee_id: employeeId,
      p_expected_password_version: expectedVersion,
      p_new_password_hash: newPasswordHash
    });

    if (rpcErr || !commitResult || commitResult.length === 0) {
      return res.status(500).json({ error: 'Unable to change password' });
    }

    const row = commitResult[0];
    const isProd = process.env.NODE_ENV === 'production';
    let clearCookie = 'socialart_admin_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict';
    if (isProd) {
      clearCookie += '; Secure';
    }

    if (row.changed === true) {
      // Success: Sessions revoked in DB by RPC -> Clear cookie and require re-authentication
      res.setHeader('Set-Cookie', clearCookie);
      return res.status(200).json({
        success: true,
        reauthenticationRequired: true,
        message: 'Password changed successfully. Please log in again with your new password.'
      });
    } else {
      // Stale version / concurrent update: Clear cookie and return 409
      res.setHeader('Set-Cookie', clearCookie);
      return res.status(409).json({ error: 'Authentication state changed. Sign in again.' });
    }

  } catch (err) {
    return res.status(500).json({ error: 'Unable to change password' });
  }
}
