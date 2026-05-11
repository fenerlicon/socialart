import React from 'react';
import { Camera, Video, Play, ArrowRight, CheckCircle2, Sparkles, Zap, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CreativeProduction() {
  const navigate = useNavigate();

  return (
    <div className="service-detail-page" style={{ background: '#050505', color: '#fff' }}>
      {/* Hero Section */}
      <section className="hero" style={{ paddingTop: '150px', paddingBottom: '80px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>

            <h1 className="hero-title" style={{ fontSize: '3.5rem', lineHeight: '1.1' }}>
              Creative Production ile <span className="gradient-text">Görsel Gücünüzü</span> Sergileyin
            </h1>
            <p className="hero-desc" style={{ fontSize: '1.2rem', marginTop: '30px' }}>
              Sinematik reklam filmlerinden, yüksek dönüşüm getiren UGC içeriklerine kadar; markanızın ruhunu yansıtan ve izleyiciyi harekete geçiren kreatifler üretiyoruz.
            </p>
            <div className="hero-actions" style={{ marginTop: '40px' }}>
              <button className="btn btn-primary" onClick={() => window.scrollTo({ top: document.getElementById('funnel')?.offsetTop - 100, behavior: 'smooth' })}>
                Kreatif Teklif Al
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div className="glass" style={{ padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
               <img src="/assets/images/socialart-studio.png" alt="Social Art Stüdyo" style={{ width: '100%', borderRadius: '20px', marginBottom: '20px' }} />
               <div style={{ position: 'absolute', top: '50px', left: '50px', background: 'var(--primary)', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(138,43,226,0.3)' }}>Kendi Stüdyomuzla Hizmetinizdeyiz</div>
            </div>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px' }}>Sadece Video Çekmiyoruz, <span className="gradient-text">Hikaye İnşa Ediyoruz.</span></h2>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '20px' }}>
                Tasarım herkesin yapabildiği bir şeydir, ancak izleyiciyi 3 saniyede yakalayıp 60 saniyede ikna etmek bir sanattır. Biz buna <strong>Performance Creative</strong> diyoruz.
              </p>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem' }}>
                İstanbul'un en donanımlı kreatif prodüksiyon ajanslarından biri olarak, markanızın ihtiyacı olan sinematik reklam filmi, ürün fotoğrafçılığı veya UGC (User Generated Content) içeriklerini tek bir çatı altında sunuyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Neler <span className="gradient-text">Üretiyoruz?</span></h2>
          <div className="services-grid" style={{ marginTop: '60px' }}>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
              <Video size={35} color="var(--primary)" style={{ marginBottom: '20px' }} />
              <h3 style={{ marginBottom: '15px' }}>Sinematik Reklam Filmi</h3>
              <p style={{ color: '#888', fontSize: '0.95rem' }}>Marka imajınızı güçlendiren, yüksek prodüksiyon kaliteli tanıtım ve kampanya filmleri.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
              <Zap size={35} color="var(--secondary)" style={{ marginBottom: '20px' }} />
              <h3 style={{ marginBottom: '15px' }}>Performance Ads (UGC)</h3>
              <p style={{ color: '#888', fontSize: '0.95rem' }}>Doğal, kullanıcı odaklı ve reklam setlerinde en yüksek ROAS getiren kısa video içerikler.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
              <Camera size={35} color="#00e5ff" style={{ marginBottom: '20px' }} />
              <h3 style={{ marginBottom: '15px' }}>Profesyonel Fotoğrafçılık</h3>
              <p style={{ color: '#888', fontSize: '0.95rem' }}>Yemek, moda, emlak ve ürün çekimlerinde estetik ve kaliteyi birleştiren kareler.</p>
            </div>
            <div className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
              <Sparkles size={35} color="var(--accent)" style={{ marginBottom: '20px' }} />
              <h3 style={{ marginBottom: '15px' }}>Kreatif Tasarım</h3>
              <p style={{ color: '#888', fontSize: '0.95rem' }}>Sosyal medya postlarından outdoor tasarımlarına kadar markanızı farklılaştıran görseller.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Yaratıcı <span className="gradient-text">Sürecimiz</span></h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '60px', maxWidth: '800px', margin: '60px auto 0' }}>
             {[
               { title: 'Brief & Konsept', desc: 'İhtiyaçlarınızı anlıyor, markanıza en uygun görsel dili ve senaryo taslağını oluşturuyoruz.' },
               { title: 'Pre-Prodüksiyon', desc: 'Cast seçimi, mekan belirleme ve teknik ekipman hazırlıkları titizlikle planlanır.' },
               { title: 'Prodüksiyon (Çekim)', desc: 'Kendi stüdyomuzda veya lokasyonda, profesyonel yönetmen ve ekip eşliğinde çekimi gerçekleştiriyoruz.' },
               { title: 'Post-Prodüksiyon', desc: 'Kurgu, color grading, ses tasarımı ve animasyonlarla içeriği mükemmelleştiriyoruz.' }
             ].map((item, i) => (
               <div key={i} style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold', color: '#000' }}>{i+1}</div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{item.title}</h4>
                    <p style={{ color: '#aaa' }}>{item.desc}</p>
                  </div>
               </div>
             ))}
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
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Kendi stüdyonuz var mı?</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>Evet, İstanbul'da tam donanımlı profesyonel bir çekim stüdyomuz bulunmaktadır. Müşterilerimiz için hem stüdyo çekim hizmeti veriyor hem de stüdyo kiralama imkanı sunuyoruz.</p>
              </div>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>UGC içerik nedir?</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>UGC (User Generated Content), markanızı kullanan gerçek bir kullanıcı gibi görünen içerik üreticilerinin çektiği videolardır. Bu videolar, reklam setlerinde en yüksek güveni ve dönüşümü sağlar.</p>
              </div>
              <div className="glass" style={{ padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Çekim sonrası revize hakkımız var mı?</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>Kesinlikle. Her projede konsept aşamasında anlaşılan detaylar çerçevesinde ücretsiz revize haklarınız bulunmaktadır. Sizin memnuniyetiniz bizim için esastır.</p>
              </div>
            </div>
          </div>
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
          
          <AnalysisForm defaultService="Video prodüksiyon" />
        </div>
      </section>
    </div>
  );
}

export default CreativeProduction;
