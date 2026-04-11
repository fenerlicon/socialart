import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

function NotFound() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      textAlign: 'center', 
      padding: '20px',
      background: 'var(--bg-color)'
    }}>
      <div style={{ position: 'relative', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '12rem', 
          fontWeight: '900', 
          margin: 0, 
          lineHeight: 1, 
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: 0.2
        }}>404</h1>
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          width: '100%'
        }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff' }}>Hoppala! Sayfa Bulunamadı</h2>
        </div>
      </div>
      
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '500px', marginBottom: '40px' }}>
        Aradığınız sayfa silinmiş, ismi değiştirilmiş veya geçici olarak kullanım dışı olabilir.
      </p>

      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Home size={20} /> Ana Sayfaya Dön
        </Link>
        <button onClick={() => window.history.back()} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ArrowLeft size={20} /> Geri Git
        </button>
      </div>
    </div>
  );
}

export default NotFound;
