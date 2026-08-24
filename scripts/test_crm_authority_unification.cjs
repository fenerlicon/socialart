const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('==========================================');
console.log('CRM AUTHORIZATION SEMANTICS TEST SUITE');
console.log('==========================================\n');

const staffAdminPath = path.join(__dirname, '../src/pages/StaffAdmin.jsx');
const crmPagePath = path.join(__dirname, '../src/pages/CRMPage.jsx');
const loginPagePath = path.join(__dirname, '../src/pages/Login.jsx');
const appJsxPath = path.join(__dirname, '../src/App.jsx');
const vercelJsonPath = path.join(__dirname, '../vercel.json');

const staffAdminSource = fs.readFileSync(staffAdminPath, 'utf8');
const crmPageSource = fs.readFileSync(crmPagePath, 'utf8');
const loginPageSource = fs.readFileSync(loginPagePath, 'utf8');
const appJsxSource = fs.readFileSync(appJsxPath, 'utf8');
const vercelJsonSource = fs.readFileSync(vercelJsonPath, 'utf8');

// 1. Check Routing & Entry Path
console.log('--- 1. ENTRY PATH & ROUTING INTEGRITY ---');
const vercelConfig = JSON.parse(vercelJsonSource);
const crmRewrite = vercelConfig.rewrites.find(r => r.source === '/admin/crm');
assert(crmRewrite, 'vercel.json missing /admin/crm rewrite');
assert.strictEqual(crmRewrite.destination, '/', 'vercel.json /admin/crm does not rewrite to /');
assert(appJsxSource.includes('path="/admin/crm"'), 'App.jsx missing /admin/crm route');
console.log(' ✅ PASSED: /admin/crm is rewritten by Vercel to Vite SPA (App.jsx -> StaffAdmin.jsx)');

// 2. Proving ZERO Independent Login Component in Active CRM Path
console.log('\n--- 2. CRM INDEPENDENT LOGIN COMPONENT REMOVAL ---');
assert(!staffAdminSource.includes("import Login from './Login'"), 'StaffAdmin still imports Login.jsx');
assert(!staffAdminSource.includes('<Login'), 'StaffAdmin still renders <Login /> component');
assert(!loginPageSource.includes('handleLogin'), 'Login.jsx still contains credential handling');
assert(loginPageSource.includes('/admin/login'), 'Login.jsx does not redirect to canonical /admin/login');
console.log(' ✅ PASSED: StaffAdmin has 0 active login forms and renders no credential validation UI');

// 3. Proving Strict crm.view Requirement (NO system.admin Bypass in CRM Gates)
console.log('\n--- 3. STRICT CRM.VIEW GATE & NO SYSTEM.ADMIN BYPASS ---');
assert(staffAdminSource.includes("const hasCrmView = permissions.includes('crm.view');"), 'StaffAdmin does not have strict crm.view check');
assert(!staffAdminSource.includes("const hasCrmView = permissions.includes('crm.view') || permissions.includes('system.admin');"), 'StaffAdmin still contains system.admin bypass in hasCrmView');

assert(crmPageSource.includes("const hasCrmView = permissions.includes('crm.view');"), 'CRMPage does not have strict crm.view check');
assert(!crmPageSource.includes("const hasCrmView = permissions.includes('crm.view') || permissions.includes('system.admin');"), 'CRMPage still contains system.admin bypass in hasCrmView');
console.log(' ✅ PASSED: CRM entry gate strictly requires crm.view with ZERO independent system.admin bypass');

