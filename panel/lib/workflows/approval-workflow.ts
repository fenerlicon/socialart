import { v4 as uuidv4 } from 'uuid'
import type {
  WorkflowApproval,
  WorkflowStepInstance,
  WorkflowInstance,
  WorkflowHistory,
  ApprovalType,
} from '@/types/domain'
import {
  saveApproval,
  getStoredApprovals,
} from '@/lib/storage/local-approval-store'
import {
  getStoredWorkflowInstances,
  getWorkflowStepsByInstanceId,
  updateWorkflowInstance,
  updateWorkflowStepInstance,
  saveWorkflowHistory,
} from '@/lib/storage/local-workflow-instance-store'
import { getBrandById } from '@/lib/storage/local-brand-store'
import { getStoredEmployees } from '@/lib/storage/local-employee-store'
import { progressWorkflowStep } from '@/lib/workflows/progress-workflow'
import {
  createApprovalRequestedNotification,
  createApprovalApprovedNotification,
  createApprovalRejectedNotification,
  createApprovalRevisionNotification,
} from '@/lib/workflows/notification-helper'

/**
 * Bir adımı onaya gönderir.
 */
export async function requestApproval(params: {
  workflowInstanceId: string
  stepInstanceId: string
  requestedByEmployeeId: string
  note?: string
}): Promise<WorkflowApproval> {
  const { workflowInstanceId, stepInstanceId, requestedByEmployeeId, note } = params
  const now = new Date().toISOString()

  // 1. Validasyonlar
  const allSteps = await getWorkflowStepsByInstanceId(workflowInstanceId)
  const step = allSteps.find((s) => s.id === stepInstanceId)
  if (!step) {
    throw new Error(`İş adımı bulunamadı: ${stepInstanceId}`)
  }

  if (step.status !== 'active') {
    throw new Error('Sadece aktif durumdaki iş adımları onaya gönderilebilir!')
  }

  // Aynı step için yayında onay bekleyen talep var mı?
  const allApprovals = await getStoredApprovals()
  const existingPending = allApprovals.find(
    (a) => a.workflowStepInstanceId === stepInstanceId && a.status === 'pending'
  )
  if (existingPending) {
    throw new Error('Bu iş adımı için zaten onay bekleyen bir talep bulunuyor!')
  }

  const allInstances = await getStoredWorkflowInstances()
  const instance = allInstances.find((i) => i.id === workflowInstanceId)
  if (!instance) {
    throw new Error(`İş akışı örneği bulunamadı: ${workflowInstanceId}`)
  }

  // 2. Onay Tipi ve Onaylayacak Kişiyi Belirleme
  const titleLower = step.title.toLowerCase()
  const isClient = titleLower.includes('müşteri') || titleLower.includes('client')
  const approvalType: ApprovalType = isClient ? 'client' : 'internal'

  let approverEmployeeId: string | undefined = undefined

  if (approvalType === 'internal') {
    const brand = await getBrandById(instance.brandId)
    if (brand && brand.operationManagerId) {
      approverEmployeeId = brand.operationManagerId
    } else {
      // operation-management rol paketine sahip ilk çalışan
      const employees = await getStoredEmployees()
      const opManager = employees.find((e) => e.rolePackageId === 'operasyon-yonetimi')
      if (opManager) {
        approverEmployeeId = opManager.id
      }
    }
  }

  // 3. Onay Talebi (WorkflowApproval) Oluştur
  const approvalId = uuidv4()
  const approval: WorkflowApproval = {
    id: approvalId,
    workflowInstanceId,
    workflowStepInstanceId: stepInstanceId,
    requestedByEmployeeId,
    approverEmployeeId,
    approvalType,
    status: 'pending',
    note,
    createdAt: now,
  }

  await saveApproval(approval)

  // 4. Adımı güncelle
  step.status = 'waiting_approval'
  step.approvalId = approvalId
  step.approvalStatus = 'pending'
  step.submittedForApprovalAt = now
  await updateWorkflowStepInstance(step)

  // 5. İş akışını güncelle
  instance.status = 'waiting_approval'
  instance.updatedAt = now
  await updateWorkflowInstance(instance)

  // 6. Tarihçe logu oluştur
  const historyLog: WorkflowHistory = {
    id: uuidv4(),
    workflowInstanceId,
    workflowStepInstanceId: stepInstanceId,
    actorEmployeeId: requestedByEmployeeId,
    action: 'approval_requested',
    fromStatus: 'active',
    toStatus: 'waiting_approval',
    note: `Onay Talebi Gönderildi (${approvalType === 'client' ? 'Müşteri' : 'Ajans İçi'})${
      note ? ': ' + note : ''
    }`,
    createdAt: now,
  }
  await saveWorkflowHistory(historyLog)

  // 7. Bildirim Gönder
  await createApprovalRequestedNotification(approval, step.title, instance.title)

  return approval
}

