import React, { useState, useEffect, useRef } from 'react';
import { 
  Dumbbell, 
  Camera, 
  MapPin, 
  TrendingUp, 
  ArrowRight, 
  Users, 
  Star,
  Zap,
  PlayCircle,
  Smartphone,
  Activity,
  Flame,
  Award,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LazySection from '../../components/LazySection';
const AnalysisForm = React.lazy(() => import('../../components/AnalysisForm'));
import FAQAccordion from '../../components/FAQAccordion';
import ShowcaseVideo from '../../components/ShowcaseVideo';

// Count-up animation hook
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

  // Parse value: separate prefix, numericPart, suffix
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

const GymMarketing = () => {
  const navigate = useNavigate();
  void navigate; // suppress unused warning

  const metrics = [
    { value: '5.2M+', label: 'Aylık Erişim', desc: 'Spor salonu müşterilerimiz için ürettiğimiz Reels ve TikTok içeriklerinin toplam erişim sayısı.' },
    { value: '%140', label: 'Üye Artışı', desc: 'Stratejik reklam kurgularımız ve form kampanyalarımız sonrası salonlardaki aktif üye büyümesi.' },
    { value: '11.5x', label: 'ROAS', desc: 'Spor ve fitness sektöründeki reklam harcamalarımızdan elde ettiğimiz dönüşüm başarısı.' },
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
          background: `linear-gradient(to bottom, rgba(5,5,5,0.7), #050505), url('/gym_marketing_hero.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.5,
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
              <Dumbbell size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.9rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>FİTNESS DİJİTAL BÜYÜME SİSTEMİ</span>
            </div>
            
            <h1 className="hero-title" style={{ fontSize: '4.5rem', lineHeight: '1.1', fontWeight: '900', marginBottom: '30px' }}>
              Spor Salonunuzun Üyeliklerini <span className="gradient-text">Dijitalden Dolduruyoruz.</span>
            </h1>
            
            <p className="hero-desc" style={{ fontSize: '1.25rem', color: '#ccc', maxWidth: '700px', lineHeight: '1.6' }}>
              Sadece içerik üretmiyoruz; motivasyon aşılayan sinematik videolar ve nokta atışı bölgesel reklam kurgularıyla salonunuza her gün yeni üyeler kazandırıyoruz.
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
              <h2 style={{ fontSize: '2.8rem', fontWeight: '900', marginBottom: '30px' }}>Neden <span className="gradient-text">Fitness Odaklı</span> Pazarlama?</h2>
              <p style={{ color: '#aaa', fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '30px' }}>
                Spor salonu seçimi tamamen motivasyon, güven ve atmosfer algısı üzerine kuruludur. Potansiyel üyeler salonunuzun Instagram profiline girdiğinde veya bir reklamla karşılaştığında 3 saniye içinde "Burada çalışmak beni motive eder mi?" sorusuna yanıt ararlar. Biz, bu kararı salonunuz lehine netleştiriyoruz.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(138,43,226,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Camera color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Sinematik Spor Prodüksiyonu</h4>
                    <p style={{ color: '#888', fontSize: '0.95rem' }}>Ekipman kalitenizi, salon atmosferini ve eğitmenlerinizin enerjisini yansıtan, hareket hissi veren dinamik çekimler.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin color="#00e5ff" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Bölgesel (GEO) Hedefleme</h4>
                    <p style={{ color: '#888', fontSize: '0.95rem' }}>Salonunuza 3 ila 5 km mesafede yaşayan, spor ve sağlıklı yaşamla ilgilenen kişilere yönelik yerel reklam stratejileri.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(255,0,85,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TrendingUp color="var(--secondary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Dönüşüm Odaklı Reklam Kampanyaları</h4>
                    <p style={{ color: '#888', fontSize: '0.95rem' }}>Sadece takipçi değil; üyelik kayıt kampanyaları, özel indirimler ve hedeflenmiş tekliflerle salonunuza doğrudan yeni üyeler getiren reklamlar.</p>
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
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '2px' }}>Çalıştığımız Salonlar</div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>Güvenilen Fitness Referanslarımız</div>
                </div>
              </div>

              {/* 2x2 Referans Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { name: 'FITFLOW\nSTUDIO', icon: Activity, color: '#c9a84c', shadow: 'rgba(201, 168, 76, 0.2)', tag: 'Pilates & Reformer' },
                  { name: 'IRON DOME\nGYM', icon: Dumbbell, color: '#e05252', shadow: 'rgba(224, 82, 82, 0.2)', tag: 'Fitness & Vücut Geliştirme' },
                  { name: 'CORE ZONE\nCROSSFIT', icon: Flame, color: '#00c896', shadow: 'rgba(0, 200, 150, 0.2)', tag: 'CrossFit & Fonksiyonel' },
                  { name: 'ATHLETIC\nACADEMY', icon: Award, color: '#00b4d8', shadow: 'rgba(0, 180, 216, 0.2)', tag: 'Performans & Kondisyon' },
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
                  Iron Dome Gym ile yaptığımız 3 aylık bölgesel reklam kampanyalarında aktif üyelikler <strong style={{ color: '#fff' }}>%160 arttı.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '50px', fontSize: '2.8rem', fontWeight: '900', lineHeight: '1.2' }}>Potansiyel Üyeleri Harekete Geçiren <span className="gradient-text">Reklam Kurgumuz</span></h2>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
            <div className="glass" style={{ width: '100%', borderRadius: '40px', padding: '15px', maxWidth: '360px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
              <ShowcaseVideo src="https://res.cloudinary.com/dqs6iconu/video/upload/v1779788810/spor_seko%CC%88ru%CC%88ne_o%CC%88zel_reklammp4_pm1irw.mp4" name="Spor Sektörüne Özel Reklam" />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title">Nokta Atışı <span className="gradient-text">Spor Salonu Çözümleri</span></h2>
            <p className="section-subtitle">Salonunuzun büyümesini otomatikleştiren dijital çözümler.</p>
          </div>
          
          <div className="services-grid">
            {[
              { icon: <Smartphone />, title: "Motivasyon Arttıran Reels", desc: "Trend müzikler and dinamik antrenman kurgularıyla yüksek izlenmeli video serileri." },
              { icon: <MapPin />, title: "Bölgesel GEO Reklamları", desc: "Salon çevresinde yaşayan ve spor yapma potansiyeli olan kişileri hedefleyen reklamlar." },
              { icon: <TrendingUp />, title: "Kayıt Odaklı Kampanyalar", desc: "Sezonluk fırsatlar ve özel üyelik paketleri için doğrudan satış getiren performans reklamları." },
              { icon: <Users />, title: "UGC & Eğitmen İçerikleri", desc: "Eğitmenlerinizin uzmanlığını ve üyelerinizin değişim hikayelerini öne çıkaran doğal paylaşımlar." },
              { icon: <PlayCircle />, title: "Hikaye ve Günlük Paylaşım", desc: "Günlük salon enerjisini, doluluk oranını ve anlık motivasyonu gösteren hikaye yönetimi." },
              { icon: <Star />, title: "Kurumsal Üyelik Tasarımları", desc: "Broşürlerden dijital kartlara, salonunuzun görsel kimliğine değer katan tüm grafik çalışmaları." }
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
              question: "Spor salonu çekimleri üyeleri rahatsız eder mi?",
              answer: "Çekimlerimizi genellikle salonun en sakin olduğu saatlerde (örneğin sabah erken veya öğle saatleri) planlıyoruz. Üyelerin kişisel alanlarına saygı duyarak, izinleri dahilinde profesyonel ve konforlu bir çekim süreci yürütüyoruz."
            },
            {
              question: "Reklam bütçemizi nasıl yönetiyorsunuz?",
              answer: "Bütçenizi salonun konumuna yakın (3-5 km yarıçapında) yaşayan ve sporla aktif olarak ilgilenen potansiyel kitleye odaklayarak minimum maliyetle maksimum üye kazanımı sağlıyoruz."
            },
            {
              question: "Sosyal medya hesaplarımızın günlük yönetimini de yapıyor musunuz?",
              answer: "Evet, sadece reklam çıkmıyoruz. Aylık içerik planının hazırlanması, hazırlanan Reels ve postların paylaşılması, hikaye yönetimi ve gelen mesaj/yorumların karşılanması gibi tüm sosyal medya yönetim sürecini de üstleniyoruz."
            }
          ]} />
        </div>
      </section>

      {/* CTA & FORM */}
      <section className="section-padding" id="funnel" style={{ background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '20px' }}>Salonunuzu <span className="gradient-text">Birlikte Büyütelim.</span></h2>
            <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto' }}>
              Ücretsiz analiz formunu doldurun, ekibimiz salonunuzun dijital potansiyelini çıkarsın ve üye kazanım planını hazırlasın.
            </p>
          </div>
          
          <LazySection height="350px">
            <React.Suspense fallback={
              <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            }>
              <AnalysisForm defaultService="Spor Salonu Pazarlaması" />
            </React.Suspense>
          </LazySection>
        </div>
      </section>
    </div>
  );
};

export default GymMarketing;
