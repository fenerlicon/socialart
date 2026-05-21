import React, { useState, useEffect, useRef } from 'react';
import { 
  Utensils, 
  Camera, 
  MapPin, 
  TrendingUp, 
  ArrowRight, 
  Users, 
  Star,
  Zap,
  PlayCircle,
  Smartphone,
  Wine,
  ChefHat,
  Award,
  Fish
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalysisForm from '../../components/AnalysisForm';
import FAQAccordion from '../../components/FAQAccordion';
import ShowcaseVideo from '../../components/ShowcaseVideo';

// Count-up animasyon hook'u
function useCountUp(target, duration = 2000, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return count;
}

function AnimatedMetric({ value, label, desc, delay = 0 }) {
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  // Değeri parse et: prefix, numericPart, suffix ayır
  const match = value.match(/^([^\d]*?)([\d.]+)([^\d]*)$/);
  const prefix = match ? match[1] : '';
  const numericStr = match ? match[2] : value;
  const suffix = match ? match[3] : '';
  const numeric = parseFloat(numericStr);
  const isFloat = numericStr.includes('.');

  const displayed = useCountUp(isFloat ? Math.round(numeric * 10) : numeric, 2000, started);
  const displayValue = isFloat
    ? `${prefix}${(displayed / 10).toFixed(1)}${suffix}`
    : `${prefix}${displayed}${suffix}`;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setStarted(true), delay); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: '3.5rem',
        fontWeight: '900',
        color: 'var(--primary)',
        marginBottom: '5px',
        transition: 'opacity 0.3s',
        fontVariantNumeric: 'tabular-nums'
      }}>
        {started ? displayValue : value}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '10px' }}>{label}</div>
      <p style={{ color: '#888', fontSize: '0.9rem' }}>{desc}</p>
    </div>
  );
}

