import { BrandRepository } from '@/lib/repositories/BrandRepository'
import type { Brand, CreateBrandInput } from '@/types/domain'
import { v4 as uuidv4 } from 'uuid'
import { createOnboardingWorkflowForBrand } from '@/lib/workflows/onboarding-workflow'

export async function getStoredBrands(): Promise<Brand[]> {
  try {
    const remoteBrands = await BrandRepository.getAll()
    if (typeof window !== 'undefined') {
      const localStr = localStorage.getItem('socialart_brands') || '[]'
      const localBrands: Brand[] = JSON.parse(localStr)
      const mergedMap = new Map<string, Brand>()
      remoteBrands.forEach(b => mergedMap.set(b.id, b))
      localBrands.forEach(b => { if (!mergedMap.has(b.id)) mergedMap.set(b.id, b) })
      return Array.from(mergedMap.values())
    }
    return remoteBrands
  } catch (e) {
    if (typeof window !== 'undefined') {
      const localStr = localStorage.getItem('socialart_brands') || '[]'
      return JSON.parse(localStr)
    }
    return []
  }
}

export async function getBrandById(id: string): Promise<Brand | undefined> {
  const brand = await BrandRepository.getById(id)
  return brand || undefined
}

export async function saveBrand(brand: Brand): Promise<Brand[]> {
  try {
    await BrandRepository.save(brand)
  } catch (err) {
    console.warn('DB save brand fallback:', err)
  }
  
  if (typeof window !== 'undefined') {
    const localStr = localStorage.getItem('socialart_brands') || '[]'
    const localBrands: Brand[] = JSON.parse(localStr)
    const existingIndex = localBrands.findIndex(b => b.id === brand.id)
    if (existingIndex >= 0) {
      localBrands[existingIndex] = brand
    } else {
      localBrands.unshift(brand)
    }
    localStorage.setItem('socialart_brands', JSON.stringify(localBrands))
  }

  return getStoredBrands()
}

export async function createAndStoreBrand(input: CreateBrandInput): Promise<Brand> {
  const now = new Date().toISOString()
  const brand: Brand = {
    id: uuidv4(),
    ...input,
    brandAssignments: input.brandAssignments || [],
    createdAt: now,
    updatedAt: now,
    templateVersion: 1,
    templateUpdatedAt: now,
  }

  try {
    await BrandRepository.save(brand)
  } catch (err) {
    console.warn('DB brand save fallback:', err)
  }

  if (typeof window !== 'undefined') {
    const localStr = localStorage.getItem('socialart_brands') || '[]'
    const localBrands: Brand[] = JSON.parse(localStr)
    localBrands.unshift(brand)
    localStorage.setItem('socialart_brands', JSON.stringify(localBrands))
  }
  
  try {
    await createOnboardingWorkflowForBrand(brand)
  } catch (err) {
    console.error('Failed to create onboarding workflow:', err)
  }

  return brand
}

export async function updateBrandPlanItem(
  brandId: string,
  itemId: string,
  completed: number,
  status: Brand['operationPlan'][number]['status']
): Promise<Brand | undefined> {
  const brand = await BrandRepository.updatePlanItem(brandId, itemId, completed, status)
  return brand || undefined
}

export async function deleteBrand(id: string): Promise<Brand[]> {
  try {
    await BrandRepository.delete(id)
  } catch (e) {}

  if (typeof window !== 'undefined') {
    const localStr = localStorage.getItem('socialart_brands') || '[]'
    const localBrands: Brand[] = JSON.parse(localStr)
    const filtered = localBrands.filter(b => b.id !== id)
    localStorage.setItem('socialart_brands', JSON.stringify(filtered))
  }

  return getStoredBrands()
}
