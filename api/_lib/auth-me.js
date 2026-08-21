import { hashSessionToken, parseSessionCookie } from './admin-auth.js';
import { getAdminSupabase } from './admin-db.js';
import { resolveServerPermissions } from './admin-permissions.js';

/**
 * GET /api/auth-me
 * Session validation & current employee profile retrieval
 */

export async function requireAdminSession(req) {
  const token = parseSessionCookie(req);
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const supabase = getAdminSupabase();

  const { data: session, error: sessErr } = await supabase
    .from('admin_sessions')
    .select('id, employee_id, expires_at, revoked_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (sessErr || !session || session.revoked_at) return null;

  if (new Date(session.expires_at) < new Date()) return null;

  const { data: employee, error: empErr } = await supabase
    .from('employees')
    .select('id, full_name, email, title, role_package_id, permission_overrides, employee_status')
    .eq('id', session.employee_id)
    .maybeSingle();

  if (empErr || !employee || employee.employee_status !== 'active') return null;

  const { data: creds } = await supabase
    .from('employee_auth_credentials')
    .select('must_change_password')
    .eq('employee_id', employee.id)
    .maybeSingle();

  const effectivePermissions = resolveServerPermissions(employee.role_package_id, employee.permission_overrides);

  return {
    session,
    employee,
    permissions: effectivePermissions,
    mustChangePassword: creds?.must_change_password === true
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authState = await requireAdminSession(req);
  if (!authState) {
    return res.status(401).json({ authenticated: false, error: 'Unauthenticated' });
  }

  return res.status(200).json({
    authenticated: true,
    employee: {
      id: authState.employee.id,
      fullName: authState.employee.full_name,
      title: authState.employee.title
    },
    permissions: authState.permissions,
    mustChangePassword: authState.mustChangePassword
  });
}
