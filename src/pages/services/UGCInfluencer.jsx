import React from 'react';
import { Users, Video, TrendingUp, ArrowRight, CheckCircle2, Heart, Sparkles, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazySection from '../../components/LazySection';
const AnalysisForm = React.lazy(() => import('../../components/AnalysisForm'));
import FAQAccordion from '../../components/FAQAccordion';

function UGCInfluencer() {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "UGC İçerik Üretimi & Influencer Pazarlaması | SocialArt Medya";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "İstanbul UGC ve influencer ajansı SocialArt Medya ile samimi, güven veren ve reklam maliyetlerini düşüren kullanıcı odaklı video içerikleri üretin.");
    }
  }, []);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "UGC ve Influencer Pazarlaması",
    "provider": {
      "@type": "Organization",
      "name": "SocialArt Medya",
      "url": "https://www.socialartmedya.com"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "İstanbul"
    },
    "description": "İstanbul merkezli UGC (User Generated Content) içerik üretimi ve influencer iş birlikleri yönetimi. Reklam performansını artıran doğal videolar.",
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
        "name": "UGC ile Influencer Marketing arasındaki fark nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "UGC (Kullanıcı Tarafından Üretilen İçerik), içerik üreticisinin kendi profilinde paylaşma zorunluluğu olmayan, markanızın kendi reklam hesaplarında yayınlaması için hazırlanan doğal videolardır. Influencer Marketing ise içeriğin influencer'ın kendi kitlesine erişmek amacıyla kendi hesabında paylaşılmasıdır."
        }
      },
      {
        "@type": "Question",
        "name": "İçerik üreticilerini siz mi buluyorsunuz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. SocialArt bünyesinde yer alan onaylı geniş içerik üretici (UGC Creator) ağımızdan, markanızın hedef kitle demografisine en uygun olan kişileri seçiyor ve briefleri yönetiyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "Ürünleri nasıl gönderiyoruz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ürünlerinizi İstanbul'daki ajans merkezimize kargo ile gönderiyorsunuz. Biz ürünlerin içerik üreticilerine dağıtımını, takibini ve çekim sonrasındaki lojistik süreçlerini bizzat yönetiyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "Telif ve reklam kullanım hakları kime aittir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Üretilen tüm UGC videolarının dijital reklam kanallarında kullanım hakları (genellikle sözleşme bazlı 30-90 gün veya sınırsız olarak) markanıza devredilir. Böylece videoları Meta, TikTok ve Google reklamlarınızda serbestçe kullanabilirsiniz."
        }
      },
      {
        "@type": "Question",
        "name": "Mikro influencer ile makro influencer arasındaki fark nedir ve hangisini seçmeliyiz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Mikro influencer'lar (10K-100K takipçi) genellikle daha niş ve bağlı bir kitleye sahiptir, bu da yüksek satış dönüşümü sağlar. Makro influencer'lar (100K+) ise daha geniş kitlelere hitap eder ve marka bilinirliğini yükseltir. Hedefinize ve bütçenize göre en doğru karmayı hazırlıyoruz."
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
          <div className="shape shape-1" style={{ background: 'radial-gradient(circle, rgba(255, 171, 0, 0.15) 0%, transparent 60%)' }}></div>
        </div>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#ffab00', background: 'rgba(255, 171, 0, 0.08)', padding: '8px 20px', borderRadius: '50px', border: '1px solid rgba(255, 171, 0, 0.15)' }}>Samimi Pazarlama</span>
            <h1 className="hero-title" style={{ fontSize: '3.5rem', lineHeight: '1.25', marginBottom: '30px', marginTop: '15px' }}>
              UGC & Influencer ile <span className="gradient-text">Samimi ve Güvenilir</span> Etkileşim
            </h1>
            <p className="hero-desc" style={{ fontSize: '1.2rem', marginTop: '30px' }}>
              Klasik reklamlara son. Gerçek kullanıcı deneyimleriyle hedef kitlenize güven verin ve dönüşümlerinizi katlayın. Markanıza en uygun içerik üreticileri ile stratejik iş birlikleri kuruyoruz.
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
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '24px' }}>UGC & Influencer Pazarlaması <span className="gradient-text">Nedir?</span></h2>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '20px' }}>
                UGC (User Generated Content - Kullanıcı Odaklı İçerik) ve influencer marketing; tüketicilerin satın alma kararlarını doğrudan etkileyen, samimi, organik ve güven veren insan-merkezli dijital pazarlama yöntemleridir.
              </p>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Günümüzde tüketiciler kusursuz ama samimiyetsiz marka reklamlarına karşı 'reklam körlüğü' geliştirmiştir. Bunun yerine kendi gibi olan gerçek bir kullanıcının deneyimlerine güvenirler. SocialArt olarak, markanızla uyumlu içerik üreticilerini bularak doğal, ikna gücü yüksek ve reklam setlerinizde en yüksek ROAS değerini yakalayacak video kurguları oluşturuyoruz.
              </p>
            </div>

            {/* 2. Kimler İçin Uygundur? */}
            <div className="feature-list-card" style={{ padding: '40px', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '25px', color: '#fff' }}>Kimler İçin Uygundur?</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="#ffab00" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Reklam Maliyetlerini (CPA) Düşürmek İsteyen Markalar</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="#ffab00" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Sosyal Kanıt (Social Proof) ve Güven Unsuru Oluşturmak İsteyenler</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="#ffab00" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>TikTok, Instagram ve Shorts Kanallarında Doğal Büyümek İsteyenler</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="#ffab00" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Influencer Bütçesini Doğru ve Ölçülebilir Yönetmek İsteyen Girişimler</span>
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
            <p style={{ color: '#aaa', fontSize: '1.1rem', marginTop: '10px' }}>Samimiyeti performansa dönüştüren entegre UGC ve Influencer çözümlerimiz.</p>
          </div>
          <div className="services-grid">
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Video size={35} color="var(--primary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>UGC İçerik Üretimi</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Sosyal medya reklamlarınız (Meta, TikTok, Google) için özel olarak kurgulanmış, gerçek kullanıcı deneyimini yansıtan doğal videolar üretiyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Users size={35} color="var(--secondary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Mikro Influencer İş Birlikleri</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Takipçi bağlılığı yüksek olan mikro influencer'lar (10K - 100K) ile markanızı nokta atışı hedef kitlelere tanıtıyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Sparkles size={35} color="#00e5ff" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Makro Influencer Kampanyaları</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Büyük kitlelere hitap eden, tanınmış isimler ile marka bilinirliğinizi (Brand Awareness) en üst seviyeye çıkartıyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Target size={35} color="#ffab00" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Uçtan Uca Kampanya Yönetimi</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Senaryo briefinden yazar seçimine, kargo takibinden telif ve reklam entegrasyonuna kadar tüm süreçleri bizzat yürütüyoruz.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Süreç Nasıl İşler? */}
      <section className="section-padding" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>İş Birliği <span className="gradient-text">Sürecimiz</span></h2>
            <p style={{ color: '#aaa', fontSize: '1.1rem', marginTop: '10px' }}>Güvenilir ve hızlı sonuç üreten operasyon modelimiz.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
             {[
               { step: '01', title: 'İçerik Üreticisi Seçimi', desc: 'Onaylı ağımızdan markanızın tarzına ve demografisine en uygun üreticileri listeleriz.' },
               { step: '02', title: 'Senaryo & Kanca Yazımı', desc: 'İzleyiciyi ilk saniyede yakalayacak kancalar içeren doğal video senaryoları hazırlarız.' },
               { step: '03', title: 'Lojistik & Gönderim', desc: 'Ürünlerinizi ajansımızdan içerik üreticilerine ulaştırır ve gönderi süreçlerini takip ederiz.' },
               { step: '04', title: 'Kontrol & Yayına Alım', desc: 'Gelen videoları kalite ve briefe uyumluluk açısından kontrol eder, onay sonrası teslim ederiz.' },
               { step: '05', title: 'Reklam Entegrasyonu', desc: 'Videoları Meta ve TikTok reklam setlerinde yayına alarak performanslarını raporlarız.' }
             ].map((item, i) => (
                <div key={i} className="glass" style={{ padding: '30px', borderRadius: '20px', position: 'relative' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ffab00', opacity: '0.15', position: 'absolute', top: '15px', right: '20px' }}>{item.step}</span>
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
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px', textAlign: 'center' }}>Hedeflediğimiz <span className="gradient-text">Somut Etkiler</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px', marginTop: '40px' }}>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: '#ffab00', marginBottom: '10px', fontWeight: '800' }}>Daha Düşük Reklam CPA Oranları</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Tüketicilere güven veren samimi içerikler sayesinde, reklam tıklama ve dönüşüm maliyetlerinizi (CPA) düşürüyoruz.</p>
             </div>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '10px', fontWeight: '800' }}>Güçlü Sosyal Kanıt</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Gerçek kişilerin markanızı tavsiye ettiğini gören potansiyel müşterilerin sepeti onaylama kararlarını hızlandırıyoruz.</p>
             </div>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--secondary)', marginBottom: '10px', fontWeight: '800' }}>Sürdürülebilir Kreatif Beslemesi</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Reklam hesaplarınızda sürekli ihtiyaç duyulan taze, doğal ve özgün video akışını kesintisiz olarak sağlıyoruz.</p>
             </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="section-padding" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>UGC & Influencer Hakkında <span className="gradient-text">Sık Sorulanlar</span></h2>
          <FAQAccordion items={[
            {
              question: "UGC ile Influencer Marketing arasındaki fark nedir?",
              answer: "UGC (Kullanıcı Tarafından Üretilen İçerik), içerik üreticisinin kendi profilinde paylaşma zorunluluğu olmayan, markanızın kendi reklam hesaplarında yayınlaması için hazırlanan doğal videolardır. Influencer Marketing ise içeriğin influencer'ın kendi kitlesine erişmek amacıyla kendi hesabında paylaşılmasıdır."
            },
            {
              question: "İçerik üreticilerini siz mi buluyorsunuz?",
              answer: "Evet. SocialArt bünyesinde yer alan onaylı geniş içerik üretici (UGC Creator) ağımızdan, markanızın hedef kitle demografisine en uygun olan kişileri seçiyor ve briefleri yönetiyoruz."
            },
            {
              question: "Ürünleri nasıl gönderiyoruz?",
              answer: "Ürünlerinizi İstanbul'daki ajans merkezimize kargo ile gönderiyorsunuz. Biz ürünlerin içerik üreticilerine dağıtımını, takibini ve çekim sonrasındaki lojistik süreçlerini bizzat yönetiyoruz."
            },
            {
              question: "Telif ve reklam kullanım hakları kime aittir?",
              answer: "Üretilen tüm UGC videolarının dijital reklam kanallarında kullanım hakları (genellikle sözleşme bazlı 30-90 gün veya sınırsız olarak) markanıza devredilir. Böylece videoları Meta, TikTok ve Google reklamlarınızda serbestçe kullanabilirsiniz."
            },
            {
              question: "Mikro influencer ile makro influencer arasındaki fark nedir?",
              answer: "Mikro influencer'lar (10K-100K takipçi) genellikle daha niş ve bağlı bir kitleye sahiptir, bu da yüksek satış dönüşümü sağlar. Makro influencer'lar (100K+) ise daha geniş kitlelere hitap eder ve marka bilinirliğini yükseltir."
            }
          ]} />
        </div>
      </section>

      {/* Final CTA & Analysis Form */}
      <section className="section-padding" id="funnel" style={{ background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>Güven <span className="gradient-text">İnşa Edelim</span></h2>
            <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
              Markanızın samimiyetini artıracak içerikleri birlikte planlayalım. Ücretsiz analiz için randevunuzu oluşturun.
            </p>
          </div>
          
          <LazySection height="350px">
            <React.Suspense fallback={
              <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            }>
              <AnalysisForm defaultService="UGC & Influencer" />
            </React.Suspense>
          </LazySection>
        </div>
      </section>
    </div>
  );
}

export default UGCInfluencer;
