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

const slugify = (str) => {
    const chars = { 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c', 'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C' };
    return str.replace(/[ğüşıöçĞÜŞİÖÇ]/g, m => chars[m]).replace(/\s+/g, '').toUpperCase();
};

async function assignCreds() {
  try {
    await db.connect();
    console.log('Connected to Database...');

    // 1. Get all active clients
    const clientsRes = await db.query('SELECT name FROM public.active_clients');
    const clients = clientsRes.rows;

    console.log(`Found ${clients.length} clients. Generating accounts...`);

    for (const client of clients) {
        const companyCode = `${slugify(client.name)}2026`;
        const password = 'socialart2026';

        console.log(`Assigning: ${client.name} -> Code: ${companyCode}`);

        await db.query(`
            INSERT INTO public.customer_accounts (client_name, company_code, password)
            VALUES ($1, $2, $3)
            ON CONFLICT (client_name) DO UPDATE 
            SET company_code = EXCLUDED.company_code, password = EXCLUDED.password
        `, [client.name, companyCode, password]);
    }

    console.log('Successfully assigned credentials to all clients.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await db.end();
  }
}

assignCreds();
