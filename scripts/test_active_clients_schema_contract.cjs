const assert = require('assert');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('==========================================');
console.log('ACTIVE_CLIENTS SCHEMA CONTRACT TEST');
console.log('==========================================\n');

const supabaseUrl = 'https://piffaggeshfrubyjkhej.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_LEADS_ANON_KEY;

if (!supabaseKey) {
  console.error('Supabase API key not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log('--- 1. PROVE PHYSICAL SCHEMA CONTRACT ON DB1 ---');

  // Select verified physical columns
  const { data: clientRows, error: selectErr } = await supabase
    .from('active_clients')
    .select('id, name, client_code, package, monthly_fee, payment_day, commission_rate, exempt_from_commission, assigned_staff_ids, durum')
    .limit(5);

  assert.strictEqual(selectErr, null, `Physical column select must succeed: ${selectErr?.message}`);
  assert.ok(clientRows && clientRows.length > 0, 'Must return client rows');

  const sample = clientRows[0];
  assert.ok('monthly_fee' in sample, 'monthly_fee MUST physically exist on active_clients');
  assert.ok('payment_day' in sample, 'payment_day MUST physically exist on active_clients');
  assert.ok('client_code' in sample, 'client_code MUST physically exist on active_clients');
  assert.ok('commission_rate' in sample, 'commission_rate MUST physically exist on active_clients');
  assert.ok('exempt_from_commission' in sample, 'exempt_from_commission MUST physically exist on active_clients');
  assert.ok('assigned_staff_ids' in sample, 'assigned_staff_ids MUST physically exist on active_clients');
  console.log(' ✅ PASSED: All 6 contract fields physically exist as top-level columns in DB1 active_clients');

  // 2. Prove 'metrics' column is absent and querying it fails with 42703
  console.log('\n--- 2. PROVE METRICS COLUMN IS ABSENT IN DB1 ---');
  const { data: metricsData, error: metricsErr } = await supabase
    .from('active_clients')
    .select('id, metrics')
    .limit(1);

  assert.ok(metricsErr !== null, 'metrics select must error because column does not exist');
  assert.strictEqual(metricsErr.code, '42703', `Must return PostgreSQL error 42703 (undefined column): ${metricsErr.code}`);
  console.log(' ✅ PASSED: DB1 correctly rejects non-existent metrics column (42703)');

  // 3. Idempotent test update using verified physical schema
  console.log('\n--- 3. IDEMPOTENT UPDATE CHECK USING PHYSICAL PAYLOAD ---');
  const testClient = clientRows[0];
  const { error: updateErr } = await supabase
    .from('active_clients')
    .update({
      monthly_fee: testClient.monthly_fee,
      payment_day: testClient.payment_day,
      client_code: testClient.client_code,
      commission_rate: testClient.commission_rate,
      exempt_from_commission: testClient.exempt_from_commission,
      assigned_staff_ids: testClient.assigned_staff_ids
    })
    .eq('id', testClient.id);

  assert.strictEqual(updateErr, null, `Physical contract update must succeed with zero errors: ${updateErr?.message}`);
  console.log(' ✅ PASSED: Physical contract update executed cleanly with 0 errors');

  console.log('\n==========================================');
  console.log('ALL ACTIVE_CLIENTS SCHEMA CONTRACT CHECKS PASSED');
  console.log('==========================================\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});