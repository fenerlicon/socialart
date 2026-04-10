import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.resolve(__dirname, '../.env');
const envFile = fs.readFileSync(envPath, 'utf8');

const envConfig = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envConfig[match[1]] = match[2].trim();
  }
});

const DB_PASSWORD = envConfig['SUPABASE_DB_PASSWORD'];
const SUPABASE_PROJECT_ID = envConfig['VITE_SUPABASE_URL']?.split('//')[1]?.split('.')[0];

const connectionString = `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres`;
const client = new Client({ connectionString });

async function updateSchema() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const sql = `
      -- Add author_name and attachment fields to lead_history
      ALTER TABLE public.lead_history ADD COLUMN IF NOT EXISTS author_name TEXT;
      ALTER TABLE public.lead_history ADD COLUMN IF NOT EXISTS attachment_url TEXT;
      ALTER TABLE public.lead_history ADD COLUMN IF NOT EXISTS file_name TEXT;

      -- Update existing records if needed (optional)
      UPDATE public.lead_history SET author_name = 'Sistem' WHERE author_name IS NULL;
    `;

    await client.query(sql);
    console.log('Schema updated successfully (author_name and attachment fields added)!');
  } catch (err) {
    console.error('Error updating schema:', err);
  } finally {
    await client.end();
  }
}

updateSchema();
