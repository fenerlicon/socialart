import React, { useState } from 'react';
import { Check, ShieldCheck, Zap, Star, MessageSquare, ArrowRight, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CheckoutModal from '../components/CheckoutModal';

function Pricing() {
  const navigate = useNavigate();
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const plans = [
    {
      name: "Eko Paket",
      price: "46.000",
      description: "Belirli oturmuş kitlesi olan markaları Sosyal medyada canlı tutmak ve kaliteli bir vitrin oluşturmak için ideal.",
      features: [
        "4 Adet Reels",
        "4 Adet Statik veya Carousel Post",
        "30 Adet Story",
        "Sosyal Medya ve Reklam Yönetimi",
        "Sunum ve Raporlamalar"
      ],
      color: "var(--primary)",
      icon: <MessageSquare size={30} color="var(--primary)" />
    },
    {
      name: "Business Paket",
      price: "60.000",
      description: "Markasını sosyal medyada hızlıca var etmek ve Marka algısı inşa etmek isteyenler için ideal.",
      features: [
        "8 Adet Reels",
        "60 Adet Story",
        "8 Adet Statik veya Carousel Post",
        "Sayfa tasarımı ve Creative marka tasarımı",
        "Sosyal Medya ve Yönetimi",
        "Reklam Yönetimi ve Stratejisi",
        "Sunum ve Raporlamalar",
        "Piyasa ve Rakip Analizi"
      ],
      color: "var(--accent)",
      icon: <Zap size={30} color="var(--accent)" />,
      featured: true
    },
    {
      name: "Booster Paket",
      price: "146.000",
      description: "Markasına Sosyal medyada ve web de agresif büyüme hızı isteyen ve tam kapsamlı ajans hizmeti almak isteyenler için ideal.",
      features: [
        "10 Adet Reels",
        "90 Adet Story (Günde 3 Adet)",
        "8 Adet Statik veya Carousel Post",
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
      icon: <Star size={30} color="var(--secondary)" />
    }
  ];

  const handleOpenCheckout = (plan) => {
    setSelectedPlanForCheckout(plan);
    setIsCheckoutOpen(true);
  };

  return (
    <div style={{ padding: '320px 0 100px 0', background: 'var(--bg-color)' }}>
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
                onClick={() => handleOpenCheckout(plan)} 
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
                <CreditCard size={20} /> Hemen Öde (iyzico 3D) <ArrowRight size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* iyzico Payment Logos & Legal Policies Banner */}
        <div style={{
          marginTop: '50px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '24px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>
            🛡️ 256-BIT SSL İLE 3D SECURE GÜVENLİ ÖDEME VE TAKSİT İMKANI
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '10px 24px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
          }}>
            <img 
              src="/iyzico-payment-logos.png" 
              alt="iyzico, Mastercard, Visa, American Express, Troy Ödeme Yöntemleri" 
              style={{ maxHeight: '42px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <a href="/gizlilik-politikasi.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary, #00e5ff)', textDecoration: 'underline' }}>
              📄 Gizlilik Politikası (PDF)
            </a>
            <span>•</span>
            <a href="/iptal-ve-iade-kosullari.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary, #00e5ff)', textDecoration: 'underline' }}>
              📄 İptal ve İade Koşulları (PDF)
            </a>
          </div>
        </div>

        <div className="glass" style={{ marginTop: '50px', borderRadius: '32px', padding: '50px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '20px' }}>Size Özel Bir Plan mı Lazım?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 40px' }}>
            Kurumsal markalar veya çok kanallı projeleriniz için size özel bir strateji ve fiyatlandırma hazırlayabiliriz.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/#funnel')}>Ekibimizle Toplantı Planlayın</button>
        </div>

      </div>

      {/* iyzico 3D Secure Payment Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={selectedPlanForCheckout}
      />
    </div>
  );
}

export default Pricing;
