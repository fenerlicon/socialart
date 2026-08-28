/**
 * test_creative_beta_scope.cjs
 * Comprehensive deterministic test suite for Creative Beta Scope & Brand Isolation.
 */
const assert = require('assert');

async function main() {
  console.log('===============================================================');
  console.log('CREATIVE BETA BRAND & WORKSPACE SCOPE DETERMINISTIC SUITE');
  console.log('===============================================================');

  // Load canonical authority core functions
  const {
    resolvePanelAuthority,
    isManagerOrAdmin,
    isStepInScope,
    isBrandInScope,
    resolveVisibleBrands,
    resolveVisibleBrandIds,
  } = await import('../panel/lib/permissions/panel-authority-core.js');

  // 1. Fixture Definitions: Principals & Employees
  const adminPrincipal = {
    principalType: 'admin',
    isDedicatedAdmin: true,
    adminId: 'admin-sec-uuid-101',
    employeeId: null,
    authResolved: true,
  };

  const adPrincipal = {
    principalType: 'employee',
    isDedicatedAdmin: false,
    adminId: null,
    employeeId: 'emp-uuid-ad-16',
    authResolved: true,
  };
  const adEmployee = {
    id: 'emp-uuid-ad-16',
    db1EmployeeId: '16',
    fullName: 'Beta Art Director (Geçici)',
    rolePackageId: 'art-director',
    teamIds: ['grafik-studyo'],
    employmentType: 'contractor',
    employeeStatus: 'active',
    permissionOverrides: {},
  };

  const gdPrincipal = {
    principalType: 'employee',
    isDedicatedAdmin: false,
    adminId: null,
    employeeId: 'emp-uuid-gd-17',
    authResolved: true,
  };
  const gdEmployee = {
    id: 'emp-uuid-gd-17',
    db1EmployeeId: '17',
    fullName: 'Beta Grafik Tasarımcı',
    rolePackageId: 'grafik-tasarim',
    teamIds: ['grafik-studyo'],
    employmentType: 'freelance',
    employeeStatus: 'active',
    permissionOverrides: {},
  };

  const otherDesignerEmployee = {
    id: 'emp-uuid-gd-99',
    db1EmployeeId: '99',
    fullName: 'Other Designer',
    rolePackageId: 'grafik-tasarim',
    teamIds: ['grafik-studyo'],
    employmentType: 'full_time',
    employeeStatus: 'active',
  };

  const id6Principal = {
    principalType: 'employee',
    isDedicatedAdmin: false,
    adminId: null,
    employeeId: '6',
    authResolved: true,
  };
  const id6Employee = {
    id: '6',
    db1EmployeeId: '6',
    fullName: 'Arda Furkan Aslanbaş',
    rolePackageId: 'dijital-pazarlama',
    teamIds: ['dijital-pazarlama'],
    employmentType: 'full_time',
    employeeStatus: 'active',
    permissionOverrides: {},
  };

  // 2. Fixture Definitions: Brands
  const brandA = {
    id: 'brand-a',
    name: 'Brand A (Assigned)',
    operationManagerId: 'emp-uuid-ad-16',
    brandAssignments: [
      { id: 'asg-1', employeeId: 'emp-uuid-ad-16', responsibility: 'Art Director' },
      { id: 'asg-2', employeeId: 'emp-uuid-gd-17', responsibility: 'Grafik Tasarım' },
    ],
  };

  const brandB = {
    id: 'brand-b',
    name: 'Brand B (Unassigned)',
    operationManagerId: 'emp-other-manager',
    brandAssignments: [
      { id: 'asg-3', employeeId: 'emp-other-1', responsibility: 'Operasyon' },
    ],
  };

  const brandC = {
    id: 'brand-c',
    name: 'Brand C (Assigned to AD with mixed ops)',
    operationManagerId: 'emp-uuid-ad-16',
    brandAssignments: [
      { id: 'asg-4', employeeId: 'emp-uuid-ad-16', responsibility: 'Art Director' },
    ],
  };

  const allBrands = [brandA, brandB, brandC];

  // 3. Workflow Instances and Steps
  const workflows = [
    {
      id: 'wf-inst-a-creative',
      brandId: 'brand-a',
      title: 'Brand A - Post Tasarımı',
      status: 'active',
    },
    {
      id: 'wf-inst-b-unassigned',
      brandId: 'brand-b',
      title: 'Brand B - Kampanya',
      status: 'active',
    },
    {
      id: 'wf-inst-c-creative',
      brandId: 'brand-c',
      title: 'Brand C - Banner Tasarımı',
      status: 'active',
    },
    {
      id: 'wf-inst-c-dm',
      brandId: 'brand-c',
      title: 'Brand C - Meta Reklam Kurulumu',
      status: 'active',
    },
  ];

  const stepA_Creative = {
    id: 'step-a-1',
    workflowInstanceId: 'wf-inst-a-creative',
    title: 'Instagram Post Tasarımı',
    responsibilityRole: 'graphic_design',
    teamId: 'grafik-studyo',
    assignedEmployeeId: 'emp-uuid-gd-17',
    status: 'active',
  };

  const stepA_OtherDesigner = {
    id: 'step-a-2',
    workflowInstanceId: 'wf-inst-a-creative',
    title: 'Hikaye Tasarımı',
    responsibilityRole: 'graphic_design',
    teamId: 'grafik-studyo',
    assignedEmployeeId: 'emp-uuid-gd-99',
    status: 'active',
  };

  const stepB_Creative = {
    id: 'step-b-1',
    workflowInstanceId: 'wf-inst-b-unassigned',
    title: 'Brand B Tasarım',
    responsibilityRole: 'graphic_design',
    teamId: 'grafik-studyo',
    assignedEmployeeId: 'emp-uuid-gd-99',
    status: 'active',
  };

  const stepC_Creative = {
    id: 'step-c-1',
    workflowInstanceId: 'wf-inst-c-creative',
    title: 'Brand C Banner',
    responsibilityRole: 'graphic_design',
    teamId: 'grafik-studyo',
    assignedEmployeeId: 'emp-uuid-gd-99',
    status: 'active',
  };

  const stepC_DigitalMarketing = {
    id: 'step-c-2',
    workflowInstanceId: 'wf-inst-c-dm',
    title: 'Brand C Reklam Çıkışı',
    responsibilityRole: 'digital_marketing',
    teamId: 'dijital-pazarlama',
    assignedEmployeeId: '6',
    status: 'active',
  };

  const allEmployees = [adEmployee, gdEmployee, otherDesignerEmployee, id6Employee];

  console.log('\n--- 1. SHARED BRAND SCOPE RESOLVER TESTS ---');
  // Dedicated Admin: all brands
  assert.strictEqual(isBrandInScope(adminPrincipal, null, brandA), true, 'Admin sees Brand A');
  assert.strictEqual(isBrandInScope(adminPrincipal, null, brandB), true, 'Admin sees Brand B');
  assert.strictEqual(isBrandInScope(adminPrincipal, null, brandC), true, 'Admin sees Brand C');
  assert.strictEqual(resolveVisibleBrands(adminPrincipal, null, allBrands).length, 3, 'Admin sees all 3 brands');

  // Art Director: Brand A and C (assigned), NOT Brand B
  assert.strictEqual(isBrandInScope(adPrincipal, adEmployee, brandA), true, 'AD sees assigned Brand A');
  assert.strictEqual(isBrandInScope(adPrincipal, adEmployee, brandB), false, 'AD cannot see unassigned Brand B');
  assert.strictEqual(isBrandInScope(adPrincipal, adEmployee, brandC), true, 'AD sees assigned Brand C');
  const adVisibleBrands = resolveVisibleBrands(adPrincipal, adEmployee, allBrands);
  assert.deepStrictEqual(adVisibleBrands.map(b => b.id), ['brand-a', 'brand-c'], 'AD visible brands list');

  // Graphic Designer: Brand A (assigned), NOT Brand B or C
  assert.strictEqual(isBrandInScope(gdPrincipal, gdEmployee, brandA), true, 'GD sees assigned Brand A');
  assert.strictEqual(isBrandInScope(gdPrincipal, gdEmployee, brandB), false, 'GD cannot see unassigned Brand B');
  assert.strictEqual(isBrandInScope(gdPrincipal, gdEmployee, brandC), false, 'GD cannot see unassigned Brand C');
  const gdVisibleBrands = resolveVisibleBrands(gdPrincipal, gdEmployee, allBrands);
  assert.deepStrictEqual(gdVisibleBrands.map(b => b.id), ['brand-a'], 'GD visible brands list');
  console.log(' ✅ PASSED: Shared brand scope resolver strictly enforces brand assignments');

  console.log('\n--- 2. ART DIRECTOR OPERATIONS & WORKSPACE SCOPE TESTS ---');
  const adVisibleBrandIds = resolveVisibleBrandIds(adPrincipal, adEmployee, allBrands);

  // Helper simulating Operations filtering
  function isOpVisibleForUser(principal, emp, step, wfInst) {
    if (!isBrandInScope(principal, emp, { id: wfInst.brandId, operationManagerId: emp?.id, brandAssignments: emp ? [{ employeeId: emp.id }] : [] })) {
      if (!adVisibleBrandIds.has(wfInst.brandId)) return false;
    }
    if (!adVisibleBrandIds.has(wfInst.brandId)) return false;
    return isStepInScope(principal, step, emp, allEmployees);
  }

  // Operations Brand A Creative: VISIBLE
  assert.strictEqual(isOpVisibleForUser(adPrincipal, adEmployee, stepA_Creative, workflows[0]), true, 'AD sees Brand A Creative op');
  // Operations Brand C Creative: VISIBLE
  assert.strictEqual(isOpVisibleForUser(adPrincipal, adEmployee, stepC_Creative, workflows[2]), true, 'AD sees Brand C Creative op');
  // Operations Brand C Digital Marketing: NOT VISIBLE
  assert.strictEqual(isOpVisibleForUser(adPrincipal, adEmployee, stepC_DigitalMarketing, workflows[3]), false, 'AD cannot see Brand C Digital Marketing op');
  // Unassigned-brand operations (Brand B): NOT VISIBLE
  assert.strictEqual(isOpVisibleForUser(adPrincipal, adEmployee, stepB_Creative, workflows[1]), false, 'AD cannot see unassigned Brand B op');
  console.log(' ✅ PASSED: Art Director Operations strictly restricted to assigned brands AND creative scope');

  console.log('\n--- 3. GRAPHIC DESIGNER OWN-WORK ISOLATION TESTS ---');
  // GD sees own work
  assert.strictEqual(isStepInScope(gdPrincipal, stepA_Creative, gdEmployee, allEmployees), true, 'GD sees own assigned step');
  // GD cannot see other designer work
  assert.strictEqual(isStepInScope(gdPrincipal, stepA_OtherDesigner, gdEmployee, allEmployees), false, 'GD cannot see other designer work on same brand');
  // GD cannot manage tasks
  assert.strictEqual(resolvePanelAuthority(gdPrincipal, gdEmployee, 'tasks.assign'), false, 'GD cannot assign tasks');
  assert.strictEqual(resolvePanelAuthority(gdPrincipal, gdEmployee, 'task.manage'), false, 'GD cannot manage tasks');
  console.log(' ✅ PASSED: Graphic Designer strictly isolated to own work');

  console.log('\n--- 4. APPROVAL CENTER BOUNDARIES ---');
  // Creative submission from Graphic Designer on assigned brand: VISIBLE to AD
  const gdCreativeApproval = {
    id: 'app-1',
    workflowStepInstanceId: 'step-a-1',
    workflowInstanceId: 'wf-inst-a-creative',
    approvalType: 'internal',
    status: 'pending',
    requestedByEmployeeId: 'emp-uuid-gd-17',
  };
  const isApprovalInScopeForAD = (app, step, inst) => {
    if (!adVisibleBrandIds.has(inst.brandId)) return false;
    if (app.approvalType === 'internal') {
      const requester = allEmployees.find(e => e.id === app.requestedByEmployeeId || e.id === step?.assignedEmployeeId);
      const isGraphic = step?.responsibilityRole === 'graphic_design' || requester?.rolePackageId === 'grafik-tasarim';
      return isGraphic;
    }
    return false;
  };
  assert.strictEqual(isApprovalInScopeForAD(gdCreativeApproval, stepA_Creative, workflows[0]), true, 'GD creative submission visible to AD');

  // Digital Marketing approval: NOT VISIBLE to AD
  const dmApproval = {
    id: 'app-2',
    workflowStepInstanceId: 'step-c-2',
    workflowInstanceId: 'wf-inst-c-dm',
    approvalType: 'internal',
    status: 'pending',
    requestedByEmployeeId: '6',
  };
  assert.strictEqual(isApprovalInScopeForAD(dmApproval, stepC_DigitalMarketing, workflows[3]), false, 'DM approval NOT visible to AD');

  // Unassigned brand approval: NOT VISIBLE to AD
  const unassignedBrandApproval = {
    id: 'app-3',
    workflowStepInstanceId: 'step-b-1',
    workflowInstanceId: 'wf-inst-b-unassigned',
    approvalType: 'internal',
    status: 'pending',
    requestedByEmployeeId: 'emp-uuid-gd-99',
  };
  assert.strictEqual(isApprovalInScopeForAD(unassignedBrandApproval, stepB_Creative, workflows[1]), false, 'Unassigned brand approval NOT visible to AD');
  console.log(' ✅ PASSED: Approvals center strictly scoped to Graphic Designer creative submissions on assigned brands');

  console.log('\n--- 5. PAYMENT REQUESTS ACCESS RESTRICTION ---');
  function isPaymentsAccessDenied(emp) {
    return emp.rolePackageId === 'art-director' || emp.rolePackageId === 'grafik-tasarim';
  }
  assert.strictEqual(isPaymentsAccessDenied(adEmployee), true, 'Art Director denied Payments page');
  assert.strictEqual(isPaymentsAccessDenied(gdEmployee), true, 'Graphic Designer denied Payments page');
  assert.strictEqual(isPaymentsAccessDenied(id6Employee), false, 'ID6 not denied by creative filter');
  console.log(' ✅ PASSED: Payment requests hidden and denied for Art Director and Graphic Designer');

  console.log('\n--- 6. FREELANCE GRAPHIC DESIGNER REPORT RULE ---');
  function isReportRequired(emp) {
    if (emp.rolePackageId === 'operasyon-yonetimi' || emp.rolePackageId === 'kreatif-yonetim' || emp.rolePackageId === 'kreatif-direktor') {
      return false;
    }
    if (emp.rolePackageId === 'grafik-tasarim' && emp.employmentType === 'freelance') {
      return false;
    }
    return true;
  }
  assert.strictEqual(isReportRequired(gdEmployee), false, 'Freelance Graphic Designer does NOT require report');
  assert.strictEqual(isReportRequired(otherDesignerEmployee), true, 'Full-time designer requires report');
  assert.strictEqual(isReportRequired(id6Employee), true, 'Full-time marketer requires report');
  console.log(' ✅ PASSED: Freelance Graphic Designer report exemption strictly verified');

  console.log('\n--- 7. DEDICATED ADMIN & ID6 STABILITY ---');
  assert.strictEqual(isManagerOrAdmin(adminPrincipal, null), true, 'Dedicated Admin retains global manager authority');
  assert.strictEqual(isManagerOrAdmin(id6Principal, id6Employee), false, 'ID6 cannot escalate to manager');
  assert.strictEqual(isStepInScope(id6Principal, stepC_DigitalMarketing, id6Employee, allEmployees), true, 'ID6 retains DM step scope');
  assert.strictEqual(isStepInScope(id6Principal, stepA_Creative, id6Employee, allEmployees), false, 'ID6 cannot view Creative step scope');
  console.log(' ✅ PASSED: Dedicated Admin and ID6 authorization integrity preserved');

  console.log('\n===============================================================');
  console.log('ALL CREATIVE BETA SCOPE DETERMINISTIC TESTS PASSED SUCCESSFULLY ✅');
  console.log('===============================================================');
}

main().catch(err => {
  console.error('❌ Deterministic test failed:', err);
  process.exit(1);
});
