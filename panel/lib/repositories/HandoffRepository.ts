import { supabase } from '@/lib/supabase/client'
import type { WorkflowHandoff } from '@/types/domain'

// Known columns in the DB - response_note must be added via Supabase Dashboard SQL Editor:
// ALTER TABLE workflow_handoffs ADD COLUMN IF NOT EXISTS response_note TEXT;
const HANDOFF_COLUMNS = 'id,workflow_instance_id,workflow_step_instance_id,from_employee_id,to_employee_id,reason,note,status,created_at,accepted_at,rejected_at'

let hasResponseNoteColumn: boolean | null = null

async function checkResponseNoteColumn(): Promise<boolean> {
  if (hasResponseNoteColumn !== null) return hasResponseNoteColumn
  try {
    const { error } = await supabase
      .from('workflow_handoffs')
      .select('response_note')
      .limit(1)
    hasResponseNoteColumn = !error
  } catch {
    hasResponseNoteColumn = false
  }
  return hasResponseNoteColumn
}

export const HandoffRepository = {
  mapRowToHandoff(row: any): WorkflowHandoff {
    return {
      id: row.id,
      workflowInstanceId: row.workflow_instance_id,
      workflowStepInstanceId: row.workflow_step_instance_id,
      fromEmployeeId: row.from_employee_id,
      toEmployeeId: row.to_employee_id,
      reason: row.reason,
      note: row.note || undefined,
      status: row.status,
      createdAt: row.created_at,
      acceptedAt: row.accepted_at || undefined,
      rejectedAt: row.rejected_at || undefined,
      responseNote: row.response_note || undefined,
    }
  },

  mapHandoffToRow(handoff: Partial<WorkflowHandoff>) {
    const row: any = {}
    if (handoff.id !== undefined) row.id = handoff.id
    if (handoff.workflowInstanceId !== undefined) row.workflow_instance_id = handoff.workflowInstanceId
    if (handoff.workflowStepInstanceId !== undefined) row.workflow_step_instance_id = handoff.workflowStepInstanceId
    if (handoff.fromEmployeeId !== undefined) row.from_employee_id = handoff.fromEmployeeId
    if (handoff.toEmployeeId !== undefined) row.to_employee_id = handoff.toEmployeeId
    if (handoff.reason !== undefined) row.reason = handoff.reason
    if (handoff.note !== undefined) row.note = handoff.note
    if (handoff.status !== undefined) row.status = handoff.status
    if (handoff.createdAt !== undefined) row.created_at = handoff.createdAt
    if (handoff.acceptedAt !== undefined) row.accepted_at = handoff.acceptedAt
    if (handoff.rejectedAt !== undefined) row.rejected_at = handoff.rejectedAt
    if (handoff.responseNote !== undefined) row.response_note = handoff.responseNote
    return row
  },

  async getAll(): Promise<WorkflowHandoff[]> {
    const hasRN = await checkResponseNoteColumn()
    const selectCols = hasRN ? `${HANDOFF_COLUMNS},response_note` : HANDOFF_COLUMNS
    const { data, error } = await supabase
      .from('workflow_handoffs')
      .select(selectCols)

    if (error) {
      console.error('Error fetching all handoffs:', error)
      throw error
    }

    return (data || []).map(this.mapRowToHandoff)
  },

  async getByStepId(stepId: string): Promise<WorkflowHandoff[]> {
    const hasRN = await checkResponseNoteColumn()
    const selectCols = hasRN ? `${HANDOFF_COLUMNS},response_note` : HANDOFF_COLUMNS
    const { data, error } = await supabase
      .from('workflow_handoffs')
      .select(selectCols)
      .eq('workflow_step_instance_id', stepId)

    if (error) {
      console.error(`Error fetching handoffs for step ${stepId}:`, error)
      throw error
    }

    return (data || []).map(this.mapRowToHandoff)
  },

  async getPendingForEmployee(employeeId: string): Promise<WorkflowHandoff[]> {
    const hasRN = await checkResponseNoteColumn()
    const selectCols = hasRN ? `${HANDOFF_COLUMNS},response_note` : HANDOFF_COLUMNS
    const { data, error } = await supabase
      .from('workflow_handoffs')
      .select(selectCols)
      .eq('to_employee_id', employeeId)
      .eq('status', 'pending')

    if (error) {
      console.error(`Error fetching pending handoffs for employee ${employeeId}:`, error)
      throw error
    }

    return (data || []).map(this.mapRowToHandoff)
  },

  async save(handoff: WorkflowHandoff): Promise<void> {
    const row = this.mapHandoffToRow(handoff)
    const hasRN = await checkResponseNoteColumn()
    if (!hasRN) {
      delete row.response_note
    }
    const { error } = await supabase
      .from('workflow_handoffs')
      .upsert(row)

    if (error) {
      console.error('Error saving handoff:', error)
      throw error
    }
  },

  async update(handoff: WorkflowHandoff): Promise<void> {
    await this.save(handoff)
  },

  async cancel(handoffId: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_handoffs')
      .update({ status: 'cancelled' })
      .eq('id', handoffId)

    if (error) {
      console.error(`Error cancelling handoff ${handoffId}:`, error)
      throw error
    }
  }
}
