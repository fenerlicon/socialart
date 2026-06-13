import React from 'react';
import { 
  PlayCircle, 
  Video, 
  Users, 
  CheckCircle, 
  ArrowRight,
  MessageSquare,
  Sparkles,
  Target,
  Zap,
  Smartphone,
  TrendingUp,
  Flame
} from 'lucide-react';
const AnalysisForm = React.lazy(() => import('../../components/AnalysisForm'));
import ShowcaseVideo from '../../components/ShowcaseVideo';

const LazySection = ({ children, height = '300px' }) => {
  const [isInView, setIsInView] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ minHeight: isInView ? 'auto' : height, width: '100%', display: 'flex', flexDirection: 'column' }}>
      {isInView ? children : null}
    </div>
  );
};

const SunuculuReklam = () => {
  return (
    <div className="service-detail-page" style={{ background: '#050505', color: '#fff', pt: '100px' }}>
      <style>{`
        .service-hero { padding: 220px 0 100px; text-align: center; background: radial-gradient(circle at center, rgba(255, 0, 85, 0.1) 0%, transparent 70%); }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin: 60px 0; }
        .feature-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 30px; border-radius: 24px; transition: 0.3s; }
        .feature-card:hover { border-color: var(--secondary); transform: translateY(-5px); }
        .video-showcase { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin: 40px 0; }
      `}</style>

      {/* Hero Section */}
      <section className="service-hero">
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 0, 85, 0.1)', color: 'var(--secondary)', padding: '8px 16px', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '20px' }}>
            <Sparkles size={16} /> En Yüksek Dönüşüm Oranlı Reklam Formatı
          </div>
          <h1 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '35px', lineHeight: '1.2' }}>
            Sunuculu <span className="gradient-text">Reklam Videoları</span>
          </h1>
          <p style={{ maxWidth: '800px', margin: '0 auto', color: '#aaa', fontSize: '1.2rem', lineHeight: '1.6' }}>
            Sosyal medya video çekimi yapan ve e-ticaret markaları için dönüşümü yüksek hazır reklam videoları üreten profesyonel bir video prodüksiyon ajansıyız. Markanızı profesyonel bir yüzle temsil edin, satışlarınızı katlayın.
          </p>
          <div style={{ marginTop: '40px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              Ekibimizle Toplantı Planlayın <ArrowRight size={20} style={{ marginLeft: '10px' }} />
            </button>
          </div>
        </div>
      </section>

      {/* Analysis Form (MOVED UP) */}
      <section className="section-padding" id="form" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 className="section-title">Hemen <span className="gradient-text">Teklif Alın</span></h2>
            <p className="section-subtitle">Markanız için en uygun sunuculu reklam stratejisini birlikte kuralım.</p>
          </div>
          <LazySection height="350px">
            <React.Suspense fallback={
              <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            }>
              <AnalysisForm defaultService="Sunuculu Reklam" />
            </React.Suspense>
          </LazySection>
        </div>
      </section>

      {/* Showcase */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '50px' }}>Örnek <span className="gradient-text">Çalışmalarımız</span></h2>
          <div className="video-showcase">
            {[
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/q_auto,vc_auto,f_auto/v1778836177/video1_ewynu2.mov", name: "MioCasa Halı" },
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/q_auto,vc_auto,f_auto/v1778836171/video2_vthln3.mp4", name: "ArayanVar" },
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/q_auto,vc_auto,f_auto/v1778836176/video3_f9pp8w.mp4", name: "Social Art" }
            ].map((video, idx) => (
              <div key={idx} className="glass" style={{ width: '100%', borderRadius: '40px', padding: '15px', maxWidth: '320px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
                <ShowcaseVideo src={video.url} name={video.name} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sosyal Medya Video Çekimi Section */}
      <section className="section-padding" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0) 100%)', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container">
          <div className="service-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center' }}>
            <div className="service-text-content">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff', padding: '6px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '15px' }}>
                <Smartphone size={14} /> Mobil Uyumlu & Dikey Çekimler
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '25px', lineHeight: '1.3' }}>
                Sosyal Medya Video Çekiminde <br /><span className="gradient-text">Sunucu Gücü</span>
              </h2>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '20px' }}>
                Sosyal medya algoritmaları (Instagram Reels, TikTok ve YouTube Shorts) artık sadece görsel güzelliğe değil, kullanıcının videoda kalma süresine (retention) odaklanıyor. Klasik reklamlar saniyeler içinde geçilirken, profesyonel bir sunucunun samimi anlatımı kullanıcıyı ekrana bağlar.
              </p>
              <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '25px' }}>
                Biz, <strong>sosyal medya video çekimi</strong> süreçlerimizi tamamen bu algoritma dinamiklerine göre tasarlıyoruz. Markanızın mesajını en net ve güven verici şekilde aktaracak sunucularla çekim yapıyor, izleyicide güven hissi uyandırarak satın alma kararını hızlandırıyoruz.
              </p>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle color="var(--secondary)" size={18} />
                  <span style={{ fontWeight: '500' }}>Reels & TikTok Uyumlu</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle color="var(--secondary)" size={18} />
                  <span style={{ fontWeight: '500' }}>Yüksek İzlenme Süresi</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle color="var(--secondary)" size={18} />
                  <span style={{ fontWeight: '500' }}>Algoritma Optimizasyonu</span>
                </div>
              </div>
            </div>

            <div className="social-media-shooting-grid" style={{ display: 'grid', gap: '20px' }}>
              <div className="shooting-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '25px', borderRadius: '20px', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(138, 43, 226, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '12px' }}>
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Dikey Format & Kadraj</h3>
                    <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>Tüm çekimlerimizi mobil cihazlar için optimize edilmiş 9:16 dikey formatta gerçekleştirerek ekranı tam kaplayan sürükleyici bir deneyim sunuyoruz.</p>
                  </div>
                </div>
              </div>

              <div className="shooting-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '25px', borderRadius: '20px', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--secondary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(255, 0, 85, 0.1)', color: 'var(--secondary)', padding: '12px', borderRadius: '12px' }}>
                    <Flame size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>İlk 3 Saniye Kancası (Hook)</h3>
                    <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>Sosyal medya akışındaki hızla kaydırma alışkanlığını kırmak için videonun ilk 3 saniyesine özel görsel ve sözel kancalar yerleştiriyoruz.</p>
                  </div>
                </div>
              </div>

              <div className="shooting-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '25px', borderRadius: '20px', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#00e5ff'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff', padding: '12px', borderRadius: '12px' }}>
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Dinamik Kurgu & Altyazılar</h3>
                    <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>Sıkılmayı önleyen hızlı kurgu teknikleri, trend yazı tipleriyle zenginleştirilmiş dinamik altyazılar ve ses efektleri ile izlenme süresini zirveye taşıyoruz.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="container">
          <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div className="feature-card">
              <Users size={40} color="var(--secondary)" style={{ marginBottom: '20px' }} />
              <h3>Profesyonel Sunucular</h3>
              <p style={{ color: '#888' }}>Markanızın kimliğine uygun, ekran önü tecrübesi olan profesyonel sunucu kadromuzla çalışıyoruz.</p>
            </div>
            <div className="feature-card">
              <MessageSquare size={40} color="var(--secondary)" style={{ marginBottom: '20px' }} />
              <h3>Stratejik Senaryo</h3>
              <p style={{ color: '#888' }}>Satış psikolojisine uygun, ilk 3 saniyede yakalayan ve harekete geçiren kancalı senaryolar hazırlıyoruz.</p>
            </div>
            <div className="feature-card">
              <Video size={40} color="var(--secondary)" style={{ marginBottom: '20px' }} />
              <h3>Video Prodüksiyon Ajansı</h3>
              <p style={{ color: '#888' }}>Uçtan uca sosyal medya video çekimi yapan, profesyonel stüdyo ve kamera ekipmanlarına sahip tam donanımlı bir video prodüksiyon ajansıyız.</p>
            </div>
            <div className="feature-card">
              <Zap size={40} color="var(--secondary)" style={{ marginBottom: '20px' }} />
              <h3>Hazır Reklam Videoları</h3>
              <p style={{ color: '#888' }}>E-ticaret ve sosyal medya kanallarınızda anında yayına alabileceğiniz, yüksek dönüşüm getiren hazır reklam videoları paketleri sunuyoruz.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '50px' }}>Nasıl <span className="gradient-text">Çalışıyoruz?</span></h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
            {[
              "Marka analizi ve hedef kitlenin belirlenmesi",
              "Satış odaklı senaryoların hazırlanması ve onayı",
              "Sunucu seçimi ve çekim planlaması",
              "Stüdyo çekimi ve profesyonel kurgu süreci",
              "Reklam yayınına hazır yüksek dönüşümlü videolar"
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '30px', height: '30px', background: 'var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>{i+1}</div>
                <span style={{ fontSize: '1.1rem' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form section was moved up */}
    </div>
  );
};

export default SunuculuReklam;
