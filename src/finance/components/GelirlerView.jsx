import React, { useState } from 'react';
import { Plus, Search, DollarSign, Calendar, Landmark, Trash2, AlertTriangle, FileText, FileSpreadsheet } from 'lucide-react';
import ReceiptModal from './ReceiptModal';
import { exportToCSV } from '../utils/exportUtils';

export default function GelirlerView({ 
  clients, 
  clientPayments, 
  productionProjects = [], 
  period, 
  onRecordPayment, 
  onDeletePayment, 
  isLoading 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState(null);

  // Form states
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // ALL, SOCIAL, PRODUCTION, OTHER
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState('Havale');
  const [paymentAccount, setPaymentAccount] = useState('Banka');
  const [notes, setNotes] = useState('');
  const [kdvRate, setKdvRate] = useState('20');
  const [isKdvExempt, setIsKdvExempt] = useState(false);
  const [iyzicoRate, setIyzicoRate] = useState('4.29');

  // Filter clients for modal select
  const modalClients = (clients || []).filter(c => {
    if (c.durum === 'pasif') return false;
    if (selectedCategory === 'ALL') return true;

    if (c.client_code === 'DIGER' || c.name?.toLowerCase().includes('harici gelir') || c.name?.toLowerCase().includes('tanımsız')) {
      return selectedCategory === 'OTHER';
    }

    const pkg = (c.package || '').toLowerCase();
    const isProd = pkg.includes('prodük') || pkg.includes('film') || pkg.includes('çekim') || pkg.includes('klip') || pkg.includes('spot') || pkg.includes('kamera');
    
    if (selectedCategory === 'PRODUCTION') return isProd;
    if (selectedCategory === 'SOCIAL') return !isProd;
    return true;
  });

  // Find selected client details
  const selectedClient = (clients || []).find(c => c.id === parseInt(selectedClientId));
  const clientStats = (() => {
    if (!selectedClient) return null;
    const payments = clientPayments.filter(p => p.client_id === selectedClient.id);
    const totalPaid = payments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
    const fee = parseFloat(selectedClient.monthly_fee) || 0;
    const remaining = Math.max(0, fee - totalPaid);
    return { fee, totalPaid, remaining };
  })();

  // Calculate production profit
  const totalProductionNetProfit = (productionProjects || []).reduce((acc, p) => {
    const budget = parseFloat(p.budget) || 0;
    const expList = Array.isArray(p.costs) ? p.costs : (Array.isArray(p.expenses) ? p.expenses : []);
    const totalExp = expList.reduce((eAcc, e) => eAcc + (parseFloat(e.amount) || 0), 0);
    return acc + Math.max(0, budget - totalExp);
  }, 0);

  // Total collected income (Client Payments + Net Production Profit)
  const clientPaymentsTotal = (clientPayments || []).reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
  const totalRevenues = clientPaymentsTotal + totalProductionNetProfit;

  // Filter regular payments
  const filteredPayments = (clientPayments || []).filter(payment => {
    const client = clients.find(c => c.id === payment.client_id);
    return (client && client.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
           (payment.notes && payment.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (payment.payment_type && payment.payment_type.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Map production projects as direct revenue line items
  const productionRevenues = (productionProjects || []).map(proj => {
    const budget = parseFloat(proj.budget) || 0;
    const expList = Array.isArray(proj.costs) ? proj.costs : (Array.isArray(proj.expenses) ? proj.expenses : []);
    const totalExp = expList.reduce((eAcc, e) => eAcc + (parseFloat(e.amount) || 0), 0);
    const netProfit = Math.max(0, budget - totalExp);

    return {
      id: `prod-${proj.id}`,
      isProductionProject: true,
      payment_date: proj.date || new Date().toISOString().split('T')[0],
      client_name: proj.client_name || 'Prodüksiyon Müşterisi',
      notes: `[Prodüksiyon Projesi] ${proj.title} (Bütçe: ${budget.toLocaleString('tr-TR')} ₺ - Masraflar: ${totalExp.toLocaleString('tr-TR')} ₺)`,
      payment_type: 'Prodüksiyon Projesi',
      amount: netProfit > 0 ? netProfit : budget,
      budget,
      totalExp,
      netProfit
    };
  }).filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return p.client_name.toLowerCase().includes(term) || p.notes.toLowerCase().includes(term);
  });

  // Combine both list sources
  const allRevenuesCombined = [...filteredPayments, ...productionRevenues].sort(
    (a, b) => new Date(b.payment_date || b.created_at) - new Date(a.payment_date || a.created_at)
  );

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClientId || !amount || parseFloat(amount) <= 0) return;

    const isCC = (paymentType || '').toLowerCase().includes('kredi') || (paymentType || '').toLowerCase().includes('kart');
    const rate = isCC ? parseFloat(iyzicoRate || 2.99) : 0;
    const iyzicoAmt = isCC ? Math.round(((parseFloat(amount) || 0) * (rate / 100)) * 100) / 100 : 0;

    onRecordPayment({
      client_id: parseInt(selectedClientId),
      amount: parseFloat(amount),
      payment_date: paymentDate,
      payment_type: paymentType,
      payment_account: paymentAccount,
      period,
      notes: notes || 'Hizmet Tahsilatı',
      kdv_rate: parseFloat(kdvRate || 20),
      iyzico_rate: rate,
      iyzico_amount: iyzicoAmt
    });

    setShowAddModal(false);
    setSelectedClientId('');
    setAmount('');
    setNotes('');
    setKdvRate('20');
  };

  const handleExportGelirlerExcel = () => {
    const headers = [
      { label: "Ödeme Tarihi", accessor: p => p.payment_date },
      { label: "Müşteri Ünvanı", accessor: p => { const c = (clients || []).find(cl => cl.id === p.client_id); return c ? c.name : 'Diğer / Harici Gelir'; } },
      { label: "Açıklama / Dönem", accessor: p => p.notes || `Tahsilat (${p.period})` },
      { label: "Ödeme Türü", accessor: p => p.payment_type || 'Havale' },
      { label: "KDV Oranı (%)", accessor: p => p.kdv_rate !== undefined ? p.kdv_rate : 20 },
      { label: "KDV Tutarı (TL)", accessor: p => p.kdv_amount || 0 },
      { label: "Toplam Tutar (TL)", accessor: p => p.amount }
    ];
    exportToCSV(`SocialArt_Tahsilat_Gelirleri_${period}`, headers, filteredPayments);
  };

  return (
    <div className="gelirler-view">
      {/* Search & Actions */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Müşteri veya açıklama ara..." 
            className="form-input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleExportGelirlerExcel}
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem', height: '38px', borderRadius: '8px', gap: '6px' }}
          >
            <FileSpreadsheet size={15} style={{ color: '#10b981' }} />
            <span>Excel'e Aktar</span>
          </button>

          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Gelir Ekle (Tahsilat)</span>
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderLeft: '4px solid var(--color-success)' }}>
        <div>
          <span className="form-label" style={{ margin: 0 }}>Aylık Toplam Gelir</span>
          <h2 className="metric-value" style={{ color: 'var(--color-success)', marginTop: '4px' }}>
            {totalRevenues.toLocaleString('tr-TR')} ₺
          </h2>
        </div>
        <div className="metric-icon-wrapper profit" style={{ width: 44, height: 44 }}>
          <DollarSign size={24} />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <span>Yükleniyor...</span>
          </div>
        ) : allRevenuesCombined.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} style={{ color: 'var(--text-muted)' }} />
            <h4 className="empty-state-title">Gelir Bulunamadı</h4>
            <p>Bu dönem için henüz gelir kaydı girilmemiş.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Müşteri</th>
                  <th>Açıklama</th>
                  <th>Ödeme Türü</th>
                  <th style={{ textAlign: 'right' }}>Tutar</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {allRevenuesCombined.map(p => {
                  const client = clients.find(c => c.id === p.client_id);
                  const isProd = p.isProductionProject;
                  return (
                    <tr key={p.id} style={isProd ? { background: 'rgba(139, 92, 246, 0.04)' } : {}}>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {p.payment_date ? new Date(p.payment_date).toLocaleDateString('tr-TR') : '-'}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {isProd ? p.client_name : (client ? client.name : (p.client_id === 99999 ? 'Diğer (Harici Gelir)' : 'Bilinmeyen Müşteri'))}
                      </td>
                      <td>
                        {isProd ? (
                          <span style={{ color: '#c084fc', fontWeight: 600 }}>{p.notes}</span>
                        ) : (
                          p.notes || 'Hizmet Bedeli'
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {isProd ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                            🎬 Prodüksiyon
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Landmark size={12} className="text-secondary" />
                            {p.payment_type || 'Havale'}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-success)' }}>
                        {parseFloat(p.amount).toLocaleString('tr-TR')} ₺
                        {isProd && <div style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 500 }}>[Net Kâr]</div>}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-secondary btn-icon btn-sm" 
                            title="Tahsilat Makbuzu / Dekont İndir"
                            onClick={() => setSelectedPaymentForReceipt(p)}
                            style={{ color: '#38bdf8' }}
                          >
                            <FileText size={14} />
                          </button>

                          {onDeletePayment && (
                            <button 
                              className="btn btn-secondary btn-icon btn-sm" 
                              title="Kaydı Sil"
                              onClick={() => setPaymentToDelete(p)}
                              style={{ color: 'var(--color-danger)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD INCOME MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Tahsilat / Gelir Girişi</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Gelir Kategori / Hizmet Türü</label>
                  <select 
                    className="select-custom"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedClientId('');
                    }}
                  >
                    <option value="ALL">Tüm Kategoriler (Hepsi)</option>
                    <option value="SOCIAL">Sosyal Medya Yönetimi</option>
                    <option value="PRODUCTION">Prodüksiyon & Film</option>
                    <option value="OTHER">Diğer / Harici Gelir</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Müşteri Seçin</label>
                  <select 
                    className="select-custom"
                    required
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                  >
                    <option value="">Seçiniz...</option>
                    {modalClients.filter(c => c.client_code !== 'DIGER').map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.client_code || 'Kodsuz'})</option>
                    ))}
                    {(() => {
                      const digerClient = clients.find(c => c.client_code === 'DIGER' || c.name.includes('Diğer'));
                      const digerId = digerClient ? digerClient.id : 99999;
                      return <option value={digerId}>➕ Diğer (Harici / Tanımsız Müşteri)</option>;
                    })()}
                  </select>
                </div>
              </div>

              {clientStats && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Aylık Sözleşme Bedeli:</span>
                    <div style={{ fontWeight: 600, marginTop: '2px' }}>{clientStats.fee.toLocaleString('tr-TR')} ₺</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Bu Ay Yapılan Ödeme:</span>
                    <div style={{ fontWeight: 600, color: 'var(--color-success)', marginTop: '2px' }}>{clientStats.totalPaid.toLocaleString('tr-TR')} ₺</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Kalan Borç (Öncesi):</span>
                    <div style={{ fontWeight: 700, color: 'var(--color-warning)', marginTop: '2px' }}>{clientStats.remaining.toLocaleString('tr-TR')} ₺</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Ödeme Sonrası Kalan:</span>
                    <div style={{ fontWeight: 700, color: (clientStats.remaining - (parseFloat(amount) || 0)) > 0 ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '2px' }}>
                      {Math.max(0, clientStats.remaining - (parseFloat(amount) || 0)).toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Ödeme Tutarı (₺)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input" 
                    required
                    placeholder="Tutarı girin..."
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">KDV Oranı (%)</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        if (isKdvExempt) {
                          setIsKdvExempt(false);
                          setKdvRate('20');
                        } else {
                          setIsKdvExempt(true);
                          setKdvRate('0');
                        }
                      }}
                      style={{ 
                        background: isKdvExempt ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid var(--border-light)', 
                        color: isKdvExempt ? '#818cf8' : 'var(--text-secondary)',
                        fontSize: '0.68rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {isKdvExempt ? '✓ KDV Muaf' : 'KDV Muaf Et'}
                    </button>
                  </div>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    value={kdvRate}
                    onChange={(e) => setKdvRate(e.target.value)}
                    min="0"
                    max="100"
                    disabled={isKdvExempt}
                  />
                </div>
              </div>

              {/* KDV Calculation Display */}
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <div>
                  <span className="text-secondary">Düşülecek KDV:</span>{' '}
                  <strong style={{ color: 'var(--color-warning)' }}>
                    {((parseFloat(amount) || 0) * (parseFloat(kdvRate) || 0) / (100 + (parseFloat(kdvRate) || 0))).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                  </strong>
                </div>
                <div>
                  <span className="text-secondary">Net Gelir:</span>{' '}
                  <strong style={{ color: 'var(--color-success)' }}>
                    {((parseFloat(amount) || 0) - ((parseFloat(amount) || 0) * (parseFloat(kdvRate) || 0) / (100 + (parseFloat(kdvRate) || 0)))).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
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
                        -{((parseFloat(amount) || 0) * (parseFloat(iyzicoRate) || 0) / 100).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                      </strong>
                    </div>
                    <div>
                      <span className="text-secondary">Hesaba Geçen Net Ajans Bakiyesi:</span>{' '}
                      <strong style={{ color: 'var(--color-success)' }}>
                        {((parseFloat(amount) || 0) - ((parseFloat(amount) || 0) * (parseFloat(iyzicoRate) || 0) / 100)).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Açıklama (Opsiyonel)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Hizmet bedeli, ara ödeme, fatura vb..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Gelir Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {paymentToDelete && (
        <div className="modal-overlay" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', margin: 0 }}>
                <AlertTriangle size={20} />
                Gelir Kaydını Sil
              </h2>
              <button className="modal-close" onClick={() => setPaymentToDelete(null)}>×</button>
            </div>

            <div style={{ padding: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  Silinecek Tahsilat Detayı
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {clients.find(c => c.id === paymentToDelete.client_id)?.name || 'Bilinmeyen Müşteri'}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f87171', marginTop: '6px' }}>
                  {parseFloat(paymentToDelete.amount).toLocaleString('tr-TR')} ₺
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {paymentToDelete.notes || 'Hizmet Bedeli'} · {new Date(paymentToDelete.payment_date).toLocaleDateString('tr-TR')} ({paymentToDelete.payment_type || 'Havale'})
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                Bu gelir kaydını ve bağlı olan <strong style={{ color: '#fca5a5' }}>kasa/banka hareketini</strong> silmek istediğinize emin misiniz?<br />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>
                  ⚠️ İlgili KDV vergi hesabı ve finans toplamları otomatik güncellenecektir.
                </span>
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setPaymentToDelete(null)}
                style={{ minWidth: '110px' }}
              >
                Vazgeç
              </button>
              <button 
                type="button" 
                className="btn btn-sm" 
                onClick={() => {
                  onDeletePayment(paymentToDelete.id);
                  setPaymentToDelete(null);
                }}
                style={{ 
                  minWidth: '130px', 
                  background: 'rgba(239,68,68,0.2)', 
                  border: '1px solid rgba(239,68,68,0.5)', 
                  color: '#fca5a5', 
                  fontWeight: 700,
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={15} />
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT / DEKONT MODAL */}
      {selectedPaymentForReceipt && (
        <ReceiptModal 
          payment={selectedPaymentForReceipt}
          client={clients.find(c => c.id === selectedPaymentForReceipt.client_id)}
          onClose={() => setSelectedPaymentForReceipt(null)}
        />
      )}
    </div>
  );
}
