import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Award, 
  Volume2, 
  Layers, 
  Sliders, 
  Tv, 
  Scissors, 
  Activity, 
  FileVideo, 
  User, 
  Mail, 
  Phone, 
  Menu, 
  X, 
  ChevronRight,
  Monitor,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './PostProduction.css';

function PostProduction() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'Tam Paket Post-Prodüksiyon',
    duration: '1-3 Dakika',
    details: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Handle navbar shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to section smoothly
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setStatus({ type: 'error', message: 'Lütfen zorunlu alanları (Ad, E-posta, Telefon) doldurun.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const today = new Date();
      const dateStr = today.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
      
      const { error } = await supabase.from('leads').insert([{
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        date: dateStr,
        platform: formData.company || 'Bireysel Başvuru',
        service: `Post-Prodüksiyon: ${formData.service}`,
        rep: 'Post-Prodüksiyon Sitesi',
        status: 'Beklemede',
        reaction: `Video Süresi: ${formData.duration}. Proje Detayları: ${formData.details}`
      }]);

      if (error) throw error;

      setStatus({ 
        type: 'success', 
        message: 'Talebiniz başarıyla iletildi! En kısa sürede sizinle iletişime geçeceğiz.' 
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: 'Tam Paket Post-Prodüksiyon',
        duration: '1-3 Dakika',
        details: ''
      });
    } catch (err) {
      console.error('Lead insertion error:', err);
      setStatus({ 
        type: 'error', 
        message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin veya doğrudan hello@socialartajans.com adresi üzerinden bizimle iletişime geçin.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Workflow steps
  const steps = [
    {
      title: 'Brief & Aktarım (Ingest)',
      subtitle: 'Hazırlık & Aktarım',
      desc: 'Ham (RAW) çekimlerinizi, ses kayıtlarınızı ve marka varlıklarınızı (logo, font vb.) yüksek hızlı bulut sunucularımıza aktarırsınız. İlk toplantıda hikaye akışını, hedeflenen platformları ve kreatif vizyonu belirleriz.',
      details: [
        'Yüksek hızlı ve güvenli veri aktarımı',
        'Marka görsel kimlik entegrasyonu',
        'Kurgu planı ve senaryo zaman çizelgesi'
      ],
      icon: <Layers size={30} />
    },
    {
      title: 'Kaba Kurgu (Rough Cut)',
      subtitle: 'Pacing & Ritim',
      desc: 'Yönetmenimiz hikayenin omurgasını oluşturur. En iyi sahneler seçilir, doğru ritim (pacing) ve zamanlama ile yan yana getirilir. Hikayenin akışını ve ana yapısını bu aşamada değerlendiririz.',
      details: [
        'Pacing (hız) ve ritim optimizasyonu',
        'A-Roll ve B-Roll sekans organizasyonu',
        'Hikaye anlatımı (Storytelling) kurgusu'
      ],
      icon: <Scissors size={30} />
    },
    {
      title: 'Renk & Ses (Grading & Audio)',
      subtitle: 'Cinematic Atmosfer',
      desc: 'Görsellere hayat verdiğimiz aşamadır. Renk eşitleme (correction) ve sanatsal renk derecelendirme (color grading) ile sinematik atmosferi yaratırken; ses tasarımı, efektler (SFX) ve müzik miksajı ile derinliği artırırız.',
      details: [
        'Artistik Color Grading (LUT & Elle Renklendirme)',
        'Ses Temizleme, Foley ve Ses Efektleri (SFX)',
        'Müzik Lisanslama ve Ses Düzeyi Miksajı'
      ],
      icon: <Sliders size={30} />
    },
    {
      title: 'VFX & Animasyon (Visual Effects)',
      subtitle: 'Görsel Efekt & Motion',
      desc: 'Projenin ihtiyacına göre 2D/3D hareketli grafikler (Motion Graphics), metin animasyonları, yeşil ekran (chroma key) temizleme ve CGI entegrasyonu yapılır. Videonun dinamizmi en üst seviyeye çıkarılır.',
      details: [
        'Dinamik Metin ve Başlık Animasyonları',
        'Görsel Efekt (VFX) ve Ekran Değişimleri',
        '3D Eleman Entegrasyonu ve CGI'
      ],
      icon: <Sparkles size={30} />
    },
    {
      title: 'Teslim & Formatlar (Delivery)',
      subtitle: 'Mastering & Export',
      desc: 'Projeniz onaylandıktan sonra, yayınlanacağı mecralara özel formatlarda (16:9 Yatay, 9:16 Dikey Mobil, 1:1 Kare) ve en yüksek kalitede (4K / 1080p, HDR veya Rec.709) render alınarak teslim edilir.',
      details: [
        'Mecraya özel dikey, yatay ve kare formatlar',
        '4K Ultra HD & Yüksek Bitrate Master Çıktı',
        'Frame.io üzerinden kolay revizyon ve geri bildirim'
      ],
      icon: <Tv size={30} />
    }
  ];

  return (
    <div className="post-site-wrapper">
      {/* HEADER / NAVIGATION */}
      <nav className={`post-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="post-nav-brand">
          <FileVideo size={24} color="var(--post-gold)" />
          SOCIALART // <span>POST-PRODÜKSİYON</span>
        </div>
        
        <div className="post-nav-links">
          <button className="post-nav-link" onClick={() => scrollToSection('anasayfa')}>Ana Sayfa</button>
          <button className="post-nav-link" onClick={() => scrollToSection('servisler')}>Hizmetler</button>
          <button className="post-nav-link" onClick={() => scrollToSection('isakis')}>İş Akışımız</button>
          <button className="post-nav-link" onClick={() => scrollToSection('portfolyo')}>Portfolyo</button>
          <button className="post-nav-link" onClick={() => scrollToSection('teklif')}>İletişim</button>
        </div>

        <div className="post-nav-actions">
          <Link to="/" className="post-btn post-btn-outline" style={{ textDecoration: 'none' }}>Ajans Ana Sayfa</Link>
          <button className="post-btn post-btn-primary" onClick={() => scrollToSection('teklif')}>Teklif Al</button>
          <button className="post-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menü">
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* MOBILE NAVIGATION OVERLAY */}
      <div className={`post-mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <button className="post-nav-link" onClick={() => scrollToSection('anasayfa')}>Ana Sayfa</button>
        <button className="post-nav-link" onClick={() => scrollToSection('servisler')}>Hizmetler</button>
        <button className="post-nav-link" onClick={() => scrollToSection('isakis')}>İş Akışımız</button>
        <button className="post-nav-link" onClick={() => scrollToSection('portfolyo')}>Portfolyo</button>
        <button className="post-nav-link" onClick={() => scrollToSection('teklif')}>İletişim</button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', marginTop: '30px' }}>
          <Link to="/" className="post-btn post-btn-outline" style={{ justifyContent: 'center', textDecoration: 'none' }}>Ajans Ana Sayfa</Link>
          <button className="post-btn post-btn-primary" style={{ justifyContent: 'center' }} onClick={() => scrollToSection('teklif')}>Teklif Al</button>
        </div>
      </div>

      {/* HERO SECTION */}
      <header id="anasayfa" className="post-hero-section">
        <div className="container">
          <div className="post-hero-grid">
            <div className="post-hero-text">
              <div className="post-hero-badge">
                <Sparkles size={16} />
                Yeni Post-Prodüksiyon Departmanı
              </div>
              <h1 className="post-hero-title">
                Kurgunun Gücüyle Hikayenizi <span style={{ color: 'var(--post-gold)' }}>Sinematik</span> Sanata Dönüştürün.
              </h1>
              <p className="post-hero-desc">
                Ham çekimlerinizi alıp; dinamik kurgu, profesyonel renk derecelendirme (color grading), görsel efektler (VFX) ve zengin ses tasarımları ile yüksek dönüşüm getiren başyapıtlara dönüştürüyoruz. Sosyal medya, YouTube ve TV reklamları için özel olarak optimize edilmiş kurgu çözümleri.
              </p>
              <div className="post-hero-buttons">
                <button className="post-btn post-btn-primary" onClick={() => scrollToSection('teklif')}>
                  Projeyi Başlat <ArrowRight size={18} />
                </button>
                <button className="post-btn post-btn-outline" onClick={() => scrollToSection('portfolyo')}>
                  Çalışmalarımızı İnceleyin <Play size={18} />
                </button>
              </div>
            </div>
            
            {/* Interactive Video Editor Mockup */}
            <div className="editor-mockup">
              <div className="editor-header">
                <div className="editor-dots">
                  <div className="editor-dot red"></div>
                  <div className="editor-dot yellow"></div>
                  <div className="editor-dot green"></div>
                </div>
                <div className="editor-title">socialart_timeline_edit.prproj</div>
                <div style={{ width: '40px' }}></div>
              </div>
              
              <div className="editor-workspace">
                <div className="editor-preview">
                  {/* Overlay play indicator */}
                  <div className="editor-play-btn">
                    <Play size={24} style={{ marginLeft: '4px' }} />
                  </div>
                  {/* Abstract preview graphic / background */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #18002a 0%, #030303 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifycontent: 'center',
                    position: 'relative'
                  }}>
                    <div style={{ position: 'absolute', opacity: 0.15, transform: 'scale(1.5)' }}>
                      <Activity size={120} color="var(--post-violet)" />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', zIndex: 1 }}>PREVIEW // HDR 4K</span>
                  </div>
                </div>
                
                <div className="editor-color-grade">
                  <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--post-text-muted)' }}>COLOR GRADE</span>
                  <div className="color-wheel-wrapper">
                    <div className="color-wheel-center">
                      <div className="color-pointer"></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
                    <div style={{ width: '15px', height: '4px', background: 'var(--post-gold)', borderRadius: '2px' }}></div>
                    <div style={{ width: '25px', height: '4px', background: 'var(--post-violet)', borderRadius: '2px' }}></div>
                    <div style={{ width: '10px', height: '4px', background: 'var(--post-teal)', borderRadius: '2px' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="editor-timeline">
                <div className="timeline-header-controls">
                  <span>Timeline (Active: Track 1)</span>
                  <span>00:14:28:12</span>
                </div>
                
                <div className="timeline-tracks">
                  {/* Playhead */}
                  <div className="timeline-playhead">
                    <div className="timeline-playhead-handle"></div>
                  </div>
                  
                  {/* Video Track 2 */}
                  <div className="timeline-track-row">
                    <div className="track-label">V2 (VFX)</div>
                    <div className="track-blocks">
                      <div className="track-block video-2"></div>
                    </div>
                  </div>
                  
                  {/* Video Track 1 */}
                  <div className="timeline-track-row">
                    <div className="track-label">V1 (Main)</div>
                    <div className="track-blocks">
                      <div className="track-block video-1"></div>
                    </div>
                  </div>
                  
                  {/* Audio Track 1 */}
                  <div className="timeline-track-row">
                    <div className="track-label">A1 (Audio)</div>
                    <div className="track-blocks">
                      <div className="track-block audio-1"></div>
                      <div className="track-block audio-2" style={{ left: '45%', width: '45%' }}></div>
                    </div>
                  </div>
                  
                  {/* Audio Track 2 (SFX) */}
                  <div className="timeline-track-row">
                    <div className="track-label">A2 (SFX)</div>
                    <div className="track-blocks">
                      <div className="track-block sfx-1"></div>
                      <div className="track-block sfx-2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SERVICES SECTION */}
      <section id="servisler" className="post-section" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--post-border)' }}>
        <div className="container">
          <div className="post-section-title-wrapper">
            <span className="post-section-tag">Neler Yapıyoruz?</span>
            <h2 className="post-section-title">Kapsamlı Post-Prodüksiyon Çözümleri</h2>
          </div>
          
          <div className="post-services-grid">
            {/* Service 1 */}
            <div className="post-service-card">
              <div className="service-icon-box">
                <Scissors size={28} />
              </div>
              <h3 className="service-title">Video Kurgu & Montaj</h3>
              <p className="service-desc">
                Ham görüntüleri kusursuz bir ritim ve anlatı ile birleştiriyoruz. Sosyal medya içeriğinden reklam filmlerine kadar her video için en doğru kesmeleri yapıyor ve izleyici bağını koruyoruz.
              </p>
              <ul className="service-bullets">
                <li><CheckCircle2 size={16} /> Offline & Online Kurgu</li>
                <li><CheckCircle2 size={16} /> Ritim ve Pacing Ayarı</li>
                <li><CheckCircle2 size={16} /> Multicam (Çoklu Kamera) Montajı</li>
              </ul>
            </div>

            {/* Service 2 */}
            <div className="post-service-card">
              <div className="service-icon-box">
                <Sliders size={28} />
              </div>
              <h3 className="service-title">Cinematic Color Grading</h3>
              <p className="service-desc">
                Renk derecelendirme ile videonuzun duygusunu ve atmosferini şekillendiriyoruz. Kameralar arasındaki renk farklarını eşitleyerek tutarlı ve göz alıcı sinematik renk tonları uyguluyoruz.
              </p>
              <ul className="service-bullets">
                <li><CheckCircle2 size={16} /> Color Correction (Renk Eşitleme)</li>
                <li><CheckCircle2 size={16} /> Sanatsal Color Grading</li>
                <li><CheckCircle2 size={16} /> Marka Renk Paletine Uyum</li>
              </ul>
            </div>

            {/* Service 3 */}
            <div className="post-service-card">
              <div className="service-icon-box">
                <Sparkles size={28} />
              </div>
              <h3 className="service-title">Motion Graphics & Efekt</h3>
              <p className="service-desc">
                Grafik tasarımları hareketlendirerek videonuzun anlatımını güçlendiriyoruz. Logo animasyonları, alt yazılar, infografikler ve dinamik metinler ile izleyici odağını zirveye çıkarıyoruz.
              </p>
              <ul className="service-bullets">
                <li><CheckCircle2 size={16} /> Dynamic Typography (Hareketli Yazı)</li>
                <li><CheckCircle2 size={16} /> 2D/3D Logo Animasyonu</li>
                <li><CheckCircle2 size={16} /> Reklam Grafikleri & İnfografikler</li>
              </ul>
            </div>

            {/* Service 4 */}
            <div className="post-service-card">
              <div className="service-icon-box">
                <Volume2 size={28} />
              </div>
              <h3 className="service-title">Ses Tasarımı & Miksaj</h3>
              <p className="service-desc">
                Ses, videonun yarısıdır. Profesyonel ses temizliği, Foley (ortam sesleri), SFX kurgusu ve müzik entegrasyonu ile izleyiciye zengin ve üç boyutlu bir ses deneyimi yaşatıyoruz.
              </p>
              <ul className="service-bullets">
                <li><CheckCircle2 size={16} /> Arka Plan Gürültü Temizleme</li>
                <li><CheckCircle2 size={16} /> Ses Efekti (SFX) Kurgusu</li>
                <li><CheckCircle2 size={16} /> Seviyeleme & Stereo Miksaj</li>
              </ul>
            </div>

            {/* Service 5 */}
            <div className="post-service-card">
              <div className="service-icon-box">
                <Layers size={28} />
              </div>
              <h3 className="service-title">CGI & Görsel Efekt (VFX)</h3>
              <p className="service-desc">
                Gözle görülemeyecek ya da çekimi imkansız olan sahneleri dijital ortamda var ediyoruz. Yeşil ekran temizleme, nesne silme/ekleme ve 3D entegrasyonlar ile gerçekliği büküyoruz.
              </p>
              <ul className="service-bullets">
                <li><CheckCircle2 size={16} /> Yeşil Ekran (Chroma Key) Kurgusu</li>
                <li><CheckCircle2 size={16} /> Nesne Kaldırma & Rotoscopy</li>
                <li><CheckCircle2 size={16} /> 3D Element Entegrasyonu</li>
              </ul>
            </div>

            {/* Service 6 */}
            <div className="post-service-card">
              <div className="service-icon-box">
                <Zap size={28} />
              </div>
              <h3 className="service-title">AI Destekli Akıllı Kurgu</h3>
              <p className="service-desc">
                Yapay zeka araçlarını en yeni donanımlarımızla birleştirerek kurgu süreçlerini hızlandırıyoruz. Yatay çekilmiş videoları akıllı algoritmalarla dikey formata dönüştürerek sosyal medyaya uyarlıyoruz.
              </p>
              <ul className="service-bullets">
                <li><CheckCircle2 size={16} /> Akıllı Otomatik Boyutlandırma (Reframing)</li>
                <li><CheckCircle2 size={16} /> AI Destekli Altyazı & Seslendirme</li>
                <li><CheckCircle2 size={16} /> Hızlı Versiyonlama & Kurgu Asistanlığı</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section id="isakis" className="post-section" style={{ borderTop: '1px solid var(--post-border)' }}>
        <div className="container">
          <div className="post-section-title-wrapper">
            <span className="post-section-tag">İş Akışımız</span>
            <h2 className="post-section-title">Fikirlerden Son Piksellere Adım Adım</h2>
          </div>
          
          {/* Navigation Tabs */}
          <div className="timeline-tabs">
            {steps.map((step, idx) => (
              <button 
                key={idx}
                className={`timeline-tab-btn ${activeStep === idx ? 'active' : ''}`}
                onClick={() => setActiveStep(idx)}
              >
                <span className="timeline-tab-num">ADIM 0{idx + 1}</span>
                <span className="timeline-tab-title">{step.subtitle}</span>
              </button>
            ))}
          </div>
          
          {/* Active Tab Content Card */}
          <div className="timeline-content-card">
            <div className="timeline-text">
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'rgba(255, 183, 3, 0.05)',
                  border: '1px solid rgba(255, 183, 3, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--post-gold)'
                }}>
                  {steps[activeStep].icon}
                </div>
                <h3 className="timeline-content-title">{steps[activeStep].title}</h3>
              </div>
              
              <p className="timeline-content-desc">{steps[activeStep].desc}</p>
              
              <ul className="timeline-details">
                {steps[activeStep].details.map((detail, dIdx) => (
                  <li key={dIdx}>
                    <CheckCircle2 size={18} />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="timeline-visual">
              <div className="pulse-circle">
                {steps[activeStep].icon}
                <div className="pulse-ring"></div>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--post-text-muted)', marginTop: '25px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
                Aşama 0{activeStep + 1} Aktif
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO SECTION */}
      <section id="portfolyo" className="post-section" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--post-border)' }}>
        <div className="container">
          <div className="post-section-title-wrapper">
            <span className="post-section-tag">Neler Ürettik?</span>
            <h2 className="post-section-title">Son Çalışmalarımız & Reels</h2>
          </div>
          
          <div className="portfolio-grid">
            {/* Project 1 */}
            <div className="portfolio-card">
              <div className="portfolio-thumbnail-wrapper">
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #110022 0%, #220033 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Monitor size={48} color="var(--post-gold)" style={{ opacity: 0.3 }} />
                </div>
                <div className="portfolio-overlay">
                  <div className="portfolio-play-btn">
                    <Play size={24} style={{ marginLeft: '4px' }} />
                  </div>
                </div>
              </div>
              <div className="portfolio-info">
                <span className="portfolio-category">E-Ticaret Reklam Filmi</span>
                <h4 className="portfolio-title">Moda Markası Tanıtımı</h4>
                <p className="portfolio-desc">Dinamik geçişler, profesyonel renk derecelendirme ve ritmik müzik kurgusu ile 45 saniyelik sosyal medya lansman videosu.</p>
              </div>
            </div>

            {/* Project 2 */}
            <div className="portfolio-card">
              <div className="portfolio-thumbnail-wrapper">
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #0b1a30 0%, #050b14 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sliders size={48} color="var(--post-gold)" style={{ opacity: 0.3 }} />
                </div>
                <div className="portfolio-overlay">
                  <div className="portfolio-play-btn">
                    <Play size={24} style={{ marginLeft: '4px' }} />
                  </div>
                </div>
              </div>
              <div className="portfolio-info">
                <span className="portfolio-category">Kurumsal / YouTube</span>
                <h4 className="portfolio-title">Teknoloji Girişimi Belgeseli</h4>
                <p className="portfolio-desc">Röportaj ses temizlikleri, temiz alt yazılar ve modern B-roll montajları ile hazırladığımız mini belgesel serisi.</p>
              </div>
            </div>

            {/* Project 3 */}
            <div className="portfolio-card">
              <div className="portfolio-thumbnail-wrapper">
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #25021a 0%, #0d0109 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={48} color="var(--post-gold)" style={{ opacity: 0.3 }} />
                </div>
                <div className="portfolio-overlay">
                  <div className="portfolio-play-btn">
                    <Play size={24} style={{ marginLeft: '4px' }} />
                  </div>
                </div>
              </div>
              <div className="portfolio-info">
                <span className="portfolio-category">VFX & CGI Entegrasyonu</span>
                <h4 className="portfolio-title">Kozmetik Markası 3D Görsel Efekt</h4>
                <p className="portfolio-desc">Yeşil ekran çekimlerinin temizlenmesi ve 3D ürün modellerinin gerçeğe yakın aydınlatma ile kurguya yerleştirilmesi.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT / PROPOSAL SECTION */}
      <section id="teklif" className="post-section" style={{ borderTop: '1px solid var(--post-border)' }}>
        <div className="container">
          <div className="post-contact-grid">
            <div className="post-contact-info">
              <div>
                <span className="post-section-tag">Bizimle İletişime Geçin</span>
                <h2 className="post-section-title" style={{ fontSize: '3rem', marginBottom: '20px' }}>Yeni Projenizi Birlikte İnşa Edelim</h2>
              </div>
              
              <p className="post-contact-desc">
                Videolarınızın kurgu, renk, VFX ya da ses süreçleri için profesyonel desteğe mi ihtiyacınız var? Projenizin detaylarını bizimle paylaşın, en kısa sürede iş akışınızı planlayalım ve teklifimizi iletelim.
              </p>
              
              <div className="post-contact-cards">
                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    <Mail size={22} />
                  </div>
                  <div className="contact-info-text">
                    <h5>E-Posta Gönderin</h5>
                    <p>hello@socialartajans.com</p>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon">
                    <Phone size={22} />
                  </div>
                  <div className="contact-info-text">
                    <h5>Telefon & WhatsApp</h5>
                    <p>+90 539 860 2130</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Proposal Form Card */}
            <div className="post-form-card">
              <h3 className="post-form-title">Proje Detayları</h3>
              
              {status.message && (
                <div className={`post-alert ${status.type === 'success' ? 'post-alert-success' : 'post-alert-error'}`}>
                  {status.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
                  <span>{status.message}</span>
                </div>
              )}

              <form className="post-form" onSubmit={handleFormSubmit}>
                <div className="post-input-group">
                  <label className="post-input-label">Adınız Soyadınız *</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      name="name" 
                      className="post-input" 
                      placeholder="Örn. Ahmet Yılmaz" 
                      value={formData.name}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>

                <div className="post-input-group">
                  <label className="post-input-label">E-Posta Adresiniz *</label>
                  <input 
                    type="email" 
                    name="email" 
                    className="post-input" 
                    placeholder="Örn. ahmet@sirketiniz.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="post-input-group">
                  <label className="post-input-label">Telefon Numaranız *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    className="post-input" 
                    placeholder="Örn. +90 5XX XXX XX XX" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="post-input-group">
                  <label className="post-input-label">Firma / Marka Adı</label>
                  <input 
                    type="text" 
                    name="company" 
                    className="post-input" 
                    placeholder="Örn. Socialart Medya" 
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="post-input-group">
                  <label className="post-input-label">İhtiyacınız Olan Hizmet</label>
                  <select 
                    name="service" 
                    className="post-input post-select"
                    value={formData.service}
                    onChange={handleInputChange}
                  >
                    <option value="Tam Paket Post-Prodüksiyon">Tam Paket Post-Prodüksiyon (Kurgu, Renk, VFX, Ses)</option>
                    <option value="Sadece Kurgu & Montaj">Sadece Kurgu & Montaj</option>
                    <option value="Color Grading (Renk)">Color Grading (Renk Derecelendirme)</option>
                    <option value="VFX & Motion Graphics">VFX & Hareketli Grafikler</option>
                    <option value="Ses Kurgusu & Miksaj">Ses Tasarımı & Foley & Miksaj</option>
                    <option value="Yapay Zeka (AI) Destekli Akıllı Formatlama">AI Akıllı Formatlama (Yataydan Dikeye)</option>
                  </select>
                </div>

                <div className="post-input-group">
                  <label className="post-input-label">Tahmini Video Süresi</label>
                  <select 
                    name="duration" 
                    className="post-input post-select"
                    value={formData.duration}
                    onChange={handleInputChange}
                  >
                    <option value="15 Saniyeye Kadar">15 Saniyeye Kadar (Kısa Sosyal Medya Reklamı)</option>
                    <option value="15-60 Saniye">15-60 Saniye (Reels / TikTok / YouTube Shorts)</option>
                    <option value="1-3 Dakika">1-3 Dakika (Tanıtım / Lansman Filmi)</option>
                    <option value="3-10 Dakika">3-10 Dakika (YouTube / Kurumsal Sunum)</option>
                    <option value="10 Dakika Üzeri">10 Dakika Üzeri (Belgesel / Uzun Format)</option>
                  </select>
                </div>

                <div className="post-input-group">
                  <label className="post-input-label">Proje Detayları & İstekleriniz</label>
                  <textarea 
                    name="details" 
                    className="post-input post-textarea" 
                    placeholder="Videonuzda kullanılmasını istediğiniz stil, referans videolar veya özel gereksinimler varsa belirtiniz..."
                    value={formData.details}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="post-btn post-btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', height: '48px', marginTop: '10px' }}
                  disabled={loading}
                >
                  {loading ? 'Gönderiliyor...' : 'Teklif Talebi Gönder'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="post-footer">
        <div className="container">
          <div className="post-footer-inner">
            <div className="post-footer-col">
              <div className="post-footer-logo">
                SOCIALART // <span>POST</span>
              </div>
              <p className="post-footer-desc">
                Kurgu, renk derecelendirme (color grading), görsel efekt (VFX) ve ses tasarımı süreçlerini profesyonel donanımlarla buluşturarak markanızın görsel dilini üst seviyeye taşıyoruz.
              </p>
              <div className="post-social-links">
                <a href="https://instagram.com/socialartajans" target="_blank" rel="noreferrer" className="post-social-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://linkedin.com/company/socialartajans" target="_blank" rel="noreferrer" className="post-social-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              </div>
            </div>
            
            <div className="post-footer-col">
              <h4 className="post-footer-title">Hizmetlerimiz</h4>
              <ul className="post-footer-links">
                <li className="post-footer-link-item"><button onClick={() => scrollToSection('servisler')} style={{ color: 'var(--post-text-muted)' }}>Kurgu & Montaj</button></li>
                <li className="post-footer-link-item"><button onClick={() => scrollToSection('servisler')} style={{ color: 'var(--post-text-muted)' }}>Color Grading</button></li>
                <li className="post-footer-link-item"><button onClick={() => scrollToSection('servisler')} style={{ color: 'var(--post-text-muted)' }}>VFX & Animasyon</button></li>
                <li className="post-footer-link-item"><button onClick={() => scrollToSection('servisler')} style={{ color: 'var(--post-text-muted)' }}>Ses Kurgusu & Miksaj</button></li>
              </ul>
            </div>

            <div className="post-footer-col">
              <h4 className="post-footer-title">Navigasyon</h4>
              <ul className="post-footer-links">
                <li className="post-footer-link-item"><button onClick={() => scrollToSection('anasayfa')} style={{ color: 'var(--post-text-muted)' }}>Ana Sayfa</button></li>
                <li className="post-footer-link-item"><button onClick={() => scrollToSection('isakis')} style={{ color: 'var(--post-text-muted)' }}>İş Akışımız</button></li>
                <li className="post-footer-link-item"><button onClick={() => scrollToSection('portfolyo')} style={{ color: 'var(--post-text-muted)' }}>Portfolyo</button></li>
                <li className="post-footer-link-item"><Link to="/" style={{ color: 'var(--post-text-muted)' }}>Ajans Ana Sayfası</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="post-footer-bottom">
            <div>
              &copy; {new Date().getFullYear()} Socialart Post Production. Tüm hakları saklıdır.
            </div>
            <div className="post-footer-bottom-links">
              <Link to="/gizlilik-politikasi">Gizlilik Politikası</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PostProduction;
