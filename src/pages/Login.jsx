import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Forced First-Login Password Change State
  const [isForcedPasswordChange, setIsForcedPasswordChange] = useState(false);
  const [tempLoginPassword, setTempLoginPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  // Session restore on mount using server-side HttpOnly cookie check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth-me', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.employee) {
            if (data.mustChangePassword) {
              // Active session requires password change, but temp password is not in memory after refresh.
              // Clear session safely so user can re-login with temporary password and complete change.
              await fetch('/api/auth-logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              localStorage.removeItem('social-art-base:active-employee-id');
              localStorage.removeItem('ajans_user');
              localStorage.removeItem('socialart_user');
              localStorage.removeItem('social-art-base:credentials');
            } else {
              // Reconstruct legacy presentation compatibility context
              const userObj = {
                id: data.employee.id,
                name: data.employee.fullName,
                role: data.employee.title || 'Ekip Üyesi',
                email: data.employee.email,
                class: 'A-Class',
                permissions: 'all',
                can_add_client: true
              };

              localStorage.setItem('social-art-base:active-employee-id', data.employee.id);
              localStorage.setItem('ajans_user', JSON.stringify(userObj));
              localStorage.setItem('socialart_user', JSON.stringify(userObj));
              localStorage.removeItem('social-art-base:credentials');

              if (onLoginSuccess) {
                onLoginSuccess();
              } else {
                navigate('/admin/crm');
              }
            }
          }
        }
      } catch (e) {
        // Ignore network errors on session check
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate, onLoginSuccess]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('Kullanıcı adı ve şifre gereklidir.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanUser, password: cleanPass })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Kullanıcı adı veya şifre hatalı.');
        setLoading(false);
        return;
      }

      // Purge any legacy plaintext credentials in localStorage
      localStorage.removeItem('social-art-base:credentials');

      if (data.mustChangePassword) {
        // Hold temp password in memory ONLY for the upcoming change-password request
        setTempLoginPassword(cleanPass);
        setIsForcedPasswordChange(true);
        setLoading(false);
        return;
      }

      // Construct legacy presentation compatibility context
      const userObj = {
        id: data.employee.id,
        name: data.employee.fullName,
        role: data.employee.title || 'Ekip Üyesi',
        email: data.employee.email,
        class: 'A-Class',
        permissions: 'all',
        can_add_client: true
      };

      localStorage.setItem('social-art-base:active-employee-id', data.employee.id);
      localStorage.setItem('ajans_user', JSON.stringify(userObj));
      localStorage.setItem('socialart_user', JSON.stringify(userObj));

      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate('/admin/crm');
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError('Giriş yapılırken bir bağlantı hatası oluştu.');
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!newPassword || newPassword.length < 12) {
      setError('Yeni şifre en az 12 karakter olmalıdır.');
      setLoading(false);
      return;
    }

    if (newPassword.length > 128) {
      setError('Yeni şifre en fazla 128 karakter olabilir.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Yeni şifreler eşleşmiyor.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth-change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: tempLoginPassword,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Şifre değiştirme başarısız oldu. Lütfen tekrar deneyin.');
        setLoading(false);
        return;
      }

      // Clear all password variables from memory
      setTempLoginPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsForcedPasswordChange(false);
      setPassword('');
      setSuccessMessage('Şifren güncellendi. Yeni şifrenle tekrar giriş yap.');
      setLoading(false);
    } catch (err) {
      console.error("Change Password Error:", err);
      setError('Şifre değiştirilirken bir bağlantı hatası oluştu.');
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div style={{ background: '#020202', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>Doğrulanıyor...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#020202', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '20%', left: '20%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: '0.3', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: '300px', height: '300px', background: 'var(--secondary)', filter: 'blur(150px)', opacity: '0.2', borderRadius: '50%' }}></div>

      <div className="glass" style={{ width: '100%', maxWidth: '420px', padding: '50px 40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 10, textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        
        {isForcedPasswordChange ? (
          /* FORCED FIRST-LOGIN PASSWORD CHANGE STATE */
          <>
            <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, rgba(255,170,0,0.2), rgba(255,0,85,0.2))', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px auto', border: '1px solid rgba(255,170,0,0.3)' }}>
              <KeyRound size={36} color="#ffaa00" />
            </div>

            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '10px', color: '#fff' }}>Şifrenizi Değiştirin</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '30px' }}>
              İlk girişiniz için yeni ve güvenli bir şifre belirlemeniz gerekmektedir.
            </p>

            {error && (
              <div style={{ background: 'rgba(255,0,85,0.1)', color: 'var(--secondary)', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid rgba(255,0,85,0.2)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Yeni Şifre (En az 12 karakter)" 
                  style={{ width: '100%', padding: '16px 16px 16px 45px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--surface-border)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border 0.3s' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Yeni Şifre Tekrar" 
                  style={{ width: '100%', padding: '16px 16px 16px 45px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--surface-border)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border 0.3s' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ width: '100%', background: 'linear-gradient(90deg, #ffaa00, var(--secondary))', padding: '16px', borderRadius: '12px', color: '#000', fontWeight: '700', fontSize: '1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Güncelleniyor...' : <>Şifreyi Güncelle & Devam Et <ArrowRight size={18} /></>}
              </button>
            </form>
          </>
        ) : (
          /* NORMAL LOGIN STATE */
          <>
            <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(255,0,85,0.2))', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px auto', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ShieldCheck size={36} color="var(--primary)" />
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px', color: '#fff' }}>Sisteme Giriş</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '35px' }}>Socialart MİY Paneline erişmek için kimliğinizi doğrulayın.</p>

            {successMessage && (
              <div style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid rgba(0,229,255,0.3)' }}>
                {successMessage}
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(255,0,85,0.1)', color: 'var(--secondary)', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid rgba(255,0,85,0.2)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı Adı" 
                  style={{ width: '100%', padding: '16px 16px 16px 45px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--surface-border)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border 0.3s' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifre" 
                  style={{ width: '100%', padding: '16px 16px 16px 45px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--surface-border)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border 0.3s' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ width: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', padding: '16px', borderRadius: '12px', color: '#000', fontWeight: '700', fontSize: '1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Doğrulanıyor...' : <>Giriş Yap <ArrowRight size={18} /></>}
              </button>
            </form>

            <div style={{ marginTop: '30px', fontSize: '0.8rem', color: 'var(--surface-border)' }}>
              Yetkisiz erişim denemeleri kayıt altına alınmaktadır.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
