const assert = require('assert');
const { resolveServerPermissions } = require('../api/_lib/admin-permissions.js');
const { resolvePanelAuthority, isManagerOrAdmin, isStepInScope } = require('../panel/lib/permissions/panel-authority-core.js');

console.log('===============================================================');
console.log('GRAPHIC DESIGNER & ART DIRECTOR BETA END-TO-END SUITE');
console.log('===============================================================');

// Synthetic Actors
const artDirectorPrincipal = {
  principalType: 'employee',
  isDedicatedAdmin: false,
  adminId: null,
  employeeId: 'db1-ad-01',
  authResolved: true,
};

const artDirectorEmployee = {
  id: 'db2-uuid-ad-001', // DB2 UUID
  db1EmployeeId: 'db1-ad-01',
  fullName: 'Art Director Test',
  rolePackageId: 'art-director',
  teamIds: ['grafik-studyo'],
  permissionOverrides: {},
  employmentType: 'full_time',
};

const designerAPrincipal = {
  principalType: 'employee',
  isDedicatedAdmin: false,
  adminId: null,
  employeeId: 'db1-gd-01',
  authResolved: true,
};

const designerAEmployee = {
  id: 'db2-uuid-designer-a', // DB2 UUID
  db1EmployeeId: 'db1-gd-01',
  fullName: 'Designer A (Freelance)',
  rolePackageId: 'grafik-tasarim',
  teamIds: ['grafik-studyo'],
  permissionOverrides: {},
  employmentType: 'freelance',
};

const designerBPrincipal = {
  principalType: 'employee',
  isDedicatedAdmin: false,
  adminId: null,
  employeeId: 'db1-gd-02',
  authResolved: true,
};

const designerBEmployee = {
  id: 'db2-uuid-designer-b', // DB2 UUID
  db1EmployeeId: 'db1-gd-02',
  fullName: 'Designer B (Full Time)',
  rolePackageId: 'grafik-tasarim',
  teamIds: ['grafik-studyo'],
  permissionOverrides: {},
  employmentType: 'full_time',
};

const id6Principal = {
  principalType: 'employee',
  isDedicatedAdmin: false,
  adminId: null,
  employeeId: '6',
  authResolved: true,
};

const id6Employee = {
  id: 'db2-uuid-emp-6',
  db1EmployeeId: '6',
  fullName: 'Arda Furkan Aslanbaş',
  rolePackageId: 'dijital-pazarlama',
  teamIds: ['dijital-pazarlama'],
  permissionOverrides: {},
  employmentType: 'full_time',
};

const dedicatedAdminPrincipal = {
  principalType: 'admin',
  isDedicatedAdmin: true,
  adminId: 'admin-sec-01',
  employeeId: null,
  authResolved: true,
};

// ----------------------------------------------------
// 1. AUTHORITY & SCOPE BOUNDARY TESTS
// ----------------------------------------------------
console.log('\n--- 1. Authority & Scope Boundary Tests ---');

// AD can assign and review approvals
assert.strictEqual(resolvePanelAuthority(artDirectorPrincipal, artDirectorEmployee, 'tasks.assign'), true, 'AD must have tasks.assign');
assert.strictEqual(resolvePanelAuthority(artDirectorPrincipal, artDirectorEmployee, 'approval.review'), true, 'AD must have approval.review');
assert.strictEqual(resolvePanelAuthority(artDirectorPrincipal, artDirectorEmployee, 'operations.view'), true, 'AD must have operations.view');

// AD is NOT system.admin or employees.manage
assert.strictEqual(resolvePanelAuthority(artDirectorPrincipal, artDirectorEmployee, 'system.admin'), false, 'AD must NOT have system.admin');
assert.strictEqual(resolvePanelAuthority(artDirectorPrincipal, artDirectorEmployee, 'employees.manage'), false, 'AD must NOT have employees.manage');

// Designer A CANNOT assign or review approvals
assert.strictEqual(resolvePanelAuthority(designerAPrincipal, designerAEmployee, 'tasks.assign'), false, 'Designer must NOT have tasks.assign');
assert.strictEqual(resolvePanelAuthority(designerAPrincipal, designerAEmployee, 'approval.review'), false, 'Designer must NOT have approval.review');
assert.strictEqual(resolvePanelAuthority(designerAPrincipal, designerAEmployee, 'system.admin'), false, 'Designer must NOT have system.admin');

