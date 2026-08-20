import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:bvwW%2BQg7LS%26u3V%26@db.piffaggeshfrubyjkhej.supabase.co:5432/postgres';
const client = new Client({ connectionString });

async function seed() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    // 1. Drop NOT NULL on all legacy columns, convert id to TEXT, add all required columns
    await client.query(`
      ALTER TABLE public.employees ALTER COLUMN id TYPE TEXT USING id::text;
      ALTER TABLE public.employees ALTER COLUMN isim DROP NOT NULL;
      ALTER TABLE public.employees ALTER COLUMN rol DROP NOT NULL;
      ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS full_name TEXT;
      ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS email TEXT;
      ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS title TEXT;
      ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS role_package_id TEXT;
      ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS team_ids TEXT[];
      ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS permission_overrides JSONB DEFAULT '{}'::jsonb;
      ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS employee_status TEXT DEFAULT 'active';
      ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS work_location_status TEXT DEFAULT 'office';
      ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS has_advanced_calendar_access BOOLEAN DEFAULT true;
      ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

      ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "allow_anon_select_employees" ON public.employees;
      CREATE POLICY "allow_anon_select_employees" ON public.employees FOR SELECT TO public USING (true);
    `);
    console.log('✅ Updated public.employees schema!');

    // 2. Fetch all staff from public.staff
    const staffRes = await client.query('SELECT * FROM public.staff;');
    const staff = staffRes.rows;
    console.log(`Seeding employees table with ${staff.length} staff members...`);

    for (const s of staff) {
      const rawUser = s.username || s.display_name;
      const username = rawUser.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]/g, '');
      
      let rolePkg = 'ekip-uyesi';
      if (username === 'celal' || username === 'ercan') {
        rolePkg = 'operasyon-yonetimi';
      } else if (username === 'furkan' || username === 'betul') {
        rolePkg = 'kreatif-direktor';
      }

      const empId = s.id === '2' ? 'emp-celal' : (s.id === '3' ? 'emp-ercan' : (s.id === '6' ? 'emp-furkan' : `emp-${username}`));
      const email = `${username}@socialart.internal`;

      const overrides = JSON.stringify({
        username: username,
        password: '123',
        'calendar.view': true,
        'calendar.manage': true
      });

      const sql = `
        INSERT INTO public.employees (
          id, full_name, email, title, role_package_id, team_ids, 
          permission_overrides, employee_status, work_location_status, 
          has_advanced_calendar_access, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 'active', 'office', true, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET 
          full_name = EXCLUDED.full_name, 
          email = EXCLUDED.email, 
          title = EXCLUDED.title, 
          permission_overrides = EXCLUDED.permission_overrides;
      `;

      await client.query(sql, [empId, s.display_name, email, s.role || 'Ekip Üyesi', rolePkg, ['merkezi-operasyon'], overrides]);
      console.log(`✅ Seeded employee: ${s.display_name} (Username: ${username}, ID: ${empId})`);
    }

    console.log('🎉 ALL EMPLOYEES SEEDED SUCCESSFULLY TO SUPABASE!');

  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await client.end();
  }
}

seed();
