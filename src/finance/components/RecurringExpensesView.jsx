import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, DollarSign, Plus, RefreshCcw, Trash2, AlertTriangle, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RecurringExpensesView({ 
  period,
  onAddExpense
}) {
  // Saved recurring bill templates (backed by Supabase + localStorage fallback)
  const [bills, setBills] = useState(() => {
    const saved = localStorage.getItem('socialart_recurring_bills');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 1, title: 'Ofis Kirası', category: 'Kira', dueDay: 1, amount: 25000, lastPaidPeriod: '' },
      { id: 2, title: 'Muhasebeci / SMMM Hizmet Bedeli', category: 'Muhasebeci', dueDay: 5, amount: 4500, lastPaidPeriod: '' },
      { id: 3, title: 'Adobe Creative Cloud Lisansları', category: 'Ofis Gideri', dueDay: 10, amount: 2800, lastPaidPeriod: '' },
      { id: 4, title: 'Ofis İnternet & Fiber Hat', category: 'İnternet', dueDay: 15, amount: 950, lastPaidPeriod: '' },
      { id: 5, title: 'Ofis Elektrik Faturası', category: 'Elektrik', dueDay: 20, amount: 3200, lastPaidPeriod: '' }
    ];
  });

  // Supabase initial load
  useEffect(() => {
    const loadFromSupabase = async () => {
      try {
        const { data, error } = await supabase.from('finance_recurring_bills').select('*').order('due_day', { ascending: true });
        if (!error && Array.isArray(data) && data.length > 0) {
          const formatted = data.map(d => ({
            id: d.id,
            title: d.title,
            category: d.category,
            dueDay: d.due_day,
            amount: parseFloat(d.amount) || 0,
            lastPaidPeriod: d.last_paid_period || ''
          }));
          setBills(formatted);
          localStorage.setItem('socialart_recurring_bills', JSON.stringify(formatted));
        }
      } catch (err) {}
    };
    loadFromSupabase();
  }, []);

  const saveBills = async (updated) => {
    setBills(updated);
    localStorage.setItem('socialart_recurring_bills', JSON.stringify(updated));
  };

  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Kira');
  const [dueDay, setDueDay] = useState('1');
  const [amount, setAmount] = useState('');

  // Handle Mark as Paid (Creates official Expense and updates lastPaidPeriod)
  const handlePayBill = (bill) => {
    if (onAddExpense) {
      onAddExpense({
        amount: parseFloat(bill.amount),
        category: bill.category,
        expense_date: new Date().toISOString().split('T')[0],
        period,
        payment_method: 'Banka',
        description: `[Sabit Gider / Fatura] ${bill.title} (${period} Dönemi)`
      });
    }

    const updated = bills.map(b => b.id === bill.id ? { ...b, lastPaidPeriod: period } : b);
    saveBills(updated);
  };

  // Handle Add New Bill Template
  const handleAddBillSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount || parseFloat(amount) <= 0) return;

    const newBill = {
      id: Date.now(),
      title,
      category,
      dueDay: parseInt(dueDay),
      amount: parseFloat(amount),
      lastPaidPeriod: ''
    };

    const updated = [...bills, newBill];
    saveBills(updated);
    setShowAddBillModal(false);
    setTitle('');
    setAmount('');
  };

  // Handle Delete Bill Template
  const handleDeleteBill = (id) => {
    const updated = bills.filter(b => b.id !== id);
    saveBills(updated);
  };

  // Stats
  const totalMonthlyFixedOverhead = bills.reduce((acc, b) => acc + b.amount, 0);
  const paidCount = bills.filter(b => b.lastPaidPeriod === period).length;
  const pendingCount = bills.length - paidCount;

  return (
    <div className="recurring-expenses-view">
      {/* Top Action Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCcw size={20} className="text-accent" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Sabit Gider & Fatura Takvimi ({period} Dönemi)</h3>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddBillModal(true)}>
          <Plus size={16} />
          <span>Yeni Sabit Fatura Tanımla</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Aylık Toplam Sabit Yük</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>
            {totalMonthlyFixedOverhead.toLocaleString('tr-TR')} ₺
          </h2>
        </div>

        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Ödenen Faturalar</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
            {paidCount} / {bills.length} Fatura
          </h2>
        </div>

        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Ödeme Bekleyen</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: pendingCount > 0 ? '#ef4444' : '#10b981', marginTop: '6px' }}>
            {pendingCount} Fatura
          </h2>
        </div>
      </div>

      {/* Checklist Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Son Ödeme Günü</th>
                <th>Fatura / Gider Tanımı</th>
                <th>Kategori</th>
                <th style={{ textAlign: 'right' }}>Tutar</th>
                <th>Dönemlik Ödeme Durumu</th>
                <th style={{ textAlign: 'right' }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {bills.sort((a, b) => a.dueDay - b.dueDay).map(bill => {
                const isPaid = bill.lastPaidPeriod === period;
                return (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Her ayın {bill.dueDay}'i
                    </td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>
                      {bill.title}
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                        {bill.category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#fff' }}>
                      {bill.amount.toLocaleString('tr-TR')} ₺
                    </td>
                    <td>
                      {isPaid ? (
                        <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} />
                          Ödendi ({period})
                        </span>
                      ) : (
                        <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} />
                          Ödeme Bekliyor
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {!isPaid ? (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handlePayBill(bill)}
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '4px' }}
                          >
                            <Check size={14} />
                            <span>Ödemeyi Kaydet</span>
                          </button>
                        ) : (
                          <button 
                            className="btn btn-secondary btn-sm"
                            disabled
                            style={{ opacity: 0.5, padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            Tamamlandı
                          </button>
                        )}

                        <button 
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => handleDeleteBill(bill.id)}
                          style={{ color: 'var(--color-danger)' }}
                          title="Fatura Tanımını Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD RECURRING BILL */}
      {showAddBillModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Yeni Sabit Gider / Fatura Tanımla</h2>
              <button className="modal-close" onClick={() => setShowAddBillModal(false)}>×</button>
            </div>

            <form onSubmit={handleAddBillSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Gider / Fatura Adı</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="Örn: Ofis Kirası veya Fiber İnternet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Kategori</label>
                  <select className="select-custom" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Kira">Kira</option>
                    <option value="Muhasebeci">Muhasebeci</option>
                    <option value="Elektrik">Elektrik</option>
                    <option value="Su">Su</option>
                    <option value="İnternet">İnternet</option>
                    <option value="Telefon">Telefon</option>
                    <option value="Ofis Gideri">Ofis Gideri</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Son Ödeme Günü</label>
                  <select className="select-custom" value={dueDay} onChange={(e) => setDueDay(e.target.value)}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>Her ayın {d}'i</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Aylık Tutar (₺)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required
                    placeholder="2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddBillModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Faturayı Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
