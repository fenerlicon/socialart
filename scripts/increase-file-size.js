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

if (!DB_PASSWORD || !SUPABASE_PROJECT_ID) {
  console.error('Missing DB_PASSWORD or SUPABASE_PROJECT_ID');
  process.exit(1);
}

const connectionString = `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres`;
const client = new Client({ connectionString });

async function increaseSizeLimit() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const sql = `
      -- Increase file size limit to 50MB (52428800 bytes)
      UPDATE storage.buckets 
      SET file_size_limit = 52428800 
      WHERE id = 'lead-attachments';
    `;

    await client.query(sql);
    console.log('File size limit increased to 50MB successfully!');
  } catch (err) {
    console.error('Error increasing size limit:', err);
  } finally {
    await client.end();
  }
}

increaseSizeLimit();
