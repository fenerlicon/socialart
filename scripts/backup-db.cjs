const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DEFAULT_SUPABASE_URL = 'https://osuwytugjscwhcxxkhfa.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const LEADS_SUPABASE_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const LEADS_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjkzMzEsImV4cCI6MjA5NDM0NTMzMX0.Bp4A-VwFMuOgpIqL_yud-i85uwnjxNZ4hXMNxNKu1HA';

const mainDb = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
const leadsDb = createClient(LEADS_SUPABASE_URL, LEADS_SUPABASE_ANON_KEY);

async function runBackup() {
  console.log('🚀 Socialart Veritabanı Yedekleme İşlemi Başlatılıyor...');
  
  const backupDir = path.join(__dirname, '..', 'backups');
  const historyDir = path.join(backupDir, 'history');
  
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  if (!fs.existsSync(historyDir)) fs.mkdirSync(historyDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const summary = { timestamp: new Date().toISOString(), tables: {} };

  // 1. Fetch 189 Real Leads from leadsDb
  try {
    const { data: leads, error } = await leadsDb.from('leads').select('*').order('created_at', { ascending: false });
    if (!error && leads) {
      summary.tables.leads = leads.length;
      fs.writeFileSync(path.join(backupDir, 'leads_backup_latest.json'), JSON.stringify(leads, null, 2), 'utf8');
      fs.writeFileSync(path.join(historyDir, `leads_backup_${timestamp}.json`), JSON.stringify(leads, null, 2), 'utf8');

      // Also export leads to CSV for easy Excel view
      const csvRows = [
        ['ID', 'Adı / Firma', 'Telefon', 'E-Posta', 'Hizmet', 'Durum', 'Aşama', 'Platform', 'Oluşturulma Tarihi'].join(';')
      ];
      leads.forEach(l => {
        csvRows.push([
          l.id || '',
          `"${(l.name || l.title || '').replace(/"/g, '""')}"`,
          `"${(l.phone || '').replace(/"/g, '""')}"`,
          `"${(l.email || '').replace(/"/g, '""')}"`,
          `"${(l.service || '').replace(/"/g, '""')}"`,
          `"${(l.status || '').replace(/"/g, '""')}"`,
          `"${(l.stage || '').replace(/"/g, '""')}"`,
          `"${(l.platform || l.source || '').replace(/"/g, '""')}"`,
          `"${(l.created_at || '').replace(/"/g, '""')}"`
        ].join(';'));
      });
      fs.writeFileSync(path.join(backupDir, 'leads_backup_latest.csv'), '\uFEFF' + csvRows.join('\n'), 'utf8');
      console.log(`✅ [1/5] ${leads.length} Adet Potansiyel Müşteri (Leads) Yedeklendi.`);
    }
  } catch (e) {
    console.error('⚠️ Leads backup error:', e.message);
  }

  // 2. Fetch Active Brands
  try {
    const { data: brands } = await mainDb.from('brands').select('*');
    if (brands) {
      summary.tables.brands = brands.length;
      fs.writeFileSync(path.join(backupDir, 'brands_backup_latest.json'), JSON.stringify(brands, null, 2), 'utf8');
      console.log(`✅ [2/5] ${brands.length} Adet Ajans Markası (Brands) Yedeklendi.`);
    }
  } catch (e) {}

  // 3. Fetch Active Clients
  try {
    const { data: clients } = await mainDb.from('active_clients').select('*');
    if (clients) {
      summary.tables.active_clients = clients.length;
      fs.writeFileSync(path.join(backupDir, 'active_clients_backup_latest.json'), JSON.stringify(clients, null, 2), 'utf8');
      console.log(`✅ [3/5] ${clients.length} Adet Aktif Müşteri Kaydı (Active Clients) Yedeklendi.`);
    }
  } catch (e) {}

  // 4. Fetch Support Messages
  try {
    const { data: supportMsgs } = await mainDb.from('client_support_messages').select('*');
    if (supportMsgs) {
      summary.tables.client_support_messages = supportMsgs.length;
      fs.writeFileSync(path.join(backupDir, 'support_messages_backup_latest.json'), JSON.stringify(supportMsgs, null, 2), 'utf8');
      console.log(`✅ [4/5] ${supportMsgs.length} Adet Müşteri Destek Mesajı Yedeklendi.`);
    }
  } catch (e) {}

  // 5. Fetch Payment Requests / Notifications
  try {
    const { data: notifs } = await mainDb.from('notifications').select('*');
    if (notifs) {
      summary.tables.notifications = notifs.length;
      fs.writeFileSync(path.join(backupDir, 'notifications_backup_latest.json'), JSON.stringify(notifs, null, 2), 'utf8');
      console.log(`✅ [5/5] ${notifs.length} Adet Bildirim ve Ödeme Kaydı Yedeklendi.`);
    }
  } catch (e) {}

  fs.writeFileSync(path.join(backupDir, 'backup_summary_latest.json'), JSON.stringify(summary, null, 2), 'utf8');

  console.log('\n🎉 YEDEKLEME TAMAMLANDI!');
  console.log(`📁 Yedek Dosyaları Konumu: ${backupDir}`);
  console.log(`📊 Excel CSV Dosyası: ${path.join(backupDir, 'leads_backup_latest.csv')}\n`);
}

runBackup();
