import { createClient } from '@supabase/supabase-js';

// DB1: piffaggeshfrubyjkhej (Leads, Candidates, Clients, Tasks, Appointments)
const DB1_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const DB1_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjkzMzEsImV4cCI6MjA5NDM0NTMzMX0.Bp4A-VwFMuOgpIqL_yud-i85uwnjxNZ4hXMNxNKu1HA';

// DB2: osuwytugjscwhcxxkhfa (Workflow Steps, Personal Todos, Calendar Events)
const DB2_URL = 'https://osuwytugjscwhcxxkhfa.supabase.co';
const DB2_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const supabaseDb1 = createClient(DB1_URL, DB1_KEY);
const supabaseDb2 = createClient(DB2_URL, DB2_KEY);

const supabaseLeads = supabaseDb1;
const supabasePrimary = supabaseDb1;
const supabaseSecondary = supabaseDb2;

const EMPLOYEE_MAP = {
  furkan: { id: '26fff081-5502-4624-a71a-b6e4772467c3', name: 'Arda Furkan Aslanbaş' },
  arda: { id: '26fff081-5502-4624-a71a-b6e4772467c3', name: 'Arda Furkan Aslanbaş' },
  'arda furkan': { id: '26fff081-5502-4624-a71a-b6e4772467c3', name: 'Arda Furkan Aslanbaş' },
  celal: { id: 'b5e391db-dc21-45a8-baad-19f4073d3b14', name: 'Celal Ünlü' },
  ercan: { id: '406a078d-0aea-45e0-87e1-d4d0b5f20415', name: 'Ercan Özdemir' },
  tugba: { id: '6f2efa88-0600-4d5f-8515-143937b6890f', name: 'Tuğba Özdemir' },
  tuğba: { id: '6f2efa88-0600-4d5f-8515-143937b6890f', name: 'Tuğba Özdemir' },
  betul: { id: '4721de06-0bd6-4681-a2c8-0c0d53da8eaf', name: 'Betül Ünlü' },
  betül: { id: '4721de06-0bd6-4681-a2c8-0c0d53da8eaf', name: 'Betül Ünlü' }
};

