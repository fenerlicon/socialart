const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('===============================================================');
console.log('SECONDARY ADMIN DB CLIENT FAIL-CLOSED CONTRACT TEST SUITE');
console.log('===============================================================\n');

async function runTests() {
  const adminDbSource = fs.readFileSync(path.resolve(__dirname, '../api/_lib/admin-db.js'), 'utf8');

  console.log('--- 1. STATIC SOURCE CONTRACT AUDIT (A - E) ---');
  // A. No anon fallback in getSecondaryAdminSupabase
  assert.ok(
    !adminDbSource.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY') && !adminDbSource.includes('DB2_KEY'),
    'admin-db.js must not contain any anon key fallbacks for DB2'
  );
  console.log(' ✅ PASSED [Test A]: 0 anon key fallbacks present in admin-db.js');

  // B. Required error message identifier
  assert.ok(
    adminDbSource.includes('SECONDARY_ADMIN_SERVICE_ROLE_REQUIRED'),
    'getSecondaryAdminSupabase must throw SECONDARY_ADMIN_SERVICE_ROLE_REQUIRED when credential is missing'
  );
  console.log(' ✅ PASSED [Test B]: SECONDARY_ADMIN_SERVICE_ROLE_REQUIRED error identifier present');

  console.log('\n--- 2. RUNTIME FAIL-CLOSED BEHAVIOR (F - I) ---');
  // C. Test missing credential fails closed
  const origKey = process.env.SUPABASE_SECONDARY_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_SECONDARY_SERVICE_ROLE_KEY;

  const { getSecondaryAdminSupabase } = await import('../api/_lib/admin-db.js');

  let threw = false;
  let errorMsg = '';
  try {
    getSecondaryAdminSupabase();
  } catch (err) {
    threw = true;
    errorMsg = err.message;
  }
  assert.strictEqual(threw, true, 'getSecondaryAdminSupabase must throw when SUPABASE_SECONDARY_SERVICE_ROLE_KEY is absent');
  assert.ok(errorMsg.includes('SECONDARY_ADMIN_SERVICE_ROLE_REQUIRED'), 'Error message must specify SECONDARY_ADMIN_SERVICE_ROLE_REQUIRED');
  console.log(' ✅ PASSED [Test C]: getSecondaryAdminSupabase fails closed immediately when credential missing');

  // D. Test valid credential construction
  process.env.SUPABASE_SECONDARY_SERVICE_ROLE_KEY = 'mock.secondary.service.role.jwt';
  let clientConstructed = false;
  try {
    const secondaryClient = getSecondaryAdminSupabase();
    assert.ok(secondaryClient, 'Client must be constructed when service-role key is provided');
    assert.strictEqual(typeof secondaryClient.from, 'function');
    clientConstructed = true;
  } catch (err) {
    console.error('Unexpected error with mock key:', err);
  } finally {
    if (origKey) {
      process.env.SUPABASE_SECONDARY_SERVICE_ROLE_KEY = origKey;
    } else {
      delete process.env.SUPABASE_SECONDARY_SERVICE_ROLE_KEY;
    }
  }
  assert.strictEqual(clientConstructed, true, 'Secondary admin client successfully constructed when key provided');
  console.log(' ✅ PASSED [Test D]: getSecondaryAdminSupabase constructs trusted client when service-role key provided');

  console.log('\n--- 3. PUBLIC CLIENT ISOLATION (J) ---');
  // E. Public client in src/lib/supabase.js remains intact
  const { supabase: publicDb2 } = await import('../src/lib/supabase.js');
  assert.ok(publicDb2, 'Public client must exist');
  assert.strictEqual(typeof publicDb2.from, 'function');
  console.log(' ✅ PASSED [Test E]: Public browser DB2 client remains intact and separate');

  console.log('\n===============================================================');
  console.log('ALL SECONDARY ADMIN CLIENT FAIL-CLOSED CHECKS PASSED');
  console.log('===============================================================\n');
}

runTests().catch(err => {
  console.error('Test suite failure:', err);
  process.exit(1);
});