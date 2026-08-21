import { hashSessionToken, parseSessionCookie } from './_lib/admin-auth.js';
import { getAdminSupabase } from './_lib/admin-db.js';
import { resolveServerPermissions } from './_lib/admin-permissions.js';

/**
 * GET /api/auth-me
 * Serverless Auth Identity Verification Endpoint
 */

export async function requireAdminSession(req) {
  const rawToken = parseSessionCookie(req);
  if (!rawToken) return null;

  const tokenHash = hashSessionToken(rawToken);
  const supabase = getAdminSupabase();

  // 1. Lookup session in admin_sessions using SHA-256 token_hash ONLY
  const { data: session, error: sessErr } = await supabase
    .from('admin_sessions')
    .select('id, employee_id, expires_at, revoked_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (sessErr || !session || session.revoked_at !== null) {
    return null;
  }

  // Check expiry
  if (new Date(session.expires_at) <= new Date()) {
    return null;
  }

  // 2. Lookup DB1 Employee (Live state read)
  const { data: emp, error: empErr } = await supabase
    .from('employees')
    .select('id, full_name, title, role_package_id, permission_overrides, employee_status')
    .eq('id', session.employee_id)
    .maybeSingle();

  if (empErr || !emp || emp.employee_status !== 'active') {
    return null;
  }

  // 3. Lookup employee_auth_credentials for live must_change_password
  const { data: creds } = await supabase
    .from('employee_auth_credentials')
    .select('must_change_password')
    .eq('employee_id', emp.id)
    .maybeSingle();

  const permissions = resolveServerPermissions(emp.role_package_id, emp.permission_overrides);

  return {
    session,
    employee: {
      id: emp.id,
      fullName: emp.full_name,
      title: emp.title
    },
    permissions,
    mustChangePassword: creds?.must_change_password === true
  };
}

/**
 * Helper Guard for future business APIs (e.g. /api/admin-clients.js)
 * Enforces that users with mustChangePassword = true are blocked with 403 PASSWORD_CHANGE_REQUIRED
 */
export async function requireBusinessAdminSession(req) {
  const auth = await requireAdminSession(req);
  if (!auth) {
    return { status: 401, error: 'Unauthorized' };
  }

  if (auth.mustChangePassword) {
    return { status: 403, error: 'PASSWORD_CHANGE_REQUIRED' };
  }

  return { status: 200, auth };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const auth = await requireAdminSession(req);
    if (!auth) {
      return res.status(401).json({ authenticated: false, error: 'Unauthorized' });
    }

    return res.status(200).json({
      authenticated: true,
      employee: auth.employee,
      permissions: auth.permissions,
      mustChangePassword: auth.mustChangePassword
    });
  } catch (err) {
    return res.status(401).json({ authenticated: false, error: 'Unauthorized' });
  }
}
