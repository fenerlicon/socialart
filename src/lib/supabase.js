import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://osuwytugjscwhcxxkhfa.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const LEADS_SUPABASE_URL = 'https://piffaggeshfrubyjkhej.supabase.co';
const LEADS_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjkzMzEsImV4cCI6MjA5NDM0NTMzMX0.Bp4A-VwFMuOgpIqL_yud-i85uwnjxNZ4hXMNxNKu1HA';

export const supabase = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
export const supabaseLeads = createClient(LEADS_SUPABASE_URL, LEADS_SUPABASE_ANON_KEY);
