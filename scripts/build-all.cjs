const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // 1. Build panel app
  console.log('--- Building Next.js crm panel (social-art-base)... ---');
  execSync('npm run build', { cwd: path.join(__dirname, '../panel'), stdio: 'inherit' });

  // 2. Clean and create public/admin
  const publicAdminDir = path.join(__dirname, '../public/admin');
  console.log('--- Cleaning public/admin directory... ---');
  if (fs.existsSync(publicAdminDir)) {
    fs.rmSync(publicAdminDir, { recursive: true, force: true });
  }
  fs.mkdirSync(publicAdminDir, { recursive: true });

  // 3. Copy panel/out to public/admin
  const panelOutDir = path.join(__dirname, '../panel/out');
  console.log('--- Copying Next.js static build to public/admin... ---');
  copyDirSync(panelOutDir, publicAdminDir);

  // 4. Build Vite app
  console.log('--- Building main Vite application... ---');
  execSync('npx vite build', { stdio: 'inherit' });

  console.log('--- Build all completed successfully! ---');
} catch (error) {
  console.error('Build process failed:', error);
  process.exit(1);
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
