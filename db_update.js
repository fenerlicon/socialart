const SUPABASE_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2OTMzMSwiZXhwIjoyMDk0MzQ1MzMxfQ.DT3n6RNiwA_Tr_xt9iHRqWpDH718lFamct9tAXG8E2w';

const updates = [
  {
    slug: 'socialartblognedenurununuzusunucucekimiileanlatmalisiniz',
    cover: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop'
  },
  {
    slug: 'socialartblogrestoraninizisosyalmedyareklamveproduksiyonilebuyutun',
    cover: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop'
  },
  {
    slug: 'socialartblogmarkalarnedenugcureticileriilecalismali',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop'
  },
  {
    slug: 'socialartblogsosyalmedyayonetimindestratejikfaktorler',
    cover: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop'
  }
];

async function run() {
  for (const update of updates) {
    console.log(`Updating ${update.slug}...`);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/blogs?slug=eq.${update.slug}`, {
        method: 'PATCH',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ cover_image: update.cover })
      });
      if (res.ok) {
        console.log(`Successfully updated ${update.slug}`);
      } else {
        console.log(`Failed to update ${update.slug}: ${res.statusText}`);
        const text = await res.text();
        console.log(text);
      }
    } catch (e) {
      console.error(`Error updating ${update.slug}:`, e);
    }
  }
}

run();
