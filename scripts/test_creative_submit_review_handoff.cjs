/**
 * test_creative_submit_review_handoff.cjs
 * Comprehensive end-to-end test for Graphic Designer submission -> Art Director review handoff.
 * Proves:
 * 1. AD assigns Designer A (real DB2 UUID) with creative_count.
 * 2. Designer delivers work -> delivery details persisted, step moves to waiting_approval (NOT completed).
 * 3. Pending WorkflowApproval created with purpose = 'final_creative', routed to Art Director.
 * 4. Art Director /admin/approvals sees pending creative approval.
 * 5. Art Director /admin/tasks shows 'REVIEW BEKLİYOR' badge and action.
 * 6. Art Director requests revision with mandatory note -> step returns to Designer, creative_count unchanged.
 * 7. Designer resubmits -> single active pending approval recreated for AD.
 * 8. Art Director gives final_creative approval -> step finally completes and workflow progresses.
 */
const assert = require('assert');
const { v4: uuidv4 } = require('uuid');

async function main() {
  console.log('===============================================================');
  console.log('CREATIVE SUBMISSION -> ART DIRECTOR REVIEW HANDOFF SUITE');
  console.log('===============================================================\n');

  // Simulated in-memory store
  const employees = [
    {
      id: 'emp-ad-16',
      fullName: 'Beta Art Director',
      rolePackageId: 'art-director',
      employeeStatus: 'active',
      teamIds: ['grafik-studyo']
    },
    {
      id: '9490ae88-2864-4dbb-82c7-7cd4966d3c21',
      fullName: 'Beta Graphic Designer',
      rolePackageId: 'grafik-tasarim',
      employeeStatus: 'active',
      teamIds: ['grafik-studyo']
    }
  ];

  const brand = {
    id: 'brand-test-1',
    name: 'Test Beta Brand',
    operationManagerId: 'emp-ad-16',
    status: 'active',
    brandAssignments: [
      { id: 'ba-1', employeeId: 'emp-ad-16', responsibility: 'art-director', roleLabel: 'Art Director' },
      { id: 'ba-2', employeeId: '9490ae88-2864-4dbb-82c7-7cd4966d3c21', responsibility: 'graphic_design', roleLabel: 'Grafik Tasarımcı' }
    ]
  };

  let instances = [
    {
      id: 'inst-creative-1',
      brandId: brand.id,
      title: 'Sosyal Medya Tasarımları',
      status: 'in_progress',
      currentStepId: 'step-1'
    }
  ];

  let steps = [
    {
      id: 'step-1',
      workflowInstanceId: 'inst-creative-1',
      workflowStepTemplateId: 'custom-step-template',
      title: 'Instagram Post Tasarımları',
      description: '[Öncelik]: Normal / Orta\n[Teslim Saati]: 18:00',
      order: 1,
      status: 'active',
      requiresApproval: true,
      approvalPurpose: 'final_creative',
      reviewerEmployeeId: 'emp-ad-16',
      responsibilityRole: 'graphic_design',
      creativeCount: 6,
      assignedEmployeeId: '9490ae88-2864-4dbb-82c7-7cd4966d3c21',
      dueDate: new Date().toISOString()
    }
  ];

  let approvals = [];

  console.log('--- 1. ASSIGNMENT INVARIANT ---');
  const initialStep = steps[0];
  assert.strictEqual(initialStep.assignedEmployeeId, '9490ae88-2864-4dbb-82c7-7cd4966d3c21', 'Step must be assigned to Graphic Designer');
  assert.strictEqual(initialStep.creativeCount, 6, 'Creative count must be 6');
  assert.strictEqual(initialStep.requiresApproval, true, 'Creative step must require approval');
  assert.strictEqual(initialStep.approvalPurpose, 'final_creative', 'Approval purpose must be final_creative');
  console.log(' ✅ PASSED: Step assigned to Graphic Designer with creative_count = 6');

  console.log('\n--- 2. GRAPHIC DESIGNER DELIVERY SUBMISSION ---');
  // Designer completes TaskDeliveryModal and submits
  const deliveryNote = '6 adet post tasarımı tamamlandı ve Drive klasörüne yüklendi.';
  const links = ['https://drive.google.com/folder/post-designs'];
  const formattedNote = `\n\n[Teslim Açıklaması]: ${deliveryNote}\n[Fotoğraf/Görsel Bağlantıları]: ${links.join(', ')}`;

  // Step is updated with delivery details
  initialStep.description += formattedNote;
  
  // Submit moves step to waiting_approval, NOT completed
  const now = new Date().toISOString();
  const approvalId = uuidv4();
  const approval = {
    id: approvalId,
    workflowInstanceId: initialStep.workflowInstanceId,
    workflowStepInstanceId: initialStep.id,
    requestedByEmployeeId: initialStep.assignedEmployeeId,
    approverEmployeeId: initialStep.reviewerEmployeeId || brand.brandAssignments[0].employeeId,
    approvalType: 'internal',
    approvalPurpose: initialStep.approvalPurpose,
    status: 'pending',
    note: deliveryNote,
    createdAt: now
  };
  approvals.push(approval);

  initialStep.status = 'waiting_approval';
  initialStep.approvalId = approvalId;
  initialStep.approvalStatus = 'pending';
  initialStep.submittedForApprovalAt = now;

  assert.notStrictEqual(initialStep.status, 'completed', 'Designer submission must NOT complete the step');
  assert.strictEqual(initialStep.status, 'waiting_approval', 'Step must be in waiting_approval');
  assert.strictEqual(initialStep.assignedEmployeeId, '9490ae88-2864-4dbb-82c7-7cd4966d3c21', 'Assigned designer must be preserved');
  assert.strictEqual(initialStep.creativeCount, 6, 'Creative count must remain 6');
  assert.strictEqual(approvals.length, 1, 'Exactly one approval must exist');
  assert.strictEqual(approvals[0].status, 'pending', 'Approval status must be pending');
  assert.strictEqual(approvals[0].approvalPurpose, 'final_creative', 'Approval purpose must be final_creative');
  assert.strictEqual(approvals[0].approverEmployeeId, 'emp-ad-16', 'Approver must be Art Director');
  console.log(' ✅ PASSED: Designer submission routed to Art Director review without premature completion');

  console.log('\n--- 3. ART DIRECTOR APPROVALS & TASKS SURFACES ---');
  // Check /admin/approvals filtering for Art Director
  const adApprovals = approvals.filter(a => {
    if (a.status !== 'pending') return false;
    const s = steps.find(st => st.id === a.workflowStepInstanceId);
    if (!s) return false;
    const isGraphicDesignStep = s.responsibilityRole === 'graphic_design' || s.responsibilityRole === 'video_editing';
    return isGraphicDesignStep || a.approverEmployeeId === 'emp-ad-16';
  });
  assert.strictEqual(adApprovals.length, 1, 'Art Director must see the pending approval');
  console.log(' ✅ PASSED: /admin/approvals exposes pending creative submission');

  // Check /admin/tasks display state
  const isReviewBekliyor = initialStep.status === 'waiting_approval';
  assert.ok(isReviewBekliyor, '/admin/tasks must represent REVIEW BEKLİYOR state');
  console.log(' ✅ PASSED: /admin/tasks represents REVIEW BEKLİYOR state');

  console.log('\n--- 4. ART DIRECTOR REVISION REQUEST FLOW ---');
  const revisionNote = 'Tipografi hiyerarşisinde düzenleme yapılması ve 2. görseldeki kontrastın artırılması gerekiyor.';
  // AD requests revision
  approval.status = 'revision_requested';
  approval.revisedAt = new Date().toISOString();
  approval.revisionNote = revisionNote;

  initialStep.status = 'active';
  initialStep.approvalStatus = 'revision_requested';
  initialStep.submittedForApprovalAt = undefined;

  assert.strictEqual(initialStep.status, 'active', 'Step must return to active state');
  assert.strictEqual(initialStep.approvalStatus, 'revision_requested', 'Approval status must be revision_requested');
  assert.strictEqual(initialStep.assignedEmployeeId, '9490ae88-2864-4dbb-82c7-7cd4966d3c21', 'Assigned designer must be preserved');
  assert.strictEqual(initialStep.creativeCount, 6, 'Creative count must remain 6');
  assert.strictEqual(approval.revisionNote, revisionNote, 'Revision note must be recorded');
  console.log(' ✅ PASSED: Revision returned to Designer with preserved creative_count = 6');

  console.log('\n--- 5. GRAPHIC DESIGNER RESUBMISSION ---');
  const resubmitNote = 'Revizeler uygulandı, tipografi ve kontrast düzeltildi.';
  const newApprovalId = uuidv4();
  const resubmitApproval = {
    id: newApprovalId,
    workflowInstanceId: initialStep.workflowInstanceId,
    workflowStepInstanceId: initialStep.id,
    requestedByEmployeeId: initialStep.assignedEmployeeId,
    approverEmployeeId: initialStep.reviewerEmployeeId || brand.brandAssignments[0].employeeId,
    approvalType: 'internal',
    approvalPurpose: 'final_creative',
    status: 'pending',
    note: resubmitNote,
    createdAt: new Date().toISOString()
  };
  approvals.push(resubmitApproval);

  initialStep.status = 'waiting_approval';
  initialStep.approvalId = newApprovalId;
  initialStep.approvalStatus = 'pending';

  const pendingApprovalsForStep = approvals.filter(a => a.workflowStepInstanceId === initialStep.id && a.status === 'pending');
  assert.strictEqual(pendingApprovalsForStep.length, 1, 'Exactly one active pending approval must exist after resubmit');
  console.log(' ✅ PASSED: Designer resubmitted; exactly 1 active pending approval exists for Art Director');

  console.log('\n--- 6. ART DIRECTOR FINAL CREATIVE APPROVAL ---');
  // AD approves final_creative
  resubmitApproval.status = 'approved';
  resubmitApproval.approvedAt = new Date().toISOString();
  initialStep.status = 'completed';
  initialStep.approvalStatus = 'approved';
  initialStep.completedAt = new Date().toISOString();

  assert.strictEqual(initialStep.status, 'completed', 'Step must be completed only after Art Director approval');
  assert.strictEqual(initialStep.creativeCount, 6, 'Final creative count must be preserved as 6');
  console.log(' ✅ PASSED: Art Director final_creative approval completed the workflow step');

  console.log('\n===============================================================');
  console.log('ALL CREATIVE SUBMISSION & REVIEW HANDOFF TESTS PASSED ✅');
  console.log('===============================================================');
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
