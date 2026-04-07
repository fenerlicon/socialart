import React from 'react';
import { Camera, Video, Users } from 'lucide-react';

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
        `}
      </style>
      <section className="section-padding" style={{ paddingTop: '150px' }}>
        <div className="container">
          <h1 className="section-title">Hakkımızda</h1>
          <p className="section-subtitle" style={{ maxWidth: '800px', margin: '0 auto 3rem auto' }}>
            SocialArt Medya, markanızı sosyal medyada büyütmek, hedef kitlenize ulaşmak ve etkileşiminizi artırmak için çalışır. 
            Sosyal medya yönetimi, reklam stratejileri, içerik üretimi ve dijital pazarlama çözümleriyle işletmenizi dijitalde öne çıkarıyoruz.
          </p>

          <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '50px' }}>
            
            <div className="glass" style={{ padding: '30px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="profile-pic-container">
                <div className="profile-bg-1"></div>
                <img src="/celal-unlu.png" alt="Celal Ünlü" className="profile-img-1" />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', textAlign: 'center' }}><span className="gradient-text">CELAL ÜNLÜ</span> <br/><span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>(Yönetmen)</span></h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', textAlign: 'center' }}>
                Bağımsız film yapımcısı ve yönetmen kimliğiyle, Sinema TV lisans eğitimi süresince belgesellerden uzun metrajlı sinema filmlerine kadar birçok girişime imza attı. 
                Mezuniyetinin ardından fotoğrafçılık, videografi ve grafik tasarım hizmetleri veren Filmograf Studio'yu kurdu. 
                İlerleyen yıllarda Türkiye'nin en köklü fotoğrafçılık markalarından birinde fotoğraf ve video uzmanı olarak binlerce çekime liderlik etti. 
                Bu alandaki engin tecrübelerini eğitmen rolüyle yüzlerce öğrenciye aktardı. Sektörde edindiği güçlü vizyonla 
                <strong> "Socialart Ajans"</strong> markasını hayata geçirerek dijital medya reklamcılığı alanında yenilikçi ve sonuç odaklı hizmetler sunmaya devam etmektedir.
              </p>
            </div>

            <div className="glass" style={{ padding: '30px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="profile-pic-container">
                <div className="profile-bg-2"></div>
                <img src="/ercan-ozdemir.png" alt="Ercan Özdemir" className="profile-img-2" />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', textAlign: 'center' }}><span className="gradient-text">ERCAN ÖZDEMİR</span> <br/><span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>(Görüntü Yönetmeni)</span></h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', textAlign: 'center' }}>
                Profesyonel görüntü yönetimi ve video prodüksiyon uzmanı. Kariyeri boyunca dikkat çeken TV programları, ulusal reklam filmleri, müzik klipleri, kurumsal projeler ve sinematik prodüksiyonlarda yer aldı. 
                Sektörün öncü markalarından birinde video uzmanı olarak görev alıp binlerce çekimi bizzat yönetti. 
                Kazandığı teknik ve estetik birikimi eğitmen unvanıyla sektöre yeni adım atan gençlere aktardı. Nitelikli tecrübelerini harmanlayarak kurucusu olduğu 
                <strong> "Socialart Ajans"</strong> çatısı altında, markaların hikayelerini en estetik ve dikkat çekici haliyle dijital dünyaya taşımaktadır.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default About;