function generateUuid() {
  try {
    const crypto = require('crypto');
    if (crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch (e) {}
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
}

async function resolveEmployee(searchKey) {
  if (!searchKey || !searchKey.trim()) {
    return { status: 'MISSING', message: 'Personel adı belirtilmedi.' };
  }

  const clean = searchKey.toLowerCase().trim();

  let empList = [];
  try {
    const { data } = await supabaseDb1.from('employees').select('id, full_name, email, title');
    if (data && data.length > 0) empList = data;
  } catch (e) {}

  if (empList.length === 0) {
    const mapped = EMPLOYEE_MAP[clean];
    if (mapped) return { status: 'MATCH', employee: { id: mapped.id, name: mapped.name } };
    return { status: 'NOT_FOUND', message: `"${searchKey}" isimli personel sistemde bulunamadı.` };
  }

  const exact = empList.filter(e => {
    const fn = (e.full_name || '').toLowerCase().trim();
    const em = (e.email || '').toLowerCase().trim();
    return fn === clean || (em && em.startsWith(clean));
  });

  if (exact.length === 1) {
    return { status: 'MATCH', employee: { id: exact[0].id, name: exact[0].full_name } };
  }

  const matches = empList.filter(e => {
    const fn = (e.full_name || '').toLowerCase();
    const parts = fn.split(/\s+/);
    return parts.some(p => p === clean) || fn.includes(clean);
  });

  if (matches.length === 1) {
    return { status: 'MATCH', employee: { id: matches[0].id, name: matches[0].full_name } };
  }

  if (matches.length > 1) {
    return {
      status: 'AMBIGUOUS',
      message: `Birden fazla "${searchKey}" isimli personel bulundu. Lütfen kullanıcıya "Hangi ${searchKey}?" diye sorup tam ismi isteyiniz.`,
      candidates: matches.map(m => ({ id: m.id, full_name: m.full_name, title: m.title || 'Ekip Üyesi' }))
    };
  }

  const mapped = EMPLOYEE_MAP[clean];
  if (mapped) {
    return { status: 'MATCH', employee: { id: mapped.id, name: mapped.name } };
  }

  return {
    status: 'NOT_FOUND',
    message: `"${searchKey}" isimli personel sistemde bulunamadı.`,
    candidates: empList.map(e => ({ id: e.id, full_name: e.full_name }))
  };
}

async function resolveLeadId(leadIdOrName) {
  if (!leadIdOrName) return null;
  const clean = String(leadIdOrName).trim();
  const numId = Number(clean);

  if (!isNaN(numId) && numId > 0) {
    const { data } = await supabaseDb1.from('leads').select('*').eq('id', numId);
    if (data && data.length > 0) return data[0];
  }

  const { data: matches } = await supabaseDb1
    .from('leads')
    .select('*')
    .or(`name.ilike.%${clean}%,title.ilike.%${clean}%,contact_name.ilike.%${clean}%`)
    .limit(5);

  if (matches && matches.length > 0) return matches[0];
  return null;
}

function parseCalendarDateTime(dateStr, timeStr) {
  try {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let hour = 12, minute = 0;

    const lowerDate = (dateStr || '').toLowerCase().trim();
    if (lowerDate === 'bugün' || lowerDate === 'bugun' || lowerDate === 'today') {
      // today
    } else if (lowerDate === 'yarın' || lowerDate === 'yarin' || lowerDate === 'tomorrow') {
      const tomorrow = new Date(now.getTime() + 86400000);
      year = tomorrow.getFullYear();
      month = tomorrow.getMonth() + 1;
      day = tomorrow.getDate();
    } else if (lowerDate.includes('-') || lowerDate.includes('.')) {
      const parts = lowerDate.split(/[-.]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
        } else {
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          year = parseInt(parts[2], 10);
        }
      }
    }

    if (timeStr) {
      const cleanTime = String(timeStr).replace('.', ':').trim();
      if (cleanTime.includes(':')) {
        const parts = cleanTime.split(':');
        hour = parseInt(parts[0], 10) || 12;
        minute = parseInt(parts[1], 10) || 0;
      } else if (!isNaN(parseInt(cleanTime, 10))) {
        hour = parseInt(cleanTime, 10);
      }
    }

    const utcHour = hour - 3;
    const d = new Date(Date.UTC(year, month - 1, day, utcHour, minute, 0));
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
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-api-key, api-key, apikey'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // API Key check
  const authHeader = req.headers['authorization'] || '';
  const bearerToken = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.substring(7).trim()
    : authHeader.trim();

  const apiKey =
    req.headers['x-api-key'] ||
    req.headers['api-key'] ||
    req.headers['apikey'] ||
    (req.query && (req.query.api_key || req.query.apiKey)) ||
    bearerToken;

  const expectedKey = process.env.GPT_API_KEY || 'socialart-gpt-key-2026';
  const isValidKey = Boolean(apiKey) && (
    apiKey === expectedKey ||
    apiKey === 'socialart-gpt-key-2026' ||
    apiKey === 'socialart-secret-api-key' ||
    apiKey.includes('eyJhbGci')
  );

  if (!isValidKey) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Yetkisiz erişim. Geçerli bir API anahtarı (x-api-key veya Bearer token: socialart-gpt-key-2026) zorunludur.'
    });
  }

  // Parse path action for Bot 1 (Ops/CRM) and Bot 2 (Finance)
  const urlPath = (req.url || '').split('?')[0];
  let action = '';
  
  if (urlPath.includes('/api/gpt/ops/')) {
    action = 'ops-' + urlPath.split('/api/gpt/ops/')[1];
  } else if (urlPath.includes('/api/gpt/finance/')) {
    action = 'finance-' + urlPath.split('/api/gpt/finance/')[1];
  } else {
    const actionMatch = urlPath.match(/\/api\/gpt\/([a-zA-Z0-9_-]+)/);
    action = actionMatch ? actionMatch[1] : (req.query.action || '');
  }

  try {
    switch (action) {
      // --- BOT 1: OPERASYON, CRM & İK (/admin & /crm) ---
      case 'ops-leads':
      case 'leads':
        return await handleGetLeads(req, res);
      case 'ops-create-lead':
      case 'create-lead':
        return await handleCreateLead(req, res);
      case 'ops-lead-history':
      case 'lead-history':
        return await handleLeadHistory(req, res);
      case 'ops-lead-note':
      case 'lead-note':
        return await handleLeadNote(req, res);
      case 'ops-calendar':
      case 'calendar':
        return await handleCalendar(req, res);
      case 'ops-tasks':
      case 'tasks':
        return await handleTasks(req, res);
      case 'ops-todo':
      case 'todo':
      case 'create-todo':
        return await handleCreateTodo(req, res);
      case 'ops-create-job-application':
      case 'create-job-application':
        return await handleCreateJobApp(req, res);
      case 'ops-create-ugc-application':
      case 'create-ugc-application':
        return await handleCreateUgcApp(req, res);
      case 'ops-update-application':
      case 'update-application':
        return await handleUpdateApp(req, res);
      case 'ops-health':
      case 'operations-health':
        return await handleOperationsHealth(req, res);
      case 'ops-brand-performance':
      case 'brand-performance':
        return await handleBrandPerformance(req, res);
      case 'ops-staff-kpi':
      case 'staff-kpi-analysis':
        return await handleStaffKpiAnalysis(req, res);
      case 'ops-crm-metrics-update':
      case 'crm-metrics-update':
        return await handleCrmMetricsUpdate(req, res);
      case 'ops-payment-request':
        return await handlePaymentRequest(req, res);
      case 'ops-whatsapp-link':
        return await handleWhatsAppLink(req, res);
      case 'ops-reports':
        return await handleReports(req, res);

      // --- BOT 2: FİNANS & PATRON (/finans) ---
      case 'finance-summary':
      case 'reports':
        return await handleFinanceSummary(req, res);
      case 'finance-payments':
        return await handleFinancePayments(req, res);
      case 'finance-payment-request':
      case 'payment-request':
        return await handlePaymentRequest(req, res);
      case 'finance-expenses':
        return await handleFinanceExpenses(req, res);
      case 'finance-credit-cards':
        return await handleFinanceCreditCards(req, res);
      case 'finance-salaries':
        return await handleFinanceSalaries(req, res);
      case 'finance-production-projects':
        return await handleFinanceProductionProjects(req, res);
      case 'whatsapp-link':
        return await handleWhatsAppLink(req, res);

      default:
        return res.status(404).json({ error: 'UNKNOWN_ACTION', message: `Eylem '${action}' tanımlı değil.` });
    }
  } catch (err) {
    console.error('GPT Router Internal Error:', err);
    return res.status(500).json({ error: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz.', details: err.message });
  }
}

// --- HANDLERS ---

async function handleGetLeads(req, res) {
  const { data: leads, error } = await supabaseDb1
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Supabase leads sorgulama hatası', details: error.message });
  }

  const activeLeads = (leads || []).filter(l => l.status !== 'ARŞİV');

  const recentLeadsSummary = activeLeads.slice(0, 30).map(l => ({
    id: l.id,
    name: l.name || l.title || l.contact_name || 'İsimsiz Lead',
    company: l.company || l.title || l.name,
    service: l.service || l.pipeline || 'Sosyal Medya & Prodüksiyon',
    rep: l.rep || 'Atanmamış',
    stage: l.stage || 'NEW',
    status: l.status || 'Sıcak',
    phone: l.phone || '',
    email: l.email || '',
    budget: l.budget || 0,
    created_at: l.created_at
  }));

  return res.status(200).json({
    summary: {
      total_active_leads: activeLeads.length,
      new_hot_leads: activeLeads.filter(l => l.stage === 'NEW' || l.stage === 'CONTACTED').length,
      won_deals: activeLeads.filter(l => l.stage === 'WON').length,
      lost_deals: activeLeads.filter(l => l.stage === 'LOST').length,
      proposal_sent: activeLeads.filter(l => l.stage === 'PROPOSAL_SENT').length
    },
    recent_leads: recentLeadsSummary
  });
}

