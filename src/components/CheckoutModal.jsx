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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStartPayment = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setErrorMessage('Lütfen ad soyad, e-posta ve telefon alanlarını doldurun.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/iyzico-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: selectedPlan.name,
          price: selectedPlan.price,
          buyerInfo: formData
        })
      });

      const data = await response.json();

      if (!response.ok || data.status !== 'success') {
        throw new Error(data.error || 'Ödeme formu oluşturulamadı.');
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
                    E-posta Adresi *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="ahmet@sirketiniz.com"
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

              {/* Order Summary Pill */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '16px',
                padding: '16px 20px',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Ödenecek Toplam Tutar:</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff' }}>₺ {selectedPlan.price}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={16} /> 256-bit SSL & 3D Secure
                </div>
              </div>

              {/* Mandatory Policy Agreement & PDF links for iyzico */}
              <div style={{
                fontSize: '0.78rem',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', lineHeight: '1.4' }}>
                  <input type="checkbox" required defaultChecked style={{ marginTop: '3px', accentColor: '#00e5ff' }} />
                  <span>
                    Ödemeye devam ederek <a href="/gizlilik-politikasi.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary, #00e5ff)', textDecoration: 'underline' }}>Gizlilik Politikası</a> ve <a href="/iptal-ve-iade-kosullari.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary, #00e5ff)', textDecoration: 'underline' }}>İptal ve İade Koşulları</a>'nı okuduğumu ve kabul ettiğimi beyan ederim.
                  </span>
                </label>
              </div>

              {/* Payment Methods Logo Banner */}
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                <img 
                  src="/iyzico-payment-logos.png" 
                  alt="iyzico, Mastercard, Visa, American Express, Troy Ödeme Logoları" 
                  style={{ maxHeight: '36px', width: 'auto', objectFit: 'contain' }}
                />
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
            <div>
              <div style={{
                background: 'rgba(52, 211, 153, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                color: '#34d399',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={18} /> iyzico Korumalı Ödeme Formu Yüklendi. Kart bilgilerinizi giriniz.
              </div>

              {/* iyzico Injected Form Container */}
              <div id="iyzipay-checkout-form" className="responsive" style={{ minHeight: '350px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: '#94a3b8', gap: '12px' }}>
                  <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Ödeme Formu Yükleniyor...</span>
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
