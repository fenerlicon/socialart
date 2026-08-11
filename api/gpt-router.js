import { createClient } from '@supabase/supabase-js';

// Databases
const LEADS_SUPABASE_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const LEADS_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2OTMzMSwiZXhwIjoyMDk0MzQ1MzMxfQ.DT3n6RNiwA_Tr_xt9iHRqWpDH718lFamct9tAXG8E2w';

const PRIMARY_SUPABASE_URL = 'https://osuwytugjscwhcxxkhfa.supabase.co';
const PRIMARY_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const supabaseLeads = createClient(LEADS_SUPABASE_URL, LEADS_SUPABASE_KEY);
const supabasePrimary = createClient(PRIMARY_SUPABASE_URL, PRIMARY_SUPABASE_KEY);

const EMPLOYEE_MAP = {
  furkan: { id: '406a078d-0aea-45e0-87e1-d4d0b5f20415', name: 'Furkan' },
  celal: { id: '26fff081-5502-4624-a71a-b6e4772467c3', name: 'Celal' },
  ercan: { id: '4721de06-0bd6-4681-a2c8-0c0d53da8eaf', name: 'Ercan' },
  simge: { id: '6f2efa88-0600-4d5f-8515-143937b6890f', name: 'Simge' },
  tugba: { id: 'b5e391db-dc21-45a8-baad-19f4073d3b14', name: 'Tuğba' },
  tuğba: { id: 'b5e391db-dc21-45a8-baad-19f4073d3b14', name: 'Tuğba' }
};

function parseCalendarDateTime(dateStr, timeStr) {
  try {
    let year = 2026, month = 8, day = 11;
    let hour = 21, minute = 0;

    if (timeStr && timeStr.includes(':')) {
      const parts = timeStr.split(':');
      hour = parseInt(parts[0], 10) || 21;
      minute = parseInt(parts[1], 10) || 0;
    }

    if (dateStr) {
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
        } else {
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          year = parseInt(parts[2], 10);
        }
      } else if (dateStr.includes('.')) {
        const parts = dateStr.split('.');
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
        if (year < 100) year += 2000;
      }
    }

    const d = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
    const startsAt = d.toISOString();
    const dEnd = new Date(d.getTime() + 3600000);
    const endsAt = dEnd.toISOString();

    return { startsAt, endsAt };
  } catch (e) {
    const now = new Date();
    return { startsAt: now.toISOString(), endsAt: new Date(now.getTime() + 3600000).toISOString() };
  }
}

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

  // Parse path action
  const urlPath = (req.url || '').split('?')[0];
  const actionMatch = urlPath.match(/\/api\/gpt\/([a-zA-Z0-9_-]+)/);
  const action = actionMatch ? actionMatch[1] : (req.query.action || '');

  try {
    switch (action) {
      case 'leads':
        return await handleGetLeads(req, res);
      case 'create-lead':
        return await handleCreateLead(req, res);
      case 'lead-history':
        return await handleLeadHistory(req, res);
      case 'lead-note':
        return await handleLeadNote(req, res);
      case 'payment-request':
        return await handlePaymentRequest(req, res);
      case 'whatsapp-link':
        return await handleWhatsAppLink(req, res);
      case 'reports':
        return await handleReports(req, res);
      case 'calendar':
        return await handleCalendar(req, res);
      case 'tasks':
        return await handleTasks(req, res);
      default:
        return res.status(404).json({ error: 'UNKNOWN_ACTION', message: `Eylem '${action}' tanımlı değil.` });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Sunucu hatası', details: String(err) });
  }
}

// --- HANDLERS ---

