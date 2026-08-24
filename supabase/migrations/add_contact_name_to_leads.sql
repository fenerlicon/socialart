-- Idempotent migration to add canonical contact_name column to DB1 leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS contact_name text;