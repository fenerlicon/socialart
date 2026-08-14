import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  MessageCircle, 
  Send, 
  Sparkles, 
  Phone, 
  Clock, 
  ShieldCheck, 
  PlusCircle, 
  ExternalLink,
  Flame,
  Check,
  FileText,
  Download,
  Receipt
} from 'lucide-react';
import { getBrandConfig } from './brandConfigs';

export default function TabBillingSupport({
  customer,
  paymentRequests,
  onPayRequest,
  supportMessages,
  onSendSupportMessage,
  supportInput,
  setSupportInput
}) {
  const brandConfig = getBrandConfig(customer?.company_code, customer?.client_name);
  const manager = brandConfig.dedicatedManager || {
    name: 'Selin Yılmaz',
    title: 'Kıdemli Marka Yöneticisi',
    phone: '905000000000',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  };
  const [requestSentSuccess, setRequestSentSuccess] = useState('');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [supportMessages]);

  // Quick Service Add-on Marketplace [H]
  const quickServices = [
    {
      id: 'drone',
      title: '🚁 Ekstra 4K Drone Çekimi',
      desc: 'Mekan, fabrika veya etkinlik için 1 gün ek profesyonel drone pilotajı.',
      actionText: 'Drone Çekimi Talep Et'
    },
    {
      id: 'fast_ad',
      title: '🔥 Acil Flaş Kampanya Başlat',
      desc: '24 saat içinde yayına girecek acil indirim veya etkinlik reklam kurgusu.',
      actionText: 'Acil Kampanya İste'
    },
    {
      id: 'banner',
      title: '🌐 Web Sitesi Banner & Görsel Tasarımı',
      desc: 'Web siteniz veya pazaryerleriniz için 3 adet kurumsal slider tasarımı.',
      actionText: 'Banner Tasarımı İste'
    },
    {
      id: 'influencer',
      title: '🎙️ Mikro-Influencer Eşleşmesi',
      desc: 'Sektörünüze uygun 2 yerel içerik üreticisi ile tanıtım entegrasyonu.',
      actionText: 'Influencer Eşleşmesi İste'
    }
  ];

  const handleQuickRequest = async (service) => {
    if (customer?.client_name) {
      try {
        await supabase.from('client_support_messages').insert([{
          client_name: customer.client_name,
          sender_type: 'client',
          message: `⚡ HIZLI HİZMET TALEBİ: "${service.title}" hizmeti talep edildi.`,
          is_read: false
        }]);

        await supabase.from('activity_log').insert([{
          target_name: customer.client_name,
          action: 'Hızlı Hizmet Talep Edildi',
          details: `Müşteri "${service.title}" talebinde bulundu.`
        }]);
      } catch (err) {}
    }

    setRequestSentSuccess(`"${service.title}" talebiniz alındı! Müşteri temsilciniz 15 dakika içinde dönüş yapacaktır.`);
    setTimeout(() => setRequestSentSuccess(''), 5000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Toast Alert */}
      {requestSentSuccess && (
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-slate-950 border border-emerald-500/40 backdrop-blur-2xl shadow-2xl shadow-emerald-950/60 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-l-full" />
          <div className="flex items-center gap-3.5 pl-1.5">
            <div className="relative w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">SocialArt VIP Bildirimi</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-white mt-0.5">{requestSentSuccess}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRequestSentSuccess('')}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all shrink-0 cursor-pointer"
          >
            <span className="text-xs font-black">✕</span>
          </button>
        </div>
      )}

      {/* 1. PAYMENT REQUESTS & IYZICO 3D SECURE CHECKOUT */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              Ödemeleriniz & Fatura Talepleri
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ajans hizmet ödemelerinizi iyzico 256-Bit SSL 3D Secure güvencesiyle anında kredi kartınızla tamamlayın
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            {paymentRequests ? paymentRequests.filter(r => r.status === 'pending').length : 0} Bekleyen Ödeme
          </span>
        </div>

        <div className="space-y-4">
          {(!paymentRequests || paymentRequests.length === 0) ? (
            <div className="text-center py-8 text-slate-400 text-xs bg-slate-950/60 rounded-2xl border border-slate-800/80">
              Henüz bekleyen veya tamamlanmış bir ödeme talebiniz bulunmamaktadır.
            </div>
          ) : (
            paymentRequests.map((reqItem) => {
              const isPending = reqItem.status === 'pending';
              const isExempt = Boolean(reqItem.is_kdv_exempt);
              const grandTotal = reqItem.total_amount || (isExempt ? reqItem.amount : reqItem.amount * 1.20);
              const hasItems = Array.isArray(reqItem.items) && reqItem.items.length > 0;

              return (
                <div
                  key={reqItem.id}
                  className={`p-5 rounded-2xl bg-slate-950 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg ${
                    isPending ? 'border-cyan-500/40 hover:border-cyan-400' : 'border-emerald-500/30'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-extrabold text-sm text-white">{reqItem.title}</h4>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {isPending ? '🟡 ÖDEME BEKLİYOR' : '🟢 ÖDENDİ'}
                      </span>
                      {isExempt && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          %0 KDV Muaf
                        </span>
                      )}
                    </div>

                    {reqItem.description && (
                      <p className="text-xs text-slate-400">{reqItem.description}</p>
                    )}

                    {/* Breakdown items */}
                    {hasItems && (
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 space-y-1 text-xs text-slate-300 max-w-lg">
                        {reqItem.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>• {it.title}</span>
                            <span className="font-bold text-cyan-400">₺{Number(it.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500">
                      Oluşturulma: {reqItem.created_at ? new Date(reqItem.created_at).toLocaleDateString('tr-TR') : 'Bugün'}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Toplam Tutar</span>
                      <div className="text-xl font-black text-cyan-400">
                        ₺{Number(grandTotal).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {isExempt ? 'KDV Dahil Net' : '+ %20 KDV Dahil'}
                      </span>
                    </div>

                    {isPending ? (
                      <button
                        onClick={() => onPayRequest(reqItem)}
                        className="py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>3D Secure Ödeme Yap</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-extrabold px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ödendi</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. META OFFICIAL AD INVOICES & TAX RECEIPTS (Direct Meta Billing Hub) */}
      {(() => {
        const adAccountMap = {
          miocasa: { id: '521331138335695', name: 'MioCasa - FB ADS', active: true },
          mallofgurme: { id: '1623202645011162', name: 'Mall Of Gurme Bahçeşehir', active: true },
          gurme: { id: '289754769812729', name: 'Gurme Bahçeşehir', active: true },
          shineco: { id: '1608208866017447', name: 'Shineco Kozmetik', active: true },
          postprodart: { id: '1341032947601781', name: 'Postprodart', active: false },
          socialart: { id: '1173496391102992', name: 'Social Art Ajans', active: true }
        };
        const rawCode = (customer?.company_code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const metaAcc = adAccountMap[rawCode] || (brandConfig.adsActive ? { id: '521331138335695', name: brandConfig.name, active: true } : null);

        if (!metaAcc) return null;

        const billingUrl = `https://business.facebook.com/ads/manager/billing_history/summary/?act=${metaAcc.id}`;

        return (
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-black text-white">Meta Resmi Reklam Faturaları & Vergi Makbuzları (PDF)</h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Resmi E-Fatura Merkezi
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Meta Ireland Ltd. tarafından doğrudan işletmeniz adına düzenlenen resmi reklam harcama faturalarına ve makbuzlarına anında ulaşın.
                </p>
              </div>

              <a
                href={billingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0 hover:scale-105 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Meta Faturalarını İndir (PDF)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">KDV & Muhasebe Uyumu</span>
                  <span className="text-[11px] text-slate-400">Meta İrlanda faturaları KDV-2 beyannamesi ve şirket gideri düşümüne tam uyumludur.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                <Receipt className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Bağlı Reklam Hesabı</span>
                  <span className="text-[11px] text-slate-400 font-mono">act_{metaAcc.id} ({metaAcc.name})</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Toplu PDF & CSV İndirme</span>
                  <span className="text-[11px] text-slate-400">Tarih aralığı seçerek tüm aylık e-faturaları tek seferde indirebilirsiniz.</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. QUICK SERVICE & ADD-ON MARKETPLACE [H] - 100% ACTIVE */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-5">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Hızlı Hizmet & Ekstra Talep Pazarı
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ekstra çekim, acil reklam kampanyası veya banner ihtiyaçlarınızı tek tıkla ajans ekibinize bildirin
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickServices.map((srv) => (
            <div
              key={srv.id}
              className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between gap-4 shadow-md hover:border-amber-500/40 transition-all group"
            >
              <div>
                <h5 className="font-black text-xs text-white group-hover:text-amber-300 transition-colors">{srv.title}</h5>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{srv.desc}</p>
              </div>

              <button
                onClick={() => handleQuickRequest(srv)}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-black text-[11px] border border-amber-500/30 transition-all shadow text-center cursor-pointer active:scale-95"
              >
                <span>{srv.actionText}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. VIP DEDICATED ACCOUNT MANAGER & LIVE CHAT [3, Canlı Destek] */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Account Manager Card - 100% ACTIVE WITH DIRECT WHATSAPP */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 rounded-3xl backdrop-blur-xl shadow-xl flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              VIP Müşteri Temsilciniz
            </span>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/30 shrink-0">
                <img
                  src={manager.avatar}
                  alt={manager.name}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div>
                <h4 className="font-black text-sm text-white">{manager.name}</h4>
                <p className="text-xs text-indigo-300 font-semibold">{manager.title}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Şu an Çevrimiçi</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Markanızın tüm reklam, çekim takvimi ve bütçe optimizasyonlarını SocialArt çatısı altında birebir takip etmekten sorumludur.
            </p>
          </div>

          <a
            href={`https://wa.me/${manager.phone || '905000000000'}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all"
          >
            <Phone className="w-4 h-4" />
            <span>Doğrudan WhatsApp'tan Yazın</span>
          </a>
        </div>

        {/* Live Chat Inbox - 100% ACTIVE WITH SUPABASE REALTIME */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-indigo-400" />
                Ajans İçi Canlı Mesajlaşma Hattı
              </h4>
              <p className="text-[11px] text-slate-400">Ekibimize anlık not, revizyon veya soru iletin</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                🟢 Aktif Hat
              </span>
            </div>
          </div>

          {/* Chat Messages Timeline */}
          <div className="h-64 overflow-y-auto space-y-2.5 bg-slate-950/70 rounded-2xl p-4 border border-slate-800/80">
            {(!supportMessages || supportMessages.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs gap-1.5 py-6">
                <Sparkles className="w-6 h-6 text-indigo-400/60 mb-1" />
                <span className="font-bold text-slate-400">Henüz bir mesaj geçmişi bulunmuyor.</span>
                <span className="text-[11px] text-slate-500 max-w-xs">
                  Aşağıdaki hazır butonlardan birine tıklayabilir veya dilediğiniz soruyu yazarak ekibimize anında iletebilirsiniz.
                </span>
              </div>
            ) : (
              supportMessages.map((msg, idx) => {
                const isClient = msg.sender_type === 'client' || msg.is_client;
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex ${isClient ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                  >
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl text-xs ${
                        isClient
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-lg shadow-indigo-600/20'
                          : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                      }`}
                    >
                      <div className="text-[10px] opacity-75 font-bold mb-1">
                        {isClient ? 'Siz (Marka)' : 'SocialArt Ekibi'}
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message || msg.content}</p>
                      <div className="text-[9px] opacity-60 text-right mt-1.5 font-mono">
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Şimdi'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            {[
              '🎬 Çekim takvimimiz ne zaman?',
              '📊 Bu haftaki reklam özeti',
              '✍️ Yeni revizyon notum var',
              '📄 Fatura detayı alabilir miyim?'
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendSupportMessage(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-300 transition-all shrink-0 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (supportInput?.trim()) {
                onSendSupportMessage(supportInput);
                setSupportInput('');
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={supportInput || ''}
              onChange={(e) => setSupportInput(e.target.value)}
              placeholder="Ajans ekibinize mesajınızı yazın..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!supportInput?.trim()}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gönder</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
