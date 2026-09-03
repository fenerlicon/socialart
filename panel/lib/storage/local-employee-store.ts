import type { CreateEmployeeInput, Employee } from '@/types/domain'
import type { CreateEmployeeFormValues } from '@/features/employees/schemas/create-employee-schema'
import { v4 as uuidv4 } from 'uuid'
import { EmployeeRepository } from '@/lib/repositories/EmployeeRepository'

export function mapFormToCreateInput(
  values: CreateEmployeeFormValues,
): CreateEmployeeInput {
  return {
    fullName: values.fullName.trim(),
    email: values.email ? values.email.trim().toLowerCase() : '',
    username: values.username?.trim().toLowerCase() || undefined,
    title: values.title.trim(),
    avatarUrl: values.avatarUrl?.trim() || undefined,
    employeeStatus: values.employeeStatus,
    workLocationStatus: values.workLocationStatus,
    rolePackageId: values.rolePackageId || null,
    teamIds: values.teamIds as CreateEmployeeInput['teamIds'],
    permissionOverrides: values.permissionOverrides,
    hasAdvancedCalendarAccess: values.hasAdvancedCalendarAccess,
  }
}

export function createEmployeeFromInput(input: CreateEmployeeInput): Employee {
  const now = new Date().toISOString()
  return {
    id: uuidv4(),
    ...input,
    createdAt: now,
    updatedAt: now,
  }
}

export async function getStoredEmployees(): Promise<Employee[]> {
  return EmployeeRepository.getAll()
}

export async function getEmployeeById(id: string): Promise<Employee | undefined> {
  const emp = await EmployeeRepository.getById(id)
  return emp || undefined
}

export async function saveEmployee(employee: Employee): Promise<Employee[]> {
  await EmployeeRepository.save(employee)
  return EmployeeRepository.getAll()
}

export async function deleteEmployee(id: string, releaseResponsibilities: boolean = false): Promise<Employee[]> {
  await EmployeeRepository.delete(id, releaseResponsibilities)
  return EmployeeRepository.getAll()
}

export async function updateEmployee(
  id: string,
  updatedFields: Partial<Omit<Employee, 'id' | 'createdAt'>>
): Promise<Employee | undefined> {
  const emp = await EmployeeRepository.update(id, updatedFields)
  return emp || undefined
}

export async function createAndStoreEmployee(
  input: CreateEmployeeInput,
): Promise<Employee> {
  const employee = createEmployeeFromInput(input)
  await EmployeeRepository.save(employee)
  return employee
}

export function getActiveEmployeeId(): string | null {
  return EmployeeRepository.getActiveId()
}

export function setActiveEmployeeId(id: string): void {
  EmployeeRepository.setActiveId(id)
}

export function resolveOperationalEmployee(
  authEmployeeId: string | number | undefined | null,
  db2Employees: Employee[]
): Employee | null {
  return EmployeeRepository.resolveOperationalEmployee(authEmployeeId, db2Employees)
}
