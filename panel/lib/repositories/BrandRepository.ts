import { supabase } from '@/lib/supabase/client'
import type { Brand } from '@/types/domain'

export const BrandRepository = {
  mapRowToBrand(row: any): Brand {
    return {
      id: row.id,
      name: row.name,
      instagram: row.instagram || undefined,
      website: row.website || undefined,
      contactPerson: row.contact_person,
      phone: row.phone,
      email: row.email,
      operationManagerId: row.operation_manager_id,
      startDate: row.start_date,
      status: row.status,
      selectedPackageId: row.selected_package_id,
      operationPlan: row.operation_plan || [],
      brandAssignments: row.brand_assignments || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      templateVersion: row.template_version || 1,
      templateUpdatedAt: row.template_updated_at || undefined,
    }
  },

  mapBrandToRow(brand: Partial<Brand>) {
    const row: any = {}
    if (brand.id !== undefined) row.id = brand.id
    if (brand.name !== undefined) row.name = brand.name
    if (brand.instagram !== undefined) row.instagram = brand.instagram
    if (brand.website !== undefined) row.website = brand.website
    if (brand.contactPerson !== undefined) row.contact_person = brand.contactPerson
    if (brand.phone !== undefined) row.phone = brand.phone
    if (brand.email !== undefined) row.email = brand.email
    if (brand.operationManagerId !== undefined) row.operation_manager_id = brand.operationManagerId
    if (brand.startDate !== undefined) row.start_date = brand.startDate
    if (brand.status !== undefined) row.status = brand.status
    if (brand.selectedPackageId !== undefined) row.selected_package_id = brand.selectedPackageId
    if (brand.operationPlan !== undefined) row.operation_plan = brand.operationPlan
    if (brand.brandAssignments !== undefined) row.brand_assignments = brand.brandAssignments
    if (brand.createdAt !== undefined) row.created_at = brand.createdAt
    if (brand.updatedAt !== undefined) row.updated_at = brand.updatedAt
    if (brand.templateVersion !== undefined) row.template_version = brand.templateVersion
    if (brand.templateUpdatedAt !== undefined) row.template_updated_at = brand.templateUpdatedAt
    return row
  },

  async getAll(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching brands:', error)
      throw error
    }

    return (data || []).map(this.mapRowToBrand)
  },

  async getById(id: string): Promise<Brand | null> {
    if (!id) return null
    const cleanId = decodeURIComponent(id).trim()

    // 1. Exact ID query
    try {
      const { data } = await supabase
        .from('brands')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle()

      if (data) return this.mapRowToBrand(data)
    } catch (err) {}

    // 2. Exact Name query (case-insensitive)
    try {
      const { data } = await supabase
        .from('brands')
        .select('*')
        .ilike('name', cleanId)
        .maybeSingle()

      if (data) return this.mapRowToBrand(data)
    } catch (err) {}

    // 3. Search across all brands in DB
    try {
      const { data: allBrands } = await supabase.from('brands').select('*')
      if (allBrands && allBrands.length > 0) {
        const lowerSearch = cleanId.toLowerCase()
        const slugSearch = lowerSearch.replace(/[^a-z0-9]/g, '')

        const found = allBrands.find(b => {
          if (!b) return false
          const bId = String(b.id || '').toLowerCase()
          const bName = String(b.name || '').toLowerCase()
          const bSlug = bName.replace(/[^a-z0-9]/g, '')
          return bId === lowerSearch || bName === lowerSearch || (slugSearch && bSlug === slugSearch)
        })

        if (found) return this.mapRowToBrand(found)
      }
    } catch (err) {}

    // 4. LocalStorage Fallback (for offline or freshly created local brands)
    if (typeof window !== 'undefined') {
      try {
        const localStr = localStorage.getItem('socialart_brands') || '[]'
        const localBrands: Brand[] = JSON.parse(localStr)
        const foundLocal = localBrands.find(b =>
          b.id === cleanId ||
          b.name.toLowerCase() === cleanId.toLowerCase() ||
          b.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanId.toLowerCase()
        )
        if (foundLocal) return foundLocal
      } catch (err) {}
    }

    // 5. Last Viewed Brand Fallback (for static export fallback routes)
    if (typeof window !== 'undefined') {
      try {
        const lastViewedStr = localStorage.getItem('socialart_last_viewed_brand')
        if (lastViewedStr) {
          const lastViewed: Brand = JSON.parse(lastViewedStr)
          if (
            lastViewed.id === cleanId ||
            lastViewed.name.toLowerCase() === cleanId.toLowerCase() ||
            lastViewed.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanId.toLowerCase() ||
            cleanId === 'temp'
          ) {
            return lastViewed
          }
        }
      } catch (err) {}
    }

    return null
  },

  async save(brand: Brand): Promise<Brand> {
    const row = this.mapBrandToRow(brand)
    const { error } = await supabase
      .from('brands')
      .upsert(row)

    if (error) {
      console.error('Error saving brand:', error)
      throw error
    }

    return brand
  },

  async update(id: string, fields: Partial<Omit<Brand, 'id' | 'createdAt'>>, actorId?: string): Promise<Brand | null> {
    const row = this.mapBrandToRow(fields)
    row.updated_at = new Date().toISOString()
    if (actorId) row.updated_by = actorId

    const { data, error } = await supabase
      .from('brands')
      .update(row)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error(`Error updating brand ${id}:`, error)
      throw error
    }

    return data ? this.mapRowToBrand(data) : null
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Error deleting brand ${id}:`, error)
      throw error
    }
  },

  async updatePlanItem(
    brandId: string,
    itemId: string,
    completed: number,
    status: Brand['operationPlan'][number]['status'],
    actorId?: string
  ): Promise<Brand | null> {
    const brand = await this.getById(brandId)
    if (!brand) return null

    const updatedPlan = brand.operationPlan.map((item) =>
      item.id === itemId ? { ...item, completed, status } : item
    )

    return this.update(brandId, { operationPlan: updatedPlan }, actorId)
  }
}
