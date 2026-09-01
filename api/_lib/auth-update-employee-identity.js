import { getAdminSupabase, getSecondaryAdminSupabase } from './admin-db.js';
import { requireAdminSession } from './auth-me.js';
import { validateOrigin } from './admin-auth.js';
import { requireAdministrativeAuthority } from './admin-permissions.js';
import { ROLE_PACKAGE_DEFINITIONS } from './role-package-seeds.js';

const VALID_STATUSES = new Set(['active', 'inactive', 'probation', 'intern', 'part_time', 'freelance']);
const VALID_WORK_LOCATIONS = new Set(['office', 'hybrid', 'remote']);
const VALID_ROLE_PACKAGES = new Set(ROLE_PACKAGE_DEFINITIONS.map((pkg) => pkg.id));

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden Origin' });
  }

  // 1. Authenticate operator session (mustChangePassword sessions fail-closed by default)
  const authState = await requireAdminSession(req);
  if (!authState) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  // 2. Authorize operator with canonical administrative authority guard
  const authCheck = requireAdministrativeAuthority(authState, 'employees.manage');
  if (!authCheck.authorized) {
    return res.status(authCheck.status || 403).json({ error: authCheck.error || 'Unauthorized' });
  }

  // 3. Validate request payload
  const {
    employeeId,
    fullName,
    title,
    email,
    username,
    employeeStatus,
    workLocationStatus,
    avatarUrl,
    rolePackageId,
    teamIds,
    hasAdvancedCalendarAccess,
    permissionOverrides,
  } = req.body || {};

  if (!employeeId || (typeof employeeId !== 'string' && typeof employeeId !== 'number')) {
    return res.status(400).json({ error: 'Invalid payload: employeeId is required' });
  }

  const cleanEmployeeId = String(employeeId).trim();
  if (!cleanEmployeeId) {
    return res.status(400).json({ error: 'Invalid payload: employeeId cannot be empty' });
  }

  const db1 = getAdminSupabase();

  // 4. Fetch target employee from DB1 (canonical authority)
  let { data: targetEmp, error: fetchErr } = await db1
    .from('employees')
    .select('id, full_name, email, title, role_package_id, team_ids, employment_type, work_location_status, employee_status, permission_overrides, has_advanced_calendar_access, avatar_url')
    .eq('id', cleanEmployeeId)
    .maybeSingle();

  // If not found by primary id and cleanEmployeeId might be a DB2 UUID, try DB2 mirror to resolve db1_employee_id
  if (!targetEmp && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanEmployeeId)) {
    try {
      const db2 = getSecondaryAdminSupabase();
      const { data: db2Emp } = await db2
        .from('employees')
        .select('db1_employee_id')
        .eq('id', cleanEmployeeId)
        .maybeSingle();

      if (db2Emp?.db1_employee_id) {
        const { data: resolvedDb1 } = await db1
          .from('employees')
          .select('id, full_name, email, title, role_package_id, team_ids, employment_type, work_location_status, employee_status, permission_overrides, has_advanced_calendar_access, avatar_url')
          .eq('id', db2Emp.db1_employee_id)
          .maybeSingle();

        if (resolvedDb1) {
          targetEmp = resolvedDb1;
        }
      }
    } catch (_) {}
  }

  if (fetchErr || !targetEmp) {
    return res.status(404).json({ error: `Target employee not found for ID: ${cleanEmployeeId}` });
  }

  const updateFields = {};
  const currentOverrides = { ...(targetEmp.permission_overrides || {}) };
  let overridesModified = false;

  // 5. Full Name Validation & Preparation
  if (fullName !== undefined) {
    const cleanFullName = String(fullName).trim();
    if (!cleanFullName || cleanFullName.length < 2 || cleanFullName.length > 100) {
      return res.status(400).json({ error: 'Ad Soyad 2 ile 100 karakter arasında olmalıdır.' });
    }
    updateFields.full_name = cleanFullName;
  }

  // 6. Title Validation & Preparation
  if (title !== undefined) {
    const cleanTitle = String(title).trim();
    updateFields.title = cleanTitle;
  }

  // 7. Email Validation & Collision Check
  if (email !== undefined) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (cleanEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ error: 'Geçersiz e-posta adresi formatı.' });
      }
      const { data: existingEmail, error: emailCheckErr } = await db1
        .from('employees')
        .select('id')
        .eq('email', cleanEmail)
        .neq('id', targetEmp.id)
        .limit(1);

      if (emailCheckErr) {
        return res.status(500).json({ error: 'Veritabanı e-posta kontrolü başarısız oldu.' });
      }
      if (existingEmail && existingEmail.length > 0) {
        return res.status(409).json({ error: 'Bu e-posta adresi başka bir çalışan tarafından kullanılmaktadır.' });
      }
      updateFields.email = cleanEmail;
    } else {
      updateFields.email = null;
    }
  }

  // 8. Username Validation & Collision Check
  if (username !== undefined) {
    const cleanUsername = String(username).trim().toLowerCase();
    if (cleanUsername) {
      if (!/^[a-z0-9._-]{3,30}$/.test(cleanUsername)) {
        return res.status(400).json({
          error: 'Kullanıcı adı 3-30 karakter arasında olmalı ve küçük harf, rakam, nokta, tire veya alt çizgi içermelidir.',
        });
      }
      const { data: allEmps, error: userCheckErr } = await db1
        .from('employees')
        .select('id, permission_overrides')
        .neq('id', targetEmp.id);

      if (userCheckErr) {
        return res.status(500).json({ error: 'Veritabanı kullanıcı adı kontrolü başarısız oldu.' });
      }

      const collision = (allEmps || []).some((emp) => {
        const u = (emp.permission_overrides?.username || '').trim().toLowerCase();
        return u === cleanUsername;
      });

      if (collision) {
        return res.status(409).json({ error: 'Bu kullanıcı adı başka bir çalışan tarafından kullanılmaktadır.' });
      }

      currentOverrides.username = cleanUsername;
      overridesModified = true;
    } else {
      delete currentOverrides.username;
      overridesModified = true;
    }
  }

  // 9. Employee Status Validation
  if (employeeStatus !== undefined) {
    const cleanStatus = String(employeeStatus).trim().toLowerCase();
    if (!VALID_STATUSES.has(cleanStatus)) {
      return res.status(400).json({
        error: `Geçersiz çalışan durumu: [${Array.from(VALID_STATUSES).join(', ')}] değerlerinden biri olmalıdır.`,
      });
    }
    updateFields.employee_status = cleanStatus;
  }

  // 10. Work Location Status Validation
  if (workLocationStatus !== undefined) {
    const cleanLocation = String(workLocationStatus).trim().toLowerCase();
    if (!VALID_WORK_LOCATIONS.has(cleanLocation)) {
      return res.status(400).json({
        error: `Geçersiz çalışma konumu: [${Array.from(VALID_WORK_LOCATIONS).join(', ')}] değerlerinden biri olmalıdır.`,
      });
    }
    updateFields.work_location_status = cleanLocation;
  }

  // 11. Avatar URL
  if (avatarUrl !== undefined) {
    updateFields.avatar_url = avatarUrl ? String(avatarUrl).trim() : null;
  }

  // 12. Role Package Validation
  if (rolePackageId !== undefined) {
    const cleanRole = rolePackageId === null || rolePackageId === '' ? null : String(rolePackageId).trim();
    if (cleanRole !== null && !VALID_ROLE_PACKAGES.has(cleanRole)) {
      return res.status(400).json({ error: `Geçersiz rol paketi: "${cleanRole}".` });
    }
    updateFields.role_package_id = cleanRole;
  }

  // 13. Team IDs Validation
  if (teamIds !== undefined) {
    if (!Array.isArray(teamIds) || !teamIds.every((t) => typeof t === 'string')) {
      return res.status(400).json({ error: 'Takım listesi metin dizisi formatında olmalıdır.' });
    }
    updateFields.team_ids = teamIds;
  }

  // 14. Advanced Calendar Access Validation
  if (hasAdvancedCalendarAccess !== undefined) {
    if (typeof hasAdvancedCalendarAccess !== 'boolean') {
      return res.status(400).json({ error: 'hasAdvancedCalendarAccess mantıksal değer (boolean) olmalıdır.' });
    }
    updateFields.has_advanced_calendar_access = hasAdvancedCalendarAccess;
  }

  // 15. Permission Overrides
  if (permissionOverrides !== undefined && typeof permissionOverrides === 'object' && permissionOverrides !== null) {
    const usernameBackup = currentOverrides.username;
    Object.assign(currentOverrides, permissionOverrides);
    if (usernameBackup !== undefined && permissionOverrides.username === undefined) {
      currentOverrides.username = usernameBackup;
    }
    overridesModified = true;
  }

  if (overridesModified) {
    updateFields.permission_overrides = currentOverrides;
  }

  // If no fields to update, return current canonical employee
  if (Object.keys(updateFields).length === 0) {
    return res.status(200).json({
      ok: true,
      success: true,
      employeeId: String(targetEmp.id),
      employee: {
        id: String(targetEmp.id),
        db1EmployeeId: String(targetEmp.id),
        fullName: targetEmp.full_name,
        email: targetEmp.email || '',
        title: targetEmp.title || '',
        rolePackageId: targetEmp.role_package_id,
        teamIds: targetEmp.team_ids || [],
        employmentType: targetEmp.employment_type || null,
        workLocationStatus: targetEmp.work_location_status || 'office',
        employeeStatus: targetEmp.employee_status || 'active',
        permissionOverrides: targetEmp.permission_overrides || {},
        hasAdvancedCalendarAccess: Boolean(targetEmp.has_advanced_calendar_access),
        avatarUrl: targetEmp.avatar_url,
        username: targetEmp.permission_overrides?.username || null,
      },
      message: 'No changes requested',
    });
  }

  updateFields.updated_at = new Date().toISOString();

  // 16. CANONICAL DB1 UPDATE
  const { data: updatedDb1, error: updateErr } = await db1
    .from('employees')
    .update(updateFields)
    .eq('id', targetEmp.id)
    .select('id, full_name, email, title, role_package_id, team_ids, employment_type, work_location_status, employee_status, permission_overrides, has_advanced_calendar_access, avatar_url, created_at, updated_at')
    .maybeSingle();

  if (updateErr || !updatedDb1) {
    console.error('Failed to update employee in DB1:', updateErr);
    return res.status(500).json({
      error: `CANONICAL_WRITE_FAILED: Veritabanı güncellemesi başarısız oldu: ${updateErr?.message || 'Kayıt bulunamadı'}`,
    });
  }

  // 17. CANONICAL READBACK INTEGRITY CHECK
  if (updateFields.full_name !== undefined && updatedDb1.full_name !== updateFields.full_name) {
    return res.status(500).json({
      error: `READBACK_MISMATCH: Kaydedilen isim ("${updatedDb1.full_name}") ile talep edilen ("${updateFields.full_name}") eşleşmiyor.`,
    });
  }
  if (updateFields.title !== undefined && updatedDb1.title !== updateFields.title) {
    return res.status(500).json({
      error: `READBACK_MISMATCH: Kaydedilen unvan ("${updatedDb1.title}") ile talep edilen ("${updateFields.title}") eşleşmiyor.`,
    });
  }
  if (updateFields.email !== undefined && (updatedDb1.email || null) !== (updateFields.email || null)) {
    return res.status(500).json({
      error: `READBACK_MISMATCH: Kaydedilen e-posta ile talep edilen eşleşmiyor.`,
    });
  }
  if (updateFields.employee_status !== undefined && updatedDb1.employee_status !== updateFields.employee_status) {
    return res.status(500).json({
      error: `READBACK_MISMATCH: Kaydedilen çalışan durumu ile talep edilen eşleşmiyor.`,
    });
  }
  if (updateFields.work_location_status !== undefined && updatedDb1.work_location_status !== updateFields.work_location_status) {
    return res.status(500).json({
      error: `READBACK_MISMATCH: Kaydedilen çalışma konumu ile talep edilen eşleşmiyor.`,
    });
  }
  if (username !== undefined && (updatedDb1.permission_overrides?.username || null) !== (currentOverrides.username || null)) {
    return res.status(500).json({
      error: `READBACK_MISMATCH: Kaydedilen kullanıcı adı ile talep edilen eşleşmiyor.`,
    });
  }
  if (updateFields.role_package_id !== undefined && (updatedDb1.role_package_id || null) !== (updateFields.role_package_id || null)) {
    return res.status(500).json({
      error: `READBACK_MISMATCH: Kaydedilen rol paketi ile talep edilen eşleşmiyor.`,
    });
  }

  // 18. DB2 MIRROR SYNC (Authorized server bridge)
  try {
    const db2 = getSecondaryAdminSupabase();
    const db2Fields = {
      full_name: updatedDb1.full_name,
      email: updatedDb1.email,
      title: updatedDb1.title,
      role_package_id: updatedDb1.role_package_id,
      team_ids: updatedDb1.team_ids,
      employee_status: updatedDb1.employee_status,
      employment_type: updatedDb1.employment_type,
      work_location_status: updatedDb1.work_location_status,
      permission_overrides: updatedDb1.permission_overrides,
      has_advanced_calendar_access: updatedDb1.has_advanced_calendar_access,
      avatar_url: updatedDb1.avatar_url,
      updated_at: updatedDb1.updated_at,
    };

    await db2
      .from('employees')
      .update(db2Fields)
      .eq('db1_employee_id', String(targetEmp.id));
  } catch (db2Err) {
    console.warn('[DB2 Mirror Sync Warning]:', db2Err.message);
  }

  // 19. RETURN CANONICAL RESPONSE
  return res.status(200).json({
    ok: true,
    success: true,
    employeeId: String(updatedDb1.id),
    employee: {
      id: String(updatedDb1.id),
      db1EmployeeId: String(updatedDb1.id),
      fullName: updatedDb1.full_name,
      email: updatedDb1.email || '',
      title: updatedDb1.title || '',
      rolePackageId: updatedDb1.role_package_id,
      teamIds: updatedDb1.team_ids || [],
      employmentType: updatedDb1.employment_type || null,
      workLocationStatus: updatedDb1.work_location_status || 'office',
      employeeStatus: updatedDb1.employee_status || 'active',
      permissionOverrides: updatedDb1.permission_overrides || {},
      hasAdvancedCalendarAccess: Boolean(updatedDb1.has_advanced_calendar_access),
      avatarUrl: updatedDb1.avatar_url,
      username: updatedDb1.permission_overrides?.username || null,
      createdAt: updatedDb1.created_at,
      updatedAt: updatedDb1.updated_at,
    },
  });
}
