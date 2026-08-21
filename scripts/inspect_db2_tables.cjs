const { createClient } = require('@supabase/supabase-js');

const SECONDARY_URL = 'https://osuwytugjscwhcxxkhfa.supabase.co';
const SECONDARY_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const db2 = createClient(SECONDARY_URL, SECONDARY_KEY);

async function inspectDb2() {
  const tables = [
    'crm_leads',
    'job_applications',
    'ugc_applications',
    'employees',
    'active_clients',
    'calendar_events',
    'workflow_step_instances',
    'personal_todos',
    'notifications',
    'tasks'
  ];

  console.log("=== DB2 (osuwytugjscwhcxxkhfa) TABLO İNCELEMESİ ===");
  for (const t of tables) {
    try {
      const { data, count, error } = await db2.from(t).select('*', { count: 'exact' });
      if (error) {
        console.log(`❌ Tablo '${t}': VAR OLMADI VEYA HATA -> ${error.message}`);
      } else {
        console.log(`✅ Tablo '${t}': ${data.length} kayıt var.`);
        if (data.length > 0) {
          console.log(`   Örnek Satır:`, JSON.stringify(data[0]).substring(0, 120));
        }
      }
    } catch (e) {
      console.log(`❌ Tablo '${t}': Hata -> ${e.message}`);
    }
  }
}

inspectDb2();
