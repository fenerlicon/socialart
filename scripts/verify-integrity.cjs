/**
 * SocialArt Ajans — Automated Architectural Integrity Validator
 * Bu script, insan veya yapay zeka hafızasına güvenmeksizin,
 * derleme öncesinde kod tabanını tarar ve kurallara aykırı bir durum varsa BUILD'i DURDURUR.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('--- 🛡️ RUNNING ARCHITECTURAL INTEGRITY CHECKS ---');

let errors = [];

// 1. Check UI Z-Index Stack in panel/components/ui/select.tsx
const selectPath = path.join(rootDir, 'panel', 'components', 'ui', 'select.tsx');
if (fs.existsSync(selectPath)) {
  const content = fs.readFileSync(selectPath, 'utf8');
  if (content.includes('z-50') && !content.includes('z-[99999]')) {
    errors.push('CRITICAL: SelectContent in panel/components/ui/select.tsx must use z-[99999] to prevent being hidden behind z-[9999] modals.');
  }
}

// 2. Check Stateless Auth in api/sentinel-auth.js
const sentinelPath = path.join(rootDir, 'api', 'sentinel-auth.js');
if (fs.existsSync(sentinelPath)) {
  const content = fs.readFileSync(sentinelPath, 'utf8');
  if (content.includes('tempSessions.set(') || content.includes('const tempSessions = new Map()')) {
    errors.push('CRITICAL: In-memory tempSessions map detected in api/sentinel-auth.js. Must use stateless HMAC tickets.');
  }
}

// 3. Check for invalid paid_at column write in payment update calls
const filesToCheckForPaidAt = [
  path.join(rootDir, 'panel', 'app', 'payments', 'page.tsx'),
  path.join(rootDir, 'api', 'iyzico-callback.js')
];

for (const filePath of filesToCheckForPaidAt) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Check if paid_at is being passed in Supabase update payload
    if (content.match(/update\(\s*\{[^}]*paid_at\s*:/)) {
      errors.push(`CRITICAL: Illegal 'paid_at' column in Supabase update payload inside: ${path.relative(rootDir, filePath)}`);
    }
  }
}

// 4. Check Dual Dev Server API Middlewares in vite.config.js
const viteConfigPath = path.join(rootDir, 'vite.config.js');
if (fs.existsSync(viteConfigPath)) {
  const content = fs.readFileSync(viteConfigPath, 'utf8');
  if (!content.includes('/api/sentinel-auth') || !content.includes('sentinelAuthHandler')) {
    errors.push('CRITICAL: vite.config.js is missing local dev server middleware handler for /api/sentinel-auth.');
  }
}

if (errors.length > 0) {
  console.error('\n❌ BUILD FAILED DUE TO ARCHITECTURAL RULE VIOLATIONS:');
  errors.forEach((err, idx) => console.error(`  ${idx + 1}. ${err}`));
  console.error('\nLütfen bu hataları düzeltmeden projeyi derlemeyiniz.\n');
  process.exit(1);
} else {
  console.log('✅ All Architectural & Security Integrity Checks Passed with 0 Violations!\n');
}
