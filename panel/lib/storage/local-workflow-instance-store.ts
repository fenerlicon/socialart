import type { WorkflowInstance, WorkflowStepInstance, WorkflowHistory } from '@/types/domain'
import { WorkflowRepository } from '@/lib/repositories/WorkflowRepository'

export async function getStoredWorkflowInstances(): Promise<WorkflowInstance[]> {
  return WorkflowRepository.getAllInstances()
}

export async function getWorkflowInstancesByCycleId(cycleId: string): Promise<WorkflowInstance[]> {
  return WorkflowRepository.getInstancesByCycleId(cycleId)
}

export async function getWorkflowInstancesByBrandId(brandId: string): Promise<WorkflowInstance[]> {
  return WorkflowRepository.getInstancesByBrandId(brandId)
}

export async function getStoredWorkflowSteps(): Promise<WorkflowStepInstance[]> {
  return WorkflowRepository.getAllSteps()
}

export async function getWorkflowStepsByInstanceId(instanceId: string): Promise<WorkflowStepInstance[]> {
  return WorkflowRepository.getStepsByInstanceId(instanceId)
}

export async function saveWorkflowInstances(
  instances: WorkflowInstance[],
  steps: WorkflowStepInstance[]
): Promise<{ instances: WorkflowInstance[]; steps: WorkflowStepInstance[] }> {
  return WorkflowRepository.saveWorkflowInstances(instances, steps)
}

export async function saveWorkflowSteps(steps: WorkflowStepInstance[]): Promise<WorkflowStepInstance[]> {
  return WorkflowRepository.saveWorkflowSteps(steps)
}

export async function deleteWorkflowInstancesByCycleId(cycleId: string): Promise<void> {
  await WorkflowRepository.deleteWorkflowInstancesByCycleId(cycleId)
}

export async function updateWorkflowInstance(instance: WorkflowInstance): Promise<void> {
  await WorkflowRepository.updateWorkflowInstance(instance)
}

export async function updateWorkflowStepInstance(step: WorkflowStepInstance): Promise<void> {
  await WorkflowRepository.updateWorkflowStepInstance(step)
}

export async function getWorkflowStepInstances(): Promise<WorkflowStepInstance[]> {
  return WorkflowRepository.getAllSteps()
}

export async function getWorkflowStepInstancesByWorkflow(workflowInstanceId: string): Promise<WorkflowStepInstance[]> {
  return WorkflowRepository.getStepsByInstanceId(workflowInstanceId)
}

export async function getStoredWorkflowHistory(): Promise<WorkflowHistory[]> {
  // Return empty array or implement general get all history if needed.
  // History is usually queried by instance id. Let's query by instance if we have one,
  // but to maintain local signature, let's fetch all history.
  // Wait, let's query all history from supabase.
  const { supabase } = require('@/lib/supabase/client')
  const { data, error } = await supabase.from('workflow_history').select('*')
  if (error) {
    console.error('Error fetching all history:', error)
    return []
  }
  return (data || []).map((row: any) => WorkflowRepository.mapRowToHistory(row))
}

export async function getWorkflowHistoryByInstanceId(instanceId: string): Promise<WorkflowHistory[]> {
  return WorkflowRepository.getHistoryByInstanceId(instanceId)
}

export async function saveWorkflowHistory(log: WorkflowHistory): Promise<void> {
  await WorkflowRepository.saveWorkflowHistory(log)
}

export async function deleteWorkflowHistoryByWorkflowId(instanceId: string): Promise<void> {
  await WorkflowRepository.deleteWorkflowHistoryByWorkflowId(instanceId)
}

export async function cancelWorkflowInstance(instanceId: string): Promise<void> {
  await WorkflowRepository.cancelWorkflowInstance(instanceId)
}

export async function deleteWorkflowInstance(instanceId: string): Promise<void> {
  await WorkflowRepository.deleteWorkflowInstance(instanceId)
}

export async function incrementInstanceProgress(
  instanceId: string,
  by: number = 1
): Promise<{ newCount: number; completed: boolean } | null> {
  return WorkflowRepository.incrementInstanceProgress(instanceId, by)
}
