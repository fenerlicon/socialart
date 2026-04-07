import React from 'react';
import { 
  Camera, 
  Globe, 
  ArrowRight,
  TrendingUp,
  Share2,
  Video,
  Users,
  Play,
  BarChart3,
  Star,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedDateStr, setSelectedDateStr] = React.useState('');
  const [selectedTimeStr, setSelectedTimeStr] = React.useState('');

  const today = new Date();
  const [displayedMonth, setDisplayedMonth] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const daysInMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = displayedMonth.getDay(); // Sunday is 0. Transform to Monday=0
  const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  
  const handlePrevMonth = () => {
    if (displayedMonth.getFullYear() === today.getFullYear() && displayedMonth.getMonth() === today.getMonth()) return;
    setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = () => setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1));

  // Toplantı (Analiz) Saat Slotları
  const timeSlots = ["11:00 - 12:00", "15:00 - 16:00", "16:00 - 17:00"];

  React.useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const services = [
    { title: 'Instagram Büyütme', desc: 'Reels, hikayeler, carousel postlar ile organik etkileşimi maksimize edin.', icon: <Share2 className="service-icon" style={{color: 'var(--secondary)'}} /> },
    { title: 'YouTube Prodüksiyon', desc: 'Kanal yönetimi, video optimizasyonu ve ileri seviye kurgu hizmetleri.', icon: <Video className="service-icon" style={{color: '#ff0000'}} /> },
    { title: 'Nitelikli Müşteri Kazanımı', desc: 'Doğrudan satışa yönelik dijital stratejilerle markanıza sürekli yeni müşteriler (lead) kazandırın.', icon: <Users className="service-icon" style={{color: '#0a66c2'}} /> },
    { title: 'Kreatif Çekimler', desc: 'Yemek, emlak, otel ve ürün fotoğrafçılığı ile estetiği yakalayın.', icon: <Camera className="service-icon" style={{color: 'var(--accent)'}} /> },
    { title: 'Kurumsal Kimlik Oluşturma', desc: 'Logo, kurumsal evraklar ve dijitaldeki duruşunuzu güçlendirecek özgün tasarımlar.', icon: <Globe className="service-icon" style={{color: 'var(--primary)'}} /> },
    { title: '360° Sosyal Medya', desc: 'Reklam, içerik planlaması ve profesyonel hesap yönetimi.', icon: <TrendingUp className="service-icon" style={{color: 'var(--secondary)'}} /> }
  ];

  const caseStudies = [
    {
      brand: 'PEUGEOT Turkey',
      industry: 'Otomotiv',
      growth: '%450',
      label: 'Test Sürüşü Talebi Artışı',
      before: 'Aylık 200 Talep',
      after: 'Aylık 1.100 Talep'
    },
    {
      brand: 'Flormar',
      industry: 'Kozmetik',
      growth: '%300',
      label: 'ROAS İyileşmesi (ROI)',
      before: '2.5 ROAS',
      after: '7.5 ROAS'
    },
    {
      brand: 'Z Trendyol Satıcısı',
      industry: 'E-Ticaret',
      growth: '1M',
      label: 'Video Görüntülenme',
      before: '20.000 İzlenme',
      after: '1.200.000 İzlenme'
    }
  ];

  const partners = [
    "KOTON", "JEEP", "PEUGEOT", "Gurme Bahçeşehir", "Eray Gıda", "Flormar",
    "Sahne Marin", "EGE CUNDA BALIK", "Smart Enerji", "Polar", "Enova Eğitim",
    "Indian Motorcycle", "S.E.T.S", "Allure Deluxe Beauty", "Funfest",
    "DUMA DUMA", "216 Dizayn", "good&mood", "MapOfX", "Cosentino", "Geberit",
    "Karadeniz Et", "SRG"
  ];

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        
        <div className="container" style={{ position: 'relative' }}>
          <div className="hero-content">
            <h1 className="hero-title">
              Hedef Kitlenizi <span className="gradient-text">Müşteriye</span> Dönüştürün
            </h1>
            <p className="hero-desc">
              Doğru strateji, güçlü içerik ve data odaklı reklamlarla markanızın dijitaldeki potansiyelini zirveye taşıyalım. Ücretsiz hesap analizinizi anında başlatın.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-pulse" onClick={() => scrollToSection('funnel')}>
                Markamı Ücretsiz Analiz Et
              </button>
              <button className="btn btn-outline" onClick={() => scrollToSection('cases')}>
                Başarı Hikayelerimizi İncele <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BRANDS MARQUEE */}
      <section className="brands-section">
        <div className="container">
          <div className="brands-title">BİZE GÜVENEN GLOBAL VE YEREL MARKALAR</div>
          <div className="brand-ticker-wrap">
            <div className="brand-track">
              {partners.map((p, i) => <div className="brand-item" key={`t1-${i}`}>{p}</div>)}
            </div>
            <div className="brand-track">
              {partners.map((p, i) => <div className="brand-item" key={`t2-${i}`}>{p}</div>)}
            </div>
          </div>
        </div>
      </section>

      {/* SHOWREEL VIDEO */}
      <section className="section-padding" id="showreel" style={{ paddingBottom: '0' }}>
        <div className="container">
          <h2 className="section-title">Marka <span className="gradient-text">Showreel</span></h2>
          <p className="section-subtitle">Stratejilerimiz, yaratıcı içeriklerimiz ve prodüksiyon başarılarımızı izleyin.</p>
          <div className="showreel-wrap">
            <iframe 
              className="showreel-iframe" 
              src="https://www.youtube.com/embed/6pB6_H8XzYc?autoplay=0&mute=1" 
              title="Socialart Ajans Showreel" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        </div>
      </section>

      {/* VIDEO TESTIMONIALS & REVIEWS */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <h2 className="section-title">Müşteri <span className="gradient-text">Yorumları</span></h2>
          <p className="section-subtitle">Sosyal Art Ajans olarak markaların başarı hikayelerinin bir parçası olmaktan gurur duyuyoruz.</p>
          
          <div className="testi-grid">
            <div>
              <div className="video-testi">
                <div className="play-btn">
                  <Play size={24} fill="#fff" style={{marginLeft: '4px'}} />
                </div>
              </div>
              <h4 style={{fontSize: '1.2rem', marginBottom: '8px'}}>A Güzellik Akademisi</h4>
              <p style={{color: 'var(--text-muted)'}}>"Sadece 3 ayda müşteri kitlemiz ikiye katlandı. Videolu reklam stratejileri inanılmazdı."</p>
            </div>
            
            <div className="testi-card">
              <div style={{display:'flex', gap:'5px', color:'gold', marginBottom:'15px'}}>
                <Star size={16} fill="gold" /> <Star size={16} fill="gold" /> <Star size={16} fill="gold" /> <Star size={16} fill="gold" /> <Star size={16} fill="gold" />
              </div>
              <p className="testi-text">"Harika bir ekip. Sosyal medya yönetimini ele aldıkları ilk günden itibaren hem etkileşimimiz arttı hem de kurumsal kimliğimiz tamamen değişti. ROAS oranımız 6.0'a dayandı."</p>
              <div className="testi-author">
                <div className="testi-avatar">M</div>
                <div>
                  <h4 style={{fontSize:'1rem'}}>Mehmet Y.</h4>
                  <span style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>Kurucu, XYZ Teknoloji</span>
                </div>
              </div>
            </div>

            <div className="testi-card">
              <div style={{display:'flex', gap:'5px', color:'gold', marginBottom:'15px'}}>
                <Star size={16} fill="gold" /> <Star size={16} fill="gold" /> <Star size={16} fill="gold" /> <Star size={16} fill="gold" /> <Star size={16} fill="gold" />
              </div>
              <p className="testi-text">"Kampanyalar ve web sitemizin yenilenmesi sayesinde e-ticaret satışlarımız %300 arttı. Ekibin yenilikçi bakış açısı ve profesyonelliği için teşekkür ederiz."</p>
              <div className="testi-author">
                <div className="testi-avatar">A</div>
                <div>
                  <h4 style={{fontSize:'1rem'}}>Ayşe K.</h4>
                  <span style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>Pazarlama Müdürü</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="section-padding" id="services">
        <div className="container">
          <h2 className="section-title">Neler Yapıyoruz?</h2>
          <div className="services-grid">
            {services.map((srv, idx) => (
              <div className="service-card" key={idx} style={{ background: 'var(--surface)' }}>
                {srv.icon}
                <h3 className="service-title">{srv.title}</h3>
                <p className="service-desc">{srv.desc}</p>
              </div>
            ))}
          </div>
          <div style={{textAlign: 'center', marginTop: '40px'}}>
             <button className="btn btn-outline" onClick={() => navigate('/hizmetlerimiz')}>Tüm Hizmetlerimizi İncele <ArrowRight size={20} /></button>
          </div>
        </div>
      </section>

      {/* KAMPANYALAR */}
      <section className="campaigns-section" id="kampanyalar" style={{background: 'rgba(255,255,255,0.02)'}}>
        <div className="container">
          <h2 className="section-title">Size Özel <span className="gradient-text">Fırsatlar</span></h2>
          <p className="section-subtitle">Aylık değil, vizyon odaklı uzun vadeli büyüme destekleri!</p>
          
          <div className="campaign-grid">
            
            <div className="campaign-card">
              <div className="campaign-badge">GARANTİ</div>
              <div className="campaign-icon">
                <ShieldCheck size={30} color="var(--primary)" />
              </div>
              <h3 className="campaign-title">%50 İade Garantisi!</h3>
              <p className="campaign-desc">
                Minimum 6 aylık iş birliğinde tam kapsamlı hizmetlerimizden memnun kalmazsanız, ücretinizin yarısını iade ediyoruz! Sizi büyütmek konusundaki özgüvenimizin bir kanıtı.
              </p>
              <button className="btn btn-outline" style={{width: '100%', justifyContent: 'center', color: '#ffffff'}} onClick={() => scrollToSection('funnel')}>
                Detayları İncele
              </button>
            </div>
            
            <div className="campaign-card" style={{border: '1px solid rgba(255,0,85,0.3)', background: 'linear-gradient(135deg, rgba(255,0,85,0.1) 0%, rgba(20,20,20,1) 100%)'}}>
               <div className="campaign-badge" style={{background: 'var(--primary)'}}>ÖDEME</div>
              <div className="campaign-icon">
                <CreditCard size={30} color="var(--secondary)" />
              </div>
              <h3 className="campaign-title">6 Taksit Avantajı</h3>
              <p className="campaign-desc">
                İster tek seferlik projelerimizde ister düzenli olarak devam eden hizmetlerimizde maliyetlerinizi düşünen 6 taksite kadar benzersiz esnek ödeme kolaylığı!
              </p>
              <button className="btn btn-primary" style={{width: '100%', justifyContent: 'center', boxShadow: 'none'}} onClick={() => scrollToSection('funnel')}>
                Teklif Alın <ArrowRight size={20} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* FUNNEL CTA: ÜCRETSİZ ANALİZ */}
      <section className="funnel-form-section" id="funnel">
        <div className="container">
          <h2 className="section-title">Markanız İçin <span className="gradient-text">Ücretsiz Analiz</span></h2>
          <p className="section-subtitle" style={{color: '#ddd', margin: '0 auto'}}>
            Uzman ekibimiz mevcut durumunuzu analiz etsin ve size özel büyüme stratejisi içeren bir rapor sunsun.
          </p>
          
          <div className="form-box">
            <h3 style={{fontSize: '1.5rem', marginBottom: '30px', fontWeight: '700', color: '#fff'}}>Sizi Arayalım!</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert('Talebiniz alınmıştır! Ekibimiz sizinle iletişime geçecek.'); }}>
              <div className="input-group">
                <label>Adınız Soyadınız</label>
                <input type="text" placeholder="Örn: Ahmet Yılmaz" required />
              </div>
              <div className="input-group">
                <label>Telefon Numaranız</label>
                <input 
                  type="tel" 
                  placeholder="05XX XXX XX XX" 
                  required 
                  pattern="[0-9]*" 
                  inputMode="numeric"
                  onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
                />
              </div>
              <div className="input-group">
                <label>E-posta Adresiniz</label>
                <input 
                  type="email" 
                  placeholder="ornek@sirket.com" 
                  required 
                  pattern=".*@.*" 
                  title="Lütfen geçerli bir e-posta adresi giriniz"
                />
              </div>
              <div className="input-group">
                <label>Web Siteniz / Sosyal Medya Hesabınız</label>
                <input type="text" placeholder="instagram.com/markaniz" required />
              </div>
              <div className="input-group">
                <label style={{marginBottom: '10px', display: 'block', fontWeight: '500'}}>İlgilendiğiniz Hizmetler (Birden fazla seçebilirsiniz)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                  {[
                    "Video prodüksiyon hizmeti istiyorum",
                    "Fotoğraf çekimi istiyorum",
                    "Sosyal Medya ve Reklam Yönetimi istiyorum",
                    "Tek seferlik Tanıtım Filmi çektirmek istiyorum",
                    "Grafik tasarım hizmeti almak istiyorum",
                    "UGC İçerik Hizmeti istiyorum",
                    "Influencer Marketing istiyorum"
                  ].map((srv, i) => (
                    <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', color: '#ddd', lineHeight: '1.4' }}>
                      <input type="checkbox" name="services" value={srv} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }} />
                      {srv}
                    </label>
                  ))}
                </div>
              </div>
              
              {/* TAKVİM - RANDEVU ALANI (CUSTOM UI) */}
              <div className="input-group" style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--surface-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <label style={{marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.2rem', color: '#fff'}}>
                  📅 Online Toplantı Planla
                </label>
                
                {/* Date Monthly Picker */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Uygun Bir Tarih Seçin</label>
                  
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <button type="button" onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: (displayedMonth.getFullYear() === today.getFullYear() && displayedMonth.getMonth() === today.getMonth()) ? 0.3 : 1, fontSize: '1.2rem', padding: '0 10px' }}>&lt;</button>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{monthNames[displayedMonth.getMonth()]} {displayedMonth.getFullYear()}</div>
                      <button type="button" onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', padding: '0 10px' }}>&gt;</button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center', marginBottom: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                      <div>Pzt</div><div>Sal</div><div>Çar</div><div>Per</div><div>Cum</div><div>Cmt</div><div>Paz</div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
                      {Array.from({length: startDayIndex}).map((_, i) => <div key={`empty-${i}`}></div>)}
                      
                      {Array.from({length: daysInMonth}).map((_, i) => {
                        const d = i + 1;
                        const cellDate = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), d);
                        const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
                        const isDisabled = isPast || isWeekend;
                        
                        const monthStr = String(displayedMonth.getMonth() + 1).padStart(2, '0');
                        const dayStr = String(d).padStart(2, '0');
                        const keyStr = `${displayedMonth.getFullYear()}-${monthStr}-${dayStr}`;
                        
                        const isSelected = selectedDateStr === keyStr;
                        return (
                          <div 
                            key={d} 
                            onClick={() => !isDisabled && setSelectedDateStr(keyStr)}
                            style={{ 
                              padding: '10px 0', 
                              borderRadius: '8px', 
                              textAlign: 'center', 
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                              color: isSelected ? '#000' : (isDisabled ? '#444' : '#fff'),
                              fontWeight: isSelected ? '800' : '500',
                              border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                              transition: 'all 0.2s',
                              opacity: isDisabled ? 0.3 : 1
                            }}
                          >
                            {d}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <input type="text" required value={selectedDateStr} onChange={()=>{}} style={{height: 0, width: 0, border: 0, padding: 0, margin: 0, opacity: 0}} />
                </div>

                {/* Time Slots */}
                <div style={{ opacity: selectedDateStr ? 1 : 0.3, pointerEvents: selectedDateStr ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'block' }}>Saat Dilimi Seçin</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px' }}>
                    {timeSlots.map(time => {
                      const isSelected = selectedTimeStr === time;
                      return (
                        <div 
                          key={time}
                          onClick={() => setSelectedTimeStr(time)}
                          style={{
                            padding: '12px',
                            textAlign: 'center',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            background: isSelected ? 'var(--secondary)' : 'rgba(255,255,255,0.03)',
                            color: isSelected ? '#fff' : '#ccc',
                            fontWeight: '700',
                            border: isSelected ? '1px solid var(--secondary)' : '1px solid var(--surface-border)',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 5px 15px rgba(255,0,85,0.3)' : 'none'
                          }}
                        >
                          {time}
                        </div>
                      )
                    })}
                  </div>
                  <input type="text" required value={selectedTimeStr} onChange={()=>{}} style={{height: 0, width: 0, border: 0, padding: 0, margin: 0, opacity: 0}} />
                </div>
                
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '20px', fontStyle: 'italic', textAlign: 'center' }}>
                  * {selectedDateStr && selectedTimeStr ? <span style={{color: '#00e676'}}>Seçiminiz kaydedildi: {selectedDateStr} Saat: {selectedTimeStr}</span> : ' Lütfen yukarıdan uygun olduğunuz gün ve saati belirleyiniz.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', margin: '25px 0 15px 0' }}>
                <input type="checkbox" id="kvkkAccept" required style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }} />
                <label htmlFor="kvkkAccept" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', cursor: 'pointer', textAlign: 'left' }}>
                  Kişisel verilerimin <a href="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>KVKK ve Gizlilik Politikası</a> kapsamında işlenmesini ve iletişim adreslerime duyuru, kampanya ve bilgilendirme iletileri gönderilmesini onaylıyorum.
                </label>
              </div>

              <button type="submit" className="cta-button" style={{width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '5px'}}>
                Ücretsiz Analiz İstiyorum
              </button>
              <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '20px', textAlign: 'center'}}>
                Bilgileriniz bizimle güvende. SPAM yapmıyoruz.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