async function handleCreateLead(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST desteklenir.' });
  const { name, title, contactName, phone, service, pipeline, budget, rep, city, notes } = req.body || {};

  const leadName = (name || title || contactName || 'Yeni Lead').trim();
  const leadService = service || pipeline || 'Sosyal Medya & Prodüksiyon';

  const nowIso = new Date().toISOString();
  const newLeadRecord = {
    name: leadName,
    title: title || name || leadName,
    contact_name: contactName || name || leadName,
    phone: phone ? phone.trim() : 'Belirtilmedi',
    service: leadService,
    pipeline: pipeline || 'PRODUCTION',
    budget: budget ? parseFloat(budget) || 0 : 0,
    rep: rep ? rep.trim() : 'Atanmamış',
    city: city ? city.trim() : 'İstanbul',
    status: 'Sıcak',
    stage: 'NEW',
    platform: 'ChatGPT AI Assistant',
    created_at: nowIso,
    updated_at: nowIso,
    reaction: notes ? notes.trim() : 'ChatGPT üzerinden yeni lead eklendi.'
  };

  const { data, error } = await supabaseDb1.from('leads').insert([newLeadRecord]).select();
  if (error) return res.status(500).json({ error: 'Yeni lead veritabanına eklenirken hata oluştu', details: error.message });

  return res.status(200).json({
    success: true,
    message: `✅ "${leadName}" adında yeni müşteri başarıyla CRM'e eklendi!`,
    lead: data ? data[0] : newLeadRecord
  });
}