async function handleGetLeads(req, res) {
  const { data: leads, error } = await supabaseLeads
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Supabase leads sorgulama hatası', details: error.message });
  }

  const activeLeads = (leads || []).filter(l => l.status !== 'ARŞİV');

  const totalLeads = activeLeads.length;
  const hotLeads = activeLeads.filter(l => {
    const st = (l.status || '').toLocaleLowerCase('tr-TR');
    const sg = (l.stage || '').toUpperCase();
    return st.includes('sıcak') || st.includes('yeni') || st.includes('görüş') || sg === 'NEW' || sg === 'CONTACTED';
  }).length;

  const wonLeads = activeLeads.filter(l => l.stage === 'WON' || (l.status && l.status.includes('Anlaş'))).length;
  const lostLeads = activeLeads.filter(l => l.stage === 'LOST' || (l.status && l.status.includes('Red'))).length;
  const contactedLeads = activeLeads.filter(l => l.stage === 'CONTACTED' || (l.status && l.status.includes('Görüş'))).length;
  const proposalLeads = activeLeads.filter(l => l.stage === 'PROPOSAL_SENT' || (l.status && l.status.includes('Teklif'))).length;

  const stageCounts = {};
  activeLeads.forEach(l => {
    const stage = l.stage || l.status || 'Bilinmiyor';
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  });

  const repCounts = {};
  activeLeads.forEach(l => {
    const repRaw = (l.rep || '').trim();
    let repNormalized = 'Atanmamış (Boşta)';
    if (!repRaw || repRaw === '-' || repRaw === 'null') {
      repNormalized = 'Atanmamış (Boşta)';
    } else {
      const lower = repRaw.toLocaleLowerCase('tr-TR');
      if (lower.includes('simge')) repNormalized = 'Simge';
      else if (lower.includes('celal')) repNormalized = 'Celal';
      else if (lower.includes('furkan')) repNormalized = 'Furkan';
      else if (lower.includes('ercan')) repNormalized = 'Ercan';
      else if (lower.includes('tuğba') || lower.includes('tugba')) repNormalized = 'Tuğba';
      else if (lower.includes('meta')) repNormalized = 'Meta Ads Formu';
      else if (lower.includes('hizmet') || lower.includes('sistem')) repNormalized = 'Web Sitesi Formu';
      else repNormalized = repRaw;
    }
    repCounts[repNormalized] = (repCounts[repNormalized] || 0) + 1;
  });

  const recentLeadsSummary = activeLeads.slice(0, 30).map(l => ({
    id: l.id,
    name: l.name,
    company: l.company || l.name,
    service: l.service || 'Belirtilmedi',
    rep: l.rep || 'Atanmamış',
    stage: l.stage || 'NEW',
    status: l.status || 'Sıcak',
    phone: l.phone || '',
    email: l.email || '',
    city: l.city || '',
    budget: l.budget || 0,
    reaction: l.reaction || '',
    notes_count: Array.isArray(l.notes) ? l.notes.length : 0,
    latest_note: Array.isArray(l.notes) && l.notes.length > 0 ? l.notes[0].text : (l.reaction || ''),
    created_at: l.created_at
  }));

  return res.status(200).json({
    summary: {
      total_active_leads: totalLeads,
      new_hot_leads: hotLeads,
      won_deals: wonLeads,
      lost_deals: lostLeads,
      contacted: contactedLeads,
      proposal_sent: proposalLeads,
      stage_breakdown: stageCounts,
      sales_rep_breakdown: repCounts
    },
    recent_leads: recentLeadsSummary
  });
}

async function handleCreateLead(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST desteklenir.' });
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

  const { data, error } = await supabaseLeads.from('leads').insert([newLeadRecord]).select().single();
  if (error) return res.status(500).json({ error: 'Yeni lead veritabanına eklenirken hata oluştu', details: error.message });

  return res.status(200).json({
    success: true,
    message: `✅ "${name}" adında yeni müşteri başarıyla CRM'e eklendi!`,
    lead: data
  });
}

