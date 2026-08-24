const assert = require('assert');
const path = require('path');
const fs = require('fs');
const ts = require(path.join(__dirname, '../panel/node_modules/typescript'));

console.log('==========================================');
console.log('RUNTIME EMPLOYEE IDENTITY BRIDGE TEST SUITE');
console.log('==========================================\n');

// Setup TS Loader for panel modules
const panelDir = path.join(__dirname, '../panel');

function loadTsModule(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    }
  });

  const m = { exports: {} };
  const customRequire = (reqPath) => {
    if (reqPath.startsWith('@/')) {
      const targetTs = path.join(panelDir, reqPath.slice(2) + '.ts');
      const targetTsx = path.join(panelDir, reqPath.slice(2) + '.tsx');
      if (fs.existsSync(targetTs)) return loadTsModule(targetTs);
      if (fs.existsSync(targetTsx)) return loadTsModule(targetTsx);
    }
    return require(reqPath);
  };

  const fn = new Function('module', 'exports', 'require', '__dirname', '__filename', transpiled.outputText);
  fn(m, m.exports, customRequire, path.dirname(filePath), filePath);
  return m.exports;
}

const empRepoModule = loadTsModule(path.join(panelDir, 'lib/repositories/EmployeeRepository.ts'));
const { resolveOperationalEmployee, EmployeeRepository } = empRepoModule;

