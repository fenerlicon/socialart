import loginHandler from './_lib/auth-login.js';
import meHandler from './_lib/auth-me.js';
import logoutHandler from './_lib/auth-logout.js';
import changePasswordHandler from './_lib/auth-change-password.js';
import provisionCredentialHandler from './_lib/auth-provision-credential.js';

const ALLOWED_ROUTES = new Set(['login', 'me', 'logout', 'change-password', 'provision-credential']);

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
  }

  // 3. Strict Allowlist Guard: Reject path traversal, arbitrary modules, malformed objects/arrays
  if (!route || typeof route !== 'string' || !ALLOWED_ROUTES.has(route)) {
    return res.status(404).json({ error: 'Auth route not found' });
  }

  // 4. Dispatch to handler within Error Boundary
  try {
    if (route === 'login') return await loginHandler(req, res);
    if (route === 'me') return await meHandler(req, res);
    if (route === 'logout') return await logoutHandler(req, res);
    if (route === 'change-password') return await changePasswordHandler(req, res);
    if (route === 'provision-credential') return await provisionCredentialHandler(req, res);
  } catch (err) {
    if (!res.headersSent && typeof res.status === 'function') {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(404).json({ error: 'Auth route not found' });
}
