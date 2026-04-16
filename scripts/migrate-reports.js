
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

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const sql = `
      -- 1. Create staff_reports table
      CREATE TABLE IF NOT EXISTS public.staff_reports (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at timestamptz DEFAULT now(),
        staff_name text NOT NULL,
        staff_role text,
        content text,
        file_url text,
        file_name text,
        external_link text,
        report_date date DEFAULT CURRENT_DATE
      );

      -- 2. Enable RLS
      ALTER TABLE public.staff_reports ENABLE ROW LEVEL SECURITY;

      -- 3. Create policies
      DROP POLICY IF EXISTS "Allow all users" ON public.staff_reports;
      CREATE POLICY "Allow all users" ON public.staff_reports FOR ALL USING (true);
    `;

    console.log('Executing migration...');
    await client.query(sql);
    console.log('Successfully created staff_reports table and policies!');

  } catch (err) {
    console.error('Error executing migration:', err);
  } finally {
    await client.end();
  }
}

runMigration();
