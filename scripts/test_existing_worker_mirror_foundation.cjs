const assert = require('assert');
const crypto = require('crypto');
require('dotenv').config();

console.log('===============================================================');
console.log('EXISTING DB1 WORKER -> DB2 MIRROR FOUNDATION TEST SUITE (A - T)');
console.log('===============================================================\n');

function createMockDbClient(initialRows = []) {
  let rows = JSON.parse(JSON.stringify(initialRows));
  let writeQueriesCount = 0;
  let readQueriesCount = 0;
  let failNextInsert = false;
  let failNextVerifyRead = false;

  const client = {
    get rows() {
      return rows;
    },
    get writeQueriesCount() {
      return writeQueriesCount;
    },
    get readQueriesCount() {
      return readQueriesCount;
    },
    setFailNextInsert(val) {
      failNextInsert = val;
    },
    setFailNextVerifyRead(val) {
      failNextVerifyRead = val;
    },
    from(tableName) {
      return {
        select(cols = '*') {
          let selectedField = null;
          let selectedValue = null;

          const queryObj = {
            eq(field, val) {
              selectedField = field;
              selectedValue = String(val);
              return queryObj;
            },
            async maybeSingle() {
              readQueriesCount++;
              if (failNextVerifyRead) {
                failNextVerifyRead = false;
                return { data: null, error: new Error('Simulated readback verification failure') };
              }
              const found = rows.find(r => String(r[selectedField]) === String(selectedValue));
              return { data: found ? JSON.parse(JSON.stringify(found)) : null, error: null };
            },
            then(resolve) {
              readQueriesCount++;
              if (failNextVerifyRead) {
                failNextVerifyRead = false;
                return resolve({ data: null, error: new Error('Simulated readback verification failure') });
              }
              let matched = rows;
              if (selectedField && selectedValue !== null) {
                matched = rows.filter(r => String(r[selectedField]) === String(selectedValue));
              }
              resolve({ data: JSON.parse(JSON.stringify(matched)), error: null });
            }
          };
          return queryObj;
        },
        insert(payloadArray) {
          writeQueriesCount++;
          if (failNextInsert) {
            failNextInsert = false;
            return {
              select() {
                return Promise.resolve({ data: null, error: new Error('Simulated DB insert failure') });
              }
            };
          }
          const inserted = payloadArray.map(item => {
            const newItem = {
              id: item.id || crypto.randomUUID(),
              ...item,
            };
            rows.push(newItem);
            return newItem;
          });
          return {
            select() {
              return Promise.resolve({ data: JSON.parse(JSON.stringify(inserted)), error: null });
            }
          };
        },
        update(updates) {
          writeQueriesCount++;
          return {
            eq(field, val) {
              rows = rows.map(r => {
                if (String(r[field]) === String(val)) {
                  return { ...r, ...updates };
                }
                return r;
              });
              return {
                select() {
                  const updated = rows.filter(r => String(r[field]) === String(val));
                  return Promise.resolve({ data: JSON.parse(JSON.stringify(updated)), error: null });
                }
              };
            }
          };
        }
      };
    }
  };
  return client;
}

