import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import dotenv from 'dotenv';
dotenv.config();

const oldDbPass = encodeURIComponent(process.env.LEGACY_SUPABASE_DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD || '');
const oldConn = `postgresql://postgres:${oldDbPass}@db.zpulnweiosxphibipxdp.supabase.co:5432/postgres`;

async function generateSql() {
  const oldClient = new Client({ connectionString: oldConn });
  await oldClient.connect();

  let sqlOutput = '-- MIGRATION SCRIPT\n\n';

  const res = await oldClient.query(`
    SELECT table_name, column_name, data_type, udt_name, column_default, is_nullable 
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
    const columns = tables[tableName].map(c => {
      let type = c.data_type;
      if (type === 'ARRAY' || type === 'USER-DEFINED') {
        type = 'jsonb';
      }
      
      let def = `"${c.column_name}" ${type}`;
      if (c.column_name === 'id' && c.data_type === 'uuid') {
        def += ' PRIMARY KEY';
        if (c.column_default) def += ` DEFAULT ${c.column_default}`;
      } else if (c.column_name === 'id' && type === 'bigint') {
        def += ' PRIMARY KEY';
        if (c.column_default) def += ` DEFAULT ${c.column_default}`;
      } else {
        if (c.column_default) {
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

    sqlOutput += `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${columns.join(',\n  ')}\n);\n\n`;

    const dataRes = await oldClient.query(`SELECT * FROM "${tableName}"`);
    if (dataRes.rows.length > 0) {
      for (const row of dataRes.rows) {
        const cols = Object.keys(row).map(k => `"${k}"`).join(', ');
        const vals = Object.values(row).map(v => {
          if (v === null) return 'NULL';
          if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
          if (v instanceof Date) return `'${v.toISOString()}'`;
          if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
          return v;
        }).join(', ');
        sqlOutput += `INSERT INTO "${tableName}" (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING;\n`;
      }
    }
    sqlOutput += '\n';
  }

  fs.writeFileSync('migration.sql', sqlOutput);
  console.log('migration.sql generated successfully.');
  await oldClient.end();
}

generateSql().catch(console.error);
