-- Migration: guard_employees_authorization_fields.sql
-- Description: Enforces strict database-level authorization boundary on public.employees.
-- Prevents direct anon and authenticated clients from modifying or injecting
-- authorization-sensitive scalar fields and sensitive permission_overrides keys.
-- Service-role administrative endpoints (and backend migrations) remain fully supported.

CREATE OR REPLACE FUNCTION public.guard_employees_authorization_fields()
RETURNS trigger AS $$
DECLARE
  caller_role TEXT;
  sensitive_keys TEXT[] := ARRAY[
    'username',
    'system.admin',
    'system.permissions',
    'employees.manage',
    'employees.create',
    'team.manage',
    'settings.manage',
    'system.settings'
  ];
  k TEXT;
  old_val JSONB;
  new_val JSONB;
BEGIN
  -- 1. Safely extract caller role from PostgREST JWT claims or PostgreSQL session
  BEGIN
    caller_role := auth.role();
  EXCEPTION WHEN OTHERS THEN
    caller_role := CURRENT_USER;
  END;

  IF caller_role IS NULL THEN
    caller_role := CURRENT_USER;
  END IF;

  -- 2. Strictly enforce restrictions only for unprivileged client roles (anon, authenticated)
  IF caller_role IN ('anon', 'authenticated') THEN
    IF TG_OP = 'INSERT' THEN
      -- In INSERT: unprivileged callers cannot provide authorization-sensitive scalar fields
      IF NEW.role_package_id IS NOT NULL THEN
        RAISE EXCEPTION 'Unauthorized: role_package_id cannot be set directly by client';
      END IF;

      IF NEW.employee_status IS NOT NULL AND NEW.employee_status <> 'active' THEN
        RAISE EXCEPTION 'Unauthorized: employee_status cannot be set directly by client';
      END IF;

      IF NEW.email IS NOT NULL THEN
        RAISE EXCEPTION 'Unauthorized: email cannot be set directly by client';
      END IF;

      IF NEW.team_ids IS NOT NULL AND jsonb_array_length(CASE WHEN jsonb_typeof(to_jsonb(NEW.team_ids)) = 'array' THEN to_jsonb(NEW.team_ids) ELSE '[]'::jsonb END) > 0 THEN
        RAISE EXCEPTION 'Unauthorized: team_ids cannot be set directly by client';
      END IF;

      IF NEW.has_advanced_calendar_access IS NOT NULL AND NEW.has_advanced_calendar_access = true THEN
        RAISE EXCEPTION 'Unauthorized: has_advanced_calendar_access cannot be set directly by client';
      END IF;

      -- Check sensitive keys in permission_overrides
      IF NEW.permission_overrides IS NOT NULL THEN
        FOREACH k IN ARRAY sensitive_keys LOOP
          IF NEW.permission_overrides ? k THEN
            RAISE EXCEPTION 'Unauthorized: sensitive permission key % cannot be set directly by client', k;
          END IF;
        END LOOP;
      END IF;

    ELSIF TG_OP = 'UPDATE' THEN
      -- In UPDATE: compare OLD vs NEW for all guarded scalar fields
      IF NEW.role_package_id IS DISTINCT FROM OLD.role_package_id THEN
        RAISE EXCEPTION 'Unauthorized: role_package_id cannot be modified directly by client';
      END IF;

      IF NEW.employee_status IS DISTINCT FROM OLD.employee_status THEN
        RAISE EXCEPTION 'Unauthorized: employee_status cannot be modified directly by client';
      END IF;

      IF NEW.email IS DISTINCT FROM OLD.email THEN
        RAISE EXCEPTION 'Unauthorized: email cannot be modified directly by client';
      END IF;

      IF NEW.team_ids IS DISTINCT FROM OLD.team_ids THEN
        RAISE EXCEPTION 'Unauthorized: team_ids cannot be modified directly by client';
      END IF;

      IF NEW.has_advanced_calendar_access IS DISTINCT FROM OLD.has_advanced_calendar_access THEN
        RAISE EXCEPTION 'Unauthorized: has_advanced_calendar_access cannot be modified directly by client';
      END IF;

      -- Compare sensitive override keys (addition, modification, or removal)
      IF NEW.permission_overrides IS DISTINCT FROM OLD.permission_overrides THEN
        FOREACH k IN ARRAY sensitive_keys LOOP
          old_val := OLD.permission_overrides -> k;
          new_val := NEW.permission_overrides -> k;
          IF new_val IS DISTINCT FROM old_val THEN
            RAISE EXCEPTION 'Unauthorized: sensitive permission key % cannot be modified directly by client', k;
          END IF;
        END LOOP;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-create trigger idempotently
DROP TRIGGER IF EXISTS trg_guard_employees_authorization_fields ON public.employees;

CREATE TRIGGER trg_guard_employees_authorization_fields
BEFORE INSERT OR UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.guard_employees_authorization_fields();
