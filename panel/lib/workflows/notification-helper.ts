import { v4 as uuidv4 } from 'uuid'
import type {
  Notification,
  WorkflowInstance,
  WorkflowStepInstance,
  WorkflowHandoff,
  BrandOperationCycle,
  WorkflowApproval,
} from '@/types/domain'
import { saveNotification } from '@/lib/storage/local-notification-store'
import { getBrandById } from '@/lib/storage/local-brand-store'
import { getStoredEmployees } from '@/lib/storage/local-employee-store'
import {
  getWorkflowStepsByInstanceId,
  getStoredWorkflowInstances,
} from '@/lib/storage/local-workflow-instance-store'

// Helper to get brand name
async function getBrandName(brandId: string): Promise<string> {
  const brand = await getBrandById(brandId)
  return brand ? brand.name : 'Bilinmeyen Marka'
}

// Helper to get employee name
async function getEmployeeName(employeeId: string): Promise<string> {
  const employees = await getStoredEmployees()
  const emp = employees.find((e) => e.id === employeeId)
  return emp ? emp.fullName : 'Bilinmeyen Çalışan'
}

export async function createStepActivatedNotification(instance: WorkflowInstance, step: WorkflowStepInstance): Promise<void> {
  if (!step.assignedEmployeeId) return

  const brandName = await getBrandName(instance.brandId)
  const notification: Notification = {
    id: uuidv4(),
    recipientEmployeeId: step.assignedEmployeeId,
    type: 'step_activated',
    title: 'Yeni iş adımı sana atandı.',
    message: `"${brandName}" markasının "${instance.title}" iş akışındaki "${step.title}" adımı artık aktif.`,
    relatedEntityType: 'workflow_step_instance',
    relatedEntityId: step.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  }

  await saveNotification(notification)
}

export async function createHandoffRequestedNotification(handoff: WorkflowHandoff, stepTitle: string, instanceTitle: string): Promise<void> {
  if (!handoff.toEmployeeId) return

  const instances = await getStoredWorkflowInstances()
  const instance = instances.find((i) => i.id === handoff.workflowInstanceId)
  const brandName = instance ? await getBrandName(instance.brandId) : 'Bilinmeyen Marka'
  const employees = await getStoredEmployees()
  const senderName = employees.find((e) => e.id === handoff.fromEmployeeId)?.fullName || 'Bir çalışan'

  const notification: Notification = {
    id: uuidv4(),
    recipientEmployeeId: handoff.toEmployeeId,
    type: 'handoff_requested',
    title: `${senderName} sana bir işi pasladı.`,
    message: `"${instanceTitle}" iş akışındaki "${stepTitle}" adımı için "${handoff.reason}" sebebiyle paslama talebi var.`,
    relatedEntityType: 'handoff',
    relatedEntityId: handoff.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  }

  await saveNotification(notification)
}

export async function createHandoffAcceptedNotification(handoff: WorkflowHandoff, stepTitle: string, instanceTitle: string): Promise<void> {
  if (!handoff.fromEmployeeId) return

  const recipientName = await getEmployeeName(handoff.toEmployeeId)
  const notification: Notification = {
    id: uuidv4(),
    recipientEmployeeId: handoff.fromEmployeeId,
    type: 'handoff_accepted',
    title: 'Paslama talebin kabul edildi.',
    message: `"${instanceTitle}" iş akışındaki "${stepTitle}" adımı "${recipientName}" tarafından devralındı.`,
    relatedEntityType: 'handoff',
    relatedEntityId: handoff.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  }

  await saveNotification(notification)
}

export async function createHandoffRejectedNotification(handoff: WorkflowHandoff, stepTitle: string, instanceTitle: string): Promise<void> {
  if (!handoff.fromEmployeeId) return

  const recipientName = await getEmployeeName(handoff.toEmployeeId)
  const notification: Notification = {
    id: uuidv4(),
    recipientEmployeeId: handoff.fromEmployeeId,
    type: 'handoff_rejected',
    title: 'Paslama talebin reddedildi.',
    message: `"${instanceTitle}" iş akışındaki "${stepTitle}" adımı için talebin "${recipientName}" tarafından reddedildi.${handoff.responseNote ? ' İtiraz Gerekçesi: ' + handoff.responseNote : ''} İş sende kaldı.`,
    relatedEntityType: 'handoff',
    relatedEntityId: handoff.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  }

  await saveNotification(notification)
}

