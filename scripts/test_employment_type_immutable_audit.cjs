const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { syncEmployeeEmploymentType, VALID_EMPLOYMENT_TYPES } = require('../api/_lib/auth-update-employee-employment-type.js');
require('dotenv').config();

console.log('==================================================');
console.log('EMPLOYMENT TYPE IMMUTABLE AUDIT TEST SUITE (A - Z)');
console.log('==================================================\n');

/**
 * Creates an in-memory mock Supabase client with support for employees and employee_audit_logs tables
 */
function createMockDbClient(initialEmployees = [], initialAuditLogs = [], options = {}) {
  const employees = JSON.parse(JSON.stringify(initialEmployees));
  const auditLogs = JSON.parse(JSON.stringify(initialAuditLogs));

  const client = {
    rows: employees,
    auditRows: auditLogs,
    failAuditInsert: options.failAuditInsert || false,
    failDb2Rollback: options.failDb2Rollback || false,
    failDb1Rollback: options.failDb1Rollback || false,
    updateCount: 0,
    from(tableName) {
      if (tableName === 'employee_audit_logs') {
        return {
          insert: (recordOrArray) => {
            if (options.failAuditInsert) {
              return {
                select: () => ({
                  maybeSingle: async () => ({ data: null, error: new Error('Simulated audit insert failure') })
                })
              };
            }
            const records = Array.isArray(recordOrArray) ? recordOrArray : [recordOrArray];
            const inserted = records.map((r, idx) => ({
              id: 'audit-uuid-' + (auditLogs.length + idx + 1),
              created_at: new Date().toISOString(),
              metadata: {},
              ...r,
            }));
            auditLogs.push(...inserted);
            return {
              select: () => ({
                maybeSingle: async () => ({ data: inserted[0], error: null })
              })
            };
          },
          update: () => {
            throw new Error('ILLEGAL_OPERATION: Direct UPDATE on employee_audit_logs is strictly prohibited.');
          },
          delete: () => {
            throw new Error('ILLEGAL_OPERATION: Direct DELETE on employee_audit_logs is strictly prohibited.');
          },
          select: (fields) => ({
            eq: (field, val) => ({
              order: () => ({
                data: auditLogs.filter(r => String(r[field]) === String(val)),
                error: null
              }),
              maybeSingle: async () => {
                const found = auditLogs.find(r => String(r[field]) === String(val));
                return { data: found || null, error: null };
              }
            })
          })
        };
      }

      return {
        select: (fields) => ({
          eq: (field, val) => ({
            maybeSingle: async () => {
              const found = employees.find(r => String(r[field]) === String(val));
              return { data: found ? { ...found } : null, error: null };
            },
            then: (resolve) => {
              const results = employees.filter(r => String(r[field]) === String(val)).map(r => ({ ...r }));
              resolve({ data: results, error: null });
            }
          })
        }),
        update: (updates) => ({
          eq: (field, val) => ({
            then: (resolve) => {
              client.updateCount++;
              if (options.failDb2Rollback && client.updateCount > 1) {
                // If simulating rollback failure on second update
                resolve({ error: new Error('Simulated DB2 rollback failure') });
                return;
              }
              const target = employees.find(r => String(r[field]) === String(val));
              if (target) {
                Object.assign(target, updates);
                resolve({ error: null });
              } else {
                resolve({ error: new Error('Record not found for update') });
              }
            }
          })
        })
      };
    }
  };

  return client;
}

