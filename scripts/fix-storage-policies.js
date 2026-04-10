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

async function fixPolicies() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const sql = `
      -- 1. Ensure the bucket is public
      UPDATE storage.buckets SET public = true WHERE id = 'lead-attachments';

      -- 2. Drop existing policies for the bucket to avoid duplicates
      DROP POLICY IF EXISTS "Public Access" ON storage.objects;
      DROP POLICY IF EXISTS "All users can upload" ON storage.objects;
      DROP POLICY IF EXISTS "All users can update" ON storage.objects;
      DROP POLICY IF EXISTS "All users can delete" ON storage.objects;

      -- 3. Create permissive policies for lead-attachments bucket
      
      -- Allow anyone to read files from this bucket
      CREATE POLICY "Public Access" ON storage.objects
        FOR SELECT
        USING (bucket_id = 'lead-attachments');

      -- Allow anyone to upload to this bucket
      CREATE POLICY "All users can upload" ON storage.objects
        FOR INSERT
        WITH CHECK (bucket_id = 'lead-attachments');

      -- Allow anyone to update files in this bucket
      CREATE POLICY "All users can update" ON storage.objects
        FOR UPDATE
        WITH CHECK (bucket_id = 'lead-attachments');

      -- Allow anyone to delete files from this bucket
      CREATE POLICY "All users can delete" ON storage.objects
        FOR DELETE
        USING (bucket_id = 'lead-attachments');
    `;

    await client.query(sql);
    console.log('Storage policies updated successfully for "lead-attachments" bucket!');
    console.log('You should now be able to upload files without RLS errors.');
  } catch (err) {
    console.error('Error fixing policies:', err);
  } finally {
    await client.end();
  }
}

fixPolicies();
