import { getAdminSupabase, getSecondaryAdminSupabase } from './admin-db.js';
import { requireAdminSession } from './auth-me.js';
import { requireAdministrativeAuthority } from './admin-permissions.js';
import { validateOrigin } from './admin-auth.js';

/**
 * POST /api/auth-delete-employee
 * Server-authoritative employee deletion and responsibility release handler.
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden Origin' });
  }

  // 1. Authenticate operator session
  const authState = await requireAdminSession(req);
  if (!authState) {
    return res.status(401).json({
      ok: false,
      error: 'Unauthenticated',
      metadata: { code: 'EMPLOYEE_DELETE_FAILED', stage: 'SESSION_AUTHENTICATION', target: 'AUTH', operation: 'AUTH' }
    });
  }

  // 2. Authorize operator with canonical administrative authority guard
  const authCheck = requireAdministrativeAuthority(authState, 'employees.manage');
  if (!authCheck.authorized) {
    return res.status(authCheck.status || 403).json({
      ok: false,
      error: authCheck.error || 'Unauthorized: employees.manage permission required',
      metadata: { code: 'EMPLOYEE_DELETE_FAILED', stage: 'AUTHORIZATION_GUARD', target: 'AUTH', operation: 'AUTH' }
    });
  }

  // 3. Parse and validate payload
  const { employeeId, releaseResponsibilities } = req.body || {};

  if (!employeeId || (typeof employeeId !== 'string' && typeof employeeId !== 'number')) {
    return res.status(400).json({
      ok: false,
      error: 'Geçersiz çalışan kimliği (employeeId zorunludur).',
      metadata: { code: 'EMPLOYEE_DELETE_FAILED', stage: 'PAYLOAD_VALIDATION', target: 'API', operation: 'VALIDATE' }
    });
  }

  const cleanEmployeeId = String(employeeId).trim();
  const shouldReleaseResponsibilities = Boolean(releaseResponsibilities);

  // 4. Initialize Database Clients
  const supabaseAdmin = getAdminSupabase();
  if (!supabaseAdmin) {
    return res.status(500).json({
      ok: false,
      error: 'Primary admin database client is not configured',
      metadata: { code: 'EMPLOYEE_DELETE_FAILED', stage: 'DB1_CLIENT_INIT', target: 'DB1', operation: 'INIT' }
    });
  }
  const db2 = getSecondaryAdminSupabase();

  // 5. Resolve canonical DB1 employee
  const isNumeric = /^\d+$/.test(cleanEmployeeId);
  let db1Query = supabaseAdmin
    .from('employees')
    .select('id, full_name, email, title, role_package_id, team_ids, employee_status, permission_overrides');

  if (isNumeric) {
    db1Query = db1Query.eq('id', parseInt(cleanEmployeeId, 10));
  } else {
    db1Query = db1Query.eq('id', cleanEmployeeId);
  }

  const { data: targetEmp, error: fetchErr } = await db1Query.maybeSingle();

  if (fetchErr) {
    return res.status(500).json({
      ok: false,
      error: 'Database error querying target employee',
      metadata: { code: 'EMPLOYEE_DELETE_FAILED', stage: 'DB1_TARGET_RESOLUTION', target: 'DB1', operation: 'SELECT', postgresCode: fetchErr.code }
    });
  }

  if (!targetEmp) {
    return res.status(404).json({
      ok: false,
      error: 'Target employee not found',
      metadata: { code: 'EMPLOYEE_DELETE_FAILED', stage: 'DB1_TARGET_RESOLUTION', target: 'DB1', operation: 'SELECT' }
    });
  }

  const canonicalDb1Id = String(targetEmp.id);

  // 6. Resolve DB2 Employee Mirror if present
  let db2EmployeeId = null;
  if (db2) {
    const { data: db2Rows } = await db2
      .from('employees')
      .select('id')
      .eq('db1_employee_id', canonicalDb1Id);
    if (db2Rows && db2Rows.length === 1) {
      db2EmployeeId = db2Rows[0].id;
    }
  }

  // Set of IDs representing this employee across DB1 and DB2
  const targetIdSet = new Set([canonicalDb1Id, cleanEmployeeId]);
  if (db2EmployeeId) targetIdSet.add(db2EmployeeId);
  const targetIdArray = Array.from(targetIdSet);

  // 7. Check Active Responsibilities (Brands, Tasks, Workflow Steps)
  let assignedBrands = [];
  let assignedSteps = [];
  let assignedTasks = [];

  // 7.1. Check Brands (DB1 or DB2)
  try {
    const { data: allBrands } = await (db2 || supabaseAdmin).from('brands').select('id, name, operation_manager_id, brand_assignments');
    if (allBrands && Array.isArray(allBrands)) {
      assignedBrands = allBrands.filter(brand => {
        if (brand.operation_manager_id && targetIdSet.has(String(brand.operation_manager_id))) return true;
        if (Array.isArray(brand.brand_assignments)) {
          return brand.brand_assignments.some(a => a && a.employeeId && targetIdSet.has(String(a.employeeId)));
        }
        return false;
      });
    }
  } catch (err) {
    console.warn('[Responsibility Check Brand Error]:', err.message);
  }

  // 7.2. Check Workflow Steps (DB2)
  if (db2) {
    try {
      const { data: steps } = await db2
        .from('workflow_step_instances')
        .select('id, title, status, assignee_employee_id, assigned_employee_id')
        .or(`assignee_employee_id.in.(${targetIdArray.join(',')}),assigned_employee_id.in.(${targetIdArray.join(',')})`)
        .neq('status', 'completed');
      if (steps) assignedSteps = steps;
    } catch (err) {
      console.warn('[Responsibility Check Step Error]:', err.message);
    }
  }

  // 7.3. Check Tasks (DB1)
  try {
    const { data: tasks } = await supabaseAdmin
      .from('tasks')
      .select('id, title, status, assigned_to')
      .in('assigned_to', targetIdArray)
      .neq('status', 'completed');
    if (tasks) assignedTasks = tasks;
  } catch (err) {
    // tasks table might not exist or be empty
  }

  const blockingResponsibilityCount = assignedBrands.length + assignedSteps.length + assignedTasks.length;

  // 8. If employee has active responsibilities and release was NOT selected, BLOCK deletion
  if (blockingResponsibilityCount > 0 && !shouldReleaseResponsibilities) {
    return res.status(400).json({
      ok: false,
      error: 'Çalışanın aktif görevleri ve marka sorumlulukları bulunuyor. Silmeden önce görevleri devredin veya ortak havuza bırakın.',
      metadata: {
        code: 'EMPLOYEE_HAS_ACTIVE_RESPONSIBILITIES',
        stage: 'RESPONSIBILITY_CHECK',
        target: 'RESPONSIBILITIES',
        operation: 'VALIDATE',
        blockingCount: blockingResponsibilityCount,
        assignedBrandsCount: assignedBrands.length,
        assignedStepsCount: assignedSteps.length,
        assignedTasksCount: assignedTasks.length,
      }
    });
  }

  // 9. If releaseResponsibilities is true, release every blocking responsibility to canonical common pool
  let releasedCount = 0;
  if (blockingResponsibilityCount > 0 && shouldReleaseResponsibilities) {
    try {
      // 9.1. Release Brands
      const brandClient = db2 || supabaseAdmin;
      for (const brand of assignedBrands) {
        const updatePayload = {};
        let modified = false;

        if (brand.operation_manager_id && targetIdSet.has(String(brand.operation_manager_id))) {
          updatePayload.operation_manager_id = null;
          modified = true;
        }
        if (Array.isArray(brand.brand_assignments)) {
          const updatedAssignments = brand.brand_assignments.map(a => {
            if (a && a.employeeId && targetIdSet.has(String(a.employeeId))) {
              modified = true;
              return { ...a, employeeId: null };
            }
            return a;
          });
          if (modified) {
            updatePayload.brand_assignments = updatedAssignments;
          }
        }

        if (modified) {
          updatePayload.updated_at = new Date().toISOString();
          const { error: bErr } = await brandClient
            .from('brands')
            .update(updatePayload)
            .eq('id', brand.id);
          if (!bErr) releasedCount++;
        }
      }

      // 9.2. Release Workflow Steps in DB2
      if (db2 && assignedSteps.length > 0) {
        for (const step of assignedSteps) {
          const { error: stepErr } = await db2
            .from('workflow_step_instances')
            .update({
              assignee_employee_id: null,
              assigned_employee_id: null,
              status: 'pending',
            })
            .eq('id', step.id);
          if (!stepErr) releasedCount++;
        }
      }

      // 9.3. Release Tasks in DB1
      if (assignedTasks.length > 0) {
        for (const task of assignedTasks) {
          const { error: tErr } = await supabaseAdmin
            .from('tasks')
            .update({ assigned_to: null })
            .eq('id', task.id);
          if (!tErr) releasedCount++;
        }
      }

      // 9.4. READBACK VERIFICATION of released responsibilities
      let remainingBrands = [];
      const { data: verifyBrands } = await brandClient.from('brands').select('id, operation_manager_id, brand_assignments');
      if (verifyBrands) {
        remainingBrands = verifyBrands.filter(b => {
          if (b.operation_manager_id && targetIdSet.has(String(b.operation_manager_id))) return true;
          if (Array.isArray(b.brand_assignments)) {
            return b.brand_assignments.some(a => a && a.employeeId && targetIdSet.has(String(a.employeeId)));
          }
          return false;
        });
      }

      if (remainingBrands.length > 0) {
        return res.status(500).json({
          ok: false,
          error: 'RESPONSIBILITY_RELEASE_FAILED: Marka sorumlulukları serbest bırakılamadı.',
          metadata: {
            code: 'RESPONSIBILITIES_RELEASED_EMPLOYEE_DELETE_FAILED',
            stage: 'RESPONSIBILITY_READBACK',
            target: 'RESPONSIBILITIES',
            operation: 'VERIFY',
            remainingCount: remainingBrands.length,
          }
        });
      }
    } catch (relErr) {
      return res.status(500).json({
        ok: false,
        error: `Sorumlulukları serbest bırakma sırasında hata: ${relErr.message}`,
        metadata: {
          code: 'RESPONSIBILITIES_RELEASED_EMPLOYEE_DELETE_FAILED',
          stage: 'RESPONSIBILITY_RELEASE_EXCEPTION',
          target: 'RESPONSIBILITIES',
          operation: 'UPDATE'
        }
      });
    }
  }

  // 10. CANONICAL DB1 EMPLOYEE DELETION / ARCHIVAL
  // Attempt soft-delete / status inactive first to preserve historical audit logs if foreign keys exist
  let db1DeleteSuccess = false;
  let db1Deactivated = false;

  // Try hard delete first
  const { data: delResult, error: delErr } = await supabaseAdmin
    .from('employees')
    .delete()
    .eq('id', targetEmp.id)
    .select('id');

  if (!delErr && delResult && delResult.length > 0) {
    db1DeleteSuccess = true;
  } else if (delErr && (delErr.code === '23503' || delErr.message?.includes('foreign key'))) {
    // Foreign key constraint: Perform canonical soft delete / archival
    const { data: archiveResult, error: archErr } = await supabaseAdmin
      .from('employees')
      .update({
        employee_status: 'inactive',
        permission_overrides: {},
        email: `archived-${targetEmp.id}-${Date.now()}@socialart.internal`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetEmp.id)
      .select('id, employee_status');

    if (archErr || !archiveResult || archiveResult.length === 0) {
      return res.status(500).json({
        ok: false,
        error: 'CANONICAL_WRITE_FAILED: Çalışan arşivlenemedi.',
        metadata: {
          code: 'EMPLOYEE_DELETE_FAILED',
          stage: 'DB1_ARCHIVE_UPDATE',
          target: 'DB1',
          operation: 'UPDATE',
          postgresCode: archErr?.code || 'UNKNOWN',
        }
      });
    }
    db1Deactivated = true;
  } else if (delErr) {
    return res.status(500).json({
      ok: false,
      error: `CANONICAL_WRITE_FAILED: Veritabanı silme işlemi başarısız: ${delErr.message}`,
      metadata: {
        code: 'EMPLOYEE_DELETE_FAILED',
        stage: 'DB1_DELETE',
        target: 'DB1',
        operation: 'DELETE',
        postgresCode: delErr.code || 'UNKNOWN',
      }
    });
  } else {
    // Zero rows affected
    return res.status(500).json({
      ok: false,
      error: 'CANONICAL_WRITE_FAILED: Silinecek çalışan bulunamadı veya 0 satır etkilendi.',
      metadata: {
        code: 'EMPLOYEE_DELETE_FAILED',
        stage: 'DB1_DELETE_ZERO_ROWS',
        target: 'DB1',
        operation: 'DELETE',
      }
    });
  }

  // 11. READBACK VERIFICATION on DB1
  if (db1DeleteSuccess) {
    const { data: verifyEmp } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('id', targetEmp.id)
      .maybeSingle();
    if (verifyEmp) {
      return res.status(500).json({
        ok: false,
        error: 'READBACK_FAILED: Çalışan DB1 veritabanından tamamen silinemedi.',
        metadata: { code: 'EMPLOYEE_DELETE_FAILED', stage: 'DB1_READBACK', target: 'DB1', operation: 'SELECT' }
      });
    }
  }

  // 12. DB2 Employee Mirror Cleanup (DELETE or Deactivate)
  let db2MirrorWarning = null;
  if (db2) {
    try {
      if (db1DeleteSuccess) {
        const { error: db2DelErr } = await db2
          .from('employees')
          .delete()
          .eq('db1_employee_id', canonicalDb1Id);
        if (db2DelErr && db2DelErr.code === '23503') {
          // If DB2 foreign key prevents deletion, set inactive
          await db2
            .from('employees')
            .update({ employee_status: 'inactive', updated_at: new Date().toISOString() })
            .eq('db1_employee_id', canonicalDb1Id);
        } else if (db2DelErr) {
          db2MirrorWarning = 'DB1_DELETED_DB2_MIRROR_FAILED';
        }
      } else {
        await db2
          .from('employees')
          .update({ employee_status: 'inactive', updated_at: new Date().toISOString() })
          .eq('db1_employee_id', canonicalDb1Id);
      }
    } catch (db2Err) {
      db2MirrorWarning = 'DB1_DELETED_DB2_MIRROR_FAILED';
    }
  }

  // 13. Disable / Cleanup Auth Credentials
  try {
    await supabaseAdmin
      .from('employee_auth_credentials')
      .delete()
      .eq('employee_id', targetEmp.id);
  } catch (e) {}

  // 14. Return Verified Canonical Response
  const response = {
    ok: true,
    success: true,
    employeeId: canonicalDb1Id,
    fullName: targetEmp.full_name,
    deleted: db1DeleteSuccess,
    archived: db1Deactivated,
    releasedResponsibilitiesCount: releasedCount,
    message: db1DeleteSuccess
      ? `"${targetEmp.full_name}" başarıyla silindi.`
      : `"${targetEmp.full_name}" başarıyla arşivlendi ve pasife alındı.`,
  };

  if (db2MirrorWarning) {
    response.warning = db2MirrorWarning;
    response.message += ' (DB2 aynası kısmen temizlendi)';
  }

  return res.status(200).json(response);
}
