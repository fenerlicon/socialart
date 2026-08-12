import pkg from 'pg';
const { Client } = pkg;

const password = 'bvwW+Qg7LS&u3V&';
const escapedPassword = encodeURIComponent(password);

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

      // 1. Create ugc_applications table
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.ugc_applications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          full_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT NOT NULL,
          instagram_url TEXT,
          portfolio_url TEXT,
          city TEXT,
          about TEXT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      console.log(`Table ugc_applications created/ensured in ${db.name}`);

      // 2. Create job_applications table
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.job_applications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          full_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT NOT NULL,
          position TEXT NOT NULL,
          portfolio_url TEXT,
          resume_url TEXT,
          about TEXT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      console.log(`Table job_applications created/ensured in ${db.name}`);

      // 3. Grant permissions & RLS policies
      await client.query(`
        ALTER TABLE public.ugc_applications ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can insert ugc_applications" ON public.ugc_applications;
        CREATE POLICY "Public can insert ugc_applications" ON public.ugc_applications
          FOR INSERT TO public WITH CHECK (true);

        DROP POLICY IF EXISTS "Public can select ugc_applications" ON public.ugc_applications;
        CREATE POLICY "Public can select ugc_applications" ON public.ugc_applications
          FOR SELECT TO public USING (true);

        DROP POLICY IF EXISTS "Public can insert job_applications" ON public.job_applications;
        CREATE POLICY "Public can insert job_applications" ON public.job_applications
          FOR INSERT TO public WITH CHECK (true);

        DROP POLICY IF EXISTS "Public can select job_applications" ON public.job_applications;
        CREATE POLICY "Public can select job_applications" ON public.job_applications
          FOR SELECT TO public USING (true);

        GRANT ALL ON public.ugc_applications TO anon, authenticated, service_role;
        GRANT ALL ON public.job_applications TO anon, authenticated, service_role;
      `);
      console.log(`RLS and grants configured for ${db.name}`);
      await client.end();
    } catch (err) {
      console.error(`Error in ${db.name}:`, err.message);
      try { await client.end(); } catch (_) {}
    }
  }
}

setup();
