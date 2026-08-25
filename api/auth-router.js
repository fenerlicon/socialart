import loginHandler from './_lib/auth-login.js';
import meHandler from './_lib/auth-me.js';
import logoutHandler from './_lib/auth-logout.js';
import changePasswordHandler from './_lib/auth-change-password.js';
import provisionCredentialHandler from './_lib/auth-provision-credential.js';
import updatePermissionOverrideHandler from './_lib/auth-update-permission-override.js';
import updateEmployeeRoleHandler from './_lib/auth-update-employee-role.js';
import updateEmployeeIdentityHandler from './_lib/auth-update-employee-identity.js';
import updateEmployeeEmploymentTypeHandler from './_lib/auth-update-employee-employment-type.js';
import mirrorEmployeeHandler from './_lib/auth-mirror-employee.js';
import { validateOrigin } from './_lib/admin-auth.js';

const ALLOWED_ROUTES = new Set([
  'login',
  'me',
  'logout',
  'change-password',
  'provision-credential',
  'update-permission-override',
  'update-employee-role',
  'update-employee-identity',
  'update-employee-employment-type',
  'mirror-employee',
]);

export default async function handler(req, res) {
  const rawUrl = req.url || '';
  let route = null;

  // 1. Safely extract query param if it is a single valid string
  try {
    const parsedUrl = new URL(rawUrl, `http://${req.headers?.host || 'localhost'}`);
    const param = parsedUrl.searchParams.get('route');
    if (typeof param === 'string' && param.length > 0) {
      route = param;
    }
  } catch (e) {}

  // Also check req.query if passed by custom serverless runners
  if (!route && typeof req.query?.route === 'string' && req.query.route.length > 0) {
    route = req.query.route;
  }

  // 2. Fallback to path matching if rewrite stripped query string
  if (!route) {
    if (rawUrl.includes('/api/auth-login')) route = 'login';
    else if (rawUrl.includes('/api/auth-me')) route = 'me';
    else if (rawUrl.includes('/api/auth-logout')) route = 'logout';
    else if (rawUrl.includes('/api/auth-change-password')) route = 'change-password';
    else if (rawUrl.includes('/api/auth-provision-credential')) route = 'provision-credential';
    else if (rawUrl.includes('/api/auth-update-permission-override')) route = 'update-permission-override';
    else if (rawUrl.includes('/api/auth-update-employee-role')) route = 'update-employee-role';
    else if (rawUrl.includes('/api/auth-update-employee-identity')) route = 'update-employee-identity';
    else if (rawUrl.includes('/api/auth-update-employee-employment-type')) route = 'update-employee-employment-type';
    else if (rawUrl.includes('/api/auth-mirror-employee')) route = 'mirror-employee';
  }

  // 3. Strict Allowlist Guard: Reject path traversal, arbitrary modules, malformed objects/arrays
  if (!route || typeof route !== 'string' || !ALLOWED_ROUTES.has(route)) {
    return res.status(404).json({ error: 'Auth route not found' });
  }

  // 4. CSRF / Origin Guard: Reject unauthorized origins on mutating requests
  if (req.method !== 'GET' && !validateOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden Origin' });
  }

  // 5. Dispatch to handler within Error Boundary
  try {
    if (route === 'login') return await loginHandler(req, res);
    if (route === 'me') return await meHandler(req, res);
    if (route === 'logout') return await logoutHandler(req, res);
    if (route === 'change-password') return await changePasswordHandler(req, res);
    if (route === 'provision-credential') return await provisionCredentialHandler(req, res);
    if (route === 'update-permission-override') return await updatePermissionOverrideHandler(req, res);
    if (route === 'update-employee-role') return await updateEmployeeRoleHandler(req, res);
    if (route === 'update-employee-identity') return await updateEmployeeIdentityHandler(req, res);
    if (route === 'update-employee-employment-type') return await updateEmployeeEmploymentTypeHandler(req, res);
    if (route === 'mirror-employee') return await mirrorEmployeeHandler(req, res);
  } catch (err) {
    if (!res.headersSent && typeof res.status === 'function') {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(404).json({ error: 'Auth route not found' });
}
