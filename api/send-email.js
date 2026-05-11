// Vercel Serverless Function to send email notifications
// You can use Resend, SendGrid, or any other provider.
// This template uses a simple Discord Webhook as a fallback and Resend as primary if API_KEY is present.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(450).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body;

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
       const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'SocialArt Bildirim <onboarding@resend.dev>', // Resend onaylı değilse sadece bu adresten gönderir
          to: ['hello@socialartajans.com'], // Senin mail adresin
          subject: `🔥 Yeni Randevu: ${data.fullName}`,
          html: `
            <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
              <div style="background: #8a2be2; padding: 30px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 24px;">Yeni Lead Yakalandı!</h1>
              </div>
              <div style="padding: 30px; background: #fff;">
                <p style="font-size: 16px; color: #333;">Siteden yeni bir randevu talebi geldi. Detaylar aşağıdadır:</p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><b>İsim:</b></td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.fullName}</td></tr>
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><b>Telefon:</b></td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.phone}</td></tr>
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><b>Email:</b></td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.email}</td></tr>
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><b>URL/Platform:</b></td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.url}</td></tr>
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><b>Hizmetler:</b></td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.services.join(', ')}</td></tr>
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><b>Randevu Tarihi:</b></td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.date}</td></tr>
                  <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee;"><b>Randevu Saati:</b></td><td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.time}</td></tr>
                </table>
                <div style="margin-top: 30px; text-align: center;">
                  <a href="https://socialart-ajans.vercel.app/admin" style="background: #ff0055; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">Müşteri Paneline Git</a>
                </div>
              </div>
            </div>
          `
        })
      });
      
      const resendData = await resendResponse.json();
      console.log('Resend Response:', resendData);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}
