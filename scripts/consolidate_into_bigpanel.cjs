const { createClient } = require('@supabase/supabase-js');

const BIG_PANEL_URL = 'https://osuwytugjscwhcxxkhfa.supabase.co';
const BIG_PANEL_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const LEADS_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const LEADS_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjkzMzEsImV4cCI6MjA5NDM0NTMzMX0.Bp4A-VwFMuOgpIqL_yud-i85uwnjxNZ4hXMNxNKu1HA';

const bigPanelDb = createClient(BIG_PANEL_URL, BIG_PANEL_KEY);
const leadsDb = createClient(LEADS_URL, LEADS_KEY);

async function consolidateAllIntoBigPanel() {
  console.log("🚀 BİG PANEL (osuwytug...) TEK VERİTABANI TOPLAMA TESTİ BAŞLIYOR...");

  // 1. Copy leads from DB1 -> Big Panel DB
  console.log("📦 1. 'leads' kopyalanıyor (234 kayıt)...");
  const { data: leadsData, error: errL } = await leadsDb.from('leads').select('*');
  if (leadsData && leadsData.length > 0) {
    const { error: insertErr } = await bigPanelDb.from('leads').upsert(leadsData, { onConflict: 'id' });
    if (insertErr) {
      console.log("❌ Big Panel leads hatası:", insertErr.message);
    } else {
      console.log(`✅ SUCCESS: ${leadsData.length} lead Big Panel'e aktarıldı!`);
    }
  }

  // 2. Copy active_clients -> Big Panel DB
  console.log("📦 2. 'active_clients' kopyalanıyor...");
  const { data: clientsData } = await leadsDb.from('active_clients').select('*');
  if (clientsData && clientsData.length > 0) {
    const { error: errC } = await bigPanelDb.from('active_clients').upsert(clientsData, { onConflict: 'id' });
    if (errC) console.log("❌ Big Panel active_clients hatası:", errC.message);
    else console.log(`✅ SUCCESS: ${clientsData.length} marka Big Panel'e aktarıldı!`);
  }

  // 3. Copy finance tables -> Big Panel DB
  const finTables = ['finance_expenses', 'finance_client_payments', 'finance_credit_cards', 'finance_production_projects', 'payment_requests', 'appointments'];
  for (const t of finTables) {
    const { data: tData } = await leadsDb.from(t).select('*');
    if (tData && tData.length > 0) {
      const { error: errT } = await bigPanelDb.from(t).upsert(tData, { onConflict: 'id' });
      if (errT) console.log(`❌ Big Panel ${t} hatası:`, errT.message);
      else console.log(`✅ SUCCESS: ${t} (${tData.length} kayıt) Big Panel'e aktarıldı!`);
    }
  }
}

consolidateAllIntoBigPanel();
