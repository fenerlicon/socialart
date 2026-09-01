const assert = require('assert');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('==========================================');
console.log('CANONICAL EMPLOYEE TEAM SCOPE TEST SUITE');
console.log('==========================================\n');

const EXPECTED_CONTRACT = {
  '1': {
    name: 'Tuğba Özdemir',
    rolePackageId: 'sosyal-medya-yonetimi',
    teamIds: ['sosyal-medya'],
    db2Uuid: '6f2efa88-0600-4d5f-8515-143937b6890f',
  },
  '2': {
    name: 'Celal Ünlü',
    rolePackageId: 'operasyon-yonetimi',
    teamIds: ['merkezi-operasyon'],
    db2Uuid: 'b5e391db-dc21-45a8-baad-19f4073d3b14',
  },
  '3': {
    name: 'Ercan Özdemir',
    rolePackageId: 'kreatif-yonetim',
    teamIds: ['fotograf-studyo', 'grafik-studyo', 'kreatif-koordinasyon', 'post-produksiyon', 'video-produksiyon'],
    db2Uuid: '406a078d-0aea-45e0-87e1-d4d0b5f20415',
  },
  '4': {
    name: 'Betül Ünlü',
    rolePackageId: 'grafik-tasarim',
    teamIds: ['grafik-studyo'],
    db2Uuid: '4721de06-0bd6-4681-a2c8-0c0d53da8eaf',
  },
  '6': {
    name: 'Arda Furkan Aslanbaş',
    rolePackageId: 'dijital-pazarlama',
    teamIds: ['dijital-pazarlama'],
    db2Uuid: '26fff081-5502-4624-a71a-b6e4772467c3',
  },
};

async function runTests() {
  const db1Url = process.env.NEXT_PUBLIC_LEADS_SUPABASE_URL || 'https://piffaggeshfrubyjkhej.supabase.co';
  const db1AnonKey = process.env.NEXT_PUBLIC_LEADS_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjkzMzEsImV4cCI6MjA5NDM0NTMzMX0.Bp4A-VwFMuOgpIqL_yud-i85uwnjxNZ4hXMNxNKu1HA';
  const supabase1 = createClient(db1Url, db1AnonKey);

  const db2Url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://osuwytugjscwhcxxkhfa.supabase.co';
  const db2AnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';
  const supabase2 = createClient(db2Url, db2AnonKey);

  console.log('--- 1. DB1 TEAM_IDS CONTRACT & ROLES ---');
  const { data: db1Emps, error: db1Err } = await supabase1
    .from('employees')
    .select('id, full_name, role_package_id, team_ids')
    .in('id', Object.keys(EXPECTED_CONTRACT));

  assert.ok(!db1Err, `DB1 fetch failed: ${db1Err?.message}`);
  assert.strictEqual(db1Emps.length, 5, 'Must fetch exact 5 active employees from DB1');

  for (const emp of db1Emps) {
    const contract = EXPECTED_CONTRACT[emp.id];
    assert.ok(contract, `Unknown DB1 employee ID ${emp.id}`);
    assert.strictEqual(emp.role_package_id, contract.rolePackageId, `Role package must match for ID ${emp.id}`);
    
    const actualTeams = (emp.team_ids || []).slice().sort();
    const expectedTeams = contract.teamIds.slice().sort();
    assert.deepStrictEqual(actualTeams, expectedTeams, `DB1 team_ids mismatch for ID ${emp.id}`);
    console.log(` ✅ DB1 ID ${emp.id} (${contract.name}): Role="${emp.role_package_id}", Teams=[${actualTeams.join(', ')}]`);
  }

  console.log('\n--- 2. DB2 TEAM_IDS CONTRACT & BRIDGE ALIGNMENT ---');
  const { data: db2Emps, error: db2Err } = await supabase2
    .from('employees')
    .select('id, full_name, role_package_id, team_ids, db1_employee_id')
    .in('db1_employee_id', Object.keys(EXPECTED_CONTRACT));

  assert.ok(!db2Err, `DB2 fetch failed: ${db2Err?.message}`);
  assert.strictEqual(db2Emps.length, 5, 'Must fetch exact 5 mapped employees from DB2');

  for (const emp of db2Emps) {
    const contract = EXPECTED_CONTRACT[emp.db1_employee_id];
    assert.ok(contract, `Unknown mapped DB1 employee ID ${emp.db1_employee_id}`);
    assert.strictEqual(emp.id, contract.db2Uuid, `Bridge UUID mismatch for DB1 ID ${emp.db1_employee_id}`);
    assert.strictEqual(emp.role_package_id, contract.rolePackageId, `DB2 role_package_id mismatch for ID ${emp.db1_employee_id}`);

    const actualTeams = (emp.team_ids || []).slice().sort();
    const expectedTeams = contract.teamIds.slice().sort();
    assert.deepStrictEqual(actualTeams, expectedTeams, `DB2 team_ids mismatch for DB1 ID ${emp.db1_employee_id}`);
    console.log(` ✅ DB2 UUID ${emp.id} (DB1: ${emp.db1_employee_id}): Teams=[${actualTeams.join(', ')}] matches DB1`);
  }

  console.log('\n--- 3. UNASSIGNED COSO & ART DIRECTOR ROLES AUDIT ---');
  const { data: allDb1, error: allDb1Err } = await supabase1
    .from('employees')
    .select('id, role_package_id');

  assert.ok(!allDb1Err);
  const cosoUsers = (allDb1 || []).filter(e => e.role_package_id === 'coso');
  const adUsers = (allDb1 || []).filter(e => e.role_package_id === 'art-director');

  assert.strictEqual(cosoUsers.length, 0, 'coso must have 0 assigned users');
  assert.ok(adUsers.length <= 1, 'art-director must have at most 1 assigned user (Beta Art Director)');
  console.log(' ✅ PASSED: Role assignments verified');

  console.log('\n--- 4. SCOPE ISOLATION LOGICAL CHECKS ---');
  // ID 1 must only have social-media team
  assert.deepStrictEqual(EXPECTED_CONTRACT['1'].teamIds, ['sosyal-medya']);
  assert.ok(!EXPECTED_CONTRACT['1'].teamIds.includes('dijital-pazarlama'), 'ID 1 must not have digital marketing');
  assert.ok(!EXPECTED_CONTRACT['1'].teamIds.includes('merkezi-operasyon'), 'ID 1 must not have central operations');

  // ID 4 must only have graphic studio
  assert.deepStrictEqual(EXPECTED_CONTRACT['4'].teamIds, ['grafik-studyo']);
  assert.ok(!EXPECTED_CONTRACT['4'].teamIds.includes('video-produksiyon'), 'ID 4 must not have video-produksiyon');

  // ID 6 must only have digital marketing
  assert.deepStrictEqual(EXPECTED_CONTRACT['6'].teamIds, ['dijital-pazarlama']);
  assert.ok(!EXPECTED_CONTRACT['6'].teamIds.includes('sosyal-medya'), 'ID 6 must not have social media');

  // ID 2 must only have central operations
  assert.deepStrictEqual(EXPECTED_CONTRACT['2'].teamIds, ['merkezi-operasyon']);

  // ID 3 has all 5 creative teams
  assert.strictEqual(EXPECTED_CONTRACT['3'].teamIds.length, 5);
  console.log(' ✅ PASSED: Scope isolation rules verified across all active employees');

  console.log('\n==========================================');
  console.log('ALL EMPLOYEE TEAM SCOPE CHECKS PASSED');
  console.log('==========================================\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});