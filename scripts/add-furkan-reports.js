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

async function addReports() {
  const reports = [
    {
      staff_name: 'Furkan',
      report_date: '2026-05-15',
      content: `Socketta revizeleriyle birlikte teslim edildi.\nMioCasa meta business reklam çalışması\nUGC & INF listesi hazırlandı\nSite hataları fixlendi\nADS hesabı kuruldu`
    },
    {
      staff_name: 'Furkan',
      report_date: '2026-05-16',
      content: `CRM hataları fixlendi\nUGC & INF listesi \nMioCasa reklam düzenlemesi\nEcuPro analiz`
    }
  ];

  const { data, error } = await supabase.from('staff_reports').insert(reports);
  if (error) {
    console.error('Error inserting reports:', error);
  } else {
    console.log('Successfully inserted reports for Furkan.');
  }
}

addReports();
