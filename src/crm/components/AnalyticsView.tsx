import React, { useState } from 'react';
import { Lead, PipelineType } from '../types/crm';
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
  ArrowUpRight,
  Layers,
  Sparkles,
  Bot,
  Filter
} from 'lucide-react';

interface AnalyticsViewProps {
  leads: Lead[];
  currentPipeline: PipelineType;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  leads,
  currentPipeline
}) => {
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL');
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

  // Group by specific Ad / Campaign / Service
  const adGroupsMap = new Map<string, {
    name: string;
    source: string;
    platform: string;
    leads: Lead[];
    totalBudget: number;
    wonCount: number;
    wonBudget: number;
  }>();

  pipelineLeads.forEach(l => {
    const rawAdName = (l.adName || l.campaignName || (l.productionDetails?.projectType) || (l.socialMediaDetails?.industry) || 'Genel Reklam').trim();
    const key = `${l.source}_${rawAdName}`;

    if (!adGroupsMap.has(key)) {
      adGroupsMap.set(key, {
        name: rawAdName,
        source: l.source,
        platform: l.platform || (l.source === 'META_ADS' ? 'Meta Ads (Instagram)' : l.source),
        leads: [],
        totalBudget: 0,
        wonCount: 0,
        wonBudget: 0
      });
    }

    const group = adGroupsMap.get(key)!;
    group.leads.push(l);
    const b = getLeadNumericBudget(l);
    group.totalBudget += b;
    if (l.stage === 'WON') {
      group.wonCount += 1;
      group.wonBudget += b;
    }
  });

  const adGroups = Array.from(adGroupsMap.values())
    .sort((a, b) => b.leads.length - a.leads.length);

  const filteredAdGroups = selectedSourceFilter === 'ALL'
    ? adGroups
    : adGroups.filter(g => g.source === selectedSourceFilter);

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
            <span className="text-[11px] text-slate-500 mt-1 block">Aktif {pipelineLeads.length} potansiyel müşteri</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Won Sales Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Kazanılan Satış Ciro</span>
            <h3 className="text-2xl font-extrabold text-indigo-400 mt-1">
              ₺{wonValue.toLocaleString('tr-TR')}
            </h3>
            <span className="text-[11px] text-emerald-400 mt-1 font-bold flex items-center gap-1">
              <Trophy className="w-3 h-3" /> {wonLeads.length} Anlaşma İmzalandı
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Retargeting Pool */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Retargeting Havuzu</span>
            <h3 className="text-2xl font-extrabold text-pink-400 mt-1">
              ₺{retargetingValue.toLocaleString('tr-TR')}
            </h3>
            <span className="text-[11px] text-pink-300 mt-1 block">{retargetingLeads.length} İleride Görüşülecek Lead</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Kazanma Dönüşüm Oranı</span>
            <h3 className="text-2xl font-extrabold text-blue-400 mt-1">
              %{conversionRate}
            </h3>
            <span className="text-[11px] text-slate-500 mt-1 block">Ort. İş Büyüklüğü: ₺{avgDealSize.toLocaleString('tr-TR')}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Funnel + Lead Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Stage Conversion Funnel (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-100">Satış Aşaması Huni (Funnel) Dağılımı</h3>
              <p className="text-xs text-slate-400">Her bir aşamada bekleyen bütçe ve lead adetleri</p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="space-y-3 pt-2">
            {STAGES.map((st) => {
              const stageLeads = pipelineLeads.filter(l => l.stage === st.id);
              const stageVal = stageLeads.reduce((acc, l) => {
                const v = currentPipeline === 'PRODUCTION' 
                  ? l.productionDetails?.budget || 0
                  : l.socialMediaDetails?.monthlyBudget || 0;
                return acc + v;
              }, 0);

              const percent = totalValue > 0 ? Math.round((stageVal / totalValue) * 100) : 0;

              return (
                <div key={st.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-200">
                      <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${st.color}`} />
                      <span>{st.label}</span>
                      <span className="text-slate-500 font-normal">({stageLeads.length} Lead)</span>
                    </div>
                    <span className="font-extrabold text-slate-300">
                      ₺{stageVal.toLocaleString('tr-TR')} ({percent}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${st.color} transition-all duration-500`}
                      style={{ width: `${Math.max(percent, stageLeads.length > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Source Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-100">Lead Kaynakları Analizi</h3>
            <p className="text-xs text-slate-400">Müşteriler nereden geliyor?</p>
          </div>

          <div className="space-y-2.5 pt-1">
            
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

      {/* Comprehensive Campaign & Specific Ad Performance Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Kampanya & Reklam Bazlı Lead Analizi
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hangi reklam setinden veya formdan kaç adet müşteri geldi, ciro ve dönüşüm oranları
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrele:
            </span>
            <button
              onClick={() => setSelectedSourceFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedSourceFilter === 'ALL'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Tümü ({adGroups.length})
            </button>
            <button
              onClick={() => setSelectedSourceFilter('META_ADS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedSourceFilter === 'META_ADS'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              ⚡ Meta Ads ({adGroups.filter(g => g.source === 'META_ADS').length})
            </button>
            <button
              onClick={() => setSelectedSourceFilter('WEBSITE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedSourceFilter === 'WEBSITE'
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              🌐 Web Formları ({adGroups.filter(g => g.source === 'WEBSITE').length})
            </button>
            <button
              onClick={() => setSelectedSourceFilter('MANUAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedSourceFilter === 'MANUAL'
                  ? 'bg-slate-700 text-white border-slate-600 shadow-md'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              👤 Manuel Eklenenler ({adGroups.filter(g => g.source === 'MANUAL').length})
            </button>
          </div>
        </div>

        {/* Ad Breakdown Grid / Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-1">
          {filteredAdGroups.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs">
              Bu filtreye ait herhangi bir reklam veya kampanya kaydı bulunamadı.
            </div>
          ) : (
            filteredAdGroups.map((group, idx) => {
              const groupConv = group.leads.length > 0
                ? Math.round((group.wonCount / group.leads.length) * 100)
                : 0;

              return (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4.5 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between space-y-3.5 group"
                >
                  <div>
                    {/* Header: Platform & Source Tag */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border ${
                        group.source === 'META_ADS'
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          : group.source === 'GOOGLE_ADS'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : group.source === 'WEBSITE'
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : group.source === 'AI_AGENT'
                          ? 'bg-pink-500/15 text-pink-300 border-pink-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {group.source === 'META_ADS' && '⚡ Meta Ads'}
                        {group.source === 'GOOGLE_ADS' && '🎯 Google Ads'}
                        {group.source === 'WEBSITE' && '🌐 Web Sitesi'}
                        {group.source === 'AI_AGENT' && '🤖 ChatGPT AI'}
                        {group.source === 'MANUAL' && '👤 Manuel / Panel'}
                      </span>

                      <span className="text-[11px] font-bold text-slate-400">
                        {group.platform}
                      </span>
                    </div>

                    {/* Ad / Campaign Title */}
                    <h4 className="font-extrabold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
                      🎯 {group.name}
                    </h4>

                    {/* Sample Leads list preview */}
                    <div className="mt-2.5 space-y-1">
                      <div className="text-[11px] text-slate-500 font-semibold">Gelen Son Müşteriler:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.leads.slice(0, 3).map((l, lIdx) => (
                          <span key={lIdx} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800 truncate max-w-[140px]">
                            • {l.title}
                          </span>
                        ))}
                        {group.leads.length > 3 && (
                          <span className="text-[10px] text-indigo-400 font-bold self-center">
                            +{group.leads.length - 3} diğer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metrics Bottom Row */}
                  <div className="pt-3 border-t border-slate-900 grid grid-cols-3 gap-2 text-center bg-slate-900/50 rounded-xl p-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Lead Sayısı</span>
                      <span className="text-sm font-black text-slate-100">{group.leads.length}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Kazanılan</span>
                      <span className="text-sm font-black text-emerald-400">{group.wonCount}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Dönüşüm</span>
                      <span className={`text-sm font-black ${groupConv > 0 ? 'text-indigo-400' : 'text-slate-500'}`}>
                        %{groupConv}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
