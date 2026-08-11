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

  try {
    const { name, id } = req.query || {};

    if (id) {
      const { data: lead, error } = await supabaseLeads
        .from('leads')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !lead) {
        return res.status(404).json({ error: 'LEAD_NOT_FOUND', message: `ID: ${id} olan müşteri bulunamadı.` });
      }

      return res.status(200).json({ lead_history: lead });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'MISSING_NAME',
        message: 'Müşteri adı (name) veya ID (id) sorgu parametresi zorunludur. Örn: /api/gpt/lead-history?name=Emre'
      });
    }

    const searchStr = name.trim().toLowerCase();

    const { data: allLeads, error: searchErr } = await supabaseLeads
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (searchErr) {
      return res.status(500).json({ error: 'Sorgu hatası', details: searchErr.message });
    }

    const matches = (allLeads || []).filter(l => {
      const n = (l.name || '').toLowerCase();
      const c = (l.company || '').toLowerCase();
      return n.includes(searchStr) || c.includes(searchStr);
    });

    if (matches.length === 0) {
      return res.status(404).json({
        error: 'LEAD_NOT_FOUND',
        message: `System'de "${name}" ismiyle eşleşen müşteri bulunamadı.`
      });
    }

    if (matches.length > 1) {
      const formattedMatches = matches.slice(0, 5).map(m => ({
        id: m.id,
        name: m.name,
        company: m.company || m.name,
        phone: m.phone || 'Telefon yok',
        service: m.service || 'Hizmet yok'
      }));

      return res.status(200).json({
        ambiguous: true,
        message: `Sistemde "${name}" ismiyle eşleşen ${matches.length} müşteri bulundu. Lütfen kullanıcıya hangisinin geçmiş notlarını istediğini sorun.`,
        matching_leads: formattedMatches
      });
    }

    const target = matches[0];
    return res.status(200).json({
      success: true,
      lead_history: {
        id: target.id,
        name: target.name,
        company: target.company || target.name,
        phone: target.phone || '',
        email: target.email || '',
        service: target.service || '',
        rep: target.rep || 'Atanmamış',
        status: target.status || '',
        stage: target.stage || '',
        budget: target.budget || 0,
        city: target.city || '',
        created_at: target.created_at,
        updated_at: target.updated_at,
        reaction: target.reaction || '',
        all_notes: target.notes || []
      }
    });

  } catch (err) {
    return res.status(500).json({ error: 'Sunucu hatası', details: String(err) });
  }
}
