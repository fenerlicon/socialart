import type { PermissionKey } from '@/config/permissions'
import type { ModuleId } from '@/config/modules'

// ---------------------------------------------------------------------------
// Identifiers
// ---------------------------------------------------------------------------

export type RolePackageId =
  | 'operasyon-yonetimi'
  | 'strateji-musteri-yonetimi'
  | 'dijital-pazarlama'
  | 'sosyal-medya-yonetimi'
  | 'kreatif-yonetim'
  | 'kreatif-direktor'
  | 'grafik-tasarim'
  | 'video-kurgu'
  | 'fotograf-uretimi'
  | 'video-uretimi'
  | 'coso'
  | 'art-director'


export type TeamId =
  | 'merkezi-operasyon'
  | 'strateji-musteri'
  | 'dijital-pazarlama'
  | 'sosyal-medya'
  | 'kreatif-koordinasyon'
  | 'grafik-studyo'
  | 'post-produksiyon'
  | 'fotograf-studyo'
  | 'video-produksiyon'
  | 'crm-satis'

// ---------------------------------------------------------------------------
// Employee status (çalışan durumu)
// ---------------------------------------------------------------------------

export const EMPLOYEE_STATUSES = [
  'active',
  'inactive',
  'probation',
  'intern',
  'part_time',
  'freelance',
] as const

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number]

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Aktif',
  inactive: 'Pasif',
  probation: 'Deneme Süreci',
  intern: 'Stajyer',
  part_time: 'Part Time',
  freelance: 'Freelance',
}

// ---------------------------------------------------------------------------
// Work location status (çalışma konumu — günlük / anlık)
// ---------------------------------------------------------------------------

export const WORK_LOCATION_STATUSES = [
  'office',
  'remote',
  'field',
  'hybrid',
] as const

export type WorkLocationStatus = (typeof WORK_LOCATION_STATUSES)[number]

