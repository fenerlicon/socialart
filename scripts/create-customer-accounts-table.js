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

async function createCustomerAccountsTable() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const sql = `
      CREATE TABLE IF NOT EXISTS public.customer_accounts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        client_name TEXT NOT NULL UNIQUE, -- Matches active_clients.name
        company_code TEXT NOT NULL UNIQUE, -- Used for login
        password TEXT NOT NULL,
        metrics JSONB DEFAULT '{
            "followers": "---",
            "engagement": "---",
            "roas": "---",
            "ad_spend": "---"
        }'::JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Add a default customer for testing
      INSERT INTO public.customer_accounts (client_name, company_code, password, metrics)
      VALUES (
        'PEUGEOT Turkey', 
        'PEUGEOT2026', 
        'socialart2026', 
        '{
            "followers": "450K",
            "growth": "+12%",
            "roas": "7.5",
            "reach": "1.2M",
            "ad_spend": "₺85.000"
        }'::JSONB
      ) ON CONFLICT (client_name) DO NOTHING;
    `;

    await client.query(sql);
    console.log('Table customer_accounts created and seeded successfully!');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await client.end();
  }
}

createCustomerAccountsTable();
