import React, { useState, useEffect } from 'react';
import { Lock, User, KeyRound, Eye, EyeOff, ShieldCheck, ArrowRight, AlertTriangle, ShieldAlert, Ban } from 'lucide-react';
import { Sentinel } from '../../lib/sentinel';

const DEFAULT_ALLOWED_USERNAMES = ['ajanscelal26', 'ajansercan26'];

export default function LoginLockScreen({ onLoginSuccess, userPasswords = {} }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmergencyLocked, setIsEmergencyLocked] = useState(false);
  const [allowedUsers, setAllowedUsers] = useState(DEFAULT_ALLOWED_USERNAMES);

  useEffect(() => {
    // 1. Check emergency lock status from /kontrol
    const locked = localStorage.getItem('socialart_finance_emergency_lock') === 'true';
    setIsEmergencyLocked(locked);

    // 2. Load configured whitelist from /kontrol
    try {
      const storedAllowed = localStorage.getItem('socialart_finance_allowed_users');
      if (storedAllowed) {
        setAllowedUsers(JSON.parse(storedAllowed));
      }
    } catch (e) {}
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isEmergencyLocked) {
      setErrorMsg('🚨 Finans Modülü Acil Durum Kilidindedir! Güvenlik Kontrol Merkezinden (/kontrol) kilidi kaldırmadan giriş yapılamaz.');
      Sentinel.recordEvent({
        type: 'FINANCE_EMERGENCY_LOCK_BLOCKED',
        severity: 'CRITICAL',
        score: 95,
        source: `Finans Giriş Kapısı (${usernameInput || 'Bilinmeyen'})`,
        description: 'Acil durum kilidi etkinken finans sistemine giriş denemesi yapıldı.',
        action: 'Erişim Engellendi & Kilitlendi'
      });
      return;
    }

    const cleanUsername = usernameInput.trim().toLowerCase();

    // 1. Strict Whitelist Check
    if (!allowedUsers.includes(cleanUsername)) {
      const failMsg = `⚠️ Yetkisiz Kullanıcı! '${cleanUsername}' hesabının şirketin finans ve kasa kayıtlarına erişim yetkisi yoktur. Bu işlem güvenlik kayıtlarına (/kontrol) işlenmiştir.`;
      setErrorMsg(failMsg);

      // Record unauthorized attempt in Sentinel for /kontrol audit
      Sentinel.recordEvent({
        type: 'UNAUTHORIZED_FINANCE_ATTEMPT',
        severity: 'CRITICAL',
        score: 95,
        source: `Finans Kapısı (/finans)`,
        description: `Yetkisiz kullanıcı (${cleanUsername}) CRM'den veya doğrudan Finans Paneline erişmeye çalıştı.`,
        action: 'Erişim Engellendi & Sentinel Denetimine İletildi'
      });

      // Save to audit log for /kontrol finance tab
      try {
        const existingLogs = JSON.parse(localStorage.getItem('socialart_finance_audit_logs') || '[]');
        const newLog = {
          id: 'faudit-' + Date.now(),
          timestamp: new Date().toISOString(),
          timeStr: new Date().toLocaleTimeString('tr-TR'),
          dateStr: new Date().toLocaleDateString('tr-TR'),
          username: cleanUsername,
          status: 'BLOCKED',
          reason: 'Yetkisiz Kullanıcı / Whitelist Dışı',
          source: window.location.pathname || '/finans'
        };
        localStorage.setItem('socialart_finance_audit_logs', JSON.stringify([newLog, ...existingLogs.slice(0, 99)]));
      } catch (err) {}

      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 2. Fetch specific user password from props or localStorage
      const storedLocal = localStorage.getItem(`socialart_pass_${cleanUsername}`);
      const validPassword = userPasswords[cleanUsername] || storedLocal || '1234';

      if (validPassword && passwordInput === validPassword) {
        const userObj = {
          username: cleanUsername,
          displayName: cleanUsername === 'ajanscelal26' ? 'Celal Bey' : 'Ercan Bey',
          role: 'FINANCE_ADMIN',
          loginTime: new Date().toISOString()
        };

        const sessionToken = 'fin_sec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
        const expiryTime = Date.now() + 30 * 60 * 1000; // 30 mins session

        // Save dedicated finance session storage (ISOLATED from general CRM session)
        sessionStorage.setItem('socialart_finance_session_token', sessionToken);
        sessionStorage.setItem('socialart_finance_auth_user', JSON.stringify(userObj));
        sessionStorage.setItem('socialart_finance_session_expiry', expiryTime.toString());
        
        // Record successful login in Sentinel
        Sentinel.recordEvent({
          type: 'FINANCE_AUTH_SUCCESS',
          severity: 'LOW',
          score: 0,
          source: `Finans Kapısı (${cleanUsername})`,
          description: `${userObj.displayName} (${cleanUsername}) şirketin finans sistemine güvenli oturum açtı.`,
          action: 'Finans Erişimi Onaylandı'
        });

        try {
          const existingLogs = JSON.parse(localStorage.getItem('socialart_finance_audit_logs') || '[]');
          const newLog = {
            id: 'faudit-' + Date.now(),
            timestamp: new Date().toISOString(),
            timeStr: new Date().toLocaleTimeString('tr-TR'),
            dateStr: new Date().toLocaleDateString('tr-TR'),
            username: cleanUsername,
            status: 'GRANTED',
            reason: 'Başarılı Kimlik Doğrulama',
            source: '/finans'
          };
          localStorage.setItem('socialart_finance_audit_logs', JSON.stringify([newLog, ...existingLogs.slice(0, 99)]));
        } catch (err) {}

        onLoginSuccess(userObj);
      } else {
        setErrorMsg('❌ Girdiğiniz şifre hatalı. Lütfen tekrar deneyiniz.');
        setIsSubmitting(false);

        Sentinel.recordEvent({
          type: 'FINANCE_INVALID_PASSWORD',
          severity: 'HIGH',
          score: 85,
          source: `Finans Kapısı (${cleanUsername})`,
          description: `${cleanUsername} kullanıcısı için hatalı finans şifresi denendi.`,
          action: 'Erişim Reddedildi'
        });
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
        maxWidth: '440px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(24px)',
        border: isEmergencyLocked ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
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
          background: isEmergencyLocked ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)'
        }} />

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: isEmergencyLocked ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            border: isEmergencyLocked ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: isEmergencyLocked ? '#ef4444' : '#818cf8',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.15)'
          }}>
            {isEmergencyLocked ? <ShieldAlert size={30} /> : <Lock size={30} />}
          </div>

          <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
            SocialArt <span style={{ background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FINANCE</span>
          </h2>
          <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.86rem', margin: 0 }}>
            Şirket Finansal Faaliyetleri & Kasa Yönetim Kilidi
          </p>

          <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 10px', borderRadius: '20px', color: '#fca5a5', fontSize: '0.72rem', fontWeight: 700 }}>
            <span>🔒 CRM ve Genel Kullanıcılara Kapalıdır</span>
          </div>
        </div>

        {/* Emergency Lock Warning if active */}
        {isEmergencyLocked && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '1rem',
            borderRadius: '14px',
            fontSize: '0.84rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Ban size={18} />
              <span style={{ fontWeight: 800 }}>ACİL DURUM KİLİDİ AKTİF</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1' }}>
              Finans modülü Güvenlik Kontrol Merkezinden (/kontrol) geçici olarak kilitlenmiştir.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Username Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary, #cbd5e1)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Finans Yetkili Kullanıcı Adı
            </label>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <User size={18} />
              </div>

              <input 
                type="text" 
                required
                autoFocus
                placeholder="Örn: ajansercan26" 
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
              Finans Şifresi
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
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontWeight: 500,
              lineHeight: 1.4
            }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
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
            <span>{isSubmitting ? 'Doğrulanıyor...' : 'Finans Paneline Güvenli Giriş'}</span>
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            <span>Sentinel Korumalı & /kontrol Tarafından Denetlenir</span>
          </div>
          <a href="/admin/crm" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>
            ← CRM Paneline Geri Dön
          </a>
        </div>
      </div>
    </div>
  );
}
