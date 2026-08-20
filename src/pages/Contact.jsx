import React from 'react';
import { Phone, Mail, MessageSquare, MapPin } from 'lucide-react';
import AnalysisForm from '../components/AnalysisForm';

function Contact() {
  React.useEffect(() => {
    // Smooth scroll to form container if requested or hashed
    const formElement = document.getElementById('analiz-formu');
    if (formElement && (window.location.hash || window.location.pathname === '/iletisim')) {
      setTimeout(() => {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, []);

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
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
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
            height: 380px;
            position: relative;
          }

          .dark-map-iframe {
            filter: invert(90%) hue-rotate(180deg) grayscale(40%) contrast(90%);
            border: 0;
            width: 100%;
            height: 100%;
            display: block;
          }
        `}
      </style>

      <section className="contact-page-section">
        <div className="container">
          {/* Header Title */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="section-title" style={{ marginBottom: '1.5rem' }}>Bize <span className="gradient-text">Ulaşın</span></h1>
            <p className="section-subtitle" style={{ maxWidth: '700px', margin: '0 auto' }}>
              Büyüme odaklı dijital reklam ve sinematik prodüksiyon çözümlerimizle markanızı geleceğe taşıyalım. Bizimle iletişime geçin veya takvimden toplantınızı planlayın.
            </p>
          </div>

          <div className="contact-grid">
            {/* Left Column: Contact Cards & Map */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Quick Communication Grid */}
              <div className="contact-cards-container">
                <a href="https://wa.me/905398602130" target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                  <div className="glass contact-quick-card">
                    <div>
                      <div className="contact-icon-wrapper">
                        <MessageSquare size={24} />
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>WhatsApp Destek</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Anında canlı sohbet</p>
                    </div>
                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '700' }}>Tıkla ve Yaz</span>
                  </div>
                </a>

                <a href="mailto:hello@socialartajans.com" style={{ display: 'block' }}>
                  <div className="glass contact-quick-card">
                    <div>
                      <div className="contact-icon-wrapper" style={{ color: 'var(--secondary)', background: 'rgba(255, 0, 85, 0.1)' }}>
                        <Mail size={24} />
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>E-posta Gönder</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Teklif ve iş birlikleri için</p>
                    </div>
                    <span style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: '700' }}>hello@socialartajans.com</span>
                  </div>
                </a>

                <a href="tel:+905398602130" style={{ display: 'block' }}>
                  <div className="glass contact-quick-card">
                    <div>
                      <div className="contact-icon-wrapper" style={{ color: 'var(--accent)', background: 'rgba(0, 229, 255, 0.1)' }}>
                        <Phone size={24} />
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>Telefonla Ara</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Hızlı danışmanlık hattı</p>
                    </div>
                    <span style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: '700' }}>+90 539 860 2130</span>
                  </div>
                </a>

                <a href="https://maps.google.com/maps?q=Ekşioğlu+mahallesi,+kuran+kursu+caddesi+no:4,+Çekmeköy/İstanbul" target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                  <div className="glass contact-quick-card">
                    <div>
                      <div className="contact-icon-wrapper" style={{ color: '#fff', background: 'rgba(255, 255, 255, 0.1)' }}>
                        <MapPin size={24} />
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>Ofis Adresi</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Ekşioğlu Mah. Kuran Kursu Cad. No:4</p>
                    </div>
                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '700' }}>Çekmeköy / İstanbul</span>
                  </div>
                </a>
              </div>

              {/* Elegant Map Card */}
              <div className="contact-map-card">
                <iframe
                  title="SocialArt Ajans Ofis Konumu"
                  src="https://maps.google.com/maps?q=Ekşioğlu+mahallesi,+kuran+kursu+caddesi+no:4,+Çekmeköy/İstanbul&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="dark-map-iframe"
                ></iframe>
              </div>
            </div>

            {/* Right Column: Dynamic Appointment Booking Calendar Form */}
            <div id="analiz-formu" id="toplantı-formu">
              <AnalysisForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;
