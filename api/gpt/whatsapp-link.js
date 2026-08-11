import { createClient } from '@supabase/supabase-js';

const LEADS_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://piffaggeshfrubyjkhej.supabase.co';
const LEADS_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2OTMzMSwiZXhwIjoyMDk0MzQ1MzMxfQ.DT3n6RNiwA_Tr_xt9iHRqWpDH718lFamct9tAXG8E2w';

const supabaseLeads = createClient(LEADS_SUPABASE_URL, LEADS_SUPABASE_KEY);

export default async function handler(req, res) {
  // CORS Headers for ChatGPT Actions
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // API Key check
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const expectedKey = process.env.GPT_API_KEY || 'socialart-gpt-secret-2026';

  if (apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Yetkisiz erişim. Lütfen geçerli x-api-key başlığını gönderin.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST desteklenmektedir.' });
  }

  try {
    const { lead_name, phone, message_text } = req.body || {};

    if (!message_text || !message_text.trim()) {
      return res.status(400).json({ error: 'MISSING_MESSAGE', message: 'Gönderilecek mesaj metni (message_text) zorunludur.' });
    }

    let targetPhone = phone ? phone.trim() : '';
    let targetName = lead_name ? lead_name.trim() : 'Müşteri';

    // If phone is missing, lookup lead in Supabase
    if (!targetPhone && lead_name) {
      const searchStr = lead_name.trim().toLowerCase();
      const { data: leads } = await supabaseLeads.from('leads').select('*');
      const matches = (leads || []).filter(l => 
        (l.name || '').toLowerCase().includes(searchStr) || 
        (l.company || '').toLowerCase().includes(searchStr)
      );

      if (matches.length === 1 && matches[0].phone) {
        targetPhone = matches[0].phone;
        targetName = matches[0].name;
      } else if (matches.length > 1) {
        const formattedMatches = matches.slice(0, 5).map(m => ({
          id: m.id,
          name: m.name,
          company: m.company || m.name,
          phone: m.phone || 'Telefon yok'
        }));
        return res.status(200).json({
          ambiguous: true,
          message: `Sistemde "${lead_name}" ismiyle birden fazla müşteri bulundu. Lütfen kullanıcının hangi telefon numarasına mesaj atacağını netleştirin.`,
          matching_leads: formattedMatches
        });
      }
    }

    // Clean phone number format for WhatsApp (e.g. 05321234567 -> 905321234567)
    let cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '90' + cleanPhone.substring(1);
    } else if (cleanPhone.length === 10) {
      cleanPhone = '90' + cleanPhone;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({
        error: 'MISSING_PHONE',
        message: `Müşterinin (${targetName}) kayıtlı geçerli bir telefon numarası bulunamadı. Lütfen kullanıcıdan telefon numarasını sorun.`
      });
    }

    const encodedText = encodeURIComponent(message_text.trim());
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

    return res.status(200).json({
      success: true,
      message: `✅ ${targetName} için WhatsApp linki hazırlandı!`,
      whatsapp_link: whatsappUrl,
      recipient: targetName,
      phone: cleanPhone,
      message_preview: message_text.trim()
    });
  } catch (err) {
    return res.status(500).json({ error: 'Sunucu hatası', details: String(err) });
  }
}
