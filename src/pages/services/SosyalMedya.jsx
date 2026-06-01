import React from 'react';
import { Share2, Users, MessageSquare, ArrowRight, CheckCircle2, TrendingUp, Sparkles, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazySection from '../../components/LazySection';
const AnalysisForm = React.lazy(() => import('../../components/AnalysisForm'));
import FAQAccordion from '../../components/FAQAccordion';

function SosyalMedya() {
  const navigate = useNavigate();

  return (
    <div className="service-detail-page" style={{ background: '#050505', color: '#fff' }}>
      {/* Hero Section */}
      <section className="hero" style={{ paddingTop: '320px', paddingBottom: '80px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>

            <h1 className="hero-title" style={{ fontSize: '3.5rem', lineHeight: '1.25', marginBottom: '30px' }}>
              Stratejik <span className="gradient-text">Sosyal Medya</span> Yönetimi
            </h1>
            <p className="hero-desc" style={{ fontSize: '1.2rem', marginTop: '30px' }}>
              Sadece paylaşım yapmıyoruz; markanız için yaşayan, büyüyen ve etkileşim kuran dijital topluluklar inşa ediyoruz. Veri odaklı içerik stratejileriyle görünürlüğünüzü katlıyoruz.
            </p>
            <div className="hero-actions" style={{ marginTop: '40px' }}>
              <button className="btn btn-primary" onClick={() => window.scrollTo({ top: document.getElementById('funnel')?.offsetTop - 100, behavior: 'smooth' })}>
                Ekibimizle Toplantı Planlayın
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="section-padding">
        <div className="container">
          <div className="service-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <div className="service-text-content">
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px' }}>Sıradan Yönetim Değil, <span className="gradient-text">Growth Odaklı Yaklaşım.</span></h2>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '20px' }}>
                Sosyal medya yönetimi artık sadece "estetik bir grid" dizmekten çok daha fazlasıdır. Algoritmaların sürekli değiştiği bu dönemde, asıl mesele kullanıcıyı yakalamak ve markaya olan bağı güçlendirmektir.
              </p>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Biz, markanızın hedef kitlesini derinlemesine analiz ederek, onların ilgi alanlarına ve tüketim alışkanlıklarına uygun içerik türleri (Reels, Carousel, Static) geliştiriyoruz. <strong>Sosyal Medya Yönetimi</strong> süreçlerimizi reklam stratejilerimizle birleştirerek organik ve ücretli büyüme arasında köprü kuruyoruz.
              </p>
            </div>
            <div className="feature-list-card" style={{ padding: '30px', borderRadius: '32px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} />
                     <span style={{ fontSize: '1.05rem' }}>Aylık İçerik Takvimi & Planlama</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} />
                     <span style={{ fontSize: '1.05rem' }}>Stratejik Hashtag & Trend Analizi</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} />
                     <span style={{ fontSize: '1.05rem' }}>Topluluk Yönetimi & Moderasyon</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} />
                     <span style={{ fontSize: '1.05rem' }}>Detaylı Performans Raporlaması</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} />
                     <span style={{ fontSize: '1.05rem' }}>Rakip Analizi & Benchmark</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Başarı <span className="gradient-text">Sütunlarımız</span></h2>
          <div className="services-grid" style={{ marginTop: '60px' }}>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Sparkles size={35} color="var(--primary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px' }}>Trend Odaklı İçerik</h3>
               <p style={{ color: '#888', fontSize: '0.95rem' }}>Viral olma potansiyeli yüksek, platform dinamiklerine uygun yenilikçi içerik konseptleri.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Smartphone size={35} color="var(--secondary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px' }}>Mobile-First Yaklaşım</h3>
               <p style={{ color: '#888', fontSize: '0.95rem' }}>Tamamen mobil tüketim alışkanlıklarına göre optimize edilmiş görsel ve video prodüksiyonlar.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Users size={35} color="#00e5ff" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px' }}>Influencer İş Birlikleri</h3>
               <p style={{ color: '#888', fontSize: '0.95rem' }}>Markanızla uyumlu içerik üreticileri ile stratejik ve yüksek etkileşimli kampanyalar.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <MessageSquare size={35} color="var(--accent)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px' }}>Kriz & Topluluk Yönetimi</h3>
               <p style={{ color: '#888', fontSize: '0.95rem' }}>Takipçilerinizle kurulan sağlıklı iletişim ve olası kriz durumlarının profesyonel yönetimi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Strategy Section */}
      <section className="section-padding">
        <div className="container" style={{ maxWidth: '900px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '40px', textAlign: 'center' }}>Neden <span className="gradient-text">SocialArt?</span></h2>
          <p style={{ color: '#aaa', lineHeight: '1.9', marginBottom: '20px' }}>
             Biz bir sosyal medya ajansından fazlasıyız. Bir <strong>growth sistemiyiz.</strong> Sadece paylaşım yapıp bırakmıyoruz; her içeriğin arkasındaki veriyi okuyor ve bir sonraki adımı buna göre planlıyoruz. İstanbul'da kurduğumuz kreatif ekibimizle markanızın her zaman güncel, konuşulan ve tercih edilen bir konumda kalmasını sağlıyoruz.
          </p>
          <p style={{ color: '#aaa', lineHeight: '1.9' }}>
             Veri, dönüşüm psikolojisi ve yaratıcılığı birleştirerek sosyal medya hesaplarınızı sadece birer vitrin olmaktan çıkarıp aktif birer satış kanalına dönüştürüyoruz. Reels videolarımızla keşfete düşerken, reklam stratejilerimizle bu ilgiyi doğrudan satışa yönlendiriyoruz.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding" style={{ background: '#000' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Sıkça Sorulan <span className="gradient-text">Sorular</span></h2>
          <FAQAccordion items={[
            {
              question: "Hangi platformlar için hizmet veriyorsunuz?",
              answer: "Başta Instagram, LinkedIn, YouTube ve Facebook olmak üzere markanızın hedef kitlesinin bulunduğu tüm dijital platformlarda aktif yönetim yapıyoruz."
            },
            {
              question: "Çekimleri siz mi yapıyorsunuz?",
              answer: "Evet, bünyemizdeki kreatif ekibimiz ve kendi stüdyomuzla tüm video ve fotoğraf prodüksiyon süreçlerini profesyonel olarak yönetiyoruz."
            },
            {
              question: "Aylık kaç içerik paylaşıyorsunuz?",
              answer: "Bu tamamen seçtiğiniz pakete ve markanızın ihtiyacına göre değişir. Ancak genellikle haftalık 2-4 arası içerik ve günlük hikaye paylaşımları içeren bir planlama yapıyoruz."
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
