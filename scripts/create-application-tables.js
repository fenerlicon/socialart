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

async function createTables() {
  try {
    await db.connect();
    console.log('Connected to database.');

    // UGC Applications Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS ugc_applications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        instagram_url TEXT,
        portfolio_url TEXT,
        city TEXT,
        about TEXT,
        status TEXT DEFAULT 'Bekliyor'
      );
    `);
    console.log('Table ugc_applications created or already exists.');

    // Influencer Applications Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS influencer_applications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        instagram_url TEXT NOT NULL,
        followers_count TEXT,
        niche TEXT,
        about TEXT,
        status TEXT DEFAULT 'Bekliyor'
      );
    `);
    console.log('Table influencer_applications created or already exists.');

    // Job Applications Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        position TEXT NOT NULL,
        portfolio_url TEXT,
        resume_url TEXT,
        about TEXT,
        status TEXT DEFAULT 'Bekliyor'
      );
    `);
    console.log('Table job_applications created or already exists.');

    console.log('All application tables are ready.');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    await db.end();
  }
}

createTables();
