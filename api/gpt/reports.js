import { createClient } from '@supabase/supabase-js';

const LEADS_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://piffaggeshfrubyjkhej.supabase.co';
const LEADS_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2OTMzMSwiZXhwIjoyMDk0MzQ1MzMxfQ.DT3n6RNiwA_Tr_xt9iHRqWpDH718lFamct9tAXG8E2w';

const PRIMARY_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://osuwytugjscwhcxxkhfa.supabase.co';
const PRIMARY_SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const supabaseLeads = createClient(LEADS_SUPABASE_URL, LEADS_SUPABASE_KEY);
const supabasePrimary = createClient(PRIMARY_SUPABASE_URL, PRIMARY_SUPABASE_KEY);

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
    // 1. Fetch CRM Leads
    const { data: leads } = await supabaseLeads.from('leads').select('*');
    const activeLeads = (leads || []).filter(l => l.status !== 'ARŞİV');

    // 2. Fetch Brands & Notifications from Primary Supabase
    const { data: brands } = await supabasePrimary.from('brands').select('id, name, status');
    const { data: notifs } = await supabasePrimary.from('notifications').select('*');

    // Compute Metrics
    const totalLeads = activeLeads.length;
    const wonLeads = activeLeads.filter(l => l.stage === 'WON' || l.status === 'Anlaşıldı' || (l.status && l.status.includes('Anlaş'))).length;
    const proposalLeads = activeLeads.filter(l => l.stage === 'PROPOSAL_SENT' || (l.status && l.status.includes('Teklif'))).length;
    
    // Hot leads calculation: include Turkish statuses 'Sıcak', 'Yeni', 'Görüşme' or stage NEW/CONTACTED
    const hotLeads = activeLeads.filter(l => {
      const st = (l.status || '').toLocaleLowerCase('tr-TR');
      const sg = (l.stage || '').toUpperCase();
      return st.includes('sıcak') || st.includes('yeni') || st.includes('görüş') || sg === 'NEW' || sg === 'CONTACTED';
    }).length;

    // Budget sum (from budget column or regex parse from reaction/notes)
    let totalPipelineVolume = 0;
    activeLeads.forEach(l => {
      let b = parseFloat(l.budget) || 0;
      if (b === 0 && l.reaction) {
        const match = l.reaction.match(/bütçe[:\s]*([0-9.,]+)/i);
        if (match && match[1]) {
          b = parseFloat(match[1].replace(/[^0-9.]/g, '')) || 0;
        }
      }
      totalPipelineVolume += b;
    });

    // Payment stats
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

    // Rep Workload Breakdown with Name Normalization
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
        else repNormalized = repRaw; // Keep exact name for other team members
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
  } catch (err) {
    return res.status(500).json({ error: 'Sunucu hatası', details: String(err) });
  }
}
