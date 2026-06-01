import React from 'react';
import { Users, Video, TrendingUp, ArrowRight, CheckCircle2, Heart, Sparkles, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazySection from '../../components/LazySection';
const AnalysisForm = React.lazy(() => import('../../components/AnalysisForm'));
import FAQAccordion from '../../components/FAQAccordion';

function UGCInfluencer() {
  const navigate = useNavigate();

  return (
    <div className="service-detail-page" style={{ background: '#050505', color: '#fff' }}>
      {/* Hero Section */}
      <section className="hero" style={{ paddingTop: '320px', paddingBottom: '80px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>

            <h1 className="hero-title" style={{ fontSize: '3.5rem', lineHeight: '1.25', marginBottom: '30px' }}>
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

      {/* Narrative Section */}
      <section className="section-padding">
        <div className="container">
          <div className="service-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <div className="service-text-content">
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px' }}>Tüketiciler Markalara Değil, <span className="gradient-text">İnsanlara Güvenir.</span></h2>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '20px' }}>
                Günümüzde reklam körlüğü en yüksek seviyede. İnsanlar, kusursuz stüdyo çekimlerinden ziyade, kendi gibi bir kullanıcının (UGC) ürün deneyimini izlemeyi tercih ediyor.
              </p>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Biz, markanızın hedef kitlesiyle birebir aynı profildeki içerik üreticilerini ve mikro/makro influencer'ları buluyoruz. Ürününüzü en doğal haliyle senaryolaştırıp, reklam maliyetlerinizi düşüren yüksek performanslı kreatifler teslim ediyoruz.
              </p>
            </div>
            <div className="feature-list-card" style={{ padding: '30px', borderRadius: '32px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} />
                     <span style={{ fontSize: '1.05rem' }}>İçerik Üreticisi / Influencer Eşleştirme</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} />
                     <span style={{ fontSize: '1.05rem' }}>Doğal & Etkileşim Odaklı Senaryolar</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} />
                     <span style={{ fontSize: '1.05rem' }}>Ürün ve Kutu Açılışı (Unboxing)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} />
                     <span style={{ fontSize: '1.05rem' }}>Reklam Performansı Yüksek Formatlar</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={20} />
                     <span style={{ fontSize: '1.05rem' }}>Telif ve Kullanım Hakları Yönetimi</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Hizmet <span className="gradient-text">Alanlarımız</span></h2>
          <div className="services-grid" style={{ marginTop: '60px' }}>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Video size={35} color="var(--primary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px' }}>UGC İçerik Üretimi</h3>
               <p style={{ color: '#888', fontSize: '0.95rem' }}>Sosyal medya reklamlarınız (Meta, Google vb.) için özel olarak çekilmiş, yüksek dönüşüm getiren doğal görünümlü videolar.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Users size={35} color="var(--secondary)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px' }}>Mikro Influencer</h3>
               <p style={{ color: '#888', fontSize: '0.95rem' }}>Takipçi sayısı az ama etkileşim oranı çok yüksek olan içerik üreticileri ile niş kitlelere nokta atışı pazarlama.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Sparkles size={35} color="#00e5ff" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px' }}>Makro Influencer</h3>
               <p style={{ color: '#888', fontSize: '0.95rem' }}>Büyük kitlelere hitap eden tanınmış yüzler ile marka bilinirliğini (Brand Awareness) maksimize etme.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
               <Heart size={35} color="var(--accent)" style={{ marginBottom: '20px' }} />
               <h3 style={{ marginBottom: '15px' }}>Marka Elçiliği Programları</h3>
               <p style={{ color: '#888', fontSize: '0.95rem' }}>Markanızı düzenli olarak savunan ve seven içerik üreticileri ile uzun vadeli sadakat programları.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding" style={{ background: '#000' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Sıkça Sorulan <span className="gradient-text">Sorular</span></h2>
          <FAQAccordion items={[
            {
              question: "UGC ile Influencer Marketing arasındaki fark nedir?",
              answer: "UGC, kullanıcının kendi hesabında paylaşma zorunluluğu olmayan, sadece reklamlarınızda kullanmanız için üretilen içeriktir. Influencer Marketing ise içeriğin influencer'ın kendi kitlesine gösterilmesi amacı taşır."
            },
            {
              question: "İçerik üreticilerini siz mi buluyorsunuz?",
              answer: "Evet. Kendi bünyemizde yüzlerce onaylanmış içerik üreticisi bulunuyor. Ürününüzü inceleyip, demografisine ve tarzına en uygun kişileri seçiyoruz."
            },
            {
              question: "Ürünleri nasıl gönderiyoruz?",
              answer: "Ajans merkezimize ürünleri ulaştırdığınızda, biz içerik üreticilerine dağıtımını yapıyor ve süreç bitiminde dilerseniz ürünleri size geri gönderiyoruz."
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
