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
  MessageSquare
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import jeepLogo from '../assets/images/jeep-logo.webp';
import peugeotLogo from '../assets/images/peugeot-logo.png';
import kotonLogo from '../assets/images/koton-logo.png';
import AnalysisForm from '../components/AnalysisForm';
import FAQAccordion from '../components/FAQAccordion';

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

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // SEO Schema
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SocialArt Ajans",
    "url": "https://www.socialartmedya.com",
    "logo": "https://www.socialartmedya.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "İstanbul",
      "addressCountry": "TR"
    },
    "description": "İstanbul merkezli büyüme odaklı (growth) dijital pazarlama ajansı.",
    "sameAs": [
      "https://www.instagram.com/socialartmedya"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Meta Ads nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Meta Ads, Facebook ve Instagram üzerinden hedefli reklamlar vererek potansiyel müşterilerinize ulaşmanızı sağlar."
        }
      },
      {
        "@type": "Question",
        "name": "SEO ve GEO farkı nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SEO geleneksel arama motorları için yapılırken, GEO (Generative Engine Optimization) yapay zeka sistemlerinin markanız hakkında doğru bilgi vermesini sağlar."
        }
      }
    ]
  };

  const [selectedDateStr, setSelectedDateStr] = React.useState('');
  const [selectedTimeStr, setSelectedTimeStr] = React.useState('');
  const [activeReel, setActiveReel] = React.useState(0);
  const [subClipIndex, setSubClipIndex] = React.useState(0);
  const videoRef = React.useRef(null);

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

  const today = new Date();
  const [displayedMonth, setDisplayedMonth] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const daysInMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = displayedMonth.getDay();
  const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  
  const handlePrevMonth = () => {
    if (displayedMonth.getFullYear() === today.getFullYear() && displayedMonth.getMonth() === today.getMonth()) return;
    setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = () => setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1));

  const timeSlots = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"];

  const [loading, setLoading] = React.useState(false);
  const [formSuccess, setFormSuccess] = React.useState(false);
  const [formError, setFormError] = React.useState('');

  const [formData, setFormData] = React.useState({
    fullName: '', phone: '', email: '', url: '', services: []
  });
  const [blockedSlots, setBlockedSlots] = React.useState([]);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchBlockedSlots();
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    const funnelEl = document.getElementById('funnel');
    if (funnelEl) observer.observe(funnelEl);
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const partners = [
    "KOTON", "JEEP", "PEUGEOT", "Gurme Bahçeşehir", "Eray Gıda", "Flormar",
    "Sahne Marin", "EGE CUNDA BALIK", "Smart Enerji", "Polar", "Enova Eğitim",
    "Indian Motorcycle", "S.E.T.S", "Allure Deluxe Beauty", "Funfest",
    "DUMA DUMA", "216 Dizayn", "good&mood", "MapOfX", "Cosentino", "Geberit",
    "Karadeniz Et", "SRG"
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">İstanbul'un Öncü <span className="gradient-text">Sosyal Medya & Reklam</span> Ajansı</h1>
            <p className="hero-desc">Sadece reels çekmiyoruz, markanız için çalışan bir sistem kuruyoruz. Meta Ads, Creative Production ve SEO optimizasyonu ile ölçeklenebilir sonuçlar sağlıyoruz.</p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-pulse" onClick={() => scrollToSection('funnel')}>Ücretsiz Analiz Al</button>
              <button className="btn btn-outline" onClick={() => scrollToSection('showreel')}>Showreel İzle <ArrowRight size={20} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS TICKER (Moved above Showreel for social proof) */}
      <section className="brands-section" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#000', paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="container">
          <div className="brand-ticker-wrap">
            <div className="brand-track">
              {partners.map((p, i) => <div className="brand-item" key={`t1-${i}`}>{p}</div>)}
              {/* Duplicate for seamless scrolling */}
              {partners.map((p, i) => <div className="brand-item" key={`t2-${i}`}>{p}</div>)}
            </div>
          </div>
        </div>
      </section>

      {/* 1. DIRECTOR'S SHOWREEL */}
      <section className="section-padding" id="showreel" style={{ background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title">Director's <span className="gradient-text">Showreel</span></h2>
            <p className="section-subtitle">Üst segment prodüksiyon ve sinematik reklam çekimi vizyonumuz.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', justifyContent: 'center' }}>
            {[
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/q_auto,f_auto/jeep-reel.mp4", logo: "/assets/images/jeep-logo.webp", name: "Jeep" },
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/q_auto,f_auto/peugeot-1.mp4", logo: "/assets/images/peugeot-logo.png", name: "Peugeot" },
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/q_auto,f_auto/koton-reel.mp4", logo: "/assets/images/koton-logo.png", name: "Koton" }
            ].map((item, idx) => (
              <div key={idx} className="glass" style={{ borderRadius: '40px', padding: '15px', maxWidth: '320px', margin: '0 auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}><img src={item.logo} alt={item.name} width="150" height="40" loading="lazy" style={{ height: '40px', objectFit: 'contain' }} /></div>
                <div style={{ borderRadius: '30px', overflow: 'hidden', aspectRatio: '9/16', background: '#000', position: 'relative', border: '8px solid #1a1a1a' }}>
                  <video src={item.url} autoPlay muted loop playsInline preload="none" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. METRIC SHOW (ANIMATED) */}
      <section className="section-padding" style={{ background: '#050505', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title">Growth <span className="gradient-text">Metrics</span></h2>
            <p className="section-subtitle">Data odaklı yaklaşımımızla markaları dijitalde devleştiriyoruz.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px' }}>
            <AnimatedMetric value={14.2} suffix="x" label="Ortalama ROAS" desc="Reklam harcaması geri dönüşü" color="var(--primary)" />
            <AnimatedMetric value={10} suffix="M+" label="Aylık İzlenme" desc="Kreatiflerimizin toplam erişimi" color="var(--accent)" />
            <AnimatedMetric value={85} suffix="%" prefix="%" label="Dönüşüm Artışı" desc="İlk 3 aydaki performans ivmesi" color="var(--secondary)" />
            <AnimatedMetric value={50} suffix="+" label="Aktif Marka" desc="Birlikte büyüdüğümüz iş ortakları" color="#fff" />
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
              <h3 className="service-title">Creative Production</h3>
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
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/q_auto,f_auto/video1.mov", name: "MioCasa Halı" },
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/q_auto,f_auto/video2.mp4", name: "ArayanVar" },
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/q_auto,f_auto/video3.mp4", name: "Social Art" }
            ].map((item, idx) => (
              <div key={idx} className="glass" style={{ borderRadius: '40px', padding: '15px', maxWidth: '320px', margin: '0 auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}><h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{item.name}</h3></div>
                <div style={{ borderRadius: '30px', overflow: 'hidden', aspectRatio: '9/16', background: '#000', border: '8px solid #1a1a1a' }}>
                  <video src={item.url} autoPlay muted loop playsInline preload="none" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
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
              <button className="btn btn-outline" style={{width: '100%', color: '#fff'}} onClick={() => scrollToSection('funnel')}>Detayları İncele</button>
            </div>
            <div className="campaign-card" style={{border: '1px solid rgba(255,0,85,0.3)'}}>
              <CreditCard size={30} color="var(--secondary)" />
              <h3 className="campaign-title">6 Taksit Avantajı</h3>
              <p className="campaign-desc">Tüm projelerimizde maliyetlerinizi düşünen 6 taksite kadar ödeme kolaylığı!</p>
              <button className="btn btn-primary" style={{width: '100%'}} onClick={() => scrollToSection('funnel')}>Teklif Alın <ArrowRight size={20} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MARKANIZ İÇİN ÜCRETSİZ ANALİZ */}
      <section className="funnel-form-section" id="funnel">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="section-title">Markanız İçin <span className="gradient-text">Ücretsiz Analiz</span></h2>
            <p className="section-subtitle">Uzman ekibimiz mevcut durumunuzu analiz etsin ve size özel büyüme raporu sunsun.</p>
          </div>
          <AnalysisForm />
        </div>
      </section>

      {/* 8. SIKÇA SORULAN SORULAR */}
      <section className="section-padding" style={{ background: '#000' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Sıkça Sorulan <span className="gradient-text">Sorular</span></h2>
          <FAQAccordion items={[
            {
              question: "ROAS nedir ve neden önemlidir?",
              answer: "Return on Ad Spend (Reklam Harcaması Getirisi), reklam için harcadığınız her 1 TL karşılığında ne kadar kazandığınızı gösterir. 14.2x ROAS, 1 TL harcayıp 14.2 TL kazandığınız anlamına gelir. Sürdürülebilir büyüme için en kritik metrik budur."
            },
            {
              question: "Hizmet süreci nasıl başlıyor?",
              answer: "Ücretsiz analiz formunu doldurduğunuzda ekibimiz markanızı, rakiplerinizi ve pazar payınızı inceler. Ardından size özel bir strateji toplantısı planlarız, yol haritamızı ve garanti şartlarımızı netleştiririz."
            },
            {
              question: "UGC ve Influencer iş birlikleri ne kazandırır?",
              answer: "Doğal ve kullanıcı tarafından üretilen içerikler (UGC), markanıza olan güveni %80 oranında artırır. Tüketiciler profesyonel reklamlardan ziyade gerçek insan deneyimlerine güvenir, bu da dönüşüm oranınızı katlar."
            },
            {
              question: "Hangi platformlarda reklam veriyorsunuz?",
              answer: "Ağırlıklı olarak Meta (Facebook, Instagram) ve Google Ads üzerinde yüksek performanslı kampanyalar yönetiyoruz. Ayrıca GEO (AI Search) optimizasyonu ile markanızı yeni nesil arama motorlarına hazırlıyoruz."
            },
            {
              question: "Onboarding süreci ne kadar sürer?",
              answer: "Anlaşma sağlandıktan sonra teknik kurulumlar ve ilk kreatif stratejilerin hazırlanması genellikle 5-7 iş günü sürer. Bu sürenin sonunda reklamlarımızı test etmeye ve veri toplamaya başlarız."
            }
          ]} />
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
