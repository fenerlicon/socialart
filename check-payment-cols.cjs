require('dotenv').config();
const { Client } = require('pg');

const dbPass = encodeURIComponent(process.env.DB1_SUPABASE_DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD || '');
const connectionString = `postgresql://postgres:${dbPass}@db.piffaggeshfrubyjkhej.supabase.co:5432/postgres`;
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
