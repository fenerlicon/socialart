import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const connectionString = `postgresql://postgres:${dbPassword}@db.zpulnweiosxphibipxdp.supabase.co:5432/postgres`;

async function fixSlugs() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    await client.query("UPDATE blogs SET slug = REPLACE(slug, 'cdata', '') WHERE slug LIKE 'cdata%';");
    console.log('Bozuk linkler (slug) tamamen temizlendi!');
  } catch(e) {
    console.error('Hata:', e);
  } finally {
    await client.end();
  }
}

fixSlugs();
