import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Camera, 
  Video, 
  Users, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Target, 
  Zap,
  ChevronRight,
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';

const caseStudiesData = [
  {
    id: 'peugeot',
    brand: 'PEUGEOT',
    sector: 'Otomotiv',
    services: ['Kreatif Prodüksiyon'],
    challenge: 'Yeni model Peugeot lansmanı için sosyal medya mecralarında paylaşılmak üzere, aracın aerodinamik tasarımını ve gece sürüşü detaylarını ön plana çıkaracak sinematik ve akıcı video kreatif üretimi.',
    solution: 'Özel kamera takip sistemleri kullanarak aracın hareket halindeki estetiğini ve far/kokpit detaylarını 4K çözünürlükte kaydettik. Post-prodüksiyon aşamasında dinamik ritim, profesyonel renk derecelendirme (color grading) ve gece atmosferine uygun ses tasarımı uygulayarak iki adet dikey reklam videosu hazırladık.',
    metrics: [
      { value: 'Car-Rig', label: 'Takip Tekniği', desc: 'Hareket halinde dinamik araç takip çekimleri' },
      { value: 'Gece', label: 'Çekim Teması', desc: 'Karanlık atmosferde far ve tasarım hatları' },
      { value: 'Özel', label: 'Ses & Renk', desc: 'Gece ritmine özel ses tasarımı ve color grade' }
    ],
    highlight: 'Peugeot\'nun şık tasarımını dinamik kamera hareketleri ve gece atmosferi kurgusuyla görselleştirdik.',
    videos: [
      'https://res.cloudinary.com/dqs6iconu/video/upload/v1778836097/peugeot-1_pbbiiq.mp4',
      'https://res.cloudinary.com/dqs6iconu/video/upload/v1778836073/peugeot-2_tnygmj.mp4'
    ]
  },
  {
    id: 'koton',
    brand: 'KOTON',
    sector: 'Moda / Perakende',
    services: ['Kreatif Prodüksiyon'],
    challenge: 'Koton\'un yeni sezon koleksiyon lansmanı için sosyal medya mecralarında paylaşılmak üzere, ürünlerin hareket halindeki estetiğini, dokusunu ve kumaş kalitesini öne çıkaracak enerjik ve yüksek kalitede video kreatif profesyonel üretimi.',
    solution: 'Kendi stüdyomuzda, profesyonel modellerle dinamik lifestyle ve konsept çekimleri gerçekleştirdik. Koleksiyon parçalarını öne çıkaran, hızlı geçişli ve müzikle senkronize Reels/TikTok video kreatifleri hazırladık.',
    metrics: [
      { value: 'Moda', label: 'Çekim Konsepti', desc: 'Lifestyle cast ve model odaklı kurgu' },
      { value: 'Stüdyo', label: 'Çekim Alanı', desc: 'Dekorlu ve profesyonel ışıklandırmalı set' },
      { value: 'Ritmik', label: 'Kurgu Tarzı', desc: 'Müzikle senkronize dinamik geçişler' }
    ],
    highlight: 'Model ve ürün çekimlerini sinematik kurgularla sosyal medya dinamiklerine uyarladık.',
    videos: [
      'https://res.cloudinary.com/dqs6iconu/video/upload/v1778836114/koton-reel_jdmcsk.mp4'
    ]
  },
  {
    id: 'jeep',
    brand: 'JEEP',
    sector: 'Otomotiv / Premium',
    services: ['Kreatif Prodüksiyon'],
    challenge: 'Jeep markasının özgürlük ve macera ruhunu, araç tasarımını ve arazi kabiliyetini ön plana çıkaracak sinematik ve prestijli video kreatif üretimi.',
    solution: 'Zorlu arazi ve doğa ortamlarında, hareketli takip sistemleri kullanarak Jeep\'in dayanıklılığını ve off-road gücünü 4K çözünürlükte kaydettik. Macera hissini uyandıran dinamik kurgu ve doğa tonlarına uygun profesyonel renk düzenlemeleriyle lansman videosunu hazırladık.',
    metrics: [
      { value: 'Off-Road', label: 'Çekim Teması', desc: 'Zorlu arazi koşullarında macera odaklı kurgu' },
      { value: 'Doğal', label: 'Işık & Tonlar', desc: 'Dış mekanda gün ışığı ve doğa renk optimizasyonu' },
      { value: 'Dinamik', label: 'Kamera Takip', desc: 'Hareketli araç üstü takip çekimleri' }
    ],
    highlight: 'Jeep\'in özgürlük ruhunu dinamik arazi çekimleri ve doğa atmosferiyle görselleştirdik.',
    videos: [
      'https://res.cloudinary.com/dqs6iconu/video/upload/v1778836110/jeep-reel_idufur.mp4'
    ],
    videoAspect: '16/9'
  },
  {
    id: 'flormar',
    brand: 'FLORMAR',
    sector: 'Kozmetik & Güzellik',
    services: ['Kreatif Prodüksiyon'],
    challenge: 'Flormar\'ın yeni sezon lansmanı için sosyal medya mecralarında paylaşılmak üzere, ürün kullanım kolaylığını ve estetiğini ön plana çıkaracak yüksek kalitede, dinamik video kreatif üretimi.',
    solution: 'Kendi stüdyomuzda, kozmetik ürün yapısını, uygulama anını ve renk pigmentlerini en net şekilde yansıtan makro ürün çekimleri gerçekleştirdik. Sosyal medya trendlerine uyumlu dinamik geçişler, yakın plan detaylar ve ses senkronizasyonu ile reklam videosunu tamamladık.',
    metrics: [
      { value: 'Makro', label: 'Çekim Tekniği', desc: 'Ürün dokusu ve uygulama detayları yakın plan çekimi' },
      { value: 'Stüdyo', label: 'Çekim Alanı', desc: 'Yüksek kaliteli ürün aydınlatması ve temiz fon' },
      { value: 'Dinamik', label: 'Geçişler', desc: 'Trend müzik ritmiyle uyumlu hızlı sahne geçişleri' }
    ],
    highlight: 'Makyaj ve ürün detaylarını yakın plan makro çekimler ve dinamik kurguyla görselleştirdik.',
    videos: [
      'https://res.cloudinary.com/dqs6iconu/video/upload/v1778836120/flormar-reel_py3dmx.mp4'
    ]
  },
  {
    id: 'sprite',
    brand: 'SPRITE',
    sector: 'Gıda & Hızlı Tüketim',
    services: [],
    challenge: '',
    solution: '',
    metrics: [],
    highlight: '',
    isComingSoon: true
  },
  {
    id: 'miocasa',
    brand: 'MIOCASA',
    sector: 'Mimari & Mobilya',
    services: [],
    challenge: '',
    solution: '',
    metrics: [],
    highlight: '',
    isComingSoon: true
  },
  {
    id: 'shineco',
    brand: 'SHINECO',
    sector: 'Kozmetik & Temizlik',
    services: [],
    challenge: '',
    solution: '',
    metrics: [],
    highlight: '',
    isComingSoon: true
  },
  {
    id: 'gurme-bahcesehir',
    brand: 'GURME BAHÇEŞEHİR',
    sector: 'Gıda & Restoran',
    services: [],
    challenge: '',
    solution: '',
    metrics: [],
    highlight: '',
    isComingSoon: true
  },
  {
    id: 'cosentino-geberit',
    brand: 'COSENTINO & GEBERIT',
    sector: 'Mimari / Yapı Teknolojileri',
    services: ['Kreatif Prodüksiyon'],
    challenge: 'Premium mimari, yapı teknolojileri ve banyo çözümleri sunan Cosentino & Geberit ürünlerinin tasarım kalitesini, malzeme dokusunu ve inovasyonunu bir arada yansıtan prestijli video kreatif üretimi.',
    solution: 'Showroom ve mimari uygulama alanlarında, lüks tasarım çizgilerini ve teknolojik detayları öne çıkaran detay odaklı makro çekimler gerçekleştirdik. Malzeme kalitesini ve inovasyonu vurgulayan sinematik bir lansman videosu kurguladık.',
    metrics: [
      { value: 'Yapı', label: 'Çekim Teması', desc: 'Showroom ve modern banyo tasarımları kurgusu' },
      { value: 'Makro', label: 'Çekim Detayı', desc: 'Malzeme dokusunu ve teknolojisini gösteren yakın planlar' },
      { value: 'Sinematik', label: 'Kurgu Tarzı', desc: 'Prestijli ve şık mimari görsel anlatım' }
    ],
    highlight: 'Cosentino & Geberit\'in tasarım ve yapı teknolojilerini estetik makro çekimlerle görselleştirdik.',
    videos: [
      'https://res.cloudinary.com/dqs6iconu/video/upload/v1783700450/cosentino_Geberik_1_o8bptg.mp4'
    ],
    videoAspect: '16/9'
  },
  {
    id: 'polar',
    brand: 'POLAR',
    sector: 'Gıda & Hızlı Tüketim',
    services: ['Kreatif Prodüksiyon'],
    challenge: 'Polar ürünlerinin lezzetini, iştah açıcı dokusunu ve ambalaj estetiğini sosyal medyada ön plana çıkaracak dinamik ve yüksek kaliteli video kreatif üretimi.',
    solution: 'Stüdyomuzda, özel ışıklandırma teknikleri kullanarak Polar ürünlerinin akışkanlığını, dokusunu ve renklerini öne çıkaran makro çekimler gerçekleştirdik. Sosyal medya trendlerine uygun hızlı kurgu ve ritmik müzik eşliğinde reklam filmini tamamladık.',
    metrics: [
      { value: 'Makro', label: 'Çekim Tekniği', desc: 'Ürün dokusunu ve detaylarını öne çıkaran yakın planlar' },
      { value: 'Stüdyo', label: 'Işık & Set', desc: 'Gıda çekimine özel iştah açıcı stüdyo aydınlatması' },
      { value: 'Dinamik', label: 'Kurgu Riti', desc: 'Ürün akıcılığını yansıtan hızlı sahne geçişleri' }
    ],
    highlight: 'Polar ürünlerinin iştah açıcı yapısını dinamik stüdyo çekimleriyle görselleştirdik.',
    videos: [
      'https://res.cloudinary.com/dqs6iconu/video/upload/v1778836147/polar-reel_yl1awq.mp4'
    ],
    videoAspect: '16/9'
  },
  {
    id: 'teknofest',
    brand: 'TEKNOFEST',
    sector: 'Teknoloji & Havacılık',
    services: ['Kreatif Prodüksiyon'],
    challenge: 'Teknofest organizasyonunun büyüklüğünü, heyecanını, teknolojik ve dinamik yapısını en üst düzeyde yansıtacak sinematik ve sürükleyici bir etkinlik/aftermovie video kreatif üretimi.',
    solution: 'Festival alanında özel takip ekipmanları, geniş açı lensler ve profesyonel post-prodüksiyon kurgu ritmiyle festival coşkusunu ve teknoloji odaklı atmosferi 4K çözünürlükte kaydettik.',
    metrics: [
      { value: 'Aftermovie', label: 'Çekim Teması', desc: 'Festival coşkusu ve etkinlik odaklı kurgu' },
      { value: 'Dinamik', label: 'Kurgu Tarzı', desc: 'Müzik ve ses efektleriyle senkronize geçişler' },
      { value: '4K', label: 'Çekim Standardı', desc: 'Ultra yüksek çözünürlüklü detaylar' }
    ],
    highlight: 'Teknofest heyecanını ve teknoloji coşkusunu dinamik sahne geçişleri ve sinematik kurguyla yansıttık.',
    videos: [
      'https://res.cloudinary.com/dqs6iconu/video/upload/v1783702454/redpandacompress_teknofestt_kegids.mp4'
    ],
    videoAspect: '16/9'
  },
  {
    id: 'sets',
    brand: 'S.E.T.S',
    sector: 'Elektrikli Ulaşım / Bisiklet',
    services: ['Kreatif Prodüksiyon'],
    challenge: 'S.E.T.S elektrikli bisiklet ve akıllı ulaşım çözümlerinin günlük kullanım pratikliğini, sürüş keyfini ve teknolojik donanımını yansıtan dinamik ve sinematik tanıtım filmleri üretimi.',
    solution: 'Dış mekan çekimlerinde bisikletin hareketli sürüş detaylarını kaydetmek için takip kameraları kullandık. Ürünün genel tanıtımı için yatay sinematik formatta bir lansman filmi, sosyal medya kanalları için ise dikey formatta dinamik ritimli Reels videoları ürettik.',
    metrics: [
      { value: 'Multimedya', label: 'Çekim Kapsamı', desc: 'Hem yatay lansman filmi hem dikey Reels kurguları' },
      { value: 'Sürüş', label: 'Çekim Teması', desc: 'Günlük yaşamda bisiklet kullanımı ve mobilite estetiği' },
      { value: 'Dinamik', label: 'Kamera Takip', desc: 'Akıcı hareketli çekimler ve detay odaklı planlar' }
    ],
    highlight: 'S.E.T.S elektrikli bisiklet sürüş deneyimini ve akıllı teknolojilerini sinematik kadrajlarla görselleştirdik.',
    videos: [
      { url: 'https://res.cloudinary.com/dqs6iconu/video/upload/v1783702920/redpandacompress_genel_tan%C4%B1t%C4%B1m_hdxo4q.mp4', aspect: '16/9' },
      { url: 'https://res.cloudinary.com/dqs6iconu/video/upload/v1783703281/redpandacompress_reels_7_cx8imm.mp4', aspect: '9/16' },
      { url: 'https://res.cloudinary.com/dqs6iconu/video/upload/v1783703290/redpandacompress_bisiklet_rczf25.mp4', aspect: '9/16' }
    ]
  }
];

