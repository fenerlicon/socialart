import type { WorkflowApproval } from '@/types/domain'
import { ApprovalRepository } from '@/lib/repositories/ApprovalRepository'

export async function getStoredApprovals(): Promise<WorkflowApproval[]> {
  return ApprovalRepository.getAll()
}

export async function getApprovalsByEmployeeId(employeeId: string): Promise<WorkflowApproval[]> {
  return ApprovalRepository.getByEmployeeId(employeeId)
}

export async function getPendingApprovalsForEmployee(employeeId: string): Promise<WorkflowApproval[]> {
  return ApprovalRepository.getPendingForEmployee(employeeId)
}

export async function getApprovalsByWorkflowId(workflowId: string): Promise<WorkflowApproval[]> {
  return ApprovalRepository.getByWorkflowId(workflowId)
}

export async function saveApproval(approval: WorkflowApproval): Promise<void> {
  await ApprovalRepository.save(approval)
}

export async function updateApproval(approval: WorkflowApproval): Promise<void> {
  await ApprovalRepository.update(approval)
}

export async function cancelApproval(approvalId: string): Promise<void> {
  await ApprovalRepository.cancel(approvalId)
}
