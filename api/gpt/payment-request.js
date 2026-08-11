import { createClient } from '@supabase/supabase-js';

const PRIMARY_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://osuwytugjscwhcxxkhfa.supabase.co';
const PRIMARY_SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const supabase = createClient(PRIMARY_SUPABASE_URL, PRIMARY_SUPABASE_KEY);

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
    return res.status(405).json({ error: 'Sadece POST desteklenir.' });
  }

  try {
    const { client_name, company_code, title, amount, description } = req.body || {};

    if (!client_name || !title || !amount) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Müşteri adı (client_name), Ödeme başlığı (title) ve Tutar (amount) zorunludur.'
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'INVALID_AMOUNT', message: 'Tutar 0\'dan büyük geçerli bir sayı olmalıdır.' });
    }

    const code = (company_code || client_name).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const nowIso = new Date().toISOString();
    const requestId = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const kdvRate = 0.20;
    const totalWithKdv = numAmount * (1 + kdvRate);

    const requestPayload = {
      id: requestId,
      client_name: client_name.trim(),
      company_code: code,
      title: title.trim(),
      description: description || '',
      amount: numAmount,
      kdv_amount: numAmount * kdvRate,
      total_amount: totalWithKdv,
      status: 'pending',
      created_at: nowIso
    };

    const notifRecord = {
      id: requestId,
      recipient_employee_id: '26fff081-5502-4624-a71a-b6e4772467c3', // Celal
      type: 'payment_request',
      title: `💳 Ödeme Talebi: ${client_name} - ₺${numAmount.toLocaleString('tr-TR')}`,
      message: JSON.stringify(requestPayload),
      related_entity_type: 'payment',
      related_entity_id: code,
      is_read: false,
      created_at: nowIso
    };

    const { error: insertErr } = await supabase.from('notifications').insert([notifRecord]);

    if (insertErr) {
      return res.status(500).json({ error: 'Ödeme talebi kaydedilemedi', details: insertErr.message });
    }

    const checkoutUrl = `https://socialartmedya.com/musteri-portali`;

    return res.status(200).json({
      success: true,
      message: `✅ "${client_name}" firması için ₺${numAmount.toLocaleString('tr-TR')} (+%20 KDV dahil ₺${totalWithKdv.toLocaleString('tr-TR')}) tutarında ödeme talebi oluşturuldu!`,
      payment_request: {
        id: requestId,
        client: client_name,
        company_code: code,
        title: title,
        base_amount_tl: numAmount,
        kdv_tl: numAmount * kdvRate,
        total_with_kdv_tl: totalWithKdv,
        status: 'BEKLİYOR (pending)',
        client_checkout_url: checkoutUrl
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Sunucu hatası', details: String(err) });
  }
}
