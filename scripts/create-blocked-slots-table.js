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

async function createBlockedDatesTable() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const sql = `
      CREATE TABLE IF NOT EXISTS public.blocked_slots (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        blocked_date TEXT NOT NULL, -- Format: YYYY-MM-DD
        time_slot TEXT -- Format: "09:00 - 10:00" | If NULL, entire day is blocked
      );
    `;

    await client.query(sql);
    console.log('Table blocked_slots created successfully!');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await client.end();
  }
}

createBlockedDatesTable();
