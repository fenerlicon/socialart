export interface PackageItemSeed {
  operationTemplateId: string
  targetCount: number
}

export interface BrandPackageSeed {
  id: 'eko' | 'business' | 'booster'
  name: string
  description: string
  priceLabel: string
  items: PackageItemSeed[]
}

export const BRAND_PACKAGES: BrandPackageSeed[] = [
  {
    id: 'eko',
    name: 'Eko Paket',
    description: 'Temel sosyal medya ve reklam yönetimi ihtiyaçları için.',
    priceLabel: 'Ekonomik Başlangıç',
    items: [
      { operationTemplateId: 'reel', targetCount: 4 },
      { operationTemplateId: 'post', targetCount: 4 },
      { operationTemplateId: 'story', targetCount: 30 },
      { operationTemplateId: 'meta_reklam', targetCount: 1 },
      { operationTemplateId: 'report', targetCount: 1 }
    ]
  },
  {
    id: 'business',
    name: 'Business Paket',
    description: 'Büyümek isteyen orta ölçekli markalar için kapsamlı paket.',
    priceLabel: 'En Popüler',
    items: [
      { operationTemplateId: 'reel', targetCount: 8 },
      { operationTemplateId: 'story', targetCount: 60 },
      { operationTemplateId: 'post', targetCount: 4 },
      { operationTemplateId: 'graphic_design', targetCount: 4 },
      { operationTemplateId: 'page_design', targetCount: 1 },
      { operationTemplateId: 'creative_brand_design', targetCount: 1 },
      { operationTemplateId: 'meta_reklam', targetCount: 1 },
      { operationTemplateId: 'report', targetCount: 1 }
    ]
  },
  {
    id: 'booster',
    name: 'Booster Paket',
    description: 'Tam kapsamlı dijital pazarlama, prodüksiyon ve analiz desteği.',
    priceLabel: 'Maksimum Performans',
    items: [
      { operationTemplateId: 'reel', targetCount: 10 },
      { operationTemplateId: 'story', targetCount: 90 },
      { operationTemplateId: 'post', targetCount: 4 },
      { operationTemplateId: 'graphic_design', targetCount: 4 },
      { operationTemplateId: 'photo_shooting', targetCount: 1 },
      { operationTemplateId: 'promo_video', targetCount: 1 },
      { operationTemplateId: 'page_design', targetCount: 1 },
      { operationTemplateId: 'meta_reklam', targetCount: 1 },
      { operationTemplateId: 'google_ads', targetCount: 1 },
      { operationTemplateId: 'seo', targetCount: 1 },
      { operationTemplateId: 'crm_mgmt', targetCount: 1 },
      { operationTemplateId: 'report', targetCount: 1 },
      { operationTemplateId: 'competitor_analysis', targetCount: 1 },
      { operationTemplateId: 'market_analysis', targetCount: 1 }
    ]
  }
]
