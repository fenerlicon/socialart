import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';
import { 
  Upload, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Mail, 
  Download, 
  Trash2, 
  AlertCircle,
  RefreshCw,
  Search,
  ChevronRight,
  ShieldCheck,
  Zap,
  Users,
  Briefcase,
  FileText,
  ClipboardList,
  ListTodo,
  Activity,
  Clock,
  Menu,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function EmailMarketing() {
  const [loading, setLoading] = useState(false);
  const [existingEmails, setExistingEmails] = useState(new Set());
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, duplicate: 0, unique: 0 });
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz_XXXXXXXXXXXX/exec';

  useEffect(() => {
    fetchExisting();
  }, []);

  async function fetchExisting() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('email_marketing_leads').select('email');
      if (error) throw error;
      const set = new Set(data.map(item => (item.email || '').toLowerCase().trim()).filter(Boolean));
      setExistingEmails(set);
    } catch (err) {
      console.error(err);
      setMessage(`Veritabanı bağlantı hatası: ${err.message || 'Bilinmeyen hata'}`);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const unique = [];
        const dups = [];
        results.data.forEach(row => {
          const email = (row.email || row.Email || row.mail || row.MAIL || '').toLowerCase().trim();
          if (!email || !email.includes('@')) return;
          
          const lead = {
            email,
            name: row.name || row.Name || row.ad || row.AD || '',
            source: 'CSV Upload'
          };

          if (existingEmails.has(email)) {
            dups.push(lead);
          } else {
            unique.push(lead);
          }
        });

        setFilteredLeads(unique);
        setStats({ total: unique.length + dups.length, duplicate: dups.length, unique: unique.length });
        setStatus('success');
        setMessage('CSV başarıyla okundu.');
        setLoading(false);
      },
      error: (err) => {
        console.error(err);
        setStatus('error');
        setMessage('CSV okuma hatası!');
        setLoading(false);
      }
    });
  };

  const handleSync = async () => {
    if (filteredLeads.length === 0) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('email_marketing_leads').insert(
        filteredLeads.map(l => ({ ...l, status: 'active' }))
      );
      if (error) throw error;
      setMessage(`${filteredLeads.length} lead kaydedildi.`);
      setStatus('success');
      setFilteredLeads([]);
      setStats(prev => ({ ...prev, duplicate: prev.duplicate + prev.unique, unique: 0 }));
    } catch (err) {
      console.error(err);
      setMessage(`Kayıt hatası: ${err.message || 'Bilinmeyen hata'}`);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleTrigger = async () => {
    if (filteredLeads.length === 0 && stats.unique === 0) return;
    setLoading(true);
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ leads: filteredLeads, type: 'email_marketing' })
      });
      setMessage('Google Script tetiklendi!');
      setStatus('success');
    } catch (err) {
      console.error(err);
      setMessage('Trigger hatası!');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-layout" style={{ minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: 'sans-serif' }}>
      <style>{`
        .admin-page-layout {
          display: flex;
          padding: 30px;
          gap: 30px;
        }
        .admin-sidebar-nav {
          width: 280px;
          flex-shrink: 0;
          background: rgba(15, 15, 15, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          height: calc(100vh - 60px);
          position: sticky;
          top: 30px;
        }
        .admin-sidebar-nav .sidebar-link {
          padding: 14px 18px;
          border-radius: 14px;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255,255,255,0.6);
          background: transparent;
          border: none;
          cursor: pointer;
          text-decoration: none;
          text-align: left;
        }
        .admin-sidebar-nav .sidebar-link:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }
        .admin-sidebar-nav .sidebar-link.active {
          background: var(--primary);
          color: #000;
          box-shadow: 0 10px 20px rgba(138, 43, 226, 0.2);
        }
        .main-content-area {
          flex-grow: 1;
          max-width: 1200px;
        }
        @media (max-width: 1024px) {
          .admin-sidebar-nav {
            position: fixed;
            left: -300px;
            top: 0;
            height: 100vh;
            z-index: 1000;
            transition: 0.3s;
          }
          .admin-sidebar-nav.open {
            left: 0;
          }
          .admin-page-layout {
            padding: 15px;
          }
        }
      `}</style>

      {/* Sidebar */}
      <div className={`admin-sidebar-nav ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ marginBottom: '30px', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '35px', height: '35px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>SA</div>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>SOCIAL<span style={{ color: 'var(--primary)' }}>ART</span></span>
          </div>
        </div>
        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'rgba(255,255,255,0.2)', letterSpacing: '2px', padding: '0 16px', marginBottom: '10px' }}>NAVİGASYON</div>
        <Link to="/admin" className="sidebar-link">
          <Users size={18} /> Panel Giriş
        </Link>
        <div className="sidebar-link active">
          <Mail size={18} /> E-Mail Marketing
        </div>
        <Link to="/admin" className="sidebar-link">
          <Briefcase size={18} /> Müşteriler
        </Link>
        <Link to="/admin" className="sidebar-link">
          <ClipboardList size={18} /> İş Takibi
        </Link>
        <div style={{ marginTop: 'auto', padding: '10px' }}>
          <Link to="/" className="sidebar-link" style={{ color: 'var(--secondary)' }}>
            <XCircle size={18} /> Siteye Dön
          </Link>
        </div>
      </div>

      {/* Mobile Toggle */}
      <button 
        className="mobile-only" 
        onClick={() => setIsSidebarOpen(true)}
        style={{ position: 'fixed', bottom: '20px', right: '20px', background: 'var(--primary)', color: '#000', padding: '15px', borderRadius: '50%', border: 'none', zIndex: 999, display: 'none' }}
      >
        <Menu size={24} />
      </button>

      {/* Main Content */}
      <div className="main-content-area">
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' }}>
            E-Mail <span className="gradient-text">Marketing</span>
          </h1>
          <p style={{ color: '#888' }}>CSV lead yönetimi ve toplu gönderim otomasyonu.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px' }}>
          <div className="glass" style={{ padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '60px', borderRadius: '20px', textAlign: 'center', marginBottom: '30px' }}>
              <Upload size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
              <h3>CSV Dosyasını Buraya Bırakın</h3>
              <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '20px' }}>İsim ve Email sütunlarını içeren bir dosya seçin.</p>
              <input type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} id="file-up" />
              <label htmlFor="file-up" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                Dosya Seç
              </label>
            </div>

            {message && (
              <div style={{ padding: '15px', borderRadius: '12px', background: status === 'error' ? 'rgba(255,23,68,0.1)' : 'rgba(0,230,118,0.1)', color: status === 'error' ? '#ff1744' : '#00e676', marginBottom: '20px' }}>
                {message}
              </div>
            )}

            {filteredLeads.length > 0 && (
              <div style={{ maxHeight: '400px', overflow: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.03)', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left' }}>İsim</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>E-Posta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.slice(0, 50).map((l, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '12px' }}>{l.name}</td>
                        <td style={{ padding: '12px', color: 'var(--primary)' }}>{l.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass" style={{ padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0 }}>Durum</h4>
                <button onClick={fetchExisting} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Yenile
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#555' }}>Toplam:</span> <span>{stats.total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#555' }}>Sistemde Mevcut:</span> 
                <span style={{ color: '#ffab00' }}>{existingEmails.size}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', fontWeight: 'bold' }}>
                <span>Yeni (Eklenecek):</span> <span style={{ color: '#00e676' }}>{stats.unique}</span>
              </div>
            </div>

            <button onClick={handleSync} disabled={loading || filteredLeads.length === 0} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? <RefreshCw className="animate-spin" /> : <Download size={18} />}
              &nbsp; Veritabanına Kaydet
            </button>
            
            <button onClick={handleTrigger} disabled={loading || (filteredLeads.length === 0 && stats.unique === 0)} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}>
              <Zap size={18} /> &nbsp; Google Script Trigger
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1024px) {
          .mobile-only {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

export default EmailMarketing;
