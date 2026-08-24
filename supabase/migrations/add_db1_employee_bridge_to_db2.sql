-- Migration: add_db1_employee_bridge_to_db2.sql
-- Description: Adds a logical cross-database identity bridge on DB2 public.employees
-- pointing to authoritative DB1 employees.id (text format).
-- Nullable, unique on non-null values, without cross-database foreign key.

ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS db1_employee_id TEXT UNIQUE;
