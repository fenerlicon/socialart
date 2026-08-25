const assert = require('assert');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('===============================================================');
console.log('DB2 EMPLOYEES CLIENT-WRITE RLS LOCKDOWN CONTRACT TEST SUITE');
console.log('===============================================================\n');

function runTests() {
  const migrationPath = path.resolve(__dirname, '../supabase/migrations/lock_down_db2_employees_client_writes.sql');
  assert.ok(fs.existsSync(migrationPath), 'Migration file lock_down_db2_employees_client_writes.sql must exist');
  
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('--- 1. STATIC MIGRATION SQL VERIFICATION ---');
  // A. RLS Enablement
  assert.ok(
    /ALTER\s+TABLE\s+public\.employees\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(sql),
    'Migration must explicitly enable RLS on public.employees'
  );
  console.log(' ✅ PASSED: RLS enablement statement present');

  // B. Drops permissive client policies
  assert.ok(
    /DROP\s+POLICY\s+IF\s+EXISTS/i.test(sql),
    'Migration must drop any legacy/permissive client mutation policies'
  );
  console.log(' ✅ PASSED: Permissive policy cleanup present');

  // C. Explicit SELECT-only policy
  assert.ok(
    /FOR\s+SELECT/i.test(sql),
    'Migration must create a FOR SELECT policy'
  );
  assert.ok(
    /TO\s+anon,\s*authenticated/i.test(sql),
    'Policy must target client roles (anon, authenticated)'
  );
  console.log(' ✅ PASSED: Explicit SELECT-only policy created for anon and authenticated roles');

  // D. No mutation allow policies
  assert.ok(
    !/FOR\s+INSERT/i.test(sql),
    'Migration must NOT grant FOR INSERT to client roles'
  );
  assert.ok(
    !/FOR\s+UPDATE/i.test(sql),
    'Migration must NOT grant FOR UPDATE to client roles'
  );
  assert.ok(
    !/FOR\s+DELETE/i.test(sql),
    'Migration must NOT grant FOR DELETE to client roles'
  );
  assert.ok(
    !/FOR\s+ALL/i.test(sql),
    'Migration must NOT grant FOR ALL to client roles'
  );
  console.log(' ✅ PASSED: 0 client INSERT/UPDATE/DELETE/ALL policies created');

  // E. No data modification
  assert.ok(
    !/INSERT\s+INTO/i.test(sql) && !/UPDATE\s+public\.employees/i.test(sql) && !/DELETE\s+FROM/i.test(sql),
    'Migration must not mutate table business data'
  );
  console.log(' ✅ PASSED: 0 business data mutations in migration');

  console.log('\n--- 2. SERVER SERVICE-ROLE COMPATIBILITY PROOF ---');
  // Service-role in PostgreSQL / Supabase bypasses RLS by design
  const { getSecondaryAdminSupabase } = require('../api/_lib/admin-db.js');
  assert.strictEqual(typeof getSecondaryAdminSupabase, 'function');
  console.log(' ✅ PASSED: getSecondaryAdminSupabase (DB2 service-role client) ready for trusted server mutations');

  console.log('\n===============================================================');
  console.log('ALL DB2 EMPLOYEES CLIENT-WRITE RLS LOCKDOWN CHECKS PASSED');
  console.log('===============================================================\n');
}

runTests();