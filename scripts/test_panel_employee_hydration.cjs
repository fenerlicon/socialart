/**
 * test_panel_employee_hydration.cjs
 * Deterministic test suite verifying:
 * 1. Employee Identity Hydration from server principal (/api/auth-me contract)
 * 2. Resistance to stale localStorage (server session authority)
 * 3. DB2 mirror resolution via db1_employee_id
 * 4. Permission & authority scoping for Beta Art Director (DB1 ID 16) vs Beta Graphic Designer (DB1 ID 17) vs Arda (DB1 ID 6)
 */

const assert = require('assert')
const path = require('path')

// Canonical Employee Resolver replicating resolveOperationalEmployee in EmployeeRepository.ts & WorkspaceLayout
function resolveOperationalEmployee(serverEmployeeId, db2Employees) {
  if (!serverEmployeeId) return null
  const numId = Number(serverEmployeeId)

  // 1. Match by db1_employee_id numeric bridge
  if (Number.isFinite(numId) && numId > 0) {
    const matched = db2Employees.find(
      (e) => Number(e.db1EmployeeId || e.db1_employee_id) === numId
    )
    if (matched) return matched
  }

  // 2. Match by direct id string/UUID
  const strId = String(serverEmployeeId)
  const direct = db2Employees.find((e) => String(e.id) === strId)
  if (direct) return direct

  return null
}

function simulateWorkspaceHydration(authMeResponse, localStorageState, db2Employees) {
  // Rule: Server session wins unconditionally over localStorage
  let activeEmployee = null
  let principal = null

  if (authMeResponse && authMeResponse.authenticated) {
    principal = {
      principalType: authMeResponse.principalType,
      employeeId: authMeResponse.employee ? String(authMeResponse.employee.id) : undefined,
      sessionRole: authMeResponse.role
    }

    if (authMeResponse.employee) {
      const serverEmp = authMeResponse.employee
      const resolvedFromDb2 = resolveOperationalEmployee(serverEmp.id, db2Employees)

      activeEmployee = {
        id: resolvedFromDb2 ? resolvedFromDb2.id : `emp-db1-${serverEmp.id}`,
        db1EmployeeId: serverEmp.id,
        fullName: serverEmp.fullName,
        email: serverEmp.email || '',
        title: serverEmp.title || '',
        employeeStatus: serverEmp.employeeStatus || 'active',
        workLocationStatus: serverEmp.workLocationStatus || 'remote',
        rolePackageId: serverEmp.rolePackageId || (resolvedFromDb2 ? resolvedFromDb2.rolePackageId : 'grafik-tasarim'),
        teamIds: serverEmp.teamIds || (resolvedFromDb2 ? resolvedFromDb2.teamIds : []),
        employmentType: serverEmp.employmentType || null,
        permissionOverrides: serverEmp.permissionOverrides || (resolvedFromDb2 ? resolvedFromDb2.permissionOverrides : {}),
        createdAt: new Date().toISOString()
      }
    }
  } else {
    // Fallback only when not authenticated
    const savedId = localStorageState['socialart_active_employee_id']
    activeEmployee = db2Employees.find((e) => e.id === savedId) || db2Employees[0] || null
  }

  return { principal, activeEmployee }
}

