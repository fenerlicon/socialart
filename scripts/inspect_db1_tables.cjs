const { createClient } = require('@supabase/supabase-js');

const PRIMARY_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const PRIMARY_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjkzMzEsImV4cCI6MjA5NDM0NTMzMX0.Bp4A-VwFMuOgpIqL_yud-i85uwnjxNZ4hXMNxNKu1HA';

const db1 = createClient(PRIMARY_URL, PRIMARY_KEY);

async function inspectDb1() {
  const tables = [
    'leads',
    'job_applications',
    'ugc_applications',
    'employees',
    'active_clients',
    'calendar_events',
    'workflow_step_instances',
    'personal_todos',
    'notifications',
    'tasks',
    'appointments',
    'blocked_slots',
    'finance_expenses',
    'finance_client_payments',
    'finance_credit_cards',
    'finance_production_projects',
    'payment_requests',
    'crm_activity_logs'
  ];

  console.log("=== DB1 (piffaggeshfrubyjkhej) TABLO İNCELEMESİ ===");
  for (const t of tables) {
    try {
      const { data, error } = await db1.from(t).select('*', { count: 'exact' });
      if (error) {
        console.log(`❌ Tablo '${t}': VAR OLMADI VEYA HATA -> ${error.message}`);
      } else {
        console.log(`✅ Tablo '${t}': ${data.length} kayıt var.`);
      }
    } catch (e) {
      console.log(`❌ Tablo '${t}': Hata -> ${e.message}`);
    }
  }
}

inspectDb1();
