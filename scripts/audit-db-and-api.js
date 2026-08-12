import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

const password = 'bvwW+Qg7LS&u3V&';
const escapedPassword = encodeURIComponent(password);

const databases = [
  { name: 'Primary DB (osuwytugjscwhcxxkhfa)', url: `postgresql://postgres:${escapedPassword}@db.osuwytugjscwhcxxkhfa.supabase.co:5432/postgres` },
  { name: 'Leads DB (piffaggeshfrubyjkhej)', url: `postgresql://postgres:${escapedPassword}@db.piffaggeshfrubyjkhej.supabase.co:5432/postgres` }
];

async function audit() {
  const dbSchemas = {};

  for (const db of databases) {
    console.log(`\n========================================`);
    console.log(`Auditing ${db.name}...`);
    console.log(`========================================`);
    const client = new Client({ connectionString: db.url });
    try {
      await client.connect();
      dbSchemas[db.name] = {};

      const tablesRes = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema='public' 
        ORDER BY table_name;
      `);

      for (const t of tablesRes.rows) {
        const tableName = t.table_name;
        const colsRes = await client.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_schema='public' AND table_name = $1 
          ORDER BY ordinal_position;
        `, [tableName]);

        const rlsRes = await client.query(`
          SELECT polname, polcmd, polroles::regrole[] 
          FROM pg_policy p 
          JOIN pg_class c ON p.polrelid = c.oid 
          WHERE c.relname = $1;
        `, [tableName]);

        dbSchemas[db.name][tableName] = {
          columns: colsRes.rows.map(c => c.column_name),
          columnDetails: colsRes.rows,
          policies: rlsRes.rows
        };

        console.log(`\n📦 Table: "${tableName}"`);
        console.log(`   Columns (${colsRes.rows.length}):`, colsRes.rows.map(c => c.column_name).join(', '));
        console.log(`   Policies (${rlsRes.rows.length}):`, rlsRes.rows.map(p => `${p.polname} (${p.polcmd})`).join(', ') || 'No policies / Open');
      }

      await client.end();
    } catch (err) {
      console.error(`Error auditing ${db.name}:`, err.message);
      try { await client.end(); } catch (_) {}
    }
  }

  return dbSchemas;
}

audit();
