import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually since process.env is not fully populated by Vite without dotenv
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
const SUPABASE_SERVICE_KEY = envConfig['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase URL or Service Key');
  process.exit(1);
}

// Create admin client
const supabaseAdminAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const usersToCreate = [
  { username: 'tugba', password: 'Tugba_SA2026!x', name: 'Tuğba', role: 'Sosyal Medya Uzmanı', class: 'Çalışan', can_assign_task: false, can_add_client: true },
  { username: 'celal', password: 'Celal_SA2026!x', name: 'Celal', role: 'Kurucu', class: 'Görevli', can_assign_task: true, can_add_client: true },
  { username: 'ercan', password: 'Ercan_SA2026!x', name: 'Ercan', role: 'Kurucu', class: 'Görevli', can_assign_task: true, can_add_client: true },
  { username: 'betul', password: 'Betul_SA2026!x', name: 'Betül', role: 'ART Direktör', class: 'Çalışan', can_assign_task: false, can_add_client: true },
  { username: 'simge', password: 'Simge_SA2026!x', name: 'Simge', role: 'Sosyal Medya Specialist', class: 'Görevli', can_assign_task: true, can_add_client: true },
  { username: 'furkan', password: 'Furkan_SA2026!x', name: 'Furkan', role: 'Dijital Pazarlama Uzmanı', class: 'Görevli', can_assign_task: true, can_add_client: true },
];

async function seedUsers() {
  console.log('Starting user creation task...');
  
  for (const u of usersToCreate) {
    const email = `${u.username}@socialart.internal`; // dummy internal email
    
    console.log(`Creating user: ${u.username}...`);
    
    const { data, error } = await supabaseAdminAdmin.auth.admin.createUser({
      email: email,
      password: u.password,
      email_confirm: true,
      user_metadata: {
        username: u.username,
        display_name: u.name,
        role: u.role,
        class: u.class,
        can_assign_task: u.can_assign_task,
        can_add_client: u.can_add_client
      }
    });

    if (error) {
      console.error(`Error creating ${u.username}: `, error.message);
    } else {
      console.log(`Successfully created ${u.username} with ID: ${data.user.id}`);
    }
  }
}

seedUsers();
