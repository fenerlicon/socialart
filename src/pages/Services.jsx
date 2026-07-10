import React from 'react';
import { Camera, Video, Users, ArrowRight, Mic, Smartphone, Layers, Monitor, TrendingUp, Globe, Star, CheckCircle, Zap, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const servicesData = [
  {
    id: '360-sosyal-medya',
    title: '360° Sosyal Medya & Reklam Yönetimi',
    icon: <Layers size={32} color="var(--primary)" />,
    color: 'var(--primary)',
    glow: 'rgba(138, 43, 226, 0.15)',
    desc: '360 derece sosyal medya yönetimi ile markanızın dijital dünyadaki tüm temas noktalarını tek elden yönetiyoruz. Meta ve Google reklamlarında data odaklı yaklaşımlarımızla yüksek performanslı reklam yönetimi sağlıyoruz.',
    features: ['Meta & Google Ads Yönetimi', 'İçerik Planlaması & Üretimi', 'Topluluk Yönetimi', 'Haftalık Raporlama'],
    link: '/sosyal-medya-yonetimi'
  },
  {
    id: 'meta-ads',
    title: 'Meta Ads Yönetimi',
    icon: <TrendingUp size={32} color="#ff0055" />,
    color: '#ff0055',
    glow: 'rgba(255, 0, 85, 0.15)',
    desc: 'Facebook ve Instagram reklamlarında veriye dayalı stratejilerle markanızın hedef kitlesine ulaşıyoruz. ROAS odaklı kampanya yönetimi ile reklam bütçenizin her kuruşunu verimli kullanıyoruz.',
    features: ['Hedef Kitle Analizi', 'Reklam Kreatif Tasarımı', 'A/B Test Optimizasyonu', 'ROAS Takibi & Raporlama'],
    link: '/meta-ads-yonetimi'
  },
  {
    id: 'studyo-cekim',
    title: 'Stüdyo Çekim & Kiralama',
    icon: <Monitor size={32} color="var(--accent)" />,
    color: 'var(--accent)',
    glow: 'rgba(0, 229, 255, 0.15)',
    desc: 'Kendi bünyemizdeki profesyonel stüdyomuzda, en üst seviye ışık ve kamera ekipmanlarıyla markanız için stüdyo kalitesinde içerikler üretiyoruz. Bağımsız ekipler için tam donanımlı stüdyo kiralama hizmeti de sunuyoruz.',
    features: ['Profesyonel Işık Ekipmanları', 'Tam Donanımlı Stüdyo', 'Kiralama Seçeneği', '4K Çekim Kalitesi'],
    link: '/creative-production'
  },
  {
    id: 'fotograf',
    title: 'Profesyonel Fotoğraf Çekimleri',
    icon: <Camera size={32} color="#00e676" />,
    color: '#00e676',
    glow: 'rgba(0, 230, 118, 0.15)',
    desc: 'Markalara özel profesyonel fotoğraf hizmetleri sunuyoruz. Ürün, Yemek, Spor, Model, Emlak, Lansman, Katalog çekimleri gibi geniş bir yelpazede kaliteli görseller sağlıyoruz.',
    features: ['Ürün & Katalog Çekimi', 'Yemek Fotoğrafçılığı', 'Model & Lifestyle', 'Sosyal Medya Görselleri'],
    link: '/creative-production'
  },
  {
    id: 'video-prod',
    title: 'Video Prodüksiyonu',
    icon: <Video size={32} color="#ff0055" />,
    color: '#ff0055',
    glow: 'rgba(255, 0, 85, 0.15)',
    desc: 'Modern medya dünyasında yüksek kaliteli ve yaratıcı videolar oluşturuyoruz. Her projede izleyicilere benzersiz deneyimler sunmayı hedefliyoruz. Yenilikçi ve dinamik bakış açısıyla her videoda yeni hikayeler keşfediyoruz.',
    features: ['Sinematik Reklam Filmleri', 'Kurumsal Tanıtım Videoları', 'Sosyal Medya Reels & TikTok', 'Drone Çekimleri'],
    link: '/creative-production'
  },
  {
    id: 'event-cekimi',
    title: 'Event & Etkinlik Çekimi',
    icon: <Calendar size={32} color="#ffb703" />,
    color: '#ffb703',
    glow: 'rgba(255, 183, 3, 0.15)',
    desc: 'Lansmanlar, fuarlar, kurumsal etkinlikler, partiler ve özel organizasyonlarınız için dinamik, enerjik ve yüksek çözünürlüklü video & fotoğraf prodüksiyonu sunuyoruz.',
    features: ['Lansman & Gala Videoları', 'Kurumsal Etkinlik Çekimleri', 'Aftermovie & Özet Klipler', 'Profesyonel Etkinlik Fotoğrafçılığı'],
    link: '/event-etkinlik-cekimi'
  },
  {
    id: 'sunuculu',
    title: 'Sunuculu Tanıtım Videoları',
    icon: <Mic size={32} color="var(--primary)" />,
    color: 'var(--primary)',
    glow: 'rgba(138, 43, 226, 0.15)',
    desc: 'Ürün veya hizmetlerinizi profesyonel sunucular eşliğinde güven veren ve ikna edici bir dille anlatıyoruz. Dönüşüm oranlarını doğrudan etkileyen yüksek kaliteli video içerikleri üretiyoruz.',
    features: ['Profesyonel Sunucu Kadrosu', 'Satış Odaklı Senaryo', 'Stüdyo Kalitesi Çekim', 'Hızlı Teslimat'],
    link: '/sunuculu-reklam-videolari'
  },
  {
    id: 'seo-geo',
    title: 'SEO & GEO Optimizasyonu',
    icon: <Globe size={32} color="#00e5ff" />,
    color: '#00e5ff',
    glow: 'rgba(0, 229, 255, 0.15)',
    desc: 'Arama motorlarında üst sıralara çıkmanızı ve yapay zeka destekli arama sonuçlarında (GEO) öne çıkmanızı sağlıyoruz. Organik trafiğinizi artırarak markanızı kalıcı dijital varlığa kavuşturuyoruz.',
    features: ['Teknik SEO Analizi', 'Anahtar Kelime Stratejisi', 'GEO (Generative Engine Optimization)', 'Aylık SEO Raporu'],
    link: '/seo-geo-optimizasyonu'
  },
  {
    id: 'ugc',
    title: 'UGC İçerik & Influencer Marketing',
    icon: <Users size={32} color="#ffab00" />,
    color: '#ffab00',
    glow: 'rgba(255, 171, 0, 0.15)',
    desc: 'Samimi ve doğal kullanıcı içerikleri (UGC) ile markanızın güvenilirliğini artırıyoruz. Doğru influencer eşleşmeleri ve stratejik içerik planlamasıyla etkileşim ve satış rakamlarınızı yukarı taşıyoruz.',
    features: ['UGC İçerik Üreticileri', 'Influencer Eşleştirme', 'Kampanya Yönetimi', 'Performans Analizi'],
    link: '/ugc-influencer-isbirligi'
  },
  {
    id: 'dijital-danismanlik',
    title: 'Dijital Pazarlama Danışmanlığı',
    icon: <Layers size={32} color="var(--primary)" />,
    color: 'var(--primary)',
    glow: 'rgba(138, 43, 226, 0.15)',
    desc: '360 derece büyüme (growth) odaklı dijital pazarlama danışmanlığı. Satış hunileri, bütçe verimliliği, kreatif mentorluk ve CRO optimizasyonları.',
    features: ['360° Büyüme Analizi', 'Stratejik Yol Haritası', 'CRO & Sepet İyileştirme', 'Haftalık Strateji Seansları'],
    link: '/dijital-pazarlama-danismanligi'
  },
  {
    id: 'post-produksiyon',
    title: 'Post-Prodüksiyon (Kurgu & Montaj)',
    icon: <Video size={32} color="#ffb703" />,
    color: '#ffb703',
    glow: 'rgba(255, 183, 3, 0.15)',
    desc: 'Çekimlerinizi profesyonel kurgu, sinematik renk derecelendirme (color grading), görsel efektler (VFX), hareketli grafikler ve zengin ses tasarımı ile yüksek dönüşüm getiren birer görsel şölene dönüştürüyoruz.',
    features: ['Sinematik Renk Derecelendirme', 'Dinamik Kurgu & Montaj', 'CGI & Görsel Efektler (VFX)', 'Zengin Ses Tasarımı & SFX'],
    link: '/post-produksiyon'
  }
];

function Services() {
  React.useEffect(() => {
    document.title = "Hizmetlerimiz | SocialArt Medya";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "SocialArt Medya tarafından sunulan growth odaklı dijital pazarlama, sosyal medya yönetimi, Meta reklam yönetimi, sinematik prodüksiyon, UGC ve danışmanlık hizmetleri.");
    }
  }, []);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "SocialArt Medya Hizmetleri",
    "description": "SocialArt Medya tarafından sunulan dijital pazarlama, video prodüksiyon ve reklam yönetimi hizmetleri listesi.",
    "itemListElement": servicesData.map((service, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Service",
        "name": service.title,
        "description": service.desc,
        "provider": {
          "@type": "Organization",
          "name": "SocialArt Medya",
          "url": "https://www.socialartmedya.com"
        },
        "url": `https://www.socialartmedya.com${service.link}`
      }
    }))
  };

  return (
    <div style={{ background: '#050505', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />


      {/* HERO */}
      <section style={{
        padding: '160px 0 80px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at center top, rgba(138,43,226,0.12) 0%, transparent 60%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(138,43,226,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,0,85,0.05) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(138,43,226,0.1)', border: '1px solid rgba(138,43,226,0.3)',
            color: 'var(--primary)', padding: '8px 20px', borderRadius: '100px',
            fontSize: '0.85rem', fontWeight: '700', marginBottom: '24px', letterSpacing: '1px'
          }}>
            <Zap size={14} /> 360° DİJİTAL ÇÖZÜMLER
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: '900', marginBottom: '20px', lineHeight: 1.1 }}>
            Markanız İçin <span className="gradient-text">Her Şey</span>
          </h1>
          <p style={{ maxWidth: '680px', margin: '0 auto', color: '#aaa', fontSize: '1.15rem', lineHeight: '1.7' }}>
            Dijital dünyada görünür olmak ve marka bilinirliğinizi artırmak için ihtiyaç duyduğunuz her hizmeti tek çatı altında sunuyoruz.
          </p>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {[
              { val: '8+', label: 'Hizmet Alanı' },
              { val: '50+', label: 'Çalışılan Marka' },
              { val: '3M+', label: 'Organik Erişim' },
              { val: '%94', label: 'Müşteri Memnuniyeti' }
            ].map((s, i) => (
              <div key={i} style={{
                padding: '30px 24px', textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.val}</div>
                <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '4px', fontWeight: '500' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section style={{ padding: '0 0 120px' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            {servicesData.map((service) => (
              <Link
                key={service.id}
                to={service.link}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '24px',
                  padding: '36px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = service.color;
                    e.currentTarget.style.boxShadow = `0 20px 60px ${service.glow}`;
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  {/* Glow BG */}
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: '180px', height: '180px',
                    background: `radial-gradient(circle, ${service.glow} 0%, transparent 70%)`,
                    pointerEvents: 'none'
                  }} />

                  {/* Icon */}
                  <div style={{
                    width: '60px', height: '60px',
                    background: service.glow,
                    border: `1px solid ${service.color}30`,
                    borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {service.icon}
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', margin: 0, lineHeight: '1.3' }}>
                    {service.title}
                  </h2>

                  {/* Desc */}
                  <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.7', margin: 0, flexGrow: 1 }}>
                    {service.desc}
                  </p>

                  {/* Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {service.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={14} color={service.color} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.85rem', color: '#ccc' }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color: service.color, fontSize: '0.85rem', fontWeight: '700',
                    marginTop: '4px'
                  }}>
                    Detaylı İncele <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{
        padding: '100px 0',
        background: 'linear-gradient(135deg, rgba(138,43,226,0.08) 0%, rgba(255,0,85,0.08) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="#ffab00" color="#ffab00" />)}
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '900', marginBottom: '16px' }}>
            Markanızı Dijitalde <span className="gradient-text">Zirveye</span> Taşıyalım
          </h2>
          <p style={{ color: '#888', maxWidth: '560px', margin: '0 auto 40px', fontSize: '1.05rem', lineHeight: '1.7' }}>
            İletişime geçin, ihtiyaçlarınızı birlikte değerlendirelim. Markanıza özel yaratıcı çözümler üretelim.
          </p>
          <a href="/#funnel" className="btn btn-primary" style={{ fontSize: '1rem', padding: '16px 40px', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', color: '#fff', borderRadius: '50px', fontWeight: '700', textDecoration: 'none' }}>
            Ekibimizle Toplantı Planlayın <ArrowRight size={20} />
          </a>
        </div>
      </section>

    </div>
  );
}

export default Services;
