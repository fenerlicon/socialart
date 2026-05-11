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
  Rocket
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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

  const videoMapping = [
    ["https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/jeep-reel.mp4"],
    ["https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/koton-reel.mp4"],
    ["https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/peugeot-1.mp4", "https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/peugeot-2.mp4"],
    ["https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/polar-reel.mp4"],
    ["https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/flormar-reel.mp4"],
    ["https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/sahnemarin-reel.mp4"],
    ["https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/presenter-reel.mp4"]
  ];

  const today = new Date();
  const [displayedMonth, setDisplayedMonth] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const daysInMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = displayedMonth.getDay(); // Sunday is 0. Transform to Monday=0
  const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  
  const handlePrevMonth = () => {
    if (displayedMonth.getFullYear() === today.getFullYear() && displayedMonth.getMonth() === today.getMonth()) return;
    setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = () => setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1));

  // Toplantı (Analiz) Saat Slotları
  const timeSlots = [
    "09:00 - 10:00", 
    "10:00 - 11:00", 
    "11:00 - 12:00", 
    "12:00 - 13:00", 
    "13:00 - 14:00", 
    "14:00 - 15:00", 
    "15:00 - 16:00", 
    "16:00 - 17:00", 
    "17:00 - 18:00"
  ];

  // Form States
  const [loading, setLoading] = React.useState(false);
  const [formSuccess, setFormSuccess] = React.useState(false);
  const [formError, setFormError] = React.useState('');

  const [formData, setFormData] = React.useState({
    fullName: '',
    phone: '',
    email: '',
    url: '',
    services: []
  });
  const [blockedSlots, setBlockedSlots] = React.useState([]);

  React.useEffect(() => {
    // Break critical request chain by only fetching when funnel is near
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

  const fetchBlockedSlots = async () => {
    const { data } = await supabase.from('blocked_slots').select('*');
    if (data) setBlockedSlots(data);
  };

  const handleCheckboxChange = (srv) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(srv) 
        ? prev.services.filter(s => s !== srv)
        : [...prev.services, srv]
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDateStr || !selectedTimeStr) {
      setFormError('Lütfen bir toplantı tarihi ve saati seçiniz.');
      return;
    }

    if (formData.services.length === 0) {
      setFormError('Lütfen ilgilendiğiniz hizmetlerden en az bir tanesini seçiniz.');
      return;
    }

    setLoading(true);
    setFormError('');

    try {
      const dateStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
      
      // 1. Leads tablosuna kaydet
      const { error: leadError } = await supabase.from('leads').insert([
        {
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          date: dateStr,
          platform: formData.url,
          service: formData.services.join(', '),
          rep: 'Sistem (Otomatik)',
          status: 'Beklemede',
          reaction: `Siteden form dolduruldu. Randevu Hedefi: ${selectedDateStr} ${selectedTimeStr}`
        }
      ]);

      if (leadError) throw leadError;

      // 2. Appointments tablosuna kaydet
      const { error: apptError } = await supabase.from('appointments').insert([
        {
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          url: formData.url,
          services: formData.services.join(', '),
          appointment_date: selectedDateStr,
          appointment_time: selectedTimeStr,
          status: 'Beklemede'
        }
      ]);

      if (apptError) throw apptError;

      setFormSuccess(true);
      setFormData({ fullName: '', phone: '', email: '', url: '', services: [] });
      setSelectedDateStr('');
      setSelectedTimeStr('');
    } catch (err) {
      console.error('Lead submission error:', err);
      setFormError('Bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
  };


  React.useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const services = [
    { title: '360° Sosyal Medya & Reklam', desc: 'İçerik planlama ve data odaklı reklam yönetimi ile tam kapsam dijital strateji.', icon: <TrendingUp className="service-icon" style={{color: 'var(--secondary)'}} /> },
    { title: 'Stüdyo Çekim & Kiralama', desc: 'Profesyonel ekipmanlarla donatılmış stüdyomuzda çekim veya kiralama hizmeti.', icon: <Monitor className="service-icon" style={{color: 'var(--accent)'}} /> },
    { title: 'YouTube Prodüksiyon', desc: 'Kanal yönetimi, video optimizasyonu ve ileri seviye kurgu hizmetleri.', icon: <Video className="service-icon" style={{color: '#ff0000'}} /> },
    { title: 'Profesyonel Fotoğrafçılık', desc: 'Yemek, emlak, otel ve ürün fotoğrafçılığı ile markanızı estetikle parlatın.', icon: <Camera className="service-icon" style={{color: 'var(--accent)'}} /> },
    { title: 'UGC & Influencer Marketing', desc: 'Kullanıcı odaklı doğal içerikler ve stratejik influencer iş birlikleri.', icon: <Smartphone className="service-icon" style={{color: 'var(--primary)'}} /> },
    { title: 'Kreatif Tasarım & Branding', desc: 'Marka kimliğinizi güçlendiren modern ve dikkat çekici görsel tasarımlar.', icon: <Layers className="service-icon" style={{color: 'var(--secondary)'}} /> }
  ];

  const partners = [
    "KOTON", "JEEP", "PEUGEOT", "Gurme Bahçeşehir", "Eray Gıda", "Flormar",
    "Sahne Marin", "EGE CUNDA BALIK", "Smart Enerji", "Polar", "Enova Eğitim",
    "Indian Motorcycle", "S.E.T.S", "Allure Deluxe Beauty", "Funfest",
    "DUMA DUMA", "216 Dizayn", "good&mood", "MapOfX", "Cosentino", "Geberit",
    "Karadeniz Et", "SRG"
  ];

  return (
    <>
      {/* SEO Schema Injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        
        <div className="container" style={{ position: 'relative' }}>
          <div className="hero-content">
            <h1 className="hero-title">
              İstanbul'un Veri Odaklı <span className="gradient-text">Growth Marketing</span> Ajansı
            </h1>
            <p className="hero-desc">
              Herkes tasarım yapar, herkes reels çeker. Biz ise markanız için çalışan bir <strong>growth sistemi</strong> kuruyoruz. Meta Ads, Creative Production ve SEO & GEO optimizasyonu ile dönüşüm psikolojisini birleştirerek ölçeklenebilir büyüme sağlıyoruz.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-pulse" onClick={() => scrollToSection('funnel')} aria-label="Growth Analizini Başlat">
                Growth Analizini Başlat
              </button>
              <button className="btn btn-outline" onClick={() => scrollToSection('showreel')}>
                Neler Başardık? <ArrowRight size={20} />
              </button>
            </div>
            <div style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span>#DijitalPazarlamaAjansı</span>
              <span>#MetaAds</span>
              <span>#CreativeProduction</span>
              <span>#SEO&GEO</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BRANDS MARQUEE */}
      <section className="brands-section">
        <div className="container">
          <div className="brands-title">BİZE GÜVENEN GLOBAL VE YEREL MARKALAR</div>
          <div className="brand-ticker-wrap">
            <div className="brand-track">
              {partners.map((p, i) => <div className="brand-item" key={`t1-${i}`}>{p}</div>)}
            </div>
            <div className="brand-track">
              {partners.map((p, i) => <div className="brand-item" key={`t2-${i}`}>{p}</div>)}
            </div>
          </div>
        </div>
      </section>
      {/* PREMIUM SHOWREEL - DIRECTOR'S CUT */}
      {/* PREMIUM SHOWREEL - DIRECTOR'S CUT */}
      <section className="cinematic-showreel-section section-padding" id="showreel" style={{ background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: '400px', height: '400px', background: 'var(--primary-glow)', filter: 'blur(150px)', opacity: '0.1', zIndex: 0 }}></div>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 className="section-title">Director's <span className="gradient-text">Showreel</span></h2>
            <p className="section-subtitle">Üst segment prodüksiyon ve sinematik reklam çekimi vizyonumuz.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', justifyContent: 'center' }}>
            {[
              {
                url: "https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/jeep-reel.mp4",
                logo: "/assets/images/jeep-logo.webp",
                name: "Jeep"
              },
              {
                url: "https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/peugeot-1.mp4",
                logo: "/assets/images/peugeot-logo.png",
                name: "Peugeot"
              },
              {
                url: "https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/koton-reel.mp4",
                logo: "/assets/images/koton-logo.png",
                name: "Koton"
              }
            ].map((item, idx) => (
              <div key={`dir-${idx}`} className="glass" style={{ 
                borderRadius: '40px', 
                padding: '15px', 
                border: '1px solid rgba(255,255,255,0.1)', 
                maxWidth: '320px', 
                margin: '0 auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                  <img src={item.logo} alt={item.name} style={{ maxHeight: '40px', maxWidth: '150px', objectFit: 'contain' }} />
                </div>
                <div style={{ 
                  borderRadius: '30px', 
                  overflow: 'hidden', 
                  aspectRatio: '9/16', 
                  background: '#000',
                  position: 'relative',
                  border: '8px solid #1a1a1a'
                }}>
                  <video 
                    src={item.url} 
                    className="mobile-video"
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '18px', background: '#1a1a1a', borderRadius: '10px', zIndex: 2 }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO TESTIMONIALS & REVIEWS */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <h2 className="section-title">Müşteri <span className="gradient-text">Yorumları</span></h2>
          <p className="section-subtitle">Sosyal Art Ajans olarak markaların başarı hikayelerinin bir parçası olmaktan gurur duyuyoruz.</p>
          
          <div className="testi-grid">
            <div>
              <div 
                className="video-testi" 
                style={{ background: '#111', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                onClick={(e) => {
                  const v = e.currentTarget.querySelector('video');
                  if(v) {
                    if(v.paused) {
                      v.play().then(() => {
                        v.muted = false;
                        v.controls = true; // Show native controls once playing
                      }).catch(err => {
                        console.error("Play error:", err);
                        v.controls = true; // Force controls if playback fails
                      });
                    } else {
                        v.pause();
                    }
                  }
                }}
              >
                <video 
                  src="https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/aguzellik-video.mp4" 
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'cover' }}
                />
                <div className="play-btn" style={{ position: 'absolute', zIndex: 10, transition: 'opacity 0.3s', pointerEvents: 'none' }}>
                  <Play size={48} fill="#fff" />
                </div>
                
                {/* Mobile Fullscreen Button */}
                <button 
                  className="mobile-video-expand"
                  aria-label="Videoyu tam ekran yap"
                  onClick={(e) => {
                    e.stopPropagation();
                    const v = e.currentTarget.parentElement.querySelector('video');
                    if(v) {
                      if (v.requestFullscreen) v.requestFullscreen();
                      else if (v.webkitRequestFullscreen) v.webkitRequestFullscreen();
                      else if (v.msRequestFullscreen) v.msRequestFullscreen();
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    zIndex: 20,
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Maximize2 size={20} />
                </button>
              </div>
              <h4 style={{fontSize: '1.4rem', marginBottom: '10px', color: 'var(--accent)'}}>İşinizi Önemsiyoruz</h4>
              <p style={{color: 'var(--text-muted)', lineHeight: '1.6'}}>"Her bir yanıyla mükemmelliği arıyoruz. İşinize sadece bir proje olarak değil, kendi markamız gibi yaklaşıyoruz. En son teknoloji ekipmanlar ve sinematik bakış açımızla, markanızın hikayesini en etkileyici şekilde anlatmak için buradayız. Sizin başarınız, bizim en büyük imzamızdır."</p>
            </div>
            
            <div className="testi-card">
              <div style={{display:'flex', gap:'5px', color:'gold', marginBottom:'15px'}}>
                <Star size={16} fill="gold" /> <Star size={16} fill="gold" /> <Star size={16} fill="gold" /> <Star size={16} fill="gold" /> <Star size={16} fill="gold" />
              </div>
              <p className="testi-text">"Sosyal Art'ın profesyonel çekim kalitesi ve yaratıcı sosyal medya yönetimi sayesinde dijitalde gerçek anlamda fark yarattık. Özellikle reklamlar üzerinden gelen müşteri hacmindeki artış, markamızın büyümesine büyük katkı sağladı."</p>
              <div className="testi-author">
                <div className="testi-avatar">Ö</div>
                <div>
                  <h4 style={{fontSize:'1rem'}}>Özge Aydın</h4>
                  <span style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>Müdür, Gurme Bahçeşehir</span>
                </div>
              </div>
            </div>

            <div className="testi-card">
              <div style={{display:'flex', gap:'5px', color:'gold', marginBottom:'15px'}}>
                <Star size={16} fill="gold" /> <Star size={16} fill="gold" /> <Star size={16} fill="gold" /> <Star size={16} fill="gold" /> <Star size={16} fill="gold" />
              </div>
              <p className="testi-text">"Markamız için gerçekleştirilen kaliteli çekimler ve sosyal medyadaki stratejik yönetimimiz sayesinde çok daha geniş kitlelere ulaştık. Reklam kampanyalarından gelen nitelikli geri dönüşler ve yeni müşteriler bizi oldukça memnun ediyor."</p>
              <div className="testi-author">
                <div className="testi-avatar">K</div>
                <div>
                  <h4 style={{fontSize:'1rem'}}>Koray Bey</h4>
                  <span style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>Marka Dijital Sorumlusu, Socketta</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY GROWTH SYSTEM? */}
      <section className="section-padding" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(15,15,15,1) 100%)' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '80px' }}>
            <h2 className="section-title">En Kritik <span className="gradient-text">Büyüme Hamlesi</span></h2>
            <p className="section-subtitle">Tasarım yapmak veya reels çekmek artık bir ayrıcalık değil, standart. Gerçek büyüme; veri, kreatif testler ve dönüşüm psikolojisinin birleştiği noktada başlar.</p>
          </div>

          <div className="services-grid">
            <div className="glass" style={{ padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(138,43,226,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
                <BarChart3 size={30} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Veri Odaklı Testler</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>Creative testing süreçlerimizle hangi görselin veya metnin en yüksek dönüşümü getirdiğini varsayımlarla değil, verilerle kanıtlıyoruz.</p>
            </div>

            <div className="glass" style={{ padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(0,229,255,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
                <Layers size={30} color="#00e5ff" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Funnel & Dönüşüm</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>Sadece trafik çekmiyoruz. Kullanıcıyı yakalayan, eğiten ve satın almaya ikna eden çok katmanlı satış hunileri (funnel) kuruyoruz.</p>
            </div>

            <div className="glass" style={{ padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(255,0,85,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
                <Zap size={30} color="var(--secondary)" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>AI Destekli Growth</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>Yapay zeka sistemlerini SEO ve GEO (Generative Engine Optimization) süreçlerimize entegre ederek markanızı yarının arama motorlarına bugünden hazırlıyoruz.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="section-padding" id="services" style={{ paddingTop: '20px' }}>
        <div className="container">
          <h2 className="section-title">Hizmetlerimiz</h2>
          <div className="services-grid">
            <Link to="/creative-production" className="service-card" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none' }}>
              <Users className="service-icon" style={{color: 'var(--accent)'}} />
              <h3 className="service-title">Sunuculu Reklam Videosu</h3>
              <p className="service-desc">Markanızı anlatan profesyonel sunucularla yüksek güven ve dönüşüm sağlayan reklamlar.</p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>İncele <ArrowRight size={16} style={{marginLeft: '5px'}} /></div>
            </Link>
            <Link to="/creative-production" className="service-card" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none' }}>
              <Camera className="service-icon" style={{color: 'var(--primary)'}} />
              <h3 className="service-title">Video Prodüksiyon</h3>
              <p className="service-desc">Sinematik reklam filmleri ve sosyal medya için yüksek kaliteli video içerik üretimi.</p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>İncele <ArrowRight size={16} style={{marginLeft: '5px'}} /></div>
            </Link>
            <Link to="/meta-ads-yonetimi" className="service-card" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none' }}>
              <TrendingUp className="service-icon" style={{color: 'var(--secondary)'}} />
              <h3 className="service-title">Meta Ads Yönetimi</h3>
              <p className="service-desc">Data odaklı reklam stratejileri ile ROAS odaklı ölçeklenebilir büyüme sistemleri.</p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>İncele <ArrowRight size={16} style={{marginLeft: '5px'}} /></div>
            </Link>
          </div>
        </div>
      </section>

      {/* PRESENTER VIDEOS SECTION - Mobile Feel */}
      <section className="section-padding" style={{ background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: '400px', height: '400px', background: 'var(--primary-glow)', filter: 'blur(150px)', opacity: '0.1', zIndex: 0 }}></div>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 className="section-title">Sunuculu <span className="gradient-text">Reklam Videolarımız</span></h2>
            <p className="section-subtitle">Ürününüzü profesyonel bir sunucu eşliğinde, yüksek güven veren bir dille stüdyo ortamında tanıtıyoruz.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', justifyContent: 'center' }}>
            {[
              { url: "/assets/videos/video1.mov", name: "MioCasa Halı" },
              { url: "/assets/videos/video2.mp4", name: "ArayanVar" },
              { url: "/assets/videos/video3.mp4", name: "Social Art" }
            ].map((item, idx) => (
              <div key={idx} className="glass" style={{ 
                borderRadius: '40px', 
                padding: '15px', 
                border: '1px solid rgba(255,255,255,0.1)', 
                maxWidth: '320px', 
                margin: '0 auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{item.name}</h4>
                </div>
                <div style={{ 
                  borderRadius: '30px', 
                  overflow: 'hidden', 
                  aspectRatio: '9/16', 
                  background: '#000',
                  position: 'relative',
                  border: '8px solid #1a1a1a'
                }}>
                  <video 
                    src={item.url} 
                    className="mobile-video"
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '18px', background: '#1a1a1a', borderRadius: '10px', zIndex: 2 }}></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{textAlign: 'center', marginTop: '60px'}}>
             <button className="btn btn-outline" onClick={() => navigate('/creative-production')}>Tüm Prodüksiyon Çözümleri <ArrowRight size={20} /></button>
          </div>
        </div>
      </section>


      {/* FAQ SECTION FOR SEO/GEO */}
      <section className="section-padding" style={{ background: '#000' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Sıkça Sorulan <span className="gradient-text">Sorular</span></h2>
            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Meta Ads nedir ve neden gereklidir?</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>Meta Ads, Facebook ve Instagram üzerinden hedefli reklamlar vererek potansiyel müşterilerinize ulaşmanızı sağlar. Doğru segmentasyon ve kreatif testlerle en düşük maliyetle en yüksek dönüşümü almanıza yardımcı olur.</p>
              </div>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Reklam kreatifi neden önemli?</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>Teknik ayarlar ne kadar iyi olursa olsun, kullanıcının dikkatini çeken ve ikna eden tek şey kreatiftir. Yüksek performanslı bir kreatif, reklam maliyetlerinizi %80'e kadar düşürebilir.</p>
              </div>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>SEO ve GEO farkı nedir?</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>SEO geleneksel arama motorları (Google gibi) için yapılırken, GEO (Generative Engine Optimization) ChatGPT, Perplexity ve Gemini gibi yapay zeka sistemlerinin markanız hakkında doğru ve olumlu bilgi vermesini sağlamak için yapılır.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KAMPANYALAR */}
      <section className="campaigns-section" id="kampanyalar" style={{background: 'rgba(255,255,255,0.02)', paddingTop: '40px'}}>
        <div className="container">
          <h2 className="section-title">Size Özel <span className="gradient-text">Fırsatlar</span></h2>
          <p className="section-subtitle">Aylık değil, vizyon odaklı uzun vadeli büyüme destekleri!</p>
          
          <div className="campaign-grid">
            
            <div className="campaign-card">
              <div className="campaign-badge">GARANTİ</div>
              <div className="campaign-icon">
                <ShieldCheck size={30} color="var(--primary)" />
              </div>
              <h3 className="campaign-title">%50 İade Garantisi!</h3>
              <p className="campaign-desc">
                Minimum 6 aylık iş birliğinde tam kapsamlı hizmetlerimizden memnun kalmazsanız, ücretinizin yarısını iade ediyoruz! Sizi büyütmek konusundaki özgüvenimizin bir kanıtı.
              </p>
              <button className="btn btn-outline" style={{width: '100%', justifyContent: 'center', color: '#ffffff'}} onClick={() => scrollToSection('funnel')}>
                Detayları İncele
              </button>
            </div>
            
            <div className="campaign-card" style={{border: '1px solid rgba(255,0,85,0.3)', background: 'linear-gradient(135deg, rgba(255,0,85,0.1) 0%, rgba(20,20,20,1) 100%)'}}>
               <div className="campaign-badge" style={{background: 'var(--primary)'}}>ÖDEME</div>
              <div className="campaign-icon">
                <CreditCard size={30} color="var(--secondary)" />
              </div>
              <h3 className="campaign-title">6 Taksit Avantajı</h3>
              <p className="campaign-desc">
                İster tek seferlik projelerimizde ister düzenli olarak devam eden hizmetlerimizde maliyetlerinizi düşünen 6 taksite kadar benzersiz esnek ödeme kolaylığı!
              </p>
              <button className="btn btn-primary" style={{width: '100%', justifyContent: 'center', boxShadow: 'none'}} onClick={() => scrollToSection('funnel')}>
                Teklif Alın <ArrowRight size={20} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* JOIN US SECTION - UGC & JOB APPLICATIONS */}
      <section className="section-padding" style={{ background: '#0a0a0a' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 className="section-title">Yaratıcı Ekibimize <span className="gradient-text">Katılın</span></h2>
            <p className="section-subtitle">SocialArt sadece bir ajans değil, bir topluluk. İster içerik üreticisi olun ister profesyonel, gelin birlikte büyüyelim.</p>
          </div>

          <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <div className="glass" style={{ padding: '50px', borderRadius: '32px', textAlign: 'center', border: '1px solid rgba(138,43,226,0.2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(138,43,226,0.2) 0%, transparent 70%)', zIndex: 0 }}></div>
              <Zap size={60} color="var(--primary)" style={{ marginBottom: '25px', position: 'relative', zIndex: 1 }} />
              <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', position: 'relative', zIndex: 1 }}>UGC & Influencer</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px', position: 'relative', zIndex: 1 }}>Markalarımız için yüzünüzle veya sesinizle içerik üretin. Kreatif topluluğumuza dahil olun.</p>
              <button className="btn btn-primary" style={{ width: '100%', position: 'relative', zIndex: 1 }} onClick={() => navigate('/ugc-basvuru')}>Başvuru Yap <ArrowRight size={20} /></button>
            </div>

            <div className="glass" style={{ padding: '50px', borderRadius: '32px', textAlign: 'center', border: '1px solid rgba(0,229,255,0.2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(0,229,255,0.2) 0%, transparent 70%)', zIndex: 0 }}></div>
              <Rocket size={60} color="#00e5ff" style={{ marginBottom: '25px', position: 'relative', zIndex: 1 }} />
              <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', position: 'relative', zIndex: 1 }}>Kariyer</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px', position: 'relative', zIndex: 1 }}>Editör, yönetmen veya stratejist misiniz? SocialArt ekibinde profesyonel kariyerinize başlayın.</p>
              <button className="btn btn-outline" style={{ width: '100%', position: 'relative', zIndex: 1 }} onClick={() => navigate('/is-basvurusu')}>İş Başvurusu <ArrowRight size={20} /></button>
            </div>
          </div>
        </div>
      </section>


      {/* FUNNEL CTA: ÜCRETSİZ ANALİZ */}
      <section className="funnel-form-section" id="funnel">
        <div className="container">
          <h2 className="section-title">Markanız İçin <span className="gradient-text">Ücretsiz Analiz</span></h2>
          <p className="section-subtitle" style={{color: '#ddd', margin: '0 auto'}}>
            Uzman ekibimiz mevcut durumunuzu analiz etsin ve size özel büyüme stratejisi içeren bir rapor sunsun.
          </p>
          
          <div className="form-box">
            <h3 style={{fontSize: '1.5rem', marginBottom: '30px', fontWeight: '700', color: '#fff'}}>Sizi Arayalım!</h3>
            
            {formSuccess ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(0,230,118,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <ShieldCheck size={48} color="#00e676" />
                </div>
                <h4 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>Harika! Talebiniz Alındı.</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Ekibimiz belirttiğiniz saatte ({selectedDateStr}) sizi arayacak veya e-posta yoluyla strateji raporunuzu iletecek.</p>
                <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setFormSuccess(false)}>Yeni Form Doldur</button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                {formError && (
                  <div style={{ background: 'rgba(255,0,85,0.1)', color: 'var(--secondary)', padding: '12px', borderRadius: '10px', marginBottom: '20px', border: '1px solid rgba(255,0,85,0.2)' }}>
                    {formError}
                  </div>
                )}
                <div className="input-group">
                  <label htmlFor="fullName">Adınız Soyadınız</label>
                  <input id="fullName" type="text" placeholder="Örn: Ahmet Yılmaz" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div className="input-group">
                  <label htmlFor="phone">Telefon Numaranız</label>
                  <input 
                    id="phone"
                    type="tel" 
                    placeholder="05XX XXX XX XX" 
                    required 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    pattern="[0-9]*" 
                    inputMode="numeric"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="email">E-posta Adresiniz</label>
                  <input 
                    id="email"
                    type="email" 
                    placeholder="ornek@sirket.com" 
                    required 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="socialUrl">Web Siteniz / Sosyal Medya Hesabınız</label>
                  <input id="socialUrl" type="text" placeholder="instagram.com/markaniz" required value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
                </div>
                <div className="input-group">
                  <label style={{marginBottom: '10px', display: 'block', fontWeight: '500'}}>İlgilendiğiniz Hizmetler (Birden fazla seçebilirsiniz)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                    {[
                      "Video prodüksiyon hizmeti istiyorum",
                      "Fotoğraf çekimi istiyorum",
                      "Sunuculu Ürün Tanıtım Videosu",
                      "Sosyal Medya ve Reklam Yönetimi istiyorum",
                      "Tek seferlik Tanıtım Filmi çektirmek istiyorum",
                      "Grafik tasarım hizmeti almak istiyorum",
                      "UGC İçerik Hizmeti istiyorum",
                      "Influencer Marketing istiyorum"
                    ].map((srv, i) => (
                      <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', color: '#ddd', lineHeight: '1.4' }}>
                        <input 
                          type="checkbox" 
                          name="services" 
                          value={srv} 
                          checked={formData.services.includes(srv)}
                          onChange={() => handleCheckboxChange(srv)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }} 
                        />
                        {srv}
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* TAKVİM - RANDEVU ALANI (CUSTOM UI) */}
                <div className="input-group" style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--surface-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <label style={{marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.2rem', color: '#fff'}}>
                  📅 Online Toplantı Planla
                </label>
                
                {/* Date Monthly Picker */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Uygun Bir Tarih Seçin</label>
                  
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <button type="button" onClick={handlePrevMonth} aria-label="Önceki Ay" style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: (displayedMonth.getFullYear() === today.getFullYear() && displayedMonth.getMonth() === today.getMonth()) ? 0.3 : 1, fontSize: '1.2rem', padding: '0 10px' }}>&lt;</button>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{monthNames[displayedMonth.getMonth()]} {displayedMonth.getFullYear()}</div>
                      <button type="button" onClick={handleNextMonth} aria-label="Sonraki Ay" style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', padding: '0 10px' }}>&gt;</button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center', marginBottom: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                      <div>Pzt</div><div>Sal</div><div>Çar</div><div>Per</div><div>Cum</div><div>Cmt</div><div>Paz</div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
                      {Array.from({length: startDayIndex}).map((_, i) => <div key={`empty-${i}`}></div>)}
                      
                      {Array.from({length: daysInMonth}).map((_, i) => {
                        const d = i + 1;
                        const cellDate = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), d);
                        const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        // Weekend appointments are now enabled as per user request
                        const isDisabled = isPast;
                        
                        const monthStr = String(displayedMonth.getMonth() + 1).padStart(2, '0');
                        const dayStr = String(d).padStart(2, '0');
                        const keyStr = `${displayedMonth.getFullYear()}-${monthStr}-${dayStr}`;
                        
                        const isSelected = selectedDateStr === keyStr;
                        const isFullyBlocked = blockedSlots.some(s => s.blocked_date === keyStr && !s.time_slot);
                        const effectiveDisabled = isDisabled || isFullyBlocked;

                        return (
                          <div 
                            key={d} 
                            onClick={() => !effectiveDisabled && setSelectedDateStr(keyStr)}
                            style={{ 
                              padding: '10px 0', 
                              borderRadius: '8px', 
                              textAlign: 'center', 
                              cursor: effectiveDisabled ? 'not-allowed' : 'pointer',
                              background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                              color: isSelected ? '#000' : (effectiveDisabled ? '#444' : '#fff'),
                              fontWeight: isSelected ? '800' : '500',
                              border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                              transition: 'all 0.2s',
                              opacity: effectiveDisabled ? 0.3 : 1
                            }}
                          >
                            {d}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={selectedDateStr} 
                    onChange={()=>{}} 
                    style={{height: 0, width: 0, border: 0, padding: 0, margin: 0, opacity: 0, position: 'absolute'}} 
                    aria-label="Seçilen Tarih"
                  />
                </div>

                {/* Time Slots */}
                <div style={{ opacity: selectedDateStr ? 1 : 0.3, pointerEvents: selectedDateStr ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Saat Dilimi Seçin</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px' }}>
                    {timeSlots.map(time => {
                      const isSelected = selectedTimeStr === time;
                      const isBlocked = blockedSlots.some(s => s.blocked_date === selectedDateStr && s.time_slot === time);
                      
                      // Prevent past times for today
                      let isPastTime = false;
                      const [startHour] = time.split(':').map(Number);
                      const isToday = selectedDateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                      
                      if (isToday) {
                        const currentHour = new Date().getHours();
                        if (startHour <= currentHour) isPastTime = true;
                      }

                      const effectiveBlocked = isBlocked || isPastTime;
                      
                      return (
                        <div 
                          key={time}
                          onClick={() => !effectiveBlocked && setSelectedTimeStr(time)}
                          style={{
                            padding: '12px',
                            textAlign: 'center',
                            borderRadius: '10px',
                            cursor: effectiveBlocked ? 'not-allowed' : 'pointer',
                            background: isSelected ? 'var(--secondary)' : 'rgba(255,255,255,0.03)',
                            color: isSelected ? '#fff' : (effectiveBlocked ? '#444' : '#ccc'),
                            fontWeight: '700',
                            border: isSelected ? '1px solid var(--secondary)' : '1px solid var(--surface-border)',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 5px 15px rgba(255,0,85,0.3)' : 'none',
                            opacity: effectiveBlocked ? 0.3 : 1
                          }}
                        >
                          {time}
                        </div>
                      )
                    })}
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={selectedTimeStr} 
                    onChange={()=>{}} 
                    style={{height: 0, width: 0, border: 0, padding: 0, margin: 0, opacity: 0, position: 'absolute'}} 
                    aria-label="Seçilen Saat"
                  />
                </div>
                
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '20px', fontStyle: 'italic', textAlign: 'center' }}>
                  * {selectedDateStr && selectedTimeStr ? <span style={{color: '#00e676'}}>Seçiminiz kaydedildi: {selectedDateStr} Saat: {selectedTimeStr}</span> : ' Lütfen yukarıdan uygun olduğunuz gün ve saati belirleyiniz.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', margin: '25px 0 15px 0' }}>
                <input type="checkbox" id="kvkkAccept" required style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }} />
                <label htmlFor="kvkkAccept" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', cursor: 'pointer', textAlign: 'left' }}>
                  Kişisel verilerimin <a href="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>KVKK ve Gizlilik Politikası</a> kapsamında işlenmesini ve iletişim adreslerime duyuru, kampanya ve bilgilendirme iletileri gönderilmesini onaylıyorum.
                </label>
              </div>

              <button type="submit" className="cta-button" disabled={loading} style={{width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '5px', opacity: loading ? 0.7 : 1}}>
                {loading ? 'Gönderiliyor...' : 'Ücretsiz Analiz İstiyorum'}
              </button>
              <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '20px', textAlign: 'center'}}>
                Bilgileriniz bizimle güvende. SPAM yapmıyoruz.
              </p>
            </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