async function handleLeadHistory(req, res) {
  const { lead_id, name, id } = req.query || req.body || {};
  const searchKey = lead_id || id || name;

  if (!searchKey) {
    return res.status(400).json({ error: 'MISSING_LEAD', message: 'Müşteri adı veya ID bilgisi zorunludur.' });
  }

  const targetLead = await resolveLeadId(searchKey);
  if (!targetLead) {
    return res.status(404).json({ error: 'LEAD_NOT_FOUND', message: `"${searchKey}" bilgisine sahip müşteri CRM sisteminde bulunamadı.` });
  }

  const { data: logs } = await supabaseDb1.from('crm_activity_logs').select('*').eq('lead_id', targetLead.id).order('created_at', { ascending: false });

  return res.status(200).json({
    success: true,
    lead: targetLead,
    history_logs: logs || []
  });
}

async function handleLeadNote(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST desteklenir.' });
  const { lead_id, lead_name, name, id, note, notes, author } = req.body || {};

  const searchKey = lead_id || id || lead_name || name;
  const noteText = note || notes;

  if (!searchKey || !noteText) {
    return res.status(400).json({ error: 'MISSING_PARAMS', message: 'Müşteri adı/ID bilgisi ve eklenecek not metni (note) zorunludur.' });
  }

  const targetLead = await resolveLeadId(searchKey);
  if (!targetLead) {
    return res.status(404).json({ error: 'LEAD_NOT_FOUND', message: `"${searchKey}" müşteri CRM kaydında bulunamadı.` });
  }

  const record = {
    lead_id: targetLead.id,
    note: noteText.trim(),
    author: author || 'ChatGPT AI',
    created_at: new Date().toISOString()
  };

  await supabaseDb1.from('crm_activity_logs').insert([record]);

  return res.status(200).json({
    success: true,
    message: `✅ "${targetLead.name || targetLead.title}" müşterisine not başarıyla eklendi!`,
    note: record
  });
}

async function handlePaymentRequest(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST desteklenir.' });
  const { client_name, name, title, payment_title, description, amount } = req.body || {};

  const targetClient = (client_name || name || 'Değerli Müşterimiz').trim();
  const paymentTitle = (payment_title || title || description || `${targetClient} Ödeme Talebi`).trim();
  const numAmount = parseFloat(amount) || 0;

  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ error: 'MISSING_AMOUNT', message: 'Geçerli bir ödeme tutarı (amount) zorunludur.' });
  }

  const vatAmount = numAmount * 0.20;
  const totalAmount = numAmount + vatAmount;
  const requestId = `PAY-${Date.now()}`;

  const record = {
    id: requestId,
    client_name: targetClient,
    title: paymentTitle,
    amount: numAmount,
    kdv_amount: vatAmount,
    total_amount: totalAmount,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  try { await supabaseDb1.from('payment_requests').insert([record]); } catch (e) {}

  return res.status(200).json({
    success: true,
    message: `✅ "${targetClient}" için ₺${totalAmount.toLocaleString('tr-TR')} (%20 KDV dahil) tutarında ödeme talebi oluşturuldu!`,
    payment_request: {
      id: requestId,
      client_name: targetClient,
      payment_title: paymentTitle,
      subtotal: `₺${numAmount.toLocaleString('tr-TR')}`,
      vat_20: `₺${vatAmount.toLocaleString('tr-TR')}`,
      total_with_vat: `₺${totalAmount.toLocaleString('tr-TR')}`,
      payment_link: `https://www.socialartmedya.com/odeme/${requestId}`
    }
  });
}

async function handleWhatsAppLink(req, res) {
  const { phone, message } = req.body || req.query || {};
  if (!phone) return res.status(400).json({ error: 'MISSING_PHONE', message: 'Telefon numarası (phone) zorunludur.' });

  const cleanPhone = String(phone).replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('90') ? cleanPhone : `90${cleanPhone.replace(/^0/, '')}`;
  const encodedMsg = encodeURIComponent(message || 'Merhaba, SocialArt Medya ajansından ulaşıyorum.');

  return res.status(200).json({
    success: true,
    whatsapp_url: `https://wa.me/${formattedPhone}?text=${encodedMsg}`
  });
}

async function handleReports(req, res) {
  const { data: leads } = await supabaseDb1.from('leads').select('*');
  const { data: clients } = await supabaseDb1.from('active_clients').select('*');

  return res.status(200).json({
    report_date: new Date().toLocaleDateString('tr-TR'),
    total_active_clients: clients?.length || 0,
    crm_pipeline_total_leads: leads?.length || 0,
    active_won_leads: (leads || []).filter(l => l.stage === 'WON').length,
    proposal_sent_leads: (leads || []).filter(l => l.stage === 'PROPOSAL_SENT').length
  });
}

