import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:bvwW%2BQg7LS%26u3V%26@db.osuwytugjscwhcxxkhfa.supabase.co:5432/postgres';
const client = new Client({ connectionString });

async function fix() {
  try {
    await client.connect();
    console.log('Connected to OSU database!');

    await client.query('GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;');
    console.log('✅ Granted SELECT on all public tables in OSU!');

    const tables = [
      'brands',
      'workflow_instances',
      'workflow_step_instances',
      'kpi_cards',
      'notifications',
      'employees',
      'reports',
      'calendar_events',
      'personal_todos',
      'ideas'
    ];

    for (const t of tables) {
      await client.query(`
        DROP POLICY IF EXISTS "allow_anon_select_${t}" ON public.${t};
        CREATE POLICY "allow_anon_select_${t}" ON public.${t} FOR SELECT TO public USING (true);
      `);
      console.log(`✅ Created allow_anon_select_${t} policy`);
    }

    console.log('🎉 ALL RLS POLICIES CREATED ON OSU DATABASE!');

  } catch (err) {
    console.error('Error during OSU RLS fix:', err);
  } finally {
    await client.end();
  }
}

fix();
