import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env');
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

async function checkSizes() {
  try {
    await client.connect();
    
    console.log('--- EN BÜYÜK DOSYALAR ---');
    const largeFilesRes = await client.query(`
      SELECT bucket_id, name, (COALESCE(metadata->>'size', '0')::bigint) / 1024 / 1024 as size_mb 
      FROM storage.objects 
      ORDER BY (COALESCE(metadata->>'size', '0')::bigint) DESC 
      LIMIT 10;
    `);
    largeFilesRes.rows.forEach(r => console.log(`Bucket: ${r.bucket_id} | File: ${r.name} | Size: ${r.size_mb} MB`));

    const storageRes = await client.query(`
      SELECT bucket_id, SUM(COALESCE(metadata->>'size', '0')::bigint) as total_size, count(*) as file_count 
      FROM storage.objects 
      GROUP BY bucket_id 
      ORDER BY total_size DESC;
    `);
    console.log('\n--- BUCKET BOYUTLARI ---');
    storageRes.rows.forEach(r => console.log(`Bucket: ${r.bucket_id} | Files: ${r.file_count} | Size: ${(r.total_size / 1024 / 1024).toFixed(2)} MB`));

    const dbRes = await client.query(`
      SELECT relname as table_name, pg_size_pretty(pg_total_relation_size(C.oid)) as total_size, pg_total_relation_size(C.oid) as size_bytes 
      FROM pg_class C 
      LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace) 
      WHERE nspname NOT IN ('pg_catalog', 'information_schema') 
      AND C.relkind <> 'i' 
      AND nspname !~ '^pg_toast' 
      ORDER BY size_bytes DESC 
      LIMIT 10;
    `);
    console.log('\n--- TABLO BOYUTLARI ---');
    dbRes.rows.forEach(r => console.log(`Table: ${r.table_name} | Size: ${r.total_size}`));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkSizes();
