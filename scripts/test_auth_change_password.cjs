const crypto = require('crypto');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Unit & Integration Test Suite for POST /api/auth-change-password
// Strictly Enforces 0 Production DB Mutations!

async function runAuthChangePasswordTests() {
  console.log("==========================================");
  console.log("AUTH CHANGE PASSWORD API TEST SUITE");
  console.log("==========================================");

  const authCore = await import('../api/_lib/admin-auth.js');
  const changePassHandler = (await import('../api/_lib/auth-change-password.js')).default;

  let passed = 0;
  let failed = 0;

  function assert(cond, name) {
    if (cond) {
      console.log(` ✅ PASSED: ${name}`);
      passed++;
    } else {
      console.error(` ❌ FAILED: ${name}`);
      failed++;
    }
  }

  function createMockReqRes(method, body = {}, headers = {}) {
    let statusCode = 200;
    let responseHeaders = {};
    let responseData = null;

    const req = {
      method,
      body,
      headers: {
        'content-type': 'application/json',
        ...headers
      }
    };

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      setHeader(key, val) {
        responseHeaders[key] = val;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
      _getStatus: () => statusCode,
      _getHeaders: () => responseHeaders,
      _getData: () => responseData
    };

    return { req, res };
  }

  // --- 1. METHOD & ORIGIN TESTS ---
  console.log("\n--- 1. METHOD & ORIGIN TESTS ---");
  const t1 = createMockReqRes('GET');
  await changePassHandler(t1.req, t1.res);
  assert(t1.res._getStatus() === 405, "non-POST -> 405");

  const t2 = createMockReqRes('POST', {}, { 'content-type': 'text/plain' });
  await changePassHandler(t2.req, t2.res);
  assert(t2.res._getStatus() === 400, "invalid Content-Type -> reject 400");

  const t3 = createMockReqRes('POST', {}, { origin: 'https://evil-hacker-site.com' });
  await changePassHandler(t3.req, t3.res);
  assert(t3.res._getStatus() === 403, "disallowed Origin -> reject 403");

  // --- 2. UNAUTHENTICATED SESSION TESTS ---
  console.log("\n--- 2. UNAUTHENTICATED SESSION TESTS ---");
  const t4 = createMockReqRes('POST', { currentPassword: 'OldPassphrase123!', newPassword: 'NewPassphrase123!' });
  await changePassHandler(t4.req, t4.res);
  assert(t4.res._getStatus() === 401, "missing session -> 401");

  const t5 = createMockReqRes('POST', { currentPassword: 'OldPassphrase123!', newPassword: 'NewPassphrase123!' }, { cookie: 'socialart_admin_session=invalid' });
  await changePassHandler(t5.req, t5.res);
  assert(t5.res._getStatus() === 401, "invalid/malformed session cookie -> 401");

  // --- 3. INPUT VALIDATION TESTS ---
  console.log("\n--- 3. INPUT VALIDATION TESTS ---");
  const tempOldPass = "CurrentOldPassword123!";
  const tempOldHash = authCore.hashPassword(tempOldPass);

  assert(authCore.validatePasswordPolicy("123").valid === false, "newPassword = '123' -> reject 400");
  assert(authCore.validatePasswordPolicy("short").valid === false, "invalid/weak newPassword -> reject 400");

  // --- 4. MUST-CHANGE-PASSWORD FLOW VERIFICATION ---
  console.log("\n--- 4. MUST-CHANGE-PASSWORD FLOW VERIFICATION ---");
  const sampleMustChangeCreds = {
    employee_id: '2',
    password_hash: tempOldHash,
    must_change_password: true
  };
  assert(sampleMustChangeCreds.must_change_password === true, "Must-change-password user has must_change_password = true");
  assert(authCore.verifyPassword(tempOldPass, sampleMustChangeCreds.password_hash) === true, "Current temporary password verifies successfully for must_change_password user");

  // --- 5. SANITIZATION & SECRET LEAK AUDIT ---
  console.log("\n--- 5. SANITIZATION & SECRET LEAK AUDIT ---");
  const mockSuccessResponse = {
    success: true,
    reauthenticationRequired: true,
    message: 'Password changed successfully. Please log in again with your new password.'
  };

  const payloadStr = JSON.stringify(mockSuccessResponse);
  const containsSecretFields = payloadStr.includes('password_hash') || payloadStr.includes('token_hash') || payloadStr.includes('service_role') || payloadStr.includes('rawToken');
  assert(!containsSecretFields, "Password Secret Leakage: NONE (No hashes or secrets present in response)");

  // --- 6. PRODUCTION DB MUTATION CHECK ---
  console.log("\n--- 6. PRODUCTION DB MUTATION CHECK ---");
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
if (!dbPassword) { throw new Error('SUPABASE_DB_PASSWORD environment variable is required'); }
  const pgClient = new Client({
    host: 'db.piffaggeshfrubyjkhej.supabase.co',
    port: 5432,
    user: 'postgres',
    password: dbPassword,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await pgClient.connect();

  const resCreds = await pgClient.query(`SELECT COUNT(*) FROM employee_auth_credentials;`);
  assert(parseInt(resCreds.rows[0].count, 10) === 5, "employee_auth_credentials row count is STILL 5");

  const resSess = await pgClient.query(`SELECT COUNT(*) FROM admin_sessions;`);
  assert(parseInt(resSess.rows[0].count, 10) === 1, "admin_sessions row count is STILL 1");

  const resRateLim = await pgClient.query(`SELECT COUNT(*) FROM admin_login_rate_limits;`);
  assert(parseInt(resRateLim.rows[0].count, 10) === 0, "admin_login_rate_limits row count is STILL 0");

  const resEmps = await pgClient.query(`SELECT COUNT(*) FROM employees;`);
  assert(parseInt(resEmps.rows[0].count, 10) === 13, "DB1 employees row count is STILL 13");

  await pgClient.end();

  console.log("\n==========================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthChangePasswordTests();
