import React, { useState } from 'react';
import { 
  Camera, 
  Video, 
  Sparkles, 
  Palette, 
  CheckCircle2, 
  Clock, 
  Play, 
  ThumbsUp, 
  Edit3, 
  Calendar, 
  MapPin, 
  Shirt, 
  Send, 
  Check, 
  ChevronRight, 
  Grid, 
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const TabProductionStudio = ({ customer }) => {
  const [activeWorkflowLane, setActiveWorkflowLane] = useState('video');
  const [approvalModalItem, setApprovalModalItem] = useState(null); // Item to revise or approve
  const [revisionNote, setRevisionNote] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // 4 Production Tracks / Lanes
  const productionLanes = [
    {
      id: 'video',
      title: 'Video & Reels Prodüksiyon',
      icon: Video,
      currentStep: 'Kurgu & Post-Prodüksiyon',
      progress: 75,
      stepBadge: 'Aşama 3/4',
      itemsCount: '4 Video Hazırlanıyor'
    },
    {
      id: 'photo',
      title: 'Fotoğraf & Mekan Çekimleri',
      icon: Camera,
      currentStep: 'Renk Düzenleme & Retouch',
      progress: 60,
      stepBadge: 'Aşama 2/4',
      itemsCount: '24 Kare İşleniyor'
    },
    {
      id: 'ai',
      title: 'AI Prodüksiyon & Dijital Avatar',
      icon: Sparkles,
      currentStep: 'AI Model Render & Senkronizasyon',
      progress: 85,
      stepBadge: 'Aşama 3/4',
      itemsCount: '2 AI Video Testte'
    },
    {
      id: 'graphics',
      title: 'Grafik & Carousel Tasarım',
      icon: Palette,
      currentStep: 'Müşteri Onayında',
      progress: 90,
      stepBadge: 'Aşama 4/4',
      itemsCount: '6 Post Tasarımı Hazır'
    }
  ];

  // Review & Approval Items (Frame.io Model)
  const [reviewItems, setReviewItems] = useState([
    {
      id: 'rev-1',
      title: 'Ana Marka Tanıtım & Hizmet Reels Kurgusu (Rev.2)',
      type: 'Video / 4K Kurgu',
      duration: '0:42 sn',
      status: 'PENDING_APPROVAL', // PENDING_APPROVAL, APPROVED, REVISED
      videoUrl: 'https://cdn.coverr.co/videos/coverr-a-stylish-young-woman-working-at-a-cafe-9343/1080p.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
      description: 'Ses miksajı yapıldı, marka renkleri uygulandı ve dikey formatta optimize edildi.'
    },
    {
      id: 'rev-2',
      title: 'Haftalık Carousel & Bilgilendirici İpuçları Serisi',
      type: 'Carousel Tasarımı (5 Sayfa)',
      duration: '5 Slayt',
      status: 'APPROVED',
      videoUrl: null,
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      description: 'Tipografi ve kurumsal renk paleti ile yayına hazırlandı.'
    }
  ]);

  // Social Media Content Calendar Preview (Instagram Grid)
  const instagramFeedItems = [
    {
      id: 1,
      type: 'REELS',
      date: 'Pazartesi, 18:00',
      title: 'Yeni Sezon Hizmet Tanıtımı',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      type: 'CAROUSEL',
      date: 'Çarşamba, 19:30',
      title: '5 Maddede Marka Dönüşümü',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      type: 'REELS',
      date: 'Cuma, 20:00',
      title: 'Müşteri Başarı Hikayesi',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&auto=format&fit=crop&q=80'
    }
  ];

  // Handle Approve Action
  const handleApprove = async (item) => {
    setSubmittingAction(true);
    try {
      // 1. Update local state
      setReviewItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'APPROVED' } : it));
      
      // 2. Notify agency staff in Supabase
      if (customer?.client_name) {
        await supabase.from('client_support_messages').insert([{
          client_name: customer.client_name,
          sender_type: 'client',
          message: `✅ ONAY VERİLDİ: "${item.title}" içeriği müşteri tarafından onaylandı ve yayına hazır.`,
          is_read: false
        }]);

        await supabase.from('activity_log').insert([{
          target_name: customer.client_name,
          action: 'İçerik Onaylandı',
          details: `"${item.title}" başarıyla onaylandı.`
        }]);
      }

      setActionSuccessMsg(`"${item.title}" onaylandı! Ekibimiz yayına alıyor.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (e) {
      console.warn('Approval error:', e);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Revision Request Action
  const handleSendRevision = async (e) => {
    e.preventDefault();
    if (!revisionNote.trim() || !approvalModalItem) return;

    setSubmittingAction(true);
    try {
      setReviewItems(prev => prev.map(it => it.id === approvalModalItem.id ? { ...it, status: 'REVISED' } : it));

      if (customer?.client_name) {
        await supabase.from('client_support_messages').insert([{
          client_name: customer.client_name,
          sender_type: 'client',
          message: `✍️ REVİZE TALEBİ: "${approvalModalItem.title}" için not: "${revisionNote}"`,
          is_read: false
        }]);

        await supabase.from('activity_log').insert([{
          target_name: customer.client_name,
          action: 'Revize Talep Edildi',
          details: `"${approvalModalItem.title}" için revize notu iletildi.`
        }]);
      }

      setActionSuccessMsg('Revize notunuz kurgu ekibimize iletildi.');
      setApprovalModalItem(null);
      setRevisionNote('');
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (e) {
      console.warn('Revision error:', e);
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Toast Alert */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-2 shadow-xl animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 1. PRODUCTION WORKFLOW TRACKS / SLIDER [3, A] */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-5">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Prodüksiyon & Üretim Süreci (4 Ana Kulvar)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ajansımızın sizin için yürüttüğü prodüksiyon, kurgu ve tasarım aşamalarının canlı evresi
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {productionLanes.map((lane) => {
            const Icon = lane.icon;
            return (
              <div
                key={lane.id}
                className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between gap-4 hover:border-purple-500/40 transition-all shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                    {lane.stepBadge}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-white">{lane.title}</h4>
                  <p className="text-xs text-purple-300 font-semibold mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>{lane.currentStep}</span>
                  </p>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{lane.itemsCount}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>İlerleme</span>
                    <span>%{lane.progress}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-1000"
                      style={{ width: `${lane.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. FRAME.IO STYLE LIVE VIDEO REVIEW & 1-CLICK APPROVAL [A] */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-cyan-400" />
                İçerik İnceleme & Canlı Onay Stüdyosu
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Frame.io Onay Modeli
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Kurgusu tamamlanan videoları HD izleyin; tek tıkla onaylayın veya revize notunuzu iletin.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reviewItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl"
            >
              {/* Media Preview Player */}
              <div className="relative aspect-video bg-slate-900">
                {item.videoUrl ? (
                  <video
                    src={item.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}

                <span className="absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-950/80 text-white border border-slate-700 backdrop-blur-md">
                  {item.type} • {item.duration}
                </span>

                <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border backdrop-blur-md ${
                  item.status === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : item.status === 'REVISED'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                }`}>
                  {item.status === 'APPROVED' && '🟢 ONAYLANDI (YAYINA HAZIR)'}
                  {item.status === 'REVISED' && '🟡 REVİZE İŞLENİYOR'}
                  {item.status === 'PENDING_APPROVAL' && '⏳ ONAYINIZ BEKLENİYOR'}
                </span>
              </div>

              {/* Action Bar */}
              <div className="p-5 space-y-4">
                <div>
                  <h4 className="font-extrabold text-sm text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                </div>

                {item.status === 'PENDING_APPROVAL' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleApprove(item)}
                      disabled={submittingAction}
                      className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Onaylıyorum (Yayına Al)</span>
                    </button>

                    <button
                      onClick={() => setApprovalModalItem(item)}
                      disabled={submittingAction}
                      className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Revize İste</span>
                    </button>
                  </div>
                )}

                {item.status === 'APPROVED' && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bu içerik onaylandı. Sosyal medya yayın takvimine eklendi.</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. INSTAGRAM FEED PREVIEW & SOCIAL CONTENT CALENDAR [D] */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Instagram 3-Grid View */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Grid className="w-5 h-5 text-pink-400" />
                Sosyal Medya Yayın Takvimi (Instagram Grid)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Bu hafta ve ay profilinizde paylaşılacak içeriklerin görsel akışı
              </p>
            </div>
            <span className="text-xs font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-xl">
              Haftalık Plan Hazır
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {instagramFeedItems.map((feed) => (
              <div key={feed.id} className="group relative aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
                <img
                  src={feed.image}
                  alt={feed.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-extrabold text-pink-400">{feed.type}</span>
                  <h6 className="text-[11px] font-bold text-white line-clamp-1">{feed.title}</h6>
                  <span className="text-[9px] text-slate-400">{feed.date}</span>
                </div>
                <span className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-300 backdrop-blur-md">
                  {feed.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. SHOOTING CALL SHEET & MOODBOARD [I] */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 rounded-3xl backdrop-blur-xl shadow-xl flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                🎬 Sıradaki Çekim Günü
              </span>
              <span className="text-xs font-black text-cyan-400">18 Ağustos</span>
            </div>

            <div>
              <h4 className="text-base font-black text-white">Prodüksiyon Call Sheet & Rehber</h4>
              <p className="text-xs text-slate-400 mt-1">
                Çekim günü hazırlığı için mekan, saat ve kıyafet rehberi
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate font-semibold">Ana Mekan / Stüdyo Çekimi (11:00)</span>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <Shirt className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate font-semibold">Kıyafet: Düz renk, logosuz kurumsal kombin</span>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate font-semibold">Hedef: 4 Reels & 20 Profesyonel Kare</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert('Çekim moodboard ve senaryo PDF dökümanı ajansınız tarafından hazırlandı.')}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30"
          >
            <span>Görsel Moodboard & Senaryoyu Gör</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* REVISION NOTE MODAL */}
      {approvalModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              Revize Notunuzu İletin
            </h3>
            <p className="text-xs text-slate-400">
              "{approvalModalItem.title}" için düzeltilmesini veya eklenmesini istediğiniz detayları yazınız:
            </p>

            <textarea
              rows={4}
              value={revisionNote}
              onChange={e => setRevisionNote(e.target.value)}
              placeholder="Örn: 00:15 saniyedeki yazının fontu biraz büyütülebilir, kapanışta web sitesi adresi eklensin..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-400/50"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApprovalModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleSendRevision}
                disabled={submittingAction || !revisionNote.trim()}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kurgu Ekibine Gönder</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
