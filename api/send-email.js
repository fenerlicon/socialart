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
    // Add RESEND_API_KEY to Vercel Env
    if (process.env.RESEND_API_KEY) {
       await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'SocialArt <onboarding@resend.dev>',
          to: ['hello@socialartajans.com'], // Hedef mail adresi
          subject: `Yeni Randevu: ${data.fullName}`,
          html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #8a2be2;">Yeni Randevu Talebi</h2>
            <p><strong>İsim:</strong> ${data.fullName}</p>
            <p><strong>Telefon:</strong> ${data.phone}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>URL:</strong> ${data.url}</p>
            <p><strong>Hizmetler:</strong> ${data.services.join(', ')}</p>
            <p><strong>Tarih:</strong> ${data.date}</p>
            <p><strong>Saat:</strong> ${data.time}</p>
            <hr />
            <p style="font-size: 0.8rem; color: #777;">Bu mesaj SocialArt web sitesi üzerinden otomatik olarak oluşturulmuştur.</p>
          </div>`
        })
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}
