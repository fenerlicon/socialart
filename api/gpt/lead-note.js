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
    return res.status(405).json({ error: 'Sadece POST isteği desteklenmektedir.' });
  }

  try {
    const { lead_id, lead_name, note, stage, status } = req.body || {};

    if (!note || !note.trim()) {
      return res.status(400).json({
        error: 'MISSING_NOTE',
        message: 'Eklenecek not/güncelleme metni (note) zorunludur. Lütfen not metnini kullanıcıya sorun.'
      });
    }

    // 1. If lead_id is provided, update directly
    if (lead_id) {
      const { data: existingLead, error: fetchErr } = await supabaseLeads
        .from('leads')
        .select('*')
        .eq('id', lead_id)
        .maybeSingle();

      if (fetchErr || !existingLead) {
        return res.status(404).json({ error: 'LEAD_NOT_FOUND', message: `ID: ${lead_id} olan müşteri bulunamadı.` });
      }

      return await applyLeadUpdate(res, existingLead, note, stage, status);
    }

    // 2. Search by lead_name
    if (!lead_name || !lead_name.trim()) {
      return res.status(400).json({
        error: 'MISSING_LEAD_NAME',
        message: 'Müşteri adı veya ID belirtilmedi. Lütfen kullanıcıdan hangi müşteriye not ekleneceğini (lead_name) sorun.'
      });
    }

    const searchStr = lead_name.trim().toLocaleLowerCase('tr-TR');

    const { data: allLeads, error: searchErr } = await supabaseLeads
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (searchErr) {
      return res.status(500).json({ error: 'Arama hatası', details: searchErr.message });
    }

    const matches = (allLeads || []).filter(l => {
      const name = (l.name || '').toLocaleLowerCase('tr-TR');
      const company = (l.company || '').toLocaleLowerCase('tr-TR');
      const rep = (l.rep || '').toLocaleLowerCase('tr-TR');
      return name.includes(searchStr) || company.includes(searchStr) || rep.includes(searchStr);
    });

    if (matches.length === 0) {
      return res.status(404).json({
        error: 'LEAD_NOT_FOUND',
        message: `Sistemde "${lead_name}" ismiyle eşleşen müşteri bulunamadı. Kullanıcıya doğru müşteri ismini veya yeni lead eklemek isteyip istemediğini sorun.`
      });
    }

    // AMBIGUOUS: Multiple leads match! Ask user to specify
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
        message: `Sistemde "${lead_name}" aramasıyla eşleşen ${matches.length} müşteri bulundu. Lütfen kullanıcıya bunlardan hangisi olduğunu sorun ve lead_id ile tekrar isteyin.`,
        matching_leads: formattedMatches
      });
    }

    // Exactly 1 match found
    const targetLead = matches[0];
    return await applyLeadUpdate(res, targetLead, note, stage, status);

  } catch (err) {
    return res.status(500).json({ error: 'Sunucu hatası', details: String(err) });
  }
}

async function applyLeadUpdate(res, targetLead, noteText, newStage, newStatus) {
  const nowIso = new Date().toISOString();
  const existingNotes = Array.isArray(targetLead.notes) ? targetLead.notes : [];
  
  const newNoteEntry = {
    id: `GPT-NOTE-${Date.now()}`,
    text: noteText.trim(),
    created_at: nowIso,
    author: 'ChatGPT AI'
  };

  const updatedNotes = [newNoteEntry, ...existingNotes];

  const updatePayload = {
    notes: updatedNotes,
    reaction: noteText.trim(),
    updated_at: nowIso
  };

  if (newStage) updatePayload.stage = newStage;
  if (newStatus) updatePayload.status = newStatus;

  // Try updating with updated_at, fallback without updated_at if column missing
  let { data: updatedData, error: updateErr } = await supabaseLeads
    .from('leads')
    .update(updatePayload)
    .eq('id', targetLead.id)
    .select()
    .single();

  if (updateErr && updateErr.message?.includes('updated_at')) {
    delete updatePayload.updated_at;
    const retry = await supabaseLeads
      .from('leads')
      .update(updatePayload)
      .eq('id', targetLead.id)
      .select()
      .single();
    updatedData = retry.data;
    updateErr = retry.error;
  }

  if (updateErr) {
    return res.status(500).json({ error: 'Müşteri notu güncellenirken hata oluştu', details: updateErr.message });
  }

  return res.status(200).json({
    success: true,
    message: `✅ "${targetLead.name}" müşterisine not başarıyla eklendi!`,
    lead: {
      id: targetLead.id,
      name: targetLead.name,
      company: targetLead.company || targetLead.name,
      added_note: noteText.trim(),
      updated_stage: updatePayload.stage || targetLead.stage,
      updated_status: updatePayload.status || targetLead.status
    }
  });
}
