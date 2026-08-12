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

      // 1. Create payment_requests table
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.payment_requests (
          id TEXT PRIMARY KEY,
          client_name TEXT NOT NULL,
          company_code TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          amount NUMERIC NOT NULL,
          kdv_amount NUMERIC,
          total_amount NUMERIC,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      console.log(`Table payment_requests created/ensured in ${db.name}`);

      // 2. Enable RLS and policies
      await client.query(`
        ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can select payment_requests" ON public.payment_requests;
        CREATE POLICY "Public can select payment_requests" ON public.payment_requests
          FOR SELECT TO public USING (true);

        DROP POLICY IF EXISTS "Public can insert payment_requests" ON public.payment_requests;
        CREATE POLICY "Public can insert payment_requests" ON public.payment_requests
          FOR INSERT TO public WITH CHECK (true);

        DROP POLICY IF EXISTS "Public can update payment_requests" ON public.payment_requests;
        CREATE POLICY "Public can update payment_requests" ON public.payment_requests
          FOR UPDATE TO public USING (true);

        DROP POLICY IF EXISTS "Public can delete payment_requests" ON public.payment_requests;
        CREATE POLICY "Public can delete payment_requests" ON public.payment_requests
          FOR DELETE TO public USING (true);

        GRANT ALL ON public.payment_requests TO anon, authenticated, service_role;
      `);
      console.log(`RLS policies configured for payment_requests in ${db.name}`);

      // 3. Seed Arayanvar payment request
      await client.query(`
        INSERT INTO public.payment_requests (id, client_name, company_code, title, description, amount, kdv_amount, total_amount, status, created_at)
        VALUES (
          'REQ-1785854262319-94',
          'Arayanvar',
          'arayanvar',
          'Reklam Maliyeti',
          'Çekim sırasında oluşan maliyetler',
          47451,
          9490.2,
          56941.2,
          'pending',
          '2026-08-04T14:37:42.319Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          client_name = EXCLUDED.client_name,
          amount = EXCLUDED.amount,
          status = EXCLUDED.status;
      `);
      console.log(`Arayanvar payment request seeded in ${db.name}`);

      await client.end();
    } catch (err) {
      console.error(`Error in ${db.name}:`, err.message);
      try { await client.end(); } catch (_) {}
    }
  }
}

setup();
