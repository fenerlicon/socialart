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
    challenge: 'Koton\'un yeni sezon koleksiyon lansmanı için sosyal medya mecralarında paylaşılmak üzere, ürünlerin hareket halindeki estetiğini, dokusunu ve kumaş kalitesini öne çıkaracak enerjik ve yüksek kalitede video kreatif üretimi.',
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
    id: 'spright',
    brand: 'SPRIGHT',
    sector: 'Spor & Giyim',
    services: ['Stüdyo Çekim & Kiralama', 'Katalog Çekimleri', 'Sosyal Medya Yönetimi'],
    challenge: 'Pazara yeni giren aktif giyim markasının marka bilinirliğini estetik, dinamik ve profesyonel bir görsel dille oluşturmak.',
    solution: 'Kendi stüdyomuzda, profesyonel sporcularla dinamik hareket/aksiyon odaklı fotoğraf ve katalog çekimleri gerçekleştirdik. Sosyal medya feed tasarımını modern, sportif ve minimal bir estetikle kurguladık.',
    metrics: [
      { value: '+%200', label: 'Bilinirlik Artışı', desc: 'Marka lansmanının ilk 2 ayındaki yükseliş' },
      { value: '5K+', label: 'Yeni Müşteri', desc: 'Sosyal medya kanallarından gelen satışlar' },
      { value: '9/10', label: 'Müşteri Memnuniyeti', desc: 'Katalog ve görsel içerik kalitesi puanı' }
    ],
    highlight: 'Aktif giyim markasının dinamizmini profesyonel sporcu çekimleriyle yansıttık.'
  },
  {
    id: 'cosentino',
    brand: 'COSENTINO',
    sector: 'Mimari / Yapı Malzemeleri',
    services: ['Kreatif Prodüksiyon', 'Post Prodüksiyon', 'Sosyal Medya Yönetimi'],
    challenge: 'Premium mimari ve tasarım kitlelerine hitap eden, ürünlerin detay kalitesini ve estetiğini ön plana çıkaran prestijli içerikler üretmek.',
    solution: 'Lüks mimari projelerde ve showroom alanlarında detay odaklı, sinematik makro çekimler gerçekleştirdik. Tasarımcı ve mimarlarla röportaj formatında, bilgi sunan estetik video serileri hazırladık.',
    metrics: [
      { value: '+%110', label: 'B2B Etkileşim', desc: 'Mimar ve tasarımcı kitlesine erişim' },
      { value: '450K+', label: 'Hedefli Gösterim', desc: 'Premium mimari kitle erişimi' },
      { value: '+%65', label: 'Teklif Talebi', desc: 'Sosyal medyadan gelen kurumsal talepler' }
    ],
    highlight: 'Lüks yapı malzemelerini mimari estetiği yansıtan makro çekimlerle görselleştirdik.'
  },
  {
    id: 'geberit',
    brand: 'GEBERIT',
    sector: 'Sıhhi Tesisat / Yapı Teknolojileri',
    services: ['Post Prodüksiyon', 'Sosyal Medya Yönetimi', 'Meta Ads Yönetimi'],
    challenge: 'Teknolojik ve inovatif banyo çözümlerini son tüketiciye anlaşılır, estetik ve fayda odaklı bir dille anlatmak.',
    solution: 'Ürünlerin fonksiyonel ve hijyenik avantajlarını animasyonlar ve akıcı kurgularla açıklayan video serileri hazırladık. Son tüketiciye hitap eden bilgilendirici infografikler ve video kampanyaları yürüttük.',
    metrics: [
      { value: '1.2M+', label: 'Erişim Skoru', desc: 'Bilinirlik kampanyaları toplam gösterimi' },
      { value: '+%48', label: 'Form Dönüşümü', desc: 'Showroom ziyaret taleplerindeki artış' },
      { value: '2.5x', label: 'Reklam Verimliliği', desc: 'Tüketici hedefli kampanyaların başarısı' }
    ],
    highlight: 'İleri teknolojili banyo çözümlerini sade ve fayda odaklı videolarla anlattık.'
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

      {/* Active Brand Story Showcase */}
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  {activeBrand.videos.map((vidUrl, index) => (
                    <div key={index} style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: '#000', aspectRatio: activeBrand.videoAspect || '9/16', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                      <video 
                        src={vidUrl} 
                        controls 
                        playsInline
                        preload="metadata"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
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
