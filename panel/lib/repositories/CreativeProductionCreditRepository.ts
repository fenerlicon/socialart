import { supabase } from '@/lib/supabase/client'
import type {
  CreativeProductionCredit,
  CreativeProductionFilter,
  CreativeProductionSummary,
  WorkflowStepInstance,
  WorkflowInstance,
  WorkflowApproval,
  Employee,
} from '@/types/domain'
import { v4 as uuidv4 } from 'uuid'
import { getCreativeProductionReport } from '@/lib/services/creative-production-reporting'

const CREDIT_COLUMNS =
  'id,workflow_step_instance_id,workflow_instance_id,final_approval_id,designer_employee_id,db1_employee_id,brand_id,creative_count,credited_at,created_at,task_title,workflow_title,reviewer_employee_id'

// In-memory persistent cache for testing / offline fallback
const inMemoryCredits = new Map<string, CreativeProductionCredit>()

export const CreativeProductionCreditRepository = {
  mapRowToCredit(row: any): CreativeProductionCredit {
    return {
      id: row.id,
      workflowStepInstanceId: row.workflow_step_instance_id,
      workflowInstanceId: row.workflow_instance_id || undefined,
      finalApprovalId: row.final_approval_id || undefined,
      designerEmployeeId: row.designer_employee_id,
      db1EmployeeId: row.db1_employee_id || undefined,
      brandId: row.brand_id || null,
      creativeCount: Number(row.creative_count) || 1,
      creditedAt: row.credited_at || row.created_at,
      createdAt: row.created_at,
      taskTitle: row.task_title || undefined,
      workflowTitle: row.workflow_title || undefined,
      reviewerEmployeeId: row.reviewer_employee_id || undefined,
    }
  },

  mapCreditToRow(credit: Partial<CreativeProductionCredit>) {
    const row: any = {}
    if (credit.id !== undefined) row.id = credit.id
    if (credit.workflowStepInstanceId !== undefined) row.workflow_step_instance_id = credit.workflowStepInstanceId
    if (credit.workflowInstanceId !== undefined) row.workflow_instance_id = credit.workflowInstanceId
    if (credit.finalApprovalId !== undefined) row.final_approval_id = credit.finalApprovalId
    if (credit.designerEmployeeId !== undefined) row.designer_employee_id = credit.designerEmployeeId
    if (credit.db1EmployeeId !== undefined) row.db1_employee_id = String(credit.db1EmployeeId)
    if (credit.brandId !== undefined) row.brand_id = credit.brandId
    if (credit.creativeCount !== undefined)
      row.creative_count = credit.creativeCount >= 1 ? Math.floor(credit.creativeCount) : 1
    if (credit.creditedAt !== undefined) row.credited_at = credit.creditedAt
    if (credit.createdAt !== undefined) row.created_at = credit.createdAt
    if (credit.taskTitle !== undefined) row.task_title = credit.taskTitle
    if (credit.workflowTitle !== undefined) row.workflow_title = credit.workflowTitle
    if (credit.reviewerEmployeeId !== undefined) row.reviewer_employee_id = credit.reviewerEmployeeId
    return row
  },

  async getAll(): Promise<CreativeProductionCredit[]> {
    try {
      const { data, error } = await supabase
        .from('creative_production_credits')
        .select(CREDIT_COLUMNS)
        .order('credited_at', { ascending: false })

      if (error) {
        return Array.from(inMemoryCredits.values()).sort(
          (a, b) => new Date(b.creditedAt).getTime() - new Date(a.creditedAt).getTime()
        )
      }

      const dbCredits = (data || []).map(this.mapRowToCredit)
      dbCredits.forEach((c) => inMemoryCredits.set(c.workflowStepInstanceId, c))
      return dbCredits
    } catch {
      return Array.from(inMemoryCredits.values()).sort(
        (a, b) => new Date(b.creditedAt).getTime() - new Date(a.creditedAt).getTime()
      )
    }
  },

  async getByDesigner(designerEmployeeId: string): Promise<CreativeProductionCredit[]> {
    const all = await this.getAll()
    return all.filter((c) => c.designerEmployeeId === designerEmployeeId)
  },

  async getByStepId(workflowStepInstanceId: string): Promise<CreativeProductionCredit | null> {
    if (inMemoryCredits.has(workflowStepInstanceId)) {
      return inMemoryCredits.get(workflowStepInstanceId)!
    }
    try {
      const { data, error } = await supabase
        .from('creative_production_credits')
        .select(CREDIT_COLUMNS)
        .eq('workflow_step_instance_id', workflowStepInstanceId)
        .maybeSingle()

      if (!error && data) {
        const credit = this.mapRowToCredit(data)
        inMemoryCredits.set(credit.workflowStepInstanceId, credit)
        return credit
      }
    } catch {}
    return null
  },

  async saveCredit(creditInput: Partial<CreativeProductionCredit>): Promise<CreativeProductionCredit> {
    if (!creditInput.workflowStepInstanceId) {
      throw new Error('workflowStepInstanceId is required for creative credit')
    }
    if (!creditInput.designerEmployeeId) {
      throw new Error('designerEmployeeId is required for creative credit')
    }

    const existing = await this.getByStepId(creditInput.workflowStepInstanceId)
    if (existing) {
      return existing
    }

    const now = new Date().toISOString()
    const credit: CreativeProductionCredit = {
      id: creditInput.id || uuidv4(),
      workflowStepInstanceId: creditInput.workflowStepInstanceId,
      workflowInstanceId: creditInput.workflowInstanceId,
      finalApprovalId: creditInput.finalApprovalId,
      designerEmployeeId: creditInput.designerEmployeeId,
      db1EmployeeId: creditInput.db1EmployeeId,
      brandId: creditInput.brandId || null,
      creativeCount:
        creditInput.creativeCount && creditInput.creativeCount >= 1 ? Math.floor(creditInput.creativeCount) : 1,
      creditedAt: creditInput.creditedAt || now,
      createdAt: creditInput.createdAt || now,
      taskTitle: creditInput.taskTitle,
      workflowTitle: creditInput.workflowTitle,
      reviewerEmployeeId: creditInput.reviewerEmployeeId,
    }

    inMemoryCredits.set(credit.workflowStepInstanceId, credit)

    try {
      const row = this.mapCreditToRow(credit)
      await supabase.from('creative_production_credits').upsert(row, { onConflict: 'workflow_step_instance_id' })
    } catch (err) {
      console.warn('[CreativeProductionCreditRepository] DB2 persistence notice:', err)
    }

    return credit
  },

  /**
   * Final Creative Approval Ledger Hook
   * Calls serverless authority endpoint first, falls back to direct DB2 upsert
   */
  async recordCreditFromApproval(
    step: WorkflowStepInstance,
    instance: WorkflowInstance,
    approval: WorkflowApproval,
    approverEmployeeId: string
  ): Promise<CreativeProductionCredit | null> {
    if (approval.approvalPurpose !== 'final_creative') {
      return null
    }

    // Try server endpoint if in browser environment
    if (typeof window !== 'undefined' && typeof fetch === 'function') {
      try {
        const res = await fetch('/api/creative-production-router?action=record-credit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approvalId: approval.id }),
        })
        if (res.ok) {
          const json = await res.json()
          if (json?.credit) {
            const mapped = this.mapRowToCredit(json.credit)
            inMemoryCredits.set(mapped.workflowStepInstanceId, mapped)
            return mapped
          }
        }
      } catch (e) {
        console.warn('[recordCreditFromApproval] Server API call notice, falling back to direct:', e)
      }
    }

    // Fallback: direct server/in-process execution
    const designerId = step.assignedEmployeeId || approval.requestedByEmployeeId
    if (!designerId) {
      return null
    }

    const count =
      step.creativeCount !== undefined && step.creativeCount !== null && step.creativeCount >= 1
        ? Math.floor(step.creativeCount)
        : 1

    const isGeneral =
      instance.id === 'inst-general-agency-tasks' ||
      instance.brandId === 'general' ||
      instance.brandId === 'general-agency' ||
      instance.brandId === 'general-brand' ||
      !instance.brandId ||
      instance.title.includes('Genel Ajans')
    const brandId = isGeneral ? null : instance.brandId || null

    return this.saveCredit({
      workflowStepInstanceId: step.id,
      workflowInstanceId: instance.id,
      finalApprovalId: approval.id,
      designerEmployeeId: designerId,
      brandId,
      creativeCount: count,
      creditedAt: approval.approvedAt || new Date().toISOString(),
      taskTitle: step.title,
      workflowTitle: instance.title,
      reviewerEmployeeId: approverEmployeeId,
    })
  },

  /**
   * Fetch Scoped Creative Production Report
   */
  async fetchReport(
    filter: CreativeProductionFilter,
    allowedDesignerIds?: Set<string> | string[],
    allEmployees: Employee[] = []
  ): Promise<CreativeProductionSummary> {
    if (typeof window !== 'undefined' && typeof fetch === 'function') {
      try {
        const res = await fetch('/api/creative-production-router?action=report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filter),
        })
        if (res.ok) {
          const json = await res.json()
          if (json?.summary) {
            return json.summary
          }
        }
      } catch (e) {
        console.warn('[fetchReport] Server API call notice, falling back to in-process:', e)
      }
    }

    // Direct in-process fallback
    return getCreativeProductionReport(filter, allowedDesignerIds, allEmployees)
  },
}
