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
  Zap
} from 'lucide-react';
import AnalysisForm from '../../components/AnalysisForm';

const SunuculuReklam = () => {
  return (
    <div className="service-detail-page" style={{ background: '#050505', color: '#fff', pt: '100px' }}>
      <style>{`
        .service-hero { padding: 160px 0 100px; text-align: center; background: radial-gradient(circle at center, rgba(255, 0, 85, 0.1) 0%, transparent 70%); }
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
          <h1 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '20px' }}>
            Sunuculu <span className="gradient-text">Reklam Videoları</span>
          </h1>
          <p style={{ maxWidth: '800px', margin: '0 auto', color: '#aaa', fontSize: '1.2rem', lineHeight: '1.6' }}>
            Markanızı profesyonel bir yüzle temsil edin. Stüdyo ortamında, profesyonel sunucular ve senaryo ekibimizle markanızın güvenilirliğini ve satışlarını artırıyoruz.
          </p>
          <div style={{ marginTop: '40px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              Hemen Teklif Alın <ArrowRight size={20} style={{ marginLeft: '10px' }} />
            </button>
          </div>
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
              <div key={idx} className="glass" style={{ borderRadius: '40px', padding: '15px', maxWidth: '320px', margin: '0 auto' }}>
                <div style={{ borderRadius: '30px', overflow: 'hidden', aspectRatio: '9/16', background: '#000', border: '8px solid #1a1a1a' }}>
                  <video src={video.url} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ textAlign: 'center', marginTop: '15px', fontSize: '1.1rem' }}>{video.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="container">
          <div className="feature-grid">
            <div className="feature-card">
              <Users size={40} color="var(--secondary)" style={{ marginBottom: '20px' }} />
              <h3>Profesyonel Sunucular</h3>
              <p style={{ color: '#888' }}>Markanızın kimliğine uygun, ekran önü tecrübesi olan profesyonel sunucu kadromuzla çalışıyoruz.</p>
            </div>
            <div className="feature-card">
              <MessageSquare size={40} color="var(--secondary)" style={{ marginBottom: '20px' }} />
              <h3>Stratejik Senaryo</h3>
              <p style={{ color: '#888' }}>Satış psikolojisine uygun, ilk 3 saniyede yakalayan ve harekete geçiren senaryolar hazırlıyoruz.</p>
            </div>
            <div className="feature-card">
              <Target size={40} color="var(--secondary)" style={{ marginBottom: '20px' }} />
              <h3>Stüdyo Kalitesi</h3>
              <p style={{ color: '#888' }}>Profesyonel ışık, ses ve kamera ekipmanlarımızla stüdyo ortamında 4K çekimler yapıyoruz.</p>
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

      {/* Analysis Form */}
      <section className="section-padding" id="form">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 className="section-title">Hemen <span className="gradient-text">Teklif Alın</span></h2>
            <p className="section-subtitle">Markanız için en uygun sunuculu reklam stratejisini birlikte kuralım.</p>
          </div>
          <AnalysisForm defaultService="Sunuculu Reklam" />
        </div>
      </section>
    </div>
  );
};

export default SunuculuReklam;
