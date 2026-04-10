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

async function createSupportMessagesTable() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const sql = `
      CREATE TABLE IF NOT EXISTS public.client_support_messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        client_name TEXT NOT NULL,
        message TEXT NOT NULL,
        sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'admin')),
        admin_name TEXT, -- Name of the responding admin
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Enable Realtime
      ALTER TABLE public.client_support_messages REPLICA IDENTITY FULL;
    `;

    await client.query(sql);
    console.log('Table client_support_messages created successfully!');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await client.end();
  }
}

createSupportMessagesTable();
