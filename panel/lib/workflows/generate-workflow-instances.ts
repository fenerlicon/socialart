import { v4 as uuidv4 } from 'uuid'
import type {
  BrandOperationCycle,
  OperationTemplate,
  WorkflowTemplate,
  WorkflowInstance,
  WorkflowStepInstance,
  ResponsibilityRole,
  RolePackageId,
} from '@/types/domain'
import { getBrandById } from '@/lib/storage/local-brand-store'
import { getStoredEmployees } from '@/lib/storage/local-employee-store'
import { getStoredWorkflowSteps } from '@/lib/storage/local-workflow-instance-store'
import { getCyclesByBrandId } from '@/lib/storage/local-cycle-store'

/**
 * RolePackageId → ResponsibilityRole eşlemesi.
 */
function mapRolePackageToResponsibility(rolePackageId?: string): ResponsibilityRole {
  if (!rolePackageId) return 'operation'

  const mapping: Record<string, ResponsibilityRole> = {
    'operasyon-yonetimi': 'operation',
    'strateji-musteri-yonetimi': 'strategy',
    'dijital-pazarlama': 'digital_marketing',
    'sosyal-medya-yonetimi': 'social_media',
    'kreatif-yonetim': 'creative_management',
    'kreatif-direktor': 'creative_director',
    'grafik-tasarim': 'graphic_design',
    'video-kurgu': 'video_editing',
    'fotograf-uretimi': 'photography',
    'video-uretimi': 'videography',
  }

  return mapping[rolePackageId] || 'operation'
}

/**
 * ResponsibilityRole → RolePackageId[] ters eşlemesi.
 * Bir role birden fazla paket karşılık gelebilir.
 */
function getRolePackagesForResponsibility(role: ResponsibilityRole): RolePackageId[] {
  const mapping: Record<ResponsibilityRole, RolePackageId[]> = {
    operation:            ['operasyon-yonetimi'],
    strategy:             ['strateji-musteri-yonetimi'],
    digital_marketing:    ['dijital-pazarlama'],
    social_media:         ['sosyal-medya-yonetimi'],
    creative_management:  ['kreatif-yonetim'],
    creative_director:    ['kreatif-direktor', 'kreatif-yonetim'],
    graphic_design:       ['grafik-tasarim'],
    video_editing:        ['video-kurgu'],
    photography:          ['fotograf-uretimi'],
    videography:          ['video-uretimi'],
    reporting:            ['strateji-musteri-yonetimi', 'operasyon-yonetimi'],
    custom:               ['operasyon-yonetimi'],
  }
  return mapping[role] ?? ['operasyon-yonetimi']
}

function matchAssignmentToRole(responsibility: string): ResponsibilityRole {
  const clean = responsibility.trim().toLowerCase()
  if (clean.includes('operasyon')) return 'operation'
  if (clean.includes('direktör') || clean.includes('director')) return 'creative_director'
  if (clean.includes('dijital') || clean.includes('pazarlama') || clean.includes('marketing')) return 'digital_marketing'
  if (clean.includes('sosyal') || clean.includes('medya') || clean.includes('social')) return 'social_media'
  if (clean.includes('kreatif') || clean.includes('creative')) return 'creative_management'
  if (clean.includes('grafik') || clean.includes('tasarım') || clean.includes('design')) return 'graphic_design'
  if (clean.includes('kurgu') || clean.includes('edit')) return 'video_editing'
  if (clean.includes('fotoğraf') || clean.includes('photo')) return 'photography'
  if (clean.includes('video üretimi') || clean.includes('videography')) return 'videography'
  if (clean.includes('strateji') || clean.includes('müşteri') || clean.includes('strategy')) return 'strategy'
  return 'operation'
}

interface GenerateResult {
  instances: WorkflowInstance[]
  steps: WorkflowStepInstance[]
}

/**
 * Bir aylık operasyon döneminin plan kalemlerinden iş akışı örnekleri (WorkflowInstance)
 * ve bunların bağlı adımlarını (WorkflowStepInstance) üretir.
 *
 * Atama öncelik sırası:
 *   1. Markaya atanmış ve rolü eşleşen çalışan
 *   2. Sistemdeki tüm çalışanlar arasında rolü eşleşen, aktif adım sayısı en az olan
 */
