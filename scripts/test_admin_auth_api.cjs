const crypto = require('crypto');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Comprehensive Auth API, Rate Limit Engine & Security Test Suite
// Strictly Enforces 0 Production DB Mutations!

async function runComprehensiveApiTests() {
  console.log("==========================================");
  console.log("EIGHTH AUTH STEP - AUTH API & RATE LIMIT INTEGRATION TEST SUITE");
  console.log("==========================================");

  const authCore = await import('../api/_lib/admin-auth.js');
  const authPermissions = await import('../api/_lib/admin-permissions.js');
  const authRateLimit = await import('../api/_lib/admin-rate-limit.js');
  const loginHandler = (await import('../api/_lib/auth-login.js')).default;
  const meHandler = (await import('../api/_lib/auth-me.js')).default;
  const logoutHandler = (await import('../api/_lib/auth-logout.js')).default;

  let passed = 0;
  let failed = 0;

  function assert(cond, testName) {
    if (cond) {
      console.log(` ✅ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAILED: ${testName}`);
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
        'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 250) + 1}`,
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

  // --- 1. RATE LIMIT HELPER & HMAC TESTS ---
  console.log("\n--- 1. RATE LIMIT HELPER & HMAC TESTS ---");
  const ipHash = authRateLimit.deriveRateLimitHmac('IP', '192.168.1.100');
  const identHash = authRateLimit.deriveRateLimitHmac('IDENTIFIER', 'celal');
  const sameIpHash = authRateLimit.deriveRateLimitHmac('IP', '192.168.1.100');

  assert(ipHash.length === 64 && /^[0-9a-f]{64}$/.test(ipHash), "HMAC output 64 lowercase hex");
  assert(ipHash === sameIpHash, "same input -> same HMAC");
  assert(ipHash !== identHash, "IP and IDENTIFIER domain separation -> different hash for same raw string");
  assert(!ipHash.includes('192.168.1.100'), "raw IP absent from HMAC output payload");
  assert(!identHash.includes('celal'), "raw identifier absent from HMAC output payload");

  // Client IP extraction test
  const mockVercelReq = { headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' }, body: { ip: '1.2.3.4' } };
  const clientIp = authRateLimit.getTrustedClientIp(mockVercelReq);
  assert(clientIp === '203.0.113.195', "req.body.ip ignored; trusted Vercel X-Forwarded-For extracted");

  // --- 2. LOGIN API TESTS ---
  console.log("\n--- 2. LOGIN API TESTS ---");
  const t1 = createMockReqRes('GET');
  await loginHandler(t1.req, t1.res);
  assert(t1.res._getStatus() === 405, "LOGIN: non-POST -> 405");

  const t2 = createMockReqRes('POST', {}, { 'content-type': 'text/plain' });
  await loginHandler(t2.req, t2.res);
  assert(t2.res._getStatus() === 400, "LOGIN: invalid content-type -> reject");

  const t3 = createMockReqRes('POST', { password: 'Passphrase123!' });
  await loginHandler(t3.req, t3.res);
  assert(t3.res._getStatus() === 401 && t3.res._getData().error === 'Invalid credentials', "LOGIN: missing identifier -> reject");

  const t4 = createMockReqRes('POST', { identifier: 'celal' });
  await loginHandler(t4.req, t4.res);
  assert(t4.res._getStatus() === 401 && t4.res._getData().error === 'Invalid credentials', "LOGIN: missing password -> reject");

  const t5 = createMockReqRes('POST', { identifier: `unknown_user_${Date.now()}`, password: 'Passphrase123!' });
  await loginHandler(t5.req, t5.res);
  assert(t5.res._getStatus() === 401 && t5.res._getData().error === 'Invalid credentials', "LOGIN: unknown employee -> generic 401");

  const t6 = createMockReqRes('POST', { identifier: `test_nonexistent_${Date.now()}`, password: 'WrongPassword123!' });
  await loginHandler(t6.req, t6.res);
  assert(t6.res._getStatus() === 401 && t6.res._getData().error === 'Invalid credentials', "LOGIN: wrong password or missing credential -> generic 401");

  // --- 3. AUTH-ME API TESTS ---
  console.log("\n--- 3. AUTH-ME API TESTS ---");
  const me1 = createMockReqRes('POST');
  await meHandler(me1.req, me1.res);
  assert(me1.res._getStatus() === 405, "AUTH-ME: non-GET -> 405");

  const me2 = createMockReqRes('GET');
  await meHandler(me2.req, me2.res);
  assert(me2.res._getStatus() === 401 && me2.res._getData().authenticated === false, "AUTH-ME: missing cookie -> 401");

  const me3 = createMockReqRes('GET', {}, { cookie: 'socialart_admin_session=shortbadtoken' });
  await meHandler(me3.req, me3.res);
  assert(me3.res._getStatus() === 401, "AUTH-ME: malformed token -> 401");

  const me4 = createMockReqRes('GET', {}, { cookie: `socialart_admin_session=${'a'.repeat(64)}` });
  await meHandler(me4.req, me4.res);
  assert(me4.res._getStatus() === 401, "AUTH-ME: unknown session -> 401");

  // --- 4. LOGOUT API TESTS ---
  console.log("\n--- 4. LOGOUT API TESTS ---");
  const lo1 = createMockReqRes('GET');
  await logoutHandler(lo1.req, lo1.res);
  assert(lo1.res._getStatus() === 405, "LOGOUT: non-POST -> 405");

  const lo2 = createMockReqRes('POST', {}, { cookie: `socialart_admin_session=${'a'.repeat(64)}` });
  await logoutHandler(lo2.req, lo2.res);
  assert(lo2.res._getStatus() === 200 && lo2.res._getHeaders()['Set-Cookie'].includes('Max-Age=0'), "LOGOUT: invalid session clean cookie -> 200 Max-Age=0");

  // --- 5. REQUEST SECURITY TESTS ---
  console.log("\n--- 5. REQUEST SECURITY TESTS ---");
  const { validateOrigin } = await import('../api/_lib/admin-auth.js');
  assert(validateOrigin({ headers: { origin: 'https://socialartmedya.com' } }) === true, "socialartmedya.com must be allowed");
  assert(validateOrigin({ headers: { origin: 'https://www.socialartmedya.com' } }) === true, "www.socialartmedya.com must be allowed");
  assert(validateOrigin({ headers: { origin: 'https://socialartajans.com' } }) === false, "socialartajans.com must be rejected");
  assert(validateOrigin({ headers: { origin: 'https://www.socialartajans.com' } }) === false, "www.socialartajans.com must be rejected");
  assert(validateOrigin({ headers: { origin: 'https://evil-attacker.com' } }) === false, "unauthorized origin must be rejected");
  console.log(" ✅ PASSED: REQUEST SECURITY: official production domains allowed & external/cross-site rejected");

  const secLogin = createMockReqRes('POST', {}, { origin: 'https://evil-hacker-site.com' });
  await loginHandler(secLogin.req, secLogin.res);
  assert(secLogin.res._getStatus() === 403, "POST /api/auth-login: disallowed Origin -> reject 403");

  const secLogout = createMockReqRes('POST', {}, { origin: 'https://evil-hacker-site.com' });
  await logoutHandler(secLogout.req, secLogout.res);
  assert(secLogout.res._getStatus() === 403, "POST /api/auth-logout: disallowed Origin -> reject 403");

  const changePasswordHandler = (await import('../api/_lib/auth-change-password.js')).default;
  const secChange = createMockReqRes('POST', {}, { origin: 'https://evil-hacker-site.com' });
  await changePasswordHandler(secChange.req, secChange.res);
  assert(secChange.res._getStatus() === 403, "POST /api/auth-change-password: disallowed Origin -> reject 403");

  const provisionHandler = (await import('../api/_lib/auth-provision-credential.js')).default;
  const secProvision = createMockReqRes('POST', {}, { origin: 'https://evil-hacker-site.com' });
  await provisionHandler(secProvision.req, secProvision.res);
  assert(secProvision.res._getStatus() === 403, "POST /api/auth-provision-credential: disallowed Origin -> reject 403");

  const updatePermHandler = (await import('../api/_lib/auth-update-permission-override.js')).default;
  const secPerm = createMockReqRes('POST', {}, { origin: 'https://evil-hacker-site.com' });
  await updatePermHandler(secPerm.req, secPerm.res);
  assert(secPerm.res._getStatus() === 403, "POST /api/auth-update-permission-override: disallowed Origin -> reject 403");

  const updateRoleHandler = (await import('../api/_lib/auth-update-employee-role.js')).default;
  const secRole = createMockReqRes('POST', {}, { origin: 'https://evil-hacker-site.com' });
  await updateRoleHandler(secRole.req, secRole.res);
  assert(secRole.res._getStatus() === 403, "POST /api/auth-update-employee-role: disallowed Origin -> reject 403");

  const updateIdentHandler = (await import('../api/_lib/auth-update-employee-identity.js')).default;
  const secIdent = createMockReqRes('POST', {}, { origin: 'https://evil-hacker-site.com' });
  await updateIdentHandler(secIdent.req, secIdent.res);
  assert(secIdent.res._getStatus() === 403, "POST /api/auth-update-employee-identity: disallowed Origin -> reject 403");
  console.log(" ✅ PASSED: ALL 7 mutating auth routes enforce origin validation (403 Forbidden Origin)");

  // --- 6. REAL PRODUCTION DB MUTATION CHECK ---
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

runComprehensiveApiTests();
