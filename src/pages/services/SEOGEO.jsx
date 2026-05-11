import React from 'react';
import { Globe, Search, Zap, ArrowRight, Brain, Cpu, Layout, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function SEOGEO() {
  const navigate = useNavigate();

  return (
    <div className="service-detail-page" style={{ background: '#050505', color: '#fff' }}>
      {/* Hero Section */}
      <section className="hero" style={{ paddingTop: '150px', paddingBottom: '80px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <div className="campaign-badge" style={{ marginBottom: '20px' }}>GELECEĞİN ARAMA SİSTEMLERİ</div>
            <h1 className="hero-title" style={{ fontSize: '3.5rem', lineHeight: '1.1' }}>
              SEO & GEO ile <span className="gradient-text">Yapay Zeka Çağında</span> Görünür Olun
            </h1>
            <p className="hero-desc" style={{ fontSize: '1.2rem', marginTop: '30px' }}>
              Sadece Google'da değil; ChatGPT, Perplexity ve Gemini gibi yapay zeka motorlarında da markanızın otoritesini inşa ediyoruz. SEO'nun gücünü GEO'nun geleceğiyle birleştiriyoruz.
            </p>
            <div className="hero-actions" style={{ marginTop: '40px' }}>
              <button className="btn btn-primary" onClick={() => window.scrollTo({ top: document.getElementById('funnel')?.offsetTop - 100, behavior: 'smooth' })}>
                Görünürlük Analizi Al
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Section: SEO vs GEO */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px' }}>GEO: <span className="gradient-text">Yeni Nesil Görünürlük</span></h2>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '20px' }}>
                Geleneksel SEO (Search Engine Optimization) artık tek başına yeterli değil. Artık kullanıcılar sadece Google'da "en iyi ajans" aramıyor; ChatGPT'ye "İstanbul'daki en iyi büyüme odaklı dijital pazarlama ajansı hangisi?" diye soruyor.
              </p>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem' }}>
                <strong>GEO (Generative Engine Optimization)</strong>, markanızın yapay zeka tarafından üretilen yanıtlarda (SGE) yer almasını sağlar. Biz, markanızı hem arama motorları hem de yapay zeka asistanları için optimize ediyoruz.
              </p>
            </div>
            <div className="glass" style={{ padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: 'rgba(0,229,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,229,255,0.1)' }}>
                     <h4 style={{ color: '#00e5ff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}><Search size={20} /> Geleneksel SEO</h4>
                     <p style={{ fontSize: '0.9rem', color: '#888' }}>Anahtar kelime odaklı, meta tag ve backlink stratejileri ile Google sıralama odaklı çalışma.</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Zap size={24} color="var(--primary)" />
                  </div>
                  <div style={{ background: 'rgba(138,43,226,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(138,43,226,0.1)' }}>
                     <h4 style={{ color: 'var(--primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}><Brain size={20} /> Modern GEO</h4>
                     <p style={{ fontSize: '0.9rem', color: '#888' }}>Otorite inşası, yapılandırılmış veri (schema) ve AI modelleme stratejileri ile yapay zeka asistanları odaklı çalışma.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services Grid */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Stratejik <span className="gradient-text">Görünürlük Hizmetleri</span></h2>
          <div className="services-grid" style={{ marginTop: '60px' }}>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
              <Layout size={35} color="var(--primary)" style={{ marginBottom: '20px' }} />
              <h3 style={{ marginBottom: '15px' }}>Teknik SEO Denetimi</h3>
              <p style={{ color: '#888', fontSize: '0.95rem' }}>Sitenizin hız, mobil uyum ve indeksleme sorunlarını gidererek sağlam bir temel kuruyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
              <Share2 size={35} color="var(--secondary)" style={{ marginBottom: '20px' }} />
              <h3 style={{ marginBottom: '15px' }}>Otorite & Backlink</h3>
              <p style={{ color: '#888', fontSize: '0.95rem' }}>Yüksek kaliteli ve sektörel sitelerden alınan referanslarla alan adı otoritenizi yükseltiyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
              <Cpu size={35} color="#00e5ff" style={{ marginBottom: '20px' }} />
              <h3 style={{ marginBottom: '15px' }}>AI Schema & Metadata</h3>
              <p style={{ color: '#888', fontSize: '0.95rem' }}>Yapay zeka sistemlerinin sitenizi en iyi şekilde anlaması için özel schema yapıları kuruyoruz.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
              <Brain size={35} color="var(--accent)" style={{ marginBottom: '20px' }} />
              <h3 style={{ marginBottom: '15px' }}>Semantik İçerik</h3>
              <p style={{ color: '#888', fontSize: '0.95rem' }}>Arama niyetini (search intent) karşılayan, derinlikli ve AI dostu içerik stratejileri.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Dive Section */}
      <section className="section-padding">
        <div className="container" style={{ maxWidth: '900px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '40px', textAlign: 'center' }}>Neden <span className="gradient-text">GEO?</span></h2>
          <div style={{ color: '#aaa', lineHeight: '2' }}>
            <p style={{ marginBottom: '20px' }}>
              Artık internet kullanıcıları sadece sonuçları "listelemek" istemiyor; doğrudan bir "yanıt" almak istiyor. Google Search Generative Experience (SGE) ve yapay zeka asistanları, kullanıcının bu ihtiyacını karşılıyor. Eğer markanız bu sistemlerin veri tabanında güçlü bir otorite olarak kodlanmamışsa, gelecekte trafiğinizin büyük bir kısmını kaybedebilirsiniz.
            </p>
            <p style={{ marginBottom: '20px' }}>
              Biz, <strong>SocialArt Ajans</strong> olarak, markanızı sadece anahtar kelimelere boğmuyoruz. Onu bir bilgi kaynağı haline getiriyoruz. Schema Organization, FAQ ve Service yapıları ile teknik tarafta; derinlikli makaleler ve otorite sinyalleri ile stratejik tarafta markanızı geleceğe hazırlıyoruz.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding" style={{ background: '#000' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Sıkça Sorulan <span className="gradient-text">Sorular</span></h2>
            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>SEO sonuçlarını ne zaman görürüm?</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>SEO uzun vadeli bir yatırımdır. Teknik düzeltmeler hemen etkisini gösterse de, rekabetçi kelimelerde kalıcı sonuçlar genellikle 4-8 ay arasında alınmaya başlanır.</p>
              </div>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>GEO çalışması SEO'yu etkiler mi?</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>Evet, olumlu etkiler. GEO için yaptığımız otorite ve schema çalışmaları, Google'ın sitenizi daha iyi anlamasını sağladığı için geleneksel SEO puanınızı da artırır.</p>
              </div>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Schema Markup nedir?</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>Schema Markup, web sitenizin koduna eklenen ve arama motorlarına içeriğinizin ne hakkında olduğunu (örneğin bir hizmet, SSS veya organizasyon olduğunu) anlatan bir mikro veri türüdür.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding" style={{ textAlign: 'center' }}>
        <div className="container">
          <div className="glass" style={{ padding: '80px 40px', borderRadius: '48px', border: '1px solid #00e5ff', background: 'linear-gradient(135deg, rgba(0,229,255,0.1) 0%, transparent 100%)' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>Geleceği <span className="gradient-text">Bugünden Yakalayın</span></h2>
            <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              Markanızı arama motorlarının ve yapay zeka sistemlerinin favorisi haline getirelim.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/#funnel')}>
              SEO & GEO Analizi İste <ArrowRight size={20} style={{ marginLeft: '10px' }} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SEOGEO;
