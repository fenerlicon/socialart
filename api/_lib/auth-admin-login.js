import {
  hashSessionToken,
  generateSessionToken,
  getSessionExpiry,
  createSessionCookie,
  verifyPassword,
  validateOrigin,
} from './admin-auth.js';
import { getAdminSupabase } from './admin-db.js';
import {
  normalizeIdentifier,
  getTrustedClientIp,
  deriveRateLimitHmac,
  checkRateLimit,
  recordRateLimitFailure,
  recordRateLimitSuccess,
} from './admin-rate-limit.js';

/**
 * POST /api/auth-admin-login
 * Dedicated Administrator Login Endpoint with Persistent Rate Limiting
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

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

  const { username, password } = req.body || {};

  // Reject missing username/password
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const normUsername = normalizeIdentifier(username);
  const clientIp = getTrustedClientIp(req);

  let ipHash, identHash;
  try {
    ipHash = deriveRateLimitHmac('IP', clientIp);
    identHash = deriveRateLimitHmac('ADMIN_IDENTIFIER', normUsername);
  } catch (err) {
    if (err.message === 'HMAC_SECRET_MISSING') {
      return res.status(503).json({ error: 'Authentication temporarily unavailable' });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  try {
    // 1. Rate limit check BEFORE database lookup or scrypt verification
    const { isBlocked } = await checkRateLimit(ipHash, identHash);
    if (isBlocked) {
      res.setHeader('Retry-After', '900');
      return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    }

    const supabase = getAdminSupabase();

    // 2. Fetch target Admin from dedicated admin_auth_identities table
    const { data: admin, error: adminErr } = await supabase
      .from('admin_auth_identities')
      .select('id, username, display_name, password_hash, is_active, must_change_password')
      .eq('username', normUsername)
      .maybeSingle();

    if (adminErr || !admin || admin.is_active !== true || !admin.password_hash) {
      await recordRateLimitFailure(ipHash, identHash);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Verify scrypt password hash
    const isPassValid = verifyPassword(password, admin.password_hash);
    if (!isPassValid) {
      await recordRateLimitFailure(ipHash, identHash);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. Generate opaque session token
    const rawToken = generateSessionToken();
    const tokenHash = hashSessionToken(rawToken);
    const expiresAt = getSessionExpiry(24);

    // 5. Insert polymorphic Admin session into admin_sessions
    const { error: sessErr } = await supabase
      .from('admin_sessions')
      .insert({
        token_hash: tokenHash,
        principal_type: 'admin',
        admin_id: admin.id,
        employee_id: null,
        expires_at: expiresAt,
      });

    if (sessErr) {
      return res.status(500).json({ error: 'Session establishment failed' });
    }

    // 6. Reset rate limit on success
    await recordRateLimitSuccess(ipHash, identHash);

    // 7. Set secure session cookie
    const isProd = process.env.NODE_ENV === 'production';
    const cookie = createSessionCookie(rawToken, isProd, 24 * 3600);
    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({
      success: true,
      principalType: 'admin',
      isAdmin: true,
      admin: {
        id: String(admin.id),
        username: admin.username,
        displayName: admin.display_name,
      },
      mustChangePassword: admin.must_change_password === true,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

