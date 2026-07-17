import type { WorkflowHandoff } from '@/types/domain'
import { HandoffRepository } from '@/lib/repositories/HandoffRepository'

export async function getStoredHandoffs(): Promise<WorkflowHandoff[]> {
  return HandoffRepository.getAll()
}

export async function getHandoffsByStepId(stepId: string): Promise<WorkflowHandoff[]> {
  return HandoffRepository.getByStepId(stepId)
}

export async function getPendingHandoffsForEmployee(employeeId: string): Promise<WorkflowHandoff[]> {
  return HandoffRepository.getPendingForEmployee(employeeId)
}

export async function saveHandoff(handoff: WorkflowHandoff): Promise<void> {
  await HandoffRepository.save(handoff)
}

export async function updateHandoff(handoff: WorkflowHandoff): Promise<void> {
  await HandoffRepository.update(handoff)
}

export async function cancelHandoff(handoffId: string): Promise<void> {
  await HandoffRepository.cancel(handoffId)
}
