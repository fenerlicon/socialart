import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://osuwytugjscwhcxxkhfa.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;

const LEADS_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const LEADS_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjkzMzEsImV4cCI6MjA5NDM0NTMzMX0.Bp4A-VwFMuOgpIqL_yud-i85uwnjxNZ4hXMNxNKu1HA';

const leadsUrl = process.env.NEXT_PUBLIC_LEADS_SUPABASE_URL || process.env.VITE_LEADS_SUPABASE_URL || LEADS_URL;
const leadsAnonKey = process.env.NEXT_PUBLIC_LEADS_SUPABASE_ANON_KEY || process.env.VITE_LEADS_SUPABASE_ANON_KEY || LEADS_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseLeads = createClient(leadsUrl, leadsAnonKey);

