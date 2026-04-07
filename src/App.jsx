import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Phone, Mail, Menu, X, Share2, MessageCircle, Users, PlayCircle, Layers, Zap } from 'lucide-react';
import './App.css';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Blog from './pages/Blog';
import Admin from './pages/Admin';
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
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <Link to="/" className="brand-logo" onClick={() => window.scrollTo(0,0)}>
            Social<span className="brand-dot">Art</span>
          </Link>
          
          <nav className="nav-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Ana Sayfa</Link>
            <Link to="/hakkimizda" className={location.pathname === '/hakkimizda' ? 'active' : ''}>Hakkımızda</Link>
            <Link to="/hizmetlerimiz" className={location.pathname === '/hizmetlerimiz' ? 'active' : ''}>Hizmetlerimiz</Link>
            <Link to="/blog" className={location.pathname === '/blog' ? 'active' : ''}>Blog</Link>

            {/* Dropdown for internal scroll links */}
            <div 
              style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%', padding: '0 0.5rem' }} 
              onMouseEnter={(e) => { const el = e.currentTarget.querySelector('.dropdown-container'); if(el){ el.style.opacity = '1'; el.style.visibility = 'visible'; el.style.transform = 'translateY(0)'; } }} 
              onMouseLeave={(e) => { const el = e.currentTarget.querySelector('.dropdown-container'); if(el){ el.style.opacity = '0'; el.style.visibility = 'hidden'; el.style.transform = 'translateY(-10px)'; } }}
            >
              <span style={{ cursor: 'pointer', color: '#f1f1f1', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>Keşfet <span style={{fontSize: '0.8rem'}}>▼</span></span>
              <div className="dropdown-container" style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translate(40%, -10px)', background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '8px', minWidth: '190px', zIndex: 100, boxShadow: '0 20px 40px rgba(0,0,0,0.6)', opacity: '0', visibility: 'hidden', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', marginTop: '10px' }}>
                <a onClick={() => scrollToSection('showreel')} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', color: '#ccc', cursor: 'pointer', fontSize: '0.95rem', borderRadius: '8px', transition: 'all 0.2s', fontWeight: '500' }} onMouseEnter={(e) => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}} onMouseLeave={(e) => {e.currentTarget.style.color = '#ccc'; e.currentTarget.style.background = 'transparent'}}><PlayCircle size={18} style={{marginRight: '12px', color: 'var(--primary)'}} /> Marka Showreel</a>
                <a onClick={() => scrollToSection('services')} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', color: '#ccc', cursor: 'pointer', fontSize: '0.95rem', borderRadius: '8px', transition: 'all 0.2s', margin: '4px 0', fontWeight: '500' }} onMouseEnter={(e) => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}} onMouseLeave={(e) => {e.currentTarget.style.color = '#ccc'; e.currentTarget.style.background = 'transparent'}}><Layers size={18} style={{marginRight: '12px', color: '#00e5ff'}} /> Hizmet Ağımız</a>
                <a onClick={() => scrollToSection('kampanyalar')} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', color: '#ccc', cursor: 'pointer', fontSize: '0.95rem', borderRadius: '8px', transition: 'all 0.2s', fontWeight: '500' }} onMouseEnter={(e) => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}} onMouseLeave={(e) => {e.currentTarget.style.color = '#ccc'; e.currentTarget.style.background = 'transparent'}}><Zap size={18} style={{marginRight: '12px', color: 'var(--secondary)'}} /> Size Özel Fırsatlar</a>
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

      {/* PAGE CONTENT */}
      <main style={{flex: 1}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hakkimizda" element={<About />} />
          <Route path="/hizmetlerimiz" element={<Services />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="footer" id="contact">
        <div className="container">
          <div className="footer-inner" style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '40px' }}>
            <div className="footer-col">
              <Link to="/" className="brand-logo" style={{ marginBottom: '20px', display: 'block' }}>
                Social<span className="brand-dot">Art</span>
              </Link>
              <p>Site → Ücretsiz Analiz → Teklif → Satış kurgusu ile dijitalde sınırları aşıyoruz.</p>
              <div className="social-links">
                <a href="#"><Share2 size={20} color="#f1f1f1" /></a>
                <a href="#"><MessageCircle size={20} color="#f1f1f1" /></a>
                <a href="#"><Users size={20} color="#f1f1f1" /></a>
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
          </div>
          
          <div className="footer-bottom" style={{border: 'none', paddingTop: '20px'}}>
            &copy; {new Date().getFullYear()} Socialart Ajans. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