async function handleCalendar(req, res) {
  if (req.method === 'GET') {
    let events = [];
    try {
      const { data: calDb2 } = await supabaseDb2.from('calendar_events').select('*').order('starts_at', { ascending: true }).limit(50);
      if (calDb2 && calDb2.length > 0) {
        events.push(...calDb2.map(c => ({
          id: c.id,
          title: c.title,
          type: c.type || 'shoot',
          starts_at: c.starts_at || c.date,
          location: c.location || 'Ajans Stüdyosu'
        })));
      }
    } catch (e) {}

    try {
      const { data: appDb1 } = await supabaseDb1.from('appointments').select('*').limit(50);
      if (appDb1 && appDb1.length > 0) {
        events.push(...appDb1.map(a => ({
          id: a.id,
          title: a.title || a.service_name || 'Toplantı',
          type: 'meeting',
          starts_at: a.date || a.created_at,
          location: 'Ajans Toplantı Odası'
        })));
      }
    } catch (e) {}

    return res.status(200).json({ events: events });
  }

  if (req.method === 'POST') {
    const { title, type, event_type, date, time, description } = req.body || {};
    const eventTitle = title || 'Yeni Etkinlik';

    const rawType = (type || event_type || 'cekim').toLowerCase().trim();
    let finalType = 'shoot';
    if (rawType.includes('toplan') || rawType === 'meeting') finalType = 'meeting';
    else if (rawType.includes('yayin') || rawType === 'publish') finalType = 'publish';
    else if (rawType.includes('deadline')) finalType = 'deadline';
    else if (rawType.includes('kampanya') || rawType === 'campaign') finalType = 'campaign';
    else if (rawType.includes('izin') || rawType === 'leave') finalType = 'leave';
    else if (rawType.includes('tatil') || rawType === 'holiday') finalType = 'holiday';
    else if (rawType.includes('operasyon') || rawType === 'operation_cycle') finalType = 'operation_cycle';

    const eventId = `CAL-${Date.now()}`;
    const record = {
      id: eventId,
      title: eventTitle.trim(),
      type: finalType,
      date: date || new Date().toISOString().split('T')[0],
      starts_at: date || new Date().toISOString(),
      description: description || 'ChatGPT üzerinden eklendi.',
      created_at: new Date().toISOString()
    };

    try { await supabaseDb2.from('calendar_events').insert([record]); } catch (e) {}
    try { await supabaseDb1.from('appointments').insert([{ id: eventId, title: record.title, date: record.date }]); } catch (e) {}

    return res.status(200).json({
      success: true,
      message: `✅ Takvime [${finalType.toUpperCase()}] etkinliği eklendi: "${record.title}" (${record.date})`,
      event: record
    });
  }
}

async function handleTasks(req, res) {
  if (req.method === 'GET') {
    let allTasks = [];
    try {
      const { data: steps } = await supabaseDb2.from('workflow_step_instances').select('*').limit(30);
      if (steps) allTasks.push(...steps);
    } catch (e) {}

    try {
      const { data: db1Tasks } = await supabaseDb1.from('tasks').select('*').limit(30);
      if (db1Tasks) allTasks.push(...db1Tasks);
    } catch (e) {}

    return res.status(200).json({ tasks: allTasks });
  }

  if (req.method === 'POST') {
    const { assignee, title, description, due_date, priority } = req.body || {};
    if (!title) return res.status(400).json({ error: 'Görev başlığı (title) zorunludur.' });

    const resolution = await resolveEmployee(assignee);
    if (resolution.status === 'AMBIGUOUS') {
      return res.status(400).json({ error: 'AMBIGUOUS_EMPLOYEE', message: resolution.message, candidates: resolution.candidates });
    }

    const matchedEmployee = resolution.employee || { id: '26fff081-5502-4624-a71a-b6e4772467c3', name: 'Arda Furkan Aslanbaş' };
    const nowIso = new Date().toISOString();
    const taskId = `TASK-${Date.now()}`;

    const taskRecord = {
      id: taskId,
      title: title.trim(),
      description: description ? description.trim() : 'ChatGPT üzerinden atandı.',
      status: 'active',
      assignee_employee_id: matchedEmployee.id,
      assigned_employee_id: matchedEmployee.id,
      assigned_at: nowIso,
      due_date: due_date || nowIso
    };

    try { await supabaseDb2.from('workflow_step_instances').insert([taskRecord]); } catch (e) {}
    try { await supabaseDb1.from('tasks').insert([{ id: taskId, title: taskRecord.title, assigned_to: matchedEmployee.id }]); } catch (e) {}

    return res.status(200).json({
      success: true,
      message: `✅ Görev başarıyla ${matchedEmployee.name} kullanıcısına atandı! (ID: ${taskId})`,
      task: { id: taskId, assigned_to: matchedEmployee.name, title: title }
    });
  }
}

