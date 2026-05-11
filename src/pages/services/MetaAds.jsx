import React from 'react';
import { TrendingUp, BarChart3, Target, ArrowRight, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalysisForm from '../../components/AnalysisForm';
import FAQAccordion from '../../components/FAQAccordion';

function MetaAds() {
  const navigate = useNavigate();

  return (
    <div className="service-detail-page" style={{ background: '#050505', color: '#fff' }}>
      {/* Hero Section */}
      <section className="hero" style={{ paddingTop: '150px', paddingBottom: '80px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>

            <h1 className="hero-title" style={{ fontSize: '3.5rem', lineHeight: '1.1' }}>
              Meta Ads Yönetimi ile <span className="gradient-text">ROAS Odaklı</span> Ölçekleme
            </h1>
            <p className="hero-desc" style={{ fontSize: '1.2rem', marginTop: '30px' }}>
              Facebook ve Instagram reklamlarını sadece "yayınlamıyoruz". Dönüşüm psikolojisi, kreatif testler ve veri analitiği ile markanız için sürdürülebilir bir büyüme motoru kuruyoruz.
            </p>
            <div className="hero-actions" style={{ marginTop: '40px' }}>
              <button className="btn btn-primary" onClick={() => window.scrollTo({ top: document.getElementById('funnel')?.offsetTop - 100, behavior: 'smooth' })}>
                Ücretsiz Reklam Analizi Al
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section 1: Philosophy */}
      <section className="section-padding">
        <div className="container">
          <div className="service-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <div className="service-text-content">
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px' }}>Neden Bizimle <span className="gradient-text">Çalışmalısınız?</span></h2>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '20px' }}>
                Meta Ads dünyasında artık "teknik hedefleme" devri kapandı. Facebook algoritması artık o kadar akıllı ki, doğru kitleyi bulmak için sizin yerinize çalışıyor. Bugünün en büyük farkı, algoritmayı besleyecek <strong>doğru kreatif</strong> ve <strong>doğru veri</strong> yapısını kurmaktır.
              </p>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem' }}>
                İstanbul merkezli growth marketing ajansımızda, sadece reklam setleri açmıyoruz. Markanızın her aşamasındaki dönüşüm psikolojisini analiz ediyor, kreatif testing metodolojimizle en düşük CPM ve en yüksek ROAS değerlerine ulaşmanızı sağlıyoruz.
              </p>
            </div>
            <div className="feature-list-card" style={{ padding: '30px', borderRadius: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(138,43,226,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BarChart3 size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Creative Testing</h4>
                    <p style={{ color: '#777', fontSize: '0.9rem' }}>Hangi görselin çalıştığını tahmin etmiyoruz, bilimsel yöntemlerle test ediyoruz.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(0,229,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Target size={20} color="#00e5ff" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Funnel Optimizasyonu</h4>
                    <p style={{ color: '#777', fontSize: '0.9rem' }}>Reklamdan sonraki sayfadaki kullanıcı davranışını optimize ederek dönüşümü artırıyoruz.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,0,85,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Zap size={20} color="var(--secondary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Hızlı Ölçekleme</h4>
                    <p style={{ color: '#777', fontSize: '0.9rem' }}>Kazanan kreatifleri bulduğumuzda bütçenizi verimli şekilde büyüterek satışları katlıyoruz.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Süreç <span className="gradient-text">Nasıl İşliyor?</span></h2>
          <div className="services-grid" style={{ marginTop: '60px' }}>
            {[
              { step: '01', title: 'Hesap Denetimi', desc: 'Mevcut reklam hesabınız, piksel kurulumlarınız ve geçmiş verileriniz detaylıca analiz edilir.' },
              { step: '02', title: 'Strateji & Funnel', desc: 'Hedef kitlenize özel satış hunisi (funnel) ve teklif yapısı oluşturulur.' },
              { step: '03', title: 'Kreatif Üretim', desc: 'Dönüşüm odaklı video ve görsel içerikler kreatif ekibimiz tarafından hazırlanır.' },
              { step: '04', title: 'Yönetim & Test', desc: 'Reklamlar yayına alınır ve sürekli A/B testleri ile performans optimize edilir.' }
            ].map((item, i) => (
              <div key={i} className="glass" style={{ padding: '30px', borderRadius: '24px', position: 'relative' }}>
                <span style={{ fontSize: '3rem', fontWeight: '900', opacity: '0.1', position: 'absolute', top: '10px', right: '20px' }}>{item.step}</span>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>{item.title}</h3>
                <p style={{ color: '#888', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep Content Section */}
      <section className="section-padding">
        <div className="container" style={{ maxWidth: '900px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '30px' }}>Meta Ads'te Başarılı Olmanın <span className="gradient-text">3 Altın Kuralı</span></h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--primary)' }}>1. Kreatif Her Şeydir</h3>
              <p style={{ color: '#aaa', lineHeight: '1.8' }}>
                Günümüzde reklam algoritması görsel üzerinden çalışıyor. Eğer reklam görseliniz kullanıcının "kaydırmayı durdurmasını" (thumb-stop) sağlamıyorsa, geri kalan hiçbir şeyin önemi yoktur. Biz, 3 saniyelik giriş kancaları (hooks) ve dönüşüm odaklı metinlerle bu bariyeri aşıyoruz.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--secondary)' }}>2. Veri Temizliği (Tracking)</h3>
              <p style={{ color: '#aaa', lineHeight: '1.8' }}>
                iOS 14 sonrası veri takibi zorlaştı. Biz, CAPI (Conversions API) kurulumları ve server-side tracking çözümlerimizle algoritmanıza en temiz veriyi sağlıyoruz. Veri ne kadar netse, başarı o kadar yakındır.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#00e5ff' }}>3. Psikolojik Tetikleyiciler</h3>
              <p style={{ color: '#aaa', lineHeight: '1.8' }}>
                İnsanlar sadece ürün almaz, bir duygu veya çözüm alırlar. Reklam metinlerimizde ve kreatiflerimizde acı noktaları (pain points), sosyal kanıt (social proof) ve kıtlık (scarcity) gibi psikolojik tetikleyicileri stratejik olarak kullanıyoruz.
              </p>
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
              question: "Bütçem ne kadar olmalı?",
              answer: "Minimum bütçe sektörünüze ve hedeflerinize göre değişir. Ancak sağlıklı bir test süreci için günlük minimum 500 TL - 1000 TL arası bir bütçe ile başlanmasını öneriyoruz. Veri toplandıkça bu bütçeyi ölçekliyoruz."
            },
            {
              question: "ROAS garantisi veriyor musunuz?",
              answer: "Dijital pazarlamada kesin garanti vermek dürüstçe değildir. Ancak vaka çalışmalarımızda genellikle ilk 3 ay içinde ROAS değerlerini 2x ile 5x arasında artırdığımızı görüyoruz. Sizin için de hedefimiz sürdürülebilir karlılık."
            },
            {
              question: "Raporlama nasıl yapılıyor?",
              answer: "Haftalık ve aylık detaylı raporlar sunuyoruz. Raporlarımızda sadece tıklama sayılarını değil, asıl önemli olan satış başı maliyet (CPA) ve net reklam getirisi (ROAS) oranlarını şeffaf bir şekilde paylaşıyoruz."
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
          
          <AnalysisForm defaultService="Sosyal Medya & Reklam" />
        </div>
      </section>
    </div>
  );
}

export default MetaAds;