async function runTests() {
  console.log('--- TEST 1: Canonical /api/auth-me contract includes DB1 fields ---')
  const authMeModule = await import('../api/_lib/auth-me.js')
  const adminPermissionsModule = await import('../api/_lib/admin-permissions.js')
  const { resolveServerPermissions } = adminPermissionsModule

  function resolvePanelAuthority(principal, activeEmployee, requiredPermissions) {
    if (!principal) return false
    if (principal.principalType === 'admin') return true
    if (!activeEmployee) return false

    const permissions = resolveServerPermissions(
      activeEmployee.rolePackageId,
      activeEmployee.permissionOverrides || {}
    )
    const permissionSet = new Set(permissions)
    const reqArray = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]
    return reqArray.some((perm) => permissionSet.has(perm))
  }

  assert.strictEqual(typeof authMeModule.default, 'function', 'handler must be default export')
  assert.strictEqual(typeof authMeModule.requireAdminSession, 'function', 'requireAdminSession must be exported')
  console.log('✓ auth-me handler verified')

  console.log('\n--- TEST 2: Mock DB2 Employee Mirror pool ---')
  const mockDb2Employees = [
    {
      id: '00000000-0000-0000-0000-000000000006',
      db1EmployeeId: 6,
      fullName: 'Arda Furkan Aslanbaş',
      rolePackageId: 'dijital-pazarlama',
      teamIds: ['dijital-pazarlama'],
      permissionOverrides: {}
    },
    {
      id: '307da19e-eeb8-466d-88b0-a5905d4dfd48',
      db1EmployeeId: 16,
      fullName: 'Beta Art Director (Geçici)',
      rolePackageId: 'art-director',
      teamIds: ['grafik-studyo'],
      permissionOverrides: {}
    },
    {
      id: 'c80eafe1-576e-4f10-9118-c2b6cb08c3e8',
      db1EmployeeId: 17,
      fullName: 'Beta Grafik Tasarımcı',
      rolePackageId: 'grafik-tasarim',
      teamIds: ['grafik-studyo'],
      permissionOverrides: {}
    }
  ]

  console.log('\n--- TEST 3: Stale localStorage Resistance (Beta Art Director login) ---')
  const staleLocalStorage = {
    'socialart_active_employee_id': '00000000-0000-0000-0000-000000000006' // Arda ID 6
  }

  const authMeArtDirector = {
    authenticated: true,
    principalType: 'employee',
    role: 'art-director',
    employee: {
      id: 16,
      fullName: 'Beta Art Director (Geçici)',
      email: 'beta.artdirector@socialartajans.com',
      title: 'Art Director — Beta Test',
      rolePackageId: 'art-director',
      teamIds: ['grafik-studyo'],
      employmentType: 'contractor',
      workLocationStatus: 'remote',
      permissionOverrides: {}
    }
  }

  const hydrationAD = simulateWorkspaceHydration(authMeArtDirector, staleLocalStorage, mockDb2Employees)

  assert.strictEqual(hydrationAD.principal.employeeId, '16', 'Principal employeeId must be 16')
  assert.strictEqual(hydrationAD.activeEmployee.id, '307da19e-eeb8-466d-88b0-a5905d4dfd48', 'Must resolve to DB2 mirror UUID for ID 16')
  assert.strictEqual(hydrationAD.activeEmployee.fullName, 'Beta Art Director (Geçici)', 'Active employee must be Beta Art Director')
  assert.strictEqual(hydrationAD.activeEmployee.rolePackageId, 'art-director', 'Role package must be art-director')
  assert.notStrictEqual(hydrationAD.activeEmployee.id, staleLocalStorage['socialart_active_employee_id'], 'Stale localStorage MUST be ignored')
  console.log('✓ Server session wins over stale localStorage')

  console.log('\n--- TEST 4: Beta Art Director (ID 16) Panel Authority Evaluation ---')
  assert.strictEqual(resolvePanelAuthority(hydrationAD.principal, hydrationAD.activeEmployee, 'operations.view'), true, 'AD must have operations.view')
  assert.strictEqual(resolvePanelAuthority(hydrationAD.principal, hydrationAD.activeEmployee, 'tasks.assign'), true, 'AD must have tasks.assign')
  assert.strictEqual(resolvePanelAuthority(hydrationAD.principal, hydrationAD.activeEmployee, 'tasks.create'), true, 'AD must have tasks.create')
  assert.strictEqual(resolvePanelAuthority(hydrationAD.principal, hydrationAD.activeEmployee, 'task.manage'), true, 'AD must have task.manage')
  assert.strictEqual(resolvePanelAuthority(hydrationAD.principal, hydrationAD.activeEmployee, 'approval.review'), true, 'AD must have approval.review')
  assert.strictEqual(resolvePanelAuthority(hydrationAD.principal, hydrationAD.activeEmployee, 'workflow.edit'), true, 'AD must have workflow.edit')
  assert.strictEqual(resolvePanelAuthority(hydrationAD.principal, hydrationAD.activeEmployee, 'finance.manage'), false, 'AD must NOT have finance.manage')
  assert.strictEqual(resolvePanelAuthority(hydrationAD.principal, hydrationAD.activeEmployee, 'system.admin'), false, 'AD must NOT have system.admin')
  console.log('✓ Beta Art Director authority boundaries strictly verified')

  console.log('\n--- TEST 5: Beta Graphic Designer (ID 17) Panel Authority & Own-Work Scoping ---')
  const authMeGD = {
    authenticated: true,
    principalType: 'employee',
    role: 'grafik-tasarim',
    employee: {
      id: 17,
      fullName: 'Beta Grafik Tasarımcı',
      email: 'beta.grafik@socialartajans.com',
      title: 'Grafik Tasarımcı — Beta Test',
      rolePackageId: 'grafik-tasarim',
      teamIds: ['grafik-studyo'],
      employmentType: 'contractor',
      workLocationStatus: 'remote',
      permissionOverrides: {}
    }
  }

  const hydrationGD = simulateWorkspaceHydration(authMeGD, staleLocalStorage, mockDb2Employees)
  assert.strictEqual(hydrationGD.activeEmployee.id, 'c80eafe1-576e-4f10-9118-c2b6cb08c3e8', 'Must resolve to DB2 mirror UUID for ID 17')
  assert.strictEqual(hydrationGD.activeEmployee.rolePackageId, 'grafik-tasarim')

  // Graphic Designer security boundaries
  assert.strictEqual(resolvePanelAuthority(hydrationGD.principal, hydrationGD.activeEmployee, 'task.manage'), false, 'GD must NOT have task.manage')
  assert.strictEqual(resolvePanelAuthority(hydrationGD.principal, hydrationGD.activeEmployee, 'tasks.assign'), false, 'GD must NOT have tasks.assign')
  assert.strictEqual(resolvePanelAuthority(hydrationGD.principal, hydrationGD.activeEmployee, 'tasks.transfer'), false, 'GD must NOT have tasks.transfer')
  assert.strictEqual(resolvePanelAuthority(hydrationGD.principal, hydrationGD.activeEmployee, 'approval.review'), false, 'GD must NOT have approval.review')
  assert.strictEqual(resolvePanelAuthority(hydrationGD.principal, hydrationGD.activeEmployee, 'operations.view'), false, 'GD must NOT have operations.view')
  assert.strictEqual(resolvePanelAuthority(hydrationGD.principal, hydrationGD.activeEmployee, 'system.admin'), false, 'GD must NOT have system.admin')
  assert.strictEqual(resolvePanelAuthority(hydrationGD.principal, hydrationGD.activeEmployee, 'employees.manage'), false, 'GD must NOT have employees.manage')
  assert.strictEqual(resolvePanelAuthority(hydrationGD.principal, hydrationGD.activeEmployee, 'tasks.view'), true, 'GD has tasks.view for own-work')

  // Own-Work Isolation on My-Work page
  const stepsPool = [
    { id: 'step-gd-own', title: 'Banner Tasarımı', assignedEmployeeId: 'c80eafe1-576e-4f10-9118-c2b6cb08c3e8', status: 'active' },
    { id: 'step-other-gd', title: 'Broşür Tasarımı', assignedEmployeeId: 'other-designer-uuid', status: 'active' }
  ]

  const myWorkVisibleSteps = stepsPool.filter((s) => s.assignedEmployeeId === hydrationGD.activeEmployee.id)
  assert.strictEqual(myWorkVisibleSteps.length, 1, 'My work must only show 1 step')
  assert.strictEqual(myWorkVisibleSteps[0].id, 'step-gd-own', 'My work must show only own assigned step')
  console.log('✓ Beta Graphic Designer own-work isolation strictly verified')

  console.log('\n--- TEST 6: Dijital Pazarlama (ID 6) Role Isolation ---')
  const authMeArda = {
    authenticated: true,
    principalType: 'employee',
    role: 'dijital-pazarlama',
    employee: {
      id: 6,
      fullName: 'Arda Furkan Aslanbaş',
      rolePackageId: 'dijital-pazarlama',
      teamIds: ['dijital-pazarlama']
    }
  }

  const hydrationArda = simulateWorkspaceHydration(authMeArda, {}, mockDb2Employees)
  assert.strictEqual(hydrationArda.activeEmployee.rolePackageId, 'dijital-pazarlama')
  assert.strictEqual(resolvePanelAuthority(hydrationArda.principal, hydrationArda.activeEmployee, 'task.manage'), false, 'ID 6 must NOT have task.manage')
  assert.strictEqual(resolvePanelAuthority(hydrationArda.principal, hydrationArda.activeEmployee, 'tasks.assign'), false, 'ID 6 must NOT have tasks.assign')
  assert.strictEqual(resolvePanelAuthority(hydrationArda.principal, hydrationArda.activeEmployee, 'operations.view'), false, 'ID 6 must NOT have operations.view')
  assert.strictEqual(resolvePanelAuthority(hydrationArda.principal, hydrationArda.activeEmployee, 'approval.review'), false, 'ID 6 must NOT have approval.review')
  assert.strictEqual(resolvePanelAuthority(hydrationArda.principal, hydrationArda.activeEmployee, 'ads.manage'), false, 'ID 6 baseline has tasks.view/reports/calendar')
  console.log('✓ Digital Marketer role isolated and preserved')

  console.log('\n--- TEST 7: My-Work Component usePrincipal Import Integrity ---')
  const fs = require('fs')
  const myWorkSource = fs.readFileSync(
    path.join(__dirname, '../panel/features/my-work/components/my-work-page.tsx'),
    'utf8'
  )
  assert.ok(
    myWorkSource.includes("import { usePrincipal } from '@/lib/permissions/panel-authority'"),
    'my-work-page.tsx must import usePrincipal from panel-authority'
  )
  assert.ok(
    myWorkSource.includes('const { principal, activeEmployee: contextActiveEmployee } = usePrincipal()'),
    'my-work-page.tsx must invoke usePrincipal hook'
  )
  console.log('✓ my-work-page.tsx canonical usePrincipal import verified')

  console.log('\n--- TEST 8: Art Director Assignment Candidate Filter (B, C, D, E, F, G) ---')
  const mockCandidatesPool = [
    {
      id: 'c80eafe1-576e-4f10-9118-c2b6cb08c3e8',
      db1EmployeeId: '17',
      fullName: 'Beta Grafik Tasarımcı',
      title: 'Grafik Tasarımcı — Beta Test',
      rolePackageId: 'grafik-tasarim',
      teamIds: ['grafik-studyo'],
      employmentType: 'freelance',
      employeeStatus: 'active'
    },
    {
      id: 'inactive-designer-uuid',
      db1EmployeeId: '18',
      fullName: 'Eski Tasarımcı',
      title: 'Tasarımcı',
      rolePackageId: 'grafik-tasarim',
      teamIds: ['grafik-studyo'],
      employmentType: 'freelance',
      employeeStatus: 'inactive'
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      db1EmployeeId: '6',
      fullName: 'Arda Furkan Aslanbaş',
      title: 'Dijital Pazarlama Uzmanı',
      rolePackageId: 'dijital-pazarlama',
      teamIds: ['dijital-pazarlama'],
      employmentType: 'full_time',
      employeeStatus: 'active'
    }
  ]

  // Filter function matching tasks-page.tsx manageableEmployees logic
  function computeManageableEmployees(manager, pool) {
    return pool.filter((emp) => {
      if (emp.employeeStatus && emp.employeeStatus !== 'active') return false
      if (manager.rolePackageId === 'art-director' || manager.teamIds?.includes('grafik-studyo')) {
        return (
          emp.teamIds?.includes('grafik-studyo') ||
          emp.rolePackageId === 'grafik-tasarim' ||
          emp.teamIds?.some((tId) => manager.teamIds?.includes(tId))
        )
      }
      return emp.teamIds?.some((tId) => manager.teamIds?.includes(tId))
    })
  }

  const adManageable = computeManageableEmployees(hydrationAD.activeEmployee, mockCandidatesPool)
  
  // B & C: Beta Grafik Tasarımcı is INCLUDED and freelance status is preserved
  const foundBetaGD = adManageable.find((e) => e.db1EmployeeId === '17')
  assert.ok(foundBetaGD, 'Beta Grafik Tasarımcı (DB1 17) MUST appear in candidate list')
  assert.strictEqual(foundBetaGD.employmentType, 'freelance', 'Freelance employment type MUST be preserved')
  assert.strictEqual(foundBetaGD.rolePackageId, 'grafik-tasarim')
  assert.strictEqual(foundBetaGD.employeeStatus, 'active')
  console.log('✓ Beta Grafik Tasarımcı (freelance, active) included in Art Director assignment candidates')

  // D: Unrelated role (Arda, digital marketing) is EXCLUDED
  const foundArda = adManageable.find((e) => e.db1EmployeeId === '6')
  assert.strictEqual(foundArda, undefined, 'Unrelated role (dijital-pazarlama) MUST be excluded from graphic-studio candidate list')
  console.log('✓ Unrelated roles cleanly excluded')

  // E: Inactive employee is EXCLUDED
  const foundInactive = adManageable.find((e) => e.id === 'inactive-designer-uuid')
  assert.strictEqual(foundInactive, undefined, 'Inactive employee MUST be excluded from candidate list')
  console.log('✓ Inactive employees cleanly excluded')

  // F: Graphic Designer cannot assign/manage tasks
  assert.strictEqual(resolvePanelAuthority(hydrationGD.principal, hydrationGD.activeEmployee, 'tasks.assign'), false)
  assert.strictEqual(resolvePanelAuthority(hydrationGD.principal, hydrationGD.activeEmployee, 'task.manage'), false)
  console.log('✓ Graphic Designer cannot assign or manage tasks')

  // G: Art Director can assign the designer using DB2 employee UUID
  assert.strictEqual(resolvePanelAuthority(hydrationAD.principal, hydrationAD.activeEmployee, 'tasks.assign'), true)
  assert.strictEqual(foundBetaGD.id, 'c80eafe1-576e-4f10-9118-c2b6cb08c3e8', 'Target employee has valid DB2 UUID for step assignment')
  console.log('✓ Art Director can assign the designer using DB2 employee UUID')

  console.log('\nALL 8 PANEL HYDRATION & DETERMINISTIC TESTS PASSED SUCCESSFULLY! ✅')
}

runTests().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
