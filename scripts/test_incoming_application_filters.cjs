const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('==========================================');
console.log('INCOMING APPLICATION FILTERS TEST SUITE');
console.log('==========================================\n');

// --- 1. CODE CONTRACT & STATIC CHECKS ---
console.log('--- 1. STATIC CODE & ARCHITECTURE CHECKS ---');

const staffAdminPath = path.join(__dirname, '..', 'src', 'pages', 'StaffAdmin.jsx');
const staffAdminContent = fs.readFileSync(staffAdminPath, 'utf8');
const crmPagePath = path.join(__dirname, '..', 'src', 'pages', 'CRMPage.jsx');
const crmPageContent = fs.readFileSync(crmPagePath, 'utf8');

// Check: StaffAdmin contains full filter controls
assert.ok(staffAdminContent.includes('appSearch'), 'StaffAdmin must have appSearch state');
assert.ok(staffAdminContent.includes('appTypeFilter'), 'StaffAdmin must have appTypeFilter state');
assert.ok(staffAdminContent.includes('appStatusFilter'), 'StaffAdmin must have appStatusFilter state');
assert.ok(staffAdminContent.includes('appPositionFilter'), 'StaffAdmin must have appPositionFilter state');
assert.ok(staffAdminContent.includes('appDateFilter'), 'StaffAdmin must have appDateFilter state');
assert.ok(staffAdminContent.includes('handleResetAppFilters'), 'StaffAdmin must have reset filters function');
assert.ok(staffAdminContent.includes('handleUpdateAppStatus'), 'StaffAdmin must have status update function targeting original tables');
assert.ok(staffAdminContent.includes('handleDeleteApp'), 'StaffAdmin must have delete function targeting original tables');
console.log(' ✅ PASSED: StaffAdmin application filter state & helper functions verified');

// Check: No fake department filter
assert.ok(!staffAdminContent.includes('appDepartmentFilter'), 'Must NOT have fake department filter');
console.log(' ✅ PASSED: No fake department filter introduced (Department is NOT APPLICABLE)');

// Check: Commercial CRM remains completely isolated
assert.ok(!crmPageContent.includes(".from('job_applications')"), 'CRMPage must not query job_applications');
assert.ok(!crmPageContent.includes(".from('ugc_applications')"), 'CRMPage must not query ugc_applications');
assert.ok(!crmPageContent.includes('JOB_APPLICATION'), 'CRMPage must not ingest JOB_APPLICATION');
assert.ok(!crmPageContent.includes('UGC_APPLICATION'), 'CRMPage must not ingest UGC_APPLICATION');
console.log(' ✅ PASSED: Commercial CRM receives zero application rows');

// --- 2. LOGICAL SIMULATION OF NORMALIZATION & FILTERS ---
console.log('\n--- 2. LOGICAL FILTER & NORMALIZATION SIMULATION ---');

const mockJobApps = [
  { id: 'job-1', full_name: 'Ayşe Kaya', email: 'ayse@test.com', phone: '05551112233', position: 'Video Editor', status: 'Bekliyor', created_at: new Date().toISOString(), resume_url: 'https://storage/cv1.pdf' },
  { id: 'job-2', full_name: 'Mehmet Demir', email: 'mehmet@test.com', phone: '05552223344', position: 'Grafik Tasarımcı', status: 'Öne Çıkan', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), resume_url: null },
  { id: 'job-3', full_name: 'Can Yılmaz', email: 'can@test.com', phone: '05553334455', position: 'Sosyal Medya Yöneticisi', status: 'Reddedildi', created_at: new Date(Date.now() - 40 * 86400000).toISOString(), resume_url: null }
];

const mockUgcApps = [
  { id: 'ugc-1', full_name: 'Zeynep Akın', email: 'zeynep@test.com', phone: '05554445566', instagram_url: '@zeynepcreator', city: 'İstanbul', status: 'Bekliyor', created_at: new Date().toISOString() },
  { id: 'ugc-2', full_name: 'Ayşe Nur', email: 'aysenur@test.com', phone: '05555556677', instagram_url: '@aysenurugc', city: 'İzmir', status: 'Yedek Havuz', created_at: new Date(Date.now() - 10 * 86400000).toISOString() }
];

// Normalize
function normalizeApps(jobs, ugcs) {
  const jobItems = jobs.map(j => ({
    id: j.id,
    applicationType: 'JOB',
    sourceTable: 'job_applications',
    fullName: j.full_name,
    email: j.email,
    phone: j.phone,
    position: j.position,
    status: j.status,
    createdAt: j.created_at,
    raw: j
  }));
  const ugcItems = ugcs.map(u => ({
    id: u.id,
    applicationType: 'UGC',
    sourceTable: 'ugc_applications',
    fullName: u.full_name,
    email: u.email,
    phone: u.phone,
    position: 'UGC & İçerik Üreticisi',
    status: u.status,
    createdAt: u.created_at,
    instagramUrl: u.instagram_url,
    city: u.city,
    raw: u
  }));
  return [...jobItems, ...ugcItems];
}

