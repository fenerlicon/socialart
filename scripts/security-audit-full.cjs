const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function scanDir(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    if (fs.statSync(p).isDirectory()) {
      if (item !== 'node_modules' && item !== '.git' && item !== '_next' && item !== 'dist' && item !== 'out') {
        files = files.concat(scanDir(p));
      }
    } else if (/\.(jsx|tsx|js|ts|json|env)$/.test(item)) {
      files.push(p);
    }
  }
  return files;
}

const allFiles = scanDir(path.join(root, 'src'))
  .concat(scanDir(path.join(root, 'panel/app')))
  .concat(scanDir(path.join(root, 'panel/components')))
  .concat(scanDir(path.join(root, 'panel/features')))
  .concat(scanDir(path.join(root, 'panel/lib')))
  .concat(scanDir(path.join(root, 'api')));

console.log('Auditing total source files:', allFiles.length);

const leakRules = [
  { name: 'Hardcoded Seed Password', regex: /password\s*:\s*['"][^'"]{4,}['"]/i },
  { name: 'Hardcoded 2FA Secret Key', regex: /secret\s*:\s*['"][A-Z2-7]{16,}['"]/i },
  { name: 'Service Role Key in Frontend', regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[^'"]*service_role[^'"]*/i },
  { name: 'Employee Private Phone/Identity', regex: /(identityNumber|tc_kimlik|tcKimlik)\s*[:=]\s*['"][0-9]{11}['"]/i }
];

let leakHits = [];
for (const f of allFiles) {
  const content = fs.readFileSync(f, 'utf8');
  for (const r of leakRules) {
    if (r.regex.test(content)) {
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (r.regex.test(l) && !l.includes('placeholder') && !l.includes('dummy') && !l.includes('type="password"')) {
          leakHits.push({
            rule: r.name,
            file: path.relative(root, f),
            line: idx + 1,
            snippet: l.trim().substring(0, 120)
          });
        }
      });
    }
  }
}

console.log('--- 🔍 AUDIT FINDINGS ---');
console.log('Finding Count:', leakHits.length);
console.log(JSON.stringify(leakHits, null, 2));