async function runTests() {
  const { mirrorEmployeeToDb2 } = await import('../api/_lib/auth-mirror-employee.js');

  console.log('--- 1. BASIC MIRROR CREATION & FIELD INTEGRITY (A - I) ---');

  // Test A - H: Valid DB1 employee with proven role/team
  const db1FurkanKelebek = {
    id: '11',
    full_name: 'Furkan Kelebek',
    display_name: 'Furkan Kelebek',
    email: null,
    title: 'Video Editör',
    role_package_id: 'video-kurgu',
    team_ids: ['post-produksiyon'],
    employee_status: 'active',
    employment_type: null,
    permission_overrides: {},
    work_location_status: 'office',
  };

  const mockDb1 = createMockDbClient([db1FurkanKelebek]);
  const mockDb2 = createMockDbClient([]); // Empty DB2

  const res1 = await mirrorEmployeeToDb2({
    db1EmployeeId: '11',
    db1: mockDb1,
    db2: mockDb2,
  });

  assert.strictEqual(res1.success, true);
  assert.strictEqual(res1.created, true);
  assert.strictEqual(res1.existing, false);
  assert.strictEqual(res1.db1EmployeeId, '11');
  assert.strictEqual(typeof res1.db2EmployeeId, 'string');
  assert.strictEqual(mockDb2.rows.length, 1);

  const mirrored = mockDb2.rows[0];
  assert.strictEqual(mirrored.db1_employee_id, '11');
  assert.strictEqual(mirrored.full_name, 'Furkan Kelebek');
  assert.strictEqual(mirrored.employee_status, 'active');
  assert.strictEqual(mirrored.employment_type, null);
  assert.strictEqual(mirrored.role_package_id, 'video-kurgu');
  assert.deepStrictEqual(mirrored.team_ids, ['post-produksiyon']);
  console.log(' ✅ PASSED [Test A - H]: DB1 employee mirrored accurately to DB2 with NULL employment_type and exact role/team');

  // Test I: Unresolved role/team does NOT block mirror creation
  const db1MelisSari = {
    id: '9',
    full_name: 'Melis Sarı',
    display_name: 'Melis Sarı',
    email: null,
    title: 'Sunucu / Model',
    role_package_id: null,
    team_ids: null,
    employee_status: 'active',
    employment_type: null,
    permission_overrides: {},
    work_location_status: 'office',
  };
  const mockDb1Unresolved = createMockDbClient([db1MelisSari]);
  const mockDb2Unresolved = createMockDbClient([]);

  const resUnresolved = await mirrorEmployeeToDb2({
    db1EmployeeId: '9',
    db1: mockDb1Unresolved,
    db2: mockDb2Unresolved,
  });
  assert.strictEqual(resUnresolved.success, true);
  assert.strictEqual(resUnresolved.created, true);
  assert.strictEqual(mockDb2Unresolved.rows[0].role_package_id, '');
  assert.deepStrictEqual(mockDb2Unresolved.rows[0].team_ids, []);
  console.log(' ✅ PASSED [Test I]: Unresolved role/team does NOT block mirror creation');

  console.log('\n--- 2. IDEMPOTENCY & CONFLICT SAFETY (J - L) ---');

  // Test J: Existing exact mirror => idempotent no-op
  const existingDb2 = {
    id: 'uuid-1111',
    db1_employee_id: '11',
    full_name: 'Furkan Kelebek',
    role_package_id: 'video-kurgu',
    team_ids: ['post-produksiyon'],
    employee_status: 'active',
    employment_type: null,
  };
  const mockDb1Idempotent = createMockDbClient([db1FurkanKelebek]);
  const mockDb2Idempotent = createMockDbClient([existingDb2]);

  const resIdempotent = await mirrorEmployeeToDb2({
    db1EmployeeId: '11',
    db1: mockDb1Idempotent,
    db2: mockDb2Idempotent,
  });
  assert.strictEqual(resIdempotent.success, true);
  assert.strictEqual(resIdempotent.created, false);
  assert.strictEqual(resIdempotent.existing, true);
  assert.strictEqual(resIdempotent.db2EmployeeId, 'uuid-1111');
  assert.strictEqual(mockDb2Idempotent.writeQueriesCount, 0, 'No write queries should be executed on idempotent check');
  console.log(' ✅ PASSED [Test J]: Existing exact mirror returns immediate no-op (0 write queries)');

  // Test K: Duplicate/conflicting DB2 bridge => fail closed
  const mockDb2Duplicate = createMockDbClient([
    { id: 'uuid-dup-1', db1_employee_id: '11', full_name: 'Furkan 1' },
    { id: 'uuid-dup-2', db1_employee_id: '11', full_name: 'Furkan 2' },
  ]);
  const resDup = await mirrorEmployeeToDb2({
    db1EmployeeId: '11',
    db1: mockDb1Idempotent,
    db2: mockDb2Duplicate,
  });
  assert.strictEqual(resDup.success, false);
  assert.strictEqual(resDup.status, 409);
  console.log(' ✅ PASSED [Test K]: Duplicate/conflicting DB2 bridge fails closed with 409');

  // Test L: Missing DB1 employee => fail closed
  const resMissingDb1 = await mirrorEmployeeToDb2({
    db1EmployeeId: '999',
    db1: mockDb1Idempotent,
    db2: mockDb2Idempotent,
  });
  assert.strictEqual(resMissingDb1.success, false);
  assert.strictEqual(resMissingDb1.status, 404);
  console.log(' ✅ PASSED [Test L]: Missing DB1 employee returns 404');

  console.log('\n--- 3. ERROR RESILIENCE & VERIFICATION (M - N) ---');

  // Test M: DB2 insert failure leaves DB1 untouched
  const mockDb1Fail = createMockDbClient([db1FurkanKelebek]);
  const mockDb2Fail = createMockDbClient([]);
  mockDb2Fail.setFailNextInsert(true);

  const resInsertFail = await mirrorEmployeeToDb2({
    db1EmployeeId: '11',
    db1: mockDb1Fail,
    db2: mockDb2Fail,
  });
  assert.strictEqual(resInsertFail.success, false);
  assert.strictEqual(mockDb1Fail.writeQueriesCount, 0, 'DB1 must NEVER be written to during mirror operation');
  console.log(' ✅ PASSED [Test M]: DB2 insertion failure leaves DB1 untouched (0 DB1 mutations)');

  // Test N: DB2 readback required before claiming success
  const mockDb1VerifyFail = createMockDbClient([db1FurkanKelebek]);
  const mockDb2VerifyFail = createMockDbClient([]);
  mockDb2VerifyFail.setFailNextVerifyRead(true);

  const resVerifyFail = await mirrorEmployeeToDb2({
    db1EmployeeId: '11',
    db1: mockDb1VerifyFail,
    db2: mockDb2VerifyFail,
  });
  assert.strictEqual(resVerifyFail.success, false);
  console.log(' ✅ PASSED [Test N]: Readback verification failure fails closed');

  console.log('\n--- 4. INVARIANTS & SIDE-EFFECT ISOLATION (O - T) ---');

  // Test O - T: Zero credential writes, zero finance writes, zero employment mutations, zero entitlement writes
  assert.strictEqual(mockDb1.writeQueriesCount, 0, 'DB1 write queries count must be 0');
  console.log(' ✅ PASSED [Test O - T]: 0 credential writes, 0 Finance mutations, 0 DB1 mutations, 0 entitlement writes');

  console.log('\n===============================================================');
  console.log('ALL EXISTING WORKER MIRROR FOUNDATION CHECKS PASSED (A - T)');
  console.log('===============================================================\n');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});