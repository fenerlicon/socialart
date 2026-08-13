import React, { useState, useMemo } from 'react';
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
  ArrowRight
} from 'lucide-react';

interface AnalyticsViewProps {
  leads: Lead[];
  currentPipeline: PipelineType;
  onSelectLead?: (lead: Lead) => void;
  onToggleQualified?: (leadId: string) => void;
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
  leads: Lead[];
  totalLeads: number;
  qualifiedCount: number;
  qualifiedRate: number;
  wonCount: number;
  wonRate: number;
  totalBudget: number;
  wonBudget: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  leads,
  currentPipeline,
  onSelectLead,
  onToggleQualified
}) => {
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL');
  const [breakdownLevel, setBreakdownLevel] = useState<'CAMPAIGN' | 'ADSET' | 'AD'>('CAMPAIGN');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);

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
  const googleLeads = pipelineLeads.filter(l => l.source === 'GOOGLE_ADS');
  const webLeads = pipelineLeads.filter(l => l.source === 'WEBSITE');
  const manualLeads = pipelineLeads.filter(l => l.source === 'MANUAL');
  const aiLeads = pipelineLeads.filter(l => l.source === 'AI_AGENT');

  const metaCount = metaLeads.length;
  const googleCount = googleLeads.length;
  const webCount = webLeads.length;
  const manualCount = manualLeads.length;
  const aiCount = aiLeads.length;

  const metaWon = metaLeads.filter(l => l.stage === 'WON').length;
  const googleWon = googleLeads.filter(l => l.stage === 'WON').length;
  const webWon = webLeads.filter(l => l.stage === 'WON').length;
  const manualWon = manualLeads.filter(l => l.stage === 'WON').length;

  // Clean Campaign / Ad Set / Ad breakdown computation
  // (Strictly uses actual campaign and ad names without pretending form answers are campaigns)
  const breakdownRows: BreakdownRow[] = useMemo(() => {
    const map = new Map<string, BreakdownRow>();

    pipelineLeads.forEach(l => {
      let key = '';
      let rowName = '';
      let rowId = '';

      if (breakdownLevel === 'CAMPAIGN') {
        if (l.campaignName || l.campaignId) {
          rowName = l.campaignName || `Kampanya #${l.campaignId}`;
          rowId = l.campaignId || '-';
        } else {
          rowName = l.source === 'WEBSITE'
            ? 'Web Sitesi Doğrudan Form Başvurusu'
            : (l.source === 'META_ADS' ? 'Meta Formu (Kampanya Adı Atanmamış)' : 'Manuel / Panel Girişi');
          rowId = '-';
        }
        key = `CAMP_${l.source}_${rowName}_${rowId}`;
      } else if (breakdownLevel === 'ADSET') {
        if (l.adsetName || l.adsetId) {
          rowName = l.adsetName || `Set #${l.adsetId}`;
          rowId = l.adsetId || '-';
        } else {
          rowName = l.source === 'META_ADS'
            ? 'Meta Formu (Hedef Seti Belirtilmemiş)'
            : 'Genel Hedef Kitle';
          rowId = '-';
        }
        key = `ADSET_${l.source}_${rowName}_${rowId}`;
      } else { // AD level
        if (l.adName || l.adId) {
          rowName = l.adName || `Reklam #${l.adId}`;
          rowId = l.adId || '-';
        } else {
          rowName = l.source === 'META_ADS'
            ? 'Meta Doğrudan Reklam Formu'
            : (l.source === 'WEBSITE' ? 'Web Formu' : 'Manuel Kayıt');
          rowId = '-';
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
          leads: [],
          totalLeads: 0,
          qualifiedCount: 0,
          qualifiedRate: 0,
          wonCount: 0,
          wonRate: 0,
          totalBudget: 0,
          wonBudget: 0,
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

    return Array.from(map.values()).map(r => ({
      ...r,
      qualifiedRate: r.totalLeads > 0 ? Math.round((r.qualifiedCount / r.totalLeads) * 100) : 0,
      wonRate: r.totalLeads > 0 ? Math.round((r.wonCount / r.totalLeads) * 100) : 0,
    })).sort((a, b) => b.totalLeads - a.totalLeads);
  }, [pipelineLeads, breakdownLevel]);

  // Filtered rows
  const filteredBreakdownRows = breakdownRows.filter(r => {
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
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue Potential */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Toplam Pipeline Hacmi</span>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
              ₺{totalValue.toLocaleString('tr-TR')}
              {currentPipeline === 'SOCIAL_MEDIA' && <span className="text-xs font-normal text-slate-400"> /ay</span>}
            </h3>
            <span className="text-xs text-slate-500 mt-1 block">
              Aktif müşteri fırsatları toplamı
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Won Deals & Value */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Kazanılan Ciro (Won)</span>
            <h3 className="text-2xl font-extrabold text-indigo-400 mt-1">
              ₺{wonValue.toLocaleString('tr-TR')}
            </h3>
            <span className="text-xs text-indigo-300/80 mt-1 block font-medium">
              {wonLeads.length} Müşteri ile Anlaşıldı
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Satış Dönüşüm Oranı</span>
            <h3 className="text-2xl font-extrabold text-cyan-400 mt-1">
              %{conversionRate}
            </h3>
            <span className="text-xs text-slate-500 mt-1 block">
              Lead başına ort. ₺{avgDealSize.toLocaleString('tr-TR')}
            </span>
          </div>
          <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Retargeting Pool */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Yeniden Pazarlama Havuzu</span>
            <h3 className="text-2xl font-extrabold text-amber-400 mt-1">
              {retargetingLeads.length} Lead
            </h3>
            <span className="text-xs text-amber-300/80 mt-1 block font-medium">
              ₺{retargetingValue.toLocaleString('tr-TR')} Potansiyel
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400">
            <Flame className="w-6 h-6" />
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

            {/* Google Ads Card */}
            {googleCount > 0 && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-200">Google Ads</h4>
                    <span className="text-[11px] text-slate-400">{googleWon} Satış Anlaşması</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-base text-emerald-400">{googleCount}</span>
                  <span className="text-[10px] text-slate-500 block">Lead</span>
                </div>
              </div>
            )}

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

            {/* AI Agent Card (if any) */}
            {aiCount > 0 && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between hover:border-pink-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-200">ChatGPT AI Asistanı</h4>
                    <span className="text-[11px] text-slate-400">Otomatik Leadler</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-base text-pink-400">{aiCount}</span>
                  <span className="text-[10px] text-slate-500 block">Lead</span>
                </div>
              </div>
            )}

          </div>

          {/* Tips Box */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-300">
            💡 <strong>İpucu:</strong> Meta Ads'ten gelen lead'lerin dönüşüm hızını artırmak için ilk 15 dakika içerisinde WhatsApp veya Telefon ile dönüş yapın.
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
              Kampanya & Reklam Bazlı Lead Analizi
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tablodaki herhangi bir satıra tıklayarak o kampanya veya reklamdan gelen <strong>tüm müşteri adaylarını</strong> listeleyebilirsiniz.
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
          
          {/* Source Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrele:
            </span>
            <button
              onClick={() => setSelectedSourceFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                selectedSourceFilter === 'ALL'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Tümü ({breakdownRows.length})
            </button>
            <button
              onClick={() => setSelectedSourceFilter('META_ADS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                selectedSourceFilter === 'META_ADS'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              ⚡ Meta Ads ({breakdownRows.filter(g => g.source === 'META_ADS').length})
            </button>
            <button
              onClick={() => setSelectedSourceFilter('WEBSITE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                selectedSourceFilter === 'WEBSITE'
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              🌐 Web ({breakdownRows.filter(g => g.source === 'WEBSITE').length})
            </button>
            <button
              onClick={() => setSelectedSourceFilter('MANUAL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                selectedSourceFilter === 'MANUAL'
                  ? 'bg-slate-700 text-white border-slate-600 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              👤 Manuel ({breakdownRows.filter(g => g.source === 'MANUAL').length})
            </button>
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
            <span className="text-emerald-400 font-semibold block">Kazanılan Satış (Won):</span>
            <span className="font-black text-emerald-400 text-sm">{totalFilteredWon} Marka</span>
          </div>
          <div>
            <span className="text-purple-400 font-semibold block">Toplam Ciro Hacmi:</span>
            <span className="font-black text-purple-300 text-sm">₺{totalFilteredRevenue.toLocaleString('tr-TR')}</span>
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
                <th className="py-3 px-3">ID & Tür</th>
                <th className="py-3 px-3 text-center">Toplam Lead</th>
                <th className="py-3 px-3 text-center">⭐ Kaliteli Lead</th>
                <th className="py-3 px-3 text-center">Kalite Oranı</th>
                <th className="py-3 px-3 text-center">Kazanılan (Won)</th>
                <th className="py-3 px-3 text-right">Ciro Hacmi</th>
                <th className="py-3 px-3 text-center">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBreakdownRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 text-xs">
                    Aranan kriterlere uygun kampanya veya reklam verisi bulunamadı.
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
                              row.source === 'META_ADS' ? 'bg-blue-400 shadow-sm shadow-blue-500/50' :
                              row.source === 'GOOGLE_ADS' ? 'bg-emerald-400' :
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

                        {/* ID & Traffic Type */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            <div className="text-[10px] font-mono text-slate-400">
                              {row.id !== '-' ? `#${row.id}` : '-'}
                            </div>
                            <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-extrabold border ${
                              row.isOrganic
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {row.isOrganic ? '🌱 Organik' : '💰 Sponsorlu'}
                            </span>
                          </div>
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

                        {/* Won Deals */}
                        <td className="py-3.5 px-3 text-center">
                          <span className={`font-extrabold text-xs ${row.wonCount > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {row.wonCount > 0 ? `✓ ${row.wonCount} Satış` : '-'}
                          </span>
                        </td>

                        {/* Revenue */}
                        <td className="py-3.5 px-3 text-right">
                          <span className="font-extrabold text-xs text-slate-200">
                            {row.totalBudget > 0 ? `₺${row.totalBudget.toLocaleString('tr-TR')}` : '-'}
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
                          <td colSpan={8} className="p-4 sm:p-5">
                            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-inner">
                              
                              {/* Expanded Feed Header */}
                              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-indigo-400" />
                                  <h5 className="font-extrabold text-xs sm:text-sm text-slate-100">
                                    "{row.name}" Gelen Müşterileri ({row.leads.length} Kişi)
                                  </h5>
                                </div>
                                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-amber-400" /> {row.qualifiedCount} Kaliteli Lead
                                </span>
                              </div>

                              {/* Lead Cards List */}
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                                {row.leads.map((lead) => {
                                  const stageInfo = stageMap.get(lead.stage) || { label: lead.stage, color: '#64748b' };
                                  const leadBudget = getLeadNumericBudget(lead);

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
