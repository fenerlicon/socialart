import React, { useState } from 'react';
import { Search, Users, Award, DollarSign, Edit, CheckCircle, Percent, ArrowDownCircle, ArrowUpCircle, Plus, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';

export default function PersonelView({ 
  staff, 
  staffPayments, 
  clients,
  clientPayments,
  period, 
  onRecordStaffPayment, 
  onResetStaffPayment,
  onAddBonus, // handles prim updates
  onUpdateBaseSalary,
  onAddStaff,
  onDeleteStaff,
  isLoading 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add Staff Form State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [newStaffClass, setNewStaffClass] = useState('Çalışan');
  const [newStaffSalary, setNewStaffSalary] = useState('0');
  
  // Modals State
  const [selectedStaffForPayment, setSelectedStaffForPayment] = useState(null);
  const [selectedStaffForSalaryUpdate, setSelectedStaffForSalaryUpdate] = useState(null);
  const [selectedStaffForAdjustments, setSelectedStaffForAdjustments] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [staffPaymentToReset, setStaffPaymentToReset] = useState(null);

  // Forms State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAccount, setPaymentAccount] = useState('Banka'); // Banka, Kasa
  const [newBaseSalary, setNewBaseSalary] = useState('');
  
  // Adjustments Form State (Avans, Kesinti, Manual Prim)
  const [advanceAmount, setAdvanceAmount] = useState('0');
  const [deductionAmount, setDeductionAmount] = useState('0');
  const [manualBonusAmount, setManualBonusAmount] = useState('0');
  const [bonusReason, setBonusReason] = useState('');

  // Process staff list with monthly payments — prim is fully manual (no auto commission)
  const processedStaff = staff.map(member => {
    // Find payment record for this staff for this period
    const memberName = (member.full_name || member.display_name || member.name || '').toLowerCase();
    const payment = staffPayments.find(p => String(p.staff_id) === String(member.id) || (p.staff_name && p.staff_name.toLowerCase().includes(memberName))) || {
      base_salary: parseFloat(member.base_salary || 0),
      advance_amount: 0,
      commission_amount: 0,
      bonus_amount: 0,
      bonus_reason: '',
      deduction_amount: 0,
      amount_paid: 0,
      status: 'unpaid'
    };

    const baseSalary = parseFloat(payment.base_salary) || parseFloat(member.base_salary || 0);
    const advance = parseFloat(payment.advance_amount || 0);
    const manualBonus = parseFloat(payment.bonus_amount || 0);
    const deduction = parseFloat(payment.deduction_amount || 0);
    
    // Total Prim = Manuel girilen prim
    const totalPrim = manualBonus;
    
    // Net Pay = Maaş - Avans + Prim - Kesinti
    const netDeserved = baseSalary - advance + totalPrim - deduction;
    
    const amountPaid = parseFloat(payment.amount_paid || 0);
    const remaining = Math.max(0, netDeserved - amountPaid);

    return {
      ...member,
      baseSalary,
      advance,
      manualBonus,
      bonusReason: payment.bonus_reason || '',
      totalPrim,
      deduction,
      netDeserved,
      amountPaid,
      remaining,
      status: payment.status || 'unpaid',
      paymentRecordId: payment.id || null
    };
  });

  // Filter staff by search term
  const filteredStaff = processedStaff.filter(member => 
    (member.display_name || member.full_name || member.name || 'Personel').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.role && member.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.class && member.class.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Open Payment Modal
  const openPaymentModal = (member) => {
    setSelectedStaffForPayment(member);
    setPaymentAmount(member.remaining.toString());
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentAccount('Banka');
  };

  // Open Adjustments Modal (Avans, Kesinti, Prim)
  const openAdjustmentsModal = (member) => {
    setSelectedStaffForAdjustments(member);
    setAdvanceAmount(member.advance.toString());
    setDeductionAmount(member.deduction.toString());
    setManualBonusAmount(member.manualBonus.toString());
    setBonusReason(member.bonusReason || '');
  };

  // Open Salary Update Modal
  const openSalaryUpdateModal = (member) => {
    setSelectedStaffForSalaryUpdate(member);
    setNewBaseSalary(member.baseSalary.toString());
  };

  // Handle Payment Submit
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedStaffForPayment || !paymentAmount || parseFloat(paymentAmount) <= 0) return;

    onRecordStaffPayment({
      staff_id: selectedStaffForPayment.id,
      base_salary: selectedStaffForPayment.baseSalary,
      advance_amount: selectedStaffForPayment.advance,
      commission_amount: 0,
      bonus_amount: selectedStaffForPayment.manualBonus,
      bonus_reason: selectedStaffForPayment.bonusReason,
      deduction_amount: selectedStaffForPayment.deduction,
      amount_paid: parseFloat(paymentAmount) + selectedStaffForPayment.amountPaid, // add to previously paid
      payment_date: paymentDate,
      payment_account: paymentAccount,
      period
    });

    setSelectedStaffForPayment(null);
  };

  // Handle Adjustments Submit
  const handleAdjustmentsSubmit = (e) => {
    e.preventDefault();
    if (!selectedStaffForAdjustments) return;

    onAddBonus({
      staff_id: selectedStaffForAdjustments.id,
      base_salary: selectedStaffForAdjustments.baseSalary,
      advance_amount: parseFloat(advanceAmount || 0),
      commission_amount: 0,
      bonus_amount: parseFloat(manualBonusAmount || 0),
      bonus_reason: bonusReason,
      deduction_amount: parseFloat(deductionAmount || 0),
      amount_paid: selectedStaffForAdjustments.amountPaid,
      period
    });

    setSelectedStaffForAdjustments(null);
  };

  // Handle Salary Update Submit
  const handleSalaryUpdateSubmit = (e) => {
    e.preventDefault();
    if (!selectedStaffForSalaryUpdate || !newBaseSalary || parseFloat(newBaseSalary) < 0) return;

    onUpdateBaseSalary({
      id: selectedStaffForSalaryUpdate.id,
      base_salary: parseFloat(newBaseSalary)
    });

    setSelectedStaffForSalaryUpdate(null);
  };
  // Open Add Staff Modal
  const openAddStaffModal = () => {
    setNewStaffName('');
    setNewStaffRole('');
    setNewStaffClass('Çalışan');
    setNewStaffSalary('0');
    setShowAddStaffModal(true);
  };

  // Handle Add Staff Submit
  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!newStaffName) return;

    onAddStaff({
      display_name: newStaffName,
      username: newStaffName.toLowerCase().replace(/\s+/g, ''),
      role: newStaffRole || 'Çalışan',
      class: newStaffClass,
      base_salary: parseFloat(newStaffSalary || 0),
      can_assign_task: false,
      can_add_client: true
    });

    setShowAddStaffModal(false);
  };

  return (
    <div className="employees-view">
      {/* Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Çalışan veya rol ara..." 
            className="form-input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button type="button" className="btn btn-primary" onClick={openAddStaffModal} style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', height: '38px', fontSize: '0.85rem' }}>
          <Plus size={15} />
          <span>Yeni Personel Ekle</span>
        </button>
      </div>

      {/* Staff Grid */}
      {isLoading ? (
        <div className="glass-card">
          <div className="loader-container">
            <div className="spinner"></div>
            <span>Çalışan verileri yükleniyor...</span>
          </div>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <Users size={48} style={{ color: 'var(--text-muted)' }} />
            <h4 className="empty-state-title">Çalışan Bulunamadı</h4>
            <p>Aradığınız isimde bir çalışan bulunmamaktadır.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredStaff.map(member => (
            <div key={member.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Employee Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
                      {member.display_name}
                    </h3>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                      {member.role || 'Çalışan'}
                    </span>
                    <span className="badge" style={{ 
                      background: member.class === 'Yönetici' ? 'rgba(239, 68, 68, 0.12)' : 
                                  member.class === 'Freelance' ? 'rgba(59, 130, 246, 0.12)' : 
                                  member.class === 'Görevli' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.05)', 
                      color: member.class === 'Yönetici' ? '#ef4444' : 
                             member.class === 'Freelance' ? '#60a5fa' : 
                             member.class === 'Görevli' ? '#10b981' : 'var(--text-secondary)',
                      border: member.class === 'Yönetici' ? '1px solid rgba(239, 68, 68, 0.2)' : 
                              member.class === 'Freelance' ? '1px solid rgba(59, 130, 246, 0.2)' : 
                              member.class === 'Görevli' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.05)'
                    }}>
                      {member.class || 'Çalışan'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Kullanıcı: @{member.username || member.display_name?.toLowerCase().replace(/\s+/g, '') || 'personel'} | Sabit Maaş / Taban: {(parseFloat(member.base_salary) || 0).toLocaleString('tr-TR')} ₺
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => openSalaryUpdateModal(member)}
                  >
                    <Edit size={13} />
                    <span>Maaş Ayarla</span>
                  </button>

                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => openAdjustmentsModal(member)}
                    style={{ border: '1px solid rgba(168, 85, 247, 0.2)', color: '#d8b4fe' }}
                  >
                    <Award size={13} />
                    <span>Hakediş/Avans/Kesinti</span>
                  </button>

                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => openPaymentModal(member)}
                    disabled={member.remaining === 0}
                    style={{ opacity: member.remaining === 0 ? 0.5 : 1 }}
                  >
                    <DollarSign size={13} />
                    <span>Ödeme Yap</span>
                  </button>

                  {member.amountPaid > 0 && onResetStaffPayment && (
                    <button 
                      className="btn btn-secondary btn-sm"
                      title="Ödemeyi sıfırla ve geri al"
                      onClick={() => setStaffPaymentToReset(member)}
                      style={{ color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.25)' }}
                    >
                      <RotateCcw size={13} />
                      <span>Geri Al</span>
                    </button>
                  )}

                  {onDeleteStaff && (
                    <button 
                      className="btn btn-secondary btn-icon btn-sm"
                      title="Personeli Sil"
                      onClick={() => setStaffToDelete(member)}
                      style={{ color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.25)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Financial Dashboard details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Maaş / Taban</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '4px' }}>{member.baseSalary.toLocaleString('tr-TR')} ₺</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Avans <ArrowDownCircle size={12} className="text-warning" />
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '4px', color: member.advance > 0 ? 'var(--color-warning)' : 'inherit' }}>
                    {member.advance > 0 ? `${member.advance.toLocaleString('tr-TR')} ₺` : '-'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Prim <ArrowUpCircle size={12} className="text-success" />
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '4px', color: member.totalPrim > 0 ? 'var(--color-success)' : 'inherit' }}>
                    {member.totalPrim > 0 ? `${member.totalPrim.toLocaleString('tr-TR')} ₺` : '-'}
                  </div>
                  {member.bonusReason && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {member.bonusReason}
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Kesinti <ArrowDownCircle size={12} className="text-danger" />
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '4px', color: member.deduction > 0 ? 'var(--color-danger)' : 'inherit' }}>
                    {member.deduction > 0 ? `${member.deduction.toLocaleString('tr-TR')} ₺` : '-'}
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Ödenecek</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>
                    {member.netDeserved.toLocaleString('tr-TR')} ₺
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ödenen / Kalan</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '4px' }}>
                    Ö: <span className="text-success">{member.amountPaid.toLocaleString('tr-TR')} ₺</span> <br />
                    K: <span className={member.remaining > 0 ? "text-danger" : "text-secondary"}>{member.remaining.toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {member.status === 'paid' && <span className="badge badge-paid" style={{ width: '100%', justifyContent: 'center' }}>Ödendi</span>}
                  {member.status === 'partial' && <span className="badge badge-partial" style={{ width: '100%', justifyContent: 'center' }}>Kısmi Ödendi</span>}
                  {member.status === 'unpaid' && <span className="badge badge-unpaid" style={{ width: '100%', justifyContent: 'center' }}>Ödenmedi</span>}
                </div>
              </div>

              {/* Progress visualizer */}
              {member.netDeserved > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    <span>Ödeme İlerlemesi</span>
                    <span>%{Math.round((member.amountPaid / member.netDeserved) * 100)}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', height: '6px', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                    <div style={{ 
                      background: 'var(--gradient-cyan)', 
                      width: `${(member.amountPaid / member.netDeserved) * 100}%`, 
                      height: '100%',
                      transition: 'width 0.4s ease'
                    }}></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: RECORD STAFF SALARY PAYMENT */}
      {selectedStaffForPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Personel Ödemesi</h2>
              <button className="modal-close" onClick={() => setSelectedStaffForPayment(null)}>×</button>
            </div>
            
            <form onSubmit={handlePaymentSubmit}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ÇALIŞAN / FREELANCER</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0' }}>{selectedStaffForPayment.display_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Net Hak Ediş: {selectedStaffForPayment.netDeserved.toLocaleString('tr-TR')} ₺ | 
                  Ödenen: {selectedStaffForPayment.amountPaid.toLocaleString('tr-TR')} ₺
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ödenecek Tutar (₺)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  required
                  placeholder="Yatırılacak tutarı girin..."
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
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedStaffForPayment(null)}>İptal</button>
                <button type="submit" className="btn btn-primary">Ödemeyi Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADJUSTMENTS (AVANS, PRIM, KESINTI) */}
      {selectedStaffForAdjustments && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Hak Ediş / Avans / Prim Düzenle</h2>
              <button className="modal-close" onClick={() => setSelectedStaffForAdjustments(null)}>×</button>
            </div>
            
            <form onSubmit={handleAdjustmentsSubmit}>
              <div className="form-group">
                <label className="form-label">Verilen Avans (₺)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Manuel Prim / Ek Ödeme (₺)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  value={manualBonusAmount}
                  onChange={(e) => setManualBonusAmount(e.target.value)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prim Açıklaması / Sebebi</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Örn: Proje performans primi"
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kesinti (₺)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  value={deductionAmount}
                  onChange={(e) => setDeductionAmount(e.target.value)}
                  min="0"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedStaffForAdjustments(null)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: UPDATE BASE SALARY */}
      {selectedStaffForSalaryUpdate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Maaş / Taban Ücret Ayarla</h2>
              <button className="modal-close" onClick={() => setSelectedStaffForSalaryUpdate(null)}>×</button>
            </div>
            
            <form onSubmit={handleSalaryUpdateSubmit}>
              <div className="form-group">
                <label className="form-label">Sabit Maaş veya Taban Ücret (₺)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  required
                  value={newBaseSalary}
                  onChange={(e) => setNewBaseSalary(e.target.value)}
                  min="0"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedStaffForSalaryUpdate(null)}>İptal</button>
                <button type="submit" className="btn btn-primary">Güncelle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD NEW STAFF */}
      {showAddStaffModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Yeni Personel / Freelancer Ekle</h2>
              <button className="modal-close" onClick={() => setShowAddStaffModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddStaffSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Adı Soyadı</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Görev / Rol</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  placeholder="Örn: Grafiker, Editör, Videographer..."
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Çalışma Tipi</label>
                  <select 
                    className="select-custom"
                    value={newStaffClass}
                    onChange={(e) => setNewStaffClass(e.target.value)}
                  >
                    <option value="Çalışan">Kadrolu (Çalışan)</option>
                    <option value="Freelance">Freelancer / Proje Bazlı</option>
                    <option value="Görevli">Görevli</option>
                    <option value="Yönetici">Yönetici</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Sabit Maaş / Taban (₺)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input" 
                    required
                    value={newStaffSalary}
                    onChange={(e) => setNewStaffSalary(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddStaffModal(false)}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE STAFF CONFIRMATION MODAL */}
      {staffToDelete && (
        <div className="modal-overlay" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', margin: 0 }}>
                <AlertTriangle size={20} />
                Personel Kaydını Sil
              </h2>
              <button className="modal-close" onClick={() => setStaffToDelete(null)}>×</button>
            </div>

            <div style={{ padding: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  Silinecek Personel Detayı
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {staffToDelete.display_name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {staffToDelete.role || 'Görevi Yok'} · {staffToDelete.class || 'Çalışan'} · {(parseFloat(staffToDelete.base_salary) || 0).toLocaleString('tr-TR')} ₺/ay
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                <strong>{staffToDelete.display_name}</strong> isimli personeli sistemden silmek istediğinize emin misiniz?<br />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>
                  ⚠️ Bu işlem geri alınamaz. Geçmiş bordro kayıtları korunacaktır.
                </span>
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setStaffToDelete(null)}
                style={{ minWidth: '110px' }}
              >
                Vazgeç
              </button>
              <button 
                type="button" 
                className="btn btn-sm" 
                onClick={() => {
                  onDeleteStaff(staffToDelete.id);
                  setStaffToDelete(null);
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

      {/* RESET STAFF PAYMENT CONFIRMATION MODAL */}
      {staffPaymentToReset && (
        <div className="modal-overlay" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', margin: 0 }}>
                <AlertTriangle size={20} />
                Ödemeyi Sıfırla ve Geri Al
              </h2>
              <button className="modal-close" onClick={() => setStaffPaymentToReset(null)}>×</button>
            </div>

            <div style={{ padding: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  Personel
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {staffPaymentToReset.display_name}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f87171', marginTop: '6px' }}>
                  Sıfırlanacak Ödeme: {(staffPaymentToReset.amountPaid || 0).toLocaleString('tr-TR')} ₺
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                <strong>{staffPaymentToReset.display_name}</strong> için yapılan tüm ödemeler sıfırlanacak ve kasa/banka hareketleri iptal edilecektir.<br />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>
                  ⚠️ Bu işlem geri alınamaz.
                </span>
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setStaffPaymentToReset(null)}
                style={{ minWidth: '110px' }}
              >
                Vazgeç
              </button>
              <button 
                type="button" 
                className="btn btn-sm" 
                onClick={() => {
                  onResetStaffPayment(staffPaymentToReset.id);
                  setStaffPaymentToReset(null);
                }}
                style={{ 
                  minWidth: '140px', 
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
                <RotateCcw size={15} />
                Evet, Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
