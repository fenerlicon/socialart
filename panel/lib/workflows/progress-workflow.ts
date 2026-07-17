import { v4 as uuidv4 } from 'uuid'
import type {
  WorkflowInstance,
  WorkflowStepInstance,
  WorkflowHistory,
  BrandOperationCycle,
  OperationPlanItem,
} from '@/types/domain'
import {
  getStoredWorkflowInstances,
  getWorkflowStepsByInstanceId,
  updateWorkflowInstance,
  updateWorkflowStepInstance,
  saveWorkflowHistory,
} from '@/lib/storage/local-workflow-instance-store'
import { getCycleById, saveOperationCycle } from '@/lib/storage/local-cycle-store'
import {
  createStepActivatedNotification,
  createWorkflowCompletedNotification,
  createCycleCompletedNotification,
} from '@/lib/workflows/notification-helper'

// ---------------------------------------------------------------------------
// Workflow Event Hooks (İş Akışı Olay Tetikleyicileri)
// ---------------------------------------------------------------------------

export const workflowEvents = {
  onWorkflowStarted: (instance: WorkflowInstance) => {
    console.log(`[Event: onWorkflowStarted] Workflow: "${instance.title}" başlatıldı (ID: ${instance.id})`)
  },
  onStepActivated: async (instance: WorkflowInstance, step: WorkflowStepInstance) => {
    console.log(`[Event: onStepActivated] Adım: "${step.title}" aktifleşti (Workflow: "${instance.title}")`)
    await createStepActivatedNotification(instance, step)
  },
  onStepCompleted: (instance: WorkflowInstance, step: WorkflowStepInstance) => {
    console.log(`[Event: onStepCompleted] Adım: "${step.title}" tamamlandı (Workflow: "${instance.title}")`)
  },
  onWorkflowCompleted: async (instance: WorkflowInstance) => {
    console.log(`[Event: onWorkflowCompleted] Workflow: "${instance.title}" tamamlandı!`)
    await createWorkflowCompletedNotification(instance)
  },
  onOperationCompleted: (cycle: BrandOperationCycle, item: OperationPlanItem) => {
    console.log(`[Event: onOperationCompleted] Kalem: "${item.title}" (Hedef: ${item.target}) tamamlandı (Dönem: ${cycle.month}/${cycle.year})`)
  },
  onCycleCompleted: async (cycle: BrandOperationCycle) => {
    console.log(`[Event: onCycleCompleted] Aylık Operasyon Dönemi tamamlandı (Dönem: ${cycle.month}/${cycle.year})!`)
    await createCycleCompletedNotification(cycle)
  },
}

interface ProgressParams {
  workflowInstanceId: string
  stepInstanceId: string
  action: 'complete' | 'cancel' | 'skip'
  actorEmployeeId?: string
}

/**
 * İş akışının aktif adımını ilerletir.
 * Adım durumunu günceller, bir sonraki adımı tetikler, geçmiş (audit log) kaydı yazar
 * ve domino/cycle etkilerini gerçekleştirir.
 */
