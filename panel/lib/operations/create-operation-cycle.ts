import { v4 as uuidv4 } from 'uuid'
import type { Brand, BrandOperationCycle } from '@/types/domain'
import { getCyclesByBrandId } from '@/lib/storage/local-cycle-store'

/**
 * Verilen markanın şablon operasyon planını (veya özelleştirilmiş bir planı) kopyalayarak seçilen ay ve yıl için yeni bir BrandOperationCycle üretir.
 * Eğer marka için ilgili ay ve yıla ait bir dönem zaten mevcutsa hata fırlatır.
 */
export async function createOperationCycle(params: {
  brand: Brand
  month: number // 1-12
  year: number
  notes?: string
  customPlan?: any[]
}): Promise<BrandOperationCycle> {
  const { brand, month, year, notes, customPlan } = params

  // 1. Mükerrer Kontrolü
  const existingCycles = await getCyclesByBrandId(brand.id)
  const isDuplicate = existingCycles.some((c) => c.month === month && c.year === year)

  if (isDuplicate) {
    throw new Error(
      `Bu marka için ${year} yılı ${month}. ay operasyon dönemi zaten oluşturulmuş!`
    )
  }

  const now = new Date().toISOString()

  // 2. Operasyon şablon kalemlerini kopyala ve sıfırla (Yeni ID'ler vererek bağımsızlaştır)
  const sourcePlan = customPlan || brand.operationPlan || []
  const copiedPlan = sourcePlan.map((item) => ({
    ...item,
    id: uuidv4(),
    completed: 0,
    status: 'pending' as const,
  }))

  const newCycle: BrandOperationCycle = {
    id: uuidv4(),
    brandId: brand.id,
    month,
    year,
    status: 'planning',
    operationPlan: copiedPlan,
    notes,
    createdAt: now,
    generatedAt: now,
    isCustomized: !!customPlan,
    templateVersion: brand.templateVersion || 1,
    templateUpdatedAt: brand.templateUpdatedAt || brand.createdAt,
  }

  return newCycle
}
