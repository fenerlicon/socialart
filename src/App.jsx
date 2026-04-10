import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
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
  CreditCard
} from 'lucide-react';
import './App.css';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Admin from './pages/Admin';
import Pricing from './pages/Pricing';
import ClientPortal from './pages/ClientPortal';

const LockIcon = Lock;
const CardIcon = CreditCard;

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use this to scroll to top whenever route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      navigate('/#' + id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-layout">
      {/* HEADER */}
      {!['/admin', '/musteri'].includes(location.pathname) && (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
          <div className="container header-inner">
            <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
              <img src="/logo.png" alt="Socialart Ajans" className="header-logo-img" />
            </Link>
            
            <nav className={`nav-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Ana Sayfa</Link>
              <Link to="/hakkimizda" className={location.pathname === '/hakkimizda' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Hakkımızda</Link>
              <Link to="/hizmetlerimiz" className={location.pathname === '/hizmetlerimiz' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Hizmetlerimiz</Link>
              <Link to="/blog" className={location.pathname.startsWith('/blog') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Blog</Link>

              {/* Dropdown for internal scroll links */}
              <div 
                style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%', padding: '0 0.5rem' }} 
                onMouseEnter={(e) => { const el = e.currentTarget.querySelector('.dropdown-container'); if(el){ el.style.opacity = '1'; el.style.visibility = 'visible'; el.style.transform = 'translateY(0)'; } }} 
                onMouseLeave={(e) => { const el = e.currentTarget.querySelector('.dropdown-container'); if(el){ el.style.opacity = '0'; el.style.visibility = 'hidden'; el.style.transform = 'translateY(-10px)'; } }}
              >
                <span style={{ cursor: 'pointer', color: '#f1f1f1', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>Keşfet <ChevronDown size={14} /></span>
                <div className="dropdown-container" style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translate(40%, -10px)', background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '8px', minWidth: '190px', zIndex: 100, boxShadow: '0 20px 40px rgba(0,0,0,0.6)', opacity: '0', visibility: 'hidden', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', marginTop: '10px' }}>
                  <a onClick={() => scrollToSection('showreel')} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', color: '#ccc', cursor: 'pointer', fontSize: '0.95rem', borderRadius: '8px', transition: 'all 0.2s', fontWeight: '500' }} onMouseEnter={(e) => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}} onMouseLeave={(e) => {e.currentTarget.style.color = '#ccc'; e.currentTarget.style.background = 'transparent'}}><PlayCircle size={18} style={{marginRight: '12px', color: 'var(--primary)'}} /> Marka Showreel</a>
                  <a onClick={() => scrollToSection('services')} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', color: '#ccc', cursor: 'pointer', fontSize: '0.95rem', borderRadius: '8px', transition: 'all 0.2s', margin: '4px 0', fontWeight: '500' }} onMouseEnter={(e) => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}} onMouseLeave={(e) => {e.currentTarget.style.color = '#ccc'; e.currentTarget.style.background = 'transparent'}}><Layers size={18} style={{marginRight: '12px', color: '#00e5ff'}} /> Hizmet Ağımız</a>
                  <a onClick={() => scrollToSection('kampanyalar')} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', color: '#ccc', cursor: 'pointer', fontSize: '0.95rem', borderRadius: '8px', transition: 'all 0.2s', fontWeight: '500' }} onMouseEnter={(e) => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}} onMouseLeave={(e) => {e.currentTarget.style.color = '#ccc'; e.currentTarget.style.background = 'transparent'}}><Zap size={18} style={{marginRight: '12px', color: 'var(--secondary)'}} /> Size Özel Fırsatlar</a>
                  <Link to="/fiyatlar" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', color: '#ccc', cursor: 'pointer', fontSize: '0.95rem', borderRadius: '8px', transition: 'all 0.2s', marginTop: '4px', fontWeight: '500' }} onMouseEnter={(e) => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}} onMouseLeave={(e) => {e.currentTarget.style.color = '#ccc'; e.currentTarget.style.background = 'transparent'}}><Tag size={18} style={{marginRight: '12px', color: '#ffab00'}} /> Planlar ve Ücretler</Link>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0' }}></div>
                  <Link to="/musteri" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.95rem', borderRadius: '8px', transition: 'all 0.2s', fontWeight: '700' }} onMouseEnter={(e) => {e.currentTarget.style.background = 'rgba(138,43,226,0.1)'}} onMouseLeave={(e) => {e.currentTarget.style.background = 'transparent'}}><LockIcon size={18} style={{marginRight: '12px'}} /> Müşteri Girişi</Link>
                  <Link to="/admin" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', color: '#00e5ff', cursor: 'pointer', fontSize: '0.95rem', borderRadius: '8px', transition: 'all 0.2s', fontWeight: '700', marginTop: '4px' }} onMouseEnter={(e) => {e.currentTarget.style.background = 'rgba(0,229,255,0.05)'}} onMouseLeave={(e) => {e.currentTarget.style.background = 'transparent'}}><Users size={18} style={{marginRight: '12px'}} /> Çalışan Girişi</Link>
                </div>
              </div>
            </nav>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button className="cta-button" onClick={() => scrollToSection('funnel')}>
                Ücretsiz Analiz Al
              </button>
              <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none' }}>
                {mobileMenuOpen ? <X size={24} color="#fff" /> : <Menu size={24} color="#fff" />}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* PAGE CONTENT */}
      <main style={{flex: 1}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hakkimizda" element={<About />} />
          <Route path="/hizmetlerimiz" element={<Services />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/fiyatlar" element={<Pricing />} />
          <Route path="/musteri" element={<ClientPortal />} />
        </Routes>
      </main>

      {/* FOOTER */}
      {!['/admin', '/musteri'].includes(location.pathname) && (
        <footer className="footer" id="contact">
          <div className="container">
            <div className="footer-inner" style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '40px' }}>
              <div className="footer-col">
                <Link to="/" className="brand-logo" style={{ marginBottom: '10px', display: 'block' }}>
                  <img src="/logo.png" alt="Socialart Ajans" className="footer-logo-img" />
                </Link>
                <p style={{marginTop: '-20px', marginBottom: '30px'}}>Site → Ücretsiz Analiz → Teklif → Satış kurgusu ile dijitalde sınırları aşıyoruz.</p>
                <div className="social-links">
                  <a href="https://instagram.com/socialartajans" target="_blank" rel="noreferrer" className="instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href="https://linkedin.com/company/socialartajans" target="_blank" rel="noreferrer" className="linkedin">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                  <a href="https://www.youtube.com/channel/UCn3T2JSaWZ2Uo3Ca_oNYnIg" target="_blank" rel="noreferrer" className="youtube">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
                  </a>
                  <a href="mailto:hello@socialartajans.com" className="mail"><Mail size={20} /></a>
                </div>
              </div>
              
              <div className="footer-col" style={{gridColumn: 'span 2'}}>
                <h4>İletişim</h4>
                <ul className="footer-links">
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--text-muted)' }}>
                    <Phone size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} /> 
                    <a href="tel:+905398602130">+90 539 860 2130</a>
                  </li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--text-muted)' }}>
                    <Mail size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} /> 
                    <a href="mailto:hello@socialartajans.com">hello@socialartajans.com</a>
                  </li>
                </ul>
              </div>

              <div className="footer-col">
                <h4>Erişim</h4>
                <ul className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li><Link to="/musteri" style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><LockIcon size={14} /> Müşteri Paneli</Link></li>
                  <li><Link to="/admin" style={{ color: '#00e5ff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={14} /> Çalışan Paneli</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="footer-bottom" style={{border: 'none', paddingTop: '20px', textAlign: 'center'}}>
              &copy; {new Date().getFullYear()} Socialart Ajans. Tüm hakları saklıdır.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
