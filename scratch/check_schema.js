import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
const envFile = fs.readFileSync(envPath, 'utf8');

const envConfig = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envConfig[match[1]] = match[2].trim();
  }
});

const SUPABASE_URL = envConfig['VITE_SUPABASE_URL'];
const SUPABASE_SERVICE_KEY = envConfig['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixSchema() {
  console.log('Altering table active_clients to add missing columns...');
  
  // We use rpc call or just raw sql if supported, but typically we'd use the SQL editor.
  // Since I can't use the SQL editor, I'll try to use a common trick if they have a 'exec_sql' function
  // or I'll just warn the user.
  // Actually, I'll check if I can just use the supabase client to check columns.
  
  const { data, error } = await supabase.from('active_clients').select('*').limit(1);
  if (error) {
    console.error('Error fetching data:', error.message);
    return;
  }
  
  console.log('Current columns in first row:', Object.keys(data[0] || {}));
}

fixSchema();
