import React from 'react';
import { Share2, Users, MessageSquare, ArrowRight, CheckCircle2, TrendingUp, Sparkles, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazySection from '../../components/LazySection';
const AnalysisForm = React.lazy(() => import('../../components/AnalysisForm'));
import FAQAccordion from '../../components/FAQAccordion';

function SosyalMedya() {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "Sosyal Medya Yönetimi İstanbul | SocialArt Medya";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "İstanbul sosyal medya ajansı SocialArt Medya ile markanızın Reels videolarını, içerik stratejisini ve topluluk yönetimini growth odaklı ölçeklendirin.");
    }
  }, []);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Sosyal Medya Yönetimi",
    "provider": {
      "@type": "Organization",
      "name": "SocialArt Medya",
      "url": "https://www.socialartmedya.com"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "İstanbul"
    },
    "description": "İstanbul merkezli growth odaklı sosyal medya yönetimi hizmeti. Kreatif içerik üretimi, reels videoları, topluluk yönetimi ve veri odaklı sosyal medya büyüme stratejileri.",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "TRY"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Hangi platformlar için hizmet veriyorsunuz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Başta Instagram, TikTok, LinkedIn, YouTube ve Facebook olmak üzere markanızın hedef kitlesinin en aktif olduğu tüm dijital mecralarda profesyonel hesap yönetimi yapıyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "Sosyal medya çekimlerini siz mi gerçekleştiriyorsunuz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. İstanbul'daki kendi tam donanımlı kreatif stüdyomuzda veya belirlenen lokasyonlarda, profesyonel ekipman ve yönetmenlerimiz eşliğinde video ve fotoğraf çekimlerini gerçekleştiriyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "Aylık kaç içerik paylaşıyorsunuz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "İçerik sayısı markanın ihtiyaçlarına ve hedeflenen büyüme ivmesine göre özel olarak planlanır. Genellikle haftalık 3-4 Reels/Carousel gönderisi ve günlük aktif hikaye paylaşımları içeren dengeli bir takvim uyguluyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "Sosyal medya yönetimi reklam bütçesini kapsar mı?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sosyal medya yönetimi organik içerik üretimi, moderasyon ve sayfa düzenini kapsar. Meta ve Google reklam yönetimi ile reklam bütçeleri bu hizmetten ayrı olarak, bütünleşik bir stratejiyle yönetilir."
        }
      },
      {
        "@type": "Question",
        "name": "Sosyal medya yönetiminde sözleşme süresi ne kadardır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Organik büyüme ve algoritmik optimizasyonun sağlıklı sonuçlar vermesi için iş birliklerimizi minimum 3 veya 6 aylık periyotlar halinde kurgulamayı öneriyoruz."
        }
      }
    ]
  };

  return (
    <div className="service-detail-page" style={{ background: '#050505', color: '#fff' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero Section */}
      <section className="hero" style={{ paddingTop: '320px', paddingBottom: '80px', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-bg-shapes">
          <div className="shape shape-1" style={{ background: 'radial-gradient(circle, rgba(138,43,226,0.15) 0%, transparent 60%)' }}></div>
        </div>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary)', background: 'rgba(138, 43, 226, 0.08)', padding: '8px 20px', borderRadius: '50px', border: '1px solid rgba(138, 43, 226, 0.15)' }}>Growth Odaklı Hizmet</span>
            <h1 className="hero-title" style={{ fontSize: '3.5rem', lineHeight: '1.25', marginBottom: '30px', marginTop: '15px' }}>
              Stratejik <span className="gradient-text">Sosyal Medya</span> Yönetimi
            </h1>
            <p className="hero-desc" style={{ fontSize: '1.2rem', marginTop: '30px' }}>
              Sadece paylaşım yapmıyoruz; markanız için yaşayan, etkileşim kuran ve satış getiren dijital topluluklar inşa ediyoruz. Veri odaklı içerik stratejileriyle görünürlüğünüzü katlıyoruz.
            </p>
            <div className="hero-actions" style={{ marginTop: '40px' }}>
              <button className="btn btn-primary" onClick={() => window.scrollTo({ top: document.getElementById('funnel')?.offsetTop - 100, behavior: 'smooth' })}>
                Ekibimizle Toplantı Planlayın
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Hizmet Nedir? */}
      <section className="section-padding" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <div className="service-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <div className="service-text-content">
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '24px' }}>Sosyal Medya Yönetimi <span className="gradient-text">Nedir?</span></h2>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '20px' }}>
                Sosyal medya yönetimi; markanızın Instagram, TikTok, LinkedIn ve YouTube gibi dijital platformlardaki kimliğini kurma, koruma ve büyütme sürecidir. SocialArt olarak bu hizmeti salt "estetik bir grid tasarımı" olarak görmüyoruz.
              </p>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Bizim için <strong>sosyal medya yönetimi</strong>; hedef kitlenizin tüketim alışkanlıklarını analiz ederek onlara hitap eden içerik formatları (Reels, Carousel, Video) geliştirmek, algoritma dinamiklerini lehinize kullanmak ve bu organik ilgiyi web sitenize veya satış kanallarınıza yönlendiren entegre bir büyüme hunisi (funnel) kurmaktır.
              </p>
            </div>

            {/* 2. Kimler İçin Uygundur? */}
            <div className="feature-list-card" style={{ padding: '40px', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '25px', color: '#fff' }}>Kimler İçin Uygundur?</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Dijitalde Otorite Kurmak İsteyen E-Ticaret Markaları</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Müşteri Güvenini ve Sadakatini Artırmayı Hedefleyen Firmalar</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Sosyal Medyayı Aktif Satış Kanalına Dönüştürmek İsteyenler</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Doğal ve Trend Reels Videoları ile Keşfete Çıkmak İsteyenler</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SocialArt Bu Hizmette Ne Yapar? */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>SocialArt Bu Hizmette <span className="gradient-text">Ne Yapar?</span></h2>
            <p style={{ color: '#aaa', fontSize: '1.1rem', marginTop: '10px' }}>Markanızın sosyal medyadaki tüm operasyonel ve kreatif ihtiyaçlarını tek çatı altında çözüyoruz.</p>
          </div>
          <div className="services-grid">
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Sparkles size={35} color="var(--primary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Strateji & Trend Takibi</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Sektörel trendleri, rakip analizlerini ve platform algoritmalarını günlük olarak izleyerek markanıza özel içerik konseptleri üretiyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Smartphone size={35} color="var(--secondary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Profesyonel Çekim & Tasarım</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Kendi kreatif ekibimiz ve ekipmanlarımızla markanız için 4K Reels videoları, fotoğraf çekimleri ve özgün tasarımlar hazırlıyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Users size={35} color="#00e5ff" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Topluluk Yönetimi (Moderasyon)</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Gelen yorum ve mesajları kurumsal dilinize uygun şekilde yanıtlıyor, potansiyel müşterilerinizle sağlıklı etkileşim bağları kuruyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <MessageSquare size={35} color="var(--accent)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Entegre Reklam Desteği</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Paylaştığımız içeriklerin performansını analiz ederek, en yüksek organik etkileşim alan gönderileri reklam kampanyalarıyla destekliyoruz.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Süreç Nasıl İşler? */}
      <section className="section-padding" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Operasyonel <span className="gradient-text">Sürecimiz</span></h2>
            <p style={{ color: '#aaa', fontSize: '1.1rem', marginTop: '10px' }}>Aşama aşama, planlı ve şeffaf bir sosyal medya operasyonu yürütüyoruz.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
             {[
               { step: '01', title: 'Brief & Analiz', desc: 'Markanızın kurumsal hedeflerini, rakiplerini ve hedef kitlesinin beklentilerini analiz ederiz.' },
               { step: '02', title: 'İçerik Stratejisi', desc: 'Platform bazlı görsel dili, paylaşım sıklığını ve aylık taslak içerik planını oluştururuz.' },
               { step: '03', title: 'Prodüksiyon & Çekim', desc: 'Senaryosu yazılan video ve Reels içeriklerini stüdyomuzda veya mekanınızda profesyonelce çekeriz.' },
               { step: '04', title: 'Yayın & Moderasyon', desc: 'Onaylanan içerikleri doğru zaman dilimlerinde paylaşır ve etkileşim süreçlerini başlatıriz.' },
               { step: '05', title: 'Analiz & Rapor', desc: 'Ay sonunda erişim, etkileşim ve profil trafiği verilerini inceleyerek gelecek ayı optimize ederiz.' }
             ].map((item, i) => (
                <div key={i} className="glass" style={{ padding: '30px', borderRadius: '20px', position: 'relative' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', opacity: '0.15', position: 'absolute', top: '15px', right: '20px' }}>{item.step}</span>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', fontWeight: '800' }}>{item.title}</h3>
                  <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>{item.desc}</p>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* 5. Hangi Sonuçlar Hedeflenir? */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px', textAlign: 'center' }}>Hedeflediğimiz <span className="gradient-text">Başarı Kriterleri</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px', marginTop: '40px' }}>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '10px', fontWeight: '800' }}>Marka Bilinirliği (Awareness)</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Keşfet odaklı Reels kurgularıyla markanızın her ay yüz binlerce yeni tekil kullanıcıya doğal yollarla ulaşmasını sağlıyoruz.</p>
             </div>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--secondary)', marginBottom: '10px', fontWeight: '800' }}>Güven ve Otorite İnşası</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Bilgi veren, problemleri çözen ve kurumsal kimliğinizi doğru yansıtan içeriklerle sektörünüzde referans olmanızı hedefliyoruz.</p>
             </div>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: '#00e5ff', marginBottom: '10px', fontWeight: '800' }}>Müşteri Kazanımı (Conversion)</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Sosyal medya kanallarınızı sadece beğeni alınan yerler olmaktan çıkarıp, DM ve profil linkleri üzerinden satışa açıyoruz.</p>
             </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="section-padding" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Sosyal Medya Hakkında <span className="gradient-text">Sık Sorulanlar</span></h2>
          <FAQAccordion items={[
            {
              question: "Hangi platformlar için hizmet veriyorsunuz?",
              answer: "Başta Instagram, TikTok, LinkedIn, YouTube ve Facebook olmak üzere markanızın hedef kitlesinin en aktif olduğu tüm dijital mecralarda profesyonel hesap yönetimi yapıyoruz."
            },
            {
              question: "Sosyal medya çekimlerini siz mi gerçekleştiriyorsunuz?",
              answer: "Evet. İstanbul'daki kendi tam donanımlı kreatif stüdyomuzda veya belirlenen lokasyonlarda, profesyonel ekipman ve yönetmenlerimiz eşliğinde video ve fotoğraf çekimlerini gerçekleştiriyoruz."
            },
            {
              question: "Aylık kaç içerik paylaşıyorsunuz?",
              answer: "İçerik sayısı markanın ihtiyaçlarına ve hedeflenen büyüme ivmesine göre özel olarak planlanır. Genellikle haftalık 3-4 Reels/Carousel gönderisi ve günlük aktif hikaye paylaşımları içeren dengeli bir takvim uyguluyoruz."
            },
            {
              question: "Sosyal medya yönetimi reklam bütçesini kapsar mı?",
              answer: "Sosyal medya yönetimi organik içerik üretimi, moderasyon ve sayfa düzenini kapsar. Meta ve Google reklam yönetimi ile reklam bütçeleri bu hizmetten ayrı olarak, bütünleşik bir stratejiyle yönetilir."
            },
            {
              question: "Sosyal medya yönetiminde sözleşme süresi ne kadardır?",
              answer: "Organik büyüme ve algoritmik optimizasyonun sağlıklı sonuçlar vermesi için iş birliklerimizi minimum 3 veya 6 aylık periyotlar halinde kurgulamayı öneriyoruz."
            }
          ]} />
        </div>
      </section>

      {/* Final CTA & Analysis Form */}
      <section className="section-padding" id="funnel" style={{ background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>Topluluğunuzu <span className="gradient-text">Büyütelim</span></h2>
            <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
              Dijitaldeki sesinizi birlikte güçlendirelim. Ücretsiz hesap analizi ve strateji planlaması için randevunuzu oluşturun.
            </p>
          </div>
          
          <LazySection height="350px">
            <React.Suspense fallback={
              <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            }>
              <AnalysisForm defaultService="Sosyal Medya & Reklam" />
            </React.Suspense>
          </LazySection>
        </div>
      </section>
    </div>
  );
}

export default SosyalMedya;
