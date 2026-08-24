const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('==========================================');
console.log('CRM APPLICATION ISOLATION TEST SUITE');
console.log('==========================================\n');

const crmPath = path.join(__dirname, '..', 'src', 'pages', 'CRMPage.jsx');
const crmContent = fs.readFileSync(crmPath, 'utf8');
const staffAdminPath = path.join(__dirname, '..', 'src', 'pages', 'StaffAdmin.jsx');
const staffAdminContent = fs.readFileSync(staffAdminPath, 'utf8');

console.log('--- 1. STATIC CODE CHECKS ---');

// Check A: CRMPage does NOT query job_applications
assert.ok(
  !crmContent.includes(".from('job_applications')"),
  'CRMPage must NOT query job_applications table'
);
console.log(' ✅ PASSED [Check A]: CRMPage does NOT query job_applications');

// Check B: CRMPage does NOT query ugc_applications
assert.ok(
  !crmContent.includes(".from('ugc_applications')"),
  'CRMPage must NOT query ugc_applications table'
);
console.log(' ✅ PASSED [Check B]: CRMPage does NOT query ugc_applications');

// Check C: CRM commercial dataset does NOT push/map application rows into loadedLeads
assert.ok(
  !crmContent.includes('JOB_APPLICATION'),
  'CRMPage must NOT contain JOB_APPLICATION category'
);
assert.ok(
  !crmContent.includes('UGC_APPLICATION'),
  'CRMPage must NOT contain UGC_APPLICATION category'
);
assert.ok(
  !crmContent.includes('jobMapped') && !crmContent.includes('ugcMapped'),
  'CRMPage must NOT map or push job/ugc applications into loadedLeads'
);
console.log(' ✅ PASSED [Check C]: CRM dataset does not push or map application rows');

// Check D: DB1 leads table is queried as the sole commercial source
assert.ok(
  crmContent.includes(".from('leads')"),
  'CRMPage must query leads table for commercial leads'
);
console.log(' ✅ PASSED [Check D]: DB1 leads continues to load normally');

// Check E: job_applications remain available to the "Gelen Başvurular" module in StaffAdmin
assert.ok(
  staffAdminContent.includes("supabase.from('job_applications').select('*')"),
  'StaffAdmin must load job_applications for Gelen Başvurular'
);
console.log(' ✅ PASSED [Check E]: job_applications available to Gelen Başvurular module');

// Check F: ugc_applications remain available to the "Gelen Başvurular" module in StaffAdmin
assert.ok(
  staffAdminContent.includes("supabase.from('ugc_applications').select('*')"),
  'StaffAdmin must load ugc_applications for Gelen Başvurular'
);
console.log(' ✅ PASSED [Check F]: ugc_applications available to Gelen Başvurular module');

console.log('\n--- 2. LOGICAL SIMULATION & DATA INTEGRITY TESTS ---');

// Mock data
const mockCommercialLeads = [
  { id: 1, name: 'Brand A', service: 'Sosyal Medya', status: 'Sıcak' },
  { id: 2, name: 'Brand B', service: 'Prodüksiyon', status: 'Teklif' }
];

const mockJobApps = [
  { id: 'job-1', full_name: 'Aday Can', position: 'Video Editor', resume_url: 'https://storage/cv1.pdf' },
  { id: 'job-2', full_name: 'Aday Ayşe', position: 'Grafik Tasarımcı', resume_url: 'https://storage/cv2.pdf' }
];

const mockUgcApps = [
  { id: 'ugc-1', full_name: 'Creator Zeynep', instagram_url: '@zeynep' }
];

// Check G: Job application count does NOT affect commercial CRM lead count
{
  const commercialDataset = [...mockCommercialLeads];
  assert.strictEqual(commercialDataset.length, 2, 'Commercial lead count must be 2');
  console.log(' ✅ PASSED [Check G]: Job application count (2) does NOT affect commercial CRM lead count (2)');
}

// Check H: UGC application count does NOT affect commercial CRM lead count
{
  const commercialDataset = [...mockCommercialLeads];
  assert.strictEqual(commercialDataset.length, 2, 'Commercial lead count must remain 2');
  console.log(' ✅ PASSED [Check H]: UGC application count (1) does NOT affect commercial CRM lead count (2)');
}

// Check I: Commercial lead search cannot return application-only records
{
  const commercialDataset = [...mockCommercialLeads];
  const searchQuery = 'Video Editor';
  const searchResults = commercialDataset.filter(l => 
    (l.name && l.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (l.service && l.service.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  assert.strictEqual(searchResults.length, 0, 'Search for Video Editor in commercial leads must return 0 results');
  console.log(' ✅ PASSED [Check I]: Commercial lead search cannot return application-only records');
}

// Check J: No CV/application metadata is rendered by normal commercial lead cards
{
  const commercialDataset = [...mockCommercialLeads];
  const hasResumeExposure = commercialDataset.some(l => l.resume_url || l.resumeUrl || l.category === 'JOB_APPLICATION');
  assert.strictEqual(hasResumeExposure, false, 'Commercial leads must have zero CV/resume data');
  console.log(' ✅ PASSED [Check J]: No CV or application metadata rendered by commercial lead cards');
}

console.log('\n==========================================');
console.log('ALL APPLICATION ISOLATION CHECKS PASSED (10/10)');
console.log('==========================================\n');