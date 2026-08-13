// Vercel Serverless Function to send email notifications
// You can use Resend, SendGrid, or any other provider.
// This template uses a simple Discord Webhook as a fallback and Resend as primary if API_KEY is present.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
🔗 **Platform/URL:** ${data.url}
🛠 **Hizmetler:** ${data.services.join(', ')}
📅 **Randevu Tarihi:** ${data.date}
⏰ **Randevu Saati:** ${data.time}
---------------------------
📍 *Kaynak: SocialArt Hizmet Sayfası*
    `;

    // 1. Discord Webhook Notification (Easiest to see immediately)
    // Create a Discord Webhook and add to Vercel Env as DISCORD_WEBHOOK_URL
    if (process.env.DISCORD_WEBHOOK_URL) {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      });
    }

    // 2. Email Notification (via Resend)
    if (process.env.RESEND_API_KEY) {
      let emailPayload;

      if (type === 'appointment') {
        // Transactional Appointment Email
        emailPayload = {
          from: 'SocialArt Bildirim <tugba@socialartajans.com>',
          to: ['hello@socialartajans.com'],
          subject: `🔥 Yeni Randevu: ${data.fullName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
              <div style="background: #8a2be2; padding: 30px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 24px;">Yeni Lead Yakalandı!</h1>
              </div>
              <div style="padding: 30px; background: #fff;">
                <p><strong>İsim:</strong> ${data.fullName}</p>
                <p><strong>Telefon:</strong> ${data.phone}</p>
                <p><strong>Hizmetler:</strong> ${data.services.join(', ')}</p>
                <p><strong>Zaman:</strong> ${data.date} - ${data.time}</p>
                <div style="margin-top: 20px; text-align: center;">
                  <a href="https://www.socialartmedya.com/admin" style="background: #ff0055; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">Panele Git</a>
                </div>
              </div>
            </div>
          `
        };
      } else if (type === 'marketing') {
        // Marketing Campaign Email
        emailPayload = {
          from: 'SocialArt <tugba@socialartajans.com>', // Tugba'nın maili olarak güncellendi
          to: [data.to],
          subject: data.subject,
          html: `
            <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
              <div style="background: #000; padding: 20px; text-align: center;">
                <img src="https://www.socialartmedya.com/logo.png" alt="SocialArt" style="width: 150px;" />
              </div>
              <div style="padding: 40px 20px;">
                ${data.content.replace(/\n/g, '<br />')}
              </div>
              <div style="background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777;">
                © ${new Date().getFullYear()} SocialArt Ajans. Tüm hakları saklıdır.<br />
                Bu maili bir iş ortağımız olduğunuz için alıyorsunuz.
              </div>
            </div>
          `
        };
      }

      if (emailPayload) {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify(emailPayload)
        });
        let resendData = {};
        try {
          const text = await resendResponse.text();
          resendData = text ? JSON.parse(text) : {};
        } catch (e) {
          resendData = {};
        }
        console.log('Resend Response:', resendData);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}
