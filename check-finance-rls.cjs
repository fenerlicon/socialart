const { Client } = require('pg');

const connectionString = 'postgresql://postgres:bvwW%2BQg7LS%26u3V%26@db.piffaggeshfrubyjkhej.supabase.co:5432/postgres';
const client = new Client({ connectionString });

async function check() {
  await client.connect();
  const tables = [
    'active_clients', 'staff', 'finance_client_payments', 
    'finance_expenses', 'finance_taxes', 'finance_credit_cards', 
    'finance_cash_journal', 'finance_staff_payments'
  ];

  const resRLS = await client.query(`
    SELECT relname, relrowsecurity, relforcerowsecurity 
    FROM pg_class 
    WHERE relname = ANY($1)
  `, [tables]);
  
  console.log("=== RLS STATUS ===");
  console.log(resRLS.rows);

  const resPolicies = await client.query(`
    SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = ANY($1)
  `, [tables]);

  console.log("=== POLICIES ===");
  console.log(JSON.stringify(resPolicies.rows, null, 2));

  await client.end();
}

check().catch(console.error);
