
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const SUPABASE_PROJECT_ID = process.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0];

if (!DB_PASSWORD || !SUPABASE_PROJECT_ID) {
  console.error('Missing DB credentials');
  process.exit(1);
}

const connectionString = `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres`;

const client = new Client({
  connectionString,
});

async function updateSchema() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const sql = `
      -- 1. Add external_links column as text array if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff_reports' AND column_name='external_links') THEN
          ALTER TABLE public.staff_reports ADD COLUMN external_links text[] DEFAULT '{}';
        END IF;
      END $$;
    `;

    console.log('Updating schema...');
    await client.query(sql);
    console.log('Successfully updated staff_reports table!');

  } catch (err) {
    console.error('Error updating schema:', err);
  } finally {
    await client.end();
  }
}

updateSchema();
