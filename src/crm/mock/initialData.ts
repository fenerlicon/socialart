import { Lead, StageConfig } from '../types/crm';

export const STAGES: StageConfig[] = [
  {
    id: 'NEW',
    label: 'Geldi (Yeni Lead)',
    color: 'from-blue-500 to-indigo-600',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    badgeText: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    description: 'Siteden veya Meta reklamlarından gelen yeni başvurular'
  },
  {
    id: 'CONTACTED',
    label: 'İletişime Geçildi',
    color: 'from-cyan-500 to-blue-500',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    badgeText: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    description: 'Telefon veya WhatsApp üzerinden ilk ihtiyaç analizi yapıldı'
  },
  {
    id: 'PROPOSAL_SENT',
    label: 'Teklif Gönderildi',
    color: 'from-purple-500 to-indigo-500',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    badgeText: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    description: 'Sunum ve fiyat teklifi müşteriye iletildi'
  },
  {
    id: 'WAITING',
    label: 'Teklif Bekliyor',
    color: 'from-amber-500 to-orange-500',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    badgeText: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    description: 'Müşteri onay / revize / karar aşamasında'
  },
  {
    id: 'RETARGETING',
    label: 'Retargeting / İleride',
    color: 'from-pink-500 to-rose-500',
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    badgeText: 'text-pink-400',
    borderColor: 'border-pink-500/40',
    description: 'Şu an bütçe/zaman uygun değil, ileride yeniden aranacak'
  },
  {
    id: 'WON',
    label: 'Kazanıldı 🏆',
    color: 'from-emerald-500 to-green-600',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    description: 'Sözleşme imzalandı, ödeme alındı veya proje başladı'
  },
  {
    id: 'LOST',
    label: 'Kaybedildi ❌',
    color: 'from-slate-600 to-gray-700',
    badgeBg: 'bg-slate-800 text-slate-400 border-slate-700',
    badgeText: 'text-slate-400',
    borderColor: 'border-slate-700',
    description: 'Bütçe uyuşmazlığı veya rakip ajans seçimi'
  }
];

