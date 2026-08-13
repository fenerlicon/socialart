import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const TabBillingSupport = ({
  customer,
  paymentRequests,
  onPayRequest,
  supportMessages,
  onSendSupportMessage,
  supportInput,
  setSupportInput
}) => {
  const [requestSentSuccess, setRequestSentSuccess] = useState('');

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
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-2 shadow-xl animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>{requestSentSuccess}</span>
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

      {/* 2. QUICK SERVICE & ADD-ON MARKETPLACE [H] */}
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
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3 hover:border-amber-500/40 transition-all shadow-md"
            >
              <div>
                <h5 className="font-black text-xs text-white">{srv.title}</h5>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{srv.desc}</p>
              </div>

              <button
                onClick={() => handleQuickRequest(srv)}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-extrabold text-[11px] border border-amber-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{srv.actionText}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. VIP DEDICATED ACCOUNT MANAGER & LIVE CHAT [3, Canlı Destek] */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Account Manager Card */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 rounded-3xl backdrop-blur-xl shadow-xl flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              VIP Müşteri Temsilciniz
            </span>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/30 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                  alt="Temsilci"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div>
                <h4 className="font-black text-sm text-white">Selin Yılmaz</h4>
                <p className="text-xs text-indigo-300 font-semibold">Kıdemli Marka Yöneticisi</p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Şu an Çevrimiçi</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Markanızın tüm reklam, çekim takvimi ve bütçe optimizasyonlarını birebir takip etmekten sorumludur.
            </p>
          </div>

          <a
            href="https://wa.me/905000000000"
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Phone className="w-4 h-4" />
            <span>Doğrudan WhatsApp'tan Yazın</span>
          </a>
        </div>

        {/* Live Chat Inbox with Agency */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-purple-400" />
                Ajans İçi Canlı Mesajlaşma Hattı
              </h4>
              <p className="text-[11px] text-slate-400">Ekibimize anlık not veya soru iletin</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              Anlık Bildirim Açık
            </span>
          </div>

          {/* Messages scroll */}
          <div className="h-48 overflow-y-auto space-y-2.5 p-2 bg-slate-950/70 rounded-2xl border border-slate-800/80">
            {(!supportMessages || supportMessages.length === 0) ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Henüz bir mesaj geçmişiniz yok. Ekibimize hemen aşağıdan yazabilirsiniz.
              </div>
            ) : (
              supportMessages.slice(0, 15).reverse().map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender_type === 'client' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div className={`p-3 rounded-2xl text-xs font-semibold ${
                    msg.sender_type === 'client'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                  }`}>
                    {msg.message}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 px-1">
                    {msg.sender_type === 'client' ? 'Siz' : (msg.admin_name || 'SocialArt Ekibi')} • {new Date(msg.created_at || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Send Input */}
          <form onSubmit={onSendSupportMessage} className="flex gap-2">
            <input
              type="text"
              value={supportInput}
              onChange={e => setSupportInput(e.target.value)}
              placeholder="Ekibimize mesajınızı yazın..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-purple-500/50"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gönder</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
