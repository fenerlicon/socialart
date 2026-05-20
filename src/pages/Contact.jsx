import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, MapPin, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    subject: 'Genel Destek',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const dateStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
      
      const { error } = await supabase.from('leads').insert([{
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        date: dateStr,
        platform: formData.subject,
        service: 'İletişim Formu',
        rep: 'Sistem (İletişim Sayfası)',
        status: 'Beklemede',
        reaction: formData.message
      }]);

      if (error) throw error;
      
      setSuccess(true);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        subject: 'Genel Destek',
        message: ''
      });
    } catch (err) {
      setErrorMsg('Bir hata oluştu: ' + (err.message || err.toString()));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          .contact-page-section {
            padding-top: 180px;
            padding-bottom: 100px;
            position: relative;
            z-index: 10;
          }

          .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            margin-top: 60px;
          }

          @media (max-width: 992px) {
            .contact-grid {
              grid-template-columns: 1fr;
              gap: 40px;
            }
          }

          .contact-cards-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 40px;
          }

          @media (max-width: 576px) {
            .contact-cards-container {
              grid-template-columns: 1fr;
              gap: 15px;
            }
          }

          .contact-quick-card {
            padding: 25px;
            border-radius: 20px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
          }

          .contact-quick-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
            box-shadow: 0 10px 25px var(--primary-glow);
          }

          .contact-icon-wrapper {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            background: rgba(138, 43, 226, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
            margin-bottom: 20px;
            transition: all 0.3s ease;
          }

          .contact-quick-card:hover .contact-icon-wrapper {
            background: var(--primary);
            color: #fff;
            transform: scale(1.05);
          }

          .contact-map-card {
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.05);
            height: 350px;
            position: relative;
          }

          .dark-map-iframe {
            filter: invert(90%) hue-rotate(180deg) grayscale(40%) contrast(90%);
            border: 0;
            width: 100%;
            height: 100%;
            display: block;
          }

          .contact-form-glass {
            padding: 40px;
            border-radius: 28px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            background: rgba(18, 18, 18, 0.4);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }

          @media (max-width: 576px) {
            .contact-form-glass {
              padding: 25px;
            }
          }

          .success-toast {
            display: flex;
            align-items: center;
            gap: 15px;
            background: rgba(0, 230, 118, 0.1);
            border: 1px solid rgba(0, 230, 118, 0.3);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 25px;
            color: #00e676;
            animation: slideInDown 0.4s ease;
          }

          .error-toast {
            display: flex;
            align-items: center;
            gap: 15px;
            background: rgba(255, 0, 85, 0.1);
            border: 1px solid rgba(255, 0, 85, 0.3);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 25px;
            color: var(--secondary);
            animation: slideInDown 0.4s ease;
          }

          @keyframes slideInDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <section className="contact-page-section">
        <div className="container">
          {/* Header Title */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="section-title" style={{ marginBottom: '1.5rem' }}>Bize <span className="gradient-text">Ulaşın</span></h1>
            <p className="section-subtitle" style={{ maxWidth: '700px', margin: '0 auto' }}>
              Büyüme odaklı dijital reklam ve sinematik prodüksiyon çözümlerimizle markanızı geleceğe taşıyalım. Aşağıdaki formdan veya iletişim kanallarımızdan bize ulaşabilirsiniz.
            </p>
          </div>

          <div className="contact-grid">
            {/* Left Column: Contact Cards & Map */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Quick Communication Grid */}
              <div className="contact-cards-container">
                <a href="https://wa.me/905398602130" target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                  <div className="glass contact-quick-card">
                    <div className="contact-icon-wrapper">
                      <MessageSquare size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>WhatsApp Destek</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Anında canlı sohbet</p>
                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '700' }}>Tıkla ve Yaz</span>
                  </div>
                </a>

                <a href="mailto:hello@socialartajans.com" style={{ display: 'block' }}>
                  <div className="glass contact-quick-card">
                    <div className="contact-icon-wrapper" style={{ color: 'var(--secondary)', background: 'rgba(255, 0, 85, 0.1)' }}>
                      <Mail size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>E-posta Gönder</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Teklif ve iş birlikleri için</p>
                    <span style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: '700' }}>hello@socialartajans.com</span>
                  </div>
                </a>

                <a href="tel:+905398602130" style={{ display: 'block' }}>
                  <div className="glass contact-quick-card">
                    <div className="contact-icon-wrapper" style={{ color: 'var(--accent)', background: 'rgba(0, 229, 255, 0.1)' }}>
                      <Phone size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>Telefonla Ara</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Hızlı danışmanlık hattı</p>
                    <span style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: '700' }}>+90 539 860 2130</span>
                  </div>
                </a>

                <div className="glass contact-quick-card" style={{ cursor: 'default' }}>
                  <div className="contact-icon-wrapper" style={{ color: '#fff', background: 'rgba(255, 255, 255, 0.1)' }}>
                    <Clock size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>Çalışma Saatleri</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Pzt - Cmt: 09:00 - 19:00</p>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pazar: Kapalı</span>
                </div>
              </div>

              {/* Elegant Map Card */}
              <div className="contact-map-card">
                <iframe
                  title="SocialArt Ajans Ofis Konumu"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3007.243575990264!2d29.014299876541604!3d41.085449714652234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab61384e55e69%3A0xe9ccb640e4f20220!2sLevent%2C%20Be%C5%9Fikta%C5%9F%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="dark-map-iframe"
                ></iframe>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div>
              <div className="contact-form-glass">
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '25px' }}>Bize <span className="gradient-text">Mesaj Gönderin</span></h2>
                
                {success && (
                  <div className="success-toast">
                    <CheckCircle size={24} style={{ flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontWeight: '800', marginBottom: '3px' }}>Başarıyla Gönderildi!</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(0, 230, 118, 0.85)' }}>Mesajınız ekibimize ulaştı. En kısa sürede sizinle iletişime geçeceğiz.</p>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="error-toast">
                    <AlertCircle size={24} style={{ flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontWeight: '800', marginBottom: '3px' }}>Hata Oluştu!</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255, 0, 85, 0.85)' }}>{errorMsg}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="application-form">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="input-group">
                      <label>Ad Soyad</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Adınız Soyadınız"
                      />
                    </div>
                    <div className="input-group">
                      <label>Telefon</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="05XX XXX XX XX"
                      />
                    </div>
                  </div>

                  <div className="input-group" style={{ marginTop: '20px' }}>
                    <label>E-posta</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ornek@email.com"
                    />
                  </div>

                  <div className="input-group" style={{ marginTop: '20px' }}>
                    <label>Konu</label>
                    <select
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="Genel Destek">Genel Destek / Danışmanlık</option>
                      <option value="Reklam Çözümleri">Meta / Google Reklam Yönetimi</option>
                      <option value="Prodüksiyon">Sinematik Çekim ve Video Edit</option>
                      <option value="UGC / Influencer">UGC ve Influencer Pazarlaması</option>
                      <option value="Diğer">Diğer Konular</option>
                    </select>
                  </div>

                  <div className="input-group" style={{ marginTop: '20px' }}>
                    <label>Mesajınız</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Projeniz veya sorunuz hakkında bize detaylı bilgi verin..."
                      style={{ minHeight: '150px' }}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="cta-button"
                    style={{ width: '100%', marginTop: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    disabled={loading}
                  >
                    {loading ? 'Gönderiliyor...' : (
                      <>
                        Mesajı Gönder <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;
