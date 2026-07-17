import { getStoredBrands } from '@/lib/storage/local-brand-store'
import { getCyclesByBrandId, saveOperationCycle } from '@/lib/storage/local-cycle-store'
import { createOperationCycle } from '@/lib/operations/create-operation-cycle'
import { generateWorkflowInstancesForCycle } from '@/lib/workflows/generate-workflow-instances'
import { saveWorkflowInstances } from '@/lib/storage/local-workflow-instance-store'
import { OPERATION_TEMPLATES } from '@/features/workflows/data/operation-template-seeds'
import { WORKFLOW_TEMPLATES } from '@/features/workflows/data/workflow-template-seeds'

/**
 * Eğer ayın 5'ine kadar ilgili ayın canlı iş akış dönemi oluşturulmadıysa,
 * aktif markalar için otomatik olarak marka şablonunu uygulayıp iş akışlarını başlatır.
 */
export async function autoApplyCycles(): Promise<number> {
  const now = new Date()
  const currentDay = now.getDate()
  
  // Eğer ayın 5'inden önceyse, hiçbir şey yapma
  if (currentDay < 5) {
    return 0
  }

  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  
  const brands = await getStoredBrands()
  const activeBrands = brands.filter((b) => b.status === 'active')
  
  let createdCount = 0

  for (const brand of activeBrands) {
    try {
      const existingCycles = await getCyclesByBrandId(brand.id)
      const hasCycleForThisMonth = existingCycles.some(
        (c) => c.month === currentMonth && c.year === currentYear
      )

      if (!hasCycleForThisMonth) {
        // 1. Dönemi oluştur
        const cycle = await createOperationCycle({
          brand,
          month: currentMonth,
          year: currentYear,
          notes: "Ayın 5'ine kadar oluşturulmadığı için sistem tarafından otomatik başlatıldı.",
        })

        // 2. Durumu 'active' olarak güncelle
        cycle.status = 'active'
        await saveOperationCycle(cycle)

        // 3. Canlı iş akışlarını üret
        const { instances, steps } = await generateWorkflowInstancesForCycle({
          cycle,
          operationTemplates: OPERATION_TEMPLATES,
          workflowTemplates: WORKFLOW_TEMPLATES,
        })

        // 4. İş akışlarını kaydet
        if (instances.length > 0) {
          await saveWorkflowInstances(instances, steps)
        }

        createdCount++
        console.log(`[Auto-Apply] ${brand.name} için ${currentYear}/${currentMonth} dönemi otomatik başlatıldı.`)
      }
    } catch (error) {
      console.error(`[Auto-Apply] ${brand.name} için otomatik dönem oluşturulurken hata:`, error)
    }
  }

  return createdCount
}
