import crypto from 'crypto';

const ipAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30 * 60 * 1000;
const HMAC_SECRET = process.env.SENTINEL_HMAC_SECRET || 'SENTINEL_SECURE_HMAC_SIGN_KEY_2026_SA';

// Individual Standard Base32 TOTP Secrets per User (RFC 4648 Base32 [A-Z2-7])
const USER_TOTP_SECRETS = {
  'furkan': process.env.SENTINEL_TOTP_FURKAN || 'FURKAN7SENTINEL7KEY7SA7SECRETX72',
  'ercan': process.env.SENTINEL_TOTP_ERCAN || 'ERCAN7SENTINEL7KEY7SA7SECRETX723',
  'celal': process.env.SENTINEL_TOTP_CELAL || 'CELAL7SENTINEL7KEY7SA7SECRETX724'
};

// Standard RFC 4648 Base32 Decoder
function decodeBase32(base32) {
  const charTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = String(base32 || '').replace(/[\s=]/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (let i = 0; i < clean.length; i++) {
    const val = charTable.indexOf(clean[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

// RFC 6238 Standard Time-based One-Time Password (TOTP)
function getTOTP(secretBase32, offsetWindows = 0) {
  const epoch = Math.floor(Date.now() / 1000.0);
  const time = Math.floor(epoch / 30) + offsetWindows;
  const timeHex = time.toString(16).padStart(16, '0');
  const timeBuffer = Buffer.from(timeHex, 'hex');
  const secretBuffer = decodeBase32(secretBase32);

  const hmac = crypto.createHmac('sha1', secretBuffer);
  hmac.update(timeBuffer);
  const hmacResult = hmac.digest();

  const offset = hmacResult[hmacResult.length - 1] & 0xf;
  const code =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, '0');
}

// Tolerance window: ±2 windows (±60s clock drift tolerance for phones and servers)
function verifyTOTP(token, secretBase32) {
  const cleanToken = String(token || '').replace(/\s/g, '');
  if (!cleanToken || cleanToken.length !== 6) return false;
  
  for (let i = -2; i <= 2; i++) {
    if (getTOTP(secretBase32, i) === cleanToken) {
      return true;
    }
  }
  return false;
}

// Stateless HMAC Ticket for 2FA Step (survives across serverless lambda instances)
function signTempTicket(username) {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
  const payload = `${username}:${expiresAt}`;
  const sig = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
  return `ticket_${Buffer.from(payload).toString('base64url')}_${sig}`;
}

function verifyTempTicket(ticketStr) {
  if (!ticketStr || typeof ticketStr !== 'string' || !ticketStr.startsWith('ticket_')) return null;
  const parts = ticketStr.replace('ticket_', '').split('_');
  if (parts.length !== 2) return null;
  const [b64Payload, sig] = parts;
  try {
    const payload = Buffer.from(b64Payload, 'base64url').toString('utf8');
    const [username, expiresAtStr] = payload.split(':');
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return null;
    const expectedSig = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
    if (sig !== expectedSig) return null;
    return { username, expiresAt };
  } catch (e) {
    return null;
  }
}

// Stateless HMAC Session Token
function signSessionToken(username) {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity
  const payload = `${username}:${expiresAt}:${Date.now()}`;
  const sig = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
  return `sec_tok_${Buffer.from(payload).toString('base64url')}_${sig}`;
}

function verifySessionToken(tokenStr) {
  if (!tokenStr || typeof tokenStr !== 'string' || !tokenStr.startsWith('sec_tok_')) return false;
  const parts = tokenStr.replace('sec_tok_', '').split('_');
  if (parts.length !== 2) return false;
  const [b64Payload, sig] = parts;
  try {
    const payload = Buffer.from(b64Payload, 'base64url').toString('utf8');
    const [username, expiresAtStr] = payload.split(':');
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return false;
    const expectedSig = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
    return sig === expectedSig;
  } catch (e) {
    return false;
  }
}

function getClientIp(req) {
  const forwarded = req.headers && req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const record = ipAttempts.get(ip);

  if (record && record.lockedUntil && record.lockedUntil > now) {
    const remainingMins = Math.ceil((record.lockedUntil - now) / 60000);
    return {
      locked: true,
      message: `⛔ Güvenlik nedeniyle bu IP adresi kilitlendi. Kalan süre: ${remainingMins} dakika.`
    };
  }

  return { locked: false };
}

function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = ipAttempts.get(ip) || { count: 0, firstAttempt: now, lockedUntil: null };

  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }

  ipAttempts.set(ip, record);
  return {
    count: record.count,
    remaining: Math.max(0, MAX_ATTEMPTS - record.count),
    isLocked: record.count >= MAX_ATTEMPTS
  };
}

function resetAttempts(ip) {
  ipAttempts.delete(ip);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(clientIp);

  if (rateCheck.locked) {
    return res.status(429).json({ error: rateCheck.message, locked: true });
  }

  const { action, username, password, tempTicket, otpCode, sessionToken } = req.body || {};

  // ACTION 1: Verify Existing Session Token
  if (action === 'verify-session') {
    const isValid = verifySessionToken(sessionToken);
    return res.status(200).json({ valid: isValid });
  }

  // ACTION 2: Step 1 - Primary Admin Credentials Login
  if (action === 'login') {
    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();

    if (!cleanUser || !cleanPass) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });
    }

    const validUsers = {
      'furkan': process.env.SENTINEL_PASS_FURKAN || 'Socialart2026!',
      'ercan': process.env.SENTINEL_PASS_ERCAN || 'Ajans2026@',
      'celal': process.env.SENTINEL_PASS_CELAL || 'Socialart2026!'
    };

    const expectedPass = validUsers[cleanUser];

    if (!expectedPass || cleanPass !== expectedPass) {
      const failInfo = recordFailedAttempt(clientIp);
      if (failInfo.isLocked) {
        return res.status(429).json({
          error: '🚨 5 Başarısız deneme! IP adresiniz 30 dakika süreyle kilitlendi.',
          locked: true
        });
      }
      return res.status(401).json({
        error: `❌ Geçersiz kullanıcı adı veya şifre! Kalan Hak: ${failInfo.remaining}`,
        remainingAttempts: failInfo.remaining
      });
    }

    const ticket = signTempTicket(cleanUser);

    return res.status(200).json({
      success: true,
      require2FA: true,
      tempTicket: ticket,
      message: '1. Aşama doğrulandı. Lütfen Google Authenticator uygulamanızdaki 6 haneli canlı kodu giriniz.'
    });
  }

  // ACTION 3: Step 2 - Verify Live Rotating Google Authenticator (TOTP)
  if (action === 'verify-2fa') {
    if (!tempTicket || !otpCode) {
      return res.status(400).json({ error: '2FA bileti ve güvenlik kodu zorunludur.' });
    }

    const session = verifyTempTicket(tempTicket);
    const resolvedUsername = session?.username || String(username || '').trim().toLowerCase();

    if (!resolvedUsername) {
      return res.status(401).json({ error: '2FA oturumunun süresi doldu. Lütfen baştan giriş yapınız.' });
    }

    const cleanOtp = String(otpCode || '').replace(/\s/g, '');
    const userTotpSecret = USER_TOTP_SECRETS[resolvedUsername];

    if (!userTotpSecret) {
      return res.status(401).json({ error: 'Bu kullanıcı için tanımlı 2FA anahtarı bulunamadı.' });
    }

    const isTotpValid = verifyTOTP(cleanOtp, userTotpSecret);

    if (!isTotpValid) {
      const failInfo = recordFailedAttempt(clientIp);
      if (failInfo.isLocked) {
        return res.status(429).json({
          error: '🚨 Hatalı 2FA kodu! IP adresiniz 30 dakika süreyle kilitlendi.',
          locked: true
        });
      }
      return res.status(401).json({
        error: `❌ Google Authenticator Kodu Hatalı veya Süresi Doldu! Kalan Hak: ${failInfo.remaining}`,
        remainingAttempts: failInfo.remaining
      });
    }

    resetAttempts(clientIp);

    const token = signSessionToken(resolvedUsername);

    const displayNames = {
      furkan: 'Arda Furkan Aslanbaş',
      ercan: 'Ercan Bey',
      celal: 'Celal Bey'
    };

    return res.status(200).json({
      success: true,
      sessionToken: token,
      user: {
        username: resolvedUsername,
        role: 'SENTINEL_COMMANDER',
        displayName: displayNames[resolvedUsername] || 'Güvenlik Yöneticisi'
      }
    });
  }

  return res.status(400).json({ error: 'Geçersiz eylem (Invalid action)' });
}
