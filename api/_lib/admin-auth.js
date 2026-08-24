import crypto from 'crypto';

/**
 * SocialArt Admin Authentication Core (Server-Only Library)
 * STRICT SECURITY RULES:
 * 1. This file must ONLY be imported in serverless lambdas under /api/.
 * 2. It must NEVER be imported by any frontend file in /src/ or /panel/.
 * 3. It must NEVER log or expose plaintext passwords, raw tokens, or secrets.
 */

const SCRYPT_PREFIX = 'scrypt$v=1';
const ALLOWED_PARAMS = {
  v: '1',
  N: 16384,
  r: 8,
  p: 1,
  keylen: 32,
  saltLen: 16
};

const BANNED_PASSWORDS = new Set([
  '123',
  '1234',
  '12345',
  '123456',
  '12345678',
  '123456789',
  'password',
  'password1',
  'admin',
  'admin123',
  'socialart',
  'socialart123',
  'socialart2026',
  'ajans2026'
]);

/**
 * Validates password strength against security policy
 */
export function validatePasswordPolicy(password) {
  if (typeof password !== 'string') {
    return { valid: false, error: 'Şifre metin formatında olmalıdır.' };
  }

  const trimmed = password.trim();
  if (!trimmed) {
    return { valid: false, error: 'Şifre boş bırakılamaz.' };
  }

  if (trimmed.length < 8) {
    return { valid: false, error: 'Şifre en az 8 karakter olmalıdır.' };
  }

  if (trimmed.length > 128) {
    return { valid: false, error: 'Şifre maksimum 128 karakter olabilir.' };
  }

  if (BANNED_PASSWORDS.has(trimmed.toLowerCase())) {
    return { valid: false, error: 'Bu şifre çok yaygın ve güvensizdir. Lütfen benzersiz bir şifre seçin.' };
  }

  return { valid: true };
}

/**
 * Hashes a plaintext password using Node.js crypto.scrypt
 * Canonical format: scrypt$v=1$N=16384$r=8$p=1$<salt_hex>$<derived_key_hex>
 */
export function hashPassword(password) {
  const policy = validatePasswordPolicy(password);
  if (!policy.valid) {
    throw new Error(`Password policy violation: ${policy.error}`);
  }

  const salt = crypto.randomBytes(ALLOWED_PARAMS.saltLen);
  const derivedKey = crypto.scryptSync(password, salt, ALLOWED_PARAMS.keylen, {
    N: ALLOWED_PARAMS.N,
    r: ALLOWED_PARAMS.r,
    p: ALLOWED_PARAMS.p,
    maxmem: 32 * 1024 * 1024
  });

  const saltHex = salt.toString('hex');
  const derivedHex = derivedKey.toString('hex');

  return `${SCRYPT_PREFIX}$N=${ALLOWED_PARAMS.N}$r=${ALLOWED_PARAMS.r}$p=${ALLOWED_PARAMS.p}$${saltHex}$${derivedHex}`;
}

/**
 * Safely verifies a plaintext password against a stored canonical scrypt hash
 * Uses crypto.timingSafeEqual to prevent timing attacks.
 */
export function verifyPassword(password, storedHash) {
  if (typeof password !== 'string' || typeof storedHash !== 'string') {
    return false;
  }

  try {
    const parts = storedHash.split('$');
    // Format: ["scrypt", "v=1", "N=16384", "r=8", "p=1", saltHex, derivedHex]
    if (parts.length !== 7 || parts[0] !== 'scrypt') {
      return false;
    }

    const versionStr = parts[1]; // v=1
    const nStr = parts[2];       // N=16384
    const rStr = parts[3];       // r=8
    const pStr = parts[4];       // p=1
    const saltHex = parts[5];
    const storedDerivedHex = parts[6];

    if (versionStr !== `v=${ALLOWED_PARAMS.v}`) return false;

    const N = parseInt(nStr.replace('N=', ''), 10);
    const r = parseInt(rStr.replace('r=', ''), 10);
    const p = parseInt(pStr.replace('p=', ''), 10);

    // Strictly enforce parameter whitelist to prevent CPU/memory DoS attacks
    if (N !== ALLOWED_PARAMS.N || r !== ALLOWED_PARAMS.r || p !== ALLOWED_PARAMS.p) {
      return false;
    }

    if (!saltHex || !storedDerivedHex || saltHex.length !== ALLOWED_PARAMS.saltLen * 2 || storedDerivedHex.length !== ALLOWED_PARAMS.keylen * 2) {
      return false;
    }

    const salt = Buffer.from(saltHex, 'hex');
    const storedDerivedKey = Buffer.from(storedDerivedHex, 'hex');

    const computedDerivedKey = crypto.scryptSync(password, salt, ALLOWED_PARAMS.keylen, {
      N,
      r,
      p,
      maxmem: 32 * 1024 * 1024
    });

    return crypto.timingSafeEqual(storedDerivedKey, computedDerivedKey);
  } catch (e) {
    return false;
  }
}

/**
 * Generates a high-entropy 256-bit (32-byte) random session token
 * Raw token is given ONLY to browser client.
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex'); // 64 hex characters
}

/**
 * Produces a SHA-256 64-character lowercase hex hash of rawToken
 * Stored in DB admin_sessions.token_hash
 */
export function hashSessionToken(rawToken) {
  if (typeof rawToken !== 'string' || !rawToken) {
    throw new Error('Raw session token must be a non-empty string.');
  }
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Generates a 24-hour server-side expiration Date object
 */
export function getSessionExpiry(durationHours = 24) {
  return new Date(Date.now() + durationHours * 60 * 60 * 1000);
}

/**
 * Creates a secure Set-Cookie header string for session management
 */
export function createSessionCookie(rawToken, isProduction = process.env.NODE_ENV === 'production', maxAge = 86400) {
  const cookieName = 'socialart_admin_session';
  let cookie = `${cookieName}=${encodeURIComponent(rawToken)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Strict`;
  
  if (isProduction) {
    cookie += '; Secure';
  }
  return cookie;
}

/**
 * Safely parses socialart_admin_session token from request headers or cookie string
 */
export function parseSessionCookie(req) {
  const cookieHeader = req?.headers?.cookie || req?.headers?.Cookie || (typeof req === 'string' ? req : '');
  if (!cookieHeader || typeof cookieHeader !== 'string') return null;

  const match = cookieHeader.match(/(?:^|;\s*)socialart_admin_session=([^;]+)/);
  if (!match) return null;

  try {
    const rawToken = decodeURIComponent(match[1]);
    return rawToken && rawToken.length === 64 ? rawToken : null;
  } catch (e) {
    return null;
  }
}

/**
 * Allowed production and development request origins for CSRF / Origin protection
 */
export const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://socialartmedya.com',
  'https://www.socialartmedya.com'
];

/**
 * Centralized origin validation for all mutating auth API endpoints
 */
export function validateOrigin(req) {
  const origin = req?.headers?.origin || req?.headers?.referer;
  if (!origin) return true; // Direct server requests or non-browser same-origin local

  try {
    const parsed = new URL(origin);
    return ALLOWED_ORIGINS.includes(parsed.origin);
  } catch (e) {
    return false;
  }
}

