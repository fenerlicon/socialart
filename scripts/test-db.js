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

console.log('Project ID:', SUPABASE_PROJECT_ID);
const connectionString = `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres`;
console.log('Connection Attempt (censored pwd)...', connectionString.replace(DB_PASSWORD, '****'));

const db = new Client({ connectionString });

async function testDB() {
  try {
    await db.connect();
    console.log('SUCCESS: Connection established.');
    const res = await db.query('SELECT current_database();');
    console.log('DB Name:', res.rows[0]);
  } catch (err) {
    console.error('FAILURE:', err);
  } finally {
    await db.end();
  }
}

testDB();
