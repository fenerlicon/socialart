const { createClient } = require('@supabase/supabase-js');

// DB1 Target (Primary Database: piffaggeshfrubyjkhej)
const DB1_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const DB1_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjkzMzEsImV4cCI6MjA5NDM0NTMzMX0.Bp4A-VwFMuOgpIqL_yud-i85uwnjxNZ4hXMNxNKu1HA';

// DB2 Source (Secondary Database: osuwytugjscwhcxxkhfa - UNTOUCHED BACKUP)
const DB2_URL = 'https://osuwytugjscwhcxxkhfa.supabase.co';
const DB2_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const db1 = createClient(DB1_URL, DB1_KEY);
const db2 = createClient(DB2_URL, DB2_KEY);

async function migrate() {
  console.log("🚀 VERİTABANI BİRLEŞTİRME SÜRECİ BAŞLADI...");
  console.log("📌 NOT: DB2 (osuwytug...) YEDEK OLARAK %100 DOKUNULMADAN KORUNACAK!\n");

  // 1. Migrate personal_todos (43 items)
  console.log("📦 1. 'personal_todos' taşınıyor...");
  const { data: todosDb2 } = await db2.from('personal_todos').select('*');
  if (todosDb2 && todosDb2.length > 0) {
    const { error: err1 } = await db1.from('personal_todos').upsert(todosDb2, { onConflict: 'id' });
    if (err1) {
      console.log("⚠️ personal_todos tablosu DB1'de henüz oluşmamış olabilir. SQL ile oluşturacağız.");
    } else {
      console.log(`✅ personal_todos: ${todosDb2.length} kayıt DB1'e aktarıldı.`);
    }
  }

  // 2. Migrate calendar_events (8 items)
  console.log("📦 2. 'calendar_events' taşınıyor...");
  const { data: calDb2 } = await db2.from('calendar_events').select('*');
  if (calDb2 && calDb2.length > 0) {
    const { error: err2 } = await db1.from('calendar_events').upsert(calDb2, { onConflict: 'id' });
    if (err2) console.log("⚠️ calendar_events uyarısı:", err2.message);
    else console.log(`✅ calendar_events: ${calDb2.length} kayıt DB1'e aktarıldı.`);
  }

  // 3. Migrate notifications (140 items)
  console.log("📦 3. 'notifications' taşınıyor...");
  const { data: notifsDb2 } = await db2.from('notifications').select('*');
  if (notifsDb2 && notifsDb2.length > 0) {
    // Chunk in batches of 50
    for (let i = 0; i < notifsDb2.length; i += 50) {
      const chunk = notifsDb2.slice(i, i + 50);
      const { error: err3 } = await db1.from('notifications').upsert(chunk, { onConflict: 'id' });
      if (err3) console.log("⚠️ notifications uyarısı:", err3.message);
    }
    console.log(`✅ notifications: ${notifsDb2.length} kayıt DB1'e aktarıldı.`);
  }

  // 4. Migrate workflow_step_instances (870 items)
  console.log("📦 4. 'workflow_step_instances' taşınıyor (870 kayıt)...");
  const { data: stepsDb2 } = await db2.from('workflow_step_instances').select('*');
  if (stepsDb2 && stepsDb2.length > 0) {
    for (let i = 0; i < stepsDb2.length; i += 50) {
      const chunk = stepsDb2.slice(i, i + 50);
      const { error: err4 } = await db1.from('workflow_step_instances').upsert(chunk, { onConflict: 'id' });
      if (err4) console.log(`⚠️ workflow_step_instances batch ${i} uyarısı:`, err4.message);
    }
    console.log(`✅ workflow_step_instances: ${stepsDb2.length} kayıt DB1'e aktarıldı.`);
  }

  // 5. Sync job_applications (15 items) and ugc_applications (1 item)
  console.log("📦 5. 'job_applications' & 'ugc_applications' senkronize ediliyor...");
  const { data: jobsDb2 } = await db2.from('job_applications').select('*');
  if (jobsDb2 && jobsDb2.length > 0) {
    await db1.from('job_applications').upsert(jobsDb2, { onConflict: 'id' });
    console.log(`✅ job_applications senkronize edildi (${jobsDb2.length} kayıt).`);
  }

  const { data: ugcDb2 } = await db2.from('ugc_applications').select('*');
  if (ugcDb2 && ugcDb2.length > 0) {
    await db1.from('ugc_applications').upsert(ugcDb2, { onConflict: 'id' });
    console.log(`✅ ugc_applications senkronize edildi (${ugcDb2.length} kayıt).`);
  }

  console.log("\n🎉 TAŞIMA VE SENKRONİZASYON BAŞARIYLA TAMAMLANDI!");
}

migrate();
