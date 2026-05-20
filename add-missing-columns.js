import pg from 'pg';
import { readFileSync } from 'fs';

// .env dosyasını manuel oku
const envContent = readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) env[key.trim()] = vals.join('=').trim();
});

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const DB_PASSWORD = env['SUPABASE_DB_PASSWORD'];

// Supabase proje referansını URL'den çıkar
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\./)?.[1];

const { Client } = pg;

const client = new Client({
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

const sqlCommands = [
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_note text`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_file text`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_file_name text`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS revision_note text`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS extension_note text`,
];

async function run() {
  try {
    console.log(`🔌 ${projectRef} projesine bağlanılıyor...`);
    await client.connect();
    console.log('✅ Bağlantı başarılı!\n');
    
    for (const sql of sqlCommands) {
      const colName = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1];
      process.stdout.write(`⏳ ${colName} ekleniyor... `);
      try {
        await client.query(sql);
        console.log('✅');
      } catch (err) {
        console.log(`❌ Hata: ${err.message}`);
      }
    }
    
    // Doğrulama
    console.log('\n🔍 Doğrulama yapılıyor...');
    const { rows } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tasks' 
      ORDER BY ordinal_position
    `);
    console.log('\n📋 tasks tablosu kolonları:');
    rows.forEach(r => console.log(`  - ${r.column_name} (${r.data_type})`));
    
  } catch (err) {
    console.error('❌ Bağlantı hatası:', err.message);
  } finally {
    await client.end();
    console.log('\n🔌 Bağlantı kapatıldı.');
  }
}

run();
