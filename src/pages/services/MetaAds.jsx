import React from 'react';
import { TrendingUp, BarChart3, Target, ArrowRight, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazySection from '../../components/LazySection';
const AnalysisForm = React.lazy(() => import('../../components/AnalysisForm'));
import FAQAccordion from '../../components/FAQAccordion';

function MetaAds() {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "Meta Reklam Yönetimi (Instagram & Facebook Ads) | SocialArt Medya";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "İstanbul Meta reklam ajansı SocialArt Medya ile bütçenizi karlı şekilde ölçekleyin. Dönüşüm odaklı Reels kreatif testleri ve yüksek ROAS garantili yönetim.");
    }
  }, []);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Meta Ads Yönetimi",
    "provider": {
      "@type": "Organization",
      "name": "SocialArt Medya",
      "url": "https://www.socialartmedya.com"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "İstanbul"
    },
    "description": "İstanbul merkezli ROAS odaklı Meta Ads (Facebook & Instagram) Reklam Yönetimi. Satış hunileri, kreatif testler, piksel entegrasyonu ve ölçeklenebilir büyüme.",
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
        "name": "Bütçem ne kadar olmalı?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Minimum bütçe, sektörünüze, rekabet durumuna ve hedeflerinize göre değişiklik gösterir. Sağlıklı bir test süreci ve veri toplama aşaması için günlük minimum 500 TL - 1000 TL bandında bir başlangıç bütçesi önermekteyiz."
        }
      },
      {
        "@type": "Question",
        "name": "ROAS garantisi veriyor musunuz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dijital pazarlamada kesin ROAS garantisi vermek gerçekçi değildir. Ancak 6 aylık iş birliklerimizde %50 memnuniyet iade garantisi sunuyoruz. Hedefimiz her zaman ilk 3 ayda sürdürülebilir bir karlılık modeli kurmaktır."
        }
      },
      {
        "@type": "Question",
        "name": "Raporlama sıklığı nedir ve hangi metrikler paylaşılır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Haftalık ve aylık periyotlarda şeffaf raporlar sunuyoruz. Raporlarımızda tıklama oranlarının ötesinde, asıl odaklandığımız dönüşüm maliyetleri (CPA), sepet tutarları ve net harcama getirisi (ROAS) metriklerini paylaşıyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "CAPI ve Piksel kurulumunu siz yapıyor musunuz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Reklam hesap kurulum sürecinde, dönüşüm verilerinin eksiksiz takibi için Meta Conversions API (CAPI) ve server-side piksel entegrasyonlarını teknik ekibimiz gerçekleştirmektedir."
        }
      },
      {
        "@type": "Question",
        "name": "Reklam kreatiflerini kim hazırlıyor?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Reklam kreatifleri (görseller, Reels kurguları, reklam metinleri) tamamen kendi kreatif ve prodüksiyon ekibimiz tarafından, dönüşüm psikolojisine ve performans testlerine uygun olarak üretilir."
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
          <div className="shape shape-1" style={{ background: 'radial-gradient(circle, rgba(255, 0, 85, 0.15) 0%, transparent 60%)' }}></div>
        </div>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--secondary)', background: 'rgba(255, 0, 85, 0.08)', padding: '8px 20px', borderRadius: '50px', border: '1px solid rgba(255, 0, 85, 0.15)' }}>Performans Pazarlaması</span>
            <h1 className="hero-title" style={{ fontSize: '3.5rem', lineHeight: '1.25', marginBottom: '30px', marginTop: '15px' }}>
              Meta Ads Yönetimi ile <span className="gradient-text">ROAS Odaklı</span> Ölçekleme
            </h1>
            <p className="hero-desc" style={{ fontSize: '1.2rem', marginTop: '30px' }}>
              Facebook ve Instagram reklamlarını sadece "yayınlamıyoruz". Dönüşüm psikolojisi, kreatif testler ve veri analitiği ile markanız için sürdürülebilir bir büyüme motoru kuruyoruz.
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
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '24px' }}>Meta Ads Yönetimi <span className="gradient-text">Nedir?</span></h2>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '20px' }}>
                Meta Ads yönetimi; Facebook, Instagram, Messenger ve Audience Network platformlarında hedeflenmiş reklam kampanyalarının stratejik planlaması, kurulumu, kreatif optimizasyonu ve bütçe yönetimi süreçlerini kapsayan profesyonel bir performans pazarlaması hizmetidir.
              </p>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem' }}>
                SocialArt olarak biz, teknik hedefleme devrinin bittiğini biliyoruz. Algoritmanın en iyi şekilde çalışması için onu <strong>doğru kreatiflerle</strong> ve <strong>server-side veri takibiyle</strong> besliyoruz. İstanbul merkezli growth marketing ajansımızda, markanızın bütçesini verimli kullanarak en yüksek ROAS değerlerine ulaşmanızı sağlıyoruz.
              </p>
            </div>

            {/* 2. Kimler İçin Uygundur? */}
            <div className="feature-list-card" style={{ padding: '40px', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '25px', color: '#fff' }}>Kimler İçin Uygundur?</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--secondary)" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Satışlarını ve Gelirlerini Ölçeklemek İsteyen Büyüme Odaklı Markalar</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--secondary)" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Nitelikli Lead (Potansiyel Müşteri) Toplamak İsteyen Hizmet Şirketleri</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--secondary)" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Mevcut Reklam Hesaplarında Performans Sorunu Yaşayanlar</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--secondary)" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Data Odaklı ve Karlı Reklam Bütçesi Yönetmek İsteyen Girişimler</span>
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
            <p style={{ color: '#aaa', fontSize: '1.1rem', marginTop: '10px' }}>Reklam bütçenizin her kuruşunu dönüşüme dönüştüren performans çözümlerimiz.</p>
          </div>
          <div className="services-grid">
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <BarChart3 size={35} color="var(--secondary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Kreatif Test (Creative Testing)</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Hangi reklam kurgusunun çalışacağını tahmin etmiyoruz; geliştirdiğimiz metodoloji ile test edip net verilerle ölçekliyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Target size={35} color="#00e5ff" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Satış Hunisi (Funnel) Optimizasyonu</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Kullanıcının reklamı gördüğü andan satın alımı gerçekleştirdiği sayfaya kadar olan tüm aşamaları optimize ediyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Zap size={35} color="var(--primary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Teknik Altyapı & Server-Side</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Meta Conversions API (CAPI) ve server-side piksel kurulumları ile veri kaybını önlüyor, algoritmanın en net veriyi işlemesini sağlıyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <ShieldCheck size={35} color="var(--accent)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Bütçe Yönetimi & Scaling</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Kampanya bütçe optimizasyonu (CBO) ve ad-set bütçe dağılımlarını karlı ve güvenli büyüme hedeflerine göre yönetiyoruz.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Süreç Nasıl İşler? */}
      <section className="section-padding" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Meta Reklam <span className="gradient-text">Sürecimiz</span></h2>
            <p style={{ color: '#aaa', fontSize: '1.1rem', marginTop: '10px' }}>Veriye dayalı ve aşamalı reklam yönetimi operasyonumuz.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
             {[
               { step: '01', title: 'Hesap & Piksel Denetimi', desc: 'Mevcut reklam hesaplarınız, piksel kurulumlarınız ve geçmiş reklam verileriniz detaylıca analiz edilir.' },
               { step: '02', title: 'Strateji ve Funnel Tasarımı', desc: 'Hedef kitlenize en uygun satış hunisi (TOFU, MOFU, BOFU) ve kampanya yapısı kurgulanır.' },
               { step: '03', title: 'Kreatif Üretim', desc: 'Performans odaklı reklam tasarımları, kanca (hook) odaklı Reels videoları kreatif ekibimizce üretilir.' },
               { step: '04', title: 'Test & Lansman', desc: 'Hazırlanan kreatifler ve hedef kitle setleri ile test kampanyaları başlatılır, kazananlar bulunur.' },
               { step: '05', title: 'Ölçekleme (Scaling)', desc: 'Kazanan reklam setlerinin bütçeleri karlı ve kontrollü bir şekilde artırılarak ciro büyütülür.' }
             ].map((item, i) => (
                <div key={i} className="glass" style={{ padding: '30px', borderRadius: '20px', position: 'relative' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)', opacity: '0.15', position: 'absolute', top: '15px', right: '20px' }}>{item.step}</span>
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
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px', textAlign: 'center' }}>Hedeflediğimiz <span className="gradient-text">Performans Sonuçları</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px', marginTop: '40px' }}>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--secondary)', marginBottom: '10px', fontWeight: '800' }}>ROAS Artışı</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Yürüttüğümüz kreatif testler ve funnel iyileştirmeleri ile reklam bütçenizin geri dönüş oranını (ROAS) artırıyoruz.</p>
             </div>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '10px', fontWeight: '800' }}>Müşteri Edinme Maliyeti (CPA) Düşüşü</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Doğru kitle hedeflemeleri ve dikkat çeken performans kreatifleri sayesinde satış başı maliyetlerinizi (CPA) aşağı çekiyoruz.</p>
             </div>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: '#00e5ff', marginBottom: '10px', fontWeight: '800' }}>Sürdürülebilir Ölçeklenme</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Karlılığı koruyarak günlük reklam bütçenizi artırmayı ve markanızı pazarda daha dominant hale getirmeyi sağlıyoruz.</p>
             </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="section-padding" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Meta Reklamları Hakkında <span className="gradient-text">Sık Sorulanlar</span></h2>
          <FAQAccordion items={[
            {
              question: "Bütçem ne kadar olmalı?",
              answer: "Minimum bütçe, sektörünüze, rekabet durumuna ve hedeflerinize göre değişiklik gösterir. Sağlıklı bir test süreci ve veri toplama aşaması için günlük minimum 500 TL - 1000 TL bandında bir başlangıç bütçesi önermekteyiz."
            },
            {
              question: "ROAS garantisi veriyor musunuz?",
              answer: "Dijital pazarlamada kesin ROAS garantisi vermek gerçekçi değildir. Ancak 6 aylık iş birliklerimizde %50 memnuniyet iade garantisi sunuyoruz. Hedefimiz her zaman ilk 3 ayda sürdürülebilir bir karlılık modeli kurmaktır."
            },
            {
              question: "Raporlama sıklığı nedir ve hangi metrikler paylaşılır?",
              answer: "Haftalık ve aylık periyotlarda şeffaf raporlar sunuyoruz. Raporlarımızda tıklama oranlarının ötesinde, asıl odaklandığımız dönüşüm maliyetleri (CPA), sepet tutarları ve net harcama getirisi (ROAS) metriklerini paylaşıyoruz."
            },
            {
              question: "CAPI ve Piksel kurulumunu siz yapıyor musunuz?",
              answer: "Evet. Reklam hesap kurulum sürecinde, dönüşüm verilerinin eksiksiz takibi için Meta Conversions API (CAPI) ve server-side piksel entegrasyonlarını teknik ekibimiz gerçekleştirmektedir."
            },
            {
              question: "Reklam kreatiflerini kim hazırlıyor?",
              answer: "Reklam kreatifleri (görseller, Reels kurguları, reklam metinleri) tamamen kendi kreatif ve prodüksiyon ekibimiz tarafından, dönüşüm psikolojisine ve performans testlerine uygun olarak üretilir."
            }
          ]} />
        </div>
      </section>

      {/* Final CTA & Analysis Form */}
      <section className="section-padding" id="funnel" style={{ background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>Büyümeye <span className="gradient-text">Hazır Mısınız?</span></h2>
            <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
              Markanızın reklam performansını bir üst seviyeye taşıyalım. Ücretsiz analiz ve toplantı için hemen randevunuzu oluşturun.
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

export default MetaAds;
