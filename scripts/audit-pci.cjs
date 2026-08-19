const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '../src'),
  path.join(__dirname, '../panel')
];

function scan(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    if (fs.statSync(p).isDirectory()) {
      if (item !== 'node_modules' && item !== '.next' && item !== 'dist' && item !== 'out') {
        files = files.concat(scan(p));
      }
    } else if (/\.(jsx|tsx|js|ts)$/.test(item)) {
      files.push(p);
    }
  }
  return files;
}

let allFiles = [];
targetDirs.forEach(d => { if (fs.existsSync(d)) allFiles = allFiles.concat(scan(d)); });

let localKeys = new Set();
for (const f of allFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const regex = /localStorage\.setItem\(\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    localKeys.add(match[1]);
  }
}

console.log('--- 🔍 AUDITED LOCALSTORAGE KEYS ---');
console.log(Array.from(localKeys));
