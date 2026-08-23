const assert = require('assert');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function createMockReqRes(method = 'GET', body = {}, headers = {}, query = {}, url = '/api/auth-router') {
  let statusCode = 200;
  let responseData = null;
  const resHeaders = {};

  const req = {
    method,
    body,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    query,
    url
  };

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    setHeader(name, val) {
      resHeaders[name] = val;
      return res;
    },
    _getStatus() { return statusCode; },
    _getData() { return responseData; },
    _getHeaders() { return resHeaders; },
    headersSent: false
  };

  return { req, res };
}

async function runAuthRouterTestSuite() {
  console.log("==========================================");
  console.log("AUTH ROUTER ENTRYPOINT TEST SUITE");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  function runTest(description, fn) {
    try {
      fn();
      console.log(` ✅ PASSED: ${description}`);
      passed++;
    } catch (err) {
      console.error(` ❌ FAILED: ${description} -> ${err.message}`);
      failed++;
    }
  }

  async function runAsyncTest(description, fn) {
    try {
      await fn();
      console.log(` ✅ PASSED: ${description}`);
      passed++;
    } catch (err) {
      console.error(` ❌ FAILED: ${description} -> ${err.message}`);
      failed++;
    }
  }

  const authRouterHandler = (await import('../api/auth-router.js')).default;

  // 1. Vercel Rewrite Contract Test
  runTest("Vercel Auth Rewrite Contract is 100% Valid", () => {
    const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
    assert(fs.existsSync(vercelJsonPath), "vercel.json missing");
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    const rewrites = vercelConfig.rewrites || [];

    const expectedRewrites = {
      '/api/auth-login': '/api/auth-router?route=login',
      '/api/auth-me': '/api/auth-router?route=me',
      '/api/auth-logout': '/api/auth-router?route=logout',
      '/api/auth-change-password': '/api/auth-router?route=change-password',
      '/api/auth-provision-credential': '/api/auth-router?route=provision-credential',
      '/api/auth-update-team-manage': '/api/auth-router?route=update-team-manage',
      '/api/auth-update-permission-override': '/api/auth-router?route=update-permission-override',
      '/api/auth-update-employee-role': '/api/auth-router?route=update-employee-role',
      '/api/auth-update-employee-identity': '/api/auth-router?route=update-employee-identity',
    };

    Object.entries(expectedRewrites).forEach(([source, expectedDest]) => {
      const match = rewrites.find(r => r.source === source);
      assert(match, `Missing rewrite for ${source}`);
      assert.strictEqual(match.destination, expectedDest, `Rewrite mismatch for ${source}`);
    });
  });

  // 2. Route Dispatch & Method Parity Tests
  await runAsyncTest("LOGIN ROUTE: GET -> 405", async () => {
    const { req, res } = createMockReqRes('GET', {}, {}, {}, '/api/auth-router?route=login');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 405);
  });

  await runAsyncTest("ME ROUTE: POST -> 405", async () => {
    const { req, res } = createMockReqRes('POST', {}, {}, {}, '/api/auth-router?route=me');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 405);
  });

  await runAsyncTest("LOGOUT ROUTE: GET -> 405", async () => {
    const { req, res } = createMockReqRes('GET', {}, {}, {}, '/api/auth-router?route=logout');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 405);
  });

  await runAsyncTest("CHANGE-PASSWORD ROUTE: GET -> 405", async () => {
    const { req, res } = createMockReqRes('GET', {}, {}, {}, '/api/auth-router?route=change-password');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 405);
  });

  await runAsyncTest("PROVISION-CREDENTIAL ROUTE: PUT -> 405", async () => {
    const { req, res } = createMockReqRes('PUT', {}, {}, {}, '/api/auth-router?route=provision-credential');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 405);
  });

  await runAsyncTest("UPDATE-PERMISSION-OVERRIDE ROUTE: GET -> 405", async () => {
    const { req, res } = createMockReqRes('GET', {}, {}, {}, '/api/auth-router?route=update-permission-override');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 405);
  });

  await runAsyncTest("UPDATE-EMPLOYEE-ROLE ROUTE: GET -> 405", async () => {
    const { req, res } = createMockReqRes('GET', {}, {}, {}, '/api/auth-router?route=update-employee-role');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 405);
  });

  await runAsyncTest("UPDATE-EMPLOYEE-IDENTITY ROUTE: GET -> 405", async () => {
    const { req, res } = createMockReqRes('GET', {}, {}, {}, '/api/auth-router?route=update-employee-identity');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 405);
  });

  await runAsyncTest("UNKNOWN ROUTE: ?route=unknown -> 404", async () => {
    const { req, res } = createMockReqRes('POST', {}, {}, {}, '/api/auth-router?route=unknown');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 404);
  });

  await runAsyncTest("MISSING ROUTE: /api/auth-router -> 404", async () => {
    const { req, res } = createMockReqRes('GET', {}, {}, {}, '/api/auth-router');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 404);
  });

  // 3. Router Security Parity Tests
  await runAsyncTest("LOGIN DISPATCH: Disallowed Origin -> 403", async () => {
    const { req, res } = createMockReqRes('POST', {}, { origin: 'https://malicious-site.com' }, {}, '/api/auth-router?route=login');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 403);
  });

  await runAsyncTest("ME DISPATCH: Missing Cookie -> 401", async () => {
    const { req, res } = createMockReqRes('GET', {}, {}, {}, '/api/auth-router?route=me');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 401);
    assert.strictEqual(res._getData()?.authenticated, false);
  });

  await runAsyncTest("LOGOUT DISPATCH: Invalid Session -> 200 Max-Age=0", async () => {
    const { req, res } = createMockReqRes('POST', {}, { cookie: 'socialart_admin_session=invalid' }, {}, '/api/auth-router?route=logout');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 200);
    assert(res._getHeaders()['Set-Cookie']?.includes('Max-Age=0'));
  });

  await runAsyncTest("CHANGE-PASSWORD DISPATCH: Missing Session -> 401", async () => {
    const { req, res } = createMockReqRes('POST', { currentPassword: 'old', newPassword: 'new' }, {}, {}, '/api/auth-router?route=change-password');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 401);
  });

  // 4. Malformed Route & Allowlist Safety Tests
  await runAsyncTest("ALLOWLIST SAFETY: Path Traversal ?route=../../something -> 404", async () => {
    const { req, res } = createMockReqRes('POST', {}, {}, {}, '/api/auth-router?route=../../something');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 404);
  });

  await runAsyncTest("ALLOWLIST SAFETY: Arbitrary module ?route=admin -> 404", async () => {
    const { req, res } = createMockReqRes('POST', {}, {}, {}, '/api/auth-router?route=admin');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 404);
  });

  await runAsyncTest("QUERY SHAPE SAFETY: Array query ?route[]=login -> 404", async () => {
    const { req, res } = createMockReqRes('POST', {}, {}, { route: ['login', 'me'] }, '/api/auth-router');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 404);
  });

  await runAsyncTest("QUERY SHAPE SAFETY: Object query ?route[$gt]= -> 404", async () => {
    const { req, res } = createMockReqRes('POST', {}, {}, { route: { '$gt': '' } }, '/api/auth-router');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 404);
  });

  // 5. Fallback Rewritten Path Dispatched Contract Test
  await runAsyncTest("FALLBACK PATH: /api/auth-login -> login handler", async () => {
    const { req, res } = createMockReqRes('GET', {}, {}, {}, '/api/auth-login');
    await authRouterHandler(req, res);
    assert.strictEqual(res._getStatus(), 405); // loginHandler responds 405 on GET
  });

  console.log("\n==========================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthRouterTestSuite();