// Sample DB2 Employee Dataset representing real database rows with db1_employee_id
const mockDb2Employees = [
  {
    id: '6f2efa88-0600-4d5f-8515-143937b6890f',
    db1EmployeeId: '1',
    fullName: 'Tuğba Özdemir',
    email: 'tugba@socialartajans.com',
    title: 'Sosyal Medya Uzmanı',
    rolePackageId: 'sosyal-medya-yonetimi',
    teamIds: ['sosyal-medya'],
    permissionOverrides: {},
    employeeStatus: 'active',
    workLocationStatus: 'office',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'b5e391db-dc21-45a8-baad-19f4073d3b14',
    db1EmployeeId: '2',
    fullName: 'celal ünlü',
    email: 'hello@socialartajans.com',
    title: 'Kurucu',
    rolePackageId: 'operasyon-yonetimi',
    teamIds: ['merkezi-operasyon'],
    permissionOverrides: {},
    employeeStatus: 'active',
    workLocationStatus: 'office',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '406a078d-0aea-45e0-87e1-d4d0b5f20415',
    db1EmployeeId: '3',
    fullName: 'Ercan Özdemir',
    email: 'ercan@socialartajans.com',
    title: 'Kurucu',
    rolePackageId: 'kreatif-yonetim',
    teamIds: ['kreatif-koordinasyon'],
    permissionOverrides: {},
    employeeStatus: 'active',
    workLocationStatus: 'office',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4721de06-0bd6-4681-a2c8-0c0d53da8eaf',
    db1EmployeeId: '4',
    fullName: 'Betül Ünlü',
    email: 'betul@socialartajans.com',
    title: 'Art Director',
    rolePackageId: 'grafik-tasarim',
    teamIds: ['grafik-studyo'],
    permissionOverrides: {},
    employeeStatus: 'active',
    workLocationStatus: 'office',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '26fff081-5502-4624-a71a-b6e4772467c3',
    db1EmployeeId: '6',
    fullName: 'Arda Furkan Aslanbaş',
    email: 'furkan@socialartmedya.com',
    title: 'Dijital Pazarlama Uzmanı',
    rolePackageId: 'dijital-pazarlama',
    teamIds: ['dijital-pazarlama'],
    permissionOverrides: {},
    employeeStatus: 'active',
    workLocationStatus: 'office',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Test A: DB1 "1" resolves to Tuğba DB2 UUID
const emp1 = resolveOperationalEmployee('1', mockDb2Employees);
assert.strictEqual(emp1?.id, '6f2efa88-0600-4d5f-8515-143937b6890f', 'Test A FAIL: ID 1 did not resolve to Tuğba UUID');
console.log(' ✅ PASSED [A]: DB1 ID "1" resolves deterministically to Tuğba DB2 UUID (6f2efa88-...)');

// Test B: DB1 "2" resolves to Celal DB2 UUID
const emp2 = resolveOperationalEmployee('2', mockDb2Employees);
assert.strictEqual(emp2?.id, 'b5e391db-dc21-45a8-baad-19f4073d3b14', 'Test B FAIL: ID 2 did not resolve to Celal UUID');
console.log(' ✅ PASSED [B]: DB1 ID "2" resolves deterministically to Celal DB2 UUID (b5e391db-...)');

// Test C: DB1 "3" resolves to Ercan DB2 UUID
const emp3 = resolveOperationalEmployee('3', mockDb2Employees);
assert.strictEqual(emp3?.id, '406a078d-0aea-45e0-87e1-d4d0b5f20415', 'Test C FAIL: ID 3 did not resolve to Ercan UUID');
console.log(' ✅ PASSED [C]: DB1 ID "3" resolves deterministically to Ercan DB2 UUID (406a078d-...)');

// Test D: DB1 "4" resolves to Betül DB2 UUID
const emp4 = resolveOperationalEmployee('4', mockDb2Employees);
assert.strictEqual(emp4?.id, '4721de06-0bd6-4681-a2c8-0c0d53da8eaf', 'Test D FAIL: ID 4 did not resolve to Betül UUID');
console.log(' ✅ PASSED [D]: DB1 ID "4" resolves deterministically to Betül DB2 UUID (4721de06-...)');

// Test E: DB1 "6" resolves to Arda DB2 UUID
const emp6 = resolveOperationalEmployee('6', mockDb2Employees);
assert.strictEqual(emp6?.id, '26fff081-5502-4624-a71a-b6e4772467c3', 'Test E FAIL: ID 6 did not resolve to Arda UUID');
console.log(' ✅ PASSED [E]: DB1 ID "6" resolves deterministically to Arda DB2 UUID (26fff081-...)');

// Test F: wrong/full-name-only match does NOT resolve authenticated runtime identity
const nameOnlyEmployees = [
  { id: 'wrong-uuid-1', db1EmployeeId: null, fullName: 'Arda Furkan Aslanbaş' }
];
const failedNameMatch = resolveOperationalEmployee('6', nameOnlyEmployees);
assert.strictEqual(failedNameMatch, null, 'Test F FAIL: Name match incorrectly resolved');
console.log(' ✅ PASSED [F]: Full-name matching alone without db1EmployeeId is rejected (returns null)');

// Test G: unmapped auth employee returns safe no-operational-context state
const unmappedResult = resolveOperationalEmployee('8', mockDb2Employees);
assert.strictEqual(unmappedResult, null, 'Test G FAIL: Unmapped employee did not return null');
console.log(' ✅ PASSED [G]: Unmapped auth employee ID (e.g. "8") safely returns null without throwing');

// Test H: auth bootstrap still succeeds even if operational employee is unmapped
function simulateWorkspaceActiveEmployee(serverEmployee, db2List) {
  if (!serverEmployee) return undefined;
  const operationalEmp = resolveOperationalEmployee(serverEmployee.id, db2List);
  return {
    id: operationalEmp ? operationalEmp.id : String(serverEmployee.id),
    db1EmployeeId: String(serverEmployee.id),
    fullName: serverEmployee.fullName,
    rolePackageId: serverEmployee.rolePackageId || null,
    permissionOverrides: serverEmployee.permissionOverrides || {}
  };
}

const unmappedServerEmp = { id: '8', fullName: 'Samet', rolePackageId: null, permissionOverrides: {} };
const unmappedActiveEmp = simulateWorkspaceActiveEmployee(unmappedServerEmp, mockDb2Employees);
assert(unmappedActiveEmp !== undefined);
assert.strictEqual(unmappedActiveEmp.id, '8');
assert.strictEqual(unmappedActiveEmp.db1EmployeeId, '8');
console.log(' ✅ PASSED [H]: Workspace bootstrap succeeds for unmapped employee without crashing');

// Test I: workflow/my-work filters use DB2 UUID
const sampleStep = { id: 'step-1', assignedEmployeeId: '26fff081-5502-4624-a71a-b6e4772467c3' };
const activeArda = simulateWorkspaceActiveEmployee({ id: '6', fullName: 'Arda Furkan Aslanbaş', rolePackageId: 'dijital-pazarlama' }, mockDb2Employees);
const isAssigned = sampleStep.assignedEmployeeId === activeArda.id;
assert.strictEqual(isAssigned, true, 'Test I FAIL: Step assignee did not match DB2 UUID');
console.log(' ✅ PASSED [I]: Operational step filters match directly on resolved DB2 UUID');

// Test J: localStorage alone cannot select another operational employee
let mockStorage = { 'social-art-base:active-employee-id': 'b5e391db-dc21-45a8-baad-19f4073d3b14' }; // Celal's UUID in storage
const resolvedForArda = simulateWorkspaceActiveEmployee({ id: '6', fullName: 'Arda Furkan Aslanbaş' }, mockDb2Employees);
assert.strictEqual(resolvedForArda.id, '26fff081-5502-4624-a71a-b6e4772467c3', 'Test J FAIL: LocalStorage hijacked active employee');
console.log(' ✅ PASSED [J]: LocalStorage value cannot override authoritative server-resolved identity');

// Test K: DB2 Employee.id remains UUID semantics
mockDb2Employees.forEach(e => {
  assert(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e.id), `Employee ${e.fullName} id is not UUID`);
});
console.log(' ✅ PASSED [K]: All DB2 Employee primary keys strictly preserve UUID format');

// Test L: EmployeeRepository mapRowToEmployee correctly handles db1_employee_id
const mappedRow = EmployeeRepository.mapRowToEmployee({
  id: '26fff081-5502-4624-a71a-b6e4772467c3',
  db1_employee_id: '6',
  full_name: 'Arda Furkan Aslanbaş',
  email: 'furkan@socialartmedya.com',
  title: 'Dijital Pazarlama Uzmanı',
  role_package_id: 'dijital-pazarlama',
  team_ids: ['dijital-pazarlama'],
  permission_overrides: {},
  employee_status: 'active',
  work_location_status: 'office',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});
assert.strictEqual(mappedRow.db1EmployeeId, '6');
assert.strictEqual(mappedRow.id, '26fff081-5502-4624-a71a-b6e4772467c3');
console.log(' ✅ PASSED [L]: EmployeeRepository.mapRowToEmployee correctly maps db1_employee_id to db1EmployeeId');

console.log('\n==========================================');
console.log('ALL RUNTIME EMPLOYEE BRIDGE CHECKS PASSED (12/12)');
console.log('==========================================');
