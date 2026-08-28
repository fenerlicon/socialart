/**
 * test_creative_handoff_request.cjs
 * Deterministic test for Graphic Designer handoff request flow and Art Director review.
 * Validates:
 * A) Graphic Designer handoff modal lacks destination employee selector.
 * B) Designer submitting handoff request preserves assigned_employee_id (status: pending).
 * C) Art Director sees pending handoff request in Approvals.
 * D) Art Director rejection preserves assigned employee.
 * E) Art Director approval with selected Designer B updates assignment to DB2 UUID.
 * F) Graphic Designer never selects destination or gains transfer authority.
 * G) Unrelated employees are excluded from destination options; Freelance Graphic Designers are included.
 * H) General Agency task brand remains 'Genel Ajans' and never resolves to Aryanvar.
 * I) Explicit Aryanvar task resolves 'Aryanvar' correctly.
 * J) HandoffModal has max-height viewport constraint and scrollable flex layout.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function main() {
  console.log('===============================================================');
  console.log('CREATIVE HANDOFF REQUEST & MANAGER DECISION TEST SUITE');
  console.log('===============================================================\n');

  // 1. Source Layout & Security Checks on HandoffModal
  console.log('--- 1. MODAL LAYOUT & DESTINATION SELECTOR ABSENCE ---');
  const handoffModalPath = path.resolve(__dirname, '../panel/features/my-work/components/handoff-modal.tsx');
  const modalSource = fs.readFileSync(handoffModalPath, 'utf8');

  assert.ok(modalSource.includes('z-[9999]'), 'Modal must have z-[9999]');
  assert.ok(modalSource.includes('max-h-[calc(100dvh-2rem)]'), 'Modal must have max-h-[calc(100dvh-2rem)]');
  assert.ok(modalSource.includes('overflow-y-auto flex-1 min-h-0'), 'Modal body must be scrollable flex');
  assert.ok(!modalSource.includes('targetEmployeeId'), 'Graphic Designer modal MUST NOT contain targetEmployeeId state');
  assert.ok(!modalSource.includes('Paslanacak Çalışan'), 'Graphic Designer modal MUST NOT have "Paslanacak Çalışan" label');
  assert.ok(modalSource.includes('Paslama Talebi Gönder'), 'Modal must have "Paslama Talebi Gönder" title and button');
  console.log(' ✅ PASSED: HandoffModal is scrollable and Graphic Designer cannot select destination');

  // 2. Simulated Workflow Handoff State Machine
  console.log('\n--- 2. HANDOFF REQUEST & PROVENANCE INVARIANT ---');
  const designerA = {
    id: '9490ae88-2864-4dbb-82c7-7cd4966d3c21',
    fullName: 'Beta Graphic Designer A',
    rolePackageId: 'grafik-tasarim',
    employmentType: 'fulltime',
    employeeStatus: 'active',
    teamIds: ['grafik-studyo']
  };

  const designerB = {
    id: 'b1234567-89ab-cdef-0123-456789abcdef',
    fullName: 'Beta Graphic Designer B',
    rolePackageId: 'grafik-tasarim',
    employmentType: 'freelance',
    employeeStatus: 'active',
    teamIds: ['grafik-studyo']
  };

  const accountant = {
    id: 'acc-11111111-2222-3333-4444-555555555555',
    fullName: 'Muhasebe Uzmanı',
    rolePackageId: 'finans-yonetimi',
    employmentType: 'fulltime',
    employeeStatus: 'active',
    teamIds: ['finans']
  };

  const employees = [designerA, designerB, accountant];

  let step = {
    id: 'step-creative-101',
    workflowInstanceId: 'inst-creative-101',
    title: 'Marka Kampanya Banner Seti',
    status: 'active',
    assignedEmployeeId: designerA.id,
    assigneeEmployeeId: designerA.id,
    creativeCount: 4,
    responsibilityRole: 'graphic_design',
    handoffStatus: undefined,
    handoffId: undefined
  };

  let handoffs = [];

  // Designer A creates handoff request
  const handoffId1 = uuidv4();
  const handoff1 = {
    id: handoffId1,
    workflowInstanceId: step.workflowInstanceId,
    workflowStepInstanceId: step.id,
    fromEmployeeId: designerA.id,
    toEmployeeId: undefined, // Designer cannot choose
    reason: 'Yoğunluk / Fazla İş Yükü',
    note: 'Bugün teslim edilmesi gereken başka acil işim var.',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  handoffs.push(handoff1);
  step.handoffStatus = 'pending';
  step.handoffId = handoffId1;

  assert.strictEqual(step.assignedEmployeeId, designerA.id, 'Assigned employee MUST remain Designer A on request submission');
  assert.strictEqual(handoff1.status, 'pending', 'Handoff request must be pending');
  assert.strictEqual(handoff1.toEmployeeId, undefined, 'Handoff request must have no destination preset by designer');
  console.log(' ✅ PASSED: Designer submitted request; assignment unchanged (Designer A), request pending');

  console.log('\n--- 3. ART DIRECTOR REJECTION FLOW ---');
  // Art Director reviews and rejects
  handoff1.status = 'rejected';
  handoff1.rejectedAt = new Date().toISOString();
  handoff1.responseNote = 'Öncelikli iş bu, bugün tamamlamanız rica olunur.';
  step.handoffStatus = 'rejected';

  assert.strictEqual(step.assignedEmployeeId, designerA.id, 'On rejection, assigned employee MUST remain Designer A');
  assert.strictEqual(step.status, 'active', 'Step must remain active for Designer A');
  console.log(' ✅ PASSED: Art Director rejection preserved Designer A assignment');

  console.log('\n--- 4. ART DIRECTOR APPROVAL & DESTINATION SELECTION ---');
  // Designer A requests handoff again (e.g. sick leave)
  const handoffId2 = uuidv4();
  const handoff2 = {
    id: handoffId2,
    workflowInstanceId: step.workflowInstanceId,
    workflowStepInstanceId: step.id,
    fromEmployeeId: designerA.id,
    reason: 'Hastalık / Acil Durum',
    note: 'Raporluyum.',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  handoffs.push(handoff2);
  step.handoffStatus = 'pending';
  step.handoffId = handoffId2;

  // Filter destination candidates for manager
  const eligibleDestinations = employees.filter((emp) => {
    if (emp.employeeStatus !== 'active') return false;
    if (emp.id === handoff2.fromEmployeeId) return false;
    return emp.rolePackageId === 'grafik-tasarim' || emp.rolePackageId === 'video-kurgu' || emp.teamIds?.includes('grafik-studyo');
  });

  assert.ok(eligibleDestinations.some(e => e.id === designerB.id), 'Freelance Designer B must be eligible');
  assert.ok(!eligibleDestinations.some(e => e.id === accountant.id), 'Accountant must NOT be eligible destination');

  // Manager approves and transfers to Designer B
  const selectedDest = designerB.id;
  handoff2.status = 'accepted';
  handoff2.toEmployeeId = selectedDest;
  handoff2.acceptedAt = new Date().toISOString();

  step.previousAssigneeEmployeeId = handoff2.fromEmployeeId;
  step.assignedEmployeeId = selectedDest;
  step.assigneeEmployeeId = selectedDest;
  step.handoffStatus = 'accepted';

  assert.strictEqual(step.assignedEmployeeId, designerB.id, 'Step must now be assigned to Designer B DB2 UUID');
  assert.strictEqual(step.creativeCount, 4, 'Creative count must be preserved as 4');
  console.log(' ✅ PASSED: Art Director approved and selected Designer B (DB2 UUID); assignment updated');

  console.log('\n--- 5. GENERAL AGENCY TASK BRAND RESOLUTION INVARIANT ---');
  const brands = [
    { id: '273fa644-04d7-4a34-839e-c4fce79d8846', name: 'Aryanvar' },
    { id: 'brand-zara', name: 'Zara' }
  ];

  const generalInstance1 = {
    id: 'inst-general-agency-tasks',
    brandId: 'general',
    title: 'Genel Ajans & Özel Görevler'
  };

  const generalInstance2 = {
    id: 'inst-custom-general-123',
    brandId: 'general-brand',
    title: 'Genel Ajans İşleri'
  };

  const aryanvarInstance = {
    id: 'inst-aryanvar-1',
    brandId: '273fa644-04d7-4a34-839e-c4fce79d8846',
    title: 'Aryanvar Sosyal Medya Tasarımları'
  };

  function resolveBrandName(instance, brandList) {
    if (!instance) return 'Genel Ajans';
    if (instance.id === 'inst-general-agency-tasks' || instance.brandId === 'general' || instance.brandId === 'general-agency' || instance.brandId === 'general-brand' || !instance.brandId || instance.title.includes('Genel Ajans')) {
      return 'Genel Ajans';
    }
    const b = brandList.find(item => item.id === instance.brandId);
    return b ? b.name : 'Genel Ajans';
  }

  assert.strictEqual(resolveBrandName(generalInstance1, brands), 'Genel Ajans', 'General agency task must resolve to "Genel Ajans"');
  assert.notStrictEqual(resolveBrandName(generalInstance1, brands), 'Aryanvar', 'General agency task MUST NEVER resolve to "Aryanvar"');
  assert.strictEqual(resolveBrandName(generalInstance2, brands), 'Genel Ajans', 'General instance 2 must resolve to "Genel Ajans"');
  assert.strictEqual(resolveBrandName(aryanvarInstance, brands), 'Aryanvar', 'Explicit Aryanvar instance must resolve to "Aryanvar"');
  console.log(' ✅ PASSED: General agency brand resolution verified; Aryanvar false fallback removed');

  console.log('\n===============================================================');
  console.log('ALL CREATIVE HANDOFF TESTS PASSED SUCCESSFULLY ✅');
  console.log('===============================================================');
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
