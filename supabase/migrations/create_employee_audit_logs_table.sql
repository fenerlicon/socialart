-- Migration: create_employee_audit_logs_table.sql
-- Target Database: DB1 (piffaggeshfrubyjkhej - HR / Identity Canonical Authority)
-- Purpose: Append-only immutable audit log for employee lifecycle & employment changes.

CREATE TABLE IF NOT EXISTS public.employee_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type = 'employment_type_changed'),
  old_value TEXT CHECK (old_value IS NULL OR old_value IN ('full_time', 'freelance', 'contractor', 'part_time')),
  new_value TEXT CHECK (new_value IS NULL OR new_value IN ('full_time', 'freelance', 'contractor', 'part_time')),
  actor_employee_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast history queries per employee
CREATE INDEX IF NOT EXISTS idx_employee_audit_logs_employee_id ON public.employee_audit_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_audit_logs_created_at ON public.employee_audit_logs(created_at);

-- Security: Enable RLS. Direct browser anon/authenticated write access is completely blocked.
ALTER TABLE public.employee_audit_logs ENABLE ROW LEVEL SECURITY;