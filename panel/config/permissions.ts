import { MODULES, type ModuleId } from '@/config/modules'

// ---------------------------------------------------------------------------
// Permission keys — modül.action formatı
// ---------------------------------------------------------------------------

export const PERMISSION_KEYS = [
  // tasks
  'tasks.view',
  'tasks.create',
  'tasks.assign',
  'tasks.transfer',
  'tasks.manage',

  // workflow
  'workflow.view',
  'workflow.edit',
  'workflow.manage',

  // brands
  'brands.view',
  'brands.edit',
  'brands.manage',

  // crm (ayrı modül — rol paketi değil)
  'crm.view',
  'crm.leads',
  'crm.proposals',
  'crm.manage',

  // kpi
  'kpi.view',
  'kpi.evaluate',
  'kpi.manage',

  // workload
  'workload.view',
  'workload.analyze',
  'workload.manage',

  // ideas
  'ideas.view',
  'ideas.create',
  'ideas.manage',

  // reports
  'reports.view',
  'reports.submit',
  'reports.manage',

  // employees
  'employees.view',
  'employees.create',
  'employees.manage',

  // client_portal
  'client_portal.view',
  'client_portal.manage',

  // system (admin — rol paketi değil, özel override)
  'system.admin',
  'system.permissions',
  'system.settings',

  // calendar
  'calendar.view',
  'calendar.manage',

  // new custom management keys
  'operations.view',
  'task.manage',
  'brand.manage',
  'team.manage',
  'approval.review',
  'settings.manage',
] as const

export type PermissionKey = (typeof PERMISSION_KEYS)[number]

export interface PermissionDefinition {
  key: PermissionKey
  moduleId: ModuleId
  label: string
  description: string
  /** Prototip ekranında gösterilsin mi */
  availableInPrototype: boolean
}

