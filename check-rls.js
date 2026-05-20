import pkg from 'pg';
const { Client } = pkg;

const password = 'bvwW+Qg7LS&u3V&';
// Escape password characters for postgres connection string if necessary
const escapedPassword = encodeURIComponent(password);

// Project from .env is piffaggeshfrubyjkhej
const connectionStringEnv = `postgresql://postgres:${escapedPassword}@db.piffaggeshfrubyjkhej.supabase.co:5432/postgres`;
// Project from old script was zpulnweiosxphibipxdp
const connectionStringOld = `postgresql://postgres:${escapedPassword}@db.zpulnweiosxphibipxdp.supabase.co:5432/postgres`;

async function checkRLS(connStr, label) {
  console.log(`\n--- CHECKING POLICIES FOR: ${label} ---`);
  const client = new Client({ connectionString: connStr });
  try {
    await client.connect();
    const resPolicies = await client.query(`
      SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename IN ('leads', 'lead_history');
    `);
    console.log('Policies found:', resPolicies.rows.length);
    console.log(JSON.stringify(resPolicies.rows, null, 2));

    const resRLSStatus = await client.query(`
      SELECT relname, relrowsecurity, relforcerowsecurity 
      FROM pg_class 
      WHERE relname IN ('leads', 'lead_history');
    `);
    console.log('RLS Status (relrowsecurity: true/false):');
    console.log(resRLSStatus.rows);
  } catch (err) {
    console.error(`Error connecting or querying ${label}:`, err.message);
  } finally {
    try {
      await client.end();
    } catch (e) {
      console.error(e);
    }
  }
}

async function run() {
  await checkRLS(connectionStringEnv, 'DATABASE FROM .ENV (piffaggeshfrubyjkhej)');
  await checkRLS(connectionStringOld, 'DATABASE FROM OLD SCRIPTS (zpulnweiosxphibipxdp)');
}

run().catch(console.error);