const RestaurantMarketing = () => {
  const navigate = useNavigate();
  void navigate; // suppress unused warning

  const metrics = [
    { value: '3.4M+', label: 'Aylık İzlenme', desc: 'Restoran müşterilerimiz için ürettiğimiz Reels içeriklerinin toplam erişimi.' },
    { value: '%185', label: 'Rezervasyon Artışı', desc: 'Stratejik reklam kurgularımız sonrası markalarımızdaki ortalama büyüme.' },
    { value: '14.2x', label: 'ROAS', desc: 'Yemek sektöründeki reklam harcamalarımızdan elde edilen dönüşüm başarısı.' },
  ];

  return (
    <div className="service-detail-page" style={{ background: '#050505', color: '#fff' }}>
      {/* HERO SECTION */}
      <section className="hero" style={{ 
        position: 'relative', 
        paddingTop: '280px', 
        paddingBottom: '120px',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(to bottom, rgba(5,5,5,0.7), #050505), url('/restaurant_marketing_hero.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.6,
          zIndex: 0
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '850px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '10px', 
              background: 'rgba(255,255,255,0.05)', 
              padding: '8px 16px', 
              borderRadius: '100px',
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '30px'
            }}>
              <Utensils size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.9rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>GASTRONOMİ DİJİTAL BÜYÜME SİSTEMİ</span>
            </div>
            
            <h1 className="hero-title" style={{ fontSize: '4.5rem', lineHeight: '1.1', fontWeight: '900', marginBottom: '30px' }}>
              Restoranınızın Masalarını <span className="gradient-text">Dijitalden Dolduruyoruz.</span>
            </h1>
            
            <p className="hero-desc" style={{ fontSize: '1.25rem', color: '#ccc', maxWidth: '700px', lineHeight: '1.6' }}>
              Sadece fotoğraf çekmiyoruz; iştah kabartan sinematik içerikler ve veri odaklı reklam kurguları ile restoranınızın kapısında kuyruklar oluşturuyoruz.
            </p>
            
            <div className="hero-actions" style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
              <button className="btn btn-primary btn-large" onClick={() => document.getElementById('funnel').scrollIntoView({ behavior: 'smooth' })}>
                Hemen Ücretsiz Analiz Alın <ArrowRight size={20} style={{ marginLeft: '10px' }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
            {metrics.map((m, i) => (
              <AnimatedMetric key={i} value={m.value} label={m.label} desc={m.desc} delay={i * 150} />
            ))}
          </div>
        </div>
      </section>

      {/* CORE STRATEGY */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '60px', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2.8rem', fontWeight: '900', marginBottom: '30px' }}>Neden <span className="gradient-text">Gastronomi Odaklı</span> Pazarlama?</h2>
              <p style={{ color: '#aaa', fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '30px' }}>
                Yemek sektörü görsel algı üzerine kuruludur. Kullanıcılar bir restoranın Instagram profiline girdiğinde 3 saniye içinde "Buraya gitmeli miyim?" sorusuna yanıt ararlar. Biz, bu 3 saniyeyi bir satış fırsatına dönüştürüyoruz.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(138,43,226,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Camera color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Gastronomi Prodüksiyonu</h4>
                    <p style={{ color: '#888', fontSize: '0.95rem' }}>Işıklandırmadan sunuma, yemeğin dokusunu ve lezzetini ekrandan hissettirecek sinematik çekimler.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin color="#00e5ff" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>GEO & Google Maps Optimizasyonu</h4>
                    <p style={{ color: '#888', fontSize: '0.95rem' }}>"Yakınımdaki restoranlar" aramalarında en üst sırada çıkmanızı sağlayan yerel SEO stratejileri.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(255,0,85,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TrendingUp color="var(--secondary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Performans Reklamcılığı</h4>
                    <p style={{ color: '#888', fontSize: '0.95rem' }}>Sadece takipçi değil, rezervasyon ve kapıdan giren müşteri odaklı Meta & Google Ads yönetimi.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="glass" style={{ padding: '40px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {/* Referans Başlığı */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(138,43,226,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star color="#ffab00" fill="#ffab00" size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '2px' }}>Çalıştığımız Markalar</div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>Güvenilen Restoran Referanslarımız</div>
                </div>
              </div>

              {/* 2x2 Referans Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { name: 'VIP\nCATERING', icon: Wine, color: '#c9a84c', shadow: 'rgba(201, 168, 76, 0.2)', tag: 'Catering & Organizasyon' },
                  { name: 'TAŞDELEN\nKARADENİZ ET', icon: ChefHat, color: '#e05252', shadow: 'rgba(224, 82, 82, 0.2)', tag: 'Et Lokantası' },
                  { name: 'GURME\nBAHÇEŞEHİR', icon: Award, color: '#00c896', shadow: 'rgba(0, 200, 150, 0.2)', tag: 'Fine Dining' },
                  { name: 'EGE CUNDA\nBALIK', icon: Fish, color: '#00b4d8', shadow: 'rgba(0, 180, 216, 0.2)', tag: 'Balık Restoranı' },
                ].map((client, i) => {
                  const IconComponent = client.icon;
                  return (
                    <div key={i} style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: `1px solid rgba(255, 255, 255, 0.07)`,
                      borderRadius: '24px',
                      padding: '24px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.borderColor = client.color;
                      e.currentTarget.style.boxShadow = `0 12px 30px ${client.shadow}, inset 0 0 12px ${client.shadow}`;
                      const wrapper = e.currentTarget.querySelector('.ref-icon-wrapper');
                      if (wrapper) {
                        wrapper.style.transform = 'scale(1.1)';
                        wrapper.style.background = client.color;
                        wrapper.style.color = '#000';
                        wrapper.style.boxShadow = `0 0 15px ${client.color}`;
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                      e.currentTarget.style.boxShadow = 'none';
                      const wrapper = e.currentTarget.querySelector('.ref-icon-wrapper');
                      if (wrapper) {
                        wrapper.style.transform = 'scale(1)';
                        wrapper.style.background = 'rgba(255, 255, 255, 0.05)';
                        wrapper.style.color = client.color;
                        wrapper.style.boxShadow = 'none';
                      }
                    }}
                    >
                      <div className="ref-icon-wrapper" style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid rgba(255, 255, 255, 0.1)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: client.color,
                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      }}>
                        <IconComponent size={26} />
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#fff', lineHeight: '1.3', whiteSpace: 'pre-line', letterSpacing: '0.5px' }}>{client.name}</div>
                        <div style={{ fontSize: '0.68rem', fontWeight: '800', color: client.color, letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>{client.tag}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Alt not */}
              <div style={{ marginTop: '22px', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e676', flexShrink: 0, boxShadow: '0 0 6px #00e676' }} />
                <p style={{ color: '#888', fontSize: '0.82rem', margin: 0, lineHeight: '1.5' }}>
                  Karadeniz Et Lokantası ile çalışmamızda hafta sonu rezervasyonları <strong style={{ color: '#fff' }}>%120 arttı.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Showcase */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '50px', fontSize: '2.8rem', fontWeight: '900' }}>Örnek <span className="gradient-text">Çalışmalarımız</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', margin: '40px 0' }}>
            {[
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/v1779304529/anne_n43ygw.mp4", name: "Restoran Örneği 1" },
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/v1779304523/R%C3%B6portaj_pgeurw.mov", name: "Restoran Örneği 2" },
              { url: "https://res.cloudinary.com/dqs6iconu/video/upload/v1779304500/iftar_ljxvdx.mp4", name: "Restoran Örneği 3" }
            ].map((video, idx) => (
              <div key={idx} className="glass" style={{ width: '100%', borderRadius: '40px', padding: '15px', maxWidth: '320px', margin: '0 auto', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                <ShowcaseVideo src={video.url} name={video.name} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title">Nokta Atışı <span className="gradient-text">Restoran Çözümleri</span></h2>
            <p className="section-subtitle">Markanızın ihtiyacı olan tüm dijital silahlar burada.</p>
          </div>
          
          <div className="services-grid">
            {[
              { icon: <Smartphone />, title: "İştah Açan Reels", desc: "Trend müzikler ve dinamik kurgularla milyonlara ulaşacak video serileri." },
              { icon: <MapPin />, title: "Yerel SEO (GEO)", desc: "Çevrede yemek arayan potansiyel müşterilerin sizi bulmasını sağlıyoruz." },
              { icon: <Zap />, title: "Hızlı Rezervasyon", desc: "Instagram üzerinden tek tıkla rezervasyon alabileceğiniz entegrasyonlar." },
              { icon: <Users />, title: "Influencer Tadımları", desc: "Gastronomi dünyasının etkili isimleriyle markanızı buluşturuyoruz." },
              { icon: <PlayCircle />, title: "Hikaye Yönetimi", desc: "Günlük 'story' paylaşımları ile takipçilerinizi her an masanıza davet ediyoruz." },
              { icon: <Star />, title: "Menü Tasarımı", desc: "QR menü ve basılı menülerinizi dijital kimliğinizle uyumlu hale getiriyoruz." }
            ].map((s, i) => (
              <div key={i} className="glass" style={{ padding: '35px', borderRadius: '24px' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '20px' }}>{s.icon}</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>{s.title}</h3>
                <p style={{ color: '#888', fontSize: '0.95rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="section-padding">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '60px' }}>Sıkça Sorulan <span className="gradient-text">Sorular</span></h2>
          <FAQAccordion items={[
            {
              question: "Restoran çekimleri ne kadar sürüyor?",
              answer: "İçerik planına göre değişmekle birlikte genellikle 1 tam gün çekim, tüm ayın içerik ihtiyacını (Reels, post, story) karşılamak için yeterli olmaktadır."
            },
            {
              question: "Reklam bütçemizi nasıl yönetiyorsunuz?",
              answer: "Bütçenizi en yoğun olduğunuz saatlere değil, masalarınızın daha boş olduğu veya özel etkinlikler düzenlediğiniz zamanlara odaklayarak verimliliği artırıyoruz."
            },
            {
              question: "Influencer iş birlikleri nasıl yapılıyor?",
              answer: "Markanıza ve kitlenize en uygun olan 'foodie' hesapları ekiplerimiz seçer, tadım organizasyonunu yapar ve paylaşılan içeriğin performansını raporlar."
            }
          ]} />
        </div>
      </section>

      {/* CTA & FORM */}
      <section className="section-padding" id="funnel" style={{ background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '20px' }}>Restoranınızı <span className="gradient-text">Birlikte Büyütelim.</span></h2>
            <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
              Ücretsiz analiz formunu doldurun, ekibimiz restoranınızın dijital potansiyelini çıkarsın.
            </p>
          </div>
          
          <AnalysisForm defaultService="Restoran Pazarlaması" />
        </div>
      </section>
    </div>
  );
};

export default RestaurantMarketing;
