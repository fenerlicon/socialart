import React from 'react';
import { Users, Video, TrendingUp, ArrowRight, CheckCircle2, Heart, Sparkles, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function UGCInfluencer() {
  const navigate = useNavigate();

  return (
    <div className="service-detail-page" style={{ background: '#050505', color: '#fff' }}>
      {/* Hero Section */}
      <section className="hero" style={{ paddingTop: '150px', paddingBottom: '80px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>

            <h1 className="hero-title" style={{ fontSize: '3.5rem', lineHeight: '1.1' }}>
              UGC & Influencer ile <span className="gradient-text">Samimi ve Güvenilir</span> Etkileşim
            </h1>
            <p className="hero-desc" style={{ fontSize: '1.2rem', marginTop: '30px' }}>
              Klasik reklamlara son. Gerçek kullanıcı deneyimleriyle hedef kitlenize güven verin ve dönüşümlerinizi katlayın. Markanıza en uygun içerik üreticileri ile stratejik iş birlikleri kuruyoruz.
            </p>
            <div className="hero-actions" style={{ marginTop: '40px' }}>
              <button className="btn btn-primary" onClick={() => window.scrollTo({ top: document.getElementById('funnel')?.offsetTop - 100, behavior: 'smooth' })}>
                UGC & Influencer Teklifi Al
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px' }}>Tüketiciler Markalara Değil, <span className="gradient-text">İnsanlara Güvenir.</span></h2>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '20px' }}>
                Günümüzde reklam körlüğü en yüksek seviyede. İnsanlar, kusursuz stüdyo çekimlerinden ziyade, kendi gibi bir kullanıcının (UGC) ürün deneyimini izlemeyi tercih ediyor.
              </p>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Biz, markanızın hedef kitlesiyle birebir aynı profildeki içerik üreticilerini ve mikro/makro influencer'ları buluyoruz. Ürününüzü en doğal haliyle senaryolaştırıp, reklam maliyetlerinizi düşüren yüksek performanslı kreatifler teslim ediyoruz.
              </p>
            </div>
            <div className="glass" style={{ padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={24} />
                     <span style={{ fontSize: '1.1rem' }}>İçerik Üreticisi / Influencer Eşleştirme</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={24} />
                     <span style={{ fontSize: '1.1rem' }}>Doğal & Etkileşim Odaklı Senaryolar</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={24} />
                     <span style={{ fontSize: '1.1rem' }}>Ürün ve Kutu Açılışı (Unboxing)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={24} />
                     <span style={{ fontSize: '1.1rem' }}>Reklam Performansı Yüksek Formatlar</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={24} />
                     <span style={{ fontSize: '1.1rem' }}>Telif ve Kullanım Hakları Yönetimi</span>
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
               <p style={{ color: '#888', fontSize: '0.95rem' }}>Sosyal medya reklamlarınız (Meta, TikTok) için özel olarak çekilmiş, yüksek dönüşüm getiren doğal görünümlü videolar.</p>
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
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Sıkça Sorulan <span className="gradient-text">Sorular</span></h2>
            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>UGC ile Influencer Marketing arasındaki fark nedir?</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>UGC, kullanıcının kendi hesabında paylaşma zorunluluğu olmayan, sadece reklamlarınızda kullanmanız için üretilen içeriktir. Influencer Marketing ise içeriğin influencer'ın kendi kitlesine gösterilmesi amacı taşır.</p>
              </div>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>İçerik üreticilerini siz mi buluyorsunuz?</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>Evet. Kendi bünyemizde yüzlerce onaylanmış içerik üreticisi bulunuyor. Ürününüzü inceleyip, demografisine ve tarzına en uygun kişileri seçiyoruz.</p>
              </div>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Ürünleri nasıl gönderiyoruz?</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>Ajans merkezimize ürünleri ulaştırdığınızda, biz içerik üreticilerine dağıtımını yapıyor ve süreç bitiminde dilerseniz ürünleri size geri gönderiyoruz.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding" style={{ textAlign: 'center' }}>
        <div className="container">
          <div className="glass" style={{ padding: '80px 40px', borderRadius: '48px', border: '1px solid var(--primary)', background: 'linear-gradient(135deg, rgba(138,43,226,0.1) 0%, transparent 100%)' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>Satışlarınızı <span className="gradient-text">Doğallıkla Artırın</span></h2>
            <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              Markanızı tüketicilerin dilinden anlatan içerik stratejileri için hemen iletişime geçin.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/#funnel')}>
              Strateji Görüşmesi Planla <ArrowRight size={20} style={{ marginLeft: '10px' }} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default UGCInfluencer;