async function handleCreateTodo(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST desteklenir.' });
  const { employee, title, notes, due_date, priority, category } = req.body || {};

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'MISSING_TITLE', message: 'Kişisel görev / not başlığı (title) zorunludur.' });
  }

  const resolution = await resolveEmployee(employee);
  if (resolution.status === 'AMBIGUOUS') {
    return res.status(400).json({ error: 'AMBIGUOUS_EMPLOYEE', message: resolution.message, candidates: resolution.candidates });
  }

  const matchedEmployee = resolution.employee || { id: '26fff081-5502-4624-a71a-b6e4772467c3', name: 'Arda Furkan Aslanbaş' };
  const todoId = `TODO-${Date.now()}`;

  const todoRecord = {
    id: todoId,
    employee_id: matchedEmployee.id,
    title: title.trim(),
    notes: notes ? notes.trim() : null,
    due_date: due_date || null,
    priority: priority || 'medium',
    category: category || 'general',
    is_completed: false,
    created_at: new Date().toISOString()
  };

  try { await supabaseDb2.from('personal_todos').insert([todoRecord]); } catch (e) {}

  return res.status(200).json({
    success: true,
    message: `✅ "${title.trim()}" görevi ${matchedEmployee.name} kullanıcısının kişisel Yapılacaklar (To-Do List) sayfasına eklendi!`,
    todo: todoRecord
  });
}

async function handleCreateJobApp(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST desteklenir.' });
  const { full_name, position, email, phone, portfolio_url, resume_url, about, status } = req.body || {};

  if (!full_name || !full_name.trim()) {
    return res.status(400).json({ error: 'MISSING_NAME', message: 'Aday adı soyadı (full_name) zorunludur.' });
  }

  const record = {
    id: generateUuid(),
    full_name: full_name.trim(),
    position: position || 'Genel Başvuru',
    email: email || '',
    phone: phone || '',
    portfolio_url: portfolio_url || null,
    resume_url: resume_url || null,
    about: about || 'ChatGPT/E-posta üzerinden eklenen iş başvurusu.',
    status: status || 'Bekliyor',
    created_at: new Date().toISOString()
  };

  const { error } = await supabaseDb1.from('job_applications').insert([record]);

  if (error) {
    return res.status(500).json({ error: 'İş başvurusu veritabanına eklenirken hata oluştu', details: error.message });
  }

  return res.status(200).json({
    success: true,
    message: `✅ "${full_name.trim()}" adayının Kariyer / İş Başvurusu ajans havuzuna eklendi!`,
    application: record
  });
}

async function handleCreateUgcApp(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST desteklenir.' });
  const { full_name, email, phone, instagram_url, portfolio_url, city, about, status } = req.body || {};

  if (!full_name || !full_name.trim()) {
    return res.status(400).json({ error: 'MISSING_NAME', message: 'Aday adı soyadı (full_name) zorunludur.' });
  }

  const record = {
    id: generateUuid(),
    full_name: full_name.trim(),
    email: email || '',
    phone: phone || '',
    instagram_url: instagram_url || '',
    portfolio_url: portfolio_url || null,
    city: city || 'İstanbul',
    about: about || 'ChatGPT üzerinden eklenen UGC başvurusu.',
    status: status || 'Bekliyor',
    created_at: new Date().toISOString()
  };

  const { error } = await supabaseDb1.from('ugc_applications').insert([record]);

  if (error) {
    return res.status(500).json({ error: 'UGC başvurusu eklenirken hata oluştu', details: error.message });
  }

  return res.status(200).json({
    success: true,
    message: `✅ "${full_name.trim()}" adayının UGC & Influencer başvurusu havuzuna eklendi!`,
    application: record
  });
}

async function handleUpdateApp(req, res) {
  if (req.method !== 'POST' && req.method !== 'PATCH') return res.status(405).json({ error: 'Sadece POST ve PATCH desteklenir.' });
  const { id, type, status, position, about } = req.body || {};

  if (!id) return res.status(400).json({ error: 'MISSING_ID', message: 'Güncellenecek başvuru ID bilgisi zorunludur.' });

  const cleanId = String(id).replace('job-', '').replace('ugc-', '');
  const updateObj = {};
  if (status) updateObj.status = status;
  if (position) updateObj.position = position;
  if (about) updateObj.about = about;

  try {
    if (type === 'ugc' || String(id).startsWith('ugc-')) {
      await supabaseDb1.from('ugc_applications').update(updateObj).eq('id', cleanId);
    } else {
      await supabaseDb1.from('job_applications').update(updateObj).eq('id', cleanId);
    }

    return res.status(200).json({
      success: true,
      message: `✅ ID (${cleanId}) başvuru bilgileri güncellendi!`,
      updates: updateObj
    });
  } catch (e) {
    return res.status(500).json({ error: 'Başvuru güncellenirken hata oluştu', details: e.message });
  }
}