const CaseStudies = () => {
  const [activeBrandId, setActiveBrandId] = useState('peugeot');

  useEffect(() => {
    document.title = "Başarı Hikayelerimiz | SocialArt Medya";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Birlikte çalıştığımız Peugeot, Koton, Jeep gibi markalar için geliştirdiğimiz kreatif ve stratejik başarı hikayeleri, dijital performans sonuçları.");
    }
  }, []);

  const activeBrand = caseStudiesData.find(c => c.id === activeBrandId);

  return (
    <div className="case-studies-page" style={{ background: '#050505', color: '#fff', padding: '220px 0 100px' }}>
      <style>{`
        .cases-hero { text-align: center; margin-bottom: 70px; }
        .brand-tabs-container { 
          display: flex; 
          gap: 12px; 
          justify-content: center; 
          flex-wrap: wrap; 
          margin-bottom: 60px; 
          max-width: 1000px; 
          margin-left: auto; 
          margin-right: auto;
          padding: 0 20px;
        }
        .brand-tab-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.6);
          padding: 12px 24px;
          border-radius: 100px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-size: 0.95rem;
        }
        .brand-tab-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
          color: #fff;
          transform: translateY(-2px);
        }
        .brand-tab-btn.active {
          background: linear-gradient(135deg, rgba(255, 0, 85, 0.15) 0%, rgba(138, 43, 226, 0.15) 100%);
          border-color: var(--primary);
          color: #fff;
          box-shadow: 0 0 20px rgba(255, 0, 85, 0.15);
        }
        .story-container {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .story-card-left {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 28px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }
        .story-card-left::before {
          content: '';
          position: absolute;
          top: -20%;
          right: -20%;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(255, 0, 85, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .story-card-right {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .case-metric-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .case-metric-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .case-metric-card:hover {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.03);
          transform: translateY(-3px);
        }
        .case-metric-value {
          font-size: 1.8rem;
          font-weight: 900;
          color: #fff;
          margin-bottom: 6px;
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
        }
        .case-metric-label {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 6px;
        }
        .case-metric-desc {
          font-size: 0.75rem;
          color: #888;
          line-height: 1.3;
        }
        .details-wrapper {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 35px;
          box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.01);
        }
        .cta-cases {
          text-align: center;
          margin-top: 100px;
          padding: 80px 40px;
          background: radial-gradient(circle at center, rgba(255, 0, 85, 0.06) 0%, transparent 60%);
          border-radius: 32px;
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
          border: 1px solid rgba(255, 255, 255, 0.03);
        }
        @media (max-width: 992px) {
          .story-container {
            grid-template-columns: 1fr;
          }
          .case-metric-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 576px) {
          .case-metric-grid {
            grid-template-columns: 1fr;
          }
        }
        .spright-coming-soon-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 450px;
          text-align: center;
          overflow: hidden;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.03);
          background: rgba(255, 255, 255, 0.01);
          box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.6);
        }
        .spright-coming-soon-brand {
          font-size: 6rem;
          font-weight: 900;
          letter-spacing: 16px;
          color: #fff;
          margin-bottom: 24px;
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
          animation: sprightBreath 4s ease-in-out infinite;
          user-select: none;
        }
        .spright-coming-soon-tagline {
          font-size: 1.8rem;
          font-weight: 500;
          letter-spacing: 10px;
          color: var(--primary);
          text-transform: uppercase;
          animation: sprightBreath 4s ease-in-out infinite;
          animation-delay: 0.5s;
          user-select: none;
        }
        .spright-pulse-circle {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 0, 85, 0.06) 0%, transparent 70%);
          animation: sprightGlow 4s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes sprightBreath {
          0%, 100% {
            transform: scale(0.96);
            opacity: 0.5;
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.05));
          }
          50% {
            transform: scale(1.04);
            opacity: 1;
            filter: drop-shadow(0 0 40px rgba(255, 0, 85, 0.4));
          }
        }
        @keyframes sprightGlow {
          0%, 100% {
            transform: scale(0.85);
            opacity: 0.35;
          }
          50% {
            transform: scale(1.35);
            opacity: 1;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section className="cases-hero">
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 0, 85, 0.08)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '20px', border: '1px solid rgba(255, 0, 85, 0.15)' }}>
            <Sparkles size={16} /> Birlikte Büyüyoruz
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '20px', lineHeight: '1.2' }}>
            Başarı <span className="gradient-text">Hikayelerimiz</span>
          </h1>
          <p style={{ maxWidth: '700px', margin: '0 auto', color: '#aaa', fontSize: '1.15rem', lineHeight: '1.6' }}>
            İş ortağımız olan markaların hedeflerini gerçekleştirmek için ürettiğimiz kreatif çözümler, uyguladığımız reklam stratejileri ve elde ettiğimiz büyüme sonuçları.
          </p>
        </div>
      </section>

      {/* Brand Selection Tabs */}
      <div className="brand-tabs-container">
        {caseStudiesData.map(item => (
          <button 
            key={item.id}
            className={`brand-tab-btn ${activeBrandId === item.id ? 'active' : ''}`}
            onClick={() => setActiveBrandId(item.id)}
          >
            {item.brand}
          </button>
        ))}
      </div>
      {activeBrand.isComingSoon ? (
        <div className="spright-coming-soon-wrapper">
          <div className="spright-pulse-circle"></div>
          <h1 className="spright-coming-soon-brand">{activeBrand.brand}</h1>
          <p className="spright-coming-soon-tagline">Yakında</p>
        </div>
      ) : (
        <div className="story-container">
          {/* Left Side Details */}
          <div className="story-card-left">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '100px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {activeBrand.sector}
                </span>
                <Award size={20} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', marginBottom: '15px' }}>{activeBrand.brand}</h2>
              <p style={{ color: '#ccc', fontSize: '1.05rem', lineHeight: '1.6', fontStyle: 'italic', position: 'relative', paddingLeft: '20px', borderLeft: '3px solid var(--primary)', marginBottom: '30px' }}>
                "{activeBrand.highlight}"
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '12px', fontWeight: '700' }}>Verilen Hizmetler</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {activeBrand.services.map((srv, idx) => (
                  <span key={idx} style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', padding: '6px 12px', borderRadius: '8px' }}>
                    {srv}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side Content & Metrics */}
          <div className="story-card-right">
            {/* Metrics Grid */}
            <div className="case-metric-grid">
              {activeBrand.metrics.map((m, idx) => (
                <div key={idx} className="case-metric-card">
                  <div className="case-metric-value">{m.value}</div>
                  <div className="case-metric-label">{m.label}</div>
                  <div className="case-metric-desc">{m.desc}</div>
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="details-wrapper">
              <div style={{ marginBottom: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Target size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>Zorluklar & Hedef</h3>
                </div>
                <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.7', textAlign: 'justify' }}>{activeBrand.challenge}</p>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Zap size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>SocialArt Stratejisi</h3>
                </div>
                <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.7', textAlign: 'justify' }}>{activeBrand.solution}</p>
              </div>

              {activeBrand.videos && activeBrand.videos.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '25px', marginTop: '25px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Play size={20} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>Üretilen Kreatif Çalışmalar</h3>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'stretch' }}>
                    {activeBrand.videos.map((vid, index) => {
                      const vidUrl = typeof vid === 'string' ? vid : vid.url;
                      const vidAspect = typeof vid === 'string' ? (activeBrand.videoAspect || '9/16') : (vid.aspect || activeBrand.videoAspect || '9/16');
                      
                      // Calculate flex-basis and width based on aspect ratio
                      // 9:16 is dikey (narrower), 16:9 is yatay (wider)
                      const isHorizontal = vidAspect === '16/9';
                      const flexStyle = isHorizontal 
                        ? { flex: '1 1 100%', minWidth: '280px' } 
                        : { flex: '1 1 calc(50% - 10px)', minWidth: '180px', maxWidth: '280px' };

                      return (
                        <div 
                          key={index} 
                          style={{ 
                            position: 'relative', 
                            borderRadius: '16px', 
                            overflow: 'hidden', 
                            border: '1px solid rgba(255,255,255,0.08)', 
                            background: '#000', 
                            aspectRatio: vidAspect, 
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            margin: isHorizontal ? '0 auto' : '0',
                            ...flexStyle
                          }}
                        >
                          <video 
                            src={vidUrl} 
                            controls 
                            playsInline
                            preload="metadata"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}      {/* CTA Section */}
      <section className="cta-cases container">
        <div className="cta-content">
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '20px' }}>
            Bir Sonraki Başarı Hikayesi <br />
            <span className="gradient-text">Sizin Markanız Olsun</span>
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 35px', color: '#aaa', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Markanızın dijitalde büyümesini hızlandıracak, hedef kitlenizle bağ kuracak ve satışlarınızı katlayacak stratejileri gelin birlikte kuralım.
          </p>
          <Link to="/iletisim" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Hemen Başlayalım <ArrowRight size={20} style={{ marginLeft: '8px' }} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CaseStudies;
