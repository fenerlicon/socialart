import React from 'react';
import { 
  Camera, 
  Globe, 
  ArrowRight,
  TrendingUp,
  Share2,
  Video,
  Users,
  Play,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Star,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Monitor,
  Layers,
  Zap,
  Rocket,
  CheckCircle,
  Phone,
  Mail,
  PlayCircle,
  ChevronDown,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import jeepLogo from '../assets/images/jeep-logo.webp';
import peugeotLogo from '../assets/images/peugeot-logo.png';
import kotonLogo from '../assets/images/koton-logo.png';
import ShowcaseVideo from '../components/ShowcaseVideo';
const AnalysisForm = React.lazy(() => import('../components/AnalysisForm'));
const FAQAccordion = React.lazy(() => import('../components/FAQAccordion'));

const AnimatedMetric = ({ value, suffix = '', prefix = '', label, desc, color }) => {
  const [count, setCount] = React.useState(0);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const metricRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        let start = 0;
        const duration = 2000;
        const steps = 60;
        const increment = value / steps;
        const stepTime = duration / steps;

        const timer = setInterval(() => {
          start += increment;
          if (start >= value) {
            setCount(value);
            clearInterval(timer);
          } else {
            setCount(start);
          }
        }, stepTime);
      }
    }, { threshold: 0.1 });

    if (metricRef.current) observer.observe(metricRef.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div ref={metricRef} className={`metric-card ${hasAnimated ? 'animate-in' : ''}`}>
      <div className="metric-value" style={{ color }}>
        {prefix}{value % 1 === 0 ? Math.floor(count) : count.toFixed(1)}{suffix}
      </div>
      <div className="metric-label">{label}</div>
      <p className="metric-desc">{desc}</p>
    </div>
  );
};

