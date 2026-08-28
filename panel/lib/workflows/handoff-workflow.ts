import { v4 as uuidv4 } from 'uuid'
import type {
  WorkflowHandoff,
  WorkflowStepInstance,
  WorkflowHistory,
} from '@/types/domain'
import {
  getStoredHandoffs,
  saveHandoff,
  updateHandoff,
} from '@/lib/storage/local-handoff-store'
import {
  getStoredWorkflowInstances,
  getWorkflowStepsByInstanceId,
  updateWorkflowStepInstance,
  saveWorkflowHistory,
} from '@/lib/storage/local-workflow-instance-store'

import {
  createHandoffRequestedNotification,
  createHandoffAcceptedNotification,
  createHandoffRejectedNotification,
} from '@/lib/workflows/notification-helper'

// Handoff Olay Tetikleyicileri (Hook)
export const handoffEvents = {
  onHandoffRequested: async (handoff: WorkflowHandoff) => {
    console.log(`[Event: onHandoffRequested] İş adımı paslama talebi oluşturuldu (Handoff ID: ${handoff.id})`)
    const instances = await getStoredWorkflowInstances()
    const instance = instances.find(i => i.id === handoff.workflowInstanceId)
    const steps = await getWorkflowStepsByInstanceId(handoff.workflowInstanceId)
    const step = steps.find(s => s.id === handoff.workflowStepInstanceId)
    if (instance && step) {
      await createHandoffRequestedNotification(handoff, step.title, instance.title)
    }
  },
  onHandoffAccepted: async (handoff: WorkflowHandoff) => {
    console.log(`[Event: onHandoffAccepted] Paslama talebi kabul edildi (Handoff ID: ${handoff.id})`)
    const instances = await getStoredWorkflowInstances()
    const instance = instances.find(i => i.id === handoff.workflowInstanceId)
    const steps = await getWorkflowStepsByInstanceId(handoff.workflowInstanceId)
    const step = steps.find(s => s.id === handoff.workflowStepInstanceId)
    if (instance && step) {
      await createHandoffAcceptedNotification(handoff, step.title, instance.title)
    }
  },
  onHandoffRejected: async (handoff: WorkflowHandoff) => {
    console.log(`[Event: onHandoffRejected] Paslama talebi reddedildi (Handoff ID: ${handoff.id})`)
    const instances = await getStoredWorkflowInstances()
    const instance = instances.find(i => i.id === handoff.workflowInstanceId)
    const steps = await getWorkflowStepsByInstanceId(handoff.workflowInstanceId)
    const step = steps.find(s => s.id === handoff.workflowStepInstanceId)
    if (instance && step) {
      await createHandoffRejectedNotification(handoff, step.title, instance.title)
    }
  },
}

interface RequestHandoffParams {
  workflowInstanceId: string
  stepInstanceId: string
  fromEmployeeId: string
  toEmployeeId?: string
  reason: string
  note?: string
}

/**
 * Aktif bir iş adımını başka bir çalışana paslama (devretme) talebi oluşturur.
 */
export async function requestHandoff(params: RequestHandoffParams): Promise<WorkflowHandoff> {
  const { workflowInstanceId, stepInstanceId, fromEmployeeId, toEmployeeId, reason, note } = params
  const now = new Date().toISOString()

  // 1. Validasyonlar
  if (toEmployeeId && fromEmployeeId === toEmployeeId) {
    throw new Error('İşi kendinize paslayamazsınız!')
  }

  // Aynı step için yayında bekleyen başka bir paslama talebi var mı?
  const allHandoffs = await getStoredHandoffs()
  const existingPending = allHandoffs.find(
    (h) => h.workflowStepInstanceId === stepInstanceId && h.status === 'pending'
  )
  if (existingPending) {
    throw new Error('Bu iş adımı için halihazırda onay bekleyen bir paslama talebi mevcut!')
  }

  const allSteps = await getWorkflowStepsByInstanceId(workflowInstanceId)
  const step = allSteps.find((s) => s.id === stepInstanceId)
  if (!step) {
    throw new Error(`İş adımı bulunamadı: ${stepInstanceId}`)
  }

  if (step.status !== 'active') {
    throw new Error('Sadece aktif durumdaki iş adımları paslanabilir!')
  }

  // 2. Devir Talebi (Handoff) oluştur
  const handoffId = uuidv4()
  const handoff: WorkflowHandoff = {
    id: handoffId,
    workflowInstanceId,
    workflowStepInstanceId: stepInstanceId,
    fromEmployeeId,
    toEmployeeId: toEmployeeId || undefined,
    reason,
    note,
    status: 'pending',
    createdAt: now,
  }

  // Talebi kaydet
  await saveHandoff(handoff)

  // 3. Adım güncelle (Atama değişmez, sadece handoffStatus pending olur)
  step.handoffStatus = 'pending'
  step.handoffId = handoffId
  await updateWorkflowStepInstance(step)

  // 4. Geçmiş Logu (WorkflowHistory) oluştur
  const historyLog: WorkflowHistory = {
    id: uuidv4(),
    workflowInstanceId,
    workflowStepInstanceId: stepInstanceId,
    actorEmployeeId: fromEmployeeId,
    action: 'handoff_requested',
    fromStatus: 'active',
    toStatus: 'active', // statüsü hala active olarak kalır ancak handoffStatus pending olur
    note: `Paslama Talebi: ${reason}${note ? ' - ' + note : ''}`,
    createdAt: now,
  }
  await saveWorkflowHistory(historyLog)

  await handoffEvents.onHandoffRequested(handoff)
  return handoff
}

