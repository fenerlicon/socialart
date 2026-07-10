import React from 'react';
import { 
  Calendar, 
  Video, 
  Camera, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Zap,
  Award
} from 'lucide-react';
const AnalysisForm = React.lazy(() => import('../../components/AnalysisForm'));

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

const EventCekimi = () => {
  React.useEffect(() => {
    document.title = "Event & Etkinlik Çekimi İstanbul | SocialArt Medya";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Lansman, gala, fuar ve kurumsal etkinlikleriniz için 4K sinematik video prodüksiyonu, aftermovie çekimi ve profesyonel etkinlik fotoğrafçılığı.");
    }
  }, []);

  return (
    <div className="service-detail-page" style={{ background: '#050505', color: '#fff', pt: '100px' }}>
      <style>{`
        .service-hero { padding: 220px 0 100px; text-align: center; background: radial-gradient(circle at center, rgba(255, 183, 3, 0.08) 0%, transparent 70%); }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin: 60px 0; }
        .feature-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 30px; border-radius: 24px; transition: 0.3s; }
        .feature-card:hover { border-color: #ffb703; transform: translateY(-5px); }
      `}</style>

      {/* Hero Section */}
      <section className="service-hero">
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 183, 3, 0.1)', color: '#ffb703', padding: '8px 16px', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '20px' }}>
            <Sparkles size={16} /> Dinamik, Canlı ve Profesyonel Prodüksiyon
          </div>
          <h1 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '35px', lineHeight: '1.2' }}>
            Event & <span className="gradient-text" style={{ background: 'linear-gradient(135deg, #ffab00 0%, #ffb703 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Etkinlik Çekimi</span>
          </h1>
          <p style={{ maxWidth: '800px', margin: '0 auto', color: '#aaa', fontSize: '1.2rem', lineHeight: '1.6' }}>
            Lansmanlar, kurumsal etkinlikler, fuarlar, galalar ve tüm özel organizasyonlarınız için dinamik, yüksek çözünürlüklü video & fotoğraf prodüksiyonu sunuyoruz. Etkinliğinizin heyecanını ve marka değerini kalıcı hale getiriyoruz.
          </p>
          <div style={{ marginTop: '40px' }}>
            <button 
              className="btn btn-primary" 
              style={{ background: '#ffb703', color: '#000', fontWeight: '800' }}
              onClick={() => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              Ekibimizle Toplantı Planlayın <ArrowRight size={20} style={{ marginLeft: '10px' }} />
            </button>
          </div>
        </div>
      </section>

      {/* Analysis Form */}
      <section className="section-padding" id="form" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 className="section-title">Hemen <span className="gradient-text" style={{ background: 'linear-gradient(135deg, #ffab00 0%, #ffb703 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Teklif Alın</span></h2>
            <p className="section-subtitle">Etkinliğinizin büyüklüğü ve ihtiyaçlarına özel prodüksiyon paketleri oluşturalım.</p>
          </div>
          <LazySection height="350px">
            <React.Suspense fallback={
              <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#ffb703', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            }>
              <AnalysisForm defaultService="Event & Etkinlik Çekimi" />
            </React.Suspense>
          </LazySection>
        </div>
      </section>

      {/* Neler Yapıyoruz? */}
      <section className="section-padding" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h2 className="section-title">Etkinlik Prodüksiyonunda <span className="gradient-text" style={{ background: 'linear-gradient(135deg, #ffab00 0%, #ffb703 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Neler Sunuyoruz?</span></h2>
            <p className="section-subtitle">Uçtan uca yüksek kaliteli çekim ve kurgu hizmetlerimiz.</p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <Video size={36} color="#ffb703" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', fontWeight: '800' }}>Sinematik Aftermovie</h3>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Etkinliğin en enerjik, heyecanlı ve önemli anlarını kurgulayarak markanızı sosyal medyada öne çıkaracak dinamik tanıtım klipleri hazırlıyoruz.
              </p>
            </div>

            <div className="feature-card">
              <Camera size={36} color="#ffb703" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', fontWeight: '800' }}>Profesyonel Fotoğrafçılık</h3>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Katılımcıların, konuşmacıların, detay dekorasyonların ve genel atmosferin yüksek çözünürlüklü, basına ve sosyal medyaya uygun fotoğraflarını çekiyoruz.
              </p>
            </div>

            <div className="feature-card">
              <Zap size={36} color="#ffb703" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', fontWeight: '800' }}>Hızlı Edit & Sosyal Medya</h3>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Etkinlik devam ederken veya hemen sonrasında sosyal medya hesaplarınızda hızlıca paylaşabileceğiniz Reels ve story formatında içerikleri anında teslim ediyoruz.
              </p>
            </div>

            <div className="feature-card">
              <Award size={36} color="#ffb703" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', fontWeight: '800' }}>Kurumsal & Fuar Çekimleri</h3>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Fuar stantlarınız, kurumsal bayi toplantılarınız ve lansman geceleriniz için markanızın kurumsal prestijini yansıtacak ağırbaşlı ve şık prodüksiyonlar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sürecimiz */}
      <section className="section-padding">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 className="section-title">Nasıl <span className="gradient-text" style={{ background: 'linear-gradient(135deg, #ffab00 0%, #ffb703 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Çalışıyoruz?</span></h2>
            <p className="section-subtitle">Etkinliğin başından teslimata kadar her adımı titizlikle planlıyoruz.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255, 183, 3, 0.1)', color: '#ffb703', minWidth: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '8px', fontWeight: 'bold' }}>Ön Görüşme & Brief</h3>
                <p style={{ color: '#888', lineHeight: '1.6' }}>Etkinliğin akışını, önemli anlarını, katılan konuşmacıları ve markanızın odaklanmak istediği unsurları netleştiriyoruz.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255, 183, 3, 0.1)', color: '#ffb703', minWidth: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '8px', fontWeight: 'bold' }}>Alan Analizi & Ekipman Kurulumu</h3>
                <p style={{ color: '#888', lineHeight: '1.6' }}>Çekim günü etkinlik alanına erken saatte ulaşıp ışık durumunu, sahne açılarını ve drone izinlerini kontrol ederek hazır duruma geliyoruz.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255, 183, 3, 0.1)', color: '#ffb703', minWidth: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '8px', fontWeight: 'bold' }}>Dinamik Çekim</h3>
                <p style={{ color: '#888', lineHeight: '1.6' }}>Etkinlik boyunca hiçbir anı kaçırmayacak şekilde hareketli gimbal sistemleri, detay kameraları ve drone'lar ile kesintisiz ve enerjik kayıtlar alıyoruz.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255, 183, 3, 0.1)', color: '#ffb703', minWidth: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>4</div>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '8px', fontWeight: 'bold' }}>Post-Prodüksiyon & Hızlı Teslimat</h3>
                <p style={{ color: '#888', lineHeight: '1.6' }}>Çekilen ham görüntüleri hızlıca kurguluyor, profesyonel renk düzenlemelerini yapıyor ve belirlenen süre dahilinde sizlere teslim ediyoruz.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventCekimi;