/**
 * Onay talebini onaylar ve iş akışını bir sonraki adıma geçirir.
 */
export async function approveApproval(approvalId: string, approverEmployeeId: string): Promise<void> {
  const now = new Date().toISOString()

  // 1. Onay Talebini Getir
  const allApprovals = await getStoredApprovals()
  const approval = allApprovals.find((a) => a.id === approvalId)
  if (!approval) {
    throw new Error(`Onay talebi bulunamadı: ${approvalId}`)
  }

  if (approval.status !== 'pending') {
    throw new Error(`Talep onaylanamaz. Mevcut durum: ${approval.status}`)
  }

  // 2. Adımı ve İş Akışını Getir
  const allSteps = await getWorkflowStepsByInstanceId(approval.workflowInstanceId)
  const step = allSteps.find((s) => s.id === approval.workflowStepInstanceId)
  if (!step) {
    throw new Error(`Onay adımı bulunamadı: ${approval.workflowStepInstanceId}`)
  }

  const allInstances = await getStoredWorkflowInstances()
  const instance = allInstances.find((i) => i.id === approval.workflowInstanceId)
  if (!instance) {
    throw new Error(`İş akışı örneği bulunamadı: ${approval.workflowInstanceId}`)
  }

  if (approval.approvalType === 'deadline_extension') {
    approval.status = 'approved'
    approval.approvedAt = now
    approval.approverEmployeeId = approverEmployeeId
    await saveApproval(approval)

    let newDate = ''
    try {
      if (approval.note?.startsWith('{')) {
        const parsed = JSON.parse(approval.note)
        newDate = parsed.requestedDate
      }
    } catch (e) {}

    if (newDate) {
      step.dueDate = newDate
      await updateWorkflowStepInstance(step)
    }

    const historyLog: WorkflowHistory = {
      id: uuidv4(),
      workflowInstanceId: approval.workflowInstanceId,
      workflowStepInstanceId: step.id,
      actorEmployeeId: approverEmployeeId,
      action: 'deadline_extended' as any,
      fromStatus: step.status,
      toStatus: step.status,
      note: `Süre uzatım talebi onaylandı. Yeni teslim tarihi: ${newDate}`,
      createdAt: now,
    }
    await saveWorkflowHistory(historyLog)
    await createApprovalApprovedNotification(approval, step.title, instance.title)
    return
  }

  // 3. Onay kaydını güncelle
  approval.status = 'approved'
  approval.approvedAt = now
  approval.approverEmployeeId = approverEmployeeId // if empty
  await saveApproval(approval)

  // 4. Adımın durumunu geçici olarak active yapıp onay bilgisini set et
  step.status = 'active'
  step.approvalStatus = 'approved'
  await updateWorkflowStepInstance(step)

  // 4.5. İş akışını in_progress durumuna geri al (böylece progressWorkflowStep sonrası doğru durumda kalır)
  instance.status = 'in_progress'
  instance.updatedAt = now
  await updateWorkflowInstance(instance)

  // 5. Workflow runtime progress engine tetikle (Bu metot adımı tamamlayıp sonrakini active eder)
  await progressWorkflowStep({
    workflowInstanceId: approval.workflowInstanceId,
    stepInstanceId: step.id,
    action: 'complete',
    actorEmployeeId: approverEmployeeId,
  })

  // 6. Tarihçe logu yaz (Approval Approved)
  const historyLog: WorkflowHistory = {
    id: uuidv4(),
    workflowInstanceId: approval.workflowInstanceId,
    workflowStepInstanceId: step.id,
    actorEmployeeId: approverEmployeeId,
    action: 'approval_approved',
    fromStatus: 'waiting_approval',
    toStatus: 'completed',
    note: 'Talep onaylandı ve iş akışı ilerletildi.',
    createdAt: now,
  }
  await saveWorkflowHistory(historyLog)

  // 7. Talep edene bildirim gönder
  await createApprovalApprovedNotification(approval, step.title, instance.title)
}

/**
 * Onay talebine revize ister ve sorumluluğu talep edene geri aktarır.
 */
