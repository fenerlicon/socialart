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

async function addAppointmentsFilesColumn() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    const checkCol = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' AND column_name = 'files';
    `);
    
    if (checkCol.rows.length === 0) {
      console.log('Adding files column (jsonb) to appointments...');
      await client.query(`ALTER TABLE appointments ADD COLUMN files jsonb DEFAULT '[]'::jsonb;`);
      console.log('Column added successfully.');
    } else {
      console.log('Column files already exists in appointments.');
    }
  } catch (err) {
    console.error('Error adding files column:', err);
  } finally {
    await client.end();
  }
}

addAppointmentsFilesColumn();
