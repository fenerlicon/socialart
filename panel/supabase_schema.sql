-- Social Art Base - Supabase SQL Schema DDL
-- Paste this script directly into the Supabase SQL Editor (Dashboard > SQL Editor > New query).

-- 1. Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  role_package_id TEXT NOT NULL,
  team_ids JSONB NOT NULL DEFAULT '[]',
  permission_overrides JSONB NOT NULL DEFAULT '{}',
  employee_status TEXT NOT NULL,
  work_location_status TEXT NOT NULL,
  avatar_url TEXT,
  has_advanced_calendar_access BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  created_by TEXT,
  updated_by TEXT
);

-- 2. Brands Table
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  instagram TEXT,
  website TEXT,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  operation_manager_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  start_date TEXT NOT NULL,
  status TEXT NOT NULL,
  selected_package_id TEXT NOT NULL,
  operation_plan JSONB NOT NULL DEFAULT '[]',
  brand_assignments JSONB NOT NULL DEFAULT '[]',
  template_version INTEGER DEFAULT 1,
  template_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  created_by TEXT,
  updated_by TEXT
);

-- 3. Ideas Table
CREATE TABLE IF NOT EXISTS ideas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  creator_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
  impact TEXT NOT NULL,
  status TEXT NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,
  voted_employee_ids JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  created_by TEXT,
  updated_by TEXT
);

-- 4. Cycles (Operation Cycles)
CREATE TABLE IF NOT EXISTS cycles (
  id TEXT PRIMARY KEY,
  brand_id TEXT REFERENCES brands(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL,
  operation_plan JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  generated_at TIMESTAMPTZ,
  is_customized BOOLEAN DEFAULT false,
  template_version INTEGER DEFAULT 1,
  template_updated_at TIMESTAMPTZ,
  created_by TEXT,
  updated_by TEXT
);

-- 5. Workflow Instances
CREATE TABLE IF NOT EXISTS workflow_instances (
  id TEXT PRIMARY KEY,
  brand_id TEXT REFERENCES brands(id) ON DELETE CASCADE,
  cycle_id TEXT REFERENCES cycles(id) ON DELETE CASCADE,
  operation_plan_item_id TEXT NOT NULL,
  operation_template_id TEXT NOT NULL,
  workflow_template_id TEXT NOT NULL,
  title TEXT NOT NULL,
  sequence_number INTEGER,
  status TEXT NOT NULL,
  current_step_id TEXT NOT NULL,
  progress_count INTEGER DEFAULT 0,
  target_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_by TEXT,
  updated_by TEXT
);

-- 6. Workflow Step Instances
CREATE TABLE IF NOT EXISTS workflow_step_instances (
  id TEXT PRIMARY KEY,
  workflow_instance_id TEXT REFERENCES workflow_instances(id) ON DELETE CASCADE,
  workflow_step_template_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  status TEXT NOT NULL,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  is_final_step BOOLEAN NOT NULL DEFAULT false,
  approval_purpose TEXT NOT NULL DEFAULT 'general',
  assignee_employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  assigned_employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  responsibility_role TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  handoff_status TEXT,
  handoff_id TEXT,
  previous_assignee_employee_id TEXT,
  approval_id TEXT,
  approval_status TEXT,
  submitted_for_approval_at TIMESTAMPTZ,
  reviewer_employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  support_employee_ids JSONB DEFAULT '[]',
  created_by TEXT,
  updated_by TEXT
);

-- 7. Workflow History
CREATE TABLE IF NOT EXISTS workflow_history (
  id TEXT PRIMARY KEY,
  workflow_instance_id TEXT REFERENCES workflow_instances(id) ON DELETE CASCADE,
  workflow_step_instance_id TEXT REFERENCES workflow_step_instances(id) ON DELETE CASCADE,
  actor_employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

-- 8. Workflow Handoffs
CREATE TABLE IF NOT EXISTS workflow_handoffs (
  id TEXT PRIMARY KEY,
  workflow_instance_id TEXT REFERENCES workflow_instances(id) ON DELETE CASCADE,
  workflow_step_instance_id TEXT REFERENCES workflow_step_instances(id) ON DELETE CASCADE,
  from_employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
  to_employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  response_note TEXT
);

-- 9. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  recipient_employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_type TEXT NOT NULL,
  related_entity_id TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL,
  read_at TIMESTAMPTZ
);

-- 10. Workflow Approvals
CREATE TABLE IF NOT EXISTS workflow_approvals (
  id TEXT PRIMARY KEY,
  workflow_instance_id TEXT REFERENCES workflow_instances(id) ON DELETE CASCADE,
  workflow_step_instance_id TEXT REFERENCES workflow_step_instances(id) ON DELETE CASCADE,
  requested_by_employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
  approver_employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  approval_type TEXT NOT NULL,
  approval_purpose TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL,
  note TEXT,
  revision_note TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  revised_at TIMESTAMPTZ
);

-- 11. Calendar Events (Tarih Modeli starts_at ve ends_at olarak revize edildi)
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  brand_id TEXT REFERENCES brands(id) ON DELETE CASCADE,
  employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  status TEXT NOT NULL,
  created_by TEXT,
  updated_by TEXT
);

-- 12. Reports (İçerik JSONB olarak revize edildi)
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  content JSONB NOT NULL,
  status TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  created_by TEXT,
  updated_by TEXT
);

-- Disable Row Level Security (RLS) on all tables for the prototype phase
-- (Since authentication is mocked in the frontend and all requests use the anon client key)
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE ideas DISABLE ROW LEVEL SECURITY;
ALTER TABLE cycles DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_instances DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_handoffs DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
