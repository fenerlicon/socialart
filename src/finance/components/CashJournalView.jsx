import React, { useState } from 'react';
import { Plus, Landmark, Search, DollarSign, Calendar, TrendingUp, TrendingDown, Trash2, AlertTriangle } from 'lucide-react';

export default function CashJournalView({ 
  cashJournal, 
  period, 
  onAddJournalTransaction, 
  onDeleteJournalTransaction,
  isLoading 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState('all'); // 'all', 'Banka', 'Kasa'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'Giriş', 'Çıkış'
  const [showAddModal, setShowAddModal] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState(null);

  // Form State
  const [account, setAccount] = useState('Banka');
  const [type, setType] = useState('Giriş');
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  // Balance Calculations
  const bankBalance = cashJournal
    .filter(t => t.account === 'Banka')
    .reduce((acc, t) => acc + (t.type === 'Giriş' ? parseFloat(t.amount) : -parseFloat(t.amount)), 0);

  const cashBalance = cashJournal
    .filter(t => t.account === 'Kasa')
    .reduce((acc, t) => acc + (t.type === 'Giriş' ? parseFloat(t.amount) : -parseFloat(t.amount)), 0);

  const totalCash = bankBalance + cashBalance;

  // Filtered transactions
  const filteredJournal = cashJournal.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAccount = accountFilter === 'all' || t.account === accountFilter;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesAccount && matchesType;
  }).sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    onAddJournalTransaction({
      transaction_date: transactionDate,
      account,
      type,
      amount: parseFloat(amount),
      description,
      period
    });

    setShowAddModal(false);
    setAmount('');
    setDescription('');
  };

  return (
    <div className="cash-journal-view">
      {/* Account Balance Summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <span className="form-label" style={{ margin: 0 }}>Toplam Nakit Varlık</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '8px', color: 'var(--color-success)' }}>
            {totalCash.toLocaleString('tr-TR')} ₺
          </h2>
        </div>

        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Banka Hesabı Bakiyesi</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '8px' }}>
            {bankBalance.toLocaleString('tr-TR')} ₺
          </h2>
        </div>

        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Kasa Bakiyesi (Elden)</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '8px' }}>
            {cashBalance.toLocaleString('tr-TR')} ₺
          </h2>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flexGrow: 1 }}>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="İşlem açıklaması ara..." 
              className="form-input search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="select-custom"
            style={{ width: 'auto', padding: '0.5rem 2rem 0.5rem 1rem' }}
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
          >
            <option value="all">Tüm Hesaplar</option>
            <option value="Banka">Banka Hesabı</option>
            <option value="Kasa">Kasa (Elden)</option>
          </select>

          <select 
            className="select-custom"
            style={{ width: 'auto', padding: '0.5rem 2rem 0.5rem 1rem' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Giriş / Çıkış (Tümü)</option>
            <option value="Giriş">Girişler (+)</option>
            <option value="Çıkış">Çıkışlar (-)</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>Manuel İşlem Ekle</span>
        </button>
      </div>

      {/* Transactions Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <span>İşlemler yükleniyor...</span>
          </div>
        ) : filteredJournal.length === 0 ? (
          <div className="empty-state">
            <Landmark size={48} style={{ color: 'var(--text-muted)' }} />
            <h4 className="empty-state-title">Hareket Bulunmadı</h4>
            <p>Seçilen dönem ve kriterlere uygun işlem hareketi bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Hesap</th>
                  <th>Tür</th>
                  <th>Açıklama</th>
                  <th style={{ textAlign: 'right' }}>Tutar</th>
                  {onDeleteJournalTransaction && <th style={{ textAlign: 'right' }}>İşlemler</th>}
                </tr>
              </thead>
              <tbody>
                {filteredJournal.map(t => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(t.transaction_date).toLocaleDateString('tr-TR')}
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.account}</td>
                    <td>
                      {t.type === 'Giriş' ? (
                        <span className="badge badge-paid" style={{ gap: '4px' }}>
                          <TrendingUp size={12} /> Giriş
                        </span>
                      ) : (
                        <span className="badge badge-unpaid" style={{ gap: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                          <TrendingDown size={12} /> Çıkış
                        </span>
                      )}
                    </td>
                    <td>{t.description}</td>
                    <td style={{ 
                      textAlign: 'right', 
                      fontWeight: 700, 
                      color: t.type === 'Giriş' ? 'var(--color-success)' : 'var(--color-danger)' 
                    }}>
                      {t.type === 'Giriş' ? '+' : '-'}{parseFloat(t.amount).toLocaleString('tr-TR')} ₺
                    </td>
                    {onDeleteJournalTransaction && (
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary btn-icon btn-sm"
                          title="İşlemi Sil"
                          onClick={() => setJournalToDelete(t)}
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={13} />
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

      {/* ADD TRANSACTION MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Manuel Kasa/Banka Hareketi Ekle</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Hesap Türü</label>
                  <select 
                    className="select-custom"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                  >
                    <option value="Banka">Banka Hesabı</option>
                    <option value="Kasa">Kasa (Elden)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">İşlem Yönü</label>
                  <select 
                    className="select-custom"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="Giriş">Para Girişi (+)</option>
                    <option value="Çıkış">Para Çıkışı (-)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Tutar (₺)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">İşlem Tarihi</label>
                <input 
                  type="date" 
                  className="form-input" 
                  required
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Açıklama</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="Sermaye ilavesi, ortaklar carisi, diğer gelir vb..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">İşlemi Ekle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE JOURNAL TRANSACTION MODAL */}
      {journalToDelete && (
        <div className="modal-overlay" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', margin: 0 }}>
                <AlertTriangle size={20} />
                Kasa Hareketini Sil
              </h2>
              <button className="modal-close" onClick={() => setJournalToDelete(null)}>×</button>
            </div>

            <div style={{ padding: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  Silinecek İşlem Detayı
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {journalToDelete.description}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: journalToDelete.type === 'Giriş' ? 'var(--color-success)' : '#f87171', marginTop: '6px' }}>
                  {journalToDelete.type === 'Giriş' ? '+' : '-'}{parseFloat(journalToDelete.amount).toLocaleString('tr-TR')} ₺
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {journalToDelete.account} · {new Date(journalToDelete.transaction_date).toLocaleDateString('tr-TR')} ({journalToDelete.type})
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                Bu kasa/banka hareketini silmek istediğinize emin misiniz?<br />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>
                  ℹ️ Bu işlem yalnızca bu defter hareketini kaldırır.
                </span>
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setJournalToDelete(null)}
                style={{ minWidth: '110px' }}
              >
                Vazgeç
              </button>
              <button 
                type="button" 
                className="btn btn-sm" 
                onClick={() => {
                  onDeleteJournalTransaction(journalToDelete.id);
                  setJournalToDelete(null);
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
