import React from 'react';
import { Camera, Video, Users, Globe, ArrowRight } from 'lucide-react';
import '../Services.css';

function Services() {
  return (
    <div>
      {/* HERO SECTION */}
      <section className="services-page-hero">
        <div className="container">
          <h1 className="hero-title" style={{fontSize: '4rem', marginBottom: '20px'}}>
            Hizmetlerimiz
          </h1>
          <p className="hero-desc" style={{margin: '0 auto', maxWidth: '800px'}}>
            Dijital dünyada görünür olmak ve marka bilinirliğinizi artırmak için doğru adımları atmak şart. Biz, fotoğrafçılık ve video prodüksiyonu hizmetlerimizle, markanızın dijital dünyadaki imajını inşa ediyor ve en etkileyici şekilde öne çıkarmayı taahhüt ediyoruz.
          </p>
        </div>
      </section>

      {/* DETAILED SERVICES LIST */}
      <section className="section-padding" style={{paddingTop: '20px'}}>
        <div className="container">
          
          <div className="service-detail-card">
            <div className="service-detail-icon-wrap">
              <Camera color="var(--accent)" />
            </div>
            <div className="service-detail-text">
              <h2 className="service-detail-title">Profesyonel Fotoğraf Çekimleri</h2>
              <p className="service-detail-desc">
                Markalara özel profesyonel fotoğraf hizmetleri sunuyoruz. Ürün, Yemek, Spor, Model, Emlak, E-ticaret, Katalog çekimleri gibi alanlarda geniş bir yelpazede kaliteli görseller sağlıyoruz. Her marka için özelleştirilmiş çözümler sunarak, ürünlerinizi en iyi şekilde sergiliyoruz.
              </p>
            </div>
          </div>
          
          <div className="service-detail-card reverse">
            <div className="service-detail-icon-wrap">
              <Video color="#ff0055" />
            </div>
            <div className="service-detail-text">
              <h2 className="service-detail-title">Video Prodüksiyonu</h2>
              <p className="service-detail-desc">
                Modern medya dünyasında, yüksek kaliteli ve yaratıcı videolar oluşturmak amacıyla en güncel ekipmanları kullanıyoruz. Her projede izleyicilere benzersiz deneyimler sunmayı hedefliyoruz. Yenilikçi ve dinamik bir bakış açısıyla her videoda yeni hikayeler keşfediyoruz.
              </p>
            </div>
          </div>

          <div className="service-detail-card">
            <div className="service-detail-icon-wrap">
              <Users color="var(--primary)" />
            </div>
            <div className="service-detail-text">
              <h2 className="service-detail-title">Sosyal Medya Yönetimi</h2>
              <p className="service-detail-desc">
                Sosyal medya yönetimi, günümüz markaları için büyük bir öneme sahiptir. Bu platformlar, kitle ile etkili bir iletişim kurmanın yanı sıra, markaların görünürlüğünü artırarak büyümelerini destekler. Biz, markaların potansiyelini ortaya çıkarmak ve onları daha da ileriye taşımak için kapsamlı bir strateji sağlıyoruz.
              </p>
            </div>
          </div>

          <div className="service-detail-card reverse">
            <div className="service-detail-icon-wrap">
              <Globe color="#00e5ff" />
            </div>
            <div className="service-detail-text">
              <h2 className="service-detail-title">Kurumsal Kimlik Oluşturma</h2>
              <p className="service-detail-desc">
                Kurumsal kimlik tasarımı, markanızın özünü yansıtır. Değerlerinizi ve hedef kitlenizi göz önünde bulundurarak size özgün tasarımlar sunuyoruz. Logo, kreatif tasarım ve SEO uyumlu içeriklerle markanızı güçlendiriyoruz.
              </p>
            </div>
          </div>

        </div>
      </section>
      
      {/* MINI CTA */}
      <section className="section-padding" style={{background: 'var(--surface)', textAlign: 'center'}}>
        <div className="container">
          <h2 className="section-title">Dijitalde Öne Çıkın</h2>
          <p className="section-subtitle" style={{margin: '0 auto 30px auto'}}>
            İletişime geçin, ihtiyaçlarınızı birlikte değerlendirelim. Markanıza özel, etkili ve yaratıcı çözümlerle sizi dijitalde zirveye taşıyalım.
          </p>
          <a href="/#funnel" className="btn btn-primary">
            Ücretsiz Analiz Alın <ArrowRight size={20} />
          </a>
        </div>
      </section>

    </div>
  );
}

export default Services;
