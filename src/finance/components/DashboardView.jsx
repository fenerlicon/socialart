import React, { useState } from 'react';
import { DollarSign, Users, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, Landmark, Percent, Target, Bell, AlertTriangle, Edit3, CheckCircle2, ChevronRight } from 'lucide-react';

export default function DashboardView({ 
  clients, 
  staff, 
  clientPayments, 
  expenses, 
  staffPayments, 
  taxes, 
  creditCards, 
  cashJournal,
  period, 
  setTab 
}) {
  // Goal State
  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    return parseFloat(localStorage.getItem('socialart_monthly_goal')) || 500000;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(monthlyGoal.toString());

  const handleGoalSave = (e) => {
    e.preventDefault();
    const val = parseFloat(tempGoal) || 500000;
    setMonthlyGoal(val);
    localStorage.setItem('socialart_monthly_goal', val);
    setIsEditingGoal(false);
  };

  // 1. Calculations
  // Total client contract fees
  const activeClients = (clients || []).filter(c => c.durum === 'aktif' || !c.durum);
  const totalClientBilling = activeClients.reduce((acc, c) => acc + (parseFloat(c.monthly_fee) || 0), 0);
  
  // Gelirler (Tahsil Edilen)
  const totalReceived = (clientPayments || []).reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);

  const goalProgress = Math.min(100, Math.round((totalReceived / monthlyGoal) * 100));
  const remainingGoal = Math.max(0, monthlyGoal - totalReceived);
  
  // Toplam Müşteri Alacak
  const totalClientReceivables = Math.max(0, totalClientBilling - totalReceived);

  // Bu Ay Gider (Expenses + Staff Paid)
  const totalDirectExpenses = expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  const totalStaffPaid = staffPayments.reduce((acc, p) => acc + (parseFloat(p.amount_paid) || 0), 0);
  
  const totalExpenses = totalDirectExpenses + totalStaffPaid;

  // Net Nakit Durumu (Gelir - Gider)
  const netCashStatus = totalReceived - totalExpenses;

  // Personel Net Maaş Yükü
  const totalNetSalaries = staff.reduce((acc, s) => {
    const sp = staffPayments.find(p => p.staff_id === s.id);
    if (sp) {
      const base = parseFloat(sp.base_salary) || 0;
      const avans = parseFloat(sp.advance_amount) || 0;
      const prim = parseFloat(sp.commission_amount || 0) + parseFloat(sp.bonus_amount || 0);
      const kesinti = parseFloat(sp.deduction_amount) || 0;
      return acc + (base - avans + prim - kesinti);
    }
    return acc + parseFloat(s.base_salary || 0);
  }, 0);

  // Kredi Kartı Borcu
  const totalCardDebt = creditCards.reduce((acc, c) => acc + (parseFloat(c.used_amount) || 0), 0);

  // Kasa / Banka Bakiyeleri from Cash Journal
  const bankBalance = cashJournal
    .filter(t => t.account === 'Banka')
    .reduce((acc, t) => acc + (t.type === 'Giriş' ? parseFloat(t.amount) : -parseFloat(t.amount)), 0);
    
  const cashBalance = cashJournal
    .filter(t => t.account === 'Kasa')
    .reduce((acc, t) => acc + (t.type === 'Giriş' ? parseFloat(t.amount) : -parseFloat(t.amount)), 0);

  // Top Debtors (Clients with outstanding balance)
  const topDebtors = activeClients.map(c => {
    const paid = clientPayments.filter(p => p.client_id === c.id).reduce((acc, p) => acc + parseFloat(p.amount), 0);
    const fee = parseFloat(c.monthly_fee) || 0;
    return { name: c.name, fee, paid, balance: fee - paid };
  }).filter(c => c.balance > 0).sort((a, b) => b.balance - a.balance);

  // Personnel Cost Report data
  const personnelCosts = staff.map(s => {
    const sp = staffPayments.find(p => p.staff_id === s.id);
    const base = sp ? parseFloat(sp.base_salary) : parseFloat(s.base_salary || 0);
    const prim = sp ? (parseFloat(sp.commission_amount || 0) + parseFloat(sp.bonus_amount || 0)) : 0;
    const total = base + prim;
    return { name: s.display_name, role: s.role, total };
  }).sort((a, b) => b.total - a.total);

  // Smart Action Alerts
  const overdueCount = topDebtors.length;
  const overdueTotal = topDebtors.reduce((acc, d) => acc + d.balance, 0);

  const upcomingCardAlerts = creditCards.filter(c => {
    if (!c.due_date || parseFloat(c.used_amount) <= 0) return false;
    const due = new Date(c.due_date);
    const now = new Date();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  return (
    <div className="dashboard-view">
      
      {/* 📢 SMART ACTION ALERTS RIBBON (FEATURE 4) */}
      {(overdueCount > 0 || upcomingCardAlerts.length > 0) && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {overdueCount > 0 && (
            <div 
              onClick={() => setTab('clients')}
              style={{ 
                background: 'rgba(239, 68, 68, 0.08)', 
                border: '1px solid rgba(239, 68, 68, 0.25)', 
                borderRadius: '12px', 
                padding: '0.85rem 1.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(239,68,68,0.2)', padding: '6px', borderRadius: '8px', color: '#f87171' }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                    🔴 Geciken Müşteri Tahsilatları ({overdueCount} Müşteri)
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginTop: '2px' }}>
                    Bu ay henüz ödeme yapmamış müşterilerden toplam <strong>{overdueTotal.toLocaleString('tr-TR')} ₺</strong> alacağınız var.
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171', fontSize: '0.85rem', fontWeight: 600 }}>
                Müşterileri Gör <ChevronRight size={16} />
              </div>
            </div>
          )}

          {upcomingCardAlerts.length > 0 && (
            <div 
              onClick={() => setTab('cards')}
              style={{ 
                background: 'rgba(245, 158, 11, 0.08)', 
                border: '1px solid rgba(245, 158, 11, 0.25)', 
                borderRadius: '12px', 
                padding: '0.85rem 1.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(245,158,11,0.2)', padding: '6px', borderRadius: '8px', color: '#fbbf24' }}>
                  <CreditCard size={18} />
                </div>
                <div>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                    🟡 Yaklaşan Kredi Kartı Son Ödeme Günü ({upcomingCardAlerts.map(c => c.card_name).join(', ')})
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginTop: '2px' }}>
                    Bu hafta son ödeme günü gelen kartlarda toplam <strong>{upcomingCardAlerts.reduce((a, c) => a + parseFloat(c.used_amount), 0).toLocaleString('tr-TR')} ₺</strong> ödenmesi gereken borç bulunuyor.
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>
                Kartları İncele <ChevronRight size={16} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🎯 MONTHLY REVENUE GOAL TRACKER (FEATURE 5) */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(19,24,35,0.9) 0%, rgba(30,41,59,0.7) 100%)', border: '1px solid rgba(56,189,248,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '6px', borderRadius: '8px' }}>
              <Target size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#fff' }}>Aylık Ciro Hedefi Takibi</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Bu ay gerçekleşen tahsilat hedefe ne kadar yaklaştı?</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isEditingGoal ? (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => { setTempGoal(monthlyGoal.toString()); setIsEditingGoal(true); }}
                style={{ fontSize: '0.8rem', gap: '4px' }}
              >
                <Edit3 size={13} />
                <span>Hedefi Düzenle</span>
              </button>
            ) : (
              <form onSubmit={handleGoalSave} style={{ display: 'flex', gap: '6px' }}>
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ width: '130px', padding: '0.3rem 0.6rem', fontSize: '0.85rem' }} 
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                  placeholder="Hedef Ciro"
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm">Kaydet</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditingGoal(false)}>✕</button>
              </form>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>HEDEF CİRO</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
              {monthlyGoal.toLocaleString('tr-TR')} ₺
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>% {goalProgress} Tamamlandı</span>
              <span style={{ color: 'var(--text-muted)' }}>Gerçekleşen: {totalReceived.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${goalProgress}%`, 
                  height: '100%', 
                  background: goalProgress >= 100 ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                  borderRadius: '5px',
                  transition: 'width 0.5s ease-out'
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>HEDEFE KALAN</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: remainingGoal === 0 ? '#10b981' : '#f87171', marginTop: '2px' }}>
              {remainingGoal === 0 ? '🎉 Ulaşıldı!' : `${remainingGoal.toLocaleString('tr-TR')} ₺`}
            </div>
          </div>
        </div>
      </div>
      {/* Overview Indicators */}
      <div className="metrics-grid">
        <div className="glass-card metric-card" onClick={() => setTab('clients')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Toplam Alacak</span>
            <div className="metric-icon-wrapper revenue"><DollarSign size={18} /></div>
          </div>
          <div className="metric-value">{totalClientReceivables.toLocaleString('tr-TR')} ₺</div>
          <div className="metric-footer"><span>Müşteri borçları toplamı</span></div>
        </div>

        <div className="glass-card metric-card" onClick={() => setTab('income')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Bu Ay Tahsilat</span>
            <div className="metric-icon-wrapper profit"><ArrowUpRight size={18} /></div>
          </div>
          <div className="metric-value text-success">{totalReceived.toLocaleString('tr-TR')} ₺</div>
          <div className="metric-footer"><span>Bu ay toplanan nakit</span></div>
        </div>

        <div className="glass-card metric-card" onClick={() => setTab('expenses')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Bu Ay Gider</span>
            <div className="metric-icon-wrapper danger"><ArrowDownRight size={18} /></div>
          </div>
          <div className="metric-value text-danger">{totalExpenses.toLocaleString('tr-TR')} ₺</div>
          <div className="metric-footer"><span>Operasyonel + Maaş + Vergi</span></div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <span className="metric-title">Net Nakit Durumu</span>
            <div className="metric-icon-wrapper profit" style={{ background: netCashStatus >= 0 ? 'var(--gradient-emerald)' : 'var(--gradient-danger)' }}><TrendingUp size={18} /></div>
          </div>
          <div className="metric-value" style={{ color: netCashStatus >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {netCashStatus.toLocaleString('tr-TR')} ₺
          </div>
          <div className="metric-footer"><span>Tahsilat - Gider</span></div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="glass-card metric-card" onClick={() => setTab('employees')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Personel Net Maaş</span>
            <div className="metric-icon-wrapper expense"><Users size={18} /></div>
          </div>
          <div className="metric-value">{totalNetSalaries.toLocaleString('tr-TR')} ₺</div>
          <div className="metric-footer"><span>Maaş + Prim - Kesintiler</span></div>
        </div>



        <div className="glass-card metric-card" onClick={() => setTab('cards')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Kredi Kartı Borcu</span>
            <div className="metric-icon-wrapper danger" style={{ opacity: totalCardDebt > 0 ? 1 : 0.5 }}><CreditCard size={18} /></div>
          </div>
          <div className="metric-value">{totalCardDebt.toLocaleString('tr-TR')} ₺</div>
          <div className="metric-footer"><span>Kullanılan kart limitleri</span></div>
        </div>

        <div className="glass-card metric-card" onClick={() => setTab('cash')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Banka / Kasa Bakiyesi</span>
            <div className="metric-icon-wrapper profit"><Landmark size={18} /></div>
          </div>
          <div className="metric-value" style={{ fontSize: '1.45rem' }}>
            B: {bankBalance.toLocaleString('tr-TR')} ₺ / K: {cashBalance.toLocaleString('tr-TR')} ₺
          </div>
          <div className="metric-footer"><span>Toplam Nakit: {(bankBalance + cashBalance).toLocaleString('tr-TR')} ₺</span></div>
        </div>
      </div>

      {/* Two Columns Dashboard Content */}
      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Top Debtors Card */}
        <div className="glass-card">
          <div className="chart-header">
            <h3 className="chart-title">En Çok Borçlu Müşteriler</h3>
          </div>
          {topDebtors.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div className="text-success" style={{ fontSize: '2rem' }}>✓</div>
              <p>Ödenmemiş müşteri alacağı bulunmuyor.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Müşteri</th>
                    <th>Fatura Bedeli</th>
                    <th>Ödenen</th>
                    <th>Kalan Alacak</th>
                  </tr>
                </thead>
                <tbody>
                  {topDebtors.slice(0, 5).map((d, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td>{d.fee.toLocaleString('tr-TR')} ₺</td>
                      <td className="text-success">{d.paid.toLocaleString('tr-TR')} ₺</td>
                      <td className="text-danger" style={{ fontWeight: 700 }}>{d.balance.toLocaleString('tr-TR')} ₺</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Personnel Cost Card */}
        <div className="glass-card">
          <div className="chart-header">
            <h3 className="chart-title">Personel Maliyet Raporu</h3>
          </div>
          <div className="table-container">
            <table className="custom-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Personel</th>
                  <th>Görev / Rol</th>
                  <th>Toplam Hak Ediş (Maaş+Prim)</th>
                </tr>
              </thead>
              <tbody>
                {personnelCosts.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.role || 'Çalışan'}</td>
                    <td style={{ fontWeight: 700 }}>{p.total.toLocaleString('tr-TR')} ₺</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