export async function createWorkflowCompletedNotification(instance: WorkflowInstance): Promise<void> {
  const brand = await getBrandById(instance.brandId)
  const brandName = brand ? brand.name : 'Bilinmeyen Marka'

  // Get steps to find the last step's assignee
  const steps = (await getWorkflowStepsByInstanceId(instance.id)).sort((a, b) => a.order - b.order)
  const lastStep = steps[steps.length - 1]
  const lastAssignee = lastStep?.assignedEmployeeId

  const recipients = new Set<string>()
  if (lastAssignee) recipients.add(lastAssignee)
  if (brand?.operationManagerId) recipients.add(brand.operationManagerId)

  for (const recipientId of Array.from(recipients)) {
    const notification: Notification = {
      id: uuidv4(),
      recipientEmployeeId: recipientId,
      type: 'workflow_completed',
      title: 'İş akışı tamamlandı.',
      message: `"${brandName}" markasının "${instance.title}" iş akışı başarıyla tamamlandı.`,
      relatedEntityType: 'workflow_instance',
      relatedEntityId: instance.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    await saveNotification(notification)
  }
}

export async function createCycleCompletedNotification(cycle: BrandOperationCycle): Promise<void> {
  const brand = await getBrandById(cycle.brandId)
  if (!brand || !brand.operationManagerId) return

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]
  const monthName = months[cycle.month - 1] || cycle.month

  const notification: Notification = {
    id: uuidv4(),
    recipientEmployeeId: brand.operationManagerId,
    type: 'cycle_completed',
    title: 'Aylık operasyon dönemi tamamlandı.',
    message: `"${brand.name}" markasının ${monthName} ${cycle.year} operasyon dönemi başarıyla tamamlandı.`,
    relatedEntityType: 'operation_cycle',
    relatedEntityId: cycle.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  }

  await saveNotification(notification)
}

export async function createApprovalRequestedNotification(
  approval: WorkflowApproval,
  stepTitle: string,
  instanceTitle: string
): Promise<void> {
  if (!approval.approverEmployeeId) return

  const requesterName = await getEmployeeName(approval.requestedByEmployeeId)
  const isExtension = approval.approvalType === 'deadline_extension'
  const title = isExtension ? `${requesterName} süre uzatım talebi gönderdi.` : `${requesterName} onay talebi gönderdi.`
  
  let reasonText = ''
  if (isExtension && approval.note) {
    try {
      const parsed = JSON.parse(approval.note)
      reasonText = ` (İstenen Tarih: ${parsed.requestedDate}, Gerekçe: ${parsed.reason})`
    } catch (e) {}
  }

  const message = isExtension
    ? `"${instanceTitle}" iş akışındaki "${stepTitle}" adımı için süre uzatma talebi bekleniyor.${reasonText}`
    : `"${instanceTitle}" iş akışındaki "${stepTitle}" adımı için onay bekleniyor.`

  const notification: Notification = {
    id: uuidv4(),
    recipientEmployeeId: approval.approverEmployeeId,
    type: 'approval_requested',
    title,
    message,
    relatedEntityType: 'approval',
    relatedEntityId: approval.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  }
  await saveNotification(notification)
}

export async function createApprovalApprovedNotification(
  approval: WorkflowApproval,
  stepTitle: string,
  instanceTitle: string
): Promise<void> {
  const isExtension = approval.approvalType === 'deadline_extension'
  const title = isExtension ? 'Süre uzatım talebin kabul edildi.' : 'Onay talebin kabul edildi.'
  const message = isExtension
    ? `"${instanceTitle}" iş akışındaki "${stepTitle}" adımı için süre uzatım talebin kabul edildi.`
    : `"${instanceTitle}" iş akışındaki "${stepTitle}" adımı onaylandı.`

  const notification: Notification = {
    id: uuidv4(),
    recipientEmployeeId: approval.requestedByEmployeeId,
    type: 'approval_approved',
    title,
    message,
    relatedEntityType: 'approval',
    relatedEntityId: approval.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  }
  await saveNotification(notification)
}

export async function createApprovalRejectedNotification(
  approval: WorkflowApproval,
  stepTitle: string,
  instanceTitle: string
): Promise<void> {
  const isExtension = approval.approvalType === 'deadline_extension'
  const title = isExtension ? 'Süre uzatım talebin reddedildi.' : 'Onay talebin reddedildi.'
  
  let displayNote = approval.note
  if (isExtension && approval.note) {
    try {
      if (approval.note.startsWith('{')) {
        const parsed = JSON.parse(approval.note)
        displayNote = parsed.reason
      }
    } catch (e) {}
  }

  const message = isExtension
    ? `"${instanceTitle}" iş akışındaki "${stepTitle}" adımı için süre uzatım talebin reddedildi.${
        displayNote ? ' Gerekçe: ' + displayNote : ''
      }`
    : `"${instanceTitle}" iş akışındaki "${stepTitle}" adımı için onay talebin reddedildi.${
        displayNote ? ' Gerekçe: ' + displayNote : ''
      }`

  const notification: Notification = {
    id: uuidv4(),
    recipientEmployeeId: approval.requestedByEmployeeId,
    type: 'approval_rejected',
    title,
    message,
    relatedEntityType: 'approval',
    relatedEntityId: approval.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  }
  await saveNotification(notification)
}

export async function createApprovalRevisionNotification(
  approval: WorkflowApproval,
  stepTitle: string,
  instanceTitle: string
): Promise<void> {
  const notification: Notification = {
    id: uuidv4(),
    recipientEmployeeId: approval.requestedByEmployeeId,
    type: 'approval_revision_requested',
    title: 'Revize istendi.',
    message: `"${instanceTitle}" iş akışındaki "${stepTitle}" adımı için revize istendi. Not: "${
      approval.revisionNote || ''
    }"`,
    relatedEntityType: 'approval',
    relatedEntityId: approval.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  }
  await saveNotification(notification)
}
