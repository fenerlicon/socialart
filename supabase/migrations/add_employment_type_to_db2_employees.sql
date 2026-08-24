-- Migration: add_employment_type_to_db2_employees.sql
-- Description: Adds nullable employment_type to DB2 employees (Operations Mirror).
-- Preserves all existing rows with employment_type = NULL.

ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT NULL
CHECK (employment_type IS NULL OR employment_type IN ('full_time', 'freelance', 'contractor', 'part_time'));