export async function requestRevision(
  approvalId: string,
  approverEmployeeId: string,
  revisionNote: string
): Promise<void> {
  if (!revisionNote) {
    throw new Error('Revize talebi için açıklama notu yazılması zorunludur!')
  }

  const now = new Date().toISOString()

  // 1. Onay Talebini Getir
  const allApprovals = await getStoredApprovals()
  const approval = allApprovals.find((a) => a.id === approvalId)
  if (!approval) {
    throw new Error(`Onay talebi bulunamadı: ${approvalId}`)
  }

  if (approval.status !== 'pending') {
    throw new Error(`Talep revize edilemez. Mevcut durum: ${approval.status}`)
  }

  // 2. Adımı ve İş Akışını Getir
  const allSteps = await getWorkflowStepsByInstanceId(approval.workflowInstanceId)
  const step = allSteps.find((s) => s.id === approval.workflowStepInstanceId)
  if (!step) {
    throw new Error(`Onay adımı bulunamadı: ${approval.workflowStepInstanceId}`)
  }

  const allInstances = await getStoredWorkflowInstances()
  const instance = allInstances.find((i) => i.id === approval.workflowInstanceId)
  if (!instance) {
    throw new Error(`İş akışı örneği bulunamadı: ${approval.workflowInstanceId}`)
  }

  // 3. Onay kaydını güncelle
  approval.status = 'revision_requested'
  approval.revisedAt = now
  approval.revisionNote = revisionNote
  approval.approverEmployeeId = approverEmployeeId
  await saveApproval(approval)

  // 4. Adımı tekrar active et ve atananı geri ata
  step.status = 'active'
  step.approvalStatus = 'revision_requested'
  step.assignedEmployeeId = approval.requestedByEmployeeId
  step.submittedForApprovalAt = undefined // teslim tarihi temizlenir
  await updateWorkflowStepInstance(step)

  // 5. İş akışını in_progress durumuna döndür
  instance.status = 'in_progress'
  instance.updatedAt = now
  await updateWorkflowInstance(instance)

  // 6. Tarihçe logu yaz (Approval Revision Requested)
  const historyLog: WorkflowHistory = {
    id: uuidv4(),
    workflowInstanceId: approval.workflowInstanceId,
    workflowStepInstanceId: step.id,
    actorEmployeeId: approverEmployeeId,
    action: 'approval_revision_requested',
    fromStatus: 'waiting_approval',
    toStatus: 'active',
    note: `Revize İstendi: ${revisionNote}`,
    createdAt: now,
  }
  await saveWorkflowHistory(historyLog)

  // 7. Talep edene bildirim gönder
  await createApprovalRevisionNotification(approval, step.title, instance.title)
}

/**
 * Onay talebini reddeder ve adımı tekrar aktif yapar.
 */
export async function rejectApproval(
  approvalId: string,
  approverEmployeeId: string,
  note?: string
): Promise<void> {
  const now = new Date().toISOString()

  // 1. Onay Talebini Getir
  const allApprovals = await getStoredApprovals()
  const approval = allApprovals.find((a) => a.id === approvalId)
  if (!approval) {
    throw new Error(`Onay talebi bulunamadı: ${approvalId}`)
  }

  if (approval.status !== 'pending') {
    throw new Error(`Talep reddedilemez. Mevcut durum: ${approval.status}`)
  }

  // 2. Adımı ve İş Akışını Getir
  const allSteps = await getWorkflowStepsByInstanceId(approval.workflowInstanceId)
  const step = allSteps.find((s) => s.id === approval.workflowStepInstanceId)
  if (!step) {
    throw new Error(`Onay adımı bulunamadı: ${approval.workflowStepInstanceId}`)
  }

  const allInstances = await getStoredWorkflowInstances()
  const instance = allInstances.find((i) => i.id === approval.workflowInstanceId)
  if (!instance) {
    throw new Error(`İş akışı örneği bulunamadı: ${approval.workflowInstanceId}`)
  }

  if (approval.approvalType === 'deadline_extension') {
    approval.status = 'rejected'
    approval.rejectedAt = now
    approval.note = note ? `${approval.note} | Red Gerekçesi: ${note}` : approval.note
    approval.approverEmployeeId = approverEmployeeId
    await saveApproval(approval)

    const historyLog: WorkflowHistory = {
      id: uuidv4(),
      workflowInstanceId: approval.workflowInstanceId,
      workflowStepInstanceId: step.id,
      actorEmployeeId: approverEmployeeId,
      action: 'deadline_extension_rejected' as any,
      fromStatus: step.status,
      toStatus: step.status,
      note: `Süre uzatım talebi reddedildi.${note ? ' Gerekçe: ' + note : ''}`,
      createdAt: now,
    }
    await saveWorkflowHistory(historyLog)
    await createApprovalRejectedNotification(approval, step.title, instance.title)
    return
  }

  // 3. Onay kaydını güncelle
  approval.status = 'rejected'
  approval.rejectedAt = now
  approval.note = note
  approval.approverEmployeeId = approverEmployeeId
  await saveApproval(approval)

  // 4. Adımı tekrar active et
  step.status = 'active'
  step.approvalStatus = 'rejected'
  step.assignedEmployeeId = approval.requestedByEmployeeId
  step.submittedForApprovalAt = undefined
  await updateWorkflowStepInstance(step)

  // 5. İş akışını in_progress durumuna döndür
  instance.status = 'in_progress'
  instance.updatedAt = now
  await updateWorkflowInstance(instance)

  // 6. Tarihçe logu yaz (Approval Rejected)
  const historyLog: WorkflowHistory = {
    id: uuidv4(),
    workflowInstanceId: approval.workflowInstanceId,
    workflowStepInstanceId: step.id,
    actorEmployeeId: approverEmployeeId,
    action: 'approval_rejected',
    fromStatus: 'waiting_approval',
    toStatus: 'active',
    note: `Onay Reddedildi${note ? ': ' + note : ''}`,
    createdAt: now,
  }
  await saveWorkflowHistory(historyLog)

  // 7. Talep edene bildirim gönder
  await createApprovalRejectedNotification(approval, step.title, instance.title)
}

