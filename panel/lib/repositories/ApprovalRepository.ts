import { supabase } from '@/lib/supabase/client'
import type { WorkflowApproval, ApprovalPurpose } from '@/types/domain'

export const ApprovalRepository = {
  mapRowToApproval(row: any): WorkflowApproval {
    return {
      id: row.id,
      workflowInstanceId: row.workflow_instance_id,
      workflowStepInstanceId: row.workflow_step_instance_id,
      requestedByEmployeeId: row.requested_by_employee_id,
      approverEmployeeId: row.approver_employee_id || undefined,
      approvalType: row.approval_type,
      approvalPurpose: (row.approval_purpose as ApprovalPurpose) || 'general',
      status: row.status,
      note: row.note || undefined,
      revisionNote: row.revision_note || undefined,
      createdAt: row.created_at,
      approvedAt: row.approved_at || undefined,
      rejectedAt: row.rejected_at || undefined,
      revisedAt: row.revised_at || undefined,
    }
  },

  mapApprovalToRow(approval: Partial<WorkflowApproval>) {
    const row: any = {}
    if (approval.id !== undefined) row.id = approval.id
    if (approval.workflowInstanceId !== undefined) row.workflow_instance_id = approval.workflowInstanceId
    if (approval.workflowStepInstanceId !== undefined) row.workflow_step_instance_id = approval.workflowStepInstanceId
    if (approval.requestedByEmployeeId !== undefined) row.requested_by_employee_id = approval.requestedByEmployeeId
    if (approval.approverEmployeeId !== undefined) row.approver_employee_id = approval.approverEmployeeId
    if (approval.approvalType !== undefined) row.approval_type = approval.approvalType
    if (approval.approvalPurpose !== undefined) {
      const validPurposes: ApprovalPurpose[] = ['general', 'intermediate', 'final_creative', 'client']
      row.approval_purpose = validPurposes.includes(approval.approvalPurpose) ? approval.approvalPurpose : 'general'
    }
    if (approval.status !== undefined) row.status = approval.status
    if (approval.note !== undefined) row.note = approval.note
    if (approval.revisionNote !== undefined) row.revision_note = approval.revisionNote
    if (approval.createdAt !== undefined) row.created_at = approval.createdAt
    if (approval.approvedAt !== undefined) row.approved_at = approval.approvedAt
    if (approval.rejectedAt !== undefined) row.rejected_at = approval.rejectedAt
    if (approval.revisedAt !== undefined) row.revised_at = approval.revisedAt
    return row
  },

  async getAll(): Promise<WorkflowApproval[]> {
    const { data, error } = await supabase
      .from('workflow_approvals')
      .select('*')

    if (error) {
      console.error('Error fetching all approvals:', error)
      throw error
    }

    return (data || []).map(this.mapRowToApproval)
  },

  async getByEmployeeId(employeeId: string): Promise<WorkflowApproval[]> {
    const { data, error } = await supabase
      .from('workflow_approvals')
      .select('*')
      .or(`requested_by_employee_id.eq.${employeeId},approver_employee_id.eq.${employeeId}`)

    if (error) {
      console.error(`Error fetching approvals for employee ${employeeId}:`, error)
      throw error
    }

    return (data || []).map(this.mapRowToApproval)
  },

  async getPendingForEmployee(employeeId: string): Promise<WorkflowApproval[]> {
    const { data, error } = await supabase
      .from('workflow_approvals')
      .select('*')
      .eq('approver_employee_id', employeeId)
      .eq('status', 'pending')

    if (error) {
      console.error(`Error fetching pending approvals for employee ${employeeId}:`, error)
      throw error
    }

    return (data || []).map(this.mapRowToApproval)
  },

  async getByWorkflowId(workflowId: string): Promise<WorkflowApproval[]> {
    const { data, error } = await supabase
      .from('workflow_approvals')
      .select('*')
      .eq('workflow_instance_id', workflowId)

    if (error) {
      console.error(`Error fetching approvals for workflow ${workflowId}:`, error)
      throw error
    }

    return (data || []).map(this.mapRowToApproval)
  },

  async save(approval: WorkflowApproval): Promise<void> {
    const row = this.mapApprovalToRow(approval)
    const { error } = await supabase
      .from('workflow_approvals')
      .upsert(row)

    if (error) {
      console.error('Error saving approval:', error)
      throw error
    }
  },

  async update(approval: WorkflowApproval): Promise<void> {
    await this.save(approval)
  },

  async cancel(approvalId: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_approvals')
      .update({ status: 'cancelled' })
      .eq('id', approvalId)

    if (error) {
      console.error(`Error cancelling approval ${approvalId}:`, error)
      throw error
    }
  }
}
