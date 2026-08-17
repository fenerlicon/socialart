import React, { useState } from 'react';
import { Plus, CreditCard, DollarSign, Calendar, RefreshCw, Trash2, Edit, AlertTriangle } from 'lucide-react';

export default function CreditCardView({ 
  creditCards, 
  period, 
  onRecordCardPayment, 
  onRecordCardSpend,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  isLoading 
}) {
  const [showPayModal, setShowPayModal] = useState(false);
  const [showSpendModal, setShowSpendModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  // Selected Card for Action
  const [selectedCard, setSelectedCard] = useState(null);

  // Pay Form State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAccount, setPaymentAccount] = useState('Banka');

  // Spend Form State
  const [spendAmount, setSpendAmount] = useState('');
  const [spendDescription, setSpendDescription] = useState('');
  const [spendCategory, setSpendCategory] = useState('Ofis Gideri');
  const [spendInstallments, setSpendInstallments] = useState('1');

  // Add/Edit Card Form State
  const [cardName, setCardName] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardMinPayment, setCardMinPayment] = useState('0');
  const [cardDueDate, setCardDueDate] = useState('');

  // Edit Card Form State
  const [editCardName, setEditCardName] = useState('');
  const [editCardLimit, setEditCardLimit] = useState('');
  const [editCardMinPayment, setEditCardMinPayment] = useState('0');
  const [editCardDueDate, setEditCardDueDate] = useState('');

  // Total Card Debt
  const totalDebt = creditCards.reduce((acc, c) => acc + (parseFloat(c.used_amount) || 0), 0);
  const totalLimit = creditCards.reduce((acc, c) => acc + (parseFloat(c.limit) || 0), 0);
  const totalAvailable = Math.max(0, totalLimit - totalDebt);

  // Open pay modal
  const openPayModal = (card) => {
    setSelectedCard(card);
    setPaymentAmount(card.used_amount.toString());
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentAccount('Banka');
    setShowPayModal(true);
  };

  // Open spend modal
  const openSpendModal = (card) => {
    setSelectedCard(card);
    setSpendAmount('');
    setSpendDescription('');
    setSpendCategory('Ofis Gideri');
    setSpendInstallments('1');
    setShowSpendModal(true);
  };

  // Handle Pay Submit
  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (!selectedCard || !paymentAmount || parseFloat(paymentAmount) <= 0) return;

    onRecordCardPayment({
      id: selectedCard.id,
      card_name: selectedCard.card_name,
      amount: parseFloat(paymentAmount),
      payment_date: paymentDate,
      payment_account: paymentAccount,
      period
    });

    setShowPayModal(false);
    setSelectedCard(null);
  };

  // Handle Spend Submit
  const handleSpendSubmit = (e) => {
    e.preventDefault();
    if (!selectedCard || !spendAmount || parseFloat(spendAmount) <= 0) return;

    onRecordCardSpend({
      id: selectedCard.id,
      card_name: selectedCard.card_name,
      amount: parseFloat(spendAmount),
      description: spendDescription || "Kredi Kartı Harcaması",
      category: spendCategory,
      installments: parseInt(spendInstallments || '1'),
      period
    });

    setShowSpendModal(false);
    setSelectedCard(null);
  };

  // Handle Add Card Submit
  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    if (!cardName || !cardLimit || parseFloat(cardLimit) <= 0) return;

    onAddCard({
      card_name: cardName,
      limit: parseFloat(cardLimit),
      used_amount: 0,
      due_date: cardDueDate || null,
      minimum_payment: parseFloat(cardMinPayment || 0),
      period
    });

    setShowAddModal(false);
    setCardName('');
    setCardLimit('');
    setCardMinPayment('0');
    setCardDueDate('');
  };

  // Open edit modal
  const openEditModal = (card) => {
    setSelectedCard(card);
    setEditCardName(card.card_name);
    setEditCardLimit(card.limit.toString());
    setEditCardMinPayment(card.minimum_payment.toString());
    setEditCardDueDate(card.due_date || '');
    setShowEditModal(true);
  };

  // Handle Edit Card Submit
  const handleEditCardSubmit = (e) => {
    e.preventDefault();
    if (!selectedCard || !editCardName || !editCardLimit || parseFloat(editCardLimit) <= 0) return;

    onUpdateCard(selectedCard.id, {
      card_name: editCardName,
      limit: parseFloat(editCardLimit),
      minimum_payment: parseFloat(editCardMinPayment || 0),
      due_date: editCardDueDate || null
    });

    setShowEditModal(false);
    setSelectedCard(null);
  };

  return (
    <div className="credit-card-view">
      {/* Search & Actions */}
      <div className="filter-bar" style={{ justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>Yeni Kart Tanımla</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <span className="form-label" style={{ margin: 0 }}>Toplam Kart Borcu</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '8px', color: 'var(--color-danger)' }}>
            {totalDebt.toLocaleString('tr-TR')} ₺
          </h2>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <span className="form-label" style={{ margin: 0 }}>Toplam Kullanılabilir Limit</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '8px', color: 'var(--color-success)' }}>
            {totalAvailable.toLocaleString('tr-TR')} ₺
          </h2>
        </div>

        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Toplam Kart Limiti</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '8px' }}>
            {totalLimit.toLocaleString('tr-TR')} ₺
          </h2>
        </div>
      </div>

      {/* Cards Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <span>Kredi kartı verileri yükleniyor...</span>
          </div>
        ) : creditCards.length === 0 ? (
          <div className="empty-state">
            <CreditCard size={48} style={{ color: 'var(--text-muted)' }} />
            <h4 className="empty-state-title">Kayıtlı Kart Bulunmadı</h4>
            <p>Sistemde kayıtlı aktif kredi kartı bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Kart Adı</th>
                  <th>Limit</th>
                  <th>Kullanılan (Borç)</th>
                  <th>Son Ödeme Tarihi</th>
                  <th>Asgari Ödeme</th>
                  <th>Kullanılabilir Limit</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {creditCards.map(card => {
                  const limit = parseFloat(card.limit);
                  const used = parseFloat(card.used_amount);
                  const avail = Math.max(0, limit - used);
                  return (
                    <tr key={card.id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CreditCard size={16} className="text-secondary" />
                          {card.card_name}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{limit.toLocaleString('tr-TR')} ₺</td>
                      <td className="text-danger" style={{ fontWeight: 700 }}>
                        {used.toLocaleString('tr-TR')} ₺
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {card.due_date ? new Date(card.due_date).toLocaleDateString('tr-TR') : '-'}
                      </td>
                      <td>
                        %{card.minimum_payment || 0}
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                          ({((used * parseFloat(card.minimum_payment || 0)) / 100).toLocaleString('tr-TR')} ₺)
                        </span>
                      </td>
                      <td className="text-success" style={{ fontWeight: 600 }}>
                        {avail.toLocaleString('tr-TR')} ₺
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            title="Harcama Kaydet"
                            onClick={() => openSpendModal(card)}
                          >
                            <Plus size={13} />
                            <span>Harcama</span>
                          </button>

                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => openPayModal(card)}
                            disabled={used === 0}
                            style={{ opacity: used === 0 ? 0.5 : 1 }}
                          >
                            <DollarSign size={13} />
                            <span>Öde</span>
                          </button>

                          <button 
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Kartı Düzenle"
                            onClick={() => openEditModal(card)}
                            style={{ padding: '4px' }}
                          >
                            <Edit size={13} />
                          </button>

                          {onDeleteCard && (
                            <button 
                              className="btn btn-secondary btn-icon btn-sm"
                              title="Kartı Sil"
                              onClick={() => setCardToDelete(card)}
                              style={{ color: 'var(--color-danger)' }}
                            >
                              <Trash2 size={13} />
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

      {/* MODAL 1: PAY CARD DEBT */}
      {showPayModal && selectedCard && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Kredi Kartı Ödemesi Yap</h2>
              <button className="modal-close" onClick={() => setShowPayModal(false)}>×</button>
            </div>
            
            <form onSubmit={handlePaySubmit}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>KREDİ KARTI</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0' }}>{selectedCard.card_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Güncel Borç: {parseFloat(selectedCard.used_amount).toLocaleString('tr-TR')} ₺
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Yatırılan Ödeme Tutarı (₺)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  required
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="1"
                />
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

              <div className="form-group">
                <label className="form-label">Ödeme Yapılan Hesabınız</label>
                <select 
                  className="select-custom"
                  value={paymentAccount}
                  onChange={(e) => setPaymentAccount(e.target.value)}
                >
                  <option value="Banka">Banka Hesabı</option>
                  <option value="Kasa">Elden (Kasa)</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Ödemeyi İşle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SPEND FROM CARD */}
      {showSpendModal && selectedCard && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Karttan Harcama Yap / Borçlandır</h2>
              <button className="modal-close" onClick={() => setShowSpendModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSpendSubmit}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>KREDİ KARTI</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0' }}>{selectedCard.card_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Kullanılabilir Limit: {Math.max(0, parseFloat(selectedCard.limit) - parseFloat(selectedCard.used_amount)).toLocaleString('tr-TR')} ₺
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Toplam Harcama (₺)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input" 
                    required
                    placeholder="0.00"
                    value={spendAmount}
                    onChange={(e) => setSpendAmount(e.target.value)}
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Taksit Sayısı</label>
                  <select 
                    className="select-custom"
                    value={spendInstallments}
                    onChange={(e) => setSpendInstallments(e.target.value)}
                  >
                    <option value="1">1 Taksit (Peşin)</option>
                    <option value="2">2 Taksit</option>
                    <option value="3">3 Taksit</option>
                    <option value="4">4 Taksit</option>
                    <option value="6">6 Taksit</option>
                    <option value="9">9 Taksit</option>
                    <option value="12">12 Taksit</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Gider Kategorisi</label>
                <select 
                  className="select-custom"
                  value={spendCategory}
                  onChange={(e) => setSpendCategory(e.target.value)}
                >
                  <option value="Ofis Gideri">Ofis Gideri</option>
                  <option value="Yazılım">Yazılım / Sunucu</option>
                  <option value="Yakıt">Yakıt / Ulaşım</option>
                  <option value="Yemek">Yemek / Temsil</option>
                  <option value="Reklam">Reklam Harcaması</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Harcama Açıklaması</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Örn: Adobe lisans yenileme"
                  value={spendDescription}
                  onChange={(e) => setSpendDescription(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSpendModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Harcamayı Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW CARD */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Yeni Kredi Kartı Ekle</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddCardSubmit}>
              <div className="form-group">
                <label className="form-label">Kart İsmi / Banka</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="Örn: Garanti Bonus Ticari"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Kart Limiti (₺)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    placeholder="50000"
                    value={cardLimit}
                    onChange={(e) => setCardLimit(e.target.value)}
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Asgari Ödeme Oranı (%)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    placeholder="20"
                    value={cardMinPayment}
                    onChange={(e) => setCardMinPayment(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Son Ödeme Tarihi</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={cardDueDate}
                  onChange={(e) => setCardDueDate(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kartı Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT CARD */}
      {showEditModal && selectedCard && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Kredi Kartı Düzenle</h2>
              <button className="modal-close" onClick={() => { setShowEditModal(false); setSelectedCard(null); }}>×</button>
            </div>
            
            <form onSubmit={handleEditCardSubmit}>
              <div className="form-group">
                <label className="form-label">Kart İsmi / Banka</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  value={editCardName}
                  onChange={(e) => setEditCardName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Kart Limiti (₺)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    value={editCardLimit}
                    onChange={(e) => setEditCardLimit(e.target.value)}
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Asgari Ödeme Oranı (%)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    placeholder="20"
                    value={editCardMinPayment}
                    onChange={(e) => setEditCardMinPayment(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Son Ödeme Tarihi</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={editCardDueDate}
                  onChange={(e) => setEditCardDueDate(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); setSelectedCard(null); }}>İptal</button>
                <button type="submit" className="btn btn-primary">Değişiklikleri Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CARD CONFIRMATION MODAL */}
      {cardToDelete && (
        <div className="modal-overlay" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', margin: 0 }}>
                <AlertTriangle size={20} />
                Kredi Kartı Kaydını Sil
              </h2>
              <button className="modal-close" onClick={() => setCardToDelete(null)}>×</button>
            </div>

            <div style={{ padding: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  Silinecek Kredi Kartı
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {cardToDelete.card_name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Limit: {(parseFloat(cardToDelete.limit) || 0).toLocaleString('tr-TR')} ₺ · Güncel Borç: {(parseFloat(cardToDelete.used_amount) || 0).toLocaleString('tr-TR')} ₺
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                <strong>{cardToDelete.card_name}</strong> isimli kredi kartını sistemden silmek istediğinize emin misiniz?<br />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>
                  ⚠️ Bu işlem kart tanımını listeden kaldıracaktır.
                </span>
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setCardToDelete(null)}
                style={{ minWidth: '110px' }}
              >
                Vazgeç
              </button>
              <button 
                type="button" 
                className="btn btn-sm" 
                onClick={() => {
                  onDeleteCard(cardToDelete.id);
                  setCardToDelete(null);
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
