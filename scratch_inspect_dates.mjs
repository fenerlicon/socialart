import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('leads').select('id, name, updated_at, created_at, notes, reaction, status').limit(20);
  if (error) {
    console.error(error);
    return;
  }
  console.log('Total sample leads fetched:', data?.length);
  data.forEach(l => {
    console.log(`ID: ${l.id} | Name: ${l.name} | Updated: ${l.updated_at} | Created: ${l.created_at} | Status: ${l.status}`);
  });
}
check();
