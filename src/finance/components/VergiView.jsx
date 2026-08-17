import React, { useState } from 'react';
import { Plus, Percent, Calendar, Landmark, CheckCircle, Edit, DollarSign } from 'lucide-react';

export default function VergiView({ 
  taxes, 
  period, 
  onRecordTaxPayment, 
  onUpdateTaxes,
  isLoading 
}) {
  const [showPayModal, setShowPayModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Pay Form State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAccount, setPaymentAccount] = useState('Banka');

  // Edit/Add Form State
  const [kdv, setKdv] = useState('0');
  const [muhtasar, setMuhtasar] = useState('0');
  const [sgk, setSgk] = useState('0');
  const [geciciVergi, setGeciciVergi] = useState('0');
  const [dueDate, setDueDate] = useState('');

  // Find tax record for the active period
  const activeTax = taxes.find(t => t.period === period) || {
    kdv: 0,
    muhtasar: 0,
    sgk: 0,
    gecici_vergi: 0,
    amount_paid: 0,
    status: 'unpaid',
    due_date: ''
  };

  const totalTax = parseFloat(activeTax.kdv) + parseFloat(activeTax.muhtasar) + parseFloat(activeTax.sgk) + parseFloat(activeTax.gecici_vergi);
  const paid = parseFloat(activeTax.amount_paid);
  const remaining = Math.max(0, totalTax - paid);

  // Open pay modal
  const openPayModal = () => {
    setPaymentAmount(remaining.toString());
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentAccount('Banka');
    setShowPayModal(true);
  };

  // Open edit modal
  const openEditModal = () => {
    setKdv(activeTax.kdv.toString());
    setMuhtasar(activeTax.muhtasar.toString());
    setSgk(activeTax.sgk.toString());
    setGeciciVergi(activeTax.gecici_vergi.toString());
    setDueDate(activeTax.due_date ? activeTax.due_date.split('T')[0] : '');
    setShowEditModal(true);
  };

  // Handle pay submit
  const handlePaySubmit = (e) => {
    e.preventDefault();
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;

    onRecordTaxPayment({
      period,
      amount_paid: parseFloat(paymentAmount) + paid,
      payment_date: paymentDate,
      payment_account: paymentAccount
    });

    setShowPayModal(false);
  };

  // Handle edit submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    onUpdateTaxes({
      period,
      kdv: parseFloat(kdv || 0),
      muhtasar: parseFloat(muhtasar || 0),
      sgk: parseFloat(sgk || 0),
      gecici_vergi: parseFloat(geciciVergi || 0),
      due_date: dueDate || null
    });

    setShowEditModal(false);
  };

  return (
    <div className="vergi-view">
      {/* Action Buttons */}
      <div className="filter-bar" style={{ justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={openEditModal}>
            <Edit size={16} />
            <span>Vergi Beyan Et / Düzenle</span>
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={openPayModal}
            disabled={remaining === 0}
            style={{ opacity: remaining === 0 ? 0.5 : 1 }}
          >
            <DollarSign size={16} />
            <span>Vergi Ödemesi Yap</span>
          </button>
        </div>
      </div>

      {/* Tax Table Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Katma Değer Vergisi (KDV)</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '8px' }}>
            {parseFloat(activeTax.kdv).toLocaleString('tr-TR')} ₺
          </h2>
        </div>

        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Muhtasar Vergisi</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '8px' }}>
            {parseFloat(activeTax.muhtasar).toLocaleString('tr-TR')} ₺
          </h2>
        </div>

        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>SGK Primleri</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '8px' }}>
            {parseFloat(activeTax.sgk).toLocaleString('tr-TR')} ₺
          </h2>
        </div>

        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Geçici Vergi</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '8px' }}>
            {parseFloat(activeTax.gecici_vergi).toLocaleString('tr-TR')} ₺
          </h2>
        </div>
      </div>

      {/* Detailed Overview */}
      <div className="glass-card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <span>Yükleniyor...</span>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Dönem</th>
                  <th>Son Ödeme Tarihi</th>
                  <th>Toplam Vergi Beyanı</th>
                  <th>Ödenen</th>
                  <th>Kalan Borç</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, fontSize: '1rem' }}>{period} Dönemi</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {activeTax.due_date ? new Date(activeTax.due_date).toLocaleDateString('tr-TR') : 'Beyan Edilmemiş'}
                  </td>
                  <td style={{ fontWeight: 700 }}>{totalTax.toLocaleString('tr-TR')} ₺</td>
                  <td className="text-success" style={{ fontWeight: 600 }}>{paid.toLocaleString('tr-TR')} ₺</td>
                  <td style={{ color: remaining > 0 ? 'var(--color-danger)' : 'inherit', fontWeight: 700 }}>
                    {remaining > 0 ? `${remaining.toLocaleString('tr-TR')} ₺` : 'Vergi Borcu Yok'}
                  </td>
                  <td>
                    {remaining === 0 && totalTax > 0 && <span className="badge badge-paid">Ödendi</span>}
                    {remaining > 0 && paid > 0 && <span className="badge badge-partial">Kısmi Ödendi</span>}
                    {remaining > 0 && paid === 0 && <span className="badge badge-unpaid" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>Ödenmedi</span>}
                    {totalTax === 0 && <span className="badge badge-unpaid">Beyansız</span>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAY TAX MODAL */}
      {showPayModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Vergi Ödemesi Kaydet</h2>
              <button className="modal-close" onClick={() => setShowPayModal(false)}>×</button>
            </div>
            
            <form onSubmit={handlePaySubmit}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>VERGİ DÖNEMİ</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0' }}>{period} Dönemi</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Beyan Edilen: {totalTax.toLocaleString('tr-TR')} ₺ | 
                  Kalan Borç: {remaining.toLocaleString('tr-TR')} ₺
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ödenecek Tutar (₺)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required
                  placeholder="Tutarı girin..."
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={remaining}
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
                <label className="form-label">Çıkış Hesabı</label>
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
                <button type="submit" className="btn btn-primary">Ödemeyi Yap</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERGİ BEYAN / EDIT MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Vergi Beyanı Düzenle ({period})</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">KDV Beyanı (₺)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    value={kdv}
                    onChange={(e) => setKdv(e.target.value)}
                    min="0"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Muhtasar (₺)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    value={muhtasar}
                    onChange={(e) => setMuhtasar(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">SGK Primleri (₺)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    value={sgk}
                    onChange={(e) => setSgk(e.target.value)}
                    min="0"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Geçici Vergi (₺)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    value={geciciVergi}
                    onChange={(e) => setGeciciVergi(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Son Ödeme Tarihi (Vade)</label>
                <input 
                  type="date" 
                  className="form-input" 
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
