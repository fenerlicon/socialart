import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://piffaggeshfrubyjkhej.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2OTMzMSwiZXhwIjoyMDk0MzQ1MzMxfQ.DT3n6RNiwA_Tr_xt9iHRqWpDH718lFamct9tAXG8E2w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNotes() {
  const { data, error } = await supabase.from('leads').select('id, name, reaction');
  if (error) {
    console.error(error);
    return;
  }

  let withNotes = 0;
  data.forEach(m => {
    if (m.reaction && m.reaction.trim().length > 0) {
      withNotes++;
    }
  });

  console.log(`TOTAL LEADS: ${data.length}`);
  console.log(`LEADS WITH DETAILED REACTION/NOTES: ${withNotes}`);

  console.log("\n--- SAMPLE RECENT NOTES IN DB ---");
  data.filter(m => m.reaction && m.reaction.length > 15).slice(0, 10).forEach(m => {
    console.log(`[${m.name}] -> NOT: "${m.reaction}"`);
  });
}

checkNotes();