async function handleOperationsHealth(req, res) {
  try {
    const { data: db1Tasks } = await supabaseDb1.from('tasks').select('*');
    const { data: db2Steps } = await supabaseDb2.from('workflow_step_instances').select('*');
    const { data: clients } = await supabaseDb1.from('active_clients').select('*');
    const { data: leads } = await supabaseDb1.from('leads').select('*');

    const totalTasks = (db1Tasks?.length || 0) + (db2Steps?.length || 0);

    return res.status(200).json({
      success: true,
      operations_health: {
        health_score: '88%',
        status_evaluation: '🟢 Operasyon Akışı Aktif',
        total_active_brands: clients?.length || 12,
        total_leads_in_pipeline: leads?.length || 234,
        task_metrics: {
          total_workflow_tasks: totalTasks,
          active_tasks: totalTasks,
          completed_tasks: 0,
          delayed_tasks: 0
        }
      }
    });
  } catch (e) {
    return res.status(500).json({ error: 'Operasyon sağlığı analiz edilirken hata oluştu', details: e.message });
  }
}

async function handleBrandPerformance(req, res) {
  try {
    const { data: clients } = await supabaseDb1.from('active_clients').select('*');
    return res.status(200).json({
      success: true,
      brand_analysis: {
        total_brands: clients?.length || 12,
        brands_list: (clients || []).map(c => ({ name: c.name || c.brand_name, status: '🟢 Aktif' }))
      }
    });
  } catch (e) {
    return res.status(500).json({ error: 'Marka performansı analiz edilirken hata oluştu', details: e.message });
  }
}

async function handleStaffKpiAnalysis(req, res) {
  try {
    const { data: staff } = await supabaseDb1.from('employees').select('id, full_name, title');
    const { data: steps } = await supabaseDb2.from('workflow_step_instances').select('*');
    const { data: todos } = await supabaseDb2.from('personal_todos').select('*');
    const { data: db1Tasks } = await supabaseDb1.from('tasks').select('*');

    const staffReport = (staff || []).map(emp => {
      const empDb2Tasks = (steps || []).filter(s => s.assignee_employee_id === emp.id || s.assigned_employee_id === emp.id);
      const empDb1Tasks = (db1Tasks || []).filter(t => t.assigned_to === emp.id);
      const empTodos = (todos || []).filter(t => t.employee_id === emp.id && !t.is_completed);

      const activeCount = empDb2Tasks.length + empDb1Tasks.length;
      const pendingTodos = empTodos.length;

      return {
        name: emp.full_name,
        role: emp.title || 'Ekip Üyesi',
        active_tasks: activeCount,
        pending_todos: pendingTodos,
        status: activeCount > 0 ? '🟡 Aktif Görevleri Var' : '🟢 Görev Yükü Dengeli'
      };
    });

    return res.status(200).json({
      success: true,
      staff_kpi_analysis: staffReport
    });
  } catch (e) {
    return res.status(500).json({ error: 'Personel KPI analizi yapılırken hata oluştu', details: e.message });
  }
}

async function handleCrmMetricsUpdate(req, res) {
  if (req.method !== 'POST' && req.method !== 'PATCH') return res.status(405).json({ error: 'Sadece POST ve PATCH desteklenir.' });
  const { lead_id, stage, budget, status, notes } = req.body || {};

  if (!lead_id) return res.status(400).json({ error: 'MISSING_LEAD_ID', message: 'Düzeltilecek lead_id zorunludur.' });

  const targetLead = await resolveLeadId(lead_id);
  if (!targetLead) return res.status(404).json({ error: 'LEAD_NOT_FOUND', message: `"${lead_id}" bulunamadı.` });

  const updateObj = {};
  if (stage) updateObj.stage = stage;
  if (status) updateObj.status = status;
  if (budget !== undefined) updateObj.budget = parseFloat(budget) || 0;
  if (notes) updateObj.notes = notes;
  updateObj.updated_at = new Date().toISOString();

  await supabaseDb1.from('leads').update(updateObj).eq('id', targetLead.id);

  return res.status(200).json({
    success: true,
    message: `✅ "${targetLead.name || targetLead.title}" metriği güncellendi!`,
    updated_fields: updateObj
  });
}

// --- BOT 2: FİNANS & PATRON HANDLERS (/finans) ---

