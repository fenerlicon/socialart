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
let cachedSecondaryClient = null;

const DB2_URL = 'https://osuwytugjscwhcxxkhfa.supabase.co';
const DB2_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';
const DB2_SERVICE_ROLE = process.env.SUPABASE_SECONDARY_SERVICE_ROLE_KEY || DB2_KEY;

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

export function getSecondaryAdminSupabase() {
  if (!cachedSecondaryClient) {
    cachedSecondaryClient = createClient(DB2_URL, DB2_SERVICE_ROLE, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  return cachedSecondaryClient;
}
