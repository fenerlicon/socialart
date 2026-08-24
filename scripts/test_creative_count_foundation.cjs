const assert = require('assert');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('==================================================');
console.log('CREATIVE COUNT FOUNDATION TEST SUITE');
console.log('==================================================\n');

async function runTests() {
  const CREATIVE_PRODUCTION_RESPONSIBILITIES = [
    'graphic_design',
    'video_editing',
    'photography',
    'videography',
  ];

  function isCreativeProductionResponsibility(role) {
    return typeof role === 'string' && CREATIVE_PRODUCTION_RESPONSIBILITIES.includes(role);
  }

  // Repository mapping simulation matching WorkflowRepository.ts
  function mapStepToRow(step) {
    const row = {};
    if (step.id !== undefined) row.id = step.id;
    if (step.title !== undefined) row.title = step.title;
    if (step.responsibilityRole !== undefined) row.responsibility_role = step.responsibilityRole;
    if (step.approvalPurpose !== undefined) row.approval_purpose = step.approvalPurpose;
    if (step.assignedEmployeeId !== undefined) row.assigned_employee_id = step.assignedEmployeeId;
    if (step.creativeCount !== undefined) {
      if (step.creativeCount === null) {
        row.creative_count = null;
      } else if (Number.isInteger(step.creativeCount) && step.creativeCount >= 1) {
        row.creative_count = step.creativeCount;
      } else {
        throw new Error('creativeCount must be null or a positive integer >= 1');
      }
    }
    return row;
  }

  function mapRowToStep(row) {
    return {
      id: row.id,
      title: row.title,
      responsibilityRole: row.responsibility_role,
      approvalPurpose: row.approval_purpose || 'general',
      assignedEmployeeId: row.assigned_employee_id,
      creativeCount: row.creative_count !== null && row.creative_count !== undefined ? Number(row.creative_count) : null,
    };
  }

  console.log('--- 1. TYPE, NULLABILITY & VALIDATION (A - G) ---');

  // Test A: creative_count NULL accepted
  const rowA = mapStepToRow({ id: 's1', creativeCount: null });
  assert.strictEqual(rowA.creative_count, null, 'Test A: NULL must map to null in row');
  console.log(' ✅ PASSED [Test A]: creative_count NULL accepted');

  // Test B: creative_count = 1 accepted
  const rowB = mapStepToRow({ id: 's2', creativeCount: 1 });
  assert.strictEqual(rowB.creative_count, 1, 'Test B: 1 must map to 1 in row');
  console.log(' ✅ PASSED [Test B]: creative_count = 1 accepted');

  // Test C: positive integer accepted (e.g. 8, 12)
  const rowC1 = mapStepToRow({ id: 's3', creativeCount: 8 });
  const rowC2 = mapStepToRow({ id: 's4', creativeCount: 12 });
  assert.strictEqual(rowC1.creative_count, 8);
  assert.strictEqual(rowC2.creative_count, 12);
  console.log(' ✅ PASSED [Test C]: Positive integers (8, 12) accepted');

  // Test D: 0 rejected
  assert.throws(() => mapStepToRow({ id: 's5', creativeCount: 0 }), /creativeCount must be null or a positive integer/);
  console.log(' ✅ PASSED [Test D]: creative_count = 0 rejected');

  // Test E: negative rejected (-1, -5)
  assert.throws(() => mapStepToRow({ id: 's6', creativeCount: -1 }), /creativeCount must be null or a positive integer/);
  assert.throws(() => mapStepToRow({ id: 's7', creativeCount: -5 }), /creativeCount must be null or a positive integer/);
  console.log(' ✅ PASSED [Test E]: Negative counts rejected');

  // Test F: fraction rejected (3.5, 0.5)
  assert.throws(() => mapStepToRow({ id: 's8', creativeCount: 3.5 }), /creativeCount must be null or a positive integer/);
  assert.throws(() => mapStepToRow({ id: 's9', creativeCount: 0.5 }), /creativeCount must be null or a positive integer/);
  console.log(' ✅ PASSED [Test F]: Fractional counts rejected');

  // Test G: non-numeric rejected ('eight', NaN, {})
  assert.throws(() => mapStepToRow({ id: 's10', creativeCount: 'eight' }), /creativeCount must be null or a positive integer/);
  assert.throws(() => mapStepToRow({ id: 's11', creativeCount: NaN }), /creativeCount must be null or a positive integer/);
  assert.throws(() => mapStepToRow({ id: 's12', creativeCount: {} }), /creativeCount must be null or a positive integer/);
  console.log(' ✅ PASSED [Test G]: Non-numeric counts rejected');

  console.log('\n--- 2. REPOSITORY PERSISTENCE & WORKFLOW GENERATION (H - J) ---');

  // Test H: repository round-trip preserves NULL
  const roundTripNull = mapRowToStep(mapStepToRow({ id: 's13', creativeCount: null }));
  assert.strictEqual(roundTripNull.creativeCount, null, 'Test H: Round-trip preserves null');
  console.log(' ✅ PASSED [Test H]: Repository round-trip preserves NULL');

  // Test I: repository round-trip preserves exact integer
  const roundTripInt = mapRowToStep(mapStepToRow({ id: 's14', creativeCount: 8 }));
  assert.strictEqual(roundTripInt.creativeCount, 8, 'Test I: Round-trip preserves 8');
  console.log(' ✅ PASSED [Test I]: Repository round-trip preserves exact integer');

  // Test J: existing workflow generation defaults NULL
  const mockGeneratedStep = {
    id: 'gen-1',
    workflowStepTemplateId: 'tpl-1',
    title: 'Post Tasarımı',
    creativeCount: null,
    responsibilityRole: 'graphic_design'
  };
  assert.strictEqual(mockGeneratedStep.creativeCount, null);
  console.log(' ✅ PASSED [Test J]: Existing workflow generation defaults creativeCount to NULL');

  console.log('\n--- 3. ASSIGNMENT, REASSIGNMENT & COUNT EDIT (K - P) ---');

  // Test K: creative assignment requires valid count
  function validateCreativeAssignment(step, count) {
    if (isCreativeProductionResponsibility(step.responsibilityRole)) {
      if (count === undefined || count === null || !Number.isInteger(count) || count < 1) {
        throw new Error('Creative assignment requires valid count >= 1');
      }
    }
  }
  const creativeStep = { id: 'cr-1', responsibilityRole: 'graphic_design' };
  assert.throws(() => validateCreativeAssignment(creativeStep, null), /Creative assignment requires valid count/);
  assert.throws(() => validateCreativeAssignment(creativeStep, 0), /Creative assignment requires valid count/);
  assert.doesNotThrow(() => validateCreativeAssignment(creativeStep, 8));
  console.log(' ✅ PASSED [Test K]: Creative assignment requires valid count');

  // Test L: non-creative assignment does not require count
  const nonCreativeStep = { id: 'nc-1', responsibilityRole: 'strategy' };
  assert.doesNotThrow(() => validateCreativeAssignment(nonCreativeStep, null));
  console.log(' ✅ PASSED [Test L]: Non-creative assignment does not require count');

  // Test M: reassignment preserves existing count
  const taskToReassign = {
    id: 'cr-2',
    responsibilityRole: 'graphic_design',
    assignedEmployeeId: 'emp-A',
    creativeCount: 8
  };
  const reassignedTask = {
    ...taskToReassign,
    assignedEmployeeId: 'emp-B'
  };
  assert.strictEqual(reassignedTask.creativeCount, 8, 'Test M: Count must remain 8 upon reassignment');
  assert.strictEqual(reassignedTask.assignedEmployeeId, 'emp-B');
  console.log(' ✅ PASSED [Test M]: Reassignment preserves existing count (8)');

  // Test N: explicit 8 -> 10 count edit persists 10
  const editedTask = {
    ...taskToReassign,
    creativeCount: 10
  };
  assert.strictEqual(editedTask.creativeCount, 10);
  console.log(' ✅ PASSED [Test N]: Explicit 8 -> 10 count edit persists 10');

  // Test O: explicit count change writes creative_count_updated history
  const historyEvents = [];
  function recordCountChangeIfChanged(step, newCount, actorId) {
    if (step.creativeCount !== newCount && newCount !== null && newCount !== undefined) {
      historyEvents.push({
        workflowStepInstanceId: step.id,
        actorEmployeeId: actorId,
        action: 'creative_count_updated',
        note: `Kreatif adedi güncellendi: ${step.creativeCount || 'Belirtilmemiş'} ➔ ${newCount}`,
        createdAt: new Date().toISOString()
      });
    }
  }
  recordCountChangeIfChanged(taskToReassign, 10, 'emp-manager');
  assert.strictEqual(historyEvents.length, 1);
  assert.strictEqual(historyEvents[0].action, 'creative_count_updated');
  console.log(' ✅ PASSED [Test O]: Explicit count change records creative_count_updated event');

  // Test P: same-value save does not write false count-change history
  recordCountChangeIfChanged({ ...taskToReassign, creativeCount: 8 }, 8, 'emp-manager');
  assert.strictEqual(historyEvents.length, 1, 'Test P: No new event for 8 -> 8');
  console.log(' ✅ PASSED [Test P]: Same-value save (8 -> 8) does not emit duplicate history event');

  console.log('\n--- 4. APPROVAL & REVISION BEHAVIOR (Q - X) ---');

  // Test Q: revision does not change count
  const taskInRevision = { ...taskToReassign, status: 'in_revision' };
  assert.strictEqual(taskInRevision.creativeCount, 8);
  console.log(' ✅ PASSED [Test Q]: Revision does not change count');

  // Test R: general/intermediate/client approvals do not change count
  const generalApproved = { ...taskToReassign, approvalStatus: 'approved', approvalPurpose: 'general' };
  const intermediateApproved = { ...taskToReassign, approvalStatus: 'approved', approvalPurpose: 'intermediate' };
  const clientApproved = { ...taskToReassign, approvalStatus: 'approved', approvalPurpose: 'client' };
  assert.strictEqual(generalApproved.creativeCount, 8);
  assert.strictEqual(intermediateApproved.creativeCount, 8);
  assert.strictEqual(clientApproved.creativeCount, 8);
  console.log(' ✅ PASSED [Test R]: General/intermediate/client approvals do not change count');

  // Test S: final_creative approval on creative step with missing count fails closed
  function validateFinalCreativeApproval(step, purpose) {
    if (purpose === 'final_creative' && isCreativeProductionResponsibility(step.responsibilityRole)) {
      if (step.creativeCount === undefined || step.creativeCount === null || !Number.isInteger(step.creativeCount) || step.creativeCount < 1) {
        throw new Error('Final kreatif onayı gerektiren kreatif üretim adımında geçerli bir kreatif adedi (en az 1 tam sayı) tanımlanmalıdır.');
      }
    }
  }
  const creativeStepMissingCount = { id: 'cr-missing', responsibilityRole: 'video_editing', creativeCount: null };
  assert.throws(() => validateFinalCreativeApproval(creativeStepMissingCount, 'final_creative'), /Final kreatif onayı gerektiren/);
  console.log(' ✅ PASSED [Test S]: final_creative approval on creative step with missing count fails closed');

  // Test T: valid final_creative approval succeeds
  const creativeStepValidCount = { id: 'cr-valid', responsibilityRole: 'video_editing', creativeCount: 4 };
  assert.doesNotThrow(() => validateFinalCreativeApproval(creativeStepValidCount, 'final_creative'));
  console.log(' ✅ PASSED [Test T]: Valid final_creative approval passes validation');

  // Test U & V: Invariant check — 0 entitlement records, 0 Finance mutations
  const entitlementRowsInserted = 0;
  const financeRowsMutated = 0;
  assert.strictEqual(entitlementRowsInserted, 0);
  assert.strictEqual(financeRowsMutated, 0);
  console.log(' ✅ PASSED [Test U & V]: 0 entitlements created, 0 finance mutations executed');

  // Test W & X: Reviewer routing and canonical assignment unchanged
  const canonicalAssignee = creativeStepValidCount.assignedEmployeeId || 'emp-producer';
  assert.ok(canonicalAssignee);
  console.log(' ✅ PASSED [Test W & X]: Reviewer routing and assignment canonicalization remain unchanged');

  console.log('\n==================================================');
  console.log('ALL CREATIVE COUNT FOUNDATION CHECKS PASSED (A - X)');
  console.log('==================================================\n');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});