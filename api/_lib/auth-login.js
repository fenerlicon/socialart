import { hashSessionToken, generateSessionToken, getSessionExpiry, createSessionCookie, verifyPassword, validateOrigin } from './admin-auth.js';
import { getAdminSupabase } from './admin-db.js';
import { resolveServerPermissions } from './admin-permissions.js';
import { normalizeIdentifier, getTrustedClientIp, deriveRateLimitHmac, checkRateLimit, recordRateLimitFailure, recordRateLimitSuccess } from './admin-rate-limit.js';

/**
 * POST /api/auth-login
 * Serverless Auth Login Endpoint with Persistent Rate Limiting
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

  const { identifier, password } = req.body || {};

  // Reject missing identifier/password
  if (!identifier || !password || typeof identifier !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const normId = normalizeIdentifier(identifier);
  const clientIp = getTrustedClientIp(req);

  let ipHash, identHash;
  try {
    ipHash = deriveRateLimitHmac('IP', clientIp);
    identHash = deriveRateLimitHmac('IDENTIFIER', normId);
  } catch (err) {
    if (err.message === 'HMAC_SECRET_MISSING') {
      return res.status(503).json({ error: 'Authentication temporarily unavailable' });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  try {
    // 1. Check Persistent Rate Limit BEFORE any DB employee lookup or scrypt verification!
    const { isBlocked, blockedUntil } = await checkRateLimit(ipHash, identHash);
    if (isBlocked) {
      res.setHeader('Retry-After', '900'); // 15 minutes
      return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    }

    const supabase = getAdminSupabase();

    // 2. Fetch DB1 Employees
    const { data: employees, error: empErr } = await supabase
      .from('employees')
      .select('id, full_name, email, title, role_package_id, permission_overrides, employee_status');

    if (empErr || !employees || employees.length === 0) {
      await recordRateLimitFailure(ipHash, identHash);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Find matching employee by normalized identifier
    const targetEmp = employees.find(e => {
      const overrides = e.permission_overrides || {};
      const username = (overrides.username || '').toLowerCase().trim();
      const email = (e.email || '').toLowerCase().trim();
      const name = (e.full_name || '').toLowerCase().trim();
      const id = String(e.id).trim();

      return username === normId || email === normId || name === normId || id === normId;
    });

    if (!targetEmp || targetEmp.employee_status !== 'active') {
      await recordRateLimitFailure(ipHash, identHash);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. Lookup employee_auth_credentials
    const { data: creds, error: credErr } = await supabase
      .from('employee_auth_credentials')
      .select('employee_id, password_hash, must_change_password')
      .eq('employee_id', targetEmp.id)
      .maybeSingle();

    if (credErr || !creds || !creds.password_hash) {
      await recordRateLimitFailure(ipHash, identHash);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 5. Verify Password
    const isPassValid = verifyPassword(password, creds.password_hash);
    if (!isPassValid) {
      await recordRateLimitFailure(ipHash, identHash);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 6. Generate Session Token & Hash
    const rawToken = generateSessionToken();
    const tokenHash = hashSessionToken(rawToken);
    const expiresAt = getSessionExpiry(24);

    // 7. Insert Into admin_sessions
    const { error: sessErr } = await supabase
      .from('admin_sessions')
      .insert({
        employee_id: targetEmp.id,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });

    if (sessErr) {
      return res.status(500).json({ error: 'Failed to create session' });
    }

    // 8. On Session Insert Success ONLY: Reset IDENTIFIER Rate Limit Bucket (IP bucket stays)
    await recordRateLimitSuccess(identHash);

    // 9. Set HttpOnly Cookie & Return Sanitized Response
    const isProd = process.env.NODE_ENV === 'production';
    const cookieHeader = createSessionCookie(rawToken, isProd);
    res.setHeader('Set-Cookie', cookieHeader);

    const effectivePermissions = resolveServerPermissions(targetEmp.role_package_id, targetEmp.permission_overrides);

    return res.status(200).json({
      authenticated: true,
      employee: {
        id: targetEmp.id,
        fullName: targetEmp.full_name,
        title: targetEmp.title
      },
      permissions: effectivePermissions,
      mustChangePassword: creds.must_change_password === true
    });

  } catch (err) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}
