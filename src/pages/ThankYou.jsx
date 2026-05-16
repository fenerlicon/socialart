import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';

const ThankYou = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

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
      background: 'var(--background)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div className="glass" style={{
        maxWidth: '600px',
        padding: '60px 40px',
        borderRadius: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        animation: 'fadeInUp 0.8s ease-out'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(0, 229, 255, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '10px'
        }}>
          <CheckCircle size={48} color="var(--primary)" />
        </div>

        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '900', 
          margin: 0,
          background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Formunuz Başarıyla Alındı!
        </h1>

        <p style={{ 
          fontSize: '1.1rem', 
          color: 'var(--text-muted)', 
          lineHeight: '1.6',
          maxWidth: '400px'
        }}>
          SocialArt ekibi olarak başvurunuzu inceleyip en kısa sürede sizinle iletişime geçeceğiz. Dijital büyüme yolculuğunuzda yanınızda olmak için sabırsızlanıyoruz.
        </p>

        <div style={{
          marginTop: '20px',
          padding: '12px 24px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '100px',
          fontSize: '0.9rem',
          color: '#888'
        }}>
          <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{countdown}</span> saniye içinde anasayfaya yönlendirileceksiniz...
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
          >
            <Home size={18} /> Anasayfa
          </button>
          <button 
            onClick={() => navigate(-1)}
            style={{ 
              background: 'transparent', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: '#fff', 
              padding: '12px 24px', 
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Geri Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