export const INITIAL_LEADS: Lead[] = [
  // PRODÜKSİYON LEADS
  {
    id: 'lead-prod-1',
    pipeline: 'PRODUCTION',
    title: 'Nova Holding Fabrika Tanıtım Filmi',
    contactName: 'Ahmet Yılmaz',
    email: 'ahmet@novaholding.com.tr',
    phone: '+90 532 111 2233',
    city: 'İstanbul',
    source: 'META_ADS',
    metaCampaignName: 'Meta Ads - B2B Prodüksiyon Kampanyası (Q3)',
    stage: 'NEW',
    priority: 'HIGH',
    assignedTo: 'Caner K.',
    createdAt: '2026-07-19T14:30:00Z',
    updatedAt: '2026-07-19T14:30:00Z',
    productionDetails: {
      projectType: 'Tanıtım Filmi',
      budget: null,
      estimatedDurationDays: 3,
      shootingLocation: 'Gebze Organize Sanayi'
    },
    notes: [
      {
        id: 'note-1',
        author: 'Sistem',
        text: 'Meta Lead Ads form dolduruldu: "Fabrikamız için 4K Drone destekli tanıtım filmi istiyoruz."',
        createdAt: '2026-07-19T14:30:00Z'
      }
    ],
    activities: [
      {
        id: 'act-1',
        title: 'Lead Oluşturuldu (Meta Ads)',
        date: '2026-07-19T14:30:00Z',
        type: 'STAGE_CHANGE'
      }
    ]
  },
  {
    id: 'lead-prod-2',
    pipeline: 'PRODUCTION',
    title: 'Artisan Cafe Marka Reklam Çekimi',
    contactName: 'Elif Kaya',
    email: 'elif@artisancafe.co',
    phone: '+90 533 444 5566',
    city: 'İzmir',
    source: 'WEBSITE',
    stage: 'CONTACTED',
    priority: 'MEDIUM',
    assignedTo: 'Burak A.',
    createdAt: '2026-07-18T10:15:00Z',
    updatedAt: '2026-07-18T16:20:00Z',
    productionDetails: {
      projectType: 'Reklam Çekimi',
      budget: 95000,
      estimatedDurationDays: 1,
      shootingLocation: 'Alsancak Şubesi'
    },
    notes: [
      {
        id: 'note-2',
        author: 'Burak A.',
        text: 'Telefonla görüşüldü. Yeni kahve serisi lansmanı için 3 adet 30sn sosyal medya reklam filmi istiyorlar.',
        createdAt: '2026-07-18T16:20:00Z'
      }
    ],
    activities: [
      {
        id: 'act-2',
        title: 'İlk Görüşme Yapıldı',
        date: '2026-07-18T16:20:00Z',
        type: 'CALL'
      }
    ]
  },
  {
    id: 'lead-prod-3',
    pipeline: 'PRODUCTION',
    title: 'Verve Tech Yazılım Lansman Videosu',
    contactName: 'Mert Aksoy',
    email: 'mert@vervetech.io',
    phone: '+90 535 777 8899',
    city: 'Ankara',
    source: 'WEBSITE',
    stage: 'PROPOSAL_SENT',
    priority: 'URGENT',
    assignedTo: 'Caner K.',
    createdAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-07-17T11:45:00Z',
    productionDetails: {
      projectType: 'Tanıtım Filmi',
      budget: 240000,
      estimatedDurationDays: 4,
      shootingLocation: 'Ankara ODTÜ Teknokent'
    },
    notes: [
      {
        id: 'note-3',
        author: 'Caner K.',
        text: 'VFX ve 3D Animasyon destekli teklif dosyası PDF olarak gönderildi (240.000 ₺ + KDV).',
        createdAt: '2026-07-17T11:45:00Z'
      }
    ],
    activities: [
      {
        id: 'act-3',
        title: 'Teklif Gönderildi',
        date: '2026-07-17T11:45:00Z',
        type: 'PROPOSAL'
      }
    ]
  },
  {
    id: 'lead-prod-4',
    pipeline: 'PRODUCTION',
    title: 'Luxe Residence Gayrimenkul Çekimi',
    contactName: 'Selin Demir',
    email: 'selin@luxeresidence.com',
    phone: '+90 530 999 0011',
    city: 'Antalya',
    source: 'META_ADS',
    metaCampaignName: 'Meta Ads - Gayrimenkul Prodüksiyon',
    stage: 'WAITING',
    priority: 'MEDIUM',
    assignedTo: 'Burak A.',
    createdAt: '2026-07-12T13:20:00Z',
    updatedAt: '2026-07-16T15:10:00Z',
    productionDetails: {
      projectType: 'Ürün / Fotoğraf',
      budget: 130000,
      estimatedDurationDays: 2,
      shootingLocation: 'Lara Proje Alanı'
    },
    notes: [
      {
        id: 'note-4',
        author: 'Burak A.',
        text: 'Teklif incelemedeler. Yönetim kurulu haftaya Cuma toplanacakmış.',
        createdAt: '2026-07-16T15:10:00Z'
      }
    ],
    activities: []
  },
  {
    id: 'lead-prod-5',
    pipeline: 'PRODUCTION',
    title: 'Peak Fashion Sonbahar Koleksiyon Çekimi',
    contactName: 'Deniz Şahin',
    email: 'deniz@peakfashion.com',
    phone: '+90 532 333 4455',
    city: 'İstanbul',
    source: 'META_ADS',
    metaCampaignName: 'Meta Ads - Moda & Lookbook Prodüksiyon',
    stage: 'RETARGETING',
    priority: 'LOW',
    assignedTo: 'Caner K.',
    createdAt: '2026-06-20T11:00:00Z',
    updatedAt: '2026-07-10T10:00:00Z',
    retargetingDate: '2026-09-01',
    retargetingNote: 'Sonbahar kreasyonu Eylül ayına ertelendi. Ağustos sonunda yeniden arayacağız.',
    productionDetails: {
      projectType: 'Ürün / Fotoğraf',
      budget: 160000,
      estimatedDurationDays: 3,
      shootingLocation: 'Stüdyo Maslak'
    },
    notes: [
      {
        id: 'note-5',
        author: 'Caner K.',
        text: 'Müşteri çekim bütçesini 3. çeyreğe kaydırdı. Retargeting listesine alındı.',
        createdAt: '2026-07-10T10:00:00Z'
      }
    ],
    activities: []
  },
  {
    id: 'lead-prod-6',
    pipeline: 'PRODUCTION',
    title: 'Gourmet Burger Reklam Serisi',
    contactName: 'Okan Kuru',
    email: 'okan@gourmetburger.tr',
    phone: '+90 538 222 3344',
    city: 'İstanbul',
    source: 'MANUAL',
    stage: 'WON',
    priority: 'HIGH',
    assignedTo: 'Burak A.',
    createdAt: '2026-07-01T09:30:00Z',
    updatedAt: '2026-07-14T17:00:00Z',
    productionDetails: {
      projectType: 'Reklam Çekimi',
      budget: 150000,
      estimatedDurationDays: 2,
      shootingLocation: 'Kadıköy Şubesi'
    },
    notes: [
      {
        id: 'note-6',
        author: 'Burak A.',
        text: 'Sözleşme imzalandı %50 avans hesaba yattı. Çekim günü 25 Temmuz.',
        createdAt: '2026-07-14T17:00:00Z'
      }
    ],
    activities: []
  },

  // SOSYAL MEDYA LEADS
  {
    id: 'lead-sm-1',
    pipeline: 'SOCIAL_MEDIA',
    title: 'Dental Klinik A.Ş. Sosyal Medya Yönetimi',
    contactName: 'Dr. Serkan Tunç',
    email: 'serkan@dentalklinik.com',
    phone: '+90 532 888 9900',
    city: 'İstanbul',
    source: 'META_ADS',
    metaCampaignName: 'Meta Ads - Sağlık & Medikal Sosyal Medya',
    stage: 'NEW',
    priority: 'HIGH',
    assignedTo: 'Zeynep S.',
    createdAt: '2026-07-19T18:10:00Z',
    updatedAt: '2026-07-19T18:10:00Z',
    socialMediaDetails: {
      monthlyBudget: null,
      platforms: ['Instagram', 'TikTok', 'YouTube'],
      monthlyReelsCount: 16,
      industry: 'Sağlık / Medikal'
    },
    notes: [
      {
        id: 'note-sm-1',
        author: 'Sistem',
        text: 'Meta Lead Form: "Aylık doktor Reels çekimleri ve Instagram reklam yönetimi istiyoruz."',
        createdAt: '2026-07-19T18:10:00Z'
      }
    ],
    activities: []
  },
  {
    id: 'lead-sm-2',
    pipeline: 'SOCIAL_MEDIA',
    title: 'Zest Organik E-Ticaret Markası',
    contactName: 'Aylin Çelik',
    email: 'aylin@zestorganik.com',
    phone: '+90 536 555 6677',
    city: 'İzmir',
    source: 'WEBSITE',
    stage: 'CONTACTED',
    priority: 'MEDIUM',
    assignedTo: 'Zeynep S.',
    createdAt: '2026-07-17T11:00:00Z',
    updatedAt: '2026-07-18T14:15:00Z',
    socialMediaDetails: {
      monthlyBudget: 35000,
      platforms: ['Instagram', 'TikTok'],
      monthlyReelsCount: 12,
      industry: 'E-Ticaret / Gıda'
    },
    notes: [
      {
        id: 'note-sm-2',
        author: 'Zeynep S.',
        text: 'UGC içerik üreticileri ile çalışmak istiyorlar. Brief alındı.',
        createdAt: '2026-07-18T14:15:00Z'
      }
    ],
    activities: []
  },
  {
    id: 'lead-sm-3',
    pipeline: 'SOCIAL_MEDIA',
    title: 'Apex Hukuk & Danışmanlık',
    contactName: 'Av. Mehmet Can',
    email: 'mehmet@apexhukuk.com',
    phone: '+90 531 666 7788',
    city: 'Ankara',
    source: 'WEBSITE',
    stage: 'PROPOSAL_SENT',
    priority: 'MEDIUM',
    assignedTo: 'Zeynep S.',
    createdAt: '2026-07-14T09:30:00Z',
    updatedAt: '2026-07-16T16:00:00Z',
    socialMediaDetails: {
      monthlyBudget: 30000,
      platforms: ['LinkedIn', 'Instagram'],
      monthlyReelsCount: 8,
      industry: 'Kurumsal / Danışmanlık'
    },
    notes: [
      {
        id: 'note-sm-3',
        author: 'Zeynep S.',
        text: 'Aylık 30.000 ₺ içerik + LinkedIn bülten stratejisi paket teklifi yollandı.',
        createdAt: '2026-07-16T16:00:00Z'
      }
    ],
    activities: []
  },
  {
    id: 'lead-sm-4',
    pipeline: 'SOCIAL_MEDIA',
    title: 'FitLife Spor Salonu Zinciri',
    contactName: 'Hakan Şen',
    email: 'hakan@fitlife.com.tr',
    phone: '+90 534 222 1100',
    city: 'Bursa',
    source: 'META_ADS',
    metaCampaignName: 'Meta Ads - Spor & Fitness Sosyal Medya',
    stage: 'RETARGETING',
    priority: 'MEDIUM',
    assignedTo: 'Zeynep S.',
    createdAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-07-05T12:00:00Z',
    retargetingDate: '2026-08-15',
    retargetingNote: 'Yeni şube açılışı Ağustos ortasında. O zaman 6 aylık sözleşme konuşulacak.',
    socialMediaDetails: {
      monthlyBudget: 50000,
      platforms: ['Instagram', 'TikTok'],
      monthlyReelsCount: 20,
      industry: 'Spor & Sağlık'
    },
    notes: [
      {
        id: 'note-sm-4',
        author: 'Zeynep S.',
        text: 'Ağustos ayında 3. şube açıldığında başlanacak. Retargeting takvimine eklendi.',
        createdAt: '2026-07-05T12:00:00Z'
      }
    ],
    activities: []
  },
  {
    id: 'lead-sm-5',
    pipeline: 'SOCIAL_MEDIA',
    title: 'Solera Mimarlık & İç Tasarım',
    contactName: 'Merve Soylu',
    email: 'merve@soleradesign.com',
    phone: '+90 533 111 4422',
    city: 'İstanbul',
    source: 'MANUAL',
    stage: 'WON',
    priority: 'HIGH',
    assignedTo: 'Zeynep S.',
    createdAt: '2026-07-01T15:00:00Z',
    updatedAt: '2026-07-10T11:00:00Z',
    socialMediaDetails: {
      monthlyBudget: 60000,
      platforms: ['Instagram', 'YouTube'],
      monthlyReelsCount: 12,
      industry: 'Mimarlık & Dekorasyon'
    },
    notes: [
      {
        id: 'note-sm-5',
        author: 'Zeynep S.',
        text: '1 Yıllık sözleşme bağlandı. Aylık 60.000 TL + Reklam Yönetim Ücreti.',
        createdAt: '2026-07-10T11:00:00Z'
      }
    ],
    activities: []
  }
];
