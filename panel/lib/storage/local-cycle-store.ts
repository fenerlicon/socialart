import type { BrandOperationCycle } from '@/types/domain'
import { CycleRepository } from '@/lib/repositories/CycleRepository'

export async function getStoredCycles(): Promise<BrandOperationCycle[]> {
  return CycleRepository.getAll()
}

export async function getCyclesByBrandId(brandId: string): Promise<BrandOperationCycle[]> {
  return CycleRepository.getByBrandId(brandId)
}

export async function getCycleById(id: string): Promise<BrandOperationCycle | undefined> {
  const cycle = await CycleRepository.getById(id)
  return cycle || undefined
}

export async function saveOperationCycle(cycle: BrandOperationCycle): Promise<BrandOperationCycle[]> {
  const existing = await CycleRepository.getAll()

  // Duplicate check
  const duplicate = existing.find(
    (c) =>
      c.brandId === cycle.brandId &&
      c.month === cycle.month &&
      c.year === cycle.year &&
      c.id !== cycle.id
  )

  if (duplicate) {
    throw new Error(
      `Bu marka için ${cycle.year} yılı ${cycle.month}. ay operasyon dönemi zaten oluşturulmuş!`
    )
  }

  await CycleRepository.save(cycle)
  return CycleRepository.getAll()
}

export async function deleteOperationCycle(id: string): Promise<BrandOperationCycle[]> {
  await CycleRepository.delete(id)
  return CycleRepository.getAll()
}
