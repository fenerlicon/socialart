import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  MessageCircle, 
  X, 
  ArrowRight,
  Sparkles,
  Zap,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import CheckoutModal from '../components/CheckoutModal';
import PortalHeader from '../components/portal/PortalHeader';
import TabOverviewAds from '../components/portal/TabOverviewAds';
import TabProductionStudio from '../components/portal/TabProductionStudio';
import TabAssetsArchive from '../components/portal/TabAssetsArchive';
import TabBillingSupport from '../components/portal/TabBillingSupport';
import PortalFloatingAI from '../components/portal/PortalFloatingAI';

function ClientPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginData, setLoginData] = useState({ code: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  const [customer, setCustomer] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('billing_support'); // Default to billing_support for live customer safety

  const [supportMessages, setSupportMessages] = useState([]);
  const [supportInput, setSupportInput] = useState('');
  const [clientActivity, setClientActivity] = useState([]);
  const [newReplyAlert, setNewReplyAlert] = useState(null);

  const [paymentRequests, setPaymentRequests] = useState([]);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Meta Ads live spend metrics
  const [selectedDatePreset, setSelectedDatePreset] = useState('last_30d');
  const [metaSpend, setMetaSpend] = useState({
    todaySpend: 0,
    spend: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    cpc: 0,
    cpm: 0,
    liveAds: [],
    activeAdsCount: 0,
    datePreset: 'last_30d'
  });

  // Fetch Meta Spend from serverless backend
  const fetchMetaSpend = useCallback(async (code, preset = 'last_30d') => {
    try {
      const compCode = code || customer?.company_code || customer?.brand || customer?.client_name || 'mallofgurme';
      setSelectedDatePreset(preset);
      const res = await fetch(`/api/meta-insights?company_code=${compCode}&date_preset=${preset}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setMetaSpend({
            todaySpend: json.data.todaySpend || 0,
            spend: json.data.spend || 0,
            impressions: json.data.impressions || 0,
            reach: json.data.reach || 0,
            clicks: json.data.clicks || 0,
            cpc: json.data.cpc || 0,
            cpm: json.data.cpm || 0,
            liveAds: json.data.liveAds || [],
            activeAdsCount: json.data.activeAdsCount || 0,
            datePreset: preset
          });
        }
      }
    } catch (e) {
      console.warn('Portal meta insights fetch fallback:', e);
    }
  }, [customer?.company_code, customer?.brand, customer?.client_name]);

  const fetchClientData = async (name) => {
    try {
      const { data } = await supabase.from('active_clients').select('*').eq('name', name).single();
      if (data) setClientDetails(data);
    } catch (err) {
      console.warn("Client data fetch error:", err);
    }
  };

  const fetchSupportMessages = async (name) => {
    try {
      const { data } = await supabase
        .from('client_support_messages')
        .select('*')
        .eq('client_name', name)
        .order('created_at', { ascending: true });
      if (data) setSupportMessages(data);
    } catch (err) {
      console.warn("Support messages fetch error:", err);
    }
  };

  const fetchPaymentRequests = async (clientName, companyCode) => {
    try {
      const { data: dbRequests, error } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbRequests) {
        const slugify = str => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetName = slugify(clientName);
        const targetCode = slugify(companyCode);

        const filtered = dbRequests.filter(r => {
          const reqName = slugify(r.client_name);
          const reqCode = slugify(r.company_code);
          return (
            (targetCode && reqCode && reqCode === targetCode) ||
            (targetName && reqName && (reqName === targetName || reqName.includes(targetName) || targetName.includes(reqName)))
          );
        });

        setPaymentRequests(filtered);
      } else {
        setPaymentRequests([]);
      }
    } catch (e) {
      console.warn('Payment requests fetch error:', e);
      setPaymentRequests([]);
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const brandParam = params?.get('brand') || params?.get('code');
        const tabParam = params?.get('tab');

        if (brandParam) {
          setLoginData(prev => ({ ...prev, code: brandParam }));
        }

        let targetAccount = null;
        const saved = localStorage.getItem('socialart_client');
        if (saved) {
          try {
            targetAccount = JSON.parse(saved);
          } catch (e) {}
        }

        if (targetAccount && targetAccount.company_code) {
          const clientName = targetAccount.client_name || targetAccount.name || targetAccount.company || targetAccount.company_code || 'Müşteri';
          const companyCode = targetAccount.company_code || targetAccount.code || clientName;
          const fullParsed = { ...targetAccount, client_name: clientName, company_code: companyCode };

          if (tabParam) {
            setActiveTab(tabParam);
          } else if (targetAccount.defaultTab) {
            setActiveTab(targetAccount.defaultTab);
          }
          
          await fetchClientData(clientName);
          await fetchSupportMessages(clientName);
          await fetchPaymentRequests(clientName, companyCode);
          await fetchMetaSpend(companyCode);
          setCustomer(fullParsed);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Login verification failed:", err);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, [fetchMetaSpend]);

  // Real-time Supabase Listeners
  useEffect(() => {
    if (!customer) return;

    const supportSub = supabase
      .channel('client_support_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'client_support_messages', 
        filter: `client_name=eq.${customer.client_name}` 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSupportMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          if (payload.new.sender_type === 'admin') {
            setNewReplyAlert({
              message: payload.new.message,
              adminName: payload.new.admin_name || 'SocialArt Temsilcisi'
            });
            setTimeout(() => setNewReplyAlert(null), 6000);
          }
        } else {
          fetchSupportMessages(customer.client_name);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(supportSub);
    };
  }, [customer]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    const inputCodeRaw = String(loginData.code || '').trim();
    const inputPassRaw = String(loginData.password || '').trim();

    if (!inputCodeRaw || !inputPassRaw) {
      setLoginError('Lütfen şirket kodunuzu ve erişim şifrenizi giriniz.');
      return;
    }

    let loggedClient = null;

    try {
      const res = await fetch('/api/client-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCodeRaw, password: inputPassRaw })
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.customer) {
        setLoginError(data.error || 'Girdiğiniz şirket kodu veya erişim şifresi hatalı.');
        return;
      }

      loggedClient = data.customer;
    } catch (err) {
      console.error('Client auth error:', err);
      setLoginError('Giriş yapılırken sunucu bağlantı hatası oluştu.');
      return;
    }

    localStorage.setItem('socialart_client', JSON.stringify(loggedClient));
    setCustomer(loggedClient);
    await fetchClientData(loggedClient.client_name);
    await fetchSupportMessages(loggedClient.client_name);
    await fetchPaymentRequests(loggedClient.client_name, loggedClient.company_code);
    await fetchMetaSpend(loggedClient.company_code);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('socialart_client');
    setIsLoggedIn(false);
    setCustomer(null);
    setClientDetails(null);
    setSupportMessages([]);
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handlePayRequest = (reqItem) => {
    const isExempt = Boolean(reqItem.is_kdv_exempt);
    const rawNet = Number(reqItem.amount || 0);
    const grandTotal = Number(reqItem.total_amount) || (isExempt ? rawNet : rawNet * 1.20);
    const kdvAmount = reqItem.kdv_amount !== undefined ? Number(reqItem.kdv_amount) : (isExempt ? 0 : grandTotal - rawNet);

    setCheckoutPlan({
      title: reqItem.title,
      name: reqItem.title,
      price: grandTotal, // Exact amount to be charged by iyzico (58.741,20)
      exactPrice: true, // Prevents CheckoutModal from adding 20% KDV twice!
      isKdvIncluded: true,
      netAmount: rawNet,
      kdvAmount: kdvAmount,
      isKdvExempt: isExempt,
      is_kdv_exempt: isExempt,
      items: Array.isArray(reqItem.items) ? reqItem.items : [],
      currency: 'TL',
      interval: 'Tek Seferlik',
      paymentType: 'custom_invoice',
      requestId: reqItem.id,
      clientName: customer?.client_name || reqItem.client_name || 'Müşteri',
      companyCode: customer?.company_code || reqItem.company_code || 'arayanvar'
    });
    setIsCheckoutOpen(true);
  };

  const handleSendSupportMessage = async (customMsg) => {
    if (customMsg && typeof customMsg.preventDefault === 'function') {
      customMsg.preventDefault();
    }
    const msg = (typeof customMsg === 'string' ? customMsg : (supportInput || '')).trim();
    if (!msg || !customer) return;

    setSupportInput('');

    try {
      const { data, error } = await supabase.from('client_support_messages').insert([{
        client_name: customer.client_name,
        message: msg,
        sender_type: 'client',
        is_read: false
      }]).select();

      if (!error && data && data.length > 0) {
        setSupportMessages(prev => {
          if (prev.some(m => m.id === data[0].id)) return prev;
          return [...prev, data[0]];
        });
      } else {
        await fetchSupportMessages(customer.client_name);
      }
    } catch (err) {
      console.warn('Support message send error:', err);
    }
  };

  if (loading) return null;

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]">
        <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl shadow-black/80 text-center space-y-6">
          
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 p-0.5 mx-auto shadow-xl shadow-indigo-600/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Building2 className="w-9 h-9 text-cyan-400" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">SocialArt VIP Portalı</h1>
            <p className="text-xs text-slate-400 mt-1">
              Markanızın canlı prodüksiyon, reklam ve finans operasyon üssüne erişin.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {loginError && (
              <div className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-950 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-3 shadow-xl shadow-rose-950/40 animate-in fade-in duration-200">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 to-red-500 rounded-l-full" />
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">Giriş Hatası</span>
                  <span className="text-xs text-rose-100">{loginError}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Şirket Kodu / Marka Adı
              </label>
              <input
                type="text"
                required
                placeholder="Şirket kodunuzu girin..."
                value={loginData.code}
                onChange={e => setLoginData({ ...loginData, code: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold outline-none focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Giriş Şifresi
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold outline-none focus:border-indigo-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Sisteme Güvenli Giriş Yap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-[11px] text-slate-500">
            SocialArt Ajans İletişim & Güvenlik Altyapısı
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN PORTAL VIEW (4 CORE TABS)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Global Admin Reply Notification Alert */}
      {newReplyAlert && (
        <div 
          onClick={() => setNewReplyAlert(null)}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-indigo-600/90 hover:bg-indigo-600 border border-cyan-400/40 text-white px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 cursor-pointer animate-fadeIn"
        >
          <MessageCircle className="w-5 h-5 text-cyan-300 animate-bounce" />
          <div className="text-xs">
            <span className="font-extrabold text-cyan-300 block">{newReplyAlert.adminName} Mesaj Gönderdi:</span>
            <span className="font-semibold">{newReplyAlert.message}</span>
          </div>
          <button className="text-white/60 hover:text-white ml-3">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header & 4-Tab Navigation */}
      <PortalHeader
        customer={customer}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        clientDetails={clientDetails}
      />

      {/* 2. Active Tab Content */}
      <main className="min-h-[550px]">
        {activeTab === 'overview_ads' && (
          <TabOverviewAds
            customer={customer}
            metaMetrics={metaSpend}
            selectedPreset={selectedDatePreset}
            onDatePresetChange={(preset) => fetchMetaSpend(customer?.company_code, preset)}
          />
        )}

        {activeTab === 'production_studio' && (
          <TabProductionStudio
            customer={customer}
          />
        )}

        {activeTab === 'assets_drive' && (
          <TabAssetsArchive
            customer={customer}
          />
        )}

        {activeTab === 'billing_support' && (
          <TabBillingSupport
            customer={customer}
            paymentRequests={paymentRequests}
            onPayRequest={handlePayRequest}
            supportMessages={supportMessages}
            onSendSupportMessage={handleSendSupportMessage}
            supportInput={supportInput}
            setSupportInput={setSupportInput}
          />
        )}
      </main>

      {/* 3. Floating Mini AI Assistant [2, C] */}
      <PortalFloatingAI customer={customer} />

      {/* 4. iyzico 3D Secure Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={checkoutPlan}
      />

    </div>
  );
}

export default ClientPortal;
