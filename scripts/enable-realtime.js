import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.resolve(__dirname, '../.env');
const envFile = fs.readFileSync(envPath, 'utf8');

const envConfig = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envConfig[match[1]] = match[2].trim();
  }
});

const DB_PASSWORD = envConfig['SUPABASE_DB_PASSWORD'];
const VITE_SUPABASE_URL = envConfig['VITE_SUPABASE_URL'];
const SUPABASE_PROJECT_ID = VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0];

const connectionString = `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres`;
const client = new Client({ connectionString });

async function enableRealtime() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const sql = `
      DO $$
      BEGIN
        -- First ensure the publication exists (Supabase usually has it)
        IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
          CREATE PUBLICATION supabase_realtime;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'activity_log'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'tasks'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'client_support_messages'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE public.client_support_messages;
        END IF;
      END $$;
    `;

    await client.query(sql);
    console.log('Realtime logic executed successfully!');
  } catch (err) {
    console.error('Error enabling realtime:', err);
  } finally {
    await client.end();
  }
}

enableRealtime();