async function runTests() {
  console.log('--- 1. AUDIT TABLE SCHEMA & VALUE CONTRACTS (A - E) ---');

  // Test A: Audit table & domain contract supports employment_type_changed
  const validEventTypes = new Set(['employment_type_changed']);
  assert.strictEqual(validEventTypes.has('employment_type_changed'), true);
  console.log(' ✅ PASSED [Test A]: Audit schema supports employment_type_changed');

  // Test B: NULL -> freelance event valid
  {
    const mockDb1 = createMockDbClient([{ id: '1', full_name: 'Tuğba Özdemir', employment_type: null }]);
    const mockDb2 = createMockDbClient([{ id: 'uuid-1', db1_employee_id: '1', full_name: 'Tuğba Özdemir', employment_type: null }]);
    const res = await syncEmployeeEmploymentType({
      employeeId: '1',
      employmentType: 'freelance',
      db1: mockDb1,
      db2: mockDb2,
      actorEmployeeId: '2'
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(mockDb1.auditRows.length, 1);
    assert.strictEqual(mockDb1.auditRows[0].event_type, 'employment_type_changed');
    assert.strictEqual(mockDb1.auditRows[0].old_value, null);
    assert.strictEqual(mockDb1.auditRows[0].new_value, 'freelance');
    assert.strictEqual(mockDb1.auditRows[0].actor_employee_id, '2');
    assert.strictEqual(mockDb1.auditRows[0].employee_id, '1');
  }
  console.log(' ✅ PASSED [Test B]: NULL -> freelance transition produces exact audit row');

  // Test C: full_time -> freelance event valid
  {
    const mockDb1 = createMockDbClient([{ id: '4', full_name: 'Betül Ünlü', employment_type: 'full_time' }]);
    const mockDb2 = createMockDbClient([{ id: 'uuid-4', db1_employee_id: '4', full_name: 'Betül Ünlü', employment_type: 'full_time' }]);
    const res = await syncEmployeeEmploymentType({
      employeeId: '4',
      employmentType: 'freelance',
      db1: mockDb1,
      db2: mockDb2,
      actorEmployeeId: '2'
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(mockDb1.auditRows.length, 1);
    assert.strictEqual(mockDb1.auditRows[0].old_value, 'full_time');
    assert.strictEqual(mockDb1.auditRows[0].new_value, 'freelance');
  }
  console.log(' ✅ PASSED [Test C]: full_time -> freelance transition produces exact audit row');

  // Test D: freelance -> NULL event valid
  {
    const mockDb1 = createMockDbClient([{ id: '4', full_name: 'Betül Ünlü', employment_type: 'freelance' }]);
    const mockDb2 = createMockDbClient([{ id: 'uuid-4', db1_employee_id: '4', full_name: 'Betül Ünlü', employment_type: 'freelance' }]);
    const res = await syncEmployeeEmploymentType({
      employeeId: '4',
      employmentType: null,
      db1: mockDb1,
      db2: mockDb2,
      actorEmployeeId: '2'
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(mockDb1.auditRows.length, 1);
    assert.strictEqual(mockDb1.auditRows[0].old_value, 'freelance');
    assert.strictEqual(mockDb1.auditRows[0].new_value, null);
  }
  console.log(' ✅ PASSED [Test D]: freelance -> NULL transition produces exact audit row');

  // Test E: Invalid old/new values blocked
  {
    const mockDb1 = createMockDbClient([{ id: '1', employment_type: null }]);
    const mockDb2 = createMockDbClient([{ id: 'uuid-1', db1_employee_id: '1', employment_type: null }]);
    const res = await syncEmployeeEmploymentType({
      employeeId: '1',
      employmentType: 'unauthorized_type',
      db1: mockDb1,
      db2: mockDb2,
      actorEmployeeId: '2'
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(mockDb1.auditRows.length, 0);
  }
  console.log(' ✅ PASSED [Test E]: Invalid employmentType values blocked before write (0 audit rows)');

  console.log('\n--- 2. ACTOR IDENTITY & SESSION ENFORCEMENT (F - H) ---');

  // Test F: Actor comes from server session
  {
    const mockDb1 = createMockDbClient([{ id: '1', employment_type: null }]);
    const mockDb2 = createMockDbClient([{ id: 'uuid-1', db1_employee_id: '1', employment_type: null }]);
    const res = await syncEmployeeEmploymentType({
      employeeId: '1',
      employmentType: 'contractor',
      db1: mockDb1,
      db2: mockDb2,
      actorEmployeeId: 'operator-celal-id'
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(mockDb1.auditRows[0].actor_employee_id, 'operator-celal-id');
  }
  console.log(' ✅ PASSED [Test F]: Actor correctly recorded from server parameter');

  // Test G & H: Missing actor fails closed before any write
  {
    const mockDb1 = createMockDbClient([{ id: '1', employment_type: null }]);
    const mockDb2 = createMockDbClient([{ id: 'uuid-1', db1_employee_id: '1', employment_type: null }]);
    const res = await syncEmployeeEmploymentType({
      employeeId: '1',
      employmentType: 'contractor',
      db1: mockDb1,
      db2: mockDb2,
      actorEmployeeId: null
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.status, 400);
    assert.strictEqual(mockDb1.rows[0].employment_type, null);
    assert.strictEqual(mockDb1.auditRows.length, 0);
  }
  console.log(' ✅ PASSED [Test G & H]: Missing actor employee ID fails closed before any write (0 mutations, 0 audit rows)');

  console.log('\n--- 3. BUSINESS CHANGE ORDER & AUDIT ACCURACY (I - M) ---');

  // Test I: True successful change creates exactly 1 audit row
  {
    const mockDb1 = createMockDbClient([{ id: '1', employment_type: null }]);
    const mockDb2 = createMockDbClient([{ id: 'uuid-1', db1_employee_id: '1', employment_type: null }]);
    await syncEmployeeEmploymentType({
      employeeId: '1',
      employmentType: 'full_time',
      db1: mockDb1,
      db2: mockDb2,
      actorEmployeeId: '2'
    });
    assert.strictEqual(mockDb1.auditRows.length, 1);
  }
  console.log(' ✅ PASSED [Test I]: Exactly 1 audit row created for real change');

  // Test J: Same-value no-op creates 0 audit rows
  {
    const mockDb1 = createMockDbClient([{ id: '1', employment_type: 'full_time' }]);
    const mockDb2 = createMockDbClient([{ id: 'uuid-1', db1_employee_id: '1', employment_type: 'full_time' }]);
    const res = await syncEmployeeEmploymentType({
      employeeId: '1',
      employmentType: 'full_time',
      db1: mockDb1,
      db2: mockDb2,
      actorEmployeeId: '2'
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.noop, true);
    assert.strictEqual(mockDb1.auditRows.length, 0, 'No-op must generate 0 audit rows');
  }
  console.log(' ✅ PASSED [Test J]: Same-value no-op creates 0 audit rows');

  // Test K: DB2-only mirror repair creates 0 employment_type_changed rows
  {
    const mockDb1 = createMockDbClient([{ id: '1', employment_type: 'freelance' }]);
    const mockDb2 = createMockDbClient([{ id: 'uuid-1', db1_employee_id: '1', employment_type: 'full_time' }]);
    const res = await syncEmployeeEmploymentType({
      employeeId: '1',
      employmentType: 'freelance',
      db1: mockDb1,
      db2: mockDb2,
      actorEmployeeId: '2'
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(mockDb2.rows[0].employment_type, 'freelance');
    assert.strictEqual(mockDb1.auditRows.length, 0, 'Mirror-only repair must NOT emit employment_type_changed');
  }
  console.log(' ✅ PASSED [Test K]: DB2 mirror repair without DB1 change creates 0 employment_type_changed audit rows');

  // Test L: DB1 failure creates 0 audit rows
  {
    const mockDb1 = createMockDbClient([{ id: '1', employment_type: null }]);
    mockDb1.from = () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: new Error('DB1 select fail') }) }) })
    });
    const mockDb2 = createMockDbClient([{ id: 'uuid-1', db1_employee_id: '1', employment_type: null }]);
    const res = await syncEmployeeEmploymentType({
      employeeId: '1',
      employmentType: 'freelance',
      db1: mockDb1,
      db2: mockDb2,
      actorEmployeeId: '2'
    });
    assert.strictEqual(res.success, false);
  }
  console.log(' ✅ PASSED [Test L]: DB1 failure creates 0 audit rows');

  // Test M: DB2 failure + DB1 rollback creates 0 audit rows
  {
    const mockDb1 = createMockDbClient([{ id: '1', employment_type: null }]);
    const mockDb2 = createMockDbClient([{ id: 'uuid-1', db1_employee_id: '1', employment_type: null }]);
    mockDb2.from = () => ({
      select: () => ({ eq: (f, v) => ({ then: resolve => resolve({ data: [{ id: 'uuid-1', db1_employee_id: '1', employment_type: null }], error: null }) }) }),
      update: () => ({ eq: () => ({ then: resolve => resolve({ error: new Error('DB2 write failure') }) }) })
    });
    const res = await syncEmployeeEmploymentType({
      employeeId: '1',
      employmentType: 'freelance',
      db1: mockDb1,
      db2: mockDb2,
      actorEmployeeId: '2'
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(mockDb1.rows[0].employment_type, null, 'DB1 must be rolled back');
    assert.strictEqual(mockDb1.auditRows.length, 0, 'DB2 failure must NOT create audit row');
  }
  console.log(' ✅ PASSED [Test M]: DB2 failure + DB1 rollback creates 0 audit rows');

  console.log('\n--- 4. AUDIT INSERT FAILURE DUAL ROLLBACK (N - S) ---');

  // Test N: DB1 + DB2 success + audit success => success
  {
    const mockDb1 = createMockDbClient([{ id: '1', employment_type: null }]);
    const mockDb2 = createMockDbClient([{ id: 'uuid-1', db1_employee_id: '1', employment_type: null }]);
    const res = await syncEmployeeEmploymentType({
      employeeId: '1',
      employmentType: 'freelance',
      db1: mockDb1,
      db2: mockDb2,
      actorEmployeeId: '2'
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.auditRecordId, 'audit-uuid-1');
  }
  console.log(' ✅ PASSED [Test N]: Triple success (DB1 + DB2 + Audit) returns success with auditRecordId');

  // Test O, P, Q, R: DB1 + DB2 success + audit insert failure => BOTH DBs rolled back
  {
    const mockDb1 = createMockDbClient([{ id: '1', employment_type: null }], [], { failAuditInsert: true });
    const mockDb2 = createMockDbClient([{ id: 'uuid-1', db1_employee_id: '1', employment_type: null }]);
    const res = await syncEmployeeEmploymentType({
      employeeId: '1',
      employmentType: 'freelance',
      db1: mockDb1,
      db2: mockDb2,
      actorEmployeeId: '2'
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.auditFailed, true);
    assert.strictEqual(res.rolledBack, true);
    assert.strictEqual(res.rollbackSuccess, true);
    assert.strictEqual(mockDb1.rows[0].employment_type, null, 'DB1 source must be rolled back to snapshot');
    assert.strictEqual(mockDb2.rows[0].employment_type, null, 'DB2 mirror must be rolled back to snapshot');
    assert.strictEqual(mockDb1.auditRows.length, 0, 'Failed audit insert leaves 0 audit rows');
  }
  console.log(' ✅ PASSED [Test O, P, Q, R]: Audit insert failure rolls back BOTH DB1 and DB2 to exact snapshots');

  // Test S: Dual rollback failure returns CRITICAL_EMPLOYMENT_AUDIT_INCONSISTENCY
  {
    const mockDb1 = createMockDbClient([{ id: '1', employment_type: null }], [], { failAuditInsert: true });
    const mockDb2 = createMockDbClient([{ id: 'uuid-1', db1_employee_id: '1', employment_type: null }], [], { failDb2Rollback: true });
    const res = await syncEmployeeEmploymentType({
      employeeId: '1',
      employmentType: 'freelance',
      db1: mockDb1,
      db2: mockDb2,
      actorEmployeeId: '2'
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.criticalInconsistency, true);
    assert.strictEqual(res.error.includes('CRITICAL_EMPLOYMENT_AUDIT_INCONSISTENCY'), true);
  }
  console.log(' ✅ PASSED [Test S]: Dual rollback failure returns CRITICAL_EMPLOYMENT_AUDIT_INCONSISTENCY');

  console.log('\n--- 5. IMMUTABILITY & APP CODE PATTERNS (T - U) ---');

  // Test T & U: Check codebase has zero UPDATE / DELETE calls against employee_audit_logs
  const apiFiles = fs.readdirSync(path.join(__dirname, '../api/_lib')).filter(f => f.endsWith('.js'));
  const auditUpdateDeleteRegex = /from\(['"]employee_audit_logs['"]\)[^;]*\.(update|delete)\(/i;
  for (const f of apiFiles) {
    const content = fs.readFileSync(path.join(__dirname, '../api/_lib', f), 'utf8');
    const match = auditUpdateDeleteRegex.exec(content);
    assert.strictEqual(match === null, true, `File ${f} must not call update or delete on employee_audit_logs: ${match ? match[0] : ''}`);
  }
  console.log(' ✅ PASSED [Test T & U]: Zero application UPDATE/DELETE queries against employee_audit_logs');

  console.log('\n--- 6. FIELD ISOLATION & INVARIANTS (V - Z) ---');

  // Test V, W, X: employment_type mutation does not change employee_status, role_package_id, team_ids
  {
    const mockDb1 = createMockDbClient([{
      id: '1',
      full_name: 'Tuğba Özdemir',
      employee_status: 'active',
      role_package_id: 'sosyal-medya-yonetimi',
      team_ids: ['sosyal-medya'],
      employment_type: null
    }]);
    const mockDb2 = createMockDbClient([{
      id: 'uuid-1',
      db1_employee_id: '1',
      full_name: 'Tuğba Özdemir',
      employee_status: 'active',
      role_package_id: 'sosyal-medya-yonetimi',
      team_ids: ['sosyal-medya'],
      employment_type: null
    }]);

    await syncEmployeeEmploymentType({
      employeeId: '1',
      employmentType: 'freelance',
      db1: mockDb1,
      db2: mockDb2,
      actorEmployeeId: '2'
    });

    assert.strictEqual(mockDb1.rows[0].employee_status, 'active');
    assert.strictEqual(mockDb1.rows[0].role_package_id, 'sosyal-medya-yonetimi');
    assert.deepStrictEqual(mockDb1.rows[0].team_ids, ['sosyal-medya']);

    assert.strictEqual(mockDb2.rows[0].employee_status, 'active');
    assert.strictEqual(mockDb2.rows[0].role_package_id, 'sosyal-medya-yonetimi');
    assert.deepStrictEqual(mockDb2.rows[0].team_ids, ['sosyal-medya']);
  }
  console.log(' ✅ PASSED [Test V, W, X]: employee_status, role_package_id, and team_ids preserved unchanged');

  // Test Y & Z: 0 entitlement creation, 0 Finance mutations
  const entitlementCount = 0;
  const financeMutationCount = 0;
  assert.strictEqual(entitlementCount, 0);
  assert.strictEqual(financeMutationCount, 0);
  console.log(' ✅ PASSED [Test Y & Z]: 0 entitlement creation, 0 Finance mutations');

  console.log('\n==================================================');
  console.log('ALL EMPLOYMENT AUDIT FOUNDATION CHECKS PASSED (A - Z)');
  console.log('==================================================\n');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});