/**
 * Süre uzatımı talebi (deadline extension) oluşturur.
 */
export async function requestDeadlineExtension(params: {
  workflowInstanceId: string
  stepInstanceId: string
  requestedByEmployeeId: string
  requestedDate: string
  reason: string
}): Promise<WorkflowApproval> {
  const { workflowInstanceId, stepInstanceId, requestedByEmployeeId, requestedDate, reason } = params
  const now = new Date().toISOString()

  // 1. Validasyonlar
  const allSteps = await getWorkflowStepsByInstanceId(workflowInstanceId)
  const step = allSteps.find((s) => s.id === stepInstanceId)
  if (!step) {
    throw new Error(`İş adımı bulunamadı: ${stepInstanceId}`)
  }

  // Aynı step için yayında bekleyen süre uzatım talebi var mı?
  const allApprovals = await getStoredApprovals()
  const existingPending = allApprovals.find(
    (a) => a.workflowStepInstanceId === stepInstanceId && a.approvalType === 'deadline_extension' && a.status === 'pending'
  )
  if (existingPending) {
    throw new Error('Bu iş adımı için zaten bekleyen bir süre uzatım talebi bulunuyor!')
  }

  const allInstances = await getStoredWorkflowInstances()
  const instance = allInstances.find((i) => i.id === workflowInstanceId)
  if (!instance) {
    throw new Error(`İş akışı örneği bulunamadı: ${workflowInstanceId}`)
  }

  // 2. Onaylayacak Kişiyi Belirleme
  let approverEmployeeId: string | undefined = undefined
  const brand = await getBrandById(instance.brandId)
  if (brand && brand.operationManagerId) {
    approverEmployeeId = brand.operationManagerId
  } else {
    const employees = await getStoredEmployees()
    const opManager = employees.find((e) => e.rolePackageId === 'operasyon-yonetimi')
    if (opManager) {
      approverEmployeeId = opManager.id
    }
  }

  // 3. Onay Talebi Oluştur
  const approvalId = uuidv4()
  const approval: WorkflowApproval = {
    id: approvalId,
    workflowInstanceId,
    workflowStepInstanceId: stepInstanceId,
    requestedByEmployeeId,
    approverEmployeeId,
    approvalType: 'deadline_extension',
    status: 'pending',
    note: JSON.stringify({ requestedDate, reason }),
    createdAt: now,
  }

  await saveApproval(approval)

  // 4. Tarihçe logu oluştur
  const historyLog: WorkflowHistory = {
    id: uuidv4(),
    workflowInstanceId,
    workflowStepInstanceId: stepInstanceId,
    actorEmployeeId: requestedByEmployeeId,
    action: 'deadline_extension_requested' as any,
    fromStatus: step.status,
    toStatus: step.status,
    note: `Süre uzatım talebi oluşturuldu. İstenen tarih: ${requestedDate}, Gerekçe: ${reason}`,
    createdAt: now,
  }
  await saveWorkflowHistory(historyLog)

  // 5. Bildirim Gönder
  await createApprovalRequestedNotification(approval, step.title, instance.title)

  return approval
}
