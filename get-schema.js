import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:bvwW%2BQg7LS%26u3V%26@db.zpulnweiosxphibipxdp.supabase.co:5432/postgres';
const client = new Client({ connectionString });

async function getSchema() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name, column_name, data_type, column_default, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    ORDER BY table_name, ordinal_position;
  `);
  
  const tables = {};
  res.rows.forEach(r => {
    if(!tables[r.table_name]) tables[r.table_name] = [];
    tables[r.table_name].push(r);
  });
  console.log(JSON.stringify(tables, null, 2));
  await client.end();
}
getSchema();
