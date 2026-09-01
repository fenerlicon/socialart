import { supabase, supabaseLeads } from '@/lib/supabase/client'
import type { Employee, EmploymentType } from '@/types/domain'

const ACTIVE_EMPLOYEE_KEY = 'social-art-base:active-employee-id'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

const FALLBACK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-celal',
    fullName: 'Celal',
    email: 'celal@socialart.internal',
    title: 'Kurucu / Yönetici',
    rolePackageId: 'operasyon-yonetimi',
    teamIds: ['merkezi-operasyon'],
    permissionOverrides: {},
    username: 'celal',
    employeeStatus: 'active',
    workLocationStatus: 'office',
    hasAdvancedCalendarAccess: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'emp-ercan',
    fullName: 'Ercan',
    email: 'ercan@socialart.internal',
    title: 'Kreatif Direktör',
    rolePackageId: 'kreatif-direktor',
    teamIds: ['kreatif-koordinasyon'],
    permissionOverrides: {},
    username: 'ercan',
    employeeStatus: 'active',
    workLocationStatus: 'office',
    hasAdvancedCalendarAccess: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'emp-furkan',
    fullName: 'Furkan',
    email: 'furkan@socialart.internal',
    title: 'Dijital Pazarlama Uzmanı',
    rolePackageId: 'kreatif-direktor',
    teamIds: ['kreatif-koordinasyon'],
    permissionOverrides: {},
    username: 'furkan',
    employeeStatus: 'active',
    workLocationStatus: 'office',
    hasAdvancedCalendarAccess: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'emp-betul',
    fullName: 'Betül',
    email: 'betul@socialart.internal',
    title: 'ART Direktör',
    rolePackageId: 'kreatif-direktor',
    teamIds: ['kreatif-koordinasyon'],
    permissionOverrides: {},
    username: 'betul',
    employeeStatus: 'active',
    workLocationStatus: 'office',
    hasAdvancedCalendarAccess: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'emp-tugba',
    fullName: 'Tuğba',
    email: 'tugba@socialart.internal',
    title: 'Sosyal Medya Specialist',
    rolePackageId: 'ekip-uyesi',
    teamIds: ['kreatif-koordinasyon'],
    permissionOverrides: {},
    username: 'tugba',
    employeeStatus: 'active',
    workLocationStatus: 'office',
    hasAdvancedCalendarAccess: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'emp-samet',
    fullName: 'Samet',
    email: 'samet@socialart.internal',
    title: 'Kurgu',
    rolePackageId: 'ekip-uyesi',
    teamIds: ['kreatif-koordinasyon'],
    permissionOverrides: {},
    username: 'samet',
    employeeStatus: 'active',
    workLocationStatus: 'office',
    hasAdvancedCalendarAccess: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export const EmployeeRepository = {
  // Map Supabase snake_case row to TypeScript camelCase Employee
  mapRowToEmployee(row: any): Employee {
    const overrides = { ...(row.permission_overrides || {}) }
    const username = overrides.username || ''
    
    // Remove credentials from overrides to prevent permission key validation errors
    delete overrides.password

    const validEmploymentTypes = ['full_time', 'freelance', 'contractor', 'part_time']
    const employmentType = validEmploymentTypes.includes(row.employment_type) ? row.employment_type : null

    return {
      id: String(row.id),
      db1EmployeeId: row.db1_employee_id ? String(row.db1_employee_id) : String(row.id),
      fullName: row.full_name || '',
      email: row.email || '',
      title: row.title || '',
      avatarUrl: row.avatar_url || undefined,
      employeeStatus: row.employee_status || 'active',
      workLocationStatus: row.work_location_status || 'office',
      employmentType,
      rolePackageId: row.role_package_id || null,
      teamIds: Array.isArray(row.team_ids) ? row.team_ids : [],
      permissionOverrides: overrides,
      hasAdvancedCalendarAccess: Boolean(row.has_advanced_calendar_access),
      username: username || undefined,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString()
    }
  },

  // Map TypeScript camelCase Employee to Supabase snake_case row
  mapEmployeeToRow(employee: Partial<Employee>) {
    const row: any = {}
    if (employee.id !== undefined) row.id = employee.id
    if (employee.fullName !== undefined) row.full_name = employee.fullName
    if (employee.title !== undefined) row.title = employee.title
    
    if (employee.permissionOverrides !== undefined) {
      const safeOverrides = { ...(employee.permissionOverrides || {}) }
      const sensitiveKeys = [
        'team.manage',
        'employees.manage',
        'employees.create',
        'system.permissions',
        'system.admin',
        'settings.manage',
        'system.settings',
        'username',
      ]
      for (const key of sensitiveKeys) {
        delete (safeOverrides as any)[key]
      }

      row.permission_overrides = safeOverrides
    }
    
    if (employee.workLocationStatus !== undefined) row.work_location_status = employee.workLocationStatus
    if (employee.avatarUrl !== undefined) row.avatar_url = employee.avatarUrl
    if (employee.createdAt !== undefined) row.created_at = employee.createdAt
    if (employee.updatedAt !== undefined) row.updated_at = employee.updatedAt
    return row
  },

  async getAll(): Promise<Employee[]> {
    try {
      // DB1 is canonical source of truth for employees
      const { data: db1Data, error: db1Error } = await supabaseLeads
        .from('employees')
        .select('*')
        .order('full_name', { ascending: true })

      if (!db1Error && db1Data && db1Data.length > 0) {
        return db1Data.map((r) => this.mapRowToEmployee(r))
      }

      // Secondary fallback to DB2 mirror if DB1 leads client has connectivity issue
      const { data: db2Data, error: db2Error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name', { ascending: true })

      if (!db2Error && db2Data && db2Data.length > 0) {
        return db2Data.map((r) => this.mapRowToEmployee(r))
      }

      return FALLBACK_EMPLOYEES
    } catch (err) {
      console.warn('Failed to fetch employees, returning FALLBACK_EMPLOYEES:', err)
      return FALLBACK_EMPLOYEES
    }
  },

  async getById(id: string): Promise<Employee | null> {
    if (!id) return null
    try {
      // 1. Try DB1 canonical source of truth first
      const { data: db1Emp, error: db1Error } = await supabaseLeads
        .from('employees')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (!db1Error && db1Emp) {
        return this.mapRowToEmployee(db1Emp)
      }

      // 2. If id might be a DB2 UUID, look up DB2 mirror to resolve canonical db1_employee_id
      const { data: db2Emp, error: db2Error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (!db2Error && db2Emp) {
        if (db2Emp.db1_employee_id) {
          const { data: resolvedDb1 } = await supabaseLeads
            .from('employees')
            .select('*')
            .eq('id', db2Emp.db1_employee_id)
            .maybeSingle()

          if (resolvedDb1) {
            return this.mapRowToEmployee(resolvedDb1)
          }
        }
        return this.mapRowToEmployee(db2Emp)
      }

      return null
    } catch (err) {
      console.error(`Error fetching employee with id ${id}:`, err)
      return null
    }
  },

  async save(employee: Employee): Promise<Employee> {
    const row = this.mapEmployeeToRow(employee)
    const { error } = await supabaseLeads
      .from('employees')
      .upsert(row)

    if (error) {
      console.error('Error saving employee to DB1:', error)
      throw error
    }

    return employee
  },

  async update(
    id: string,
    fields: Partial<Omit<Employee, 'id' | 'createdAt'>>,
    actorId?: string
  ): Promise<Employee | null> {
    if (!id) throw new Error('Çalışan kimliği zorunludur.')

    // In browser environment, execute mutation through the server-authoritative API
    if (typeof window !== 'undefined' && typeof fetch === 'function') {
      const payload: any = {
        employeeId: id,
      }

      if (fields.fullName !== undefined) payload.fullName = fields.fullName
      if (fields.title !== undefined) payload.title = fields.title
      if (fields.email !== undefined) payload.email = fields.email
      if (fields.username !== undefined) payload.username = fields.username
      if (fields.employeeStatus !== undefined) payload.employeeStatus = fields.employeeStatus
      if (fields.workLocationStatus !== undefined) payload.workLocationStatus = fields.workLocationStatus
      if (fields.avatarUrl !== undefined) payload.avatarUrl = fields.avatarUrl
      if (fields.rolePackageId !== undefined) payload.rolePackageId = fields.rolePackageId
      if (fields.teamIds !== undefined) payload.teamIds = fields.teamIds
      if (fields.hasAdvancedCalendarAccess !== undefined) payload.hasAdvancedCalendarAccess = fields.hasAdvancedCalendarAccess
      if (fields.permissionOverrides !== undefined) payload.permissionOverrides = fields.permissionOverrides

      const res = await fetch('/api/auth-update-employee-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let errMsg = `Çalışan güncellenemedi (HTTP ${res.status})`
        try {
          const errData = await res.json()
          if (errData?.error) errMsg = errData.error
        } catch (_) {}
        throw new Error(errMsg)
      }

      const json = await res.json()
      if (!json?.ok || !json?.employee) {
        throw new Error(json?.error || 'CANONICAL_WRITE_FAILED: Sunucu geçerli bir çalışan kaydı döndürmedi.')
      }

      const canonicalEmployee = json.employee as Employee

      // STRICT READBACK INTEGRITY ASSERTIONS
      if (fields.fullName !== undefined && canonicalEmployee.fullName !== fields.fullName.trim()) {
        throw new Error(`READBACK_MISMATCH: Kaydedilen isim ("${canonicalEmployee.fullName}") ile talep edilen ("${fields.fullName}") eşleşmiyor.`)
      }
      if (fields.title !== undefined && canonicalEmployee.title !== fields.title.trim()) {
        throw new Error(`READBACK_MISMATCH: Kaydedilen unvan ("${canonicalEmployee.title}") ile talep edilen ("${fields.title}") eşleşmiyor.`)
      }
      if (fields.workLocationStatus !== undefined && canonicalEmployee.workLocationStatus !== fields.workLocationStatus) {
        throw new Error(`READBACK_MISMATCH: Kaydedilen çalışma konumu ile talep edilen eşleşmiyor.`)
      }
      if (fields.username !== undefined && fields.username && (canonicalEmployee.username || '') !== fields.username.trim().toLowerCase()) {
        throw new Error(`READBACK_MISMATCH: Kaydedilen kullanıcı adı ile talep edilen eşleşmiyor.`)
      }

      return canonicalEmployee
    }

    // Direct in-process execution fallback
    const row = this.mapEmployeeToRow(fields)
    row.updated_at = new Date().toISOString()
    if (actorId) row.updated_by = actorId

    const { data, error } = await supabaseLeads
      .from('employees')
      .update(row)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error(`Error updating employee ${id} in DB1:`, error)
      throw error
    }

    return data ? this.mapRowToEmployee(data) : null
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabaseLeads
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Error deleting employee ${id} in DB1:`, error)
      throw error
    }
  },

  async updateEmploymentType(
    employeeId: string,
    employmentType: EmploymentType | null
  ): Promise<boolean> {
    const res = await fetch('/api/auth-update-employee-employment-type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ employeeId, employmentType }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Failed to update employee employment type')
    }

    return true
  },

  getActiveId(): string | null {
    if (!isBrowser()) return null
    return window.localStorage.getItem(ACTIVE_EMPLOYEE_KEY)
  },

  setActiveId(id: string): void {
    if (!isBrowser()) return
    window.localStorage.setItem(ACTIVE_EMPLOYEE_KEY, id)
  },

  resolveOperationalEmployee(
    authEmployeeId: string | number | undefined | null,
    db2Employees: Employee[]
  ): Employee | null {
    if (!authEmployeeId || !Array.isArray(db2Employees)) return null
    const authIdStr = String(authEmployeeId)
    return db2Employees.find(
      (e) => (e.db1EmployeeId && String(e.db1EmployeeId) === authIdStr) || e.id === authIdStr
    ) || null
  }
}

export function resolveOperationalEmployee(
  authEmployeeId: string | number | undefined | null,
  db2Employees: Employee[]
): Employee | null {
  return EmployeeRepository.resolveOperationalEmployee(authEmployeeId, db2Employees)
}
