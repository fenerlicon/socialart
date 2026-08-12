import pkg from 'pg';
const { Client } = pkg;

const password = 'bvwW+Qg7LS&u3V&';
const escapedPassword = encodeURIComponent(password);

// Try primary DB and leads DB
const databases = [
  { name: 'Primary DB (osuwytugjscwhcxxkhfa)', url: `postgresql://postgres:${escapedPassword}@db.osuwytugjscwhcxxkhfa.supabase.co:5432/postgres` },
  { name: 'Leads DB (piffaggeshfrubyjkhej)', url: `postgresql://postgres:${escapedPassword}@db.piffaggeshfrubyjkhej.supabase.co:5432/postgres` }
];

async function setup() {
  for (const db of databases) {
    console.log(`\nConnecting to ${db.name}...`);
    const client = new Client({ connectionString: db.url, connectionTimeoutMillis: 5000 });
    try {
      await client.connect();
      console.log(`Connected to ${db.name}`);

      await client.query(`
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('lead-attachments', 'lead-attachments', true, 52428800, null)
        ON CONFLICT (id) DO UPDATE SET public = true;
      `);
      console.log(`Bucket lead-attachments created/updated in ${db.name}`);

      await client.query(`
        DROP POLICY IF EXISTS "Public Access lead-attachments select" ON storage.objects;
        CREATE POLICY "Public Access lead-attachments select" ON storage.objects
        FOR SELECT TO public USING (bucket_id = 'lead-attachments');

        DROP POLICY IF EXISTS "Public Access lead-attachments insert" ON storage.objects;
        CREATE POLICY "Public Access lead-attachments insert" ON storage.objects
        FOR INSERT TO public WITH CHECK (bucket_id = 'lead-attachments');

        DROP POLICY IF EXISTS "Public Access lead-attachments update" ON storage.objects;
        CREATE POLICY "Public Access lead-attachments update" ON storage.objects
        FOR UPDATE TO public USING (bucket_id = 'lead-attachments');

        DROP POLICY IF EXISTS "Public Access lead-attachments delete" ON storage.objects;
        CREATE POLICY "Public Access lead-attachments delete" ON storage.objects
        FOR DELETE TO public USING (bucket_id = 'lead-attachments');
      `);
      console.log(`Storage RLS policies enabled for lead-attachments in ${db.name}`);
      await client.end();
    } catch (err) {
      console.error(`Failed for ${db.name}:`, err.message);
      try { await client.end(); } catch (_) {}
    }
  }
}

setup();
