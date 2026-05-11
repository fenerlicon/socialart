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
  Menu,
  X,
  SendHorizontal
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function EmailMarketing() {
  const [loading, setLoading] = useState(false);
  const [existingEmails, setExistingEmails] = useState(new Set());
  const [csvData, setCsvData] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, duplicate: 0, unique: 0, sent: 0 });
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Campaign State
  const [campaign, setCampaign] = useState({ subject: '', content: '' });
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0, isActive: false });

  const navigate = useNavigate();

  useEffect(() => {
    fetchExisting();
  }, []);

  async function fetchExisting() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('email_marketing_leads').select('email, status');
      if (error) throw error;
      const set = new Set(data.map(item => (item.email || '').toLowerCase().trim()).filter(Boolean));
      setExistingEmails(set);
      const sentCount = data ? data.filter(item => item.status === 'sent').length : 0;
      setStats(prev => ({ ...prev, sent: sentCount }));
    } catch (err) {
      console.error(err);
      setMessage(`Veritabanı bağlantı hatası!`);
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
          const lead = { email, name: row.name || row.Name || row.ad || row.AD || '', source: 'CSV Upload' };
          if (existingEmails.has(email)) dups.push(lead); else unique.push(lead);
        });
        setCsvData(results.data);
        setFilteredLeads(unique);
        setStats(prev => ({ ...prev, total: unique.length + dups.length, duplicate: dups.length, unique: unique.length }));
        setStatus('success');
        setMessage('CSV başarıyla okundu.');
        setLoading(false);
      },
      error: () => {
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
      const { error } = await supabase.from('email_marketing_leads').upsert(
        filteredLeads.map(l => ({ ...l, status: 'active' })),
        { onConflict: 'email' }
      );
      if (error) throw error;
      setMessage(`${filteredLeads.length} lead kaydedildi.`);
      setStatus('success');
      setFilteredLeads([]);
      fetchExisting();
    } catch (err) {
      setMessage(`Kayıt hatası: ${err.message}`);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaign.subject || !campaign.content) {
      setMessage('Lütfen konu ve içerik giriniz!');
      setStatus('error');
      return;
    }

    // Determine target list: Either the uploaded CSV or the unique leads
    const targets = filteredLeads.length > 0 ? filteredLeads : Array.from(existingEmails).map(email => ({ email }));
    
    if (targets.length === 0) {
      setMessage('Gönderilecek lead bulunamadı!');
      setStatus('error');
      return;
    }

    if (!window.confirm(`${targets.length} kişiye kampanya gönderilecek. Onaylıyor musunuz?`)) return;

    setLoading(true);
    setSendProgress({ current: 0, total: targets.length, isActive: true });

    let sentSuccess = 0;
    for (let i = 0; i < targets.length; i++) {
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'marketing',
            data: {
              to: targets[i].email,
              subject: campaign.subject,
              content: campaign.content
            }
          })
        });
        if (response.ok) {
          sentSuccess++;
          // Mark as sent in DB
          await supabase.from('email_marketing_leads').update({ status: 'sent' }).eq('email', targets[i].email);
        }
      } catch (err) {
        console.error(`Send error for ${targets[i].email}:`, err);
      }
      setSendProgress(prev => ({ ...prev, current: i + 1 }));
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 200));
    }

    setMessage(`Kampanya tamamlandı! ${sentSuccess}/${targets.length} başarılı.`);
    setStatus('success');
    setSendProgress({ current: 0, total: 0, isActive: false });
    setLoading(false);
    fetchExisting();
  };

  return (
    <div className="admin-page-layout" style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
      <style>{`
        .admin-page-layout { display: flex; padding: 30px; gap: 30px; }
        .admin-sidebar-nav { width: 280px; flex-shrink: 0; background: rgba(15, 15, 15, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 24px; padding: 20px; display: flex; flex-direction: column; gap: 8px; height: calc(100vh - 60px); position: sticky; top: 30px; }
        .sidebar-link { padding: 14px 18px; border-radius: 14px; font-size: 0.9rem; font-weight: 600; transition: 0.3s; display: flex; align-items: center; gap: 12px; color: rgba(255,255,255,0.6); text-decoration: none; }
        .sidebar-link:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .sidebar-link.active { background: var(--primary); color: #000; box-shadow: 0 10px 20px rgba(138, 43, 226, 0.2); }
        .main-content-area { flex-grow: 1; max-width: 1200px; }
        .glass { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 25px; }
        .marketing-grid { display: grid; grid-template-columns: 1fr 350px; gap: 30px; }
        .input-dark { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; color: #fff; margin-bottom: 15px; outline: none; }
        .input-dark:focus { border-color: var(--primary); }
        .btn-marketing { background: var(--primary); color: #000; font-weight: bold; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
        .btn-marketing:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 1024px) { .admin-page-layout { flex-direction: column; padding: 20px; } .admin-sidebar-nav { width: 100%; height: auto; position: relative; top: 0; } .marketing-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Sidebar */}
      <div className="admin-sidebar-nav">
        <div style={{ marginBottom: '30px', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '35px', height: '35px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>SA</div>
            <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>SOCIAL<span style={{ color: 'var(--primary)' }}>ART</span></span>
          </div>
        </div>
        <Link to="/admin" className="sidebar-link"><Briefcase size={18} /> Admin Panel</Link>
        <div className="sidebar-link active"><Mail size={18} /> E-Mail Marketing</div>
        <Link to="/" className="sidebar-link" style={{ marginTop: 'auto', color: 'var(--secondary)' }}><XCircle size={18} /> Çıkış Yap</Link>
      </div>

      {/* Main Content */}
      <div className="main-content-area">
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' }}>E-Mail <span className="gradient-text">Marketing</span> (Resend)</h1>
          <p style={{ color: '#888' }}>Toplu mail gönderimi ve lead yönetimi.</p>
        </header>

        <div className="marketing-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* CSV Upload */}
            <div className="glass">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}><Upload size={20} style={{ marginRight: '10px' }} /> Veri Yükle</h3>
                {stats.unique > 0 && <button onClick={handleSync} className="btn-marketing" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Veritabanına Kaydet</button>}
              </div>
              <div style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
                <input type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} id="csv-up" />
                <label htmlFor="csv-up" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <Download size={32} color="var(--primary)" />
                  <span style={{ color: '#aaa' }}>{stats.total > 0 ? `${stats.total} Lead Yüklendi` : 'CSV Dosyası Seçin'}</span>
                </label>
              </div>
            </div>

            {/* Campaign Composer */}
            <div className="glass">
              <h3 style={{ marginBottom: '20px' }}><Zap size={20} style={{ marginRight: '10px', color: 'var(--accent)' }} /> Kampanya Oluştur</h3>
              <input 
                type="text" 
                className="input-dark" 
                placeholder="E-Mail Konusu (Subject)" 
                value={campaign.subject}
                onChange={e => setCampaign({...campaign, subject: e.target.value})}
              />
              <textarea 
                className="input-dark" 
                style={{ minHeight: '200px', resize: 'vertical' }}
                placeholder="E-Mail İçeriği (HTML destekler)"
                value={campaign.content}
                onChange={e => setCampaign({...campaign, content: e.target.value})}
              ></textarea>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#555', fontSize: '0.85rem' }}>* Gönderici: tugba@socialartajans.com</div>
                <button 
                  onClick={handleSendCampaign} 
                  disabled={loading || sendProgress.isActive} 
                  className="btn-marketing"
                >
                  <SendHorizontal size={18} /> {loading ? 'Gönderiliyor...' : 'Kampanyayı Başlat'}
                </button>
              </div>

              {sendProgress.isActive && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--primary)', width: `${(sendProgress.current / sendProgress.total) * 100}%`, transition: '0.3s' }}></div>
                  </div>
                  <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.8rem', color: 'var(--primary)' }}>
                    İlerleme: {sendProgress.current} / {sendProgress.total}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass">
              <h4 style={{ margin: '0 0 20px 0' }}>İstatistikler</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Toplam Kayıtlı:</span> <span>{existingEmails.size}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Gönderilen:</span> <span style={{ color: 'var(--primary)' }}>{stats.sent}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                  <span style={{ fontWeight: 'bold' }}>Hazır:</span> <span style={{ fontWeight: 'bold', color: '#00e676' }}>{existingEmails.size - stats.sent}</span>
                </div>
              </div>
            </div>

            {message && (
              <div style={{ padding: '15px', borderRadius: '15px', background: status === 'error' ? 'rgba(255,0,85,0.1)' : 'rgba(0,230,118,0.1)', color: status === 'error' ? 'var(--secondary)' : '#00e676', fontSize: '0.85rem' }}>
                {status === 'error' ? <AlertCircle size={16} style={{ marginRight: '8px' }} /> : <CheckCircle2 size={16} style={{ marginRight: '8px' }} />}
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailMarketing;
