import React, { useState } from 'react';
import { ShieldCheck, User, Phone, Mail, Globe, Link as LinkIcon, MapPin, Info, Rocket, Zap, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function UGCApplication() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    instagram: '',
    portfolio: '',
    city: '',
    about: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('ugc_applications')
        .insert([{
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          instagram_url: formData.instagram,
          portfolio_url: formData.portfolio,
          city: formData.city,
          about: formData.about
        }]);
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      alert('Başvuru sırasında bir hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="container" style={{ paddingTop: '320px', textAlign: 'center', minHeight: '80vh' }}>
      <div className="glass" style={{ padding: '60px', borderRadius: '32px', maxWidth: '600px', margin: '0 auto' }}>
        <ShieldCheck size={64} color="#00e676" style={{ marginBottom: '20px' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>Başvurunuz Alındı!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Ekibimiz başvurunuzu inceleyip en kısa sürede sizinle iletişime geçecek. Heyecanla bekliyoruz!</p>
        <button className="btn btn-primary" style={{ marginTop: '30px' }} onClick={() => window.location.href = '/'}>Ana Sayfaya Dön</button>
      </div>
    </div>
  );

  return (
    <section className="section-padding" style={{ paddingTop: '320px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 className="section-title">UGC & Influencer <span className="gradient-text">Başvuru Formu</span></h1>
          <p className="section-subtitle">SocialArt ekosistemine katılın, markalarla yaratıcı projelerde buluşalım.</p>
        </div>

        <div className="glass" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', borderRadius: '32px' }}>
          <form onSubmit={handleSubmit} className="application-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="input-group">
                <label><User size={16} /> Ad Soyad</label>
                <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Adınız Soyadınız" />
              </div>
              <div className="input-group">
                <label><Phone size={16} /> Telefon</label>
                <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="05XX XXX XX XX" />
              </div>
            </div>
            <div className="input-group">
              <label><Mail size={16} /> E-posta</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="ornek@email.com" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="input-group">
                <label><Globe size={16} /> Instagram Kullanıcı Adı</label>
                <input type="text" required value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="@kullaniciadi" />
              </div>
              <div className="input-group">
                <label><MapPin size={16} /> Yaşadığınız Şehir</label>
                <input type="text" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Örn: İstanbul" />
              </div>
            </div>
            <div className="input-group">
              <label><LinkIcon size={16} /> Portfolio / Örnek İçerik Linki</label>
              <input type="url" value={formData.portfolio} onChange={e => setFormData({...formData, portfolio: e.target.value})} placeholder="Google Drive, Portfolio vb. link" />
            </div>
            <div className="input-group">
              <label><Info size={16} /> Kendinizden Bahsedin</label>
              <textarea 
                value={formData.about} 
                onChange={e => setFormData({...formData, about: e.target.value})} 
                placeholder="Hangi nişlerde içerik üretiyorsunuz? Daha önce çalıştığınız markalar, ekipmanlarınız ve yaratıcı sürecinizden bahsedin..."
              ></textarea>
            </div>
            <button type="submit" className="cta-button" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
              {loading ? 'Gönderiliyor...' : 'Başvurumu Gönder'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export function JobApplication() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    position: '',
    portfolio: '',
    about: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert([{
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          position: formData.position,
          portfolio_url: formData.portfolio,
          about: formData.about
        }]);
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      alert('Başvuru sırasında bir hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="container" style={{ paddingTop: '320px', textAlign: 'center', minHeight: '80vh' }}>
      <div className="glass" style={{ padding: '60px', borderRadius: '32px', maxWidth: '600px', margin: '0 auto' }}>
        <ShieldCheck size={64} color="var(--primary)" style={{ marginBottom: '20px' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>Başvurunuz Alındı!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Kariyer başvurunuz ekibimize ulaştı. Özgeçmişinizi inceleyip uygun pozisyonlar için sizinle iletişime geçeceğiz.</p>
        <button className="btn btn-primary" style={{ marginTop: '30px' }} onClick={() => window.location.href = '/'}>Ana Sayfaya Dön</button>
      </div>
    </div>
  );

  return (
    <section className="section-padding" style={{ paddingTop: '320px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 className="section-title">Ekibimize <span className="gradient-text">Katılın</span></h1>
          <p className="section-subtitle">Yaratıcı vizyonumuzun bir parçası olmak için başvurunuzu yapın.</p>
        </div>

        <div className="glass" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', borderRadius: '32px' }}>
          <form onSubmit={handleSubmit} className="application-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="input-group">
                <label><User size={16} /> Ad Soyad</label>
                <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Adınız Soyadınız" />
              </div>
              <div className="input-group">
                <label><Phone size={16} /> Telefon</label>
                <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="05XX XXX XX XX" />
              </div>
            </div>
            <div className="input-group">
              <label><Mail size={16} /> E-posta</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="ornek@email.com" />
            </div>
            <div className="input-group">
              <label><Camera size={16} /> Başvurulan Pozisyon</label>
              <select required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>
                <option value="">Seçiniz...</option>
                <option value="Video Editor">Video Editor</option>
                <option value="Görüntü Yönetmeni">Görüntü Yönetmeni</option>
                <option value="Sosyal Medya Yöneticisi">Sosyal Medya Yöneticisi</option>
                <option value="Grafik Tasarımcı">Grafik Tasarımcı</option>
                <option value="Müşteri Temsilcisi">Müşteri Temsilcisi</option>
                <option value="Stajyer">Stajyer</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
            <div className="input-group">
              <label><LinkIcon size={16} /> Özgeçmiş / Portfolio Linki</label>
              <input type="url" required value={formData.portfolio} onChange={e => setFormData({...formData, portfolio: e.target.value})} placeholder="LinkedIn, Behance veya Drive linki" />
            </div>
            <div className="input-group">
              <label><Info size={16} /> Neden Sizinle Çalışmalıyız?</label>
              <textarea 
                value={formData.about} 
                onChange={e => setFormData({...formData, about: e.target.value})} 
                placeholder="Bu pozisyon için sizi neden seçmeliyiz? Deneyimleriniz, yetenekleriniz ve markamıza katabileceğiniz değerlerden bahsedin..."
              ></textarea>
            </div>
            <button type="submit" className="cta-button" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
              {loading ? 'Gönderiliyor...' : 'İş Başvurusunu Tamamla'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
