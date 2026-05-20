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
const supabaseKey = envConfig['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeSpecificReports() {
  const { data, error } = await supabase
    .from('staff_reports')
    .delete()
    .eq('staff_name', 'Furkan')
    .like('content', '%CRM hataları fixlendi%');

  if (error) {
    console.error('Error deleting report 1:', error);
  } else {
    console.log('Successfully deleted Furkan report 1.', data);
  }

  const { data: data2, error: error2 } = await supabase
    .from('staff_reports')
    .delete()
    .eq('staff_name', 'Furkan')
    .like('content', '%Socketta revizeleriyle birlikte teslim edildi%');

  if (error2) {
    console.error('Error deleting report 2:', error2);
  } else {
    console.log('Successfully deleted Furkan report 2.', data2);
  }
}

removeSpecificReports();
