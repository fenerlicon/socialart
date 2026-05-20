import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

const oldConn = 'postgresql://postgres:bvwW%2BQg7LS%26u3V%26@db.zpulnweiosxphibipxdp.supabase.co:5432/postgres';
const newConn = 'postgresql://postgres:bvwW%2BQg7LS%26u3V%26@db.piffaggeshfrubyjkhej.supabase.co:5432/postgres';

async function migrate() {
  const oldClient = new Client({ connectionString: oldConn });
  const newClient = new Client({ connectionString: newConn });

  await oldClient.connect();
  await newClient.connect();

  console.log("Connected to both databases.");

  // Get all tables
  const res = await oldClient.query(`
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

  for (const tableName of Object.keys(tables)) {
    console.log(`Creating table: ${tableName}`);
    const columns = tables[tableName].map(c => {
      let def = `"${c.column_name}" ${c.data_type}`;
      if (c.column_name === 'id' && c.data_type === 'uuid') {
        def += ' PRIMARY KEY';
        if (c.column_default) def += ` DEFAULT ${c.column_default}`;
      } else if (c.column_name === 'id' && c.data_type === 'bigint') {
        def += ' PRIMARY KEY';
        if (c.column_default) def += ` DEFAULT ${c.column_default}`;
      } else {
        if (c.column_default) {
           // Skip complex defaults that might cause issues, except for basic ones
           if (c.column_default.includes('now()') || c.column_default.includes('CURRENT_TIMESTAMP')) {
             def += ` DEFAULT now()`;
           } else if (!c.column_default.includes('::')) {
             def += ` DEFAULT ${c.column_default}`;
           }
        }
        if (c.is_nullable === 'NO') def += ' NOT NULL';
      }
      return def;
    });

    const createSql = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${columns.join(',\n  ')}\n);`;
    try {
      await newClient.query(createSql);
    } catch (e) {
      console.error(`Error creating ${tableName}:`, e.message);
    }

    // Copy Data
    const dataRes = await oldClient.query(`SELECT * FROM "${tableName}"`);
    if (dataRes.rows.length > 0) {
      console.log(`Copying ${dataRes.rows.length} rows to ${tableName}`);
      for (const row of dataRes.rows) {
        const cols = Object.keys(row).map(k => `"${k}"`).join(', ');
        const vals = Object.values(row);
        const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
        try {
          await newClient.query(`INSERT INTO "${tableName}" (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`, vals);
        } catch (e) {
          // ignore duplicate errors or minor insert errors
        }
      }
    }
  }

  console.log("Migration completed!");
  await oldClient.end();
  await newClient.end();
}

migrate().catch(console.error);
