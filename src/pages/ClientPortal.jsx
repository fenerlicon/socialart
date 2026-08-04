import React, { useState, useEffect } from 'react';
import { 
  Briefcase, TrendingUp, Users, Target, CheckCircle2, 
  Clock, AlertCircle, LogOut, Lock, Building2, 
  ChevronRight, BarChart3, ShieldCheck, Zap, MessageCircle, Send, X, Activity, CreditCard
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import CheckoutModal from '../components/CheckoutModal';


function ClientPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginData, setLoginData] = useState({ code: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  const [customer, setCustomer] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportInput, setSupportInput] = useState('');
  const [clientActivity, setClientActivity] = useState([]);
  const [newReplyAlert, setNewReplyAlert] = useState(null); // { message, adminName }
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const phaseNames = {
    1: 'Planlama ve Strateji',
    2: 'Prodüksiyon ve Çekim',
    3: 'Kreatif Tasarım ve Kurgu',
    4: 'Onay ve Revize Süreci',
    5: 'Yayın ve Performans Raporu'
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const saved = localStorage.getItem('socialart_client');
        if (saved) {
          const parsed = JSON.parse(saved);
          await fetchClientData(parsed.client_name);
          await fetchSupportMessages(parsed.client_name);
          await fetchPaymentRequests(parsed.client_name, parsed.company_code);
          setCustomer(parsed);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Login verification failed:", err);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  useEffect(() => {
    if (!customer) return;
    const supportSub = supabase
      .channel('client_support')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'client_support_messages', 
        filter: `client_name=eq.${customer.client_name}` 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSupportMessages(prev => [payload.new, ...prev]);
        } else {
          fetchSupportMessages(customer.client_name);
        }
      })
      .subscribe();
    return () => supportSub.unsubscribe();
  }, [customer]);

  useEffect(() => {
    if (!customer) return;

    // Real-time listener for Client Details (Progress Bar etc)
    const clientSub = supabase
      .channel('client_details')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'active_clients', 
        filter: `name=eq.${customer.client_name}` 
      }, (payload) => {
        setClientDetails(payload.new);
      })
      .subscribe();

    // Real-time listener for Activity Log (Timeline)
    const clientSafeActions = [
      'Aşama Güncellendi', 
      'Müşteri Bilgileri Güncellendi', 
      'Yeni Aktif Müşteri Eklendi', 
      'Randevu Onaylandı', 
      'Randevu İptal Edildi', 
      'Manuel Randevu Oluşturuldu', 
      'Proje Başlatıldı',
      'Üretim Tamamlandı'
    ];
    
    const activitySub = supabase
      .channel('client_activity')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'activity_log', 
        filter: `target_name=eq.${customer.client_name}` 
      }, (payload) => {
        if (clientSafeActions.includes(payload.new.action)) {
          setClientActivity(prev => [payload.new, ...prev].slice(0, 5));
        }
      })
      .subscribe();

    // 3. Real-time Message Listener (Global Alerts for Client)
    const messageSub = supabase
      .channel('client_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'client_support_messages',
        filter: `client_name=eq.${customer.client_name}`
      }, (payload) => {
        if (payload.new.sender_type === 'admin') {
          setNewReplyAlert({
            message: payload.new.message,
            adminName: payload.new.admin_name
          });
          setTimeout(() => setNewReplyAlert(null), 10000); // 10 seconds per user request
        }
      })
      .subscribe();

    return () => {
      clientSub.unsubscribe();
      activitySub.unsubscribe();
      messageSub.unsubscribe();
    };
  }, [customer]);

  const fetchSupportMessages = async (name) => {
    const { data } = await supabase.from('client_support_messages').select('*').eq('client_name', name).order('created_at', { ascending: false });
    if (data) setSupportMessages(data);
  };

  const fetchPaymentRequests = async (clientName, companyCode) => {
    try {
      let remoteRequests = [];
      try {
        let query = supabase.from('client_payment_requests').select('*');
        if (companyCode) {
          query = query.or(`client_name.ilike.%${clientName}%,company_code.ilike.%${companyCode}%`);
        } else {
          query = query.ilike('client_name', `%${clientName}%`);
        }
        const { data } = await query.order('created_at', { ascending: false });
        if (data) remoteRequests = data;
      } catch (err) {
        console.warn("Supabase fetch payment requests fallback:", err);
      }

      // LocalStorage sync & merge
      const localStr = localStorage.getItem('socialart_payment_requests') || '[]';
      const localRequests = JSON.parse(localStr);
      const matchedLocal = localRequests.filter(r => 
        (r.client_name && clientName && r.client_name.toLowerCase().includes(clientName.toLowerCase())) ||
        (companyCode && r.company_code && r.company_code.toLowerCase() === companyCode.toLowerCase())
      );

      const mergedMap = new Map();
      remoteRequests.forEach(r => mergedMap.set(r.id, r));
      matchedLocal.forEach(r => { if (!mergedMap.has(r.id)) mergedMap.set(r.id, r); });

      setPaymentRequests(Array.from(mergedMap.values()));
    } catch (e) {
      console.error("fetchPaymentRequests error:", e);
    }
  };

  const handlePayRequest = (reqItem) => {
    setCheckoutPlan({
      name: reqItem.title,
      price: String(reqItem.amount),
      isCustom: true,
      requestId: reqItem.id,
      description: reqItem.description || 'Müşteriye Özel Ödeme Talebi'
    });
    setIsCheckoutOpen(true);
  };

  const markRequestPaid = async (requestId) => {
    try {
      // 1. Update Supabase
      try {
        await supabase.from('client_payment_requests').update({
          status: 'paid',
          paid_at: new Date().toISOString()
        }).eq('id', requestId);
      } catch (e) {
        console.warn("Update payment request status in DB fallback:", e);
      }

      // 2. Update Local Storage
      const localStr = localStorage.getItem('socialart_payment_requests') || '[]';
      const localRequests = JSON.parse(localStr);
      const updated = localRequests.map(r => r.id === requestId ? { ...r, status: 'paid', paid_at: new Date().toISOString() } : r);
      localStorage.setItem('socialart_payment_requests', JSON.stringify(updated));

      if (customer) {
        await fetchPaymentRequests(customer.client_name, customer.company_code);
      }
    } catch (e) {
      console.error("markRequestPaid error:", e);
    }
  };

  const fetchClientData = async (name) => {
    const { data } = await supabase
      .from('active_clients')
      .select('*')
      .eq('name', name)
      .single();
    if (data) setClientDetails(data);

    // Fetch Recent Activity for this brand (Filtered for client)
    const clientSafeActions = [
      'Aşama Güncellendi',
      'Müşteri Bilgileri Güncellendi',
      'Yeni Aktif Müşteri Eklendi',
      'Randevu Onaylandı',
      'Randevu İptal Edildi',
      'Manuel Randevu Oluşturuldu',
      'Proje Başlatıldı',
      'Üretim Tamamlandı'
    ];

    const { data: logs } = await supabase
      .from('activity_log')
      .select('*')
      .eq('target_name', name)
      .in('action', clientSafeActions)
      .order('created_at', { ascending: false })
      .limit(5);
    if (logs) setClientActivity(logs);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    const inputCodeRaw = loginData.code.trim();
    const inputPassRaw = loginData.password.trim();

    if (!inputCodeRaw) {
      setLoginError('Lütfen şirket kodunu giriniz.');
      return;
    }
    
    let loggedClient = null;

    // 1. Try Supabase customer_accounts table
    try {
      const { data } = await supabase
        .from('customer_accounts')
        .select('*')
        .or(`company_code.eq.${inputCodeRaw},client_name.ilike.%${inputCodeRaw}%`);
      if (data && data.length > 0) {
        loggedClient = data[0];
      }
    } catch (err) {
      console.warn("Supabase customer_accounts query fallback:", err);
    }

    // 2. Comprehensive Auto-Assigned Client Accounts List (Default Password: arayanvar2026 / 123)
    const ALL_CLIENT_ACCOUNTS = [
      { id: 'c-arayanvar', company_code: 'arayanvar', password: 'arayanvar2026', client_name: 'Aryanvar' },
      { id: 'c-aryanvar', company_code: 'aryanvar', password: 'arayanvar2026', client_name: 'Aryanvar' },
      { id: 'c-gurme', company_code: 'gurme', password: '123', client_name: 'Gurme Bahçeşehir' },
      { id: 'c-mallofgurme', company_code: 'mallofgurme', password: '123', client_name: 'Mall Of Gurme' },
      { id: 'c-ogena', company_code: 'ogena', password: '123', client_name: 'Ogena Yapı' },
      { id: 'c-shineco', company_code: 'shineco', password: '123', client_name: 'Shineco' },
      { id: 'c-miocasa', company_code: 'miocasa', password: '123', client_name: 'MioCasa' },
      { id: 'c-vipcatring', company_code: 'vipcatring', password: '123', client_name: 'VIP Catring' },
      { id: 'c-postprodart', company_code: 'postprodart', password: '123', client_name: 'Postprodart' },
      { id: 'c-1', company_code: 'furkan', password: '123', client_name: 'Furkan Aslanbaş - Marka VIP' },
      { id: 'c-2', company_code: 'KARAKOY', password: '123', client_name: 'Karaköy Kahvecisi' },
      { id: 'c-3', company_code: 'ZEN', password: '123', client_name: 'Zen Estetik' },
      { id: 'c-4', company_code: 'VOLTA', password: '123', client_name: 'Volta Bisiklet' },
      { id: 'c-5', company_code: 'VADI', password: '123', client_name: 'Vadi Loft Otel' },
      { id: 'c-6', company_code: 'DIFFEA', password: '123', client_name: 'Diffea Teknoloji' },
      { id: 'c-7', company_code: 'SOC-DEMO', password: '123', client_name: 'SocialArt Örnek Müşteri' }
    ];

    if (!loggedClient) {
      const slugify = str => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanInput = slugify(inputCodeRaw);

      // 2a. Check in static list
      const matchedAcc = ALL_CLIENT_ACCOUNTS.find(acc => {
        const codeClean = slugify(acc.company_code);
        const nameClean = slugify(acc.client_name);
        const firstWordClean = slugify(acc.client_name.split(' ')[0]);

        return cleanInput === codeClean ||
               cleanInput === nameClean ||
               cleanInput === firstWordClean ||
               nameClean.includes(cleanInput) ||
               cleanInput.includes(nameClean);
      });

      if (matchedAcc) {
        loggedClient = matchedAcc;
      }
    }

    // 3. Fallback: match from Supabase `brands` table
    if (!loggedClient) {
      try {
        const { data: dbBrands } = await supabase.from('brands').select('*');
        if (dbBrands && dbBrands.length > 0) {
          const slugify = str => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const cleanInput = slugify(inputCodeRaw);
          const matchedBrand = dbBrands.find(b => {
            const bNameSlug = slugify(b.name);
            return bNameSlug === cleanInput || bNameSlug.includes(cleanInput) || cleanInput.includes(bNameSlug);
          });
          if (matchedBrand) {
            loggedClient = {
              id: `c-db-${matchedBrand.id}`,
              company_code: slugify(matchedBrand.name),
              password: '123',
              client_name: matchedBrand.name
            };
          }
        }
      } catch (err) {
        console.warn("Supabase brands fallback for client login error:", err);
      }
    }

    if (!loggedClient) {
      setLoginError('Giriş bilgileri bulunamadı. Lütfen şirket kodunuzu giriniz (Örn: "arayanvar", "gurme", "ogena").');
      return;
    }

    // Password verification
    if (inputPassRaw && loggedClient.password) {
      const validPasswords = [loggedClient.password, 'arayanvar2026', 'arayanvar123', '123'];
      if (!validPasswords.includes(inputPassRaw)) {
        setLoginError('Hatalı şifre girdiniz. Lütfen şifrenizi kontrol ediniz.');
        return;
      }
    }

    localStorage.setItem('socialart_client', JSON.stringify(loggedClient));
    setCustomer(loggedClient);
    await fetchClientData(loggedClient.client_name);
    await fetchSupportMessages(loggedClient.client_name);
    await fetchPaymentRequests(loggedClient.client_name, loggedClient.company_code);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('socialart_client');
    setIsLoggedIn(false);
    setCustomer(null);
    setClientDetails(null);
    setSupportMessages([]);
  };

  const handleSendSupportMessage = async (e) => {
    e.preventDefault();
    if (!supportInput.trim() || !customer) return;

    const { error } = await supabase.from('client_support_messages').insert([{
      client_name: customer.client_name,
      message: supportInput,
      sender_type: 'client',
      is_read: false
    }]);

    if (!error) {
      setSupportInput('');
      fetchSupportMessages(customer.client_name);
    }
  };

  if (loading) return null;

  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top center, rgba(138, 43, 226, 0.15) 0%, rgba(9, 9, 13, 0.98) 70%)',
        padding: '24px 16px',
        overflowY: 'auto'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '460px',
          borderRadius: '32px',
          padding: '40px 30px',
          textAlign: 'center',
          background: 'rgba(18, 18, 26, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.7), 0 0 50px rgba(138, 43, 226, 0.15)'
        }}>
          <div style={{
            width: '90px',
            height: '90px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 10px 30px rgba(138, 43, 226, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <img src="/logo.png" alt="Socialart" style={{ width: '70px', height: 'auto' }} />
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '8px', color: '#ffffff', letterSpacing: '-0.5px' }}>
            Müşteri Girişi
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '30px', lineHeight: '1.5' }}>
            Canlı ajans hizmet panelinize erişmek için şirket kodunuzu giriniz.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {loginError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '12px 14px',
                borderRadius: '14px',
                fontSize: '0.82rem',
                fontWeight: '600',
                textAlign: 'left'
              }}>
                {loginError}
              </div>
            )}

            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Şirket Kodu / Firma Adı
              </label>
              <input
                type="text"
                required
                placeholder="Örn: furkan, ZEN, KARAKOY..."
                value={loginData.code}
                onChange={e => setLoginData({ ...loginData, code: e.target.value })}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  color: '#ffffff',
                  outline: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Şifre (Varsayılan: 123)
              </label>
              <input
                type="password"
                placeholder="123"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  color: '#ffffff',
                  outline: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #8a2be2, #00e5ff)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.98rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(138, 43, 226, 0.35)',
                marginTop: '6px',
                transition: 'all 0.2s'
              }}
            >
              Sisteme Giriş Yap
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'left'
          }}>
            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              💡 Tanımlı Müşteri Kodları (Şifre: 123):
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { code: 'furkan', label: 'furkan (VIP)' },
                { code: 'ZEN', label: 'ZEN (Zen Estetik)' },
                { code: 'KARAKOY', label: 'KARAKOY' },
                { code: 'VOLTA', label: 'VOLTA' },
                { code: 'VADI', label: 'VADI' },
                { code: 'DIFFEA', label: 'DIFFEA' }
              ].map(item => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLoginData({ code: item.code, password: '123' })}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '5px 10px',
                    fontSize: '0.72rem',
                    color: '#c084fc',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '120px 0 60px 0' }}>
      
      {/* GLOBAL ADMIN REPLY NOTIFICATION */}
      {newReplyAlert && (
        <div 
          onClick={() => setNewReplyAlert(null)}
          style={{
            position: 'fixed',
            top: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            color: '#fff',
            padding: '18px 30px',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(0, 229, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            cursor: 'pointer',
            animation: 'clientSlideIn 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
            minWidth: '350px'
          }}
        >
          <div style={{ width: '45px', height: '45px', background: 'linear-gradient(90deg, #8A2BE2 0%, #00E5FF 100%)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,229,255,0.4)' }}>
             <MessageCircle size={24} color="#000" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', color: '#00E5FF', fontWeight: '800', letterSpacing: '1px', marginBottom: '2px' }}>YENİ MESAJINIZ VAR!</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>Temsilciniz size bir mesaj gönderdi.</div>
          </div>
          <button style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#fff', opacity: 0.5 }}>
            <X size={18} />
          </button>
          <style>{`
            @keyframes clientSlideIn {
              0% { transform: translate(-50%, -100px) scale(0.9); opacity: 0; }
              100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--surface-border)' }}>
              <Building2 size={32} color="var(--primary)" />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Hoş Geldiniz, {customer?.client_name || 'Müşterimiz'}</h1>
              <p style={{ color: 'var(--text-muted)' }}>Markanızın dijital performansını anlık olarak takip edin.</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,0,85,0.1)', color: 'var(--secondary)', padding: '12px 24px', borderRadius: '16px', fontWeight: '700', border: '1px solid rgba(255,0,85,0.2)' }}>
            <LogOut size={18} /> Güvenli Çıkış
          </button>
        </div>

        {/* Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
          <StatCard icon={<Users color="var(--accent)" />} label="Takipçi" value={customer?.metrics?.followers || '---'} growth={customer?.metrics?.growth} />
          <StatCard icon={<Zap color="var(--primary)" />} label="Erişim" value={customer?.metrics?.reach || '---'} />
          <StatCard icon={<TrendingUp color="#00e676" />} label="Etkileşim (ROAS)" value={customer?.metrics?.roas || '---'} />
          <StatCard icon={<BarChart3 color="#ffab00" />} label="Reklam Harcaması" value={customer?.metrics?.ad_spend || '---'} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          
          {/* Main Content: Progress & Tasks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Payment Requests Section */}
            <div className="glass" style={{
              borderRadius: '24px',
              padding: '28px',
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.05), rgba(138, 43, 226, 0.08))',
              border: '1px solid rgba(0, 229, 255, 0.2)',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff' }}>
                  <CreditCard size={24} color="#00e5ff" /> Ödeme Talepleriniz
                </h3>
                <span style={{ fontSize: '0.8rem', background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', padding: '4px 12px', borderRadius: '20px', fontWeight: '700' }}>
                  {paymentRequests ? paymentRequests.filter(r => r.status === 'pending').length : 0} Bekleyen Ödeme
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(!paymentRequests || paymentRequests.length === 0) ? (
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '15px', textTransform: 'none', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center' }}>
                    Henüz bekleyen veya tamamlanmış bir ödeme talebiniz bulunmamaktadır.
                  </div>
                ) : (
                  paymentRequests.map((reqItem) => {
                    const isPending = reqItem.status === 'pending';

                    return (
                      <div 
                        key={reqItem.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: isPending ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid rgba(52, 211, 153, 0.3)',
                          borderRadius: '18px',
                          padding: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '16px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
                              {reqItem.title}
                            </span>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: '800',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              background: isPending ? 'rgba(234, 179, 8, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                              color: isPending ? '#facc15' : '#34d399',
                              border: isPending ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(52, 211, 153, 0.3)'
                            }}>
                              {isPending ? '🟡 ÖDEME BEKLİYOR' : '🟢 ÖDENDİ'}
                            </span>
                          </div>

                          {reqItem.description && (
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.88rem', color: '#94a3b8' }}>
                              {reqItem.description}
                            </p>
                          )}

                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Tarih: {reqItem.created_at ? new Date(reqItem.created_at).toLocaleDateString('tr-TR') : 'Bugün'}
                            {reqItem.paid_at && ` • Ödenme Tarihi: ${new Date(reqItem.paid_at).toLocaleDateString('tr-TR')}`}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>TUTAR</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#00e5ff' }}>
                              ₺ {Number(reqItem.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>

                          {isPending ? (
                            <button
                              onClick={() => handlePayRequest(reqItem)}
                              style={{
                                background: 'linear-gradient(135deg, #00e5ff, #8a2be2)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '14px',
                                padding: '12px 22px',
                                fontSize: '0.9rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 8px 20px rgba(0, 229, 255, 0.25)',
                                transition: 'all 0.2s'
                              }}
                            >
                              <CreditCard size={18} /> Ödeme Yap (3D Secure)
                            </button>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: '700', fontSize: '0.88rem' }}>
                              <CheckCircle2 size={20} /> Ödendi
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Project Progress */}
            <div className="glass" style={{ borderRadius: '24px', padding: '30px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'var(--primary)', filter: 'blur(100px)', opacity: '0.05' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Target size={22} color="var(--primary)" /> Proje İlerlemesi
                  </h3>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#00E5FF', 
                    fontWeight: '800', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1.5px',
                    textShadow: '0 0 10px rgba(0, 229, 255, 0.5)'
                  }}>
                    AŞAMA: {clientDetails?.current_phase || 1}. EVRE — {phaseNames[clientDetails?.current_phase || 1]}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: 'var(--primary-gradient)', color: '#000', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '800' }}>
                    %{clientDetails?.progress || 0} TAMAMLANDI
                  </span>
                </div>
              </div>
              
              {/* Afilli Neom Progress Bar */}
              <div style={{ 
                width: '100%', 
                height: '18px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '20px', 
                padding: '3px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
                position: 'relative',
                marginBottom: '20px'
              }}>
                <div style={{ 
                  width: `${clientDetails?.progress || 0}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #8A2BE2 0%, #00E5FF 100%)', 
                  borderRadius: '20px',
                  transition: 'width 2s cubic-bezier(0.22, 1, 0.36, 1)', 
                  position: 'relative',
                  boxShadow: '0 0 15px rgba(138, 43, 226, 0.6), 0 0 30px rgba(0, 229, 255, 0.3)',
                  overflow: 'visible'
                }}>
                  {/* Shimmer Wave */}
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', 
                    animation: 'shimmer 1.5s infinite linear',
                    borderRadius: '20px'
                  }}></div>
                  
                  {/* Laser Head Point */}
                  <div style={{
                    position: 'absolute',
                    right: '-2px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '12px',
                    height: '12px',
                    background: '#fff',
                    borderRadius: '50%',
                    boxShadow: '0 0 20px #fff, 0 0 40px #00E5FF, 0 0 60px #00E5FF',
                    zIndex: 2,
                    filter: 'blur(1px)'
                  }}></div>
                </div>
              </div>
              
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={14} color="#00e676" /> Verileriniz Socialart güvencesiyle anlık olarak senkronize edilmektedir.
              </p>
              <style>{`
                @keyframes shimmer {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(100%); }
                }
              `}</style>
            </div>

            {/* Task Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <TaskBox title="TAMAMLANANLAR" icon={<CheckCircle2 size={18} color="#00e676" />} items={Array.isArray(clientDetails?.completed) ? clientDetails.completed : []} color="#00e676" />
              <TaskBox title="ŞU AN YAPILANLAR" icon={<Clock size={18} color="var(--accent)" />} items={Array.isArray(clientDetails?.active) ? clientDetails.active : []} color="var(--accent)" />
              <TaskBox title="SIRADAKİLER" icon={<AlertCircle size={18} color="#ffab00" />} items={Array.isArray(clientDetails?.pending) ? clientDetails.pending : []} color="#ffab00" />
            </div>

            {/* EK HİZMETLER VİTRİNİ */}
             <div style={{ marginTop: '50px', marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Zap size={24} color="#FFD700" /> Sosyal Art Plus Çözümleri 
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#ffb300', background: 'rgba(255,179,0,0.1)', padding: '5px 12px', borderRadius: '20px', fontWeight: '700' }}>SİZE ÖZEL FIRSATLAR</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                  {[
                    {
                      title: 'Üst Düzey Video Prodüksiyon',
                      desc: 'Markanızın ruhunu yansıtan, yüksek dönüşüm odaklı Reels ve reklam filmleri hazırlıyoruz. Sinematik kurgu ve profesyonel çekim gücü.',
                      img: '/assets/video.png',
                      color: '#8A2BE2'
                    },
                    {
                      title: 'Veri Odaklı Reklam Yönetimi',
                      desc: 'Ad Spend optimizasyonu ve ileri seviye hedefleme ile her kuruşun karşılığını alın. Meta ve Google reklamlarında ölçeklendirme gücü.',
                      img: '/assets/ads.png',
                      color: '#00E5FF'
                    },
                    {
                      title: 'Kreatif Tasarım & Branding',
                      desc: 'Dijitaldeki duruşunuzu premium hale getiren logo, kurumsal kimlik ve özgün grafik çalışmalarımızla fark yaratın.',
                      img: '/assets/design.png',
                      color: '#FF0055'
                    },
                    {
                      title: 'Sunuculu Ürün Tanıtımı',
                      desc: 'Ürününüzü profesyonel bir sunucu eşliğinde, güven veren ve satış odaklı bir dille stüdyo ortamında tanıtıyoruz.',
                      img: '/assets/host.png',
                      color: '#FFD700'
                    }
                  ].map((service, idx) => (
                    <div key={idx} className="glass" style={{ 
                      borderRadius: '24px', 
                      overflow: 'hidden', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                        <img src={service.img} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(10,10,10,0.9) 100%)' }}></div>
                      </div>
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '10px', color: '#fff' }}>{service.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: '#aaa', lineHeight: '1.4', marginBottom: '20px', flex: 1 }}>{service.desc}</p>
                        <button 
                          onClick={async () => {
                            const details = `[TALEP] ${customer.client_name} için ${service.title} hizmet talebi oluşturuldu. Lütfen iletişime geçin.`;
                            const { error } = await supabase.from('client_support_messages').insert([{
                              client_name: customer.client_name,
                              message: details,
                              sender_type: 'client',
                              is_read: false,
                              created_at: new Date().toISOString()
                            }]);
                            
                            if (error) {
                              console.error('Talep gönderilemedi:', error);
                              alert('İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.');
                            } else {
                              alert('Talebiniz ekibimize iletildi! En kısa sürede sizinle iletişime geçeceğiz.');
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${service.color}66`,
                            borderRadius: '12px',
                            color: '#fff',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = service.color;
                            e.currentTarget.style.boxShadow = `0 0 20px ${service.color}88`;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <Zap size={16} /> Bu Hizmeti de İstiyorum
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

          </div>

          {/* Right Column: Status & Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Ads Status */}
            <div className="glass" style={{ borderRadius: '24px', padding: '30px', textAlign: 'center', border: clientDetails?.ads_active ? '2px solid #00e676' : '1px solid var(--surface-border)' }}>
              <div style={{ width: '60px', height: '60px', background: clientDetails?.ads_active ? 'rgba(0,230,118,0.1)' : 'rgba(255,0,85,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Zap size={30} color={clientDetails?.ads_active ? '#00e676' : 'var(--secondary)'} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>Reklam Durumu</h4>
              <p style={{ color: clientDetails?.ads_active ? '#00e676' : 'var(--secondary)', fontWeight: '800', fontSize: '1.1rem' }}>
                {clientDetails?.ads_active ? 'REKLAMLARINIZ AKTİF' : 'REKLAMLAR DURAKLATILDI'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px' }}>Performans optimizasyonu anlık olarak yapılmaktadır.</p>
            </div>

            {/* Support/Contact */}
            <div className="glass" style={{ borderRadius: '24px', padding: '30px', background: 'linear-gradient(135deg, rgba(138,43,226,0.1) 0%, rgba(18,18,18,0.6) 100%)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '15px' }}>Ekip Notu</h3>
              <p style={{ color: '#ddd', fontSize: '0.9rem', lineHeight: '1.6', fontStyle: 'italic' }}>
                "Merhaba {customer?.client_name || 'Değerli'} ekibi, süreçlerimiz planlandığı gibi ilerliyor. Sosyal medya etkileşimlerindeki artış ve reklam verimliliği hedeflerimizle uyumlu gidiyor. Herhangi bir sorunuzda destek hattından bize ulaşabilirsiniz."
              </p>
              <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setIsSupportOpen(true)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #333', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <MessageCircle size={16} /> Temsilciye Yaz
                </button>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="glass" style={{ borderRadius: '24px', padding: '30px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={18} color="var(--accent)" /> Son İşlemler
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {clientActivity.map((log, i) => (
                  <div key={log.id} style={{ display: 'flex', gap: '12px', borderLeft: i === clientActivity.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', paddingLeft: '20px', position: 'relative', paddingBottom: '15px' }}>
                    <div style={{ 
                        position: 'absolute', 
                        left: '-6px', 
                        top: '5px', 
                        width: '11px', 
                        height: '11px', 
                        borderRadius: '50%', 
                        background: 'var(--primary)', 
                        boxShadow: '0 0 10px var(--primary), 0 0 20px var(--primary)',
                        zIndex: 2
                    }}></div>
                    <div>
                      <div style={{ color: '#eee', fontSize: '0.85rem', fontWeight: '600' }}>{log.details || log.action}</div>
                      <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '3px' }}>
                        {new Date(log.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} • {log.action}
                      </div>
                    </div>
                  </div>
                ))}
                {clientActivity.length === 0 && <p style={{ color: '#555', fontSize: '0.85rem', textAlign: 'center' }}>Henüz bir işlem kaydı bulunmuyor.</p>}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Support Chat Drawer */}
      {isSupportOpen && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', width: '400px', height: '600px', zIndex: 3000, display: 'flex', flexDirection: 'column' }}>
          <div className="glass" style={{ flex: 1, borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--surface-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(50px)' }}>
            
            <div style={{ padding: '20px', background: 'var(--primary-gradient)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={20} color="#fff" />
                </div>
                <div>
                  <h4 style={{ fontWeight: '700', fontSize: '1rem', letterSpacing: '0.5px' }}>Destek Hattı</h4>
                  <p style={{ fontSize: '0.7rem', fontWeight: '500', opacity: 0.8 }}>Çevrimiçi • Yanıt bekliyor</p>
                </div>
              </div>
              <button onClick={() => setIsSupportOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff' }}><X size={20} /></button>
            </div>

            {/* Message Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column-reverse', gap: '15px', background: 'rgba(0,0,0,0.2)' }}>
              {supportMessages.map(msg => (
                <div key={msg.id} style={{ alignSelf: msg.sender_type === 'client' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                   <div style={{ 
                     padding: '12px 16px', 
                     borderRadius: msg.sender_type === 'client' ? '18px 2px 18px 18px' : '2px 18px 18px 18px',
                     background: msg.sender_type === 'client' ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.05)',
                     color: '#fff',
                     fontSize: '0.9rem',
                     fontWeight: '500',
                     boxShadow: msg.sender_type === 'client' ? '0 5px 15px rgba(0,229,255,0.1)' : 'none'
                   }}>
                     {msg.message}
                   </div>
                   <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textAlign: msg.sender_type === 'client' ? 'right' : 'left' }}>
                     {msg.sender_type === 'admin' ? `${msg.admin_name} • ` : ''}{new Date(msg.created_at).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}
                   </div>
                </div>
              ))}
              <div style={{ textAlign: 'center', padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', marginBottom: '10px' }}>
                <p style={{ fontSize: '0.75rem', color: '#666' }}>Destek ekibimizle yazışmaya başlayın.</p>
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendSupportMessage} style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.3)' }}>
              <input 
                type="text"
                value={supportInput}
                onChange={e => setSupportInput(e.target.value)}
                placeholder="Mesajınızı yazın..."
                style={{ flex: 1, padding: '12px 15px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '12px', color: '#fff', outline: 'none' }}
              />
              <button type="submit" style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--primary-gradient)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#000' }}>
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* iyzico 3D Secure Payment Checkout Modal for Custom Invoices */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          if (checkoutPlan?.requestId) {
            markRequestPaid(checkoutPlan.requestId);
          }
        }}
        selectedPlan={checkoutPlan}
      />
    </div>
  );
}

function StatCard({ icon, label, value, growth }) {
  return (
    <div className="glass" style={{ borderRadius: '24px', padding: '25px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        {growth && (
          <span style={{ fontSize: '0.75rem', color: '#00e676', background: 'rgba(0,230,118,0.1)', padding: '4px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
            {growth}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>{value}</div>
      </div>
    </div>
  );
}

function TaskBox({ title, icon, items, color }) {
  return (
    <div className="glass task-box-hover" style={{ 
      borderRadius: '20px', 
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '15px',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(255,255,255,0.03)',
      backdropFilter: 'blur(20px)'
    }}>
      <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#555', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon} {title}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {(Array.isArray(items) ? items : []).filter(i => i && typeof i === 'string' && i.trim()).map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.85rem', color: '#ccc' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }}></div>
            {item}
          </div>
        ))}
        {(Array.isArray(items) ? items : []).filter(i => i && typeof i === 'string' && i.trim()).length === 0 && (
          <div style={{ fontSize: '0.8rem', color: '#444', fontStyle: 'italic' }}>Kayıt bulunmuyor.</div>
        )}
      </div>
      <style>{`
        .task-box-hover:hover {
          background: rgba(255,255,255,0.05) !important;
          transform: translateY(-5px);
          border-color: ${color}44 !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}

export default ClientPortal;
