import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ArrowRight, Home, ShieldCheck, CreditCard } from 'lucide-react';

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);

  const queryParams = new URLSearchParams(location.search);
  const paymentStatus = queryParams.get('payment');
  const paymentId = queryParams.get('paymentId');
  const amount = queryParams.get('amount');
  const customerName = queryParams.get('name');
  const planName = queryParams.get('plan');
  const failureReason = queryParams.get('reason');

  useEffect(() => {
    // Define the gtag_report_conversion function globally as requested
    window.gtag_report_conversion = function(url) {
      const callback = function () {
        if (typeof(url) !== 'undefined') {
          window.location = url;
        }
      };
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', {
            'send_to': 'AW-17236814033/VvXnCM-OxrAcENHRk5tA',
            'event_callback': callback
        });
      } else {
        callback();
      }
      return false;
    };

    // Trigger conversion event automatically when user lands on this page
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-17236814033/VvXnCM-OxrAcENHRk5tA'
      });
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background, #0a0a0f)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div className="glass" style={{
        maxWidth: '620px',
        width: '100%',
        padding: '50px 36px',
        borderRadius: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>

        {/* PAYMENT SUCCESS STATE */}
        {paymentStatus === 'success' && (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(52, 211, 153, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(52, 211, 153, 0.3)'
            }}>
              <CheckCircle size={48} color="#34d399" />
            </div>

            <h1 style={{ 
              fontSize: '2.2rem', 
              fontWeight: '900', 
              margin: 0,
              color: '#ffffff'
            }}>
              Ödemeniz Başarıyla Alındı!
            </h1>

            <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
              Sayın <strong style={{ color: '#fff' }}>{customerName || 'Müşterimiz'}</strong>, iyzico 3D Secure güvencesi ile yapılan ödemeniz onaylandı.
            </p>

            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '20px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.9rem'
            }}>
              {planName && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>Satın Alınan Paket:</span><strong style={{ color: '#fff' }}>{planName}</strong></div>}
              {amount && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>Ödenen Tutar:</span><strong style={{ color: '#34d399', fontSize: '1.1rem' }}>₺ {amount}</strong></div>}
              {paymentId && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>iyzico Ödeme ID:</span><span style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{paymentId}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '4px' }}>
                <span style={{ color: '#94a3b8' }}>İşlem Durumu:</span>
                <span style={{ color: '#34d399', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={16} /> Onaylandı & Kaydedildi</span>
              </div>
            </div>
          </>
        )}

        {/* PAYMENT FAILED STATE */}
        {paymentStatus === 'failed' && (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(239, 68, 68, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(239, 68, 68, 0.3)'
            }}>
              <AlertTriangle size={48} color="#ef4444" />
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', margin: 0, color: '#fca5a5' }}>
              Ödeme İşlemi Tamamlanamadı
            </h1>

            <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
              {failureReason ? decodeURIComponent(failureReason) : 'Bankanız veya kart bilgileriniz kaynaklı bir hata oluştu. Lütfen tekrar deneyiniz.'}
            </p>

            <button 
              onClick={() => navigate('/pricing')}
              style={{
                background: 'linear-gradient(135deg, #00e5ff, #8a2be2)',
                color: '#fff',
                fontWeight: 'bold',
                padding: '14px 28px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CreditCard size={18} /> Paket Seçimine Geri Dön
            </button>
          </>
        )}

        {/* STANDARD FORM SUBMISSION STATE */}
        {!paymentStatus && (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(0, 229, 255, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={48} color="var(--primary, #00e5ff)" />
            </div>

            <h1 style={{ 
              fontSize: '2.4rem', 
              fontWeight: '900', 
              margin: 0,
              color: '#ffffff'
            }}>
              Formunuz Başarıyla Alındı!
            </h1>

            <p style={{ 
              fontSize: '1.05rem', 
              color: 'var(--text-muted, #94a3b8)', 
              lineHeight: '1.6',
              maxWidth: '440px'
            }}>
              SocialArt ekibi olarak başvurunuzu inceleyip en kısa sürede sizinle iletişime geçeceğiz. Dijital büyüme yolculuğunuzda yanınızda olmak için sabırsızlanıyoruz.
            </p>
          </>
        )}

        <div style={{
          marginTop: '10px',
          padding: '10px 20px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '100px',
          fontSize: '0.85rem',
          color: '#888'
        }}>
          <span style={{ color: 'var(--primary, #00e5ff)', fontWeight: 'bold' }}>{countdown}</span> saniye içinde anasayfaya yönlendirileceksiniz...
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px' }}
          >
            <Home size={18} /> Anasayfa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