async function handleLeadHistory(req, res) {
  const { name, id } = req.query || {};
  if (id) {
    const { data: lead, error } = await supabaseLeads.from('leads').select('*').eq('id', id).maybeSingle();
    if (error || !lead) return res.status(404).json({ error: 'LEAD_NOT_FOUND', message: `ID: ${id} olan müşteri bulunamadı.` });
    return res.status(200).json({ lead_history: lead });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'MISSING_NAME', message: 'Müşteri adı (name) veya ID (id) zorunludur.' });
  }

  const searchStr = name.trim().toLocaleLowerCase('tr-TR');
  const { data: allLeads, error: searchErr } = await supabaseLeads.from('leads').select('*').order('created_at', { ascending: false });
  if (searchErr) return res.status(500).json({ error: 'Sorgu hatası', details: searchErr.message });

  const matches = (allLeads || []).filter(l => {
    const n = (l.name || '').toLocaleLowerCase('tr-TR');
    const c = (l.company || '').toLocaleLowerCase('tr-TR');
    return n.includes(searchStr) || c.includes(searchStr);
  });

  if (matches.length === 0) return res.status(404).json({ error: 'LEAD_NOT_FOUND', message: `System'de "${name}" ismiyle eşleşen müşteri bulunamadı.` });

  if (matches.length > 1) {
    const formattedMatches = matches.slice(0, 5).map(m => ({
      id: m.id,
      name: m.name,
      company: m.company || m.name,
      phone: m.phone || 'Telefon yok'
    }));
    return res.status(200).json({
      ambiguous: true,
      message: `Sistemde "${name}" ismiyle eşleşen ${matches.length} müşteri bulundu. Lütfen kullanıcının hangisini istediğini sorun.`,
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
}

async function handleLeadNote(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST desteklenir.' });
  const { lead_id, lead_name, note, stage, status } = req.body || {};

  if (!note || !note.trim()) {
    return res.status(400).json({ error: 'MISSING_NOTE', message: 'Eklenecek not/güncelleme metni (note) zorunludur.' });
  }

  if (lead_id) {
    const { data: existingLead } = await supabaseLeads.from('leads').select('*').eq('id', lead_id).maybeSingle();
    if (!existingLead) return res.status(404).json({ error: 'LEAD_NOT_FOUND', message: `ID: ${lead_id} olan müşteri bulunamadı.` });
    return await applyLeadUpdate(res, existingLead, note, stage, status);
  }

  if (!lead_name || !lead_name.trim()) {
    return res.status(400).json({ error: 'MISSING_LEAD_NAME', message: 'Müşteri adı veya ID belirtilmedi.' });
  }

  const searchStr = lead_name.trim().toLocaleLowerCase('tr-TR');
  const { data: allLeads } = await supabaseLeads.from('leads').select('*').order('created_at', { ascending: false });

  const matches = (allLeads || []).filter(l => {
    const name = (l.name || '').toLocaleLowerCase('tr-TR');
    const company = (l.company || '').toLocaleLowerCase('tr-TR');
    return name.includes(searchStr) || company.includes(searchStr);
  });

  if (matches.length === 0) {
    return res.status(404).json({ error: 'LEAD_NOT_FOUND', message: `Sistemde "${lead_name}" ismiyle eşleşen müşteri bulunamadı.` });
  }

  if (matches.length > 1) {
    const formattedMatches = matches.slice(0, 5).map(m => ({
      id: m.id,
      name: m.name,
      company: m.company || m.name,
      phone: m.phone || 'Telefon yok'
    }));
    return res.status(200).json({
      ambiguous: true,
      message: `Sistemde "${lead_name}" aramasıyla eşleşen ${matches.length} müşteri bulundu. Lütfen hangisi olduğunu sorun.`,
      matching_leads: formattedMatches
    });
  }

  return await applyLeadUpdate(res, matches[0], note, stage, status);
}

async function applyLeadUpdate(res, targetLead, noteText, newStage, newStatus) {
  const nowIso = new Date().toISOString();
  const existingNotes = Array.isArray(targetLead.notes) ? targetLead.notes : [];
  const newNoteEntry = { id: `GPT-NOTE-${Date.now()}`, text: noteText.trim(), created_at: nowIso, author: 'ChatGPT AI' };

  const updatePayload = {
    notes: [newNoteEntry, ...existingNotes],
    reaction: noteText.trim(),
    updated_at: nowIso
  };

  if (newStage) updatePayload.stage = newStage;
  if (newStatus) updatePayload.status = newStatus;

  let { data: updatedData, error: updateErr } = await supabaseLeads.from('leads').update(updatePayload).eq('id', targetLead.id).select().single();

  if (updateErr && updateErr.message?.includes('updated_at')) {
    delete updatePayload.updated_at;
    const retry = await supabaseLeads.from('leads').update(updatePayload).eq('id', targetLead.id).select().single();
    updatedData = retry.data;
    updateErr = retry.error;
  }

  if (updateErr) return res.status(500).json({ error: 'Müşteri notu güncellenirken hata oluştu', details: updateErr.message });

  return res.status(200).json({
    success: true,
    message: `✅ "${targetLead.name}" müşterisine not başarıyla eklendi!`,
    lead: { id: targetLead.id, name: targetLead.name, added_note: noteText.trim() }
  });
}

async function handlePaymentRequest(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST desteklenir.' });
  const { client_name, company_code, title, amount, description } = req.body || {};

  if (!client_name || !title || !amount) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Müşteri adı, Ödeme başlığı ve Tutar zorunludur.' });
  }

  const numAmount = parseFloat(amount);
  const code = (company_code || client_name).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const nowIso = new Date().toISOString();
  const requestId = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const totalWithKdv = numAmount * 1.20;
  const requestPayload = {
    id: requestId,
    client_name: client_name.trim(),
    company_code: code,
    title: title.trim(),
    description: description || '',
    amount: numAmount,
    kdv_amount: numAmount * 0.20,
    total_amount: totalWithKdv,
    status: 'pending',
    created_at: nowIso
  };

  const notifRecord = {
    id: requestId,
    recipient_employee_id: '26fff081-5502-4624-a71a-b6e4772467c3',
    type: 'payment_request',
    title: `💳 Ödeme Talebi: ${client_name} - ₺${numAmount.toLocaleString('tr-TR')}`,
    message: JSON.stringify(requestPayload),
    related_entity_type: 'payment',
    related_entity_id: code,
    is_read: false,
    created_at: nowIso
  };

  const { error: insertErr } = await supabasePrimary.from('notifications').insert([notifRecord]);
  if (insertErr) return res.status(500).json({ error: 'Ödeme talebi kaydedilemedi', details: insertErr.message });

  return res.status(200).json({
    success: true,
    message: `✅ "${client_name}" firması için ₺${numAmount.toLocaleString('tr-TR')} (+%20 KDV dahil ₺${totalWithKdv.toLocaleString('tr-TR')}) tutarında ödeme talebi oluşturuldu!`,
    payment_request: {
      id: requestId,
      client: client_name,
      total_with_kdv_tl: totalWithKdv,
      client_checkout_url: `https://socialartmedya.com/musteri-portali`
    }
  });
}

async function handleWhatsAppLink(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST desteklenir.' });
  const { lead_name, phone, message_text } = req.body || {};
  if (!message_text || !message_text.trim()) return res.status(400).json({ error: 'MISSING_MESSAGE', message: 'Mesaj metni zorunludur.' });

  let targetPhone = phone ? phone.trim() : '';
  let targetName = lead_name ? lead_name.trim() : 'Müşteri';

  if (!targetPhone && lead_name) {
    const searchStr = lead_name.trim().toLocaleLowerCase('tr-TR');
    const { data: leads } = await supabaseLeads.from('leads').select('*');
    const matches = (leads || []).filter(l => (l.name || '').toLocaleLowerCase('tr-TR').includes(searchStr));

    if (matches.length === 1 && matches[0].phone) {
      targetPhone = matches[0].phone;
      targetName = matches[0].name;
    }
  }

  let cleanPhone = targetPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '90' + cleanPhone.substring(1);
  else if (cleanPhone.length === 10) cleanPhone = '90' + cleanPhone;

  if (!cleanPhone || cleanPhone.length < 10) {
    return res.status(400).json({ error: 'MISSING_PHONE', message: `Müşterinin (${targetName}) kayıtlı geçerli telefonu bulunamadı.` });
  }

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message_text.trim())}`;
  return res.status(200).json({
    success: true,
    message: `✅ ${targetName} için WhatsApp linki hazırlandı!`,
    whatsapp_link: whatsappUrl,
    phone: cleanPhone
  });
}

async function handleReports(req, res) {
  const { data: leads } = await supabaseLeads.from('leads').select('*');
  const activeLeads = (leads || []).filter(l => l.status !== 'ARŞİV');

  const { data: brands } = await supabasePrimary.from('brands').select('id, name, status');
  const { data: notifs } = await supabasePrimary.from('notifications').select('*');

  const totalLeads = activeLeads.length;
  const wonLeads = activeLeads.filter(l => l.stage === 'WON' || l.status === 'Anlaşıldı' || (l.status && l.status.includes('Anlaş'))).length;
  const proposalLeads = activeLeads.filter(l => l.stage === 'PROPOSAL_SENT' || (l.status && l.status.includes('Teklif'))).length;

  const hotLeads = activeLeads.filter(l => {
    const st = (l.status || '').toLocaleLowerCase('tr-TR');
    const sg = (l.stage || '').toUpperCase();
    return st.includes('sıcak') || st.includes('yeni') || st.includes('görüş') || sg === 'NEW' || sg === 'CONTACTED';
  }).length;

  let totalPipelineVolume = 0;
  activeLeads.forEach(l => {
    let b = parseFloat(l.budget) || 0;
    if (b === 0 && l.reaction) {
      const match = l.reaction.match(/bütçe[:\s]*([0-9.,]+)/i);
      if (match && match[1]) b = parseFloat(match[1].replace(/[^0-9.]/g, '')) || 0;
    }
    totalPipelineVolume += b;
  });

  let totalPendingPayments = 0;
  let totalPendingVolumeTL = 0;
  (notifs || []).filter(n => n.type === 'payment_request').forEach(n => {
    try {
      const parsed = typeof n.message === 'string' ? JSON.parse(n.message) : n.message;
      if (parsed && parsed.status === 'pending') {
        totalPendingPayments++;
        totalPendingVolumeTL += parseFloat(parsed.amount) || 0;
      }
    } catch (e) {}
  });

  const repDistribution = {};
  activeLeads.forEach(l => {
    const repRaw = (l.rep || '').trim();
    let repNormalized = 'Atanmamış (Boşta)';
    if (!repRaw || repRaw === '-' || repRaw === 'null') {
      repNormalized = 'Atanmamış (Boşta)';
    } else {
      const lower = repRaw.toLocaleLowerCase('tr-TR');
      if (lower.includes('simge')) repNormalized = 'Simge';
      else if (lower.includes('celal')) repNormalized = 'Celal';
      else if (lower.includes('furkan')) repNormalized = 'Furkan';
      else if (lower.includes('ercan')) repNormalized = 'Ercan';
      else if (lower.includes('tuğba') || lower.includes('tugba')) repNormalized = 'Tuğba';
      else if (lower.includes('meta')) repNormalized = 'Meta Ads Formu';
      else if (lower.includes('hizmet') || lower.includes('sistem')) repNormalized = 'Web Sitesi Formu';
      else repNormalized = repRaw;
    }
    repDistribution[repNormalized] = (repDistribution[repNormalized] || 0) + 1;
  });

  return res.status(200).json({
    report_date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
    executive_summary: {
      total_active_brands: (brands || []).length,
      crm_total_active_leads: totalLeads,
      crm_hot_leads: hotLeads,
      crm_proposal_sent: proposalLeads,
      crm_won_deals: wonLeads,
      crm_total_pipeline_budget_tl: totalPipelineVolume,
      pending_payment_requests_count: totalPendingPayments,
      pending_payment_requests_volume_tl: totalPendingVolumeTL
    },
    sales_team_workload: repDistribution
  });
}

async function handleCalendar(req, res) {
  if (req.method === 'GET') {
    const { data: events } = await supabasePrimary.from('calendar_events').select('*').order('starts_at', { ascending: true }).limit(50);
    return res.status(200).json({ events: events || [] });
  }

  if (req.method === 'POST') {
    const { title, brand_name, date, time, location, event_type, notes } = req.body || {};
    const missingFields = [];
    if (!title || !title.trim()) missingFields.push('Başlık (title)');
    if (!brand_name || !brand_name.trim()) missingFields.push('Marka Adı (brand_name)');
    if (!date || !date.trim()) missingFields.push('Tarih (date)');
    if (!time || !time.trim()) missingFields.push('Saat (time)');

    if (missingFields.length > 0) {
      return res.status(400).json({ error: 'MISSING_REQUIRED_FIELDS', message: `Eksik zorunlu alanlar var: ${missingFields.join(', ')}.` });
    }

    const nowIso = new Date().toISOString();
    const eventId = `CAL-${Date.now()}`;
    const { startsAt, endsAt } = parseCalendarDateTime(date.trim(), time.trim());

    // 1. Insert into REAL calendar_events table
    const calEventRecord = {
      id: eventId,
      title: `${brand_name.trim()} - ${title.trim()}`,
      type: (event_type && event_type.toLowerCase().includes('toplantı')) || title.toLowerCase().includes('toplantı') ? 'meeting' : 'shoot',
      employee_id: '406a078d-0aea-45e0-87e1-d4d0b5f20415', // Furkan
      starts_at: startsAt,
      ends_at: endsAt,
      location: location || 'Ajans Stüdyosu',
      status: 'pending'
    };

    const { error: calErr } = await supabasePrimary.from('calendar_events').insert([calEventRecord]);

    // 2. Also Insert into notifications for employee popups
    const notifRecord = {
      id: eventId,
      recipient_employee_id: '406a078d-0aea-45e0-87e1-d4d0b5f20415',
      type: 'calendar_event',
      title: `📅 Takvim Etkinliği: ${calEventRecord.title}`,
      message: JSON.stringify({ ...calEventRecord, brand_name: brand_name.trim(), date: date.trim(), time: time.trim(), notes: notes || '' }),
      related_entity_type: 'calendar',
      related_entity_id: eventId,
      is_read: false,
      created_at: nowIso
    };

    try {
      await supabasePrimary.from('notifications').insert([notifRecord]);
    } catch (e) {}

    if (calErr) {
      return res.status(500).json({ error: 'Takvime kayıt atılamadı', details: calErr.message });
    }

    return res.status(200).json({
      success: true,
      message: `✅ Takvime etkinlik eklendi: "${calEventRecord.title}" (${date} - Saat: ${time})`,
      event: calEventRecord
    });
  }
}

async function handleTasks(req, res) {
  if (req.method === 'GET') {
    const { data: steps } = await supabasePrimary.from('workflow_step_instances').select('*').order('assigned_at', { ascending: false }).limit(30);
    return res.status(200).json({ tasks: steps || [] });
  }

  if (req.method === 'POST') {
    const { assignee, title, description, due_date, priority } = req.body || {};
    if (!title) return res.status(400).json({ error: 'Görev başlığı zorunludur.' });

    const assigneeKey = (assignee || 'furkan').toLowerCase().trim();
    const matchedEmployee = EMPLOYEE_MAP[assigneeKey] || EMPLOYEE_MAP.furkan;

    const nowIso = new Date().toISOString();
    const taskId = `GPT-TASK-${Date.now()}`;

    // 1. Insert into REAL workflow_step_instances table (Admin Panel Tasks view)
    const taskStepRecord = {
      id: taskId,
      workflow_instance_id: null,
      workflow_step_template_id: 'gpt-assigned-task',
      title: title.trim(),
      description: description ? description.trim() : 'ChatGPT AI üzerinden atanan görev.',
      order: 1,
      status: 'active',
      requires_approval: false,
      is_final_step: false,
      assignee_employee_id: matchedEmployee.id,
      assigned_employee_id: matchedEmployee.id,
      assigned_at: nowIso,
      due_date: due_date || null
    };

    const { error: taskErr } = await supabasePrimary.from('workflow_step_instances').insert([taskStepRecord]);

    // 2. Also Insert into notifications for employee popups
    const notifRecord = {
      id: taskId,
      recipient_employee_id: matchedEmployee.id,
      type: 'gpt_assigned_task',
      title: `🤖 ChatGPT Görevi: ${title}`,
      message: JSON.stringify({ id: taskId, assignee_name: matchedEmployee.name, title: title, description: description || '', due_date: due_date || 'Belirtilmedi', priority: priority || 'Normal', created_at: nowIso }),
      related_entity_type: 'task',
      related_entity_id: taskId,
      is_read: false,
      created_at: nowIso
    };

    try {
      await supabasePrimary.from('notifications').insert([notifRecord]);
    } catch (e) {}

    if (taskErr) {
      return res.status(500).json({ error: 'Görev eklenirken veritabanı hatası oluştu', details: taskErr.message });
    }

    return res.status(200).json({
      success: true,
      message: `✅ Görev başarıyla ${matchedEmployee.name} kişisine atandı!`,
      task: { id: taskId, assigned_to: matchedEmployee.name, title: title, due_date: due_date || 'Belirtilmedi' }
    });
  }
}
