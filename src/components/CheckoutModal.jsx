import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Lock, CreditCard, ArrowLeft, Loader, CheckCircle2 } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, selectedPlan }) {
  const [step, setStep] = useState(1); // 1: Customer Form, 2: iyzico Checkout Form
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    identityNumber: '11111111111',
    city: 'İstanbul',
    address: ''
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMessage('');
      setIsLoading(false);
    }
  }, [isOpen, selectedPlan]);

  if (!isOpen || !selectedPlan) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Only allow numbers and optional leading +
      const numericOnly = value.replace(/[^0-9+]/g, '');
      setFormData(prev => ({ ...prev, phone: numericOnly }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStartPayment = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setErrorMessage('Lütfen ad soyad ve telefon alanlarını doldurun.');
      return;
    }

    // Email format validation (only if email is entered)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setErrorMessage('Girdiğiniz e-posta adresi geçersiz. Lütfen kontrol ediniz veya boş bırakınız.');
        return;
      }
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const parsePrice = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        let str = String(val).trim();
        if (str.includes('.') && str.includes(',')) {
          str = str.indexOf('.') < str.indexOf(',') ? str.replace(/\./g, '').replace(',', '.') : str.replace(/,/g, '');
          return parseFloat(str) || 0;
        }
        if (str.includes(',')) {
          return parseFloat(str.replace(',', '.')) || 0;
        }
        if (str.includes('.')) {
          const parts = str.split('.');
          if (parts.length === 2 && parts[1].length === 3 && parseInt(parts[0], 10) > 0) {
            str = str.replace(/\./g, '');
          }
        }
        return parseFloat(str) || 0;
      };

      const rawNum = parsePrice(selectedPlan.price);
      const isExactPrice = selectedPlan.isTest || selectedPlan.exactPrice || rawNum <= 10;
      const totalNum = isExactPrice ? rawNum : rawNum * 1.20;
      const totalPriceWithKdv = totalNum.toFixed(2);

      const response = await fetch('/api/iyzico-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: selectedPlan.name,
          price: totalPriceWithKdv,
          buyerInfo: formData
        })
      });

      let data = {};
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = {};
      }

      if (!response.ok || data.status !== 'success') {
        throw new Error(data.error || 'Ödeme altyapısına şu an erişilemiyor. Lütfen canlı ortamda veya API sunucusunda tekrar deneyiniz.');
      }

      setStep(2);
      setIsLoading(false);

      // Ingest iyzico HTML checkout script into the container
      setTimeout(() => {
        const container = document.getElementById('iyzipay-checkout-form');
        if (container && data.checkoutFormContent) {
          container.innerHTML = ''; // Clear existing
          
          // Execute script content safely
          const range = document.createRange();
          range.selectNode(container);
          const fragment = range.createContextualFragment(data.checkoutFormContent);
          container.appendChild(fragment);
        }
      }, 100);

    } catch (err) {
      console.error('Payment Init Error:', err);
      setErrorMessage(err.message || 'Ödeme altyapısı başlatılırken bir hata oluştu.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'rgba(5, 5, 8, 0.85)',
      backdropFilter: 'blur(16px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, rgba(20, 20, 28, 0.95), rgba(10, 10, 16, 0.98))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 229, 255, 0.1)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '620px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {step === 2 && (
              <button 
                onClick={() => setStep(1)} 
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem'
                }}
              >
                <ArrowLeft size={16} /> Geri
              </button>
            )}
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                {selectedPlan.name}
                <span style={{ fontSize: '0.9rem', color: 'var(--primary, #00e5ff)', fontWeight: '700' }}>
                  ₺ {selectedPlan.price}
                </span>
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Güvenli 3D Ödeme ve Taksit İmkanı
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              color: '#94a3b8',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px', flex: 1 }}>

          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '0.88rem',
              marginBottom: '20px'
            }}>
              {errorMessage}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStartPayment} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '-6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={16} color="var(--primary, #00e5ff)" /> Fatura & İletişim Bilgileriniz
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>
                    Ad Soyad / Firma Adı *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Ahmet Yılmaz"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>
                    E-posta Adresi (İsteğe Bağlı)
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="ahmet@sirketiniz.com (İsteğe Bağlı)"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>
                    Telefon Numarası *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="0532 000 00 00"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>
                    T.C. Kimlik / Vergi No
                  </label>
                  <input
                    type="text"
                    name="identityNumber"
                    placeholder="11111111111"
                    value={formData.identityNumber}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>
                    Şehir
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="İstanbul"
                    value={formData.city}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>
                    Fatura Adresi
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Mahalle, Cadde, No: 5, Daire: 2"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Order Summary Pill with KDV Breakdown */}
              {(() => {
                const parsePrice = (val) => {
                  if (typeof val === 'number') return val;
                  if (!val) return 0;
                  let str = String(val).trim();
                  if (str.includes('.') && str.includes(',')) {
                    str = str.indexOf('.') < str.indexOf(',') ? str.replace(/\./g, '').replace(',', '.') : str.replace(/,/g, '');
                    return parseFloat(str) || 0;
                  }
                  if (str.includes(',')) return parseFloat(str.replace(',', '.')) || 0;
                  if (str.includes('.')) {
                    const parts = str.split('.');
                    if (parts.length === 2 && parts[1].length === 3 && parseInt(parts[0], 10) > 0) {
                      str = str.replace(/\./g, '');
                    }
                  }
                  return parseFloat(str) || 0;
                };

                const rawNum = parsePrice(selectedPlan.price);
                const isExactPrice = selectedPlan.isTest || selectedPlan.exactPrice || rawNum <= 10;
                
                const netNum = rawNum;
                const kdvNum = isExactPrice ? 0 : rawNum * 0.20;
                const totalNum = isExactPrice ? rawNum : rawNum * 1.20;

                const formatMoney = (val) => val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                return (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' }}>
                      <span>Hizmet Bedeli (Net):</span>
                      <span style={{ color: '#e2e8f0', fontWeight: '600' }}>₺ {formatMoney(netNum)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' }}>
                      <span>KDV (%20 Eklenen):</span>
                      <span style={{ color: '#00e5ff', fontWeight: '700' }}>+ ₺ {formatMoney(kdvNum)}</span>
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '2px 0' }} />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600' }}>ÖDENECEK GENEL TOPLAM</div>
                        <div style={{ fontSize: '1.45rem', fontWeight: '900', color: 'var(--primary, #00e5ff)' }}>
                          ₺ {formatMoney(totalNum)} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>(KDV Dahil)</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(52, 211, 153, 0.1)', padding: '6px 12px', borderRadius: '10px' }}>
                        <ShieldCheck size={16} /> 256-bit SSL & 3D Secure
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Mandatory Policy Agreement & PDF Links for iyzico Compliance */}
              <div style={{
                fontSize: '0.8rem',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '14px 16px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', lineHeight: '1.5' }}>
                  <input type="checkbox" required defaultChecked style={{ marginTop: '4px', accentColor: '#00e5ff', width: '16px', height: '16px' }} />
                  <span>
                    Ödemeye devam ederek <a href="/gizlilik-politikasi.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary, #00e5ff)', textDecoration: 'underline', fontWeight: '600' }}>📄 Gizlilik Politikası (PDF)</a> ve <a href="/iptal-ve-iade-kosullari.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary, #00e5ff)', textDecoration: 'underline', fontWeight: '600' }}>📄 İptal ve İade Koşulları (PDF)</a>'nı okuduğumu ve kabul ettiğimi onaylıyorum.
                  </span>
                </label>
                <div style={{ fontSize: '0.75rem', color: '#64748b', paddingLeft: '26px' }}>
                  Ayrıca web sitemizdeki <a href="/iptal-ve-iade-kosullari" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'underline' }}>İptal ve İade Politikası</a> sayfasından tüm tüketici haklarınızı inceleyebilirsiniz.
                </div>
              </div>

              {/* Official Payment Methods Logos Image Banner */}
              <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '10px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)'
              }}>
                <img 
                  src="/iyzico-payment-logos.png" 
                  alt="iyzico, Visa, Mastercard, American Express, Troy Ödeme Logoları" 
                  style={{ maxHeight: '42px', width: 'auto', objectFit: 'contain' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: '600' }}>
                  Anlaşmalı Tüm Banka Kartları İle Max 6 Taksit İmkanı
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  marginTop: '4px',
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #00e5ff, #8a2be2)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 25px rgba(0, 229, 255, 0.25)',
                  transition: 'all 0.2s'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader size={20} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> 
                    Ödeme Altyapısı Başlatılıyor...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} /> Ödemeye İlerle (Kredi Kartı / Taksit)
                  </>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.05))',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                padding: '14px 18px',
                borderRadius: '16px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                  <CheckCircle2 size={18} /> iyzico Korumalı Ödeme Formu Yüklendi
                </div>
                <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.2)', padding: '4px 10px', borderRadius: '20px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🔒 256-Bit SSL Active
                </span>
              </div>

              {/* Ultra Premium Card Wrapper for iyzico Form */}
              <div style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 229, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                overflow: 'hidden'
              }}>
                {/* Embedded Trust Bar inside Card */}
                <div style={{
                  padding: '10px 14px 14px',
                  marginBottom: '10px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="#059669" />
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a' }}>
                      3D Secure Güvenli Ödeme
                    </span>
                  </div>
                  <img 
                    src="/iyzico-payment-logos.png" 
                    alt="iyzico Logo" 
                    style={{ height: '22px', width: 'auto', objectFit: 'contain' }} 
                  />
                </div>

                {/* iyzico Injected Form Container */}
                <div id="iyzipay-checkout-form" className="responsive" style={{ minHeight: '380px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyCenter: 'center', padding: '60px 0', color: '#64748b', gap: '12px' }}>
                    <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: '#8a2be2' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Ödeme Formu Güvenle Yükleniyor...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(0, 0, 0, 0.2)',
          fontSize: '0.75rem',
          color: '#64748b',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span>🛡️ iyzico Güvenli Ödeme Altyapısı</span>
            <span>💳 Visa, Mastercard, AMEX, Troy & 6 Taksit</span>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#94a3b8' }}>
            <a href="/gizlilik-politikasi.pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'underline' }}>Gizlilik Politikası (PDF)</a>
            <span>•</span>
            <a href="/iptal-ve-iade-kosullari.pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'underline' }}>İptal ve İade Koşulları (PDF)</a>
          </div>
        </div>

      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#ffffff',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s'
};
