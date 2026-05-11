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

async function apply() {
  await db.connect();
  await db.query('ALTER TABLE ugc_applications ENABLE ROW LEVEL SECURITY');
  await db.query('ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY');
  await db.query('DROP POLICY IF EXISTS allow_anon_insert_ugc ON ugc_applications');
  await db.query('CREATE POLICY allow_anon_insert_ugc ON ugc_applications FOR INSERT WITH CHECK (true)');
  await db.query('DROP POLICY IF EXISTS allow_anon_insert_job ON job_applications');
  await db.query('CREATE POLICY allow_anon_insert_job ON job_applications FOR INSERT WITH CHECK (true)');
  await db.query('DROP POLICY IF EXISTS allow_all_select_ugc ON ugc_applications');
  await db.query('CREATE POLICY allow_all_select_ugc ON ugc_applications FOR SELECT USING (true)');
  await db.query('DROP POLICY IF EXISTS allow_all_select_job ON job_applications');
  await db.query('CREATE POLICY allow_all_select_job ON job_applications FOR SELECT USING (true)');
  console.log('Policies applied.');
  await db.end();
}
apply();
