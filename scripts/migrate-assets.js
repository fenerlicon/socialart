import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.resolve(__dirname, '../.env');
const envFile = fs.readFileSync(envPath, 'utf8');

const envConfig = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envConfig[match[1]] = match[2].trim();
  }
});

const SUPABASE_URL = envConfig['VITE_SUPABASE_URL'];
const SERVICE_ROLE_KEY = envConfig['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const BUCKET_NAME = 'site-assets';
const ASSETS_DIR = path.resolve(__dirname, '../public/assets');

async function uploadAssets() {
  console.log('Ensuring bucket exists...');
  
  // Try to create the bucket with a reasonable limit first
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true
  });

  if (bucketError && !bucketError.message.includes('already exists')) {
     console.error('Error creating bucket:', bucketError);
  } else {
     console.log('Bucket check passed.');
  }

  // Update bucket to allow larger files (if possible)
  // Note: 413 error on create might mean fileSizeLimit parameter was too big for their plan
  await supabase.storage.updateBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 300 * 1024 * 1024 // 300MB
  }).catch(e => console.log('Update bucket limit failed, continuing with defaults...'));

  const walkSync = (dir, filelist = []) => {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        filelist = walkSync(path.join(dir, file), filelist);
      } else {
        filelist.push(path.join(dir, file));
      }
    });
    return filelist;
  };

  const allFiles = walkSync(ASSETS_DIR);
  console.log(`Found ${allFiles.length} files to upload.`);

  for (const filePath of allFiles) {
    const relativePath = path.relative(ASSETS_DIR, filePath).replace(/\\/g, '/');
    const fileBuffer = fs.readFileSync(filePath);
    
    console.log(`Uploading: ${relativePath} (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)...`);
    
    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(relativePath, fileBuffer, {
      upsert: true,
      contentType: getContentType(relativePath)
    });

    if (uploadError) {
      console.error(`Failed to upload ${relativePath}:`, uploadError.message);
    } else {
      console.log(`Successfully uploaded ${relativePath}`);
    }
  }

  console.log('--- ALL UPLOADS FINISHED ---');
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg': case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.gif': return 'image/gif';
    case '.webp': return 'image/webp';
    case '.mp4': return 'video/mp4';
    case '.mov': return 'video/quicktime';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

uploadAssets();
