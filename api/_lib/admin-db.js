import { createClient } from '@supabase/supabase-js';

/**
 * Server-Only Database Helper for Admin Auth
 * STRICT SECURITY RULES:
 * 1. Must ONLY be imported in serverless lambdas under /api/.
 * 2. Uses SUPABASE_SERVICE_ROLE_KEY to bypass client RLS for admin sessions/auth credentials.
 * 3. Never logs keys, passwords, or tokens.
 */

const DB1_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2OTMzMSwiZXhwIjoyMDk0MzQ1MzMxfQ.placeholder';

let cachedClient = null;

export function getAdminSupabase() {
  if (!cachedClient) {
    cachedClient = createClient(DB1_URL, SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  return cachedClient;
}
