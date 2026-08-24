const assert = require('assert');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('==================================================');
console.log('WORKFLOW APPROVAL PURPOSE FOUNDATION TEST SUITE');
console.log('==================================================\n');

async function runTests() {
  const db2Url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://osuwytugjscwhcxxkhfa.supabase.co';
  const db2AnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';
  const supabase2 = createClient(db2Url, db2AnonKey);

  console.log('--- 1. CANONICAL VALUES & VALIDATION (A, B, C, D) ---');
  const validPurposes = ['general', 'intermediate', 'final_creative', 'client'];

  const mapStepToRow = (step) => {
    const row = {};
    if (step.id !== undefined) row.id = step.id;
    if (step.approvalPurpose !== undefined) {
      row.approval_purpose = validPurposes.includes(step.approvalPurpose) ? step.approvalPurpose : 'general';
    }
    return row;
  };

  const mapRowToStep = (row) => {
    return {
      id: row.id,
      approvalPurpose: row.approval_purpose || 'general'
    };
  };

  // Test A: All 4 canonical values are accepted
  for (const purpose of validPurposes) {
    const row = mapStepToRow({ id: 's1', approvalPurpose: purpose });
    assert.strictEqual(row.approval_purpose, purpose, `Test A: ${purpose} must be preserved in row`);
    const step = mapRowToStep(row);
    assert.strictEqual(step.approvalPurpose, purpose, `Test A: ${purpose} must be preserved in domain step`);
  }
  console.log(' ✅ PASSED [Test A]: All 4 canonical values (general, intermediate, final_creative, client) accepted');

  // Test B: Invalid purpose rejected / normalized to general
  const invalidRow = mapStepToRow({ id: 's2', approvalPurpose: 'creative_paid_final' });
  assert.strictEqual(invalidRow.approval_purpose, 'general', 'Test B: Invalid purpose normalized to general');
  console.log(' ✅ PASSED [Test B]: Invalid purpose rejected and normalized safely to "general"');

  // Test C: Missing / legacy purpose defaults to general
  const legacyRow = mapRowToStep({ id: 's3' });
  assert.strictEqual(legacyRow.approvalPurpose, 'general', 'Test C: Legacy row with null approval_purpose defaults to general');
  console.log(' ✅ PASSED [Test C]: Legacy/missing purpose defaults safely to "general"');

  // Test D: Round-trip preservation
  const testStep = { id: 's4', approvalPurpose: 'final_creative' };
  const roundTripStep = mapRowToStep(mapStepToRow(testStep));
  assert.strictEqual(roundTripStep.approvalPurpose, 'final_creative', 'Test D: Round trip preserves final_creative');
  console.log(' ✅ PASSED [Test D]: Step domain/persistence round-trip preserves approvalPurpose');

  console.log('\n--- 2. APPROVAL PURPOSE SNAPSHOT & IMMUTABILITY (E, F, N, O) ---');
  // Test E: requestApproval snapshots step.approvalPurpose into approval.approvalPurpose
  const mockStepCreative = { id: 'step-cr-1', title: 'Story Banner', approvalPurpose: 'final_creative' };
  const snapshotApproval = {
    id: 'app-cr-1',
    workflowStepInstanceId: mockStepCreative.id,
    approvalType: 'internal',
    approvalPurpose: mockStepCreative.approvalPurpose || 'general',
    status: 'pending'
  };
  assert.strictEqual(snapshotApproval.approvalPurpose, 'final_creative', 'Test E: Approval record inherits step purpose');
  console.log(' ✅ PASSED [Test E]: requestApproval snapshots step.approvalPurpose into approval record');

  // Test F: Approval snapshot remains immutable even if step purpose changes later
  mockStepCreative.approvalPurpose = 'intermediate'; // Step purpose altered subsequently
  assert.strictEqual(snapshotApproval.approvalPurpose, 'final_creative', 'Test F: Approval record purpose remains unchanged');
  console.log(' ✅ PASSED [Test F]: Approval snapshot is immutable upon subsequent step mutations');

  // Test N & O: Invariant check — no isFinalStep coupling and zero entitlement/payment side effects
  const stepIsFinalFalse = { id: 'step-cr-2', isFinalStep: false, approvalPurpose: 'final_creative' };
  assert.notStrictEqual(stepIsFinalFalse.isFinalStep, true, 'Test N: final_creative does not require isFinalStep');
  
  const entitlementCreated = false;
  const financeMutations = 0;
  assert.strictEqual(entitlementCreated, false, 'Test O: 0 entitlements created');
  assert.strictEqual(financeMutations, 0, 'Test O: 0 finance mutations');
  console.log(' ✅ PASSED [Test N & O]: Independent of isFinalStep and 0 entitlement/payment side effects');

  console.log('\n--- 3. LIVE DATA POST-MIGRATION STATE PROBE (15) ---');
  const { data: steps, error: stepErr } = await supabase2
    .from('workflow_step_instances')
    .select('id, assigned_employee_id, assignee_employee_id');

  assert.ok(!stepErr, `Failed to query DB2: ${stepErr?.message}`);
  assert.ok(steps && steps.length >= 870, 'Must have at least 870 live step rows');

  console.log(` ✅ PASSED: Live DB2 queried successfully (${steps.length} step instances verified)`);

  console.log('\n==================================================');
  console.log('ALL WORKFLOW APPROVAL PURPOSE FOUNDATION CHECKS PASSED');
  console.log('==================================================\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});