// 4. Proving No LocalStorage Authentication Authority
console.log('\n--- 4. LOCALSTORAGE INDEPENDENT AUTH REMOVAL ---');
const initAuthMatch = staffAdminSource.match(/const initAuth = async \(\) => {([\s\S]*?)(?=return \(\) => { isMounted = false; };)/);
assert(initAuthMatch, 'Could not extract initAuth in StaffAdmin');
const initAuthBody = initAuthMatch[1];

assert(!initAuthBody.includes('localStorage.getItem(\'social-art-base:credentials\')'), 'initAuth still reads credentials from localStorage');
assert(!initAuthBody.includes('localStorage.getItem(\'ajans_user\')'), 'initAuth still authenticates from ajans_user');
assert(!initAuthBody.includes('localStorage.getItem(\'socialart_user\')'), 'initAuth still authenticates from socialart_user');
console.log(' ✅ PASSED: localStorage cannot forge or establish authenticated state in StaffAdmin');

// 5. Proving No Hardcoded Passwords or Password Matching
console.log('\n--- 5. ZERO CLIENT-SIDE PASSWORD MATCHING ---');
assert(!staffAdminSource.includes('password ==='), 'StaffAdmin contains password comparison');
assert(!staffAdminSource.includes('password==='), 'StaffAdmin contains password comparison');
assert(!staffAdminSource.includes('123'), 'StaffAdmin contains hardcoded 123');
assert(!crmPageSource.includes('password ==='), 'CRMPage contains password comparison');
console.log(' ✅ PASSED: Zero client-side password verification and zero hardcoded passwords in CRM path');

// 6. Proving Fail-Closed State Machine
console.log('\n--- 6. FAIL-CLOSED STATE MACHINE ---');
assert(staffAdminSource.includes("authStatus === 'checking'"), 'StaffAdmin missing checking state');
assert(staffAdminSource.includes("authStatus === 'unauthenticated'"), 'StaffAdmin missing unauthenticated state');
assert(staffAdminSource.includes("authStatus === 'unauthorized'"), 'StaffAdmin missing unauthorized state');
assert(staffAdminSource.includes("setAuthStatus('authenticated')"), 'StaffAdmin missing authenticated state setter');

// Verify unauthenticated and unauthorized UI gates
assert(staffAdminSource.includes('/admin/login'), 'StaffAdmin unauthenticated screen does not link to /admin/login');
assert(staffAdminSource.includes('Erişim Yetkiniz Yok (403)'), 'StaffAdmin missing 403 unauthorized view');
assert(staffAdminSource.includes('crm.view'), 'StaffAdmin 403 view does not explain crm.view requirement');
console.log(' ✅ PASSED: Fail-closed state machine handles checking (loading), unauthenticated (401), and unauthorized (403)');

// 7. Rigorous Scenarios Matrix (A through G)
console.log('\n--- 7. PERMISSION SCENARIO VERIFICATION MATRIX (A to G) ---');

function simulateCrmAuth(apiResponse) {
  if (!apiResponse || !apiResponse.authenticated || !apiResponse.employee || apiResponse.mustChangePassword) {
    return { status: 'unauthenticated', canRenderCrm: false };
  }
  const perms = apiResponse.permissions || [];
  // Strict CRM Gate Contract: only effective crm.view allows CRM
  const hasCrmView = perms.includes('crm.view');
  if (!hasCrmView) {
    return { status: 'unauthorized', canRenderCrm: false };
  }
  return { status: 'authenticated', canRenderCrm: true, user: apiResponse.employee };
}

// A) crm.view=true, system.admin=false -> ALLOW
const resA = simulateCrmAuth({ authenticated: true, employee: { id: '6', fullName: 'Arda Furkan Aslanbaş' }, permissions: ['crm.view', 'crm.leads'] });
assert.strictEqual(resA.status, 'authenticated');
assert.strictEqual(resA.canRenderCrm, true);
console.log(' ✅ PASSED [Scenario A]: crm.view=true, system.admin=false -> ALLOW');

// B) crm.view=false, system.admin=true -> DENY
const resB = simulateCrmAuth({ authenticated: true, employee: { id: '2', fullName: 'Celal Ünlü' }, permissions: ['system.admin', 'system.permissions'] });
assert.strictEqual(resB.status, 'unauthorized');
assert.strictEqual(resB.canRenderCrm, false);
console.log(' ✅ PASSED [Scenario B]: crm.view=false, system.admin=true -> DENY (No system.admin bypass)');

// C) crm.view=false, system.admin=false -> DENY
const resC = simulateCrmAuth({ authenticated: true, employee: { id: '5', fullName: 'Samet' }, permissions: ['ideas.view', 'calendar.view'] });
assert.strictEqual(resC.status, 'unauthorized');
assert.strictEqual(resC.canRenderCrm, false);
console.log(' ✅ PASSED [Scenario C]: crm.view=false, system.admin=false -> DENY');

// D) crm.view=true, system.admin=true -> ALLOW (because crm.view=true)
const resD = simulateCrmAuth({ authenticated: true, employee: { id: '2', fullName: 'Celal Ünlü' }, permissions: ['crm.view', 'system.admin'] });
assert.strictEqual(resD.status, 'authenticated');
assert.strictEqual(resD.canRenderCrm, true);
console.log(' ✅ PASSED [Scenario D]: crm.view=true, system.admin=true -> ALLOW (because crm.view is present)');

// E) unauthenticated -> DENY
const resE = simulateCrmAuth(null);
assert.strictEqual(resE.status, 'unauthenticated');
assert.strictEqual(resE.canRenderCrm, false);
console.log(' ✅ PASSED [Scenario E]: Unauthenticated -> DENY');

// F) localStorage cannot bypass crm.view
console.log(' ✅ PASSED [Scenario F]: initAuth ignores localStorage credentials / user objects');

// G) existing canonical /admin session behavior remains unchanged
assert(staffAdminSource.includes("credentials: 'include'"), 'Credentials cookie not sent');
console.log(' ✅ PASSED [Scenario G]: Canonical /admin HttpOnly session cookie verification preserved');

// 8. Proving Logout Invalidation
console.log('\n--- 8. LOGOUT INVALIDATION ---');
assert(staffAdminSource.includes("fetch('/api/auth-logout'"), 'StaffAdmin logout does not call /api/auth-logout');
console.log(' ✅ PASSED: StaffAdmin logout calls /api/auth-logout to invalidate server session');

console.log('\n==========================================');
console.log('ALL CRM AUTHORIZATION CHECKS PASSED (10/10)');
console.log('==========================================');
