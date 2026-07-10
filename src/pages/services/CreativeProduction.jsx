import React from 'react';
import { Camera, Video, Play, ArrowRight, CheckCircle2, Sparkles, Zap, Award, Calendar, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazySection from '../../components/LazySection';
const AnalysisForm = React.lazy(() => import('../../components/AnalysisForm'));
import FAQAccordion from '../../components/FAQAccordion';

function CreativeProduction() {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "Kreatif Prodüksiyon & Reklam Filmi İstanbul | SocialArt Medya";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "İstanbul'da kendi stüdyomuz ve 4K ekipmanlarımızla sinematik reklam filmleri, ürün fotoğrafçılığı ve performans getiren Reels çekimleri yapıyoruz.");
    }
  }, []);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Kreatif Prodüksiyon (Creative Production)",
    "provider": {
      "@type": "Organization",
      "name": "SocialArt Medya",
      "url": "https://www.socialartmedya.com"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "İstanbul"
    },
    "description": "İstanbul merkezli profesyonel kreatif prodüksiyon ajansı. 4K sinematik reklam filmleri, ürün fotoğrafçılığı, Reels/TikTok çekimleri ve stüdyo kiralama.",
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
        "name": "Çekim stüdyonuz nerededir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Profesyonel çekim stüdyomuz İstanbul Çekmeköy'de yer almaktadır. Stüdyomuzda en üst düzey ışık, ses ve kamera ekipmanlarıyla markalarımız için çekimler yapıyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "Stüdyonuzu kiralayabiliyor muyuz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Bağımsız ekipler, ajanslar ve içerik üreticileri için tam donanımlı stüdyomuzu saatlik veya günlük olarak kiralama hizmeti sunuyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "Çekim sonrası revize haklarımız nelerdir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Konsept aşamasında anlaşılan briefe uygun olarak, kurgu ve post-prodüksiyon sürecinde 2 adet ücretsiz revize hakkınız bulunmaktadır."
        }
      },
      {
        "@type": "Question",
        "name": "Dış mekan veya farklı şehirlerde çekim yapıyor musunuz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Reklam filmleri, fabrika tanıtımları veya katalog çekimleri için İstanbul içi dış mekanların yanı sıra, proje bazlı olarak Türkiye'nin her şehrinde prodüksiyon operasyonları düzenleyebiliyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "Çekimlerin teslim süresi ne kadardır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Kısa sosyal medya Reels videoları 3-5 iş günü içinde kurgulanıp teslim edilirken, büyük bütçeli sinematik reklam filmleri post-prodüksiyon yoğunluğuna göre 10-15 iş günü sürebilmektedir."
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
          <div className="shape shape-1" style={{ background: 'radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, transparent 60%)' }}></div>
        </div>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent)', background: 'rgba(0, 229, 255, 0.08)', padding: '8px 20px', borderRadius: '50px', border: '1px solid rgba(0, 229, 255, 0.15)' }}>Profesyonel Prodüksiyon</span>
            <h1 className="hero-title" style={{ fontSize: '3.5rem', lineHeight: '1.25', marginBottom: '30px', marginTop: '15px' }}>
              Kreatif Prodüksiyon ile <span className="gradient-text">Görsel Gücünüzü</span> Sergileyin
            </h1>
            <p className="hero-desc" style={{ fontSize: '1.2rem', marginTop: '30px' }}>
              Sinematik reklam filmlerinden, yüksek dönüşüm getiren UGC içeriklerine kadar; markanızın ruhunu yansıtan ve izleyiciyi harekete geçiren kreatifler üretiyoruz.
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
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '24px' }}>Kreatif Prodüksiyon <span className="gradient-text">Nedir?</span></h2>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '20px' }}>
                Kreatif prodüksiyon; markaların dijital imajını güçlendiren, hikayelerini sinematik bir dille anlatan ve sosyal medya mecralarında dikkat çekerek dönüşüm sağlayan 4K reklam filmleri, ürün fotoğrafçılığı ve kanca (hook) odaklı Reels videoları üretme sürecidir.
              </p>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem' }}>
                SocialArt olarak biz, stüdyo kalitesini veri odaklı stratejiyle birleştirerek 'performans odaklı kreatifler' (Performance Creative) üretiyoruz. İstanbul'da yer alan tam donanımlı kendi stüdyomuz ve en üst segment kamera/ışık ekipmanlarımızla, izleyicinin ilk 3 saniyede ilgisini yakalayıp satın alma dürtüsünü harekete geçiren görsel yapıtlar kurguluyoruz.
              </p>
            </div>

            {/* 2. Kimler İçin Uygundur? */}
            <div className="feature-list-card" style={{ padding: '40px', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '25px', color: '#fff' }}>Kimler İçin Uygundur?</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--accent)" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Sosyal Medyada Kalitesiyle Fark Yaratmak İsteyen Markalar</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--accent)" size={20} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Katalog ve Web Siteleri İçin Profesyonel Ürün Çekimine İhtiyacı Olanlar</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--accent)" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Marka Prestijini Sinematik Reklam Filmleriyle Yükseltmek İsteyenler</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--accent)" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Kendi Bağımsız Çekimleri İçin Profesyonel Stüdyo Arayan Ekipler</span>
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
            <p style={{ color: '#aaa', fontSize: '1.1rem', marginTop: '10px' }}>Görsel dünyanızı zenginleştiren, her biri alanında uzman prodüksiyon çözümlerimiz.</p>
          </div>
          <div className="services-grid">
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Video size={35} color="var(--accent)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Sinematik Reklam Filmi</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Markanızın değerini ve prestijini yansıtan, yüksek prodüksiyon standartlarında televizyon ve dijital mecra reklam filmleri çekiyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Zap size={35} color="var(--secondary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Sosyal Medya Reels & Video</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>İlk saniyede izleyiciyi yakalayan kanca (hook) odaklı, viral olma potansiyeli yüksek Reels ve TikTok içerikleri üretiyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Camera size={35} color="var(--primary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Profesyonel Ürün & Model Çekimi</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Kendi stüdyomuzda web siteleri, kataloglar ve sosyal medya hesapları için profesyonel ürün ve model fotoğrafları üretiyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Sparkles size={35} color="#00e5ff" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Post-Prodüksiyon (Kurgu & Renk)</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Çekilen ham görüntüleri sinematik renk derecelendirme (color grading), dinamik kurgu ve ses efektleriyle kusursuz hale getiriyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Monitor size={35} color="var(--accent)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Stüdyo Çekim & Kiralama</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Işık ekipmanları, dekorlar ve farklı arka plan seçenekleri ile donatılmış stüdyomuzda hem kendi çekimlerimizi yapıyor hem de bağımsız ekiplere kiralıyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Calendar size={35} color="#ffb703" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Event & Etkinlik Çekimi</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Marka lansmanları, fuarlar, partiler, kurumsal etkinlikler ve özel davetleriniz için anın ruhunu yakalayan dinamik aftermovie ve fotoğraf çekimleri.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Süreç Nasıl İşler? */}
      <section className="section-padding" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Prodüksiyon <span className="gradient-text">Sürecimiz</span></h2>
            <p style={{ color: '#aaa', fontSize: '1.1rem', marginTop: '10px' }}>Senaryodan teslimata, titizlikle işleyen üretim modelimiz.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
             {[
               { step: '01', title: 'Konsept & Senaryo', desc: 'İhtiyaçlarınıza uygun görsel dili belirler, çekimlerin senaryo ve kurgu planlarını hazırlarız.' },
               { step: '02', title: 'Pre-Prodüksiyon', desc: 'Mekan keşfi, cast (oyuncu) seçimi, sanat yönetimi ve teknik ekipman planlamasını yaparız.' },
               { step: '03', title: 'Çekim (Prodüksiyon)', desc: 'Kendi stüdyomuzda veya lokasyonda, profesyonel yönetmen ve ekip eşliğinde çekimleri gerçekleştiririz.' },
               { step: '04', title: 'Post-Prodüksiyon', desc: 'Kurgu, montaj, renk derecelendirme (color grading) ve ses tasarımı süreçlerini tamamlarız.' },
               { step: '05', title: 'Revize & Teslimat', desc: 'Ön izleme aşamasında onayınızı alır, revizeleri tamamlayıp yüksek kalitede teslimatı gerçekleştiririz.' }
             ].map((item, i) => (
                <div key={i} className="glass" style={{ padding: '30px', borderRadius: '20px', position: 'relative' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent)', opacity: '0.15', position: 'absolute', top: '15px', right: '20px' }}>{item.step}</span>
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
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px', textAlign: 'center' }}>Hedeflediğimiz <span className="gradient-text">Görsel Sonuçlar</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px', marginTop: '40px' }}>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--accent)', marginBottom: '10px', fontWeight: '800' }}>Sinematik Görsel Kalite</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Markanızın kalitesini ve duruşunu en üst düzeyde yansıtan, pürüzsüz ve profesyonel görüntüler sunuyoruz.</p>
             </div>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '10px', fontWeight: '800' }}>İlk 3 Saniyede Durdurma Gücü</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Sosyal medyada kaydırmayı durduran, kanca (hook) odaklı başlangıçlarla izlenme sürelerini artırıyoruz.</p>
             </div>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--secondary)', marginBottom: '10px', fontWeight: '800' }}>Daha Yüksek Reklam Performansı</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Stratejik olarak kurgulanan performans kreatifleri sayesinde reklam tıklama oranlarınızı (CTR) yükseltiyoruz.</p>
             </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="section-padding" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Prodüksiyon Hakkında <span className="gradient-text">Sık Sorulanlar</span></h2>
          <FAQAccordion items={[
            {
              question: "Çekim stüdyonuz nerededir?",
              answer: "Profesyonel çekim stüdyomuz İstanbul Çekmeköy'de yer almaktadır. Stüdyomuzda en üst düzey ışık, ses ve kamera ekipmanlarıyla markalarımız için çekimler yapıyoruz."
            },
            {
              question: "Stüdyonuzu kiralayabiliyor muutuz?",
              answer: "Evet. Bağımsız ekipler, ajanslar ve içerik üreticileri için tam donanımlı stüdyomuzu saatlik veya günlük olarak kiralama hizmeti sunuyoruz."
            },
            {
              question: "Çekim sonrası revize haklarımız nelerdir?",
              answer: "Konsept aşamasında anlaşılan briefe uygun olarak, kurgu ve post-prodüksiyon sürecinde 2 adet ücretsiz revize hakkınız bulunmaktadır."
            },
            {
              question: "Dış mekan veya farklı şehirlerde çekim yapıyor musunuz?",
              answer: "Evet. Reklam filmleri, fabrika tanıtımları veya katalog çekimleri için İstanbul içi dış mekanların yanı sıra, proje bazlı olarak Türkiye'nin her şehrinde prodüksiyon operasyonları düzenleyebiliyoruz."
            },
            {
              question: "Çekimlerin teslim süresi ne kadardır?",
              answer: "Kısa sosyal medya Reels videoları 3-5 iş günü içinde kurgulanıp teslim edilirken, büyük bütçeli sinematik reklam filmleri post-prodüksiyon yoğunluğuna göre 10-15 iş günü sürebilmektedir."
            }
          ]} />
        </div>
      </section>

      {/* Final CTA & Analysis Form */}
      <section className="section-padding" id="funnel" style={{ background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>Üretime <span className="gradient-text">Başlayalım</span></h2>
            <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
              Markanızın görsel dünyasını birlikte inşa edelim. Ücretsiz analiz ve çekim planlaması için randevunuzu oluşturun.
            </p>
          </div>
          
          <LazySection height="350px">
            <React.Suspense fallback={
              <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            }>
              <AnalysisForm defaultService="Video prodüksiyon" />
            </React.Suspense>
          </LazySection>
        </div>
      </section>
    </div>
  );
}

export default CreativeProduction;
