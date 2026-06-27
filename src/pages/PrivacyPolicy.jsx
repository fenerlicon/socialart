import React from 'react';
import { ShieldCheck, Eye, Database, Cookie, Scale, Mail, Phone, Lock } from 'lucide-react';

function PrivacyPolicy() {
  return (
    <section className="section-padding" style={{ paddingTop: '200px', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 className="section-title" style={{ fontSize: '2.5rem', fontWeight: '800' }}>
            Gizlilik Politikası & <span className="gradient-text">KVKK Aydınlatma Metni</span>
          </h1>
          <p className="section-subtitle" style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--text-muted)' }}>
            Kişisel verilerinizin güvenliği ve gizliliği bizim için en üst düzeyde önem taşımaktadır. 
            Verilerinizin nasıl işlendiği ve korunduğu hakkında detaylı bilgileri aşağıda bulabilirsiniz.
          </p>
        </div>

        <div className="glass" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px', borderRadius: '32px', border: '1px solid var(--surface-border)' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Giriş */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
              <p style={{ color: '#ccc', lineHeight: '1.8', fontSize: '1rem' }}>
                <strong>SocialArt Medya</strong> olarak, web sitemizi ziyaret eden tüm kullanıcıların, potansiyel müşterilerin ve iş başvurusunda bulunan adayların kişisel verilerinin korunmasına büyük önem veriyoruz. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu sıfatıyla tarafımızca toplanan verilerinize yönelik politikamızı açıklamaktadır.
              </p>
            </div>

            {/* 1. Veri Sorumlusu */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(0, 229, 255, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>1. Veri Sorumlusu</h3>
                <p style={{ color: '#aaa', lineHeight: '1.7', fontSize: '0.95rem' }}>
                  KVKK uyarınca, kişisel verileriniz veri sorumlusu olarak <strong>SocialArt Medya</strong> tarafından bu metinde belirtilen amaçlar doğrultusunda işlenmektedir.
                </p>
              </div>
            </div>

            {/* 2. Hangi Kişisel Verileri Topluyoruz? */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255, 0, 85, 0.1)', color: 'var(--secondary)', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                <Eye size={24} />
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>2. Toplanan Kişisel Veriler</h3>
                <p style={{ color: '#aaa', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '10px' }}>
                  Web sitemizdeki iletişim, teklif ve başvuru formları üzerinden aşağıdaki verileri toplayabilmekteyiz:
                </p>
                <ul style={{ color: '#aaa', lineHeight: '1.7', fontSize: '0.95rem', paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li><strong>Kimlik Bilgileri:</strong> Adınız, soyadınız.</li>
                  <li><strong>İletişim Bilgileri:</strong> Telefon numaranız, e-posta adresiniz, yaşadığınız şehir.</li>
                  <li><strong>Başvuru Verileri:</strong> Başvurulan pozisyon, portfolyo/sosyal medya linkleri (Instagram, LinkedIn vb.), yüklediğiniz CV/Özgeçmiş dosyaları.</li>
                  <li><strong>Talep Detayları:</strong> Formlarda belirttiğiniz mesajlar ve süreç notları.</li>
                </ul>
              </div>
            </div>

            {/* 3. Verilerin İşlenme Amaçları */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(138, 43, 226, 0.1)', color: '#8a2be2', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                <Database size={24} />
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>3. Verilerin İşlenme Amaçları</h3>
                <p style={{ color: '#aaa', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '10px' }}>
                  Kişisel verileriniz aşağıdaki yasal ve meşru amaçlarla işlenmektedir:
                </p>
                <ul style={{ color: '#aaa', lineHeight: '1.7', fontSize: '0.95rem', paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li>Ajansımızdan talep ettiğiniz hizmet tekliflerinin hazırlanması ve size ulaştırılması,</li>
                  <li>Kariyer ve iş başvurularının (özgeçmişler ve portfolyoların) değerlendirilmesi ve insan kaynakları süreçlerinin yürütülmesi,</li>
                  <li>Ziyaretçiler ve müşterilerle gerekli iletişim kanallarının kurulması,</li>
                  <li>Hizmet kalitemizin artırılması, talep ve şikayetlerinize dönüş yapılması.</li>
                </ul>
              </div>
            </div>

            {/* 4. Çerezler (Cookies) ve Kullanımı */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                <Cookie size={24} />
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>4. Çerezler (Cookies) ve Kullanımı</h3>
                <p style={{ color: '#aaa', lineHeight: '1.7', fontSize: '0.95rem' }}>
                  Web sitemizin stabil çalışması, kullanıcı oturumlarının (örneğin müşteri ve çalışan panellerinin) sürekli şifre girilmeden açık kalabilmesi ve analiz yapılması amacıyla çerezler kullanılmaktadır. Tarayıcı ayarlarınız üzerinden çerezleri devre dışı bırakabilirsiniz; ancak bu durumda müşteri portalı gibi bazı oturum gerektiren özellikler düzgün çalışmayabilir.
                </p>
              </div>
            </div>

            {/* 5. Kişisel Verilerin Saklanması ve Aktarılması */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(0, 230, 118, 0.1)', color: '#00e676', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                <Lock size={24} />
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>5. Verilerin Saklanması ve Aktarılması</h3>
                <p style={{ color: '#aaa', lineHeight: '1.7', fontSize: '0.95rem' }}>
                  Toplanan verileriniz Supabase altyapısındaki güvenli sunucularımızda saklanır. Kişisel verileriniz, yasal zorunluluklar ve resmi kurumların talepleri haricinde hiçbir şekilde üçüncü taraflara satılmaz, kiralanmaz veya ticari amaçlarla paylaşılmaz.
                </p>
              </div>
            </div>

            {/* 6. Veri Sahibi Olarak Haklarınız */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(0, 229, 255, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                <Scale size={24} />
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>6. KVKK Kapsamındaki Haklarınız</h3>
                <p style={{ color: '#aaa', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '10px' }}>
                  KVKK’nın 11. maddesi uyarınca veri sahibi olarak aşağıdaki haklara sahipsiniz:
                </p>
                <ul style={{ color: '#aaa', lineHeight: '1.7', fontSize: '0.95rem', paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                  <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</li>
                  <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                  <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme,</li>
                  <li>Verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme, silinmesini veya yok edilmesini talep etme.</li>
                </ul>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '10px' }}>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '15px' }}>Bizimle İletişime Geçin</h4>
              <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '15px' }}>
                Gizlilik politikamız, KVKK kapsamındaki haklarınız veya verilerinizin silinmesi talepleriniz ile ilgili her türlü soru için aşağıdaki kanallar üzerinden bizimle irtibata geçebilirsiniz:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc', fontSize: '0.95rem' }}>
                  <Mail size={16} style={{ color: 'var(--primary)' }} />
                  <a href="mailto:hello@socialartajans.com" style={{ color: '#fff', textDecoration: 'none' }}>hello@socialartajans.com</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc', fontSize: '0.95rem' }}>
                  <Phone size={16} style={{ color: 'var(--primary)' }} />
                  <a href="tel:+905398602130" style={{ color: '#fff', textDecoration: 'none' }}>+90 539 860 2130</a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default PrivacyPolicy;
