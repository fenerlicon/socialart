import React, { useState, useEffect, useMemo } from 'react';
import { Lead, PipelineType, StageId } from '../types/crm';
import { STAGES } from '../mock/initialData';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Flame, 
  Zap, 
  Globe, 
  Trophy, 
  Target,
  Filter,
  Star,
  Search,
  Clapperboard,
  FolderGit2,
  Bot,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageSquare,
  ExternalLink,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle,
  Radio,
  RefreshCw,
  Eye,
  MousePointerClick
} from 'lucide-react';

interface AnalyticsViewProps {
  leads: Lead[];
  currentPipeline: PipelineType;
  onSelectLead?: (lead: Lead) => void;
  onToggleQualified?: (leadId: string) => void;
}

interface MetaSpendData {
  todaySpend: number;
  totalSpend: number;
  impressions: number;
  clicks: number;
  reach: number;
  cpc: number;
  campaignSpends: Record<string, number>;
  adsetSpends: Record<string, number>;
  adSpends: Record<string, number>;
  updatedAt?: string;
}

interface BreakdownRow {
  key: string;
  id: string;
  name: string;
  campaignName?: string;
  adsetName?: string;
  source: string;
  platform: string;
  isOrganic: boolean;
  isActiveAd: boolean;
  leads: Lead[];
  totalLeads: number;
  qualifiedCount: number;
  qualifiedRate: number;
  wonCount: number;
  wonRate: number;
  totalBudget: number;
  wonBudget: number;
  adSpend: number;
  cpl: number;
  cpql: number;
}

// Meta'da şu an aktif olan canlı kampanya, set ve reklam listesi
const ACTIVE_META_CAMPAIGNS = new Set([
  'Yeni Potansiyel Müşteriler Kampanyası',
  '120249717300470048'
]);

const ACTIVE_META_ADSETS = new Set([
  'Geniş eşleme',
  '120249717300460048'
]);

