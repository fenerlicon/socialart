import { createClient } from '@supabase/supabase-js';

const FINANCE_SUPABASE_URL = import.meta.env.VITE_FINANCE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || 'https://piffaggeshfrubyjkhej.supabase.co';
const FINANCE_SUPABASE_ANON_KEY = import.meta.env.VITE_FINANCE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZmZhZ2dlc2hmcnVieWpraGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjkzMzEsImV4cCI6MjA5NDM0NTMzMX0.Bp4A-VwFMuOgpIqL_yud-i85uwnjxNZ4hXMNxNKu1HA';

export const supabase = createClient(FINANCE_SUPABASE_URL, FINANCE_SUPABASE_ANON_KEY);
export const supabaseFinance = supabase;

