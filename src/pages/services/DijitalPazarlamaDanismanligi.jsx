import React from 'react';
import { Layers, Target, TrendingUp, ArrowRight, CheckCircle2, Zap, BarChart3, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazySection from '../../components/LazySection';
const AnalysisForm = React.lazy(() => import('../../components/AnalysisForm'));
import FAQAccordion from '../../components/FAQAccordion';

function DijitalPazarlamaDanismanligi() {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "Dijital Pazarlama Danışmanlığı İstanbul | SocialArt Medya";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "İstanbul büyüme danışmanlığı ile pazarlama bütçenizi optimize edin, entegre reklam/kreatif stratejileriyle sepet dönüşüm oranlarınızı (CRO) katlayın.");
    }
  }, []);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Dijital Pazarlama Danışmanlığı",
    "provider": {
      "@type": "Organization",
      "name": "SocialArt Medya",
      "url": "https://www.socialartmedya.com"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "İstanbul"
    },
    "description": "İstanbul merkezli büyüme odaklı 360 derece Dijital Pazarlama Danışmanlığı. Satış hunisi (funnel) optimizasyonu, ROAS artışı, CRO ve stratejik growth marketing.",
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
        "name": "Dijital pazarlama danışmanlığı neleri kapsar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dijital pazarlama danışmanlığı; reklam hesaplarınızın, kreatif ve içerik süreçlerinizin, web sitesi dönüşüm oranlarınızın (CRO) ve bütçe verimliliğinizin baştan sona analiz edilmesini, markaya özel büyüme yol haritasının çizilmesini ve bu süreçlerin takibini kapsar."
        }
      },
      {
        "@type": "Question",
        "name": "Danışmanlık süreci ne kadar sürer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Stratejilerin hayata geçirilmesi ve optimizasyonların sağlıklı sonuçlar vermesi için danışmanlık hizmetimizi minimum 3 veya 6 aylık periyotlar halinde kurguluyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "Kendi ekibimiz olması şart mı?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hayır. Kendi operasyonel ekibiniz varsa onlara mentorluk yapıyor ve yol haritasını delege ediyoruz. Ekibiniz yoksa, operasyonun uygulanması sürecinde SocialArt'ın uzman ekiplerinden (reklam, kreatif, içerik) destek alabilirsiniz."
        }
      },
      {
        "@type": "Question",
        "name": "Reklam bütçemizi siz mi yönetiyorsunuz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Bütçe planlamasını ve reklam kampanyalarınızın kurulum, yönetim ve optimizasyon aşamalarını veri analitiği araçlarımız eşliğinde bizzat yönetiyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "Danışmanlık ücreti nasıl belirlenir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Danışmanlık ücreti; markanızın o anki ciro seviyesine, yönetilecek bütçenin büyüklüğüne, operasyonel karmaşıklığına ve ihtiyaç duyulan mentorluk sıklığına göre proje bazlı olarak belirlenir."
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
            <span style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary)', background: 'rgba(138, 43, 226, 0.08)', padding: '8px 20px', borderRadius: '50px', border: '1px solid rgba(138, 43, 226, 0.15)' }}>Bütünsel Danışmanlık</span>
            <h1 className="hero-title" style={{ fontSize: '3.5rem', lineHeight: '1.25', marginBottom: '30px', marginTop: '15px' }}>
              Dijital Pazarlama <span className="gradient-text">Danışmanlığı</span> ile Büyüyün
            </h1>
            <p className="hero-desc" style={{ fontSize: '1.2rem', marginTop: '30px' }}>
              Şablon stratejilere son. Markanızın büyüme önündeki engellerini analiz ediyor, reklam-kreatif-içerik eksenini birlikte ele alarak sürdürülebilir bir growth yol haritası kuruyoruz.
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
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '24px' }}>Dijital Pazarlama Danışmanlığı <span className="gradient-text">Nedir?</span></h2>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '20px' }}>
                Dijital pazarlama danışmanlığı; markaların dijital kanallardaki büyüme hedeflerine ulaşmak amacıyla mevcut pazarlama operasyonlarının, web sitesi dönüşüm hunilerinin, kreatif stratejilerinin ve reklam bütçelerinin bütünsel (360 derece) olarak analiz edilmesi ve optimize edilmesi sürecidir.
              </p>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem' }}>
                SocialArt olarak biz, basmakalıp jargondan uzak duruyoruz. Markanızın gerçek büyüme problemlerini tespit ediyor, veri odaklı büyüme yol haritaları kurguluyor ve operasyonel ekiplerinize liderlik ediyoruz. <strong>Dijital pazarlama danışmanlığı</strong> kapsamında, reklamlarınızı, kreatiflerinizi ve içeriklerinizi tek bir çatı altında ve birbiriyle uyumlu çalışacak şekilde planlıyoruz.
              </p>
            </div>

            {/* 2. Kimler İçin Uygundur? */}
            <div className="feature-list-card" style={{ padding: '40px', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '25px', color: '#fff' }}>Kimler İçin Uygundur?</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Pazarlama Bütçesini Daha Karlı Yönetmek İsteyen Markalar</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>İç Ekibini Daha Profesyonel Stratejilerle Yönetmek İsteyenler</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Reklam Verimliliği (ROAS) Düşen Dijital Girişimler ve Markalar</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Yeni Bir Ürün Veya Hizmet Lansmanına Hazırlanan Şirketler</span>
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
            <p style={{ color: '#aaa', fontSize: '1.1rem', marginTop: '10px' }}>Büyümeyi hızlandıran ve ekiplerinizi yönlendiren stratejik çözümlerimiz.</p>
          </div>
          <div className="services-grid">
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <BarChart3 size={35} color="var(--primary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>360° Funnel Analizi</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Reklamlardan web sitenize, e-posta listelerinizden müşteri ilişkilerinize kadar tüm dijital temas noktalarını denetleriz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Target size={35} color="var(--secondary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Growth Stratejisi</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Kısa, orta ve uzun vadeli pazarlama hedeflerinize uygun, bütçe verimliliğini esas alan kişiselleştirilmiş yol haritaları hazırlarız.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Zap size={35} color="#00e5ff" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>CRO & Dönüşüm İyileştirme</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Web sitenizin kullanıcı deneyimini (UX) ve satın alım adımlarını inceleyerek dönüşüm oranlarınızı artıracak düzenlemeler sunarız.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Layers size={35} color="var(--accent)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Ekip Mentorluğu</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Mevcut pazarlama ekibinize veya dış kaynak ajanslarınıza hedefleri gerçekleştirmeleri sürecinde stratejik liderlik yaparız.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Süreç Nasıl İşler? */}
      <section className="section-padding" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Danışmanlık <span className="gradient-text">Yol Haritamız</span></h2>
            <p style={{ color: '#aaa', fontSize: '1.1rem', marginTop: '10px' }}>Veri toplama, analiz etme ve büyütme aşamalarından oluşan metodolojimiz.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
             {[
               { step: '01', title: 'Pazarlama Denetimi', desc: 'Geçmiş reklam harcamalarınız, kampanya kurgularınız ve web analitiği verileriniz detaylıca incelenir.' },
               { step: '02', title: 'Problem Tespiti', desc: 'Büyüme sürecinizi tıkayan kreatif eksiklikleri, hedefleme hataları veya CRO problemleri belirlenir.' },
               { step: '03', title: 'Strateji Tasarımı', desc: 'Markanıza en uygun satış hunisi modelleri, bütçe dağılım planları ve kreatif brief şablonları hazırlanır.' },
               { step: '04', title: 'Eğitim & Delege Etme', desc: 'Yol haritası iç ekibinize veya SocialArt ekiplerine aktarılarak uygulama süreci başlatılır.' },
               { step: '05', title: 'Takip & Optimizasyon', desc: 'Düzenli aralıklarla (haftalık/aylık) veriler denetlenir, performans sapmaları hızlıca düzeltilir.' }
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
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px', textAlign: 'center' }}>Hedeflediğimiz <span className="gradient-text">Büyüme Sonuçları</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px', marginTop: '40px' }}>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '10px', fontWeight: '800' }}>Pazarlama Verimliliği Artışı</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Reklam harcamalarınızın getirisini (ROAS) yükselterek aynı bütçeyle daha yüksek ciro ve karlılık elde etmenizi sağlıyoruz.</p>
             </div>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--secondary)', marginBottom: '10px', fontWeight: '800' }}>Verimli Ekip Yönetimi</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Ekiplerinizin neye odaklanacağını, hangi metrikleri takip edeceğini belirleyerek operasyonel dağınıklığı önlüyoruz.</p>
             </div>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: '#00e5ff', marginBottom: '10px', fontWeight: '800' }}>Satış Dönüşüm Oranlarında Yükseliş</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Sepet ve sipariş sayfalarındaki tıkanıklıkları gidererek, sitenize gelen ziyaretçilerin alıcıya dönüşme oranını artırıyoruz.</p>
             </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="section-padding" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Danışmanlık Hakkında <span className="gradient-text">Sık Sorulanlar</span></h2>
          <FAQAccordion items={[
            {
              question: "Dijital pazarlama danışmanlığı neleri kapsar?",
              answer: "Dijital pazarlama danışmanlığı; reklam hesaplarınızın, kreatif ve içerik süreçlerinizin, web sitesi dönüşüm oranlarınızın (CRO) ve bütçe verimliliğinizin baştan sona analiz edilmesini, markaya özel büyüme yol haritasının çizilmesini ve bu süreçlerin takibini kapsar."
            },
            {
              question: "Danışmanlık süreci ne kadar sürer?",
              answer: "Stratejilerin hayata geçirilmesi ve optimizasyonların sağlıklı sonuçlar vermesi için danışmanlık hizmetimizi minimum 3 veya 6 aylık periyotlar halinde kurguluyoruz."
            },
            {
              question: "Kendi ekibimiz olması şart mı?",
              answer: "Hayır. Kendi operasyonel ekibiniz varsa onlara mentorluk yapıyor ve yol haritasını delege ediyoruz. Ekibiniz yoksa, operasyonun uygulanması sürecinde SocialArt'ın uzman ekiplerinden (reklam, kreatif, içerik) destek alabilirsiniz."
            },
            {
              question: "Reklam bütçemizi siz mi yönetiyorsunuz?",
              answer: "Evet. Bütçe planlamasını ve reklam kampanyalarınızın kurulum, yönetim ve optimizasyon aşamalarını veri analitiği araçlarımız eşliğinde bizzat yönetiyoruz."
            },
            {
              question: "Danışmanlık ücreti nasıl belirlenir?",
              answer: "Danışmanlık ücreti; markanızın o anki ciro seviyesine, yönetilecek bütçenin büyüklüğüne, operasyonel karmaşıklığına ve ihtiyaç duyulan mentorluk sıklığına göre proje bazlı olarak belirlenir."
            }
          ]} />
        </div>
      </section>

      {/* Final CTA & Analysis Form */}
      <section className="section-padding" id="funnel" style={{ background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>Stratejinizi <span className="gradient-text">Kuralım</span></h2>
            <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
              Markanızı dijitalde doğru kurguyla büyütelim. Ücretsiz ön analiz ve strateji toplantısı için randevunuzu oluşturun.
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

export default DijitalPazarlamaDanismanligi;
