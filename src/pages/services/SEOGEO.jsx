import React from 'react';
import { Globe, Search, Zap, ArrowRight, Brain, Cpu, Layout, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazySection from '../../components/LazySection';
const AnalysisForm = React.lazy(() => import('../../components/AnalysisForm'));
import FAQAccordion from '../../components/FAQAccordion';

function SEOGEO() {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "SEO & GEO Optimizasyonu İstanbul | SocialArt Medya";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Google'da üst sıralara çıkın ve ChatGPT, Gemini, Perplexity gibi yapay zeka arama motorlarında markanızın alıntılanmasını ve önerilmesini sağlayın.");
    }
  }, []);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "SEO ve GEO Optimizasyonu",
    "provider": {
      "@type": "Organization",
      "name": "SocialArt Medya",
      "url": "https://www.socialartmedya.com"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "İstanbul"
    },
    "description": "İstanbul merkezli SEO ve GEO (Generative Engine Optimization) optimizasyonu hizmeti. Google sıralama, ChatGPT, Gemini, Perplexity ve yapay zeka arama motorları görünürlüğü.",
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
        "name": "SEO sonuçlarını ne zaman görmeye başlarım?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SEO uzun vadeli ve kalıcı bir yatırımdır. Teknik düzeltmeler ilk haftalarda etkisini göstermeye başlasa da, rekabetçi anahtar kelimelerde kalıcı ve sürdürülebilir yükselişler genellikle 4 ila 8 ay arasında elde edilir."
        }
      },
      {
        "@type": "Question",
        "name": "GEO çalışması geleneksel SEO'yu nasıl etkiler?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Son derece olumlu etkiler. GEO için yaptığımız semantik içerik derinleştirmesi, teknik altyapı güçlendirmesi ve yapılandırılmış şema verileri (JSON-LD), Google algoritmalarının da sitenizi daha net anlamasını sağladığı için genel SEO performansınızı ve sıralamalarınızı artırır."
        }
      },
      {
        "@type": "Question",
        "name": "Schema Markup (Şema Yapısı) nedir ve neden gereklidir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Schema Markup, web sitenizin HTML kodlarına eklenen ve arama motorları ile yapay zeka tarayıcılarına içeriğinizin ne anlama geldiğini (örneğin bir organizasyon, sıkça sorulan soru, hizmet veya blog yazısı olduğunu) doğrudan anlatan yapılandırılmış mikro veri standartlarıdır."
        }
      },
      {
        "@type": "Question",
        "name": "llms.txt dosyası nedir ve ne işe yarar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "llms.txt, web sitenizin kök dizinine yerleştirilen ve yapay zeka modellerinin (LLM) sitenizi tararken en net, en özet ve en doğru bilgileri çekebilmesi için özel olarak hazırlanan makine dostu bir markdown dosyasıdır."
        }
      },
      {
        "@type": "Question",
        "name": "GEO için hangi yapay zeka motorlarını hedefliyorsunuz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Öncelikli olarak ChatGPT Search, Google Gemini (ve SGE), Perplexity AI, Claude ve Microsoft Copilot gibi internet taraması yapan ve kullanıcılara doğrudan sentezlenmiş yanıtlar üreten tüm popüler yapay zeka arama motorlarını hedefliyoruz."
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
            <span style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#00e5ff', background: 'rgba(0, 229, 255, 0.08)', padding: '8px 20px', borderRadius: '50px', border: '1px solid rgba(0, 229, 255, 0.15)' }}>Yeni Nesil Arama</span>
            <h1 className="hero-title" style={{ fontSize: '3.5rem', lineHeight: '1.25', marginBottom: '30px', marginTop: '15px' }}>
              SEO & GEO ile <span className="gradient-text">Yapay Zeka Çağında</span> Görünür Olun
            </h1>
            <p className="hero-desc" style={{ fontSize: '1.2rem', marginTop: '30px' }}>
              Sadece Google'da değil; ChatGPT, Perplexity ve Gemini gibi yapay zeka motorlarında da markanızın otoritesini inşa ediyoruz. SEO'nun gücünü GEO'nun geleceğiyle birleştiriyoruz.
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
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '24px' }}>SEO & GEO Optimizasyonu <span className="gradient-text">Nedir?</span></h2>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '20px' }}>
                SEO (Arama Motoru Optimizasyonu) ve GEO (Generative Engine Optimization - Yapay Zeka Arama Optimizasyonu); markanızın hem geleneksel arama motorlarında hem de yapay zeka asistanlarında üst sıralarda listelenmesini, alıntılanmasını ve tavsiye edilmesini sağlayan dijital görünürlük ve itibar yönetimi hizmetidir.
              </p>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Günümüzde kullanıcılar artık sadece arama sonuçlarındaki linkleri tıklamıyor, yapay zekaya doğrudan sorular soruyor. <strong>GEO (Generative Engine Optimization)</strong>, markanızın yapay zeka modelleri tarafından bir "bilgi kaynağı" ve "güvenilir referans" olarak algılanmasını hedefler. SocialArt olarak sitenizi hem Google algoritmalarına hem de ChatGPT, Gemini, Perplexity gibi yapay zeka asistanlarına en iyi şekilde tanıtıyoruz.
              </p>
            </div>

            {/* 2. Kimler İçin Uygundur? */}
            <div className="feature-list-card" style={{ padding: '40px', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '25px', color: '#fff' }}>Kimler İçin Uygundur?</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="#00e5ff" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Google Aramalarından Düzenli ve Ücretsiz Trafik Almak İsteyenler</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="#00e5ff" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>ChatGPT ve Gemini Aramalarında Önerilen Marka Olmayı Hedefleyenler</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="#00e5ff" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Sektöründe Otorite ve Bilgi Kaynağı Konumuna Gelmek İsteyenler</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="#00e5ff" size={20} style={{ flexShrink: 0 }} />
                     <span style={{ fontSize: '1.05rem', color: '#ccc' }}>Site Teknik Altyapısını ve Hızını (Core Web Vitals) Yükseltmek İsteyenler</span>
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
            <p style={{ color: '#aaa', fontSize: '1.1rem', marginTop: '10px' }}>Sitenizi geleneksel ve yapay zeka arama motorları için optimize eden entegre çözümlerimiz.</p>
          </div>
          <div className="services-grid">
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Layout size={35} color="var(--primary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Teknik SEO Denetimi (Audit)</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Sitenizin hızını, mobil uyumluluğunu, indekslenme hatalarını ve site haritası yapılarını baştan sona analiz edip düzeltiyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Share2 size={35} color="var(--secondary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Otorite Sinyalleri & PR</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Güvenilir ve sektörel dış kaynaklardan sitenize linkler (backlink) kazandırarak alan adı otoritenizi (DA) yükseltiyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Cpu size={35} color="#00e5ff" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>JSON-LD & AI Metadata</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Yapay zeka modellerinin sitenizi en hızlı şekilde anlamlandırabilmesi için zengin Schema şablonları ve llms.txt altyapısı kuruyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Brain size={35} color="var(--accent)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Semantik İçerik Mimarisi</h3>
               <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>Kullanıcıların arama niyetini (search intent) tam olarak karşılayan, "Answer-First" yapısına sahip bilgi odaklı içerikler geliştiriyoruz.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Süreç Nasıl İşler? */}
      <section className="section-padding" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>SEO & GEO <span className="gradient-text">Yol Haritamız</span></h2>
            <p style={{ color: '#aaa', fontSize: '1.1rem', marginTop: '10px' }}>Planlı, şeffaf ve ölçülebilir aşamalardan oluşan optimizasyon sürecimiz.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
             {[
               { step: '01', title: 'Altyapı Denetimi', desc: 'Sitenizin arama motoru görünürlüğünü engelleyen tüm teknik sorunları ve Core Web Vitals verilerini analiz ederiz.' },
               { step: '02', title: 'Kelime & Soru Analizi', desc: 'Google ve yapay zeka aramalarında en çok sorulan sektörel soru ve terimleri listeleriz.' },
               { step: '03', title: 'Mikro Veri (Schema) Kurulumu', desc: 'Sitenize FAQ, Service ve Organization JSON-LD şemalarını ekleyerek tarayıcılara kod düzeyinde netlik sağlarız.' },
               { step: '04', title: 'Semantik İçerik Üretimi', desc: 'Rehber niteliğindeki makaleleri GEO kurallarına (veri tabloları, maddeler, cevap-önce) uygun yazar ve yayınlarız.' },
               { step: '05', title: 'Otorite & PR Desteği', desc: 'Dış otorite sinyallerini ve marka bilinirliğini desteklemek amacıyla sektörel referans linklemeler kurarız.' }
             ].map((item, i) => (
                <div key={i} className="glass" style={{ padding: '30px', borderRadius: '20px', position: 'relative' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#00e5ff', opacity: '0.15', position: 'absolute', top: '15px', right: '20px' }}>{item.step}</span>
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
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px', textAlign: 'center' }}>Hedeflediğimiz <span className="gradient-text">Görünürlük Sonuçları</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px', marginTop: '40px' }}>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: '#00e5ff', marginBottom: '10px', fontWeight: '800' }}>Yapay Zeka Aramalarında Önerilmek</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>ChatGPT Search, Gemini ve Perplexity gibi platformların kullanıcı sorgularında markanızı güvenilir bir kaynak olarak önermesini sağlıyoruz.</p>
             </div>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '10px', fontWeight: '800' }}>Geleneksel Google Trafik Artışı</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Önemli ticari kelimelerde Google'da ilk sayfada yer alarak web sitenize organik ve sürekli ziyaretçi akışı kazandırıyoruz.</p>
             </div>
             <div className="glass" style={{ padding: '30px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--secondary)', marginBottom: '10px', fontWeight: '800' }}>Core Web Vitals Skoru Yükselişi</h4>
                <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>Sitenin yüklenme hızını ve mobil performansını optimize ederek kullanıcı deneyimi sinyallerini mükemmelleştiriyoruz.</p>
             </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="section-padding" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Arama Optimizasyonu Hakkında <span className="gradient-text">Sık Sorulanlar</span></h2>
          <FAQAccordion items={[
            {
              question: "SEO sonuçlarını ne zaman görmeye başlarım?",
              answer: "SEO uzun vadeli ve kalıcı bir yatırımdır. Teknik düzeltmeler ilk haftalarda etkisini göstermeye başlasa da, rekabetçi anahtar kelimelerde kalıcı ve sürdürülebilir yükselişler genellikle 4 ila 8 ay arasında elde edilir."
            },
            {
              question: "GEO çalışması geleneksel SEO'yu nasıl etkiler?",
              answer: "Son derece olumlu etkiler. GEO için yaptığımız semantik içerik derinleştirmesi, teknik altyapı güçlendirmesi ve yapılandırılmış şema verileri (JSON-LD), Google algoritmalarının da sitenizi daha net anlamasını sağladığı için genel SEO performansınızı ve sıralamalarınızı artırır."
            },
            {
              question: "Schema Markup (Şema Yapısı) nedir ve neden gereklidir?",
              answer: "Schema Markup, web sitenizin HTML kodlarına eklenen ve arama motorları ile yapay zeka tarayıcılarına içeriğinizin ne anlama geldiğini (örneğin bir organizasyon, sıkça sorulan soru, hizmet veya blog yazısı olduğunu) doğrudan anlatan yapılandırılmış mikro veri standartlarıdır."
            },
            {
              question: "llms.txt dosyası nedir ve ne işe yarar?",
              answer: "llms.txt, web sitenizin kök dizinine yerleştirilen ve yapay zeka modellerinin (LLM) sitenizi tararken en net, en özet ve en doğru bilgileri çekebilmesi için özel olarak hazırlanan makine dostu bir markdown dosyasıdır."
            },
            {
              question: "GEO için hangi yapay zeka motorlarını hedefliyorsunuz?",
              answer: "Öncelikli olarak ChatGPT Search, Google Gemini (ve SGE), Perplexity AI, Claude ve Microsoft Copilot gibi internet taraması yapan ve kullanıcılara doğrudan sentezlenmiş yanıtlar üreten tüm popüler yapay zeka arama motorlarını hedefliyoruz."
            }
          ]} />
        </div>
      </section>

      {/* Final CTA & Analysis Form */}
      <section className="section-padding" id="funnel" style={{ background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>Geleceğe <span className="gradient-text">Hazır Mısınız?</span></h2>
            <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
              Yapay zeka çağında markanızın görünürlüğünü garantiye alalım. Ücretsiz teknik analiz için randevunuzu oluşturun.
            </p>
          </div>
          
          <LazySection height="350px">
            <React.Suspense fallback={
              <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            }>
              <AnalysisForm defaultService="SEO & GEO Hizmeti" />
            </React.Suspense>
          </LazySection>
        </div>
      </section>
    </div>
  );
}

export default SEOGEO;
