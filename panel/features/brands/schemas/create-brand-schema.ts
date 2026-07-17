import { z } from 'zod'

export const operationPlanItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Başlık zorunludur'),
  type: z.enum(['content', 'advertising', 'shooting', 'reporting', 'analysis', 'operation', 'custom']),
  target: z.number().min(0, 'Hedef adet en az 0 olmalıdır'),
  completed: z.number().min(0, 'Gerçekleşen adet en az 0 olmalıdır'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  workflowTemplateId: z.string().optional(),
  operationTemplateId: z.string().optional(),
})

export const brandAssignmentSchema = z.object({
  id: z.string(),
  employeeId: z.string().min(1, 'Çalışan seçilmelidir'),
  responsibility: z.string().min(1, 'Sorumluluk zorunludur'),
  roleLabel: z.string(),
  permissions: z.array(z.string()).optional(),
})

export const createBrandSchema = z.object({
  name: z
    .string()
    .min(2, 'Marka adı en az 2 karakter olmalıdır')
    .max(100, 'Marka adı en fazla 100 karakter olabilir'),
  instagram: z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  contactPerson: z
    .string()
    .min(2, 'Yetkili kişi adı en az 2 karakter olmalıdır')
    .max(100, 'Yetkili kişi adı en fazla 100 karakter olabilir'),
  phone: z
    .string()
    .min(7, 'Telefon numarası en az 7 karakter olmalıdır')
    .max(20, 'Telefon numarası en fazla 20 karakter olabilir'),
  email: z.string().email('Geçerli bir e-posta adresi girin').optional().or(z.literal('')),
  operationManagerId: z.string().min(1, 'Sorumlu operasyon yöneticisi seçin'),
  startDate: z.string().min(1, 'Başlangıç tarihi seçin'),
  status: z.enum(['active', 'inactive']),
  selectedPackageId: z.enum(['eko', 'business', 'booster']),
  operationPlan: z.array(operationPlanItemSchema).min(1, 'En az bir operasyon kalemi bulunmalıdır'),
  brandAssignments: z.array(brandAssignmentSchema).optional(),
})

export type CreateBrandFormValues = z.infer<typeof createBrandSchema>

export const defaultBrandFormValues: CreateBrandFormValues = {
  name: '',
  instagram: '',
  website: '',
  contactPerson: '',
  phone: '',
  email: '',
  operationManagerId: '',
  startDate: new Date().toISOString().split('T')[0],
  status: 'active',
  selectedPackageId: 'eko',
  operationPlan: [],
  brandAssignments: [],
}
