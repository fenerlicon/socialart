/**
 * Canonical Shared Role Package Baseline Definitions
 * Single Source of Truth for both Next.js panel and Vercel serverless API.
 */

export const ROLE_PACKAGE_DEFINITIONS = [
  {
    id: 'operasyon-yonetimi',
    name: 'Operasyon Yönetimi',
    description: 'Ajans operasyon akışı, görev koordinasyonu, workflow ve marka ilerleme takibi.',
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
      'settings.manage',
      'calendar.view',
      'calendar.manage',
      'kpi.view',
      'kpi.evaluate',
      'kpi.manage'
    ]
  },
  {
    id: 'strateji-musteri-yonetimi',
    name: 'Strateji & Müşteri Yönetimi',
    description: 'Marka stratejisi, müşteri ilişkileri koordinasyonu ve operasyonel görünürlük.',
    defaultPermissions: [
      'tasks.view',
      'tasks.create',
      'brands.view',
      'brands.edit',
      'brands.manage',
      'crm.view',
      'crm.leads',
      'crm.proposals',
      'reports.view',
      'reports.submit',
      'calendar.view',
      'kpi.view'
    ]
  },
  {
    id: 'dijital-pazarlama',
    name: 'Dijital Pazarlama',
    description: 'Dijital kampanya planlama, marka operasyonu ve görev yürütme.',
    defaultPermissions: [
      'tasks.view',
      'tasks.create',
      'workflow.view',
      'brands.view',
      'brands.edit',
      'reports.view',
      'reports.submit',
      'calendar.view',
      'kpi.view'
    ]
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
      'calendar.view',
      'kpi.view'
    ]
  },
  {
    id: 'kreatif-yonetim',
    name: 'Kreatif Yönetim',
    description: 'Kreatif süreç koordinasyonu, ekip yönetimi ve marka operasyon görünürlüğü.',
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
      'approval.review',
      'calendar.view',
      'calendar.manage',
      'kpi.view',
      'kpi.evaluate',
      'kpi.manage'
    ]
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
      'approval.review',
      'calendar.view',
      'calendar.manage',
      'kpi.view'
    ]
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
      'kpi.view'
    ]
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
      'kpi.view'
    ]
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
      'kpi.view'
    ]
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
      'kpi.view'
    ]
  },
  {
    id: 'coso',
    name: 'Chief of Social (COSO)',
    description: 'Strateji ve sosyal medya operasyon koordinasyonu, içerik akışı, iş dağıtımı ve süreç onayı.',
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
      'approval.review',
      'calendar.view',
      'calendar.manage',
      'kpi.view',
      'kpi.evaluate'
    ]
  },
  {
    id: 'art-director',
    name: 'Art Director',
    description: 'Kreatif üretim trafiği, görsel/video tasarım koordinasyonu, revizyon ve ön onay yönetimi.',
    defaultPermissions: [
      'tasks.view',
      'tasks.create',
      'tasks.assign',
      'tasks.transfer',
      'workflow.view',
      'workflow.edit',
      'approval.review',
      'brands.view',
      'calendar.view',
      'calendar.manage',
      'operations.view',
      'task.manage',
      'reports.view',
      'reports.submit',
      'kpi.view'
    ]
  }
];

export const ROLE_PACKAGES_BY_ID = Object.fromEntries(
  ROLE_PACKAGE_DEFINITIONS.map((pkg) => [pkg.id, pkg])
);