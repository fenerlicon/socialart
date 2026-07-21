import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://piffaggeshfrubyjkhej.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2OTMzMSwiZXhwIjoyMDk0MzQ1MzMxfQ.DT3n6RNiwA_Tr_xt9iHRqWpDH718lFamct9tAXG8E2w';

const supabase = createClient(supabaseUrl, supabaseKey);

const statusMap = {
  'Sıcak': 'NEW',
  'Yeni': 'NEW',
  'new': 'NEW',
  'NEW': 'NEW',
  'Geldi (Yeni Lead)': 'NEW',
  'İlk İletişim': 'CONTACTED',
  'contacted': 'CONTACTED',
  'CONTACTED': 'CONTACTED',
  'Görüşülüyor': 'CONTACTED',
  'Görüşme Yapıldı': 'CONTACTED',
  'Görüşüldü': 'CONTACTED',
  'Teklif Bekliyor': 'WAITING',
  'Beklemede': 'WAITING',
  'waiting': 'WAITING',
  'WAITING': 'WAITING',
  'Teklif İletildi': 'PROPOSAL_SENT',
  'Teklif Gönderildi': 'PROPOSAL_SENT',
  'Teklif Verildi': 'PROPOSAL_SENT',
  'Katalog İletildi': 'PROPOSAL_SENT',
  'proposal_sent': 'PROPOSAL_SENT',
  'PROPOSAL_SENT': 'PROPOSAL_SENT',
  'negotiating': 'PROPOSAL_SENT',
  'Teklif': 'PROPOSAL_SENT',
  'Ertelendi': 'RETARGETING',
  'retargeting': 'RETARGETING',
  'RETARGETING': 'RETARGETING',
  'Takipte': 'RETARGETING',
  'Yeniden Ulaşılacak': 'RETARGETING',
  'Anlaşıldı': 'WON',
  'Kazanıldı': 'WON',
  'won': 'WON',
  'WON': 'WON',
  'Satış Yapıldı': 'WON',
  'Reddedildi': 'LOST',
  'Kaybedildi': 'LOST',
  'Olumsuz': 'LOST',
  'İptal': 'LOST',
  'lost': 'LOST',
  'LOST': 'LOST'
};

const pipelineMap = {
  'Meta Reklam': 'SOCIAL_MEDIA',
  'Sosyal Medya': 'SOCIAL_MEDIA',
  'Prodüksiyon': 'PRODUCTION',
  'Video Prodüksiyon': 'PRODUCTION',
  'UGC': 'SOCIAL_MEDIA',
  'SEO': 'SOCIAL_MEDIA',
  'Dijital Pazarlama': 'SOCIAL_MEDIA',
};

async function analyze() {
  const { data, error } = await supabase.from('leads').select('*');
  if (error) {
    console.error(error);
    return;
  }

  const prodLeads = [];
  const smLeads = [];

  data.forEach(row => {
    const service = row.service || row.hizmet || '';
    let pipeline = row.pipeline;
    if (!pipeline || (pipeline !== 'PRODUCTION' && pipeline !== 'SOCIAL_MEDIA')) {
      pipeline = pipelineMap[service] ||
        (service.toLowerCase().includes('prodük') || service.toLowerCase().includes('video') || service.toLowerCase().includes('çekim')
          ? 'PRODUCTION' : 'SOCIAL_MEDIA');
    }

    const rawStatus = String(row.status || row.durum || row.stage || '').trim();
    const stage = statusMap[rawStatus] || statusMap[rawStatus.toLowerCase()] || (['NEW', 'CONTACTED', 'WAITING', 'PROPOSAL_SENT', 'RETARGETING', 'WON', 'LOST'].includes(rawStatus) ? rawStatus : 'NEW');

    const item = { id: row.id, name: row.name, status: row.status, stage: row.stage, mappedStage: stage, pipeline };
    if (pipeline === 'PRODUCTION') prodLeads.push(item);
    else smLeads.push(item);
  });

  console.log(`TOTAL LEADS IN DB: ${data.length}`);
  console.log(`PRODUCTION LEADS: ${prodLeads.length}`);
  console.log(`SOCIAL MEDIA LEADS: ${smLeads.length}`);

  const getStageCounts = (arr) => {
    const counts = {};
    arr.forEach(x => {
      counts[x.mappedStage] = (counts[x.mappedStage] || 0) + 1;
    });
    return counts;
  };

  console.log("PRODUCTION STAGES:", getStageCounts(prodLeads));
  console.log("SOCIAL MEDIA STAGES:", getStageCounts(smLeads));
}

analyze();
