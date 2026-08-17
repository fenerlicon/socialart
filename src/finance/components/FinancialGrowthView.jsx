import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart, BarChart2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function FinancialGrowthView({ 
  clientPayments = [],
  expenses = [],
  staffPayments = [],
  taxes = [],
  period
}) {
  // Parse active year and month
  const [activeYearStr, activeMonthStr] = period.split('-');
  const activeYear = parseInt(activeYearStr);
  const activeMonth = parseInt(activeMonthStr);

  // Month-over-Month (MoM) calculation
  const getPeriodRevenue = (pStr) => {
    return clientPayments
      .filter(p => p.period === pStr)
      .reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
  };

  const getPeriodExpense = (pStr) => {
    const exp = expenses.filter(e => e.period === pStr).reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
    const staff = staffPayments.filter(s => s.period === pStr).reduce((acc, s) => acc + (parseFloat(s.amount_paid) || 0), 0);
    return exp + staff;
  };

  // Current Month vs Previous Month
  const prevMonth = activeMonth === 1 ? 12 : activeMonth - 1;
  const prevYear = activeMonth === 1 ? activeYear - 1 : activeYear;
  const prevPeriodStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

  const currentRevenue = getPeriodRevenue(period);
  const prevRevenue = getPeriodRevenue(prevPeriodStr);
  const revenueGrowth = prevRevenue > 0 ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100) : (currentRevenue > 0 ? 100 : 0);

  const currentExpense = getPeriodExpense(period);
  const prevExpense = getPeriodExpense(prevPeriodStr);

  const currentProfit = currentRevenue - currentExpense;
  const prevProfit = prevRevenue - prevExpense;
  const profitGrowth = prevProfit !== 0 ? Math.round(((currentProfit - prevProfit) / Math.abs(prevProfit)) * 100) : (currentProfit > 0 ? 100 : 0);

  // Quarterly Breakdown (Q1, Q2, Q3, Q4)
  const quarters = [
    { name: '1. Çeyrek (Q1)', months: ['01', '02', '03'] },
    { name: '2. Çeyrek (Q2)', months: ['04', '05', '06'] },
    { name: '3. Çeyrek (Q3)', months: ['07', '08', '09'] },
    { name: '4. Çeyrek (Q4)', months: ['10', '11', '12'] }
  ].map(q => {
    let rev = 0;
    let exp = 0;
    q.months.forEach(m => {
      const pStr = `${activeYear}-${m}`;
      rev += getPeriodRevenue(pStr);
      exp += getPeriodExpense(pStr);
    });
    const profit = rev - exp;
    const margin = rev > 0 ? Math.round((profit / rev) * 100) : 0;
    return { ...q, revenue: rev, expense: exp, profit, margin };
  });

  return (
    <div className="financial-growth-view">
      {/* Header */}
      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={20} className="text-accent" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Finansal Büyüme & Kıyaslama Raporu ({activeYear})</h3>
        </div>
      </div>

      {/* Month-over-Month Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Ciro Büyümesi (MoM)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: revenueGrowth >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>
              {revenueGrowth >= 0 ? '+' : ''}%{revenueGrowth}
            </h2>
            {revenueGrowth >= 0 ? <ArrowUpRight size={24} color="#10b981" /> : <ArrowDownRight size={24} color="#ef4444" />}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Önceki aya göre ({prevPeriodStr}): {prevRevenue.toLocaleString('tr-TR')} ₺ → {currentRevenue.toLocaleString('tr-TR')} ₺
          </span>
        </div>

        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Net Kar Büyümesi (MoM)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: profitGrowth >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>
              {profitGrowth >= 0 ? '+' : ''}%{profitGrowth}
            </h2>
            {profitGrowth >= 0 ? <ArrowUpRight size={24} color="#10b981" /> : <ArrowDownRight size={24} color="#ef4444" />}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Önceki aya göre ({prevPeriodStr}): {prevProfit.toLocaleString('tr-TR')} ₺ → {currentProfit.toLocaleString('tr-TR')} ₺
          </span>
        </div>

        <div className="glass-card">
          <span className="form-label" style={{ margin: 0 }}>Verimlilik Oranı (Gider / Ciro)</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: currentRevenue > 0 && (currentExpense / currentRevenue) <= 0.6 ? '#10b981' : '#f59e0b', marginTop: '6px' }}>
            %{currentRevenue > 0 ? Math.round((currentExpense / currentRevenue) * 100) : 0}
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
            Cironun % kaçının giderlere harcandığını gösterir.
          </span>
        </div>
      </div>

      {/* Quarterly Performance Table */}
      <div className="glass-card" style={{ padding: 0, marginBottom: '2rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} className="text-accent" />
            {activeYear} Yılı Çeyreklik (Q1-Q4) Performans Özeti
          </h3>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Dönem / Çeyrek</th>
                <th>Toplam Ciro (Tahsilat)</th>
                <th>Toplam Gider</th>
                <th>Net Kar (₺)</th>
                <th>Kar Marjı (%)</th>
                <th>Performans</th>
              </tr>
            </thead>
            <tbody>
              {quarters.map(q => (
                <tr key={q.name}>
                  <td style={{ fontWeight: 700, color: '#fff' }}>{q.name}</td>
                  <td style={{ fontWeight: 700, color: '#38bdf8' }}>{q.revenue.toLocaleString('tr-TR')} ₺</td>
                  <td style={{ color: 'var(--color-danger)' }}>-{q.expense.toLocaleString('tr-TR')} ₺</td>
                  <td style={{ fontWeight: 800, color: q.profit >= 0 ? '#10b981' : '#ef4444' }}>
                    {q.profit >= 0 ? '+' : ''}{q.profit.toLocaleString('tr-TR')} ₺
                  </td>
                  <td style={{ fontWeight: 800, color: q.margin >= 50 ? '#10b981' : q.margin >= 25 ? '#f59e0b' : 'var(--text-muted)' }}>
                    %{q.margin}
                  </td>
                  <td>
                    {q.revenue === 0 ? (
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>İşlemsiz</span>
                    ) : q.margin >= 50 ? (
                      <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700 }}>🟢 Yüksek Performans</span>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 700 }}>🟡 Standart</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
