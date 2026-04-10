import React from 'react';
import { Check, ShieldCheck, Zap, Star, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Pricing() {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Eko Paket",
      price: "36.000",
      description: "Belirli oturmuş kitlesi olan markaları Sosyal medyada canlı tutmak ve kaliteli bir vitrin oluşturmak için ideal.",
      features: [
        "4 Adet Reels",
        "4 Adet Statik veya Carousel Post",
        "30 Adet Story",
        "Sosyal Medya ve Reklam yönetimi",
        "Sunum ve Raporlamalar"
      ],
      color: "var(--primary)",
      icon: <MessageSquare size={30} color="var(--primary)" />,
      checkoutUrl: "https://www.socialartajans.com/pricing-plans/checkout-1?planId=10ad2a47-dd37-49c1-95d6-25b31b4f0621&checkoutFlowId=3c78ba8a-82c6-41be-a5f5-38a6ecfa5ff1"
    },
    {
      name: "Business Paket",
      price: "46.000",
      description: "Markasını sosyal medyada hızlıca var etmek ve Marka algısı inşa etmek isteyenler için ideal.",
      features: [
        "8 Adet Reels",
        "60 Adet Story",
        "4 Adet Statik veya Carousel Post",
        "4 Adet Grafik Tasarım",
        "Sayfa tasarımı ve Creative marka tasarımı",
        "Sosyal medya ve Yönetimi",
        "Reklam Yönetimi ve Stratejisi",
        "Sunum ve raporlamalar"
      ],
      color: "var(--accent)",
      icon: <Zap size={30} color="var(--accent)" />,
      featured: true,
      checkoutUrl: "https://www.socialartajans.com/pricing-plans/checkout-1?planId=7ef2bef6-4068-4a43-b33c-7699fddb4129&checkoutFlowId=ab3c263f-3ff6-4621-aea2-6101a5660d57"
    },
    {
      name: "Booster Paket",
      price: "110.000",
      description: "Markasına Sosyal medyada ve web de agresif büyüme hızı isteyen ve tam kapsamlı ajans hizmeti almak isteyenler için ideal.",
      features: [
        "10 Adet Reels",
        "90 Adet Story (Günde 3 Adet)",
        "4 Adet Statik veya Carousel Post",
        "4 Adet Grafik Tasarım Postu",
        "Ürün Fotoğrafı Çekimi",
        "Tanıtım Filmi",
        "Sosyal Medya Yönetimi",
        "Sayfa Tasarımı ve Creative Marka Tasarımı",
        "Reklam Yönetimi ve Stratejisi",
        "Google Ads SEO, SEM ve CRM yönetimi",
        "Sunum ve Raporlamalar",
        "Piyasa ve Rakip analizi"
      ],
      color: "var(--secondary)",
      icon: <Star size={30} color="var(--secondary)" />,
      checkoutUrl: "https://www.socialartajans.com/pricing-plans/checkout-1?planId=9c55bc33-dfe2-4e13-bf2c-d4079154142a&checkoutFlowId=5fc4ed41-3cb9-497f-a210-3b925fe27a7f"
    }
  ];

  return (
    <div style={{ padding: '150px 0 100px 0', background: 'var(--bg-color)' }}>
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}>
            Markanız İçin <span className="gradient-text">Doğru Planı</span> Seçin
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
            Sosyal medya varlığınızı güçlendirmek ve dijitalde agresif büyüme yakalamak için uzmanlığımızla hazırlanan aylık paketler.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className="glass" 
              style={{ 
                borderRadius: '32px', 
                padding: '40px', 
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'column',
                border: plan.featured ? `2px solid ${plan.color}` : '1px solid var(--surface-border)',
                transform: plan.featured ? 'scale(1.05)' : 'none',
                zIndex: plan.featured ? 2 : 1,
                boxShadow: plan.featured ? `0 20px 50px rgba(0, 229, 255, 0.15)` : 'none'
              }}
            >
              {plan.featured && (
                <div style={{ position: 'absolute', top: '20px', right: '20px', background: plan.featured ? plan.color : '#333', color: '#000', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>
                  En Çok Tercih Edilen
                </div>
              )}

              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {plan.icon}
              </div>

              <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px' }}>{plan.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '30px', minHeight: '60px', lineHeight: '1.5' }}>{plan.description}</p>
              
              <div style={{ marginBottom: '40px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff' }}>₺ {plan.price}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}> / Ay</span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: '700', marginBottom: '20px', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Neler Dahil?</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <Check size={18} color={plan.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: '#ddd', fontSize: '0.95rem', lineHeight: '1.4' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => window.location.href = plan.checkoutUrl} 
                style={{ 
                  marginTop: '40px', 
                  width: '100%', 
                  padding: '18px', 
                  borderRadius: '16px', 
                  background: plan.featured ? plan.color : 'rgba(255,255,255,0.05)', 
                  color: plan.featured ? '#000' : '#fff',
                  fontWeight: '800',
                  fontSize: '1rem',
                  border: plan.featured ? 'none' : '1px solid #333',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  if(!plan.featured) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  } else {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if(!plan.featured) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  } else {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                Paketi Seç ve Başla <ArrowRight size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="glass" style={{ marginTop: '80px', borderRadius: '32px', padding: '50px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '20px' }}>Size Özel Bir Plan mı Lazım?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 30px' }}>
            Kurumsal markalar veya çok kanallı projeleriniz için size özel bir strateji ve fiyatlandırma hazırlayabiliriz.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/#funnel')}>Hemen Bizimle İletişime Geçin</button>
        </div>

      </div>
    </div>
  );
}

export default Pricing;
