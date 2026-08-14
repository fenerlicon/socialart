// Brand-specific custom configurations for all active agency clients

// Comprehensive Brand Configuration System for SocialArt Client Portal 2.0
// Contains sector-tailored metadata, reverse-engineering competitor radar, authentic call sheets, Instagram grid data, and Drive archives.

export const BRAND_CONFIGS = {
  arayanvar: {
    id: 'c-arayanvar',
    slug: 'arayanvar',
    name: 'Arayanvar / Aryanvar',
    sector: 'Hizmet & SaaS Teknoloji',
    goalType: 'LEADS',
    adsActive: false,
    adInactiveMessage: 'Reklam kampanyanız şu anda strateji ve kreatif hazırlık aşamasındadır. Yayına alındığında tüm canlı harcama ve lead metrikleri anlık olarak burada akacaktır.',
    dedicatedManager: {
      name: 'Arda Furkan Aslanbaş',
      title: 'Kıdemli Ajans & Marka Direktörü',
      phone: '905000000000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    },
    metricsSummary: {
      volumeLabel: '🎯 Hedef: Müşteri Adayı (Lead)',
      volumeValue: '0 Lead (Başlamadı)',
      volumeSub: 'Kampanya kurulum aşamasında',
      unitCostLabel: '🎯 Lead Başı Maliyet (CPL)',
      unitCostValue: '₺0,00',
      unitCostSub: 'Reklam yayını bekleniyor',
      actionLabel: '📞 Görüşme & Randevu',
      actionValue: '0 Randevu'
    },
    competitors: [
      {
        name: 'Armut / Hizmet Pazarı',
        estimatedSpend: '₺120.000 - ₺180.000 / Ay',
        activeAdsCount: '28 Aktif Kreatif',
        formatDistribution: 'Reels %50, Carousel %30, Tek Görsel %20',
        targetAudience: 'Türkiye Geneli, 25-55 Yaş, Ev & Ofis Hizmeti Arayanlar',
        strategyNote: 'Fiyat odaklı ve "Usta Kapında" temalı dinamik lead formları kullanıyor.',
        counterStrategy: 'Arayanvar için güvenilirlik ve komisyonsuz doğrudan usta iletişimi kancasını öne çıkarıyoruz.',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=TR&q=Armut'
      },
      {
        name: 'Ustaoğlu / Usta Bul',
        estimatedSpend: '₺40.000 - ₺65.000 / Ay',
        activeAdsCount: '12 Aktif Kreatif',
        formatDistribution: 'Reels %70, Statik %30',
        targetAudience: 'İstanbul & Büyükşehirler, 24-50 Yaş',
        strategyNote: 'Bölgesel arama reklamları ve acil usta çağrısı videoları yayında.',
        counterStrategy: 'Hızlı çözüm yerine doğrulanmış usta profili ve şeffaf puanlama avantajı sunuyoruz.',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=TR&q=Ustao%C4%9Flu'
      }
    ],
    nextShooting: {
      date: '18 Ağustos 2026',
      time: '11:00 - 15:30',
      location: 'SocialArt Stüdyo & Ofis Çekim Platosu',
      fullAddress: 'SocialArt Kreatif Stüdyoları, Maslak Mah. Büyükdere Cad. No:42 Sarıyer/İstanbul',
      team: 'Yönetmen: Celal Ünlü | Işık: Ercan Özdemir | Prodüksiyon Amiri: Betül Ünlü',
      equipment: 'Sony FX3 Cine Kamera, DJI RS3 Pro Gimbal, Aputure 300D II, Sennheiser Kablosuz Mikrofon',
      dressCode: 'Düz renk, kurumsal mavi/beyaz/antrasit gömlek ve ceket kombinleri (logosuz)',
      target: '4 Dikey SaaS Reels & 20 Profesyonel Hizmet Arayüz Karesi'
    },
    instagramFeed: [
      { id: 1, type: 'REELS', date: 'Pazartesi, 18:00', title: 'Usta Bulmanın En Kolay Yolu', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80' },
      { id: 2, type: 'CAROUSEL', date: 'Çarşamba, 19:30', title: 'Ev Tadilatında Dikkat Edilecek 5 Şey', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&auto=format&fit=crop&q=80' },
      { id: 3, type: 'REELS', date: 'Cuma, 20:00', title: 'Arayanvar ile 15 Dakikada Çözüm', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' }
    ],
    productionLanes: [
      { id: 'lane-1', title: 'Ham Görüntü Arşivi', status: 'COMPLETED', progress: 100, taskName: '4K Arayüz & Hizmet Ham Çekimleri', assignee: 'Celal Ünlü' },
      { id: 'lane-2', title: 'Kurgu & Renk Masası', status: 'IN_PROGRESS', progress: 70, taskName: 'SaaS Platform Tanıtım Reels Kurgusu', assignee: 'Ercan Özdemir' },
      { id: 'lane-3', title: 'Müşteri İnceleme & Onay', status: 'PENDING', progress: 30, taskName: 'Çağrı Merkezi & Usta Eşleştirme Revizesi', assignee: 'Arda Furkan Aslanbaş' },
      { id: 'lane-4', title: 'Yayında / Arşivde', status: 'UPCOMING', progress: 0, taskName: 'Lansman Reklam Dağıtımı', assignee: 'Tuğba Özdemir' }
    ],
    reviewItems: [
      {
        id: 'rev-arayanvar-1',
        title: 'Arayanvar Platform Tanıtım & Hizmet Reels Kurgusu (Rev.2)',
        type: 'Video / 4K Reels Kurgu',
        duration: '0:38 sn',
        status: 'PENDING_APPROVAL',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-a-stylish-young-woman-working-at-a-cafe-9343/1080p.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
        description: 'Dikey formatta optimize edildi, çağrı merkezi ve usta eşleştirme akışı eklendi.'
      }
    ],
    drivePackages: [
      {
        id: 'pkg-arayanvar-1',
        title: 'Ağustos 2026 - 4K Master Video & Reels Paketi (Google Drive)',
        type: 'Video Masterları',
        size: '3.4 GB',
        date: '12 Ağustos 2026',
        itemsCount: '4 Dikey Reels + 1 YouTube Tanıtım Master',
        driveUrl: 'https://drive.google.com'
      }
    ]
  },

  mallofgurme: {
    id: 'c-mallofgurme',
    slug: 'mallofgurme',
    name: 'Mall Of Gurme',
    sector: 'Restoran & Gastronomi (Mall Of İstanbul)',
    goalType: 'ENGAGEMENT',
    adsActive: true,
    dedicatedManager: {
      name: 'Celal Ünlü',
      title: 'Kıdemli Prodüksiyon & Marka Yöneticisi',
      phone: '905000000000',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    metricsSummary: {
      volumeLabel: '🎬 Toplam Gösterim (Meta Canlı)',
      volumeValue: '5.009.355 Gösterim',
      volumeSub: '🚀 2.473.881 Tekil Kişiye Ulaşıldı',
      unitCostLabel: '💬 Tıklama Başı Maliyet (CPC)',
      unitCostValue: '₺2,72',
      unitCostSub: '📈 1.000 Gösterim (CPM): ₺36,60',
      actionLabel: '⚡ Toplam Tıklama',
      actionValue: '67.340 Tık'
    },
    competitors: [
      {
        name: 'BigChefs Cafe & Brasserie (Mall of İstanbul)',
        estimatedSpend: '₺60.000 - ₺90.000 / Ay',
        activeAdsCount: '16 Aktif Kreatif',
        formatDistribution: 'Reels %65, Carousel %25, Statik %10',
        targetAudience: 'İstanbul Başakşehir, İkitelli, Küçükçekmece (15 km Yarıçap), 22-50 Yaş',
        strategyNote: 'Yeni kokteyl menüsü ve modern bistro kahvaltısı videolarıyla hafta sonu trafiğini hedefliyor.',
        counterStrategy: 'Mall Of Gurme için "Ortaya Gelsin" et seçkisi ve zengin zırh kıyması ASMR kurgularıyla lezzet doygunluğunu öne çıkarıyoruz.',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=TR&q=BigChefs'
      },
      {
        name: 'Midpoint Restaurant (Mall of İstanbul)',
        estimatedSpend: '₺45.000 - ₺70.000 / Ay',
        activeAdsCount: '11 Aktif Kreatif',
        formatDistribution: 'Reels %60, Carousel %30, Statik %10',
        targetAudience: 'AVM Ziyaretçileri, Aileler & Genç Profesyoneller, 20-45 Yaş',
        strategyNote: 'Hafta içi akşam yemeği kampanyaları ve dünya mutfağı tabakları yayında.',
        counterStrategy: 'Sıfır israf "Seçmeli Kahvaltı" ve yerel Siirt Pervari balı doğallığıyla güven inşa ediyoruz.',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=TR&q=Midpoint'
      }
    ],
    nextShooting: {
      date: '20 Ağustos 2026',
      time: '14:30 - 18:30',
      location: 'Mall Of Gurme Restoran Alanı (Mall of İstanbul AVM)',
      fullAddress: 'Mall Of İstanbul AVM, Ziya Gökalp Mah. Süleyman Demirel Bulvarı 2. Kat No:218 Başakşehir/İstanbul',
      team: 'Yönetmen & Görüntü Yön.: Celal Ünlü | Işık & Renk: Ercan Özdemir | Ses: Batuhan K.',
      equipment: 'Sony FX3 4K Cine Kamera, 24-70mm GM II + 90mm Macro Lens, DJI RS3 Pro, Aputure 300D II + Lantern Softbox, Sennheiser Wireless Mic',
      dressCode: 'Siyah şef ceketleri, özenli servis önlükleri ve sıcak mekan aydınlatması uyumlu kurumsal giyim',
      target: '6 Dikey ASMR Yemek Hazırlık Reels, 2 Şef Masası Kurgusu & 25 Yüksek Çözünürlük Menü Fotoğrafı'
    },
    instagramFeed: [
      { id: 1, type: 'REELS', date: 'Aktif Yayında', title: 'Ortaya Gelsin Kuzu Lokum & Kebap', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80' },
      { id: 2, type: 'REELS', date: 'Aktif Yayında', title: 'Sıfır İsraf Seçmeli Kahvaltı Masası', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&auto=format&fit=crop&q=80' },
      { id: 3, type: 'REELS', date: 'Aktif Yayında', title: 'Siirt Pervari Yayla Doğal Balı', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop&q=80' },
      { id: 4, type: 'REELS', date: 'Aktif Yayında', title: 'Etin Ustalığı - Dry Aged Steak', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80' },
      { id: 5, type: 'CAROUSEL', date: 'Sıradaki Paylaşım', title: 'Mall Of Gurme İmza Lezzetler Menüsü', image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400&auto=format&fit=crop&q=80' },
      { id: 6, type: 'REELS', date: 'Sıradaki Paylaşım', title: 'Şefin Masası: Fındık Lahmacun & Meze', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80' }
    ],
    productionLanes: [
      { id: 'lane-1', title: 'Ham Görüntü Arşivi', status: 'COMPLETED', progress: 100, taskName: '4K 120fps Şef & Mutfak Ham Kartları', assignee: 'Celal Ünlü' },
      { id: 'lane-2', title: 'Kurgu & Renk Masası', status: 'COMPLETED', progress: 100, taskName: 'Ortaya Gelsin Kurgusu & ASMR Miksaj', assignee: 'Celal Ünlü' },
      { id: 'lane-3', title: 'Müşteri İnceleme & Onay', status: 'COMPLETED', progress: 100, taskName: 'Seçmeli Kahvaltı Reels Onaylandı', assignee: 'Celal Ünlü' },
      { id: 'lane-4', title: 'Yayında / Arşivde', status: 'IN_PROGRESS', progress: 95, taskName: '4 Aktif Meta Reklamı Yayında', assignee: 'Tuğba Özdemir' }
    ],
    reviewItems: [
      {
        id: 'rev-mallofgurme-1',
        title: 'Özel Izgara & Şef Masası Dinamik Reels Kurgusu',
        type: 'Video / 4K Kurgu',
        duration: '0:28 sn',
        status: 'PENDING_APPROVAL',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-chef-preparing-a-dish-in-a-restaurant-5221/1080p.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
        description: 'ASMR cızırtı sesleri eklendi, renk derecelendirmesi yapıldı.'
      }
    ],
    drivePackages: [
      {
        id: 'pkg-mallofgurme-1',
        title: 'Ağustos 2026 - 4K Menü & Reels Video Arşivi (Google Drive)',
        type: 'Video & Fotoğraf Arşivi',
        size: '5.8 GB',
        date: '10 Ağustos 2026',
        itemsCount: '6 Dikey Video + 35 Yüksek Kalite Yemek Karesi',
        driveUrl: 'https://drive.google.com'
      }
    ]
  },

  miocasa: {
    id: 'c-miocasa',
    slug: 'miocasa',
    name: 'MioCasa',
    sector: 'Mobilya, Mimarlık & Dekorasyon',
    goalType: 'LEADS',
    adsActive: true,
    dedicatedManager: {
      name: 'Ercan Özdemir',
      title: 'Kreatif Direktör',
      phone: '905000000000',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
    },
    metricsSummary: {
      volumeLabel: '🎬 Toplam Gösterim & Erişim',
      volumeValue: '3.257.115 Gösterim',
      volumeSub: '🚀 Meta Reklamları Yayında',
      unitCostLabel: '🎯 Tıklama Başı Maliyet (CPC)',
      unitCostValue: '₺3,56',
      unitCostSub: '📈 Lüks Segment & Mimari Lead Kampanyaları Aktif',
      actionLabel: '📐 Toplam Tıklama & Talep',
      actionValue: '66.024 Tıklama'
    },
    competitors: [
      {
        name: 'Lazzoni Furniture',
        estimatedSpend: '₺90.000 - ₺140.000 / Ay',
        activeAdsCount: '22 Aktif Kreatif',
        formatDistribution: 'Reels %45, Carousel %40, Statik %15',
        targetAudience: 'İstanbul & Bodrum/Çeşme, 30-60 Yaş, Lüks Yaşam & Mimarlık',
        strategyNote: 'Özel tasarım modern salon konseptleri ve mimari projelendirme formları yayında.',
        counterStrategy: 'MioCasa için kişiselleştirilmiş ahşap işçiliği ve butik mimari danışmanlık ayrışmasını vurguluyoruz.',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=TR&q=Lazzoni'
      },
      {
        name: 'Koleksiyon Mobilya',
        estimatedSpend: '₺60.000 - ₺95.000 / Ay',
        activeAdsCount: '14 Aktif Kreatif',
        formatDistribution: 'Reels %50, Statik %50',
        targetAudience: 'Kurumsal Ofisler & Villa Sahipleri, 35-65 Yaş',
        strategyNote: 'Ofis ve lüks yaşam alanı kurgularında mimar röportajlarına ağırlık veriyor.',
        counterStrategy: 'Yaşam alanlarına özel zamansız tasarım ve anahtar teslim uygulama güvencesi sunuyoruz.',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=TR&q=Koleksiyon'
      }
    ],
    nextShooting: {
      date: '22 Ağustos 2026',
      time: '10:00 - 16:00',
      location: 'MioCasa Showroom & Örnek Daire',
      fullAddress: 'Skyland HOM Dekorasyon Merkezi, Huzur Mah. Cendere Cad. No:114 Sarıyer/İstanbul',
      team: 'Yönetmen: Ercan Özdemir | Görüntü Yön.: Celal Ünlü | Işık: Batuhan K.',
      equipment: 'Sony A7SIII, 16-35mm GM Cine Lens, Ronin RS3, Quasar Science Tüp Işıklar, Macro Doku Lensi',
      dressCode: 'Minimalist & modern şık kurumsal (siyah, bej, antrasit tonları)',
      target: '3 Lüks Yaşam Video Kurgusu & 20 Detay/Doku Fotoğrafı'
    },
    instagramFeed: [
      { id: 1, type: 'REELS', date: 'Pazartesi, 19:00', title: 'Modern Salonlarda Zamansız Dokunuş', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&auto=format&fit=crop&q=80' },
      { id: 2, type: 'CAROUSEL', date: 'Perşembe, 18:30', title: 'Doğal Ahşap & Mermer İşçiliği', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&auto=format&fit=crop&q=80' },
      { id: 3, type: 'REELS', date: 'Cumartesi, 14:00', title: 'MioCasa Örnek Villa Turu', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&auto=format&fit=crop&q=80' }
    ],
    productionLanes: [
      { id: 'lane-1', title: 'Ham Görüntü Arşivi', status: 'COMPLETED', progress: 100, taskName: 'Showroom & Doku 4K Çekimleri', assignee: 'Ercan Özdemir' },
      { id: 'lane-2', title: 'Kurgu & Renk Masası', status: 'IN_PROGRESS', progress: 80, taskName: 'Lüks Salon Kurgusu & Renk Notları', assignee: 'Ercan Özdemir' },
      { id: 'lane-3', title: 'Müşteri İnceleme & Onay', status: 'PENDING', progress: 40, taskName: 'Villa Projesi Kurgu Revizyonu', assignee: 'Celal Ünlü' },
      { id: 'lane-4', title: 'Yayında / Arşivde', status: 'UPCOMING', progress: 0, taskName: 'Hedef Kitle Reklam Yayını', assignee: 'Tuğba Özdemir' }
    ],
    reviewItems: [
      {
        id: 'rev-miocasa-1',
        title: 'Lüks Salon Koleksiyonu Sinematik Tanıtım Kurgusu',
        type: 'Video / 4K Kurgu',
        duration: '0:45 sn',
        status: 'PENDING_APPROVAL',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-luxury-modern-living-room-interior-4192/1080p.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80',
        description: 'Doku ve ahşap detaylarına yakın plan geçişler uygulandı.'
      }
    ],
    drivePackages: [
      {
        id: 'pkg-miocasa-1',
        title: 'MioCasa Showroom 4K Master Video & Fotoğraf Paketi',
        type: 'Master Dosyalar',
        size: '4.2 GB',
        date: '05 Ağustos 2026',
        itemsCount: '3 Dikey Video + 20 Retouched Kare',
        driveUrl: 'https://drive.google.com'
      }
    ]
  },

  shineco: {
    id: 'c-shineco',
    slug: 'shineco',
    name: 'Shineco',
    sector: 'Kozmetik, Bakım & E-Ticaret',
    goalType: 'SALES',
    adsActive: true,
    dedicatedManager: {
      name: 'Tuğba Özdemir',
      title: 'Performans & E-Ticaret Yöneticisi',
      phone: '905000000000',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
    },
    metricsSummary: {
      volumeLabel: '🎬 Toplam Gösterim (Meta Canlı)',
      volumeValue: 'Canlı Hesaba Bağlı',
      volumeSub: '🚀 Meta Reklamları Yayında',
      unitCostLabel: '💬 Tıklama Başı Maliyet (CPC)',
      unitCostValue: '₺0,85',
      unitCostSub: '📈 E-Ticaret Dönüşüm Kampanyaları Aktif',
      actionLabel: '🛒 Toplam Tıklama / Sepet',
      actionValue: 'Aktif Kampanyalar'
    },
    competitors: [
      {
        name: 'The Purest Solutions',
        estimatedSpend: '₺150.000 - ₺240.000 / Ay',
        activeAdsCount: '35 Aktif Kreatif',
        formatDistribution: 'UGC Reels %80, Carousel %15, Statik %5',
        targetAudience: 'Türkiye Geneli Kadın/Erkek, 18-40 Yaş, Cilt Bakımı & Kozmetik',
        strategyNote: 'Kullanıcı deneyimi (UGC) ve dermatolog onaylı serum kancalarıyla yüksek bütçeli retargeting yapıyor.',
        counterStrategy: 'Shineco için net içerik şeffaflığı ve öncesi/sonrası mikroskobik cilt dokusu kurgularıyla ayrışıyoruz.',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=TR&q=The+Purest+Solutions'
      },
      {
        name: 'Maruderm Kozmetik',
        estimatedSpend: '₺110.000 - ₺175.000 / Ay',
        activeAdsCount: '26 Aktif Kreatif',
        formatDistribution: 'UGC Reels %70, Carousel %30',
        targetAudience: 'Türkiye Geneli, 18-35 Yaş, E-Ticaret Alışverişçileri',
        strategyNote: 'Fiyat avantajı ve bundle set indirimleri odaklı yoğun katalog reklamları çıkıyor.',
        counterStrategy: 'İndirim yerine premium hissettiren temiz içerik ve organik rutin setleri vurguluyoruz.',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=TR&q=Maruderm'
      }
    ],
    nextShooting: {
      date: '25 Ağustos 2026',
      time: '13:00 - 17:30',
      location: 'SocialArt Ürün & Makro Işık Stüdyosu',
      fullAddress: 'SocialArt Stüdyo B, Maslak Mah. Ahi Evran Cad. No:12 Sarıyer/İstanbul',
      team: 'Yönetmen: Celal Ünlü | Işık & Makro: Ercan Özdemir | Model Sorumlusu: Tuğba Özdemir',
      equipment: 'Sony A7SIII, 90mm Macro Cine Lens, Godox FV200 Ring Light + Reflektör Seti, Su Damlası & Doku Efekt Masası',
      dressCode: 'Temiz pastel tonlar & doğal cilt makyajı',
      target: '5 UGC Reels & 30 Şişe / Ürün Dekupe Karesi'
    },
    instagramFeed: [
      { id: 1, type: 'REELS', date: 'Salı, 18:00', title: 'Cilt Bakım Rutininde 3 Altın Kural', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80' },
      { id: 2, type: 'CAROUSEL', date: 'Cuma, 19:00', title: 'Hangi Serum Hangi Cilt Tipine Uygun?', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80' },
      { id: 3, type: 'REELS', date: 'Pazar, 21:00', title: 'Gece Bakımı UGC Deneyimi', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&auto=format&fit=crop&q=80' }
    ],
    productionLanes: [
      { id: 'lane-1', title: 'Ham Görüntü Arşivi', status: 'COMPLETED', progress: 100, taskName: 'Ürün Dekupe & Makro Ham Çekimleri', assignee: 'Celal Ünlü' },
      { id: 'lane-2', title: 'Kurgu & Renk Masası', status: 'IN_PROGRESS', progress: 75, taskName: 'UGC Altyazı & Öncesi-Sonrası Kurgusu', assignee: 'Ercan Özdemir' },
      { id: 'lane-3', title: 'Müşteri İnceleme & Onay', status: 'PENDING', progress: 20, taskName: 'Set Kampanya Görsel Revizesi', assignee: 'Tuğba Özdemir' },
      { id: 'lane-4', title: 'Yayında / Arşivde', status: 'UPCOMING', progress: 0, taskName: 'Meta E-Ticaret Dönüşüm Kampanyası', assignee: 'Tuğba Özdemir' }
    ],
    reviewItems: [
      {
        id: 'rev-shineco-1',
        title: 'Cilt Bakım Serumu UGC Kullanıcı Deneyimi Kurgusu',
        type: 'Video / UGC Format',
        duration: '0:32 sn',
        status: 'PENDING_APPROVAL',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-woman-applying-skincare-serum-8921/1080p.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
        description: 'Öncesi/Sonrası kancası eklendi, altyazılar senkronize edildi.'
      }
    ],
    drivePackages: [
      {
        id: 'pkg-shineco-1',
        title: 'Shineco E-Ticaret 4K Reklam & UGC Video Masterları',
        type: 'UGC & Ürün Videoları',
        size: '6.1 GB',
        date: '02 Ağustos 2026',
        itemsCount: '5 Dikey UGC Video + 30 Web Ürün Görseli',
        driveUrl: 'https://drive.google.com'
      }
    ]
  },

  gurme: {
    id: 'c-gurme',
    slug: 'gurme',
    name: 'Gurme Bahçeşehir',
    sector: 'Restoran, Şarküteri & Kafe (Bahçeşehir Şube)',
    goalType: 'ENGAGEMENT',
    adsActive: true,
    dedicatedManager: {
      name: 'Celal Ünlü',
      title: 'Kıdemli Prodüksiyon & Marka Yöneticisi',
      phone: '905000000000',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    metricsSummary: {
      volumeLabel: '🎬 Toplam Gösterim (Meta Canlı)',
      volumeValue: '7.071.928 Gösterim',
      volumeSub: '🚀 3.039.077 Tekil Kişiye Ulaşıldı',
      unitCostLabel: '💬 Tıklama Başı Maliyet (CPC)',
      unitCostValue: '₺0,56',
      unitCostSub: '📈 1.000 Gösterim (CPM): ₺40,09',
      actionLabel: '⚡ Toplam Tıklama',
      actionValue: '82.021 Tık'
    },
    competitors: [
      {
        name: 'Sütiş Bahçeşehir (Gölet Bölgesi)',
        estimatedSpend: '₺40.000 - ₺65.000 / Ay',
        activeAdsCount: '10 Aktif Kreatif',
        formatDistribution: 'Reels %55, Carousel %35, Statik %10',
        targetAudience: 'Bahçeşehir, Ispartakule, Esenkent (10 km Yarıçap), 25-55 Yaş',
        strategyNote: 'Geleneksel serpme kahvaltı ve tatlı çeşitleri odağında yerel arama reklamları çıkıyor.',
        counterStrategy: 'Gurme Bahçeşehir için kendi imalatımız şarküteri ve premium kuzu kafes / et ustalığını öne çıkarıyoruz.',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=TR&q=S%C3%BCti%C5%9F'
      },
      {
        name: 'Mado Bahçeşehir',
        estimatedSpend: '₺30.000 - ₺50.000 / Ay',
        activeAdsCount: '7 Aktif Kreatif',
        formatDistribution: 'Reels %60, Carousel %30, Statik %10',
        targetAudience: 'Bahçeşehir Yerlileri & Aileler, 20-50 Yaş',
        strategyNote: 'Dondurma ve tatlı tanıtımlarına ağırlık veriyor.',
        counterStrategy: 'San Sebastian ve özel füme şarküteri tabakları ile genç ve gurme kitleyi çekiyoruz.',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=TR&q=Mado'
      }
    ],
    nextShooting: {
      date: '21 Ağustos 2026',
      time: '11:30 - 16:30',
      location: 'Gurme Bahçeşehir Ana Şube (Gölet Karşısı)',
      fullAddress: 'Bahçeşehir 1. Kısım Mah. Doğa Parkı Cad. Gölet Mevkii No:8 Başakşehir/İstanbul',
      team: 'Yönetmen: Celal Ünlü | Görüntü Yön.: Ercan Özdemir | Ses & Prodüksiyon: Arda Furkan A.',
      equipment: 'Sony FX3 Cine Kamera, DJI RS3 Pro, 16-35mm + 50mm f/1.2 Lens Seti, Aputure Amaran 200X Işık, Kablosuz Yaka Mikrofonu',
      dressCode: 'Şarküteri önlükleri, temiz şef giyimi ve ahşap sıcak mekan konseptine uygun giyim',
      target: '4 Dikey Reels (Kuzu Kafes, San Sebastian, Şarküteri Masası) & 20 Profesyonel Kare'
    },
    instagramFeed: [
      { id: 1, type: 'REELS', date: 'Aktif Yayında', title: 'Kuzu Kafes Ateş & Sunum Şovu', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80' },
      { id: 2, type: 'REELS', date: 'Aktif Yayında', title: 'Gurme İmzası Özel Et Kurgusu', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80' },
      { id: 3, type: 'REELS', date: 'Aktif Yayında', title: 'Akışkan San Sebastian Cheesecake', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&auto=format&fit=crop&q=80' },
      { id: 4, type: 'REELS', date: 'Aktif Yayında', title: 'Bahçeşehir Şube Açık Hava Kahvaltı', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&auto=format&fit=crop&q=80' },
      { id: 5, type: 'CAROUSEL', date: 'Sıradaki Paylaşım', title: 'Özel Şarküteri & Füme Peynir Çeşitleri', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=80' },
      { id: 6, type: 'REELS', date: 'Sıradaki Paylaşım', title: 'Bahçeşehir Gölet Yanında Akşam Yemeği', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80' }
    ],
    productionLanes: [
      { id: 'lane-1', title: 'Ham Görüntü Arşivi', status: 'COMPLETED', progress: 100, taskName: '4K Kuzu Kafes & Şarküteri Ham Çekimleri', assignee: 'Celal Ünlü' },
      { id: 'lane-2', title: 'Kurgu & Renk Masası', status: 'COMPLETED', progress: 100, taskName: 'San Sebastian & Et Şovu Kurgusu', assignee: 'Celal Ünlü' },
      { id: 'lane-3', title: 'Müşteri İnceleme & Onay', status: 'COMPLETED', progress: 100, taskName: 'Bahçeşehir Trafik Reklamları Onaylandı', assignee: 'Celal Ünlü' },
      { id: 'lane-4', title: 'Yayında / Arşivde', status: 'IN_PROGRESS', progress: 95, taskName: '6 Aktif Meta Reklamı Yayında (₺0.56 CPC)', assignee: 'Tuğba Özdemir' }
    ],
    reviewItems: [
      {
        id: 'rev-gurme-1',
        title: 'Serpme Gurme Kahvaltı & Şarküteri Masası Reels Kurgusu',
        type: 'Video / 4K Kurgu',
        duration: '0:30 sn',
        status: 'PENDING_APPROVAL',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-delicious-breakfast-table-spread-7712/1080p.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&auto=format&fit=crop&q=80',
        description: 'Taze ekmek kesimi ve peynir sunumu dinamik müzikle kurgulandı.'
      }
    ],
    drivePackages: [
      {
        id: 'pkg-gurme-1',
        title: 'Gurme Bahçeşehir 4K Master Video & Fotoğraf Paketi',
        type: 'Master Dosyalar',
        size: '4.9 GB',
        date: '09 Ağustos 2026',
        itemsCount: '4 Dikey Video + 25 Retouched Kare',
        driveUrl: 'https://drive.google.com'
      }
    ]
  },

  ogena: {
    id: 'c-ogena',
    slug: 'ogena',
    name: 'Ogena Yapı',
    sector: 'İnşaat, Taahhüt & Mühendislik',
    goalType: 'LEADS',
    adsActive: false,
    adInactiveMessage: 'Markanız için şantiye çekimleri ve kurumsal lansman hazırlıkları sürmektedir. Reklamlarınız başlatıldığında yatırımcı lead akışı bu panelde aktif olacaktır.',
    dedicatedManager: {
      name: 'Betül Ünlü',
      title: 'Müşteri İlişkileri & Operasyon Yöneticisi',
      phone: '905000000000',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
    },
    metricsSummary: {
      volumeLabel: '🎯 Hedef: Yatırımcı Formu (Lead)',
      volumeValue: '0 Lead (Başlamadı)',
      volumeSub: 'Kreatif hazırlık aşamasında',
      unitCostLabel: '🎯 Lead Başı Maliyet (CPL)',
      unitCostValue: '₺0,00',
      unitCostSub: 'Reklam yayını bekleniyor',
      actionLabel: '🏗️ Randevu & Görüşme',
      actionValue: '0 Randevu'
    },
    competitors: [
      {
        name: 'Nef Gayrimenkul',
        estimatedSpend: '₺200.000 - ₺350.000 / Ay',
        activeAdsCount: '40 Aktif Kreatif',
        formatDistribution: 'Drone & Render Reels %60, Carousel %30, Statik %10',
        targetAudience: 'Yatırımcılar, Yüksek Gelir Grubu, 35-65 Yaş, Türkiye & Körfez',
        strategyNote: 'Arsa ve kentsel dönüşüm lansmanlarında yüksek bütçeli form ve WhatsApp reklamları çıkıyor.',
        counterStrategy: 'Ogena Yapı için butik güvenilirlik, deprem güvenliği ve birebir mühendislik takibi avantajını işliyoruz.',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=TR&q=Nef'
      },
      {
        name: 'DAP Yapı',
        estimatedSpend: '₺180.000 - ₺280.000 / Ay',
        activeAdsCount: '30 Aktif Kreatif',
        formatDistribution: 'Video Reels %70, Carousel %30',
        targetAudience: 'Konut Arayanlar & Yatırımcılar, 30-60 Yaş',
        strategyNote: 'Lüks konut ve vadeli ödeme planı fırsatları reklamları yayında.',
        counterStrategy: 'Şeffaf şantiye aşamaları ve zamanında teslimat referans videoları kurguluyoruz.',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=TR&q=DAP+Yap%C4%B1'
      }
    ],
    nextShooting: {
      date: '26 Ağustos 2026',
      time: '09:30 - 15:00',
      location: 'Ogena Şantiye Sahası & Genel Merkez',
      fullAddress: 'Ogena Yapı Şantiye Sahası, Göktürk Mah. İstanbul Cad. Eyüpsultan/İstanbul',
      team: 'Yönetmen & Drone Pilotu: Celal Ünlü | Görüntü Yön.: Ercan Özdemir | Saha Sorumlusu: Betül Ünlü',
      equipment: 'DJI Mavic 3 Cine 5.1K Drone, Sony FX3 4K Kamera, PolarPro ND Filtre Seti, Güvenlik Kaskı & Mikrofon',
      dressCode: 'Baret, reflektörlü kurumsal yelek ve mühendislik saha ekipmanları',
      target: '2 Drone Şantiye Kurgusu & 15 Mimari Proje Karesi'
    },
    instagramFeed: [
      { id: 1, type: 'REELS', date: 'Pazartesi, 10:00', title: 'Göktürk Projesinde Temel Güvenliği', image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=400&auto=format&fit=crop&q=80' },
      { id: 2, type: 'CAROUSEL', date: 'Perşembe, 15:00', title: 'Kentsel Dönüşümde Merak Edilen 4 Adım', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&auto=format&fit=crop&q=80' },
      { id: 3, type: 'REELS', date: 'Cumartesi, 11:30', title: 'Mühendis Gözünden Şantiye Turu', image: 'https://images.unsplash.com/photo-1590725140246-20150931eb6f?w=400&auto=format&fit=crop&q=80' }
    ],
    productionLanes: [
      { id: 'lane-1', title: 'Ham Görüntü Arşivi', status: 'COMPLETED', progress: 100, taskName: '5.1K Drone & Saha Ham Görüntüleri', assignee: 'Celal Ünlü' },
      { id: 'lane-2', title: 'Kurgu & Renk Masası', status: 'IN_PROGRESS', progress: 65, taskName: 'Mühendislik Güveni Röportaj Kurgusu', assignee: 'Ercan Özdemir' },
      { id: 'lane-3', title: 'Müşteri İnceleme & Onay', status: 'PENDING', progress: 10, taskName: 'Lansman Teaser Kurgusu Onayı', assignee: 'Betül Ünlü' },
      { id: 'lane-4', title: 'Yayında / Arşivde', status: 'UPCOMING', progress: 0, taskName: 'Yatırımcı Lead Reklam Kampanyası', assignee: 'Arda Furkan Aslanbaş' }
    ],
    reviewItems: [
      {
        id: 'rev-ogena-1',
        title: 'Ogena Yapı Kentsel Dönüşüm & Mühendislik Güveni Videosu',
        type: 'Video / 4K Drone & Röportaj',
        duration: '0:50 sn',
        status: 'PENDING_APPROVAL',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-construction-workers-on-a-building-site-3912/1080p.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80',
        description: 'Drone şantiye görüntüleri ve kurumsal seslendirme birleştirildi.'
      }
    ],
    drivePackages: [
      {
        id: 'pkg-ogena-1',
        title: 'Ogena Yapı 4K Drone & Şantiye Video Masterları',
        type: 'Drone & Master Dosyalar',
        size: '7.4 GB',
        date: '04 Ağustos 2026',
        itemsCount: '3 Drone Videosu + 25 Mimari Çekim Karesi',
        driveUrl: 'https://drive.google.com'
      }
    ]
  },

  vipcatring: {
    id: 'c-vipcatring',
    slug: 'vipcatring',
    name: 'VIP Catring',
    sector: 'Catering, Davet & Organizasyon',
    goalType: 'LEADS',
    adsActive: true,
    dedicatedManager: {
      name: 'Betül Ünlü',
      title: 'Müşteri İlişkileri & Operasyon Yöneticisi',
      phone: '905000000000',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
    },
    metricsSummary: {
      volumeLabel: '🎯 Toplam Davet & Etkinlik Talebi',
      volumeValue: '42 Teklif Formu',
      volumeSub: '⭐ %75 Kurumsal Şirket Daveti',
      unitCostLabel: '🎯 Teklif Başı Maliyet (CPL)',
      unitCostValue: '₺68,00',
      unitCostSub: 'Kurumsal etkinlik & düğün sezonu hedeflemesi',
      actionLabel: '🥂 Menü Tadımı & Randevu',
      actionValue: '26 Görüşme'
    },
    competitors: [
      {
        name: 'Misafir Catering & Davet',
        estimatedSpend: '₺35.000 - ₺55.000 / Ay',
        activeAdsCount: '9 Aktif Kreatif',
        formatDistribution: 'Reels %65, Carousel %35',
        targetAudience: 'İstanbul Kurumsal Şirketler & Düğün Çiftleri, 25-50 Yaş',
        strategyNote: 'Düğün ve kokteyl menü paketleri reklamlarında fiyat avantajına odaklanıyor.',
        counterStrategy: 'VIP Catering için beş yıldızlı otel kalitesinde şef sunumları ve kusursuz servis disiplinini öne çıkarıyoruz.',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=TR&q=Catering'
      }
    ],
    nextShooting: {
      date: '28 Ağustos 2026',
      time: '15:00 - 19:30',
      location: 'VIP Catering Hazırlık Mutfağı & Davet Alanı',
      fullAddress: 'VIP Catering Plaza, Ayazağa Mah. Cendere Vadisi No:18 Sarıyer/İstanbul',
      team: 'Yönetmen: Celal Ünlü | Görüntü Yön.: Ercan Özdemir | Koordinatör: Betül Ünlü',
      equipment: 'Sony FX3, 50mm + 85mm f/1.4 Lensler, DJI RS3 Pro, Aputure Işık Seti, Duman & Efekt Ekipmanı',
      dressCode: 'Kusursuz garson & servis kıyafetleri, şef önlükleri ve şık masa dekorları',
      target: '3 Kokteyl & Sunum Reels + 20 Detay Fotoğraf Karesi'
    },
    instagramFeed: [
      { id: 1, type: 'REELS', date: 'Salı, 19:00', title: 'Kurumsal Gala Yemeği Canlı Servis', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80' },
      { id: 2, type: 'CAROUSEL', date: 'Cuma, 16:30', title: 'Özel Kokteyl Ordövr Seçkisi', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&auto=format&fit=crop&q=80' },
      { id: 3, type: 'REELS', date: 'Pazar, 20:00', title: 'Açık Hava Düğün Ziyafeti', image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&auto=format&fit=crop&q=80' }
    ],
    productionLanes: [
      { id: 'lane-1', title: 'Ham Görüntü Arşivi', status: 'COMPLETED', progress: 100, taskName: 'Davet & Kokteyl 4K Ham Çekimleri', assignee: 'Celal Ünlü' },
      { id: 'lane-2', title: 'Kurgu & Renk Masası', status: 'COMPLETED', progress: 100, taskName: 'Sinematik Servis & Müzik Senkronizasyonu', assignee: 'Ercan Özdemir' },
      { id: 'lane-3', title: 'Müşteri İnceleme & Onay', status: 'COMPLETED', progress: 100, taskName: 'Kurumsal Teklif Videosu Onaylandı', assignee: 'Betül Ünlü' },
      { id: 'lane-4', title: 'Yayında / Arşivde', status: 'IN_PROGRESS', progress: 90, taskName: 'Kurumsal Etkinlik Lead Kampanyası', assignee: 'Tuğba Özdemir' }
    ],
    reviewItems: [
      {
        id: 'rev-vipcatring-1',
        title: 'Özel Davet & Kokteyl Sunumları Sinematik Kurgu',
        type: 'Video / 4K Kurgu',
        duration: '0:35 sn',
        status: 'PENDING_APPROVAL',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-bartender-making-cocktails-at-a-bar-9012/1080p.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
        description: 'Şık kadeh sunumları ve ordövr tabağı geçişleri eklendi.'
      }
    ],
    drivePackages: [
      {
        id: 'pkg-vipcatring-1',
        title: 'VIP Catering 4K Davet & Sunum Video Paketi',
        type: 'Master Dosyalar',
        size: '3.8 GB',
        date: '07 Ağustos 2026',
        itemsCount: '3 Dikey Video + 20 Fotoğraf Karesi',
        driveUrl: 'https://drive.google.com'
      }
    ]
  },

  postprodart: {
    id: 'c-postprodart',
    slug: 'postprodart',
    name: 'Postprodart',
    sector: 'Kreatif Prodüksiyon & Post-Prodüksiyon',
    goalType: 'AWARENESS',
    adsActive: false,
    adInactiveMessage: 'Markanız için showreel montajları ve post-prodüksiyon süreçleri yürütülmektedir. Reklam yayını başlatıldığında sektör erişim verileri burada akacaktır.',
    dedicatedManager: {
      name: 'Arda Furkan Aslanbaş',
      title: 'Kıdemli Ajans & Marka Direktörü',
      phone: '905000000000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    },
    metricsSummary: {
      volumeLabel: '👁️ Hedef: Tekil Erişim (Reach)',
      volumeValue: '0 Kişi (Başlamadı)',
      volumeSub: 'Showreel hazırlık aşamasında',
      unitCostLabel: '📈 1.000 Kişiye Ulaşma (CPM)',
      unitCostValue: '₺0,00',
      unitCostSub: 'Reklam yayını bekleniyor',
      actionLabel: '🎬 Showreel İzlenmesi',
      actionValue: '0 İzleme'
    },
    competitors: [
      {
        name: 'Autonomy Film & Prodüksiyon',
        estimatedSpend: '₺80.000 - ₺130.000 / Ay',
        activeAdsCount: '15 Aktif Kreatif',
        formatDistribution: 'Showreel Video %85, Statik %15',
        targetAudience: 'Reklam Ajansları, Marka Yöneticileri, Kreatif Direktörler',
        strategyNote: 'Büyük marka TVC ve dijital reklam filmleri showreel videoları yayınlıyor.',
        counterStrategy: 'Postprodart için hızlı teslimat, gelişmiş CGI/VFX ve hibrit prodüksiyon çevikliğini öne çıkarıyoruz.',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=TR&q=Film+Produksiyon'
      }
    ],
    nextShooting: {
      date: '30 Ağustos 2026',
      time: '12:00 - 18:00',
      location: 'SocialArt Post-Prodüksiyon & Renk Süiti',
      fullAddress: 'SocialArt Kurgu Merkezi, Levent Mah. Nispetiye Cad. No:24 Beşiktaş/İstanbul',
      team: 'Yönetmen: Arda Furkan Aslanbaş | Colorist: Celal Ünlü | VFX Sanatçısı: Ercan Ö.',
      equipment: 'Blackmagic DaVinci Resolve Studio, DaVinci Mini Panel, Apple Pro Display XDR, Genelec Monitörler',
      dressCode: 'Kreatif & siyah stüdyo konsepti',
      target: '1 2026 Showreel Teaser & 10 VFX Önizleme Karesi'
    },
    instagramFeed: [
      { id: 1, type: 'REELS', date: 'Pazartesi, 20:00', title: 'Color Grading Öncesi & Sonrası', image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&auto=format&fit=crop&q=80' },
      { id: 2, type: 'REELS', date: 'Çarşamba, 19:30', title: '3D VFX & Motion Graphics Breakdown', image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&auto=format&fit=crop&q=80' },
      { id: 3, type: 'REELS', date: 'Cuma, 21:00', title: 'Postprodart 2026 Showreel', image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80' }
    ],
    productionLanes: [
      { id: 'lane-1', title: 'Ham Görüntü Arşivi', status: 'COMPLETED', progress: 100, taskName: 'Proje Master & Ham Görüntü Arşivi', assignee: 'Celal Ünlü' },
      { id: 'lane-2', title: 'Kurgu & Renk Masası', status: 'IN_PROGRESS', progress: 85, taskName: '2026 Showreel & VFX Montajı', assignee: 'Ercan Özdemir' },
      { id: 'lane-3', title: 'Müşteri İnceleme & Onay', status: 'PENDING', progress: 20, taskName: 'Showreel Müzik & Ses Miksaj Onayı', assignee: 'Arda Furkan Aslanbaş' },
      { id: 'lane-4', title: 'Yayında / Arşivde', status: 'UPCOMING', progress: 0, taskName: 'Sektörel Dijital Dağıtım', assignee: 'Arda Furkan Aslanbaş' }
    ],
    reviewItems: [
      {
        id: 'rev-postprodart-1',
        title: 'Postprodart 2026 Showreel Sinematik Kurgusu',
        type: 'Video / 4K Showreel',
        duration: '1:00 dk',
        status: 'PENDING_APPROVAL',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-film-editing-software-timeline-on-a-computer-screen-3129/1080p.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
        description: 'VFX sahneleri ve dinamik ses efektleriyle montajlandı.'
      }
    ],
    drivePackages: [
      {
        id: 'pkg-postprodart-1',
        title: 'Postprodart 4K Master Showreel & VFX Exportları',
        type: 'Showreel Master',
        size: '8.2 GB',
        date: '01 Ağustos 2026',
        itemsCount: '1 4K Showreel Master + 15 VFX Sahne Çıktısı',
        driveUrl: 'https://drive.google.com'
      }
    ]
  },

  demo: {
    id: 'c-demo',
    slug: 'demo',
    name: 'SocialArt VIP Demo',
    sector: 'Örnek VIP Marka',
    goalType: 'LEADS',
    adsActive: true,
    dedicatedManager: {
      name: 'Selin Yılmaz',
      title: 'Kıdemli Marka Yöneticisi',
      phone: '905000000000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    },
    metricsSummary: {
      volumeLabel: '🎯 Toplam Müşteri Adayı',
      volumeValue: '47 Yeni Lead',
      volumeSub: '⭐ %72 Kaliteli / Nitelikli Başvuru',
      unitCostLabel: '🎯 Lead Başı Maliyet (CPL)',
      unitCostValue: '₺73,00',
      unitCostSub: 'Birim maliyet optimizasyonu aktif',
      actionLabel: '📞 Geri Dönüş & Randevu',
      actionValue: '38 Görüşme'
    },
    competitors: [
      {
        name: 'Sektörel Rakip A',
        estimatedSpend: '₺50.000 - ₺80.000 / Ay',
        activeAdsCount: '12 Aktif Kreatif',
        formatDistribution: 'Reels %60, Carousel %30, Statik %10',
        targetAudience: 'Büyükşehirler, 25-50 Yaş',
        strategyNote: 'Yeni ürün lansmanı ve sezon indirimleri ağırlıklı reklamlar.',
        counterStrategy: 'Daha yüksek prodüksiyon kalitesi ve özgün video kurgularıyla ayrışıyoruz.',
        adLibraryUrl: 'https://www.facebook.com/ads/library'
      }
    ],
    nextShooting: {
      date: '18 Ağustos 2026',
      time: '11:00 - 15:00',
      location: 'SocialArt Ana Stüdyo',
      fullAddress: 'SocialArt Stüdyoları, Maslak Mah. Sarıyer/İstanbul',
      team: 'Yönetmen: Celal Ünlü | Görüntü Yön.: Ercan Özdemir',
      equipment: 'Sony FX3, DJI RS3 Pro, Aputure Işık Seti',
      dressCode: 'Logosuz, düz renkli kurumsal kombinler',
      target: '4 Dikey Reels & 20 Profesyonel Kare'
    },
    instagramFeed: [
      { id: 1, type: 'REELS', date: 'Pazartesi, 18:00', title: 'Örnek Reels Yayını', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&auto=format&fit=crop&q=80' },
      { id: 2, type: 'CAROUSEL', date: 'Çarşamba, 19:30', title: 'Örnek Carousel Post', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' }
    ],
    productionLanes: [
      { id: 'lane-1', title: 'Ham Görüntü Arşivi', status: 'COMPLETED', progress: 100, taskName: '4K Ham Görüntü Kartları', assignee: 'Celal Ünlü' },
      { id: 'lane-2', title: 'Kurgu & Renk Masası', status: 'IN_PROGRESS', progress: 80, taskName: 'Reels Video Montajı', assignee: 'Ercan Özdemir' },
      { id: 'lane-3', title: 'Müşteri İnceleme & Onay', status: 'PENDING', progress: 40, taskName: 'Onay Bekleyen Video Kurgusu', assignee: 'Selin Yılmaz' },
      { id: 'lane-4', title: 'Yayında / Arşivde', status: 'UPCOMING', progress: 0, taskName: 'Sosyal Medya ve Reklam Yayını', assignee: 'Tuğba Özdemir' }
    ],
    reviewItems: [
      {
        id: 'rev-demo-1',
        title: 'Örnek Tanıtım & Hizmet Reels Kurgusu (Rev.2)',
        type: 'Video / 4K Kurgu',
        duration: '0:42 sn',
        status: 'PENDING_APPROVAL',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-a-stylish-young-woman-working-at-a-cafe-9343/1080p.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
        description: 'Dikey formatta optimize edildi, ses miksajı tamamlandı.'
      }
    ],
    drivePackages: [
      {
        id: 'pkg-demo-1',
        title: 'Ağustos 2026 - 4K Master Video & Reels Paketi (Google Drive)',
        type: 'Video Masterları',
        size: '4.8 GB',
        date: '12 Ağustos 2026',
        itemsCount: '6 Dikey Video + 2 YouTube Master',
        driveUrl: 'https://drive.google.com'
      }
    ]
  }
};

export const getBrandConfig = (companyCode, clientName) => {
  const code = (companyCode || '').toLowerCase().trim();
  const name = (clientName || '').toLowerCase().trim();

  if (code.includes('mallof') || name.includes('mall of')) return BRAND_CONFIGS.mallofgurme;
  if (code.includes('gurme') || name.includes('gurme')) return BRAND_CONFIGS.gurme;
  if (code.includes('arayan') || code.includes('aryan') || name.includes('arayan') || name.includes('aryan')) return BRAND_CONFIGS.arayanvar;
  if (code.includes('miocasa') || name.includes('miocasa') || name.includes('mio')) return BRAND_CONFIGS.miocasa;
  if (code.includes('shineco') || name.includes('shineco') || name.includes('shine')) return BRAND_CONFIGS.shineco;
  if (code.includes('ogena') || name.includes('ogena')) return BRAND_CONFIGS.ogena;
  if (code.includes('vip') || code.includes('catring') || name.includes('vip') || name.includes('catring')) return BRAND_CONFIGS.vipcatring;
  if (code.includes('postprod') || name.includes('postprod')) return BRAND_CONFIGS.postprodart;

  return BRAND_CONFIGS[code] || BRAND_CONFIGS.demo;
};
