import { getSecondaryAdminSupabase, getAdminSupabase } from './admin-db.js';
import { requireAdminSession } from './auth-me.js';
import { validateOrigin } from './admin-auth.js';
import { resolveServerPermissions } from './admin-permissions.js';

const ALLOWED_MANAGER_ROLES = new Set([
  'art-director',
  'kreatif-yonetim',
  'kreatif-direktor',
  'operasyon-yonetimi',
  'ajans-yonetimi',
  'admin',
]);

/**
 * Resolves Date Range for filtering
 */
export function resolveServerDateRange(filter = {}) {
  const now = new Date();
  const preset = filter.preset || 'this_month';

  switch (preset) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { fromIso: start.toISOString(), toIso: end.toISOString() };
    }
    case 'this_week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return { fromIso: monday.toISOString(), toIso: sunday.toISOString() };
    }
    case 'this_month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { fromIso: firstDay.toISOString(), toIso: lastDay.toISOString() };
    }
    case 'prev_month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { fromIso: firstDay.toISOString(), toIso: lastDay.toISOString() };
    }
    case 'all_time': {
      return { fromIso: null, toIso: null };
    }
    case 'custom':
    default: {
      let fromIso = null;
      let toIso = null;

      if (filter.startDate) {
        const timePart = filter.startTime ? filter.startTime : '00:00:00';
        const d = new Date(`${filter.startDate}T${timePart}`);
        if (!isNaN(d.getTime())) fromIso = d.toISOString();
      }

      if (filter.endDate) {
        const timePart = filter.endTime
          ? filter.endTime.length === 5
            ? `${filter.endTime}:59`
            : filter.endTime
          : '23:59:59';
        const d = new Date(`${filter.endDate}T${timePart}`);
        if (!isNaN(d.getTime())) toIso = d.toISOString();
      }

      return { fromIso, toIso };
    }
  }
}

/**
 * Server-Authoritative Handler for Creative Production Ledger & Reporting
 */
