import React, { useState } from 'react';
import { Camera, Video, Users, ArrowRight, Mic, Smartphone, ChevronDown, Play, X, ChevronLeft, ChevronRight, Monitor, Layers } from 'lucide-react';
import '../Services.css';

// Import local images to let Vite handle them
import studio1 from '../assets/images/studio-1.png';
import studio2 from '../assets/images/studio-2.png';
import ugc1 from '../assets/images/4.jpg';
import ugc2 from '../assets/images/5.jpg';
import ugc3 from '../assets/images/6.jpg';

function Services() {
  const [expandedId, setExpandedId] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, media: [], index: 0 });

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openLightbox = (mediaList, index) => {
    setLightbox({ open: true, media: mediaList, index });
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightbox({ open: false, media: [], index: 0 });
    document.body.style.overflow = 'auto';
  };

  const nextMedia = (e) => {
    e.stopPropagation();
    setLightbox(prev => ({
      ...prev,
      index: (prev.index + 1) % prev.media.length
    }));
  };

  const prevMedia = (e) => {
    e.stopPropagation();
    setLightbox(prev => ({
      ...prev,
      index: (prev.index - 1 + prev.media.length) % prev.media.length
    }));
  };

  const servicesData = [
    {
      id: '360-sosyal-medya',
      title: '360° Sosyal Medya & Reklam Yönetimi',
      icon: <Layers color="var(--primary)" />,
      desc: '360 derece sosyal medya yönetimi ile markanızın dijital dünyadaki tüm temas noktalarını tek elden yönetiyoruz. Meta, Google ve TikTok reklamlarında data odaklı yaklaşımlarımızla yüksek performanslı reklam yönetimi (Performance Marketing) sağlıyoruz. İçerik planlaması, topluluk yönetimi ve reklam optimizasyonunu birleştirerek markanızın sesini en gür şekilde duyuruyoruz.',
      media: [
        { type: 'image', url: 'https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/images/1.jpg' },
        { type: 'image', url: 'https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/images/2.jpg' },
        { type: 'image', url: 'https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/images/3.jpg' }
      ]
    },
    {
      id: 'studyo-cekim',
      title: 'Stüdyo Çekim & Kiralama',
      icon: <Monitor color="var(--accent)" />,
      desc: 'Kendi bünyemizdeki profesyonel stüdyomuzda, en üst seviye ışık ve kamera ekipmanlarıyla markanız için stüdyo kalitesinde içerikler üretiyoruz. Ayrıca bağımsız ekipler ve markalar için tam donanımlı stüdyo kiralama hizmeti sunuyoruz. İster ürün çekimi, ister podcast, ister tanıtım filmi; profesyonel altyapımızla hizmetinizdeyiz.',
      media: [
        { type: 'image', url: studio1 },
        { type: 'image', url: studio2 }
      ]
    },
    {
      id: 'fotograf',
      title: 'Profesyonel Fotoğraf Çekimleri',
      icon: <Camera color="var(--accent)" />,
      desc: 'Markalara özel profesyonel fotoğraf hizmetleri sunuyoruz. Ürün, Yemek, Spor, Model, Emlak, E-ticaret, Katalog çekimleri gibi alanlarda geniş bir yelpazede kaliteli görseller sağlıyoruz. Her marka için özelleştirilmiş çözümler sunarak, ürünlerinizi en iyi şekilde sergiliyoruz.',
      media: [
        { type: 'image', url: 'https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/images/7.jpg' },
        { type: 'image', url: 'https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/images/8.jpg' },
        { type: 'image', url: 'https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/images/10.jpg' },
        { type: 'image', url: 'https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/images/11.jpg' }
      ]
    },
    {
      id: 'video-prod',
      title: 'Video Prodüksiyonu',
      icon: <Video color="#ff0055" />,
      desc: 'Modern medya dünyasında, yüksek kaliteli ve yaratıcı videolar oluşturmak amacıyla en güncel ekipmanları kullanıyoruz. Her projede izleyicilere benzersiz deneyimler sunmayı hedefliyoruz. Yenilikçi ve dinamik bir bakış açısıyla her videoda yeni hikayeler keşfediyoruz.',
      media: [
        { type: 'video', url: 'https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/IMG_9157.mov' },
        { type: 'video', url: 'https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/IMG_8598.mov' },
        { type: 'video', url: 'https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/IMG_7877.mp4' },
        { type: 'video', url: 'https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/IMG_8554.mov' }
      ]
    },
    {
      id: 'sunuculu',
      title: 'Sunuculu Tanıtım Videoları',
      icon: <Mic color="var(--primary)" />,
      desc: 'Ürün veya hizmetlerinizi profesyonel sunucular eşliğinde, güven veren ve ikna edici bir dille anlatıyoruz. Teknik detayları anlaşılır kılan, marka samimiyetini artıran ve dönüşüm oranlarını doğrudan etkileyen yüksek kaliteli video içerikleri üretiyoruz.',
      media: [
        { type: 'video', url: 'https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/sequence-kurumsal.mp4' },
        { type: 'video', url: 'https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/sunucu-dogal.mp4' },
        { type: 'video', url: 'https://zpulnweiosxphibipxdp.supabase.co/storage/v1/object/public/site-assets/videos/sunucu1.mp4' }
      ]
    },
    {
      id: 'ugc',
      title: 'UGC İçerik & Influencer Marketing',
      icon: <Smartphone color="#00e5ff" />,
      desc: 'Samimi ve doğal kullanıcı içerikleri (UGC) ile markanızın güvenilirliğini artırıyoruz. Doğru influencer eşleşmeleri ve stratejik içerik planlamasıyla, ürünlerinizi doğrudan hedef kitlenizin dilinden anlatıyor, etkileşim ve satış rakamlarınızı yukarı taşıyoruz.',
      media: [
        { type: 'image', url: ugc1 },
        { type: 'image', url: ugc2 },
        { type: 'image', url: ugc3 }
      ]
    }
  ];

  return (
    <div>
      {/* HERO SECTION */}
      <section className="services-page-hero">
        <div className="container">
          <h1 className="hero-title" style={{fontSize: '4rem', marginBottom: '20px'}}>
            Hizmetlerimiz
          </h1>
          <p className="hero-desc" style={{margin: '0 auto', maxWidth: '800px'}}>
            Dijital dünyada görünür olmak ve marka bilinirliğinizi artırmak için doğru adımları atmak şart. Her hizmetimizde kaliteyi ve estetiği birleştiriyoruz.
          </p>
        </div>
      </section>

      {/* ACCORDION SERVICES LIST */}
      <section className="section-padding" style={{paddingTop: '20px'}}>
        <div className="container">
          <div className="services-accordion">
            {servicesData.map((service) => (
              <div 
                key={service.id} 
                className={`accordion-item ${expandedId === service.id ? 'expanded' : ''}`}
              >
                <div 
                  className="accordion-header" 
                  onClick={() => toggleAccordion(service.id)}
                >
                  <div className="accordion-icon-wrap">
                    {service.icon}
                  </div>
                  <h2 className="accordion-title">{service.title}</h2>
                  <ChevronDown className="accordion-chevron" size={24} />
                </div>
                
                <div className="accordion-content">
                  <p className="service-desc-text">{service.desc}</p>
                  
                  {service.media.length > 0 && (
                    <div className="media-gallery">
                      {service.media.map((item, idx) => (
                        <div key={idx} className="media-item" onClick={() => openLightbox(service.media, idx)}>
                          {item.type === 'image' ? (
                            <img src={item.url} alt={`${service.title} ${idx}`} className="media-img" loading="lazy" />
                          ) : (
                            <div style={{ position: 'relative', height: '100%' }}>
                              <video src={item.url} className="media-video" muted playsInline loop onMouseEnter={e => e.target.play()} onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }} />
                              <div className="video-indicator">
                                <Play size={12} fill="currentColor" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* LIGHTBOX MODAL */}
      {lightbox.open && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <X size={32} />
          </button>
          
          <button className="lightbox-nav prev" onClick={prevMedia}>
            <ChevronLeft size={48} />
          </button>
          
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            {lightbox.media[lightbox.index].type === 'image' ? (
              <img src={lightbox.media[lightbox.index].url} alt="Lightbox Content" className="lightbox-media" />
            ) : (
              <video src={lightbox.media[lightbox.index].url} className="lightbox-media" controls autoPlay playsInline />
            )}
          </div>
          
          <button className="lightbox-nav next" onClick={nextMedia}>
            <ChevronRight size={48} />
          </button>

          <div className="lightbox-counter">
            {lightbox.index + 1} / {lightbox.media.length}
          </div>
        </div>
      )}

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
