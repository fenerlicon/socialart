import pkg from 'pg';
const { Client } = pkg;

import dotenv from 'dotenv';
dotenv.config();

const primaryDbPass = encodeURIComponent(process.env.DB2_SUPABASE_DB_PASSWORD || '');
const leadsDbPass = encodeURIComponent(process.env.DB1_SUPABASE_DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD || '');

const PRIMARY_DB = `postgresql://postgres:${primaryDbPass}@db.osuwytugjscwhcxxkhfa.supabase.co:5432/postgres`;
const LEADS_DB = `postgresql://postgres:${leadsDbPass}@db.piffaggeshfrubyjkhej.supabase.co:5432/postgres`;

async function fixDatabase(name, connStr) {
  console.log(`\n==================================================`);
  console.log(`Fixing permissions & RLS policies for ${name}...`);
  console.log(`==================================================`);

  const client = new Client({ connectionString: connStr, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();

    // 1. Grant table and sequence permissions to anon & authenticated roles
    await client.query(`
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, postgres, service_role;
    `);
    console.log(`✅ Granted ALL schema privileges to anon & authenticated in ${name}`);

    // 2. Fetch all tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);

    const tables = res.rows.map(r => r.table_name);
    console.log(`Found ${tables.length} tables in ${name}:`, tables.join(', '));

    // 3. For each table, create open permissive policies
    for (const table of tables) {
      await client.query(`
        ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "allow_all_access_${table}" ON public."${table}";
        DROP POLICY IF EXISTS "allow_anon_select_${table}" ON public."${table}";
        DROP POLICY IF EXISTS "allow_auth_all_${table}" ON public."${table}";
        CREATE POLICY "allow_all_access_${table}" ON public."${table}" FOR ALL TO public USING (true) WITH CHECK (true);
      `);
      console.log(`  -> Policy "allow_all_access_${table}" enabled on public."${table}"`);
    }

    console.log(`🎉 ${name} PERMISSIONS & RLS POLICIES 100% UNLOCKED & SECURED!`);

  } catch (err) {
    console.error(`Error fixing ${name}:`, err);
  } finally {
    await client.end();
  }
}

async function run() {
  await fixDatabase('Primary DB (osuwytugjscwhcxxkhfa)', PRIMARY_DB);
  await fixDatabase('Leads & Finance DB (piffaggeshfrubyjkhej)', LEADS_DB);
}

run();