export async function progressWorkflowStep(params: ProgressParams): Promise<void> {
  const { workflowInstanceId, stepInstanceId, action, actorEmployeeId } = params
  const now = new Date().toISOString()

  // 1. WorkflowInstance'ı depodan al
  const allInstances = await getStoredWorkflowInstances()
  const instance = allInstances.find((i) => i.id === workflowInstanceId)
  if (!instance) {
    throw new Error(`İş akışı örneği bulunamadı: ${workflowInstanceId}`)
  }

  // 2. Adımları (WorkflowStepInstance) al ve sırala
  const steps = (await getWorkflowStepsByInstanceId(workflowInstanceId)).sort(
    (a, b) => a.order - b.order
  )
  const targetStep = steps.find((s) => s.id === stepInstanceId)
  if (!targetStep) {
    throw new Error(`İş akışı adımı bulunamadı: ${stepInstanceId}`)
  }

  if (targetStep.status === 'completed' || targetStep.status === 'skipped') {
    console.warn(`Step ${stepInstanceId} is already completed/skipped. Skipping progressWorkflowStep to avoid double-processing.`)
    return
  }

  if (targetStep.status !== 'active') {
    throw new Error(`Sadece 'active' durumundaki adımlar ilerletilebilir. Mevcut durum: ${targetStep.status}`)
  }

  const fromStatus = targetStep.status
  let toStatus: WorkflowStepInstance['status'] = 'completed'

  // Aksiyona göre durum belirleme
  if (action === 'complete') {
    toStatus = 'completed'
  } else if (action === 'skip') {
    toStatus = 'skipped'
  } else if (action === 'cancel') {
    toStatus = 'cancelled'
  }

  // 3. Hedef adımı güncelle
  targetStep.status = toStatus
  targetStep.completedAt = now
  await updateWorkflowStepInstance(targetStep)

  // Geçmiş (Audit Log) kaydı oluştur
  const stepHistory: WorkflowHistory = {
    id: uuidv4(),
    workflowInstanceId,
    workflowStepInstanceId: stepInstanceId,
    actorEmployeeId,
    action,
    fromStatus,
    toStatus,
    createdAt: now,
  }
  await saveWorkflowHistory(stepHistory)

  // Event tetikleme
  workflowEvents.onStepCompleted(instance, targetStep)

  // 4. Son adım (isFinalStep) tamamlandıysa veya başka adım kalmadıysa workflow'u bitir
  const isFinal = targetStep.isFinalStep || steps.indexOf(targetStep) === steps.length - 1

  if (isFinal) {
    instance.status = 'completed'
    instance.currentStepId = ''
    instance.completedAt = now
    instance.updatedAt = now
    await updateWorkflowInstance(instance)

    // Event tetikleme
    await workflowEvents.onWorkflowCompleted(instance)
  } else {
    // 5. Bir sonraki pendig adımı bul ve active yap
    const currentIndex = steps.indexOf(targetStep)
    const nextStep = steps.slice(currentIndex + 1).find((s) => s.status === 'pending')

    if (nextStep) {
      const nextStepFromStatus = nextStep.status
      nextStep.status = 'active'
      nextStep.startedAt = now
      await updateWorkflowStepInstance(nextStep)

      // WorkflowInstance'ı güncelle
      instance.currentStepId = nextStep.id
      instance.updatedAt = now
      await updateWorkflowInstance(instance)

      // Sistem tarafından bir sonraki adımın tetiklendiğini logla
      const activationHistory: WorkflowHistory = {
        id: uuidv4(),
        workflowInstanceId,
        workflowStepInstanceId: nextStep.id,
        action: 'activate',
        fromStatus: nextStepFromStatus,
        toStatus: 'active',
        createdAt: now,
      }
      await saveWorkflowHistory(activationHistory)

      // Event tetikleme
      await workflowEvents.onStepActivated(instance, nextStep)
    } else {
      // Eğer pending adım kalmadıysa (güvenlik tedbiri) workflow'u tamamla
      instance.status = 'completed'
      instance.currentStepId = ''
      instance.completedAt = now
      instance.updatedAt = now
      await updateWorkflowInstance(instance)
      await workflowEvents.onWorkflowCompleted(instance)
    }
  }

  // DOMINO VE DURUM GÜNCELLEME ETKİSİ (Her adım ilerlemesinde çalışır)
  const cycle = await getCycleById(instance.cycleId)
  if (cycle) {
    // Bu plan kalemine ait tüm iş akışlarını al
    const cycleWorkflows = (await getStoredWorkflowInstances()).filter(
      (w) => w.operationPlanItemId === instance.operationPlanItemId
    )
    
    const completedCount = cycleWorkflows.filter((w) => w.status === 'completed').length

    const planItem = cycle.operationPlan.find((item) => item.id === instance.operationPlanItemId)
    if (planItem) {
      planItem.completed = completedCount
      
      // Durumu otomatik hesapla (Eğer iptal edilmemişse)
      if (planItem.status !== 'cancelled') {
        if (completedCount >= planItem.target) {
          planItem.status = 'completed'
          workflowEvents.onOperationCompleted(cycle, planItem)
        } else {
          // Eğer en az bir workflow in_progress veya completed ise in_progress yap
          const hasStarted = cycleWorkflows.some(
            (w) => w.status === 'completed' || w.status === 'in_progress' || w.status === 'waiting_approval'
          )
          if (hasStarted) {
            planItem.status = 'in_progress'
          } else {
            planItem.status = 'pending'
          }
        }
      }

      // Güncellenen operasyon cycle verisini depola
      await saveOperationCycle(cycle)

      // CYCLE ETKİSİ
      const activeItems = cycle.operationPlan.filter((item) => item.status !== 'cancelled')
      const allCompleted = activeItems.every((item) => item.status === 'completed')

      if (allCompleted) {
        cycle.status = 'completed'
        await saveOperationCycle(cycle)
        await workflowEvents.onCycleCompleted(cycle)
      }
    }
  }
}