export const PERMISSIONS: Record<PermissionKey, PermissionDefinition> = {
  'tasks.view': {
    key: 'tasks.view',
    moduleId: 'tasks',
    label: 'Görevleri görüntüle',
    description: 'Atanan ve erişilebilir görevleri listeler',
    availableInPrototype: true,
  },
  'tasks.create': {
    key: 'tasks.create',
    moduleId: 'tasks',
    label: 'Görev oluştur',
    description: 'Yeni görev açabilir',
    availableInPrototype: true,
  },
  'tasks.assign': {
    key: 'tasks.assign',
    moduleId: 'tasks',
    label: 'Görev ata / pasla',
    description: 'Görev atama ve doğrudan paslama',
    availableInPrototype: true,
  },
  'tasks.transfer': {
    key: 'tasks.transfer',
    moduleId: 'tasks',
    label: 'Transfer talebi yönet',
    description: 'Transfer taleplerini onaylar veya reddeder',
    availableInPrototype: true,
  },
  'tasks.manage': {
    key: 'tasks.manage',
    moduleId: 'tasks',
    label: 'Görev modülü yönetimi',
    description: 'Tüm görev ayarları ve geniş kapsamlı erişim',
    availableInPrototype: true,
  },

  'workflow.view': {
    key: 'workflow.view',
    moduleId: 'workflow',
    label: 'Workflow görüntüle',
    description: 'Marka süreçlerini ve aşamaları görür',
    availableInPrototype: true,
  },
  'workflow.edit': {
    key: 'workflow.edit',
    moduleId: 'workflow',
    label: 'Workflow düzenle',
    description: 'Süreç şablonlarını düzenler',
    availableInPrototype: true,
  },
  'workflow.manage': {
    key: 'workflow.manage',
    moduleId: 'workflow',
    label: 'Workflow yönetimi',
    description: 'Workflow modülü tam erişim',
    availableInPrototype: true,
  },

  'brands.view': {
    key: 'brands.view',
    moduleId: 'brands',
    label: 'Markaları görüntüle',
    description: 'Marka listesi ve ilerleme özetleri',
    availableInPrototype: true,
  },
  'brands.edit': {
    key: 'brands.edit',
    moduleId: 'brands',
    label: 'Marka düzenle',
    description: 'Marka bilgileri ve operasyon verileri',
    availableInPrototype: true,
  },
  'brands.manage': {
    key: 'brands.manage',
    moduleId: 'brands',
    label: 'Marka yönetimi',
    description: 'Marka modülü tam erişim',
    availableInPrototype: true,
  },

  'crm.view': {
    key: 'crm.view',
    moduleId: 'crm',
    label: 'CRM görüntüle',
    description: 'CRM modülüne erişim',
    availableInPrototype: true,
  },
  'crm.leads': {
    key: 'crm.leads',
    moduleId: 'crm',
    label: 'Lead yönetimi',
    description: 'Lead pipeline ve takip',
    availableInPrototype: true,
  },
  'crm.proposals': {
    key: 'crm.proposals',
    moduleId: 'crm',
    label: 'Teklif süreçleri',
    description: 'Teklif oluşturma ve takibi',
    availableInPrototype: true,
  },
  'crm.manage': {
    key: 'crm.manage',
    moduleId: 'crm',
    label: 'CRM yönetimi',
    description: 'CRM modülü tam erişim',
    availableInPrototype: true,
  },

  'kpi.view': {
    key: 'kpi.view',
    moduleId: 'kpi',
    label: 'KPI görüntüle',
    description: 'Performans metriklerini görür',
    availableInPrototype: true,
  },
  'kpi.evaluate': {
    key: 'kpi.evaluate',
    moduleId: 'kpi',
    label: 'KPI değerlendir',
    description: 'Çeyreklik değerlendirme yapar',
    availableInPrototype: true,
  },
  'kpi.manage': {
    key: 'kpi.manage',
    moduleId: 'kpi',
    label: 'KPI yönetimi',
    description: 'KPI kuralları ve puan sistemi',
    availableInPrototype: true,
  },

  'workload.view': {
    key: 'workload.view',
    moduleId: 'workload',
    label: 'İş yükü görüntüle',
    description: 'Yoğunluk ve risk seviyelerini görür',
    availableInPrototype: false,
  },
  'workload.analyze': {
    key: 'workload.analyze',
    moduleId: 'workload',
    label: 'İş yükü analizi',
    description: 'Dağılım önerileri ve analiz',
    availableInPrototype: false,
  },
  'workload.manage': {
    key: 'workload.manage',
    moduleId: 'workload',
    label: 'İş yükü yönetimi',
    description: 'İş yükü modülü tam erişim',
    availableInPrototype: false,
  },

  'ideas.view': {
    key: 'ideas.view',
    moduleId: 'ideas',
    label: 'Fikirleri görüntüle',
    description: 'Fikir merkezine erişim',
    availableInPrototype: true,
  },
  'ideas.create': {
    key: 'ideas.create',
    moduleId: 'ideas',
    label: 'Fikir oluştur',
    description: 'Yeni fikir ekler ve oy verir',
    availableInPrototype: true,
  },
  'ideas.manage': {
    key: 'ideas.manage',
    moduleId: 'ideas',
    label: 'Fikir merkezi yönetimi',
    description: 'Fikirleri göreve dönüştürme ve moderasyon',
    availableInPrototype: true,
  },

  'reports.view': {
    key: 'reports.view',
    moduleId: 'reports',
    label: 'Raporları görüntüle',
    description: 'Günlük raporları okur',
    availableInPrototype: true,
  },
  'reports.submit': {
    key: 'reports.submit',
    moduleId: 'reports',
    label: 'Rapor gönder',
    description: 'Günlük rapor oluşturur',
    availableInPrototype: true,
  },
  'reports.manage': {
    key: 'reports.manage',
    moduleId: 'reports',
    label: 'Rapor yönetimi',
    description: 'Tüm ekip raporlarına erişim',
    availableInPrototype: true,
  },

  'employees.view': {
    key: 'employees.view',
    moduleId: 'employees',
    label: 'Çalışanları görüntüle',
    description: 'Çalışan listesine erişim',
    availableInPrototype: true,
  },
  'employees.create': {
    key: 'employees.create',
    moduleId: 'employees',
    label: 'Çalışan ekle',
    description: 'Yeni çalışan oluşturur',
    availableInPrototype: true,
  },
  'employees.manage': {
    key: 'employees.manage',
    moduleId: 'employees',
    label: 'Çalışan yönetimi',
    description: 'Yetki ve çalışan düzenleme',
    availableInPrototype: true,
  },

  'client_portal.view': {
    key: 'client_portal.view',
    moduleId: 'client_portal',
    label: 'Müşteri paneli görüntüle',
    description: 'Müşteri tarafı önizleme',
    availableInPrototype: false,
  },
  'client_portal.manage': {
    key: 'client_portal.manage',
    moduleId: 'client_portal',
    label: 'Müşteri paneli yönetimi',
    description: 'Müşteri görünürlük ayarları',
    availableInPrototype: false,
  },

  'system.admin': {
    key: 'system.admin',
    moduleId: 'system',
    label: 'Sistem yöneticisi',
    description: 'Tam sistem erişimi — rol paketi değil, özel override',
    availableInPrototype: true,
  },
  'system.permissions': {
    key: 'system.permissions',
    moduleId: 'system',
    label: 'Yetki yönetimi',
    description: 'Rol paketi ve yetki yapılandırması',
    availableInPrototype: true,
  },
  'system.settings': {
    key: 'system.settings',
    moduleId: 'system',
    label: 'Sistem ayarları',
    description: 'Organizasyon ve sistem geneli ayarlar',
    availableInPrototype: true,
  },
  'calendar.view': {
    key: 'calendar.view',
    moduleId: 'calendar',
    label: 'Takvimi görüntüle',
    description: 'Ajans ve çekim takvimini listeler',
    availableInPrototype: true,
  },
  'calendar.manage': {
    key: 'calendar.manage',
    moduleId: 'calendar',
    label: 'Takvim yönetimi',
    description: 'Takvime etkinlik ekleme ve silme yetkisi',
    availableInPrototype: true,
  },
  'operations.view': {
    key: 'operations.view',
    moduleId: 'workflow',
    label: 'Canlı Operasyonları Görüntüle',
    description: 'Canlı operasyon akışlarını ve süreç durumlarını listeler',
    availableInPrototype: true,
  },
  'task.manage': {
    key: 'task.manage',
    moduleId: 'tasks',
    label: 'Görevleri Yönet',
    description: 'Görev oluşturma, atama, paslama ve düzenleme yetkisi',
    availableInPrototype: true,
  },
  'brand.manage': {
    key: 'brand.manage',
    moduleId: 'brands',
    label: 'Markaları Yönet',
    description: 'Marka profili, planları ve atamaları yönetir',
    availableInPrototype: true,
  },
  'team.manage': {
    key: 'team.manage',
    moduleId: 'employees',
    label: 'Ekibi Yönet',
    description: 'Çalışan listesini görme ve ekip düzenleme yetkisi',
    availableInPrototype: true,
  },
  'approval.review': {
    key: 'approval.review',
    moduleId: 'workflow',
    label: 'Onayları Yönet',
    description: 'İş akışı onay taleplerini inceler ve sonuçlandırır',
    availableInPrototype: true,
  },
  'settings.manage': {
    key: 'settings.manage',
    moduleId: 'system',
    label: 'Sistem Ayarlarını Yönet',
    description: 'Sistem geneli ayarları ve parametreleri düzenler',
    availableInPrototype: true,
  },
}

export const PROTOTYPE_PERMISSION_KEYS = PERMISSION_KEYS.filter(
  (key) => PERMISSIONS[key].availableInPrototype,
)

/** Modüle göre gruplanmış yetki listesi */
export function getPermissionsByModule(
  moduleIds?: ModuleId[],
): Record<ModuleId, PermissionDefinition[]> {
  const targetModules = moduleIds ?? (Object.keys(MODULES) as ModuleId[])
  const grouped = {} as Record<ModuleId, PermissionDefinition[]>

  for (const moduleId of targetModules) {
    grouped[moduleId] = []
  }

  for (const key of PERMISSION_KEYS) {
    const permission = PERMISSIONS[key]
    if (targetModules.includes(permission.moduleId)) {
      grouped[permission.moduleId].push(permission)
    }
  }

  return grouped
}

export function isPermissionKey(value: string): value is PermissionKey {
  return PERMISSION_KEYS.includes(value as PermissionKey)
}

/** Sistem admin yetkileri — hiçbir rol paketine otomatik atanmaz */
export const SYSTEM_ADMIN_PERMISSIONS: PermissionKey[] = [
  'system.admin',
  'system.permissions',
  'system.settings',
]
