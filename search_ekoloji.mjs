import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://piffaggeshfrubyjkhej.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2OTMzMSwiZXhwIjoyMDk0MzQ1MzMxfQ.DT3n6RNiwA_Tr_xt9iHRqWpDH718lFamct9tAXG8E2w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function searchEmir() {
  const { data, error } = await supabase
    .from('leads')
    .select('*');

  if (error) {
    console.error("Error:", error);
    return;
  }

  const matches = data.filter(row => {
    const jsonStr = JSON.stringify(row).toLowerCase();
    return jsonStr.includes('emir') || jsonStr.includes('özyurt') || jsonStr.includes('ozyurt');
  });

  console.log("Found matches for Emir/Özyurt:", matches.length);
  matches.forEach(m => {
    console.log("MATCH:", JSON.stringify(m, null, 2));
  });
}

searchEmir();
