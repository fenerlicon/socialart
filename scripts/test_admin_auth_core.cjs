// Local unit test runner for Server-Only Admin Auth Core
// Uses dynamic import to test api/_lib/admin-auth.js

async function runTests() {
  console.log("==========================================");
  console.log("LOCAL AUTH CORE UNIT TEST SUITE");
  console.log("==========================================");

  const authCore = await import('../api/_lib/admin-auth.js');
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(` ✅ PASSED: ${testName}`);
      passedCount++;
    } else {
      console.error(` ❌ FAILED: ${testName}`);
      failedCount++;
    }
  }

  // --- 1. PASSWORD POLICY TESTS ---
  console.log("\n1. Testing Password Policy...");
  assert(authCore.validatePasswordPolicy("123").valid === false, "Reject '123'");
  assert(authCore.validatePasswordPolicy("password").valid === false, "Reject 'password'");
  assert(authCore.validatePasswordPolicy("short").valid === false, "Reject short password (<8 chars)");
  assert(authCore.validatePasswordPolicy("StrongPassphrase2026!").valid === true, "Accept strong passphrase (>=12 chars)");

  // --- 2. PASSWORD HASHING & VERIFICATION TESTS ---
  console.log("\n2. Testing Password Hashing & Verification...");
  const pass1 = "MyStrongSecurePassword2026!";
  const hash1 = authCore.hashPassword(pass1);
  const hash2 = authCore.hashPassword(pass1);

  assert(hash1.startsWith("scrypt$v=1$N=16384$r=8$p=1$"), "Canonical hash format prefix correct");
  assert(hash1 !== hash2, "Salt uniqueness (two hashes of same pass produce different salts)");
  assert(authCore.verifyPassword(pass1, hash1) === true, "Correct password verification = true");
  assert(authCore.verifyPassword("WrongPassword2026!", hash1) === false, "Wrong password verification = false");
  assert(authCore.verifyPassword(pass1, "scrypt$v=1$N=16384$r=8$p=1$bad$hash") === false, "Malformed hash verification = false");
  assert(authCore.verifyPassword(pass1, "scrypt$v=99$N=16384$r=8$p=1$salt$hash") === false, "Unsupported version verification = false");
  assert(authCore.verifyPassword(pass1, "scrypt$v=1$N=99999999$r=8$p=1$salt$hash") === false, "DoS N parameter protection = false");

  // --- 3. SESSION TOKEN & HASHING TESTS ---
  console.log("\n3. Testing Session Token & Hashing...");
  const rawTok1 = authCore.generateSessionToken();
  const rawTok2 = authCore.generateSessionToken();

  assert(typeof rawTok1 === 'string' && rawTok1.length === 64, "generateSessionToken produces 64 hex chars");
  assert(rawTok1 !== rawTok2, "Session tokens are random & distinct");

  const tokHash1 = authCore.hashSessionToken(rawTok1);
  const tokHash2 = authCore.hashSessionToken(rawTok1);

  assert(tokHash1.length === 64 && /^[0-9a-f]{64}$/.test(tokHash1), "hashSessionToken produces 64-char lowercase hex string");
  assert(tokHash1 === tokHash2, "Deterministic SHA-256 hash matching");
  assert(tokHash1 !== rawTok1, "Raw token and DB hash are distinct");

  // --- 4. COOKIE TESTS ---
  console.log("\n4. Testing Cookie Helper...");
  const prodCookie = authCore.createSessionCookie(rawTok1, true);
  const devCookie = authCore.createSessionCookie(rawTok1, false);

  assert(prodCookie.includes("socialart_admin_session="), "Cookie contains correct name");
  assert(prodCookie.includes("HttpOnly"), "Cookie includes HttpOnly");
  assert(prodCookie.includes("SameSite=Strict"), "Cookie includes SameSite=Strict");
  assert(prodCookie.includes("Path=/"), "Cookie includes Path=/");
  assert(prodCookie.includes("Max-Age=86400"), "Cookie includes Max-Age=86400");
  assert(prodCookie.includes("Secure"), "Production cookie includes Secure");
  assert(!devCookie.includes("Secure"), "Development cookie omits Secure for localhost");

  const mockReq = { headers: { cookie: `other_cookie=1; socialart_admin_session=${rawTok1}; foo=bar` } };
  const parsedToken = authCore.parseSessionCookie(mockReq);
  assert(parsedToken === rawTok1, "parseSessionCookie correctly extracts token from header");

  // --- 5. LOG SAFETY AUDIT ---
  console.log("\n5. Testing Log Safety...");
  // Confirm string outputs do not print passwords or raw keys
  assert(!hash1.includes(pass1), "Password hash string does not leak plaintext password");

  console.log("\n==========================================");
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("==========================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
