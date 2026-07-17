import { supabase } from '@/lib/supabase/client'
import type { BrandOperationCycle } from '@/types/domain'

export const CycleRepository = {
  mapRowToCycle(row: any): BrandOperationCycle {
    return {
      id: row.id,
      brandId: row.brand_id,
      month: row.month,
      year: row.year,
      status: row.status,
      operationPlan: row.operation_plan || [],
      notes: row.notes || undefined,
      createdAt: row.created_at,
      generatedAt: row.generated_at || undefined,
      isCustomized: row.is_customized || false,
      templateVersion: row.template_version || 1,
      templateUpdatedAt: row.template_updated_at || undefined,
    }
  },

  mapCycleToRow(cycle: Partial<BrandOperationCycle>) {
    const row: any = {}
    if (cycle.id !== undefined) row.id = cycle.id
    if (cycle.brandId !== undefined) row.brand_id = cycle.brandId
    if (cycle.month !== undefined) row.month = cycle.month
    if (cycle.year !== undefined) row.year = cycle.year
    if (cycle.status !== undefined) row.status = cycle.status
    if (cycle.operationPlan !== undefined) row.operation_plan = cycle.operationPlan
    if (cycle.notes !== undefined) row.notes = cycle.notes
    if (cycle.createdAt !== undefined) row.created_at = cycle.createdAt
    if (cycle.generatedAt !== undefined) row.generated_at = cycle.generatedAt
    if (cycle.isCustomized !== undefined) row.is_customized = cycle.isCustomized
    if (cycle.templateVersion !== undefined) row.template_version = cycle.templateVersion
    if (cycle.templateUpdatedAt !== undefined) row.template_updated_at = cycle.templateUpdatedAt
    return row
  },

  async getAll(): Promise<BrandOperationCycle[]> {
    const { data, error } = await supabase
      .from('cycles')
      .select('*')

    if (error) {
      console.error('Error fetching cycles:', error)
      throw error
    }

    return (data || []).map(this.mapRowToCycle)
  },

  async getById(id: string): Promise<BrandOperationCycle | null> {
    if (!id) return null
    const { data, error } = await supabase
      .from('cycles')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error(`Error fetching cycle with id ${id}:`, error)
      throw error
    }

    return data ? this.mapRowToCycle(data) : null
  },

  async getByBrandId(brandId: string): Promise<BrandOperationCycle[]> {
    const { data, error } = await supabase
      .from('cycles')
      .select('*')
      .eq('brand_id', brandId)

    if (error) {
      console.error(`Error fetching cycles for brand ${brandId}:`, error)
      throw error
    }

    return (data || []).map(this.mapRowToCycle)
  },

  async save(cycle: BrandOperationCycle): Promise<BrandOperationCycle> {
    const row = this.mapCycleToRow(cycle)
    const { error } = await supabase
      .from('cycles')
      .upsert(row)

    if (error) {
      console.error('Error saving cycle:', error)
      throw error
    }

    return cycle
  },

  async update(id: string, fields: Partial<Omit<BrandOperationCycle, 'id' | 'createdAt'>>, actorId?: string): Promise<BrandOperationCycle | null> {
    const row = this.mapCycleToRow(fields)
    if (actorId) row.updated_by = actorId

    const { data, error } = await supabase
      .from('cycles')
      .update(row)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error(`Error updating cycle ${id}:`, error)
      throw error
    }

    return data ? this.mapRowToCycle(data) : null
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('cycles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Error deleting cycle ${id}:`, error)
      throw error
    }
  }
}

