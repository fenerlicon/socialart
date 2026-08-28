import { hashSessionToken, parseSessionCookie } from './admin-auth.js';
import { getAdminSupabase } from './admin-db.js';
import { resolveServerPermissions } from './admin-permissions.js';

/**
 * GET /api/auth-me
 * Session validation & current employee profile retrieval
 */

export async function requireAdminSession(req, options = {}) {
  const allowMustChangePassword = typeof options === 'boolean' ? options : (options?.allowMustChangePassword === true);
  const token = parseSessionCookie(req);
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const supabase = getAdminSupabase();

  const { data: session, error: sessErr } = await supabase
    .from('admin_sessions')
    .select('id, employee_id, admin_id, principal_type, expires_at, revoked_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (sessErr || !session || session.revoked_at) return null;

  if (new Date(session.expires_at) < new Date()) return null;

  // 1. Dedicated Admin Principal Session
  if (session.principal_type === 'admin' || session.admin_id) {
    const { data: admin, error: adminErr } = await supabase
      .from('admin_auth_identities')
      .select('id, username, display_name, is_active, must_change_password')
      .eq('id', session.admin_id)
      .maybeSingle();

    if (adminErr || !admin || admin.is_active !== true) return null;

    const mustChange = admin.must_change_password === true;
    if (!allowMustChangePassword && mustChange) {
      return null;
    }

    return {
      session,
      principalType: 'admin',
      isAdmin: true,
      admin: {
        id: String(admin.id),
        username: admin.username,
        displayName: admin.display_name,
        isActive: admin.is_active,
      },
      permissions: ['*'],
      mustChangePassword: mustChange,
    };
  }

  // 2. Standard Employee Principal Session
  const { data: employee, error: empErr } = await supabase
    .from('employees')
    .select('id, full_name, email, title, role_package_id, team_ids, employment_type, work_location_status, permission_overrides, employee_status')
    .eq('id', session.employee_id)
    .maybeSingle();

  if (empErr || !employee || employee.employee_status !== 'active') return null;

  const { data: creds } = await supabase
    .from('employee_auth_credentials')
    .select('must_change_password')
    .eq('employee_id', employee.id)
    .maybeSingle();

  const mustChange = creds?.must_change_password === true;

  if (!allowMustChangePassword && mustChange) {
    return null;
  }

  const effectivePermissions = resolveServerPermissions(employee.role_package_id, employee.permission_overrides);

  return {
    session,
    principalType: 'employee',
    isAdmin: false,
    employee,
    permissions: effectivePermissions,
    mustChangePassword: mustChange
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authState = await requireAdminSession(req, { allowMustChangePassword: true });
  if (!authState) {
    return res.status(401).json({ authenticated: false, error: 'Unauthenticated' });
  }

  if (authState.principalType === 'admin') {
    return res.status(200).json({
      authenticated: true,
      principalType: 'admin',
      isAdmin: true,
      admin: {
        id: authState.admin.id,
        username: authState.admin.username,
        displayName: authState.admin.displayName,
      },
      permissions: authState.permissions,
      mustChangePassword: authState.mustChangePassword,
    });
  }

  return res.status(200).json({
    authenticated: true,
    principalType: 'employee',
    isAdmin: false,
    employee: {
      id: authState.employee.id,
      fullName: authState.employee.full_name,
      email: authState.employee.email,
      title: authState.employee.title,
      rolePackageId: authState.employee.role_package_id,
      teamIds: Array.isArray(authState.employee.team_ids) ? authState.employee.team_ids : [],
      employmentType: authState.employee.employment_type || null,
      workLocationStatus: authState.employee.work_location_status || 'office',
      permissionOverrides: authState.employee.permission_overrides || {}
    },
    permissions: authState.permissions,
    mustChangePassword: authState.mustChangePassword
  });
}
