import React, { useState } from 'react';
import { Lock, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, User } from 'lucide-react';

export default function ChangePasswordModal({ onClose, authUser, userPasswords = {}, onUpdatePassword }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeUsername = authUser?.username || 'ajanscelal26';
  const activeDisplayName = authUser?.displayName || (activeUsername === 'ajanscelal26' ? 'Celal Bey' : 'Ercan Bey');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const storedLocal = localStorage.getItem(`socialart_pass_${activeUsername}`);
    const validCurrentPass = userPasswords[activeUsername] || storedLocal || '1234';

    if (oldPassword !== validCurrentPass) {
      setErrorMsg('Mevcut şifreniz hatalı. Lütfen kontrol ediniz.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('Yeni şifreniz en az 4 karakter uzunluğunda olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Yeni şifreleriniz birbiriyle eşleşmiyor.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdatePassword(newPassword, activeUsername);
      setSuccessMsg(`Tebrikler ${activeDisplayName}, şifreniz başarıyla güncellendi!`);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      setErrorMsg('Şifre güncellenirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '8px', borderRadius: '10px' }}>
              <Lock size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Şifre Değiştir</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Panel erişim şifrenizi güncelleyin</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* User Identity Info Badge */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-light)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          margin: '1rem 0 0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '6px', borderRadius: '8px' }}>
            <User size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aktif Oturum Sahibi</div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
              {activeDisplayName} <span style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 500 }}>({activeUsername})</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '0.5rem' }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.83rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.83rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Mevcut Şifreniz</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showOld ? "text" : "password"} 
                required
                className="form-input"
                placeholder="Şu anki şifreniz..."
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
              />
              <button 
                type="button" 
                onClick={() => setShowOld(!showOld)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Yeni Şifreniz</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showNew ? "text" : "password"} 
                required
                className="form-input"
                placeholder="Yeni şifrenizi girin..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
              />
              <button 
                type="button" 
                onClick={() => setShowNew(!showNew)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Yeni Şifreniz (Tekrar)</label>
            <input 
              type={showNew ? "text" : "password"} 
              required
              className="form-input"
              placeholder="Yeni şifrenizi tekrar girin..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
