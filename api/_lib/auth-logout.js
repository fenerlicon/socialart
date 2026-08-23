import { hashSessionToken, parseSessionCookie, createSessionCookie, validateOrigin } from './admin-auth.js';
import { getAdminSupabase } from './admin-db.js';

/**
 * POST /api/auth-logout
 * Serverless Admin Session Revocation & Cookie Clearing Endpoint
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden Origin' });
  }

  const token = parseSessionCookie(req);
  if (token) {
    const tokenHash = hashSessionToken(token);
    const supabase = getAdminSupabase();

    try {
      await supabase
        .from('admin_sessions')
        .update({ revoked_at: new Date().toISOString() })
        .eq('token_hash', tokenHash);
    } catch (err) {
      // Ignore DB errors during logout to guarantee client cookie clearance
    }
  }

  const isProd = process.env.NODE_ENV === 'production';
  const clearCookie = createSessionCookie('', isProd, 0);
  res.setHeader('Set-Cookie', clearCookie);

  return res.status(200).json({ authenticated: false, message: 'Logged out successfully' });
}
