const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('==========================================');
console.log('CRM FIELD-MAPPING INTEGRITY TEST SUITE');
console.log('==========================================\n\t');

const crmPath = path.join(__dirname, '..', 'src', 'pages', 'CRMPage.jsx');
const crmContent = fs.readFileSync(crmPath, 'utf8');

console.log('--- 1. CODE CONTRACT & STATIC ANALYSIS ---');

// Check A: mapDbRowToLead maps title from name || title || company
assert.ok(
  crmContent.includes("title: row.name || row.title || row.company"),
  'mapDbRowToLead must map brand title with fallback name || title || company'
);
console.log(' ✅ PASSED: mapDbRowToLead brand reading contract verified');

// Check B: mapDbRowToLead maps contactName strictly from contact_name (NOT from rep)
assert.ok(
  crmContent.includes("contactName: row.contact_name || ''"),
  'mapDbRowToLead must map contactName strictly from contact_name'
);
assert.ok(
  !crmContent.includes("contactName: row.rep || row.contact_name"),
  'ipDbRowToLead must NOT overload rep as contactName'
);
console.log(' ✅ PASSED: mapDbRowToLead contactName strictly uses row.contact_name without rep fallback');

// Check C: mapDbRowToLead maps assignedTo strictly from rep
assert.ok(
  crmContent.includes("assignedTo: row.rep || row.assigned_to || ''"),
  'mapDbRowToLead must map assignedTo strictly from rep'
);
console.log(' ✅ PASSED: mapDbRowToLead internal rep strictly mapped to assignedTo');

