import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const db = new Client({ connectionString });

async function updateTaskSchema() {
  try {
    await db.connect();
    console.log('Connected to Database...');

    const sql = `
      -- 1. Add client_name and phase to tasks
      ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS client_name TEXT;
      ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS phase INTEGER DEFAULT 1;

      -- 2. Add current_phase and total_phase_tasks to active_clients for auto-calculation
      ALTER TABLE public.active_clients ADD COLUMN IF NOT EXISTS current_phase INTEGER DEFAULT 1;
      ALTER TABLE public.active_clients ADD COLUMN IF NOT EXISTS ads_active BOOLEAN DEFAULT false; -- Just in case it's missing
    `;

    await db.query(sql);
    console.log('Successfully updated Tasks and Active Clients schema for Phase-based workflow.');

  } catch (err) {
    console.error('Schema Update Error:', err);
  } finally {
    await db.end();
  }
}

updateTaskSchema();
