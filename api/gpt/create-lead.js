import { createClient } from '@supabase/supabase-js';

const LEADS_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://piffaggeshfrubyjkhej.supabase.co';
const LEADS_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2OTMzMSwiZXhwIjoyMDk0MzQ1MzMxfQ.DT3n6RNiwA_Tr_xt9iHRqWpDH718lFamct9tAXG8E2w';

const supabaseLeads = createClient(LEADS_SUPABASE_URL, LEADS_SUPABASE_KEY);

export default async function handler(req, res) {
  // CORS Headers
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
    const { name, phone, company, service, budget, rep, city, notes } = req.body || {};

    const missingFields = [];
    if (!name || !name.trim()) missingFields.push('Müşteri Adı (name)');
    if (!phone || !phone.trim()) missingFields.push('Telefon Numarası (phone)');
    if (!service || !service.trim()) missingFields.push('İlgilendiği Hizmet (service)');

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'MISSING_REQUIRED_FIELDS',
        message: `Yeni müşteri eklemek için eksik zorunlu alanlar var: ${missingFields.join(', ')}. Lütfen kullanıcıya bu bilgileri sorun.`,
        missing_fields: missingFields
      });
    }

    const nowIso = new Date().toISOString();
    const leadId = `GPT-LEAD-${Date.now()}`;

    const initialNoteObj = notes ? [{
      id: `NOTE-${Date.now()}`,
      text: notes.trim(),
      created_at: nowIso,
      author: 'ChatGPT AI'
    }] : [];

    const newLeadRecord = {
      name: name.trim(),
      phone: phone.trim(),
      company: (company || name).trim(),
      service: service.trim(),
      budget: budget ? parseFloat(budget) || 0 : 0,
      rep: rep ? rep.trim() : 'Atanmamış',
      city: city ? city.trim() : '',
      status: 'Sıcak',
      stage: 'NEW',
      platform: 'ChatGPT AI Assistant',
      date: new Date().toLocaleDateString('tr-TR'),
      created_at: nowIso,
      updated_at: nowIso,
      reaction: notes ? notes.trim() : 'ChatGPT üzerinden yeni lead eklendi.',
      notes: initialNoteObj
    };

    const { data, error } = await supabaseLeads
      .from('leads')
      .insert([newLeadRecord])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Yeni lead veritabanına eklenirken hata oluştu', details: error.message });
    }

    return res.status(200).json({
      success: true,
      message: `✅ "${name}" adında yeni müşteri başarıyla CRM'e eklendi!`,
      lead: data
    });
  } catch (err) {
    return res.status(500).json({ error: 'Sunucu hatası', details: String(err) });
  }
}
