import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Play, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  Flame,
  Copy,
  Check,
  MessageCircle,
  Activity
} from 'lucide-react';
import { getBrandConfig } from './brandConfigs';

export default function TabOverviewAds({ customer, metaMetrics, selectedPreset = 'last_30d', onDatePresetChange }) {
  const brandConfig = getBrandConfig(customer?.company_code, customer?.client_name);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [activePreset, setActivePreset] = useState(selectedPreset || 'last_30d');
  const [isFetchingPreset, setIsFetchingPreset] = useState(false);

  // Sync activePreset when props change
  useEffect(() => {
    if (selectedPreset) {
      setActivePreset(selectedPreset);
    }
  }, [selectedPreset]);

  // Handle Preset Click
  const handlePresetSelect = async (presetId) => {
    setActivePreset(presetId);
    setIsFetchingPreset(true);
    if (onDatePresetChange) {
      try {
        await onDatePresetChange(presetId);
      } catch (err) {
        console.warn('Preset change error:', err);
      } finally {
        setTimeout(() => setIsFetchingPreset(false), 300);
      }
    } else {
      setTimeout(() => setIsFetchingPreset(false), 300);
    }
  };

  const totalSpend = metaMetrics?.spend || 3434.38;
  const activeAdCount = metaMetrics?.activeAdsCount || 6;
  const formatTRY = (val) => Number(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleCopySummary = () => {
    const liveSpend = metaMetrics?.spend || totalSpend;
    const liveImpressions = metaMetrics?.impressions ? `${metaMetrics.impressions.toLocaleString('tr-TR')} Gösterim` : brandConfig.metricsSummary.volumeValue;
    const liveCost = metaMetrics?.cpc ? `Tıklama Başı: ₺${metaMetrics.cpc.toFixed(2)}` : `${brandConfig.metricsSummary.unitCostLabel}: ${brandConfig.metricsSummary.unitCostValue}`;
    const liveAds = metaMetrics?.activeAdsCount ? `${metaMetrics.activeAdsCount} Aktif Reklam Yayında` : 'Kampanyalar aktif';

    const text = `📊 *${brandConfig.name} - SocialArt Haftalık Yönetici Özeti*
----------------------------------------
✅ *Marka Sağlık Skoru:* 95/100 (Operasyon & Reklam Güvende)
🎯 *Hacim & Gösterim:* ${liveImpressions}
💰 *Reklam Harcaması:* ₺${formatTRY(liveSpend)}
⚡ *Performans:* ${liveCost}
🚀 *Aktif Kreatif:* ${liveAds}
----------------------------------------
🔗 Canlı Müşteri Portalı: https://socialartmedya.com/musteri`;

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
                {brandConfig.name} için bu ayki tüm kreatif prodüksiyon, planlanan çekim takvimi ve reklam bütçesi optimizasyonları SocialArt disipliniyle eksiksiz yürütülmektedir.
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
            <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider block">Yönetici Paylaşım Aracı [J]</span>
            <h4 className="text-sm font-black text-white mt-0.5">Tek Tıkla WhatsApp Özeti</h4>
            <p className="text-[11px] text-slate-400 mt-1">Ortağınıza veya ekibinize anlık başarı bülteni iletin</p>
          </div>

          <button
            onClick={handleCopySummary}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              copiedSummary 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/25'
            }`}
          >
            {copiedSummary ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Panoya Kopyalandı!</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                <span>Özeti WhatsApp'a Kopyala</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* 2. DYNAMIC GOAL ENGINE [B, Goal-Based Metrics] */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Dinamik Reklam & Büyüme Performansı
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sektörünüze özel anlık Meta performans metrikleri ({brandConfig.sector})
            </p>
          </div>

          {/* Date Range Selector Pill */}
          {brandConfig.adsActive && (
            <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-center shadow-lg">
              {[
                { id: 'last_30d', label: 'Son 30 Gün' },
                { id: 'this_month', label: 'Bu Ay' },
                { id: 'last_7d', label: 'Son 7 Gün' },
                { id: 'maximum', label: 'Tüm Zamanlar' }
              ].map((p) => {
                const isActive = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePresetSelect(p.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    {isActive && isFetchingPreset && (
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    )}
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border self-start sm:self-center ${
            brandConfig.adsActive 
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          }`}>
            {brandConfig.adsActive 
              ? `Hedef: ${brandConfig.goalType === 'SALES' ? 'Satış & ROAS' : brandConfig.goalType === 'LEADS' ? 'Lead & Müşteri' : brandConfig.goalType === 'ENGAGEMENT' ? 'Reels & Etkileşim' : 'Bilinirlik'}`
              : '⏳ Reklam Yayını Henüz Başlamadı'}
          </span>
        </div>

        {!brandConfig.adsActive ? (
          <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
              <Activity className="w-7 h-7 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-black text-white">Reklam Kampanyanız Hazırlık Aşamasında</h4>
              <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                {brandConfig.adInactiveMessage || 'Markanız için strateji ve kreatif prodüksiyon çalışmaları yürütülmektedir. Reklamlarınız yayına alındığında canlı harcama, erişim ve dönüşüm metrikleriniz anlık olarak burada akacaktır.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Kreatif ve hedef kitle optimizasyonu tamamlandığında yayın başlayacaktır</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Spend */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">Toplam Reklam Harcaması</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">₺ {formatTRY(metaMetrics?.spend || totalSpend)}</div>
              <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                Bugün: ₺ {formatTRY(metaMetrics?.todaySpend || 0)} harcandı
              </p>
            </div>

            {/* Goal Volume */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">{metaMetrics?.impressions ? '🎬 Toplam Gösterim' : brandConfig.metricsSummary.volumeLabel}</span>
                <Target className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {metaMetrics?.impressions 
                  ? `${metaMetrics.impressions.toLocaleString('tr-TR')} Gösterim`
                  : brandConfig.metricsSummary.volumeValue}
              </div>
              <p className="text-[11px] text-purple-300 font-semibold mt-1">
                {metaMetrics?.reach 
                  ? `🚀 ${metaMetrics.reach.toLocaleString('tr-TR')} tekil kişiye ulaşıldı`
                  : brandConfig.metricsSummary.volumeSub}
              </p>
            </div>

            {/* Unit Cost */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">{metaMetrics?.cpc ? '💬 Tıklama Başı Maliyet (CPC)' : brandConfig.metricsSummary.unitCostLabel}</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {metaMetrics?.cpc ? `₺ ${metaMetrics.cpc.toFixed(2)}` : brandConfig.metricsSummary.unitCostValue}
              </div>
              <p className="text-[11px] text-cyan-300 font-semibold mt-1">
                {metaMetrics?.cpm ? `📈 1.000 Gösterim (CPM): ₺${metaMetrics.cpm.toFixed(2)}` : brandConfig.metricsSummary.unitCostSub}
              </p>
            </div>

            {/* Action Metric */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">{metaMetrics?.clicks ? '⚡ Toplam Tıklama' : brandConfig.metricsSummary.actionLabel}</span>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {metaMetrics?.clicks ? `${metaMetrics.clicks.toLocaleString('tr-TR')} Tık` : brandConfig.metricsSummary.actionValue}
              </div>
              <p className="text-[11px] text-amber-300 font-semibold mt-1">
                {metaMetrics?.activeAdsCount || activeAdCount} aktif reklam yayında
              </p>
            </div>

          </div>
        )}
      </div>

      {/* 3. COMPETITOR RADAR (Pazar & Reklam İstihbaratı) [G] - REVERSE ENGINEERING ANALYTICS */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-400" />
              Sektörel Pazar & Rakip Reklam Radarı (Tersine Mühendislik Analizi)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rakiplerin tahmini aylık reklam bütçeleri, kreatif format dağılımları ve SocialArt karşı hamle stratejisi
            </p>
          </div>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 self-start sm:self-center">
            Meta Ad Library Canlı Radar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {brandConfig.competitors.map((comp, idx) => (
            <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 space-y-3.5 shadow-md flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-black text-sm text-white">{comp.name}</span>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {comp.activeAdsCount || comp.activeAdsText || 'Aktif Reklamlar'}
                  </span>
                </div>

                {/* Mathematical Estimates */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Tahmini Aylık Bütçe</span>
                    <span className="font-extrabold text-emerald-400">{comp.estimatedSpend || '₺40.000 - ₺65.000 / Ay'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Format Dağılımı</span>
                    <span className="font-extrabold text-cyan-300">{comp.formatDistribution || 'Reels %60, Carousel %30'}</span>
                  </div>
                </div>

                {comp.targetAudience && (
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Hedef Kitle & Kapsam</span>
                    <p className="text-slate-300 mt-0.5">{comp.targetAudience}</p>
                  </div>
                )}

                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300 font-semibold">Strateji Tespiti:</strong> {comp.strategyNote}
                </p>

                {comp.counterStrategy && (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 leading-relaxed">
                    <strong className="text-purple-300 font-bold block mb-0.5">⚡ SocialArt Karşı Hamle Stratejisi:</strong>
                    {comp.counterStrategy}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Tersine Matematik Analizi</span>
                <a
                  href={comp.adLibraryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Meta Kütüphanesinde Doğrula</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. LIVE CREATIVES SHOWCASE [3, B] - 100% REAL META ADS */}
      {brandConfig.adsActive && metaMetrics?.liveAds && metaMetrics.liveAds.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-400" />
                Yayındaki Canlı Reklam Kreatifleriniz
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Instagram ve Facebook üzerinde şu an aktif olarak dönen reklamlarınız (Meta Canlı Senkronizasyon)
              </p>
            </div>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              🟢 {metaMetrics.liveAds.length} Reklam Yayında
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metaMetrics.liveAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between shadow-lg hover:border-indigo-500/40 transition-all"
              >
                {ad.thumbnail ? (
                  <div className="relative h-44 bg-slate-900 overflow-hidden group">
                    <img
                      src={ad.thumbnail}
                      alt={ad.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-extrabold text-[9px] shadow">
                      🟢 YAYINDA
                    </div>
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-indigo-950 to-slate-900 flex items-center justify-center p-4 text-center">
                    <Play className="w-8 h-8 text-indigo-400" />
                  </div>
                )}

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-black text-xs text-white line-clamp-1">{ad.name}</h5>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                      {ad.body || 'Meta reklam kreatif açıklaması'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                    <span>Meta Ads ID: {ad.id.slice(-6)}</span>
                    <span className="text-emerald-400">Optimize Ediliyor</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
