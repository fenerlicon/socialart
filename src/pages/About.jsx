import React from 'react';
import { Camera, Video, Users, Target, Rocket, Award, Heart } from 'lucide-react';

function About() {
  return (
    <>
      <style>
        {`
          .profile-pic-container {
            position: relative;
            margin-bottom: 35px;
            transition: all 0.4s ease;
          }
          .profile-pic-container:hover {
            transform: translateY(-10px) scale(1.02);
          }
          
          .profile-img-1 {
            width: 200px;
            height: 200px;
            border-radius: 100px 0 100px 0;
            object-fit: cover;
            position: relative;
            z-index: 2;
            box-shadow: 0 15px 30px rgba(0,0,0,0.4);
            border: 2px solid rgba(255,255,255,0.05);
          }
          .profile-bg-1 {
            position: absolute;
            top: 15px;
            left: -15px;
            width: 200px;
            height: 200px;
            border-radius: 100px 0 100px 0;
            background: linear-gradient(135deg, var(--primary), rgba(0,0,0,0));
            z-index: 1;
            opacity: 0.6;
          }

          .profile-img-2 {
            width: 200px;
            height: 200px;
            border-radius: 0 100px 0 100px;
            object-fit: cover;
            position: relative;
            z-index: 2;
            box-shadow: 0 15px 30px rgba(0,0,0,0.4);
            border: 2px solid rgba(255,255,255,0.05);
          }
          .profile-bg-2 {
            position: absolute;
            top: 15px;
            right: -15px;
            width: 200px;
            height: 200px;
            border-radius: 0 100px 0 100px;
            background: linear-gradient(-135deg, var(--secondary), rgba(0,0,0,0));
            z-index: 1;
            opacity: 0.6;
          }

          .why-card {
            padding: 40px;
            border-radius: 24px;
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.05);
            transition: all 0.3s ease;
          }
          .why-card:hover {
            background: rgba(255,255,255,0.05);
            transform: translateY(-5px);
            border-color: var(--primary);
          }
        `}
      </style>
      <section className="section-padding" style={{ paddingTop: '150px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h1 className="section-title">Biz <span className="gradient-text">Kimiz?</span></h1>
            <p className="section-subtitle" style={{ maxWidth: '800px', margin: '0 auto' }}>
              SocialArt Ajans, sanatı stratejiyle birleştiren, markaların dijital dünyadaki hikayelerini en estetik ve etkili şekilde anlatan bir yeni nesil medya ajansıdır.
            </p>
          </div>

          {/* TEAM */}
          <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '100px' }}>
            
            <div className="glass" style={{ padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="profile-pic-container">
                <div className="profile-bg-1"></div>
                <img src="/celal-unlu.png" alt="Celal Ünlü" className="profile-img-1" />
              </div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '15px', textAlign: 'center', fontWeight: '800' }}><span className="gradient-text">CELAL ÜNLÜ</span> <br/><span style={{fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px'}}>Kurucu / Yönetmen</span></h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', textAlign: 'center', fontSize: '0.95rem' }}>
                Sinema TV kökenli vizyonuyla, belgesellerden reklam filmlerine uzanan geniş bir prodüksiyon tecrübesine sahiptir. 
                Filmograf Studio'nun kurucusu olarak sektöre adım atan Ünlü, fotoğraf ve video alanındaki derin bilgisini yüzlerce öğrenciye aktarmış bir eğitmendir. 
                SocialArt çatısı altında markaların görsel kimliklerini sinematik bir boyuta taşıyor.
              </p>
            </div>

            <div className="glass" style={{ padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="profile-pic-container">
                <div className="profile-bg-2"></div>
                <img src="/ercan-ozdemir.png" alt="Ercan Özdemir" className="profile-img-2" />
              </div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '15px', textAlign: 'center', fontWeight: '800' }}><span className="gradient-text">ERCAN ÖZDEMİR</span> <br/><span style={{fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px'}}>Kurucu / Görüntü Yönetmeni</span></h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', textAlign: 'center', fontSize: '0.95rem' }}>
                Ulusal kanallardan büyük bütçeli reklam filmlerine kadar pek çok projede görüntü yönetmeni olarak yer almıştır. 
                Teknik mükemmelliği estetikle harmanlayan bakış açısıyla binlerce çekimi bizzat yönetmiş, sektörün öncü markalarında uzmanlık yapmıştır. 
                Bugün SocialArt ile markalara "iz bırakacak" görsel içerikler üretiyor.
              </p>
            </div>
          </div>

          {/* MISSION & VISION */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '100px' }}>
            <div className="why-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <Target size={32} color="var(--primary)" />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Vizyonumuz</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
                Dijital medyada standartları belirleyen, prodüksiyon kalitesini veri odaklı stratejiyle birleştirerek global ölçekte başarı hikayeleri yaratan bir ajans olmak.
              </p>
            </div>
            <div className="why-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <Rocket size={32} color="var(--secondary)" />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Misyonumuz</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
                Markaların gerçek potansiyelini keşfetmelerini sağlamak; onları sadece "görünür" değil, hedef kitleleri tarafından "arzu edilen" bir konuma taşımak.
              </p>
            </div>
          </div>

          {/* WHY US */}
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title">Neden <span className="gradient-text">SocialArt?</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {[
              { icon: <Award size={24} />, title: "Uman Ekip", desc: "Sektörde yılların birikimine sahip profesyonel kadro." },
              { icon: <Video size={24} />, title: "Modern Ekipman", desc: "4K ve üstü sinematik prodüksiyon standartları." },
              { icon: <Users size={24} />, title: "Butik Yaklaşım", desc: "Her markaya özel, terzi usulü hazırlanan stratejiler." },
              { icon: <Heart size={24} />, title: "Tutkuyla Çalışıyoruz", desc: "İşinizi kendi işimiz gibi sahipleniyoruz." }
            ].map((item, i) => (
              <div key={i} className="glass" style={{ padding: '30px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                <h4 style={{ marginBottom: '10px', fontSize: '1.1rem', fontWeight: '700' }}>{item.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default About;
