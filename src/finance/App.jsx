import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import DashboardView from './components/DashboardView';
import ClientsView from './components/ClientsView';
import GelirlerView from './components/GelirlerView';
import GiderlerView from './components/GiderlerView';
import PersonelView from './components/PersonelView';
import CreditCardView from './components/CreditCardView';
import CashJournalView from './components/CashJournalView';
import ActivityLogView from './components/ActivityLogView';
import ProductionProjectsView from './components/ProductionProjectsView';
import RecurringExpensesView from './components/RecurringExpensesView';
import FinancialGrowthView from './components/FinancialGrowthView';
import LoginLockScreen from './components/LoginLockScreen';
import ChangePasswordModal from './components/ChangePasswordModal';

import { 
  Menu, 
  X, 
  DollarSign, 
  LayoutDashboard, 
  Users, 
  Tag, 
  Percent, 
  CreditCard, 
  Landmark, 
  Calendar, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Film,
  RefreshCcw,
  BarChart2,
  Lock,
  LogOut,
  KeyRound,
  Rocket,
  Home
} from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#fff', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', margin: '2rem' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>⚠️ Sayfa Yüklenirken Bir Hata Oluştu</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
            {this.state.error?.message || 'Beklenmeyen bir arayüz hatası.'}
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('socialart_active_tab') || 'dashboard';
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('socialart_active_tab', tab);
    setIsMobileMenuOpen(false);
  };
  
  // Date period state (Format: YYYY-MM)
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}`;
  });

  // Database states
  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [clientPayments, setClientPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [staffPayments, setStaffPayments] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [cashJournal, setCashJournal] = useState([]);
  const [productionProjects, setProductionProjects] = useState([]);

  // Auth & Security States (Only ajanscelal26 & ajansercan26 allowed - Strictly isolated from CRM)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const isEmergencyLocked = localStorage.getItem('socialart_finance_emergency_lock') === 'true';
    if (isEmergencyLocked) return false;

    const token = sessionStorage.getItem('socialart_finance_session_token');
    const expiry = sessionStorage.getItem('socialart_finance_session_expiry');
    if (!token || !expiry) return false;

    // Check 30-minute session expiry
    if (Date.now() > parseInt(expiry, 10)) {
      sessionStorage.removeItem('socialart_finance_session_token');
      sessionStorage.removeItem('socialart_finance_auth_user');
      sessionStorage.removeItem('socialart_finance_session_expiry');
      return false;
    }
    return true;
  });
  const [authUser, setAuthUser] = useState(() => {
    try {
      const isEmergencyLocked = localStorage.getItem('socialart_finance_emergency_lock') === 'true';
      if (isEmergencyLocked) return null;
      return JSON.parse(sessionStorage.getItem('socialart_finance_auth_user') || 'null');
    } catch(e) { return null; }
  });
  const [userPasswords, setUserPasswords] = useState(() => ({
    ajanscelal26: localStorage.getItem('socialart_pass_ajanscelal26') || '1234',
    ajansercan26: localStorage.getItem('socialart_pass_ajansercan26') || '1234'
  }));
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data for the active period
  const fetchData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch active clients & auto-sync from /admin brands table
      try {
        const { data: clientsData } = await supabase
          .from('active_clients')
          .select('*')
          .order('name', { ascending: true });

        // Auto-sync missing brands from admin DB if available
        try {
          const { data: adminBrands } = await supabase
            .from('brands')
            .select('*');

          if (adminBrands && adminBrands.length > 0 && Array.isArray(clientsData)) {
            for (const b of adminBrands) {
              const bName = (b.name || '').trim();
              if (!bName) continue;
              const exists = clientsData.some(c => c.name.toLowerCase() === bName.toLowerCase() || c.name.toLowerCase().includes(bName.toLowerCase()) || bName.toLowerCase().includes(c.name.toLowerCase()));
              if (!exists) {
                const count = clientsData.length + 1;
                const newCode = `M${String(count).padStart(3, '0')}`;
                const { data: insertedClient } = await supabase.from('active_clients').insert([{
                  name: bName,
                  package: 'Sosyal Medya Yönetimi',
                  monthly_fee: 0,
                  payment_day: 1,
                  yetkili_kisi: b.contact_person,
                  telefon: b.phone,
                  email: b.email,
                  durum: b.status === 'active' ? 'aktif' : 'pasif',
                  client_code: newCode,
                  commission_rate: 10,
                  exempt_from_commission: false
                }]).select();
                if (insertedClient && insertedClient.length > 0) {
                  clientsData.push(insertedClient[0]);
                }
              }
            }
          }
        } catch (bErr) {}

        const mappedClients = (clientsData || []).map(c => ({
          ...c,
          client_code: c.client_code || (c.metrics && c.metrics.client_code) || '',
          monthly_fee: c.monthly_fee || (c.metrics && c.metrics.monthly_fee) || 0,
          payment_day: c.payment_day || (c.metrics && c.metrics.payment_day) || 1,
          commission_rate: c.commission_rate || (c.metrics && c.metrics.commission_rate) || 0,
          exempt_from_commission: c.exempt_from_commission || (c.metrics && c.metrics.exempt_from_commission) || false,
          assigned_staff_ids: c.assigned_staff_ids || (c.metrics && c.metrics.assigned_staff_ids) || [],
          ...(c.metrics || {})
        }));
        setClients(mappedClients);
      } catch (cErr) {
        console.warn('Active clients fetch warning:', cErr);
      }

      // 2. Fetch staff members (employees table)
      try {
        const { data: staffData } = await supabase
          .from('employees')
          .select('*')
          .order('full_name', { ascending: true });
        const mappedStaff = (staffData || []).map(s => ({
          ...s,
          display_name: s.full_name || s.display_name || 'Personel',
          role: s.title || s.role || 'Ekip Üyesi'
        }));
        setStaff(mappedStaff);
      } catch (sErr) {
        console.warn('Staff fetch warning:', sErr);
        setStaff([]);
      }

      // 3. Fetch client payments (Gelirler)
      try {
        const { data: cPaymentsData } = await supabase
          .from('finance_client_payments')
          .select('*')
          .eq('period', selectedPeriod);
        setClientPayments(cPaymentsData || []);
      } catch (e) {
        setClientPayments([]);
      }

      // 4. Fetch expenses (Giderler)
      try {
        const { data: expensesData } = await supabase
          .from('finance_expenses')
          .select('*')
          .eq('period', selectedPeriod);
        setExpenses(expensesData || []);
      } catch (e) {
        setExpenses([]);
      }

      // 5. Fetch staff payments (Payroll)
      try {
        const { data: sPaymentsData } = await supabase
          .from('finance_staff_payments')
          .select('*')
          .eq('period', selectedPeriod);
        setStaffPayments(sPaymentsData || []);
      } catch (e) {
        setStaffPayments([]);
      }

      // 6. Fetch taxes
      try {
        const { data: taxesData } = await supabase
          .from('finance_taxes')
          .select('*');
        setTaxes(taxesData || []);
      } catch (e) {
        setTaxes([]);
      }

      // 7. Fetch credit cards
      try {
        const { data: cardsData } = await supabase
          .from('finance_credit_cards')
          .select('*')
          .eq('period', selectedPeriod);
        setCreditCards(cardsData || []);
      } catch (e) {
        setCreditCards([]);
      }

      // 8. Fetch cash journal
      try {
        const { data: journalData } = await supabase
          .from('finance_cash_journal')
          .select('*')
          .eq('period', selectedPeriod);
        setCashJournal(journalData || []);
      } catch (e) {
        setCashJournal([]);
      }

      // Fetch production projects
      try {
        const { data: projData } = await supabase
          .from('finance_production_projects')
          .select('*');
        setProductionProjects(projData || []);
      } catch (e) {}

      // 9. Fetch app settings (user passwords)
      try {
        const { data: settingsData } = await supabase
          .from('app_settings')
          .select('*')
          .in('setting_key', ['pass_ajanscelal26', 'pass_ajansercan26']);
        if (settingsData && settingsData.length > 0) {
          const fetchedPasses = {};
          settingsData.forEach(item => {
            if (item.setting_key === 'pass_ajanscelal26') {
              fetchedPasses.ajanscelal26 = item.setting_value;
              localStorage.setItem('socialart_pass_ajanscelal26', item.setting_value);
            }
            if (item.setting_key === 'pass_ajansercan26') {
              fetchedPasses.ajansercan26 = item.setting_value;
              localStorage.setItem('socialart_pass_ajansercan26', item.setting_value);
            }
          });
          setUserPasswords(prev => ({ ...prev, ...fetchedPasses }));
        }
      } catch (e) {}

      // 10. Check for CRM won leads (stage = 'WON' / status = 'Kazanıldı') -> Sync expected revenue to Gelirler & Prodüksiyon
      try {
        let crmWonDeals = [];

        // Check leads table in piffaggeshfrubyjkhej
        try {
          const { data: pifLeads } = await supabase
            .from('leads')
            .select('*')
            .or('status.eq.kazanildi,status.eq.Kazanıldı,status.eq.won,status.eq.KAZANILDI,stage.eq.WON,stage.eq.won')
            .or('synced_to_finance.is.null,synced_to_finance.eq.false');
          if (pifLeads && pifLeads.length > 0) {
            crmWonDeals.push(...pifLeads);
          }
        } catch (lErr) {}

        // Check crm_leads table in osuwytug
        try {
          const { data: osuLeads } = await supabase
            .from('crm_leads')
            .select('*')
            .or('stage.eq.WON,stage.eq.won,stage.eq.KAZANILDI,status.eq.kazanildi,status.eq.Kazanıldı')
            .or('synced_to_finance.is.null,synced_to_finance.eq.false');
          if (osuLeads && osuLeads.length > 0) {
            crmWonDeals.push(...osuLeads);
          }
        } catch (cErr) {}

        if (crmWonDeals && crmWonDeals.length > 0) {
          for (const deal of crmWonDeals) {
            // Extract expected budget / revenue amount written in CRM lead
            const amountVal = parseFloat(deal.budget) || parseFloat(deal.amount) || parseFloat(deal.revenue) || parseFloat(deal.value) || 0;
            const dealTitle = deal.title || deal.name || 'CRM Kazanılan Proje';
            const dealClientName = deal.client_name || deal.name || deal.title || 'CRM Müşteri';

            if (amountVal > 0) {
              const digerClient = (clientsData || []).find(c => c.client_code === 'DIGER' || c.name.includes('Diğer'));
              const targetClientId = digerClient ? digerClient.id : 99999;
              const kdvAmount = Math.round((amountVal * (20 / 120)) * 100) / 100;

              // 1. Insert into finance_client_payments (Gelirler)
              const { data: pData } = await supabase
                .from('finance_client_payments')
                .insert([{
                  client_id: targetClientId,
                  amount: amountVal,
                  payment_date: deal.date || new Date().toISOString().split('T')[0],
                  payment_type: 'Havale',
                  period: selectedPeriod,
                  notes: `[CRM Kazanıldı] ${dealTitle} (${dealClientName})`,
                  kdv_rate: 20,
                  kdv_amount: kdvAmount
                }])
                .select();

              if (pData) {
                setClientPayments(prev => [...prev, pData[0]]);
              }

              // 2. Insert into finance_production_projects (Prodüksiyon Projeleri)
              await supabase.from('finance_production_projects').insert([{
                title: `${dealTitle} (${dealClientName})`,
                client_name: dealClientName,
                budget: amountVal,
                status: 'ongoing',
                date: deal.date || new Date().toISOString().split('T')[0],
                costs: []
              }]);

              // Update synced status in leads / crm_leads table
              try {
                await supabase
                  .from('leads')
                  .update({ synced_to_finance: true })
                  .eq('id', deal.id);
              } catch (e) {}

              try {
                await supabase
                  .from('crm_leads')
                  .update({ synced_to_finance: true })
                  .eq('id', deal.id);
              } catch (e) {}

              logActivity('CRM Entegrasyonu', `${dealTitle} (${dealClientName}) CRM'de 'Kazanıldı' seçildiği için ₺${amountVal.toLocaleString('tr-TR')} Beklenen Gelir hem Gelirlere hem Prodüksiyon Projelerine kaydedildi.`);
            }
          }
        }
      } catch (e) {}

    } catch (err) {
      console.error("Error loading data from Supabase:", err);
      setError(err.message || "Veritabanına bağlanırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);

    // 1. Listen for custom event 'finance_data_changed'
    const handleDataChange = () => {
      fetchData(false);
    };
    window.addEventListener('finance_data_changed', handleDataChange);

    // 2. Listen for window focus event
    const handleWindowFocus = () => {
      fetchData(false);
    };
    window.addEventListener('focus', handleWindowFocus);

    // 3. Supabase Realtime Subscriptions for Instant Data Sync
    let channel;
    try {
      channel = supabase.channel('finance-realtime-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_client_payments' }, () => fetchData(false))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_expenses' }, () => fetchData(false))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_staff_payments' }, () => fetchData(false))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_production_projects' }, () => fetchData(false))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'active_clients' }, () => fetchData(false))
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }

    return () => {
      window.removeEventListener('finance_data_changed', handleDataChange);
      window.removeEventListener('focus', handleWindowFocus);
      if (channel) supabase.removeChannel(channel);
    };
  }, [selectedPeriod]);

  // HELPER: Log to activity_log
  const logActivity = async (action, details, target = 'GENEL') => {
    const newEntry = {
      id: Date.now() + Math.random(),
      user_name: 'Yönetici',
      action,
      details,
      target_name: target,
      created_at: new Date().toISOString()
    };

    // 1. Always save to local storage as fallback
    try {
      const existing = JSON.parse(localStorage.getItem('socialart_local_activity_logs') || '[]');
      localStorage.setItem('socialart_local_activity_logs', JSON.stringify([newEntry, ...existing.slice(0, 99)]));
    } catch (err) {}

    // 2. Try saving to Supabase
    try {
      await supabase.from('activity_log').insert([{
        user_name: 'Yönetici',
        action,
        details,
        target_name: target,
        created_at: newEntry.created_at
      }]);
    } catch (e) {
      console.error("Activity log error:", e);
    }
  };

  // Auth & Password Mutators
  const handleUpdateAdminPassword = async (newPassword, targetUsername) => {
    const userToUpdate = targetUsername || authUser?.username || 'ajanscelal26';
    
    setUserPasswords(prev => ({ ...prev, [userToUpdate]: newPassword }));
    localStorage.setItem(`socialart_pass_${userToUpdate}`, newPassword);

    try {
      await supabase.from('app_settings').upsert({
        setting_key: `pass_${userToUpdate}`,
        setting_value: newPassword,
        updated_at: new Date().toISOString()
      }, { onConflict: 'setting_key' });
    } catch (e) {
      console.error("Supabase setting update error:", e);
    }

    logActivity('Güvenlik', `${userToUpdate} kullanıcısı şifresini başarıyla güncelledi.`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('socialart_finance_session_token');
    sessionStorage.removeItem('socialart_finance_auth_user');
    sessionStorage.removeItem('socialart_finance_session_expiry');
    setIsAuthenticated(false);
    setAuthUser(null);
  };

  // MUTATOR 1: Record client payment (Gelir) + Auto cash journal entry + Auto tax entry
  const handleRecordClientPayment = async (paymentData) => {
    try {
      let targetClientId = paymentData.client_id;
      if (targetClientId === 99999 || !clients.some(c => c.id === targetClientId)) {
        const digerClient = clients.find(c => c.client_code === 'DIGER' || c.name.includes('Diğer'));
        if (digerClient) {
          targetClientId = digerClient.id;
        }
      }

      const kdvRate = paymentData.kdv_rate !== undefined ? paymentData.kdv_rate : 20;
      const kdvAmount = Math.round((paymentData.amount * (kdvRate / (100 + kdvRate))) * 100) / 100;
      const netAmount = paymentData.amount - kdvAmount;

      // 1. Insert client payment record
      const { data: pData, error: pError } = await supabase
        .from('finance_client_payments')
        .insert([{
          client_id: targetClientId,
          amount: paymentData.amount,
          payment_date: paymentData.payment_date,
          payment_type: paymentData.payment_type,
          period: paymentData.period,
          notes: paymentData.notes,
          kdv_rate: kdvRate,
          kdv_amount: kdvAmount
        }])
        .select();
      if (pError) throw pError;

      // Update state locally
      setClientPayments(prev => [...prev, pData[0]]);

      // 2. Automatically insert into cash journal
      const clientName = clients.find(c => c.id === paymentData.client_id)?.name || 'Müşteri';
      const { data: jData, error: jError } = await supabase
        .from('finance_cash_journal')
        .insert([{
          transaction_date: paymentData.payment_date,
          account: paymentData.payment_account || 'Banka', // Banka or Kasa
          type: 'Giriş',
          description: `Müşteri Tahsilatı: ${clientName} (${paymentData.notes}) (Net: ${netAmount.toLocaleString('tr-TR')} ₺, KDV: ${kdvAmount.toLocaleString('tr-TR')} ₺)`,
          amount: paymentData.amount,
          period: paymentData.period
        }])
        .select();
      if (jError) throw jError;
      setCashJournal(prev => [...prev, jData[0]]);

      // 3. Auto insert iyzico / POS commission expense if payment method is Credit Card
      const isCreditCard = (paymentData.payment_type || '').toLowerCase().includes('kredi') || (paymentData.payment_type || '').toLowerCase().includes('kart');
      const iyzicoRate = paymentData.iyzico_rate !== undefined ? parseFloat(paymentData.iyzico_rate) : (isCreditCard ? 2.99 : 0);
      const iyzicoAmount = paymentData.iyzico_amount !== undefined ? parseFloat(paymentData.iyzico_amount) : Math.round((paymentData.amount * (iyzicoRate / 100)) * 100) / 100;

      if (isCreditCard && iyzicoAmount > 0) {
        const { data: eData, error: eError } = await supabase
          .from('finance_expenses')
          .insert([{
            expense_date: paymentData.payment_date,
            category: 'Kredi Kartı',
            description: `[iyzico POS Komisyonu] ${clientName} Tahsilat Komisyonu (%${iyzicoRate})`,
            amount: iyzicoAmount,
            period: paymentData.period,
            payment_method: 'Kredi Kartı'
          }])
          .select();
        
        if (!eError && eData) {
          setExpenses(prev => [...prev, eData[0]]);
        }
      }

      // 3. Automatically add to finance_taxes table under KDV
      const existingTax = taxes.find(t => t.period === paymentData.period);
      if (existingTax) {
        const newKdv = Math.round((parseFloat(existingTax.kdv || 0) + kdvAmount) * 100) / 100;
        const { error: tError } = await supabase
          .from('finance_taxes')
          .update({ kdv: newKdv })
          .eq('id', existingTax.id);
        if (tError) throw tError;

        setTaxes(prev => prev.map(t => t.id === existingTax.id ? { ...t, kdv: newKdv } : t));
      } else {
        // Calculate default due date: 26th of next month
        const [yr, mn] = paymentData.period.split('-');
        const dueDate = new Date(parseInt(yr), parseInt(mn), 26).toISOString().split('T')[0];
        
        const { data: tData, error: tError } = await supabase
          .from('finance_taxes')
          .insert([{
            period: paymentData.period,
            kdv: kdvAmount,
            muhtasar: 0,
            sgk: 0,
            gecici_vergi: 0,
            amount_paid: 0,
            status: 'unpaid',
            due_date: dueDate
          }])
          .select();
        if (tError) throw tError;
        setTaxes(prev => [...prev, tData[0]]);
      }

      // 4. Log to activity
      await logActivity(
        'Ödeme Alındı', 
        `${clientName} firmasından ${paymentData.amount.toLocaleString('tr-TR')} ₺ (KDV Dahil, Net: ${netAmount.toLocaleString('tr-TR')} ₺, KDV: ${kdvAmount.toLocaleString('tr-TR')} ₺) tutarındaki ödeme finans sistemine işlendi.`,
        clientName
      );

    } catch (err) {
      alert("Ödeme kaydedilemedi: " + err.message);
    }
  };

  // MUTATOR 2: Delete client payment + delete cash journal entry + update taxes
  const handleDeleteClientPayment = async (paymentId) => {
    try {
      const payment = clientPayments.find(p => p.id === paymentId);
      if (!payment) return;
      const clientName = clients.find(c => c.id === payment.client_id)?.name || 'Müşteri';
      const paymentKdv = parseFloat(payment.kdv_amount || 0);

      // Delete payment
      const { error: pError } = await supabase
        .from('finance_client_payments')
        .delete()
        .eq('id', paymentId);
      if (pError) throw pError;
      setClientPayments(prev => prev.filter(p => p.id !== paymentId));

      // Find and delete the corresponding journal entry
      const descriptionPattern = `Müşteri Tahsilatı: ${clientName}`;
      const { data: journalMatches } = await supabase
        .from('finance_cash_journal')
        .select('*')
        .eq('period', selectedPeriod)
        .eq('type', 'Giriş')
        .eq('amount', payment.amount);

      const match = journalMatches?.find(j => j.description.startsWith(descriptionPattern));
      if (match) {
        await supabase.from('finance_cash_journal').delete().eq('id', match.id);
        setCashJournal(prev => prev.filter(j => j.id !== match.id));
      }

      // Subtract KDV from taxes table
      const existingTax = taxes.find(t => t.period === payment.period);
      if (existingTax && paymentKdv > 0) {
        const newKdv = Math.max(0, Math.round((parseFloat(existingTax.kdv || 0) - paymentKdv) * 100) / 100);
        await supabase
          .from('finance_taxes')
          .update({ kdv: newKdv })
          .eq('id', existingTax.id);
        
        setTaxes(prev => prev.map(t => t.id === existingTax.id ? { ...t, kdv: newKdv } : t));
      }

      await logActivity('Ödeme Silindi', `${clientName} firmasına ait ${payment.amount.toLocaleString('tr-TR')} ₺ tutarındaki ödeme kaydı iptal edildi.`);
    } catch (err) {
      alert("Ödeme kaydı silinemedi: " + err.message);
    }
  };

  // MUTATOR 3: Update client contract (monthly fee, payment day, commissions, exemptions)
  const handleUpdateClientContract = async (contractData) => {
    try {
      const existingMetrics = contractData.metrics || {};
      const updatedMetrics = {
        ...existingMetrics,
        monthly_fee: contractData.monthly_fee,
        payment_day: contractData.payment_day,
        client_code: contractData.client_code,
        commission_rate: contractData.commission_rate,
        exempt_from_commission: contractData.exempt_from_commission,
        assigned_staff_ids: contractData.assigned_staff_ids
      };

      await supabase
        .from('active_clients')
        .update({ 
          metrics: updatedMetrics
        })
        .eq('id', contractData.id);
      
      // Update locally
      setClients(prev => prev.map(c => 
        c.id === contractData.id 
          ? { 
              ...c, 
              ...updatedMetrics
            }
          : c
      ));

      await logActivity('Müşteri Sözleşmesi Güncellendi', `${contractData.client_code || contractData.name} kodlu müşteri cari kart bilgileri güncellendi.`);
    } catch (err) {
      alert("Cari kart güncellenemedi: " + err.message);
    }
  };

  // MUTATOR 4: Add expense + Auto cash journal or card update
  const handleAddExpense = async (expenseData) => {
    try {
      // 1. Insert clean expense record matching Supabase schema
      const cleanExpense = {
        expense_date: expenseData.expense_date,
        category: expenseData.category,
        description: expenseData.description || `${expenseData.category} Gideri`,
        amount: parseFloat(expenseData.amount),
        period: expenseData.period,
        payment_method: expenseData.payment_method || 'Banka'
      };

      const { data: expData, error: expError } = await supabase
        .from('finance_expenses')
        .insert([cleanExpense])
        .select();
      if (expError) throw expError;
      setExpenses(prev => [...prev, expData[0]]);

      // 2. Handle payment method routing
      if (expenseData.payment_method === 'Kredi Kartı') {
        // If credit card, increase card used limit
        // We will default to updating the first card, or if we want card matching, we can do it
        const card = creditCards[0]; // default to first card for simplicity or match name if matches
        if (card) {
          const newUsed = parseFloat(card.used_amount) + expenseData.amount;
          await supabase.from('finance_credit_cards').update({ used_amount: newUsed }).eq('id', card.id);
          setCreditCards(prev => prev.map(c => c.id === card.id ? { ...c, used_amount: newUsed } : c));
        }
      } else {
        // If cash/bank, add to cash journal as Output (Çıkış)
        const { data: jData, error: jError } = await supabase
          .from('finance_cash_journal')
          .insert([{
            transaction_date: expenseData.expense_date,
            account: expenseData.payment_method, // Banka or Kasa
            type: 'Çıkış',
            description: `Gider Ödemesi: ${expenseData.description} (${expenseData.category})`,
            amount: expenseData.amount,
            period: expenseData.period
          }])
          .select();
        if (jError) throw jError;
        setCashJournal(prev => [...prev, jData[0]]);
      }

      await logActivity('Gider Kaydedildi', `${expenseData.description} açıklamalı ${expenseData.amount.toLocaleString('tr-TR')} ₺ gider sisteme girildi (${expenseData.payment_method}).`);

    } catch (err) {
      alert("Gider eklenemedi: " + err.message);
    }
  };

  // MUTATOR 5: Delete expense
  const handleDeleteExpense = async (expenseId) => {
    try {
      const expense = expenses.find(e => e.id === expenseId);
      if (!expense) return;

      await supabase.from('finance_expenses').delete().eq('id', expenseId);
      setExpenses(prev => prev.filter(e => e.id !== expenseId));

      if (expense.payment_method === 'Kredi Kartı') {
        const card = creditCards[0];
        if (card) {
          const newUsed = Math.max(0, parseFloat(card.used_amount) - expense.amount);
          await supabase.from('finance_credit_cards').update({ used_amount: newUsed }).eq('id', card.id);
          setCreditCards(prev => prev.map(c => c.id === card.id ? { ...c, used_amount: newUsed } : c));
        }
      } else {
        const descriptionPattern = `Gider Ödemesi: ${expense.description}`;
        const { data: journalMatches } = await supabase
          .from('finance_cash_journal')
          .select('*')
          .eq('period', selectedPeriod)
          .eq('type', 'Çıkış')
          .eq('amount', expense.amount);

        const match = journalMatches?.find(j => j.description.startsWith(descriptionPattern));
        if (match) {
          await supabase.from('finance_cash_journal').delete().eq('id', match.id);
          setCashJournal(prev => prev.filter(j => j.id !== match.id));
        }
      }

      await logActivity('Gider Silindi', `${expense.description} açıklamalı gider kaydı silindi.`);
    } catch (err) {
      alert("Gider silinemedi: " + err.message);
    }
  };

  // MUTATOR 6: Record staff salary payout + Auto cash journal entry
  const handleRecordStaffPayment = async (payrollData) => {
    try {
      const existing = staffPayments.find(p => p.staff_id === payrollData.staff_id);
      
      // Calculate net deserved salary
      const deserved = payrollData.base_salary - payrollData.advance_amount + 
                       (payrollData.commission_amount + payrollData.bonus_amount) - 
                       payrollData.deduction_amount;

      const status = payrollData.amount_paid >= deserved 
        ? 'paid' 
        : (payrollData.amount_paid > 0 ? 'partial' : 'unpaid');

      let currentPaidAmount = payrollData.amount_paid;
      // Get the amount that was just paid in this specific click
      const previousPaidAmount = existing ? parseFloat(existing.amount_paid) : 0;
      const justPaid = currentPaidAmount - previousPaidAmount;

      if (existing) {
        const { error } = await supabase
          .from('finance_staff_payments')
          .update({
            amount_paid: currentPaidAmount,
            payment_date: payrollData.payment_date,
            status: status
          })
          .eq('id', existing.id);
        if (error) throw error;

        setStaffPayments(prev => prev.map(p => 
          p.id === existing.id 
            ? { ...p, amount_paid: currentPaidAmount, status, payment_date: payrollData.payment_date }
            : p
        ));
      } else {
        const { data, error } = await supabase
          .from('finance_staff_payments')
          .insert([{
            staff_id: payrollData.staff_id,
            base_salary: payrollData.base_salary,
            advance_amount: payrollData.advance_amount,
            commission_amount: payrollData.commission_amount,
            bonus_amount: payrollData.bonus_amount,
            bonus_reason: payrollData.bonus_reason,
            deduction_amount: payrollData.deduction_amount,
            amount_paid: currentPaidAmount,
            payment_date: payrollData.payment_date,
            period: selectedPeriod,
            status: status
          }])
          .select();
        if (error) throw error;

        setStaffPayments(prev => [...prev, data[0]]);
      }

      // Record to cash journal (Çıkış)
      const staffName = staff.find(s => s.id === payrollData.staff_id)?.display_name || 'Çalışan';
      if (justPaid > 0) {
        const { data: jData, error: jError } = await supabase
          .from('finance_cash_journal')
          .insert([{
            transaction_date: payrollData.payment_date,
            account: payrollData.payment_account || 'Banka',
            type: 'Çıkış',
            description: `Personel Maaş Ödemesi: ${staffName}`,
            amount: justPaid,
            period: selectedPeriod
          }])
          .select();
        if (jError) throw jError;
        setCashJournal(prev => [...prev, jData[0]]);
      }

      await logActivity('Maaş Ödemesi Yapıldı', `${staffName} çalışanına ${justPaid.toLocaleString('tr-TR')} ₺ maaş ödemesi yapıldı (${payrollData.payment_account}).`);

    } catch (err) {
      alert("Maaş ödemesi kaydedilemedi: " + err.message);
    }
  };

  // MUTATOR 6B: Reset staff payment — sets amount_paid=0, status=unpaid, removes cash journal entry
  const handleResetStaffPayment = async (staffId) => {
    try {
      const existing = staffPayments.find(p => p.staff_id === staffId);
      if (!existing || existing.amount_paid === 0) {
        alert('Bu personel için silinecek ödeme kaydı bulunamadı.');
        return;
      }

      const staffName = staff.find(s => s.id === staffId)?.display_name || 'Çalışan';
      const paidAmount = parseFloat(existing.amount_paid);

      // Reset payment record
      const { error } = await supabase
        .from('finance_staff_payments')
        .update({ amount_paid: 0, status: 'unpaid', payment_date: null })
        .eq('id', existing.id);
      if (error) throw error;

      setStaffPayments(prev => prev.map(p =>
        p.id === existing.id
          ? { ...p, amount_paid: 0, status: 'unpaid', payment_date: null }
          : p
      ));

      // Also remove the matching cash journal entry for this payment
      const descriptionPattern = `Personel Maaş Ödemesi: ${staffName}`;
      const { data: journalMatches } = await supabase
        .from('finance_cash_journal')
        .select('*')
        .eq('period', selectedPeriod)
        .eq('type', 'Çıkış')
        .like('description', `%${descriptionPattern}%`);

      if (journalMatches && journalMatches.length > 0) {
        // Remove all matching entries for this staff in this period
        for (const entry of journalMatches) {
          await supabase.from('finance_cash_journal').delete().eq('id', entry.id);
        }
        setCashJournal(prev => prev.filter(j => !journalMatches.some(m => m.id === j.id)));
      }

      await logActivity('Maaş Ödemesi Geri Alındı', `${staffName} çalışana yapılan ${paidAmount.toLocaleString('tr-TR')} ₺ ödeme geri alındı.`);
    } catch (err) {
      alert('Maaş ödemesi geri alınamadı: ' + err.message);
    }
  };

  // MUTATOR 7: Set payroll adjustments (avans, kesinti, manual prim)
  const handleAddBonus = async (bonusData) => {
    try {
      const existing = staffPayments.find(p => p.staff_id === bonusData.staff_id);
      
      const deserved = bonusData.base_salary - bonusData.advance_amount + 
                       (bonusData.commission_amount + bonusData.bonus_amount) - 
                       bonusData.deduction_amount;

      const status = bonusData.amount_paid >= deserved 
        ? 'paid' 
        : (bonusData.amount_paid > 0 ? 'partial' : 'unpaid');

      if (existing) {
        const { error } = await supabase
          .from('finance_staff_payments')
          .update({
            advance_amount: bonusData.advance_amount,
            bonus_amount: bonusData.bonus_amount,
            bonus_reason: bonusData.bonus_reason,
            deduction_amount: bonusData.deduction_amount,
            status: status
          })
          .eq('id', existing.id);
        if (error) throw error;

        setStaffPayments(prev => prev.map(p => 
          p.id === existing.id 
            ? { 
                ...p, 
                advance_amount: bonusData.advance_amount, 
                bonus_amount: bonusData.bonus_amount, 
                bonus_reason: bonusData.bonus_reason,
                deduction_amount: bonusData.deduction_amount,
                status
              }
            : p
        ));
      } else {
        const { data, error } = await supabase
          .from('finance_staff_payments')
          .insert([{
            staff_id: bonusData.staff_id,
            base_salary: bonusData.base_salary,
            advance_amount: bonusData.advance_amount,
            commission_amount: bonusData.commission_amount,
            bonus_amount: bonusData.bonus_amount,
            bonus_reason: bonusData.bonus_reason,
            deduction_amount: bonusData.deduction_amount,
            amount_paid: 0,
            period: bonusData.period,
            status: 'unpaid'
          }])
          .select();
        if (error) throw error;

        setStaffPayments(prev => [...prev, data[0]]);
      }

      const staffName = staff.find(s => s.id === bonusData.staff_id)?.display_name || 'Çalışan';
      await logActivity('Hakediş/Avans Güncellendi', `${staffName} için hak ediş düzenlemeleri kaydedildi.`);

    } catch (err) {
      alert("Hakediş ayarları kaydedilemedi: " + err.message);
    }
  };

  // MUTATOR 8: Update base salary in staff table
  const handleUpdateBaseSalary = async (salaryData) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ base_salary: salaryData.base_salary })
        .eq('id', salaryData.id);
      if (error) throw error;

      setStaff(prev => prev.map(s => 
        s.id === salaryData.id ? { ...s, base_salary: salaryData.base_salary } : s
      ));

      const existingPayment = staffPayments.find(p => p.staff_id === salaryData.id);
      if (existingPayment && existingPayment.amount_paid === 0) {
        await supabase
          .from('finance_staff_payments')
          .update({ base_salary: salaryData.base_salary })
          .eq('id', existingPayment.id);
        
        setStaffPayments(prev => prev.map(p => 
          p.id === existingPayment.id ? { ...p, base_salary: salaryData.base_salary } : p
        ));
      }

    } catch (err) {
      alert("Maaş güncellenemedi: " + err.message);
    }
  };

  // MUTATOR 9: Record tax payment + Auto cash journal entry
  const handleRecordTaxPayment = async (taxData) => {
    try {
      const existing = taxes.find(t => t.period === taxData.period);
      if (!existing) return;

      const totalTax = parseFloat(existing.kdv) + parseFloat(existing.muhtasar) + parseFloat(existing.sgk) + parseFloat(existing.gecici_vergi);
      const status = taxData.amount_paid >= totalTax ? 'paid' : 'partial';
      const justPaid = taxData.amount_paid - parseFloat(existing.amount_paid);

      const { error } = await supabase
        .from('finance_taxes')
        .update({
          amount_paid: taxData.amount_paid,
          status
        })
        .eq('id', existing.id);
      if (error) throw error;

      setTaxes(prev => prev.map(t => 
        t.id === existing.id ? { ...t, amount_paid: taxData.amount_paid, status } : t
      ));

      // Record cash journal Çıkış
      if (justPaid > 0) {
        const { data: jData, error: jError } = await supabase
          .from('finance_cash_journal')
          .insert([{
            transaction_date: taxData.payment_date,
            account: taxData.payment_account,
            type: 'Çıkış',
            description: `Vergi Ödemesi (${taxData.period} Dönemi KDV/Muhtasar/SGK)`,
            amount: justPaid,
            period: taxData.period
          }])
          .select();
        if (jError) throw jError;
        setCashJournal(prev => [...prev, jData[0]]);
      }

      await logActivity('Vergi Ödemesi', `${taxData.period} dönemine ait vergi borcunun ${justPaid.toLocaleString('tr-TR')} ₺ ödemesi yapıldı.`);

    } catch (err) {
      alert("Vergi ödemesi kaydedilemedi: " + err.message);
    }
  };

  // MUTATOR 10: Update tax declarations
  const handleUpdateTaxes = async (taxData) => {
    try {
      const existing = taxes.find(t => t.period === taxData.period);
      
      const totalTax = taxData.kdv + taxData.muhtasar + taxData.sgk + taxData.gecici_vergi;
      const paid = existing ? parseFloat(existing.amount_paid) : 0;
      const status = paid >= totalTax ? 'paid' : (paid > 0 ? 'partial' : 'unpaid');

      if (existing) {
        const { error } = await supabase
          .from('finance_taxes')
          .update({
            kdv: taxData.kdv,
            muhtasar: taxData.muhtasar,
            sgk: taxData.sgk,
            gecici_vergi: taxData.gecici_vergi,
            due_date: taxData.due_date,
            status
          })
          .eq('id', existing.id);
        if (error) throw error;

        setTaxes(prev => prev.map(t => 
          t.id === existing.id 
            ? { 
                ...t, 
                kdv: taxData.kdv, 
                muhtasar: taxData.muhtasar, 
                sgk: taxData.sgk, 
                gecici_vergi: taxData.gecici_vergi, 
                due_date: taxData.due_date,
                status 
              }
            : t
        ));
      } else {
        const { data, error } = await supabase
          .from('finance_taxes')
          .insert([{
            period: taxData.period,
            kdv: taxData.kdv,
            muhtasar: taxData.muhtasar,
            sgk: taxData.sgk,
            gecici_vergi: taxData.gecici_vergi,
            due_date: taxData.due_date,
            amount_paid: 0,
            status: 'unpaid'
          }])
          .select();
        if (error) throw error;
        setTaxes(prev => [...prev, data[0]]);
      }

      await logActivity('Vergi Beyanı Güncellendi', `${taxData.period} dönemi vergi beyanları düzenlendi.`);

    } catch (err) {
      alert("Vergi beyanı güncellenemedi: " + err.message);
    }
  };

  // MUTATOR 11: Add new credit card
  const handleAddCard = async (cardData) => {
    try {
      const { data, error } = await supabase
        .from('finance_credit_cards')
        .insert([cardData])
        .select();
      if (error) throw error;

      setCreditCards(prev => [...prev, data[0]]);
      await logActivity('Kart Eklendi', `${cardData.card_name} kredi kartı sisteme tanımlandı.`);
    } catch (err) {
      alert("Kart eklenemedi: " + err.message);
    }
  };

  // MUTATOR 12: Delete credit card
  const handleDeleteCard = async (cardId) => {
    try {
      const card = creditCards.find(c => c.id === cardId);
      await supabase.from('finance_credit_cards').delete().eq('id', cardId);
      setCreditCards(prev => prev.filter(c => c.id !== cardId));

      if (card) {
        // Also auto-delete associated expense records for this card
        const cardNameClean = (card.card_name || '').toLowerCase();
        const matchingExpenses = expenses.filter(e => 
          e.payment_method === 'Kredi Kartı' && 
          e.description.toLowerCase().includes(cardNameClean)
        );

        for (const exp of matchingExpenses) {
          await supabase.from('finance_expenses').delete().eq('id', exp.id);
        }

        setExpenses(prev => prev.filter(e => !matchingExpenses.some(m => m.id === e.id)));
        await logActivity('Kart Silindi', `${card.card_name} kredi kartı ve bağlı harcama kayıtları silindi.`);
      }
      try { window.dispatchEvent(new CustomEvent('finance_data_changed')); } catch(e){}
    } catch (err) {
      alert("Kart silinemedi: " + err.message);
    }
  };

  // MUTATOR 12B: Update credit card info
  const handleUpdateCard = async (cardId, cardData) => {
    try {
      const { data, error } = await supabase
        .from('finance_credit_cards')
        .update({
          card_name: cardData.card_name,
          limit: cardData.limit,
          minimum_payment: cardData.minimum_payment,
          due_date: cardData.due_date
        })
        .eq('id', cardId)
        .select();
      if (error) throw error;

      setCreditCards(prev => prev.map(c => c.id === cardId ? { ...c, ...data[0] } : c));
      await logActivity('Kart Güncellendi', `${cardData.card_name} kredi kartı bilgileri güncellendi.`);
    } catch (err) {
      alert("Kart güncellenemedi: " + err.message);
    }
  };

  // MUTATOR 13: Record credit card payment + Auto cash journal entry
  const handleRecordCardPayment = async (paymentData) => {
    try {
      const card = creditCards.find(c => c.id === paymentData.id);
      if (!card) return;

      const newUsed = Math.max(0, parseFloat(card.used_amount) - paymentData.amount);
      const { error } = await supabase
        .from('finance_credit_cards')
        .update({ used_amount: newUsed })
        .eq('id', card.id);
      if (error) throw error;

      setCreditCards(prev => prev.map(c => c.id === card.id ? { ...c, used_amount: newUsed } : c));

      // Record to cash journal (Çıkış)
      const { data: jData, error: jError } = await supabase
        .from('finance_cash_journal')
        .insert([{
          transaction_date: paymentData.payment_date,
          account: paymentData.payment_account,
          type: 'Çıkış',
          description: `Kredi Kartı Ekstre Ödemesi: ${paymentData.card_name}`,
          amount: paymentData.amount,
          period: selectedPeriod
        }])
        .select();
      if (jError) throw jError;
      setCashJournal(prev => [...prev, jData[0]]);

      await logActivity('Kart Borç Ödemesi', `${paymentData.card_name} kartına ${paymentData.amount.toLocaleString('tr-TR')} ₺ ödeme yapıldı.`);

    } catch (err) {
      alert("Kart ödemesi kaydedilemedi: " + err.message);
    }
  };

  // MUTATOR 14: Record credit card spend + Auto expense entry (Installment Support)
  const handleRecordCardSpend = async (spendData) => {
    try {
      const card = creditCards.find(c => c.id === spendData.id);
      if (!card) return;

      const installments = spendData.installments || 1;
      const totalAmount = spendData.amount;
      const monthlyAmount = Math.round((totalAmount / installments) * 100) / 100;

      // Update card total debt
      const newUsed = parseFloat(card.used_amount) + totalAmount;
      const { error: cError } = await supabase
        .from('finance_credit_cards')
        .update({ used_amount: newUsed })
        .eq('id', card.id);
      if (cError) throw cError;

      setCreditCards(prev => prev.map(c => c.id === card.id ? { ...c, used_amount: newUsed } : c));

      // Auto record first installment into active expenses
      const expenseDesc = installments > 1 
        ? `${spendData.card_name} Harcaması: ${spendData.description} (${installments} Taksitli - Aylık ${monthlyAmount.toLocaleString('tr-TR')} ₺)`
        : `${spendData.card_name} Harcaması: ${spendData.description}`;

      const { data: eData, error: eError } = await supabase
        .from('finance_expenses')
        .insert([{
          expense_date: new Date().toISOString().split('T')[0],
          category: spendData.category,
          description: expenseDesc,
          amount: monthlyAmount,
          period: selectedPeriod,
          payment_method: 'Kredi Kartı'
        }])
        .select();
      if (eError) throw eError;
      setExpenses(prev => [...prev, eData[0]]);

      await logActivity(
        'Karttan Harcama', 
        `${spendData.card_name} kartından ${totalAmount.toLocaleString('tr-TR')} ₺ tutarında (${installments} Taksit - Aylık ${monthlyAmount.toLocaleString('tr-TR')} ₺) harcama yapıldı.`
      );

    } catch (err) {
      alert("Harcama kaydedilemedi: " + err.message);
    }
  };

  // MUTATOR 15: Add manual cash journal transaction
  const handleAddJournalTransaction = async (txData) => {
    try {
      const { data, error } = await supabase
        .from('finance_cash_journal')
        .insert([txData])
        .select();
      if (error) throw error;

      setCashJournal(prev => [...prev, data[0]]);
      await logActivity('Manuel İşlem Ekle', `${txData.account} hesabına ${txData.type === 'Giriş' ? '+' : '-'}${txData.amount.toLocaleString('tr-TR')} ₺ tutarında işlem yapıldı.`);
    } catch (err) {
      alert("İşlem eklenemedi: " + err.message);
    }
  };

  // MUTATOR 16: Delete cash journal transaction
  const handleDeleteJournalTransaction = async (txId) => {
    try {
      const tx = cashJournal.find(t => t.id === txId);
      await supabase.from('finance_cash_journal').delete().eq('id', txId);
      setCashJournal(prev => prev.filter(t => t.id !== txId));
      if (tx) {
        await logActivity('İşlem Hareketi Silindi', `${tx.description} açıklamalı kasa/banka hareketi silindi.`);
      }
    } catch (err) {
      alert("İşlem silinemedi: " + err.message);
    }
  };

  // MUTATOR 17: Add new client
  const handleAddClient = async (clientData) => {
    try {
      const metricsObj = {
        client_code: clientData.client_code,
        package: clientData.package,
        monthly_fee: clientData.monthly_fee,
        payment_day: clientData.payment_day,
        exempt_from_commission: clientData.exempt_from_commission,
        commission_rate: clientData.commission_rate,
        assigned_staff_ids: clientData.assigned_staff_ids,
        durum: 'aktif'
      };

      const payload = {
        name: clientData.name,
        metrics: metricsObj
      };

      let { data } = await supabase
        .from('active_clients')
        .insert([payload])
        .select();

      const createdObj = (data && data[0]) ? { ...data[0], ...metricsObj } : { id: 'c_' + Date.now(), name: clientData.name, ...metricsObj };
      setClients(prev => [...prev, createdObj]);
      await logActivity(
        'Müşteri Eklendi', 
        `${clientData.name} (${clientData.client_code}) firması yeni cari olarak sisteme tanımlandı.`,
        clientData.name
      );
    } catch (err) {
      alert("Müşteri eklenemedi: " + err.message);
    }
  };

  // MUTATOR 19: Delete (deactivate) a client
  const handleDeleteClient = async (clientId) => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      // Soft delete: set durum to 'pasif'
      const { error } = await supabase
        .from('active_clients')
        .update({ durum: 'pasif' })
        .eq('id', clientId);
      if (error) throw error;

      // Remove from local state
      setClients(prev => prev.filter(c => c.id !== clientId));

      await logActivity(
        'Müşteri Silindi', 
        `${client.name} (${client.client_code || '-'}) firması sistemden kaldırıldı.`,
        client.name
      );
    } catch (err) {
      alert("Müşteri silinemedi: " + err.message);
    }
  };

  // MUTATOR 18: Add new staff
  const handleAddStaff = async (staffData) => {
    try {
      const payload = {
        display_name: staffData.display_name,
        username: staffData.username || staffData.display_name.toLowerCase().replace(/\s+/g, ''),
        role: staffData.role,
        class: staffData.class || 'Çalışan',
        base_salary: staffData.base_salary || 0,
        can_assign_task: staffData.can_assign_task ?? true,
        can_add_client: staffData.can_add_client ?? false
      };

      let { data, error } = await supabase
        .from('employees')
        .insert([payload])
        .select();

      if (error && error.code === '23505') {
        const nextId = staff.length > 0 ? Math.max(...staff.map(s => Number(s.id) || 0)) + 100 : 100;
        const res = await supabase
          .from('employees')
          .insert([{ id: nextId, ...payload }])
          .select();
        data = res.data;
        error = res.error;
      }

      if (error) throw error;

      setStaff(prev => [...prev, data[0]]);
      await logActivity(
        'Personel Eklendi', 
        `${staffData.display_name} personeli sisteme tanımlandı.`,
        staffData.display_name
      );
    } catch (err) {
      alert("Personel eklenemedi: " + err.message);
    }
  };

  // MUTATOR 20: Delete staff
  const handleDeleteStaff = async (staffId) => {
    try {
      const member = staff.find(s => s.id === staffId);
      const { error } = await supabase.from('employees').delete().eq('id', staffId);
      if (error) throw error;

      setStaff(prev => prev.filter(s => s.id !== staffId));
      await logActivity('Personel Silindi', `${member?.display_name || 'Personel'} sistemden silindi.`);
    } catch (err) {
      alert("Personel silinemedi: " + err.message);
    }
  };

  // Get period options for the last 12 months
  const getPeriodOptions = () => {
    const options = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      const yr = d.getFullYear();
      const mth = String(d.getMonth() + 1).padStart(2, '0');
      const val = `${yr}-${mth}`;
      
      const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
      ];
      const lbl = `${monthNames[d.getMonth()]} ${yr}`;
      
      options.push({ value: val, label: lbl });
      d.setMonth(d.getMonth() - 1);
    }
    return options;
  };

  if (!isAuthenticated) {
    return (
      <LoginLockScreen 
        userPasswords={userPasswords} 
        onLoginSuccess={(userObj) => {
          setAuthUser(userObj);
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation (8 Pages) */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="logo-container">
          <div className="logo-icon">S</div>
          <div>
            <div className="logo-text">SocialArt</div>
            <div className="logo-subtitle">FINANCE</div>
          </div>
        </div>

        <ul className="nav-menu" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={16} />
              <span>1. Dashboard</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'clients' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('clients')}>
              <Users size={16} />
              <span>2. Müşteri Cari</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'revenues' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('revenues')}>
              <DollarSign size={16} />
              <span>3. Gelirler (Kasa G.)</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'expenses' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('expenses')}>
              <Tag size={16} />
              <span>4. Giderler</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('employees')}>
              <Users size={16} />
              <span>5. Personel Takibi</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('cards')}>
              <CreditCard size={16} />
              <span>6. Kredi Kartı T.</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'cash' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('cash')}>
              <Landmark size={16} />
              <span>7. Kasa / Banka</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('logs')} style={{ opacity: 0.75 }}>
              <Activity size={15} />
              <span>8. İşlem Logları</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('projects')}>
              <Film size={16} />
              <span>9. Prodüksiyon Projeleri</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'recurring' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('recurring')}>
              <RefreshCcw size={16} />
              <span>10. Sabit Gider Takvimi</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'growth' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('growth')}>
              <BarChart2 size={16} />
              <span>11. Büyüme Raporu</span>
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="month-picker-container">
            <span className="month-picker-label">Dönem Seçimi</span>
            <select 
              className="select-custom"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              {getPeriodOptions().map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-sidebar-backdrop" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Mobile Top Header */}
        <div className="mobile-top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="logo-icon" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>S</div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>SocialArt Finance</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid var(--border-light)',
              color: '#fff',
              padding: '0.4rem 0.6rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {/* Header Bar */}
        <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="header-title-group">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Ön Muhasebe Yönetim Paneli</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>SocialArt Ajans cari takibi, otomatik prim hesapları ve banka kasa entegrasyonu.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Dönem Pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-light)', padding: '0 12px', height: '36px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
              <Calendar size={14} style={{ color: '#06b6d4' }} />
              <span>Dönem: {getPeriodOptions().find(o => o.value === selectedPeriod)?.label || selectedPeriod}</span>
            </div>

            {/* Quick Switch Links */}
            <a 
              href="/admin/crm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '0 12px',
                height: '36px',
                borderRadius: '8px',
                color: '#a5b4fc',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Rocket size={14} /> CRM Paneli
            </a>

            <a 
              href="/admin/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0 12px',
                height: '36px',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Home size={14} /> Admin Paneli
            </a>

            {/* Logged in User Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(168, 85, 247, 0.12)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              padding: '0 12px',
              height: '36px',
              borderRadius: '8px',
              color: '#c084fc',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              <Users size={14} />
              <span>{authUser?.displayName || authUser?.username || 'Yönetici'}</span>
            </div>

            {/* Action Buttons */}
            <button 
              onClick={() => setShowChangePasswordModal(true)}
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: '#818cf8',
                padding: '0 12px',
                height: '36px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              title="Şifrenizi Değiştirin"
            >
              <KeyRound size={14} />
              <span>Şifre Değiştir</span>
            </button>

            <button 
              onClick={handleLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                padding: '0 12px',
                height: '36px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              title="Güvenli Çıkış Yap"
            >
              <LogOut size={14} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-banner" style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)' }}>
            <AlertCircle className="alert-banner-icon" />
            <div>
              <strong>Bağlantı Hatası:</strong> {error}
              <button 
                onClick={fetchData} 
                style={{ marginLeft: '12px', background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
              >
                Yeniden Dene
              </button>
            </div>
          </div>
        )}

        {/* Tab Components wrapped in ErrorBoundary */}
        <ErrorBoundary key={activeTab}>
          {activeTab === 'dashboard' && (
            <DashboardView 
              clients={clients}
              productionProjects={productionProjects}
              staff={staff}
              clientPayments={clientPayments}
              expenses={expenses}
              staffPayments={staffPayments}
              taxes={taxes}
              creditCards={creditCards}
              cashJournal={cashJournal}
              period={selectedPeriod}
              setTab={setActiveTab}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsView 
              clients={clients}
              staff={staff}
              clientPayments={clientPayments}
              expenses={expenses}
              period={selectedPeriod}
              onRecordPayment={handleRecordClientPayment}
              onUpdateContract={handleUpdateClientContract}
              onAddClient={handleAddClient}
              onDeleteClient={handleDeleteClient}
              onAddExpense={handleAddExpense}
              isLoading={isLoading}
            />
          )}

          {(activeTab === 'income' || activeTab === 'revenues') && (
            <GelirlerView 
              clients={clients}
              clientPayments={clientPayments}
              productionProjects={productionProjects}
              period={selectedPeriod}
              onRecordPayment={handleRecordClientPayment}
              onDeletePayment={handleDeleteClientPayment}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'expenses' && (
            <GiderlerView 
              expenses={expenses}
              staff={staff}
              staffPayments={staffPayments}
              period={selectedPeriod}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'employees' && (
            <PersonelView 
              staff={staff}
              staffPayments={staffPayments}
              clients={clients}
              clientPayments={clientPayments}
              period={selectedPeriod}
              onRecordStaffPayment={handleRecordStaffPayment}
              onResetStaffPayment={handleResetStaffPayment}
              onAddBonus={handleAddBonus}
              onUpdateBaseSalary={handleUpdateBaseSalary}
              onAddStaff={handleAddStaff}
              onDeleteStaff={handleDeleteStaff}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'cards' && (
            <CreditCardView 
              creditCards={creditCards}
              period={selectedPeriod}
              onRecordCardPayment={handleRecordCardPayment}
              onRecordCardSpend={handleRecordCardSpend}
              onAddCard={handleAddCard}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'cash' && (
            <CashJournalView 
              cashJournal={cashJournal}
              period={selectedPeriod}
              onAddJournalTransaction={handleAddJournalTransaction}
              onDeleteJournalTransaction={handleDeleteJournalTransaction}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'logs' && (
            <ActivityLogView />
          )}

          {activeTab === 'projects' && (
            <ProductionProjectsView 
              clients={clients}
              period={selectedPeriod}
              onAddExpense={handleAddExpense}
              onRecordClientPayment={handleRecordClientPayment}
            />
          )}

          {activeTab === 'recurring' && (
            <RecurringExpensesView 
              period={selectedPeriod}
              onAddExpense={handleAddExpense}
            />
          )}

          {activeTab === 'growth' && (
            <FinancialGrowthView 
              clientPayments={clientPayments}
              expenses={expenses}
              staffPayments={staffPayments}
              taxes={taxes}
              period={selectedPeriod}
            />
          )}

          {showChangePasswordModal && (
            <ChangePasswordModal 
              onClose={() => setShowChangePasswordModal(false)}
              authUser={authUser}
              userPasswords={userPasswords}
              onUpdatePassword={handleUpdateAdminPassword}
            />
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}
