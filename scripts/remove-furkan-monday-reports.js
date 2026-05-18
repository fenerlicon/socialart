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

const supabaseUrl = envConfig['VITE_SUPABASE_URL'];
const supabaseKey = envConfig['SUPABASE_SERVICE_ROLE_KEY'] || envConfig['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeMondayReports() {
  const { data, error } = await supabase
    .from('staff_reports')
    .delete()
    .eq('staff_name', 'Furkan')
    .eq('report_date', '2026-05-18');

  if (error) {
    console.error('Error deleting reports:', error);
  } else {
    console.log('Successfully deleted Furkan\'s Monday (2026-05-18) reports. Removed rows:', data);
  }
}

removeMondayReports();
