import type { RolePackage } from '@/types/domain'

/**
 * Ana rol paketleri — başlangıç yetki şablonları.
 * CRM bir modüldür; burada rol paketi olarak yer almaz.
 * Admin yetkileri system.* altında ayrı override ile verilir.
 */
export const ROLE_PACKAGE_SEEDS: RolePackage[] = [
  {
    id: 'operasyon-yonetimi',
    name: 'Operasyon Yönetimi',
    description:
      'Ajans operasyon akışı, görev koordinasyonu, workflow ve marka ilerleme takibi.',
    defaultPermissions: [
      'tasks.view',
      'tasks.create',
      'tasks.assign',
      'tasks.transfer',
      'tasks.manage',
      'workflow.view',
      'workflow.edit',
      'workflow.manage',
      'brands.view',
      'brands.edit',
      'brands.manage',
      'reports.view',
      'reports.submit',
      'reports.manage',
      'employees.view',
      'operations.view',
      'task.manage',
      'brand.manage',
      'team.manage',
      'approval.review',
      'settings.manage'
    ],
  },
  {
    id: 'strateji-musteri-yonetimi',
    name: 'Strateji & Müşteri Yönetimi',
    description:
      'Marka stratejisi, müşteri ilişkileri koordinasyonu ve operasyonel görünürlük.',
    defaultPermissions: [
      'tasks.view',
      'tasks.create',
      'tasks.assign',
      'brands.view',
      'brands.edit',
      'brands.manage',
      'crm.view',
      'crm.leads',
      'crm.proposals',
      'reports.view',
      'reports.submit',
    ],
  },
  {
    id: 'dijital-pazarlama',
    name: 'Dijital Pazarlama',
    description: 'Dijital kampanya planlama, marka operasyonu ve görev yürütme.',
    defaultPermissions: [
      'tasks.view',
      'tasks.create',
      'tasks.assign',
      'workflow.view',
      'brands.view',
      'brands.edit',
      'reports.view',
      'reports.submit',
    ],
  },
  {
    id: 'sosyal-medya-yonetimi',
    name: 'Sosyal Medya Yönetimi',
    description: 'Sosyal medya içerik akışı, marka takibi ve görev yönetimi.',
    defaultPermissions: [
      'tasks.view',
      'tasks.create',
      'workflow.view',
      'brands.view',
      'reports.view',
      'reports.submit',
    ],
  },
  {
    id: 'kreatif-yonetim',
    name: 'Kreatif Yönetim',
    description:
      'Kreatif süreç koordinasyonu, ekip yönetimi ve marka operasyon görünürlüğü.',
    defaultPermissions: [
      'tasks.view',
      'tasks.create',
      'tasks.assign',
      'tasks.transfer',
      'workflow.view',
      'workflow.edit',
      'brands.view',
      'brands.edit',
      'reports.view',
      'reports.submit',
      'reports.manage',
      'operations.view',
      'task.manage',
      'team.manage',
      'approval.review'
    ],
  },
  {
    id: 'kreatif-direktor',
    name: 'Kreatif Direktör',
    description: 'Kreatif süreçlerin yönetimi, sanat yönetmenliği ve onay süreçleri.',
    defaultPermissions: [
      'tasks.view',
      'tasks.create',
      'tasks.assign',
      'tasks.transfer',
      'workflow.view',
      'workflow.edit',
      'brands.view',
      'reports.view',
      'reports.submit',
      'approval.review'
    ],
  },
  {
    id: 'grafik-tasarim',
    name: 'Grafik Tasarım',
    description: 'Grafik üretim görevleri ve marka görsel süreçleri.',
    defaultPermissions: [
      'tasks.view',
      'tasks.create',
      'brands.view',
      'reports.view',
      'reports.submit',
    ],
  },
  {
    id: 'video-kurgu',
    name: 'Video Kurgu',
    description: 'Post-prodüksiyon ve kurgu görevleri.',
    defaultPermissions: [
      'tasks.view',
      'tasks.create',
      'brands.view',
      'reports.view',
      'reports.submit',
    ],
  },
  {
    id: 'fotograf-uretimi',
    name: 'Fotoğraf Üretimi',
    description: 'Fotoğraf çekim ve üretim görevleri.',
    defaultPermissions: [
      'tasks.view',
      'tasks.create',
      'brands.view',
      'reports.view',
      'reports.submit',
    ],
  },
  {
    id: 'video-uretimi',
    name: 'Video Üretimi',
    description: 'Video prodüksiyon ve saha çekim görevleri.',
    defaultPermissions: [
      'tasks.view',
      'tasks.create',
      'brands.view',
      'reports.view',
      'reports.submit',
    ],
  },
]

export const ROLE_PACKAGES_BY_ID = Object.fromEntries(
  ROLE_PACKAGE_SEEDS.map((pkg) => [pkg.id, pkg]),
) as Record<RolePackage['id'], RolePackage>

export function getRolePackageById(id: RolePackage['id']): RolePackage {
  const pkg = ROLE_PACKAGES_BY_ID[id]
  if (!pkg) {
    throw new Error(`Rol paketi bulunamadı: ${id}`)
  }
  return pkg
}
