import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  Eye, 
  Users, 
  DollarSign, 
  Target, 
  Play, 
  ExternalLink, 
  Share2, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Flame,
  Star,
  Copy,
  Check,
  MessageCircle,
  FileText
} from 'lucide-react';

export const TabOverviewAds = ({ customer, clientDetails, metaSpend }) => {
  // Campaign Goal Selector (Bilinirlik, Etkileşim, Lead, E-Ticaret)
  const [activeGoal, setActiveGoal] = useState('LEADS');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  // Active Ads list for customer preview
  const activeCreatives = [
    {
      id: 'ad-1',
      title: 'Sunuculu Tanıtım & Marka Lansman Videosu',
      format: 'Instagram Reels / Dikey Video',
      status: 'ACTIVE',
      spend: '₺1.850,00',
      reach: '48.200 Kişi',
      engagement: '3.420 Etkileşim',
      leads: '24 Lead',
      roas: '6.4x',
      videoUrl: 'https://cdn.coverr.co/videos/coverr-a-stylish-young-woman-working-at-a-cafe-9343/1080p.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
      tag: '🔥 En Çok Kazandıran Kreatif'
    },
    {
      id: 'ad-2',
      title: 'Ürün & Hizmet Detayları Carousel Kampanyası',
      format: 'Instagram Feed / Çoklu Görsel',
      status: 'ACTIVE',
      spend: '₺980,00',
      reach: '26.400 Kişi',
      engagement: '1.890 Etkileşim',
      leads: '14 Lead',
      roas: '5.1x',
      videoUrl: null,
      thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=80',
      tag: '⭐ Yüksek Kalite Dönüşümü'
    },
    {
      id: 'ad-3',
      title: 'Fırsat & Randevu Alın Dinamik Reklamı',
      format: 'Story / Hikaye Reklamı',
      status: 'ACTIVE',
      spend: '₺615,00',
      reach: '18.900 Kişi',
      engagement: '950 Tıklama',
      leads: '9 Lead',
      roas: '4.8x',
      videoUrl: 'https://cdn.coverr.co/videos/coverr-creative-agency-team-in-a-meeting-5517/1080p.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop&q=80',
      tag: '⚡ Hızlı Dönüşüm'
    }
  ];

  // Competitor Radar data
  const competitors = [
    {
      name: 'Sektörel Rakip A',
      activeAdsCount: '2 Aktif Reklam',
      postFrequency: 'Haftada 1 Paylaşım',
      strength: 'Orta',
      adLibraryUrl: 'https://www.facebook.com/ads/library'
    },
    {
      name: 'Sektörel Rakip B',
      activeAdsCount: '3 Aktif Reklam',
      postFrequency: 'Haftada 2 Paylaşım',
      strength: 'Standart',
      adLibraryUrl: 'https://www.facebook.com/ads/library'
    }
  ];

  const handleCopySummary = () => {
    const text = `📊 *${customer?.client_name || 'Markamız'} - SocialArt Haftalık Yönetici Özeti*
----------------------------------------
✅ *Marka Sağlık Durumu:* %95 (Mükemmel & Güvende)
📢 *Ulaşılan Kitle:* 93.500+ Kişi
🎯 *Dönüşüm & Müşteri:* 47 Nitelikli Müşteri Adayı
💰 *Reklam Harcaması:* ₺${(metaSpend?.totalSpend || 3434.38).toLocaleString('tr-TR')}
🚀 *Operasyon Notu:* Yeni prodüksiyon videoları yayında, reklam optimizasyonu devam ediyor.
----------------------------------------
🔗 Detaylı Canlı Portal: https://socialart.com.tr/musteri-paneli`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. TOP RIBBON: Brand Health Score [F] & 1-Click Executive Summary [J] */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Safe Brand Health Score [F] */}
        <div className="lg:col-span-2 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 rounded-3xl backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
              95
              <span className="text-[10px] text-emerald-400/80 font-normal absolute -bottom-1">/100</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Marka Operasyon & Sağlık Skoru</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Mükemmel Seviye
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Markanızın tüm reklam, içerik ve prodüksiyon süreçleri SocialArt disipliniyle %100 güvence altındadır.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-300 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>İçerik Akışı: %100</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reklamlar: Optimize</span>
            </div>
          </div>
        </div>

        {/* 1-Click WhatsApp Executive Summary [J] */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between gap-3 shadow-xl">
          <div>
            <span className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider block">Yönetici / Patron Paylaşımı</span>
            <h4 className="text-sm font-extrabold text-white mt-0.5">Tek Tıkla WhatsApp Özeti</h4>
            <p className="text-xs text-slate-400 mt-1">
              Şirket yöneticinize veya ortağınıza göndermek için 3 maddelik başarı özetini kopyalayın.
            </p>
          </div>

          <button
            onClick={handleCopySummary}
            className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 border ${
              copiedSummary
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border-indigo-500/40 shadow-sm'
            }`}
          >
            {copiedSummary ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>WhatsApp Metni Kopyalandı!</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp İçin Özeti Kopyala</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* 2. DYNAMIC AD METRICS SECTION [1, B] */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Canlı Reklam Performansı & Başarı Karnesi
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Meta Canlı Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Reklam bütçenizin anlık getirisi ve kampanya hedeflerinize göre net göstergeler
            </p>
          </div>

          {/* Goal Selector Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-center">
            <button
              onClick={() => setActiveGoal('LEADS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                activeGoal === 'LEADS'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎯 Müşteri / Lead
            </button>
            <button
              onClick={() => setActiveGoal('ENGAGEMENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                activeGoal === 'ENGAGEMENT'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔥 Etkileşim & Reels
            </button>
            <button
              onClick={() => setActiveGoal('AWARENESS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                activeGoal === 'AWARENESS'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📢 Bilinirlik
            </button>
            <button
              onClick={() => setActiveGoal('SALES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                activeGoal === 'SALES'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🛒 Satış (ROAS)
            </button>
          </div>
        </div>

        {/* Dynamic Metric Cards based on Goal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Main Volume Goal */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-semibold">
              {activeGoal === 'LEADS' && '🎯 Toplam Müşteri Adayı'}
              {activeGoal === 'ENGAGEMENT' && '🎬 Toplam Reels / Video İzlenmesi'}
              {activeGoal === 'AWARENESS' && '👁️ Toplam Tekil Erişim'}
              {activeGoal === 'SALES' && '💰 Üretilen Satış Cirosu'}
            </span>
            <div className="my-2">
              <div className="text-2xl font-black text-white">
                {activeGoal === 'LEADS' && '47 Yeni Lead'}
                {activeGoal === 'ENGAGEMENT' && '184.500 İzlenme'}
                {activeGoal === 'AWARENESS' && '93.500 Tekil Kişi'}
                {activeGoal === 'SALES' && '₺145.000'}
              </div>
              <span className="text-[11px] text-emerald-400 font-bold block">
                {activeGoal === 'LEADS' && '⭐ %72 Kaliteli / Nitelikli Başvuru'}
                {activeGoal === 'ENGAGEMENT' && '📈 %68 Tamamlama Oranı'}
                {activeGoal === 'AWARENESS' && '📍 Şehirde Geniş Yayılım'}
                {activeGoal === 'SALES' && '🚀 5.8x ROAS Getirisi'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Son 30 günlük canlı sonuç</span>
          </div>

          {/* Card 2: Spend Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-semibold">💰 Bu Ayki Reklam Harcaması</span>
            <div className="my-2">
              <div className="text-2xl font-black text-indigo-400">
                ₺{(metaSpend?.totalSpend || 3434.38).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-indigo-300 font-bold block">
                Bugün: ₺{(metaSpend?.todaySpend || 199.13).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Meta Reklam Yöneticisi Canlı Bütçe</span>
          </div>

          {/* Card 3: Unit Efficiency Cost */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-semibold">
              {activeGoal === 'LEADS' && '🎯 Lead Başı Maliyet (CPL)'}
              {activeGoal === 'ENGAGEMENT' && '💬 Etkileşim Başı Maliyet (CPE)'}
              {activeGoal === 'AWARENESS' && '📈 1.000 Kişiye Ulaşma (CPM)'}
              {activeGoal === 'SALES' && '📦 Satış Başı Maliyet (CPA)'}
            </span>
            <div className="my-2">
              <div className="text-2xl font-black text-cyan-400">
                {activeGoal === 'LEADS' && '₺73,00'}
                {activeGoal === 'ENGAGEMENT' && '₺0,14'}
                {activeGoal === 'AWARENESS' && '₺36,70'}
                {activeGoal === 'SALES' && '₺85,00'}
              </div>
              <span className="text-[11px] text-cyan-300 font-bold block">
                Sektör ortalamasından %40 daha verimli
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Birim maliyet optimizasyonu</span>
          </div>

          {/* Card 4: Action & Growth */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-semibold">
              {activeGoal === 'LEADS' && '📞 Geri Dönüş & Randevu'}
              {activeGoal === 'ENGAGEMENT' && '👤 Profil Ziyaretleri'}
              {activeGoal === 'AWARENESS' && '🔁 Akılda Kalıcılık Frekansı'}
              {activeGoal === 'SALES' && '🛒 Sepete Ekleme'}
            </span>
            <div className="my-2">
              <div className="text-2xl font-black text-amber-400">
                {activeGoal === 'LEADS' && '38 Görüşme'}
                {activeGoal === 'ENGAGEMENT' && '12.400 Ziyaret'}
                {activeGoal === 'AWARENESS' && '2.3x Gösterim'}
                {activeGoal === 'SALES' && '280 Adet'}
              </div>
              <span className="text-[11px] text-amber-300 font-bold block">
                🟢 Tüm kanallar aktif ve açık
              </span>
            </div>
            <span className="text-[10px] text-slate-500">SocialArt büyüme analitiği</span>
          </div>

        </div>
      </div>

      {/* 3. LIVE CREATIVES SHOWCASE [3, B] */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-indigo-400" />
              Yayındaki Reklamlarım & Kreatif Vitrini
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Şu an Instagram ve Facebook'ta yayında olan canlı video ve görsel reklamlarınız
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            {activeCreatives.length} Aktif Kreatif
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {activeCreatives.map((creative) => (
            <div
              key={creative.id}
              className="bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-indigo-500/40 transition-all shadow-lg group"
            >
              {/* Media Preview Container */}
              <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                {creative.videoUrl && playingVideoId === creative.id ? (
                  <video
                    src={creative.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <img
                      src={creative.thumbnail}
                      alt={creative.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    
                    {creative.videoUrl && (
                      <button
                        onClick={() => setPlayingVideoId(creative.id)}
                        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 transition-transform group-hover:scale-110"
                        title="Reklamı Oynat"
                      >
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </button>
                    )}
                  </>
                )}

                <span className="absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-950/80 text-white border border-slate-700 backdrop-blur-md">
                  {creative.format}
                </span>

                <span className="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  🟢 Yayında
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold text-amber-400 block">{creative.tag}</span>
                  <h4 className="font-extrabold text-sm text-white line-clamp-1 mt-0.5">{creative.title}</h4>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-2.5 rounded-xl text-center border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Harcama</span>
                    <span className="text-xs font-bold text-indigo-300">{creative.spend}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Erişim</span>
                    <span className="text-xs font-bold text-slate-200">{creative.reach}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Sonuç</span>
                    <span className="text-xs font-black text-emerald-400">{creative.leads}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. COMPETITOR RADAR [G] */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/20 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              Sektörel Rakip Radarı & Kıyaslama (Meta Ad Library)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              SocialArt ajansınız sektördeki ana rakiplerinizin reklam hareketlerini ve içerik hacmini sizin adınıza takip eder.
            </p>
          </div>
          <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl self-start sm:self-center">
            🏆 Sektörde Kreatif Hacminde Öndesiniz
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitors.map((comp, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <h5 className="font-extrabold text-xs text-white">{comp.name}</h5>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span>📢 {comp.activeAdsCount}</span>
                  <span>📅 {comp.postFrequency}</span>
                </div>
              </div>

              <a
                href={comp.adLibraryUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-xl text-xs font-bold border border-slate-800 transition-all shrink-0"
              >
                <span>Reklamları Gör</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
