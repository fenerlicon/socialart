import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://osuwytugjscwhcxxkhfa.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const LEADS_SUPABASE_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const LEADS_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjkzMzEsImV4cCI6MjA5NDM0NTMzMX0.Bp4A-VwFMuOgpIqL_yud-i85uwnjxNZ4hXMNxNKu1HA';

export const supabase = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
export const supabaseLeads = createClient(LEADS_SUPABASE_URL, LEADS_SUPABASE_ANON_KEY);

const ALLOWED_COLUMNS = {
  leads: ['id', 'title', 'name', 'contact_name', 'phone', 'email', 'service', 'pipeline', 'budget', 'status', 'stage', 'platform', 'city', 'rep', 'reaction', 'notes', 'date', 'created_at', 'updated_at'],
  active_clients: ['id', 'name', 'brand_name', 'contact_person', 'email', 'phone', 'monthly_fee', 'payment_day', 'status', 'created_at', 'updated_at'],
  employees: ['id', 'full_name', 'email', 'phone', 'title', 'role', 'salary', 'permission_overrides', 'created_at'],
  tasks: ['id', 'title', 'description', 'assigned_to', 'status', 'due_date', 'created_at'],
  appointments: ['id', 'title', 'service_name', 'client_name', 'name', 'date', 'time', 'location', 'created_at'],
  payment_requests: ['id', 'client_name', 'company_code', 'title', 'description', 'amount', 'kdv_amount', 'total_amount', 'status', 'created_at', 'updated_at'],
  job_applications: ['id', 'full_name', 'position', 'email', 'phone', 'portfolio_url', 'resume_url', 'about', 'status', 'created_at'],
  ugc_applications: ['id', 'full_name', 'email', 'phone', 'instagram_url', 'portfolio_url', 'city', 'about', 'status', 'created_at']
};

export function cleanSchemaPayload(tableName, payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const allowed = ALLOWED_COLUMNS[tableName];
  if (!allowed) return payload;

  if (Array.isArray(payload)) {
    return payload.map(item => cleanSchemaPayload(tableName, item));
  }

  const clean = {};
  for (const key of Object.keys(payload)) {
    if (allowed.includes(key)) {
      clean[key] = payload[key];
    }
  }
  return clean;
}

