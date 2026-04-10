import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found at', envPath);
  process.exit(1);
}
const envFile = fs.readFileSync(envPath, 'utf8');

const envConfig = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envConfig[match[1]] = match[2].trim();
  }
});

const DB_PASSWORD = envConfig['SUPABASE_DB_PASSWORD'];
const SUPABASE_PROJECT_ID = envConfig['VITE_SUPABASE_URL']?.split('//')[1]?.split('.')[0];

if (!DB_PASSWORD || !SUPABASE_PROJECT_ID) {
  console.error('Missing DB credentials in .env');
  process.exit(1);
}

const connectionString = `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres`;

const client = new Client({
  connectionString,
});

const clients = [
  {
    name: 'Mall Of Gurme',
    package: '3 Story, 8 Reels, 8 Gönderi',
    pending: ['Bu ayın planı hazırlanacak', 'Reklamlar: 1 Reklam Aktif'],
    active: [],
    completed: []
  },
  {
    name: 'Gurme Bahçeşehir',
    package: '3 Story, 8 Reels, 8 Gönderi',
    pending: ['Mall of Gurme ile aynı paket', 'Reklamlar: Yok'],
    active: [],
    completed: []
  },
  {
    name: 'Döner Evim Pendik',
    package: '2 Story, 8 Reels, 4 Gönderi',
    pending: [],
    active: [],
    completed: []
  },
  {
    name: 'Karadeniz Et Lokantası',
    package: '1 Reels, 1 Gönderi',
    pending: ['Reklamlar: Yok'],
    active: [],
    completed: []
  },
  {
    name: 'Socketta',
    package: '8 Reels, 4 Gönderi',
    pending: ['Reklamlar: Yok'],
    active: [],
    completed: []
  },
  {
    name: 'VIP Catring',
    package: '1 Reels, 1 Gönderi',
    pending: ['Reklamlar: Yok'],
    active: [],
    completed: []
  }
];

async function addClients() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    for (const data of clients) {
      const sql = `
        INSERT INTO public.active_clients (name, package, pending, active, completed, progress)
        VALUES ($1, $2, $3, $4, $5, 0)
        RETURNING id;
      `;
      const res = await client.query(sql, [data.name, data.package, data.pending, data.active, data.completed]);
      console.log(`Successfully added client: ${data.name} (ID: ${res.rows[0].id})`);
    }

    console.log('All clients added successfully!');

  } catch (err) {
    console.error('Error adding clients:', err);
  } finally {
    await client.end();
  }
}

addClients();
