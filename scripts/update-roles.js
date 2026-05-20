import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const supabaseKey = envConfig['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateUsers() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  for (const u of users) {
    const meta = u.user_metadata;
    let needsUpdate = false;
    let newMeta = { ...meta };

    if (meta.display_name === 'Simge') {
      newMeta.role = 'Social Media Manager';
      needsUpdate = true;
    } else if (meta.display_name === 'Tuğba') {
      newMeta.role = 'Social Media Specialist';
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log(`Updating ${meta.display_name} to role: ${newMeta.role}`);
      const { data, error: updateError } = await supabase.auth.admin.updateUserById(u.id, {
        user_metadata: newMeta
      });
      if (updateError) {
        console.error(`Failed to update ${meta.display_name}:`, updateError);
      } else {
        console.log(`Successfully updated ${meta.display_name}.`);
      }
    }
  }
}

updateUsers();
