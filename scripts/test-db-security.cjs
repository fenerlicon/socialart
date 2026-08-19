const { createClient } = require('@supabase/supabase-js');

const PRIMARY_URL = 'https://osuwytugjscwhcxxkhfa.supabase.co';
const PRIMARY_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const LEADS_URL = 'https://piffaggeshfrubyjkhej.supabase.co';

const client1 = createClient(PRIMARY_URL, PRIMARY_ANON);
const client2 = createClient(LEADS_URL, PRIMARY_ANON);

async function test() {
  const tablesPrimary = [
    'employees', 
    'active_clients', 
    'security_credentials', 
    'activity_log', 
    'notifications', 
    'payment_requests', 
    'client_support_messages',
    'brands'
  ];
  
  console.log('--- TESTING PRIMARY DB ACCESS WITH PUBLIC ANON KEY ---');
  for (const t of tablesPrimary) {
    try {
      const { data, error } = await client1.from(t).select('*').limit(3);
      if (error) {
        console.log(`Table [${t}]: PROTECTED / ERROR (${error.message})`);
      } else {
        console.log(`Table [${t}]: ACCESSIBLE (${data ? data.length : 0} sample rows)`);
      }
    } catch (e) {
      console.log(`Table [${t}]: EXCEPTION (${e.message})`);
    }
  }

  console.log('\n--- TESTING LEADS DB ACCESS WITH PUBLIC ANON KEY ---');
  const tablesLeads = ['leads', 'contacts'];
  for (const t of tablesLeads) {
    try {
      const { data, error } = await client2.from(t).select('*').limit(3);
      if (error) {
        console.log(`Table [${t}]: PROTECTED / ERROR (${error.message})`);
      } else {
        console.log(`Table [${t}]: ACCESSIBLE (${data ? data.length : 0} sample rows)`);
      }
    } catch (e) {
      console.log(`Table [${t}]: EXCEPTION (${e.message})`);
    }
  }
}

test();
