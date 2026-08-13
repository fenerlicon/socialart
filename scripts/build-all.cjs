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
  // 0. Install panel dependencies
  console.log('--- Installing panel dependencies... ---');
  execSync(`${npmCmd} install --legacy-peer-deps`, { cwd: path.join(__dirname, '../panel'), stdio: 'inherit' });

  // 0.5. Generate panel/.env.local for client-side bundling
  console.log('--- Generating panel/.env.local for static export... ---');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  const envContent = `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}\n`;
  fs.writeFileSync(path.join(__dirname, '../panel/.env.local'), envContent);

  // 1. Build panel app
  console.log('--- Building Next.js crm panel (social-art-base)... ---');
  execSync(`${npmCmd} run build`, { cwd: path.join(__dirname, '../panel'), stdio: 'inherit' });

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
  execSync(`${npxCmd} vite build`, { stdio: 'inherit' });

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
