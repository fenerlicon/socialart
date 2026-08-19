import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { 
  CreditCard, 
  ShieldCheck, 
  Receipt, 
  Layers, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  ArrowLeft,
  Calendar,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import CheckoutModal from '../components/CheckoutModal';

export default function DirectPaymentPage() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  
  const requestId = searchParams.get('id') || searchParams.get('req') || params.id || '';
  
  const [paymentReq, setPaymentReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  useEffect(() => {
    async function loadRequest() {
      if (!requestId) {
        setError('Geçerli bir ödeme talebi bağlantısı bulunamadı.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: dbErr } = await supabase
          .from('payment_requests')
          .select('*')
          .eq('id', requestId.trim())
          .maybeSingle();

        if (dbErr || !data) {
          setError('Ödeme talebi bulunamadı veya süresi dolmuş olabilir.');
        } else {
          setPaymentReq(data);
        }
      } catch (err) {
        console.error('Payment request fetch error:', err);
        setError('Ödeme bilgileri yüklenirken bir bağlantı hatası oluştu.');
      } finally {
        setLoading(false);
      }
    }

    loadRequest();
  }, [requestId]);

  const handleStartPayment = () => {
    if (!paymentReq) return;

    const isExempt = Boolean(paymentReq.is_kdv_exempt);
    const rawNet = Number(paymentReq.amount || 0);
    const grandTotal = Number(paymentReq.total_amount) || (isExempt ? rawNet : rawNet * 1.20);
    const kdvAmount = paymentReq.kdv_amount !== undefined ? Number(paymentReq.kdv_amount) : (isExempt ? 0 : grandTotal - rawNet);

    setCheckoutPlan({
      title: paymentReq.title,
      name: paymentReq.title,
      price: grandTotal,
      exactPrice: true,
      isKdvIncluded: true,
      netAmount: rawNet,
      kdvAmount: kdvAmount,
      isKdvExempt: isExempt,
      is_kdv_exempt: isExempt,
      items: Array.isArray(paymentReq.items) ? paymentReq.items : [],
      currency: 'TL',
      interval: 'Tek Seferlik',
      paymentType: 'custom_invoice',
      requestId: paymentReq.id,
      clientName: paymentReq.client_name || 'Müşteri',
      companyCode: paymentReq.company_code || 'musteri'
    });

    setIsCheckoutOpen(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: '#fff', padding: '20px' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#00e5ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: 600 }}>Güvenli Ödeme Detayları Yükleniyor...</p>
      </div>
    );
  }

  if (error || !paymentReq) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: '#fff', padding: '20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,68,68,0.3)', padding: '36px', borderRadius: '24px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#ef4444' }}>
            <AlertCircle size={28} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Ödeme Talebi Bulunamadı</h2>
          <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '24px', lineHeight: 1.5 }}>
            {error || 'Girdiğiniz ödeme bağlantısı geçersiz veya sistemden kaldırılmış.'}
          </p>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: '#27272a', color: '#fff', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = paymentReq.status === 'paid';
  const isExempt = Boolean(paymentReq.is_kdv_exempt);
  const netAmount = Number(paymentReq.amount || 0);
  const grandTotal = Number(paymentReq.total_amount) || (isExempt ? netAmount : netAmount * 1.20);
  const kdvAmount = paymentReq.kdv_amount !== undefined ? Number(paymentReq.kdv_amount) : (isExempt ? 0 : grandTotal - netAmount);
  const hasItems = Array.isArray(paymentReq.items) && paymentReq.items.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #09090b 0%, #0d0d14 50%, #150d24 100%)', color: '#fff', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '580px', width: '100%', spaceY: '24px' }}>
        
        {/* Header Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #a855f7, #00e5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color: '#000', boxShadow: '0 0 20px rgba(0,229,255,0.3)' }}>
              SA
            </div>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#fff' }}>SocialArt Medya</h1>
              <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 600 }}>Güvenli Müşteri Ödeme Portalı</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '6px 12px', borderRadius: '999px' }}>
            <ShieldCheck size={14} /> 256-Bit SSL 3D Secure
          </div>
        </div>

        {/* Main Payment Invoice Card */}
        <div style={{ background: 'rgba(20, 20, 28, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 50px rgba(168,85,247,0.08)' }}>
          
          {/* Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#71717a', fontWeight: 800, display: 'block', marginBottom: '4px' }}>Sayın Müşterimiz</span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>{paymentReq.client_name}</h2>
            </div>
            <div>
              {isPaid ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '6px 14px', borderRadius: '999px' }}>
                  <CheckCircle2 size={16} /> ÖDENDİ
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', padding: '6px 14px', borderRadius: '999px' }}>
                  🟡 ÖDEME BEKLENİYOR
                </span>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600, marginBottom: '4px' }}>Hizmet / Masraf Konusu:</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#00e5ff', margin: '0 0 8px' }}>{paymentReq.title}</h3>
            {paymentReq.description && (
              <p style={{ fontSize: '0.85rem', color: '#d4d4d8', background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', lineHeight: 1.5, margin: 0 }}>
                {paymentReq.description}
              </p>
            )}
          </div>

          {/* Itemized Breakdown (if present) */}
          {hasItems && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#a855f7', letterSpacing: '0.05em' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={14} /> Hizmet & Masraf Kalemleri</span>
                <span>{paymentReq.items.length} Kalem</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                {paymentReq.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: idx < paymentReq.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', fontSize: '0.85rem' }}>
                    <span style={{ color: '#e4e4e7', fontWeight: 500 }}>
                      <span style={{ color: '#71717a', marginRight: '8px', fontFamily: 'monospace' }}>{idx + 1}.</span>
                      {it.title}
                    </span>
                    <span style={{ fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>
                      ₺ {Number(it.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amount Breakdown Summary */}
          <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '8px' }}>
              <span>Ara Toplam (Net Hizmet Bedeli):</span>
              <span style={{ fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                ₺ {netAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '12px' }}>
              <span>KDV {isExempt ? '(%0 Muaf):' : '(%20 Dahil):'}</span>
              <span style={{ fontWeight: 700, color: isExempt ? '#10b981' : '#00e5ff', fontFamily: 'monospace' }}>
                {isExempt ? '₺ 0,00 (KDV Muaf)' : `+ ₺ ${kdvAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
              </span>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fff' }}>ÖDENECEK TOPLAM TUTAR:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00e5ff', fontFamily: 'monospace', textShadow: '0 0 20px rgba(0,229,255,0.4)' }}>
                ₺ {grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action Button */}
          {isPaid ? (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '20px', borderRadius: '18px', textAlign: 'center' }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', margin: '0 0 4px' }}>Ödemeniz Alınmıştır</h4>
              <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0 }}>
                Bu ödeme talebi iyzico 3D Secure ile başarıyla tahsil edilmiştir. İş birliğiniz için teşekkür ederiz.
              </p>
            </div>
          ) : (
            <div>
              <button
                onClick={handleStartPayment}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #00e5ff 0%, #a855f7 100%)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  padding: '18px 24px',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 10px 30px rgba(0,229,255,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,229,255,0.45)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,229,255,0.3)'; }}
              >
                <CreditCard size={22} color="#000" /> Kredi / Banka Kartı ile Güvenli Öde
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '16px', opacity: 0.7 }}>
                <img src="/iyzico-payment-logos.png" alt="Visa Mastercard Troy iyzico" style={{ height: '22px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
              </div>
            </div>
          )}

        </div>

        {/* Footer Support Info */}
        <div style={{ textAlign: 'center', marginTop: '24px', color: '#71717a', fontSize: '0.75rem', lineHeight: 1.6 }}>
          Ödemeniz <strong>iyzico 3D Secure</strong> güvencesiyle 256-bit şifrelenerek tahsil edilir.<br />
          Sorularınız için: <a href="mailto:iletisim@socialartmedya.com" style={{ color: '#00e5ff', textDecoration: 'none', fontWeight: 600 }}>iletisim@socialartmedya.com</a>
        </div>

      </div>

      {/* 3D Secure Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={checkoutPlan}
      />
    </div>
  );
}
