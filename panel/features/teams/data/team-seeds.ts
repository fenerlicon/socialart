import type { Team } from '@/types/domain'

/**
 * Takımlar / sorumluluk alanları.
 * Kullanıcı birden fazla takıma dahil olabilir.
 * Her takım, rol paketi varsayılanlarına göre önerilen ek yetkiler sunar. Bu öneriler manuel uygulanmalıdır.
 */
export const TEAM_SEEDS: Team[] = [
  {
    id: 'merkezi-operasyon',
    name: 'Merkezi Operasyon',
    description: 'Ajans geneli operasyon koordinasyonu ve süreç yönetimi.',
    teamPermissions: [
      'workflow.view',
      'workflow.edit',
      'tasks.transfer',
      'reports.manage',
    ],
  },
  {
    id: 'strateji-musteri',
    name: 'Strateji & Müşteri',
    description: 'Strateji geliştirme ve müşteri ilişkileri sorumluluk alanı.',
    teamPermissions: [
      'brands.edit',
      'crm.view',
      'crm.leads',
      'crm.proposals',
    ],
  },
  {
    id: 'dijital-pazarlama',
    name: 'Dijital Pazarlama',
    description: 'Dijital kampanya ve performans odaklı sorumluluk alanı.',
    teamPermissions: ['workflow.view', 'brands.view', 'brands.edit'],
  },
  {
    id: 'sosyal-medya',
    name: 'Sosyal Medya',
    description: 'Sosyal medya içerik ve yayın sorumluluk alanı.',
    teamPermissions: ['workflow.view', 'brands.view'],
  },
  {
    id: 'kreatif-koordinasyon',
    name: 'Kreatif Koordinasyon',
    description: 'Kreatif ekipler arası koordinasyon ve brief akışı.',
    teamPermissions: [
      'tasks.assign',
      'tasks.transfer',
      'workflow.view',
      'workflow.edit',
      'brands.view',
      'brands.edit',
    ],
  },
  {
    id: 'grafik-studyo',
    name: 'Grafik Stüdyo',
    description: 'Grafik tasarım üretim ekibi.',
    teamPermissions: ['tasks.create', 'brands.view'],
  },
  {
    id: 'post-produksiyon',
    name: 'Post Prodüksiyon',
    description: 'Video kurgu ve post-prodüksiyon ekibi.',
    teamPermissions: ['tasks.create', 'brands.view'],
  },
  {
    id: 'fotograf-studyo',
    name: 'Fotoğraf Stüdyo',
    description: 'Fotoğraf çekim ve stüdyo üretim ekibi.',
    teamPermissions: ['tasks.create', 'brands.view'],
  },
  {
    id: 'video-produksiyon',
    name: 'Video Prodüksiyon',
    description: 'Video çekim ve prodüksiyon ekibi.',
    teamPermissions: ['tasks.create', 'brands.view'],
  },
  {
    id: 'crm-satis',
    name: 'CRM & Satış',
    description:
      'Lead, teklif ve müşteri takibi sorumluluk alanı. CRM modül erişimi buradan açılır.',
    teamPermissions: [
      'crm.view',
      'crm.leads',
      'crm.proposals',
      'crm.manage',
    ],
  },
]

export const TEAMS_BY_ID = Object.fromEntries(
  TEAM_SEEDS.map((team) => [team.id, team]),
) as Record<Team['id'], Team>

export function getTeamById(id: Team['id']): Team {
  const team = TEAMS_BY_ID[id]
  if (!team) {
    throw new Error(`Takım bulunamadı: ${id}`)
  }
  return team
}

export function getTeamsByIds(ids: Team['id'][]): Team[] {
  return ids.map(getTeamById)
}
