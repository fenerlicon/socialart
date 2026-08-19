import { supabase } from '@/lib/supabase/client'
import type { Employee } from '@/types/domain'

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
    password: '',
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
    password: '',
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
    title: 'Kreatif Direktör',
    rolePackageId: 'kreatif-direktor',
    teamIds: ['kreatif-koordinasyon'],
    permissionOverrides: {},
    username: 'furkan',
    password: '',
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
    const password = overrides.password || ''
    
    // Remove credentials from overrides to prevent permission key validation errors
    delete overrides.username
    delete overrides.password

    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      title: row.title,
      rolePackageId: row.role_package_id,
      teamIds: row.team_ids || [],
      permissionOverrides: overrides,
      username,
      password,
      employeeStatus: row.employee_status,
      workLocationStatus: row.work_location_status,
      avatarUrl: row.avatar_url || undefined,
      hasAdvancedCalendarAccess:
        row.has_advanced_calendar_access === true ||
        row.has_advanced_calendar_access === 'true' ||
        overrides['calendar.view'] === true ||
        overrides['calendar.manage'] === true ||
        row.role_package_id === 'operasyon-yonetimi' ||
        row.role_package_id === 'kreatif-direktor' ||
        row.role_package_id === 'kreatif-yonetim',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  },

  // Map TypeScript Employee to Supabase snake_case insert/update object
  mapEmployeeToRow(employee: Partial<Employee>) {
    const row: any = {}
    if (employee.id !== undefined) row.id = employee.id
    if (employee.fullName !== undefined) row.full_name = employee.fullName
    if (employee.email !== undefined) row.email = employee.email
    if (employee.title !== undefined) row.title = employee.title
    if (employee.rolePackageId !== undefined) row.role_package_id = employee.rolePackageId
    if (employee.teamIds !== undefined) row.team_ids = employee.teamIds
    
    if (employee.permissionOverrides !== undefined || employee.username !== undefined || employee.password !== undefined) {
      const baseOverrides = employee.permissionOverrides || {}
      row.permission_overrides = {
        ...baseOverrides,
        username: employee.username !== undefined ? employee.username : (baseOverrides as any).username,
        password: employee.password !== undefined ? employee.password : (baseOverrides as any).password,
      }
    }
    
    if (employee.employeeStatus !== undefined) row.employee_status = employee.employeeStatus
    if (employee.workLocationStatus !== undefined) row.work_location_status = employee.workLocationStatus
    if (employee.avatarUrl !== undefined) row.avatar_url = employee.avatarUrl
    if (employee.hasAdvancedCalendarAccess !== undefined) row.has_advanced_calendar_access = employee.hasAdvancedCalendarAccess
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
    const row = this.mapEmployeeToRow(employee)
    const { error } = await supabase
      .from('employees')
      .upsert(row)

    if (error) {
      console.error('Error saving employee:', error)
      throw error
    }

    return employee
  },

  async update(id: string, fields: Partial<Omit<Employee, 'id' | 'createdAt'>>, actorId?: string): Promise<Employee | null> {
    const row = this.mapEmployeeToRow(fields)
    row.updated_at = new Date().toISOString()
    if (actorId) row.updated_by = actorId

    const { data, error } = await supabase
      .from('employees')
      .update(row)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error(`Error updating employee ${id}:`, error)
      throw error
    }

    return data ? this.mapRowToEmployee(data) : null
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Error deleting employee ${id}:`, error)
      throw error
    }
  },

  getActiveId(): string | null {
    if (!isBrowser()) return null
    return window.localStorage.getItem(ACTIVE_EMPLOYEE_KEY)
  },

  setActiveId(id: string): void {
    if (!isBrowser()) return
    window.localStorage.setItem(ACTIVE_EMPLOYEE_KEY, id)
  }
}