export const WORK_LOCATION_STATUS_LABELS: Record<WorkLocationStatus, string> = {
  office: 'Ofiste',
  remote: 'Evden Çalışıyor',
  field: 'Sahada',
  hybrid: 'Hibrit',
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

/** Kullanıcı bazında açık/kapalı override. Tanımsız = birleşik varsayılan geçerli. */
export type PermissionOverrideMap = Partial<Record<PermissionKey, boolean>>

// Gelecekteki marka bazlı scope desteği için taslak tipler:
// export type PermissionScopeType = 'all_brands' | 'assigned_brands' | 'selected_brands'
// export interface PermissionScope {
//   type: PermissionScopeType
//   brandIds?: string[] // Sadece type 'selected_brands' ise doldurulur
// }

export interface PermissionGrant {
  key: PermissionKey
  moduleId: ModuleId
  // scope?: PermissionScope // İleride marka bazlı kısıtlama için kullanılacak
}

// ---------------------------------------------------------------------------
// Role package (başlangıç yetki şablonu — unvan yetki açmaz)
// ---------------------------------------------------------------------------

export interface RolePackage {
  id: RolePackageId
  name: string
  description: string
  /** Paket seçildiğinde ön doldurulan varsayılan yetkiler */
  defaultPermissions: PermissionKey[]
}

// ---------------------------------------------------------------------------
// Team / sorumluluk alanı
// ---------------------------------------------------------------------------

export interface Team {
  id: TeamId
  name: string
  description: string
  /** Takıma dahil olunca eklenen yetkiler (rol paketi üzerine) */
  teamPermissions: PermissionKey[]
}

// ---------------------------------------------------------------------------
// Employee
// ---------------------------------------------------------------------------

export interface Employee {
  id: string
  db1EmployeeId?: string | null
  fullName: string
  email: string
  /** Unvan — yalnızca görünen isim; yetki veya modül etkilemez */
  title: string
  rolePackageId: RolePackageId
  teamIds: TeamId[]
  permissionOverrides: PermissionOverrideMap
  employeeStatus: EmployeeStatus
  workLocationStatus: WorkLocationStatus
  avatarUrl?: string
  hasAdvancedCalendarAccess?: boolean
  username?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeInput {
  fullName: string
  db1EmployeeId?: string | null
  email: string
  title: string
  rolePackageId: RolePackageId
  teamIds: TeamId[]
  permissionOverrides: PermissionOverrideMap
  employeeStatus: EmployeeStatus
  workLocationStatus: WorkLocationStatus
  avatarUrl?: string
  hasAdvancedCalendarAccess?: boolean
  username?: string
}

// ---------------------------------------------------------------------------
// Derived / computed
// ---------------------------------------------------------------------------

export type PermissionSource = 'role_package' | 'override' | 'team_suggestion'

export interface ResolvedPermission {
  key: PermissionKey
  moduleId: ModuleId
  granted: boolean
  sources: PermissionSource[]
}

export interface EffectivePermissions {
  permissions: ResolvedPermission[]
  grantedKeys: Set<PermissionKey>
}

// ---------------------------------------------------------------------------
// Brand & Operation Plan (Marka ve Operasyon Planı)
// ---------------------------------------------------------------------------

export type OperationPlanItemType =
  | 'content'
  | 'advertising'
  | 'shooting'
  | 'reporting'
  | 'analysis'
  | 'operation'
  | 'custom'

export const OPERATION_PLAN_ITEM_TYPE_LABELS: Record<
  OperationPlanItemType,
  string
> = {
  content: 'İçerik',
  advertising: 'Reklam',
  shooting: 'Çekim',
  reporting: 'Raporlama',
  analysis: 'Analiz',
  operation: 'Operasyon',
  custom: 'Özel',
}

export interface OperationPlanItem {
  id: string
  title: string
  type: OperationPlanItemType
  target: number
  completed: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  workflowTemplateId?: string
  operationTemplateId?: string
}

export const OPERATION_PLAN_ITEM_STATUS_LABELS: Record<
  OperationPlanItem['status'],
  string
> = {
  pending: 'Bekliyor',
  in_progress: 'Yapılıyor',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
}

export type BrandStatus = 'active' | 'inactive'

export const BRAND_STATUS_LABELS: Record<BrandStatus, string> = {
  active: 'Aktif',
  inactive: 'Pasif',
}

export interface BrandAssignment {
  id: string
  employeeId: string
  responsibility: string
  roleLabel: string
  permissions?: string[]
}

export interface Brand {
  id: string
  name: string
  instagram?: string
  website?: string
  contactPerson: string
  phone: string
  email?: string
  operationManagerId: string // Reference to Employee
  startDate: string
  status: BrandStatus
  selectedPackageId: 'eko' | 'business' | 'booster'
  operationPlan: OperationPlanItem[]
  brandAssignments?: BrandAssignment[]
  createdAt: string
  updatedAt: string
  templateVersion?: number
  templateUpdatedAt?: string
}

export interface CreateBrandInput {
  name: string
  instagram?: string
  website?: string
  contactPerson: string
  phone: string
  email?: string
  operationManagerId: string
  startDate: string
  status: BrandStatus
  selectedPackageId: 'eko' | 'business' | 'booster'
  operationPlan: OperationPlanItem[]
  brandAssignments?: BrandAssignment[]
  templateVersion?: number
  templateUpdatedAt?: string
}

// ---------------------------------------------------------------------------
// Workflow Engine (İş Akışı Motoru)
// ---------------------------------------------------------------------------

export interface WorkflowStep {
  id: string
  title: string
  description: string
  order: number
  requiresApproval: boolean
  isFinalStep: boolean
  approvalPurpose?: ApprovalPurpose
  creativeCount?: number | null
  defaultAssigneeRolePackageId?: string
  estimatedDuration?: number // in hours or days
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
}

export type OperationExecutionMode = 'per_quantity' | 'singleton'

export interface OperationTemplate {
  id: string
  title: string
  description: string
  workflowTemplateId: string
  executionMode: OperationExecutionMode
  defaultResponsibilityRole: ResponsibilityRole
  defaultRuleId?: string
  isContentOperation: boolean
  type?: OperationPlanItemType
}

// ---------------------------------------------------------------------------
// Operation Schedule Rules (Operasyon Planlama Kuralları)
// ---------------------------------------------------------------------------

export type RuleType = 'fixed_day' | 'relative_to_event' | 'monthly_week' | 'manual'

export type ReferenceEventType =
  | 'shooting_date'
  | 'publish_date'
  | 'report_date'
  | 'meeting_date'
  | 'campaign_start_date'
  | 'campaign_end_date'
  | 'custom'

export type WeekPosition = 'first' | 'second' | 'third' | 'fourth' | 'last'

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type ResponsibilityRole =
  | 'operation'
  | 'strategy'
  | 'digital_marketing'
  | 'social_media'
  | 'creative_management'
  | 'creative_director'
  | 'graphic_design'
  | 'video_editing'
  | 'photography'
  | 'videography'
  | 'reporting'
  | 'custom'

export const CREATIVE_PRODUCTION_RESPONSIBILITIES: readonly ResponsibilityRole[] = [
  'graphic_design',
  'video_editing',
  'photography',
  'videography',
] as const

export function isCreativeProductionResponsibility(role?: ResponsibilityRole | string): boolean {
  return typeof role === 'string' && (CREATIVE_PRODUCTION_RESPONSIBILITIES as readonly string[]).includes(role)
}

export interface OperationScheduleRule {
  id: string
  title: string
  description: string
  ruleType: RuleType
  referenceEventType?: ReferenceEventType
  offsetDays?: number
  dayOfMonth?: number
  weekPosition?: WeekPosition
  weekday?: Weekday
  responsibilityRole: ResponsibilityRole
  packageId?: 'eko' | 'business' | 'booster'
}

// ---------------------------------------------------------------------------
// Brand Operation Cycle (Aylık Operasyon Dönemi)
// ---------------------------------------------------------------------------

export type OperationCycleStatus = 'planning' | 'active' | 'completed' | 'archived' | 'cancelled'

export interface BrandOperationCycle {
  id: string
  brandId: string
  month: number // 1-12
  year: number
  status: OperationCycleStatus
  operationPlan: OperationPlanItem[]
  notes?: string
  createdAt: string
  generatedAt?: string
  isCustomized?: boolean
  templateVersion?: number
  templateUpdatedAt?: string
}

// ---------------------------------------------------------------------------
// Workflow Instance (İş Akışı Örnekleri)
// ---------------------------------------------------------------------------

export type WorkflowInstanceStatus =
  | 'pending'
  | 'in_progress'
  | 'waiting_approval'
  | 'completed'
  | 'cancelled'

export interface WorkflowInstance {
  id: string
  brandId: string
  cycleId: string
  operationPlanItemId: string
  operationTemplateId: string
  workflowTemplateId: string
  title: string
  sequenceNumber?: number
  status: WorkflowInstanceStatus
  currentStepId: string
  /** Singleton sayaçlı görevler için: şimdiye kadar tamamlanan adet */
  progressCount?: number
  /** Singleton sayaçlı görevler için: hedef toplam adet (operationPlan.target'ten gelir) */
  targetCount?: number
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export type WorkflowStepInstanceStatus =
  | 'pending'
  | 'active'
  | 'waiting_approval'
  | 'completed'
  | 'skipped'
  | 'cancelled'
  | 'failed'

export interface WorkflowStepInstance {
  id: string
  workflowInstanceId: string
  workflowStepTemplateId: string
  title: string
  description: string
  order: number
  status: WorkflowStepInstanceStatus
  requiresApproval: boolean
  isFinalStep: boolean
  approvalPurpose?: ApprovalPurpose
  creativeCount?: number | null
  assigneeEmployeeId?: string
  assignedEmployeeId?: string
  responsibilityRole?: ResponsibilityRole
  startedAt?: string
  completedAt?: string
  assignedAt?: string
  dueDate?: string
  handoffStatus?: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  handoffId?: string
  previousAssigneeEmployeeId?: string
  approvalId?: string
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'revision_requested' | 'cancelled'
  submittedForApprovalAt?: string
  reviewerEmployeeId?: string
  supportEmployeeIds?: string[]
  failureReason?: string
  failureExplanationAt?: string
}

// ---------------------------------------------------------------------------
// Workflow History (Aktivite Geçmişi / Audit Log)
// ---------------------------------------------------------------------------

export interface WorkflowHistory {
  id: string
  workflowInstanceId: string
  workflowStepInstanceId: string
  actorEmployeeId?: string
  action: string // complete, cancel, skip, activate, start, handoff_requested, handoff_accepted, handoff_rejected vb.
  fromStatus: string
  toStatus: string
  note?: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// Workflow Handoff (Paslama / Devretme Sistemi)
// ---------------------------------------------------------------------------

export interface WorkflowHandoff {
  id: string
  workflowInstanceId: string
  workflowStepInstanceId: string
  fromEmployeeId: string
  toEmployeeId: string
  reason: string // Yoğunluk, Uzmanlık gerektiriyor vb.
  note?: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  createdAt: string
  acceptedAt?: string
  rejectedAt?: string
  responseNote?: string
}

// ---------------------------------------------------------------------------
// Notification Center (Bildirim Merkezi)
// ---------------------------------------------------------------------------

export type NotificationType =
  | 'workflow_assigned'
  | 'step_activated'
  | 'handoff_requested'
  | 'handoff_accepted'
  | 'handoff_rejected'
  | 'workflow_completed'
  | 'operation_completed'
  | 'cycle_completed'
  | 'approval_required'
  | 'approval_requested'
  | 'approval_approved'
  | 'approval_rejected'
  | 'approval_revision_requested'
  | 'calendar_event'
  | 'payment_request'
  | 'gpt_assigned_task'
  | 'personal_todo'
  | 'system'

export type RelatedEntityType =
  | 'workflow_instance'
  | 'workflow_step_instance'
  | 'handoff'
  | 'brand'
  | 'operation_cycle'
  | 'operation_plan_item'
  | 'approval'
  | 'calendar'
  | 'payment'
  | 'task'
  | 'todo'
  | 'system'

export interface Notification {
  id: string
  recipientEmployeeId: string
  type: NotificationType
  title: string
  message: string
  relatedEntityType: RelatedEntityType
  relatedEntityId: string
  isRead: boolean
  createdAt: string
  readAt?: string
}

// ---------------------------------------------------------------------------
// Workflow Approval (Onay Sistemi)
// ---------------------------------------------------------------------------

export type ApprovalType = 'internal' | 'client' | 'deadline_extension'

export type ApprovalPurpose = 'general' | 'intermediate' | 'final_creative' | 'client'

export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'revision_requested'
  | 'cancelled'

export interface WorkflowApproval {
  id: string
  workflowInstanceId: string
  workflowStepInstanceId: string
  requestedByEmployeeId: string
  approverEmployeeId?: string
  approvalType: ApprovalType
  approvalPurpose: ApprovalPurpose
  status: ApprovalStatus
  note?: string
  revisionNote?: string
  createdAt: string
  approvedAt?: string
  rejectedAt?: string
  revisedAt?: string
}

// ---------------------------------------------------------------------------
// Calendar Event (Takvim Etkinlikleri)
// ---------------------------------------------------------------------------

export type CalendarEventType =
  | 'meeting'
  | 'shoot'
  | 'publish'
  | 'deadline'
  | 'campaign'
  | 'leave'
  | 'holiday'
  | 'operation_cycle'

export interface CalendarEvent {
  id: string
  title: string
  type: CalendarEventType
  brandId?: string
  employeeId?: string
  startsAt?: string
  endsAt?: string
  location?: string
  status: 'pending' | 'completed' | 'cancelled'
  date?: string // Local store compatibility (YYYY-MM-DD)
  time?: string // Local store compatibility (HH:MM)
}

// ---------------------------------------------------------------------------
// Idea (Fikir Merkezi)
// ---------------------------------------------------------------------------

export interface Idea {
  id: string
  title: string
  description: string
  category: string
  brandId: string
  creatorId: string
  votes: number
  votedEmployeeIds: string[]
  status: 'pending' | 'converted' | 'archived'
  impact: 'high' | 'medium' | 'low'
  createdAt: string
}

// ---------------------------------------------------------------------------
// Report (Raporlar)
// ---------------------------------------------------------------------------

export interface Report {
  id: string
  employeeId: string
  title: string
  type: 'daily' | 'weekly' | 'monthly'
  content: string
  links?: string[]
  files?: string[]
  status: 'submitted' | 'missing' | 'approved'
  date: string // YYYY-MM-DD
  createdAt: string
}

// ---------------------------------------------------------------------------
// KPI — Agency Performance Engine
// ---------------------------------------------------------------------------

/**
 * Ham otomatik metrikler — sistemdeki gerçek davranışlardan otomatik hesaplanır.
 * KpiCard içinde şeffaflık amacıyla saklanır; yönetici neyin neden o puanı aldığını görebilir.
 */
export interface KpiMetrics {
  // Görev Tamamlama
  totalStepsCompleted: number
  stepsOnTime: number
  stepsLate: number
  avgCompletionHours: number
  // Kalite
  firstTimeApprovalCount: number
  totalApprovalCount: number
  revisionCount: number
  // Handoff
  handoffsSent: number
  handoffsReceived: number
  // Fikir Merkezi
  ideasSubmitted: number
  ideasConverted: number
  // Raporlama
  reportsSubmitted: number
  reportsMissing: number
  // Hesaplanan Oranlar (0–100)
  onTimeRate: number
  firstApprovalRate: number
  handoffRate: number
  reportComplianceRate: number
}

/**
 * Yöneticinin Quarterly Review döneminde el ile doldurduğu subjektif değerlendirme.
 * Otomatik skorun tamamlayıcısıdır; sayısallaştırılamayan boyutları kapsar.
 */
export interface ManagerReview {
  reviewerEmployeeId: string
  strengths: string[]
  growthAreas: string[]
  managerNote: string
  goals: string[]
  bonusEligible: boolean
  promotionFlag: boolean
  reviewedAt: string
}

export interface KpiDeductionLog {
  id: string
  category: 'calendar' | 'story' | 'delivery' | 'discipline' | 'ideas' | 'manual'
  title: string
  points: number // e.g. -10, +5
  description: string
  source: 'auto' | 'manual'
  applied: boolean
}

/**
 * Bir çalışanın belirli bir dönemine ait (aylık veya quarterly) Performans Karnesi.
 * Otomatik skorlar + yönetici skorları + ham metrikler bir arada tutulur.
 */
export interface KpiCard {
  id: string
  employeeId: string
  period: 'monthly' | 'quarterly'
  year: number
  month?: number        // 1–12, period=monthly ise dolu
  quarter?: 1 | 2 | 3 | 4  // period=quarterly ise dolu

  // Otomatik hesaplanan skor boyutları (0–100)
  disciplineScore: number    // Zamanlama, gecikme, raporlama düzeni
  qualityScore: number       // İlk seferde onay, revize sayısı
  operationScore: number     // Görev hacmi (ajans ortalamasına normalize)
  contributionScore: number  // Fikir üretimi, onaylanan idea

  // Yönetici tarafından el ile girilen boyutlar (0–100)
  communicationScore?: number
  teamworkScore?: number
  initiativeScore?: number
  problemSolvingScore?: number
  creativityScore?: number

  // Ağırlıklı genel skor (otomatik + yönetici)
  overallScore: number

  // Ham metrikler (şeffaflık için)
  metrics: KpiMetrics

  // Quarterly değerlendirme (period=quarterly ise dolu olabilir)
  managerReview?: ManagerReview

  status: 'draft' | 'published'
  generatedAt: string
  publishedAt?: string
  deductions?: KpiDeductionLog[]
}

/**
 * Tüm çalışan KPI ortalamasından türetilen, Dashboard'da gösterilen Ajans Skoru anlık görüntüsü.
 */
export interface AgencyScoreSnapshot {
  id: string
  month: number
  year: number
  overallScore: number          // 0–100
  label: string                 // "Mükemmel Operasyon" | "Sağlıklı" | "Gelişim Gerekiyor" | "Kritik"
  highlights: string[]          // ["+ Teslimler iyi", "+ KPI yüksek"]
  warnings: string[]            // ["- Revizeler arttı"]
  employeeCount: number
  generatedAt: string
}

export interface BrandDriveLinks {
  brandId: string
  googleDrive?: string
  photosDrive?: string
  briefsDrive?: string
  assetsDrive?: string
  customLinks?: { label: string; url: string }[]
}

