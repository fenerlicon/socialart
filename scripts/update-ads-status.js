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

async function updateActiveClientsTable() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const sql = `
      -- Add ads_active column to active_clients
      ALTER TABLE public.active_clients ADD COLUMN IF NOT EXISTS ads_active BOOLEAN DEFAULT false;
    `;

    await client.query(sql);
    console.log('Column ads_active added to active_clients!');
  } catch (err) {
    console.error('Error updating table:', err);
  } finally {
    await client.end();
  }
}

updateActiveClientsTable();
