import { supabase } from '@/lib/supabase/client'
import type { WorkflowInstance, WorkflowStepInstance, WorkflowHistory } from '@/types/domain'
import { handleOnboardingMeetingDateChange } from '@/lib/workflows/onboarding-workflow'

export const WorkflowRepository = {
  // Mapping for WorkflowInstance
  mapRowToInstance(row: any): WorkflowInstance {
    return {
      id: row.id,
      brandId: row.brand_id,
      cycleId: row.cycle_id,
      operationPlanItemId: row.operation_plan_item_id,
      operationTemplateId: row.operation_template_id,
      workflowTemplateId: row.workflow_template_id,
      title: row.title,
      sequenceNumber: row.sequence_number || undefined,
      status: row.status,
      currentStepId: row.current_step_id,
      progressCount: row.progress_count !== null ? row.progress_count : undefined,
      targetCount: row.target_count !== null ? row.target_count : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at || undefined,
    }
  },

  mapInstanceToRow(instance: Partial<WorkflowInstance>) {
    const row: any = {}
    if (instance.id !== undefined) row.id = instance.id
    if (instance.brandId !== undefined) row.brand_id = instance.brandId
    if (instance.cycleId !== undefined) row.cycle_id = instance.cycleId
    if (instance.operationPlanItemId !== undefined) row.operation_plan_item_id = instance.operationPlanItemId
    if (instance.operationTemplateId !== undefined) row.operation_template_id = instance.operationTemplateId
    if (instance.workflowTemplateId !== undefined) row.workflow_template_id = instance.workflowTemplateId
    if (instance.title !== undefined) row.title = instance.title
    if (instance.sequenceNumber !== undefined) row.sequence_number = instance.sequenceNumber
    if (instance.status !== undefined) row.status = instance.status
    if (instance.currentStepId !== undefined) row.current_step_id = instance.currentStepId
    if (instance.progressCount !== undefined) row.progress_count = instance.progressCount
    if (instance.targetCount !== undefined) row.target_count = instance.targetCount
    if (instance.createdAt !== undefined) row.created_at = instance.createdAt
    if (instance.updatedAt !== undefined) row.updated_at = instance.updatedAt
    if (instance.completedAt !== undefined) row.completed_at = instance.completedAt
    return row
  },

  // Mapping for WorkflowStepInstance
  mapRowToStep(row: any): WorkflowStepInstance {
    return {
      id: row.id,
      workflowInstanceId: row.workflow_instance_id,
      workflowStepTemplateId: row.workflow_step_template_id,
      title: row.title,
      description: row.description,
      order: row.order,
      status: row.status,
      requiresApproval: row.requires_approval,
      isFinalStep: row.is_final_step,
      assigneeEmployeeId: row.assignee_employee_id || undefined,
      assignedEmployeeId: row.assigned_employee_id || undefined,
      responsibilityRole: row.responsibility_role || undefined,
      startedAt: row.started_at || undefined,
      completedAt: row.completed_at || undefined,
      assignedAt: row.assigned_at || undefined,
      dueDate: row.due_date || undefined,
      handoffStatus: row.handoff_status || undefined,
      handoffId: row.handoff_id || undefined,
      previousAssigneeEmployeeId: row.previous_assignee_employee_id || undefined,
      approvalId: row.approval_id || undefined,
      approvalStatus: row.approval_status || undefined,
      submittedForApprovalAt: row.submitted_for_approval_at || undefined,
      reviewerEmployeeId: row.reviewer_employee_id || undefined,
      supportEmployeeIds: typeof row.support_employee_ids === 'string'
        ? JSON.parse(row.support_employee_ids)
        : (row.support_employee_ids || []),
    }
  },

  mapStepToRow(step: Partial<WorkflowStepInstance>) {
    const row: any = {}
    if (step.id !== undefined) row.id = step.id
    if (step.workflowInstanceId !== undefined) row.workflow_instance_id = step.workflowInstanceId
    if (step.workflowStepTemplateId !== undefined) row.workflow_step_template_id = step.workflowStepTemplateId
    if (step.title !== undefined) row.title = step.title
    if (step.description !== undefined) row.description = step.description
    if (step.order !== undefined) row.order = step.order
    if (step.status !== undefined) row.status = step.status
    if (step.requiresApproval !== undefined) row.requires_approval = step.requiresApproval
    if (step.isFinalStep !== undefined) row.is_final_step = step.isFinalStep
    if (step.assigneeEmployeeId !== undefined) row.assignee_employee_id = step.assigneeEmployeeId
    if (step.assignedEmployeeId !== undefined) row.assigned_employee_id = step.assignedEmployeeId
    if (step.responsibilityRole !== undefined) row.responsibility_role = step.responsibilityRole
    if (step.startedAt !== undefined) row.started_at = step.startedAt
    if (step.completedAt !== undefined) row.completed_at = step.completedAt
    if (step.assignedAt !== undefined) row.assigned_at = step.assignedAt
    if (step.dueDate !== undefined) row.due_date = step.dueDate
    if (step.handoffStatus !== undefined) row.handoff_status = step.handoffStatus
    if (step.handoffId !== undefined) row.handoff_id = step.handoffId
    if (step.previousAssigneeEmployeeId !== undefined) row.previous_assignee_employee_id = step.previousAssigneeEmployeeId
    if (step.approvalId !== undefined) row.approval_id = step.approvalId
    if (step.approvalStatus !== undefined) row.approval_status = step.approvalStatus
    if (step.submittedForApprovalAt !== undefined) row.submitted_for_approval_at = step.submittedForApprovalAt
    // Omit reviewer_employee_id and support_employee_ids as they are missing in the remote Supabase schema cache
    // if (step.reviewerEmployeeId !== undefined) row.reviewer_employee_id = step.reviewerEmployeeId
    // if (step.supportEmployeeIds !== undefined) row.support_employee_ids = JSON.stringify(step.supportEmployeeIds)
    return row
  },

  // Mapping for WorkflowHistory
  mapRowToHistory(row: any): WorkflowHistory {
    return {
      id: row.id,
      workflowInstanceId: row.workflow_instance_id,
      workflowStepInstanceId: row.workflow_step_instance_id,
      actorEmployeeId: row.actor_employee_id || undefined,
      action: row.action,
      fromStatus: row.from_status,
      toStatus: row.to_status,
      note: row.note || undefined,
      createdAt: row.created_at,
    }
  },

  mapHistoryToRow(history: Partial<WorkflowHistory>) {
    const row: any = {}
    if (history.id !== undefined) row.id = history.id
    if (history.workflowInstanceId !== undefined) row.workflow_instance_id = history.workflowInstanceId
    if (history.workflowStepInstanceId !== undefined) row.workflow_step_instance_id = history.workflowStepInstanceId
    if (history.actorEmployeeId !== undefined) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(history.actorEmployeeId || '')
      row.actor_employee_id = isUuid ? history.actorEmployeeId : null
    }
    if (history.action !== undefined) row.action = history.action
    if (history.fromStatus !== undefined) row.from_status = history.fromStatus
    if (history.toStatus !== undefined) row.to_status = history.toStatus
    if (history.note !== undefined) row.note = history.note
    if (history.createdAt !== undefined) row.created_at = history.createdAt
    return row
  },

  // Operations
  async getAllInstances(): Promise<WorkflowInstance[]> {
    const { data, error } = await supabase
      .from('workflow_instances')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching workflow instances:', error)
      throw error
    }

    return (data || []).map(this.mapRowToInstance)
  },

  async getInstancesByCycleId(cycleId: string): Promise<WorkflowInstance[]> {
    const { data, error } = await supabase
      .from('workflow_instances')
      .select('*')
      .eq('cycle_id', cycleId)

    if (error) {
      console.error(`Error fetching workflow instances for cycle ${cycleId}:`, error)
      throw error
    }

    return (data || []).map(this.mapRowToInstance)
  },

  async getInstancesByBrandId(brandId: string): Promise<WorkflowInstance[]> {
    const { data, error } = await supabase
      .from('workflow_instances')
      .select('*')
      .eq('brand_id', brandId)

    if (error) {
      console.error(`Error fetching workflow instances for brand ${brandId}:`, error)
      throw error
    }

    return (data || []).map(this.mapRowToInstance)
  },

  async getStepsByInstanceId(instanceId: string): Promise<WorkflowStepInstance[]> {
    const { data, error } = await supabase
      .from('workflow_step_instances')
      .select('*')
      .eq('workflow_instance_id', instanceId)
      .order('order', { ascending: true })

    if (error) {
      console.error(`Error fetching workflow steps for instance ${instanceId}:`, error)
      throw error
    }

    return (data || []).map(this.mapRowToStep)
  },

  async getAllSteps(): Promise<WorkflowStepInstance[]> {
    const { data, error } = await supabase
      .from('workflow_step_instances')
      .select('*')

    if (error) {
      console.error('Error fetching all workflow steps:', error)
      throw error
    }

    return (data || []).map(this.mapRowToStep)
  },

  async saveWorkflowInstances(
    instances: WorkflowInstance[],
    steps: WorkflowStepInstance[]
  ): Promise<{ instances: WorkflowInstance[]; steps: WorkflowStepInstance[] }> {
    // Gelen instance ID'leri DB'de zaten var mı kontrol et (güncelleme mi yoksa yeni oluşturma mı?)
    const incomingIds = instances.map((i) => i.id)
    const { data: existingById } = await supabase
      .from('workflow_instances')
      .select('id')
      .in('id', incomingIds)

    const existingIdSet = new Set((existingById || []).map((r: any) => r.id))
    const isUpdate = incomingIds.every((id) => existingIdSet.has(id))

    if (!isUpdate) {
      // Yeni instance'lar oluşturuluyor — cycleId bazlı duplicate kontrolü yap
      const incomingCycleIds = Array.from(new Set(instances.map((i) => i.cycleId)))
      for (const cycleId of incomingCycleIds) {
        const { data: existing, error } = await supabase
          .from('workflow_instances')
          .select('id, status')
          .eq('cycle_id', cycleId)

        if (error) throw error

        if (existing && existing.length > 0) {
          const activeInstances = existing.filter((i: any) => i.status !== 'cancelled')
          if (activeInstances.length > 0) {
            // Aktif/tamamlanmış instance'lar var, yeniden oluşturulamaz
            throw new Error("Bu operasyon dönemi için workflow instance'ları zaten oluşturulmuş.")
          }
          // Sadece iptal edilmiş instance'lar var → önce temizle, sonra yeniden oluştur
          const cancelledIds = existing.map((i: any) => i.id)
          await supabase.from('workflow_history').delete().in('workflow_instance_id', cancelledIds)
          await supabase.from('workflow_step_instances').delete().in('workflow_instance_id', cancelledIds)
          await supabase.from('workflow_instances').delete().in('id', cancelledIds)
        }
      }
    }
    // isUpdate === true ise güncelleme (örn. iptal) — duplicate kontrolü atlanır

    // Upsert instances
    const instanceRows = instances.map(this.mapInstanceToRow)
    const { error: instError } = await supabase
      .from('workflow_instances')
      .upsert(instanceRows)

    if (instError) {
      console.error('Error saving workflow instances:', instError)
      throw instError
    }

    // Upsert steps
    const stepRows = steps.map(this.mapStepToRow)
    const { error: stepError } = await supabase
      .from('workflow_step_instances')
      .upsert(stepRows)

    if (stepError) {
      console.error('Error saving workflow steps:', stepError)
      throw stepError
    }

    return { instances, steps }
  },

  async saveWorkflowSteps(steps: WorkflowStepInstance[]): Promise<WorkflowStepInstance[]> {
    const stepRows = steps.map(this.mapStepToRow)
    const { error: stepError } = await supabase
      .from('workflow_step_instances')
      .upsert(stepRows)

    if (stepError) {
      console.error('Error saving workflow steps:', stepError)
      throw stepError
    }

    // Trigger onboarding task generation/sync if meeting step is saved/updated
    for (const step of steps) {
      if (step.workflowStepTemplateId === 'onboarding-step-1') {
        try {
          await handleOnboardingMeetingDateChange(step)
        } catch (err) {
          console.error('Failed to handle onboarding meeting date change in save:', err)
        }
      }
    }

    return steps
  },

  async deleteWorkflowInstancesByCycleId(cycleId: string): Promise<void> {
    const instances = await this.getInstancesByCycleId(cycleId)
    const instanceIds = instances.map((i) => i.id)

    if (instanceIds.length === 0) return

    // Cascading deletes on foreign keys will handle step instances and history if foreign keys are set up.
    // In our schema, we have references with ON DELETE CASCADE. Let's still run them explicitly or let cascade handle it.
    // Let's delete explicit to be safe.
    const { error: historyError } = await supabase
      .from('workflow_history')
      .delete()
      .in('workflow_instance_id', instanceIds)
    if (historyError) console.error('Error deleting workflow history:', historyError)

    const { error: stepError } = await supabase
      .from('workflow_step_instances')
      .delete()
      .in('workflow_instance_id', instanceIds)
    if (stepError) console.error('Error deleting workflow steps:', stepError)

    const { error: instError } = await supabase
      .from('workflow_instances')
      .delete()
      .eq('cycle_id', cycleId)
    if (instError) throw instError
  },

  async updateWorkflowInstance(instance: WorkflowInstance, actorId?: string): Promise<void> {
    const row = this.mapInstanceToRow(instance)
    row.updated_at = new Date().toISOString()
    if (actorId) row.updated_by = actorId

    const { error } = await supabase
      .from('workflow_instances')
      .update(row)
      .eq('id', instance.id)

    if (error) {
      console.error(`Error updating workflow instance ${instance.id}:`, error)
      throw error
    }
  },

  async updateWorkflowStepInstance(step: WorkflowStepInstance, actorId?: string): Promise<void> {
    const row = this.mapStepToRow(step)
    if (actorId) row.updated_by = actorId

    const { error } = await supabase
      .from('workflow_step_instances')
      .update(row)
      .eq('id', step.id)

    if (error) {
      console.error(`Error updating workflow step ${step.id}:`, error)
      throw error
    }

    // Trigger onboarding task generation/sync if meeting step is updated
    if (step.workflowStepTemplateId === 'onboarding-step-1') {
      try {
        await handleOnboardingMeetingDateChange(step)
      } catch (err) {
        console.error('Failed to handle onboarding meeting date change in update:', err)
      }
    }
  },

  async getHistoryByInstanceId(instanceId: string): Promise<WorkflowHistory[]> {
    const { data, error } = await supabase
      .from('workflow_history')
      .select('*')
      .eq('workflow_instance_id', instanceId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error(`Error fetching history for instance ${instanceId}:`, error)
      throw error
    }

    return (data || []).map(this.mapRowToHistory)
  },

  async saveWorkflowHistory(history: WorkflowHistory): Promise<void> {
    const row = this.mapHistoryToRow(history)
    const { error } = await supabase
      .from('workflow_history')
      .insert(row)

    if (error) {
      console.error('Error insert workflow history:', error)
      throw error
    }
  },

  async deleteWorkflowHistoryByWorkflowId(instanceId: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_history')
      .delete()
      .eq('workflow_instance_id', instanceId)

    if (error) {
      console.error(`Error deleting history for instance ${instanceId}:`, error)
      throw error
    }
  },

  async cancelWorkflowInstance(instanceId: string, actorId?: string): Promise<void> {
    const now = new Date().toISOString()

    // 1. Update instance status
    const { error: instError } = await supabase
      .from('workflow_instances')
      .update({
        status: 'cancelled',
        updated_at: now,
        updated_by: actorId
      })
      .eq('id', instanceId)

    if (instError) throw instError

    // 2. Update step instances status
    const { error: stepError } = await supabase
      .from('workflow_step_instances')
      .update({ status: 'cancelled' })
      .eq('workflow_instance_id', instanceId)
      .in('status', ['active', 'pending'])

    if (stepError) throw stepError
  },

  async deleteWorkflowInstance(instanceId: string): Promise<void> {
    // Cascades will handle it, but let's delete explicit just in case
    await supabase.from('workflow_history').delete().eq('workflow_instance_id', instanceId)
    await supabase.from('workflow_step_instances').delete().eq('workflow_instance_id', instanceId)
    const { error } = await supabase.from('workflow_instances').delete().eq('id', instanceId)
    if (error) throw error
  },

  async incrementInstanceProgress(
    instanceId: string,
    by: number = 1,
    actorId?: string
  ): Promise<{ newCount: number; completed: boolean } | null> {
    const { data: instanceRow, error: getError } = await supabase
      .from('workflow_instances')
      .select('*')
      .eq('id', instanceId)
      .maybeSingle()

    if (getError || !instanceRow) return null

    const instance = this.mapRowToInstance(instanceRow)
    if (instance.targetCount == null) return null

    const newCount = Math.min((instance.progressCount ?? 0) + by, instance.targetCount)
    const completed = newCount >= instance.targetCount
    const now = new Date().toISOString()

    const { error: instUpdateErr } = await supabase
      .from('workflow_instances')
      .update({
        progress_count: newCount,
        status: completed ? 'completed' : 'in_progress',
        completed_at: completed ? now : null,
        updated_at: now,
        updated_by: actorId
      })
      .eq('id', instanceId)

    if (instUpdateErr) throw instUpdateErr

    if (completed) {
      const { data: steps, error: stepsErr } = await supabase
        .from('workflow_step_instances')
        .select('*')
        .eq('workflow_instance_id', instanceId)
        .eq('status', 'active')

      if (stepsErr) throw stepsErr

      if (steps && steps.length > 0) {
        const stepToComplete = steps[0]
        const { error: stepUpdateErr } = await supabase
          .from('workflow_step_instances')
          .update({
            status: 'completed',
            completed_at: now,
            updated_by: actorId
          })
          .eq('id', stepToComplete.id)

        if (stepUpdateErr) throw stepUpdateErr
      }
    }

    return { newCount, completed }
  }
}
