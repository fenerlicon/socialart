import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Phone, 
  Mail, 
  Share2, 
  MessageCircle, 
  Users, 
  Lock,
  ChevronDown,
  PlayCircle, 
  Layers, 
  Zap,
  Tag,
  CreditCard,
  TrendingUp,
  Camera,
  Globe,
  Rocket,
  Utensils,
  Calendar
} from 'lucide-react';
import './App.css';
const Home = lazy(() => import('./pages/Home'));

// Lazy Loaded Pages
const Services = lazy(() => import('./pages/Services'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Admin = lazy(() => import('./pages/StaffAdmin'));
const Pricing = lazy(() => import('./pages/Pricing'));
const ClientPortal = lazy(() => import('./pages/ClientPortal'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ThankYou = lazy(() => import('./pages/ThankYou'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

// Service Detail Pages
const MetaAds = lazy(() => import('./pages/services/MetaAds'));
const CreativeProduction = lazy(() => import('./pages/services/CreativeProduction'));
const SEOGEO = lazy(() => import('./pages/services/SEOGEO'));
const SosyalMedya = lazy(() => import('./pages/services/SosyalMedya'));
const UGCInfluencer = lazy(() => import('./pages/services/UGCInfluencer'));
const SunuculuReklam = lazy(() => import('./pages/services/SunuculuReklam'));
const RestaurantMarketing = lazy(() => import('./pages/services/RestaurantMarketing'));
const GymMarketing = lazy(() => import('./pages/services/GymMarketing'));
const DijitalPazarlamaDanismanligi = lazy(() => import('./pages/services/DijitalPazarlamaDanismanligi'));

// Named exports from ApplicationForms
const UGCApplication = lazy(() => import('./pages/ApplicationForms').then(m => ({ default: m.UGCApplication })));
const JobApplication = lazy(() => import('./pages/ApplicationForms').then(m => ({ default: m.JobApplication })));

const EmailMarketing = lazy(() => import('./pages/EmailMarketing'));
const PostProduction = lazy(() => import('./pages/PostProduction'));
const EventCekimi = lazy(() => import('./pages/services/EventCekimi'));

const LockIcon = Lock;
const CardIcon = CreditCard;

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null); // 'hizmetler' or 'kurumsal' or null
  const navigate = useNavigate();
  const location = useLocation();
  const [SpeedInsightsComponent, setSpeedInsightsComponent] = useState(null);

  // Handle chunk loading errors (automatically reload page if version updates and old chunks are missing)
  useEffect(() => {
    const handleChunkError = (e) => {
      const errorText = e.message || '';
      if (
        errorText.includes('Importing a module script failed') || 
        errorText.includes('Failed to fetch dynamically imported module') ||
        errorText.includes('chunk')
      ) {
        console.warn('New version detected or chunk error, reloading...', e);
        window.location.reload();
      }
    };
    window.addEventListener('error', handleChunkError, true);
    return () => window.removeEventListener('error', handleChunkError, true);
  }, []);

  useEffect(() => {
    let delayTimer = null;
    const loadSpeedInsights = () => {
      delayTimer = setTimeout(() => {
        import("@vercel/speed-insights/react")
          .then((mod) => {
            setSpeedInsightsComponent(() => mod.SpeedInsights);
          })
          .catch((err) => console.debug("SpeedInsights failed to load", err));
      }, 3000);
    };

    if (document.readyState === 'complete') {
      loadSpeedInsights();
    } else {
      window.addEventListener('load', loadSpeedInsights);
    }

    return () => {
      window.removeEventListener('load', loadSpeedInsights);
      if (delayTimer) clearTimeout(delayTimer);
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use this to scroll to top whenever route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);


  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-layout">
      {/* HEADER */}
      {!['/admin', '/musteri', '/email-marketing', '/tesekkurler', '/post-produksiyon'].includes(location.pathname) && (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
          <div className="container header-inner">
            <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
              <img src="/logo.png" alt="Socialart Ajans" className="header-logo-img" width="405" height="135" fetchPriority="high" decoding="async" />
            </Link>
            
            <nav className={`nav-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Ana Sayfa</Link>
              
              {/* Hizmetler Dropdown */}
              <div 
                className={`nav-item-wrapper ${activeMobileDropdown === 'hizmetler' ? 'dropdown-open' : ''}`}
                style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%', padding: '0 0.5rem' }} 
                onMouseEnter={(e) => { if (window.innerWidth > 992) { const el = e.currentTarget.querySelector('.hizmet-dropdown'); if(el){ el.style.opacity = '1'; el.style.visibility = 'visible'; el.style.transform = 'translateY(0)'; } } }} 
                onMouseLeave={(e) => { if (window.innerWidth > 992) { const el = e.currentTarget.querySelector('.hizmet-dropdown'); if(el){ el.style.opacity = '0'; el.style.visibility = 'hidden'; el.style.transform = 'translateY(-10px)'; } } }}
                onClick={() => { if (window.innerWidth <= 992) setActiveMobileDropdown(activeMobileDropdown === 'hizmetler' ? null : 'hizmetler'); }}
              >
                <span style={{ cursor: 'pointer', color: '#f1f1f1', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>Hizmetler <ChevronDown size={14} style={{ transform: activeMobileDropdown === 'hizmetler' ? 'rotate(180deg)' : 'none', transition: '0.3s' }} /></span>
                <div className="hizmet-dropdown">
                  <Link to="/meta-ads-yonetimi" className="dropdown-link" onClick={() => { setMobileMenuOpen(false); setActiveMobileDropdown(null); }}>
                    <div className="dropdown-link-icon-wrapper" style={{ color: 'var(--secondary)' }}><TrendingUp size={18} /></div>
                    <div className="dropdown-link-text">
                      <span className="dropdown-link-title">Meta Reklam Yönetimi</span>
                      <span className="dropdown-link-desc">ROAS ve veri odaklı reklam kampanyaları.</span>
                    </div>
                  </Link>
                  <Link to="/creative-production" className="dropdown-link" onClick={() => { setMobileMenuOpen(false); setActiveMobileDropdown(null); }}>
                    <div className="dropdown-link-icon-wrapper" style={{ color: 'var(--accent)' }}><Camera size={18} /></div>
                    <div className="dropdown-link-text">
                      <span className="dropdown-link-title">Kreatif Prodüksiyon</span>
                      <span className="dropdown-link-desc">4K sinematik reklam filmleri ve Reels çekimleri.</span>
                    </div>
                  </Link>
                  <Link to="/seo-geo-optimizasyonu" className="dropdown-link" onClick={() => { setMobileMenuOpen(false); setActiveMobileDropdown(null); }}>
                    <div className="dropdown-link-icon-wrapper" style={{ color: '#00e5ff' }}><Globe size={18} /></div>
                    <div className="dropdown-link-text">
                      <span className="dropdown-link-title">SEO & GEO</span>
                      <span className="dropdown-link-desc">Arama motorları ve yapay zekada görünürlük.</span>
                    </div>
                  </Link>
                  <Link to="/sosyal-medya-yonetimi" className="dropdown-link" onClick={() => { setMobileMenuOpen(false); setActiveMobileDropdown(null); }}>
                    <div className="dropdown-link-icon-wrapper" style={{ color: 'var(--primary)' }}><Share2 size={18} /></div>
                    <div className="dropdown-link-text">
                      <span className="dropdown-link-title">Sosyal Medya Yönetimi</span>
                      <span className="dropdown-link-desc">Organik erişim ve aktif topluluk yönetimi.</span>
                    </div>
                  </Link>
                  <Link to="/ugc-influencer-isbirligi" className="dropdown-link" onClick={() => { setMobileMenuOpen(false); setActiveMobileDropdown(null); }}>
                    <div className="dropdown-link-icon-wrapper" style={{ color: '#00e676' }}><Users size={18} /></div>
                    <div className="dropdown-link-text">
                      <span className="dropdown-link-title">UGC & Influencer</span>
                      <span className="dropdown-link-desc">Güven inşa eden samimi kullanıcı içerikleri.</span>
                    </div>
                  </Link>
                  <Link to="/dijital-pazarlama-danismanligi" className="dropdown-link" onClick={() => { setMobileMenuOpen(false); setActiveMobileDropdown(null); }}>
                    <div className="dropdown-link-icon-wrapper" style={{ color: 'var(--primary)' }}><Layers size={18} /></div>
                    <div className="dropdown-link-text">
                      <span className="dropdown-link-title">Pazarlama Danışmanlığı</span>
                      <span className="dropdown-link-desc">Büyüme stratejileri ve CRO/huni kurulumu.</span>
                    </div>
                  </Link>
                  <Link to="/sunuculu-reklam-videolari" className="dropdown-link" onClick={() => { setMobileMenuOpen(false); setActiveMobileDropdown(null); }}>
                    <div className="dropdown-link-icon-wrapper" style={{ color: '#ff0055' }}><PlayCircle size={18} /></div>
                    <div className="dropdown-link-text">
                      <span className="dropdown-link-title">Sunuculu Reklamlar</span>
                      <span className="dropdown-link-desc">Profesyonel yüzlerle yüksek dönüşümlü videolar.</span>
                    </div>
                  </Link>
                  <Link to="/post-produksiyon" className="dropdown-link" onClick={() => { setMobileMenuOpen(false); setActiveMobileDropdown(null); }}>
                    <div className="dropdown-link-icon-wrapper" style={{ color: '#ffb703' }}><Video size={18} /></div>
                    <div className="dropdown-link-text">
                      <span className="dropdown-link-title">Post Prodüksiyon</span>
                      <span className="dropdown-link-desc">Sinematik kurgu, montaj ve renk düzenleme.</span>
                    </div>
                  </Link>
                  <Link to="/event-etkinlik-cekimi" className="dropdown-link" onClick={() => { setMobileMenuOpen(false); setActiveMobileDropdown(null); }}>
                    <div className="dropdown-link-icon-wrapper" style={{ color: '#ffb703' }}><Calendar size={18} /></div>
                    <div className="dropdown-link-text">
                      <span className="dropdown-link-title">Event & Etkinlik Çekimi</span>
                      <span className="dropdown-link-desc">Lansman ve kurumsal organizasyon çekimleri.</span>
                    </div>
                  </Link>
                </div>
              </div>

              <Link to="/hakkimizda" className={location.pathname === '/hakkimizda' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Hakkımızda</Link>
              <Link to="/blog" className={location.pathname.startsWith('/blog') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Blog</Link>
              <Link to="/iletisim" className={location.pathname === '/iletisim' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>İletişim</Link>

              {/* Dropdown for internal scroll links */}
              <div 
                className={`nav-item-wrapper ${activeMobileDropdown === 'kurumsal' ? 'dropdown-open' : ''}`}
                style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%', padding: '0 0.5rem' }} 
                onMouseEnter={(e) => { if (window.innerWidth > 992) { const el = e.currentTarget.querySelector('.dropdown-container'); if(el){ el.style.opacity = '1'; el.style.visibility = 'visible'; el.style.transform = 'translateY(0)'; } } }} 
                onMouseLeave={(e) => { if (window.innerWidth > 992) { const el = e.currentTarget.querySelector('.dropdown-container'); if(el){ el.style.opacity = '0'; el.style.visibility = 'hidden'; el.style.transform = 'translateY(-10px)'; } } }}
                onClick={() => { if (window.innerWidth <= 992) setActiveMobileDropdown(activeMobileDropdown === 'kurumsal' ? null : 'kurumsal'); }}
              >
                <span style={{ cursor: 'pointer', color: '#f1f1f1', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>Kurumsal <ChevronDown size={14} style={{ transform: activeMobileDropdown === 'kurumsal' ? 'rotate(180deg)' : 'none', transition: '0.3s' }} /></span>
                <div className="dropdown-container">
                  <a href="#showreel" onClick={(e) => { e.preventDefault(); scrollToSection('showreel'); setActiveMobileDropdown(null); }} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', color: '#f1f1f1', cursor: 'pointer', fontSize: '0.95rem', borderRadius: '8px', transition: 'all 0.2s', fontWeight: '500' }} onMouseEnter={(e) => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}} onMouseLeave={(e) => {e.currentTarget.style.color = '#f1f1f1'; e.currentTarget.style.background = 'transparent'}}><PlayCircle size={18} style={{marginRight: '12px', color: 'var(--primary)'}} /> Marka Showreel</a>
                  <Link to="/fiyatlar" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', color: '#f1f1f1', cursor: 'pointer', fontSize: '0.95rem', borderRadius: '8px', transition: 'all 0.2s', marginTop: '4px', fontWeight: '500' }} onMouseEnter={(e) => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}} onMouseLeave={(e) => {e.currentTarget.style.color = '#f1f1f1'; e.currentTarget.style.background = 'transparent'}} onClick={() => { setMobileMenuOpen(false); setActiveMobileDropdown(null); }}><Tag size={18} style={{marginRight: '12px', color: '#ffab00'}} /> Planlar ve Ücretler</Link>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0' }}></div>
                  <Link to="/ugc-basvuru" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', color: '#f1f1f1', cursor: 'pointer', fontSize: '0.95rem', borderRadius: '8px', transition: 'all 0.2s', fontWeight: '500' }} onMouseEnter={(e) => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}} onMouseLeave={(e) => {e.currentTarget.style.color = '#f1f1f1'; e.currentTarget.style.background = 'transparent'}} onClick={() => { setMobileMenuOpen(false); setActiveMobileDropdown(null); }}><Zap size={18} style={{marginRight: '12px', color: 'var(--accent)'}} /> UGC & INF Başvurusu</Link>
                  <Link to="/is-basvurusu" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', color: '#f1f1f1', cursor: 'pointer', fontSize: '0.95rem', borderRadius: '8px', transition: 'all 0.2s', fontWeight: '500', marginTop: '4px' }} onMouseEnter={(e) => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}} onMouseLeave={(e) => {e.currentTarget.style.color = '#f1f1f1'; e.currentTarget.style.background = 'transparent'}} onClick={() => { setMobileMenuOpen(false); setActiveMobileDropdown(null); }}><Rocket size={18} style={{marginRight: '12px', color: 'var(--primary)'}} /> İş Başvurusu</Link>
                </div>
              </div>
            </nav>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button className="cta-button" onClick={() => scrollToSection('funnel')} aria-label="Ekibimizle Toplantı Planlayın">
                Ekibimizle Toplantı Planlayın
              </button>
              <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}>
                {mobileMenuOpen ? <X size={24} color="#fff" /> : <Menu size={24} color="#fff" />}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* PAGE CONTENT */}
      <main className="main-content">
        <Suspense fallback={
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/hakkimizda" element={<About />} />
            <Route path="/hizmetlerimiz" element={<Services />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/fiyatlar" element={<Pricing />} />
            <Route path="/musteri" element={<ClientPortal />} />
            <Route path="/ugc-basvuru" element={<UGCApplication />} />
            <Route path="/is-basvurusu" element={<JobApplication />} />
            <Route path="/email-marketing" element={<EmailMarketing />} />
            <Route path="/post-produksiyon" element={<PostProduction />} />
            
            {/* Service Detail Routes */}
            <Route path="/meta-ads-yonetimi" element={<MetaAds />} />
            <Route path="/creative-production" element={<CreativeProduction />} />
            <Route path="/seo-geo-optimizasyonu" element={<SEOGEO />} />
            <Route path="/sosyal-medya-yonetimi" element={<SosyalMedya />} />
            <Route path="/ugc-influencer-isbirligi" element={<UGCInfluencer />} />
            <Route path="/dijital-pazarlama-danismanligi" element={<DijitalPazarlamaDanismanligi />} />
            <Route path="/sunuculu-reklam-videolari" element={<SunuculuReklam />} />
            <Route path="/event-etkinlik-cekimi" element={<EventCekimi />} />
            <Route path="/restoran-pazarlama" element={<RestaurantMarketing />} />
            <Route path="/spor-salonu-pazarlama" element={<GymMarketing />} />
            <Route path="/tesekkurler" element={<ThankYou />} />
            <Route path="/iletisim" element={<Contact />} />

            <Route path="/gizlilik-politikasi" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* FOOTER */}
      {!['/admin', '/musteri', '/email-marketing', '/tesekkurler', '/post-produksiyon'].includes(location.pathname) && (
        <footer className="footer" id="contact">
          <div className="container">
            <div className="footer-inner" style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '40px' }}>
              <div className="footer-col">
                <Link to="/" className="brand-logo" style={{ marginBottom: '10px', display: 'block' }}>
                  <img src="/logo.png" alt="Socialart Ajans" width="180" height="60" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} loading="lazy" />
                </Link>
                <p style={{marginTop: '10px', marginBottom: '30px'}}>Site → Strateji Toplantısı → Teklif → Satış kurgusu ile dijitalde sınırları aşıyoruz.</p>
                <div className="social-links">
                  <a href="https://instagram.com/socialartajans" target="_blank" rel="noreferrer" className="instagram" aria-label="Instagram sayfamız">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href="https://linkedin.com/company/socialartajans" target="_blank" rel="noreferrer" className="linkedin" aria-label="LinkedIn sayfamız">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                  <a href="https://www.youtube.com/channel/UCn3T2JSaWZ2Uo3Ca_oNYnIg" target="_blank" rel="noreferrer" className="youtube" aria-label="YouTube kanalımız">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
                  </a>
                  <a href="mailto:hello@socialartajans.com" className="mail" aria-label="E-posta gönder"><Mail size={20} /></a>
                </div>
              </div>
              
              <div className="footer-col" style={{gridColumn: 'span 2'}}>
                <h4>İletişim</h4>
                <ul className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--text-muted)' }}>
                    <Phone size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} /> 
                    <a href="tel:+905398602130" style={{ fontSize: '0.95rem' }}>+90 539 860 2130</a>
                  </li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--text-muted)' }}>
                    <Mail size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} /> 
                    <a href="mailto:hello@socialartajans.com" style={{ fontSize: '0.95rem' }}>hello@socialartajans.com</a>
                  </li>
                </ul>
              </div>

              <div className="footer-col">
                <h4>Kurumsal</h4>
                <ul className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li><Link to="/hakkimizda" style={{ fontSize: '0.9rem', color: '#ccc' }}>Hakkımızda</Link></li>
                  <li><Link to="/hizmetlerimiz" style={{ fontSize: '0.9rem', color: '#ccc' }}>Hizmetlerimiz</Link></li>
                  <li><Link to="/blog" style={{ fontSize: '0.9rem', color: '#ccc' }}>Blog</Link></li>
                  <li><Link to="/fiyatlar" style={{ fontSize: '0.9rem', color: '#ccc' }}>Fiyatlar</Link></li>
                  <li><Link to="/iletisim" style={{ fontSize: '0.9rem', color: '#ccc' }}>İletişim</Link></li>
                </ul>
              </div>

              <div className="footer-col">
                <h4>Erişim</h4>
                <ul className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li><Link to="/musteri" style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}><LockIcon size={14} /> Müşteri Paneli</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="footer-bottom" style={{border: 'none', paddingTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)'}}>
              &copy; {new Date().getFullYear()} Socialart Ajans. Tüm hakları saklıdır.
              <span style={{ margin: '0 10px', color: '#333' }}>|</span> 
              <Link to="/gizlilik-politikasi" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Gizlilik Politikası & KVKK</Link>
            </div>
          </div>
        </footer>
      )}
      {SpeedInsightsComponent && <SpeedInsightsComponent />}
    </div>
  );
}

export default App;
