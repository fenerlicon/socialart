import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://osuwytugjscwhcxxkhfa.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdXd5dHVnanNjd2hjeHhraGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTMzOTcsImV4cCI6MjA5OTE2OTM5N30.h6UXEdEq8O0zIyrjPqS_zcJKBtziPBcKo6yPsBo4QCU';

const supabaseUrl = ((import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL.includes('osuwytugjscwhcxxkhfa')) ? import.meta.env.VITE_SUPABASE_URL : DEFAULT_SUPABASE_URL).trim();
const supabaseAnonKey = ((import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY.includes('osuwytugjscwhcxxkhfa')) ? import.meta.env.VITE_SUPABASE_ANON_KEY : DEFAULT_SUPABASE_ANON_KEY).trim().replace(/[\r\n\s]+/g, '');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
