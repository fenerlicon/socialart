import crypto from 'crypto';
import { getAdminSupabase } from './admin-db.js';

/**
 * Server-Only Rate Limit Helper for Auth Login
 * STRICT SECURITY RULES:
 * 1. Must ONLY be imported in serverless lambdas under /api/.
 * 2. Uses ADMIN_RATE_LIMIT_HMAC_SECRET with domain separation (IP: / IDENTIFIER:).
 * 3. Never logs raw IP addresses, raw identifiers, or HMAC secrets.
 * 4. Fails closed if HMAC secret is missing in production.
 */

// Fallback test key for isolated unit tests only (NEVER in production)
const MOCK_TEST_SECRET = 'LOCAL_UNIT_TEST_MOCK_HMAC_SECRET_DO_NOT_USE_IN_PROD_32BYTES';

export function normalizeIdentifier(rawIdentifier) {
  if (typeof rawIdentifier !== 'string') return '';
  return rawIdentifier.trim().toLowerCase();
}

export function getTrustedClientIp(req) {
  if (!req || !req.headers) return 'UNKNOWN_CLIENT_IP';

  // Check Vercel/reverse-proxy headers in order of preference
  const xForwardedFor = req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For'];
  if (xForwardedFor && typeof xForwardedFor === 'string') {
    // In X-Forwarded-For, the first IP in CSV list is the client IP
    const firstIp = xForwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const xRealIp = req.headers['x-real-ip'] || req.headers['X-Real-IP'];
  if (xRealIp && typeof xRealIp === 'string' && xRealIp.trim()) {
    return xRealIp.trim();
  }

  const remoteAddr = req.socket?.remoteAddress || req.connection?.remoteAddress;
  if (remoteAddr && typeof remoteAddr === 'string' && remoteAddr.trim()) {
    return remoteAddr.trim();
  }

  return 'UNKNOWN_CLIENT_IP';
}

export function deriveRateLimitHmac(domainPrefix, rawValue) {
  const secret = process.env.ADMIN_RATE_LIMIT_HMAC_SECRET || MOCK_TEST_SECRET;

  if (process.env.NODE_ENV === 'production' && (!process.env.ADMIN_RATE_LIMIT_HMAC_SECRET || process.env.ADMIN_RATE_LIMIT_HMAC_SECRET.length < 32)) {
    throw new Error('HMAC_SECRET_MISSING');
  }

  const normalizedVal = typeof rawValue === 'string' ? rawValue.trim().toLowerCase() : '';
  const payload = `${domainPrefix}:${normalizedVal}`;

  return crypto.createHmac('sha256', secret).update(payload).digest('hex'); // 64 lowercase hex
}

export async function checkRateLimit(ipHash, identHash) {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase.rpc('admin_login_rate_limit_check', {
    p_ip_hash: ipHash,
    p_identifier_hash: identHash
  });

  if (error || !data || data.length === 0) {
    // If DB check fails, default to open for fail-safe or fail-closed based on error
    return { isBlocked: false, blockedUntil: null };
  }

  const row = data[0];
  return {
    isBlocked: row.is_blocked === true,
    blockedUntil: row.blocked_until ? new Date(row.blocked_until) : null
  };
}

export async function recordRateLimitFailure(ipHash, identHash) {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase.rpc('admin_login_rate_limit_failure', {
    p_ip_hash: ipHash,
    p_identifier_hash: identHash
  });

  if (error || !data || data.length === 0) {
    return { isBlocked: false, blockedUntil: null };
  }

  const row = data[0];
  return {
    isBlocked: row.is_blocked === true,
    blockedUntil: row.blocked_until ? new Date(row.blocked_until) : null
  };
}

export async function recordRateLimitSuccess(identHash) {
  const supabase = getAdminSupabase();
  await supabase.rpc('admin_login_rate_limit_success', {
    p_identifier_hash: identHash
  });
}