const ACTIVE_META_ADS = new Set([
  'Yeni Potansiyel Müşteriler Reklamı',
  'Yeni Potansiyel Müşteriler Reklamı - Kopya',
  'Yeni Potansiyel Müşteriler Reklamı - Kopya - Kopya',
  '120249717300480048',
  '120249828446910048',
  '120250627774720048'
]);

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  leads,
  currentPipeline,
  onSelectLead,
  onToggleQualified
}) => {
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL');
  const [breakdownLevel, setBreakdownLevel] = useState<'CAMPAIGN' | 'ADSET' | 'AD'>('CAMPAIGN');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [activeAdsOnly, setActiveAdsOnly] = useState<boolean>(true);
  const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);

  // Meta Canlı Harcama Durumu
  const [metaSpend, setMetaSpend] = useState<MetaSpendData>({
    todaySpend: 199.13,
    totalSpend: 3434.38,
    impressions: 7708,
    clicks: 339,
    reach: 3991,
    cpc: 10.13,
    campaignSpends: {
      'Yeni Potansiyel Müşteriler Kampanyası': 3434.38,
      '120249717300470048': 3434.38
    },
    adsetSpends: {
      'Geniş eşleme': 3434.38,
      '120249717300460048': 3434.38
    },
    adSpends: {
      'Yeni Potansiyel Müşteriler Reklamı': 3196.75,
      '120249717300480048': 3196.75,
      'Yeni Potansiyel Müşteriler Reklamı - Kopya': 132.88,
      '120249828446910048': 132.88,
      'Yeni Potansiyel Müşteriler Reklamı - Kopya - Kopya': 104.75,
      '120250627774720048': 104.75
    }
  });
  const [isRefreshingSpend, setIsRefreshingSpend] = useState<boolean>(false);

  // Güvenli Backend API'den canlı harcama çekme (Frontend'de token ifşa edilmez)
  const fetchLiveMetaSpend = async () => {
    setIsRefreshingSpend(true);
    try {
      const res = await fetch('/api/meta-insights?date_preset=this_month');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setMetaSpend({
            todaySpend: json.data.todaySpend || 0,
            totalSpend: json.data.totalSpend || 0,
            impressions: json.data.impressions || 0,
            clicks: json.data.clicks || 0,
            reach: json.data.reach || 0,
            cpc: json.data.cpc || 0,
            campaignSpends: json.data.campaignSpends || {},
            adsetSpends: json.data.adsetSpends || {},
            adSpends: json.data.adSpends || {},
            updatedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          });
        }
      }
    } catch (err) {
      console.warn('Meta Insights API call error:', err);
    } finally {
      setIsRefreshingSpend(false);
    }
  };

  useEffect(() => {
    // Ilk yuklemede aninda cek
    fetchLiveMetaSpend();

    // Her 30 saniyede bir otomatik anlik guncelle
    const interval = setInterval(() => {
      fetchLiveMetaSpend();
    }, 30000);

    // Kullanici sekmeye geri dondugunde aninda guncelle
    const handleFocus = () => {
      fetchLiveMetaSpend();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const pipelineLeads = leads.filter(l => l.pipeline === currentPipeline);

  // Financial calculations
  const getLeadNumericBudget = (l: Lead) => {
    const rawVal = currentPipeline === 'PRODUCTION' 
      ? l.productionDetails?.budget 
      : l.socialMediaDetails?.monthlyBudget;
    return (typeof rawVal === 'number' && !isNaN(rawVal))
      ? rawVal
      : (parseFloat(String(rawVal || '').replace(/[^0-9.-]+/g, '')) || 0);
  };

  const totalValue = pipelineLeads.reduce((acc, l) => Number(acc) + getLeadNumericBudget(l), 0);
  const wonLeads = pipelineLeads.filter(l => l.stage === 'WON');
  const wonValue = wonLeads.reduce((acc, l) => Number(acc) + getLeadNumericBudget(l), 0);
  const retargetingLeads = pipelineLeads.filter(l => l.stage === 'RETARGETING');
  const retargetingValue = retargetingLeads.reduce((acc, l) => Number(acc) + getLeadNumericBudget(l), 0);

  const conversionRate = pipelineLeads.length > 0
    ? Math.round((wonLeads.length / pipelineLeads.length) * 100)
    : 0;

  const avgDealSize = pipelineLeads.length > 0
    ? Math.round(totalValue / pipelineLeads.length)
    : 0;

  // Source breakdown
  const metaLeads = pipelineLeads.filter(l => l.source === 'META_ADS');
  const webLeads = pipelineLeads.filter(l => l.source === 'WEBSITE');
  const manualLeads = pipelineLeads.filter(l => l.source === 'MANUAL');

  const metaCount = metaLeads.length;
  const webCount = webLeads.length;
  const manualCount = manualLeads.length;

  const metaWon = metaLeads.filter(l => l.stage === 'WON').length;
  const webWon = webLeads.filter(l => l.stage === 'WON').length;
  const manualWon = manualLeads.filter(l => l.stage === 'WON').length;

  const metaQualified = metaLeads.filter(l => l.isQualified).length;
  const overallCpl = metaCount > 0 ? (metaSpend.totalSpend / metaCount) : 0;
  const overallCpql = metaQualified > 0 ? (metaSpend.totalSpend / metaQualified) : 0;

  // Clean Campaign / Ad Set / Ad breakdown computation
  const breakdownRows: BreakdownRow[] = useMemo(() => {
    const map = new Map<string, BreakdownRow>();

    pipelineLeads.forEach(l => {
      let key = '';
      let rowName = '';
      let rowId = '';
      let isActive = false;
      let spend = 0;

      if (breakdownLevel === 'CAMPAIGN') {
        if (l.campaignName || l.campaignId) {
          rowName = l.campaignName || `Kampanya #${l.campaignId}`;
          rowId = l.campaignId || '-';
          isActive = ACTIVE_META_CAMPAIGNS.has(rowName) || (l.campaignId ? ACTIVE_META_CAMPAIGNS.has(l.campaignId) : false);
          spend = metaSpend.campaignSpends[rowName] || (l.campaignId ? (metaSpend.campaignSpends[l.campaignId] || 0) : 0);
        } else if (l.source === 'WEBSITE') {
          rowName = '🌐 Web Sitesi Doğrudan Form Başvuruları (Organik)';
          rowId = '-';
          isActive = false;
        } else if (l.source === 'MANUAL') {
          rowName = '👤 Panelden Manuel Eklenen Kayıtlar';
          rowId = '-';
          isActive = false;
        } else {
          rowName = '⚡ Eski Meta Formları (Token Öncesi Kampanyasız Kayıtlar)';
          rowId = '-';
          isActive = false;
        }
        key = `CAMP_${l.source}_${rowName}_${rowId}`;
      } else if (breakdownLevel === 'ADSET') {
        if (l.adsetName || l.adsetId) {
          rowName = l.adsetName || `Hedef Seti #${l.adsetId}`;
          rowId = l.adsetId || '-';
          isActive = ACTIVE_META_ADSETS.has(rowName) || (l.adsetId ? ACTIVE_META_ADSETS.has(l.adsetId) : false);
          spend = metaSpend.adsetSpends[rowName] || (l.adsetId ? (metaSpend.adsetSpends[l.adsetId] || 0) : 0);
        } else if (l.source === 'WEBSITE') {
          rowName = '🌐 Web Sitesi (Reklamsız / Doğrudan Ziyaretçi)';
          rowId = '-';
          isActive = false;
        } else if (l.source === 'MANUAL') {
          rowName = '👤 Manuel Eklenenler (Hedef Seti Yok)';
          rowId = '-';
          isActive = false;
        } else {
          rowName = '⚡ Eski Meta Formları (Token Öncesi Hedef Seti Tanımsız)';
          rowId = '-';
          isActive = false;
        }
        key = `ADSET_${l.source}_${rowName}_${rowId}`;
      } else { // AD level
        if (l.adName || l.adId) {
          rowName = l.adName || `Reklam #${l.adId}`;
          rowId = l.adId || '-';
          isActive = ACTIVE_META_ADS.has(rowName) || (l.adId ? ACTIVE_META_ADS.has(l.adId) : false);
          spend = metaSpend.adSpends[rowName] || (l.adId ? (metaSpend.adSpends[l.adId] || 0) : 0);
        } else if (l.source === 'WEBSITE') {
          rowName = '🌐 Web Sitesi İletişim / Teklif Formu';
          rowId = '-';
          isActive = false;
        } else if (l.source === 'MANUAL') {
          rowName = '👤 Panelden Manuel Oluşturulan Müşteriler';
          rowId = '-';
          isActive = false;
        } else {
          rowName = '⚡ Eski Meta Formları (Token Öncesi Kreatif Tanımsız)';
          rowId = '-';
          isActive = false;
        }
        key = `AD_${l.source}_${rowName}_${rowId}`;
      }

      if (!map.has(key)) {
        map.set(key, {
          key,
          id: rowId,
          name: rowName,
          campaignName: l.campaignName,
          adsetName: l.adsetName,
          source: l.source,
          platform: l.platform || (l.source === 'META_ADS' ? 'Meta Ads (Instagram)' : l.source),
          isOrganic: Boolean(l.isOrganic || l.source === 'WEBSITE' || l.source === 'MANUAL'),
          isActiveAd: isActive,
          leads: [],
          totalLeads: 0,
          qualifiedCount: 0,
          qualifiedRate: 0,
          wonCount: 0,
          wonRate: 0,
          totalBudget: 0,
          wonBudget: 0,
          adSpend: spend,
          cpl: 0,
          cpql: 0
        });
      }

      const row = map.get(key)!;
      row.leads.push(l);
      row.totalLeads += 1;
      if (l.isQualified) {
        row.qualifiedCount += 1;
      }
      if (l.stage === 'WON') {
        row.wonCount += 1;
      }
      const b = getLeadNumericBudget(l);
      row.totalBudget += b;
      if (l.stage === 'WON') {
        row.wonBudget += b;
      }
    });

    return Array.from(map.values()).map(r => {
      const qRate = r.totalLeads > 0 ? Math.round((r.qualifiedCount / r.totalLeads) * 100) : 0;
      const wRate = r.totalLeads > 0 ? Math.round((r.wonCount / r.totalLeads) * 100) : 0;
      const leadCost = (r.adSpend > 0 && r.totalLeads > 0) ? Math.round(r.adSpend / r.totalLeads) : 0;
      const qualCost = (r.adSpend > 0 && r.qualifiedCount > 0) ? Math.round(r.adSpend / r.qualifiedCount) : 0;

      return {
        ...r,
        qualifiedRate: qRate,
        wonRate: wRate,
        cpl: leadCost,
        cpql: qualCost
      };
    }).sort((a, b) => b.totalLeads - a.totalLeads);
  }, [pipelineLeads, breakdownLevel, metaSpend]);

  // Filtered rows
  const filteredBreakdownRows = breakdownRows.filter(r => {
    if (activeAdsOnly && !r.isActiveAd && r.source === 'META_ADS') {
      return false;
    }
    const matchesSource = selectedSourceFilter === 'ALL' || r.source === selectedSourceFilter;
    const matchesQuery = !tableSearch || 
      r.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      r.id.toLowerCase().includes(tableSearch.toLowerCase()) ||
      (r.campaignName && r.campaignName.toLowerCase().includes(tableSearch.toLowerCase()));
    return matchesSource && matchesQuery;
  });

  const totalFilteredLeads = filteredBreakdownRows.reduce((acc, r) => acc + r.totalLeads, 0);
  const totalFilteredQualified = filteredBreakdownRows.reduce((acc, r) => acc + r.qualifiedCount, 0);
  const totalFilteredWon = filteredBreakdownRows.reduce((acc, r) => acc + r.wonCount, 0);
  const totalFilteredRevenue = filteredBreakdownRows.reduce((acc, r) => acc + r.totalBudget, 0);
  const totalFilteredSpend = filteredBreakdownRows.reduce((acc, r) => acc + r.adSpend, 0);
  const overallQualifiedRate = totalFilteredLeads > 0 ? Math.round((totalFilteredQualified / totalFilteredLeads) * 100) : 0;

  const toggleRowExpand = (rowKey: string) => {
    setExpandedRowKey(prev => prev === rowKey ? null : rowKey);
  };

  const stageMap = useMemo(() => {
    const map = new Map<StageId, { label: string; color: string }>();
    STAGES.forEach(s => map.set(s.id, { label: s.label, color: s.color }));
    return map;
  }, []);

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Section: Meta Live Spend & Performance Dashboard */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-5 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Meta Ads Canlı Harcama & Verimlilik
                </h3>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute" />
                  <span>Canlı Akış (30sn Otomatik)</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hesap: <strong>Socialart</strong> • Son Güncelleme: {metaSpend.updatedAt || 'Şimdi'}
              </p>
            </div>
          </div>

          <button
            onClick={fetchLiveMetaSpend}
            disabled={isRefreshingSpend}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingSpend ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Harcamayı Yenile</span>
          </button>
        </div>

        {/* Live Spend Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          
          {/* Today Spend */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-semibold block">📅 Bugünkü Harcama</span>
            <div className="text-xl font-black text-cyan-400 mt-1">
              ₺{metaSpend.todaySpend.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Bugün yayındaki reklamlara harcanan
            </span>
          </div>

          {/* Month Total Spend */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-semibold block">🗓️ Bu Ayki Toplam Harcama</span>
            <div className="text-xl font-black text-indigo-400 mt-1">
              ₺{metaSpend.totalSpend.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              {metaSpend.impressions.toLocaleString('tr-TR')} Gösterim • {metaSpend.clicks} Tık
            </span>
          </div>

          {/* CPL (Cost Per Lead) */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-semibold block">🎯 Lead Başı Maliyet (CPL)</span>
            <div className="text-xl font-black text-emerald-400 mt-1">
              ₺{overallCpl.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Toplam {metaCount} Meta lead'i için
            </span>
          </div>

          {/* CPQL (Cost Per Qualified Lead) */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-amber-400 font-semibold block flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400" /> ⭐ Kaliteli Lead Maliyeti
            </span>
            <div className="text-xl font-black text-amber-300 mt-1">
              ₺{overallCpql.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}
            </div>
            <span className="text-[10px] text-amber-300/70 mt-0.5 block font-medium">
              {metaQualified} Kaliteli Müşteri İçin
            </span>
          </div>

        </div>
      </div>

      {/* Main Grid: Pipeline Funnel + Source Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Pipeline Funnel (Aşamalar) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Pipeline Aşama & Dönüşüm Hunisi
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Müşterilerin satış hunisindeki dağılımı ve hacimleri
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-xl">
              Toplam: {pipelineLeads.length} Lead
            </span>
          </div>

          <div className="space-y-3.5">
            {STAGES.map((stage) => {
              const count = pipelineLeads.filter(l => l.stage === stage.id).length;
              const val = pipelineLeads
                .filter(l => l.stage === stage.id)
                .reduce((acc, l) => Number(acc) + getLeadNumericBudget(l), 0);
              
              const percent = pipelineLeads.length > 0
                ? Math.round((count / pipelineLeads.length) * 100)
                : 0;

              return (
                <div key={stage.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span className="font-bold text-slate-200">{stage.label}</span>
                      <span className="text-slate-500 font-semibold">({count} lead)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-300">
                        {val > 0 ? `₺${val.toLocaleString('tr-TR')}` : '-'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 w-8 text-right">
                        %{percent}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.max(percent, 2)}%`, 
                        backgroundColor: stage.color 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Lead Kaynakları */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              Lead Kaynakları Analizi
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Müşteriler hangi kanallardan geliyor?
            </p>
          </div>

          <div className="space-y-3">
            {/* Meta Ads Card */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between hover:border-blue-500/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">Meta Ads (FB/IG)</h4>
                  <span className="text-[11px] text-slate-400">{metaWon} Satış Anlaşması</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-base text-blue-400">{metaCount}</span>
                <span className="text-[10px] text-slate-500 block">Lead</span>
              </div>
            </div>

            {/* Website Form Card */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">Web Sitesi Formu</h4>
                  <span className="text-[11px] text-slate-400">{webWon} Satış Anlaşması</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-base text-purple-400">{webCount}</span>
                <span className="text-[10px] text-slate-500 block">Lead</span>
              </div>
            </div>

            {/* Manual / Referans Card */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">Manuel / Panelden</h4>
                  <span className="text-[11px] text-slate-400">{manualWon} Satış Anlaşması</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-base text-slate-300">{manualCount}</span>
                <span className="text-[10px] text-slate-500 block">Lead</span>
              </div>
            </div>

          </div>

          {/* Tips Box */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-300">
            💡 <strong>İpucu:</strong> Meta Ads harcamanız aylık ₺3.434 seviyesindedir. Kaliteli lead getiren kreatiflere bütçe artışı yaparak CPQL maliyetini düşürebilirsiniz.
          </div>
        </div>

      </div>

      {/* Clean & Interactive Campaign & Ad Performance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        
        {/* Header & Level Switchers */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Kampanya & Reklam Bazlı Harcama ve Lead Analizi
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hangi reklam ne kadar bütçe harcadı ve ne kadar <strong>kaliteli müşteri</strong> getirdi?
            </p>
          </div>

          {/* 3 Clean Level Switchers (Kampanya, Reklam Seti, Reklam) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => {
                setBreakdownLevel('CAMPAIGN');
                setExpandedRowKey(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                breakdownLevel === 'CAMPAIGN'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>🎯 Kampanyalar</span>
            </button>
            <button
              onClick={() => {
                setBreakdownLevel('ADSET');
                setExpandedRowKey(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                breakdownLevel === 'ADSET'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>👥 Reklam Setleri</span>
            </button>
            <button
              onClick={() => {
                setBreakdownLevel('AD');
                setExpandedRowKey(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                breakdownLevel === 'AD'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5" />
              <span>🎬 Reklam Kreatifleri</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
          
          {/* Source & Active Ads Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            
            {/* Active Ads Toggle */}
            <button
              onClick={() => setActiveAdsOnly(!activeAdsOnly)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold border transition-all ${
                activeAdsOnly
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Sadece Meta'da yayında olan aktif reklamları filtreler"
            >
              <span className={`w-2 h-2 rounded-full ${activeAdsOnly ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span>{activeAdsOnly ? '🟢 Sadece Aktif Reklamlar' : '📁 Tümü (Arşiv Dahil)'}</span>
            </button>

            <span className="text-slate-600">|</span>

            {/* Source Filter Pills */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedSourceFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  selectedSourceFilter === 'ALL'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setSelectedSourceFilter('META_ADS')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  selectedSourceFilter === 'META_ADS'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                ⚡ Meta Ads
              </button>
              <button
                onClick={() => setSelectedSourceFilter('WEBSITE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  selectedSourceFilter === 'WEBSITE'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                🌐 Web
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Kampanya, reklam veya ID ara..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-1.5 outline-none focus:border-indigo-500 placeholder-slate-500"
            />
          </div>
        </div>

        {/* High-level Summary Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block">Toplam Lead:</span>
            <span className="font-black text-white text-sm">{totalFilteredLeads}</span>
          </div>
          <div>
            <span className="text-amber-400 font-semibold block flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> ⭐ Kaliteli Lead:
            </span>
            <span className="font-black text-amber-300 text-sm">
              {totalFilteredQualified} <span className="text-[11px] font-normal text-slate-400">(%{overallQualifiedRate})</span>
            </span>
          </div>
          <div>
            <span className="text-indigo-400 font-semibold block">Filtrelenen Harcama:</span>
            <span className="font-black text-indigo-300 text-sm">₺{totalFilteredSpend.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-emerald-400 font-semibold block">Kazanılan Ciro Hacmi:</span>
            <span className="font-black text-emerald-400 text-sm">₺{totalFilteredRevenue.toLocaleString('tr-TR')}</span>
          </div>
        </div>

        {/* Clean Structured Table with Row Click Expansion */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">
                  {breakdownLevel === 'CAMPAIGN' && 'Kampanya Adı (campaign_name)'}
                  {breakdownLevel === 'ADSET' && 'Reklam Seti (adset_name)'}
                  {breakdownLevel === 'AD' && 'Reklam Kreatifi (ad_name)'}
                </th>
                <th className="py-3 px-3">Durum</th>
                <th className="py-3 px-3 text-right">Reklam Harcaması</th>
                <th className="py-3 px-3 text-center">Toplam Lead</th>
                <th className="py-3 px-3 text-center">⭐ Kaliteli Lead</th>
                <th className="py-3 px-3 text-center">Kalite Oranı</th>
                <th className="py-3 px-3 text-right">CPL (Lead Başı)</th>
                <th className="py-3 px-3 text-right">CPQL (Kaliteli Başı)</th>
                <th className="py-3 px-3 text-center">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBreakdownRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500 text-xs">
                    Aktif reklam filtrelerine uygun veri bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredBreakdownRows.map((row) => {
                  const isExpanded = expandedRowKey === row.key;

                  return (
                    <React.Fragment key={row.key}>
                      <tr 
                        onClick={() => toggleRowExpand(row.key)}
                        className={`hover:bg-slate-900/70 transition-colors cursor-pointer group ${
                          isExpanded ? 'bg-slate-900/80 border-b-0' : ''
                        }`}
                      >
                        {/* Name & Hierarchy */}
                        <td className="py-3.5 px-4 font-bold text-slate-200">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              row.isActiveAd ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' :
                              row.source === 'META_ADS' ? 'bg-blue-400' :
                              row.source === 'WEBSITE' ? 'bg-purple-400' : 'bg-slate-500'
                            }`} />
                            <div>
                              <div className="text-slate-100 group-hover:text-cyan-300 transition-colors font-black text-sm">
                                {row.name}
                              </div>
                              {breakdownLevel !== 'CAMPAIGN' && row.campaignName && (
                                <span className="text-[10px] text-slate-500 font-normal block">
                                  Kampanya: {row.campaignName}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status & Traffic Type */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            {row.isActiveAd ? (
                              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                🟢 Yayında
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-900 text-slate-500 border border-slate-800">
                                ⏸️ Arşiv
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Ad Spend */}
                        <td className="py-3.5 px-3 text-right">
                          <span className={`font-black text-xs ${row.adSpend > 0 ? 'text-indigo-300' : 'text-slate-500'}`}>
                            {row.adSpend > 0 ? `₺${row.adSpend.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '-'}
                          </span>
                        </td>

                        {/* Total Leads */}
                        <td className="py-3.5 px-3 text-center">
                          <span className="font-extrabold text-sm text-slate-100">
                            {row.totalLeads}
                          </span>
                        </td>

                        {/* Quality Leads Count */}
                        <td className="py-3.5 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-black border ${
                            row.qualifiedCount > 0
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-900 text-slate-500 border-slate-800'
                          }`}>
                            <Star className={`w-3 h-3 ${row.qualifiedCount > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                            {row.qualifiedCount}
                          </span>
                        </td>

                        {/* Quality Rate Bar */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="flex flex-col items-center gap-1 min-w-[70px]">
                            <span className={`font-extrabold text-xs ${
                              row.qualifiedRate >= 50 ? 'text-amber-300' :
                              row.qualifiedRate > 0 ? 'text-slate-300' : 'text-slate-500'
                            }`}>
                              %{row.qualifiedRate}
                            </span>
                            <div className="w-16 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                              <div
                                className="bg-amber-400 h-full rounded-full transition-all"
                                style={{ width: `${row.qualifiedRate}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* CPL */}
                        <td className="py-3.5 px-3 text-right">
                          <span className={`font-bold text-xs ${row.cpl > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {row.cpl > 0 ? `₺${row.cpl}` : '-'}
                          </span>
                        </td>

                        {/* CPQL */}
                        <td className="py-3.5 px-3 text-right">
                          <span className={`font-black text-xs ${row.cpql > 0 ? 'text-amber-300' : 'text-slate-500'}`}>
                            {row.cpql > 0 ? `₺${row.cpql}` : '-'}
                          </span>
                        </td>

                        {/* Toggle Arrow */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpand(row.key);
                            }}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isExpanded
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                            title="Müşterileri Göster / Gizle"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* EXPANDED DRILL-DOWN CUSTOMER FEED */}
                      {isExpanded && (
                        <tr className="bg-slate-950 border-b-2 border-indigo-500/30">
                          <td colSpan={9} className="p-4 sm:p-5">
                            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-inner">
                              
                              {/* Expanded Feed Header */}
                              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-indigo-400" />
                                  <h5 className="font-extrabold text-xs sm:text-sm text-slate-100">
                                    "{row.name}" Gelen Müşterileri ({row.leads.length} Kişi)
                                  </h5>
                                </div>
                                <div className="flex items-center gap-2">
                                  {row.adSpend > 0 && (
                                    <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                                      Harcama: ₺{row.adSpend.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                    </span>
                                  )}
                                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400" /> {row.qualifiedCount} Kaliteli Lead
                                  </span>
                                </div>
                              </div>

                              {/* Lead Cards List */}
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                                {row.leads.map((lead) => {
                                  const stageInfo = stageMap.get(lead.stage) || { label: lead.stage, color: '#64748b' };

                                  return (
                                    <div
                                      key={lead.id}
                                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 ${
                                        lead.isQualified
                                          ? 'bg-amber-950/15 border-amber-500/40 shadow-sm shadow-amber-500/10'
                                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                      }`}
                                    >
                                      <div>
                                        {/* Top Row: Title & Stage */}
                                        <div className="flex items-start justify-between gap-2">
                                          <h6 className="font-bold text-xs text-white line-clamp-1">
                                            {lead.title}
                                          </h6>
                                          <span 
                                            className="text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 text-white"
                                            style={{ backgroundColor: stageInfo.color }}
                                          >
                                            {stageInfo.label}
                                          </span>
                                        </div>

                                        {/* Contact Person & Service Answer */}
                                        <div className="text-[11px] text-slate-400 mt-1 space-y-0.5">
                                          {lead.contactName && (
                                            <div className="font-medium text-slate-300 truncate">
                                              👤 {lead.contactName}
                                            </div>
                                          )}
                                          {lead.service && (
                                            <div className="text-[10px] text-slate-500 truncate">
                                              📋 Seçilen Hizmet: <span className="text-slate-400 font-semibold">{lead.service}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Phone & Actions Row */}
                                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2 text-xs">
                                        
                                        {/* Phone Links */}
                                        <div className="flex items-center gap-1.5">
                                          {lead.phone ? (
                                            <>
                                              <a
                                                href={`tel:${lead.phone}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1 rounded-md bg-slate-900 text-cyan-400 border border-slate-800 hover:border-cyan-500/40"
                                                title={`Ara: ${lead.phone}`}
                                              >
                                                <Phone className="w-3 h-3" />
                                              </a>
                                              <a
                                                href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1 rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/60"
                                                title="WhatsApp Mesaj Gönder"
                                              >
                                                <MessageSquare className="w-3 h-3" />
                                              </a>
                                              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[90px]">
                                                {lead.phone}
                                              </span>
                                            </>
                                          ) : (
                                            <span className="text-[10px] text-slate-600">Tel Yok</span>
                                          )}
                                        </div>

                                        {/* Quality Toggle & Open Modal Button */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          {onToggleQualified && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleQualified(lead.id);
                                              }}
                                              className={`p-1 rounded-md border text-[10px] font-bold flex items-center gap-1 ${
                                                lead.isQualified
                                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-amber-300'
                                              }`}
                                              title="Kaliteli Olarak İşaretle / Kaldır"
                                            >
                                              <Star className={`w-3 h-3 ${lead.isQualified ? 'fill-amber-400 text-amber-400' : ''}`} />
                                            </button>
                                          )}

                                          {onSelectLead && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectLead(lead);
                                              }}
                                              className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-md font-bold text-[10px] transition-all flex items-center gap-1"
                                            >
                                              <span>Detay</span>
                                              <ArrowRight className="w-2.5 h-2.5" />
                                            </button>
                                          )}
                                        </div>

                                      </div>

                                    </div>
                                  );
                                })}
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
