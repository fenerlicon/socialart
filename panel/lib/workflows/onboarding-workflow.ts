import { supabase } from '../supabase/client'
import type { Brand, WorkflowStepInstance } from '../../types/domain'

/**
 * Creates a special Onboarding Cycle and Onboarding Workflow Instance
 * with a first step "İç Marka Toplantısı" assigned to the strategy specialist.
 */
export async function createOnboardingWorkflowForBrand(brand: Brand): Promise<void> {
  const now = new Date().toISOString()
  const cycleId = `cycle-onboarding-${brand.id}`

  // 1. Create Onboarding Cycle (month=0, year=0 represents special onboarding cycle)
  const cycleRow = {
    id: cycleId,
    brand_id: brand.id,
    month: 0,
    year: 0,
    status: 'active',
    operation_plan: [],
    notes: 'Müşteri Onboarding ve Kurulum Dönemi',
    created_at: now,
  }

  const { error: cycleError } = await supabase
    .from('cycles')
    .upsert(cycleRow)

  if (cycleError) {
    console.error('Error creating onboarding cycle:', cycleError)
    throw cycleError
  }

  // 2. Create Workflow Instance for Onboarding
  const instanceId = `wf-onboarding-${brand.id}`
  const instanceRow = {
    id: instanceId,
    brand_id: brand.id,
    cycle_id: cycleId,
    operation_plan_item_id: 'onboarding-plan-item',
    operation_template_id: 'onboarding',
    workflow_template_id: 'onboarding-workflow',
    title: 'Yeni Müşteri Kurulumu & Toplantı Hazırlığı',
    status: 'in_progress',
    current_step_id: `step-onboarding-meeting-${brand.id}`,
    created_at: now,
    updated_at: now,
  }

  const { error: instError } = await supabase
    .from('workflow_instances')
    .upsert(instanceRow)

  if (instError) {
    console.error('Error creating onboarding workflow instance:', instError)
    throw instError
  }

  // 3. Resolve assignee for Strategy Specialist
  const employeesRes = await supabase.from('employees').select('*')
  const allEmployees = employeesRes.data || []
  const activeEmployees = allEmployees.filter((e: any) => e.employee_status === 'active')

  // Find assigned strategy specialist from brand assignments
  const assignments = brand.brandAssignments || []
  const strategyAssignment = assignments.find((a: any) => {
    const clean = a.responsibility.trim().toLowerCase()
    return clean.includes('strateji') || clean.includes('müşteri') || clean.includes('strategy')
  })

  let assigneeId = strategyAssignment?.employeeId

  // Fallback 1: Brand Operation Manager
  if (!assigneeId) {
    assigneeId = brand.operationManagerId
  }

  // Fallback 2: Any active strategy specialist
  if (!assigneeId) {
    const strategyEmps = activeEmployees.filter((e: any) => e.role_package_id === 'strateji-musteri-yonetimi')
    if (strategyEmps.length > 0) {
      assigneeId = strategyEmps[0].id
    } else {
      assigneeId = activeEmployees[0]?.id
    }
  }

  // 4. Create the first step: "İç Marka Toplantısı"
  const stepId = `step-onboarding-meeting-${brand.id}`
  const stepRow = {
    id: stepId,
    workflow_instance_id: instanceId,
    workflow_step_template_id: 'onboarding-step-1',
    title: 'İç Marka Toplantısı',
    description: 'Yeni müşteri için iç marka toplantısı organize edin ve toplantı tarihini belirleyin.',
    order: 1,
    status: 'active',
    requires_approval: false,
    is_final_step: false,
    responsibility_role: 'strategy',
    assigned_employee_id: assigneeId || null,
    assignee_employee_id: assigneeId || null,
    assigned_at: now,
  }

  const { error: stepError } = await supabase
    .from('workflow_step_instances')
    .upsert(stepRow)

  if (stepError) {
    console.error('Error creating onboarding first step:', stepError)
    throw stepError
  }
}

/**
 * Automatically creates or updates preparation tasks for all brand team members
 * when the "İç Marka Toplantısı" due date (meeting date) is set or changed.
 */
export async function handleOnboardingMeetingDateChange(step: WorkflowStepInstance): Promise<void> {
  const brandId = step.workflowInstanceId.replace('wf-onboarding-', '')
  const now = new Date().toISOString()

  // Get the brand with assignments
  const { data: brandRow, error: brandErr } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .maybeSingle()

  if (brandErr || !brandRow) {
    console.error('Error loading brand for onboarding prep tasks:', brandErr)
    return
  }

  const assignments = brandRow.brand_assignments || []

  for (const a of assignments) {
    const employeeId = a.employeeId

    // Parse role and specific prep task title
    const clean = a.responsibility.trim().toLowerCase()
    let role = 'operation'
    let title = 'Toplantıya Hazırlan'

    if (clean.includes('dijital') || clean.includes('pazarlama') || clean.includes('marketing')) {
      role = 'digital_marketing'
      title = 'Pazarlama - Reklam Stratejisi Üret'
    } else if (clean.includes('sosyal') || clean.includes('medya') || clean.includes('social')) {
      role = 'social_media'
      title = 'Sosyal Medya ve İçerik Stratejisi Üret'
    } else if (clean.includes('grafik') || clean.includes('tasarım') || clean.includes('design')) {
      role = 'graphic_design'
      title = 'Görsel Tasarım Konsepti Belirle'
    } else if (clean.includes('kurgu') || clean.includes('edit')) {
      role = 'video_editing'
      title = 'Video Kurgu Şablonları Hazırla'
    } else if (clean.includes('fotoğraf') || clean.includes('photo')) {
      role = 'photography'
      title = 'Fotoğraf Konsepti Planla'
    } else if (clean.includes('video üretimi') || clean.includes('videography')) {
      role = 'videography'
      title = 'Video Konsepti ve Ekipman Planla'
    } else if (clean.includes('strateji') || clean.includes('müşteri') || clean.includes('strategy')) {
      role = 'strategy'
      title = 'Toplantı Gündemi ve Brief Dosyasını Hazırla'
    }

    const prepStepId = `step-onboarding-prep-${employeeId}-${brandId}`

    if (step.dueDate) {
      // Upsert prep step
      const prepStepRow = {
        id: prepStepId,
        workflow_instance_id: step.workflowInstanceId,
        workflow_step_template_id: `onboarding-prep-${role}`,
        title: title,
        description: 'İç marka toplantısı için hazırlıklarınızı tamamlayın.',
        order: 2,
        status: 'active',
        requires_approval: false,
        is_final_step: false,
        responsibility_role: role,
        assigned_employee_id: employeeId,
        assignee_employee_id: employeeId,
        assigned_at: now,
        due_date: step.dueDate,
      }

      const { error: prepErr } = await supabase
        .from('workflow_step_instances')
        .upsert(prepStepRow)

      if (prepErr) {
        console.error(`Error saving prep step for employee ${employeeId}:`, prepErr)
      }
    } else {
      // Clear prep step due date
      const { error: prepUpdateErr } = await supabase
        .from('workflow_step_instances')
        .update({ due_date: null })
        .eq('id', prepStepId)

      if (prepUpdateErr) {
        console.error(`Error clearing prep step due date for employee ${employeeId}:`, prepUpdateErr)
      }
    }
  }
}
