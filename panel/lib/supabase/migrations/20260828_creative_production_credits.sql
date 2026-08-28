-- ==============================================================================
-- Migration: 20260828_creative_production_credits.sql
-- Description: Creates the canonical immutable creative production ledger table in DB2
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.creative_production_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_step_instance_id TEXT NOT NULL UNIQUE,
  workflow_instance_id TEXT,
  final_approval_id TEXT,
  designer_employee_id UUID NOT NULL,
  db1_employee_id TEXT,
  brand_id TEXT,
  creative_count INTEGER NOT NULL DEFAULT 1,
  credited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  task_title TEXT,
  workflow_title TEXT,
  reviewer_employee_id UUID
);

-- Fast reporting indexes
CREATE INDEX IF NOT EXISTS idx_creative_credits_designer ON public.creative_production_credits(designer_employee_id);
CREATE INDEX IF NOT EXISTS idx_creative_credits_credited_at ON public.creative_production_credits(credited_at);
CREATE INDEX IF NOT EXISTS idx_creative_credits_brand ON public.creative_production_credits(brand_id);

-- Row Level Security (RLS)
ALTER TABLE public.creative_production_credits ENABLE ROW LEVEL SECURITY;

-- Read policy: authenticated sessions and server clients can query ledger
CREATE POLICY "Allow read access to authenticated users"
ON public.creative_production_credits FOR SELECT
TO authenticated, anon
USING (true);

-- Write policy: mutations restricted to service_role / server authority
CREATE POLICY "Allow service_role full management"
ON public.creative_production_credits FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