export default async function creativeProductionHandler(req, res) {
  // 1. Authenticate Current Session
  const authState = await requireAdminSession(req, { allowMustChangePassword: false });
  if (!authState) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  const rawUrl = req.url || '';
  let action = null;
  try {
    const parsedUrl = new URL(rawUrl, `http://${req.headers?.host || 'localhost'}`);
    action = parsedUrl.searchParams.get('action');
  } catch (e) {}

  if (!action && req.query?.action) {
    action = req.query.action;
  }
  if (!action && req.body?.action) {
    action = req.body.action;
  }

  const db2 = getSecondaryAdminSupabase();

  // --------------------------------------------------------------------------
  // ACTION: RECORD-CREDIT (Server-Authoritative Ledger Creation)
  // --------------------------------------------------------------------------
  if (action === 'record-credit') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!validateOrigin(req)) {
      return res.status(403).json({ error: 'Forbidden Origin' });
    }

    // Authorization: Graphic Designer CANNOT forge credit
    const isDedicatedAdmin = authState.principalType === 'admin' || authState.isAdmin;
    const callerRole = authState.employee?.role_package_id;
    const isManager = isDedicatedAdmin || (callerRole && ALLOWED_MANAGER_ROLES.has(callerRole));

    if (!isManager) {
      return res.status(403).json({
        error: 'FORBIDDEN: Only Art Directors and authorized managers can finalize creative credits.',
      });
    }

    const { approvalId } = req.body || {};
    if (!approvalId || typeof approvalId !== 'string') {
      return res.status(400).json({ error: 'approvalId is required' });
    }

    // 1. Fetch canonical approval from DB2
    const { data: approval, error: appErr } = await db2
      .from('workflow_approvals')
      .select('*')
      .eq('id', approvalId.trim())
      .maybeSingle();

    if (appErr || !approval) {
      return res.status(404).json({ error: 'Workflow approval not found' });
    }

    if (approval.approval_purpose !== 'final_creative') {
      return res.status(400).json({ error: 'Approval purpose must be final_creative' });
    }

    if (approval.status !== 'approved') {
      return res.status(400).json({ error: 'Approval must be in approved status' });
    }

    // 2. Fetch canonical step from DB2
    const { data: step, error: stepErr } = await db2
      .from('workflow_step_instances')
      .select('*')
      .eq('id', approval.workflow_step_instance_id)
      .maybeSingle();

    if (stepErr || !step) {
      return res.status(404).json({ error: 'Workflow step not found' });
    }

    const isCreativeRole =
      step.responsibility_role === 'graphic_design' ||
      step.responsibility_role === 'video_editing' ||
      step.responsibility_role === 'video_kurgu';

    if (!isCreativeRole) {
      return res.status(400).json({ error: 'Step responsibility is not creative production' });
    }

    // 3. Fetch workflow instance for brand/title context
    const { data: instance } = await db2
      .from('workflow_instances')
      .select('*')
      .eq('id', approval.workflow_instance_id)
      .maybeSingle();

    const isGeneral =
      !instance ||
      instance.id === 'inst-general-agency-tasks' ||
      instance.brand_id === 'general' ||
      instance.brand_id === 'general-agency' ||
      instance.brand_id === 'general-brand' ||
      !instance.brand_id ||
      (instance.title && instance.title.includes('Genel Ajans'));

    const brandId = isGeneral ? null : instance.brand_id || null;
    const designerId = step.assigned_employee_id || approval.requested_by_employee_id;
    const count =
      step.creative_count !== undefined && step.creative_count !== null && step.creative_count >= 1
        ? Math.floor(step.creative_count)
        : 1;

    const creditedAt = approval.approved_at || approval.created_at || new Date().toISOString();
    const reviewerId = authState.employee?.id || approval.approver_employee_id;

    // 4. Idempotent Upsert into creative_production_credits
    const creditRow = {
      workflow_step_instance_id: step.id,
      workflow_instance_id: instance?.id || approval.workflow_instance_id,
      final_approval_id: approval.id,
      designer_employee_id: designerId,
      brand_id: brandId,
      creative_count: count,
      credited_at: creditedAt,
      created_at: new Date().toISOString(),
      task_title: step.title || 'Kreatif Görev',
      workflow_title: instance?.title || undefined,
      reviewer_employee_id: reviewerId,
    };

    const { data: inserted, error: insertErr } = await db2
      .from('creative_production_credits')
      .upsert(creditRow, { onConflict: 'workflow_step_instance_id' })
      .select()
      .maybeSingle();

    if (insertErr) {
      return res.status(500).json({
        error: `Failed to persist creative credit to DB2: ${insertErr.message}`,
      });
    }

    return res.status(200).json({
      success: true,
      credit: inserted || creditRow,
    });
  }

  // --------------------------------------------------------------------------
  // ACTION: REPORT (Server-Authoritative Reporting Read Model)
  // --------------------------------------------------------------------------
  if (action === 'report' || !action) {
    const isDedicatedAdmin = authState.principalType === 'admin' || authState.isAdmin;
    const callerEmployee = authState.employee;
    const isGraphicDesigner = callerEmployee?.role_package_id === 'grafik-tasarim';

    // Parse filter from body (POST) or query (GET)
    const filter = req.method === 'POST' ? req.body || {} : req.query || {};

    let targetEmployeeId = filter.employeeId;
    if (isGraphicDesigner) {
      // SECURITY GUARD: Graphic Designer can ONLY see own records
      targetEmployeeId = callerEmployee.id;
    } else if (targetEmployeeId === 'all') {
      targetEmployeeId = undefined;
    }

    const { fromIso, toIso } = resolveServerDateRange(filter);

    // Fetch credits from DB2
    let query = db2
      .from('creative_production_credits')
      .select('*')
      .order('credited_at', { ascending: false });

    if (targetEmployeeId) {
      query = query.eq('designer_employee_id', targetEmployeeId);
    }

    if (fromIso) {
      query = query.gte('credited_at', fromIso);
    }
    if (toIso) {
      query = query.lte('credited_at', toIso);
    }

    const { data: credits, error: fetchErr } = await query;
    if (fetchErr) {
      return res.status(500).json({ error: `DB2 Query error: ${fetchErr.message}` });
    }

    const allCredits = credits || [];

    // Fetch employee names for breakdown from DB2 or DB1
    const { data: db2Employees } = await db2.from('employees').select('id, full_name, employment_type');
    const empList = db2Employees || [];

    const completedJobCount = allCredits.length;
    const completedCreativeCount = allCredits.reduce(
      (sum, c) => sum + (Number(c.creative_count) >= 1 ? Number(c.creative_count) : 1),
      0
    );

    const empMap = new Map();
    allCredits.forEach((c) => {
      const dId = c.designer_employee_id;
      if (!empMap.has(dId)) {
        const emp = empList.find((e) => e.id === dId);
        empMap.set(dId, {
          employeeId: dId,
          employeeName: emp ? emp.full_name : 'Bilinmeyen Tasarımcı',
          employmentType: emp?.employment_type,
          completedJobCount: 0,
          completedCreativeCount: 0,
        });
      }
      const item = empMap.get(dId);
      item.completedJobCount += 1;
      item.completedCreativeCount += Number(c.creative_count) >= 1 ? Number(c.creative_count) : 1;
    });

    const employeeBreakdown = Array.from(empMap.values()).sort(
      (a, b) => b.completedCreativeCount - a.completedCreativeCount
    );

    return res.status(200).json({
      success: true,
      summary: {
        completedJobCount,
        completedCreativeCount,
        employeeBreakdown,
        credits: allCredits.map((c) => ({
          id: c.id,
          workflowStepInstanceId: c.workflow_step_instance_id,
          workflowInstanceId: c.workflow_instance_id,
          finalApprovalId: c.final_approval_id,
          designerEmployeeId: c.designer_employee_id,
          brandId: c.brand_id,
          creativeCount: Number(c.creative_count) || 1,
          creditedAt: c.credited_at,
          createdAt: c.created_at,
          taskTitle: c.task_title,
          workflowTitle: c.workflow_title,
          reviewerEmployeeId: c.reviewer_employee_id,
        })),
      },
    });
  }

  return res.status(400).json({ error: `Unknown action: ${action}` });
}
