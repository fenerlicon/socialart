-- ==============================================================================
-- DEDICATED ADMIN PRINCIPAL, SESSION & AUDIT ACTOR MIGRATION
-- Single Source of Truth for Non-Employee Administrative Identity (DB1)
-- ==============================================================================

-- 1. Dedicated Admin Auth Identities Table
CREATE TABLE IF NOT EXISTS public.admin_auth_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'System Administrator',
  password_hash TEXT NOT NULL,
  password_version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT admin_auth_identities_username_key UNIQUE (username)
);

-- Strict RLS Lockdown on admin_auth_identities (Zero client access, server-only)
ALTER TABLE public.admin_auth_identities ENABLE ROW LEVEL SECURITY;

-- 2. Extend admin_sessions for Polymorphic Principal Identity
ALTER TABLE public.admin_sessions
  ADD COLUMN IF NOT EXISTS principal_type TEXT NOT NULL DEFAULT 'employee',
  ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES public.admin_auth_identities(id) ON DELETE CASCADE;

-- Allow employee_id to be NULL for Admin sessions
ALTER TABLE public.admin_sessions
  ALTER COLUMN employee_id DROP NOT NULL;

-- Polymorphic session consistency constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_sessions_principal_check'
  ) THEN
    ALTER TABLE public.admin_sessions
      ADD CONSTRAINT admin_sessions_principal_check CHECK (
        (principal_type = 'employee' AND employee_id IS NOT NULL AND admin_id IS NULL) OR
        (principal_type = 'admin' AND admin_id IS NOT NULL AND employee_id IS NULL)
      );
  END IF;
END $$;

-- 3. Extend employee_audit_logs for Polymorphic Actor Identity
ALTER TABLE public.employee_audit_logs
  ADD COLUMN IF NOT EXISTS actor_type TEXT NOT NULL DEFAULT 'employee',
  ADD COLUMN IF NOT EXISTS actor_admin_id UUID REFERENCES public.admin_auth_identities(id) ON DELETE SET NULL;

-- Allow actor_employee_id to be NULL for Admin-performed audit actions
ALTER TABLE public.employee_audit_logs
  ALTER COLUMN actor_employee_id DROP NOT NULL;

-- Historical audit consistency constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'employee_audit_logs_actor_check'
  ) THEN
    ALTER TABLE public.employee_audit_logs
      ADD CONSTRAINT employee_audit_logs_actor_check CHECK (
        (actor_type = 'employee' AND actor_employee_id IS NOT NULL AND actor_admin_id IS NULL) OR
        (actor_type = 'admin' AND actor_admin_id IS NOT NULL AND actor_employee_id IS NULL)
      );
  END IF;
END $$;

