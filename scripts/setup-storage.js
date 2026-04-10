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

const supabaseUrl = envConfig['VITE_SUPABASE_URL'];
const serviceRoleKey = envConfig['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupStorage() {
  console.log('Checking storage buckets...');
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }

  const bucketName = 'lead-attachments';
  const exists = buckets.find(b => b.name === bucketName);

  if (!exists) {
    console.log(`Creating bucket "${bucketName}"...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    });

    if (createError) {
      console.error('Error creating bucket:', createError);
    } else {
      console.log(`Bucket "${bucketName}" created successfully!`);
    }
  } else {
    console.log(`Bucket "${bucketName}" already exists.`);
  }

  // Set up RLS/Policies for the bucket if needed
  // Note: Storage policies are often handled via the console, but let's try to ensure public access if it's public:true
}

setupStorage();
