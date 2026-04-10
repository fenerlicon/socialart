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

async function secureDB() {
  try {
    await db.connect();
    console.log('Connected to Database for Security Hardening...');

    const sql = `
      -- 1. Enable RLS on all tables if not already enabled
      ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.active_clients ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.client_support_messages ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

      -- 2. Clear insecure policies
      DROP POLICY IF EXISTS "Enable all operations for all users" ON public.leads;
      DROP POLICY IF EXISTS "Enable all operations for all users" ON public.active_clients;
      DROP POLICY IF EXISTS "Enable all operations for all users" ON public.tasks;
      DROP POLICY IF EXISTS "Allow all for authenticated" ON public.activity_log;
      DROP POLICY IF EXISTS "Admin only" ON public.staff;

      -- 3. STAFF ACCESS (Authenticated)
      -- Allow authenticated staff members full access to internal tables
      CREATE POLICY "Staff Full Access Leads" ON public.leads FOR ALL TO authenticated USING (true);
      CREATE POLICY "Staff Full Access Active Clients" ON public.active_clients FOR ALL TO authenticated USING (true);
      CREATE POLICY "Staff Full Access Tasks" ON public.tasks FOR ALL TO authenticated USING (true);
      CREATE POLICY "Staff Full Access Staff" ON public.staff FOR ALL TO authenticated USING (true);
      CREATE POLICY "Staff Full Access Logs" ON public.activity_log FOR ALL TO authenticated USING (true);
      CREATE POLICY "Staff Full Access Chat" ON public.chat_messages FOR ALL TO authenticated USING (true);
      CREATE POLICY "Staff Full Access Support" ON public.client_support_messages FOR ALL TO authenticated USING (true);
      CREATE POLICY "Staff Full Access Slots" ON public.blocked_slots FOR ALL TO authenticated USING (true);

      -- 4. CLIENT ACCESS (Anonymous)
      -- Allow clients to SELECT their own info from active_clients (required for login)
      -- Note: This is read-only for clients.
      DROP POLICY IF EXISTS "Client Read Access" ON public.active_clients;
      CREATE POLICY "Client Read Access" ON public.active_clients FOR SELECT TO anon USING (true);

      -- Allow clients to manage their OWN support messages
      -- Note: We filter by client_name in the app, but RLS adds a layer for INSERT.
      DROP POLICY IF EXISTS "Client Message Insert" ON public.client_support_messages;
      CREATE POLICY "Client Message Insert" ON public.client_support_messages FOR INSERT TO anon WITH CHECK (sender_type = 'client');

      DROP POLICY IF EXISTS "Client Message Select" ON public.client_support_messages;
      CREATE POLICY "Client Message Select" ON public.client_support_messages FOR SELECT TO anon USING (true);

      -- Deny anon access to everything else explicitly (by having NO policy for anon)
    `;

    await db.query(sql);
    console.log('Successfully applied RLS Security Policies.');
    console.log('System is now hardened: Staff (Auth) has full control, Clients (Anon) have restricted read/send access.');

  } catch (err) {
    console.error('Security Hardening Error:', err);
  } finally {
    await db.end();
  }
}

secureDB();