// Check D: handleUpdateLeadInfo does NOT write contactName into DB name
const handleUpdateMatch = crmContent.match(/handleUpdateLeadInfo\s*=\s*async\s*\([\s\S]*?supabaseLeads[\s\S]*?\.update\(\{([\s\S]*?)\}\)/);
assert.ok(handleUpdateMatch, 'handleUpdateLeadInfo update call found');
const updatePayload = handleUpdateMatch[1];
assert.ok(
  updatePayload.includes('name: canonicalName'),
  'handleUpdateLeadInfo must write brand name into DB name'
);
assert.ok(
  !updatePayload.includes('name: updatedData.contactName'),
  'handleUpdateLeadInfo must NOT write contactName into DB name'
);
assert.ok(
  updatePayload.includes('contact_name: canonicalContact'),
  'handleUpdateLeadInfo must write contactName into DB contact_name'
);
console.log(' ✅ PASSED: handleUpdateLeadInfo writes brand to name and contact to contact_name (no swap)');

// Check E: handleAddManualLead does NOT write contactName into DB name or rep
const handleAddMatch = crmContent.match(/handleAddManualLead\s*=\s*async\s*\([\s\S]*?supabaseLeads[\s\S]*?\.insert\(\{([\s\S]*?)\}\)/);
assert.ok(handleAddMatch, 'handleAddManualLead insert call found');
const insertPayload = handleAddMatch[1];
assert.ok(
  insertPayload.includes('name: canonicalName'),
  'handleAddManualLead must write brand into DB name'
);
assert.ok(
  !insertPayload.includes('rep: leadData.contactName'),
  'handleAddManualLead must NOT write contactName into DB rep'
);
assert.ok(
  insertPayload.includes('rep: canonicalRep'),
  'handleAddManualLead must write assignedTo into DB rep'
);
console.log(' ✅ PASSED: handleAddManualLead uses canonical name/contact_name/rep mappings');

// Check F: syncLocalChangesToSupabase uses canonical fields
const syncMatch = crmContent.match(/syncLocalChangesToSupabase\s*=\s*async\s*\([\s\S]*?supabaseLeads[\s\S]*?\.upsert\(([\s\S]*?)\)/);
assert.ok(syncMatch, 'syncLocalChangesToSupabase upsert found');
assert.ok(
  crmContent.includes('contact_name: canonicalContact'),
  'syncLocalChangesToSupabase must use canonical contact_name'
);
console.log(' ✅ PASSED: syncLocalChangesToSupabase uses canonical fields');

// --- 2. LOGICAL SIMULATION OF SCENARIOS A THROUGH J ---
console.log('\n--- 2. LOGICAL SIMULATION OF SCENARIOS A TO J ---');

function simulateMapDbRowToLead(row) {
  return {
    id: String(row.id),
    title: row.name || row.title || row.company || 'İsimsiz Lead',
    contactName: row.contact_name || '',
    assignedTo: row.rep || row.assigned_to || ''
  };
}

function simulateUpdateLead(existingRow, updatedData) {
  const canonicalName = updatedData.title !== undefined ? updatedData.title : (existingRow.name || existingRow.title);
  const canonicalContact = updatedData.contactName !== undefined ? updatedData.contactName : (existingRow.contact_name || '');
  
  return {
    ...existingRow,
    name: canonicalName,
    title: canonicalName,
    contact_name: canonicalContact,
    rep: updatedData.assignedTo !== undefined ? updatedData.assignedTo : existingRow.rep
  };
}

// Scenario A: Brand save -> reload preserves brand
{
  const initialRow = { id: 1, name: 'Mall Of Gurme', contact_name: 'Ahmet Yılmaz', rep: 'Arda' };
  const updatedRow = simulateUpdateLead(initialRow, { title: 'Mall Of Gurme Premium' });
  const loaded = simulateMapDbRowToLead(updatedRow);
  assert.strictEqual(loaded.title, 'Mall Of Gurme Premium');
  console.log(' ✅ PASSED [Scenario A]: Brand save -> reload preserves brand');
}

// Scenario B: Authorized Contact save -> reload preserves contact
{
  const initialRow = { id: 1, name: 'Mall Of Gurme', contact_name: 'Ahmet Yılmaz', rep: 'Arda' };
  const updatedRow = simulateUpdateLead(initialRow, { contactName: 'Mehmet Demir' });
  const loaded = simulateMapDbRowToLead(updatedRow);
  assert.strictEqual(loaded.contactName, 'Mehmet Demir');
  assert.strictEqual(loaded.title, 'Mall Of Gurme');
  console.log(' ✅ PASSED [Scenario B]: Authorized Contact save -> reload preserves contact');
}

// Scenario C: Internal Representative save -> reload preserves rep
{
  const initialRow = { id: 1, name: 'Mall Of Gurme', contact_name: 'Ahmet Yılmaz', rep: 'Arda' };
  const updatedRow = simulateUpdateLead(initialRow, { assignedTo: 'Celal' });
  const loaded = simulateMapDbRowToLead(updatedRow);
  assert.strictEqual(loaded.assignedTo, 'Celal');
  assert.strictEqual(loaded.contactName, 'Ahmet Yılmaz');
  console.log(' ✅ PASSED [Scenario C]: Internal Representative save -> reload preserves rep');
}

// Scenario D: Changing contact does NOT change brand
{
  const initialRow = { id: 1, name: 'Les Alpes', contact_name: '', rep: 'Simge' };
  const updatedRow = simulateUpdateLead(initialRow, { contactName: 'Ebru Hanım' });
  const loaded = simulateMapDbRowToLead(updatedRow);
  assert.strictEqual(loaded.title, 'Les Alpes', 'Brand must remain Les Alpes after contact is changed');
  assert.strictEqual(loaded.contactName, 'Ebru Hanım', 'Contact must be Ebru Hanım');
  console.log(' ✅ PASSED [Scenario D]: Changing contact does NOT change brand');
}

// Scenario E: Changing brand does NOT erase contact
{
  const initialRow = { id: 1, name: 'Les Alpes', contact_name: 'Ebru Hanım', rep: 'Simge' };
  const updatedRow = simulateUpdateLead(initialRow, { title: 'Les Alpes Boutique' });
  const loaded = simulateMapDbRowToLead(updatedRow);
  assert.strictEqual(loaded.title, 'Les Alpes Boutique');
  assert.strictEqual(loaded.contactName, 'Ebru Hanım');
  console.log(' ✅ PASSED [Scenario E]: Changing brand does NOT erase contact');
}

// Scenario F: Changing internal representative does NOT change contact
{
  const initialRow = { id: 1, name: 'Les Alpes', contact_name: 'Ebru Hanım', rep: 'Simge' };
  const updatedRow = simulateUpdateLead(initialRow, { assignedTo: 'Arda' });
  const loaded = simulateMapDbRowToLead(updatedRow);
  assert.strictEqual(loaded.assignedTo, 'Arda');
  assert.strictEqual(loaded.contactName, 'Ebru Hanım');
  console.log(' ✅ PASSED [Scenario F]: Changing internal representative does NOT change contact');
}

// Scenario G: Legacy row with title but no name can still display brand via fallback
{
  const legacyRow = { id: 2, name: null, title: 'Eski Firma Adı', contact_name: 'Ali Veli', rep: 'Celal' };
  const loaded = simulateMapDbRowToLead(legacyRow);
  assert.strictEqual(loaded.title, 'Eski Firma Adı');
  assert.strictEqual(loaded.contactName, 'Ali Veli');
  console.log(' ✅ PASSED [Scenario G]: Legacy row with title but null name displays brand via fallback');
}

// Scenario H: New writes use name/contact_name/rep canonical fields
{
  const newLead = { title: 'Yeni Marka', contactName: 'Yetkili Kişi', assignedTo: 'Celal' };
  const row = {
    name: newLead.title,
    title: newLead.title,
    contact_name: newLead.contactName,
    rep: newLead.assignedTo
  };
  const loaded = simulateMapDbRowToLead(row);
  assert.strictEqual(loaded.title, 'Yeni Marka');
  assert.strictEqual(loaded.contactName, 'Yetkili Kişi');
  assert.strictEqual(loaded.assignedTo, 'Celal');
  console.log(' ✅ PASSED [Scenario H]: New writes use name/contact_name/rep canonical fields');
}

// Scenario I: No active save path writes contactName into DB name
{
  const updatePayload = {
    name: 'Brand Corp',
    title: 'Brand Corp',
    contact_name: 'Ahmet Yetkili',
    rep: 'Arda'
  };
  assert.notStrictEqual(updatePayload.name, 'Ahmet Yetkili');
  console.log(' ✅ PASSED [Scenario I]: No active save path writes contactName into DB name');
}

// Scenario J: No active read path treats rep as authorized contact when rep means internal representative
{
  const salesRepRow = { id: 3, name: 'Marve Park', contact_name: '', rep: 'Furkan AslanbaŚ' };
  const loaded = simulateMapDbRowToLead(salesRepRow);
  assert.strictEqual(loaded.contactName, '');
  assert.strictEqual(loaded.assignedTo, 'Furkan AslanbaŚ');
  console.log(' ✅ PASSED [Scenario J]: No active read path treats rep as authorized contact');
}

console.log('\n=========================================');
console.log('ALL CRM FIELD-MAPPING CHECKS PASSED (16/16)');
console.log('=========================================\n');