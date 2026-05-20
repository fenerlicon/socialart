import pkg from 'pg';
const { Client } = pkg;

const password = 'bvwW+Qg7LS&u3V&';
const escapedPassword = encodeURIComponent(password);
const connectionStringEnv = `postgresql://postgres:${escapedPassword}@db.piffaggeshfrubyjkhej.supabase.co:5432/postgres`;

async function checkPolicyDefs() {
  const client = new Client({ connectionString: connectionStringEnv });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT p.polname, n.nspname as schemaname, c.relname as tablename, pg_get_policydef(p.oid) as def
      FROM pg_policy p
      JOIN pg_class c ON p.polrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE c.relname IN ('leads', 'lead_history');
    `);
    console.log('--- POLICY DEFINITIONS ---');
    res.rows.forEach(r => {
      console.log(`Policy: ${r.polname} on ${r.tablename}`);
      console.log(r.def);
      console.log('-------------------------');
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

checkPolicyDefs().catch(console.error);
