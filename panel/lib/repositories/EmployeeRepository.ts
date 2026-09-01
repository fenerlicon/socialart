import { supabase } from '@/lib/supabase/client'
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
    
    // Remove credentials/username from overrides to prevent permission key validation errors
    delete overrides.username
    delete overrides.password

    const validEmploymentTypes = ['full_time', 'freelance', 'contractor', 'part_time']
    const employmentType = validEmploymentTypes.includes(row.employment_type) ? row.employment_type : null

    return {
      id: row.id,
      db1EmployeeId: row.db1_employee_id ? String(row.db1_employee_id) : null,
      fullName: row.full_name,
      email: row.email,
      title: row.title,
      avatarUrl: row.avatar_url,
      employeeStatus: row.employee_status,
      workLocationStatus: row.work_location_status,
      employmentType,
      rolePackageId: row.role_package_id,
      teamIds: row.team_ids || [],
      permissionOverrides: overrides,
      hasAdvancedCalendarAccess: row.has_advanced_calendar_access,
      username: username || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  // Map TypeScript camelCase Employee to Supabase snake_case row
  mapEmployeeToRow(employee: Partial<Employee>) {
    const row: any = {}
    if (employee.id !== undefined) row.id = employee.id
    if (employee.fullName !== undefined) row.full_name = employee.fullName
    // email is protected — updated via /api/auth-update-employee-identity
    // role_package_id is protected — updated via /api/auth-update-employee-role
    // employee_status is protected — updated via /api/auth-update-employee-identity
    // team_ids is protected — updated via /api/auth-update-employee-identity
    // has_advanced_calendar_access is protected — updated via /api/auth-update-employee-identity
    // employment_type is protected — updated via /api/auth-update-employee-employment-type
    if (employee.title !== undefined) row.title = employee.title
    
    if (employee.permissionOverrides !== undefined) {
      const safeOverrides = { ...(employee.permissionOverrides || {}) }
      // SECURITY: Strip all sensitive authorization keys and username from direct browser save
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
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name', { ascending: true })

      if (error || !data || data.length === 0) {
        console.warn('DB employees query issue, returning FALLBACK_EMPLOYEES:', error)
        return FALLBACK_EMPLOYEES
      }

      return data.map(this.mapRowToEmployee)
    } catch (err) {
      console.warn('Failed to fetch employees, returning FALLBACK_EMPLOYEES:', err)
      return FALLBACK_EMPLOYEES
    }
  },

  async getById(id: string): Promise<Employee | null> {
    if (!id) return null
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error(`Error fetching employee with id ${id}:`, error)
      throw error
    }

    return data ? this.mapRowToEmployee(data) : null
  },

  async save(employee: Employee): Promise<Employee> {
    // Client-side direct DB2 employee upsert is forbidden by architecture rules.
    // Employee creation is managed through server provisioning authority.
    return employee
  },

  async update(id: string, fields: Partial<Omit<Employee, 'id' | 'createdAt'>>, actorId?: string): Promise<Employee | null> {
    // All employee mutations are strictly server-authoritative via /api/auth-update-employee-identity
    try {
      const payload: any = {
        employeeId: id,
      }
      if (fields.fullName !== undefined) payload.fullName = fields.fullName
      if (fields.title !== undefined) payload.title = fields.title
      if (fields.workLocationStatus !== undefined) payload.workLocationStatus = fields.workLocationStatus
      if (fields.employeeStatus !== undefined) payload.employeeStatus = fields.employeeStatus
      if (fields.email !== undefined) payload.email = fields.email
      if (fields.teamIds !== undefined) payload.teamIds = fields.teamIds
      if (fields.hasAdvancedCalendarAccess !== undefined) payload.hasAdvancedCalendarAccess = fields.hasAdvancedCalendarAccess

      const res = await fetch('/api/auth-update-employee-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update employee through server authority')
      }
      return data.employee ? this.mapRowToEmployee(this.mapEmployeeToRow(data.employee)) : null
    } catch (err) {
      console.error(`Error updating employee ${id} via server authority:`, err)
      throw err
    }
  },

  async delete(id: string): Promise<void> {
    // Direct client DB2 employee deletion is forbidden.
    console.warn(`Direct client deletion of employee ${id} is disabled. Use server authority.`)
  },

  async updateEmploymentType(
    employeeId: string,
    employmentType: EmploymentType | null
  ): Promise<boolean> {
    const res = await fetch('/api/auth-update-employee-employment-type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
