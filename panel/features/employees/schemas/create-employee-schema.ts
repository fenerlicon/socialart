import { z } from 'zod'
import {
  EMPLOYEE_STATUSES,
  WORK_LOCATION_STATUSES,
  type RolePackageId,
  type TeamId,
} from '@/types/domain'
import { ROLE_PACKAGE_SEEDS } from '@/features/role-packages/data/role-package-seeds'

const rolePackageIds = ROLE_PACKAGE_SEEDS.map((p) => p.id) as [
  RolePackageId,
  ...RolePackageId[],
]

export const createEmployeeSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Ad soyad en az 2 karakter olmalıdır')
    .max(120, 'Ad soyad en fazla 120 karakter olabilir'),
  email: z
    .string()
    .email('Geçerli bir e-posta adresi girin')
    .optional()
    .or(z.literal('')),
  username: z
    .string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .max(50, 'Kullanıcı adı en fazla 50 karakter olabilir')
    .optional()
    .or(z.literal('')),
  title: z
    .string()
    .min(1, 'Unvan zorunludur')
    .max(100, 'Unvan en fazla 100 karakter olabilir'),
  avatarUrl: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
  employeeStatus: z.enum(EMPLOYEE_STATUSES),
  workLocationStatus: z.enum(WORK_LOCATION_STATUSES),
  rolePackageId: z
    .enum(rolePackageIds, {
      errorMap: () => ({ message: 'Geçerli bir rol paketi seçin' }),
    })
    .nullable()
    .optional()
    .or(z.literal('')),
  teamIds: z.array(z.string()).default([]),
  permissionOverrides: z.record(z.string(), z.boolean()).default({}),
  hasAdvancedCalendarAccess: z.boolean().default(false),
})

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>

export const defaultEmployeeFormValues: CreateEmployeeFormValues = {
  fullName: '',
  email: '',
  username: '',
  title: '',
  avatarUrl: '',
  employeeStatus: 'active',
  workLocationStatus: 'office',
  rolePackageId: 'operasyon-yonetimi',
  teamIds: [],
  permissionOverrides: {},
  hasAdvancedCalendarAccess: false,
}
