import { hashPassword, verifyPassword, validatePasswordPolicy, createSessionCookie, validateOrigin } from './admin-auth.js';
import { getAdminSupabase } from './admin-db.js';
import { requireAdminSession } from './auth-me.js';

/**
 * POST /api/auth-change-password
 * Serverless Admin Password Change Endpoint
 */

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

  const authState = await requireAdminSession(req, { allowMustChangePassword: true });
  if (!authState) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }

  const policy = validatePasswordPolicy(newPassword);
  if (!policy.valid) {
    return res.status(400).json({ error: policy.error || 'New password does not meet security requirements. Must be at least 8 characters.' });
  }

  const supabase = getAdminSupabase();

  const { data: creds, error: credErr } = await supabase
    .from('employee_auth_credentials')
    .select('employee_id, password_hash, password_version')
    .eq('employee_id', authState.employee.id)
    .maybeSingle();

  if (credErr || !creds || !creds.password_hash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isCurrentValid = verifyPassword(currentPassword, creds.password_hash);
  if (!isCurrentValid) {
    return res.status(401).json({ error: 'Invalid current password' });
  }

  const newHash = hashPassword(newPassword);

  const { data: rpcRes, error: rpcErr } = await supabase.rpc('admin_change_password_commit', {
    p_employee_id: authState.employee.id,
    p_expected_password_version: creds.password_version,
    p_new_password_hash: newHash
  });

  const commitResult = Array.isArray(rpcRes) ? rpcRes[0] : rpcRes;

  if (rpcErr || !commitResult || commitResult.changed !== true) {
    return res.status(409).json({ error: 'Password change failed or version mismatch. Please retry.' });
  }

  const isProd = process.env.NODE_ENV === 'production';
  const clearCookie = createSessionCookie('', isProd, 0);
  res.setHeader('Set-Cookie', clearCookie);

  return res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please log in again with your new password.'
  });
}
