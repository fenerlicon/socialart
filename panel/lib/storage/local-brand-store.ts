import { BrandRepository } from '@/lib/repositories/BrandRepository'
import type { Brand, CreateBrandInput } from '@/types/domain'
import { v4 as uuidv4 } from 'uuid'
import { createOnboardingWorkflowForBrand } from '@/lib/workflows/onboarding-workflow'

export async function getStoredBrands(): Promise<Brand[]> {
  return BrandRepository.getAll()
}

export async function getBrandById(id: string): Promise<Brand | undefined> {
  const brand = await BrandRepository.getById(id)
  return brand || undefined
}

export async function saveBrand(brand: Brand): Promise<Brand[]> {
  await BrandRepository.save(brand)
  return BrandRepository.getAll()
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
  await BrandRepository.save(brand)
  
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
  await BrandRepository.delete(id)
  return BrandRepository.getAll()
}
