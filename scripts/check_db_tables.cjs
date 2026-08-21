const { createClient } = require('@supabase/supabase-js');

const PRIMARY_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const PRIMARY_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjkzMzEsImV4cCI6MjA5NDM0NTMzMX0.Bp4A-VwFMuOgpIqL_yud-i85uwnjxNZ4hXMNxNKu1HA';

const SECONDARY_URL = 'https://osuwytugjscwhcxxkhfa.supabase.co';
const SECONDARY_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const db1 = createClient(PRIMARY_URL, PRIMARY_KEY);
const db2 = createClient(SECONDARY_URL, SECONDARY_KEY);

async function main() {
  console.log("--- DB1 (piffaggeshfrubyjkhej) ---");
  for (const table of ['leads', 'job_applications', 'ugc_applications', 'employees', 'active_clients', 'calendar_events', 'workflow_step_instances', 'personal_todos', 'tasks', 'appointments', 'blocked_slots']) {
    const { data, error } = await db1.from(table).select('*').limit(2);
    console.log(`DB1 ${table}:`, error ? `ERROR: ${error.message}` : `OK (${data?.length || 0} rows)`);
  }

  console.log("\n--- DB2 (osuwytugjscwhcxxkhfa) ---");
  for (const table of ['crm_leads', 'job_applications', 'ugc_applications', 'employees', 'active_clients', 'calendar_events', 'workflow_step_instances', 'personal_todos', 'tasks', 'appointments', 'blocked_slots']) {
    const { data, error } = await db2.from(table).select('*').limit(2);
    console.log(`DB2 ${table}:`, error ? `ERROR: ${error.message}` : `OK (${data?.length || 0} rows)`);
  }
}

main();
