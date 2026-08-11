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

  try {
    const { data: leads, error } = await supabaseLeads
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Supabase leads sorgulama hatası', details: error.message });
    }

    const activeLeads = (leads || []).filter(l => l.status !== 'ARŞİV');

    // Compute metrics
    const totalLeads = activeLeads.length;
    const hotLeads = activeLeads.filter(l => l.status === 'Sıcak' || l.stage === 'NEW').length;
    const wonLeads = activeLeads.filter(l => l.stage === 'WON' || l.status === 'Anlaşıldı').length;
    const lostLeads = activeLeads.filter(l => l.stage === 'LOST' || l.status === 'Reddedildi').length;
    const contactedLeads = activeLeads.filter(l => l.stage === 'CONTACTED').length;
    const proposalLeads = activeLeads.filter(l => l.stage === 'PROPOSAL_SENT').length;

    // Stage breakdown
    const stageCounts = {};
    activeLeads.forEach(l => {
      const stage = l.stage || l.status || 'Bilinmiyor';
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });

    // Rep breakdown
    const repCounts = {};
    activeLeads.forEach(l => {
      const rep = l.rep || 'Atanmamış';
      repCounts[rep] = (repCounts[rep] || 0) + 1;
    });

    // Format top 25 leads for ChatGPT context
    const recentLeadsSummary = activeLeads.slice(0, 25).map(l => ({
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
  } catch (err) {
    return res.status(500).json({ error: 'Sunucu hatası', details: String(err) });
  }
}
