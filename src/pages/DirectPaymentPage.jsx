import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { 
  CreditCard, 
  ShieldCheck, 
  Receipt, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  ArrowLeft,
  Calendar,
  Sparkles,
  HelpCircle
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
          setError('Ödeme talebi bulunamadı veya bağlantının süresi dolmuş olabilir.');
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
      <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center p-6 select-none">
        <div className="w-12 h-12 border-3 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-neutral-400 tracking-wide animate-pulse">
          Güvenli Ödeme Portalı Yükleniyor...
        </p>
      </div>
    );
  }

  if (error || !paymentReq) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center p-6">
        <div className="bg-[#121218] border border-red-500/30 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2">Ödeme Talebi Bulunamadı</h2>
          <p className="text-sm text-neutral-400 leading-relaxed mb-6">
            {error || 'Girdiğiniz ödeme bağlantısı geçersiz veya sistemden kaldırılmış.'}
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-all"
          >
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
    <div className="min-h-screen bg-[#060609] text-white flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      
      {/* 1. TOP NAVBAR BRANDING */}
      <header className="w-full border-b border-white/5 bg-[#09090e]/80 backdrop-blur-xl px-6 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="SocialArt Ajans" 
              className="h-7 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
            <span className="text-xs font-semibold text-neutral-400 hidden sm:block tracking-wide">
              Güvenli Ödeme Portalı
            </span>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-bold shadow-sm">
            <ShieldCheck size={15} />
            <span>256-Bit SSL 3D Secure</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN PAYMENT CARD SECTION */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 my-auto">
        <div className="max-w-xl w-full">
          
          <div className="bg-gradient-to-b from-[#161622] to-[#0f0f16] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_50px_rgba(0,229,255,0.06)] relative overflow-hidden">
            
            {/* Subtle glow accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Client & Status */}
            <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-5 mb-6">
              <div>
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-neutral-400 block mb-1">
                  Sayın Müşterimiz
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {paymentReq.client_name}
                </h1>
              </div>

              <div className="shrink-0">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 rounded-full shadow-sm">
                    <CheckCircle2 size={15} /> ÖDENDİ
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 rounded-full shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> ÖDEME BEKLENİYOR
                  </span>
                )}
              </div>
            </div>

            {/* Service Title & Details */}
            <div className="space-y-2 mb-6">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Hizmet / Masraf Konusu
              </span>
              <h2 className="text-lg font-bold text-cyan-400">
                {paymentReq.title}
              </h2>
              {paymentReq.description && (
                <p className="text-xs text-neutral-300 bg-black/40 border border-white/5 rounded-xl p-3 leading-relaxed mt-2">
                  {paymentReq.description}
                </p>
              )}
            </div>

            {/* Items Breakdown (If Present) */}
            {hasItems && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-purple-400 tracking-wider mb-2">
                  <span className="flex items-center gap-1.5"><Layers size={14} /> Kalem Detayları</span>
                  <span>{paymentReq.items.length} Kalem</span>
                </div>
                <div className="bg-black/35 rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
                  {paymentReq.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-2.5 text-xs">
                      <span className="text-neutral-300 font-medium truncate pr-3">
                        <span className="text-neutral-400 mr-2 font-mono">{idx + 1}.</span>
                        {it.title}
                      </span>
                      <span className="font-bold text-white font-mono shrink-0">
                        ₺ {Number(it.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Calculations Summary Box */}
            <div className="bg-black/50 border border-white/8 rounded-2xl p-4 sm:p-5 space-y-2.5 mb-6">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Ara Toplam (Net Hizmet Bedeli):</span>
                <span className="font-bold text-white font-mono">
                  ₺ {netAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>KDV {isExempt ? '(%0 Muaf):' : '(%20 Dahil):'}</span>
                <span className={`font-bold font-mono ${isExempt ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {isExempt ? '₺ 0,00 (KDV Muaf)' : `+ ₺ ${kdvAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                </span>
              </div>

              <div className="h-[1px] bg-white/10 my-1" />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                  ÖDENECEK TOPLAM TUTAR:
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-cyan-400 font-mono tracking-tight drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                  ₺ {grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* CTA Button or Paid Banner */}
            {isPaid ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center space-y-2">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
                <h3 className="text-base font-extrabold text-emerald-400">Ödemeniz Başarıyla Alındı</h3>
                <p className="text-xs text-neutral-400">
                  Bu ödeme talebi iyzico 3D Secure ile tahsil edilmiştir. İş birliğiniz için teşekkür ederiz.
                </p>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={handleStartPayment}
                  className="w-full bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-black font-extrabold text-sm sm:text-base py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-[0_10px_30px_rgba(0,229,255,0.25)] hover:shadow-[0_15px_40px_rgba(0,229,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                >
                  <CreditCard size={20} className="text-black" />
                  <span>Kredi / Banka Kartı ile Güvenli Öde</span>
                </button>

                {/* Trust badge */}
                <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-neutral-400">
                  <Lock size={12} className="text-cyan-400" />
                  <span>Tüm banka ve kredi kartlarıyla 3D Secure ödeme desteklenir</span>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* 3. FOOTER INFO */}
      <footer className="w-full border-t border-white/5 py-4 px-6 text-center text-[11px] text-neutral-400 bg-[#07070a]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Ödemeleriniz <strong>iyzico 3D Secure</strong> güvencesiyle 256-bit şifrelenerek korunur.
          </span>
          <span>
            Destek: <a href="mailto:iletisim@socialartmedya.com" className="text-cyan-400 hover:underline">iletisim@socialartmedya.com</a>
          </span>
        </div>
      </footer>

      {/* 3D Secure Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={checkoutPlan}
      />
    </div>
  );
}
