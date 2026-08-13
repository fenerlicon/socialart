import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AnalysisForm = ({ defaultService = "" }) => {
  const navigate = useNavigate();
  const today = new Date();
  const [displayedMonth, setDisplayedMonth] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateStr, setSelectedDateStr] = React.useState('');
  const [selectedTimeStr, setSelectedTimeStr] = React.useState('');
  const [blockedSlots, setBlockedSlots] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [formSuccess, setFormSuccess] = React.useState(false);
  const [formError, setFormError] = React.useState('');
  
  const [formData, setFormData] = React.useState({
    fullName: '',
    phone: '',
    email: '',
    url: '',
    services: defaultService ? [defaultService] : []
  });

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const timeSlots = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"];

  const daysInMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = displayedMonth.getDay();
  const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  React.useEffect(() => {
    fetchBlockedSlots();
  }, [displayedMonth]);

  const fetchBlockedSlots = async () => {
    const { data } = await supabase.from('blocked_slots').select('*');
    if (data) setBlockedSlots(data);
  };

  const handlePrevMonth = () => {
    if (displayedMonth.getFullYear() === today.getFullYear() && displayedMonth.getMonth() === today.getMonth()) return;
    setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = () => setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1));

  const handleCheckboxChange = (srv) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(srv) 
        ? prev.services.filter(s => s !== srv)
        : [...prev.services, srv]
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDateStr || !selectedTimeStr) {
      setFormError('Lütfen bir toplantı tarihi ve saati seçiniz.');
      return;
    }
    if (formData.services.length === 0) {
      setFormError('Lütfen ilgilendiğiniz hizmetlerden en az bir tanesini seçiniz.');
      return;
    }

    setLoading(true);
    setFormError('');

    try {
      const dateStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
      
      // 1. Leads
      const { error: leadError } = await supabase.from('leads').insert([{
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        date: dateStr,
        platform: 'Web Formu (Ücretsiz Analiz)',
        service: formData.services.join(', '),
        rep: 'Sistem (Hizmet Sayfası)',
        status: 'Beklemede',
        reaction: `Web sayfasından form dolduruldu. Web/IG: ${formData.url || '-'} | Randevu: ${selectedDateStr} ${selectedTimeStr}`
      }]);
      if (leadError) throw leadError;

      // 2. Appointments
      const { error: apptError } = await supabase.from('appointments').insert([{
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        url: formData.url,
        services: formData.services.join(', '),
        appointment_date: selectedDateStr,
        appointment_time: selectedTimeStr,
        status: 'Beklemede'
      }]);
      if (apptError) throw apptError;

      // 3. Send Email Notification (Optional - via API)
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'appointment',
            data: { ...formData, date: selectedDateStr, time: selectedTimeStr }
          })
        });
      } catch (err) {
        console.error('Email notification failed:', err);
      }

      navigate('/tesekkurler');
    } catch (err) {
      setFormError('Bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-box-wrapper" style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
      <div className="form-box" style={{ 
        background: 'rgba(15, 15, 15, 0.7)', 
        backdropFilter: 'blur(15px)', 
        border: '1px solid rgba(255,255,255,0.1)', 
        padding: '40px 30px', 
        borderRadius: '32px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto'
      }}>
        {formSuccess ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(0,230,118,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShieldCheck size={48} color="#00e676" />
            </div>
            <h4 style={{ fontSize: '1.8rem', marginBottom: '10px', fontWeight: '800' }}>Harika! Talebiniz Alındı.</h4>
            <p style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto' }}>Ekibimiz belirttiğiniz saatte ({selectedDateStr}) strateji toplantısı için sizinle iletişime geçecek.</p>
            <button className="btn btn-primary" style={{ marginTop: '30px' }} onClick={() => setFormSuccess(false)}>Yeni Form Doldur</button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="analysis-form-actual">
            {formError && (
              <div style={{ background: 'rgba(255,0,85,0.1)', color: 'var(--secondary)', padding: '15px', borderRadius: '12px', marginBottom: '25px', border: '1px solid rgba(255,0,85,0.2)', textAlign: 'center', fontWeight: 'bold' }}>
                {formError}
              </div>
            )}
            
            {/* INPUT GRID */}
            <div className="form-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '25px' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label>Adınız Soyadınız</label>
                <input type="text" placeholder="Örn: Ahmet Yılmaz" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label>Telefon Numaranız</label>
                <input 
                  type="tel" 
                  placeholder="05XX XXX XX XX" 
                  required 
                  value={formData.phone} 
                  onChange={e => {
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({...formData, phone: onlyNums});
                  }} 
                  style={{ width: '100%' }} 
                />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label>E-posta Adresiniz</label>
                <input 
                  type="email" 
                  placeholder="ornek@sirket.com" 
                  required 
                  value={formData.email} 
                  onChange={e => {
                    e.target.setCustomValidity('');
                    setFormData({...formData, email: e.target.value});
                  }}
                  onInvalid={e => e.target.setCustomValidity('Lütfen geçerli bir e-posta adresi giriniz (örn: isim@sirket.com)')}
                  style={{ width: '100%' }} 
                />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label>Web Siteniz / Sosyal Medya</label>
                <input type="text" placeholder="instagram.com/markaniz" required value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} style={{ width: '100%' }} />
              </div>
            </div>

            {/* SERVICES SECTION */}
            <div className="input-group" style={{ marginBottom: '30px' }}>
              <label style={{marginBottom: '15px', display: 'block', fontWeight: '800', color: '#fff', fontSize: '1.1rem'}}>İlgilendiğiniz Hizmetler</label>
              <div className="services-checkbox-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                gap: '12px', 
                background: 'rgba(255,255,255,0.03)', 
                padding: '20px', 
                borderRadius: '20px', 
                border: '1px solid rgba(255,255,255,0.08)' 
              }}>
                {[
                  "Video prodüksiyon", "Fotoğraf çekimi", "Sunuculu Reklam", "Sosyal Medya & Reklam", "Grafik Tasarım", "UGC & Influencer"
                ].map((srv, i) => (
                  <label key={i} className="checkbox-item" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    cursor: 'pointer', 
                    fontSize: '0.95rem',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    transition: 'background 0.2s',
                    background: formData.services.includes(srv) ? 'rgba(255,255,255,0.05)' : 'transparent'
                  }}>
                    <input 
                      type="checkbox" 
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      checked={formData.services.includes(srv)} 
                      onChange={() => handleCheckboxChange(srv)} 
                    /> 
                    <span style={{ color: formData.services.includes(srv) ? '#fff' : '#aaa' }}>{srv}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ 
              width: '100%', 
              padding: '18px', 
              marginTop: '10px', 
              marginBottom: '30px',
              fontSize: '1.2rem', 
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderRadius: '16px'
            }}>
              {loading ? 'Gönderiliyor...' : 'Toplantı Talebi Gönder'}
            </button>

            {/* APPOINTMENT PICKER */}
            <div className="appointment-picker-container" style={{ 
              background: 'rgba(0,0,0,0.4)', 
              padding: '25px', 
              borderRadius: '24px', 
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <label style={{marginBottom: '20px', display: 'block', fontWeight: '800', color: '#fff', fontSize: '1.1rem'}}>📅 Lütfen bir toplantı tarihi ve saati seçiniz</label>
              
              <div className="picker-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '30px' 
              }}>
                {/* Mini Calendar */}
                <div className="calendar-ui" style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button type="button" onClick={handlePrevMonth} className="cal-btn" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' }}>&lt;</button>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{monthNames[displayedMonth.getMonth()]} {displayedMonth.getFullYear()}</span>
                    <button type="button" onClick={handleNextMonth} className="cal-btn" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' }}>&gt;</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                    {['Pz', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pa'].map(d => <div key={d} style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'bold', marginBottom: '10px' }}>{d}</div>)}
                    {Array.from({length: startDayIndex}).map((_, i) => <div key={`empty-${i}`}></div>)}
                    {Array.from({length: daysInMonth}).map((_, i) => {
                      const d = i + 1;
                      const keyStr = `${displayedMonth.getFullYear()}-${String(displayedMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                      const isSelected = selectedDateStr === keyStr;
                      const isToday = today.getFullYear() === displayedMonth.getFullYear() && today.getMonth() === displayedMonth.getMonth() && today.getDate() === d;
                      
                      const dateObj = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), d);
                      const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                      const isPast = dateObj < todayZero;

                      return (
                        <div 
                          key={d} 
                          onClick={isPast ? undefined : () => {
                            setSelectedDateStr(keyStr);
                            setSelectedTimeStr('');
                          }} 
                          style={{ 
                            padding: '10px 0', 
                            cursor: isPast ? 'not-allowed' : 'pointer', 
                            fontSize: '0.95rem',
                            fontWeight: isSelected ? 'bold' : 'normal',
                            background: isSelected ? 'var(--primary)' : isToday ? 'rgba(255,255,255,0.1)' : 'transparent', 
                            color: isSelected ? '#fff' : isPast ? '#444' : '#eee',
                            borderRadius: '10px',
                            border: isToday && !isSelected ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                            transition: 'all 0.2s',
                            opacity: isPast ? 0.3 : 1
                          }}
                        >
                          {d}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="time-slots-ui">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                    {timeSlots.map(time => {
                      const isSelected = selectedTimeStr === time;
                      const slotStartHour = parseInt(time.split(':')[0], 10);
                      const currentHour = today.getHours();
                      const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                      const isSlotPast = selectedDateStr === todayDateStr && currentHour >= slotStartHour;

                      return (
                        <div 
                          key={time} 
                          onClick={isSlotPast ? undefined : () => setSelectedTimeStr(time)} 
                          style={{ 
                            padding: '12px 5px', 
                            fontSize: '0.85rem', 
                            textAlign: 'center', 
                            borderRadius: '12px', 
                            background: isSelected ? 'var(--secondary)' : 'rgba(255,255,255,0.04)', 
                            color: isSelected ? '#fff' : isSlotPast ? '#555' : '#ccc',
                            border: `1px solid ${isSelected ? 'var(--secondary)' : 'rgba(255,255,255,0.08)'}`,
                            cursor: isSlotPast ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            fontWeight: isSelected ? 'bold' : '500',
                            opacity: isSlotPast ? 0.25 : 1
                          }}
                        >
                          {time.split(' ')[0]}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AnalysisForm;
