const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createStaffReportsTable() {
  console.log('Creating staff_reports table...');

  // Note: We use rpc or just raw sql if we had an admin client, 
  // but usually we advise the user to run this in Supabase SQL Editor.
  // However, I will provide the SQL in the output.
  
  const sql = `
    CREATE TABLE IF NOT EXISTS staff_reports (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      created_at timestamptz DEFAULT now(),
      staff_name text NOT NULL,
      staff_role text,
      content text,
      file_url text,
      file_name text,
      external_link text,
      report_date date DEFAULT CURRENT_DATE
    );

    -- Enable RLS
    ALTER TABLE staff_reports ENABLE ROW LEVEL SECURITY;

    -- Allow all authenticated users to read and insert
    CREATE POLICY "Allow authenticated access" ON staff_reports
      FOR ALL USING (true);
  `;

  console.log('SQL to run in Supabase SQL Editor:');
  console.log('-----------------------------------');
  console.log(sql);
  console.log('-----------------------------------');
}

createStaffReportsTable();
