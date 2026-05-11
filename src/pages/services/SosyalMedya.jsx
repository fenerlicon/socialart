import React from 'react';
import { Share2, Users, MessageSquare, ArrowRight, CheckCircle2, TrendingUp, Sparkles, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function SosyalMedya() {
  const navigate = useNavigate();

  return (
    <div className="service-detail-page" style={{ background: '#050505', color: '#fff' }}>
      {/* Hero Section */}
      <section className="hero" style={{ paddingTop: '150px', paddingBottom: '80px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <div className="campaign-badge" style={{ marginBottom: '20px' }}>TOPLULUK & ETKİLEŞİM</div>
            <h1 className="hero-title" style={{ fontSize: '3.5rem', lineHeight: '1.1' }}>
              Stratejik <span className="gradient-text">Sosyal Medya</span> Yönetimi
            </h1>
            <p className="hero-desc" style={{ fontSize: '1.2rem', marginTop: '30px' }}>
              Sadece paylaşım yapmıyoruz; markanız için yaşayan, büyüyen ve etkileşim kuran dijital topluluklar inşa ediyoruz. Veri odaklı içerik stratejileriyle görünürlüğünüzü katlıyoruz.
            </p>
            <div className="hero-actions" style={{ marginTop: '40px' }}>
              <button className="btn btn-primary" onClick={() => window.scrollTo({ top: document.getElementById('funnel')?.offsetTop - 100, behavior: 'smooth' })}>
                Sosyal Medya Teklifi Al
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
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px' }}>Sıradan Yönetim Değil, <span className="gradient-text">Growth Odaklı Yaklaşım.</span></h2>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '20px' }}>
                Sosyal medya yönetimi artık sadece "estetik bir grid" dizmekten çok daha fazlasıdır. Algoritmaların sürekli değiştiği bu dönemde, asıl mesele kullanıcıyı yakalamak ve markaya olan bağı güçlendirmektir.
              </p>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Biz, markanızın hedef kitlesini derinlemesine analiz ederek, onların ilgi alanlarına ve tüketim alışkanlıklarına uygun içerik türleri (Reels, Carousel, Static) geliştiriyoruz. <strong>Sosyal Medya Yönetimi</strong> süreçlerimizi reklam stratejilerimizle birleştirerek organik ve ücretli büyüme arasında köprü kuruyoruz.
              </p>
            </div>
            <div className="glass" style={{ padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={24} />
                     <span style={{ fontSize: '1.1rem' }}>Aylık İçerik Takvimi & Planlama</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={24} />
                     <span style={{ fontSize: '1.1rem' }}>Stratejik Hashtag & Trend Analizi</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={24} />
                     <span style={{ fontSize: '1.1rem' }}>Topluluk Yönetimi & Moderasyon</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={24} />
                     <span style={{ fontSize: '1.1rem' }}>Detaylı Performans Raporlaması</span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <CheckCircle2 color="var(--primary)" size={24} />
                     <span style={{ fontSize: '1.1rem' }}>Rakip Analizi & Benchmark</span>
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
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Sıkça Sorulan <span className="gradient-text">Sorular</span></h2>
            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Hangi platformlar için hizmet veriyorsunuz?</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>Başta Instagram, TikTok, LinkedIn, YouTube ve Facebook olmak üzere markanızın hedef kitlesinin bulunduğu tüm dijital platformlarda aktif yönetim yapıyoruz.</p>
              </div>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Çekimleri siz mi yapıyorsunuz?</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>Evet, bünyemizdeki kreatif ekibimiz ve kendi stüdyomuzla tüm video ve fotoğraf prodüksiyon süreçlerini profesyonel olarak yönetiyoruz.</p>
              </div>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Aylık kaç içerik paylaşıyorsunuz?</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>Bu tamamen seçtiğiniz pakete ve markanızın ihtiyacına göre değişir. Ancak genellikle haftalık 3-5 arası içerik ve günlük hikaye paylaşımları içeren bir planlama yapıyoruz.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding" style={{ textAlign: 'center' }}>
        <div className="container">
          <div className="glass" style={{ padding: '80px 40px', borderRadius: '48px', border: '1px solid var(--accent)', background: 'linear-gradient(135deg, rgba(0,229,255,0.1) 0%, transparent 100%)' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>Sosyal Medyada <span className="gradient-text">Fark Yaratın</span></h2>
            <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              Markanızın dijital sesini güçlendirmeye ve topluluğunuzu büyütmeye bugün başlayın.
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

export default SosyalMedya;
