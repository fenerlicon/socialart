-- Migration: lock_down_db2_employees_client_writes.sql
-- Target Database: DB2 (osuwytugjscwhcxxkhfa - Big Panel DB)
-- Description: Locks down public.employees so browser/client roles (anon, authenticated)
-- can only execute SELECT queries. Direct client INSERT, UPDATE, and DELETE operations
-- are completely blocked. Trusted serverless API operations via service-role key continue
-- to operate with full administrative privileges.

-- 1. Enable Row Level Security (RLS) on public.employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- 2. Drop any legacy/permissive client mutation policies if present
DROP POLICY IF EXISTS "employees_all_access" ON public.employees;
DROP POLICY IF EXISTS "employees_insert_policy" ON public.employees;
DROP POLICY IF EXISTS "employees_update_policy" ON public.employees;
DROP POLICY IF EXISTS "employees_delete_policy" ON public.employees;
DROP POLICY IF EXISTS "allow_all_access_employees" ON public.employees;
DROP POLICY IF EXISTS "allow_anon_insert_employees" ON public.employees;
DROP POLICY IF EXISTS "allow_anon_write_employees" ON public.employees;
DROP POLICY IF EXISTS "staff_all_access" ON public.employees;
DROP POLICY IF EXISTS "Public employees are viewable by everyone." ON public.employees;
DROP POLICY IF EXISTS "employees_client_select_only" ON public.employees;

-- 3. Create explicit SELECT-only policy for client roles (anon, authenticated)
CREATE POLICY "employees_client_select_only"
ON public.employees
FOR SELECT
TO anon, authenticated
USING (true);