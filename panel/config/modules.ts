/**
 * Sistem modülleri.
 * CRM bağımsız bir modüldür; rol paketi değildir.
 * Admin / sistem yetkileri `system` modülü altındadır.
 */

export const MODULE_IDS = [
  'tasks',
  'workflow',
  'brands',
  'crm',
  'kpi',
  'workload',
  'ideas',
  'reports',
  'employees',
  'client_portal',
  'system',
  'calendar',
] as const

export type ModuleId = (typeof MODULE_IDS)[number]

export interface ModuleDefinition {
  id: ModuleId
  name: string
  description: string
  /** Modül henüz geliştirilmediyse prototipte gizlenebilir */
  availableInPrototype: boolean
}

export const MODULES: Record<ModuleId, ModuleDefinition> = {
  tasks: {
    id: 'tasks',
    name: 'Görevler',
    description: 'Görev oluşturma, paslama, transfer ve deadline yönetimi',
    availableInPrototype: true,
  },
  workflow: {
    id: 'workflow',
    name: 'Workflow',
    description: 'Marka bazlı süreçler ve şablonlar',
    availableInPrototype: true,
  },
  brands: {
    id: 'brands',
    name: 'Markalar',
    description: 'Marka ilerleme ve operasyon takibi',
    availableInPrototype: true,
  },
  crm: {
    id: 'crm',
    name: 'CRM',
    description: 'Lead pipeline, teklif ve müşteri geçmişi',
    availableInPrototype: true,
  },
  kpi: {
    id: 'kpi',
    name: 'KPI',
    description: 'Kişi ve takım performans değerlendirmesi',
    availableInPrototype: true,
  },
  workload: {
    id: 'workload',
    name: 'İş Yükü',
    description: 'Yoğunluk analizi ve overload tespiti',
    availableInPrototype: false,
  },
  ideas: {
    id: 'ideas',
    name: 'Fikir Merkezi',
    description: 'Ekip fikirleri, oylama ve göreve dönüştürme',
    availableInPrototype: true,
  },
  reports: {
    id: 'reports',
    name: 'Günlük Rapor',
    description: 'Günlük operasyon raporları',
    availableInPrototype: true,
  },
  employees: {
    id: 'employees',
    name: 'Çalışanlar',
    description: 'Çalışan ve yetki yönetimi',
    availableInPrototype: true,
  },
  client_portal: {
    id: 'client_portal',
    name: 'Müşteri Paneli',
    description: 'Müşteri görünürlük ve teslim yönetimi',
    availableInPrototype: false,
  },
  system: {
    id: 'system',
    name: 'Sistem',
    description: 'Admin ve sistem düzeyi yetkiler (rol paketi değil)',
    availableInPrototype: true,
  },
  calendar: {
    id: 'calendar',
    name: 'Takvim',
    description: 'Etkinlikler, çekim tarihleri ve genel takvim görünümü',
    availableInPrototype: true,
  },
}

export const PROTOTYPE_MODULES = MODULE_IDS.filter(
  (id) => MODULES[id].availableInPrototype,
)

export function getModuleIdFromPermissionKey(key: string): ModuleId {
  let moduleId = key.split('.')[0]
  if (moduleId === 'operations') moduleId = 'workflow'
  if (moduleId === 'task') moduleId = 'tasks'
  if (moduleId === 'brand') moduleId = 'brands'
  if (moduleId === 'team') moduleId = 'employees'
  if (moduleId === 'approval') moduleId = 'workflow'
  if (moduleId === 'settings') moduleId = 'system'

  if (MODULE_IDS.includes(moduleId as ModuleId)) {
    return moduleId as ModuleId
  }
  throw new Error(`Geçersiz permission key: ${key}`)
}
