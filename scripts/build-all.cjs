const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from the panel .env.local first (to preserve separate database settings)
require('dotenv').config({ path: path.join(__dirname, '../panel/.env.local') });
// Load environment variables from the root .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

try {
  // 0. Run Automated Architectural & Security Integrity Validator
  console.log('--- Step 0: Checking Architectural Integrity Rules... ---');
  execSync(`node "${path.join(__dirname, 'verify-integrity.cjs')}"`, { stdio: 'inherit' });

  // 0.2. Install panel dependencies
  console.log('--- Installing panel dependencies... ---');
  execSync(`${npmCmd} install --legacy-peer-deps`, { cwd: path.join(__dirname, '../panel'), stdio: 'inherit' });

  // 0.5. Generate panel/.env.local for client-side bundling
  console.log('--- Generating panel/.env.local for static export... ---');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  const envContent = `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}\n`;
  fs.writeFileSync(path.join(__dirname, '../panel/.env.local'), envContent);

  // 1. Build panel app with fresh cache
  console.log('--- Cleaning previous panel build caches... ---');
  const panelNextDir = path.join(__dirname, '../panel/.next');
  const panelOutDir = path.join(__dirname, '../panel/out');
  robustCleanDir(panelNextDir);
  robustCleanDir(panelOutDir);

  console.log('--- Building Next.js crm panel (social-art-base)... ---');
  execSync(`${npmCmd} run build`, { cwd: path.join(__dirname, '../panel'), stdio: 'inherit' });

  // 2. Clean and create public/admin
  const publicAdminDir = path.join(__dirname, '../public/admin');
  console.log('--- Cleaning public/admin directory... ---');
  robustCleanDir(publicAdminDir);
  fs.mkdirSync(publicAdminDir, { recursive: true });

  // 3. Copy panel/out to public/admin
  console.log('--- Copying Next.js static build to public/admin... ---');
  copyDirSync(panelOutDir, publicAdminDir);

  // 3.5. Ensure Clean URL fallback files for Vercel dynamic routing
  console.log('--- Creating Clean URL fallback files for Vercel... ---');
  try {
    const brandsTempHtml = path.join(publicAdminDir, 'brands/temp.html');
    const brandsTempClean = path.join(publicAdminDir, 'brands/temp');
    if (fs.existsSync(brandsTempHtml)) {
      fs.copyFileSync(brandsTempHtml, brandsTempClean);
      console.log('  -> Copied brands/temp.html to brands/temp');
    }

    const employeesTempHtml = path.join(publicAdminDir, 'employees/temp.html');
    const employeesTempClean = path.join(publicAdminDir, 'employees/temp');
    if (fs.existsSync(employeesTempHtml)) {
      fs.copyFileSync(employeesTempHtml, employeesTempClean);
      console.log('  -> Copied employees/temp.html to employees/temp');
    }

    const employeesTempEditHtml = path.join(publicAdminDir, 'employees/temp/edit.html');
    const employeesTempEditClean = path.join(publicAdminDir, 'employees/temp/edit');
    if (fs.existsSync(employeesTempEditHtml)) {
      fs.copyFileSync(employeesTempEditHtml, employeesTempEditClean);
      console.log('  -> Copied employees/temp/edit.html to employees/temp/edit');
    }
  } catch (err) {
    console.warn('Notice creating clean URL fallback files:', err.message);
  }

  // 4. Build Vite app
  console.log('--- Building main Vite application... ---');
  execSync(`${npxCmd} vite build`, { stdio: 'inherit' });

  console.log('--- Build all completed successfully! ---');
} catch (error) {
  console.error('Build process failed:', error);
  process.exit(1);
}

function robustCleanDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  if (process.platform === 'win32') {
    try {
      execSync(`cmd /c "if exist "${dirPath}" rmdir /s /q "${dirPath}""`, { stdio: 'ignore' });
    } catch (_) {}
  }
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    } catch (_) {}
  }
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
