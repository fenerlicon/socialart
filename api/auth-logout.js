import { hashSessionToken, parseSessionCookie } from './_lib/admin-auth.js';
import { getAdminSupabase } from './_lib/admin-db.js';

/**
 * POST /api/auth-logout
 * Serverless Auth Logout Endpoint
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

  try {
    const rawToken = parseSessionCookie(req);
    if (rawToken) {
      const tokenHash = hashSessionToken(rawToken);
      const supabase = getAdminSupabase();

      // Revoke session in admin_sessions table
      await supabase
        .from('admin_sessions')
        .update({ revoked_at: new Date().toISOString() })
        .eq('token_hash', tokenHash);
    }
  } catch (e) {
    // Idempotent logout - ignore DB errors
  }

  // Clear client cookie (Max-Age=0)
  const isProd = process.env.NODE_ENV === 'production';
  let clearCookie = 'socialart_admin_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict';
  if (isProd) {
    clearCookie += '; Secure';
  }

  res.setHeader('Set-Cookie', clearCookie);
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}
