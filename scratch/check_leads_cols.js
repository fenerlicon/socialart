
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkCols() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name_param: 'leads' });
  if (error) {
    // try fallback
    const { data: lead } = await supabase.from('leads').select('*').limit(1);
    console.log('Columns in leads:', lead ? Object.keys(lead[0]) : 'No data');
  } else {
    console.log(data);
  }
}
checkCols();