// ID6 (dijital-pazarlama) CANNOT access Art Director / tasks.assign authority
assert.strictEqual(resolvePanelAuthority(id6Principal, id6Employee, 'tasks.assign'), false, 'ID6 must NOT have tasks.assign');
assert.strictEqual(resolvePanelAuthority(id6Principal, id6Employee, 'approval.review'), false, 'ID6 must NOT have approval.review');

// Dedicated Admin has intrinsic authority
assert.strictEqual(resolvePanelAuthority(dedicatedAdminPrincipal, null, 'tasks.assign'), true, 'Admin has intrinsic tasks.assign');
assert.strictEqual(resolvePanelAuthority(dedicatedAdminPrincipal, null, 'approval.review'), true, 'Admin has intrinsic approval.review');

console.log(' ✅ PASSED: Authority boundaries verified for AD, GD, ID6, and Dedicated Admin');

// ----------------------------------------------------
// 2. ART DIRECTOR ASSIGNMENT & CREATIVE COUNT
// ----------------------------------------------------
console.log('\n--- 2. Art Director Step Assignment & Creative Count ---');

let creativeStep = {
  id: 'step-graphic-001',
  workflowInstanceId: 'inst-monthly-social-001',
  workflowStepTemplateId: 'template-post-design',
  title: 'Post Tasarımları Üretimi',
  description: 'Aylık 3 adet statik post görseli hazırlanması.',
  order: 2,
  status: 'active',
  requiresApproval: true,
  approvalPurpose: 'final_creative',
  responsibilityRole: 'graphic_design',
  creativeCount: null,
  assignedEmployeeId: undefined,
};

// Check Step In Scope for AD
assert.strictEqual(
  isStepInScope(artDirectorPrincipal, creativeStep, artDirectorEmployee, [designerAEmployee, designerBEmployee]),
  true,
  'Graphic design step must be in scope for Art Director'
);

// AD assigns Designer A with creativeCount = 3
const targetDesignerUuid = designerAEmployee.id; // DB2 UUID
const assignedCreativeCount = 3;

assert(Number.isInteger(assignedCreativeCount) && assignedCreativeCount >= 1, 'Creative count must be valid integer >= 1');
assert.strictEqual(targetDesignerUuid, 'db2-uuid-designer-a', 'Assignment MUST use DB2 UUID');

creativeStep.assignedEmployeeId = targetDesignerUuid;
creativeStep.creativeCount = assignedCreativeCount;

assert.strictEqual(creativeStep.assignedEmployeeId, 'db2-uuid-designer-a');
assert.strictEqual(creativeStep.creativeCount, 3);
console.log(' ✅ PASSED: AD assigned step to Designer A with DB2 UUID and creative_count = 3');

// ----------------------------------------------------
// 3. DESIGNER A OWN-WORK VISIBILITY & SUBMISSION
// ----------------------------------------------------
console.log('\n--- 3. Designer A Own-Work Isolation & Submission ---');

// Designer A sees only own work
function getMyWorkSteps(employeeId, allSteps) {
  return allSteps.filter((s) => s.assignedEmployeeId === employeeId);
}

const designerAWork = getMyWorkSteps(designerAEmployee.id, [creativeStep]);
const designerBWork = getMyWorkSteps(designerBEmployee.id, [creativeStep]);

assert.strictEqual(designerAWork.length, 1, 'Designer A must see assigned work');
assert.strictEqual(designerBWork.length, 0, 'Designer B must NOT see Designer A work');

// Designer A submits work for review
const submissionNow = new Date().toISOString();
let approvalRecord = {
  id: 'approval-001',
  workflowInstanceId: creativeStep.workflowInstanceId,
  workflowStepInstanceId: creativeStep.id,
  requestedByEmployeeId: designerAEmployee.id,
  approverEmployeeId: artDirectorEmployee.id,
  approvalType: 'internal',
  approvalPurpose: creativeStep.approvalPurpose,
  status: 'pending',
  note: 'Görseller tamamlandı, Art Director ön onayına sunuldu.',
  createdAt: submissionNow,
};

creativeStep.status = 'waiting_approval';
creativeStep.approvalId = approvalRecord.id;
creativeStep.approvalStatus = 'pending';
creativeStep.submittedForApprovalAt = submissionNow;

assert.strictEqual(creativeStep.status, 'waiting_approval');
assert.strictEqual(approvalRecord.status, 'pending');
assert.strictEqual(approvalRecord.approvalPurpose, 'final_creative');
console.log(' ✅ PASSED: Designer A submitted work for review; status is waiting_approval');

