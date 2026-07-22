import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addColumn() {
  try {
    // Try executing rpc or direct query to add updated_at column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();'
    });
    if (error) {
      console.log('RPC exec_sql error (expected if custom rpc not installed):', error.message);
    } else {
      console.log('Successfully added updated_at column via RPC!');
    }
  } catch (e) {
    console.error('Error:', e);
  }
}
addColumn();
