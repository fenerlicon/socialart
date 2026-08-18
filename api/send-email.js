const emailRateLimitMap = new Map();
const MAX_EMAILS_PER_WINDOW = 6;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);
  const now = Date.now();
  const ipData = emailRateLimitMap.get(clientIp) || { count: 0, resetTime: now + WINDOW_MS };

  if (now > ipData.resetTime) {
    ipData.count = 0;
    ipData.resetTime = now + WINDOW_MS;
  }

  ipData.count += 1;
  emailRateLimitMap.set(clientIp, ipData);

  if (ipData.count > MAX_EMAILS_PER_WINDOW) {
    return res.status(429).json({
      error: '⛔ Çok fazla form gönderimi yapıldı. Lütfen birkaç dakika sonra tekrar deneyiniz.'
    });
  }

  const { type, data } = req.body || {};

  if (!data || !data.fullName || (!data.phone && !data.email)) {
    return res.status(400).json({ error: 'Geçersiz form verisi. İsim ve iletişim bilgisi zorunludur.' });
  }

  try {
    const message = `
🔔 **Yeni Randevu Talebi!**
---------------------------
👤 **İsim:** ${data.fullName}
📞 **Telefon:** ${data.phone}
📧 **Email:** ${data.email}
🔗 **Platform/URL:** ${data.url || '-'}
🛠 **Hizmetler:** ${Array.isArray(data.services) ? data.services.join(', ') : (data.services || '-')}
📅 **Randevu Tarihi:** ${data.date || '-'}
⏰ **Randevu Saati:** ${data.time || '-'}
---------------------------
📍 *Kaynak: SocialArt Hizmet Sayfası*
    `;

    if (process.env.DISCORD_WEBHOOK_URL) {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      });
    }

    if (process.env.RESEND_API_KEY) {
      const escapeHtml = (str) => String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);

      const safeName = escapeHtml(data.fullName);
      const safePhone = escapeHtml(data.phone);
      const safeEmail = escapeHtml(data.email);
      const safeServices = Array.isArray(data.services) ? data.services.map(escapeHtml).join(', ') : escapeHtml(data.services || 'Genel');
      const safeDate = escapeHtml(data.date);
      const safeTime = escapeHtml(data.time);

      const emailPayload = {
        from: 'SocialArt Bildirim <tugba@socialartajans.com>',
        to: ['hello@socialartajans.com'],
        subject: `🔥 Yeni Randevu / Talep: ${safeName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
            <div style="background: #8a2be2; padding: 30px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">Yeni Lead & Randevu Talebi</h1>
            </div>
            <div style="padding: 30px; background: #fff;">
              <p><strong>İsim:</strong> ${safeName}</p>
              <p><strong>Telefon:</strong> ${safePhone}</p>
              <p><strong>E-posta:</strong> ${safeEmail}</p>
              <p><strong>Hizmetler:</strong> ${safeServices}</p>
              <p><strong>Zaman:</strong> ${safeDate} - ${safeTime}</p>
            </div>
          </div>
        `
      };

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify(emailPayload)
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}