const LazySection = ({ children, height = '300px' }) => {
  const [isInView, setIsInView] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Load when component is within 200px of the viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ minHeight: isInView ? 'auto' : height, width: '100%', display: 'flex', flexDirection: 'column' }}>
      {isInView ? children : null}
    </div>
  );
};

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // SEO Schema
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SocialArt Medya",
    "url": "https://www.socialartmedya.com",
    "logo": "https://www.socialartmedya.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "İstanbul",
      "addressCountry": "TR"
    },
    "description": "İstanbul merkezli; sosyal medya yönetimi, Meta reklam yönetimi, kreatif prodüksiyon, UGC içerik üretimi ve influencer iş birlikleri alanında büyüme (growth) odaklı dijital pazarlama ajansı.",
    "sameAs": [
      "https://instagram.com/socialartajans",
      "https://linkedin.com/company/socialartajans",
      "https://www.youtube.com/channel/UCn3T2JSaWZ2Uo3Ca_oNYnIg"
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "SocialArt Medya",
    "image": "https://www.socialartmedya.com/logo.png",
    "@id": "https://www.socialartmedya.com/#localbusiness",
    "url": "https://www.socialartmedya.com",
    "telephone": "+905398602130",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Çekmeköy",
      "addressLocality": "İstanbul",
      "postalCode": "34782",
      "addressCountry": "TR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 41.0315,
      "longitude": 29.1762
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    "sameAs": [
      "https://instagram.com/socialartajans",
      "https://linkedin.com/company/socialartajans",
      "https://www.youtube.com/channel/UCn3T2JSaWZ2Uo3Ca_oNYnIg"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "SocialArt hangi hizmetleri sunuyor?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SocialArt; sosyal medya yönetimi, Meta reklam yönetimi (Facebook & Instagram Ads), kreatif prodüksiyon (4K video ve ürün çekimi), UGC içerik üretimi, influencer iş birlikleri, SEO & GEO optimizasyonu ve büyüme odaklı dijital pazarlama danışmanlığı sunmaktadır."
        }
      },
      {
        "@type": "Question",
        "name": "SocialArt hangi şehirde hizmet veriyor?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SocialArt, İstanbul merkezli bir dijital pazarlama ajansıdır ancak Türkiye genelinde ve yurt dışındaki markalara uzaktan veya hibrit modelle tam kapsamlı hizmet sağlamaktadır."
        }
      },
      {
        "@type": "Question",
        "name": "Meta reklam yönetimi neleri kapsıyor?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Meta reklam yönetimi hizmetimiz; piksel ve Conversions API (CAPI) teknik kurulumlarını, hedef kitle analizini, dönüşüm odaklı kreatif tasarımını, A/B test optimizasyonunu, bütçe yönetimini ve haftalık şeffaf performans raporlamasını kapsar."
        }
      },
      {
        "@type": "Question",
        "name": "Sosyal medya yönetimi hangi markalar için uygundur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sosyal medya yönetimi; dijitaldeki marka bilinirliğini artırmak, müşteri sadakati oluşturmak, organik erişim elde etmek ve sosyal mecralarını aktif birer satış/iletişim kanalı haline getirmek isteyen tüm B2B, perakende ve hizmet sektörü markaları için uygundur."
        }
      },
      {
        "@type": "Question",
        "name": "UGC içerik üretimi nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "UGC (User Generated Content - Kullanıcı Tarafından Üretilen İçerik); profesyonel stüdyo kurguları yerine gerçek insanların, ürün veya hizmetinizi deneyimlerken çektiği doğal, samimi ve güven veren video içeriklerdir. Sosyal medya reklamlarında dönüşüm oranını en çok artıran formattır."
        }
      },
      {
        "@type": "Question",
        "name": "Influencer iş birlikleri nasıl yönetilir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Influencer iş birlikleri sürecimizde, markanızın hedef kitlesine ve bütçesine en uygun mikro veya makro influencer'ları analiz ediyoruz. Brief hazırlığı, telif hakları yönetimi, gönderi takibi ve kampanya sonundaki dönüşüm analizi süreçlerini uçtan uca yönetiyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "Reklam ve içerik üretimi birlikte yürütülebilir mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet, reklam ve içerik üretiminin birlikte yürütülmesi en verimli yaklaşımdır. Sosyal medya paylaşımlarından elde ettiğimiz organik etkileşim verilerini reklam setlerinde kullanıyor, reklamda kazanan görsel kurgularını da organik içerik stratejimize entegre ediyoruz."
        }
      }
    ]
  };

  const [activeReel, setActiveReel] = React.useState(0);
  const [subClipIndex, setSubClipIndex] = React.useState(0);
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    document.title = "SocialArt Medya | İstanbul Büyüme Odaklı Dijital Pazarlama ve Prodüksiyon";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "SocialArt Medya; İstanbul merkezli, markanızı büyütecek sosyal medya yönetimi, Meta reklam yönetimi, sinematik prodüksiyon, UGC ve influencer iş birlikleri sunan büyüme odaklı dijital pazarlama ajansı.");
    }
  }, []);

  // Reset subclip when switching main reel
  React.useEffect(() => {
    setSubClipIndex(0);
  }, [activeReel]);

  // Handle Autoplay / Unmute on first interaction
  React.useEffect(() => {
    const handleFirstInteraction = () => {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(err => console.error("Interaction play failed:", err));
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('scroll', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };
  }, []);

  // Ensure play on sequence change
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Fallback or silent catch for browser blocks
      });
    }
  }, [activeReel, subClipIndex]);



  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const partners = [
    "PEUGEOT", "KOTON", "JEEP", "Geberit", "Cosentino", "Polar", "Flormar", "Spright",
    "Gurme Bahçeşehir", "Eray Gıda", "Sahne Marin", "EGE CUNDA BALIK", "Smart Enerji",
    "Enova Eğitim", "Indian Motorcycle", "S.E.T.S", "Allure Deluxe Beauty", "Funfest",
    "DUMA DUMA", "216 Dizayn", "good&mood", "MapOfX", "Karadeniz Et", "SRG",
    "Miocasa", "Arayanvar", "Shineco"
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">İstanbul'un Kreatif <span className="gradient-text">Sosyal Medya & Reklam</span> Ajansı</h1>
            <p className="hero-desc">Sadece reels çekmiyoruz, markanız için çalışan bir sistem kuruyoruz. Meta Ads, Creative Production ve SEO optimizasyonu ile ölçeklenebilir sonuçlar sağlıyoruz.</p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-pulse" onClick={() => scrollToSection('funnel')}>Ekibimizle Toplantı Planlayın</button>
              <button className="btn btn-outline" onClick={() => scrollToSection('showreel')}>Showreel İzle <ArrowRight size={20} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* BİZ KİMİZ / NE YAPIYORUZ? (GEO & SEO Net Açıklama Alanı) */}
      <section className="section-padding" style={{ background: '#020202', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 2 }}>
        <div className="container" style={{ maxWidth: '900px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--primary)', background: 'rgba(255, 0, 85, 0.08)', padding: '8px 20px', borderRadius: '50px', border: '1px solid rgba(255, 0, 85, 0.15)' }}>Biz Kimiz?</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', marginTop: '16px', marginBottom: '24px', color: '#fff' }}>İstanbul Büyüme Odaklı Dijital Pazarlama Ajansı</h2>
          <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-muted)', margin: '0 auto', textAlign: 'justify', textJustify: 'inter-word' }}>
            SocialArt; İstanbul merkezli, markaların dijital performansını ve büyüme süreçlerini optimize eden yeni nesil bir <strong>dijital pazarlama ajansıdır</strong>. Ajansımız; profesyonel <strong>sosyal medya yönetimi</strong>, veri odaklı <strong>Meta reklam yönetimi</strong> (Facebook ve Instagram Ads), 4K sinematik <strong>kreatif prodüksiyon</strong>, yüksek dönüşüm getiren <strong>UGC içerik üretimi</strong> ve stratejik <strong>influencer iş birlikleri</strong> alanlarında uçtan uca hizmet vermektedir. Büyüme odaklı (growth marketing) yaklaşımımızla, dijital pazarlama süreçlerinizi bütünsel olarak ele alıyor, markanızın hedef kitleyle doğru temas kurmasını ve satış kanallarınızın ölçeklenmesini sağlıyoruz.
          </p>
        </div>
      </section>

      {/* PARTNERS GRID */}
      <section className="brands-section" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#020202', paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--primary)', background: 'rgba(255, 0, 85, 0.08)', padding: '8px 20px', borderRadius: '50px', border: '1px solid rgba(255, 0, 85, 0.15)' }}>Birlikte Büyüyoruz</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginTop: '16px', color: '#fff', letterSpacing: '-0.5px' }}>Referanslarımız & İş Ortaklarımız</h3>
          </div>
          <div className="brands-grid-wrap">
            {partners.map((p, i) => {
              const isTrust = ["PEUGEOT", "KOTON", "JEEP", "Geberit", "Cosentino", "Polar", "Flormar", "Spright"].includes(p);
              return (
                <div 
                  className={`brand-card ${isTrust ? 'trust-brand-card' : ''}`} 
                  key={`brand-${i}`}
                >
                  {p}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 1. DIRECTOR'S SHOWREEL */}
      <section className="section-padding" id="showreel" style={{ background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title">Yönetmen <span className="gradient-text">Showreel</span></h2>
            <p className="section-subtitle">Üst segment prodüksiyon ve sinematik reklam çekimi vizyonumuz.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', justifyContent: 'center' }}>
            {[
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/q_auto,vc_auto,f_auto/v1778836110/jeep-reel_idufur.mp4", logo: jeepLogo, name: "Jeep" },
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/q_auto,vc_auto,f_auto/v1778836097/peugeot-1_pbbiiq.mp4", logo: peugeotLogo, name: "Peugeot" },
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/q_auto,vc_auto,f_auto/v1778836114/koton-reel_jdmcsk.mp4", logo: kotonLogo, name: "Koton" }
            ].map((item, idx) => (
              <div key={idx} className="glass" style={{ width: '100%', borderRadius: '40px', padding: '15px', maxWidth: '320px', margin: '0 auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}><img src={item.logo} alt={item.name} width="150" height="40" loading="lazy" style={{ height: '40px', objectFit: 'contain' }} /></div>
                <ShowcaseVideo src={item.url} name={item.name} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. METRIC SHOW (ANIMATED) */}
      <section className="section-padding" style={{ background: '#050505', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title">Büyüme <span className="gradient-text">Metriklerimiz</span></h2>
            <p className="section-subtitle">Data odaklı yaklaşımımızla markaları dijitalde devleştiriyoruz.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px' }}>
            <AnimatedMetric value={14.2} suffix="x" label="Ortalama ROAS" desc="Reklam harcaması geri dönüşü" color="#ffffff" />
            <AnimatedMetric value={10} suffix="M+" label="Aylık İzlenme" desc="Kreatiflerimizin toplam erişimi" color="#ffffff" />
            <AnimatedMetric value={85} prefix="%" label="Dönüşüm Artışı" desc="İlk 3 aydaki performans ivmesi" color="#ffffff" />
            <AnimatedMetric value={50} suffix="+" label="Çalışılan Marka" desc="Birlikte büyüdüğümüz iş ortakları" color="#ffffff" />
          </div>
        </div>
      </section>

      {/* 3. HİZMETLERİMİZ */}
      <section className="section-padding" id="services">
        <div className="container">
          <h2 className="section-title">Hizmetlerimiz</h2>
          <div className="services-grid">
            <Link to="/meta-ads-yonetimi" className="service-card" style={{ textDecoration: 'none' }}>
              <TrendingUp className="service-icon" style={{color: 'var(--secondary)'}} />
              <h3 className="service-title">Meta Ads Yönetimi</h3>
              <p className="service-desc">Data odaklı reklam stratejileri ile ROAS odaklı ölçeklenebilir büyüme sistemleri.</p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>İncele <ArrowRight size={16} style={{marginLeft: '5px'}} /></div>
            </Link>
            <Link to="/creative-production" className="service-card" style={{ textDecoration: 'none' }}>
              <Camera className="service-icon" style={{color: 'var(--accent)'}} />
              <h3 className="service-title">Kreatif Prodüksiyon</h3>
              <p className="service-desc">Sinematik reklam filmleri ve sosyal medya için yüksek kaliteli video içerik üretimi.</p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>İncele <ArrowRight size={16} style={{marginLeft: '5px'}} /></div>
            </Link>
            <Link to="/seo-geo-optimizasyonu" className="service-card" style={{ textDecoration: 'none' }}>
              <Globe className="service-icon" style={{color: '#00e5ff'}} />
              <h3 className="service-title">SEO & GEO</h3>
              <p className="service-desc">Arama motorları ve yapay zeka sistemlerinde görünürlüğünüzü artırarak organik büyüme yakalayın.</p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>İncele <ArrowRight size={16} style={{marginLeft: '5px'}} /></div>
            </Link>
            <Link to="/sosyal-medya-yonetimi" className="service-card" style={{ textDecoration: 'none' }}>
              <Share2 className="service-icon" style={{color: 'var(--primary)'}} />
              <h3 className="service-title">Sosyal Medya</h3>
              <p className="service-desc">Kreatif içerik yönetimi ve aktif topluluk etkileşimi ile dijital otoritenizi inşa edin.</p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>İncele <ArrowRight size={16} style={{marginLeft: '5px'}} /></div>
            </Link>
            <Link to="/ugc-influencer-isbirligi" className="service-card" style={{ textDecoration: 'none' }}>
              <Smartphone className="service-icon" style={{color: 'var(--primary)'}} />
              <h3 className="service-title">UGC & Influencer</h3>
              <p className="service-desc">Kullanıcı odaklı doğal içerikler ve stratejik influencer iş birlikleri ile güven inşa edin.</p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>İncele <ArrowRight size={16} style={{marginLeft: '5px'}} /></div>
            </Link>
            <Link to="/event-etkinlik-cekimi" className="service-card" style={{ textDecoration: 'none' }}>
              <Calendar className="service-icon" style={{color: '#ffb703'}} />
              <h3 className="service-title">Event & Etkinlik Çekimi</h3>
              <p className="service-desc">Lansmanlar, fuarlar, kurumsal etkinlikler ve özel organizasyonlar için dinamik aftermovie and fotoğraf prodüksiyonu.</p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>İncele <ArrowRight size={16} style={{marginLeft: '5px'}} /></div>
            </Link>
          </div>
        </div>
      </section>

      {/* WHY SOCIALART (Neden SocialArt?) */}
      <section className="section-padding" style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--secondary)', background: 'rgba(255, 0, 85, 0.08)', padding: '8px 20px', borderRadius: '50px', border: '1px solid rgba(255, 0, 85, 0.15)' }}>Neden Biz?</span>
            <h2 className="section-title" style={{ marginTop: '16px' }}>Büyüme Odaklı <span className="gradient-text">Ajans Yaklaşımı</span></h2>
            <p className="section-subtitle">Klasik ajans modellerinin ötesine geçerek, markanızın büyüme süreçlerini uçtan uca yönetiyoruz.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            <div className="glass" style={{ padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,0,85,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--secondary)' }}>
                <BarChart3 size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', fontWeight: '800' }}>Problemi Analiz Ediyoruz</h3>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Sadece tasarım veya görsel içerik üretimi yapmıyoruz. Markanızın mevcut pazardaki problemlerini, rakiplerini ve hedef kitlesini derinlemesine analiz ederek işe başlıyoruz.
              </p>
            </div>

            <div className="glass" style={{ padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(138,43,226,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--primary)' }}>
                <Layers size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', fontWeight: '800' }}>Entegre Çalışma Sistemi</h3>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Reklam yönetimi, kreatif prodüksiyon ve içerik üretim süreçlerini birbirinden bağımsız yönetmiyoruz. Kampanya hedeflerine hizmet eden bütünleşik bir yapıda ele alıyoruz.
              </p>
            </div>

            <div className="glass" style={{ padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#00e5ff' }}>
                <Zap size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', fontWeight: '800' }}>Veriye Göre Optimizasyon</h3>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Tüm kreatif kararlarımızı ve bütçe dağılımlarımızı verilere dayandırıyoruz. A/B testleriyle en yüksek dönüşüm ve ROAS getiren kurguları ölçeklendiriyoruz.
              </p>
            </div>

            <div className="glass" style={{ padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(0,230,118,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#00e676' }}>
                <Rocket size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', fontWeight: '800' }}>Büyümeye Özel Strateji</h3>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Her markanın büyüme süreci ve ihtiyaçları farklıdır. Şablon çözümler sunmak yerine, markanızın o anki hedeflerine ve bütçesine uygun kişiselleştirilmiş stratejiler geliştiriyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SUNUCULU REKLAM VİDEOLARIMIZ */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title">Sunuculu <span className="gradient-text">Reklam Videolarımız</span></h2>
            <p className="section-subtitle">Ürününüzü profesyonel bir sunucu eşliğinde stüdyo ortamında tanıtıyoruz.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', justifyContent: 'center' }}>
            {[
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/q_auto,vc_auto,f_auto/v1778836177/video1_ewynu2.mov" },
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/q_auto,vc_auto,f_auto/v1778836171/video2_vthln3.mp4" },
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/q_auto,vc_auto,f_auto/v1778836176/video3_f9pp8w.mp4" }
            ].map((item, idx) => (
              <div key={idx} className="glass" style={{ width: '100%', borderRadius: '40px', padding: '15px', maxWidth: '320px', margin: '0 auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
                <ShowcaseVideo src={item.url} name={`Örnek Reklam ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. MÜŞTERİ YORUMLARI */}
      <section className="section-padding" style={{ background: '#050505' }}>
        <div className="container">
          <h2 className="section-title">Müşteri <span className="gradient-text">Yorumları</span></h2>
          <div className="testi-grid">
            <div className="testi-card">
              <p className="testi-text">"Sosyal Art'ın profesyonel çekim kalitesi ve yaratıcı sosyal medya yönetimi sayesinde dijitalde gerçek anlamda fark yarattık. Reklamlar üzerinden gelen müşteri hacmindeki artış bizi şaşırttı."</p>
              <div className="testi-author">
                <div className="testi-avatar">Ö</div>
                <div><h4>Özge Aydın</h4><span>Müdür, Gurme Bahçeşehir</span></div>
              </div>
            </div>
            <div className="testi-card">
              <p className="testi-text">"Markamız için gerçekleştirilen kaliteli çekimler ve stratejik yönetim sayesinde çok daha geniş kitlelere ulaştık. Reklam kampanyalarından gelen geri dönüşler mükemmel."</p>
              <div className="testi-author">
                <div className="testi-avatar">K</div>
                <div><h4>Koray Bey</h4><span>Marka Sorumlusu, Socketta</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SİZE ÖZEL FIRSATLAR */}
      <section className="campaigns-section" id="kampanyalar" style={{paddingTop: '40px'}}>
        <div className="container">
          <h2 className="section-title">Size Özel <span className="gradient-text">Fırsatlar</span></h2>
          <div className="campaign-grid">
            <div className="campaign-card">
              <ShieldCheck size={30} color="var(--primary)" />
              <h3 className="campaign-title">%50 İade Garantisi!</h3>
              <p className="campaign-desc">Minimum 6 aylık iş birliğinde memnun kalmazsanız, ücretinizin yarısını iade ediyoruz!</p>
              <button className="btn btn-outline" style={{width: '100%', color: '#fff'}} onClick={() => scrollToSection('funnel')}>Toplantı Planlayın</button>
            </div>
            <div className="campaign-card" style={{border: '1px solid rgba(255,0,85,0.3)'}}>
              <CreditCard size={30} color="var(--secondary)" />
              <h3 className="campaign-title">6 Taksit Avantajı</h3>
              <p className="campaign-desc">Tüm projelerimizde maliyetlerinizi düşünen 6 taksite kadar ödeme kolaylığı!</p>
              <button className="btn btn-primary" style={{width: '100%'}} onClick={() => scrollToSection('funnel')}>Toplantı Planlayın <ArrowRight size={20} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MARKANIZ İÇİN ÜCRETSİZ ANALİZ */}
      <section className="funnel-form-section" id="funnel">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="section-title">Uzman Ekibimizle <span className="gradient-text">Toplantı Planlayın</span></h2>
            <p className="section-subtitle">Uzman ekibimiz mevcut durumunuzu analiz etsin ve size özel büyüme raporu sunsun.</p>
          </div>
          <LazySection height="350px">
            <React.Suspense fallback={
              <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            }>
              <AnalysisForm />
            </React.Suspense>
          </LazySection>
        </div>
      </section>

      {/* 8. SIKÇA SORULAN SORULAR */}
      <section className="section-padding" style={{ background: '#000' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Sıkça Sorulan <span className="gradient-text">Sorular</span></h2>
          <LazySection height="250px">
            <React.Suspense fallback={
              <div style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            }>
              <FAQAccordion items={[
                {
                  question: "SocialArt hangi hizmetleri sunuyor?",
                  answer: "SocialArt; sosyal medya yönetimi, Meta reklam yönetimi (Facebook & Instagram Ads), kreatif prodüksiyon (4K video ve ürün çekimi), UGC içerik üretimi, influencer iş birlikleri, SEO & GEO optimizasyonu ve büyüme odaklı dijital pazarlama danışmanlığı sunmaktadır."
                },
                {
                  question: "SocialArt hangi şehirde hizmet veriyor?",
                  answer: "SocialArt, İstanbul merkezli bir dijital pazarlama ajansıdır ancak Türkiye genelinde ve yurt dışındaki markalara uzaktan veya hibrit modelle tam kapsamlı hizmet sağlamaktadır."
                },
                {
                  question: "Meta reklam yönetimi neleri kapsıyor?",
                  answer: "Meta reklam yönetimi hizmetimiz; piksel ve Conversions API (CAPI) teknik kurulumlarını, hedef kitle analizini, dönüşüm odaklı kreatif tasarımını, A/B test optimizasyonunu, bütçe yönetimini ve haftalık şeffaf performans raporlamasını kapsar."
                },
                {
                  question: "Sosyal medya yönetimi hangi markalar için uygundur?",
                  answer: "Sosyal medya yönetimi; dijitaldeki marka bilinirliğini artırmak, müşteri sadakati oluşturmak, organik erişim elde etmek ve sosyal mecralarını aktif birer satış/iletişim kanalı haline getirmek isteyen tüm B2B, perakende ve hizmet sektörü markaları için uygundur."
                },
                {
                  question: "UGC içerik üretimi nedir?",
                  answer: "UGC (User Generated Content - Kullanıcı Tarafından Üretilen İçerik); profesyonel stüdyo kurguları yerine gerçek insanların, ürün veya hizmetinizi deneyimlerken çektiği doğal, samimi ve güven veren video içeriklerdir. Sosyal medya reklamlarında dönüşüm oranını en çok artıran formattır."
                },
                {
                  question: "Influencer iş birlikleri nasıl yönetilir?",
                  answer: "Influencer iş birlikleri sürecimizde, markanızın hedef kitlesine ve bütçesine en uygun mikro veya makro influencer'ları analiz ediyoruz. Brief hazırlığı, telif hakları yönetimi, gönderi takibi ve kampanya sonundaki dönüşüm analizi süreçlerini uçtan uca yönetiyoruz."
                },
                {
                  question: "Reklam ve içerik üretimi birlikte yürütülebilir mi?",
                  answer: "Evet, reklam ve içerik üretiminin birlikte yürütülmesi en verimli yaklaşımdır. Sosyal medya paylaşımlarından elde ettiğimiz organik etkileşim verilerini reklam setlerinde kullanıyor, reklamda kazanan görsel kurgularını da organik içerik stratejimize entegre ediyoruz."
                }
              ]} />
            </React.Suspense>
          </LazySection>
        </div>
      </section>

      {/* 9. YARATICI EKİBİMİZE KATILIN */}
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title">Yaratıcı Ekibimize <span className="gradient-text">Katılın</span></h2>
            <p className="section-subtitle">SocialArt topluluğuna dahil olun, birlikte üretelim.</p>
          </div>
          <div className="services-grid">
            <div className="glass" style={{ padding: '40px', borderRadius: '32px', textAlign: 'center' }}>
              <Zap size={40} color="var(--primary)" style={{ marginBottom: '20px' }} />
              <h3>UGC & Influencer</h3>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => navigate('/ugc-basvuru')}>Başvuru Yap</button>
            </div>
            <div className="glass" style={{ padding: '40px', borderRadius: '32px', textAlign: 'center' }}>
              <Rocket size={40} color="#00e5ff" style={{ marginBottom: '20px' }} />
              <h3>Kariyer</h3>
              <button className="btn btn-outline" style={{ width: '100%', marginTop: '20px' }} onClick={() => navigate('/is-basvurusu')}>İş Başvurusu</button>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

export default Home;
