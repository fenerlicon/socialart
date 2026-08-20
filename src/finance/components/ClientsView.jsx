import React, { useState } from 'react';
import { Search, DollarSign, Calendar, Edit, Plus, FileText, CheckCircle, Clock, Percent, ShieldAlert, Trash2, AlertTriangle, Eye, TrendingUp, TrendingDown, ShieldCheck, FileSpreadsheet, PieChart } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';

export default function ClientsView({ 
  clients, 
  staff = [],
  clientPayments, 
  expenses = [],
  period, 
  onRecordPayment, 
  onUpdateContract,
  onAddClient,
  onDeleteClient,
  onAddExpense,
  isLoading 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [hardCategoryFilter, setHardCategoryFilter] = useState('all'); // 'all', 'social', 'production'
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'profitability'

  // Add Client Form State
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCode, setNewClientCode] = useState('');
  const [newClientPackage, setNewClientPackage] = useState('');
  const [newClientCategory, setNewClientCategory] = useState('social'); // 'social', 'production', 'other'
  const [newClientFee, setNewClientFee] = useState('0');
  const [newClientDay, setNewClientDay] = useState('1');
  const [newExempt, setNewExempt] = useState(false);
  const [newRate, setNewRate] = useState('10');
  const [newAssignedStaffIds, setNewAssignedStaffIds] = useState([]);

  // Modals state
  const [selectedClientForPayment, setSelectedClientForPayment] = useState(null);
  const [selectedClientForContract, setSelectedClientForContract] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [selectedClientDetail, setSelectedClientDetail] = useState(null);
  
  // Custom Transaction State inside Client Detail Modal
  const [customTxType, setCustomTxType] = useState('Gelir'); // 'Gelir' or 'Gider'
  const [customTxAmount, setCustomTxAmount] = useState('');
  const [customTxDate, setCustomTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [customTxAccount, setCustomTxAccount] = useState('Banka');
  const [customTxNotes, setCustomTxNotes] = useState('');
  const [customTxKdvRate, setCustomTxKdvRate] = useState('20');
  const [customTxKdvExempt, setCustomTxKdvExempt] = useState(false);
  
  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState('Havale'); // Havale, EFT, Kredi Kartı, Nakit
  const [paymentAccount, setPaymentAccount] = useState('Banka'); // Banka, Kasa
  const [paymentNotes, setPaymentNotes] = useState('');
  const [kdvRate, setKdvRate] = useState('20');
  const [iyzicoRate, setIyzicoRate] = useState('4.29');
  
  // Contract Form State
  const [contractFee, setContractFee] = useState('');
  const [contractDay, setContractDay] = useState('1');
  const [clientCode, setClientCode] = useState('');
  const [commissionRate, setCommissionRate] = useState('10');
  const [exemptFromCommission, setExemptFromCommission] = useState(false);
  const [assignedStaffIds, setAssignedStaffIds] = useState([]);

  // Parse Year/Month
  const [year, month] = period.split('-');
  const today = new Date();
  const currentDay = today.getFullYear() === parseInt(year) && (today.getMonth() + 1) === parseInt(month)
    ? today.getDate()
    : 31;

  // Process clients
  const processedClients = clients
    .filter(c => c.durum === 'aktif' || !c.durum)
    .map(client => {
      const payments = clientPayments.filter(p => p.client_id === client.id);
      const totalPaid = payments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
      const fee = parseFloat(client.monthly_fee) || 0;
      
      const isPaid = totalPaid >= fee && fee > 0;
      const isPartial = totalPaid > 0 && totalPaid < fee;
      
      const isOverdue = !isPaid && currentDay > (client.payment_day || 1);
      const delayDays = isOverdue ? currentDay - (client.payment_day || 1) : 0;
      
      let status = 'unpaid';
      if (isPaid) status = 'paid';
      else if (isPartial) status = 'partial';
      
      if (isOverdue) status = 'overdue';

      return {
        ...client,
        totalPaid,
        remaining: Math.max(0, fee - totalPaid),
        payments,
        status,
        delayDays
      };
    });

  // Category Helper
  const getClientCategory = (client) => {
    if (client.client_code === 'DIGER' || client.name?.toLowerCase().includes('harici gelir') || client.name?.toLowerCase().includes('tanımsız')) {
      return 'other';
    }
    const pkg = (client.package || '').toLowerCase();
    if (pkg.includes('prodük') || pkg.includes('film') || pkg.includes('çekim') || pkg.includes('klip') || pkg.includes('spot') || pkg.includes('kamera')) {
      return 'production';
    }
    // Default all agency retainers (Reels, Story, Gönderi, Grafik, Post, Sosyal Medya, Business vb.) to Social Media
    return 'social';
  };

  // Filters
  const filteredClients = processedClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (client.client_code && client.client_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (client.package && client.package.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    // 1. Hard Category Filter (Sosyal Medya vs Prodüksiyon vs Diğer)
    const cat = getClientCategory(client);
    if (hardCategoryFilter === 'social' && cat !== 'social') return false;
    if (hardCategoryFilter === 'production' && cat !== 'production') return false;
    if (hardCategoryFilter === 'other' && cat !== 'other') return false;

    // 2. Status Filter
    if (statusFilter === 'all') return true;
    if (statusFilter === 'paid') return client.status === 'paid';
    if (statusFilter === 'partial') return client.status === 'partial';
    if (statusFilter === 'unpaid') return client.status === 'unpaid';
    if (statusFilter === 'overdue') return client.delayDays > 0;
    
    return true;
  });

  // Profitability Calculation Helper (Feature 3)
  const getClientProfitability = (client) => {
    const revenue = parseFloat(client.monthly_fee) || 0;
    
    // Staff Labor Cost
    const assignedIds = client.assigned_staff_ids || [];
    let totalStaffCost = 0;
    assignedIds.forEach(staffId => {
      const s = staff.find(st => Number(st.id) === Number(staffId));
      if (s) {
        const count = clients.filter(cl => (cl.assigned_staff_ids || []).map(Number).includes(Number(staffId))).length || 1;
        const base = parseFloat(s.base_salary) || 0;
        totalStaffCost += (base / count);
      }
    });

    // Client specific direct expenses
    const nameLower = (client.name || '').toLowerCase();
    const clientExpensesTotal = expenses
      .filter(e => e.description && e.description.toLowerCase().includes(nameLower))
      .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

    const totalCost = totalStaffCost + clientExpensesTotal;
    const netProfit = revenue - totalCost;
    const margin = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;

    let badge = { text: '🟢 Yüksek Karlı', color: '#10b981', bg: 'rgba(16,185,129,0.12)' };
    if (margin < 30 || netProfit < 0) {
      badge = { text: '🔴 İncelemeli / Düşük Kar', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
    } else if (margin < 60) {
      badge = { text: '🟡 Dengeli Kar', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
    }

    return { revenue, totalStaffCost, clientExpensesTotal, totalCost, netProfit, margin, badge };
  };

  // Export to Excel Handler (Feature 6)
  const handleExportClientsExcel = () => {
    const headers = [
      { label: "Cari Kod", accessor: c => c.client_code || "-" },
      { label: "Müşteri Ünvanı", accessor: c => c.name },
      { label: "Kategori", accessor: c => getClientCategory(c) === 'social' ? 'Sosyal Medya' : getClientCategory(c) === 'production' ? 'Prodüksiyon' : 'Diğer' },
      { label: "Paket / Hizmet", accessor: c => c.package || "-" },
      { label: "Sözleşme Bedeli (TL)", accessor: c => c.monthly_fee },
      { label: "Tahsil Edilen (TL)", accessor: c => c.totalPaid },
      { label: "Kalan Borç (TL)", accessor: c => c.remaining },
      { label: "Durum", accessor: c => c.status === 'paid' ? 'Ödendi' : c.status === 'partial' ? 'Kısmi Ödendi' : 'Ödenmedi' }
    ];
    exportToCSV(`SocialArt_Musteri_Listesi_${period}`, headers, filteredClients);
  };

  // Open Payment Modal
  const openPaymentModal = (client) => {
    setSelectedClientForPayment(client);
    setPaymentAmount(client.remaining.toString());
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentType('Havale');
    setPaymentAccount('Banka');
    setPaymentNotes('');
    setKdvRate('20');
  };

  // Open Contract Modal
  const openContractModal = (client) => {
    setSelectedClientForContract(client);
    setContractFee(client.monthly_fee.toString());
    setContractDay(client.payment_day ? client.payment_day.toString() : '1');
    setClientCode(client.client_code || '');
    setCommissionRate(client.commission_rate ? client.commission_rate.toString() : '10');
    setExemptFromCommission(client.exempt_from_commission || false);
    
    // Parse assigned staff IDs (handles array or string formats)
    let staffIds = [];
    if (client.assigned_staff_ids) {
      if (Array.isArray(client.assigned_staff_ids)) {
        staffIds = client.assigned_staff_ids.map(Number);
      } else {
        try {
          staffIds = JSON.parse(client.assigned_staff_ids).map(Number);
        } catch (e) {
          staffIds = [];
        }
      }
    }
    setAssignedStaffIds(staffIds);
  };

  // Handle Payment Submit
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedClientForPayment || !paymentAmount || parseFloat(paymentAmount) <= 0) return;
    
    const isCC = (paymentType || '').toLowerCase().includes('kredi') || (paymentType || '').toLowerCase().includes('kart');
    const rate = isCC ? parseFloat(iyzicoRate || 2.99) : 0;
    const iyzicoAmt = isCC ? Math.round(((parseFloat(paymentAmount) || 0) * (rate / 100)) * 100) / 100 : 0;

    onRecordPayment({
      client_id: selectedClientForPayment.id,
      amount: parseFloat(paymentAmount),
      payment_date: paymentDate,
      payment_type: paymentType,
      payment_account: paymentAccount, // pass Banka or Kasa
      period,
      notes: paymentNotes,
      kdv_rate: parseFloat(kdvRate || 20),
      iyzico_rate: rate,
      iyzico_amount: iyzicoAmt
    });
    
    setSelectedClientForPayment(null);
  };

  // Handle Contract Submit
  const handleContractSubmit = (e) => {
    e.preventDefault();
    if (!selectedClientForContract || !contractFee || parseFloat(contractFee) < 0) return;
    
    onUpdateContract({
      id: selectedClientForContract.id,
      monthly_fee: parseFloat(contractFee),
      payment_day: parseInt(contractDay),
      client_code: clientCode,
      commission_rate: parseFloat(commissionRate),
      exempt_from_commission: exemptFromCommission,
      assigned_staff_ids: assignedStaffIds
    });
    
    setSelectedClientForContract(null);
  };

  // Toggle staff in checklist
  const toggleStaffSelection = (staffId) => {
    const id = Number(staffId);
    if (assignedStaffIds.includes(id)) {
      setAssignedStaffIds(prev => prev.filter(x => x !== id));
    } else {
      setAssignedStaffIds(prev => [...prev, id]);
    }
  };
  // Open Add Client Modal
  const openAddClientModal = () => {
    // Generate next client code
    const codes = clients.map(c => c.client_code).filter(Boolean);
    let nextNum = 1;
    codes.forEach(c => {
      const match = c.match(/M0*(\d+)/i);
      if (match) {
        const val = parseInt(match[1]);
        if (val >= nextNum) nextNum = val + 1;
      }
    });
    const code = 'M' + String(nextNum).padStart(3, '0');
    setNewClientCode(code);
    setNewClientName('');
    setNewClientPackage('');
    setNewClientCategory(hardCategoryFilter === 'all' ? 'social' : hardCategoryFilter);
    setNewClientFee('0');
    setNewClientDay('1');
    setNewExempt(false);
    setNewRate('10');
    setNewAssignedStaffIds([]);
    setShowAddClientModal(true);
  };

  // Handle Add Client Submit
  const handleAddClientSubmit = (e) => {
    e.preventDefault();
    if (!newClientName || !newClientCode) return;

    let finalPackage = newClientPackage.trim();
    if (newClientCategory === 'other') {
      if (!finalPackage.toLowerCase().includes('diğer') && !finalPackage.toLowerCase().includes('harici')) {
        finalPackage = finalPackage ? `Diğer - ${finalPackage}` : 'Diğer / Harici Hizmet';
      }
    } else if (newClientCategory === 'production') {
      if (!finalPackage.toLowerCase().includes('prodük') && !finalPackage.toLowerCase().includes('çekim') && !finalPackage.toLowerCase().includes('film')) {
        finalPackage = finalPackage ? `Prodüksiyon - ${finalPackage}` : 'Prodüksiyon & Çekim Hizmeti';
      }
    } else {
      if (!finalPackage) {
        finalPackage = 'Sosyal Medya Yönetimi';
      }
    }

    onAddClient({
      name: newClientName,
      client_code: newClientCode,
      package: finalPackage,
      monthly_fee: parseFloat(newClientFee || 0),
      payment_day: parseInt(newClientDay),
      exempt_from_commission: newExempt,
      commission_rate: parseFloat(newRate || 10),
      assigned_staff_ids: newAssignedStaffIds
    });
    setShowAddClientModal(false);
  };

  // Toggle staff in new client checklist
  const toggleNewStaffSelection = (staffId) => {
    const id = Number(staffId);
    if (newAssignedStaffIds.includes(id)) {
      setNewAssignedStaffIds(prev => prev.filter(x => x !== id));
    } else {
      setNewAssignedStaffIds(prev => [...prev, id]);
    }
  };

  return (
    <div className="clients-view">
      {/* Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Müşteri adı, kodu veya paket ara..." 
            className="form-input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select 
            className="select-custom" 
            style={{ width: 'auto', padding: '0.5rem 2rem 0.5rem 1rem', border: '1px solid #818cf8', color: '#818cf8', fontWeight: 600 }}
            value={hardCategoryFilter}
            onChange={(e) => setHardCategoryFilter(e.target.value)}
          >
            <option value="all">📌 Tüm Hizmet Türleri</option>
            <option value="social">📱 Sosyal Medya Müşterileri</option>
            <option value="production">🎬 Prodüksiyon Müşterileri</option>
            <option value="other">📦 Diğer / Harici Müşteriler</option>
          </select>

          <select 
            className="select-custom" 
            style={{ width: 'auto', padding: '0.5rem 2rem 0.5rem 1rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="paid">Ödenenler</option>
            <option value="partial">Kısmi Ödenenler</option>
            <option value="unpaid">Ödenmeyenler</option>
            <option value="overdue">Ödeme Günü Gecikenler</option>
          </select>
          {/* Sub-tab view mode selector */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-light)' }}>
            <button 
              type="button"
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('list')}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', border: 'none' }}
            >
              <FileText size={14} />
              <span>Cari Listesi</span>
            </button>
            <button 
              type="button"
              className={`btn btn-sm ${viewMode === 'profitability' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('profitability')}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', border: 'none' }}
            >
              <PieChart size={14} />
              <span>Karlılık Analizi</span>
            </button>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleExportClientsExcel}
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem', height: '38px', borderRadius: '8px', gap: '6px' }}
          >
            <FileSpreadsheet size={15} style={{ color: '#10b981' }} />
            <span>Excel'e Aktar</span>
          </button>

          <button type="button" className="btn btn-primary" onClick={openAddClientModal} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', height: '38px', borderRadius: '8px' }}>
            <Plus size={15} />
            <span>Yeni Müşteri</span>
          </button>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <span>Müşteri verileri yükleniyor...</span>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} style={{ color: 'var(--text-muted)' }} />
            <h4 className="empty-state-title">Müşteri Bulunamadı</h4>
            <p>Aradığınız kriterlere uygun aktif cari bulunmamaktadır.</p>
          </div>
        ) : viewMode === 'profitability' ? (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Kod</th>
                  <th>Müşteri Ünvanı</th>
                  <th>Sözleşme Geliri</th>
                  <th>Atanan Personel Gider Payı</th>
                  <th>Müşteriye Özel Giderler</th>
                  <th>Toplam Maliyet</th>
                  <th>Net Kar (₺)</th>
                  <th>Kar Marjı (%)</th>
                  <th>Karlılık Durumu</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(client => {
                  const prof = getClientProfitability(client);
                  return (
                    <tr key={client.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-secondary)' }}>
                        {client.client_code || '-'}
                      </td>
                      <td style={{ fontWeight: 700, color: '#fff' }}>
                        {client.name}
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>{client.package || 'Paketsiz'}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#38bdf8' }}>
                        {prof.revenue.toLocaleString('tr-TR')} ₺
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {prof.totalStaffCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {prof.clientExpensesTotal.toLocaleString('tr-TR')} ₺
                      </td>
                      <td style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                        -{prof.totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                      </td>
                      <td style={{ fontWeight: 800, color: prof.netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                        {prof.netProfit >= 0 ? '+' : ''}{prof.netProfit.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                      </td>
                      <td style={{ fontWeight: 800, color: prof.margin >= 60 ? '#10b981' : prof.margin >= 30 ? '#f59e0b' : '#ef4444' }}>
                        %{prof.margin}
                      </td>
                      <td>
                        <span className="badge" style={{ background: prof.badge.bg, color: prof.badge.color, fontWeight: 700 }}>
                          {prof.badge.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Kod</th>
                  <th>Müşteri & Paket</th>
                  <th>Sözleşme Bedeli</th>
                  <th>Vade Günü</th>
                  <th>Ödenen</th>
                  <th>Kalan Borç</th>
                  <th>Prim Durumu</th>
                  <th>Durum</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(client => (
                  <tr key={client.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-secondary)' }}>
                      {client.client_code || '-'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{client.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {client.package || 'Hizmet Tanımsız'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {(parseFloat(client.monthly_fee) || 0).toLocaleString('tr-TR')} ₺
                    </td>
                    <td>
                      Her ayın {client.payment_day || 1}. günü
                    </td>
                    <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                      {client.totalPaid > 0 ? `${client.totalPaid.toLocaleString('tr-TR')} ₺` : '-'}
                    </td>
                    <td style={{ color: client.remaining > 0 ? 'var(--color-warning)' : 'inherit', fontWeight: client.remaining > 0 ? 600 : 400 }}>
                      {client.remaining > 0 ? `${client.remaining.toLocaleString('tr-TR')} ₺` : 'Ödeme Tamam'}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {client.exempt_from_commission ? (
                        <span style={{ color: 'var(--text-muted)' }}>Muaf</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>%{client.commission_rate || 10} Prim</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {client.assigned_staff_ids && (Array.isArray(client.assigned_staff_ids) ? client.assigned_staff_ids.length : JSON.parse(client.assigned_staff_ids || '[]').length)} Personel
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      {client.status === 'paid' && <span className="badge badge-paid">Ödendi</span>}
                      {client.status === 'partial' && <span className="badge badge-partial">Kısmi Ödendi</span>}
                      {client.status === 'unpaid' && client.delayDays === 0 && <span className="badge badge-unpaid">Bekliyor</span>}
                      {client.delayDays > 0 && (
                        <span className="badge badge-overdue">{client.delayDays} Gün Gecikti</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedClientDetail(client)}
                          style={{ border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc' }}
                          title="Müşteri Detayları ve Proje Harcamaları"
                        >
                          <Eye size={13} />
                          <span>Detay</span>
                        </button>

                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => openContractModal(client)}
                        >
                          <Edit size={13} />
                          <span>Cari Kart</span>
                        </button>
                        
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => openPaymentModal(client)}
                          disabled={client.remaining === 0}
                          style={{ opacity: client.remaining === 0 ? 0.5 : 1 }}
                        >
                          <DollarSign size={13} />
                          <span>Ödeme Al</span>
                        </button>

                        <button 
                          className="btn btn-sm"
                          onClick={() => setClientToDelete(client)}
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
                          title="Müşteriyi Sil"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: RECORD CLIENT PAYMENT */}
      {selectedClientForPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Müşteri Tahsilat Kaydı</h2>
              <button className="modal-close" onClick={() => setSelectedClientForPayment(null)}>×</button>
            </div>
            
            <form onSubmit={handlePaymentSubmit}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MÜŞTERİ</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0' }}>{selectedClientForPayment.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aylık Sözleşme Bedeli</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{(parseFloat(selectedClientForPayment.monthly_fee) || 0).toLocaleString('tr-TR')} ₺</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bu Ay Yapılan Ödeme</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-success)' }}>{(parseFloat(selectedClientForPayment.totalPaid) || 0).toLocaleString('tr-TR')} ₺</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kalan Borç (Öncesi)</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-warning)' }}>{(parseFloat(selectedClientForPayment.remaining) || 0).toLocaleString('tr-TR')} ₺</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ödeme Sonrası Kalan</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: (selectedClientForPayment.remaining - (parseFloat(paymentAmount) || 0)) > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {Math.max(0, selectedClientForPayment.remaining - (parseFloat(paymentAmount) || 0)).toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Ödeme Tutarı (₺)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    placeholder="Tutarı girin..."
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={selectedClientForPayment.remaining}
                    min="1"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">KDV Oranı (%)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    value={kdvRate}
                    onChange={(e) => setKdvRate(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* KDV Calculation Display */}
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <div>
                  <span className="text-secondary">Düşülecek KDV:</span>{' '}
                  <strong style={{ color: 'var(--color-warning)' }}>
                    {((parseFloat(paymentAmount) || 0) * (parseFloat(kdvRate) || 0) / (100 + (parseFloat(kdvRate) || 0))).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                  </strong>
                </div>
                <div>
                  <span className="text-secondary">Net Gelir:</span>{' '}
                  <strong style={{ color: 'var(--color-success)' }}>
                    {((parseFloat(paymentAmount) || 0) - ((parseFloat(paymentAmount) || 0) * (parseFloat(kdvRate) || 0) / (100 + (parseFloat(kdvRate) || 0)))).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                  </strong>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ödeme Tarihi</label>
                <input 
                  type="date" 
                  className="form-input" 
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Ödeme Türü</label>
                  <select 
                    className="select-custom" 
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                  >
                    <option value="Havale">Havale</option>
                    <option value="EFT">EFT</option>
                    <option value="Kredi Kartı">Kredi Kartı</option>
                    <option value="Nakit">Nakit</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Giriş Yapılacak Hesap</label>
                  <select 
                    className="select-custom" 
                    value={paymentAccount}
                    onChange={(e) => setPaymentAccount(e.target.value)}
                  >
                    <option value="Banka">Banka Hesabı</option>
                    <option value="Kasa">Elden (Kasa)</option>
                  </select>
                </div>
              </div>

              {paymentType === 'Kredi Kartı' && (
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>
                      💳 iyzico / Sanal POS Komisyon Kesintisi
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Komisyon Oranı (%):</span>
                      <input 
                        type="number" 
                        step="0.01"
                        className="form-input" 
                        style={{ width: '70px', padding: '2px 6px', height: '28px', fontSize: '0.8rem', textAlign: 'center' }}
                        value={iyzicoRate}
                        onChange={(e) => setIyzicoRate(e.target.value)}
                        min="0"
                        max="30"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <div>
                      <span className="text-secondary">Düşülecek iyzico Payı:</span>{' '}
                      <strong style={{ color: 'var(--color-danger)' }}>
                        -{((parseFloat(paymentAmount) || 0) * (parseFloat(iyzicoRate) || 0) / 100).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                      </strong>
                    </div>
                    <div>
                      <span className="text-secondary">Hesaba Geçen Net Ajans Bakiyesi:</span>{' '}
                      <strong style={{ color: 'var(--color-success)' }}>
                        {((parseFloat(paymentAmount) || 0) - ((parseFloat(paymentAmount) || 0) * (parseFloat(iyzicoRate) || 0) / 100)).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Notlar (Opsiyonel)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Fatura no veya banka notu..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedClientForPayment(null)}>İptal</button>
                <button type="submit" className="btn btn-primary">Ödemeyi Al</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CLIENT CARI CARD & COMMISSIONS */}
      {selectedClientForContract && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px', maxHeight: '88vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Müşteri Cari & Prim Ayarları</h2>
              <button className="modal-close" onClick={() => setSelectedClientForContract(null)}>×</button>
            </div>
            
            <form onSubmit={handleContractSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Cari Kod</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    value={clientCode}
                    onChange={(e) => setClientCode(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Müşteri Ünvanı</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    disabled 
                    value={selectedClientForContract.name}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Aylık Sözleşme Bedeli (₺)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    value={contractFee}
                    onChange={(e) => setContractFee(e.target.value)}
                    min="0"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Vade Günü (Giriş Günü)</label>
                  <select 
                    className="select-custom"
                    value={contractDay}
                    onChange={(e) => setContractDay(e.target.value)}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>Her Ayın {day}. Günü</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Commission Section */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="form-label" style={{ margin: 0 }}>Personel Prim Dağılımı</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <input 
                      type="checkbox" 
                      checked={exemptFromCommission} 
                      onChange={(e) => setExemptFromCommission(e.target.checked)} 
                    />
                    <span>Primden Muaf Tut</span>
                  </label>
                </div>

                {!exemptFromCommission && (
                  <>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Prim Oranı (%)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        required
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(e.target.value)}
                        min="0"
                        max="100"
                      />
                    </div>

                    <label className="form-label">Prim Alacak Personeller</label>
                    <div className="staff-checkbox-grid">
                      {staff.map(s => {
                        const isChecked = assignedStaffIds.includes(Number(s.id));
                        return (
                          <div 
                            key={s.id} 
                            className={`staff-checkbox-item ${isChecked ? 'checked' : ''}`}
                            onClick={() => toggleStaffSelection(s.id)}
                          >
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              readOnly
                              style={{ cursor: 'pointer' }}
                            />
                            <span>{s.display_name}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Seçilen personellere, bu müşterinin sözleşme bedeli üzerinden yukarıda yazan oranda (%{commissionRate}) otomatik prim yansıtılır.
                    </p>
                  </>
                )}
                {exemptFromCommission && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '8px', padding: '0.75rem', color: '#fde68a', fontSize: '0.8rem' }}>
                    <ShieldAlert size={16} style={{ color: 'var(--color-warning)' }} />
                    <span>Bu müşteri primden muaf tutulmuştur. Ödemelerinden personele otomatik prim yansıtılmaz.</span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedClientForContract(null)}>İptal</button>
                <button type="submit" className="btn btn-primary">Değişiklikleri Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLIENT DETAIL & CUSTOM GELİR / GİDER EKLEME */}
      {selectedClientDetail && (() => {
        const clientPaymentsList = clientPayments.filter(p => p.client_id === selectedClientDetail.id);
        const clientExpensesList = expenses.filter(e => e.description?.toLowerCase().includes(selectedClientDetail.name.toLowerCase()));
        const totalClientIncome = clientPaymentsList.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
        const totalClientExpense = clientExpensesList.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
        const netClientBalance = totalClientIncome - totalClientExpense;

        const handleCustomTxSubmit = (e) => {
          e.preventDefault();
          if (!customTxAmount || parseFloat(customTxAmount) <= 0) return;

          if (customTxType === 'Gelir') {
            onRecordPayment({
              client_id: selectedClientDetail.id,
              amount: parseFloat(customTxAmount),
              payment_date: customTxDate,
              payment_type: 'Havale',
              payment_account: customTxAccount,
              period,
              notes: customTxNotes || 'Müşteri Tahsilatı / Ekstra Gelir',
              kdv_rate: customTxKdvExempt ? 0 : parseFloat(customTxKdvRate || 20)
            });
          } else if (onAddExpense) {
            onAddExpense({
              expense_date: customTxDate,
              category: 'Ofis Gideri',
              amount: parseFloat(customTxAmount),
              period,
              payment_method: customTxAccount,
              description: `[${selectedClientDetail.name}] ${customTxNotes || 'Müşteri Proje Gideri'}`
            });
          }

          setCustomTxAmount('');
          setCustomTxNotes('');
        };

        return (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '8px', borderRadius: '10px' }}>
                    <Eye size={20} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedClientDetail.name}</h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {selectedClientDetail.client_code || 'Kodsuz'} · {selectedClientDetail.package || 'Hizmet Tanımsız'}
                    </span>
                  </div>
                </div>
                <button className="modal-close" onClick={() => setSelectedClientDetail(null)}>×</button>
              </div>

              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.85rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>TOPLAM TAHSİLAT (GELİR)</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-success)', marginTop: '3px' }}>
                    {totalClientIncome.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.85rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>PROJE GİDERLERİ</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-danger)', marginTop: '3px' }}>
                    {totalClientExpense.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
                <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '0.85rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>NET MARJ / KÂR</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: netClientBalance >= 0 ? '#818cf8' : '#f87171', marginTop: '3px' }}>
                    {netClientBalance.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              </div>

              {/* Form: Müşteriye Özel Gelir/Gider Ekle */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
                  ➕ Müşteriye Özel Yeni İşlem Ekle (Gelir / Gider)
                </h4>
                <form onSubmit={handleCustomTxSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', alignItems: 'end' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>İşlem Türü</label>
                      <select className="select-custom" style={{ height: '38px' }} value={customTxType} onChange={(e) => setCustomTxType(e.target.value)}>
                        <option value="Gelir">Tahsilat / Gelir (+)</option>
                        <option value="Gider">Proje Gideri / Harcama (-)</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>Tutar (₺)</label>
                      <input type="number" step="0.01" required className="form-input" style={{ height: '38px' }} placeholder="0.00" value={customTxAmount} onChange={(e) => setCustomTxAmount(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>Tarih</label>
                      <input type="date" required className="form-input" style={{ height: '38px' }} value={customTxDate} onChange={(e) => setCustomTxDate(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', alignItems: 'end' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>Açıklama (Reklam filmi, ekipman vb.)</label>
                      <input type="text" className="form-input" style={{ height: '38px' }} placeholder="Örn: Arayanvar reklam filmi harcaması" value={customTxNotes} onChange={(e) => setCustomTxNotes(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>Ödeme Hesabı</label>
                      <select className="select-custom" style={{ height: '38px' }} value={customTxAccount} onChange={(e) => setCustomTxAccount(e.target.value)}>
                        <option value="Banka">Banka Hesabı</option>
                        <option value="Kasa">Elden Kasa</option>
                        <option value="Kredi Kartı">Kredi Kartı</option>
                      </select>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', margin: 0 }}>KDV Oranı (%)</label>
                        <button type="button" onClick={() => { setCustomTxKdvExempt(!customTxKdvExempt); if (!customTxKdvExempt) setCustomTxKdvRate('0'); else setCustomTxKdvRate('20'); }} style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 600 }}>
                          {customTxKdvExempt ? '✓ Muaf' : 'Muaf Et'}
                        </button>
                      </div>
                      <input type="number" disabled={customTxKdvExempt} className="form-input" style={{ height: '38px' }} value={customTxKdvRate} onChange={(e) => setCustomTxKdvRate(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', height: '38px', fontSize: '0.85rem', fontWeight: 700 }}>
                      İşlemi Kaydet (Listelere Yansıt)
                    </button>
                  </div>
                </form>
              </div>

              {/* History Tables */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-success)' }}>Tahsilatlar (Gelirler)</h5>
                  {clientPaymentsList.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Henüz tahsilat kaydı bulunmuyor.</div>
                  ) : (
                    <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                      <thead>
                        <tr>
                          <th>Tarih</th>
                          <th>Açıklama</th>
                          <th>Tür</th>
                          <th style={{ textAlign: 'right' }}>Tutar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientPaymentsList.map(p => (
                          <tr key={p.id}>
                            <td>{new Date(p.payment_date).toLocaleDateString('tr-TR')}</td>
                            <td>{p.notes || 'Hizmet Bedeli'}</td>
                            <td>{p.payment_type || 'Havale'}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-success)' }}>+{parseFloat(p.amount).toLocaleString('tr-TR')} ₺</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-danger)' }}>Proje Giderleri / Harcamalar</h5>
                  {clientExpensesList.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bu müşteriye bağlı harcama kaydı bulunmuyor.</div>
                  ) : (
                    <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                      <thead>
                        <tr>
                          <th>Tarih</th>
                          <th>Açıklama</th>
                          <th>Hesap</th>
                          <th style={{ textAlign: 'right' }}>Tutar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientExpensesList.map(e => (
                          <tr key={e.id}>
                            <td>{new Date(e.expense_date).toLocaleDateString('tr-TR')}</td>
                            <td>{e.description}</td>
                            <td>{e.payment_method || 'Banka'}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-danger)' }}>-{parseFloat(e.amount).toLocaleString('tr-TR')} ₺</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL 3: ADD NEW CLIENT */}
      {showAddClientModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px', maxHeight: '88vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Yeni Müşteri Ekle</h2>
              <button className="modal-close" onClick={() => setShowAddClientModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddClientSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Cari Kod</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    value={newClientCode}
                    onChange={(e) => setNewClientCode(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Müşteri Ünvanı / Adı</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    placeholder="Müşteri adını girin..."
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Hizmet Türü / Kategori</label>
                  <select 
                    className="select-custom"
                    value={newClientCategory}
                    onChange={(e) => setNewClientCategory(e.target.value)}
                  >
                    <option value="social">📱 Sosyal Medya Müşterisi</option>
                    <option value="production">🎬 Prodüksiyon Müşterisi</option>
                    <option value="other">📦 Diğer / Harici Hizmet Müşterisi</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Satın Aldığı Paket / Hizmet</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Örn: 8 Reels, 4 Gönderi veya Danışmanlık"
                    value={newClientPackage}
                    onChange={(e) => setNewClientPackage(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Aylık Sözleşme Bedeli (₺)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    value={newClientFee}
                    onChange={(e) => setNewClientFee(e.target.value)}
                    min="0"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Vade Günü (Giriş Günü)</label>
                  <select 
                    className="select-custom"
                    value={newClientDay}
                    onChange={(e) => setNewClientDay(e.target.value)}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>Her Ayın {day}. Günü</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Commission Section */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="form-label" style={{ margin: 0 }}>Personel Prim Dağılımı</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <input 
                      type="checkbox" 
                      checked={newExempt} 
                      onChange={(e) => setNewExempt(e.target.checked)} 
                    />
                    <span>Primden Muaf Tut</span>
                  </label>
                </div>

                {!newExempt && (
                  <>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Prim Oranı (%)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        required
                        value={newRate}
                        onChange={(e) => setNewRate(e.target.value)}
                        min="0"
                        max="100"
                      />
                    </div>

                    <label className="form-label">Prim Alacak Personeller</label>
                    <div className="staff-checkbox-grid">
                      {staff.map(s => {
                        const isChecked = newAssignedStaffIds.includes(Number(s.id));
                        return (
                          <div 
                            key={s.id} 
                            className={`staff-checkbox-item ${isChecked ? 'checked' : ''}`}
                            onClick={() => toggleNewStaffSelection(s.id)}
                          >
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              readOnly
                              style={{ cursor: 'pointer' }}
                            />
                            <span>{s.display_name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddClientModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Müşteriyi Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {clientToDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} style={{ color: 'var(--color-danger)' }} />
                Müşteri Silme Onayı
              </h2>
              <button className="modal-close" onClick={() => setClientToDelete(null)}>×</button>
            </div>
            
            <div style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Silinecek Müşteri</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{clientToDelete.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {clientToDelete.client_code || '-'} · {clientToDelete.package || 'Hizmet Tanımsız'} · {(parseFloat(clientToDelete.monthly_fee) || 0).toLocaleString('tr-TR')} ₺/ay
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6 }}>
                Bu müşteriyi silmek istediğinizden <strong style={{ color: '#fca5a5' }}>emin misiniz?</strong><br />
                Bu işlem müşteriyi pasif duruma alacaktır.
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setClientToDelete(null)}
                style={{ minWidth: '120px' }}
              >
                Vazgeç
              </button>
              <button 
                type="button" 
                className="btn btn-sm" 
                onClick={() => {
                  onDeleteClient(clientToDelete.id);
                  setClientToDelete(null);
                }}
                style={{ 
                  minWidth: '120px', 
                  background: 'rgba(239,68,68,0.15)', 
                  border: '1px solid rgba(239,68,68,0.4)', 
                  color: '#fca5a5', 
                  fontWeight: 700,
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              >
                <Trash2 size={15} />
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