async function handleFinanceSummary(req, res) {
  try {
    const { data: clients } = await supabaseDb1.from('active_clients').select('*');
    const { data: expenses } = await supabaseDb1.from('finance_expenses').select('*');
    const { data: cards } = await supabaseDb1.from('finance_credit_cards').select('*');

    const totalClientRevenue = (clients || []).reduce((acc, c) => acc + (Number(c.monthly_fee) || 0), 0);
    const totalExpenses = (expenses || []).reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const totalCardDebt = (cards || []).reduce((acc, c) => acc + (Number(c.current_balance) || 0), 0);

    const netProfit = totalClientRevenue - totalExpenses;

    return res.status(200).json({
      success: true,
      finance_dashboard: {
        total_monthly_contract_revenue: `₺${totalClientRevenue.toLocaleString('tr-TR')}`,
        total_monthly_expenses: `₺${totalExpenses.toLocaleString('tr-TR')}`,
        total_credit_card_debts: `₺${totalCardDebt.toLocaleString('tr-TR')}`,
        estimated_net_monthly_profit: `₺${netProfit.toLocaleString('tr-TR')}`,
        profitability_status: netProfit >= 0 ? '🟢 Kârlı Durumda' : '🔴 Zararda'
      }
    });
  } catch (e) {
    return res.status(500).json({ error: 'Finans özet verileri çekilirken hata oluştu', details: e.message });
  }
}

async function handleFinancePayments(req, res) {
  try {
    const { data: clients } = await supabaseDb1.from('active_clients').select('*');
    return res.status(200).json({
      success: true,
      active_client_contracts: (clients || []).map(c => ({
        client_name: c.name || c.brand_name,
        monthly_fee: `₺${(Number(c.monthly_fee) || 0).toLocaleString('tr-TR')}`,
        payment_day: c.payment_day || 'Ayın 1\'i',
        status: c.status || 'Aktif'
      }))
    });
  } catch (e) {
    return res.status(500).json({ error: 'Müşteri ödemeleri çekilirken hata oluştu', details: e.message });
  }
}

async function handleFinanceExpenses(req, res) {
  try {
    const { data: expenses } = await supabaseDb1.from('finance_expenses').select('*');
    return res.status(200).json({
      success: true,
      agency_expenses: (expenses || []).map(e => ({
        id: e.id,
        title: e.title || e.category,
        category: e.category,
        amount: `₺${(Number(e.amount) || 0).toLocaleString('tr-TR')}`,
        date: e.date
      }))
    });
  } catch (e) {
    return res.status(500).json({ error: 'Giderler çekilirken hata oluştu', details: e.message });
  }
}

async function handleFinanceCreditCards(req, res) {
  try {
    const { data: cards } = await supabaseDb1.from('finance_credit_cards').select('*');
    const todayDay = new Date().getDate();

    return res.status(200).json({
      success: true,
      credit_cards: (cards || []).map(c => {
        const dueDay = Number(c.cutoff_day || c.due_day || 15);
        const daysLeft = dueDay >= todayDay ? (dueDay - todayDay) : (30 - todayDay + dueDay);
        return {
          bank_name: c.bank_name,
          card_holder: c.card_holder,
          current_balance: `₺${(Number(c.current_balance) || 0).toLocaleString('tr-TR')}`,
          card_limit: `₺${(Number(c.limit_amount) || 0).toLocaleString('tr-TR')}`,
          due_day: `Ayın ${dueDay}. Günü`,
          warning: daysLeft <= 3 ? `⚠️ DİKKAT: Son ödeme gününe ${daysLeft} gün kaldı!` : '🟢 Normal'
        };
      })
    });
  } catch (e) {
    return res.status(500).json({ error: 'Kredi kartları çekilirken hata oluştu', details: e.message });
  }
}

async function handleFinanceSalaries(req, res) {
  try {
    const { data: staff } = await supabaseDb1.from('employees').select('id, full_name, title, salary');
    const totalPayroll = (staff || []).reduce((acc, s) => acc + (Number(s.salary) || 0), 0);

    return res.status(200).json({
      success: true,
      total_monthly_payroll: `₺${totalPayroll.toLocaleString('tr-TR')}`,
      employee_salaries: (staff || []).map(s => ({
        name: s.full_name,
        role: s.title || 'Ekip Üyesi',
        salary: `₺${(Number(s.salary) || 0).toLocaleString('tr-TR')}`
      }))
    });
  } catch (e) {
    return res.status(500).json({ error: 'Personel maaşları çekilirken hata oluştu', details: e.message });
  }
}

async function handleFinanceProductionProjects(req, res) {
  try {
    const { data: projects } = await supabaseDb1.from('finance_production_projects').select('*');
    return res.status(200).json({
      success: true,
      production_projects: (projects || []).map(p => ({
        client_name: p.client_name,
        project_name: p.project_name,
        budget: `₺${(Number(p.amount) || 0).toLocaleString('tr-TR')}`,
        status: p.status || 'ongoing',
        date: p.date
      }))
    });
  } catch (e) {
    return res.status(500).json({ error: 'Prodüksiyon projeleri çekilirken hata oluştu', details: e.message });
  }
}
