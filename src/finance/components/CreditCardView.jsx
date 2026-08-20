import React, { useState } from 'react';
import { Plus, CreditCard, DollarSign, Calendar, RefreshCw, Trash2, Edit, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
    const targetCard = card || creditCards[0] || null;
    setSelectedCard(targetCard);
    setPaymentAmount(targetCard && targetCard.used_amount > 0 ? targetCard.used_amount.toString() : '');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentAccount('Banka');
    setShowPayModal(true);
  };

  // Open spend modal
  const openSpendModal = (card) => {
    const targetCard = card || creditCards[0] || null;
    setSelectedCard(targetCard);
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
      {/* Top Action Bar with prominent Payment & Spend buttons */}
      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
            <CreditCard size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>Kredi Kartı & Borç Yönetimi</h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Toplam {creditCards.length} adet kayıtlı kart</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => openSpendModal(null)}
            disabled={creditCards.length === 0}
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.84rem', height: '38px', borderRadius: '8px', gap: '6px' }}
          >
            <Plus size={15} />
            <span>+ Harcama Kaydet</span>
          </button>

          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={() => openPayModal(null)}
            disabled={creditCards.length === 0}
            style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              fontSize: '0.84rem', 
              height: '38px', 
              borderRadius: '8px', 
              gap: '6px', 
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' 
            }}
          >
            <DollarSign size={15} />
            <span>💳 Kredi Kartı Ödemesi Yap (Borç Kapat)</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={() => setShowAddModal(true)} 
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.84rem', height: '38px', borderRadius: '8px', gap: '6px' }}
          >
            <Plus size={15} />
            <span>+ Yeni Kart Ekle</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid #ef4444', padding: '1.25rem' }}>
          <span className="form-label" style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Güncel Kart Borçları</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '6px', color: '#ef4444' }}>
            {totalDebt.toLocaleString('tr-TR')} ₺
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ödenmesi gereken toplam borç meblağı</span>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #10b981', padding: '1.25rem' }}>
          <span className="form-label" style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Kullanılabilir Limit</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '6px', color: '#10b981' }}>
            {totalAvailable.toLocaleString('tr-TR')} ₺
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Toplam limit: {totalLimit.toLocaleString('tr-TR')} ₺</span>
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
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ marginTop: '1rem' }}>
              <Plus size={16} />
              <span>İlk Kredi Kartınızı Ekleyin</span>
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Kart Adı</th>
                  <th>Toplam Limit</th>
                  <th>Güncel Borç</th>
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
                            title="Karta Borç / Ödeme Yap"
                            onClick={() => openPayModal(card)}
                            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', fontWeight: 700 }}
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
      {showPayModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>💳 Kredi Kartı Ödemesi Yap (Borç Kapat)</h2>
              <button className="modal-close" onClick={() => setShowPayModal(false)}>×</button>
            </div>
            
            <form onSubmit={handlePaySubmit}>
              {/* Card Selector if multiple cards exist */}
              <div className="form-group">
                <label className="form-label">Ödeme Yapılacak Kredi Kartı</label>
                <select 
                  className="select-custom"
                  value={selectedCard?.id || ''}
                  onChange={(e) => {
                    const card = creditCards.find(c => c.id === parseInt(e.target.value));
                    setSelectedCard(card || null);
                    if (card && card.used_amount > 0) {
                      setPaymentAmount(String(card.used_amount));
                    }
                  }}
                >
                  {creditCards.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.card_name} (Borç: {parseFloat(c.used_amount).toLocaleString('tr-TR')} ₺ / Limit: {parseFloat(c.limit).toLocaleString('tr-TR')} ₺)
                    </option>
                  ))}
                </select>
              </div>

              {selectedCard && (
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SEÇİLİ KART</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, margin: '2px 0', color: '#fff' }}>{selectedCard.card_name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>GÜNCEL BORÇ</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-danger)' }}>
                        {parseFloat(selectedCard.used_amount).toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                <label className="form-label">Ödeme Yapılan Kaynak Hesap</label>
                <select 
                  className="select-custom"
                  value={paymentAccount}
                  onChange={(e) => setPaymentAccount(e.target.value)}
                >
                  <option value="Banka">Banka Hesabı (Havale/EFT)</option>
                  <option value="Kasa">Nakit (Elden Kasa)</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', fontWeight: 800 }}>
                  Ödemeyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SPEND FROM CARD */}
      {showSpendModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>💳 Karttan Harcama Yap / Borçlandır</h2>
              <button className="modal-close" onClick={() => setShowSpendModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSpendSubmit}>
              {/* Card Selector */}
              <div className="form-group">
                <label className="form-label">Harcama Yapılacak Kredi Kartı</label>
                <select 
                  className="select-custom"
                  value={selectedCard?.id || ''}
                  onChange={(e) => {
                    const card = creditCards.find(c => c.id === parseInt(e.target.value));
                    setSelectedCard(card || null);
                  }}
                >
                  {creditCards.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.card_name} (Kullanılabilir: {Math.max(0, parseFloat(c.limit) - parseFloat(c.used_amount)).toLocaleString('tr-TR')} ₺)
                    </option>
                  ))}
                </select>
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
                    <option value="1">1 Taksit (Tek Çekim)</option>
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
              <h2>Yeni Kredi Kartı Tanımla</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddCardSubmit}>
              <div className="form-group">
                <label className="form-label">Kart Adı / Banka</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="Örn: Garanti Bonus Ticari"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kart Limiti (₺)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  required
                  placeholder="0.00"
                  value={cardLimit}
                  onChange={(e) => setCardLimit(e.target.value)}
                  min="1"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Asgari Ödeme Oranı (%)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="20"
                    value={cardMinPayment}
                    onChange={(e) => setCardMinPayment(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hesap Kesim / Son Ödeme</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={cardDueDate}
                    onChange={(e) => setCardDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kartı Tanımla</button>
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
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleEditCardSubmit}>
              <div className="form-group">
                <label className="form-label">Kart Adı / Banka</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  value={editCardName}
                  onChange={(e) => setEditCardName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kart Limiti (₺)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  required
                  value={editCardLimit}
                  onChange={(e) => setEditCardLimit(e.target.value)}
                  min="1"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Asgari Ödeme Oranı (%)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editCardMinPayment}
                    onChange={(e) => setEditCardMinPayment(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Son Ödeme Tarihi</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={editCardDueDate}
                    onChange={(e) => setEditCardDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Değişiklikleri Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {cardToDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Kartı Sil</h2>
              <button className="modal-close" onClick={() => setCardToDelete(null)}>×</button>
            </div>
            
            <div style={{ padding: '1rem 0', textAlign: 'center' }}>
              <AlertTriangle size={48} style={{ color: 'var(--color-danger)', marginBottom: '1rem' }} />
              <p style={{ margin: 0, fontWeight: 600 }}>
                "{cardToDelete.card_name}" adlı kredi kartını silmek istediğinize emin misiniz?
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCardToDelete(null)}>Vazgeç</button>
              <button 
                className="btn btn-danger" 
                onClick={() => {
                  onDeleteCard(cardToDelete.id);
                  setCardToDelete(null);
                }}
              >
                Evet, Kartı Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