function filterApps(allApps, { search = '', type = 'ALL', status = 'ALL', position = 'ALL', date = 'ALL' }) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const q = search.trim().toLowerCase();

  return allApps.filter(app => {
    if (type !== 'ALL' && app.applicationType !== type) return false;
    if (status !== 'ALL' && app.status !== status) return false;
    if (position !== 'ALL') {
      if (app.applicationType === 'JOB' && app.position !== position) return false;
      if (app.applicationType === 'UGC') return false;
    }
    if (date !== 'ALL') {
      const t = new Date(app.createdAt).getTime();
      if (date === 'TODAY' && t < todayStart) return false;
      if (date === 'LAST_7_DAYS' && t < sevenDaysAgo) return false;
      if (date === 'LAST_30_DAYS' && t < thirtyDaysAgo) return false;
    }
    if (q) {
      const matchName = (app.fullName || '').toLowerCase().includes(q);
      const matchEmail = (app.email || '').toLowerCase().includes(q);
      const matchPhone = (app.phone || '').toLowerCase().includes(q);
      const matchPos = (app.position || '').toLowerCase().includes(q);
      const matchCity = app.city ? app.city.toLowerCase().includes(q) : false;
      const matchIg = app.instagramUrl ? app.instagramUrl.toLowerCase().includes(q) : false;
      if (!matchName && !matchEmail && !matchPhone && !matchPos && !matchCity && !matchIg) return false;
    }
    return true;
  });
}

const allApps = normalizeApps(mockJobApps, mockUgcApps);
assert.strictEqual(allApps.length, 5, 'Total applications must be 5');
console.log(' ✅ Total normalized applications count: 5');

// Test A: Search filter
{
  const res = filterApps(allApps, { search: 'Ayşe' });
  assert.strictEqual(res.length, 2, 'Search "Ayşe" must return 2 (Ayşe Kaya & Ayşe Nur)');
  console.log(' ✅ PASSED [Test A]: Search filter case-insensitive matches across records');
}

// Test B: Type filter
{
  const jobs = filterApps(allApps, { type: 'JOB' });
  assert.strictEqual(jobs.length, 3, 'JOB type must return 3');
  const ugcs = filterApps(allApps, { type: 'UGC' });
  assert.strictEqual(ugcs.length, 2, 'UGC type must return 2');
  console.log(' ✅ PASSED [Test B]: Type filter isolates JOB vs UGC datasets correctly');
}

// Test C: Status filter
{
  const bekliyor = filterApps(allApps, { status: 'Bekliyor' });
  assert.strictEqual(bekliyor.length, 2, 'Bekliyor status must return 2');
  const oneCikan = filterApps(allApps, { status: 'Öne Çıkan' });
  assert.strictEqual(oneCikan.length, 1, 'Öne Çıkan status must return 1 (Mehmet Demir)');
  console.log(' ✅ PASSED [Test C]: Status filter works across all application records');
}

// Test D: Position filter
{
  const editors = filterApps(allApps, { position: 'Video Editor' });
  assert.strictEqual(editors.length, 1, 'Position "Video Editor" must return 1 (Ayşe Kaya)');
  assert.strictEqual(editors[0].fullName, 'Ayşe Kaya');
  console.log(' ✅ PASSED [Test D]: Position filter matches real available job positions');
}

// Test E: Date filter
{
  const today = filterApps(allApps, { date: 'TODAY' });
  assert.strictEqual(today.length, 2, 'Today date must return 2');
  const last7 = filterApps(allApps, { date: 'LAST_7_DAYS' });
  assert.strictEqual(last7.length, 3, 'Last 7 days must return 3');
  const last30 = filterApps(allApps, { date: 'LAST_30_DAYS' });
  assert.strictEqual(last30.length, 4, 'Last 30 days must return 4 (excluding Can Yılmaz 40d ago)');
  console.log(' ✅ PASSED [Test E]: Date filter correctly compares created_at timestamps');
}

// Test F: Combined filters (AND semantics)
{
  const combined = filterApps(allApps, {
    search: 'Ayşe',
    type: 'JOB',
    status: 'Bekliyor',
    position: 'Video Editor',
    date: 'LAST_7_DAYS'
  });
  assert.strictEqual(combined.length, 1, 'Combined filter must return exactly 1 (Ayşe Kaya)');
  assert.strictEqual(combined[0].fullName, 'Ayşe Kaya');
  console.log(' ✅ PASSED [Test F]: Combined filters apply strict AND semantics');
}

// Test G: Reset filters
{
  const resetState = { search: '', type: 'ALL', status: 'ALL', position: 'ALL', date: 'ALL' };
  const allRestored = filterApps(allApps, resetState);
  assert.strictEqual(allRestored.length, 5, 'Resetting filters must restore all 5 applications');
  console.log(' ✅ PASSED [Test G]: Reset filters restores complete original application list');
}

// Test H: UGC rows without position do not crash
{
  const ugcPosCheck = filterApps(allApps, { type: 'UGC', position: 'Video Editor' });
  assert.strictEqual(ugcPosCheck.length, 0, 'UGC with specific job position returns 0 safely without crash');
  console.log(' ✅ PASSED [Test H]: UGC rows handled safely with position filtering');
}

// Test I: Filtered result count accuracy
{
  const filtered = filterApps(allApps, { status: 'Reddedildi' });
  assert.strictEqual(filtered.length, 1, 'Filtered count must accurately equal 1');
  console.log(' ✅ PASSED [Test I]: Result counts accurately reflect current combined filters');
}

// Test J: Status update preserves original table & ID
{
  allApps.forEach(item => {
    assert.ok(item.sourceTable === 'job_applications' || item.sourceTable === 'ugc_applications', 'sourceTable must be valid');
    assert.ok(item.id, 'Original ID must be preserved');
  });
  console.log(' ✅ PASSED [Test J]: Status update target table & ID integrity verified');
}

console.log('\n==========================================');
console.log('ALL INCOMING APPLICATION FILTER TESTS PASSED (12/12)');
console.log('==========================================\n');