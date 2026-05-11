import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AnalysisForm = ({ defaultService = "" }) => {
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
        platform: formData.url,
        service: formData.services.join(', '),
        rep: 'Sistem (Hizmet Sayfası)',
        status: 'Beklemede',
        reaction: `Hizmet sayfasından form dolduruldu. Randevu: ${selectedDateStr} ${selectedTimeStr}`
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

      setFormSuccess(true);
    } catch (err) {
      setFormError('Bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-box" style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', borderRadius: '32px' }}>
      {formSuccess ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(0,230,118,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <ShieldCheck size={48} color="#00e676" />
          </div>
          <h4 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>Harika! Talebiniz Alındı.</h4>
          <p style={{ color: '#aaa', lineHeight: '1.6' }}>Ekibimiz belirttiğiniz saatte ({selectedDateStr}) sizi arayacak veya e-posta yoluyla strateji raporunuzu iletecek.</p>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setFormSuccess(false)}>Yeni Form Doldur</button>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit}>
          {formError && (
            <div style={{ background: 'rgba(255,0,85,0.1)', color: 'var(--secondary)', padding: '12px', borderRadius: '10px', marginBottom: '20px', border: '1px solid rgba(255,0,85,0.2)' }}>
              {formError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="input-group">
              <label>Adınız Soyadınız</label>
              <input type="text" placeholder="Örn: Ahmet Yılmaz" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Telefon Numaranız</label>
              <input type="tel" placeholder="05XX XXX XX XX" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="input-group">
              <label>E-posta Adresiniz</label>
              <input type="email" placeholder="ornek@sirket.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Web Siteniz / Sosyal Medya</label>
              <input type="text" placeholder="instagram.com/markaniz" required value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
            </div>
          </div>

          <div className="input-group">
            <label style={{marginBottom: '10px', display: 'block'}}>İlgilendiğiniz Hizmetler</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {[
                "Video prodüksiyon", "Fotoğraf çekimi", "Sunuculu Reklam", "Sosyal Medya & Reklam", "Grafik Tasarım", "UGC & Influencer"
              ].map((srv, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={formData.services.includes(srv)} onChange={() => handleCheckboxChange(srv)} /> {srv}
                </label>
              ))}
            </div>
          </div>

          <div className="input-group" style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '20px' }}>
            <label style={{marginBottom: '15px', display: 'block', fontWeight: 'bold'}}>📅 Toplantı Tarihi ve Saati</label>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Mini Calendar */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                  <button type="button" onClick={handlePrevMonth}>&lt;</button>
                  <span>{monthNames[displayedMonth.getMonth()]}</span>
                  <button type="button" onClick={handleNextMonth}>&gt;</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', fontSize: '0.7rem', textAlign: 'center' }}>
                  {Array.from({length: startDayIndex}).map((_, i) => <div key={i}></div>)}
                  {Array.from({length: daysInMonth}).map((_, i) => {
                    const d = i + 1;
                    const keyStr = `${displayedMonth.getFullYear()}-${String(displayedMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const isSelected = selectedDateStr === keyStr;
                    return (
                      <div key={d} onClick={() => setSelectedDateStr(keyStr)} style={{ padding: '5px 0', cursor: 'pointer', background: isSelected ? 'var(--primary)' : 'transparent', borderRadius: '4px' }}>{d}</div>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', maxHeight: '150px', overflowY: 'auto' }}>
                {timeSlots.map(time => (
                  <div key={time} onClick={() => setSelectedTimeStr(time)} style={{ padding: '8px', fontSize: '0.8rem', textAlign: 'center', borderRadius: '6px', background: selectedTimeStr === time ? 'var(--secondary)' : 'rgba(255,255,255,0.05)', cursor: 'pointer' }}>{time.split(' ')[0]}</div>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '15px', marginTop: '30px' }}>
            {loading ? 'Gönderiliyor...' : 'Randevu Oluştur'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AnalysisForm;
