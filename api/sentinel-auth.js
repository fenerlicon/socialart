import crypto from 'crypto';

const ipAttempts = new Map();
const tempSessions = new Map();

const MAX_ATTEMPTS = 4;
const LOCKOUT_MS = 30 * 60 * 1000;

// Individual Standard Base32 TOTP Secrets per User (Strict Base32 [A-Z2-7])
const USER_TOTP_SECRETS = {
  'furkan': process.env.SENTINEL_TOTP_FURKAN || 'FURKAN7SENTINEL7KEY7SA7SECRETX72',
  'ercan': process.env.SENTINEL_TOTP_ERCAN || 'ERCAN7SENTINEL7KEY7SA7SECRETX723',
  'celal': process.env.SENTINEL_TOTP_CELAL || 'CELAL7SENTINEL7KEY7SA7SECRETX724'
};

function base32tohex(base32) {
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  let hex = '';
  const clean = String(base32 || '').replace(/[\s=]/g, '').toUpperCase();
  for (let i = 0; i < clean.length; i++) {
    const val = base32chars.indexOf(clean.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substr(i, 4);
    hex += parseInt(chunk, 2).toString(16);
  }
  return hex;
}

function getTOTP(secretBase32, offsetWindows = 0) {
  const epoch = Math.floor(Date.now() / 1000.0);
  const time = Math.floor(epoch / 30) + offsetWindows;
  const timeHex = time.toString(16).padStart(16, '0');
  const timeBuffer = Buffer.from(timeHex, 'hex');
  const secretHex = base32tohex(secretBase32);
  const secretBuffer = Buffer.from(secretHex, 'hex');

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

function verifyTOTP(token, secretBase32) {
  const cleanToken = String(token || '').replace(/\s/g, '');
  for (let i = -1; i <= 1; i++) {
    if (getTOTP(secretBase32, i) === cleanToken) {
      return true;
    }
  }
  return false;
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
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
    if (!sessionToken || typeof sessionToken !== 'string') {
      return res.status(401).json({ valid: false });
    }
    const isValidToken = sessionToken.startsWith('sec_tok_') && sessionToken.length > 30;
    return res.status(200).json({ valid: isValidToken });
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
          error: '🚨 4 Başarısız deneme! IP adresiniz 30 dakika süreyle kilitlendi.',
          locked: true
        });
      }
      return res.status(401).json({
        error: `❌ Geçersiz kullanıcı adı veya şifre! Kalan Hak: ${failInfo.remaining}`,
        remainingAttempts: failInfo.remaining
      });
    }

    const ticket = 'ticket_' + crypto.randomBytes(16).toString('hex');
    tempSessions.set(ticket, {
      username: cleanUser,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3 * 60 * 1000
    });

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

    const session = tempSessions.get(tempTicket);
    if (!session || Date.now() > session.expiresAt) {
      tempSessions.delete(tempTicket);
      return res.status(401).json({ error: '2FA oturumunun süresi doldu. Lütfen baştan giriş yapınız.' });
    }

    const cleanOtp = String(otpCode || '').replace(/\s/g, '');
    const userTotpSecret = USER_TOTP_SECRETS[session.username];

    if (!userTotpSecret) {
      tempSessions.delete(tempTicket);
      return res.status(401).json({ error: 'Bu kullanıcı için tanımlı 2FA anahtarı bulunamadı.' });
    }

    const isTotpValid = verifyTOTP(cleanOtp, userTotpSecret);

    if (!isTotpValid) {
      const failInfo = recordFailedAttempt(clientIp);
      if (failInfo.isLocked) {
        tempSessions.delete(tempTicket);
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

    tempSessions.delete(tempTicket);
    resetAttempts(clientIp);

    const token = 'sec_tok_' + crypto.randomBytes(24).toString('hex') + '_' + Date.now();

    const displayNames = {
      furkan: 'Arda Furkan Aslanbaş',
      ercan: 'Ercan Bey',
      celal: 'Celal Bey'
    };

    return res.status(200).json({
      success: true,
      sessionToken: token,
      user: {
        username: session.username,
        role: 'SENTINEL_COMMANDER',
        displayName: displayNames[session.username] || 'Güvenlik Yöneticisi'
      }
    });
  }

  return res.status(400).json({ error: 'Geçersiz eylem (Invalid action)' });
}
