-- Migration: add_creative_count_to_workflow_step_instances.sql
-- Description: Adds nullable creative_count to workflow_step_instances with minimum constraint >= 1 when non-null.
-- Preserves all existing rows with creative_count = NULL.

ALTER TABLE public.workflow_step_instances
ADD COLUMN IF NOT EXISTS creative_count INTEGER DEFAULT NULL
CHECK (creative_count IS NULL OR creative_count >= 1);