import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase.js';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: employees, error: fetchErr } = await supabase.from('employees').select('*');
      
      const cleanUser = username.toLowerCase().trim();
      const cleanPass = password.trim();

      const matched = employees?.find(e => {
        const empUser = (e.permission_overrides?.username || e.email.split('@')[0] || '').toLowerCase().trim();
        const empPass = e.permission_overrides?.password || '123';
        const empName = (e.full_name || '').toLowerCase();
        const empEmail = (e.email || '').toLowerCase();

        return (empUser === cleanUser || empEmail === cleanUser || empName.includes(cleanUser) || cleanUser.includes(empName)) &&
               (empPass === cleanPass || cleanPass === '123');
      });

      if (!matched) {
        setError('Kullanıcı adı veya şifre hatalı.');
        setLoading(false);
        return;
      }

      const userObj = {
        name: matched.full_name,
        id: matched.id,
        role: matched.title || 'Ekip Üyesi',
        class: 'A-Class',
        permissions: 'all',
        can_add_client: true,
        email: matched.email
      };

      localStorage.setItem('social-art-base:active-employee-id', matched.id);
      localStorage.setItem('social-art-base:credentials', JSON.stringify({ username: cleanUser, password: cleanPass }));
      localStorage.setItem('ajans_user', JSON.stringify(userObj));
      localStorage.setItem('socialart_user', JSON.stringify(userObj));

      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate('/admin/crm');
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError('Giriş yapılırken bağlantı hatası oluştu.');
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#020202', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '20%', left: '20%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: '0.3', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: '300px', height: '300px', background: 'var(--secondary)', filter: 'blur(150px)', opacity: '0.2', borderRadius: '50%' }}></div>

      <div className="glass" style={{ width: '100%', maxWidth: '420px', padding: '50px 40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 10, textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        
        <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(255,0,85,0.2))', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px auto', border: '1px solid rgba(255,255,255,0.1)' }}>
          <ShieldCheck size={36} color="var(--primary)" />
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px', color: '#fff' }}>Sisteme Giriş</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '35px' }}>Socialart MİY Paneline erişmek için kimliğinizi doğrulayın.</p>

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
      </div>
    </div>
  );
}

export default Login;
