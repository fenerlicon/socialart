-- Migration: add_approval_purpose_to_workflow_steps_and_approvals.sql
-- Description: Adds explicit, persisted approval_purpose to workflow_step_instances and workflow_approvals.
-- Allowed values: 'general', 'intermediate', 'final_creative', 'client'.
-- Defaults and backfills existing rows to 'general'.

-- 1. Add approval_purpose to workflow_step_instances
ALTER TABLE public.workflow_step_instances
ADD COLUMN IF NOT EXISTS approval_purpose TEXT NOT NULL DEFAULT 'general'
CHECK (approval_purpose IN ('general', 'intermediate', 'final_creative', 'client'));

-- 2. Add approval_purpose to workflow_approvals
ALTER TABLE public.workflow_approvals
ADD COLUMN IF NOT EXISTS approval_purpose TEXT NOT NULL DEFAULT 'general'
CHECK (approval_purpose IN ('general', 'intermediate', 'final_creative', 'client'));

-- 3. Ensure existing null records are safely classified as 'general'
UPDATE public.workflow_step_instances
SET approval_purpose = 'general'
WHERE approval_purpose IS NULL;

UPDATE public.workflow_approvals
SET approval_purpose = 'general'
WHERE approval_purpose IS NULL;