/**
 * Bir paslama talebini kabul eder. İşin atanan sorumlusunu değiştirir.
 */
export async function acceptHandoff(
  handoffId: string,
  actorEmployeeId: string,
  destinationEmployeeId?: string
): Promise<void> {
  const now = new Date().toISOString()
  
  // 1. Talebi bul
  const allHandoffs = await getStoredHandoffs()
  const handoff = allHandoffs.find((h) => h.id === handoffId)
  if (!handoff) {
    throw new Error(`Paslama talebi bulunamadı: ${handoffId}`)
  }

  if (handoff.status !== 'pending') {
    throw new Error(`Talep zaten sonuçlandırılmış: ${handoff.status}`)
  }

  // 2. Adımı bul
  const allSteps = await getWorkflowStepsByInstanceId(handoff.workflowInstanceId)
  const step = allSteps.find((s) => s.id === handoff.workflowStepInstanceId)
  if (!step) {
    throw new Error(`Devredilecek iş adımı bulunamadı: ${handoff.workflowStepInstanceId}`)
  }

  const targetAssigneeId = destinationEmployeeId || handoff.toEmployeeId
  if (!targetAssigneeId) {
    throw new Error('Paslanacak hedef çalışan seçilmelidir!')
  }

  // 3. Handoff durumunu güncelle
  handoff.status = 'accepted'
  handoff.toEmployeeId = targetAssigneeId
  handoff.acceptedAt = now
  await updateHandoff(handoff)

  // 4. Adımı yeni çalışana devret
  step.previousAssigneeEmployeeId = handoff.fromEmployeeId
  step.assignedEmployeeId = targetAssigneeId
  step.assigneeEmployeeId = targetAssigneeId // alias alanını da doldur
  step.handoffStatus = 'accepted'
  step.assignedAt = now
  await updateWorkflowStepInstance(step)

  // 5. Geçmiş Logu (WorkflowHistory) oluştur
  const historyLog: WorkflowHistory = {
    id: uuidv4(),
    workflowInstanceId: handoff.workflowInstanceId,
    workflowStepInstanceId: handoff.workflowStepInstanceId,
    actorEmployeeId: actorEmployeeId,
    action: 'handoff_accepted',
    fromStatus: 'active',
    toStatus: 'active',
    note: `Paslama talebi kabul edildi. Yeni sorumlu: ${targetAssigneeId}`,
    createdAt: now,
  }
  await saveWorkflowHistory(historyLog)

  await handoffEvents.onHandoffAccepted(handoff)
}

/**
 * Bir paslama talebini reddeder. İş eski çalışan sorumluluğunda kalır.
 */
export async function rejectHandoff(handoffId: string, actorEmployeeId: string, responseNote?: string): Promise<void> {
  const now = new Date().toISOString()

  // 1. Talebi bul
  const allHandoffs = await getStoredHandoffs()
  const handoff = allHandoffs.find((h) => h.id === handoffId)
  if (!handoff) {
    throw new Error(`Paslama talebi bulunamadı: ${handoffId}`)
  }

  if (handoff.status !== 'pending') {
    throw new Error(`Talep zaten sonuçlandırılmış: ${handoff.status}`)
  }

  // 2. Adımı bul
  const allSteps = await getWorkflowStepsByInstanceId(handoff.workflowInstanceId)
  const step = allSteps.find((s) => s.id === handoff.workflowStepInstanceId)
  if (!step) {
    throw new Error(`Devredilecek iş adımı bulunamadı: ${handoff.workflowStepInstanceId}`)
  }

  // 3. Handoff durumunu güncelle
  handoff.status = 'rejected'
  handoff.rejectedAt = now
  handoff.responseNote = responseNote
  await updateHandoff(handoff)

  // 4. Adım üzerindeki devir bayraklarını temizle/güncelle
  step.handoffStatus = 'rejected'
  // Not: assignedEmployeeId eski çalışanda kalır.
  await updateWorkflowStepInstance(step)

  // 5. Geçmiş Logu (WorkflowHistory) oluştur
  const historyLog: WorkflowHistory = {
    id: uuidv4(),
    workflowInstanceId: handoff.workflowInstanceId,
    workflowStepInstanceId: handoff.workflowStepInstanceId,
    actorEmployeeId: actorEmployeeId,
    action: 'handoff_rejected',
    fromStatus: 'active',
    toStatus: 'active',
    note: `Paslama talebi reddedildi.${responseNote ? ' İtiraz Gerekçesi: ' + responseNote : ''}`,
    createdAt: now,
  }
  await saveWorkflowHistory(historyLog)

  await handoffEvents.onHandoffRejected(handoff)
}
