import React from 'react';
import { RotateCcw, ShieldCheck, FileText, Download, Mail, Phone, Clock, CreditCard } from 'lucide-react';

function CancellationPolicy() {
  return (
    <section className="section-padding" style={{ paddingTop: '200px', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="container">
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 className="section-title" style={{ fontSize: '2.5rem', fontWeight: '800' }}>
            İptal ve <span className="gradient-text">İade Koşulları</span>
          </h1>
          <p className="section-subtitle" style={{ maxWidth: '750px', margin: '0 auto', color: 'var(--text-muted)' }}>
            SocialArt Medya hizmet alımlarına ilişkin cayma hakkı, iptal talepleri, iade koşulları ve geri ödeme prosedürleri hakkında bilgilendirme.
          </p>

          {/* PDF Download Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
            <a 
              href="/iptal-ve-iade-kosullari.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn"
              style={{
                background: 'rgba(0, 229, 255, 0.1)',
                border: '1px solid var(--primary, #00e5ff)',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              <Download size={18} color="var(--primary)" /> İptal ve İade Koşulları (PDF)
            </a>

            <a 
              href="/gizlilik-politikasi.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              <FileText size={18} /> Gizlilik Politikası & KVKK (PDF)
            </a>
          </div>
        </div>

        {/* Content Card */}
        <div className="glass" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px', borderRadius: '32px', border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Giriş */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
              <p style={{ color: '#ccc', lineHeight: '1.8', fontSize: '1rem' }}>
                İşbu İptal ve İade Koşulları, <strong>SocialArt Medya</strong> ("Ajans") tarafından sunulan dijital pazarlama, sosyal medya yönetimi, kreatif prodüksiyon, SEO ve CRM danışmanlığı hizmetlerinin online ödeme kanalları (iyzico vb.) aracılığıyla satın alınması süreçlerini kapsar. 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri geçerlidir.
              </p>
            </div>

            {/* 1. Hizmet Niteliği ve İptal Hakkı */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(0, 229, 255, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                <RotateCcw size={24} />
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>1. Hizmet İptal Şartları</h3>
                <p style={{ color: '#aaa', lineHeight: '1.7', fontSize: '0.95rem' }}>
                  Satın alınan hizmet paketlerinde, Ajansımız tarafından işe/hizmet ifasına başlanmamış olması kaydıyla ödemeyi takip eden <strong>14 (on dört) gün</strong> içerisinde sebep göstermeksizin iptal talebinde bulunabilirsiniz. İptal talebiniz onaylandığında ödediğiniz tutarın tamamı iade edilir.
                </p>
              </div>
            </div>

            {/* 2. Cayma Hakkının İstisnaları */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255, 0, 85, 0.1)', color: 'var(--secondary)', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>2. Cayma Hakkı İstisnaları</h3>
                <p style={{ color: '#aaa', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '10px' }}>
                  Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesi gereğince aşağıdaki hallerde cayma ve iade hakkı kullanılamaz:
                </p>
                <ul style={{ color: '#aaa', lineHeight: '1.7', fontSize: '0.95rem', paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li>Tüketicinin istekleri veya kişisel/kurumsal ihtiyaçları doğrultusunda özel olarak hazırlanan grafik tasarım, video prodüksiyon ve çekim hizmetleri,</li>
                  <li>Onayınız alınarak anında ifa edilmeye başlanan dijital reklam kurgusu, sosyal medya paylaşım süreçleri ve strateji danışmanlıkları.</li>
                </ul>
              </div>
            </div>

            {/* 3. İade ve Geri Ödeme Prosedürü */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                <CreditCard size={24} />
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>3. Geri Ödeme Süreci</h3>
                <p style={{ color: '#aaa', lineHeight: '1.7', fontSize: '0.95rem' }}>
                  Onaylanan iade taleplerine ait ödemeler, ödeme yapıldığı kart veya banka hesabına <strong>iyzico güvenli ödeme altyapısı</strong> üzerinden <strong>7-14 iş günü</strong> içerisinde aktarılır. Taksitli ödemelerde bankanızın iade prosedürleri gereği iade tutarları kart ekstrenize taksitli olarak yansıtılabilir.
                </p>
              </div>
            </div>

            {/* 4. İletişim ve Başvuru */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(138, 43, 226, 0.1)', color: '#8a2be2', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                <Clock size={24} />
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>4. İptal Başvurusu Nasıl Yapılır?</h3>
                <p style={{ color: '#aaa', lineHeight: '1.7', fontSize: '0.95rem' }}>
                  İptal veya iade taleplerinizi sipariş numaranız ve fatura bilgileriniz ile birlikte <a href="mailto:hello@socialartajans.com" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>hello@socialartajans.com</a> e-posta adresimize yazılı olarak iletebilirsiniz. Ekibimiz 24 saat içinde talebinizi inceleyip bilgi verecektir.
                </p>
              </div>
            </div>

            {/* Footer Notice */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.88rem' }}>
                <Mail size={16} color="var(--primary)" /> hello@socialartajans.com
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.88rem' }}>
                <Phone size={16} color="var(--primary)" /> +90 539 860 2130
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default CancellationPolicy;