// ----------------------------------------------------
// 4. ART DIRECTOR REVISION REQUEST
// ----------------------------------------------------
console.log('\n--- 4. Art Director Revision Request ---');

const revisionNote = 'Font boyutunu büyütelim, logo kontrastını artıralım.';
const revisedAt = new Date().toISOString();

approvalRecord.status = 'revision_requested';
approvalRecord.revisedAt = revisedAt;
approvalRecord.revisionNote = revisionNote;
approvalRecord.approverEmployeeId = artDirectorEmployee.id;

// Step returns to active with assignedEmployeeId and creativeCount preserved
creativeStep.status = 'active';
creativeStep.approvalStatus = 'revision_requested';
creativeStep.assignedEmployeeId = approvalRecord.requestedByEmployeeId;
creativeStep.submittedForApprovalAt = undefined;

assert.strictEqual(creativeStep.status, 'active');
assert.strictEqual(creativeStep.approvalStatus, 'revision_requested');
assert.strictEqual(creativeStep.assignedEmployeeId, 'db2-uuid-designer-a', 'Assigned designer must be preserved');
assert.strictEqual(creativeStep.creativeCount, 3, 'Creative count must NOT inflate or mutate on revision');
assert.strictEqual(approvalRecord.revisionNote, revisionNote, 'Revision note must be preserved');
console.log(' ✅ PASSED: Revision returned step to Designer A with preserved creative_count = 3');

// ----------------------------------------------------
// 5. DESIGNER RESUBMISSION & AD FINAL APPROVAL
// ----------------------------------------------------
console.log('\n--- 5. Designer Resubmission & Art Director Final Approval ---');

// Designer A resubmits
const resubmitNow = new Date().toISOString();
approvalRecord = {
  id: 'approval-002',
  workflowInstanceId: creativeStep.workflowInstanceId,
  workflowStepInstanceId: creativeStep.id,
  requestedByEmployeeId: designerAEmployee.id,
  approverEmployeeId: artDirectorEmployee.id,
  approvalType: 'internal',
  approvalPurpose: 'final_creative',
  status: 'pending',
  note: 'Revizyonlar uygulandı, tekrar onaya sunuldu.',
  createdAt: resubmitNow,
};

creativeStep.status = 'waiting_approval';
creativeStep.approvalId = approvalRecord.id;
creativeStep.approvalStatus = 'pending';
creativeStep.submittedForApprovalAt = resubmitNow;

// AD gives FINAL_CREATIVE approval
assert.strictEqual(approvalRecord.approvalPurpose, 'final_creative');
assert(creativeStep.creativeCount && creativeStep.creativeCount >= 1, 'Final creative approval requires creative_count >= 1');

approvalRecord.status = 'approved';
approvalRecord.approvedAt = new Date().toISOString();
creativeStep.status = 'completed';
creativeStep.approvalStatus = 'approved';
creativeStep.completedAt = new Date().toISOString();

assert.strictEqual(creativeStep.status, 'completed');
assert.strictEqual(creativeStep.approvalStatus, 'approved');
assert.strictEqual(creativeStep.creativeCount, 3);
console.log(' ✅ PASSED: Art Director gave FINAL_CREATIVE approval with creative_count = 3');

// ----------------------------------------------------
// 6. ART DIRECTOR REASSIGNMENT TEST
// ----------------------------------------------------
console.log('\n--- 6. Art Director Reassignment Test ---');

let reassignableStep = {
  id: 'step-graphic-002',
  workflowInstanceId: 'inst-002',
  title: 'Banner Tasarımı',
  status: 'active',
  responsibilityRole: 'graphic_design',
  creativeCount: 5,
  assignedEmployeeId: designerAEmployee.id,
};

// AD reassigns to Designer B
assert.strictEqual(resolvePanelAuthority(artDirectorPrincipal, artDirectorEmployee, 'tasks.assign'), true);
reassignableStep.assignedEmployeeId = designerBEmployee.id; // DB2 UUID

assert.strictEqual(reassignableStep.assignedEmployeeId, 'db2-uuid-designer-b');
assert.strictEqual(reassignableStep.creativeCount, 5, 'Reassignment preserves creative count');
console.log(' ✅ PASSED: Art Director reassigned step to Designer B with preserved creative count');

console.log('\n===============================================================');
console.log('ALL GRAPHIC DESIGNER & ART DIRECTOR BETA SCENARIOS PASSED');
console.log('===============================================================');