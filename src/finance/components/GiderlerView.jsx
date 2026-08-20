import React, { useState } from 'react';
import { Plus, Search, Tag, Calendar, DollarSign, Trash2, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';

export default function GiderlerView({ 
  expenses = [], 
  staff = [], 
  staffPayments = [], 
  period, 
  onAddExpense, 
  onDeleteExpense, 
  isLoading 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Form states
  const [category, setCategory] = useState('Kira');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Banka'); // Banka, Kasa
  const [description, setDescription] = useState('');
  const [kdvRate, setKdvRate] = useState('20');
  const [isKdvExempt, setIsKdvExempt] = useState(false);

  const expenseCategories = [
    'Personel Maaş & Prim Giderleri', 'Kira', 'Muhasebeci', 'Elektrik', 'Su', 'İnternet', 
    'Telefon', 'Araç', 'Yakıt', 'Vergi', 'Kredi Kartı', 'Ofis Gideri', 'Diğer / Harici Gider'
  ];

  // Combine direct expenses with staff payroll payments
  const combinedExpenses = React.useMemo(() => {
    const list = [...(expenses || [])];
    (staffPayments || []).forEach(sp => {
      const amountPaid = parseFloat(sp.amount_paid || sp.total_amount) || 0;
      if (amountPaid > 0) {
        const staffMember = (staff || []).find(s => s.id === sp.staff_id);
        const name = staffMember ? (staffMember.display_name || staffMember.name) : 'Personel';
        list.push({
          id: `staff_pay_${sp.id}`,
          category: 'Personel Maaş & Prim Giderleri',
          amount: amountPaid,
          expense_date: sp.payment_date || `${period}-01`,
          period,
          payment_method: 'Banka',
          description: `Maaş / Prim Ödemesi - ${name}`,
          isStaffPayment: true
        });
      }
    });
    return list;
  }, [expenses, staffPayments, staff, period]);

  // Filter expenses
  const filteredExpenses = combinedExpenses.filter(e => {
    const matchesSearch = (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (e.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));

  // Total expenses
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const rate = isKdvExempt ? 0 : parseFloat(kdvRate || 20);
    const totalAmt = parseFloat(amount);
    const kdvAmt = Math.round((totalAmt * (rate / (100 + rate))) * 100) / 100;

    onAddExpense({
      amount: totalAmt,
      category,
      expense_date: expenseDate,
      period,
      payment_method: paymentMethod,
      description: description || `${category} Gideri`
    });

    setShowAddModal(false);
    setAmount('');
    setDescription('');
  };

  const handleExportGiderlerExcel = () => {
    const headers = [
      { label: "Tarih", accessor: e => e.expense_date },
      { label: "Kategori", accessor: e => e.category },
      { label: "Açıklama", accessor: e => e.description || "-" },
      { label: "Ödeme Yöntemi", accessor: e => e.payment_method || "Banka" },
      { label: "KDV Oranı (%)", accessor: e => e.kdv_rate !== undefined ? e.kdv_rate : 20 },
      { label: "KDV Tutarı (TL)", accessor: e => e.kdv_amount || 0 },
      { label: "Toplam Gider Tutarı (TL)", accessor: e => e.amount }
    ];
    exportToCSV(`SocialArt_Gider_Raporu_${period}`, headers, filteredExpenses);
  };

  return (
    <div className="giderler-view">
      {/* Filters & Actions */}
      <div className="filter-bar">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flexGrow: 1 }}>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Gider açıklaması ara..." 
              className="form-input search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="select-custom"
            style={{ width: 'auto', padding: '0.5rem 2rem 0.5rem 1rem' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tüm Kategoriler</option>
            {expenseCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleExportGiderlerExcel}
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem', height: '38px', borderRadius: '8px', gap: '6px' }}
          >
            <FileSpreadsheet size={15} style={{ color: '#10b981' }} />
            <span>Excel'e Aktar</span>
          </button>

          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Gider Ekle</span>
          </button>
        </div>
      </div>

      {/* Summary Stat */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderLeft: '4px solid var(--color-danger)' }}>
        <div>
          <span className="form-label" style={{ margin: 0 }}>Aylık Toplam Gider</span>
          <h2 className="metric-value" style={{ color: 'var(--color-danger)', marginTop: '4px' }}>
            {totalExpenses.toLocaleString('tr-TR')} ₺
          </h2>
        </div>
        <div className="metric-icon-wrapper danger" style={{ width: 44, height: 44 }}>
          <DollarSign size={24} />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <span>Giderler yükleniyor...</span>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <Tag size={48} style={{ color: 'var(--text-muted)' }} />
            <h4 className="empty-state-title">Gider Kaydı Bulunmadı</h4>
            <p>Bu döneme ait gider kaydı bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Kategori</th>
                  <th>Açıklama</th>
                  <th>Ödeme Yöntemi</th>
                  <th style={{ textAlign: 'right' }}>Tutar</th>
                  {onDeleteExpense && <th style={{ textAlign: 'right' }}>İşlemler</th>}
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(e => (
                  <tr key={e.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(e.expense_date).toLocaleDateString('tr-TR')}
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                        {e.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{e.description}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {e.payment_method || 'Banka'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-danger)' }}>
                      {parseFloat(e.amount).toLocaleString('tr-TR')} ₺
                    </td>
                    {onDeleteExpense && (
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary btn-icon btn-sm" 
                          title="Gideri Sil"
                          onClick={() => setExpenseToDelete(e)}
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD EXPENSE MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Gider Kaydı Ekle</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select 
                  className="select-custom"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tutar (₺)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0.00" 
                    className="form-input" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
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

              <div className="form-group">
                <label className="form-label">Tarih</label>
                <input 
                  type="date" 
                  required
                  className="form-input" 
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ödeme Yöntemi</label>
                <select 
                  className="select-custom"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Banka">Banka Hesabı</option>
                  <option value="Kasa">Elden (Kasa)</option>
                  <option value="Kredi Kartı">Kredi Kartı</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Açıklama</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Örn: Haziran ayı kira ödemesi"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Gider Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE EXPENSE MODAL */}
      {expenseToDelete && (
        <div className="modal-overlay" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', margin: 0 }}>
                <AlertTriangle size={20} />
                Gider Kaydını Sil
              </h2>
              <button className="modal-close" onClick={() => setExpenseToDelete(null)}>×</button>
            </div>

            <div style={{ padding: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  Silinecek Gider Detayı
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {expenseToDelete.description || `${expenseToDelete.category} Gideri`}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f87171', marginTop: '6px' }}>
                  {parseFloat(expenseToDelete.amount).toLocaleString('tr-TR')} ₺
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {expenseToDelete.category} · {new Date(expenseToDelete.expense_date).toLocaleDateString('tr-TR')} ({expenseToDelete.payment_method || 'Banka'})
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                Bu gider kaydını ve ilgili <strong style={{ color: '#fca5a5' }}>kasa/banka hareketini</strong> silmek istediğinize emin misiniz?<br />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>
                  ⚠️ İlgili hesap bakiyeleri ve finans raporları otomatik güncellenecektir.
                </span>
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setExpenseToDelete(null)}
                style={{ minWidth: '110px' }}
              >
                Vazgeç
              </button>
              <button 
                type="button" 
                className="btn btn-sm" 
                onClick={() => {
                  onDeleteExpense(expenseToDelete.id);
                  setExpenseToDelete(null);
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
    </div>
  );
}
