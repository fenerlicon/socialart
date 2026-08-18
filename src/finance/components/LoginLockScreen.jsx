import React, { useState } from 'react';
import { Lock, User, KeyRound, Eye, EyeOff, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';

const ALLOWED_USERNAMES = ['ajanscelal26', 'ajansercan26'];

export default function LoginLockScreen({ onLoginSuccess, userPasswords = {} }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = usernameInput.trim().toLowerCase();

    // 1. Strict Whitelist Check
    if (!ALLOWED_USERNAMES.includes(cleanUsername)) {
      setErrorMsg('⚠️ Yetkisiz Kullanıcı! Bu sisteme sadece yetkili ajans yöneticileri giriş yapabilir.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 2. Fetch specific user password from props or localStorage
      const storedLocal = localStorage.getItem(`socialart_pass_${cleanUsername}`);
      const validPassword = userPasswords[cleanUsername] || storedLocal;

      if (validPassword && passwordInput === validPassword) {
        const userObj = {
          username: cleanUsername,
          displayName: cleanUsername === 'ajanscelal26' ? 'Celal Bey' : 'Ercan Bey'
        };

        sessionStorage.setItem('socialart_is_authenticated', 'true');
        sessionStorage.setItem('socialart_auth_user', JSON.stringify(userObj));
        
        onLoginSuccess(userObj);
      } else {
        setErrorMsg('❌ Girdiğiniz şifre hatalı. Lütfen tekrar deneyiniz.');
        setIsSubmitting(false);
      }
    }, 300);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      background: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #090d16 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      {/* Background Ambient Glows */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'rgba(99, 102, 241, 0.15)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '430px',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top Accent Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)'
        }} />

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#818cf8',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.15)'
          }}>
            <Lock size={30} />
          </div>

          <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
            SocialArt <span style={{ background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FINANCE</span>
          </h2>
          <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.88rem', margin: 0 }}>
            Ön Muhasebe Yönetim Paneli Güvenlik Girişi
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Username Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary, #cbd5e1)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Kullanıcı Adı
            </label>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <User size={18} />
              </div>

              <input 
                type="text" 
                required
                autoFocus
                placeholder="Kullanıcı adınızı giriniz..." 
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.6rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '14px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary, #cbd5e1)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Giriş Şifresi
            </label>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <KeyRound size={18} />
              </div>

              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="Şifrenizi giriniz..." 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 2.8rem 0.85rem 2.6rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: errorMsg ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '14px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />

              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              fontSize: '0.83rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 500
            }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting || !usernameInput || !passwordInput}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              borderRadius: '14px',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: (isSubmitting || !usernameInput || !passwordInput) ? 'not-allowed' : 'pointer',
              opacity: (isSubmitting || !usernameInput || !passwordInput) ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{isSubmitting ? 'Doğrulanıyor...' : 'Panele Giriş Yap'}</span>
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck size={14} style={{ color: '#10b981' }} />
          <span>Kapalı Devre Özel Yönetici Erişimi</span>
        </div>
      </div>
    </div>
  );
}
