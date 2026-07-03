const { Client } = require('pg');

const connectionString = 'postgresql://postgres:bvwW%2BQg7LS%26u3V%26@db.piffaggeshfrubyjkhej.supabase.co:5432/postgres';
const client = new Client({ connectionString });

async function check() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'finance_client_payments';
  `);
  console.log(res.rows);
  await client.end();
}

check().catch(console.error);
