import pkg from 'pg';
const { Client } = pkg;

const password = 'bvwW+Qg7LS&u3V&';
const escapedPassword = encodeURIComponent(password);

const databases = [
  { name: 'Primary DB (osuwytugjscwhcxxkhfa)', url: `postgresql://postgres:${escapedPassword}@db.osuwytugjscwhcxxkhfa.supabase.co:5432/postgres` },
  { name: 'Leads DB (piffaggeshfrubyjkhej)', url: `postgresql://postgres:${escapedPassword}@db.piffaggeshfrubyjkhej.supabase.co:5432/postgres` }
];

async function hardenSchemas() {
  for (const db of databases) {
    console.log(`\nHardening ${db.name}...`);
    const client = new Client({ connectionString: db.url });
    try {
      await client.connect();

      // 1. notifications table defaults
      try {
        await client.query(`
          ALTER TABLE public.notifications 
            ALTER COLUMN created_at SET DEFAULT NOW(),
            ALTER COLUMN is_read SET DEFAULT FALSE;
        `);
        console.log(`notifications defaults set in ${db.name}`);
      } catch (e) {
        console.warn(`notifications in ${db.name}:`, e.message);
      }

      // 2. payment_requests table defaults
      try {
        await client.query(`
          ALTER TABLE public.payment_requests 
            ALTER COLUMN created_at SET DEFAULT NOW(),
            ALTER COLUMN updated_at SET DEFAULT NOW(),
            ALTER COLUMN status SET DEFAULT 'pending',
            ALTER COLUMN kdv_amount SET DEFAULT 0,
            ALTER COLUMN total_amount SET DEFAULT 0;
        `);
        console.log(`payment_requests defaults set in ${db.name}`);
      } catch (e) {
        console.warn(`payment_requests in ${db.name}:`, e.message);
      }

      // 3. personal_todos table defaults
      try {
        await client.query(`
          ALTER TABLE public.personal_todos 
            ALTER COLUMN created_at SET DEFAULT NOW(),
            ALTER COLUMN is_completed SET DEFAULT FALSE,
            ALTER COLUMN priority SET DEFAULT 'medium',
            ALTER COLUMN category SET DEFAULT 'general';
        `);
        console.log(`personal_todos defaults set in ${db.name}`);
      } catch (e) {
        console.warn(`personal_todos in ${db.name}:`, e.message);
      }

      // 4. calendar_events table defaults
      try {
        await client.query(`
          ALTER TABLE public.calendar_events 
            ALTER COLUMN status SET DEFAULT 'pending';
        `);
        console.log(`calendar_events defaults set in ${db.name}`);
      } catch (e) {
        console.warn(`calendar_events in ${db.name}:`, e.message);
      }

      // 5. leads table defaults in Leads DB
      try {
        await client.query(`
          ALTER TABLE public.leads 
            ALTER COLUMN created_at SET DEFAULT NOW(),
            ALTER COLUMN updated_at SET DEFAULT NOW(),
            ALTER COLUMN status SET DEFAULT 'Sıcak',
            ALTER COLUMN stage SET DEFAULT 'NEW',
            ALTER COLUMN budget SET DEFAULT 0;
        `);
        console.log(`leads defaults set in ${db.name}`);
      } catch (e) {
        console.warn(`leads in ${db.name}:`, e.message);
      }

      // 6. job_applications & ugc_applications defaults
      try {
        await client.query(`
          ALTER TABLE public.job_applications 
            ALTER COLUMN created_at SET DEFAULT NOW(),
            ALTER COLUMN updated_at SET DEFAULT NOW(),
            ALTER COLUMN status SET DEFAULT 'pending';

          ALTER TABLE public.ugc_applications 
            ALTER COLUMN created_at SET DEFAULT NOW(),
            ALTER COLUMN updated_at SET DEFAULT NOW(),
            ALTER COLUMN status SET DEFAULT 'pending';
        `);
        console.log(`application tables defaults set in ${db.name}`);
      } catch (e) {
        console.warn(`application tables in ${db.name}:`, e.message);
      }

      await client.end();
    } catch (err) {
      console.error(`Error in ${db.name}:`, err.message);
      try { await client.end(); } catch (_) {}
    }
  }
}

hardenSchemas();