export async function generateWorkflowInstancesForCycle(params: {
  cycle: BrandOperationCycle
  operationTemplates: OperationTemplate[]
  workflowTemplates: WorkflowTemplate[]
}): Promise<GenerateResult> {
  const { cycle, operationTemplates, workflowTemplates } = params

  const instances: WorkflowInstance[] = []
  const steps: WorkflowStepInstance[] = []
  const now = new Date().toISOString()

  // Marka ekibini oku (birincil atama motoru)
  const brand = await getBrandById(cycle.brandId)
  const assignments = brand?.brandAssignments || []

  // Markanın tüm dönemlerini çekip sıralayarak bu dönemin ilk dönem olup olmadığını (marka yeni mi) bulalım
  const brandCycles = await getCyclesByBrandId(cycle.brandId)
  brandCycles.sort((a, b) => a.year - b.year || a.month - b.month)
  const isBrandNew = brandCycles.length <= 1 || brandCycles[0].id === cycle.id

  // Fallback için: tüm aktif çalışanlar + mevcut iş yükleri
  const allEmployees = (await getStoredEmployees()).filter((e) => e.employeeStatus === 'active')
  const existingSteps = await getStoredWorkflowSteps()

  // Her çalışanın mevcut aktif adım sayısını hesapla (iş yükü)
  const workloadMap = new Map<string, number>()
  for (const emp of allEmployees) {
    const activeCount = existingSteps.filter(
      (s) => s.assignedEmployeeId === emp.id && s.status === 'active'
    ).length
    workloadMap.set(emp.id, activeCount)
  }

  /**
   * Bir adım içinde üretilen yeni step'leri de iş yüküne sayar,
   * böylece aynı döngü içinde üretilen adımlar dengeli dağılır.
   */
  function getLeastLoadedEmployeeForRole(role: ResponsibilityRole): string | undefined {
    const targetPackages = getRolePackagesForResponsibility(role)
    const candidates = allEmployees.filter((e) =>
      targetPackages.includes(e.rolePackageId as RolePackageId)
    )
    if (candidates.length === 0) return undefined

    // En az iş yükü olanı seç
    candidates.sort((a, b) => (workloadMap.get(a.id) ?? 0) - (workloadMap.get(b.id) ?? 0))
    return candidates[0].id
  }

  for (const planItem of cycle.operationPlan) {
    const titleLower = planItem.title.toLowerCase()
    let template

    // Başlıkta "rapor" veya "sunum" geçiyorsa doğrudan rapor/sunum şablonuna bağla (tip yanlış seçilse bile)
    if (titleLower.includes('rapor') || planItem.type === 'reporting') {
      template = operationTemplates.find((t) => t.id === 'monthly_report')
    } else if (titleLower.includes('sunum') || titleLower.includes('takvim')) {
      template = operationTemplates.find((t) => t.id === 'content_presentation')
    } else {
      // Normal eşleştirme
      template = operationTemplates.find((t) => t.id === planItem.operationTemplateId)
      if (!template) {
        template = operationTemplates.find(
          (t) => t.title.toLowerCase() === planItem.title.toLowerCase()
        )
      }
      // Diğer akıllı eşleşme fallback'leri
      if (!template) {
        if (titleLower.includes('reels') || titleLower.includes('reel')) {
          template = operationTemplates.find((t) => t.id === 'reel')
        } else if (titleLower.includes('story') || titleLower.includes('hikaye')) {
          template = operationTemplates.find((t) => t.id === 'story')
        } else if (titleLower.includes('post') || titleLower.includes('gönderi')) {
          template = operationTemplates.find((t) => t.id === 'post')
        } else if (titleLower.includes('reklam') || planItem.type === 'advertising') {
          template = operationTemplates.find((t) => t.id === 'meta_reklam')
        }
      }
    }

    if (!template) {
      console.warn(`Operasyon şablonu bulunamadı: ${planItem.title}. Geçiliyor...`)
      continue
    }

    // Sunum ve Raporlama sadece Meta Reklamı varsa geçerlidir
    if (template.id === 'monthly_report' || template.id === 'content_presentation') {
      const hasMetaAdvertising = cycle.operationPlan.some(item => {
        const itemTitle = item.title.toLowerCase()
        return item.type === 'advertising' || itemTitle.includes('meta') || itemTitle.includes('reklam')
      })
      if (!hasMetaAdvertising) {
        console.log(`[Generate] ${cycle.brandId} için Meta Reklamı bulunmadığından Sunum/Raporlama iş akışı atlandı.`)
        continue
      }
    }

    // 2. İlgili iş akışı şablonunu bul
    const workflowTemplate = workflowTemplates.find(
      (w) => w.id === (template?.workflowTemplateId || planItem.workflowTemplateId)
    )
    if (!workflowTemplate || !workflowTemplate.steps || workflowTemplate.steps.length === 0) {
      console.warn(`İş akışı şablonu bulunamadı: ${planItem.title}. Geçiliyor...`)
      continue
    }

    const executionMode = template.executionMode
    const targetCount = planItem.target || 1
    const countToGenerate = executionMode === 'per_quantity' ? targetCount : 1

    for (let i = 1; i <= countToGenerate; i++) {
      const instanceId = uuidv4()
      const title = executionMode === 'per_quantity' ? `${planItem.title} ${i}` : planItem.title
      const sequenceNumber = executionMode === 'per_quantity' ? i : undefined

      const sortedSteps = [...workflowTemplate.steps]
        .filter((s) => {
          // Sistem genelinde "İlk ay kurulum/onboarding" adımlarını sonraki aylarda otomatik atla
          const onboardingStepIds = ['meta-panel-setup', 'meta-pixel-check', 'google-setup']
          if (onboardingStepIds.includes(s.id) && !isBrandNew) {
            return false
          }
          return true
        })
        .sort((a, b) => a.order - b.order)

      const stepInstances: WorkflowStepInstance[] = sortedSteps.map((step, idx) => {
        const defaultRole = mapRolePackageToResponsibility(step.defaultAssigneeRolePackageId)
        const resolvedRole: ResponsibilityRole = defaultRole || template?.defaultResponsibilityRole || 'operation'

        // --- Birincil atama: marka ekibinde eşleşen var mı? ---
        const brandMatch = assignments.find(
          (a) => matchAssignmentToRole(a.responsibility) === resolvedRole
        )

        let assigneeId: string | undefined = brandMatch?.employeeId

        // --- Fallback: sistemdeki en müsait kişi ---
        if (!assigneeId) {
          assigneeId = getLeastLoadedEmployeeForRole(resolvedRole)
        }

        // --- Yeni İstek Fallback'i: Çekim (photography/videography) ve Kurgu (video_editing) için Kreatif Direktör ---
        if (!assigneeId && (resolvedRole === 'photography' || resolvedRole === 'videography' || resolvedRole === 'video_editing')) {
          const cdBrandMatch = assignments.find(
            (a) => matchAssignmentToRole(a.responsibility) === 'creative_director'
          )
          assigneeId = cdBrandMatch?.employeeId || getLeastLoadedEmployeeForRole('creative_director')
        }

        // Atama yapıldıysa iş yükü sayacını güncelle (döngü içi denge için)
        if (assigneeId) {
          workloadMap.set(assigneeId, (workloadMap.get(assigneeId) ?? 0) + 1)
        }

        const assignedAt = assigneeId ? now : undefined

        let dueDate: string
        const isReportOrPresentation = template.id === 'monthly_report' || template.id === 'content_presentation'
        
        if (isReportOrPresentation) {
          // Next month's 1st for initial steps, 3rd for final delivery step
          const nextMonth1st = new Date(cycle.year, cycle.month, 1, 18, 0, 0)
          const nextMonth3rd = new Date(cycle.year, cycle.month, 3, 18, 0, 0)
          dueDate = step.isFinalStep ? nextMonth3rd.toISOString() : nextMonth1st.toISOString()
        } else {
          // Default sequential deadline: order * 3 days from now
          const dayOffset = (idx + 1) * 3
          dueDate = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000).toISOString()
        }

        return {
          id: uuidv4(),
          workflowInstanceId: instanceId,
          workflowStepTemplateId: step.id,
          title: step.title,
          description: step.description,
          order: idx + 1, // Sıralamayı dinamik olarak yeniden indeksle
          status: idx === 0 ? 'active' : 'pending',
          requiresApproval: step.requiresApproval,
          isFinalStep: step.isFinalStep,
          approvalPurpose: step.approvalPurpose || 'general',
          responsibilityRole: resolvedRole,
          assigneeEmployeeId: assigneeId,
          assignedEmployeeId: assigneeId,
          assignedAt,
          dueDate,
        }
      })

      steps.push(...stepInstances)

      const firstStepId = stepInstances[0]?.id || ''

      const newInstance: WorkflowInstance = {
        id: instanceId,
        brandId: cycle.brandId,
        cycleId: cycle.id,
        operationPlanItemId: planItem.id,
        operationTemplateId: template.id,
        workflowTemplateId: workflowTemplate.id,
        title,
        sequenceNumber,
        status: 'in_progress',
        currentStepId: firstStepId,
        // Singleton sayaçlı görevler için (örn. Story)
        ...(executionMode === 'singleton' && planItem.target > 1
          ? { progressCount: 0, targetCount: planItem.target }
          : {}),
        createdAt: now,
        updatedAt: now,
      }

      instances.push(newInstance)
    }
  }

  return { instances, steps }
}
